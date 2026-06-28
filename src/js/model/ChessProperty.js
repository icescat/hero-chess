/**
 * ChessProperty - 玩家属性管理类
 * 现代化重写版本 (V1.0.4)
 * 
 * 职责：
 * - 基础属性管理（等级、经验、金钱、生命、攻击、防御等）
 * - Buff系统
 * - 装备系统
 * - 遗物系统
 * - 任务系统
 * - 随从/坐骑系统
 * - 材料/负重系统
 * 
 * 设计原则：
 * 1. 使用现代JavaScript特性（ES6+）
 * 2. Map/Set代替数组查找
 * 3. 统一的属性计算
 * 4. 链式调用支持
 * 5. 代码简洁优雅
 */

class ChessProperty {
    // ========== 属性类型常量 ==========
    
    static STAT = {
        LIFE: 'life',
        ATTACK: 'attack',
        DEFENSE: 'defense',
        STAMINA: 'stamina',
        WEIGHT: 'weight'
    };
    
    // ========== 构造函数 ==========
    
    constructor(chess, gameCleared = 0) {
        this.chess = chess;
        this.gameCleared = gameCleared;  // 通关次数
        
        // 基础属性
        this._level = 1;
        this._exp = 0;
        this._maxLevel = GameConstants.MAX_LEVEL;
        this._extraLevel = 0;  // 巅峰等级（超过最大等级后的额外等级）
        this._gold = GameConstants.STARTING_GOLD;  // 使用统一常量
        this._fame = 0;
        
        // 战斗属性（基础值）
        this._baseMaxLife = GameConstants.STARTING_LIFE;
        this._baseAttack = GameConstants.STARTING_ATTACK;
        this._baseDefense = GameConstants.STARTING_DEFENSE;
        
        // 当前状态
        this._maxLife = this._baseMaxLife;  // 计算后的最大生命
        this._attack = this._baseAttack;    // 计算后的攻击
        this._defense = this._baseDefense;  // 计算后的防御
        this._curLife = this._baseMaxLife;
        this._curStamina = GameConstants.STARTING_STAMINA;
        this._isDead = false;
        
        // 耐力相关
        this._maxStamina = GameConstants.STARTING_STAMINA;
        this._staConsume = GameConstants.STAMINA_CONSUME_BASE;
        this._actualStaConsume = GameConstants.STAMINA_CONSUME_BASE;
        this._walkStaReduce = 0;  // 步行耐力减免（天赋15）
        this._rideStaReduce = 0;  // 骑行耐力减免（天赋16）
        
        // 材料和负重
        this._stuff = 0;
        this._rarestuff = 0;
        this._rubbish = 0;
        this._curWeight = 0;
        this._maxWeight = GameConstants.MAX_WEIGHT;
        this._bank = [0, 0];  // [基础材料, 稀有材料]
        this._bankLimit = GameConstants.BANK_LIMIT;
        this._overWeight = false;
        this._stuffBankTriggered = false;
        
        // 背包系统
        this._bagLevel = 1;  // 背包等级（1-6）
        this._bagWeight = 50; // 背包提供的额外负重（粗布包+50）
        
        // Buff系统（使用Map优化查找）
        this._buffs = new Map();  // key: buffNo, value: ChessBuff
        
        // 装备系统
        this._equips = Equips.getInstance();  // 装备系统引用
        this._weapon = null;
        this._armor = null;
        this._maxEquipNo = 0;
        
        // 遗物系统（使用Set优化查找）
        this._relics = new Set();  // Set<relicNo>
        this._relicList = [];  // 保留数组用于遍历
        this._undrawRelic = 0;  // 未抽取的遗物
        this._forgeBonus = 0;  // 锻造成功率加成（遗物11）
        
        // 任务系统
        this._quests = [];
        this._maxQuests = GameConstants.MAX_QUESTS;
        
        // 随从系统
        this._follower = null;
        this._oldFollowers = [];
        
        // 坐骑系统
        this._mount = null;
        
        // 回合计数
        this._currentRound = 1;
        
        // 计算缓存（优化性能）
        this._statCache = {};
        this._cacheValid = false;
        
        // 初始化
        this._initialize();
    }
    
    _initialize() {
        console.log('[ChessProperty] 初始化玩家属性');
        
        // 通关次数加成
        if (this.gameCleared > 0) {
            this._baseMaxLife += this.gameCleared * 10;
            this._baseAttack += this.gameCleared * 2;
            this._baseDefense += this.gameCleared * 2;
            console.log(`[ChessProperty] 通关加成 x${this.gameCleared} - 生命+${this.gameCleared * 10} 攻击+${this.gameCleared * 2} 防御+${this.gameCleared * 2}`);
        }
        
        // 初始装备
        this._weapon = this._equips.cloneEquip(0, true);   // 初始武器：看得见剑
        this._armor = this._equips.cloneEquip(0, false);   // 初始护甲：看得见甲
        
        // 重新计算属性
        this._recalculateAll();
        
        // 完全恢复生命和耐力
        this._curLife = this.actualLife;
        this._curStamina = this.actualStamina;
        
        console.log('[ChessProperty] 属性初始化完成');
    }
    
    // ========== 基础属性 Getters/Setters ==========
    
    get level() {
        return this._level;
    }
    
    get exp() {
        return this._exp;
    }
    
    get gold() {
        return this._gold;
    }
    
    get fame() {
        return this._fame;
    }
    
    set fame(value) {
        this._fame = Math.max(0, value);
    }
    
    // 兼容旧版属性名
    get maxLife() {
        return this.actualLife;
    }
    
    get stamina() {
        return this._curStamina;
    }
    
    get maxStamina() {
        return this.actualStamina;
    }
    
    get attack() {
        return this.actualAttack;
    }
    
    get defense() {
        return this.actualDefense;
    }
    
    get isDead() {
        return this._isDead || this._curLife <= 0;
    }
    
    get curStamina() {
        return this._curStamina;
    }
    
    set curStamina(value) {
        this._curStamina = Math.max(0, Math.min(this._maxStamina, value));
    }
    
    // 当前生命值
    get curLife() {
        return this._curLife;
    }
    
    set curLife(value) {
        this._curLife = Math.max(0, Math.min(this.actualLife, value));
        // 重置死亡标志（如果生命恢复）
        if (this._curLife > 0) {
            this._isDead = false;
        }
    }
    
    // ========== 计算属性（含Buff/装备/遗物加成）==========
    
    get actualLife() {
        return this._getStat(ChessProperty.STAT.LIFE);
    }
    
    get actualAttack() {
        return this._getStat(ChessProperty.STAT.ATTACK);
    }
    
    get actualDefense() {
        return this._getStat(ChessProperty.STAT.DEFENSE);
    }
    
    get actualStamina() {
        // 耐力只有基础值和Buff倍率，没有装备/遗物/随从加成
        const buffMul = this._getBuffMultiplier(ChessProperty.STAT.STAMINA);
        return Math.floor(this._maxStamina * (1 + buffMul));
    }
    
    get actualWeight() {
        // 负重 = (基础 + 背包 + 坐骑) * Buff倍率
        const buffMul = this._getBuffMultiplier(ChessProperty.STAT.WEIGHT);
        const mountWeight = this._mount ? this._mount.totalWeight : 0;
        return Math.floor((this._maxWeight + this._bagWeight + mountWeight) * (1 + buffMul));
    }
    
    // 兼容旧版属性名
    get actualAtk() {
        return this.actualAttack;
    }
    
    get actualDef() {
        return this.actualDefense;
    }
    
    get overWeight() {
        return this._overWeight;
    }

    /** 生命值百分比（0-1），供 StateEvaluator 使用 */
    get lifePercent() {
        if (this.actualLife <= 0) return 0;
        return this._curLife / this.actualLife;
    }

    /** 耐力百分比（0-1），供 StateEvaluator 使用 */
    get staminaPercent() {
        if (this.actualStamina <= 0) return 0;
        return this._curStamina / this.actualStamina;
    }

    /** 负重百分比（0-1），供 StateEvaluator 使用 */
    get weightPercent() {
        if (this.actualWeight <= 0) return 0;
        return this._curWeight / this.actualWeight;
    }
    
    // ========== 统一属性计算方法 ==========
    
    /**
     * 统一的属性计算方法
     * @param {string} statType - 属性类型（LIFE/ATTACK/DEFENSE/STAMINA/WEIGHT）
     * @returns {number} 计算后的属性值
     */
    _getStat(statType) {
        // 检查缓存
        if (this._cacheValid && this._statCache[statType] !== undefined) {
            return this._statCache[statType];
        }
        
        // 计算：基础 + 装备 + (基础+装备) * Buff倍率 + 遗物 + 随从 + 坐骑
        const base = this._getBaseStat(statType);
        const equip = this._getEquipBonus(statType);
        const buffMul = this._getBuffMultiplier(statType);
        const relic = this._getRelicBonus(statType);
        const follower = this._getFollowerBonus(statType);
        const mount = this._getMountBonus(statType);
        
        const result = Math.floor((base + equip) * (1 + buffMul) + relic + follower + mount);
        
        // 缓存结果
        this._statCache[statType] = result;
        
        return result;
    }
    
    /**
     * 获取基础属性
     */
    _getBaseStat(statType) {
        switch (statType) {
            case ChessProperty.STAT.LIFE:
                return this._baseMaxLife;
            case ChessProperty.STAT.ATTACK:
                return this._baseAttack;
            case ChessProperty.STAT.DEFENSE:
                return this._baseDefense;
            case ChessProperty.STAT.STAMINA:
                return this._maxStamina;
            case ChessProperty.STAT.WEIGHT:
                return this._maxWeight;
            default:
                return 0;
        }
    }
    
    /**
     * 获取装备加成
     */
    _getEquipBonus(statType) {
        let bonus = 0;
        
        switch (statType) {
            case ChessProperty.STAT.LIFE:
                if (this._armor) {
                    bonus += this._armor.life || 0;
                }
                break;
            case ChessProperty.STAT.ATTACK:
                if (this._weapon) {
                    bonus += this._weapon.attack || 0;
                }
                break;
            case ChessProperty.STAT.DEFENSE:
                if (this._armor) {
                    bonus += this._armor.defense || 0;
                }
                break;
        }
        
        return bonus;
    }
    
