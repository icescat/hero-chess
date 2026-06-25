/**
 * 棋盘类（简化版 - 阶段3-A）
 * 对应 AS3: csh.model.Chessboard
 * 
 * 当前版本功能：
 * 1. 创建9行×4列的环形棋盘布局
 * 2. 创建并显示所有格子
 * 3. 基本的更新循环
 * 
 * 待实现功能（后续版本）：
 * - 棋子移动管理
 * - 游戏回合控制
 * - 存档/读档
 * - 等等...
 */

class Chessboard extends IUpdatable {
    constructor(row, col, cellSize, gameCleared = 0) {
        super();
        
        // 棋盘参数
        this._row = row;           // 行数（9）
        this._col = col;           // 列数（12）
        this._cellSize = cellSize; // 格子大小（52）
        this._cellNum = (row - 1) * 2 + (col - 1) * 2;  // 总格子数 = 38
        this._gameCleared = gameCleared;  // 通关次数
        
        // 方向边界值（用于判断移动方向）
        this._topright = col - 1;                 // 右上角索引 = 11
        this._bottomright = col + row - 2;        // 右下角索引 = 19
        this._bottomleft = col * 2 + row - 3;     // 左下角索引= 30
        
        // 计算棋盘实际尺寸
        const boardWidth = (col - 1) * cellSize;   // 11 × 52 = 572
        const boardHeight = (row - 1) * cellSize;  // 8 × 52 = 416
        
        // 计算居中边距（画布尺寸：640×480）
        this._marginX = Math.floor((640 - boardWidth) / 2);   // (640-572)/2 = 34
        this._marginY = Math.floor((480 - boardHeight) / 2);  // (480-416)/2 = 32
        
        // 格子数组
        this._cells = [];
        
        // 显示容器
        this._display = new createjs.Container();
        this._display.name = 'chessboard';
        
        // 回合管理（Phase 7-D）
        this._lapCount = 0;         // 圈数（绕棋盘一圈）
        this._lapJustAdded = false; // 刚刚完成一圈标志
        this._roundEnding = false;  // 防止回合结束重复调用
        
        // 当前棋子（后续实现）
        this._curChess = null;
        
        // 聊天面板
        this.chatPanel = null;
        
        // 回合数据（后续实现）
        this._round = 0;
        this._lap = 0;
        
        // 时间系统
        this._gameNo = this._gameCleared + 1;           // 第几轮游戏
        this._daylapse = 0;                             // 经过的天数
        this._yearlapse = 0;                            // 经过的年数
        this._yeardays = 360;                           // 每年天数
        this._beginYear = 14 + this._gameCleared * 20; // 起始年份（根据通关次数）
        this._isNight = false;                          // 是否夜晚
        
        // 骰子对象
        this._rollingDice1 = null;
        this._rollingDice2 = null;
        this._dice1 = null;
        this._dice2 = null;
        
        // 设置为当前棋盘实例
        Chessboard.current = this;
        
        // 初始化
        this.initialize();
        this._initKeyboardListener();
        
        console.log(`[Chessboard] 棋盘已创建: ${this._row}行×${this._col}列, 共${this._cellNum}个格子`);
    }
    
    get display() {
        return this._display;
    }
    
    get cellNum() {
        return this._cellNum;
    }
    
    get round() {
        return this._round;
    }
    
    /**
     * 获取当前回合数（别名，兼容AS3）
     * 对应 AS3: get roundLapse()
     */
    get roundLapse() {
        return this._round;
    }
    
    /**
     * 获取当前天数（2回合=1天）
     * 对应 AS3: get dayLapse()
     */
    get dayLapse() {
        return Math.floor(this._round / 2);
    }
    
    get lap() {
        return this._lap;
    }
    
    /**
     * 初始化棋盘
     */
    initialize() {
        this._createCells();
        this._drawBackground();
        this._initDice();
        this._initAutoButton();
    }
    
