/**
 * Buff编号常量
 * 对应 AS3: csh.model.BuffNo
 * 
 * Buff类型说明：
 * - 增益Buff（正面效果）
 * - 减益Buff（负面效果，如生病、晕船）
 * - 特殊Buff（遗物、道具效果）
 */

class BuffNo {
    // ========== 基础状态Buff ==========
    static SATISFIED = 1;        // 满足（吃饱）
    static ENERGY = 2;           // 精力充沛
    static SICK = 3;             // 生病（减益）
    static SPA = 4;              // 温泉效果
    static HIGH_MORALE = 5;      // 士气高涨
    static LOW_MORALE = 6;       // 士气低落（减益）
    static SEASICK = 7;          // 晕船（减益）
    
    // ========== 战斗增益Buff ==========
    static BATTLEPOWER = 8;      // 战斗力提升
    static MOVEPOWER = 9;        // 移动力提升
    static NOTIRED = 13;         // 不疲劳
    static NEARWIN = 14;         // 必胜（99%胜率）
    
    // ========== 获取增益Buff ==========
    static LOOTMORE = 10;        // 获得更多战利品
    static FAMEMORE = 11;        // 获得更多名声
    static EXPMORE = 12;         // 获得更多经验
    
    // ========== 职业/随从Buff ==========
    static PRIEST_BUFF = 15;     // 牧师祝福
    static WARRIOR_BUFF = 16;    // 战士祝福
    
    // ========== 特殊效果Buff ==========
    static MASTER_SMITH = 17;    // 专注打铁30年（锻造加成）
    
    // ========== 道具/遗物Buff ==========
    static BEACON = 18;          // 指路魔棒（已废弃 - 功能未实现）
    static HAPPY = 19;           // 心旷神怡（仙境鲜气，生命/攻防+10%）
    static CARROT = 20;          // 胡萝卜（已废弃 - V1.0.5骑行系统改版）
    static PERFUME = 21;         // 迷幻香水（亲密度增益）
    static GOLDENDYE = 22;       // 翔色染料
    static WATER_RUN = 23;       // 漂浮雕文（踏水而行）
    static WEAK = 25;            // 虚弱（死亡后）
    
    // 注：灵魂石已改为遗物（relicNo: 18），不再是buff
    
    /**
     * 获取Buff名称
     * @param {number} buffNo Buff编号
     * @param {boolean} removeHtmlTags 是否移除HTML标签（默认true）
     * @returns {string} Buff名称
     */
    static getName(buffNo, removeHtmlTags = true) {
        const names = {
            [BuffNo.SATISFIED]: '满足',
            [BuffNo.ENERGY]: '精力充沛',
            [BuffNo.SICK]: '生病',
            [BuffNo.SPA]: '温泉',
            [BuffNo.HIGH_MORALE]: '士气高涨',
            [BuffNo.LOW_MORALE]: '士气低落',
            [BuffNo.SEASICK]: '晕船',
            [BuffNo.BATTLEPOWER]: '战斗力提升',
            [BuffNo.MOVEPOWER]: '移动力提升',
            [BuffNo.LOOTMORE]: '战利品增加',
            [BuffNo.FAMEMORE]: '名声增加',
            [BuffNo.EXPMORE]: '经验增加',
            [BuffNo.NOTIRED]: '不疲劳',
            [BuffNo.NEARWIN]: '必胜',
            [BuffNo.PRIEST_BUFF]: '牧师祝福',
            [BuffNo.WARRIOR_BUFF]: '战士祝福',
            [BuffNo.BEACON]: '信标',
            [BuffNo.GOLDENDYE]: '金色染料',
            [BuffNo.CARROT]: '胡萝卜',
            [BuffNo.PERFUME]: '香水',
            [BuffNo.MASTER_SMITH]: '大师级锻造',
            [BuffNo.WATER_RUN]: '踏水而行',
            [BuffNo.HAPPY]: '心旷神怡',
            [BuffNo.WEAK]: '虚弱'
        };
        let name = names[buffNo] || `未知Buff(${buffNo})`;
        
        // 移除HTML标签（CreateJS Text不支持HTML）
        if (removeHtmlTags) {
            name = name.replace(/<\/?font[^>]*>/g, '');
        }
        
        return name;
    }
    
    /**
     * 是否是减益Buff
     * @param {number} buffNo Buff编号
     * @returns {boolean}
     */
    static isDebuff(buffNo) {
        return buffNo === BuffNo.SICK || 
               buffNo === BuffNo.LOW_MORALE || 
               buffNo === BuffNo.SEASICK ||
               buffNo === BuffNo.WEAK;
    }
}

