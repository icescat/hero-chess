/**
 * AI自动游戏配置文件
 * 在这里调整AI的决策阈值
 * 
 * 创建日期：2025-12-01
 * 版本：V1.1.0
 */

class AIConfig {
    /**
     * 住宿/休息相关配置
     */
    static REST_CONFIG = {
        // 紧急休息阈值（生存评分低于此值立即休息）
        EMERGENCY_REST: 30,
        
        // 耐力较低休息阈值（生存评分低于此值考虑休息）
        LOW_STAMINA_REST: 30,  // 改小这个值可以减少休息频率（默认50）
        
        // 是否允许"默认休息"（到城镇/村庄没事就休息）
        ALLOW_DEFAULT_REST: false,  // 改为false可以禁止默认休息（默认true）
    };
    
    /**
     * 战斗相关配置
     */
    static COMBAT_CONFIG = {
        // 竞技场参战等级阈值
        ARENA_EARLY_LEVEL: 16,    // 前期观战上限（默认16）
        ARENA_MID_LEVEL: 26,      // 中期谨慎上限（默认26）
        
        // 战斗最低要求
        MIN_COMBAT_SCORE: 40,     // 最低战力评分
        MIN_SURVIVAL_SCORE: 50,   // 最低生存评分
    };
    
    /**
     * 经济相关配置
     */
    static WEALTH_CONFIG = {
        // 购买物品金钱阈值（商店购买药水、道具等）
        STORE_MIN_GOLD: 10000,
        STORE_MIN_WEALTH: 60,
        
        // 雇佣随从金钱阈值
        RECRUIT_MIN_GOLD: 3500,
        RECRUIT_MIN_LEVEL: 6,
        RECRUIT_MIN_WEALTH: 40,
        
        // 投资建筑金钱阈值
        INVEST_MIN_WEALTH: 50,
    };
    
    /**
     * 铸造装备相关配置
     * 注意：铸造主要看材料，不看金钱！
     * 强化装备需要200金，但锻造新装备只需要材料
     */
    static SMITH_CONFIG = {
        // 强化装备金钱要求（每次强化固定200金）
        ENHANCE_COST: 200,
        
        // AI是否优先强化装备（vs 锻造新装备）
        PREFER_ENHANCE: false,  // false=优先锻造新装备
    };
    
    /**
     * 任务相关配置
     */
    static QUEST_CONFIG = {
        // 接任务条件
        QUEST_MIN_SURVIVAL: 60,
        QUEST_MIN_COMBAT: 40,
    };
    
    /**
     * 马场相关配置
     */
    static STABLE_CONFIG = {
        // 购买马匹金钱阈值
        BUY_HORSE_MIN_GOLD: 2000,    // 至少留5000金才买马
        BUY_HORSE_MIN_LEVEL: 5,      // 5级以上才考虑买马
        BUY_HORSE_MIN_WEALTH: 50,    // 财富评分50以上
        
        // 训练马匹金钱阈值（每次1000金）
        TRAIN_HORSE_MIN_GOLD: 3000,
        
        // 赛马vs训练的选择
        RACE_WHEN_POOR: true,        // 缺钱时优先赛马
        TRAIN_PROBABILITY: 0.7,      // 有钱时训练概率（0.7=70%训练，30%赛马）
    };
    
    /**
     * 生存评分权重配置
     * （在StateEvaluator.js中使用）
     */
    static SURVIVAL_WEIGHTS = {
        LIFE_WEIGHT: 50,      // 生命值权重（满生命=50分）
        STAMINA_WEIGHT: 40,   // 耐力权重（满耐力=40分）
        
        // 负面Buff惩罚
        SICK_PENALTY: 30,
        WEAK_PENALTY: 20,
        CURSE_PENALTY: 15,
        
        // 负重惩罚
        OVERWEIGHT_PENALTY: 20,
        NEAR_OVERWEIGHT_PENALTY: 10,
    };
}