    /**
     * 初始化骰子对象
     * 对应 AS3: Chessboard.initDice()
     */
    _initDice() {
        this._rollingDice1 = new RollingDice();
        this._rollingDice2 = new RollingDice();
        this._dice1 = new Dice();
        this._dice2 = new Dice();
        
        console.log('[Chessboard] 骰子对象已初始化');
    }
    
    /**
     * 创建所有格子
     */
    _createCells() {
        console.log('[Chessboard] 开始创建格子...');
        
        // 计算每个格子的位置
        const positions = this._calculateCellPositions();
        
        // 创建格子对象
        for (let i = 0; i < this._cellNum; i++) {
            const pos = positions[i];
            const gridPos = this._indexToGrid(i);
            
            const cell = new Chesscell(
                this,
                i,           // 索引
                gridPos.x,   // 网格X
                gridPos.y,   // 网格Y
                pos          // 显示位置
            );
            
            this._cells.push(cell);
            this._display.addChild(cell.display);
        }
        
        console.log(`[Chessboard] ${this._cells.length}个格子创建完成`);
    }
    
    /**
     * 计算所有格子的显示位置（环形布局）
     * 格子围成一个矩形环
     */
    _calculateCellPositions() {
        const positions = [];
        const spacing = this._cellSize;
        
        let index = 0;
        
        // 顶边（从左到右）
        for (let x = 0; x < this._col; x++) {
            positions[index++] = {
                x: this._marginX + x * spacing,
                y: this._marginY
            };
        }
        
        // 右边（从上到下，跳过顶部已添加的角）
        for (let y = 1; y < this._row; y++) {
            positions[index++] = {
                x: this._marginX + (this._col - 1) * spacing,
                y: this._marginY + y * spacing
            };
        }
        
        // 底边（从右到左，跳过右下角）
        for (let x = this._col - 2; x >= 0; x--) {
            positions[index++] = {
                x: this._marginX + x * spacing,
                y: this._marginY + (this._row - 1) * spacing
            };
        }
        
        // 左边（从下到上，跳过左下角和左上角）
        for (let y = this._row - 2; y > 0; y--) {
            positions[index++] = {
                x: this._marginX,
                y: this._marginY + y * spacing
            };
        }
        
        return positions;
    }
    
    /**
     * 将索引转换为网格坐标
     */
    _indexToGrid(index) {
        // 简化版，直接映射到环形位置
        if (index < this._col) {
            // 顶边
            return { x: index, y: 0 };
        } else if (index < this._col + this._row - 1) {
            // 右边
            return { x: this._col - 1, y: index - this._col + 1 };
        } else if (index < this._col + this._row - 1 + this._col - 1) {
            // 底边
            return { x: this._col - 2 - (index - this._col - this._row + 1), y: this._row - 1 };
        } else {
            // 左边
            return { x: 0, y: this._row - 1 - (index - this._col - this._row - this._col + 2) };
        }
    }
    
    /**
     * 绘制棋盘背景
     */
    _drawBackground() {
        const width = (this._col - 1) * this._cellSize;
        const height = (this._row - 1) * this._cellSize;
        
        // 绘制640×480画布的全部底色 #9B907E（浅棕色）
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#9B907E');
        bg.graphics.drawRect(0, 0, 640, 480);  // 填充整个画布
        
        this._display.addChildAt(bg, 0);  // 添加到最底层
        
        // 创建棋盘边框
        const border = new createjs.Shape();
        border.graphics.setStrokeStyle(3);
        border.graphics.beginStroke('#8B4513');  // 棕色边框
        
        border.graphics.drawRect(
            this._marginX - 10,
            this._marginY - 10,
            width + 20,
            height + 20
        );
        
        this._display.addChildAt(border, 1);  // 添加在背景色上面
        
        // 不再添加顶部标题（按用户要求去掉）
    }
    
    /**
     * 根据索引获取格子
     */
    getCell(index) {
        if (index >= 0 && index < this._cells.length) {
            return this._cells[index];
        }
        return null;
    }
    
