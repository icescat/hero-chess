/**
 * 敌人类
 * 对应 AS3: csh.model.Enemy
 * 
 * 功能：
 * 1. 敌人属性（等级、生命、攻防）
 * 2. 敌人类型（普通、精英、Boss、劲敌、传说）
 * 3. 战利品（经验、金钱、名声、素材）
 * 4. 敌人生成（静态方法）
 */

class Enemy {
    // 敌人类型常量
    static NORMAL = 1;   // 普通敌人
    static ELITE = 2;    // 精英敌人
    static BOSS = 3;     // Boss
    static RIVAL = 4;    // 劲敌
    static LEGEND = 5;   // 传说级
    
    /**
     * 构造函数
     * @param {number} level - 等级
     * @param {number} type - 类型（NORMAL/ELITE/BOSS/RIVAL/LEGEND）
     * @param {number} race - 种族（0默认）
     * @param {boolean} isRare - 是否稀有
     */
    constructor(level, type, race = 0, isRare = false) {
        this.enemyNo = 0;              // 敌人编号
        this._maxLevel = 90;           // 最大等级
        
        // 设置等级
        if (level > this._maxLevel) {
            this._level = this._maxLevel;
            this.actualLevel = level;  // 实际等级（可超上限）
        } else {
            this._level = level;
            this.actualLevel = level;
        }
        
        this._type = type;             // 敌人类型
        this.race = race;              // 种族
        this.isRare = isRare;          // 是否稀有
        
        // 战斗属性
        this._maxLife = 0;             // 最大生命
        this._curLife = 0;             // 当前生命
        this._attack = 0;              // 攻击力
        this._defense = 0;             // 防御力
        this._critical = 0;            // 暴击率
        
        // 战利品
        this.exp = 0;                  // 击败后获得经验
        this.gold = 0;                 // 击败后获得金钱
        this.fame = 0;                 // 击败后获得名声
        this.rubbish = 0;              // 掉落垃圾
        this.stuff = 0;                // 掉落基础素材
        this.rarestuff = 0;            // 掉落稀有素材
        this.nostuff = false;          // 不掉落素材
        
        // 名称
        this.alias = '';               // 别名
        
        this.initialize();
        
        console.log(`[Enemy] 生成敌人: Lv${this._level} Type${this._type}`);
    }
    