    /**
     * 获取Buff倍率加成
     */
    _getBuffMultiplier(statType) {
        let multiplier = 0;
        
        for (const buff of this._buffs.values()) {
            switch (statType) {
                case ChessProperty.STAT.LIFE:
                    multiplier += buff.lifeMul || 0;
                    break;
                case ChessProperty.STAT.ATTACK:
                    multiplier += buff.atkMul || 0;
                    break;
                case ChessProperty.STAT.DEFENSE:
                    multiplier += buff.defMul || 0;
                    break;
                case ChessProperty.STAT.STAMINA:
                    multiplier += buff.staMul || 0;
                    break;
                case ChessProperty.STAT.WEIGHT:
                    multiplier += buff.wgtMul || 0;
                    break;
            }
        }
        
        return multiplier;
    }
    
    /**
     * 获取遗物加成
     */
    _getRelicBonus(statType) {
        // 遗物效果在 addRelic() 中即时处理，不参与属性计算
        return 0;
    }
    
    /**
     * 获取随从加成
     */
    _getFollowerBonus(statType) {
        if (!this._follower) {
            return 0;
        }
        
        switch (statType) {
            case ChessProperty.STAT.ATTACK:
                return this._follower.attack || 0;
            case ChessProperty.STAT.DEFENSE:
                return this._follower.defense || 0;
            case ChessProperty.STAT.LIFE:
                return this._follower.life || 0;
            default:
                return 0;
        }
    }
    
    /**
     * 获取坐骑加成
     */
    _getMountBonus(statType) {
        if (!this._mount) {
            return 0;
        }
        
        switch (statType) {
            case ChessProperty.STAT.ATTACK:
                return this._mount.totalAttack || 0;
            default:
                return 0;
        }
    }
    
    /**
     * 重新计算所有属性（使缓存失效）
     */
    _recalculateAll() {
        this._cacheValid = false;
        this._statCache = {};
        
        // 立即计算一次，填充缓存，并同时更新_maxLife, _attack, _defense
        this._maxLife = this._getStat(ChessProperty.STAT.LIFE);
        this._attack = this._getStat(ChessProperty.STAT.ATTACK);
        this._defense = this._getStat(ChessProperty.STAT.DEFENSE);
        this._getStat(ChessProperty.STAT.STAMINA);
        this._getStat(ChessProperty.STAT.WEIGHT);
        
        this._cacheValid = true;
        
        console.log(`[ChessProperty] 属性重计算 - 攻:${this._attack} 防:${this._defense} 生命:${this._maxLife}`);
    }
    
    /**
     * 重新计算属性（旧版API别名）
     * 用于兼容外部调用
     */
    _recalculateAttributes() {
        this._recalculateAll();
    }
    
    // ========== 经验和等级系统 ==========
    
    /**
     * 添加经验
     * @param {number} amount - 经验值
     * @returns {this}
     */
    addExp(amount) {
        if (amount <= 0) return this;
        
        this._exp += amount;
        console.log(`[Exp] +${amount}，当前: ${this._exp}`);
        
        // 检查升级
        this._checkLevelUp();
        
        return this;
    }
    
    /**
     * 检查是否升级（支持连续升级优化）
     */
    _checkLevelUp() {
        const maxLevel = GameConstants.MAX_LEVEL;
        const startLevel = this._level;
        
        // 累积所有升级的属性增长
        const totalIncreases = {
            life: 0,
            attack: 0,
            defense: 0
        };
        
        // 连续升级（使用总经验判断）
        while (this._level < maxLevel && this._exp >= this._getNextLevelTotalExp()) {
            const increases = this._levelUpOnce();
            totalIncreases.life += increases.life;
            totalIncreases.attack += increases.attack;
            totalIncreases.defense += increases.defense;
        }
        
        // 如果发生了升级，显示消息
        if (this._level > startLevel) {
            const levelGain = this._level - startLevel;
            
            if (this.chess) {
                // 显示升级消息
                if (levelGain === 1) {
                    this.chess.addGreenChat(`升级！等级提升至${this._level}级`);
                } else {
                    this.chess.addGreenChat(`连续升级！等级从${startLevel}级提升至${this._level}级`);
                }
                
                // 累加显示所有属性增长
                const parts = [];
                if (totalIncreases.life > 0) parts.push(`生命+${totalIncreases.life}`);
                if (totalIncreases.attack > 0) parts.push(`攻击+${totalIncreases.attack}`);
                if (totalIncreases.defense > 0) parts.push(`防御+${totalIncreases.defense}`);
                
                if (parts.length > 0) {
                    this.chess.addChat(parts.join(' '));
                }
            }
            
            console.log(`[Level] 升级${levelGain}次到 Lv${this._level} - 生命+${totalIncreases.life} 攻击+${totalIncreases.attack} 防御+${totalIncreases.defense}`);
        }
    }
    
    /**
     * 执行一次升级（内部方法，不显示消息）
     * @returns {Object} 属性增长 {life, attack, defense}
     */
    _levelUpOnce() {
        this._level++;
        
        // 记录本次属性增长
        const increases = {
            life: 0,
            attack: 0,
            defense: 0
        };
        
        // AS3原版逻辑：每级随机选择一种属性增长
        // Math.random() * 3 -> [0, 3)
        // 0: 生命+100, 1: 攻击+10, 2: 防御+5
        const rand = Math.floor(Math.random() * 3);
        if (rand === 0) {
            this._baseMaxLife += 100;
            increases.life = 100;
        } else if (rand === 1) {
            this._baseAttack += 10;
            increases.attack = 10;
        } else {
            this._baseDefense += 5;
            increases.defense = 5;
        }
        
        // 重新计算
        this._recalculateAll();
        
        // 完全恢复
        this._curLife = this.actualLife;
        this._curStamina = this.actualStamina;
        
        return increases;
    }
    
    /**
     * 获取下一级所需的总经验 - AS3: (1 + level) * level / 2 * 10 - 10
     * @returns {number}
     */
    _getNextLevelTotalExp() {
        if (this._level >= GameConstants.MAX_LEVEL) {
            return GameConstants.MAX_EXP;
        }
        
        // AS3原版公式：(1 + nextLevel) * nextLevel / 2 * 10 - 10
        const nextLevel = this._level + 1;
        return (1 + nextLevel) * nextLevel / 2 * 10 - 10;
    }
    
    /**
     * 获取升级还需多少经验 - AS3: nextExp
     * @returns {number}
     */
    _getNextLevelExp() {
        if (this._level >= GameConstants.MAX_LEVEL) {
            return 0;
        }
        
        // 还需经验 = 下一级所需总经验 - 当前经验
        return this._getNextLevelTotalExp() - this._exp;
    }
    
    // ========== 金钱和名声 ==========
    
    /**
     * 添加金钱
     * @param {number} amount - 金钱数量（可为负）
     * @returns {this}
     */
    addGold(amount) {
        this._gold = Math.max(0, this._gold + amount);
        
        if (amount > 0) {
            console.log(`[Gold] +${amount}，当前: ${this._gold}`);
        } else if (amount < 0) {
            console.log(`[Gold] ${amount}，当前: ${this._gold}`);
        }
        
        return this;
    }
    
    /**
     * 减少金钱
     * @param {number} amount - 金钱数量
     * @returns {boolean} 是否成功
     */
    reduceGold(amount) {
        if (this._gold < amount) {
            return false;
        }
        
        this.addGold(-amount);
        return true;
    }
    
    /**
     * 添加名声
     * @param {number} amount - 名声数量
     * @returns {this}
     */
    addFame(amount) {
        if (amount <= 0) return this;
        
        this._fame += amount;
        console.log(`[Fame] +${amount}，当前: ${this._fame}`);
        
        return this;
    }
    
    // ========== 生命管理 ==========
    
    /**
     * 恢复生命
     * @param {number} amount - 恢复量
     * @returns {this}
     */
    heal(amount) {
        if (amount <= 0) return this;
        
        const oldLife = this._curLife;
        this._curLife = Math.min(this.actualLife, this._curLife + amount);
        
        const actualHeal = this._curLife - oldLife;
        if (actualHeal > 0) {
            console.log(`[Life] +${actualHeal}，当前: ${this._curLife}/${this.actualLife}`);
        }
        
        return this;
    }
    
    /**
     * 受到伤害
     * @param {number} amount - 伤害量
     * @returns {this}
     */
    damage(amount) {
        if (amount <= 0) return this;
        
        this._curLife = Math.max(0, this._curLife - amount);
        console.log(`[Life] -${amount}，当前: ${this._curLife}/${this.actualLife}`);
        
        // 检查死亡
        if (this._curLife <= 0) {
            this._isDead = true;
            console.log('[Death] 玩家死亡');
        }
        
        return this;
    }
    
    /**
     * 受到伤害（旧版API，返回是否死亡）
     * @param {number} value - 伤害值
     * @returns {boolean} 是否死亡
     */
    takeDamage(value) {
        this._curLife = Math.max(0, this._curLife - value);
        console.log(`[Life] 受到${value}伤害，当前: ${this._curLife}/${this.actualLife}`);
        
        const isDead = this._curLife <= 0;
        if (isDead) {
            this._isDead = true;
            console.log('[Death] 玩家死亡');
        }
        
        return isDead;
    }
    
    /**
     * 完全恢复（生命+耐力）
     * @returns {this}
     */
    fullRestore() {
        this._curLife = this.actualLife;
        this._curStamina = this.actualStamina;
        console.log(`[Restore] 完全恢复 - 生命:${this._curLife} 耐力:${this._curStamina}`);
        return this;
    }
    
    /**
     * 半恢复生命
     * @returns {this}
     */
    halfRecovery() {
        const healAmount = Math.floor(this.actualLife * 0.5);
        return this.heal(healAmount);
    }
    
