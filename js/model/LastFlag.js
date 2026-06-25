/**
 * 标志位记录类
 * 对应 AS3: csh.model.LastFlag
 * 
 * 功能：记录上次触发特定事件的回合/圈数，用于事件间隔判断
 */

class LastFlag {
    constructor() {
        // 喝酒相关
        this.lastDrinkRound = 0;        // 上次喝酒回合
        
        // 战斗相关
        this.lastBattleRound = 0;       // 上次战斗回合
        
        // 特殊事件（按圈数Lap）
        this.lastThunderLap = 0;        // 上次雷击圈数
        this.lastThunderDay = 0;        // 上次雷击天数
        this.lastMerchantLap = 0;       // 上次遇商人圈数
        this.lastMerchantDay = 0;       // 上次遇商人天数
        this.lastMetGirlRound = 0;      // 上次遇女孩回合
        this.lastMetChestLap = 0;       // 上次宝箱圈数
        this.lastLootCheatLap = 0;      // 上次掠夺宝箱圈数
        this.lastMetSmithLap = 0;       // 上次遇老铁匠圈数
        this.lastPeepLap = 0;           // 上次偷窥圈数
        this.lastSickRound = 0;         // 上次生病回合
        this.lastInvadedLap = 0;        // 上次被入侵圈数
        this.lastTelDevilRound = 0;     // 上次传送魔王回合
        this.lastDevilPrg = 0;          // 魔王进度
        
        console.log('[LastFlag] 标志位系统已初始化');
    }
    
    /**
     * 序列化为JSON对象（用于存档）
     */
    toJSON() {
        return {
            lastDrinkRound: this.lastDrinkRound,
            lastBattleRound: this.lastBattleRound,
            lastThunderLap: this.lastThunderLap,
            lastThunderDay: this.lastThunderDay,
            lastMerchantLap: this.lastMerchantLap,
            lastMerchantDay: this.lastMerchantDay,
            lastMetGirlRound: this.lastMetGirlRound,
            lastMetChestLap: this.lastMetChestLap,
            lastLootCheatLap: this.lastLootCheatLap,
            lastMetSmithLap: this.lastMetSmithLap,
            lastPeepLap: this.lastPeepLap,
            lastSickRound: this.lastSickRound,
            lastInvadedLap: this.lastInvadedLap,
            lastTelDevilRound: this.lastTelDevilRound,
            lastDevilPrg: this.lastDevilPrg
        };
    }
    
    /**
     * 从JSON对象加载（用于读档）
     */
    fromJSON(data) {
        for (const key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}




