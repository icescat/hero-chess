/**
 * 遗物系统（单例）
 * 对应 AS3: csh.model.Relics
 * 
 * 功能：
 * 1. 17种遗物数据管理
 * 2. 遗物获取和领取
 * 3. 遗物效果系统
 * 4. 龙翔化石合成
 */

class Relic {
    // 遗物类型
    static TYPE_SPECIAL = 1;    // 特殊效果（耐力、负重等）
    static TYPE_BATTLE = 2;     // 战斗属性（命中、暴击等）
    static TYPE_DRAGON = 3;     // 龙翔化石
    
    // 特殊遗物编号
    static BANDAGE = 10;        // 急救绷带
    static SMITH_NOTE = 11;     // 锻造笔记
    static SOUL_STONE_NO = 18;  // 灵魂石

    static _instance = null;
    
    constructor() {
        if (Relic._instance) {
            return Relic._instance;
        }
        
        this.relicArr = [];      // 遗物数组
        this.relicRemain = [];   // 各类型遗物是否还有剩余
        
        this.initRelics();
        Relic._instance = this;
        
        console.log('[Relic] 遗物系统已初始化，共' + this.relicArr.length + '个遗物');
    }
    
    static getInstance() {
        if (!Relic._instance) {
            new Relic();
        }
        return Relic._instance;
    }
    
    /**
     * 初始化遗物数据（数据驱动）
     */
    initRelics() {
        this.relicRemain = [true, true, true];  // type 1/2/3
        
        // ✅ 从JSON数据库加载遗物数据
        const relicData = DataManager.getRelics();
        
        if (!relicData || relicData.length === 0) {
            console.error('[Relic] ❌ 遗物数据加载失败！');
            this.relicArr = [];
            return;
        }
        
        // 将JSON数据转换为游戏对象（添加运行时属性）
        this.relicArr = relicData.map(data => ({
            ...data,  // 复制JSON数据
            legend: data.isLegend,  // 兼容旧属性名
            took: false,  // 运行时状态
            colorName: data.isLegend 
                ? '【' + data.name + '】'  // 传奇橙色
                : '【' + data.name + '】'  // 紫色
        }));
        
        console.log(`[Relic] ✓ 遗物数据初始化完成（数据驱动）：${this.relicArr.length}个遗物`);
    }
    
    /**
     * 标记遗物已被领取
     * @param {Object} relic 遗物对象
     */
    relicTook(relic) {
        if (!relic || this.relicArr.indexOf(relic) === -1) {
            return;
        }
        
        relic.took = true;
        
        // 检查该类型是否还有剩余
        const remainingOfType = this.relicArr.filter(r => 
            !r.took && r.type === relic.type
        );
        
        if (remainingOfType.length === 0) {
            this.relicRemain[relic.type - 1] = false;
        }
    }
    
    /**
     * 获取指定索引的遗物
     * @param {number} index 遗物索引（0-17）
     * @returns {Object}
     */
    getRelic(index) {
        return this.relicArr[index];
    }
    
    /**
     * 根据遗物编号获取遗物
     * @param {number} relicNo 遗物编号（1-18）
     * @returns {Object|null}
     */
    getRelicByNo(relicNo) {
        return this.relicArr.find(r => r.relicNo === relicNo) || null;
    }
    
    /**
     * 检查指定类型是否还有遗物
     * @param {number} type 遗物类型（1/2/3）
     * @returns {boolean}
     */
    getRelicRemain(type) {
        return this.relicRemain[type - 1];
    }
    
    /**
     * 随机获取指定类型的遗物
     * @param {number} type 遗物类型（1/2/3）
     * @returns {Object|null}
     */
    getRandomRelic(type) {
        const available = [];
        
        for (let i = 0; i < this.relicArr.length; i++) {
            if (!this.relicArr[i].took && this.relicArr[i].type === type) {
                available.push(i);
            }
        }
        
        if (available.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * available.length);
        return this.relicArr[available[randomIndex]];
    }
    
    /**
     * 获取龙池遗物（龙翔化石）
     * @returns {Object|null}
     */
    getDragonPoolRelic() {
        const right = this.relicArr[11];  // 右半边
        const left = this.relicArr[12];   // 左半边
        
        if (!right.took && !left.took) {
            // 两个都没拿，随机给一个
            return Math.random() > 0.5 ? right : left;
        } else if (!right.took) {
            return right;
        } else if (!left.took) {
            return left;
        }
        
        return null;
    }
    
    /**
     * 检查龙翔化石是否可以合成
     * @returns {Object|null} 返回完整的龙翔化石，或null
     */
    checkMergeDragonPoolRelic() {
        const right = this.relicArr[11];
        const left = this.relicArr[12];
        const complete = this.relicArr[13];
        
        if (right.took && left.took) {
            return complete;
        }
        
        return null;
    }
    
    /**
     * 重置所有遗物（新游戏）
     */
    reset() {
        this.relicRemain = [true, true, true];
        
        for (let i = 0; i < this.relicArr.length; i++) {
            this.relicArr[i].took = false;
        }
        
        console.log('[Relic] 遗物系统已重置');
    }
}




