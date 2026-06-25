/**
 * AI目标选择系统
 * 基于当前状态评估，选择最优目标
 * 
 * 创建日期：2025-12-01
 * 版本：V1.1.0
 */

class GoalSelector {
    // 目标类型常量
    static GOAL_SURVIVE = 'survive';           // 生存（休息、治疗）
    static GOAL_MANAGE_RESOURCE = 'resource';  // 资源管理（存材料、锻造）
    static GOAL_QUEST = 'quest';               // 完成任务
    static GOAL_UPGRADE = 'upgrade';           // 升级装备
    static GOAL_TALENT = 'talent';             // 学习天赋
    static GOAL_DUNGEON = 'dungeon';           // 刷副本
    static GOAL_EARN_GOLD = 'earn_gold';       // 赚钱
    static GOAL_BEAT_DEVIL = 'beat_devil';     // 击败魔王
    static GOAL_EXPLORE = 'explore';           // 探索
    
    /**
     * 选择最佳目标
     * @param {Chess} chess - 玩家对象
     * @param {Object} state - 状态评估结果
     * @returns {Object} 目标对象
     */
    static selectBestGoal(chess, state) {
        console.log('[GoalSelector] 开始选择目标', StateEvaluator.getSummary(state));
        
        // 1. 紧急情况优先处理
        if (state.urgency.length > 0) {
            const urgentGoal = this._handleUrgency(chess, state.urgency[0]);
            if (urgentGoal) {
                console.log(`[GoalSelector] 紧急目标: ${urgentGoal.type} (优先级${urgentGoal.priority})`);
                return urgentGoal;
            }
        }
        
        // 2. 利用机会
        if (state.opportunities.length > 0) {
            const opportunityGoal = this._handleOpportunity(chess, state);
            if (opportunityGoal) {
                console.log(`[GoalSelector] 机会目标: ${opportunityGoal.type} (价值${opportunityGoal.priority})`);
                return opportunityGoal;
            }
        }
        
        // 3. 根据游戏阶段选择发展目标
        const developGoal = this._selectDevelopmentGoal(chess, state);
        console.log(`[GoalSelector] 发展目标: ${developGoal.type} (优先级${developGoal.priority})`);
        return developGoal;
    }
    
    /**
     * 处理紧急情况
     */
    static _handleUrgency(chess, urgency) {
        switch (urgency.type) {
            case 'CRITICAL_HEALTH':
            case 'CRITICAL_STAMINA':
                return {
                    type: GoalSelector.GOAL_SURVIVE,
                    priority: urgency.priority,
                    reason: urgency.message,
                    targetCellTypes: [CellType.SPRING, CellType.HOUSE, CellType.TOWN, CellType.VILLAGE],
                    action: 'rest'
                };
                
            case 'OVERWEIGHT':
                return {
                    type: GoalSelector.GOAL_MANAGE_RESOURCE,
                    priority: urgency.priority,
                    reason: urgency.message,
                    targetCellTypes: [CellType.TOWN, CellType.VILLAGE],
                    action: 'store_stuff'
                };
                
            case 'SICK':
                return {
                    type: GoalSelector.GOAL_SURVIVE,
                    priority: urgency.priority,
                    reason: urgency.message,
                    targetCellTypes: [CellType.SPRING],  // 温泉可治病
                    action: 'cure'
                };
                
            case 'URGENT_QUEST':
                return {
                    type: GoalSelector.GOAL_QUEST,
                    priority: urgency.priority,
                    reason: urgency.message,
                    targetCellIndex: urgency.data.triggerCellIndex,
                    action: 'complete_quest',
                    data: urgency.data
                };
                
            default:
                return null;
        }
    }
    
    /**
     * 处理机会
     */
    static _handleOpportunity(chess, state) {
        const opp = state.opportunities[0];  // 已按价值排序
        
        switch (opp.type) {
            case 'CAN_LEARN_TALENT':
                // 可学天赋：立即去公会
                return {
                    type: GoalSelector.GOAL_TALENT,
                    priority: 85,
                    reason: opp.message,
                    targetCellTypes: [CellType.GUILD],
                    action: 'learn_talent'
                };
                
            case 'CAN_SMITH':
                // 可锻造：去城镇
                return {
                    type: GoalSelector.GOAL_UPGRADE,
                    priority: 80,
                    reason: opp.message,
                    targetCellTypes: [CellType.TOWN],
                    action: 'smith'
                };
                
            case 'COMBAT_BUFF':
                // 战斗Buff：去副本或竞技场
                if (state.combat > 50 && state.survival > 40) {
                    return {
                        type: GoalSelector.GOAL_DUNGEON,
                        priority: 75,
                        reason: opp.message,
                        targetCellTypes: [CellType.DUNGEON, CellType.ARENA],
                        action: 'combat'
                    };
                }
                break;
                
            case 'FAME_RANK_UP':
                // 名声提升：去村庄捐赠
                return {
                    type: GoalSelector.GOAL_MANAGE_RESOURCE,
                    priority: 60,
                    reason: opp.message,
                    targetCellTypes: [CellType.VILLAGE],
                    action: 'donate'
                };
        }
        
        return null;
    }
    
