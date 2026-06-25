/**
 * 游戏常量定义
 * V1.0+ 优化：统一管理魔法数字
 */

class GameConstants {
    // ==================== 金钱相关 ====================
    
    static STARTING_GOLD = 1000;           // 初始金钱
    static VILLAGE_REST_COST = 20;         // 村庄住宿费用
    static TOWN_REST_COST_FREE = 0;        // 城镇人气满免费
    static TOWN_REST_COST_NORMAL = 20;     // 城镇正常住宿费用
    static TAVERN_DRINK_COST = 100;        // 酒馆喝酒费用
    static MATERIAL_STORE_FEE_PER_UNIT = 1; // 材料存放费（每个）
    static RELIC_PURCHASE_COST = 3000;     // 遗物购买价格
    static TALENT_PURCHASE_COST = 1000;    // 天赋购买价格
    
    // ==================== 时间和回合 ====================
    
    static FOLLOWER_DURATION = 14;         // 随从雇佣时长（回合）
    static FOLLOWER_EXTEND_DURATION = 7;   // 续约延长时长（回合）
    static SICK_CURE_DAYS_WITH_WIFE = 2;   // 有妻子治疗生病天数
    static SICK_CURE_DAYS_NO_WIFE = 6;     // 无妻子治疗生病天数
    static SICK_WARNING_DAYS = 14;         // 久病成疾阈值
    static DRUNK_CHECK_ROUNDS = 6;         // 醉酒检查回合数
    static DRUNK_TRIGGER_COUNT = 3;        // 醉酒触发次数
    static FISHING_COOLDOWN_ROUNDS = 5;    // 钓鱼冷却回合
    static RUINED_DURATION_DAYS = 3;       // 城镇/村庄废墟恢复天数
    
    // ==================== 等级和经验 ====================
    
    static MAX_LEVEL = 90;                 // 最大等级
    static MAX_EXP = 40940;                // 最大经验
    static LEVEL_UP_BONUS_LIFE = 10;       // 每级生命增加
    static LEVEL_UP_BONUS_ATTACK = 2;      // 每级攻击增加
    static LEVEL_UP_BONUS_DEFENSE = 1;     // 每级防御增加
    
    // ==================== 属性基础值 ====================
    
    static STARTING_LIFE = 100;            // 初始生命
    static STARTING_ATTACK = 10;           // 初始攻击
    static STARTING_DEFENSE = 5;           // 初始防御
    static STARTING_STAMINA = 100;         // 初始耐力
    static STAMINA_CONSUME_BASE = 5;       // 基础耐力消耗
    
    // ==================== 负重系统 ====================
    
    static MAX_WEIGHT = 50;                // 基础负重（不含背包）
    static OVERWEIGHT_STAMINA_PENALTY = 2; // 超重耐力消耗倍数
    
    // ==================== 材料银行 ====================
    
    static BANK_LIMIT = 9999;              // 银行容量上限
    static BANK_ERROR_BONUS_CHANCE = 0.1;  // 银行职员算错概率（10%）
    
    // ==================== 战斗系统 ====================
    
    static BATTLE_MAX_ROUNDS = 30;         // 战斗最大回合数
    static CRITICAL_BASE_CHANCE = 0.1;     // 基础暴击率（10%）
    static DODGE_BASE_CHANCE = 0.1;        // 基础闪避率（10%）
    static COUNTER_BASE_CHANCE = 0.05;     // 基础反击率（5%）
    static COMBO_FOLLOWER_MULTIPLIER = 6;  // 合体技伤害倍数
    static LAST_ROUND_DAMAGE_MULTIPLIER = 3; // 最后一回合伤害倍数
    static BOSS_REWARD_MULTIPLIER = 1.5;   // Boss奖励倍数
    static ELITE_REWARD_MULTIPLIER = 1.2;  // 精英奖励倍数
    
    // ==================== 任务系统 ====================
    
    static MAX_QUESTS = 3;                 // 最大任务数
    static QUEST_DURATION_DEFAULT = 10;    // 任务默认持续时间（回合）
    static QUEST_DURATION_SHORT = 3;       // 短任务持续时间
    static QUEST_REWARD_GOLD_BASE = 100;   // 任务金钱奖励基础
    static QUEST_REWARD_FAME_BASE = 10;    // 任务名声奖励基础
    
    // ==================== 装备系统 ====================
    
    static EQUIP_UPGRADE_MAX = 9;          // 装备最大强化等级
    static EQUIP_QUALITY_NORMAL = 0;       // 普通品质
    static EQUIP_QUALITY_UNCOMMON = 1;     // 优秀品质
    static EQUIP_QUALITY_RARE = 2;         // 稀有品质
    static EQUIP_QUALITY_EPIC = 3;         // 史诗品质
    static EQUIP_QUALITY_LEGENDARY = 4;    // 传说品质
    
    // ==================== 概率相关 ====================
    
    static TREASURE_CHANCE = 0.3;          // 宝藏出现概率（30%）
    static SPECIAL_EVENT_CHANCE = 0.5;     // 特殊事件概率（50%）
    static ELITE_ENCOUNTER_CHANCE = 0.3;   // 精英怪概率（30%）
    static BOSS_ENCOUNTER_CHANCE = 0.1;    // Boss怪概率（10%）
    static EQUIPMENT_DROP_CHANCE = 0.8;    // 装备掉落概率（80%）
    static RARE_MATERIAL_BONUS_CHANCE = 0.1; // 额外稀有材料概率（10%）
    static OLD_SMITH_ENCOUNTER_CHANCE = 0.05; // 老铁匠出现概率（5%）
    