    /**
     * 初始化敌人属性（完全对应AS3逻辑）
     */
    initialize() {
        // 基础点数：3 + 等级
        const basePoints = 3 + this.actualLevel;
        
        // 随机属性倾向（0=坦克型, 1=均衡型, 2=输出型）
        const attrType = RandomUtils.randInt(0, 2);  // 优化：属性类型[0,2]
        
        // 确定生命、攻击、防御比例
        let lifeRatio, attackRatio;
        
        if (this.race === 3) {  // 特殊种族（坦克型）
            lifeRatio = 0.5;
            attackRatio = 0.2;
        } else if (attrType === 2) {  // 输出型
            lifeRatio = 0.3;
            attackRatio = 0.4;
        } else if (attrType === 1) {  // 均衡型
            lifeRatio = 0.4;
            attackRatio = 0.3;
        } else {  // 坦克型
            lifeRatio = 0.5;
            attackRatio = 0.2;
        }
        
        // 分配点数
        const lifePoints = Math.max(1, Math.floor(basePoints * lifeRatio));
        const attackPoints = Math.max(1, Math.floor(basePoints * attackRatio));
        const defensePoints = basePoints - lifePoints - attackPoints;
        
        // 通关次数加成（假设为0，后续可从棋盘获取）
        const clearedBonus = 0; // Chessboard.current.gameCleared * 0.2
        
        // 等级阶段（1-15 / 16-45 / 46-90）
        const levelPhase = Math.floor(this._level / 15);
        
        // 根据类型和等级阶段确定倍率
        let lifeMul = 1;
        let attackMul = 1;
        let defenseMul = 1;
        
        // 暴击率
        this._critical = 0.1;
        
        switch (this._type) {
            case Enemy.ELITE:
                if (levelPhase <= 1) {
                    attackMul = 1.5;
                    lifeMul = 2;
                } else if (levelPhase <= 3) {
                    attackMul = 2;
                    defenseMul = 1.2;
                    lifeMul = 2;
                } else {
                    attackMul = 2.5;
                    defenseMul = 1.4;
                    lifeMul = 3;
                }
                this._critical = 0.15;
                break;
                
            case Enemy.BOSS:
            case Enemy.LEGEND:
                if (levelPhase <= 1) {
                    attackMul = 2;
                    lifeMul = 3;
                } else if (levelPhase <= 3) {
                    attackMul = 2.5;
                    defenseMul = 1.2;
                    lifeMul = 3;
                } else {
                    attackMul = 3;
                    defenseMul = 1.4;
                    lifeMul = 4;
                }
                this._critical = 0.2;
                break;
                
            case Enemy.RIVAL:
                if (this.race === 4) {
                    lifeMul = attackMul = 1;
                } else if (levelPhase <= 3) {
                    attackMul = 2;
                } else {
                    attackMul = 3;
                    defenseMul = 1.2;
                }
                this._critical = 0.2;
                break;
                
            default:  // NORMAL
                attackMul = (this.race !== 3) ? 1.5 : (2 + levelPhase);
                if (levelPhase <= 1) {
                    attackMul = (this.race !== 3) ? 1 : (1 + levelPhase);
                    lifeMul = 1;
                } else if (levelPhase <= 3) {
                    lifeMul = 1.5;
                } else {
                    lifeMul = 2.5;
                }
        }
        
        // 应用通关加成
        attackMul += clearedBonus;
        
        // 计算最终属性
        this._maxLife = Math.floor(lifePoints * 100 * lifeMul * attackMul);
        this._curLife = this._maxLife;
        this._attack = Math.floor(attackPoints * 10 * lifeMul * defenseMul);
        this._defense = Math.floor(defensePoints * 5 * lifeMul);
        
        // 刷新战利品
        this._refreshLoot();
        
        console.log(`[Enemy] 初始化完成 - 生命:${this._maxLife} 攻击:${this._attack} 防御:${this._defense}`);
    }
    
    /**
     * 刷新战利品（对应AS3的refreshLoot）
     */
    _refreshLoot() {
        this.exp = this._level * 5;
        this.gold = this._level * 20;
        this.fame = 0;
        this.stuff = 0;
        this.rarestuff = 0;
        this.rubbish = RandomUtils.percent(30) ? Math.ceil(this._level / 15) * 4 : 0;  // 优化：30%概率掉落垃圾
        
        if (this._type === Enemy.NORMAL) {
            this.stuff = Math.ceil(this._level / 10);
            if (this.isRare) {
                this.fame = Math.ceil(this._level / 30);
                this.rarestuff = Math.ceil(this._level / 30);
            } else if (this.race === 1) {
                this.fame = Math.ceil(this._level / 30);
                this.gold *= 2;
            } else if (this.race === 2) {
                this.rarestuff = Math.ceil(this._level / 30);
            }
        } else if (this._type === Enemy.ELITE) {
            this.exp *= 2;
            this.gold *= 2;
            this.stuff = Math.ceil(this._level / 10) * 2;
            if (this.isRare) {
                this.fame = Math.ceil(this._level / 30) * 2;
                this.rarestuff = Math.ceil(this._level / 30) * 3;
            } else {
                this.fame = Math.ceil(this._level / 30);
                this.rarestuff = Math.ceil(this._level / 30) * 2;
            }
        } else if (this._type === Enemy.BOSS) {
            this.rubbish = 0;
            this.exp *= 4;
            this.gold *= 4;
            this.stuff = Math.ceil(this._level / 10) * 3;
            if (this.isRare) {
                this.fame = Math.ceil(this._level / 30) * 6;
                this.rarestuff = Math.ceil(this._level / 15) * 3;
            } else {
                this.fame = Math.ceil(this._level / 30) * 3;
                this.rarestuff = Math.ceil(this._level / 15) * 2;
            }
        } else if (this._type === Enemy.LEGEND) {
            this.rubbish = 0;
            this.exp *= 4;
            this.gold *= 4;
            this.fame = Math.ceil(this._level / 30) * 8;
            this.stuff = Math.ceil(this._level / 10) * 3;
            this.rarestuff = Math.ceil(this._level / 15) * 3;
        }
    }
    