    /**
     * 获取符合类型的随机格子（在指定范围内）
     * @param {Array<number>} types - 格子类型数组
     * @param {number} fromIndex - 起始索引（默认0）
     * @param {number} maxDistance - 最大距离（默认0=不限制）
     * @returns {Chesscell|null} 随机格子
     */
    getRandomCell(types, fromIndex = 0, maxDistance = 0) {
        const candidates = [];
        
        if (maxDistance <= 0) {
            // 不限制距离，遍历所有格子
            for (const cell of this._cells) {
                if (types.includes(cell.cellType)) {
                    candidates.push(cell);
                }
            }
        } else {
            // 限制距离，只查找指定范围内的格子
            let currentIndex = fromIndex;
            let distance = 0;
            
            while (distance < maxDistance) {
                currentIndex = (currentIndex + 1) % this._cells.length;
                const cell = this._cells[currentIndex];
                
                if (types.includes(cell.cellType)) {
                    candidates.push(cell);
                }
                
                distance++;
                
                // 防止死循环
                if (currentIndex === fromIndex) {
                    break;
                }
            }
        }
        
        if (candidates.length === 0) {
            return null;
        }
        
        // 随机选择一个
        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex];
    }
    
    /**
     * 从指定位置开始，获取最近的指定类型格子（向前环形查找）
     * 对应 AS3: getNearestCell()
     * @param {number} fromIndex - 起始索引
     * @param {number} cellType - 目标格子类型
     * @returns {Chesscell|null} - 找到的格子，如果找不到返回null
     */
    getNearestCell(fromIndex, cellType) {
        // 从起始位置向前环形查找，最多查找一圈
        for (let i = 1; i <= this._cellNum; i++) {
            const currentIndex = (fromIndex + i) % this._cellNum;
            const currentCell = this.getCell(currentIndex);
            
            if (!currentCell) {
                console.error(`[Chessboard] getNearestCell: 格子 #${currentIndex} 不存在`);
                continue;
            }
            
            if (currentCell.cellType === cellType) {
                console.log(`[Chessboard] getNearestCell: 从 #${fromIndex} 找到最近的类型${cellType}格子 #${currentIndex}`);
                return currentCell;
            }
        }
        
        // 查找一圈后仍未找到
        console.warn(`[Chessboard] getNearestCell: 从 #${fromIndex} 查找类型${cellType}的格子失败`);
        return null;
    }
    
    /**
     * 从指定位置开始，获取最远的指定类型格子（向后环形查找）
     * 对应 AS3: getFarestCell()
     * @param {number} fromIndex - 起始索引
     * @param {number} cellType - 目标格子类型
     * @returns {Chesscell|null} - 找到的格子，如果找不到返回null
     */
    getFarestCell(fromIndex, cellType) {
        // 从起始位置向后环形查找，最多查找一圈
        for (let i = 1; i <= this._cellNum; i++) {
            const currentIndex = (fromIndex - i + this._cellNum) % this._cellNum;
            const currentCell = this.getCell(currentIndex);
            
            if (!currentCell) {
                console.error(`[Chessboard] getFarestCell: 格子 #${currentIndex} 不存在`);
                continue;
            }
            
            if (currentCell.cellType === cellType) {
                console.log(`[Chessboard] getFarestCell: 从 #${fromIndex} 找到最远的类型${cellType}格子 #${currentIndex}`);
                return currentCell;
            }
        }
        
        // 查找一圈后仍未找到
        console.warn(`[Chessboard] getFarestCell: 从 #${fromIndex} 查找类型${cellType}的格子失败`);
        return null;
    }
    
    /**
     * 获取所有格子
     */
    getAllCells() {
        return this._cells;
    }
    
    /**
     * 更新方法（游戏主循环调用）
     */
    update() {
        // 更新棋盘状态（当前由各Mixin和Chess类直接处理）
        // 如需批量更新逻辑，可在此添加
    }
    
    /**
     * 激活棋子（后续实现）
     */
    activateChess(chess) {
        this._curChess = chess;
        console.log('[Chessboard] 棋子已激活');
    }
    
    /**
     * 回合结束（后续实现）
     */
    /**
     * 完成一圈（经过起点）
     */
    lapAdd() {
        this._lap++;
        this._lapCount++;
        this._lapJustAdded = true;
        console.log(`[Chessboard] 完成第${this._lap}圈`);
        
        // 重置每圈标志
        if (this._curChess) {
            console.log('[Chessboard] 准备重置每圈标志...');
            this._curChess.resetLapAttrs();
        } else {
            console.warn('[Chessboard] 警告：_curChess为null，无法重置每圈标志');
        }
        
        // 记录日记
        const diary = DiaryPanel.getInstance();
        if (diary) {
            diary.addDiary(`完成第${this._lap}圈冒险`, false);
        }
    }
    
    /**
     * 回合结束
     * @param {number} roundAdd 增加的回合数（默认1）
     */
    roundEnd(roundAdd = 1) {
        // 防止重复调用
        if (this._roundEnding) {
            console.warn('[Chessboard] roundEnd() 重复调用被阻止');
            return;
        }
        this._roundEnding = true;
        
        this._round += roundAdd;
        
        // 时间系统：2个回合 = 1天（昼+夜）
        // 奇数回合 = 夜晚，偶数回合 = 昼
        this._isNight = (this._round % 2) === 1;
        this._daylapse = Math.floor(this._round / 2);  // 天数 = 回合数 / 2
        this._yearlapse = Math.floor(this._daylapse / this._yeardays);  // 计算年数
        
        const timeOfDay = this._isNight ? '夜' : '昼';
        console.log(`[Chessboard] 回合 #${this._round} 结束 (第${this._daylapse}天, ${timeOfDay})`);
        
        // *** 关键修复：调用时间流逝检查（包含生病检查）***
        if (this._curChess) {
            this._curChess.checkDayLapse(this._round);
        }
        
        // 更新UI（时间显示）
        if (this._curChess && this._curChess._panel) {
            this._curChess._panel.updateUI();
        }
        
        // 移除所有骰子
        this.removeAllDice();
        
        // 关闭选项面板
        OptionPanel.getInstance().closeOptions();
        
        // *** 准备下一回合 ***
        if (this._curChess) {
            this._curChess.prepareNextRound();
        }
        
        // 如果刚完成一圈，保存游戏
        if (this._lapJustAdded) {
            this._lapJustAdded = false;
            this.saveBoardInfo();
            console.log('[Chessboard] 数据已自动保存');
            // V1.1+: 显示保存提示动画（UI增强）
        }
        
        // 重置标志，允许下一次调用
        this._roundEnding = false;
    }
    
    /**
     * 获取日期字符串
     * @returns {string} 格式：第1轮 14年1月1日 昼
     */
    getDateString() {
        const month = Math.floor((this._daylapse - this._yearlapse * this._yeardays) / 30) + 1;
        const day = ((this._daylapse - this._yearlapse * this._yeardays) % 30) + 1;
        const year = this._beginYear + this._yearlapse;
        const timeOfDay = this._isNight ? '夜' : '昼';
        
        return `第${this._gameNo}轮 ${year}年${month}月${day}日 ${timeOfDay}`;
    }
    
    /**
     * 获取回合经过时间（后续实现）
     */
    get roundLapse() {
        return this._round;
    }
    
    /**
     * 根据格子索引获取移动方向
     * 对应 AS3: Chessboard.getMoveDir()
     * @param {number} cellIndex 格子索引
     * @returns {number} 方向常量（UP/RIGHT/DOWN/LEFT）
     */
    getMoveDir(cellIndex) {
        let dir;
        
        if (cellIndex === 0) {
            // 起点向上
            dir = Chessboard.UP;
        } else if (cellIndex <= this._topright) {
            // 顶边向右
            dir = Chessboard.RIGHT;
        } else if (cellIndex <= this._bottomright) {
            // 右边向下
            dir = Chessboard.DOWN;
        } else if (cellIndex <= this._bottomleft) {
            // 底边向左
            dir = Chessboard.LEFT;
        } else {
            // 左边向上
            dir = Chessboard.UP;
        }
        
        return dir;
    }
    
    /**
     * 投骰子（生成随机点数）
     * 对应 AS3: Chessboard.tossDice()
     * @param {boolean} isDouble 是否投双骰子（骑马时）
     * @returns {number} 总点数
     */
    tossDice(isDouble = false) {
        const dice1 = Math.floor(Math.random() * 6) + 1;  // 1-6
        let dice2 = 0;
        
        if (isDouble) {
            dice2 = Math.floor(Math.random() * 6) + 1;  // 1-6
        }
        
        this.playRollingDice(dice1, dice2);
        
        return dice1 + dice2;
    }
    
    /**
     * 播放骰子滚动动画
     * 对应 AS3: Chessboard.playRollingDice()
     * @param {number} points1 第一个骰子点数
     * @param {number} points2 第二个骰子点数（0表示单骰子）
     */
    playRollingDice(points1, points2 = 0) {
        // 计算目标位置（主角将要到达的格子）
        const totalPoints = points1 + points2;
        const targetIndex = (this._curChess._index + totalPoints) % this._cellNum;
        const targetCell = this.getCell(targetIndex);
        
        if (!targetCell) {
            console.error('[Chessboard] 目标格子不存在');
            return;
        }
        
        // 起始位置：目标格子上方半个格子高度
        const startX = targetCell.pos.x;
        const startY = targetCell.pos.y - this._cellSize / 2;
        
        // 结束位置：目标格子中心
        const endX = targetCell.pos.x;
        const endY = targetCell.pos.y;
        
        if (points2 > 0) {
            // 双骰子模式（骑马）
            const offset = 10;  // 骰子间隔
            
            // 第一个骰子（左侧）
            this._rollingDice1.x = startX - offset;
            this._rollingDice1.y = startY - offset;
            Game.current.ui.addChild(this._rollingDice1);
            
            createjs.Tween.get(this._rollingDice1)
                .to({
                    x: endX - offset,
                    y: endY - offset
                }, 500, createjs.Ease.bounceOut)
                .call(() => {
                    this._whenDiceReached(this._rollingDice1, this._dice1, points1);
                });
            
            // 第二个骰子（右侧）
            this._rollingDice2.x = startX + offset;
            this._rollingDice2.y = startY + offset;
            Game.current.ui.addChild(this._rollingDice2);
            
            createjs.Tween.get(this._rollingDice2)
                .to({
                    x: endX + offset,
                    y: endY + offset
                }, 500, createjs.Ease.bounceOut)
                .call(() => {
                    this._whenDiceReached(this._rollingDice2, this._dice2, points2);
                });
        } else {
            // 单骰子模式
            this._rollingDice1.x = startX;
            this._rollingDice1.y = startY;
            Game.current.ui.addChild(this._rollingDice1);
            
            createjs.Tween.get(this._rollingDice1)
                .to({
                    x: endX,
                    y: endY
                }, 500, createjs.Ease.bounceOut)
                .call(() => {
                    this._whenDiceReached(this._rollingDice1, this._dice1, points1);
                });
        }
        
        console.log(`[Chessboard] 骰子动画播放: ${points1}${points2 > 0 ? '+' + points2 : ''} = ${totalPoints}点`);
    }
    
    /**
     * 骰子到达目标位置时的回调
     * 对应 AS3: Chessboard.whenDiceReached()
     * @param {RollingDice} rollingDice 滚动骰子对象
     * @param {Dice} dice 静止骰子对象
     * @param {number} points 点数
     */
    _whenDiceReached(rollingDice, dice, points) {
        // 移除滚动骰子
        if (rollingDice.parent) {
            rollingDice.parent.removeChild(rollingDice);
        }
        
        // 在相同位置显示静止骰子
        dice.x = rollingDice.x;
        dice.y = rollingDice.y;
        dice.showPoints(points);
        Game.current.ui.addChild(dice);
        
        console.log(`[Chessboard] 骰子显示结果: ${points}点`);
    }
    
    /**
     * 移除所有骰子
     * 对应 AS3: Chessboard.removeAllDice()
     */
    removeAllDice() {
        if (this._dice1 && this._dice1.parent) {
            this._dice1.parent.removeChild(this._dice1);
        }
        if (this._dice2 && this._dice2.parent) {
            this._dice2.parent.removeChild(this._dice2);
        }
    }
    
    /**
     * 计算两个格子之间的距离（顺时针方向）
     * 对应 AS3: distant(index1, index2)
     */
    distant(fromIndex, toIndex) {
        let distance = toIndex - fromIndex;
        if (distance < 0) {
            distance = this._cellNum - (fromIndex - toIndex);
        }
        return distance;
    }
    
    /**
     * 计算两个格子之间的最短距离（V1.0.6）
     * 环形棋盘可以顺时针或逆时针走，取最短路径
     * @param {number} fromIndex - 起始格子索引
     * @param {number} toIndex - 目标格子索引
     * @returns {number} 最短距离（格子数）
     */
    getShortestDistance(fromIndex, toIndex) {
        const clockwise = this.distant(fromIndex, toIndex);
        const counterClockwise = this._cellNum - clockwise;
        return Math.min(clockwise, counterClockwise);
    }
    
    /**
     * 根据距离计算任务所需天数（V1.0.6）
     * 按照每天移动4-5点来估算，确保任务可完成但有挑战性
     * @param {number} distance - 最短距离
     * @param {boolean} isRare - 是否稀有任务（稀有任务更紧迫）
     * @returns {number} 所需天数
     */
    calculateQuestDuration(distance, isRare = false) {
        // 普通任务按每天4点计算（稍宽松）
        // 稀有任务按每天5点计算（更紧迫，奖励更高）
        const pointsPerDay = isRare ? 5 : 4;
        const days = Math.ceil(distance / pointsPerDay);
        // 至少1天，最多不超过15天
        return Math.max(1, Math.min(days, 15));
    }
    
    /**
     * 启用地图点击选择模式
     * 对应 AS3: startClickMove()
     */
    startClickMove(chess) {
        this._enableMapClick = true;
        this._selectingChess = chess;
        
        // 为所有格子添加鼠标悬停和点击事件
        for (let i = 0; i < this._cells.length; i++) {
            const cell = this._cells[i];
            if (cell && cell.display) {
                cell.display.cursor = 'pointer';
                
                // 移除旧的监听器（如果有）
                cell.display.removeAllEventListeners('mouseover');
                cell.display.removeAllEventListeners('mouseout');
                cell.display.removeAllEventListeners('click');
                
                // 添加鼠标悬停高亮
                cell.display.on('mouseover', () => {
                    if (this._enableMapClick && this._selectingChess) {
                        const canMove = this._selectingChess.checkCanMoveTo(i);
                        cell.highlight(canMove);
                    }
                });
                
                // 鼠标移出取消高亮
                cell.display.on('mouseout', () => {
                    if (this._enableMapClick) {
                        cell.cancelHighlight();
                    }
                });
                
                // 点击格子选择目的地
                cell.display.on('click', () => {
                    if (this._enableMapClick && this._selectingChess) {
                        const canMove = this._selectingChess.checkCanMoveTo(i);
                        if (canMove && i !== this._selectingChess._index) {
                            // 保存chess引用，因为stopClickMove会清空_selectingChess
                            const chess = this._selectingChess;
                            this.stopClickMove();
                            chess.checkMoveTo(i);
                        }
                    }
                });
            }
        }
        
        console.log('[Chessboard] 启用地图点击选择模式');
    }
    
    /**
     * 停止地图点击选择模式
     * 对应 AS3: endClickMove()
     */
    stopClickMove() {
        this._enableMapClick = false;
        this._selectingChess = null;
        
        // 移除所有格子的鼠标事件和高亮
        for (let i = 0; i < this._cells.length; i++) {
            const cell = this._cells[i];
            if (cell && cell.display) {
                cell.display.cursor = 'default';
                cell.cancelHighlight();
                cell.display.removeAllEventListeners('mouseover');
                cell.display.removeAllEventListeners('mouseout');
                cell.display.removeAllEventListeners('click');
            }
        }
        
        console.log('[Chessboard] 停止地图点击选择模式');
    }
    
    // 保存棋盘信息 - AS3: saveBoardInfo()
    saveBoardInfo() {
        if (!this._curChess) {
            console.warn('[Chessboard] 无法保存：当前无棋子');
            return;
        }
        
        // 获取棋子信息
        const chessInfo = this._curChess.getChessInfo();
        
        // 构建保存数据
        const saveData = {
            gameCleared: this._gameCleared || 0,
            trueEndCount: this._trueEndCount || 0,
            hero: chessInfo,
            heroesEver: this._heroesEver || [],
            daylapse: this._daylapse,
            yearlapse: this._yearlapse,
            round: this._round,
            isNight: this._isNight
        };
        
        // 保存格子记录（建设进度、好感度等）
        const cellRecords = [];
        for (let i = 0; i < this._cellnum; i++) {
            const cellRecord = this._cells[i].getCellRecord();
            if (cellRecord) {
                cellRecords.push(cellRecord);
            }
        }
        
        if (cellRecords.length > 0) {
            saveData.cellRecords = cellRecords;
        }
        
        // 保存到localStorage
        SaveManager.autoSave(saveData);
    }
    
    // ========== 自动游戏功能 ==========
    
    /**
     * 初始化自动按钮（已禁用，只使用P键）
     */
    _initAutoButton() {
        // 不再显示AUTO按钮，只保留P键快捷键功能
        console.log('[Chessboard] 自动游戏功能已启用（按P键切换）');
    }
    
    /**
     * 初始化键盘监听
     */
    _initKeyboardListener() {
        // 监听P键切换自动游戏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                this._toggleAutoGame();
            }
        });
        
        console.log('[Chessboard] 键盘监听已启动（P键=自动游戏）');
    }
    
    /**
     * 切换自动游戏（P键触发）
     */
    _toggleAutoGame() {
        const panel = OptionPanel.getInstance();
        
        if (!ChessAI.enableAuto) {
            // 启动自动游戏
            if (panel.startChessAI()) {
                this._showAutoTips('自动游戏已启动');
                
                // V1.0.5: 启动后检查内嵌选项（ChatPanel）
                if (this.chatPanel && this.chatPanel._currentInlineOptions) {
                    console.log('[Chessboard] 检测到已有内嵌选项，立即触发自动处理');
                    setTimeout(() => {
                        if (ChessAI.enableAuto && this.chatPanel._currentInlineOptions && this._curChess) {
                            console.log('[Chessboard] 启动时自动处理内嵌选项');
                            ChessAI.getInstance().autoHandleOptions(
                                this._curChess, 
                                this.chatPanel._currentInlineOptions.options
                            );
                            this.chatPanel.clearInlineOptions();
                        }
                    }, 500);
                }
            }
        } else {
            // 停止自动游戏
            if (panel.stopChessAI()) {
                this._showAutoTips('自动游戏已停止');
            }
        }
    }
    
    /**
     * 显示自动游戏提示
     * @param {string} message
     */
    _showAutoTips(message) {
        // 创建提示文字
        const tips = new createjs.Text(message, '20px "Microsoft YaHei"', '#FFFF00');
        tips.textAlign = 'center';
        tips.textBaseline = 'middle';
        tips.x = 320;
        tips.y = 240;
        tips.alpha = 0;
        
        Game.current.root.addChild(tips);
        
        // 淡入动画
        createjs.Tween.get(tips)
            .to({alpha: 1}, 300, createjs.Ease.cubicOut)
            .wait(1500)
            .to({alpha: 0}, 300)
            .call(() => {
                Game.current.root.removeChild(tips);
            });
    }
}

// 静态属性
Chessboard.current = null;

// 方向常量
Chessboard.UP = 1;
Chessboard.RIGHT = 2;
Chessboard.DOWN = 3;
Chessboard.LEFT = 4;
Chessboard.MAXSTEP = 6;

