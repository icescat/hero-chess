/**
 * 游戏主控制器
 * 对应 AS3: csh.model.Game
 * 
 * 职责：
 * 1. 管理游戏整体流程
 * 2. 管理显示层级（背景、内容、UI）
 * 3. 管理可更新对象列表
 * 4. 控制游戏暂停/恢复
 * 5. 初始化棋盘和UI
 */

class Game {
    constructor() {
        // 静态常量
        Game.WIDTH = 640;
        Game.HEIGHT = 480;
        Game.GRAVITY = 600;
        
        // 私有属性
        this._framerate = 30;
        this._stage = null;
        this._root = null;
        this._pause = true;
        
        // 显示层级
        this._bg = null;    // 背景层
        this._cnt = null;   // 内容层
        this._ui = null;    // UI层
        
        // 可更新对象列表
        this._objList = [];
        
        // 游戏对象
        this._chessboard = null;
        this._chess = null;  // 当前棋子对象（用于GM面板等）
        
        // ID种子
        Game._idSeed = 0;
    }
    
    /**
     * 获取唯一ID
     */
    static get idSeed() {
        return ++Game._idSeed;
    }
    
    /**
     * 帧率
     */
    get framerate() {
        return this._framerate;
    }
    
    /**
     * 舞台
     */
    get stage() {
        return this._stage;
    }
    
    /**
     * 根容器
     */
    get root() {
        return this._root;
    }
    
    /**
     * 暂停状态
     */
    get pause() {
        return this._pause;
    }
    
    set pause(value) {
        if (value !== this._pause) {
            if (this._pause) {
                this.gameResume();
            } else {
                this.gamePause();
            }
            this._pause = value;
        }
    }
    
    /**
     * 背景层
     */
    get bg() {
        return this._bg;
    }
    
    /**
     * 内容层
     */
    get cnt() {
        return this._cnt;
    }
    
    /**
     * UI层
     */
    get ui() {
        return this._ui;
    }
    
    /**
     * 鼠标X坐标
     */
    get mouseX() {
        return this._stage.mouseX / this._stage.scaleX;
    }
    
    /**
     * 鼠标Y坐标
     */
    get mouseY() {
        return this._stage.mouseY / this._stage.scaleY;
    }
    
    /**
     * 初始化游戏
     * @param {createjs.Stage} stage - CreateJS舞台
     * @param {createjs.LoadQueue} loadQueue - 资源加载队列
     */
    initialize(stage, loadQueue) {
        console.log('[Game] 开始初始化游戏...');
        
        this._stage = stage;
        this._root = stage;
        this._framerate = createjs.Ticker.framerate;
        
        // 初始化资源管理器
        Game.assets = new AssetsManager();
        Game.assets.initialize(loadQueue);
        
        // 创建显示层级
        this._bg = new createjs.Container();
        this._bg.name = 'background';
        
        this._cnt = new createjs.Container();
        this._cnt.name = 'content';
        
        this._ui = new createjs.Container();
        this._ui.name = 'ui';
        
        this._root.addChild(this._bg);
        this._root.addChild(this._cnt);
        this._root.addChild(this._ui);
        
        // 设置当前游戏实例
        Game.current = this;
        
        console.log('[Game] 游戏层级已创建');
        console.log('  - 背景层 (bg)');
        console.log('  - 内容层 (cnt)');
        console.log('  - UI层 (ui)');
        
        // 初始化棋盘
        this.initChessboard();
        
        // 初始化聊天面板
        this.initChatPanel();
        
        // V1.1+: 标题面板（菜单系统）
        // this.initTitlePanel();
        
        // 临时：添加测试棋子
        this._addTestChess();
        
        // 开始游戏循环
        this.pause = false;
        
        console.log('[Game] 游戏初始化完成！');
    }
    
    /**
     * 暂停游戏
     */
    gamePause() {
        if (this._tickListener) {
            createjs.Ticker.removeEventListener('tick', this._tickListener);
        }
        console.log('[Game] 游戏已暂停');
    }
    
    /**
     * 恢复游戏
     */
    gameResume() {
        if (!this._tickListener) {
            this._tickListener = this._run.bind(this);
        }
        createjs.Ticker.addEventListener('tick', this._tickListener);
        console.log('[Game] 游戏已恢复');
    }
    
    /**
     * 游戏主循环
     */
    _run(event) {
        // 更新所有可更新对象
        for (let obj of this._objList) {
            if (obj && obj.update) {
                obj.update();
            }
        }
        
        // 棋盘更新（当前由Chessboard内部处理）
        // if (this._chessboard) {
        //     this._chessboard.update();
        // }
    }
    
    /**
     * 添加可更新对象
     * @param {IUpdatable} obj - 可更新对象
     * @returns {boolean} 是否添加成功
     */
    addObj(obj) {
        if (this._objList.indexOf(obj) === -1) {
            this._objList.push(obj);
            obj.id = Game.idSeed;
            console.log(`[Game] 添加对象 #${obj.id}`);
            return true;
        }
        return false;
    }
    
    /**
     * 移除可更新对象
     * @param {IUpdatable} obj - 可更新对象
     * @returns {boolean} 是否移除成功
     */
    removeObj(obj) {
        const index = this._objList.indexOf(obj);
        if (index !== -1) {
            this._objList.splice(index, 1);
            console.log(`[Game] 移除对象 #${obj.id}`);
            return true;
        }
        return false;
    }
    
    /**
     * 聚焦舞台
     */
    focusStage() {
        // HTML5版本不需要特殊处理
    }
    
