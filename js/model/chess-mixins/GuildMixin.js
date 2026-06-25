/**
 * 公会系统 Mixin
 * 从 Chess.js 拆分出的公会相关方法
 * 包含：天赋学习、勇者修行（5种训练）等
 * 
 * 拆分日期：2025-11-14
 */

const GuildMixin = {
    /**
     * 公会事件（Stage 5）
     * 对应 AS3: triggerGuild()
     */
    triggerGuild() {
        this.addChat('到达勇者公会，这里聚集着来自各地的勇者');
        
        // 检查是否有待领取的遗物
        if (this.prop.undrawRelic > 0) {
            this.addGreenChat('你在勇者岗位上的突出贡献应得到嘉奖，名声+30');
            this.prop.addFame(30);
            
            // 领取所有未领取的遗物
            while (this.prop.undrawRelic > 0) {
                const relic = Relic.getInstance().getRandomRelic(1);
                if (this.prop.addRelic(relic)) {
                    DiaryPanel.getInstance().addDiary(
                        `你因在勇者岗位上的突出贡献而获奖励${relic.colorName}`,
                        true
                    );
                }
                this.prop.undrawRelic--;
            }
            
            if (this._panel) {
                this._panel.updateUI();
            }
            this.board.roundEnd();
            return;
        }
        
        // 检查是否可以学习天赋（每5级1个天赋）
        const availableTalent = Math.floor(this.prop.level / 5);
        const unlockedTalent = this.talent.getUnlockedNo();
        
        // 构建选项
        const choices = [];
        const labels = [];
        
        if (availableTalent > unlockedTalent) {
            const fee = this.talent.countTalentFee(availableTalent, unlockedTalent);
            choices.push('learn');
            labels.push(`学习新天赋（${fee}金）`);
        }
        
        // V1.0.6: 训练需要付费
        const trainFee = this.prop.level * 50;
        choices.push('train');
        labels.push(`勇者修行（${trainFee}金）`);
        
        choices.push('diary');
        labels.push('查阅勇者事迹');
        
        choices.push('walk');
        labels.push('继续前进');
        
        // 使用内嵌链接方式（原版风格）
        this.board.chatPanel.addInlineOptions(
            '你打算干什么呢？',
            choices,
            labels,
            (choice) => {
                if (choice === 'learn') {
                    this._learnTalent();
                } else if (choice === 'train') {
                    this._trainAtGuild();
                } else if (choice === 'diary') {
                    DiaryPanel.getInstance().show(1, false);
                    // roundEnd() 将在日志关闭时自动调用
                } else if (choice === 'walk') {
                    this._handleForwardChoice('walk', false);
                }
            }
        );
    },
    
    /**
     * 学习天赋（Stage 5）
     */
    _learnTalent() {
        const availableTalent = Math.floor(this.prop.level / 5);
        const unlockedTalent = this.talent.getUnlockedNo();
        
        if (availableTalent === unlockedTalent) {
            this.addChat('你急着想学习新天赋可等级还没到');
            this.board.roundEnd();
            return;
        }
        
        const fee = this.talent.countTalentFee(availableTalent, unlockedTalent);
        
        if (this.prop.gold < fee) {
            this.addChat('你迫切想学到新天赋可钱却不够');
            this.board.roundEnd();
            return;
        }
        
        // 支付费用
        this.prop.reduceGold(fee);
        this.addChat(`你支付了学习费用，金钱-${fee}`);
        
        // 解锁所有可学习的天赋
        for (let i = unlockedTalent + 1; i <= availableTalent; i++) {
            this.talent.unlockTalent(i);
            this.addGreenChat(`你习得了新的天赋：【${this.talent.getTalentName(i)}】`);
        }
        
        this.finishAction();
    },
    
    /**
     * 公会修行
     * V1.0.6: 需要支付训练费用（等级×50金）
     */
    _trainAtGuild() {
        // V1.0.6: 计算训练费用
        const trainFee = this.prop.level * 50;
        
        // 检查金钱
        if (this.prop.gold < trainFee) {
            this.addChat(`训练费用不足，需要${trainFee}金`);
            this.board.roundEnd();
            return;
        }
        
        // 检查耐力
        if (!this.prop.hasEnoughStamina()) {
            this.addChat('你的耐力不足以进行修行');
            this.board.roundEnd();
            return;
        }
        
        // 支付训练费用
        this.prop.reduceGold(trainFee);
        this.addChat(`你支付了训练费用，金钱-${trainFee}`);
        
        // 消耗耐力（20%）
        this.prop.consumeStamina(Math.floor(this.prop.maxStamina * 0.2));
        
        // 随机训练类型（0-4）
        let trainType = RandomUtils.randInt(0, 4);
        
        // 夜晚时反转随机数（夜晚更容易触发属性训练）
        if (this.board._isNight) {
            trainType = 4 - trainType;
        }
        
        // 根据类型执行不同训练
        switch (trainType) {
            case 1:
                this._weightTrain();  // 负重训练
                break;
            case 2:
                this._meditationTrain();  // 冥想训练
                break;
            case 3:
                this._beatingTrain();  // 抗击打训练
                break;
            case 4:
                this._attackTrain();  // 剑技训练
                break;
            default:
                // 基础站桩训练（类型0）
                this._basicTrain();
                break;
        }
    },
    
    /**
     * 检查是否有妻子帮助
     * @returns {boolean}
     */
    _haveWifeHelp() {
        // 检查妻子是否在家，或随从是否已婚
        if (Marriage.getInstance().checkWifeAtHome(this)) {
            return true;
        }
        if (this.prop.follower && this.prop.follower.married) {
            return true;
        }
        return false;
    },
    
    /**
     * 基础站桩训练
     */
    _basicTrain() {
        let expGain = this.prop.level * 5;
        
        this.addChat('你使用训练假人练习站桩输出');
        
        // 检查妻子帮助
        if (Marriage.getInstance().canHelpTrain(this)) {
            this.addChat(`有身经百战的${Marriage.getInstance().wifeName}从旁指定，进步明显`);
            expGain *= 3;
        }
        
        // 创建训练假人（无攻击力的敌人）
        const dummy = new Enemy(this.prop.level, Enemy.NORMAL, 3);
        dummy.attack = 0;
        dummy.alias = '训练假人';
        dummy.exp = 0;      // 训练假人不给经验
        dummy.gold = 0;     // 训练假人不给金钱
        dummy.fame = 0;     // 训练假人不给名声
        dummy.stuff = 0;    // 训练假人不给材料
        dummy.rarestuff = 0;
        dummy.rubbish = 0;
        dummy.nostuff = true;  // 标记为无材料
        
        // 战斗（不显示战斗面板，直接计算结果）
        if (!this.battleManager) {
            this.battleManager = new BattleManager(this);
        }
        const result = this.battleManager.battleWith(dummy);
        
        // V1.0.6: 耐力已在_trainAtGuild统一消耗
        
        // 胜利则经验翻倍
        if (result === 1) {
            expGain *= 2;
        }
        
        this.addGreenChat(`经验+${expGain}`);
        this.prop.addExp(expGain);
        
        // 检查随从技能升级
        if (this.prop.follower && this.prop.follower.checkUpgradeSkill()) {
            this.addGreenChat('随从的技能等级提升了');
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 冥想训练
     */
    _meditationTrain() {
        this.addChat('你进入练功房开始冥想训练，杂念玩蛋去吧如此反复念叨数遍，你的身体便浮起来了');
        this.addGreenChat('你距离无欲无求又进一步，生命+100');
        
        this.prop._baseMaxLife += 100;
        this.prop._recalculateAttributes();
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 抗击打训练
     */
    _beatingTrain() {
        let defGain = 5;
        
        this.addChat('你进入练功房开始抗击打训练');
        
        if (this._haveWifeHelp()) {
            defGain = 10;
            this.addChat('在妻子帮助下你修炼了被人鞭打术，反复练至身体发生变化，你感觉效果拔群');
        } else {
            this.addChat('在小伙伴帮助下你修炼了金裆不坏，反复练至身体发生变化，你感觉效果一般');
        }
        
        this.addGreenChat(`你的身体变得更硬实了，防御+${defGain}`);
        
        this.prop._baseDefense += defGain;
        this.prop._recalculateAttributes();
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 负重训练
     */
    _weightTrain() {
        let weightGain = 10;
        
        this.addChat('你进入练功房开始腹肌训练');
        
        if (this._haveWifeHelp()) {
            weightGain = 20;
            this.addChat('在妻子陪同下你练习了俯卧操，如此反复数十次，你感觉效果拔群');
        } else {
            this.addChat('你埋头苦练仰卧起坐接后滚翻，如此反复数十次，你感觉效果一般');
        }
        
        this.addGreenChat(`你的腹肌又多了一块，负重+${weightGain}`);
        
        this.prop._maxWeight += weightGain;
        this.prop._recalculateAttributes();
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 剑技训练
     */
    _attackTrain() {
        let atkGain = 10;
        
        this.addChat('你进入练功房开始剑技训练');
        
        if (this._haveWifeHelp()) {
            atkGain = 20;
            this.addChat('你与妻子配合练习了郎情妾意剑，连续刺了十多回合，你感觉效果拔群');
        } else {
            this.addChat('你左右手配合练习了黯然销魂剑，连续耍了十多回合，你感觉效果一般');
        }
        
        this.addGreenChat(`你的剑技又精进了，攻击+${atkGain}`);
        
        this.prop._baseAttack += atkGain;
        this.prop._recalculateAttributes();
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    }
};

