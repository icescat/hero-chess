/**
 * 存档面板
 * 功能：
 * 1. 显示存档槽位（0=自动, 1-3=手动）
 * 2. 保存/读取游戏
 * 3. 删除存档
 * 4. 显示存档信息
 */

class SavePanel extends createjs.Container {
    // 单例模式
    static _instance = null;
    
    /**
     * 获取单例
     * @returns {SavePanel}
     */
    static getInstance() {
        if (!SavePanel._instance) {
            SavePanel._instance = new SavePanel();
        }
        return SavePanel._instance;
    }
    
    constructor() {
        super();
        
        if (SavePanel._instance) {
            return SavePanel._instance;
        }
        
        this.initialize();
        SavePanel._instance = this;
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 创建背景
        this._createBackground();
        
        // 创建标题
        this._createTitle();
        
        // 创建存档槽位
        this._createSaveSlots();
        
        // 创建控制按钮
        this._createControls();
        
        this.visible = false;
        
        console.log('[SavePanel] 存档面板已初始化');
    }
    
    /**
     * 创建背景
     */
    _createBackground() {
        const bg = new createjs.Shape();
        bg.graphics.beginFill('rgba(0,0,0,0.8)').drawRect(0, 0, 640, 480);
        this.addChild(bg);
        
        const panel = new createjs.Shape();
        panel.graphics.beginFill('#8B7355').drawRoundRect(80, 50, 480, 380, 10);
        this.addChild(panel);
    }
    
    /**
     * 创建标题
     */
    _createTitle() {
        const title = new createjs.Text('游戏存档', 'bold 28px Arial', '#FFD700');
        title.x = 320;
        title.y = 70;
        title.textAlign = 'center';
        this.addChild(title);
    }
    
    /**
     * 创建存档槽位
     */
    _createSaveSlots() {
        this._slots = [];
        
        const startY = 120;
        const slotHeight = 70;
        
        // 自动存档
        this._slots.push(this._createSlot(0, 100, startY, '自动存档'));
        
        // 手动存档 1-3
        for (let i = 1; i <= 3; i++) {
            this._slots.push(this._createSlot(i, 100, startY + i * slotHeight, `存档槽 ${i}`));
        }
    }
    
    /**
     * 创建单个存档槽
     * @param {number} slotIndex 槽位索引
     * @param {number} x X坐标
     * @param {number} y Y坐标
     * @param {string} label 槽位标签
     * @returns {createjs.Container}
     */
    _createSlot(slotIndex, x, y, label) {
        const slot = new createjs.Container();
        slot.x = x;
        slot.y = y;
        this.addChild(slot);
        
        // 槽位背景
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#D2B48C').drawRoundRect(0, 0, 440, 60, 5);
        slot.addChild(bg);
        
        // 槽位标签
        const slotLabel = new createjs.Text(label, 'bold 16px Arial', '#000000');
        slotLabel.x = 10;
        slotLabel.y = 10;
        slot.addChild(slotLabel);
        
        // 存档信息文本
        const infoText = new createjs.Text('空槽位', '14px Arial', '#333333');
        infoText.x = 10;
        infoText.y = 35;
        slot.addChild(infoText);
        slot._infoText = infoText;
        
        // 保存按钮
        const saveBtn = this._createButton('保存', 280, 10, () => {
            this._onSaveClick(slotIndex);
        });
        slot.addChild(saveBtn);
        
        // 读取按钮
        const loadBtn = this._createButton('读取', 350, 10, () => {
            this._onLoadClick(slotIndex);
        });
        slot.addChild(loadBtn);
        slot._loadBtn = loadBtn;
        
        // 删除按钮
        const deleteBtn = this._createButton('删除', 350, 35, () => {
            this._onDeleteClick(slotIndex);
        }, 60, 20, '12px');
        slot.addChild(deleteBtn);
        slot._deleteBtn = deleteBtn;
        
        slot._slotIndex = slotIndex;
        slot._bg = bg;
        
        return slot;
    }
    