    /**
     * 初始化棋盘
     */
    initChessboard() {
        console.log('[Game] 初始化棋盘...');
        
        // 创建棋盘：9行×12列，格子大小52
        this._chessboard = new Chessboard(9, 12, 52);
        this._bg.addChild(this._chessboard.display);
        this.addObj(this._chessboard);
        
        console.log('[Game] 棋盘初始化完成');
    }
    
    /**
     * 初始化聊天面板
     * 位置：棋盘中心区域（按原版AS3布局）
     */
    initChatPanel() {
        console.log('[Game] 初始化聊天面板...');
        
        // 等待棋盘创建完成后再定位
        if (!this._chessboard) {
            console.error('[Game] 棋盘未创建，无法初始化聊天面板');
            return;
        }
        
        const chatPanel = new ChatPanel();
        
        // 定位：中心区域右侧，距离ChessPanel 10px
        // 计算：ChessPanel右侧 + 10px间距
        const cell0 = this._chessboard.getCell(0);
        const cellSize = this._chessboard._cellSize;
        const chessPanelWidth = 214;  // ChessPanel宽度（40%占比）
        
        chatPanel.x = cell0.pos.x + cellSize / 2 + 10 + chessPanelWidth + 10;  // ChessPanel右侧 + 10px
        chatPanel.y = cell0.pos.y + cellSize / 2 + 10;  // 与ChessPanel对齐
        
        
        this._ui.addChild(chatPanel);
        
        // 将聊天面板关联到棋盘
        this._chessboard.chatPanel = chatPanel;
        
        // 开局文本已移至 Chess.js 的 _showGameStartMessage() 方法
        // 将在 putOnBoard() 时显示
        
        console.log('[Game] 聊天面板初始化完成');
    }
    
    /**
     * V1.1+: 初始化标题面板（菜单系统）
     */
    initTitlePanel() {
        // 创建标题面板（菜单、设置等）
        // const titlePanel = new TitlePanel();
        // titlePanel.show();
        console.log('[Game] V1.1+: 标题面板系统');
    }
    
    /**
     * V1.1+: 开始游戏（正式流程）
     * 当前通过_addTestChess临时实现
     */
    startGame() {
        // V1.1+: 正式游戏开始流程（选择难度、天赋等）
        // const chess = new Chess(this._chessboard);
        // chess.putOnBoard();
        // this._chessboard.activateChess(chess);
        console.log('[Game] 游戏开始（已在_addTestChess中实现）');
    }
    
    /**
     * 添加测试棋子
     */
    _addTestChess() {
        console.log('[Game] 添加测试棋子...');
        
        const chess = new Chess(this._chessboard);
        chess.putOnBoard(0, true);  // 放置在起点（索引0），isNewGame=true显示开局文本
        this._chessboard.activateChess(chess);
        
        // 保存棋子引用（用于GM面板等）
        this._chess = chess;
        
        console.log('[Game] 测试棋子已添加，开局文本和选项已显示');
    }
    
    /**
     * 临时测试内容
     */
    _showTestContent() {
        // 背景层：显示一个渐变背景
        const bgShape = new createjs.Shape();
        bgShape.graphics.beginLinearGradientFill(
            ['#2c3e50', '#3498db'],
            [0, 1],
            0, 0, 0, Game.HEIGHT
        );
        bgShape.graphics.drawRect(0, 0, Game.WIDTH, Game.HEIGHT);
        this._bg.addChild(bgShape);
        
        // 内容层：显示游戏区域框
        const contentBorder = new createjs.Shape();
        contentBorder.graphics.setStrokeStyle(2);
        contentBorder.graphics.beginStroke('#ecf0f1');
        contentBorder.graphics.drawRect(20, 20, Game.WIDTH - 40, Game.HEIGHT - 80);
        this._cnt.addChild(contentBorder);
        
        // UI层：显示文本信息
        const title = new createjs.Text(
            '游戏核心引擎已就绪',
            'bold 28px "Microsoft YaHei"',
            '#ffffff'
        );
        title.x = Game.WIDTH / 2;
        title.y = 100;
        title.textAlign = 'center';
        title.shadow = new createjs.Shadow('#000000', 2, 2, 4);
        this._ui.addChild(title);
        
        const info = new createjs.Text(
            '阶段2：核心引擎搭建完成\n准备开始迁移游戏逻辑',
            '16px "Microsoft YaHei"',
            '#ecf0f1'
        );
        info.x = Game.WIDTH / 2;
        info.y = 200;
        info.textAlign = 'center';
        info.lineHeight = 30;
        this._ui.addChild(info);
        
        const stats = new createjs.Text(
            `游戏尺寸: ${Game.WIDTH}×${Game.HEIGHT}\n帧率: ${this._framerate} FPS\n显示层级: 3层（背景/内容/UI）`,
            '14px "Microsoft YaHei"',
            '#95a5a6'
        );
        stats.x = Game.WIDTH / 2;
        stats.y = 300;
        stats.textAlign = 'center';
        stats.lineHeight = 25;
        this._ui.addChild(stats);
        
        // 添加一个旋转的测试图形
        const testShape = new createjs.Shape();
        testShape.graphics.beginFill('#e74c3c');
        testShape.graphics.drawCircle(0, 0, 30);
        testShape.x = Game.WIDTH / 2;
        testShape.y = 400;
        this._cnt.addChild(testShape);
        
        // 添加动画
        createjs.Tween.get(testShape, {loop: true})
            .to({rotation: 360}, 2000, createjs.Ease.linear);
        
        console.log('[Game] 测试内容已显示');
    }
}

// 静态属性
Game.current = null;
Game.assets = null;
Game._idSeed = 0;

