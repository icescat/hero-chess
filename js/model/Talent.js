/**
 * 天赋系统
 * 对应 AS3: csh.model.ChessTalent
 * 
 * 功能：
 * 1. 21个天赋管理
 * 2. 天赋学习和解锁
 * 3. 战斗效果触发
 * 4. 遗物加成集成
 */

class Talent {
    // 天赋编号常量
    static DEFENSE = 0;           // 防御
    static CRITICAL = 1;          // 暴击
    static DODGE = 2;             // 闪避
    static ACCURATE = 3;          // 精准
    static COUNTER = 4;           // 反击
    static EXPOSEARMOR = 5;       // 破甲
    static COMBOATTACK = 6;       // 连击
    static EXECUTE = 7;           // 斩杀
    static STA_TO_HP = 8;         // 耐力分流
    static PURSUIT = 9;           // 乘胜追击
    static FURY = 10;             // 狂怒
    static WUSUO = 11;            // 奥义
    static AWAKEN = 12;           // 觉醒
    static DEFENSE2 = 13;         // 专家防御
    static CRITICAL2 = 14;        // 专家暴击
    static DODGE2 = 15;           // 专家闪避
    static EXPOSEARMOR2 = 16;     // 专家破甲
    static COMBOATTACK2 = 17;     // 专家连击
    static EXECUTE2 = 18;         // 专家斩杀
    static TALK = 19;             // 嘴炮
    static MONEY_ATK = 20;        // 一掷千金
    
    // 静态数据
    static talentNames = [
        '防御', '暴击', '闪避', '精准', '反击', '破甲', '连击', '斩杀',
        '耐力分流', '乘胜追击', '狂怒', '奥义', '觉醒',
        '专家防御', '专家暴击', '专家闪避', '专家破甲', '专家连击', '专家斩杀',
        '嘴炮', '一掷千金'
    ];
    
    static talentIntros = [
        '一定几率降低所受伤害',
        '一定几率造成双倍伤害',
        '一定几率避开敌人攻击',
        '提高基础命中率',
        '防御或闪避敌人攻击后可发起反击',
        '一定几率使攻击忽略敌人护甲',
        '一定几率发动额外攻击',
        '一定几率重创濒死敌人',
        '濒死时有几率用耐力换生命',
        '连续战斗时会在战前回少量生命',
        '一定几率攻击暴涨，防御和命中降低',
        '一定几率发动超强力攻击',
        '濒死时有几率攻击和防御激增',
        '更高几率降低所受伤害',
        '更高几率造成双倍伤害',
        '更高几率避开敌人攻击',
        '更多几率使攻击忽略敌人护甲',
        '更高几率发动额外攻击',
        '更高几率重创濒死敌人',
        '满嘴放炮来打击敌人心智',
        '大把砸钱来伤害敌人自尊'
    ];
    
    constructor() {
        // 天赋解锁状态（默认第0个天赋已解锁）
        this.talents = [true];
        
        // 遗物加成
        this.relicsBonus = {
            defendrate: 0,
            hitrate: 0,
            critical: 0,
            dodge: 0,
            exposerate: 0,
            comborate: 0,
            executerate: 0
        };
        
        // 天赋属性
        this.defendrate = 0.3;           // 防御率
        this.critical = 0;               // 暴击率
        this.actualCritical = 0;
        this.dodge = 0;                  // 闪避率
        this.actualDodge = 0;
        this.hitrate = 0.85;             // 命中率
        this.actualHitrate = 0.85;
        this.exposerate = 0;             // 破甲率
        this.comborate = 0;              // 连击率
        this.executerate = 0;            // 斩杀率
        this.wusuorate = 0;              // 奥义率
        this.wusuocd = 0;                // 奥义CD
        this.extraWusuorate = 0;         // 额外奥义率
        this.skillrate = 0;              // 技能触发率（狂怒）
        this.lastRoundLapse = 0;         // 上次战斗回合
        this.extraAwakerate = 0;         // 额外觉醒率
        this.talkrate = 0;               // 嘴炮率
        this.moneyrate = 0;              // 金钱攻击率
        
        // 状态标志
        this.isFuring = false;           // 是否狂怒中
        this.isAwaking = false;          // 是否觉醒中
        this.dodged = false;             // 本回合是否闪避
        this.defensed = false;           // 本回合是否防御
        this.durationStartRound = 0;     // 持续效果开始回合
        
        // 倍率
        this.atkMul = 1;                 // 攻击倍率
        this.defMul = 1;                 // 防御倍率
        
        // 已解锁天赋数量（不含TALK和MONEY_ATK）
        this.unlockedNo = 0;
        
        // 分页
        this.numPerPage = 10;
        
        console.log('[Talent] 天赋系统已初始化');
    }
    
