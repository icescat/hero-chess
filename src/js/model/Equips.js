/**
 * 装备管理类（单例）
 * 对应 AS3: csh.model.Equips
 * 
 * 功能：
 * 1. 管理所有武器和护甲数据
 * 2. 装备品质系统（普通→优秀→精良→史诗→传奇）
 * 3. 装备强化系统（+0到+9）
 * 4. 锻造材料需求管理
 * 5. 装备克隆和升级
 */

class Equips {
    static _instance = null;
    
    /**
     * 获取单例
     * @returns {Equips}
     */
    static getInstance() {
        if (!Equips._instance) {
            Equips._instance = new Equips();
        }
        return Equips._instance;
    }
    
    constructor() {
        if (Equips._instance) {
            return Equips._instance;
        }
        
        // 最大套装编号（默认只开放到史诗12，传奇需解锁）
        this._maxSetNo = 12;
        this._epicMaxSetNo = 12;    // 史诗最大编号
        this._legendMaxSetNo = 15;  // 传奇最大编号
        
        // 装备数据数组
        this.weapons = [];   // 武器
        this.armors = [];    // 护甲
        this.requiredStuffs = []; // 锻造材料需求
        
        this.initEquips();
        
        console.log('[Equips] 装备系统已初始化');
    }
    
    /**
     * 获取当前最大套装编号
     */
    get maxSetNo() {
        return this._maxSetNo;
    }
    
    /**
     * 获取史诗最大编号
     */
    get epicMaxSetNo() {
        return this._epicMaxSetNo;
    }
    
    /**
     * 获取传奇最大编号
     */
    get legendMaxSetNo() {
        return this._legendMaxSetNo;
    }
    
    /**
     * 获取武器
     * @param {number} setNo 套装编号
     * @returns {Object}
     */
    getWeapon(setNo) {
        return this.weapons[setNo];
    }
    
    /**
     * 获取护甲
     * @param {number} setNo 套装编号
     * @returns {Object}
     */
    getArmor(setNo) {
        return this.armors[setNo];
    }
    
    /**
     * 克隆装备（用于玩家获得装备时）
     * @param {number} setNo 套装编号
     * @param {boolean} isWeapon true=武器, false=护甲
     * @returns {Object} 装备副本
     */
    cloneEquip(setNo, isWeapon) {
        const original = isWeapon ? this.weapons[setNo] : this.armors[setNo];
        const clone = {};
        
        // 复制所有属性
        for (const key in original) {
            clone[key] = original[key];
        }
        
        clone.isClone = true;
        clone.power = 0; // 强化等级默认为0
        
        return clone;
    }
    
    /**
     * 获取锻造所需材料
     * @param {number} setNo 套装编号
     * @returns {Object} {stuff: 普通材料数量, rare: 稀有材料数量}
     */
    getRequiredStuff(setNo) {
        return this.requiredStuffs[setNo];
    }
    
    /**
     * 解锁传奇装备
     * @returns {number} 新的最大编号
     */
    unlockLegendEquip() {
        this._maxSetNo = this._legendMaxSetNo;
        console.log('[Equips] 传奇装备已解锁');
        return this._maxSetNo;
    }
    
    /**
     * 锁定传奇装备
     * @returns {number} 新的最大编号
     */
    lockLegendEquip() {
        this._maxSetNo = this._epicMaxSetNo;
        console.log('[Equips] 传奇装备已锁定');
        return this._maxSetNo;
    }
    
    /**
     * 获取锻造成功率
     * @param {number} setNo 套装编号
     * @returns {number} 成功率（0-1）
     */
    getSmithRate(setNo) {
        return (this._legendMaxSetNo - setNo) / this._legendMaxSetNo;
    }
    
    /**
     * 获取带颜色的装备名称
     * @param {Object} equip 装备对象
     * @param {boolean} isGolden 是否金色（遗物）
     * @returns {string} HTML格式的带颜色名称
     */
    getNameWithColor(equip, isGolden = false) {
        let color = '#FFFFFF'; // 普通=白色
        
        switch (equip.quality) {
            case 1: color = '#00FF00'; break; // 优秀=绿色
            case 2: color = '#0066FF'; break; // 精良=蓝色
            case 3: color = '#9900FF'; break; // 史诗=紫色
            case 4: color = '#FF9900'; break; // 传奇=橙色
        }
        
        if (isGolden) {
            color = '#FFCC33'; // 金色（遗物）
        }
        
        let name = equip.name;
        if (equip.power && equip.power > 0) {
            name += `+${equip.power}`;
        }
        
        return `<font color='${color}'>${name}</font>`;
    }
    
    /**
     * 获取品质名称
     * @param {Object} equip 装备对象
     * @returns {string}
     */
    getQualityName(equip) {
        switch (equip.quality) {
            case 1: return '优秀品质';
            case 2: return '精良品质';
            case 3: return '史诗品质';
            case 4: return '传奇品质';
            default: return '普通品质';
        }
    }
    
    /**
     * 获取装备描述
     * @param {Object} equip 装备对象
     * @param {boolean} isWeapon true=武器, false=护甲
     * @returns {string}
     */
    getEquipDescription(equip, isWeapon) {
        const lines = [];
        
        lines.push(this.getNameWithColor(equip));
        lines.push(this.getQualityName(equip));
        
        if (isWeapon) {
            const attack = this._getEquipAttr(equip, 'attack');
            lines.push(`攻击力：${attack}`);
        } else {
            const defense = this._getEquipAttr(equip, 'defense');
            const life = this._getEquipAttr(equip, 'life');
            lines.push(`防御力：${defense}`);
            lines.push(`生命值：${life}`);
        }
        
        if (equip.power > 0) {
            lines.push(`强化等级：+${equip.power}`);
        }
        
        return lines.join('\n');
    }
    
    /**
     * 获取装备属性（考虑强化）
     * @param {Object} equip 装备对象
     * @param {string} attrName 属性名（'attack', 'defense', 'life'）
     * @returns {number}
     */
    _getEquipAttr(equip, attrName) {
        const baseValue = equip[attrName] || 0;
        const power = equip.power || 0;
        
        // 每级强化增加10%属性
        return Math.floor(baseValue * (1 + power * 0.1));
    }
    
    /**
     * 初始化装备数据（数据驱动）
     */
    initEquips() {
        // ✅ 从JSON数据库加载装备数据
        const equipData = DataManager.exportData().equips;
        const materialData = DataManager.getMaterials();
        
        if (!equipData || !equipData.weapons || !equipData.armors) {
            console.error('[Equips] ❌ 装备数据加载失败！');
            this.weapons = [];
            this.armors = [];
            this.requiredStuffs = [];
            return;
        }
        
        // 转换为游戏内部格式（数组索引访问）
        this.weapons = [];
        this.armors = [];
        this.requiredStuffs = [];
        
        equipData.weapons.forEach(weapon => {
            this.weapons[weapon.setNo] = { ...weapon };
        });
        
        equipData.armors.forEach(armor => {
            this.armors[armor.setNo] = { ...armor };
        });
        
        materialData.forEach(material => {
            this.requiredStuffs[material.setNo] = {
                stuff: material.stuff,
                rare: material.rare
            };
        });
        
        console.log(`[Equips] ✓ 装备数据初始化完成（数据驱动）：${this.weapons.length}种武器，${this.armors.length}种护甲`);
    }
}

