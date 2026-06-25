/**
 * 运行统计类（Phase 7-C）
 * 对应 AS3: csh.model.RunningStat
 * 
 * 功能：
 * 1. 记录游戏过程中的各种统计数据
 * 2. 用于成就、结局判定
 * 3. 可序列化保存
 */

class RunningStat {
    constructor() {
        // 基础统计
        this.winCount = 0;              // 战斗胜利次数
        this.loseCount = 0;             // 战斗失败次数
        this.deadCount = 0;             // 死亡次数
        
        // 地点统计
        this.woshipCount = 0;           // 神社次数
        this.springCount = 0;           // 温泉次数
        this.dockCount = 0;             // 码头重建完成次数
        this.houseCount = 0;            // 房屋建设完成次数
        
        // 战斗统计
        this.totalEnemyCount = 0;       // 击杀敌人总数
        this.winDuelCount = 0;          // 决斗胜利次数
        this.winArenaCount = 0;         // 竞技场胜利次数
        this.maxDps = 0;                // 最高单次伤害
        this.maxDpb = 0;                // 最高单场总伤害
        
        // 任务统计
        this.totalQuestCount = 0;       // 完成任务总数
        this.questCount = [];           // 各类型任务完成次数
        
        // 特殊事件
        this.beatDevilCount = 0;        // 击败魔王次数
        this.killCrowCount = 0;         // 击杀乌鸦次数
        this.banditKill = 0;            // 击杀强盗次数
        this.animalSave = 0;            // 拯救动物次数
        this.thunderHitCount = 0;       // 被雷击中次数
        
        // 移动统计
        this.walkDistance = 0;          // 本圈移动距离
        this.totalDistance = 0;         // 总移动距离
        
        // 社交统计
        this.meetGirlCount = 0;         // 遇到女孩次数
        this.loveCount = 0;             // 恋爱次数
        this.recruitHeroCount = 0;      // 招募勇者次数
        this.friendCount = 0;           // 朋友数
        
        // 连续统计
        this.nostayRound = 0;           // 连续未住宿回合数
        this.maxNostay = 28;            // 最大未住宿回合数（14天×2回合）
        this.drinkCount = 0;            // 喝酒连续次数（醉酒判定）
        this.arenaWinStreak = 0;        // 竞技场连胜次数
        this.arenaLoseStreak = 0;       // 竞技场连败次数
        this.battleStreak = 0;          // 连续战斗次数
        
        // 竞技场排名赛（F-SSS九级）
        this.arenaRank = 0;             // 当前排名（0=F, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S, 7=SS, 8=SSS）
        this.arenaRankNames = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        this.arenaPromoteNeeds = [3, 3, 3, 4, 4, 5, 5, 6]; // 各级别升级所需连胜数
        
        // 特殊地点访问次数
        this.fairylandCount = 0;        // 仙境访问次数
        this.devillandCount = 0;        // 魔界访问次数
        
        console.log('[RunningStat] 统计系统已初始化');
    }
    
    /**
     * 增加战斗胜利次数
     */
    addWinCount() {
        this.winCount++;
        this.totalEnemyCount++;
        this.battleStreak++;
    }
    
    /**
     * 增加战斗失败次数
     */
    addLoseCount() {
        this.loseCount++;
        this.battleStreak = 0;
    }
    
    /**
     * 增加死亡次数
     */
    addDeadCount() {
        this.deadCount++;
    }
    
    /**
     * 增加决斗胜利次数
     */
    addWinDuelCount() {
        this.winDuelCount++;
    }
    
    /**
     * 增加竞技场胜利次数
     */
    addWinArenaCount() {
        this.winArenaCount++;
    }
    
    /**
     * 增加移动距离
     * @param {number} distance - 移动格数
     */
    addWalkDistance(distance) {
        this.walkDistance += distance;
        this.totalDistance += distance;
    }
    
    /**
     * 重置本圈统计
     */
    resetRoundStat() {
        this.walkDistance = 0;
        this.nostayRound = 0;
    }
    
    /**
     * 更新DPS记录
     * @param {number} dps - 单次伤害
     * @param {number} dpb - 单场总伤害
     */
    updateDpsAndDpb(dps, dpb) {
        if (dps > this.maxDps) {
            this.maxDps = dps;
        }
        if (dpb > this.maxDpb) {
            this.maxDpb = dpb;
        }
    }
    
    /**
     * 增加任务完成次数
     * @param {number} questType - 任务类型（Quest常量）
     * @param {boolean} isTownQuest - 是否城镇任务
     */
    addQuestCount(questType, isTownQuest) {
        // 城镇任务计入总数
        if (isTownQuest) {
            this.totalQuestCount++;
            if (this.totalQuestCount % 10 === 0) {
                DiaryPanel.getInstance().addDiary(`你完成的委托已达到${this.totalQuestCount}个`, true);
            }
        }
        
        // 更新各类型任务计数
        if (!this.questCount[questType]) {
            this.questCount[questType] = 0;
        }
        this.questCount[questType]++;
        
        // 特定任务类型的里程碑日记
        if (questType === Quest.TRESURE) {
            if (this.questCount[questType] % 10 === 0) {
                DiaryPanel.getInstance().addDiary(`你挖到的宝藏已达到${this.questCount[questType]}个`, true);
            }
        } else if (questType === Quest.INVADE) {
            if (this.questCount[questType] % 10 === 0) {
                DiaryPanel.getInstance().addDiary(`你阻止怪物侵袭已达到${this.questCount[questType]}次`, true);
            }
        }
        
        console.log(`[RunningStat] 任务计数+1: 类型${questType}, 城镇任务:${isTownQuest}, 总计:${this.totalQuestCount}`);
    }
    