    // ========== 耐力管理 ==========
    
    /**
     * 恢复耐力
     * @param {number} amount - 恢复量（不传则恢复满）
     * @returns {this}
     */
    restoreStamina(amount = null) {
        if (amount === null) {
            this._curStamina = this.actualStamina;
        } else {
            this._curStamina = Math.min(this.actualStamina, this._curStamina + amount);
        }
        
        console.log(`[Stamina] 恢复耐力，当前: ${this._curStamina}/${this.actualStamina}`);
        return this;
    }
    
    /**
     * 半恢复耐力
     * @returns {this}
     */
    halfRestoreStamina() {
        const restoreAmount = Math.floor(this.actualStamina * 0.5);
        return this.restoreStamina(restoreAmount);
    }
    
    /**
     * 移动时消耗耐力（根据移动类型）
     * @param {number} moveType - 移动类型 (0=步行, 1=骑行, 2=坐船)
     * @returns {this}
     */
    moveConsumeStamina(moveType) {
        // 检查"不知疲倦"buff（不消耗耐力）
        if (this.haveBuff(BuffNo.NOTIRED)) {
            console.log(`[Stamina] 不知疲倦，不消耗耐力`);
            return this;
        }
        
        let consume = 0;
        
        // V1.0.5: 取消骑行，moveType只有步行(0)和坐船(2)
        if (moveType === 0) {
            // 步行（坐骑耐力减免始终生效）
            const mountReduce = this._mount && this._mount.staConsumeReduce ? this._mount.staConsumeReduce : 0;
            consume = Math.max(0, this._actualStaConsume - this._walkStaReduce - mountReduce);
        } else {
            // 坐船或其他
            consume = this._actualStaConsume;
        }
        
        this._curStamina = Math.max(0, this._curStamina - consume);
        console.log(`[Stamina] 移动消耗${consume}耐力（类型${moveType}），当前: ${this._curStamina}/${this.actualStamina}`);
        
        return this;
    }
    
    /**
     * 消耗耐力（通用方法）
     * @param {number} amount - 消耗量（不传则使用实际耐力消耗值）
     * @returns {this}
     */
    consumeStamina(amount = null) {
        const consume = amount !== null ? amount : this._actualStaConsume;
        
        this._curStamina = Math.max(0, this._curStamina - consume);
        console.log(`[Stamina] -${consume}，当前: ${this._curStamina}/${this.actualStamina}`);
        
        return this;
    }
    
    /**
     * 检查是否有足够耐力（含消耗值检查）
     * @returns {boolean}
     */
    hasEnoughStamina() {
        return this._curStamina >= this._actualStaConsume;
    }
    
    // ========== Buff系统 ==========
    
    /**
     * 添加Buff对象（支持自定义buff）
     * 对应 AS3: addBuffObj()
     * @param {ChessBuff} buffObj - Buff对象
     * @param {number} beginRound - 开始回合数
     * @returns {this}
     */
    addBuffObj(buffObj, beginRound) {
        const buffNo = buffObj._buffNo;
        
        // 检查是否已有相同Buff，如果有则刷新持续时间
        if (this._buffs.has(buffNo)) {
            const existingBuff = this._buffs.get(buffNo);
            existingBuff.beginRound = beginRound;
            // 显示刷新消息（绿色）
            if (this.chess) {
                this.chess.addGreenChat(`${existingBuff.getDescription()}（已刷新）`);
            }
            console.log(`[Buff] Buff ${buffNo} 已存在，刷新持续时间`);
            return this;
        }
        
        // 使用传入的Buff对象
        buffObj.beginRound = beginRound;
        this._buffs.set(buffNo, buffObj);
        
        // 重新计算属性
        this._recalculateAll();
        
        // 显示消息（绿色，统一格式）
        if (this.chess) {
            this.chess.addGreenChat(buffObj.getDescription());
        }
        
        console.log(`[Buff] 添加Buff ${buffNo}：${buffObj.buffName}`);
        return this;
    }
    
    /**
     * 添加Buff
     * @param {number} buffNo - Buff编号
     * @param {number} beginRound - 开始回合数
     * @returns {this}
     */
    addBuff(buffNo, beginRound) {
        // 检查是否已有相同Buff，如果有则刷新持续时间
        if (this._buffs.has(buffNo)) {
            const existingBuff = this._buffs.get(buffNo);
            existingBuff.beginRound = beginRound;
            // 显示刷新消息（绿色）
            if (this.chess) {
                this.chess.addGreenChat(`${existingBuff.getDescription()}（已刷新）`);
            }
            console.log(`[Buff] Buff ${buffNo} 已存在，刷新持续时间`);
            return this;
        }
        
        // 创建新Buff（传递buffNo到构造函数）
        const buff = new ChessBuff(buffNo);
        buff.initialize(buffNo, beginRound);
        this._buffs.set(buffNo, buff);
        
        // 重新计算属性
        this._recalculateAll();
        
        // 显示消息（绿色，统一格式）
        if (this.chess) {
            this.chess.addGreenChat(buff.getDescription());
        }
        
        console.log(`[Buff] 添加Buff ${buffNo}：${buff.buffName}`);
        return this;
    }
    