    /**
     * 创建按钮
     * @param {string} label 按钮文本
     * @param {number} x X坐标
     * @param {number} y Y坐标
     * @param {Function} callback 点击回调
     * @param {number} width 宽度
     * @param {number} height 高度
     * @param {string} fontSize 字体大小
     * @returns {createjs.Container}
     */
    _createButton(label, x, y, callback, width = 60, height = 30, fontSize = '14px') {
        const btn = new createjs.Container();
        btn.x = x;
        btn.y = y;
        
        const bg = new createjs.Shape();
        bg.graphics.beginFill('#8B4513').drawRoundRect(0, 0, width, height, 5);
        btn.addChild(bg);
        btn._bg = bg;
        
        const text = new createjs.Text(label, `${fontSize} Arial`, '#FFFFFF');
        text.x = width / 2;
        text.y = height / 2;
        text.textAlign = 'center';
        text.textBaseline = 'middle';
        btn.addChild(text);
        
        btn.cursor = 'pointer';
        btn.on('click', (e) => {
            e.stopPropagation();
            callback();
        });
        
        btn.on('mouseover', () => {
            bg.graphics.clear().beginFill('#A0522D').drawRoundRect(0, 0, width, height, 5);
        });
        
        btn.on('mouseout', () => {
            bg.graphics.clear().beginFill('#8B4513').drawRoundRect(0, 0, width, height, 5);
        });
        
        return btn;
    }
    
    /**
     * 创建控制按钮
     */
    _createControls() {
        // 关闭按钮
        const closeBtn = this._createButton('关闭', 270, 390, () => {
            this.close();
        }, 100, 35);
        this.addChild(closeBtn);
    }
    
    /**
     * 显示面板
     * @param {boolean} isLoadMode 是否为读档模式
     */
    show(isLoadMode = false) {
        this._isLoadMode = isLoadMode;
        this._updateAllSlots();
        
        this.visible = true;
        if (window.game && window.game._stage) {
            window.game._stage.addChild(this);
        }
        
        console.log(`[SavePanel] 显示存档面板 (模式: ${isLoadMode ? '读档' : '存档'})`);
    }
    
    /**
     * 更新所有槽位信息
     */
    _updateAllSlots() {
        for (let i = 0; i < this._slots.length; i++) {
            this._updateSlot(i);
        }
    }
    
    /**
     * 更新槽位信息
     * @param {number} index 槽位索引
     */
    _updateSlot(index) {
        const slot = this._slots[index];
        const saveInfo = SaveManager.getSaveInfo(index);
        
        if (saveInfo) {
            // 有存档
            const infoStr = `Lv.${saveInfo.heroLevel} | 金币:${saveInfo.heroGold} | ${saveInfo.saveDate}`;
            slot._infoText.text = infoStr;
            slot._loadBtn.visible = true;
            slot._deleteBtn.visible = true;
        } else {
            // 空槽位
            slot._infoText.text = '空槽位';
            slot._loadBtn.visible = false;
            slot._deleteBtn.visible = false;
        }
    }
    
    /**
     * 保存按钮点击
     * @param {number} slotIndex 槽位索引
     */
    _onSaveClick(slotIndex) {
        if (!window.game) {
            console.error('[SavePanel] 游戏对象不存在');
            return;
        }
        
        // 获取游戏数据
        const gameData = this._collectGameData();
        
        // 保存到指定槽位
        const success = SaveManager.saveGame(slotIndex, gameData);
        
        if (success) {
            console.log(`[SavePanel] 保存成功到槽位${slotIndex}`);
            this._updateSlot(slotIndex);
            
            // 显示提示（可选）
            if (window.game._chessboard) {
                window.game._chessboard._curChess.addChat('游戏已保存');
            }
        } else {
            console.error('[SavePanel] 保存失败');
        }
    }
    
