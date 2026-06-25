/**
 * 日记面板
 * 对应 AS3: csh.ui.DiaryPanel
 * 
 * 功能：
 * 1. 记录游戏过程中的事件
 * 2. 区分普通日记和重要事迹
 * 3. 支持翻页查看
 * 4. 支持查看历代勇者志
 */

class DiaryPanel extends createjs.Container {
    // 单例模式
    static _instance = null;
    
    /**
     * 获取单例
     * @returns {DiaryPanel}
     */
    static getInstance() {
        if (!DiaryPanel._instance) {
            DiaryPanel._instance = new DiaryPanel();
        }
        return DiaryPanel._instance;
    }
    
    constructor() {
        super();
        
        if (DiaryPanel._instance) {
            return DiaryPanel._instance;
        }
        
        this.initialize();
        DiaryPanel._instance = this;
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 浮窗尺寸（覆盖棋盘内环区域 520×364）
        this._panelWidth = 500;   // 内环宽度 - 20px边距
        this._panelHeight = 344;  // 内环高度 - 20px边距
        this._pageWidth = 480;    // 单列宽度（左右各留10px边距）
        this._pageHeight = 280;
        this._numPerPage = 14;    // 每页显示14条（单列，每条一行）
        
        // 日记数据
        this._diaryArr = [];      // 所有日记（按页存储）
        this._deedArr = [];       // 重要事迹（按页存储）
        this._diaryCount = 0;     // 日记总数
        this._deedCount = 0;      // 事迹总数
        this._diaryPageNum = 1;   // 日记总页数
        this._deedPageNum = 1;    // 事迹总页数
        
        // 当前状态
        this._curPageNo = 1;
        this._showDeedOnly = false;
        this._showHeroOnly = false;
        
        // 创建遮罩层
        this._createMask();
        
        // 创建浮窗背景
        this._createBackground();
        
        // 创建标题栏
        this._createTitle();
        
        // 创建文本区域
        this._createTextAreas();
        
        // 创建功能按钮
        this._createFunctionButtons();
        
        this.visible = false;
        
        console.log('[DiaryPanel] 日记面板已初始化（浮窗模式）');
    }
    
    /**
     * 创建遮罩层（移除半透明效果）
     */
    _createMask() {
        // 不需要半透明遮罩，只添加一个不可见的点击拦截层
        this._mask = new createjs.Shape();
        this._mask.graphics.beginFill('rgba(0,0,0,0)').drawRect(0, 0, 640, 480);
        // 不添加点击关闭事件，必须用按钮关闭
        this.addChild(this._mask);
    }
    
    /**
     * 创建背景
     */
    _createBackground() {
        // 根据棋盘布局定位（覆盖内环区域）
        // 内环起点：格子#0中心 + 半格 + 10px边距
        // 假设格子#0在 (34, 32)，格子大小52px
        const x = 34 + 26 + 10;  // 70
        const y = 32 + 26 + 10;  // 68
        
        // 浮窗背景容器
        this._panel = new createjs.Container();
        this._panel.x = x;
        this._panel.y = y;
        this.addChild(this._panel);
        
        // 不透明背景（羊皮纸色）
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#F5DEB3')
                   .setStrokeStyle(4)
                   .beginStroke('#8B4513')
                   .drawRect(0, 0, this._panelWidth, this._panelHeight);
        this._panel.addChild(bg);
    }
    
    /**
     * 创建标题栏
     */
    _createTitle() {
        const titleBg = new createjs.Shape();
        titleBg.graphics.beginFill('#8B4513').drawRect(0, 0, this._panelWidth, 35);
        this._panel.addChild(titleBg);
        
        this._titleText = new createjs.Text('冒险日志', 'bold 18px Arial', '#FFFF00');
        this._titleText.x = this._panelWidth / 2;
        this._titleText.y = 18;
        this._titleText.textAlign = 'center';
        this._titleText.textBaseline = 'middle';
        this._panel.addChild(this._titleText);
        
        // 关闭按钮（右上角）
        const closeBtn = new createjs.Container();
        closeBtn.x = this._panelWidth - 28;
        closeBtn.y = 8;
        
        const closeBg = new createjs.Shape();
        closeBg.graphics.beginFill('#CD5C5C').drawRect(-10, -10, 20, 20);
        closeBtn.addChild(closeBg);
        
        const closeText = new createjs.Text('×', 'bold 18px Arial', '#FFFFFF');
        closeText.textAlign = 'center';
        closeText.textBaseline = 'middle';
        closeBtn.addChild(closeText);
        
        closeBtn.cursor = 'pointer';
        closeBtn.on('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.close();
        });
        