    /**
     * 移除Buff
     * @param {number} buffNo - Buff编号
     * @returns {boolean} 是否成功移除
     */
    removeBuff(buffNo) {
        if (this._buffs.has(buffNo)) {
            const buff = this._buffs.get(buffNo);
            const buffName = buff.buffName || BuffNo.getName(buffNo) || '未知';
            this._buffs.delete(buffNo);
            this._recalculateAll();
            console.log(`[Buff] 移除Buff ${buffNo}：${buffName}`);
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否拥有指定Buff
     * @param {number} buffNo - Buff编号
     * @returns {boolean}
     */
    haveBuff(buffNo) {
        return this._buffs.has(buffNo);
    }
    
    /**
     * 获取Buff列表
     * @returns {Array<ChessBuff>}
     */
    getBuffs() {
        return Array.from(this._buffs.values());
    }
    
    /**
     * 清除所有Buff
     * @returns {this}
     */
    clearAllBuffs() {
        if (this._buffs.size > 0) {
            console.log(`[Buff] 清除所有Buff（共${this._buffs.size}个）`);
            this._buffs.clear();
            this._recalculateAll();
        }
        return this;
    }
    
    /**
     * 移除所有减益Buff
     * @returns {Array<string>} 被移除的Buff名称列表
     */
    removeAllDebuffs() {
        const removedNames = [];
        
        for (const [buffNo, buff] of this._buffs.entries()) {
            if (buff.isDebuff) {
                removedNames.push(buff.name);
                this._buffs.delete(buffNo);
            }
        }
        
        if (removedNames.length > 0) {
            console.log(`[Buff] 移除了${removedNames.length}个减益Buff: ${removedNames.join(', ')}`);
            this._recalculateAll();
        }
        
        return removedNames;
    }
    
    /**
     * 检查Buff是否超时（每回合调用）
     * @param {number} currentRound - 当前回合数
     * @returns {this}
     */
    checkBuffDuration(currentRound) {
        let removed = false;
        
        // 遍历所有Buff检查是否过期
        for (const [buffNo, buff] of this._buffs.entries()) {
            if (buff.duration > 0 && currentRound - buff.beginRound >= buff.duration) {
                const buffName = buff.buffName || BuffNo.getName(buffNo) || '【未知】';
                this._buffs.delete(buffNo);
                
                if (this.chess) {
                    this.chess.addChat(`Buff ${buffName} 效果消失了`);
                }
                
                removed = true;
            }
        }
        
        // 如果有Buff被移除，重新计算属性
        if (removed) {
            this._recalculateAll();
        }
        
        return this;
    }
    
    /**
     * 获取经验加成倍率
     * @returns {number}
     */
    getExpMultiplier() {
        let multiplier = 1.0;
        for (const buff of this._buffs.values()) {
            multiplier += buff.expMul || 0;
        }
        return multiplier;
    }
    
    /**
     * 获取战利品加成倍率
     * @returns {number}
     */
    getLootMultiplier() {
        let multiplier = 1.0;
        for (const buff of this._buffs.values()) {
            multiplier += buff.lootMul || 0;
        }
        return multiplier;
    }
    
    /**
     * 获取名声加成倍率
     * @returns {number}
     */
    getFameMultiplier() {
        let multiplier = 1.0;
        for (const buff of this._buffs.values()) {
            multiplier += buff.fameMul || 0;
        }
        return multiplier;
    }
    
    /**
     * 获取战利品加成后的值
     */
    getFameAdd(baseFame) {
        return Math.ceil(baseFame * this.getFameMultiplier());
    }
    
    getStuffAdd(baseStuff) {
        return Math.ceil(baseStuff * this.getLootMultiplier());
    }
    
    getRareAdd(baseRarestuff) {
        return Math.ceil(baseRarestuff * this.getLootMultiplier());
    }
    
    // ========== 背包系统 ==========
    
    /**
     * 获取背包等级
     * @returns {number}
     */
    get bagLevel() {
        return this._bagLevel;
    }
    
    /**
     * 获取背包数据
     * @returns {Object|null}
     */
    getBagData() {
        return DataManager.getBag(this._bagLevel);
    }
    
    /**
     * 获取背包名称
     * @returns {string}
     */
    getBagName() {
        const bag = this.getBagData();
        return bag ? bag.name : '粗布包';
    }
    
    /**
     * 获取背包颜色名称（带品质颜色）
     * @returns {string}
     */
    getBagColorName() {
        const bag = this.getBagData();
        if (!bag) return '粗布包';
        
        const colors = DataManager._data.bags.qualityColors || ['#FFFFFF'];
        const color = colors[this._bagLevel - 1] || '#FFFFFF';
        return `<font color='${color}'>${bag.name}</font>`;
    }
    
    /**
     * 获取背包提供的负重
     * @returns {number}
     */
    getBagWeight() {
        return this._bagWeight;
    }
    
    /**
     * 升级背包
     * @param {boolean} free - 是否免费
     * @returns {number} 0=成功, 1=已满级, 2=金币不足, 3=材料不足
     */
    upgradeBag(free = false) {
        if (this._bagLevel >= 6) {
            return 1; // 已满级
        }
        
        const nextLevel = this._bagLevel + 1;
        const nextBag = DataManager.getBag(nextLevel);
        if (!nextBag) {
            console.error(`[Bag] 未找到背包数据: level=${nextLevel}`);
            return 1;
        }
        
        if (!free) {
            // 检查金币
            if (this._gold < nextBag.upgradeCost) {
                return 2; // 金币不足
            }
            // 检查材料
            if (this._stuff < nextBag.upgradeStuff) {
                return 3; // 材料不足
            }
            
            // 扣除费用
            this.reduceGold(nextBag.upgradeCost);
            this._stuff -= nextBag.upgradeStuff;
        }
        
        // 升级
        this._bagLevel = nextLevel;
        this._bagWeight = nextBag.weight;
        this._updateWeight();
        
        console.log(`[Bag] 背包升级: Lv${nextLevel} ${nextBag.name}`);
        return 0;
    }
    
    /**
     * 获取下一级背包升级费用
     * @returns {Object|null} {cost, stuff, name}
     */
    getNextBagUpgradeInfo() {
        if (this._bagLevel >= 6) {
            return null;
        }
        
        const nextBag = DataManager.getBag(this._bagLevel + 1);
        if (!nextBag) return null;
        
        return {
            cost: nextBag.upgradeCost,
            stuff: nextBag.upgradeStuff,
            name: nextBag.name,
            weight: nextBag.weight
        };
    }
    
    /**
     * 打印背包信息
     * @returns {string}
     */
    printBag() {
        const bag = this.getBagData();
        if (!bag) return '粗布包';
        
        let info = this.getBagColorName();
        info += `<br>负重上限 +${this._bagWeight}`;
        
        if (bag.description) {
            info += `<br><font color='#AAAAAA'>${bag.description}</font>`;
        }
        
        return info;
    }
    
    // ========== 装备系统 ==========
    
    /**
     * 装备武器
     * @param {Object} weapon - 武器对象
     * @returns {this}
     */
    equipWeapon(weapon) {
        if (!weapon) return this;
        
        this._weapon = weapon;
        this._maxEquipNo = Math.max(this._maxEquipNo, weapon.no || 0);
        this._recalculateAll();
        
        console.log(`[Equip] 装备武器: ${weapon.name}`);
        return this;
    }
    
    /**
     * 装备护甲
     * @param {Object} armor - 护甲对象
     * @returns {this}
     */
    equipArmor(armor) {
        if (!armor) return this;
        
        this._armor = armor;
        this._maxEquipNo = Math.max(this._maxEquipNo, armor.no || 0);
        this._recalculateAll();
        
        console.log(`[Equip] 装备护甲: ${armor.name}`);
        return this;
    }
    
    /**
     * 获取当前武器
     * @returns {Object|null}
     */
    getWeapon() {
        return this._weapon;
    }
    
    /**
     * 获取当前护甲
     * @returns {Object|null}
     */
    getArmor() {
        return this._armor;
    }
    
    /**
     * 检查是否有足够材料锻造
     * @returns {boolean}
     */
    enoughStuffToSmith() {
        return this._stuff >= 10 || this._rarestuff >= 1;
    }
    
    /**
     * 强化武器
     * @returns {boolean}
     */
    enhanceWeapon() {
        if (!this._weapon) {
            return false;
        }
        
        if (!this._weapon.power) {
            this._weapon.power = 0;
        }
        
        if (this._weapon.power >= 9) {
            console.log('[Equip] 武器已强化到最大等级');
            return false;
        }
        
        this._weapon.power++;
        this._recalculateAll();
        
        console.log(`[Equip] 武器强化到+${this._weapon.power}`);
        return true;
    }
    
    /**
     * 强化护甲
     * @returns {boolean}
     */
    enhanceArmor() {
        if (!this._armor) {
            return false;
        }
        
        if (!this._armor.power) {
            this._armor.power = 0;
        }
        
        if (this._armor.power >= 9) {
            console.log('[Equip] 护甲已强化到最大等级');
            return false;
        }
        
        // 保存生命比例
        const lifePercent = this._curLife / this._maxLife;
        
        this._armor.power++;
        this._recalculateAll();
        
        // 按比例恢复生命
        this._curLife = Math.floor(this._maxLife * lifePercent);
        
        console.log(`[Equip] 护甲强化到+${this._armor.power}`);
        return true;
    }
    
    /**
     * 锻造新装备（升级）
     * @param {boolean} isWeapon - 是否武器
     * @returns {boolean}
     */
    smithEquip(isWeapon) {
        const current = isWeapon ? this._weapon : this._armor;
        if (!current) {
            return false;
        }
        
        const nextSetNo = current.setNo + 1;
        
        if (nextSetNo > this._equips.maxSetNo) {
            console.log('[Equip] 已是当前可用的最高装备');
            return false;
        }
        
        // 检查材料
        const required = this._equips.getRequiredStuff(nextSetNo);
        if (this._stuff < required.stuff || this._rarestuff < required.rare) {
            console.log(`[Equip] 材料不足: 需要${required.stuff}普通+${required.rare}稀有`);
            return false;
        }
        
        // 计算成功率并锻造（考虑遗物11锻造笔记的加成）
        let successRate = this._equips.getSmithRate(nextSetNo);
        if (this._forgeBonus) {
            successRate += this._forgeBonus;
        }
        const success = Math.random() < successRate;
        
        if (success) {
            this._stuff -= required.stuff;
            this._rarestuff -= required.rare;
            
            // 获取新装备并装备
            const newEquip = isWeapon ? 
                this._equips.getWeapon(nextSetNo) : 
                this._equips.getArmor(nextSetNo);
            
            if (isWeapon) {
                this.equipWeapon(newEquip);
            } else {
                this.equipArmor(newEquip);
            }
            
            console.log(`[Equip] 锻造成功！`);
            if (this.chess) {
                this.chess.addGreenChat(`锻造成功！获得${this._equips.getNameWithColor(newEquip)}`);
            }
            
            return true;
        } else {
            this._stuff -= Math.floor(required.stuff * 0.5);
            this._rarestuff -= Math.floor(required.rare * 0.5);
            
            console.log(`[Equip] 锻造失败`);
            if (this.chess) {
                this.chess.addChat(`锻造失败！损失了一半材料...`);
            }
            
            return false;
        }
    }
    
    /**
     * 从宝箱获得装备
     * @param {number} chestType - 宝箱类型 (1-5)
     */
    checkLootEquipFromChest(chestType) {
        // 根据宝箱类型决定获得装备的概率
        let chance = 0;
        switch (chestType) {
            case 1: chance = 0.02; break;  // 2%
            case 2: chance = 0.04; break;  // 4%
            case 3: chance = 0.06; break;  // 6%
            case 4:
            case 5: chance = 0.08; break;  // 8% (寻宝任务)
        }
        
        if (Math.random() < chance) {
            // 根据当前圈数决定装备等级上限
            const board = this.chess.board;
            let maxSetNo = Math.ceil(board._circleNo / 5);
            maxSetNo = Math.min(this._equips.epicMaxSetNo, maxSetNo);
            
            const weaponSetNo = this._weapon ? this._weapon.setNo : 0;
            const armorSetNo = this._armor ? this._armor.setNo : 0;
            
            // 优先升级等级较低的装备
            if (armorSetNo < weaponSetNo) {
                if (armorSetNo < maxSetNo) {
                    this._armor = this._equips.cloneEquip(armorSetNo + 1, false);
                    this._recalculateAll();
                    
                    const armorName = this._equips.getNameWithColor(this._armor);
                    if (chestType === 5) {
                        this.chess.addChat(`你惊喜的挖到一件${armorName}`);
                        DiaryPanel.getInstance().addDiary(`你挖宝藏时挖到一件${armorName}`);
                    } else {
                        this.chess.addChat(`你惊喜的开出一件${armorName}`);
                        DiaryPanel.getInstance().addDiary(`你从宝箱里开出一件${armorName}`);
                    }
                }
            } else if (weaponSetNo < maxSetNo) {
                this._weapon = this._equips.cloneEquip(weaponSetNo + 1, true);
                this._recalculateAll();
                
                const weaponName = this._equips.getNameWithColor(this._weapon);
                if (chestType === 5) {
                    this.chess.addChat(`你惊喜的挖到一把${weaponName}`);
                    DiaryPanel.getInstance().addDiary(`你挖宝藏时挖到一把${weaponName}`);
                } else {
                    this.chess.addChat(`你惊喜的开出一把${weaponName}`);
                    DiaryPanel.getInstance().addDiary(`你从宝箱里开出一把${weaponName}`);
                }
            }
        }
    }
    
    // ========== 遗物系统 ==========
    
    /**
     * 添加遗物
     * @param {Object} relic - 遗物对象
     * @returns {boolean}
     */
    addRelic(relic) {
        if (!relic || relic.took) {
            return false;
        }
        
        // 检查是否已拥有
        if (this._relics.has(relic.relicNo)) {
            console.log('[Relic] 已拥有遗物: ' + relic.name);
            return false;
        }
        
        // 标记遗物已被获取
        relic.took = true;
        this._relics.add(relic.relicNo);
        this._relicList.push(relic);
        
        // 应用遗物效果（参考原版AS3）
        switch (relic.relicNo) {
            case 1:  // 逸风之靴：耐力消耗-1
                this._staConsume = Math.max(1, this._staConsume - 1);
                this._updateWeight();
                break;
            case 2:  // 大力腰带：负重+200
                this._maxWeight += 200;
                break;
            case 11: // 锻造笔记：锻造成功率+30%
                this._forgeBonus += 0.3;
                break;
            case 15: // 神行护腿：步行耐力消耗-1
                this._walkStaReduce = 1;
                break;
            case 16: // 骑术护腕：骑行耐力消耗-1
                this._rideStaReduce = 1;
                break;
            case 17: // 房中术：爱情等级提升
                if (this.chess && this.chess.upgradeLoveLevel) {
                    this.chess.upgradeLoveLevel();
                }
                break;
        }
        
        this._recalculateAll();
        
        // 显示消息
        if (this.chess) {
            const effectDesc = relic.effectText || relic.description || '';
            this.chess.addGreenChat(`获得遗物：【${relic.name}】 - ${effectDesc}`);
        }
        
        console.log('[Relic] 获得遗物: ' + relic.name);
        return true;
    }
    
    /**
     * 移除遗物（灵魂石等一次性道具）
     * @param {number} relicNo - 遗物编号
     * @returns {boolean}
     */
    removeRelic(relicNo) {
        if (!this._relics.has(relicNo)) {
            return false;
        }
        
        // 从Set和数组中移除
        this._relics.delete(relicNo);
        const index = this._relicList.findIndex(r => r.relicNo === relicNo);
        if (index !== -1) {
            const relic = this._relicList[index];
            this._relicList.splice(index, 1);
            
            // 移除遗物效果（反向操作）
            switch (relicNo) {
                case 1:  // 逸风之靴：耐力消耗+1（恢复）
                    this._staConsume += 1;
                    this._updateWeight();
                    break;
                case 2:  // 大力腰带：负重-200（恢复）
                    this._maxWeight -= 200;
                    break;
                case 11: // 锻造笔记：锻造成功率-30%（恢复）
                    this._forgeBonus = Math.max(0, this._forgeBonus - 0.3);
                    break;
                case 15: // 神行护腿：步行耐力减免清零
                    this._walkStaReduce = 0;
                    break;
                case 16: // 骑术护腕：骑行耐力减免清零
                    this._rideStaReduce = 0;
                    break;
            }
            
            console.log(`[Relic] 移除遗物: ${relic.name}`);
        }
        
        // 重新计算属性
        this._recalculateAll();
        return true;
    }
    
    /**
     * 检查是否拥有指定遗物
     * @param {number} relicNo - 遗物编号
     * @returns {boolean}
     */
    haveRelic(relicNo) {
        return this._relics.has(relicNo);
    }
    
    /**
     * 获取遗物数量
     * @returns {number}
     */
    getRelicCount() {
        return this._relicList.length;
    }
    
    /**
     * 检查灵魂石（战斗中死亡时满血复活）
     * @returns {boolean} 是否触发灵魂石复活
     */
    checkSoulstoneRevive() {
        // relicNo: 18 = 灵魂石
        if (this.haveRelic(18)) {
            // 满血复活
            this._curLife = this._maxLife;
            
            // 消耗遗物（一次性）
            this.removeRelic(18);
            
            if (this.chess) {
                this.chess.addGreenChat('你不幸战死，但【灵魂石】召回了你的灵魂，随后便化作齑粉');
            }
            
            console.log('[Relic] 灵魂石复活触发');
            return true;
        }
        return false;
    }
    
    /**
     * 检查使用急救绷带（战斗中调用）
     */
    checkUseBandage() {
        if (this._curLife <= 0 || !this.haveRelic(Relic.BANDAGE)) {
            return;
        }
        
        if (this._curLife < this.actualLife) {
            if (RandomUtils.percent(20)) {
                // 20%概率大量恢复
                this.heal(Math.floor(this.actualLife * 0.8));
                if (this.chess) {
                    this.chess.addChat('你使用绷带回复了大量生命');
                }
            } else {
                // 80%概率少量恢复
                this.heal(Math.floor(this.actualLife * 0.2));
                if (this.chess) {
                    this.chess.addChat('你使用绷带回复了少量生命');
                }
            }
        }
    }
    
    /**
     * 检查材料平衡（副本掉落用）
     * @returns {number} 0=正常掉落，1=稀有太多不掉稀有，2=普通太多不掉普通
     */
    checkStuffBalance() {
        const totalStuff = this._stuff + this._rarestuff;
        
        if (totalStuff > 400) {
            const ratio = this._stuff / this._rarestuff;
            
            if (ratio > 3) {
                return 2;  // 普通材料太多，不掉普通
            }
            if (ratio < 0.33) {
                return 1;  // 稀有材料太多，不掉稀有
            }
        }
        
        return 0;  // 正常掉落
    }
    
    /**
     * 仙女事件装备升级 - AS3: checkEquipUpgrade()
     * @param {boolean} giveCoat - 是否赠送装备（true）或强化（false）
     * @param {boolean} isWeapon - 是否武器（true）还是护甲（false）
     */
    checkEquipUpgrade(giveCoat, isWeapon) {
        const currentEquip = isWeapon ? this._weapon : this._armor;
        
        if (!currentEquip) {
            console.log('[Equip] 没有装备可升级');
            return;
        }
        
        const nextSetNo = currentEquip.setNo + 1;
        
        if (nextSetNo > this._equips.maxSetNo) {
            if (this.chess) {
                this.chess.addChat('你的装备已经是最高级，无法再升级了');
            }
            return;
        }
        
        if (giveCoat) {
            // 赠送下一级装备（需要从装备库获取装备对象）
            if (isWeapon) {
                const newWeapon = this._equips.getWeapon(nextSetNo);
                if (newWeapon) {
                    this.equipWeapon(newWeapon);
                    if (this.chess) {
                        this.chess.addGreenChat(`仙女赠送【${newWeapon.name}】！`);
                    }
                }
            } else {
                const newArmor = this._equips.getArmor(nextSetNo);
                if (newArmor) {
                    this.equipArmor(newArmor);
                    if (this.chess) {
                        this.chess.addGreenChat(`仙女赠送【${newArmor.name}】！`);
                    }
                }
            }
        } else {
            // 强化当前装备（确保 power 有默认值）
            const oldPower = currentEquip.power || 0;
            currentEquip.power = Math.min(9, oldPower + 1);
            if (this.chess) {
                this.chess.addGreenChat(`装备强化+1，当前强化等级+${currentEquip.power}`);
            }
        }
        
        this._recalculateAll();
    }
    
    // ========== 任务系统 ==========
    
    /**
     * 添加任务
     * @param {Object} quest - 任务对象
     * @returns {boolean}
     */
    addQuest(quest) {
        if (this._quests.length >= this._maxQuests) {
            console.log(`[Quest] 任务已满（最多${this._maxQuests}个）`);
            return false;
        }
        
        this._quests.push(quest);
        console.log(`[Quest] 接受任务: ${quest.questName}`);
        
        // 注意：不在这里显示消息，由调用方决定如何显示
        // 避免重复消息
        
        return true;
    }
    
    /**
     * 移除任务
     * @param {Object} quest - 任务对象
     * @returns {boolean}
     */
    removeQuest(quest) {
        const index = this._quests.indexOf(quest);
        if (index !== -1) {
            this._quests.splice(index, 1);
            console.log(`[Quest] 移除任务: ${quest.questName}`);
            return true;
        }
        return false;
    }
    
    /**
     * 获取任务列表
     * @returns {Array}
     */
    getQuests() {
        return this._quests;
    }
    
    /**
     * 获取任务数量
     * @returns {number}
     */
    getQuestCount() {
        return this._quests.length;
    }
    
    /**
     * 检查是否有指定类型的任务
     * @param {number} type - 任务类型
     * @returns {boolean}
     */
    haveQuestType(type) {
        return this._quests.some(q => q.type === type);
    }
    
    /**
     * 检查是否有指定类型的任务（别名，兼容旧API）
     * @param {number} questType - 任务类型
     * @returns {boolean}
     */
    haveQuest(questType) {
        return this.haveQuestType(questType);
    }
    
    /**
     * 根据类型获取任务
     * @param {number} type - 任务类型
     * @returns {Object|null}
     */
    getQuestByType(type) {
        return this._quests.find(q => q.type === type) || null;
    }
    
    /**
     * 根据格子获取任务
     * @param {number} cellIndex - 格子索引
     * @param {number} cellType - 格子类型
     * @returns {Object|null}
     */
    getQuest(cellIndex, cellType) {
        for (const quest of this._quests) {
            // 检查是否匹配触发索引
            if (quest.triggerCellIndex === cellIndex) {
                return quest;
            }
            // 检查是否匹配触发类型和完成索引（用于需要回程的任务）
            if (quest.triggerCellType === cellType && quest.replyCellIndex === cellIndex) {
                return quest;
            }
        }
        return null;
    }
    
    /**
     * 检查任务是否超时（每回合调用）
     * @param {number} currentRound - 当前回合数
     * @returns {this}
     */
    checkQuestDuration(currentRound) {
        const failedQuests = [];
        
        for (let i = this._quests.length - 1; i >= 0; i--) {
            const quest = this._quests[i];
            if (quest.questDuration > 0) {
                // 计算已过天数：2回合 = 1天
                const daysElapsed = (currentRound - quest.beginRound) / 2;
                
                // 检查是否超时
                if (daysElapsed >= quest.questDuration) {
                    // 任务超时
                    const failMessage = quest.failed(true);
                    if (this.chess) {
                        this.chess.addChat(failMessage);
                    }
                    failedQuests.push(quest.questName);
                    this._quests.splice(i, 1);
                }
            }
        }
        
        if (failedQuests.length > 0) {
            console.log(`[Quest] ${failedQuests.length}个任务超时失败`);
        }
        
        return this;
    }
    
    /**
     * 检查不能死亡的任务
     * 对应 AS3: checkCannotDieQuest()
     * 玩家死亡时调用，失败所有cannotDie任务
     */
    checkCannotDieQuest() {
        for (let i = this._quests.length - 1; i >= 0; i--) {
            const quest = this._quests[i];
            if (quest.cannotDie) {
                this.chess.addChat(quest.failed(false));
                this.removeQuest(quest);
            }
        }
    }
    
    // ========== 随从系统 ==========
    
    /**
     * 获取当前随从
     * @returns {Object|null}
     */
    getFollower() {
        return this._follower;
    }
    
    /**
     * 随从 getter（兼容 this.prop.follower 访问方式）
     * @returns {Object|null}
     */
    get follower() {
        return this._follower;
    }
    
    /**
     * 获取随从攻击加成
     * @returns {number}
     */
    getFollowerAttack() {
        return this._follower ? (this._follower.attack || 0) : 0;
    }
    
    /**
     * 获取随从防御加成
     * @returns {number}
     */
    getFollowerDefense() {
        return this._follower ? (this._follower.defense || 0) : 0;
    }
    
    /**
     * 获取随从生命加成
     * @returns {number}
     */
    getFollowerLife() {
        return this._follower ? (this._follower.life || 0) : 0;
    }
    
    /**
     * 检查随从雇佣时长（每回合调用）
     * @param {number} currentRound - 当前回合数
     * @returns {this}
     */
    checkFollowerDuration(currentRound) {
        if (this._follower && this._follower.duration !== 0) {
            const elapsedRounds = currentRound - this._follower.beginRound;
            if (this._follower.duration <= elapsedRounds / 2) {
                this._dismissFollower(true);
            }
        }
        return this;
    }
    
    /**
     * 解雇随从（内部方法）
     * @param {boolean} isTimeout - 是否超时
     */
    _dismissFollower(isTimeout) {
        if (!this._follower) return;
        
        const followerName = this._follower.name;
        
        // 如果关系度高，加入历史随从列表
        if (this._follower.relationship >= 60) {
            if (this._oldFollowers.indexOf(this._follower) === -1) {
                this._oldFollowers.push(this._follower);
            }
        }
        
        this._follower = null;
        this._recalculateAll();
        
        if (this.chess) {
            if (isTimeout) {
                this.chess.addChat(`随从【${followerName}】雇佣期满离开了`);
            } else {
                this.chess.addChat(`你解雇了随从【${followerName}】`);
            }
        }
        
        console.log(`[Follower] 随从离开: ${followerName}`);
    }
    
    /**
     * 更换随从
     * @param {Object} follower - 新随从对象
     * @param {number} currentRound - 当前回合数
     */
    changeFollower(follower, currentRound) {
        if (!follower) return;
        
        // 如果当前有随从，处理旧随从
        if (this._follower && this._follower !== follower) {
            if (!this._follower.married) {
                // 未婚随从直接离开
                if (this.chess) {
                    this.chess.addChat(`最多带1个随从，${this._follower.name}离开了队伍`);
                }
            } else if (this.chess && this.chess.haveHouse) {
                // 已婚随从回家
                if (this.chess) {
                    this.chess.addChat(`最多带1个随从，你让${this._follower.name}回家去`);
                }
                // 婚姻系统处理
                if (Marriage && Marriage.getInstance) {
                    Marriage.getInstance().letWifeFollowerHome(this.chess);
                }
            } else {
                // 没有房子的已婚随从留在原地
                if (this.chess) {
                    this.chess.addChat(`最多带1个随从，你让${this._follower.name}留在这`);
                }
            }
        }
        
        // 设置新随从
        this._follower = follower;
        
        // 设置开始回合
        if (currentRound) {
            follower.beginRound = currentRound;
        }
        
        this._recalculateAll();
        
        console.log(`[Follower] 更换随从: ${follower.name}`);
    }
    
    /**
     * 移除当前随从
     */
    removeFollower() {
        if (this._follower) {
            const name = this._follower.name;
            this._follower = null;
            this._recalculateAll();
            console.log(`[Follower] 移除随从: ${name}`);
        }
    }
    
    // ========== 坐骑系统 ==========
    
    /**
     * 获取当前坐骑
     * @returns {Object|null}
     */
    getMount() {
        return this._mount;
    }
    
    /**
     * 坐骑 getter（兼容 this.prop.mount 访问方式）
     * @returns {Object|null}
     */
    get mount() {
        return this._mount;
    }
    
    /**
     * 获取坐骑攻击加成
     * @returns {number}
     */
    getMountAttack() {
        if (!this._mount) {
            return 0;
        }
        return this._mount.totalAttack || 0;
    }
    
    /**
     * 能否骑行
     * @returns {boolean}
     */
    canRide() {
        return !!this._mount;
    }
    
    // ========== 等级计算（副本系统用）==========
    
    /**
     * 获取实际等级（用于副本评估）
     * @param {boolean} includeBuff - 是否包含Buff加成
     * @returns {number}
     */
    getActualLv(includeBuff = false) {
        // 计算不含随从/坐骑的属性值
        const weaponAttack = this._weapon ? (this._weapon.attack || 0) : 0;
        const armorDefense = this._armor ? (this._armor.defense || 0) : 0;
        const armorLife = this._armor ? (this._armor.life || 0) : 0;
        
        // 基础属性+装备
        let lifeLv = (this._baseMaxLife + armorLife) / 100;
        let atkLv = (this._baseAttack + weaponAttack) / 10;
        let defLv = (this._baseDefense + armorDefense) / 5;
        
        // 如果包含Buff，添加Buff加成
        if (includeBuff && this._buffs.size > 0) {
            const buffLifeMul = this._getBuffMultiplier(ChessProperty.STAT.LIFE);
            const buffAtkMul = this._getBuffMultiplier(ChessProperty.STAT.ATTACK);
            const buffDefMul = this._getBuffMultiplier(ChessProperty.STAT.DEFENSE);
            
            lifeLv *= (1 + buffLifeMul);
            atkLv *= (1 + buffAtkMul);
            defLv *= (1 + buffDefMul);
        }
        
        return Math.floor(lifeLv + atkLv + defLv - 3);
    }
    
    /**
     * 获取完整实际等级（包含随从和坐骑）
     * @returns {number}
     */
    getActualLvWithAll() {
        const actualLife = this.actualLife || this._curLife;
        const actualAtk = this.actualAttack || this._baseAttack;
        const actualDef = this.actualDefense || this._baseDefense;
        
        const lifeLv = actualLife / 100;
        const atkLv = actualAtk / 10;
        const defLv = actualDef / 5;
        
        return Math.floor(lifeLv + atkLv + defLv - 3);
    }
    
    // ========== 材料系统 ==========
    
    /**
     * 材料 Getter
     */
    get stuff() {
        return this._stuff;
    }
    
    set stuff(value) {
        const delta = value - this._stuff;
        const allowedAdd = this._checkWeightAdd(delta, 1);
        this._stuff = Math.max(0, this._stuff + allowedAdd);
        this._updateWeight();
    }
    
    get rarestuff() {
        return this._rarestuff;
    }
    
    set rarestuff(value) {
        const delta = value - this._rarestuff;
        const allowedAdd = this._checkWeightAdd(delta, 2);
        this._rarestuff = Math.max(0, this._rarestuff + allowedAdd);
        this._updateWeight();
    }
    
    get rubbish() {
        return this._rubbish;
    }
    
    set rubbish(value) {
        const delta = value - this._rubbish;
        const allowedAdd = this._checkWeightAdd(delta, 0);
        this._rubbish = Math.max(0, this._rubbish + allowedAdd);
        this._updateWeight();
    }
    
    /**
     * 获取总材料（背包+银行）
     * @returns {number}
     */
    get allStuff() {
        return this._stuff + (this._bank[0] || 0);
    }
    
    /**
     * 获取总稀有材料（背包+银行）
     * @returns {number}
     */
    get allRarestuff() {
        return this._rarestuff + (this._bank[1] || 0);
    }
    
    /**
     * 检查添加材料时是否超重
     * @param {number} addValue - 添加量
     * @param {number} materialType - 材料类型 (0=垃圾, 1=普通, 2=稀有)
     * @returns {number} 实际可添加量
     */
    _checkWeightAdd(addValue, materialType) {
        if (addValue <= 0) {
            return addValue; // 减少材料直接返回
        }
        
        // 计算单位重量
        const unitWeight = materialType === 0 ? 1 : (materialType === 1 ? 2 : 5);
        const addWeight = addValue * unitWeight;
        
        // 检查是否超重
        const newWeight = this._curWeight + addWeight;
        const maxWeight = this.actualWeight;
        
        if (newWeight > maxWeight) {
            // 计算最多能添加多少
            const availableWeight = maxWeight - this._curWeight;
            const maxAdd = Math.floor(availableWeight / unitWeight);
            
            // 超出部分丢弃
            const discarded = addValue - maxAdd;
            if (discarded > 0 && this.chess) {
                const materialName = materialType === 0 ? '垃圾' : (materialType === 1 ? '锻材' : '稀有锻材');
                this.chess.addRedChat(`负重不足，丢弃了${discarded}个${materialName}`);
            }
            
            return maxAdd;
        }
        
        return addValue;
    }
    
    /**
     * 更新负重
     */
    _updateWeight() {
        this._curWeight = this._rubbish + this._stuff * 2 + this._rarestuff * 5;
        this._overWeight = this._curWeight > this.actualWeight;
        
        // 超重时耐力消耗翻倍
        if (this._overWeight) {
            this._actualStaConsume = this._staConsume * 2;
        } else {
            this._actualStaConsume = this._staConsume;
        }
    }
    
    /**
     * 消耗材料（优先背包，不足时从银行取）
     * @param {number} amount - 消耗量
     * @returns {boolean} 是否成功
     */
    consumeStuff(amount) {
        if (amount <= 0) return true;
        
        // 先从背包扣除
        if (this._stuff >= amount) {
            this.stuff -= amount;
            return true;
        }
        
        // 背包不足，从银行取
        const needed = amount - this._stuff;
        const bankStuff = this._bank[0] || 0;
        
        if (bankStuff >= needed) {
            this._bank[0] -= needed;
            this._stuff = 0;
            this._updateWeight();
            return true;
        }
        
        return false;
    }
    
    /**
     * 消耗稀有材料
     * @param {number} amount - 消耗量
     * @returns {boolean} 是否成功
     */
    consumeRarestuff(amount) {
        if (amount <= 0) return true;
        
        // 先从背包扣除
        if (this._rarestuff >= amount) {
            this.rarestuff -= amount;
            return true;
        }
        
        // 背包不足，从银行取
        const needed = amount - this._rarestuff;
        const bankRarestuff = this._bank[1] || 0;
        
        if (bankRarestuff >= needed) {
            this._bank[1] -= needed;
            this._rarestuff = 0;
            this._updateWeight();
            return true;
        }
        
        return false;
    }
    
    /**
     * 手动存入材料到银行
     * @param {number} stuffAmount - 基础材料数量
     * @param {number} rarestuffAmount - 稀有材料数量
     * @param {number} feePerUnit - 每单位费用
     * @returns {number} 实际存入的总量
     */
    stuffToBank(stuffAmount, rarestuffAmount, feePerUnit) {
        let actualStuff = stuffAmount;
        let actualRarestuff = rarestuffAmount;
        let bonusStuff = 0;
        let bonusRarestuff = 0;
        
        // 检查基础材料是否超过银行容量
        if (actualStuff && actualStuff >= this._bankLimit - (this._bank[0] || 0)) {
            actualStuff = Math.max(0, this._bankLimit - (this._bank[0] || 0));
            if (this.chess) {
                this.chess.addChat('基础锻材已达到存放上限');
            }
        }
        
        // 检查稀有材料是否超过银行容量
        if (actualRarestuff && actualRarestuff >= this._bankLimit - (this._bank[1] || 0)) {
            actualRarestuff = Math.max(0, this._bankLimit - (this._bank[1] || 0));
            if (this.chess) {
                this.chess.addChat('稀有锻材已达到存放上限');
            }
        }
        
        // 计算费用
        const totalFee = (actualStuff + actualRarestuff) * feePerUnit;
        if (totalFee > this._gold) {
            return 0; // 金钱不足
        }
        
        // 扣除费用
        this.addGold(-totalFee);
        
        // 存入材料（可能有bonus）
        if (RandomUtils.percent(10)) {
            bonusStuff = Math.floor(actualStuff * 0.1);
            bonusRarestuff = Math.floor(actualRarestuff * 0.1);
            if (this.chess) {
                this.chess.addGreenChat(`意外收获！额外获得基础锻材${bonusStuff}，稀有锻材${bonusRarestuff}`);
            }
        }
        
        // 存入银行
        this._bank[0] = (this._bank[0] || 0) + actualStuff + bonusStuff;
        this._bank[1] = (this._bank[1] || 0) + actualRarestuff + bonusRarestuff;
        
        // 扣除背包材料
        this._stuff -= stuffAmount;
        this._rarestuff -= rarestuffAmount;
        this._updateWeight();
        
        console.log(`[Material] 存入银行: 基础${actualStuff}+${bonusStuff} 稀有${actualRarestuff}+${bonusRarestuff}`);
        
        return actualStuff + actualRarestuff + bonusStuff + bonusRarestuff;
    }
    
    /**
     * 将所有材料存入银行（自动托管）
     * @param {number} feePerUnit - 每单位费用
     * @returns {number} 实际存入的总量
     */
    allStuffToBank(feePerUnit) {
        // 没有材料
        if (this._stuff + this._rarestuff === 0) {
            return 0;
        }
        
        // 金钱不足
        const totalFee = (this._stuff + this._rarestuff) * feePerUnit;
        if (totalFee > this._gold) {
            return 0;
        }
        
        // 调用手动存入
        return this.stuffToBank(this._stuff, this._rarestuff, feePerUnit);
    }
    
    // ========== 显示方法 ==========
    
    /**
     * 获取属性面板显示文本
     * @returns {string}
     */
    getDisplayText() {
        let text = '';
        
        // 等级信息
        text += `Lv${this._level}（升级所需经验${this._getNextLevelExp()}）\n`;
        
        // 生命
        text += `生命${this._curLife}/${this.actualLife}\n`;
        
        // 武器信息
        if (this._weapon) {
            let weaponText = this._weapon.name;
            if (this._weapon.power > 0) {
                weaponText += `+${this._weapon.power}`;
            }
            const quality = this._getQualityText(this._weapon.quality);
            text += `攻击${this.actualAttack}【${weaponText}${quality}】\n`;
        } else {
            text += `攻击${this.actualAttack}【看得见剑】\n`;
        }
        
        // 护甲信息
        if (this._armor) {
            let armorText = this._armor.name;
            if (this._armor.power > 0) {
                armorText += `+${this._armor.power}`;
            }
            const quality = this._getQualityText(this._armor.quality);
            text += `防御${this.actualDefense}【${armorText}${quality}】\n`;
        } else {
            text += `防御${this.actualDefense}【看得见甲】\n`;
        }
        
        text += `\n`;
        text += `负重${this._curWeight}/${this.actualWeight}\n`;
        text += `耐力${this._curStamina}/${this.actualStamina}\n`;
        text += `\n`;
        
        // 材料信息
        text += `垃圾${this._rubbish}\n`;
        text += `基础锻材${this._stuff}`;
        if (this._bank[0] !== 0) {
            text += `【${this._bank[0]}】`;
        }
        text += `\n`;
        text += `稀有锻材${this._rarestuff}`;
        if (this._bank[1] !== 0) {
            text += `【${this._bank[1]}】`;
        }
        text += `\n`;
        text += `金钱${this._gold}\n`;
        
        return text;
    }
    
    /**
     * 获取装备品质文本
     * @param {number} quality - 品质等级
     * @returns {string}
     */
    _getQualityText(quality) {
        switch (quality) {
            case 1: return '☆';
            case 2: return '☆☆';
            case 3: return '☆☆☆';
            default: return '';
        }
    }
    
    /**
     * 判断是否濒死
     * @returns {boolean}
     */
    _isNearDeath() {
        return this._curLife > 0 && this._curLife <= this.actualLife * 0.1;
    }
    
    /**
     * 获取名声等级描述
     * @returns {string}
     */
    _getFameRank() {
        if (this._fame < 100) return '默默无名';
        if (this._fame < 500) return '小有名气';
        if (this._fame < 1000) return '声名远扬';
        if (this._fame < 5000) return '名满天下';
        return '传奇英雄';
    }
    
    /**
     * 获取带颜色的装备名
     * @param {Object} equip - 装备对象
     * @param {boolean} isArmor - 是否护甲
     * @returns {string}
     */
    _getEquipNameWithColor(equip, isArmor) {
        if (!equip) return '';
        
        let color = '#FFFFFF'; // 普通品质
        
        // 根据品质设置颜色（普通-白，优秀-蓝，精良-绿，史诗-金，传奇-橙）
        switch (equip.quality) {
            case 1: color = '#0080FF'; break; // 优秀-蓝色
            case 2: color = '#00FF00'; break; // 精良-绿色
            case 3: color = '#FFD700'; break; // 史诗-金色
            case 4: color = '#FF8000'; break; // 传奇-橙色
            default: color = '#FFFFFF'; break; // 普通-白色
        }
        
        let name = equip.name;
        if (equip.power > 0) {
            name += `+${equip.power}`;
        }
        
        return `<font color='${color}'>${name}</font>`;
    }
    
    /**
     * 生成遗物列表HTML
     * @returns {string}
     */
    printRelics() {
        const relicList = this._relicList || [];
        
        if (relicList.length === 0) {
            return '你还没有收集到任何勇者遗物<br>';
        }
        
        let str = '';
        relicList.forEach(relic => {
            // 遗物名称带颜色（传奇橙色，普通紫色）
            const color = relic.isLegend ? '#FF8000' : '#AA00FF';
            str += `<font color='${color}'>【${relic.name}】</font>`;
            // 效果文案（从JSON的effectText读取）
            str += `：${relic.effectText || relic.desc || ''}<br>`;
        });
        
        return str;
    }
    
    /**
     * 生成装备详细信息HTML
     * @param {Object} equip - 装备对象
     * @param {boolean} isArmor - 是否护甲
     * @returns {string}
     */
    printEquipInfo(equip, isArmor = false) {
        if (!equip) {
            return isArmor ? '【看得见甲】<br>防御：0' : '【看得见剑】<br>攻击：0';
        }
        
        let str = '';
        
        // 装备名称（带颜色和强化等级）
        let name = equip.name;
        if (equip.power > 0) {
            name += `+${equip.power}`;
        }
        
        // 根据品质显示颜色（普通-白，优秀-蓝，精良-绿，史诗-金，传奇-橙）
        let color = '#FFFFFF';
        let qualityText = '';
        switch (equip.quality) {
            case 0:
                qualityText = '普通';
                break;
            case 1:
                color = '#0080FF';  // 优秀-蓝色
                qualityText = '优秀';
                break;
            case 2:
                color = '#00FF00';  // 精良-绿色
                qualityText = '精良';
                break;
            case 3:
                color = '#FFD700';  // 史诗-金色
                qualityText = '史诗';
                break;
            case 4:
                color = '#FF8000';  // 传奇-橙色
                qualityText = '传奇';
                break;
        }
        
        str += `【<font color='${color}'>${name}</font>】<br>`;
        str += `品质：<font color='${color}'>${qualityText}</font><br>`;
        
        if (isArmor) {
            // 护甲属性
            if (equip.defense) {
                str += `防御：+${equip.defense}<br>`;
            }
            if (equip.life) {
                str += `生命：+${equip.life}<br>`;
            }
        } else {
            // 武器属性
            if (equip.attack) {
                str += `攻击：+${equip.attack}<br>`;
            }
        }
        
        // 强化等级
        if (equip.power > 0) {
            str += `强化：+${equip.power}<br>`;
        }
        
        // 装备描述（从JSON读取）
        if (equip.description) {
            str += `<br><font color='#AAAAAA'>${equip.description}</font>`;
        }
        
        return str;
    }
    
    // ========== 序列化方法 ==========
    
    /**
     * 记录所有属性（用于存档）
     * @returns {Object}
     */
    recordAll() {
        const record = {
            // 基础属性
            level: this._level,
            exp: this._exp,
            gold: this._gold,
            fame: this._fame,
            
            // 战斗属性
            baseMaxLife: this._baseMaxLife,
            baseAttack: this._baseAttack,
            baseDefense: this._baseDefense,
            curLife: this._curLife,
            curStamina: this._curStamina,
            
            // 材料
            stuff: this._stuff,
            rarestuff: this._rarestuff,
            rubbish: this._rubbish,
            bank: [...this._bank],
            
            // 装备
            weapon: this._weapon ? {...this._weapon} : null,
            armor: this._armor ? {...this._armor} : null,
            maxEquipNo: this._maxEquipNo,
            
            // Buff（保存为数组）
            buffs: Array.from(this._buffs.values()).map(buff => ({
                buffNo: buff._buffNo,
                beginRound: buff.beginRound
            })),
            
            // 遗物（保存为数组）
            relics: Array.from(this._relics),
            
            // 任务
            quests: this._quests.map(q => ({...q})),
            
            // 随从
            follower: this._follower ? {...this._follower} : null,
            oldFollowers: this._oldFollowers.map(f => ({...f})),
            
            // 坐骑
            mount: this._mount ? {...this._mount} : null,
            
            // 背包
            bagLevel: this._bagLevel,
            bagWeight: this._bagWeight,
            
            // 其他
            overWeight: this._overWeight,
            stuffBankTriggered: this._stuffBankTriggered
        };
        
        return record;
    }
    
    /**
     * 加载属性（从存档）
     * @param {Object} record - 存档数据
     */
    loadRecord(record) {
        if (!record) return;
        
        // 基础属性
        this._level = record.level || 1;
        this._exp = record.exp || 0;
        this._gold = record.gold || 0;
        this._fame = record.fame || 0;
        
        // 战斗属性
        this._baseMaxLife = record.baseMaxLife || 100;
        this._baseAttack = record.baseAttack || 10;
        this._baseDefense = record.baseDefense || 5;
        this._curLife = record.curLife || 100;
        this._curStamina = record.curStamina || GameConstants.STARTING_STAMINA;
        
        // 材料
        this._stuff = record.stuff || 0;
        this._rarestuff = record.rarestuff || 0;
        this._rubbish = record.rubbish || 0;
        if (record.bank) {
            this._bank = [...record.bank];
        }
        
        // 装备
        this._weapon = record.weapon || null;
        this._armor = record.armor || null;
        this._maxEquipNo = record.maxEquipNo || 0;
        
        // Buff（从数组恢复到Map）
        this._buffs.clear();
        if (record.buffs && Array.isArray(record.buffs)) {
            for (const buffData of record.buffs) {
                this.addBuff(buffData.buffNo, buffData.beginRound);
            }
        }
        
        // 遗物（从数组恢复到Set）
        this._relics.clear();
        if (record.relics && Array.isArray(record.relics)) {
            for (const relicNo of record.relics) {
                this._relics.add(relicNo);
            }
        }
        
        // 任务
        if (record.quests && Array.isArray(record.quests)) {
            this._quests = record.quests.map(q => ({...q}));
        }
        
        // 随从
        this._follower = record.follower || null;
        if (record.oldFollowers && Array.isArray(record.oldFollowers)) {
            this._oldFollowers = record.oldFollowers.map(f => ({...f}));
        }
        
        // 坐骑
        this._mount = record.mount || null;
        
        // 背包
        this._bagLevel = record.bagLevel || 1;
        this._bagWeight = record.bagWeight || 0;
        
        // 其他
        this._overWeight = record.overWeight || false;
        this._stuffBankTriggered = record.stuffBankTriggered || false;
        
        // 重新计算属性
        this._updateWeight();
        this._recalculateAll();
        
        console.log('[ChessProperty] 加载存档完成');
    }
    
    /**
     * 打印初始奖励（二周目+）
     * @returns {string}
     */
    printIntialBonus() {
        let text = '你获得了' + this._equips.getNameWithColor(this._weapon);
        text += '\n你获得了' + this._equips.getNameWithColor(this._armor);
        text += '\n你获得了' + (this.gameCleared * 10000) + '金';
        return text;
    }
    
    // ========== 辅助方法 ==========
    
    /**
     * 检查颜色倍率
     * @param {number} multiplier - 倍率
     * @returns {string} 颜色代码
     */
    _checkColor(multiplier) {
        if (multiplier > 1) return '#00FF00';  // 绿色（增益）
        if (multiplier < 1) return '#FF0000';  // 红色（减益）
        return '#FFFFFF';  // 白色（正常）
    }
    
    /**
     * 生成HTML格式的属性字符串（用于DOM显示）
     * @returns {string}
     */
    printString() {
        const greenColor = '#00FF00';
        const redColor = '#FF0000';
        const clickableColor = '#FFFF00';
        let str = '';
        
        // 等级
        if (this._level < GameConstants.MAX_LEVEL) {
            str += `Lv${this._level}（升级所需经验${this._getNextLevelExp()}）`;
        } else {
            str += `Lv${this._level}（巅峰+${this._extraLevel || 0}）`;
        }
        
        // 生命（含倍率颜色）
        const lifeMul = 1 + this._getBuffMultiplier(ChessProperty.STAT.LIFE);
        let color = this._checkColor(lifeMul);
        str += `<br>生命${this._curLife}/<font color='${color}'>${this.actualLife}</font>`;
        if (this._curLife <= 0) {
            str += `<font color='${redColor}'> 死亡</font>`;
        } else if (this._isNearDeath()) {
            str += `<font color='${redColor}'> 濒死</font>`;
        }
        
        // 攻击
        const atkMul = 1 + this._getBuffMultiplier(ChessProperty.STAT.ATTACK);
        color = this._checkColor(atkMul);
        str += `<br>攻击<font color='${color}'>${this.actualAttack}</font>`;
        if (this._weapon) {
            str += `<a href='#' data-action='weapon'>【`;
            str += this._getEquipNameWithColor(this._weapon, false);
            str += `】</a>`;
        } else {
            str += `【看得见剑】`;
        }
        
        // 防御
        const defMul = 1 + this._getBuffMultiplier(ChessProperty.STAT.DEFENSE);
        color = this._checkColor(defMul);
        str += `<br>防御<font color='${color}'>${this.actualDefense}</font>`;
        if (this._armor) {
            str += `<a href='#' data-action='armor'>【`;
            str += this._getEquipNameWithColor(this._armor, true);
            str += `】</a>`;
        } else {
            str += `【看得见甲】`;
        }
        
        // 天赋链接
        str += `<br><a href='#' data-action='talent'><font color='${clickableColor}'>&lt;人物天赋&gt;</font></a>`;
        
        // 耐力
        const staMul = 1 + this._getBuffMultiplier(ChessProperty.STAT.STAMINA);
        color = this._checkColor(staMul);
        str += `<br>耐力${this._curStamina}/<font color='${color}'>${this.actualStamina}</font>`;
        
        // 背包（点击可查看详情）
        const wgtMul = 1 + this._getBuffMultiplier(ChessProperty.STAT.WEIGHT);
        color = this._checkColor(wgtMul);
        if (this._overWeight) {
            str += `<br><font color='${redColor}'>不堪重负</font>${this._curWeight}/<font color='${color}'>${this.actualWeight}</font>`;
        } else {
            str += `<br><a href='#' data-action='bag'><font color='${clickableColor}'>${this.getBagName()}</font></a> ${this._curWeight}/<font color='${color}'>${this.actualWeight}</font>`;
        }
        
        // 随从
        if (!this._follower) {
            str += `<br>随从【无】`;
        } else {
            str += `<br>随从<a href='#' data-action='follower'>【<font color='${clickableColor}'>${this._follower.name}</font>】</a>`;
        }
        
        // 坐骑
        if (!this._mount) {
            str += `<br>坐骑【无】`;
        } else {
            str += `<br>坐骑<a href='#' data-action='mount'>【<font color='${clickableColor}'>${this._mount.name}</font>】</a>`;
        }
        
        // 遗物链接
        str += `<br><a href='#' data-action='relic'><font color='${clickableColor}'>&lt;勇者遗物&gt;</font></a>`;
        
        // 物品
        str += `<br>垃圾${this._rubbish}`;
        const bankStuff = this._bank ? (this._bank[0] || 0) : 0;
        const bankRare = this._bank ? (this._bank[1] || 0) : 0;
        str += `<br>基础锻材${this._stuff}【${bankStuff}】`;
        str += `<br>稀有锻材${this._rarestuff}【${bankRare}】`;
        str += `<br>金钱${this._gold}`;
        
        // 名声（含竞技场等级）
        str += `<br>名声${this._fame}`;
        const fameRank = this._getFameRank();
        if (fameRank) {
            str += `（${fameRank}）`;
        }
        
        return str;
    }
    
    // ========== 随从/坐骑装备方法 ==========
    
    /**
     * 雇佣随从
     * @param {Object} follower - 随从对象
     * @returns {this}
     */
    recruitFollower(follower) {
        this._follower = follower;
        this._recalculateAll();
        
        if (this.chess) {
            this.chess.addGreenChat(follower.printRecruitedInfo());
        }
        
        console.log(`[Follower] 雇佣随从: ${follower.name} Rank${follower.rank}`);
        return this;
    }
    
    /**
     * 解雇随从
     * @returns {this}
     */
    fireFollower() {
        if (this._follower) {
            const name = this._follower.name;
            this._follower = null;
            this._recalculateAll();
            console.log(`[Follower] 解雇随从: ${name}`);
        }
        return this;
    }
    
    /**
     * 装备坐骑
     * @param {Object} mount - 坐骑对象
     * @returns {this}
     */
    equipMount(mount) {
        this._mount = mount;
        this._recalculateAll();
        
        if (this.chess) {
            this.chess.addGreenChat(`装备坐骑【${mount.name}】`);
        }
        
        console.log(`[Mount] 装备坐骑: ${mount.name}`);
        return this;
    }
    
    /**
     * 卸下坐骑
     * @returns {this}
     */
    unequipMount() {
        if (this._mount) {
            const name = this._mount.name;
            this._mount = null;
            this._recalculateAll();
            console.log(`[Mount] 卸下坐骑: ${name}`);
        }
        return this;
    }
}
