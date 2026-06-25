// 棋子类 - AS3: csh.model.Chess
class Chess {
    constructor(board) {
        this.board = board;
        this._display = null;
        this._cell = null;         // 当前所在格子
        this._index = 0;           // 当前格子索引
        this._activated = false;   // 是否激活
        this._isDead = false;      // 是否死亡
        this._readyMove = true;    // 准备移动（初始为true，可以移动）
        this._isMoving = false;    // 是否正在移动中
        this._isDiceRolling = false;  // 骰子正在滚动中（防止连续点击）
        
        // 移动方式常量（对应AS3）
        this.WALK = 0;   // 步行
        this.RIDE = 1;   // 骑行
        this.SHIP = 2;   // 坐船
        this.moveType = this.WALK;  // 当前移动方式（默认步行）
        this.onBigShip = false;      // 是否在大船上（不消耗耐力）
        
        // 死亡相关（V1.0.5：已取消跑尸系统）
        // graveIndex和bodyIndex已不再使用
        
        // 移动记录
        this.prevCellIndex = 0;    // 上一个格子索引（战斗超时倒退用）
        
        // 每圈标志（经过起点后重置）
        this._invadeTriggered = false;     // 入侵事件是否触发
        this._enableSelectDest = true;     // 允许选择目的地（随机触发）
        this._canSelectDest = false;       // 已获得选择目的地机会（触发后激活）
        this._stuffBankTriggered = false;  // 材料银行是否触发
        
        // 游戏进程标志
        this.devilDefeated = false;        // 魔王是否被打败
        this._preparingNextRound = false;  // 防止重复调用prepareNextRound
        
        // 属性系统（NEW：使用ChessProperty）
        this.prop = null;          // ChessProperty实例
        
        // 统计系统（Phase 7-C）
        this.runningStat = new RunningStat();
        
        // 标志位系统（Stage 1）
        this.lastFlag = new LastFlag();
        
        // 消息/线索系统（V1.0.6）
        this.rumorSystem = new RumorSystem(this);
        
        // 天赋系统（Stage 5）
        this.talent = null;
        
        // UI面板
        this._panel = null;
        
        this.initialize();
        this.drawDisplay();
        
        console.log('[Chess] 棋子已创建');
    }
    
    get panel() {
        return this._panel;
    }
    
    get display() {
        return this._display;
    }
    
    get cell() {
        return this._cell;
    }
    
    set cell(value) {
        this._cell = value;
    }
    
    get index() {
        return this._index;
    }
    
    get activated() {
        return this._activated;
    }
    
    set activated(value) {
        this._activated = value;
    }
    
    get isDead() {
        return this._isDead;
    }
    
    get readyMove() {
        return this._readyMove;
    }
    
    get isMoving() {
        return this._isMoving;
    }
    
    get isDiceRolling() {
        return this._isDiceRolling;
    }
    
    // 初始化 - AS3: initialize()
    initialize() {
        const gameCleared = this.board._gameCleared || 0;
        
        this.prop = new ChessProperty(this, gameCleared);
        console.log('[Chess] 属性系统已初始化');
        
        this.talent = new Talent();
        console.log('[Chess] 天赋系统已初始化');
        
        this.marriage = Marriage.getInstance();
        
        Relic.getInstance().reset();
        console.log('[Chess] 遗物系统已重置');
        
        // V1.0.6: 消息/线索系统
        this.rumorSystem = new RumorSystem(this);
        console.log('[Chess] 消息系统已初始化');
    }
    
    // 绘制显示对象 - AS3: drawDisplay()
    drawDisplay() {
        this._display = new HeroModel();
        console.log('[Chess] 棋子显示对象已创建');
    }
    
    // 放置到棋盘上 - AS3: putOnBoard()
    putOnBoard(cellIndex = 0, isNewGame = true) {
        this._index = cellIndex;
        this._cell = this.board.getCell(cellIndex);
        
        if (this._cell) {
            this._display.x = this._cell.pos.x;
            this._display.y = this._cell.pos.y;
            
            Game.current.cnt.addChild(this._display);
            
            const cell0 = this.board.getCell(0);
            const cellSize = this.board._cellSize;
            
            this._panel = new ChessPanel(this);
            this._panel.x = cell0.pos.x + cellSize / 2 + 5;
            this._panel.y = cell0.pos.y + cellSize / 2 + 5;
            Game.current.ui.addChild(this._panel);
            
            // 初始化后立即更新UI显示
            if (this._panel && this.prop) {
                this._panel.updateUI();
                console.log('[Chess] 属性面板初始更新完成');
            }
            
            if (isNewGame) {
                this._showGameStartMessage();
            }
            
            console.log(`[Chess] 棋子放置在格子 #${cellIndex}`);
        } else {
            console.error(`[Chess] 格子 #${cellIndex} 不存在`);
        }
    }
    
    // 显示游戏开始消息 - AS3: Chess.cellReached()
    _showGameStartMessage() {
        const gameCleared = this.board._gameCleared || 0;
        
        if (gameCleared > 0) {
            this.newChat('新年第1天，你刚刚结束勇者就职仪式的演说，又将踏上打倒魔王的冒险旅程');
            this.addChat('启程前你收到了老家托人捎来的祖传装备和活动经费');
            const bonus = this.prop.printIntialBonus().split('\n');
            bonus.forEach(line => this.addChat(line));
            DiaryPanel.getInstance().addDiary('你就职成为勇者，命运的齿轮还是什么的开始转动了', true);
        } else {
            this.newChat('新年第1天，你刚刚结束勇者就职仪式的演说，即将踏上打倒魔王的冒险旅程');
            this.addChat('你收到一本冒险指南，上面记叙着：');
            this.addYellowChat('点击聊天窗的蓝色文字进行操作');
            this.addYellowChat('在勇者公会可以查看日志和每一轮的结局');
            this.addYellowChat('每次经过起始城镇时数据会自动保存');
            this.addChat('你虽然看不懂但还是小心翼翼揣入怀里');
            DiaryPanel.getInstance().addDiary('你就职成为勇者，命运的齿轮还是什么的开始转动了', true);
        }
        
        this.prepareNextRound();
    }
    

    // 投骰子 - AS3: rollDice()
    // V1.0.6: 开始移动前清除上回合信息
    rollDice(isDouble = false) {
        if (!this._readyMove || this._isMoving || this._isDiceRolling) {
            console.warn('[Chess] 棋子移动中或骰子滚动中，无法投骰子');
            return 0;
        }
        
        this._isDiceRolling = true;
        console.log('[Chess] 骰子开始滚动，禁止重复投掷');
        
        // V1.0.6: 清空内容区域，保留地点信息
        this.clearContent();
        
        this.board.removeAllDice();
        
        const points = this.board.tossDice(isDouble);
        console.log(`[Chess] 投骰子：${points}点`);
        
        createjs.Tween.get(this)
            .wait(500)
            .call(() => {
                this.forward(points);
            });
        
        return points;
    }
    
    // ==================== 聊天方法已迁移到 ChatMixin.js ====================
    // newChat(), addChat(), addGreenChat(), addRedChat(), addYellowChat(), addExpandedChat()
    
    // 回合结束 - AS3: roundEnd()
    roundEnd(triggerEvent = true) {
        console.log('[Chess] 回合结束');
        this.board.roundEnd();
    }
    