        closeBtn.on('mouseover', () => {
            closeBg.graphics.clear().beginFill('#DC143C').drawRect(-10, -10, 20, 20);
        });
        
        closeBtn.on('mouseout', () => {
            closeBg.graphics.clear().beginFill('#CD5C5C').drawRect(-10, -10, 20, 20);
        });
        
        this._panel.addChild(closeBtn);
    }
    
    /**
     * 创建文本区域
     */
    _createTextAreas() {
        // 单列文本区域
        this._contentText = new createjs.Text('', '14px Arial', '#000000');
        this._contentText.x = 10;
        this._contentText.y = 42;
        this._contentText.lineWidth = this._pageWidth;
        this._contentText.lineHeight = 20;
        this._panel.addChild(this._contentText);
    }
    
    /**
     * 创建功能按钮
     */
    _createFunctionButtons() {
        this._funcContainer = new createjs.Container();
        this._funcContainer.x = 10;
        this._funcContainer.y = this._panelHeight - 40;
        this._panel.addChild(this._funcContainer);
    }
    
    /**
     * 重置日记
     */
    reset() {
        this._diaryArr = [];
        this._deedArr = [];
        this._diaryCount = 0;
        this._deedCount = 0;
        this._diaryPageNum = 1;
        this._deedPageNum = 1;
        console.log('[DiaryPanel] 日记已重置');
    }
    
    /**
     * 添加日记
     * @param {string} content 日记内容
     * @param {boolean} isDeed 是否重要事迹
     */
    addDiary(content, isDeed = false) {
        // 添加到普通日记
        this._addToDiaryArray(content, isDeed);
        
        // 如果是重要事迹，同时添加到事迹数组
        if (isDeed) {
            this._addToDeedArray(content);
        }
        
        console.log(`[DiaryPanel] 添加日记 ${isDeed ? '(重要)' : ''}: ${content.substring(0, 20)}...`);
    }
    
    /**
     * 添加到日记数组
     * @param {string} content 内容
     * @param {boolean} isDeed 是否重要
     */
    _addToDiaryArray(content, isDeed) {
        this._diaryCount++;
        const pageIndex = Math.ceil(this._diaryCount / this._numPerPage) - 1;
        
        if (!this._diaryArr[pageIndex]) {
            this._diaryArr[pageIndex] = '';
        }
        
        if (this._diaryArr[pageIndex]) {
            this._diaryArr[pageIndex] += '\n';
        }
        
        const dateStr = this._getDateString();
        const prefix = isDeed ? '★' : '';
        // 格式：日期    内容（同一行）
        this._diaryArr[pageIndex] += `${prefix}${dateStr}    ${content}`;
        
        this._diaryPageNum = Math.ceil(this._diaryCount / this._numPerPage);
    }
    
    /**
     * 添加到事迹数组
     * @param {string} content 内容
     */
    _addToDeedArray(content) {
        this._deedCount++;
        const pageIndex = Math.ceil(this._deedCount / this._numPerPage) - 1;
        
        if (!this._deedArr[pageIndex]) {
            this._deedArr[pageIndex] = '';
        }
        
        if (this._deedArr[pageIndex]) {
            this._deedArr[pageIndex] += '\n';
        }
        
        const dateStr = this._getDateString();
        // 格式：★日期    内容（同一行）
        this._deedArr[pageIndex] += `★${dateStr}    ${content}`;
        
        this._deedPageNum = Math.ceil(this._deedCount / this._numPerPage);
    }
    
    /**
     * 获取日期字符串
     * @returns {string}
     */
    _getDateString() {
        // 从棋盘获取日期（如果棋盘存在）
        if (window.game && window.game._chessboard) {
            const board = window.game._chessboard;
            return `第${board.yearlapse}年第${board.daylapse}天`;
        }
        return '第1年第1天';
    }
    
    /**
     * 显示日记
     * @param {number} pageNo 页码（从1开始）
     * @param {boolean} deedOnly 仅显示事迹
     */
    show(pageNo = 1, deedOnly = false) {
        const totalPages = deedOnly ? this._deedPageNum : this._diaryPageNum;
        
        // 即使没有日记也显示面板（显示提示信息）
        if (totalPages === 0) {
            console.log('[DiaryPanel] 日记为空，显示提示信息');
            this._showEmptyMessage(deedOnly);
            return;
        }
        
        this._showDeedOnly = deedOnly;
        this._showHeroOnly = false;
        
        // 确保页码为奇数（左页）
        pageNo = pageNo % 2 === 0 ? pageNo - 1 : pageNo;
        this._curPageNo = Math.max(1, Math.min(pageNo, totalPages));
        
        // 显示内容
        this._displayPage(deedOnly);
        
        // 更新功能按钮
        this._updateFunctionButtons(totalPages);
        
        // 显示面板（确保在游戏最上层）
        this.visible = true;
        if (window.game && window.game.ui) {
            // 如果已经在UI层，先移除
            if (this.parent) {
                this.parent.removeChild(this);
            }
            // 添加到UI层最顶部
            window.game.ui.addChild(this);
            // 确保在最上层（无论有多少子对象）
            window.game.ui.setChildIndex(this, window.game.ui.numChildren - 1);
        }
        
        // 隐藏聊天窗口的DOM元素（因为DOM总是在Canvas之上）
        this._hideChatPanel();
        
        console.log(`[DiaryPanel] 显示第${this._curPageNo}页 (总${totalPages}页)`);
    }
    
    /**
     * 显示空白日记提示
     * @param {boolean} deedOnly 是否仅事迹
     */
    _showEmptyMessage(deedOnly) {
        const message = deedOnly 
            ? '暂无重要事迹记录\n\n随着冒险的进行，\n重要的历程将会被记录在此。'
            : '暂无日记记录\n\n你的冒险才刚刚开始，\n精彩的故事等待书写。';
        
        this._contentText.text = message;
        
        // 只显示关闭按钮
        this._funcContainer.removeAllChildren();
        const closeBtn = this._createButton('关闭', () => {
            this.close();
        });
        closeBtn.x = 0;
        this._funcContainer.addChild(closeBtn);
        
        // 显示面板（确保在游戏最上层）
        this.visible = true;
        if (window.game && window.game.ui) {
            // 如果已经在UI层，先移除
            if (this.parent) {
                this.parent.removeChild(this);
            }
            // 添加到UI层最顶部
            window.game.ui.addChild(this);
            // 确保在最上层（无论有多少子对象）
            window.game.ui.setChildIndex(this, window.game.ui.numChildren - 1);
        }
        
        // 隐藏聊天窗口的DOM元素（因为DOM总是在Canvas之上）
        this._hideChatPanel();
        
        console.log('[DiaryPanel] 显示空白日记提示');
    }
    
    /**
     * 显示页面内容
     * @param {boolean} deedOnly 仅显示事迹
     */
    _displayPage(deedOnly) {
        const arr = deedOnly ? this._deedArr : this._diaryArr;
        const pageIndex = this._curPageNo - 1;
        
        // arr[pageIndex] 是字符串，直接显示
        this._contentText.text = arr[pageIndex] || '';
    }
    
    /**
     * 更新功能按钮
     * @param {number} totalPages 总页数
     */
    _updateFunctionButtons(totalPages) {
        this._funcContainer.removeAllChildren();
        
        let xPos = 0;
        
        // 上一页按钮
        if (totalPages > 2 && this._curPageNo > 1) {
            const prevBtn = this._createButton('上一页', () => {
                this.show(this._curPageNo - 2, this._showDeedOnly);
            });
            prevBtn.x = xPos;
            this._funcContainer.addChild(prevBtn);
            xPos += 75;
        }
        
        // 下一页按钮
        if (totalPages > 2 && this._curPageNo + 1 < totalPages) {
            const nextBtn = this._createButton('下一页', () => {
                this.show(this._curPageNo + 2, this._showDeedOnly);
            });
            nextBtn.x = xPos;
            this._funcContainer.addChild(nextBtn);
            xPos += 75;
        }
        
        // 切换显示模式按钮
        if (!this._showHeroOnly) {
            const toggleBtn = this._createButton(
                this._showDeedOnly ? '全部日志' : '重要事迹',
                () => {
                    this.show(1, !this._showDeedOnly);
                }
            );
            toggleBtn.x = xPos;
            this._funcContainer.addChild(toggleBtn);
            xPos += 85;
        }
        
        // 关闭按钮
        const closeBtn = this._createButton('关闭', () => {
            this.close();
        });
        closeBtn.x = xPos;
        this._funcContainer.addChild(closeBtn);
    }
    
    /**
     * 隐藏DOM元素（聊天窗口和属性面板）
     */
    _hideChatPanel() {
        const chatContainer = document.getElementById('chat-text-container');
        if (chatContainer) {
            chatContainer.style.display = 'none';
            console.log('[DiaryPanel] 已隐藏聊天窗口DOM');
        }
        
        const chessText = document.getElementById('chess-text-container');
        if (chessText) {
            chessText.style.display = 'none';
            console.log('[DiaryPanel] 已隐藏属性面板DOM');
        }
    }
    
    /**
     * 显示DOM元素（聊天窗口和属性面板）
     */
    _showChatPanel() {
        const chatContainer = document.getElementById('chat-text-container');
        if (chatContainer) {
            chatContainer.style.display = 'block';
            console.log('[DiaryPanel] 已显示聊天窗口DOM');
        }
        
        const chessText = document.getElementById('chess-text-container');
        if (chessText) {
            chessText.style.display = 'block';
            console.log('[DiaryPanel] 已显示属性面板DOM');
        }
    }
    
    /**
     * 创建按钮
     * @param {string} label 按钮文本
     * @param {Function} callback 点击回调
     * @returns {createjs.Container}
     */
    _createButton(label, callback) {
        const btn = new createjs.Container();
        
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#8B4513').drawRect(0, 0, 70, 28);
        btn.addChild(bg);
        
        const text = new createjs.Text(label, '14px Arial', '#FFFF00');
        text.x = 35;
        text.y = 14;
        text.textAlign = 'center';
        text.textBaseline = 'middle';
        btn.addChild(text);
        
        btn.cursor = 'pointer';
        btn.on('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();  // 阻止事件继续传播
            callback();
        });
        
        btn.on('mouseover', () => {
            bg.graphics.clear().beginFill('#A0522D').drawRect(0, 0, 70, 28);
        });
        
        btn.on('mouseout', () => {
            bg.graphics.clear().beginFill('#8B4513').drawRect(0, 0, 70, 28);
        });
        
        return btn;
    }
    
    /**
     * 关闭面板
     */
    close() {
        this.visible = false;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this._contentText.text = '';
        this._showHeroOnly = false;
        
        // 显示聊天窗口的DOM元素
        this._showChatPanel();
        
        // 关闭后继续游戏回合
        if (window.game && window.game._chessboard && window.game._chessboard._curChess) {
            window.game._chessboard.roundEnd();
        }
        
        console.log('[DiaryPanel] 日记面板已关闭');
    }
    
    /**
     * 获取日记记录（用于存档）
     * @returns {Object}
     */
    getRecord() {
        return {
            diaryArr: this._diaryArr.slice(),
            deedArr: this._deedArr.slice(),
            diaryCount: this._diaryCount,
            deedCount: this._deedCount,
            diaryPageNum: this._diaryPageNum,
            deedPageNum: this._deedPageNum
        };
    }
    
    /**
     * 加载日记记录（从存档）
     * @param {Object} record 记录数据
     */
    loadRecord(record) {
        if (!record) return;
        
        this._diaryArr = record.diaryArr || [];
        this._deedArr = record.deedArr || [];
        this._diaryCount = record.diaryCount || 0;
        this._deedCount = record.deedCount || 0;
        this._diaryPageNum = record.diaryPageNum || 1;
        this._deedPageNum = record.deedPageNum || 1;
        
        console.log('[DiaryPanel] 日记记录已加载');
    }
}