    /**
     * 获取已解锁天赋数量
     */
    getUnlockedNo() {
        return this.unlockedNo;
    }
    
    /**
     * 获取已解锁天赋数组（包含特殊天赋）
     */
    getUnlockedNoArr() {
        const arr = [this.unlockedNo];
        if (this.talents[Talent.TALK]) {
            arr.push(Talent.TALK);
        }
        if (this.talents[Talent.MONEY_ATK]) {
            arr.push(Talent.MONEY_ATK);
        }
        return arr;
    }

    /**
     * 从存档数组恢复天赋数据（与 getUnlockedNoArr 对称）
     * @param {Array} arr - getUnlockedNoArr 返回的数组
     */
    loadArr(arr) {
        if (!arr || !arr.length) return;
        const targetNo = arr[0] || 0;
        // 重置到初始状态
        this.talents = [true];
        this.unlockedNo = 0;
        // 逐个解锁到目标等级（unlockTalent 会应用天赋效果）
        for (let i = 1; i <= targetNo; i++) {
            if (i < Talent.talentNames.length) {
                this.unlockTalent(i);
            }
        }
        // 特殊天赋
        if (arr.indexOf(Talent.TALK) !== -1) {
            this.unlockTalent(Talent.TALK);
        }
        if (arr.indexOf(Talent.MONEY_ATK) !== -1) {
            this.unlockTalent(Talent.MONEY_ATK);
        }
    }
    
    /**
     * 获取天赋名称
     */
    getTalentName(talentNo) {
        return Talent.talentNames[talentNo];
    }
    
    /**
     * 检查是否拥有天赋
     */
    haveTalent(talentNo) {
        return this.talents[talentNo] === true;
    }
    
    /**
     * 计算学习天赋的费用
     * @param {number} targetNo 目标天赋等级
     * @param {number} currentNo 当前天赋等级
     */
    countTalentFee(targetNo, currentNo) {
        let fee = 0;
        for (let i = currentNo + 1; i <= targetNo; i++) {
            fee += i * 500;
        }
        return fee;
    }
    
    /**
     * 解锁天赋
     * @param {number} talentNo 天赋编号
     */
    unlockTalent(talentNo) {
        if (this.talents[talentNo] === true) {
            return;
        }
        
        this.talents[talentNo] = true;
        
        // 应用天赋效果
        switch (talentNo) {
            case Talent.CRITICAL:
                this.critical = this.actualCritical = 0.2;
                break;
            case Talent.DODGE:
                this.dodge = this.actualDodge = 0.2;
                break;
            case Talent.ACCURATE:
                this.hitrate = this.actualHitrate = 0.95;
                break;
            case Talent.EXPOSEARMOR:
                this.exposerate = 0.2;
                break;
            case Talent.COMBOATTACK:
                this.comborate = 0.2;
                break;
            case Talent.EXECUTE:
                this.executerate = 0.2;
                break;
            case Talent.FURY:
                this.skillrate = 0.3;
                break;
            case Talent.WUSUO:
                this.wusuorate = 0.3;
                break;
            case Talent.DEFENSE2:
                this.defendrate = 0.6;
                break;
            case Talent.CRITICAL2:
                this.critical = this.actualCritical = 0.4;
                break;
            case Talent.DODGE2:
                this.dodge = this.actualDodge = 0.4;
                break;
            case Talent.EXPOSEARMOR2:
                this.exposerate = 0.4;
                break;
            case Talent.COMBOATTACK2:
                this.comborate = 0.4;
                break;
            case Talent.EXECUTE2:
                this.executerate = 0.4;
                break;
            case Talent.TALK:
                this.talkrate = 0.3;
                break;
            case Talent.MONEY_ATK:
                this.moneyrate = 0.3;
                break;
        }
        
        // 特殊天赋不计入unlockedNo
        if (talentNo !== Talent.TALK && talentNo !== Talent.MONEY_ATK) {
            this.unlockedNo++;
        }
        
        console.log('[Talent] 解锁天赋: ' + Talent.talentNames[talentNo]);
    }
    