    // 房屋事件（6阶段建设） - AS3: triggeredHouse()
    triggeredHouse() {
        this.marriage.checkTakeWifeHome(this);
        this.marriage.checkWifeGreet(this);
        
        if (this.marriage.askWifeFollowOrStay(this)) {
            return;
        }
        
        const prevProgress = this._cell.extraInfo.progress;
        this._cell.updateProgress(this.board._round + 1);
        const currentProgress = this._cell.extraInfo.progress;
        
        if (prevProgress !== currentProgress && currentProgress === this._cell.extraInfo.maxProgress) {
            this.prop.fame += 30;
            this.addGreenChat('你的私家豪宅已竣工，名声+30');
            this.runningStat.houseCount++;
            DiaryPanel.getInstance().addDiary(`你的第${this.runningStat.houseCount}座奢华私属宅邸落成`, true);
        }
        
        switch (currentProgress) {
            case 0:
                if (this._checkSlimeRaid()) {
                    return;
                }
                if (this._checkCircusShow()) {
                    return;
                }
                
                if (this.prop.fame >= 500) {
                    this.addChat('你刚出来闯荡那会儿就看中这里了');
                    this.addChat('而今你早已今非昔比，区区一块地不就是钱的问题');
                    
                    let cost = 100000;
                    if (this.prop.fame >= 2000) {
                        cost = 30000;
                        this.addChat('现在地价已经触底，不买不是人');
                    } else if (this.prop.fame >= 1000) {
                        cost = 60000;
                        this.addChat('现在地价已经合理，早买早享受');
                    } else {
                        this.addChat('现在地价明显虚高，不妨再观望');
                    }
                    
                    // 使用内嵌链接方式（原版风格）
                    this.board.chatPanel.addInlineOptions(
                        '你打算干什么呢？',
                        ['invest', 'walk'],
                        [`买地建房（${cost}金）`, '继续前进'],
                        this._handleHouseChoice.bind(this)
                    );
                } else {
                    this.addChat('好一块风水宝地，但一般人有钱也买不得');
                    this.addChat('你暗下决心，待将来功成名就时定要买下这里');
                    this.board.roundEnd();
                }
                break;
                
            case 1:
                this.addChat('房子的修建工作正在有条不紊的进行中，追加资金可以加快进度');
                this.addExpandedChat('修建进度');
                this.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    ['invest', 'walk'],
                    ['追加资金（20000金）', '继续前进'],
                    this._handleHouseChoice.bind(this)
                );
                break;
                
            case 2:
            case 3:
            case 4:
                this.addChat('房子的修建工作正在有条不紊的进行中，追加资金可以加快进度');
                this.addExpandedChat('修建进度');
                
                const options = [];
                const values = [];
                
                if (currentProgress >= 2) {
                    options.push('睡觉');
                    values.push('sleep');
                }
                if (currentProgress >= 3) {
                    options.push('训练');
                    values.push('train');
                }
                if (currentProgress >= 4) {
                    options.push('炼制秘药');
                    values.push('alchemy');
                }
                
                options.push('追加资金（20000金）');
                values.push('invest');
                
                options.push('继续前进');
                values.push('walk');
                
                this.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    values,
                    options,
                    this._handleHouseChoice.bind(this)
                );
                break;
                
