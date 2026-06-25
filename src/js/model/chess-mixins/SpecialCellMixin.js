/**
 * 特殊格子事件 Mixin
 * 包含墓地、温泉等特殊格子的完整事件逻辑
 * 包括：吸血鬼袭击、温泉偷窥、铁匠大师、史莱姆袭击等
 */

const SpecialCellMixin = {
    /**
     * 墓地事件 - 祭拜先祖（完整版）
     * 对应 AS3: woship()
     */
    woship() {
        // 检查吸血鬼袭击（夜晚10%概率）
        if (this._checkVampireRaid()) {
            return;
        }
        
        this.runningStat.woshipCount++;
        this.addChat('你在先祖坟前进行了虔诚的拜祭');
        
        // 每30次拜祭获得遗物奖励
        if (this.runningStat.woshipCount % 30 === 0 && Relic.getInstance().getRelicRemain(2)) {
            this.addGreenChat('先祖大受感动从坟里爬出来给予你奖励');
            const relic = Relic.getInstance().getRandomRelic(2);
            if (this.prop.addRelic(relic)) {
                DiaryPanel.getInstance().addDiary('你多次拜祭先祖，心诚感天动地而获奖励' + relic.colorName, true);
            }
        } else {
            this.addChat('得到先祖庇佑');
            this.prop.addBuff(BuffNo.NEARWIN, this.board._round + 1);
        }
        
        // 随从好感度提升
        if (this.prop.follower && !this.prop.follower.isMaxRelationship()) {
            this.addChat(`你还顺便和${this.prop.follower.name}一起在${this.prop.follower.getSexString()}家祖坟上献了花`);
            const relationUp = this.prop.haveBuff(BuffNo.PERFUME) ? 8 : 4;
            this.prop.follower.relationshipUp(relationUp);
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 检查吸血鬼袭击事件
     * 对应 AS3: checkVampireRaid()
     * @returns {boolean} true=触发了事件，false=未触发
     */
    // 吸血鬼袭击 - 野生Boss，保持原有随机逻辑
    _checkVampireRaid() {
        if (RandomUtils.percent(10) && this.board._isNight) {  // 10%概率，夜晚触发
            this.addChat('夜晚的墓地阴森恐怖，一个黑影窜了出来，你差点没被吓尿，原来是只吸血鬼');
            
            const enemy = Enemy.createWithLevelOffset(this.prop.level, 5, Enemy.ELITE, 0, true);
            this.startBattleWith(enemy, {
                onWin: () => {
                    this.prop.heal(300);
                    this.rewardAfterBattle({
                        greenMessage: '你吸食了吸血鬼的灰烬，生命+300',
                        diary: '你干掉一只吸血鬼并吸食它的灰烬'
                    });
                }
            });
            
            return true;
        }
        return false;
    },
    
    /**
     * 温泉事件（完整版）
     * 对应 AS3: springBath()
     */
    springBath() {
        // 检查温泉偷窥事件
        if (this._checkSpringPeep()) {
            return;
        }
        
        // 检查mustFlag（铁匠大师/史莱姆）
        const mustFlag = this._cell.extraInfo.mustFlag || 0;
        if (mustFlag) {
            this._cell.extraInfo.mustFlag = 0;
        }
        
        // 检查铁匠大师（mustFlag==2 强制触发，否则随机）
        const meetSmith = this._checkMeetSmithMaster(mustFlag === 2);
        if (meetSmith === 2) {
            return; // 强制触发铁匠大师，跳过后续逻辑
        }
        
        // 记录是否满状态（用于判断是否给NOTIRED buff）
        const fullStamina = this.prop.curStamina >= 100 && !this.prop.haveBuff(BuffNo.SICK);
        
        // 检查史莱姆袭击（mustFlag==1 强制触发，否则随机，且meetSmith==0才触发）
        if (!meetSmith && this._checkTecmoRaid(mustFlag === 1)) {
            return;
        }
        
        // 随从好感度提升
        if (this.prop.follower && !this.prop.follower.isMaxRelationship()) {
            this.addChat(`你和${this.prop.follower.name}一起泡了温泉`);
            const relationUp = this.prop.haveBuff(BuffNo.PERFUME) ? 8 : 4;
            this.prop.follower.relationshipUp(relationUp);
        }
        
        // 温泉效果（addBuff内部会显示绿色buff信息）
        this.addChat('温泉浴抚平了你的疲劳和伤痛');
        this.prop.addBuff(BuffNo.SPA, this.board._round + 1);
        this.prop.removeAllDebuffs();
        this.prop.fullRestore();  // 完全恢复（生命+耐力）
        this.runningStat.nostayRound = 0;
        
        this.runningStat.springCount++;
        
        // 每3次泡温泉增加负重
        if (this.runningStat.springCount % 3 === 0) {
            this.addGreenChat('经常泡温泉改善了你的体质，负重+10');
            this.prop._maxWeight += 10;
            this.prop._recalculateAttributes();
        } else if (fullStamina) {
            this.addChat('你感觉自己有用不完的精力');
            this.prop.addBuff(BuffNo.NOTIRED, this.board._round + 1);
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 检查温泉偷窥事件
     * 对应 AS3: checkSpringPeep()
     * @returns {boolean} true=触发了事件，false=未触发
     */
    _checkSpringPeep() {
        if (RandomUtils.percent(5)) {  // 优化：5%概率温泉偷窥
            this.addChat('你正泡着温泉，忽然看到有个身影偷窥过来');
            
            if (this.prop.follower) {
                this.addChat(`${this.prop.follower.name}发现后大怒，一个飞镖射了过去`);
                this.addChat('只听"嗷"的一声惨叫，偷窥者夹着尾巴逃走了');
                
                if (!this.prop.follower.isMaxRelationship()) {
                    this.prop.follower.relationshipUp(5);
                    this.addChat(`${this.prop.follower.name}保护了你，好感度+5`);
                }
            } else {
                this.addChat('你感到十分羞耻，赶紧离开了温泉');
                this.addRedChat('你因受惊吓而损失了10点生命');
                this.prop.takeDamage(10);
            }
            
            this.board.roundEnd();
            return true;
        }
        return false;
    },
    
    /**
     * 检查遇到铁匠大师
     * 对应 AS3: checkMeetSmithMaster(mustFlag)
     * @param {boolean} mustFlag - 是否强制触发
     * @returns {number} 0=未触发，2=触发
     */
    // 检查铁匠大师事件 - V1.0.6: 只能通过喝酒线索触发（特殊NPC）
    _checkMeetSmithMaster(mustFlag) {
        // V1.0.6: 只能通过线索触发，不再随机
        const hasClue = this.rumorSystem && this.rumorSystem.hasClue(RumorSystem.CLUE_TYPES.SMITH_MASTER);
        
        if (hasClue || mustFlag) {  // 特殊NPC：只能通过线索或强制触发
            mustFlag = true;
        }
        
        if (mustFlag) {
            // V1.0.6: 线索触发提示
            if (hasClue) {
                this.addGreenChat('【 线索触发 】');
                this.addChat('你想起酒馆打听到的消息，铁匠大师果然在这里！');
                this.rumorSystem.useClue(RumorSystem.CLUE_TYPES.SMITH_MASTER);
            }
            
            this.lastFlag.lastMetSmithLap = this.board._lapCount;
            this.addChat('你偶遇隐居于此的老铁匠，你们共浴一池坦诚相见，你在他身上学到了很多知识');
            this.prop.addBuff(BuffNo.MASTER_SMITH, this.board._round + 1);
            DiaryPanel.getInstance().addDiary('你偶遇隐居老铁匠，在他身上学到知识');
            
            // 检查是否有足够的材料来锻造
            if (this.prop.enoughStuffToSmith()) {
                this.addChat('你身上材料充足，铁匠建议你去城镇锻造装备');
            }
            
            this.board.roundEnd();
            return 2; // 返回2表示强制触发，跳过后续逻辑
        }
        
        return 0;
    },
    
    /**
     * 检查史莱姆袭击温泉事件
     * 对应 AS3: checkTecmoRaid(mustFlag)
     * @param {boolean} mustFlag - 是否强制触发
     * @returns {boolean} true=触发了事件，false=未触发
     */
    // 珍兽袭击（温泉史莱姆）- 野生Boss，保持原有随机逻辑
    _checkTecmoRaid(mustFlag) {
        if (!mustFlag && RandomUtils.percent(10)) {  // 10%概率触发
            mustFlag = true;
        }
        
        if (mustFlag) {
            this.addChat('你正泡着温泉，突然一大群史莱姆冲了过来，它们似乎也想泡温泉，但看到你后立刻变得凶恶起来');
            
            const enemy = Enemy.createWithLevelOffset(this.prop.level, 0, Enemy.NORMAL, 0, false);
            enemy.name = '史莱姆群';
            
            this.startBattleWith(enemy, {
                onWin: () => {
                    const goldGain = Math.max(5, this.prop.level) * 10;
                    this.rewardAfterBattle({
                        gold: goldGain,
                        greenMessage: `你击败了史莱姆群，获得${goldGain}金钱`
                    });
                },
                onLose: () => {
                    this.addRedChat('你被史莱姆群打败了');
                }
            });
            
            return true;
        }
        
        return false;
    },
    
    /**
     * 家休息事件（完整版）
     * 对应 AS3: sleep()
     */
    /**
     * 在家休息（完全恢复）
     * V1.0.5: 移除内部的 roundEnd() 调用，由调用方统一控制
     */
    sleep() {
        if (this.board._isNight) {
            // 夜晚休息
            if (this._checkWifeAtHome() || (this.prop.follower && this.prop.follower.married)) {
                this.addChat('滚了一夜的床单你感到心满意足');
                this.prop.addBuff(BuffNo.SATISFIED, this.board._round + 1);
            } else {
                this.addChat('经过一夜的休息你感到精神饱满');
                this.prop.addBuff(BuffNo.ENERGY, this.board._round + 1);
            }
            this.prop.fullRestore();  // 完全恢复（生命+耐力）
        } else {
            // 白天休息
            if (this._checkWifeAtHome() || (this.prop.follower && this.prop.follower.married)) {
                this.addChat('光天白日虽不能行那羞羞之事，但有娇妻马杀鸡也足够驱除你的疲劳');
                this.prop.addBuff(BuffNo.ENERGY, this.board._round + 1);
            } else {
                this.addChat('经过休息你恢复了精神');
            }
            this.prop.fullRestore();  // 完全恢复（生命+耐力）
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        this.runningStat.nostayRound = 0;
        
        // V1.0.5: 不再调用 roundEnd()，由 prepareNextRound() 统一控制
    },
    
    /**
     * 检查妻子是否在家
     * 对应 AS3: Marriage.getInstance().checkWifeAtHome(this)
     * @returns {boolean}
     */
    _checkWifeAtHome() {
        return Marriage.getInstance().checkWifeAtHome(this);
    }
};