    // ==================== 游戏平衡 ====================
    
    static POPULARITY_MAX = 100;           // 最大人气值
    static POPULARITY_FREE_REST = 100;     // 免费住宿人气阈值
    static FAME_ARENA_RANK_F = 0;          // 竞技场F级名声
    static FAME_ARENA_RANK_E = 100;        // 竞技场E级名声
    static FAME_ARENA_RANK_D = 300;        // 竞技场D级名声
    static FAME_ARENA_RANK_C = 600;        // 竞技场C级名声
    static FAME_ARENA_RANK_B = 1000;       // 竞技场B级名声
    static FAME_ARENA_RANK_A = 1500;       // 竞技场A级名声
    static FAME_ARENA_RANK_S = 2100;       // 竞技场S级名声
    static FAME_ARENA_RANK_SS = 2800;      // 竞技场SS级名声
    static FAME_ARENA_RANK_SSS = 3600;     // 竞技场SSS级名声
    
    // ==================== 坐骑系统 ====================
    
    static MOUNT_GROWTH_TIMES_MAX = 5;     // 最大成长次数
    static MOUNT_IMPROVE_TIMES_MAX = 2;    // 最大改良次数
    
    // ==================== 建设系统 ====================
    
    static HOUSE_BUILD_COST_1 = 1000;      // 房屋1阶段费用
    static HOUSE_BUILD_COST_2 = 2000;      // 房屋2阶段费用
    static HOUSE_BUILD_COST_3 = 3000;      // 房屋3阶段费用
    static HOUSE_BUILD_COST_4 = 4000;      // 房屋4阶段费用
    static HOUSE_BUILD_COST_5 = 5000;      // 房屋5阶段费用
    static HOUSE_BUILD_COST_6 = 6000;      // 房屋6阶段费用
    
    static DOCK_BUILD_COST_1 = 500;        // 码头1阶段费用
    static DOCK_BUILD_COST_2 = 1000;       // 码头2阶段费用
    static DOCK_BUILD_COST_3 = 1500;       // 码头3阶段费用
    static DOCK_BUILD_COST_4 = 2000;       // 码头4阶段费用
    static DOCK_BUILD_COST_5 = 2500;       // 码头5阶段费用
    
    // ==================== 副本系统 ====================
    
    static DUNGEON_LEVEL_REQUIREMENT = 10; // 进入副本等级要求
    static DUNGEON_MAX_DEPTH = 10;         // 副本最大深度
    static DUNGEON_ELITE_FLOOR = 5;        // 精英层数
    static DUNGEON_BOSS_FLOOR = 10;        // Boss层数
    
    // ==================== 时间系统 ====================
    
    static YEAR_DAYS = 360;                // 每年天数
    static START_YEAR_BASE = 14;           // 起始年份基础
    static START_YEAR_PER_CLEAR = 20;      // 每次通关增加年份
    
    // ==================== 显示相关 ====================
    
    static GAME_WIDTH = 640;               // 游戏宽度
    static GAME_HEIGHT = 480;              // 游戏高度
    static CELL_SIZE = 52;                 // 格子大小
    static BOARD_ROWS = 9;                 // 棋盘行数
    static BOARD_COLS = 12;                // 棋盘列数
    
    // ==================== 百分比倍数 ====================
    
    static PERCENT_10 = 0.1;
    static PERCENT_20 = 0.2;
    static PERCENT_30 = 0.3;
    static PERCENT_50 = 0.5;
    static PERCENT_80 = 0.8;
    static PERCENT_100 = 1.0;
    
    // ==================== 工具方法 ====================
    
    /**
     * 获取竞技场等级名称
     * @param {number} fame 名声值
     * @returns {string} 等级名称
     */
    static getArenaRank(fame) {
        if (fame >= this.FAME_ARENA_RANK_SSS) return 'SSS';
        if (fame >= this.FAME_ARENA_RANK_SS) return 'SS';
        if (fame >= this.FAME_ARENA_RANK_S) return 'S';
        if (fame >= this.FAME_ARENA_RANK_A) return 'A';
        if (fame >= this.FAME_ARENA_RANK_B) return 'B';
        if (fame >= this.FAME_ARENA_RANK_C) return 'C';
        if (fame >= this.FAME_ARENA_RANK_D) return 'D';
        if (fame >= this.FAME_ARENA_RANK_E) return 'E';
        return 'F';
    }
    
    /**
     * 获取房屋建设费用
     * @param {number} stage 阶段（1-6）
     * @returns {number} 费用
     */
    static getHouseBuildCost(stage) {
        const costs = [
            0, // 0阶段（未建设）
            this.HOUSE_BUILD_COST_1,
            this.HOUSE_BUILD_COST_2,
            this.HOUSE_BUILD_COST_3,
            this.HOUSE_BUILD_COST_4,
            this.HOUSE_BUILD_COST_5,
            this.HOUSE_BUILD_COST_6
        ];
        return costs[stage] || 0;
    }
    
    /**
     * 获取码头建设费用
     * @param {number} stage 阶段（1-5）
     * @returns {number} 费用
     */
    static getDockBuildCost(stage) {
        const costs = [
            0, // 0阶段（未建设）
            this.DOCK_BUILD_COST_1,
            this.DOCK_BUILD_COST_2,
            this.DOCK_BUILD_COST_3,
            this.DOCK_BUILD_COST_4,
            this.DOCK_BUILD_COST_5
        ];
        return costs[stage] || 0;
    }
}