            case 5:
                this.addChat('房子的修建已进入尾声,不日即可竣工');
                this.addExpandedChat('修建进度');
                this.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    ['sleep', 'train', 'alchemy', 'party', 'walk'],
                    ['睡觉', '训练', '炼制秘药', '举办派对（30000金）', '继续前进'],
                    this._handleHouseChoice.bind(this)
                );
                break;
                
            case 6:
            default:
                this.prop.halfRecovery();
                this.addChat('家的温暖使你身心都得到了治愈');
                this.addExpandedChat('修建进度');
                this.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    ['sleep', 'train', 'alchemy', 'party', 'walk'],
                    ['睡觉', '训练', '炼制秘药', '举办派对（30000金）', '继续前进'],
                    this._handleHouseChoice.bind(this)
                );
                break;
        }
    }
    
    // 处理房屋选项 - AS3: _handleHouseChoice()
    _handleHouseChoice(choice) {
        switch (choice) {
            case 'invest':
                this._investHouse();
                break;
            case 'sleep':
                this._sleepAtHouse();
                break;
            case 'train':
                this._trainAtHouse();
                break;
            case 'alchemy':
                this._alchemyAtHouse();
                break;
            case 'party':
                this._partyAtHouse();
                break;
            case 'walk':
            case 'leave':
                this._handleForwardChoice('walk', false);
                break;
        }
    }
    
    // 投资房屋建设 - AS3: _investHouse()
    _investHouse() {
        let cost;
        
        if (this._cell.extraInfo.progress === 0) {
            if (this.prop.fame >= 2000) {
                cost = 30000;
            } else if (this.prop.fame >= 1000) {
                cost = 60000;
            } else {
                cost = 100000;
            }
        } else {
            cost = 20000;
        }
        
        if (this.prop.gold < cost) {
            this.addChat(`金钱不足，需要${cost}金`);
            this.board.roundEnd();
            return;
        }
        
        this.prop.reduceGold(cost);
        
        if (this._cell.extraInfo.progress === 0) {
            this._cell.extraInfo.progress = 1;
            this._cell.extraInfo.buildUpdatedRound = this.board._round + 1;
            this.addGreenChat('你买下了这块地，工匠们开始修建房屋');
        } else {
            this._cell.extraInfo.builtRound += this._cell.extraInfo.builtRoundAdd;
            this.addGreenChat('追加投资成功，修建进度加快了');
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    /**
     * 房屋睡觉（房屋选项菜单）
     * 注意：与 sleep() 不同，这个方法是从房屋菜单调用的，需要调用 roundEnd()
     */
    _sleepAtHouse() {
        this.prop.fullRestore();
        this.addGreenChat('睡了一大觉，精神饱满！');
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    // 房屋训练 - AS3: _trainAtHouse()
    _trainAtHouse() {
        const wifeHelp = this.marriage.canHelpTrain(this);
        
        const staminaCost = Math.floor(this.prop.maxStamina * 0.4);
        
        if (this.prop.curStamina < staminaCost) {
            this.addChat('你的耐力不足以进行训练');
            this.board.roundEnd();
            return;
        }
        
        this.prop.consumeStamina(staminaCost);
        
        let expGain = this.prop.level * 20;
        if (wifeHelp) {
            expGain *= 1.5;
            this.addChat('你在妻子的指导下进行训练');
            this.addChat('作为女斗士，她的经验使你的训练效果大幅提升');
        } else {
            this.addChat('你在练功房挥汗如雨，实力大增');
        }
        
        expGain = Math.floor(expGain);
        this.prop.addExp(expGain);
        this.addGreenChat(`获得${expGain}经验`);
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    // 炼制秘药 - AS3: _alchemyAtHouse()
    _alchemyAtHouse() {
        const alchemyType = RandomUtils.randInt(0, 2);  // 优化：炼金类型[0,2]
        
        let cost = 5;
        if (this.prop.stuff < cost) {
            this.addChat(`基础锻材不足，需要${cost}个`);
            this.board.roundEnd();
            return;
        }
        
        this.prop.stuff -= cost;
        
        let buffNo, buffName;
        switch (alchemyType) {
            case 0:
                buffNo = 1;
                buffName = '烈焰药水';
                break;
            case 1:
                buffNo = 2;
                buffName = '坚韧药水';
                break;
            case 2:
                buffNo = 3;
                buffName = '活力药水';
                break;
        }
        
        this.addChat('成功炼制药水！');
        this.prop.addBuff(buffNo, this.board._round + 1);
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    // 举办派对 - AS3: _partyAtHouse()
    _partyAtHouse() {
        const wifeHelp = this.marriage.canHelpParty(this);
        
        let cost = 30000;
        if (wifeHelp) {
            cost = 15000;
        }
        
        if (this.prop.gold < cost) {
            this.addChat(`金钱不足，需要${cost}金`);
            this.board.roundEnd();
            return;
        }
        
        this.prop.reduceGold(cost);
        
        let fameGain = RandomUtils.randInt(10, 19);  // 优化：名声[10,19]
        if (wifeHelp) {
            fameGain *= 2;
            this.addChat('你在妻子的帮助下举办了一场盛大的派对');
            this.addChat('作为贵族千金，她的社交经验使派对大获成功');
        } else {
            this.addChat('你举办了一场盛大的派对，宾客尽欢');
        }
        
        this.prop.fame += fameGain;
        this.addGreenChat(`名声+${fameGain}`);
        
        const follower = this.prop.getFollower();
        if (follower) {
            const relationGain = wifeHelp ? 30 : 20;
            follower.relationshipUp(relationGain);
            this.addChat(`${follower.name}对你的好感度上升了`);
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    // 仙境默认事件 - AS3: defaultFairylandFlag()
    defaultFairylandFlag(enabled = false) {
        this.runningStat.fairylandCount = (this.runningStat.fairylandCount || 0) + 1;
        
        if (enabled) {
            this.addChat('你忘情呼吸这里弥漫的浓厚鲜气');
            
            // 添加心旷神怡buff（buffNo=19，效果：生命/攻击/防御+10%，持续3回合）
            this.prop.addBuff(BuffNo.HAPPY, this.board._round + 1);
            
            if (this.runningStat.fairylandCount >= 3) {
                const weightGain = Math.floor(this.runningStat.fairylandCount / 3) * 10;
                this.addGreenChat(`经常呼吸鲜气改善了你的体质，负重+${weightGain}`);
                this.prop.maxWeight += weightGain;
                this.runningStat.fairylandCount = 0;
            }
            
            this.board.roundEnd();
        }
    }
    
    // 魔界默认事件 - AS3: defaultDevillandFlag()
    defaultDevillandFlag(enabled = false) {
        this.runningStat.devillandCount = (this.runningStat.devillandCount || 0) + 1;
        
        if (enabled) {
            this.addChat('你捡到些魔兽粪便，和水服下感觉极好');
            this.prop.addBuff(25, this.board._round + 1);
            
            if (this.runningStat.devillandCount >= 3) {
                const atkGain = Math.floor(this.runningStat.devillandCount / 3) * 10;
                this.addGreenChat(`经常服用魔粪增强了你的力量，攻击+${atkGain}`);
                this.prop.baseAttack += atkGain;
                this.runningStat.devillandCount = 0;
            }
            
            this.board.roundEnd();
        }
    }
    
    // 神秘商人 - AS3: showBuffSeller()
    showBuffSeller() {
        // 原版逻辑：从5个Buff中随机选3个供玩家选择
        const buffPool = [
            BuffNo.BATTLEPOWER,  // 战斗力提升
            BuffNo.MOVEPOWER,    // 移动力提升
            BuffNo.LOOTMORE,     // 战利品加成
            BuffNo.FAMEMORE,     // 名声加成
            BuffNo.EXPMORE       // 经验加成
        ];
        
        // 随机选择3个 - 优化：使用RandomUtils.choices
        const availableBuffs = RandomUtils.choices(buffPool, 3);
        
        // 创建Buff对象并获取名称和价格
        const buffObjects = [];
        const choices = [];
        const choiceTexts = [];
        
        for (let i = 0; i < availableBuffs.length; i++) {
            const buffObj = new ChessBuff(availableBuffs[i]);
            buffObj.initialize(availableBuffs[i]);  // ✅ 必须调用initialize()初始化数据
            buffObjects.push(buffObj);
            choices.push(`buff${i}`);
            
            // 移除HTML标签，只保留纯文本
            const cleanName = buffObj.buffName.replace(/<\/?font[^>]*>/g, '');
            choiceTexts.push(`${cleanName}（${buffObj.fee}金）`);
        }
        
        // 添加"离开"选项
        choices.push('leave');
        choiceTexts.push('离开');
        
        // 显示选项
        this.board.chatPanel.addInlineOptions(
            '你想要购买哪种秘药呢？',
            choices,
            choiceTexts,
            (choice) => {
                if (choice === 'leave') {
                    this.board.roundEnd();
                    return;
                }
                
                // 解析选择的buff索引
                const buffIndex = parseInt(choice.replace('buff', ''));
                const selectedBuff = buffObjects[buffIndex];
                
                if (!selectedBuff) {
                    this.board.roundEnd();
                    return;
                }
                
                // 检查金钱是否足够
                if (this.prop.gold < selectedBuff.fee) {
                    this.addChat(`金钱不足，需要${selectedBuff.fee}金`);
                    this.board.roundEnd();
                    return;
                }
                
                // 购买Buff
                this.prop.reduceGold(selectedBuff.fee);
                this.prop.addBuffObj(selectedBuff, this.board._round + 1);
                
                this.board.roundEnd();
            }
        );
    }
    
    // 竞技场事件 - AS3: triggeredArena()
    triggeredArena() {
        if (this._checkCircusShow()) {
            return;
        }
        if (this._checkOrcRaid()) {
            return;
        }
        
        // AS3第4795行：使用addChat，不是newChat
        this.addChat('每天这里都会举办比赛，你可以选择围观，也可以亲自上场赢取奖金');
        
        if (!this.prop.hasEnoughStamina()) {  // 优化：统一耐力检查
            this._visitArena();
            return;
        }
        
        this.board.chatPanel.addInlineOptions(
            '你打算干什么呢？',
            ['compete', 'visit', 'walk'],
            ['参加比赛', '观看比赛', '继续前进'],
            (choice) => {
                if (choice === 'compete') {
                    this._competeInArena();
                } else if (choice === 'visit') {
                    this._visitArena();
                } else {
                    this._handleForwardChoice('walk', false);
                }
            }
        );
    }
    
    // 参加竞技场比赛 - AS3: _competeInArena()
    _competeInArena() {
        if (!this.prop.hasEnoughStamina()) {  // 优化：统一耐力检查
            this.addChat('你信心满满想要参赛奈何体能不过关');
            this.board.roundEnd();
            return;
        }
        
        const rankName = this.runningStat.getArenaRankName();
        this.addChat(`你报名参加了比赛（当前排名：【${rankName}】级）`);
        
        const rankBonus = this.runningStat.arenaRank * 2;
        const rivalLevel = Math.max(1, this.prop.level - 2 + rankBonus);
        const rival = new Enemy(rivalLevel, Enemy.RIVAL);
        rival.alias = `${rankName}级对手`;
        
        this.addChat(`遭遇${rival.getDescription()}！`);
        
        // 检查"几乎必胜"buff（竞技场也可以使用）
        const hasNearWin = this.prop.haveBuff(BuffNo.NEARWIN) && Math.random() > 0.01;
        
        if (hasNearWin) {
            this.addChat('冥冥之中有股力量助你直接取胜');
            this.prop.removeBuff(BuffNo.NEARWIN);
            this.addChat('Buff 【几乎必胜】 效果消失了');
        }
        
        if (!this.battleManager) {
            this.battleManager = new BattleManager(this);
        }
        
        // 如果有几乎必胜，调用快速胜利；否则正常战斗
        const result = hasNearWin ? 
            this.battleManager.instantWin(rival) : 
            this.battleManager.battleWith(rival);
        
        if (result === BattleManager.RESULT_WIN) {
            // 竞技场特有奖励：奖金
            const rankMultiplier = [50, 100, 200, 400, 800, 1600, 3200, 6400, 12800];
            const prizeGold = rankMultiplier[this.runningStat.arenaRank] || 50;
            this.prop.addGold(prizeGold);
            this.addYellowChat(`赢得比赛奖金${prizeGold}金！`);
            
            // 更新竞技场排名
            const promoted = this.runningStat.arenaWin();
            if (promoted) {
                const newRank = this.runningStat.getArenaRankName();
                this.addGreenChat(`【排名提升】恭喜晋升${newRank}级！`);
                console.log(`[Chess] 竞技场排名提升到${newRank}级`);
            } else {
                const streak = this.runningStat.arenaWinStreak;
                const needWins = this.runningStat.arenaPromoteNeeds[this.runningStat.arenaRank];
                if (needWins && streak > 0) {
                    this.addChat(`连胜${streak}场，再胜${needWins - streak}场可晋升`);
                }
            }
        } else {
            const demoted = this.runningStat.arenaLose();
            if (demoted) {
                const newRank = this.runningStat.getArenaRankName();
                this.addRedChat(`【排名降低】你被降至${newRank}级`);
                console.log(`[Chess] 竞技场排名降至${newRank}级`);
            } else if (this.runningStat.arenaLoseStreak > 0) {
                this.addChat(`连败${this.runningStat.arenaLoseStreak}场，再败${3 - this.runningStat.arenaLoseStreak}场将降级`);
            }
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    // 观看比赛 - AS3: _visitArena()
    _visitArena() {
        this.addChat('你在观众席观看了几场精彩的比赛');
        this.addChat('从中学到了一些战斗技巧');
        
        const expGain = this.prop.level * 3;
        this.prop.addExp(expGain);
        this.addGreenChat(`获得${expGain}经验`);
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
    
    // 重置每圈标志 - AS3: resetLapAttrs()
    resetLapAttrs() {
        this._invadeTriggered = false;
        this._enableSelectDest = true;
        this._canSelectDest = false;
        this._stuffBankTriggered = false;
        console.log('[Chess] 每圈标志已重置');
    }
    
    // 战斗 - AS3: battleWith()
    // @param {boolean} skipRoundEnd - 是否跳过roundEnd（用于startBattleWith统一管理），副本战斗时传true
    battleWith(enemy, skipRoundEnd = false) {
        // 检查"几乎必胜"buff（对非不死怪物有效）
        const hasNearWin = enemy.race !== 3 && this.prop.haveBuff(BuffNo.NEARWIN) && Math.random() > 0.01;
        
        if (hasNearWin) {
            this.addChat('冥冥之中有股力量助你直接取胜');
            this.prop.removeBuff(BuffNo.NEARWIN);
            this.addChat('Buff 【几乎必胜】 效果消失了');
        }
        
        if (!this.battleManager) {
            this.battleManager = new BattleManager(this);
        }
        
        // 判断是否为副本战斗（用于更新副本进度）
        const isDungeonBattle = skipRoundEnd && this._cell && this._cell._cellType === CellType.DUNGEON;
        
        // 如果有几乎必胜，调用快速胜利；否则正常战斗
        const result = hasNearWin ? 
            this.battleManager.instantWin(enemy, isDungeonBattle) : 
            this.battleManager.battleWith(enemy, isDungeonBattle);
        
        if (result === BattleManager.RESULT_WIN) {
            // 处理传说怪物（使用统一方法）
            this.handleLegendDefeat(enemy);
            
            // 检查绷带使用
            this.prop.checkUseBandage();
        }
        // 战斗失败（死亡）处理
        if (result === BattleManager.RESULT_LOSE) {
            // 不在这里处理死亡，等待玩家点击"复活"按钮
            console.log('[Chess] 战斗失败，等待玩家点击复活按钮');
            
            // 标记死亡状态，等待复活
            this._waitingForRevive = true;
            
            // 不调用roundEnd()，等待玩家点击复活按钮
            if (this._panel) {
                this._panel.updateUI();
            }
            return result;
        }
        // 战斗超时处理（AS3: 第1174-1181行）
        else if (result === BattleManager.RESULT_TIMEOUT && enemy.race !== 3) {
            // 如果在副本中，先离开副本
            if (this._cell.cellType === CellType.DUNGEON && this._cell.extraInfo.battleInProgress) {
                this.leaveDungeon();
            }
            // 倒退到上一个格子
            this.teleportTo(this.prevCellIndex);
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        // 只有非skipRoundEnd时才调用roundEnd（startBattleWith会在回调后统一调用）
        if (!skipRoundEnd) {
            this.board.roundEnd();
        }
        return result;
    }
    
    // ========== 战斗辅助方法 ==========
    
    /**
     * 启动战斗（封装常用战斗模式）
     * @param {Enemy} enemy - 敌人对象
     * @param {Object} options - 选项
     * @returns {number} 战斗结果
     */
    startBattleWith(enemy, options = {}) {
        const {
            message = `你遭遇了${enemy.getName()}，战斗开始`,
            onWin = null,
            onLose = null,
            onTimeout = null
        } = options;
        
        if (message) {
            this.addChat(message);
        }
        
        // 先调用回调（在roundEnd之前），这样奖励消息能正确显示
        // 注意：battleWith()内部会调用roundEnd()，所以这里不需要再调用finishAction()
        const result = this.battleWith(enemy, true);  // skipRoundEnd=true，由这里统一处理
        
        // 调用回调
        if (result === BattleManager.RESULT_WIN && onWin) {
            onWin(enemy, result);
        } else if (result === BattleManager.RESULT_LOSE && onLose) {
            onLose(enemy, result);
        } else if (result === BattleManager.RESULT_TIMEOUT && onTimeout) {
            onTimeout(enemy, result);
        }
        
        // 统一在回调之后结束回合
        if (result !== BattleManager.RESULT_LOSE) {
            // 失败时不结束回合，等待玩家点击复活
            this.finishAction();
        }
        
        return result;
    }
    
    /**
     * 战斗胜利后给予奖励
     * @param {Object} rewards - 奖励配置
     */
    rewardAfterBattle(rewards = {}) {
        const {
            gold = 0,
            fame = 0,
            exp = 0,
            life = 0,
            attack = 0,
            defense = 0,
            message = null,
            greenMessage = null,
            redMessage = null,
            yellowMessage = null,
            diary = null
        } = rewards;
        
        // 发放奖励
        if (gold) this.prop.addGold(gold);
        if (fame) this.prop.fame += fame;
        if (exp) this.prop.addExp(exp);
        if (life) this.prop._baseMaxLife += life;
        if (attack) this.prop._baseAttack += attack;
        if (defense) this.prop._baseDefense += defense;
        
        // 重算属性（如果有基础属性变化）
        if (life || attack || defense) {
            this.prop._recalculateAttributes();
        }
        
        // 显示消息
        if (greenMessage) this.addGreenChat(greenMessage);
        if (redMessage) this.addRedChat(redMessage);
        if (yellowMessage) this.addYellowChat(yellowMessage);
        if (message) this.addChat(message);
        
        // 记录日记
        if (diary) {
            DiaryPanel.getInstance().addDiary(diary);
        }
        
        // 更新UI
        if (this._panel) {
            this._panel.updateUI();
        }
    }
    
    /**
     * 处理传说怪物战胜后的逻辑（遗物掉落）
     * @param {Enemy} enemy - 敌人对象
     */
    handleLegendDefeat(enemy) {
        if (!(enemy.isLegend || enemy.type === Enemy.LEGEND)) {
            return;
        }
        
        const isFirstDefeat = this.runningStat.isFirstDefeat(enemy.enemyNo);
        
        // 龙穴特殊遗物
        if (this._cell && this._cell.cellType === CellType.FAIRYLAND) {
            const relic = Relic.getInstance().getDragonPoolRelic();
            if (relic && this.prop.addRelic(relic)) {
                DiaryPanel.getInstance().addDiary(
                    `你在龙穴击败实力堪比魔王的${enemy.alias}获得${relic.colorName}`,
                    true
                );
            }
            return;
        }
        
        // 普通传说怪物
        if (isFirstDefeat || RandomUtils.randBool()) {
            const relic = Relic.getInstance().getRandomRelic(2);
            if (relic && this.prop.addRelic(relic)) {
                DiaryPanel.getInstance().addDiary(
                    `你击败传说中的${enemy.alias}获得${relic.colorName}`,
                    true
                );
            } else {
                DiaryPanel.getInstance().addDiary(
                    `你击败传说中的${enemy.alias}`,
                    true
                );
            }
        } else {
            DiaryPanel.getInstance().addDiary(
                `你击败传说中的${enemy.alias}`,
                true
            );
        }
    }
    
    /**
     * 完成当前动作（更新UI + 结束回合）
     */
    finishAction() {
        if (this._panel) {
            this._panel.updateUI();
        }
        this.board.roundEnd();
    }
    
    // 显示战斗统计 - AS3: showBattleStat()
    showBattleStat() {
        if (this.battleManager) {
            const statString = this.battleManager.getStatString();
            this.board.chatPanel.expandExtraInfo(statString);
            console.log('[Chess] 显示战斗统计');
        } else {
            console.warn('[Chess] 战斗管理器不存在，无法显示统计');
        }
    }
    
    // ========== 军队系统（讨魔先遣军） ==========
    
    // 增加军队人数 - AS3: heroArmyAdd()
    heroArmyAdd(normalCount, eliteCount) {
        if (!this._cell.extraInfo.normalhero) {
            this._cell.extraInfo.normalhero = 0;
        }
        if (!this._cell.extraInfo.elitehero) {
            this._cell.extraInfo.elitehero = 0;
        }
        
        this._cell.extraInfo.normalhero += normalCount;
        this._cell.extraInfo.elitehero += eliteCount;
        this.runningStat.addRecruitHeroCount(normalCount + eliteCount);
        
        console.log(`[Chess] 军队+${normalCount}炮灰+${eliteCount}勇士，当前: ${this._cell.extraInfo.normalhero}/${this._cell.extraInfo.elitehero}`);
    }
    
    // 检查是否可以招募更多勇士 - AS3: canRecruitMoreHero()
    canRecruitMoreHero() {
        const maxCount = Math.ceil(this.prop.fame / 100) * 15;
        const currentCount = (this._cell.extraInfo.normalhero || 0) + (this._cell.extraInfo.elitehero || 0);
        return currentCount < maxCount;
    }
    
    // 招募勇士 - AS3: recruitHero()
    recruitHero() {
        const maxCount = Math.ceil(this.prop.fame / 100) * 15;
        const currentCount = (this._cell.extraInfo.normalhero || 0) + (this._cell.extraInfo.elitehero || 0);
        
        if (currentCount >= maxCount) {
            this.addChat('想招更多小伙伴你得继续提高名声');
            return;
        }
        
        this.addChat('为壮大先遣军你发布了招募令');
        
        if (this.prop.gold < 1000 || (this.prop.stuff < 6 && this.prop.rarestuff < 6)) {
            this.addChat('但因为营地物资匮乏根本没人响应');
            this.board.roundEnd();
            return;
        }
        
        const remainSlots = maxCount - currentCount;
        
        let normalRecruit = Math.min(
            Math.floor(this.prop.gold / 1000),
            Math.floor(this.prop.stuff / 6)
        );
        normalRecruit = Math.min(remainSlots, normalRecruit);
        normalRecruit = RandomUtils.randInt(1, normalRecruit);  // 优化：随机招募数[1,n]
        
        let eliteRecruit = 0;
        const remainAfterNormal = remainSlots - normalRecruit;
        const goldAfterNormal = this.prop.gold - normalRecruit * 1000;
        
        if (remainAfterNormal > 0 && goldAfterNormal >= 5000 && this.prop.rarestuff >= 6) {
            eliteRecruit = Math.min(
                Math.floor(goldAfterNormal / 5000),
                Math.floor(this.prop.rarestuff / 6)
            );
            eliteRecruit = Math.min(remainAfterNormal, eliteRecruit);
            eliteRecruit = RandomUtils.randInt(1, eliteRecruit);  // 优化：精英招募[1,n]
        }
        
        if (normalRecruit === 0 && eliteRecruit === 0) {
            this.addChat('一个人也没招到，你人品还有待提高啊');
            this.board.roundEnd();
            return;
        }
        
        let message = '';
        let totalGold = 0;
        let totalStuff = 0;
        let totalRareStuff = 0;
        
        if (normalRecruit > 0) {
            message += `你招到了${normalRecruit}个炮灰`;
            totalGold += normalRecruit * 1000;
            totalStuff += normalRecruit * 6;
        }
        
        if (eliteRecruit > 0) {
            message += (normalRecruit > 0 ? `和${eliteRecruit}个勇士` : `你招到了${eliteRecruit}个勇士`);
            totalGold += eliteRecruit * 5000;
            totalRareStuff = eliteRecruit * 6;
        }
        
        this.heroArmyAdd(normalRecruit, eliteRecruit);
        this.prop.reduceGold(totalGold);
        this.prop.stuff = Math.max(0, this.prop.stuff - totalStuff);
        this.prop.rarestuff = Math.max(0, this.prop.rarestuff - totalRareStuff);
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        message += `<br>金钱-${totalGold} 基础锻材-${totalStuff}`;
        if (totalRareStuff > 0) {
            message += ` 稀有锻材-${totalRareStuff}`;
        }
        
        this.addChat(message);
        this.board.roundEnd();
    }
    
    // 显示格子建设进度 - AS3: showCellProgress()
    showCellProgress() {
        if (!this._isDead && this._cell) {
            const progressInfo = this._cell.getProgressString();
            if (progressInfo) {
                this.board.chatPanel.expandExtraInfo(progressInfo);
            }
        }
    }
    
    // 检查收集材料 - AS3: checkCollectedStuff()
    checkCollectedStuff(rounds) {
        if (!this._cell || this._cell.cellType !== CellType.DEVILLAND) {
            return;
        }
        
        if (this._cell.extraInfo.progress < 3) {
            return;
        }
        
        const stuffGain = Math.floor(rounds * 0.5);
        const rarestuffGain = Math.floor(rounds * 0.1);
        
        if (stuffGain > 0 || rarestuffGain > 0) {
            let message = '后勤官为你收集了';
            if (stuffGain > 0) {
                this.prop.stuff += stuffGain;
                message += `基础锻材${stuffGain}个`;
            }
            if (rarestuffGain > 0) {
                this.prop.rarestuff += rarestuffGain;
                message += (stuffGain > 0 ? '和' : '') + `稀有锻材${rarestuffGain}个`;
            }
            this.addChat(message);
            
            console.log(`[Chess] 魔王岛自动收集：基础${stuffGain} 稀有${rarestuffGain}`);
        }
    }
    
    // ========== 围攻魔王顶系统 ==========
    
    // 检查是否可以围攻魔王顶 - AS3: canWonCrusade()
    canWonCrusade() {
        if (this.prop.curStamina - this.prop.actualStaConsume * 6 < 0) {
            return false;
        }
        
        const enemyPower = 300;
        const normalHero = this._cell.extraInfo.normalhero || 0;
        const eliteHero = this._cell.extraInfo.elitehero || 0;
        const ourPower = normalHero + eliteHero * 5 + Math.round(this.prop.actualAtk / 300) * 5;
        
        return ourPower - enemyPower > 0;
    }
    
    // 围攻魔王顶 - AS3: crusadeDevil()
    crusadeDevil(confirmed) {
        if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop.actualStaConsume * 6 < 0) {
            this.addChat('围攻魔王顶绝非易事，你万不能疲劳出战');
            return;
        }
        
        const enemyPower = 300;
        const normalHero = this._cell.extraInfo.normalhero || 0;
        const eliteHero = this._cell.extraInfo.elitehero || 0;
        const ourPower = normalHero + eliteHero * 5 + Math.round(this.prop.actualAtk / 300) * 5;
        
        this.addChat('你觉得是时候向魔王老巢发起总攻了');
        
        if (!confirmed) {
            if (ourPower < enemyPower / 2) {
                this.addChat('你就这么点小伙伴，此战无疑是自寻死路');
            } else if (ourPower <= enemyPower) {
                this.addChat('你的小伙伴还不够多，此战胜算渺茫');
            } else {
                this.addChat('你和小伙伴们个个人强马壮，此战不赢都没天理啊');
            }
            
            this.board.chatPanel.addInlineOptions(
                '你确定要现在围攻魔王顶吗？',
                ['yes', 'no'],
                ['确定以及肯定', '想想还是算了'],
                (choice) => {
                    if (choice === 'yes') {
                        this.crusadeDevil(true);
                    } else {
                        this.stopCrusadeDevil();
                    }
                }
            );
            return;
        }
        
        this.prop.curStamina -= this.prop.actualStaConsume * 6;
        // V1.0.5: 围攻是选项后的动作，应该追加不清屏
        this.addChat('你率领先遣军一路攻向魔王顶');
        
        const powerDiff = ourPower - enemyPower;
        
        if (powerDiff > 0 || (powerDiff === 0 && RandomUtils.percent(20))) {  // 优化：同等战力20%概率胜利
            this._cell.extraInfo.crusadeWon = true;
            
            if (powerDiff < 50) {
                this.addChat('在这场惨烈的厮杀中双方都伤亡严重');
                this.addGreenChat('最终我方在付出沉重代价后取得胜利');
            } else {
                this.addChat('战斗非常激烈但胜利的天平早已注定');
                this.addGreenChat('最终敌人在我方压倒性的攻势下溃不成军');
            }
            
            if (powerDiff > 0) {
                const survivedElite = Math.min(Math.floor(powerDiff / 5), eliteHero);
                const survivedNormal = powerDiff - survivedElite * 5;
                
                this._cell.extraInfo.elitehero = survivedElite;
                this._cell.extraInfo.normalhero = survivedNormal;
                
                let message = '';
                if (survivedNormal > 0) {
                    message = `有${survivedNormal}个炮灰`;
                }
                if (survivedElite > 0) {
                    message += (message ? `和${survivedElite}个勇士存活了下来` : `有${survivedElite}个勇士存活了下来`);
                } else if (message) {
                    message += '存活了下来';
                }
                
                if (message) {
                    this.addChat(message);
                }
            } else {
                this._cell.extraInfo.normalhero = 0;
                this._cell.extraInfo.elitehero = 0;
            }
            
            this.addChat('障碍已经扫清，再也没有什么可以阻挡你和魔王之间的宿命之战了');
            
            if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop.actualStaConsume < 0) {
                this.addChat('不过你已经没有气力再战了，下次吧');
            } else {
                this._cell.extraInfo.battleInProgress = true;
            }
            
            DiaryPanel.getInstance().addDiary('你率众围攻魔王顶成功杀入魔王老巢', true);
        } else {
            this._cell.extraInfo.normalhero = 0;
            this._cell.extraInfo.elitehero = 0;
            this.addChat('这完全就是魔王军一方的大杀特杀');
            this.addRedChat('最终先遣军连你在内全部壮烈扑街');
            DiaryPanel.getInstance().addDiary('你率众围攻魔王顶但铩羽而归', true);
            this.dead();  // dead()内部会调用roundEnd()
            return;  // 死亡后不继续执行
        }
        
        this.board.roundEnd();
    }
    
    // 取消围攻魔王顶 - AS3: stopCrusadeDevil()
    stopCrusadeDevil() {
        this.addChat('你考虑再三最终还是决定按兵不动');
        this.board.roundEnd();
    }
    
    // ========== 单挑魔王系统 ==========
    
    // 检查是否有能力挑战魔王 - AS3: capableChallengeDevil()
    capableChallengeDevil() {
        const normalHero = this._cell.extraInfo.normalhero || 0;
        const eliteHero = this._cell.extraInfo.elitehero || 0;
        const armyPower = normalHero + eliteHero * 5;
        
        // 军队战力>200 或 综合等级>400
        if (armyPower > 200 || this.prop.getActualLvWithAll() > 400) {
            return true;
        }
        return false;
    }
    
    // 挑战魔王 - AS3: challengeDevil()
    challengeDevil() {
        if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop.actualStaConsume < 0) {
            this.addChat('你累得不想动，只能下次再找魔王晦气');
            return;
        }
        
        this._cell.extraInfo.battleInProgress = true;
        
        const maxStage = 7;  // 6个分身+1个本体
        let currentStage = this._cell.extraInfo.devilNo || 0;
        
        if (currentStage === 0) {
            this._cell.extraInfo.devilNo = 1;
            currentStage = 1;
            this.runningStat.beatDevilCount++;
            // V1.0.5: 挑战魔王是选项后的动作，应该追加不清屏
            this.addChat('魔王登场了，他是那么不可一世，你根本无法停止推倒他的冲动');
            
            // 检查是否召唤随从
            const follower = this.prop.getFollower();
            if (follower) {
                follower.beginRound = this.board._round + 1;
            }
        } else {
            this.addChat('魔王攻略中');
        }
        
        if (currentStage >= maxStage) {
            this.addChat('你遭遇了魔王的本体，战斗开始');
        } else {
            this.addChat(`你遭遇了魔王的第${currentStage}个分身，战斗开始`);
        }
        
        // 创建魔王敌人
        const enemyLevel = this.prop.maxLevel + currentStage * 5;
        const devil = new Enemy(enemyLevel, Enemy.BOSS, 5);
        devil.setAsDevil(this.runningStat.beatDevilCount - 1);
        
        // 军队协助削弱魔王
        const normalHero = this._cell.extraInfo.normalhero || 0;
        const eliteHero = this._cell.extraInfo.elitehero || 0;
        const armyPower = normalHero + eliteHero * 5;
        
        if (armyPower > 0) {
            const damage = armyPower * 100;
            devil.curLife -= damage;
            this.addChat(`小伙伴们帮你消耗了敌人${damage}点生命`);
            
            if (devil.curLife <= 0) {
                devil.curLife = 1;
                this.addChat('敌人当场倒地，只待你最后一刀送归西');
            }
        }
        
        // 开始战斗
        const result = this.battleWith(devil);
        if (result === BattleManager.RESULT_WIN) {
            if (this._cell.extraInfo.devilNo >= maxStage) {
                // 击败本体，通关！
                this._devilDefeatedEnding();
            } else {
                // 击败分身，进入下一阶段
                this._cell.extraInfo.devilNo = currentStage + 1;
            }
        }
        // V1.0.5: battleWith()内部已调用roundEnd()，这里不需要再调用
    }
    
    // 魔王被击败的结局 - AS3: lootDevil() + 相关逻辑
    _devilDefeatedEnding() {
        this.devilDefeated = true;
        this.endDay = this.board._circleNo;
        this._cell.extraInfo.battleInProgress = false;
        this._cell.extraInfo.devilNo = 0;
        
        // 掉落遗物
        this._lootDevil();
        
        this.addGreenChat('你做到了，魔王肥硕的身躯轰然倒地');
        
        if (this.runningStat.beatDevilCount === 1) {
            DiaryPanel.getInstance().addDiary('你首次挑战就完成了推倒魔王的壮举', true);
        } else {
            DiaryPanel.getInstance().addDiary(`你历经${this.runningStat.beatDevilCount}次挑战终于完成了推倒魔王的壮举`, true);
        }
        
        // 触发凯旋任务
        const quest = new Quest(Quest.TRIUMPH);
        const startCell = this.board.getCell(0);  // 起点城镇
        quest.triggerCellType = startCell.cellType;
        quest.questDest = startCell.cellName;
        quest.beginCellIndex = startCell.index;
        quest.beginRound = this.board._round + 1;
        quest.initializeByType();
        
        if (this.prop.addQuest(quest)) {
            this.addGreenChat(`接受了最终任务：【${quest.questName}】`);
            this.addChat(quest.questIntro);
            DiaryPanel.getInstance().addDiary(`接受最终任务：${quest.questName}`);
        }
    }
    
    // 取消挑战魔王 - AS3: stopChallengeDevil()
    stopChallengeDevil() {
        if (!this._cell.extraInfo.devilNo) {
            this.addChat('你还没做好面对魔王的准备，可耻的逃了');
        } else {
            this.addChat('你决定暂且放过魔王，毕竟来日还很方长');
            DiaryPanel.getInstance().addDiary(`你第${this.runningStat.beatDevilCount}次挑战魔王以失败告终`, true);
        }
        
        this._cell.extraInfo.battleInProgress = false;
        this._cell.extraInfo.devilNo = 0;
        this.board.roundEnd();
    }
    
    // 掉落遗物 - AS3: lootDevil()
    _lootDevil() {
        // 遗物系统掉落（优先2级遗物，没有则1级）
        let relic = Relic.getInstance().getRandomRelic(2);
        if (!relic) {
            relic = Relic.getInstance().getRandomRelic(1);
        }
        if (relic) {
            this.prop.addRelic(relic);
            console.log('[Chess] 魔王掉落遗物:', relic.name);
        }
    }
    
    // 检查是否触发入侵任务 - AS3: checkTriggerInvade()
    checkTriggerInvade() {
        if (!this._invadeTriggered && 
            this.board._circleNo - (this.lastFlag.lastInvadedLap || 0) > 5) {
            if (RandomUtils.percent(20)) {  // 优化：20%概率入侵事件
                this._invadeTriggered = true;
                this.lastFlag.lastInvadedLap = this.board._circleNo;
                
                const targetType = Math.random() > 0.5 ? CellType.VILLAGE : CellType.TOWN;
                const targetCell = this.board.getNearestCell(this._cell.index, targetType);
                
                if (!targetCell) {
                    return false;
                }
                
                const quest = new Quest(Quest.INVADE);
                quest.triggerCellIndex = targetCell.index;
                quest.triggerCellType = targetCell.cellType;
                quest.questDest = `前方${targetCell.cellName}`;
                quest.beginCellIndex = targetCell.index;
                quest.beginRound = this.board._round + 1;
                
                // V1.0.6: 根据距离计算侵袭任务时限
                const distance = this.board.getShortestDistance(this._index, targetCell.index);
                quest.questDuration = this.board.calculateQuestDuration(distance, true);
                console.log(`[Quest] 侵袭距离${distance}格，时限${quest.questDuration}天`);
                
                quest.initializeByType();
                
                if (this.prop.addQuest(quest)) {
                    this.addRedChat(`接受委托：【${quest.questName}】`);
                    this.addChat(quest.questIntro);
                    DiaryPanel.getInstance().addDiary(`接受委托：${quest.questName}`);
                }
                
                return true;
            }
        }
        return false;
    }
    
    // 发现宝箱事件 - AS3: discoverChest()
    discoverChest(chestType) {
        let chestChance = 0.05;
        if (this.prop.follower && this.prop.follower.type === 3) {
            chestChance = 0.15;
        }
        
        if (Math.random() > chestChance) {
            return false;
        }
        
        if (this.lastFlag && this.lastFlag.lastMetChestLap === this.board._circleNo) {
            return false;
        }
        
        this.addGreenChat('你在路边发现了一个宝箱！');
        
        if (this.lastFlag) {
            this.lastFlag.lastMetChestLap = this.board._circleNo;
        }
        
        const isLocked = Math.random() > 0.5;
        if (isLocked) {
            if (this.prop.follower && this.prop.follower.type === 3) {
                this.addChat('宝箱上了锁，幸好你的随从是开锁高手');
                this._openChest(chestType);
            } else {
                this.addRedChat('宝箱上了锁，你无法打开');
                this.board.roundEnd();
            }
        } else {
            this._openChest(chestType);
        }
        
        return true;
    }
    
    // 打开宝箱 - AS3: _openChest()
    _openChest(chestType) {
        const goldGain = 100 + Math.floor(Math.random() * 200);
        this.prop.addGold(goldGain);
        this.addGreenChat(`获得金钱：${goldGain}`);
        
        if (Math.random() > 0.5) {
            const stuffGain = 1 + Math.floor(Math.random() * 3);
            this.prop.stuff += stuffGain;
            this.addGreenChat(`获得基础锻材：${stuffGain}`);
        }
        
        // 尝试从宝箱获得装备（传入宝箱类型）
        this.prop.checkLootEquipFromChest(chestType);
        
        this.board.roundEnd();
    }
    
    // 救助珍兽事件 - AS3: saveAnimalFrom()
    saveAnimalFrom(enemy) {
        this.addChat('你决定救下这只可怜的珍兽');
        
        this.startBattleWith(enemy, {
            message: `你遭遇了${enemy.getName()}，战斗开始`,
            onWin: () => {
                this.addGreenChat('你成功救下了珍兽！');
                
                const rewardType = Math.floor(Math.random() * 3);
                switch (rewardType) {
                    case 0:
                        const goldGain = 200 + Math.floor(Math.random() * 300);
                        this.prop.addGold(goldGain);
                        this.addGreenChat(`珍兽赠予你宝物，金钱+${goldGain}`);
                        break;
                    case 1:
                        const expGain = 100 + Math.floor(Math.random() * 200);
                        this.prop.addExp(expGain);
                        this.addGreenChat(`与珍兽心意相通，经验+${expGain}`);
                        break;
                    case 2:
                        this.prop.heal(this.prop.maxLife * 0.5);
                        this.prop.restoreStamina(this.prop.maxStamina * 0.5);
                        this.addGreenChat('珍兽施展神力，恢复了你的生命和耐力');
                        break;
                }
                
                DiaryPanel.getInstance().addDiary('你救助了一只珍兽');
            }
        });
    }
    
    // 触发任务 - AS3: triggerQuest()
    triggerQuest(questType) {
        const quest = new Quest(questType);
        let questIntro = '';
        
        switch (questType) {
            case Quest.TRESURE:
                const treasureCell = this.board.getRandomCell([CellType.PLAIN, CellType.WOODS]);
                quest.triggerCellIndex = treasureCell.index;
                quest.triggerCellType = treasureCell._cellType;
                quest.questDest = `某个${treasureCell.cellName}`;
                
                // V1.0.6: 根据距离计算寻宝时限
                const treasureDistance = this.board.getShortestDistance(this._index, treasureCell.index);
                quest.questDuration = this.board.calculateQuestDuration(treasureDistance, false);
                console.log(`[Quest] 寻宝距离${treasureDistance}格，时限${quest.questDuration}天`);
                
                quest.initializeByType();
                this.prop.addQuest(quest);
                quest.beginRound = this.board._round + 1;
                questIntro = quest.questIntro;
                break;
                
            case Quest.INVADE:
                const invadeCell = this.board.getNearestCell(
                    this._cell.index, 
                    Math.random() > 0.5 ? CellType.VILLAGE : CellType.TOWN
                );
                if (!invadeCell) {
                    console.error(`[Quest] 侵袭任务找不到目标城镇`);
                    return null;
                }
                quest.triggerCellIndex = invadeCell.index;
                quest.triggerCellType = invadeCell._cellType;
                quest.questDest = `前方${invadeCell.cellName}`;
                quest.beginCellIndex = invadeCell.index;
                
                // V1.0.6: 根据距离计算侵袭任务时限（紧急任务，按稀有计算）
                const invadeDistance = this.board.getShortestDistance(this._index, invadeCell.index);
                quest.questDuration = this.board.calculateQuestDuration(invadeDistance, true);
                console.log(`[Quest] 侵袭距离${invadeDistance}格，时限${quest.questDuration}天`);
                
                quest.initializeByType();
                this.prop.addQuest(quest);
                quest.beginRound = this.board._round + 1;
                questIntro = quest.questIntro;
                break;
                
            default:
                quest.initializeByType();
                quest.beginRound = this.board._round + 1;
                
                if (this.prop.addQuest(quest)) {
                    this.addGreenChat(`接受了新任务：${quest.getQuestName()}`);
                    DiaryPanel.getInstance().addDiary(`接受任务：${quest.getQuestName()}`);
                }
                
                this.board.roundEnd();
                return;
        }
        
        this.addGreenChat(questIntro);
        DiaryPanel.getInstance().addDiary(`接受任务：${quest.getQuestName()}`);
        this.board.roundEnd();
    }
    
    // 检查随从是否生病 - AS3: checkStayWithSick()
    checkStayWithSick() {
        if (!this.prop.haveBuff(BuffNo.SICK)) {
            return false;
        }
        
        this.runningStat.nostayRound = 0;
        let healDays = 6;
        
        if (this.prop.follower && this.prop.follower.married) {
            healDays = 2;
            this.addChat('强壮如你也不得不卧床养病，幸得爱妻精心照料，只两天病就痊愈了');
        } else {
            this.addChat('强壮如你也不得不卧床养病三天');
        }
        
        this.prop.removeBuff(BuffNo.SICK);
        
        if (this.board._round - this.lastFlag.lastSickRound >= 28) {
            const attrType = Math.floor(Math.random() * 3);
            
            if (attrType === 2 && this.prop._baseAttack > 20) {
                this.addChat('久病成疾导致你战斗力下降，攻击-10');
                this.prop._baseAttack -= 10;
                this.prop._recalculateAttributes();
            } else if (attrType === 1 && this.prop._baseDefense > 10) {
                this.addChat('久病成疾导致你战斗力下降，防御-10');
                this.prop._baseDefense -= 10;
                this.prop._recalculateAttributes();
            } else if (attrType === 0 && this.prop._baseMaxLife > 100) {
                this.addChat('久病成疾导致你战斗力下降，生命-20');
                this.prop._baseMaxLife -= 20;
                this.prop._recalculateAttributes();
            }
        }
        
        this.lastFlag.lastSickRound = this.board._round;
        
        this.board.roundEnd();
        
        return true;
    }
    
    // 准备下一回合 - AS3: prepareNextRound()
    prepareNextRound() {
        // 防止重复调用
        if (this._preparingNextRound) {
            console.warn('[Chess] prepareNextRound() 重复调用被阻止');
            return;
        }
        this._preparingNextRound = true;
        
        // 清除之前的内嵌选项，防止叠加显示
        this.board.chatPanel.clearInlineOptions();
        
        console.log(`[Chess] prepareNextRound() 开始 - 死亡状态: ${this._isDead}, 位置: ${this._index}`);
        
        if (this.showGameEndOptions && this.showGameEndOptions()) {
            console.log('[Chess] prepareNextRound() - 游戏结束检查触发');
            this._preparingNextRound = false;
            return;
        }
        
        if (this.moveType === this.SHIP) {
            console.log('[Chess] prepareNextRound() - 坐船中');
            this._preparingNextRound = false;
            return;
        }
        
        if (this.checkContinueArena && this.checkContinueArena()) {
            console.log('[Chess] prepareNextRound() - 竞技场连续比赛');
            this._preparingNextRound = false;
            return;
        }
        
        if (this.checkBattleInProgress && this.checkBattleInProgress()) {
            console.log('[Chess] prepareNextRound() - 副本战斗进行中');
            this._preparingNextRound = false;
            return;
        }
        
        if (this.marriage && this.marriage.askWifeFollowOrStay && this.marriage.askWifeFollowOrStay(this)) {
            console.log('[Chess] prepareNextRound() - 婚姻系统触发');
            this._preparingNextRound = false;
            return;
        }
        
        // V1.0.5: 检查是否等待复活
        if (this._waitingForRevive) {
            console.log('[Chess] prepareNextRound() - 等待玩家点击复活按钮');
            this._preparingNextRound = false;
            return;
        }
        
        // 优化：使用统一的耐力检查
        if (!this.prop.hasEnoughStamina() && !this._isDead) {
            console.log('[Chess] prepareNextRound() - 耐力不足');
            
            if (this._cell.cellType === CellType.HOUSE && this._cell.extraInfo && this._cell.extraInfo.progress > 1) {
                this.addChat('你感到精疲力尽，只能先在家歇会');
                this.sleep();
            } else {
                this.addChat('你感到精疲力尽，只能先原地歇会');
                this._sleepAtWild();
            }
            
            // V1.0.5: 休息完成后，继续往下走显示步行菜单（不要return）
            console.log('[Chess] prepareNextRound() - 休息完成，继续显示步行菜单');
        }
        
        console.log('[Chess] prepareNextRound() - 显示前进选项');
        
        this.showForwardOptions();
        this._preparingNextRound = false;
    }
    
    // 显示前进选项 - AS3: showForwardOptions()
    showForwardOptions(enableSelectDest = false) {
        // V1.0.5: 取消骑行按钮，只保留步行选项
        // 自动游戏模式下不触发"选择目的地"事件
        if (!ChessAI.enableAuto) {
            // 每回合有1%的几率触发（每圈调用多次，累计约4-5圈触发一次）
            if (this._enableSelectDest && Math.random() < 0.01) {
                this._enableSelectDest = false;
                this._canSelectDest = true;
                console.log('[Chess] 触发"选择目的地"事件（稀有）');
            }
        }
        
        // 只显示前进选项
        if (this._canSelectDest || enableSelectDest) {
            this.board.chatPanel.addInlineOptions(
                '你获得了选择前进地点的机会',
                ['walk'],
                ['前进至'],
                (choice) => {
                    this._handleForwardChoice(choice, true);
                }
            );
        } else {
            this.board.chatPanel.addInlineOptions(
                '你举棋不定不造下一步该去哪',
                ['walk'],
                ['继续前进'],
                (choice) => {
                    this._handleForwardChoice(choice, false);
                }
            );
        }
        
        this._readyMove = true;
        
        // 自动游戏：延迟后自动选择
        if (ChessAI.enableAuto) {
            console.log('[Chess] 自动游戏模式：将在2秒后自动投骰子');
            setTimeout(() => {
                if (this._readyMove && ChessAI.enableAuto) {
                    console.log('[Chess] 自动选择: walk');
                    this._handleForwardChoice('walk', false);
                }
            }, ChessAI.HANDLE_DELAY * 1000);
        }
    }
    
    // 处理前进选择 - AS3: _handleForwardChoice()
    _handleForwardChoice(choice, canSelectDest) {
        this._readyMove = false;
        
        // 离开城镇/村庄时清除"刚复活"标志
        if (this._justRevived) {
            this._justRevived = false;
            console.log('[Chess] 离开安全区域，清除刚复活标志');
        }
        
        // V1.0.5：取消骑行功能，只保留步行
        this.moveType = this.WALK;
        
        this.board.chatPanel.clearInlineOptions();
        
        if (canSelectDest) {
            this._canSelectDest = false;
            this.board.startClickMove(this);
            this.addChat('请点击地图选择你要前往的目的地');
            this._readyMove = true;
        } else {
            // V1.0.5: 取消双倍骰子，始终投单骰子
            this._isDiceRolling = true;
            
            this.board.removeAllDice();
            
            const points = this.board.tossDice(false);  // false = 单骰子
            console.log(`[Chess] 投骰子：${points}点`);
            
            createjs.Tween.get(this)
                .wait(500)
                .call(() => {
                    this.forward(points);
                });
        }
    }
    
    // 检查是否可以移动到目标格子 - AS3: checkCanMoveTo()
    checkCanMoveTo(targetIndex) {
        const maxStep = 6;  // V1.0.5: 固定最大步数6
        const distance = this.board.distant(this._index, targetIndex);
        
        return distance <= maxStep;
    }
    
    // 移动到指定格子 - AS3: checkMoveTo()
    checkMoveTo(targetIndex) {
        if (targetIndex !== this._index) {
            if (this.checkCanMoveTo(targetIndex)) {
                this._readyMove = false;
                const distance = this.board.distant(this._index, targetIndex);
                this.forward(distance);
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检查游戏结束选项（击败魔王后在城镇触发）
     * @returns {boolean} 是否触发了游戏结束选项
     */
    showGameEndOptions() {
        if (this.devilDefeated && this._cell && this._cell.cellType === CellType.TOWN) {
            this.addChat('你打倒了魔王，命运的齿轮终于停歇');
            this.board.chatPanel.addInlineOptions(
                '你别无选择，只能被命运的洪流一波带走',
                ['nextgame', 'diary'],
                ['结局然后继续', '查阅勇者事迹'],
                this._handleGameEndChoice.bind(this)
            );
            return true;
        }
        return false;
    }
    
    /**
     * 处理游戏结束选项
     */
    _handleGameEndChoice(choice) {
        if (choice === 'nextgame') {
            // 开始新一局：增加通关次数后重载页面
            if (this.board) {
                this.board._gameCleared = (this.board._gameCleared || 0) + 1;
                // 保存通关次数到 localStorage
                try {
                    localStorage.setItem('heroquest_gameCleared', this.board._gameCleared);
                } catch(e) {
                    console.error('[Chess] 保存通关次数失败:', e);
                }
            }
            location.reload();
        } else if (choice === 'diary') {
            DiaryPanel.getInstance().show();
        }
    }
    
    /**
     * 检查竞技场连续比赛
     * @returns {boolean} 是否触发了连续比赛选项
     */
    checkContinueArena() {
        if (this._cell && this._cell.extraInfo && this._cell.extraInfo.battleInProgress) {
            if (this._cell.cellType === CellType.ARENA) {
                this.board.chatPanel.addInlineOptions(
                    '是否继续进行下一场比赛',
                    ['arena_continue', 'arena_stop'],
                    ['肯定的', '不比了'],
                    this._handleArenaContinueChoice.bind(this)
                );
                return true;
            }
        }
        return false;
    }
    
    /**
     * 处理竞技场连续比赛选项
     */
    _handleArenaContinueChoice(choice) {
        if (choice === 'arena_continue') {
            // 继续下一场比赛
            if (this._cell && this._cell.triggerBattle) {
                this._cell.triggerBattle(this);
            }
        } else {
            // 退出竞技场
            if (this._cell) {
                this._cell.extraInfo.battleInProgress = false;
            }
            this.board.roundEnd();
        }
    }
    
    // ==================== 死亡/复活方法已迁移到 DeathMixin.js ====================
    // dead(), revive()
    // 注意：DeathMixin.js中的版本包含死亡Bug修复（this.board.roundEnd()）
    
    // 获取棋子信息用于存档 - AS3: getChessInfo()
    getChessInfo() {
        const info = {
            walkspeed: this.walkspeed || 1,
            haveHouse: this.haveHouse || false
        };
        
        // 保存属性数据
        if (this.prop && this.prop.recordAll) {
            info.prop = this.prop.recordAll();
        }
        
        // 保存天赋数据（如果天赋系统已实现）
        if (this.talent && this.talent.getUnlockedNoArr) {
            info.unlockedSkill = this.talent.getUnlockedNoArr();
        }
        
        // 保存统计数据
        if (this.runningStat && this.runningStat.recordAll) {
            info.stat = this.runningStat.recordAll();
        }
        
        // 保存战斗记录（如果已实现）
        if (this.battleManager && this.battleManager.checkSaveWinsRecord) {
            this.battleManager.checkSaveWinsRecord(info);
        }
        
        // 保存婚姻数据（如果婚姻系统已实现）
        if (typeof Marriage !== 'undefined' && Marriage.getInstance && Marriage.getInstance().checkSaveRecord) {
            Marriage.getInstance().checkSaveRecord(info);
        }
        
        return info;
    }
}

// ==================== Mixin混入 ====================
// 将功能模块混入Chess类
// 注意：Mixin文件必须在Chess.js之前加载（见index.html）

Object.assign(Chess.prototype, ChatMixin);
Object.assign(Chess.prototype, DeathMixin);
Object.assign(Chess.prototype, MovementMixin);
Object.assign(Chess.prototype, DungeonMixin);
Object.assign(Chess.prototype, TownEventMixin);
Object.assign(Chess.prototype, DrinkRumorMixin);  // V1.0.6: 喝酒打听消息系统
Object.assign(Chess.prototype, GuildMixin);
Object.assign(Chess.prototype, CampMixin);
Object.assign(Chess.prototype, StableMixin);
Object.assign(Chess.prototype, DockMixin);
Object.assign(Chess.prototype, RandomEventMixin);
Object.assign(Chess.prototype, SpecialCellMixin);
Object.assign(Chess.prototype, GameMechanicsMixin);

console.log('[Chess] Mixin模块已加载: 13个模块（含线索系统）');

