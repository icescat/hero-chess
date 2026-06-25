/**
 * 战斗面板
 * 功能：
 * 1. 显示战斗信息（敌人、玩家属性）
 * 2. 显示战斗日志
 * 3. 显示战斗结果
 * 4. 自动关闭
 */

class BattlePanel extends createjs.Container {
    // 单例模式
    static _instance = null;
    
    /**
     * 获取单例
     * @returns {BattlePanel}
     */
    static getInstance() {
        if (!BattlePanel._instance) {
            BattlePanel._instance = new BattlePanel();
        }
        return BattlePanel._instance;
    }
    
    constructor() {
        super();
        
        if (BattlePanel._instance) {
            return BattlePanel._instance;
        }
        
        this.initialize();
        BattlePanel._instance = this;
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 创建背景
        this._createBackground();
        
        // 创建标题
        this._createTitle();
        
        // 创建属性显示区
        this._createAttributesArea();
        
        // 创建战斗日志区
        this._createLogArea();
        
        // 创建按钮
        this._createButtons();
        
        this.visible = false;
        
        console.log('[BattlePanel] 战斗面板已初始化');
    }
    
    /**
     * 创建背景
     */
    _createBackground() {
        const bg = new createjs.Shape();
        bg.graphics.beginFill('rgba(0,0,0,0.8)').drawRect(0, 0, 640, 480);
        this.addChild(bg);
        
        const panel = new createjs.Shape();
        panel.graphics.beginFill('#2C1810').drawRoundRect(60, 40, 520, 400, 10);
        this.addChild(panel);
    }
    
    /**
     * 创建标题
     */
    _createTitle() {
        this._titleText = new createjs.Text('战斗', 'bold 24px Arial', '#FFD700');
        this._titleText.x = 320;
        this._titleText.y = 55;
        this._titleText.textAlign = 'center';
        this.addChild(this._titleText);
    }
    
    /**
     * 创建属性显示区
     */
    _createAttributesArea() {
        // 玩家属性
        this._playerAttrText = new createjs.Text('', '14px Arial', '#FFFFFF');
        this._playerAttrText.x = 80;
        this._playerAttrText.y = 90;
        this._playerAttrText.lineWidth = 220;
        this._playerAttrText.lineHeight = 20;
        this.addChild(this._playerAttrText);
        
        // 敌人属性
        this._enemyAttrText = new createjs.Text('', '14px Arial', '#FFFFFF');
        this._enemyAttrText.x = 340;
        this._enemyAttrText.y = 90;
        this._enemyAttrText.lineWidth = 220;
        this._enemyAttrText.lineHeight = 20;
        this.addChild(this._enemyAttrText);
        
        // VS标志
        const vsText = new createjs.Text('VS', 'bold 20px Arial', '#FF0000');
        vsText.x = 320;
        vsText.y = 115;
        vsText.textAlign = 'center';
        this.addChild(vsText);
    }
    
    /**
     * 创建战斗日志区
     */
    _createLogArea() {
        // 日志背景
        const logBg = new createjs.Shape();
        logBg.graphics.beginFill('#1A0F0A').drawRoundRect(80, 170, 480, 220, 5);
        this.addChild(logBg);
        
        // 日志标题
        const logTitle = new createjs.Text('战斗日志', 'bold 14px Arial', '#FFD700');
        logTitle.x = 90;
        logTitle.y = 175;
        this.addChild(logTitle);
        
        // 日志文本
        this._logText = new createjs.Text('', '12px Arial', '#CCCCCC');
        this._logText.x = 90;
        this._logText.y = 195;
        this._logText.lineWidth = 460;
        this._logText.lineHeight = 18;
        this.addChild(this._logText);
    }
    
    /**
     * 创建按钮
     */
    _createButtons() {
        this._closeButton = this._createButton('关闭', 270, 400, () => {
            this.close();
        });
        this.addChild(this._closeButton);
        
        // 初始隐藏关闭按钮
        this._closeButton.visible = false;
    }
    
    /**
     * 创建按钮
     * @param {string} label - 按钮文本
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Function} callback - 点击回调
     * @returns {createjs.Container}
     */
    _createButton(label, x, y, callback) {
        const btn = new createjs.Container();
        btn.x = x;
        btn.y = y;
        
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#8B4513').drawRoundRect(0, 0, 100, 35, 5);
        btn.addChild(bg);
        btn._bg = bg;
        
        const text = new createjs.Text(label, '16px Arial', '#FFFFFF');
        text.x = 50;
        text.y = 17;
        text.textAlign = 'center';
        text.textBaseline = 'middle';
        btn.addChild(text);
        
        btn.cursor = 'pointer';
        btn.on('click', (e) => {
            e.stopPropagation();
            callback();
        });
        
        btn.on('mouseover', () => {
            bg.graphics.clear().beginFill('#A0522D').drawRoundRect(0, 0, 100, 35, 5);
        });
        
        btn.on('mouseout', () => {
            bg.graphics.clear().beginFill('#8B4513').drawRoundRect(0, 0, 100, 35, 5);
        });
        
        return btn;
    }
    
    /**
     * 显示战斗
     * @param {Enemy} enemy - 敌人
     * @param {ChessProperty} playerProp - 玩家属性
     * @param {BattleManager} battleManager - 战斗管理器
     */
    showBattle(enemy, playerProp, battleManager) {
        // 更新标题
        this._titleText.text = `战斗 - 第${battleManager.stat.rounds}/${battleManager._maxRound}回合`;
        
        // 更新玩家属性
        this._playerAttrText.text = 
            `【你】\n` +
            `等级：Lv${playerProp.level}\n` +
            `生命：${playerProp.life}/${playerProp.maxLife}\n` +
            `攻击：${playerProp.attack}\n` +
            `防御：${playerProp.defense}`;
        
        // 更新敌人属性
        this._enemyAttrText.text = 
            `【${enemy.getName()}】\n` +
            `等级：Lv${enemy.level}\n` +
            `生命：${enemy.curLife}/${enemy.maxLife}\n` +
            `攻击：${enemy.attack}\n` +
            `防御：${enemy.defense}`;
        
        // 更新战斗日志（显示最后10条）
        const logs = battleManager.battleLog;
        const displayLogs = logs.slice(Math.max(0, logs.length - 12));
        this._logText.text = displayLogs.join('\n');
        
        // 显示面板
        this.visible = true;
        if (window.game && window.game._stage) {
            window.game._stage.addChild(this);
        }
    }
    
    /**
     * 显示战斗结果
     * @param {BattleManager} battleManager - 战斗管理器
     */
    showResult(battleManager) {
        // 更新标题为结果
        switch (battleManager.result) {
            case BattleManager.RESULT_WIN:
                this._titleText.text = '胜利！';
                this._titleText.color = '#00FF00';
                break;
            case BattleManager.RESULT_LOSE:
                this._titleText.text = '战败...';
                this._titleText.color = '#FF0000';
                break;
            case BattleManager.RESULT_TIMEOUT:
                this._titleText.text = '超时逃脱';
                this._titleText.color = '#FFFF00';
                break;
        }
        
        // 显示完整日志
        this._logText.text = battleManager.getBattleLogText();
        
        // 显示关闭按钮
        this._closeButton.visible = true;
        
        console.log('[BattlePanel] 显示战斗结果');
    }
    
    /**
     * 关闭面板
     */
    close() {
        this.visible = false;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        
        // 重置标题颜色
        this._titleText.color = '#FFD700';
        
        // 隐藏关闭按钮
        this._closeButton.visible = false;
        
        console.log('[BattlePanel] 战斗面板已关闭');
    }
}

