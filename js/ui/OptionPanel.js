/**
 * 选项面板类
 * 对应 AS3: csh.ui.OptionPanel
 * 
 * 功能：
 * 1. 显示介绍文本
 * 2. 显示选项按钮
 * 3. 等待玩家选择
 * 4. 回调通知结果
 * 
 * 使用方式：
 * const panel = OptionPanel.getInstance();
 * panel.showOptions(
 *     "到达城镇，是否休息？",
 *     ["yes", "no"],
 *     ["休息（恢复HP）", "离开"],
 *     callback
 * );
 */

class OptionPanel extends createjs.Container {
    constructor() {
        super();
        
        if (OptionPanel._instance) {
            throw new Error('OptionPanel is a singleton. Use getInstance() instead.');
        }
        
        // 颜色配置
        this._optionColor = '#FFFFFF';      // 白色文本
        this._highlightColor = '#FFFF00';   // 黄色高亮
        
        // UI元素
        this._introText = null;      // 介绍文本
        this._optionButtons = [];    // 选项按钮数组
        
        // 状态
        this._curOptions = [];       // 当前选项值
        this._curOptionsText = [];   // 当前选项文本
        this._curHorizontal = false; // 是否水平布局
        this._optionsShowing = false; // 是否正在显示
        this._callback = null;       // 选择后的回调
        
        // 显示区域（默认全屏）
        this._showRect = { x: 0, y: 0, width: 640, height: 480 };
        
        // 自动游戏相关
        this._optionsShowTime = 0;       // 选项显示时间戳
        this._checkInterval = ChessAI.HANDLE_DELAY * 1000; // 检测间隔（毫秒）
        this._autoTimer = null;          // 自动检测定时器
        
        this.initUI();
        this.initAutoTimer();
        
        OptionPanel._instance = this;
        console.log('[OptionPanel] 选项面板已创建');
    }
    
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!OptionPanel._instance) {
            OptionPanel._instance = new OptionPanel();
        }
        return OptionPanel._instance;
    }
    
    /**
     * 初始化UI
     */
    initUI() {
        // 创建背景（半透明黑色遮罩）
        this._background = new createjs.Shape();
        this._background.graphics.beginFill('rgba(0,0,0,0.7)');
        this._background.graphics.drawRect(0, 0, 640, 480);
        this.addChild(this._background);
        
        // 创建介绍文本
        this._introText = new createjs.Text('', '15px "Microsoft YaHei"', this._optionColor);
        this._introText.textAlign = 'center';
        this._introText.lineWidth = 500;
        this._introText.lineHeight = 25;
        this.addChild(this._introText);
    }
    
    /**
     * 显示选项（垂直布局）
     * @param {string} introText - 介绍文本
     * @param {Array} options - 选项值数组 ['yes', 'no']
     * @param {Array} optionsText - 选项显示文本数组 ['确定', '取消']
     * @param {Function} callback - 选择后的回调函数
     * @param {Object} rect - 显示区域 {x, y, width, height}
     */
    showOptions(introText, options, optionsText, callback, rect = null) {
        // 保存数据
        this._curOptions = options;
        this._curOptionsText = optionsText;
        this._curHorizontal = false;
        this._callback = callback;
        
        // 设置显示区域
        if (rect) {
            this._showRect = rect;
        } else {
            this._showRect = { x: 0, y: 0, width: 640, height: 480 };
        }
        
        // 设置介绍文本
        this._introText.text = introText || '';
        this._introText.x = this._showRect.x + this._showRect.width / 2;
        this._introText.y = this._showRect.y + 150;
        
        // 清除旧的选项按钮
        this._clearOptionButtons();
        
        // 创建选项按钮（垂直布局）
        const buttonY = this._introText.y + 60;
        const buttonSpacing = 45;
        
        for (let i = 0; i < options.length; i++) {
            const button = this._createOptionButton(
                optionsText[i],
                options[i],
                320,
                buttonY + i * buttonSpacing,
                i
            );
            this._optionButtons.push(button);
            this.addChild(button);
        }
        
        // 添加到舞台
        if (!this.parent) {
            Game.current.ui.addChild(this);
        }
        
        this._optionsShowing = true;
        
        // 记录选项显示时间（用于自动游戏）
        this._optionsShowTime = Date.now();
        
        console.log(`[OptionPanel] 显示选项: ${introText}`);
    }
    
    /**
     * 显示选项（水平布局）
     * @param {string} introText - 介绍文本
     * @param {Array} options - 选项值数组
     * @param {Array} optionsText - 选项显示文本数组
     * @param {Function} callback - 选择后的回调函数
     * @param {Object} rect - 显示区域
     */
    showHorizontalOptions(introText, options, optionsText, callback, rect = null) {
        // 保存数据
        this._curOptions = options;
        this._curOptionsText = optionsText;
        this._curHorizontal = true;
        this._callback = callback;
        
        // 设置显示区域
        if (rect) {
            this._showRect = rect;
        } else {
            this._showRect = { x: 0, y: 0, width: 640, height: 480 };
        }
        
        // 设置介绍文本
        this._introText.text = introText || '';
        this._introText.x = this._showRect.x + this._showRect.width / 2;
        this._introText.y = this._showRect.y + 150;
        
        // 清除旧的选项按钮
        this._clearOptionButtons();
        
        // 创建选项按钮（水平布局）
        const buttonY = this._introText.y + 60;
        const totalWidth = options.length * 120 + (options.length - 1) * 20;
        const startX = 320 - totalWidth / 2;
        
        for (let i = 0; i < options.length; i++) {
            const button = this._createOptionButton(
                optionsText[i],
                options[i],
                startX + i * 140,
                buttonY,
                i
            );
            this._optionButtons.push(button);
            this.addChild(button);
        }
        
        // 添加到舞台
        if (!this.parent) {
            Game.current.ui.addChild(this);
        }
        
        this._optionsShowing = true;
        console.log(`[OptionPanel] 显示水平选项: ${introText}`);
    }
    
    /**
     * 关闭选项面板
     */
    closeOptions() {
        this._optionsShowing = false;
        
        if (this.parent) {
            this.parent.removeChild(this);
        }
        
        this._clearOptionButtons();
        this._callback = null;
        
        console.log('[OptionPanel] 关闭选项');
    }
    
    /**
     * 显示或隐藏提示文本（不带选项）
     * @param {string} tipText - 提示文本
     * @param {Object} rect - 显示区域
     */
    showOrHideTip(tipText = null, rect = null) {
        if (!tipText) {
            // 隐藏提示
            if (this.parent) {
                this.parent.removeChild(this);
            }
        } else {
            // 显示提示
            if (rect) {
                this._showRect = rect;
            } else {
                this._showRect = { x: 0, y: 0, width: 640, height: 480 };
            }
            
            this._introText.text = tipText;
            this._introText.x = this._showRect.x + this._showRect.width / 2;
            this._introText.y = this._showRect.y + 200;
            
            this._clearOptionButtons();
            
            if (!this.parent) {
                Game.current.ui.addChild(this);
            }
        }
    }
    
    /**
     * 创建选项按钮
     * @param {string} text - 按钮文本
     * @param {string} value - 选项值
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} index - 索引
     * @returns {createjs.Container} 按钮容器
     */
    _createOptionButton(text, value, x, y, index) {
        const button = new createjs.Container();
        button.x = x;
        button.y = y;
        button._optionValue = value;
        button._optionIndex = index;
        
        // 按钮背景
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#4CAF50');
        bg.graphics.drawRoundRect(-60, -15, 120, 35, 5);
        button.addChild(bg);
        
        // 按钮文本
        const buttonText = new createjs.Text(text, 'bold 14px "Microsoft YaHei"', '#FFFFFF');
        buttonText.textAlign = 'center';
        buttonText.textBaseline = 'middle';
        button.addChild(buttonText);
        
        // 交互
        button.cursor = 'pointer';
        button.on('click', (event) => {
            // 阻止事件传播到舞台，防止点击穿透
            if (event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
            this._onClickOption(value, index);
        });
        
        // 悬停效果
        button.on('mouseover', () => {
            bg.graphics.clear();
            bg.graphics.beginFill('#66BB6A');
            bg.graphics.drawRoundRect(-60, -15, 120, 35, 5);
        });
        
        button.on('mouseout', () => {
            bg.graphics.clear();
            bg.graphics.beginFill('#4CAF50');
            bg.graphics.drawRoundRect(-60, -15, 120, 35, 5);
        });
        
        return button;
    }
    
    /**
     * 清除所有选项按钮
     */
    _clearOptionButtons() {
        for (let i = 0; i < this._optionButtons.length; i++) {
            if (this._optionButtons[i].parent) {
                this.removeChild(this._optionButtons[i]);
            }
        }
        this._optionButtons = [];
    }
    
    /**
     * 点击选项的回调
     * @param {string} value - 选项值
     * @param {number} index - 选项索引
     */
    _onClickOption(value, index) {
        console.log(`[OptionPanel] 选择: ${value} (索引${index})`);
        
        // 保存callback
        const callback = this._callback;
        
        // 关闭面板
        this.closeOptions();
        
        // 延迟一帧调用回调，确保面板完全关闭且不会触发舞台点击
        setTimeout(() => {
            if (callback) {
                callback(value, index);
            }
        }, 50);
    }
    
    // ========== 自动游戏功能 ==========
    
    /**
     * 初始化自动游戏定时器
     */
    initAutoTimer() {
        // 使用setInterval创建定时器（每秒检测一次）
        this._autoTimer = setInterval(() => {
            this._checkChessAI();
        }, 1000);
        
        console.log('[OptionPanel] 自动游戏定时器已启动');
    }
    
    /**
     * 启动自动游戏
     * @returns {boolean} 是否成功启动
     */
    startChessAI() {
        if (!ChessAI.enableAuto) {
            ChessAI.enableAuto = true;
            console.log('[OptionPanel] 自动游戏已启动');
            
            // V1.0.5: 启动后立即检查当前是否有选项，如果有则自动处理
            if (this._optionsShowing && this._curOptions && this._curOptions.length > 0) {
                console.log('[OptionPanel] 检测到已有选项显示，立即触发自动处理');
                
                // 延迟一小段时间后处理，让玩家看到启动提示
                setTimeout(() => {
                    if (ChessAI.enableAuto && this._optionsShowing) {
                        // 直接调用AI处理，无需等待定时器
                        this._optionsShowing = false;
                        
                        const chess = window.game ? window.game._chess : null;
                        if (chess) {
                            console.log('[OptionPanel] 启动时自动处理当前选项:', this._curOptions);
                            ChessAI.getInstance().autoHandleOptions(chess, this._curOptions);
                        }
                    }
                }, 500);
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * 停止自动游戏
     * @returns {boolean} 是否成功停止
     */
    stopChessAI() {
        if (ChessAI.enableAuto) {
            ChessAI.enableAuto = false;
            console.log('[OptionPanel] 自动游戏已停止');
            return true;
        }
        return false;
    }
    
    /**
     * 检测是否需要自动处理选项
     * @private
     */
    _checkChessAI() {
        if (this._optionsShowing && ChessAI.enableAuto) {
            const now = Date.now();
            const interval = now - this._optionsShowTime;
            
            // 超过延迟时间，自动处理
            if (interval >= this._checkInterval) {
                this._optionsShowing = false;
                
                // 获取当前Chess对象
                const chess = window.game ? window.game._chess : null;
                if (chess) {
                    console.log('[OptionPanel] 自动处理选项:', this._curOptions);
                    ChessAI.getInstance().autoHandleOptions(chess, this._curOptions);
                } else {
                    console.warn('[OptionPanel] 未找到Chess对象，无法自动处理');
                }
            }
        }
    }
}

// 静态成员
OptionPanel._instance = null;

