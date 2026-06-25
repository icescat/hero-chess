/**
 * AI状态评估系统
 * 用于评估玩家当前状态，为AI决策提供依据
 * 
 * 创建日期：2025-12-01
 * 版本：V1.1.0
 */

class StateEvaluator {
    /**
     * 评估玩家当前状态
     * @param {Chess} chess - 玩家对象
     * @returns {Object} 状态评估结果
     */
    static evaluate(chess) {
        return {
            survival: this._evalSurvival(chess),      // 生存能力 0-100
            combat: this._evalCombat(chess),          // 战斗能力 0-100
            wealth: this._evalWealth(chess),          // 财富水平 0-100
            progress: this._evalProgress(chess),      // 游戏进度 0-100
            urgency: this._checkUrgency(chess),       // 紧急需求数组
            opportunities: this._checkOpportunities(chess) // 机会数组
        };
    }
    
    /**
     * 评估生存能力
     * 基于生命值、耐力、负面状态
     */
    static _evalSurvival(chess) {
        const prop = chess.prop;
        
        // 基础分数
        let score = 0;
        
        // 生命值（50分）
        const lifePercent = prop.lifePercent || 0;
        score += lifePercent * 50;
        
        // 耐力（40分）
        const staminaPercent = prop.staminaPercent || 0;
        score += staminaPercent * 40;
        
        // 负面Buff惩罚
        if (prop.haveBuff(BuffNo.SICK)) score -= 30;        // 生病
        if (prop.haveBuff(BuffNo.WEAK)) score -= 20;        // 虚弱
        if (prop.haveBuff(BuffNo.CURSE)) score -= 15;       // 诅咒
        
        // 负重影响
        if (prop.overWeight) score -= 20;                   // 超重
        else if (prop.weightPercent > 0.85) score -= 10;    // 接近超重
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * 评估战斗能力
     * 基于攻击、防御、装备、Buff、随从
     */
    static _evalCombat(chess) {
        const prop = chess.prop;
        
        let score = 0;
        
        // 基础属性（70分）
        score += Math.min(40, prop.actualAtk / 20);   // 攻击力
        score += Math.min(30, prop.actualDef / 10);   // 防御力
        
        // 正面战斗Buff（30分）
        if (prop.haveBuff(BuffNo.NEARWIN)) score += 15;      // 几乎必胜
        if (prop.haveBuff(BuffNo.LUCKY)) score += 10;        // 幸运
        if (prop.haveBuff(BuffNo.HOLY)) score += 5;          // 神圣
        
        // 随从加成（10分）
        const follower = prop.getFollower();
        if (follower) {
            score += Math.min(10, follower.lv / 5);
        }
        
        // 负面战斗Buff惩罚
        if (prop.haveBuff(BuffNo.UNLUCKY)) score -= 10;      // 厄运
        if (prop.haveBuff(BuffNo.SCARED)) score -= 15;       // 惊吓
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * 评估财富水平
     * 基于金钱、材料、装备价值
     */
    static _evalWealth(chess) {
        const prop = chess.prop;
        
        let score = 0;
        
        // 金钱（60分）
        if (prop.gold >= 100000) score += 60;
        else if (prop.gold >= 50000) score += 45;
        else if (prop.gold >= 20000) score += 30;
        else if (prop.gold >= 10000) score += 20;
        else if (prop.gold >= 5000) score += 10;
        else score += prop.gold / 500;
        
        // 材料（40分）
        const totalStuff = prop.stuff + prop.rarestuff;
        score += Math.min(40, totalStuff / 50);
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * 评估游戏进度
     * 基于等级、圈数、魔王状态
     */
    static _evalProgress(chess) {
        // 魔王已击败：100分
        if (chess.devilDefeated) {
            return 100;
        }
        
        let score = 0;
        
        // 等级（60分）
        score += Math.min(60, chess.prop.level * 1.5);
        
        // 圈数（30分）
        score += Math.min(30, chess.board._lap * 2);
        
        // 名声（10分）
        score += Math.min(10, chess.prop.fame / 1000);
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * 检查紧急需求
     * 返回需要立即处理的情况
     */
    static _checkUrgency(chess) {
        const urgent = [];
        const prop = chess.prop;
        
        // 生命危急
        if (prop.lifePercent < 0.3) {
            urgent.push({
                type: 'CRITICAL_HEALTH',
                priority: 100,
                message: '生命值危急'
            });
        }
        
        // 耐力极低
        if (prop.staminaPercent < 0.15) {
            urgent.push({
                type: 'CRITICAL_STAMINA',
                priority: 95,
                message: '耐力极低'
            });
        }
        
        // 超重
        if (prop.overWeight) {
            urgent.push({
                type: 'OVERWEIGHT',
                priority: 80,
                message: '负重超载'
            });
        }
        
        // 生病
        if (prop.haveBuff(BuffNo.SICK)) {
            urgent.push({
                type: 'SICK',
                priority: 75,
                message: '生病状态'
            });
        }
        
        // 任务即将超时
        const urgentQuest = this._findUrgentQuest(chess);
        if (urgentQuest) {
            const daysLeft = urgentQuest.questDuration - 
                           (chess.board._round - urgentQuest.beginRound) / 2;
            urgent.push({
                type: 'URGENT_QUEST',
                priority: 85,
                message: `任务即将超时（剩余${daysLeft}天）`,
                data: urgentQuest
            });
        }
        
        // 按优先级排序
        urgent.sort((a, b) => b.priority - a.priority);
        
        return urgent;
    }
    
    /**
     * 检查机会
     * 返回当前可利用的有利条件
     */
    static _checkOpportunities(chess) {
        const opportunities = [];
        const prop = chess.prop;
        
        // 几乎必胜Buff
        if (prop.haveBuff(BuffNo.NEARWIN)) {
            opportunities.push({
                type: 'COMBAT_BUFF',
                value: 90,
                message: '拥有"几乎必胜"Buff'
            });
        }
        
        // 其他战斗Buff
        if (prop.haveBuff(BuffNo.BATTLEPOWER) || 
            prop.haveBuff(BuffNo.PRIEST_BUFF) || 
            prop.haveBuff(BuffNo.WARRIOR_BUFF) ||
            prop.haveBuff(BuffNo.HAPPY)) {
            opportunities.push({
                type: 'COMBAT_BUFF',
                value: 70,
                message: '拥有战斗增益Buff'
            });
        }
        
        // 材料充足可锻造
        if (prop.enoughStuffToSmith()) {
            opportunities.push({
                type: 'CAN_SMITH',
                value: 80,
                message: '材料充足可锻造装备'
            });
        }
        
        // 可学习天赋
        if (chess.canLearnTalent && chess.canLearnTalent()) {
            opportunities.push({
                type: 'CAN_LEARN_TALENT',
                value: 85,
                message: '可学习新天赋'
            });
        }
        
        // 名声提升（可捐赠换奖励）
        if (prop.fameRankChanged) {
            opportunities.push({
                type: 'FAME_RANK_UP',
                value: 60,
                message: '名声等级提升'
            });
        }
        
        // 按价值排序
        opportunities.sort((a, b) => b.value - a.value);
        
        return opportunities;
    }
    
    /**
     * 查找最紧急的任务
     */
    static _findUrgentQuest(chess) {
        const quests = chess.prop._quests || [];
        if (quests.length === 0) return null;
        
        let urgentQuest = null;
        let minDaysLeft = Infinity;
        
        for (const quest of quests) {
            if (quest.questDuration > 0) {
                const daysLeft = quest.questDuration - 
                               (chess.board._round - quest.beginRound) / 2;
                if (daysLeft <= 2 && daysLeft > 0 && daysLeft < minDaysLeft) {
                    minDaysLeft = daysLeft;
                    urgentQuest = quest;
                }
            }
        }
        
        return urgentQuest;
    }
    
    /**
     * 获取状态摘要（用于日志）
     */
    static getSummary(state) {
        const level = (score) => {
            if (score >= 80) return '优秀';
            if (score >= 60) return '良好';
            if (score >= 40) return '一般';
            if (score >= 20) return '较差';
            return '危险';
        };
        
        return {
            survival: `${level(state.survival)} (${state.survival.toFixed(0)})`,
            combat: `${level(state.combat)} (${state.combat.toFixed(0)})`,
            wealth: `${level(state.wealth)} (${state.wealth.toFixed(0)})`,
            progress: `${level(state.progress)} (${state.progress.toFixed(0)})`,
            urgentCount: state.urgency.length,
            opportunityCount: state.opportunities.length
        };
    }
}