    // ========== Getters and Setters ==========
    
    get level() {
        return this._level;
    }
    
    set level(value) {
        this._level = Math.min(this._maxLevel, value);
    }
    
    get maxLife() {
        return this._maxLife;
    }
    
    set maxLife(value) {
        this._maxLife = value;
    }
    
    get curLife() {
        return this._curLife;
    }
    
    set curLife(value) {
        this._curLife = Math.max(0, Math.min(this._maxLife, value));
    }
    
    get attack() {
        return this._attack;
    }
    
    set attack(value) {
        this._attack = value;
    }
    
    get defense() {
        return this._defense;
    }
    
    set defense(value) {
        this._defense = value;
    }
    
    get type() {
        return this._type;
    }
    
    /**
     * 是否死亡
     */
    get isDead() {
        return this._curLife <= 0;
    }
    
    /**
     * 是否濒死（可能触发死亡一击）
     */
    get canDeathAttack() {
        return (this._curLife / this._maxLife < 0.3) && RandomUtils.percent(20);  // 优化：20%概率狂怒
    }
    
    /**
     * 是否可暴击
     */
    get canCritical() {
        return RandomUtils.chance(this._critical);  // 优化：暴击概率判断
    }
    
    /**
     * 是否濒死状态（生命低于30%）
     */
    get isNearDeath() {
        return (this._curLife / this._maxLife) < 0.3;
    }
    
    // ========== 战斗方法 ==========
    
    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     * @returns {boolean} 是否死亡
     */
    takeDamage(damage) {
        this._curLife = Math.max(0, this._curLife - damage);
        return this._curLife <= 0;
    }
    
    /**
     * 恢复生命
     * @param {number} heal - 恢复量
     */
    heal(heal) {
        this._curLife = Math.min(this._maxLife, this._curLife + heal);
    }
    
    /**
     * 获取实际等级（基于属性计算）
     * @returns {number}
     */
    getActualLevel() {
        const lifePoints = Math.floor(this._maxLife / 100);
        const attackPoints = Math.floor(this._attack / 10);
        const defensePoints = Math.floor(this._defense / 5);
        return lifePoints + attackPoints + defensePoints - 3;
    }
    
    /**
     * 缩放属性
     * @param {number} scale - 缩放比例
     */
    scaleAttrs(scale = 1) {
        if (scale !== 0 && scale !== 1) {
            this._maxLife = Math.ceil(this._maxLife * scale);
            this._curLife = this._maxLife;
            this._defense = Math.ceil(this._defense * scale);
            this._attack = Math.ceil(this._attack * scale);
        }
    }
    
    /**
     * 设置为魔王分身
     * @param {number} beatCount - 击败魔王次数
     */
    setAsDevil(beatCount = 0) {
        const lifeMul = Math.max(2, 6 - beatCount * 0.2);
        this._maxLife = Math.ceil(this._maxLife * lifeMul);
        this._curLife = this._maxLife;
        
        const defenseMul = Math.max(2, 4 - beatCount * 0.2);
        this._defense = Math.ceil(this._defense * defenseMul);
        
        const attackMul = Math.max(2, 3 - beatCount * 0.2);
        this._attack = Math.ceil(this._attack * attackMul);
        
        // 魔王不掉落材料
        this.setStuffNone();
        
        console.log(`[Enemy] 设置为魔王（击败${beatCount}次）`);
    }
    
    /**
     * 设置为真·魔王本体
     */
    setAsTrueDevil() {
        this._maxLife = Math.ceil(this._maxLife * 10);
        this._curLife = this._maxLife;
        this._defense = Math.ceil(this._defense * 6);
        this._attack = Math.ceil(this._attack * 4);
        
        console.log('[Enemy] 设置为真·魔王本体');
    }
    
    /**
     * 设置为英雄级（2倍属性和战利品）
     */
    setAsHeroic() {
        this.scaleAttrs(2);
        this.exp *= 2;
        this.gold *= 2;
        this.fame *= 2;
        
        console.log('[Enemy] 设置为英雄级');
    }
    