    /**
     * 检查遗物加成
     * @param {Object} relic 遗物对象
     */
    checkRelicBonus(relic) {
        for (let key in this.relicsBonus) {
            if (relic[key]) {
                this.relicsBonus[key] = relic[key];
            }
        }
    }
    
    /**
     * 检查是否触发防御
     */
    canDefense() {
        if (RandomUtils.chance(this.defendrate + this.relicsBonus.defendrate)) {  // 优化：格挡概率
            this.defensed = true;
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否触发暴击
     */
    canCritical() {
        return RandomUtils.chance(this.actualCritical + this.relicsBonus.critical);  // 优化：暴击概率
    }
    
    /**
     * 检查是否触发闪避
     */
    canDodge() {
        if (RandomUtils.chance(this.actualDodge + this.relicsBonus.dodge)) {  // 优化：闪避概率
            this.dodged = true;
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否命中
     */
    canHit() {
        return RandomUtils.chance(this.actualHitrate + this.relicsBonus.hitrate);  // 优化：命中概率
    }
    
    /**
     * 检查是否触发反击
     */
    canCounter() {
        if (this.talents[Talent.COUNTER] === true && (this.defensed || this.dodged)) {
            this.defensed = this.dodged = false;
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否触发破甲
     */
    canExposeArmor() {
        return Math.random() > 1 - this.exposerate - this.relicsBonus.exposerate;
    }
    
    /**
     * 检查是否触发连击
     */
    canCombo() {
        return Math.random() > 1 - this.comborate - this.relicsBonus.comborate;
    }
    
    /**
     * 检查是否触发斩杀
     */
    canExecute() {
        return Math.random() > 1 - this.executerate - this.relicsBonus.executerate;
    }
    
    /**
     * 检查是否触发奥义
     */
    canWusuo() {
        if (this.wusuocd !== 0) {
            this.wusuocd--;
            return false;
        }
        
        if (this.talents[Talent.WUSUO] && Math.random() > 1 - this.wusuorate - this.extraWusuorate) {
            this.wusuocd = 5;
            this.extraWusuorate = 0;
            return true;
        }
        
        this.extraWusuorate += 0.1;
        return false;
    }
    
    /**
     * 检查持续效果天赋（战斗开始时调用）
     * @param {number} currentRound 当前回合
     * @param {Object} stat 战斗统计
     */
    checkDurationTalent(currentRound, stat) {
        this.defensed = this.dodged = false;
        
        // 检查持续效果是否结束（3回合）
        if (this.durationStartRound !== 0 && currentRound - this.durationStartRound >= 3) {
            this.durationStartRound = 0;
            if (this.isFuring) {
                this.isFuring = false;
                this.atkMul = 1;
                this.defMul = 1;
                this.actualHitrate = this.hitrate;
            }
            return;
        }
        
        // 检查是否触发新的持续效果
        if (this.durationStartRound === 0) {
            // 狂怒
            if (this.talents[Talent.FURY] && Math.random() > 1 - this.skillrate) {
                this.isFuring = true;
                this.atkMul = 2.5;
                this.defMul *= 0.8;
                this.actualHitrate *= 0.8;
                this.durationStartRound = currentRound;
                if (stat) {
                    stat.fury = (stat.fury || 0) + 1;
                }
            }
        }
    }
    
    /**
     * 重置持续效果天赋（战斗结束时调用）
     */
    resetDurationTalent() {
        this.lastRoundLapse = window.game ? window.game._chessboard._round : 0;
        this.defensed = this.dodged = false;
        this.durationStartRound = 0;
        this.isFuring = false;
        this.isAwaking = false;
        this.actualCritical = this.critical;
        this.actualDodge = this.dodge;
        this.actualHitrate = this.hitrate;
        this.atkMul = this.defMul = 1;
    }
    
    /**
     * 耐力分流（濒死时用耐力换生命）
     * @param {ChessProperty} prop 属性对象
     */
    staminaToLife(prop) {
        if (this.talents[Talent.STA_TO_HP]) {
            if (Math.random() > 0.7 && prop.curStamina >= 10) {
                prop.curStamina -= 10;
                prop.heal(1000);
                return true;
            }
        }
        return false;
    }
    
    /**
     * 乘胜追击（连续战斗回复生命）
     * @param {ChessProperty} prop 属性对象
     */
    victoryPursuit(prop) {
        if (this.talents[Talent.PURSUIT]) {
            const currentRound = window.game ? window.game._chessboard._round : 0;
            if (currentRound - this.lastRoundLapse === 1) {
                prop.heal(Math.floor(prop.maxLife * 0.2));
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检查觉醒（濒死时攻防激增）
     * @param {number} round 当前战斗回合
     * @param {ChessProperty} prop 属性对象
     */
    checkAwake(round, prop) {
        if (this.isAwaking) {
            return false;
        }
        
        if (round > 10 && this.talents[Talent.AWAKEN]) {
            if (Math.random() > 0.7 - this.extraAwakerate && prop._isNearDeath()) {
                this.isAwaking = true;
                this.atkMul *= 4;
                this.defMul *= 4;
                this.actualHitrate = Math.max(1, this.hitrate);
                this.extraAwakerate = 0;
                return true;
            }
        }
        
        this.extraAwakerate += 0.1;
        return false;
    }
    
    /**
     * 检查嘴炮攻击
     * @param {Chess} chess 棋子对象
     * @returns {number} 0-3：不同效果，-1：未触发
     */
    checkTalkAttack(chess) {
        if (Math.random() > 1 - this.talkrate) {
            chess.addChat('你施放嘴炮对敌人晓之以理动之以情');
            
            const result = Math.floor(Math.random() * 4);
            if (result === 1) {
                chess.addChat('敌人明显感到动摇，破绽百出');
            } else if (result === 2) {
                chess.addChat('敌人深受触动，主动自我了断');
            } else if (result === 3) {
                chess.addChat('敌人却被你的唧唧歪歪给激怒了');
            } else {
                chess.addChat('敌人不为所动，对你投以怜悯的眼神');
            }
            
            return result;
        }
        return -1;
    }
    
    /**
     * 检查金钱攻击
     * @param {ChessProperty} prop 属性对象
     * @returns {number} 伤害值（0表示未触发）
     */
    checkMoneyAttack(prop) {
        if (Math.random() > 1 - this.moneyrate && prop.gold > 10000) {
            const damage = 1000 + Math.round(Math.random() * 9000);
            prop.reduceGold(damage);
            return damage;
        }
        return 0;
    }
    
    /**
     * 打印已解锁天赋列表
     * @param {number} page 页码
     */
    printTalents(page = 0) {
        let result = '';
        let count = 0;
        const maxCount = this.numPerPage;
        
        for (let i = 0; i < this.talents.length; i++) {
            if (this.talents[i]) {
                result += Talent.talentNames[i] + '：';
                result += Talent.talentIntros[i] + '<br>';
                count++;
                if (count >= maxCount) {
                    break;
                }
            }
        }
        
        return result;
    }
    
    /**
     * 是否需要翻页
     */
    needTurnPage() {
        return this.unlockedNo >= this.numPerPage;
    }
    
    /**
     * 销毁
     */
    dispose() {
        this.talents = null;
        this.relicsBonus = null;
    }
}