    /**
     * 增加喝酒次数（醉酒判定用）
     */
    addDrinkCount() {
        this.drinkCount++;
    }
    
    /**
     * 重置喝酒次数
     */
    resetDrinkCount() {
        this.drinkCount = 0;
    }
    
    /**
     * 增加招募勇士次数
     */
    addRecruitHeroCount(count) {
        this.recruitHeroCount += count;
    }
    
    /**
     * 竞技场胜利（连胜计数）
     * @returns {boolean} 是否升级
     */
    arenaWin() {
        this.arenaWinStreak++;
        this.arenaLoseStreak = 0;
        this.addWinArenaCount();
        
        // 检查是否升级
        if (this.arenaRank < 8) { // 最高SSS级
            const needWins = this.arenaPromoteNeeds[this.arenaRank];
            if (this.arenaWinStreak >= needWins) {
                this.arenaRank++;
                this.arenaWinStreak = 0;
                return true; // 升级了
            }
        }
        
        return false;
    }
    
    /**
     * 竞技场失败（连败计数）
     * @returns {boolean} 是否降级
     */
    arenaLose() {
        this.arenaLoseStreak++;
        this.arenaWinStreak = 0;
        
        // 连败3场降级
        if (this.arenaLoseStreak >= 3 && this.arenaRank > 0) {
            this.arenaRank--;
            this.arenaLoseStreak = 0;
            return true; // 降级了
        }
        
        return false;
    }
    
    /**
     * 获取当前排名名称
     */
    getArenaRankName() {
        return this.arenaRankNames[this.arenaRank] || 'F';
    }
    
    /**
     * 重置单圈统计（Phase 7-D Bug修复）
     * 每完成一圈时调用
     */
    resetRoundStat() {
        this.walkDistance = 0;
        this.nostayRound = 0;
        this.battleStreak = 0;
        console.log('[RunningStat] 单圈统计已重置');
    }
    
    /**
     * 序列化为JSON对象（用于存档）
     * @returns {Object}
     */
    toJSON() {
        return {
            winCount: this.winCount,
            loseCount: this.loseCount,
            deadCount: this.deadCount,
            woshipCount: this.woshipCount,
            springCount: this.springCount,
            dockCount: this.dockCount,
            houseCount: this.houseCount,
            totalEnemyCount: this.totalEnemyCount,
            winDuelCount: this.winDuelCount,
            winArenaCount: this.winArenaCount,
            maxDps: this.maxDps,
            maxDpb: this.maxDpb,
            totalQuestCount: this.totalQuestCount,
            questCount: this.questCount,
            beatDevilCount: this.beatDevilCount,
            killCrowCount: this.killCrowCount,
            banditKill: this.banditKill,
            animalSave: this.animalSave,
            thunderHitCount: this.thunderHitCount,
            walkDistance: this.walkDistance,
            totalDistance: this.totalDistance,
            meetGirlCount: this.meetGirlCount,
            loveCount: this.loveCount,
            recruitHeroCount: this.recruitHeroCount,
            friendCount: this.friendCount,
            nostayRound: this.nostayRound,
            drinkCount: this.drinkCount,
            arenaWinStreak: this.arenaWinStreak,
            arenaLoseStreak: this.arenaLoseStreak,
            battleStreak: this.battleStreak,
            arenaRank: this.arenaRank,
            fairylandCount: this.fairylandCount,
            devillandCount: this.devillandCount
        };
    }
    
    /**
     * 从JSON对象加载（用于读档）
     * @param {Object} data - JSON数据
     */
    fromJSON(data) {
        for (const key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
    
    /**
     * 获取统计摘要文本
     * @returns {string}
     */
    getSummary() {
        return `战斗: ${this.winCount}胜/${this.loseCount}败 | ` +
               `击杀: ${this.totalEnemyCount} | ` +
               `任务: ${this.totalQuestCount} | ` +
               `移动: ${this.totalDistance}格 | ` +
               `最高伤害: ${this.maxDps}`;
    }
    
    /**
     * 清理资源
     */
    dispose() {
        this.questCount = null;
    }
    
    /**
     * 添加副本完成统计
     * @param {number} dungeonLv - 副本等级
     * @param {boolean} isHeroic - 是否英雄模式
     */
    // V1.1+: 副本统计系统（需要添加dungeonCount等属性）
    addDungeonCount(dungeonLv, isHeroic) {
        // 添加副本统计属性和逻辑
        console.log(`[RunningStat] 完成副本 Lv${dungeonLv} ${isHeroic ? '(英雄)' : ''}`);
    }
    
    // 记录所有统计数据用于存档 - AS3: recordAll()
    recordAll() {
        return {
            totalQuestCount: this._totalQuestCount || 0,
            totalBattles: this._totalBattles || 0,
            totalWins: this._totalWins || 0,
            totalLosses: this._totalLosses || 0,
            totalKills: this._totalKills || 0,
            nostayRound: this._nostayRound || 0,
            // V1.1+: 添加更多统计数据（副本、竞技场、PVP等）
        };
    }
}