    /**
     * 选择发展目标（根据游戏阶段）
     */
    static _selectDevelopmentGoal(chess, state) {
        // 早期（进度<30）：发展基础
        if (state.progress < 30) {
            return this._earlyGameGoal(chess, state);
        }
        
        // 中期（进度30-70）：提升实力
        if (state.progress < 70) {
            return this._midGameGoal(chess, state);
        }
        
        // 后期（进度>=70）：准备挑战魔王
        return this._lateGameGoal(chess, state);
    }
    
    /**
     * 早期游戏目标（1-10级）
     */
    static _earlyGameGoal(chess, state) {
        // 优先级：金钱 > 装备 > 任务
        
        if (state.wealth < 40) {
            return {
                type: GoalSelector.GOAL_EARN_GOLD,
                priority: 70,
                reason: '早期赚钱发展',
                targetCellTypes: [CellType.DOCK, CellType.VILLAGE],  // 钓鱼、帮忙
                action: 'earn'
            };
        }
        
        if (state.combat < 50) {
            return {
                type: GoalSelector.GOAL_UPGRADE,
                priority: 65,
                reason: '提升战斗能力',
                targetCellTypes: [CellType.TOWN],
                action: 'upgrade'
            };
        }
        
        // 接任务赚钱
        return {
            type: GoalSelector.GOAL_QUEST,
            priority: 60,
            reason: '通过任务获取资源',
            targetCellTypes: [CellType.TOWN],
            action: 'find_quest'
        };
    }
    
    /**
     * 中期游戏目标（10-30级）
     */
    static _midGameGoal(chess, state) {
        // 优先级：副本 > 天赋 > 装备
        
        // 优先学天赋
        if (chess.talent && chess.talent.getTalentPoint && chess.talent.getTalentPoint() > 0) {
            return {
                type: GoalSelector.GOAL_TALENT,
                priority: 85,
                reason: '学习天赋提升能力',
                targetCellTypes: [CellType.GUILD],
                action: 'learn_talent'
            };
        }
        
        // 刷副本提升
        if (state.combat > 50 && state.survival > 40) {
            return {
                type: GoalSelector.GOAL_DUNGEON,
                priority: 75,
                reason: '刷副本获取经验和装备',
                targetCellTypes: [CellType.DUNGEON],
                action: 'dungeon'
            };
        }
        
        // 升级装备
        if (state.wealth > 60) {
            return {
                type: GoalSelector.GOAL_UPGRADE,
                priority: 70,
                reason: '升级装备提升战力',
                targetCellTypes: [CellType.TOWN],
                action: 'upgrade'
            };
        }
        
        // 默认：竞技场
        return {
            type: GoalSelector.GOAL_EARN_GOLD,
            priority: 60,
            reason: '竞技场赚钱和经验',
            targetCellTypes: [CellType.ARENA],
            action: 'arena'
        };
    }
    
    /**
     * 后期游戏目标（30级+）
     */
    static _lateGameGoal(chess, state) {
        // 优先级：魔王 > 副本 > 装备
        
        // 准备挑战魔王
        if (state.combat > 70 && state.survival > 60) {
            // 检查魔王岛进度
            const devilCell = this._findDevillandCell(chess);
            if (devilCell && devilCell.extraInfo) {
                const progress = devilCell.extraInfo.progress || 0;
                
                if (progress >= 5) {
                    // 营地已建成，可以围攻
                    return {
                        type: GoalSelector.GOAL_BEAT_DEVIL,
                        priority: 95,
                        reason: '围攻魔王顶',
                        targetCellIndex: devilCell._index,
                        action: 'crusade_devil'
                    };
                } else {
                    // 营地未建成，去建设
                    return {
                        type: GoalSelector.GOAL_BEAT_DEVIL,
                        priority: 90,
                        reason: '建设魔王岛营地',
                        targetCellIndex: devilCell._index,
                        action: 'build_camp'
                    };
                }
            }
        }
        
        // 继续提升实力
        if (state.combat < 80) {
            return {
                type: GoalSelector.GOAL_DUNGEON,
                priority: 80,
                reason: '刷副本提升战力',
                targetCellTypes: [CellType.DUNGEON],
                action: 'dungeon'
            };
        }
        
        // 升级装备
        return {
            type: GoalSelector.GOAL_UPGRADE,
            priority: 75,
            reason: '最终装备强化',
            targetCellTypes: [CellType.TOWN],
            action: 'upgrade'
        };
    }
    
    /**
     * 查找魔王岛格子
     */
    static _findDevillandCell(chess) {
        const board = chess.board;
        for (let i = 0; i < board.cellNum; i++) {
            const cell = board.getCell(i);
            if (cell && cell.cellType === CellType.DEVILLAND) {
                return cell;
            }
        }
        return null;
    }
}