    /**
     * 为劲敌装备武器护甲
     * @param {number} equipSetNo - 装备套装编号
     */
    equipForRival(equipSetNo) {
        // 需要从Equips获取装备数据
        if (window.Equips) {
            const equips = Equips.getInstance();
            const weapon = equips.getWeapon(equipSetNo);
            const armor = equips.getArmor(equipSetNo);
            
            if (weapon) {
                this._attack += weapon.attack || 0;
            }
            
            if (armor) {
                this._defense += armor.defense || 0;
                this._maxLife += armor.life || 0;
                this._curLife = this._maxLife;
            }
            
            console.log(`[Enemy] 装备套装${equipSetNo}for劲敌`);
        }
    }
    
    /**
     * 设置不掉落材料
     */
    setStuffNone() {
        this.rubbish = 0;
        this.stuff = 0;
        this.rarestuff = 0;
        this.nostuff = true;
    }
    
    // ========== 静态工厂方法 ==========
    
    /**
     * 生成魔物（地牢用）
     * @param {number} playerLevel - 玩家等级
     * @returns {Enemy}
     */
    static generateDemon(playerLevel) {
        let level = playerLevel;
        let type = (playerLevel > 10 && RandomUtils.percent(30)) ? Enemy.ELITE : Enemy.NORMAL;  // 优化：30%精英
        let isRare = false;
        
        // 等级浮动 - AS3: 3 - Math.round(Math.random() * 6) = -3到+3的范围
        if (playerLevel > 7) {
            const levelOffset = 3 - Math.round(Math.random() * 6);
            level += levelOffset;
            
            // 高等级有几率生成稀有敌人
            if (level > 10 && RandomUtils.percent(20)) {  // 优化：20%概率劲敌
                isRare = true;
            }
        }
        
        return new Enemy(level, type, 0, isRare);
    }
    
    /**
     * 生成传说魔物
     * @param {number} playerLevel - 玩家等级
     * @returns {Enemy}
     */
    static generateLegendDemon(playerLevel) {
        const level = Math.max(30, playerLevel + 5);
        return new Enemy(level, Enemy.LEGEND);
    }
    
    /**
     * 生成Boss
     * @param {number} playerLevel - 玩家等级
     * @returns {Enemy}
     */
    static generateBoss(playerLevel) {
        const level = Math.max(playerLevel, 10);
        return new Enemy(level, Enemy.BOSS);
    }
    
    /**
     * 生成劲敌
     * @param {number} playerLevel - 玩家等级
     * @returns {Enemy}
     */
    static generateRival(playerLevel) {
        const level = Math.max(playerLevel - 2, 5);
        return new Enemy(level, Enemy.RIVAL);
    }
    
    /**
     * 创建带等级偏移的敌人
     * @param {number} playerLevel - 玩家等级
     * @param {number} offset - 等级偏移量
     * @param {number} type - 敌人类型
     * @param {number} race - 种族
     * @param {boolean} isRare - 是否稀有
     * @returns {Enemy}
     */
    static createWithLevelOffset(playerLevel, offset, type = Enemy.NORMAL, race = 0, isRare = false) {
        const level = Math.max(10, playerLevel + offset);
        return new Enemy(level, type, race, isRare);
    }
    
    /**
     * 获取敌人名称
     * @returns {string}
     */
    getName() {
        let name = this.isRare ? '稀有' : '';
        
        switch (this._type) {
            case Enemy.ELITE:
                name += '精英级怪物';
                break;
            case Enemy.BOSS:
                name += '头目级怪物';
                break;
            case Enemy.RIVAL:
                name = '对手';
                break;
            case Enemy.LEGEND:
                name = '传说级怪物';
                break;
            default:
                name += '怪物';
        }
        
        return name;
    }
    
    /**
     * 获取敌人描述文本
     * @returns {string}
     */
    getDescription() {
        return `${this.getName()} Lv${this._level} HP${this._curLife}/${this._maxLife} 攻${this._attack} 防${this._defense}`;
    }
}

