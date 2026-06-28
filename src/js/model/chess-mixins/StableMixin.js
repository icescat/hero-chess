/**
 * 马厩系统 Mixin
 * 对应 AS3: csh.model.Chess 中的马厩相关方法
 */

const StableMixin = {
    /**
     * 马厩事件
     * 对应 AS3: triggeredStable()
     */
    triggeredStable() {
        // 1. 如果没有坐骑，提供购买选项
        if (!this.prop._mount) {
            const mountNo = Math.min(Mount.maxNormalNo, this.board._gameCleared + 1);
            const price = mountNo * mountNo * 1000;
            this.addChat('一批新鲜出栏的种马正在公开售卖');
            
            // 使用内嵌链接方式（原版风格）
            this.board.chatPanel.addInlineOptions(
                `是否花费${price}金购买一匹马呢？`,
                ['yes', 'no'],
                ['马上买', '再考虑'],
                (choice) => this._buyHorse(choice === 'yes')
            );
            return;
        }
        
        // 2. 检查是否可以改良马种
        const canImprove = this.prop._mount.canImprove();
        
        // 3. 检查必触发事件（盗马贼或独眼巨人）
        if (!canImprove) {
            const mustFlag = this._cell.extraInfo.mustFlag;
            if (mustFlag) {
                this._cell.extraInfo.mustFlag = 0;
                if (mustFlag === 1) {
                    this._checkCyclopsRaid(true);
                } else {
                    this._checkTriggerHorseThief(true);
                }
                return;
            }
            
            // 4. 随机事件检查
            if (this._checkTriggerHorseThief() || this._checkCyclopsRaid()) {
                return;
            }
        }
        
        // 5. 构建选项菜单
        const choices = ['horserace'];
        const labels = ['赛马大会'];
        
        if (canImprove) {
            choices.push('improvehorse');
            labels.push(`改良马种（${this.prop._mount.improveFee}金）`);
        } else if (this.prop._mount.canGrow()) {
            choices.push('horsetrain');
            labels.push('马术训练（1000金）');
        }
        
        if (choices.length === 1) {
            choices.push('walk');
            labels.push('继续前进');
        }
        
        // 使用内嵌链接方式（原版风格）
        this.board.chatPanel.addInlineOptions(
            '你打算干什么呢？',
            choices,
            labels,
            (choice) => this._handleStableChoice(choice)
        );
    },
    
    /**
     * 处理马厩选项
     */
    _handleStableChoice(choice) {
        switch (choice) {
            case 'horserace':
                this._horseRace();
                break;
            case 'improvehorse':
                this._improveHorse();
                break;
            case 'horsetrain':
                this._horseTrain();
                break;
            case 'walk':
                // 直接离开，开始投骰子
                this._handleForwardChoice('walk', false);
                break;
            default:
                this.board.roundEnd();
                break;
        }
    },
    
    /**
     * 购买坐骑
     * 对应 AS3: buyHorse(param1:Boolean)
     */
    _buyHorse(confirm) {
        const mountNo = Math.min(Mount.maxNormalNo, this.board._gameCleared + 1);
        const price = mountNo * mountNo * 1000;
        
        if (!confirm) {
            this.addChat('你暂时还没有骑马赶路的打算');
        } else if (this.prop.gold < price) {
            this.addChat('要是有钱你肯定就买下了');
        } else {
            this.prop.reduceGold(price);
            this.addChat(`你看中一匹威武雄壮的马仔，金钱-${price}`);
            const newMount = new Mount(mountNo);
            this.addGreenChat(`你获得了${newMount.colorName}`);
            this.prop.equipMount(newMount);
            DiaryPanel.getInstance().addDiary(`你在白云马场购得坐骑${newMount.colorName}`);
            if (this._panel) {
                this._panel.updateUI();
            }
        }
        this.board.roundEnd();
    },
    
    /**
     * 赛马大会
     */
    _horseRace() {
        this.addChat('马场的常规赛事，赢得前三名可获得奖金');
        // V1.1+: 完整的赛马小游戏逻辑（互动赛马）
        this.addChat('比赛进行中...');
        const rank = RandomUtils.randInt(1, 8);  // 优化：赛马等级[1,8]
        
        if (rank === 1) {
            const prize = 5000;
            this.prop.addGold(prize);
            this.addGreenChat(`你的${this.prop._mount.colorName}获得第一名！奖金${prize}金`);
        } else if (rank <= 3) {
            const prize = 1000;
            this.prop.addGold(prize);
            this.addGreenChat(`你的${this.prop._mount.colorName}获得第${rank}名，奖金${prize}金`);
        } else {
            this.addChat(`你的${this.prop._mount.colorName}获得第${rank}名，没有奖金`);
        }
        
        this.finishAction();
    },
    
    /**
     * 检查是否可以改良马匹品质
     * 供 ChessAI 调用判断是否升级马匹
     * @returns {boolean}
     */
    _canImproveHorse() {
        if (!this.prop || !this.prop._mount) return false;
        return this.prop._mount.canImprove();
    },

    /**
     * 改良马种
     */
    _improveHorse() {
        const fee = this.prop._mount.improveFee;
        if (this.prop.gold < fee) {
            this.addChat('金钱不足');
            this.board.roundEnd();
            return;
        }
        
        this.prop.reduceGold(fee);
        const newMount = this.prop._mount.getNextGeneration(this);
        this.prop.equipMount(newMount);
        this.addGreenChat(`改良成功！你获得了${newMount.colorName}`);
        DiaryPanel.getInstance().addDiary(`你的坐骑改良为${newMount.colorName}`);
        
        this.finishAction();
    },
    
    /**
     * 马术训练
     */
    _horseTrain() {
        const fee = 1000;
        if (this.prop.gold < fee) {
            this.addChat('金钱不足');
            this.board.roundEnd();
            return;
        }
        
        this.prop.reduceGold(fee);
        this.addChat(`金钱-${fee}`);
        
        if (this.prop._mount.grow(true)) {
            this.addGreenChat(`${this.prop._mount.colorName}的成长度提升了！`);
        } else {
            this.addChat('训练效果不佳');
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 检查盗马贼事件
     * 对应 AS3: checkTriggerHorseThief(param1:Boolean = false)
     * @param {boolean} forced - 是否强制触发
     */
    // 检查盗马贼事件 - V1.0.6: 只能通过喝酒线索触发（特殊Boss）
    _checkTriggerHorseThief(forced = false) {
        // V1.0.6: 只能通过线索触发，不再随机
        const hasClue = this.rumorSystem && this.rumorSystem.hasClue(RumorSystem.CLUE_TYPES.HORSE_THIEF);
        
        if (hasClue || forced) {  // 特殊Boss：只能通过线索或强制触发
            // V1.0.6: 线索触发提示
            if (hasClue) {
                this.addGreenChat('【 线索触发 】');
                this.addChat('你想起酒馆打听到的消息，盗马贼果然在这里！');
                this.rumorSystem.useClue(RumorSystem.CLUE_TYPES.HORSE_THIEF);
            }
            
            this.addChat('你发现有贼人借着夜色潜入马厩，惊觉行迹暴露的他慌忙逃跑');
            this.addChat('你将盗马贼堵个正着，战斗开始');
            
            const enemy = new Enemy(this.prop.level, Enemy.NORMAL);
            const result = this.battleWith(enemy);
            if (result === BattleManager.RESULT_WIN) {
                const circleNo = Math.floor(this.board._circleNo / 6);
                if (this.prop._mount.mountNo < circleNo && circleNo < Mount.maxNormalNo) {
                    this.addChat('闻声赶来的马场女主人对你赞许有加，愿将爱驹赠英雄');
                    const newMount = this.prop._mount.getNextGeneration(this);
                    this.prop.equipMount(newMount);
                    this.addChat(`你获得了${this.prop._mount.colorName}`);
                    DiaryPanel.getInstance().addDiary(`你帮马场女主人除掉盗马贼，她赠你爱驹${this.prop._mount.colorName}`);
                } else if (RandomUtils.percent(40)) {  // 优化：40%概率马场女主人
                    this.addChat('闻声赶来的马场女主人对你赞不绝口，愿与你彻夜研习骑术');
                    this.prop.addBuff(BuffNo.SATISFIED, this.board._round + 1);
                    this.prop.fullRestore();  // 完全恢复（生命+耐力）
                    DiaryPanel.getInstance().addDiary('你帮马场女主人除掉盗马贼，她与你彻夜研习骑术');
                } else {
                    const reward = this.prop.level * 500;
                    this.addChat(`闻声赶来的马场主人赠你${reward}金以示酬谢`);
                    this.prop.addGold(reward);
                    DiaryPanel.getInstance().addDiary('你帮马场主人除掉盗马贼，他重金酬谢你');
                }
            } else {
                this.addChat('输给小贼你实在有负勇者之名');
            }
            
            if (this._panel) {
                this._panel.updateUI();
            }
            this.board.roundEnd();
            
            return true;
        }
        return false;
    },
    
    /**
     * 检查独眼巨人袭击事件
     * 对应 AS3: checkCyclopsRaid(param1:Boolean = false)
     * @param {boolean} forced - 是否强制触发
     */
    // 检查独眼巨人事件 - V1.0.6: 只能通过喝酒线索触发（特殊Boss）
    _checkCyclopsRaid(forced = false) {
        // V1.0.6: 只能通过线索触发，不再随机
        const hasClue = this.rumorSystem && this.rumorSystem.hasClue(RumorSystem.CLUE_TYPES.CYCLOPS);
        
        if (hasClue || forced) {  // 特殊Boss：只能通过线索或强制触发
            // V1.0.6: 线索触发提示
            if (hasClue) {
                this.addGreenChat('【 线索触发 】');
                this.addChat('你想起酒馆打听到的消息，独眼巨人果然在这里！');
                this.rumorSystem.useClue(RumorSystem.CLUE_TYPES.CYCLOPS);
            }
            
            this.addChat('你老远就看见独眼巨人在吞食这里的马匹');
            
            const enemy = Enemy.createWithLevelOffset(this.prop.level, 5, Enemy.ELITE, 0, true);
            this.startBattleWith(enemy, {
                onWin: () => {
                    this.rewardAfterBattle({
                        attack: 30,
                        greenMessage: '你吃掉了独眼巨人的大伙伴，攻击+30',
                        diary: '你干掉一只独眼巨人并食它大伙伴'
                    });
                }
            });
            
            return true;
        }
        return false;
    }
};