    /**
     * 读取按钮点击
     * @param {number} slotIndex 槽位索引
     */
    _onLoadClick(slotIndex) {
        const gameData = SaveManager.loadGame(slotIndex);
        
        if (!gameData) {
            console.error('[SavePanel] 读取失败');
            return;
        }
        
        // 应用游戏数据
        this._applyGameData(gameData);
        
        console.log(`[SavePanel] 从槽位${slotIndex}读取成功`);
        this.close();
    }
    
    /**
     * 删除按钮点击
     * @param {number} slotIndex 槽位索引
     */
    _onDeleteClick(slotIndex) {
        if (confirm('确定要删除这个存档吗？')) {
            const success = SaveManager.deleteSave(slotIndex);
            if (success) {
                console.log(`[SavePanel] 删除槽位${slotIndex}成功`);
                this._updateSlot(slotIndex);
            }
        }
    }
    
    /**
     * 收集游戏数据
     * @returns {Object}
     */
    _collectGameData() {
        const data = {};

        if (window.game && window.game._chessboard) {
            const board = window.game._chessboard;
            const chess = board._curChess;

            // 棋盘数据
            data.round = board._round || 0;
            data.daylapse = board._daylapse || 0;
            data.yearlapse = board._yearlapse || 0;
            data.gameCleared = board._gameCleared || 0;

            // 主角数据（使用 Chess.getChessInfo 完整收集）
            if (chess && chess.getChessInfo) {
                data.hero = chess.getChessInfo();
                // 补充 getChessInfo 未包含的棋盘位置
                data.hero.index = chess._index || 0;
            }
        }

        return data;
    }
    
    /**
     * 应用游戏数据
     * @param {Object} data 游戏数据
     */
    _applyGameData(data) {
        if (!window.game || !window.game._chessboard) {
            console.error('[SavePanel] 游戏对象不存在');
            return;
        }

        const board = window.game._chessboard;
        const chess = board._curChess;

        // 恢复棋盘数据
        if (data.round !== undefined) board._round = data.round;
        if (data.daylapse !== undefined) board._daylapse = data.daylapse;
        if (data.yearlapse !== undefined) board._yearlapse = data.yearlapse;
        if (data.gameCleared !== undefined) board._gameCleared = data.gameCleared;

        // 重新计算昼夜状态
        board._isNight = (board._round % 2) === 1;

        // 恢复主角数据
        if (chess && data.hero) {
            // 恢复属性（loadRecord 内部会通过 addRelic 重应用遗物效果）
            if (data.hero.prop) {
                chess.prop.loadRecord(data.hero.prop);
            }
            // 恢复移动速度
            if (data.hero.walkspeed !== undefined) {
                chess.walkspeed = data.hero.walkspeed;
            }
            // 恢复天赋数据
            if (data.hero.unlockedSkill && chess.talent && chess.talent.loadArr) {
                chess.talent.loadArr(data.hero.unlockedSkill);
            }
            // 恢复统计数据
            if (data.hero.stat && chess.runningStat && chess.runningStat.loadRecord) {
                chess.runningStat.loadRecord(data.hero.stat);
            }
            // 恢复战斗记录
            if (data.hero.winsRecord && chess.battleManager && chess.battleManager.loadWinsRecord) {
                chess.battleManager.loadWinsRecord(data.hero.winsRecord);
            }
            // 恢复婚姻数据
            if (typeof Marriage !== 'undefined' && Marriage.getInstance && Marriage.getInstance().loadRecord) {
                Marriage.getInstance().loadRecord(data.hero);
            }
            // 恢复棋盘位置
            if (data.hero.index !== undefined) {
                chess._index = data.hero.index;
                const cell = board.getCell(chess._index);
                if (cell && chess.setLocation) {
                    chess.setLocation(cell.cellName);
                }
            }
        }

        // 更新UI
        if (chess && chess._panel) {
            chess._panel.updateUI();
        }

        console.log('[SavePanel] 读档完成');
    }
    
    /**
     * 关闭面板
     */
    close() {
        this.visible = false;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        console.log('[SavePanel] 存档面板已关闭');
    }
}

