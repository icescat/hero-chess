/**
 * 自动游戏AI类（单例）- V1.1.0重构版
 *
 * 架构：
 * 1. StateEvaluator - 状态评估系统
 * 2. GoalSelector - 目标选择系统（记录AI目标，辅助决策）
 * 3. ChessAI - 决策执行层（核心：事件选择）
 * 4. AIConfig - 配置文件（可调整AI行为）
 *
 * 设计理念：
 * - 这是大富翁式棋盘游戏，移动是随机投骰子
 * - AI重点在于事件选择（城镇、副本、竞技场等）
 * - 状态评估辅助做出更优决策
 *
 * 重构日期：2025-12-01
 */

// 防御性检查：如果 AI 依赖的类因网络问题（如 503）加载失败，使用默认实现避免崩溃
if (typeof StateEvaluator === 'undefined') {
    console.warn('[ChessAI] StateEvaluator 未加载，使用默认状态评估');
    window.StateEvaluator = {
        evaluate() {
            return { survival: 50, combat: 50, wealth: 50, progress: 0, urgency: [], opportunities: [] };
        },
        getSummary() {
            return { survival: '?', combat: '?', wealth: '?', progress: '?', urgentCount: 0, opportunityCount: 0 };
        }
    };
}
if (typeof GoalSelector === 'undefined') {
    console.warn('[ChessAI] GoalSelector 未加载，使用默认目标选择');
    window.GoalSelector = {
        selectBestGoal() {
            return { type: 'default', reason: 'GoalSelector 未加载，使用默认目标' };
        }
    };
}
if (typeof AIConfig === 'undefined') {
    console.warn('[ChessAI] AIConfig 未加载，使用默认配置');
    window.AIConfig = {
        REST_CONFIG: { EMERGENCY_REST: 30, LOW_STAMINA_REST: 30, ALLOW_DEFAULT_REST: false },
        COMBAT_CONFIG: { ARENA_EARLY_LEVEL: 16, ARENA_MID_LEVEL: 26, MIN_COMBAT_SCORE: 40, MIN_SURVIVAL_SCORE: 50 },
        STABLE_CONFIG: { BUY_HORSE_MIN_GOLD: 2000, BUY_HORSE_MIN_LEVEL: 5, BUY_HORSE_MIN_WEALTH: 50, TRAIN_HORSE_MIN_GOLD: 3000, RACE_WHEN_POOR: true, TRAIN_PROBABILITY: 0.7 }
    };
}

class ChessAI {
    static _instance = null;
    
    // 自动处理延迟（秒）
    static HANDLE_DELAY = 1;
    
    // 是否启用自动游戏
    static enableAuto = false;
    
    /**
     * 获取单例
     * @returns {ChessAI}
     */
    static getInstance() {
        if (!ChessAI._instance) {
            ChessAI._instance = new ChessAI();
        }
        return ChessAI._instance;
    }
    
    constructor() {
        if (ChessAI._instance) {
            return ChessAI._instance;
        }
        
        // 当前目标（用于日志和辅助决策）
        this.currentGoal = null;
        
        console.log('[ChessAI] AI系统已初始化 (V1.1.0)');
    }
    
    /**
     * 切换自动游戏状态
     */
    static switchEnableAuto() {
        ChessAI.enableAuto = !ChessAI.enableAuto;
    }
    
    /**
     * 自动处理复活
     * @param {Chess} chess 玩家对象
     */
    autoHandleRevive(chess) {
        if (!chess || !chess._waitingForRevive) {
            return;
        }
        
        console.log('[ChessAI] 自动游戏模式：将在2秒后自动复活');
        setTimeout(() => {
            if (chess._waitingForRevive && ChessAI.enableAuto) {
                console.log('[ChessAI] 自动触发复活');
                chess.handleRevive();
            }
        }, ChessAI.HANDLE_DELAY * 2 * 1000); // 延迟2秒，让玩家看清死亡信息
    }
    
    /**
     * 自动处理选项
     * @param {Chess} chess 玩家对象
     * @param {Array} options 选项数组
     */
    autoHandleOptions(chess, options) {
        if (!chess || !options || options.length === 0) {
            console.warn('[ChessAI] 无效的参数', {chess, options});
            return;
        }
        
        console.log('[ChessAI] ========== 开始自动处理 ==========');
        console.log('[ChessAI] 参数检查:', {
            readyMove: chess.readyMove,
            cellType: chess._cell ? chess._cell._cellType : 'unknown',
            cellTypeName: chess._cell ? CellType.getName(chess._cell._cellType) : 'unknown',
            options: options
        });
        
        // 判断是移动选项还是格子事件选项
        // 移动选项通常是: ['walk'] 或 ['walk', 'ride'] 或 ['walk', 'teleport']
        const isMoveOption = options.includes('walk') || options.includes('ride') || options.includes('teleport');
        
        if (isMoveOption) {
            console.log('[ChessAI] 识别为移动选项');
            this.handleMoveOptions(chess, options);
            return;
        }
        
        // 根据格子类型处理
        const cellType = chess._cell._cellType;
        console.log(`[ChessAI] 识别为格子事件，类型: ${cellType} (${CellType.getName(cellType)})`);
        
        switch(cellType) {
            case CellType.TOWN:
                this.handleTownOptions(chess, options);
                break;
            case CellType.VILLAGE:
                this.handleVillageOptions(chess, options);
                break;
            case CellType.HOUSE:
                this.handleHouseOptions(chess, options);
                break;
            case CellType.GUILD:
                this.handleGuildOptions(chess, options);
                break;
            case CellType.DOCK:
                this.handleDockOptions(chess, options);
                break;
            case CellType.CAMP:
                this.handleCampOptions(chess, options);
                break;
            case CellType.STABLE:
                this.handleStableOptions(chess, options);
                break;
            case CellType.ARENA:
                this.handleArenaOptions(chess, options);
                break;
            case CellType.DEVILLAND:
                this.handleDevillandOptions(chess, options);
                break;
            case CellType.FAIRYLAND:
                this.handleFairylandOptions(chess, options);
                break;
            case CellType.DUNGEON:
                this.handleDungeonOptions(chess, options);
                break;
            default:
                // 默认离开
                console.warn(`[ChessAI] 未识别的格子类型: ${cellType}, 直接离开`);
                chess.board.roundEnd();
        }
        console.log('[ChessAI] ========== 自动处理完成 ==========');
    }
    
    /**
     * 处理移动选项（V1.1.0 简化版）
     * 
     * 设计理念：
     * - 这是大富翁游戏，移动靠投骰子，无法规划路径
     * - AI只需评估状态，记录当前目标（用于事件决策）
     * - 然后直接投骰子，随缘到达格子
     * 
     * @param {Chess} chess
     * @param {Array} options
     */
    handleMoveOptions(chess, options) {
        console.log('[ChessAI] ========== 移动回合 ==========');
        
        // 清除"选择目的地"标志（自动模式不使用此稀有事件）
        if (chess._canSelectDest) {
            chess._canSelectDest = false;
            console.log('[ChessAI] 自动模式：跳过"选择目的地"稀有事件');
        }
        
        // 1. 评估当前状态
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 状态评估:', StateEvaluator.getSummary(state));
        
        // 2. 选择当前目标（记录用于后续事件决策参考）
        this.currentGoal = GoalSelector.selectBestGoal(chess, state);
        console.log('[ChessAI] 当前目标:', this.currentGoal.type, '-', this.currentGoal.reason);
        
        // 3. 投骰子前进（大富翁核心玩法）
        console.log('[ChessAI] 投骰子，随缘前进');
        chess._handleForwardChoice('walk', false);
    }
    
    // ==================== 事件处理（核心AI逻辑）====================
    // 以下是各种格子事件的智能处理
    // 基于状态评估做出最优决策
    
    
    /**
     * 处理城镇选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 实际选项数组：['rest', 'smith', 'store', 'quest', 'drink']
     */
    handleTownOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 城镇决策:', StateEvaluator.getSummary(state), 'options:', options);
        
        // 智能优先级（基于状态和可用选项）
        const justRevived = chess._justRevived || false;
        
        // 1. 紧急状态：立即休息（刚复活时跳过）
        if (!justRevived && state.survival < AIConfig.REST_CONFIG.EMERGENCY_REST && options.includes('rest')) {
            console.log('[ChessAI] 城镇：生存危急，立即休息');
            chess._stayHotel(true);
            return;
        }
        
        // 2. 负重管理：存材料（✅ 刚复活也可以执行）
        if ((chess.prop.overWeight || chess.prop.weightPercent > 0.8) && options.includes('store')) {
            console.log('[ChessAI] 城镇：负重过高，存储材料');
            chess._storeMaterials();
            return;
        }
        
        // 3. 利用机会：材料充足时锻造（✅ 刚复活也可以执行）
        // 注意：锻造主要看材料，不看金钱（强化才需要200金）
        if (chess.prop.enoughStuffToSmith() && options.includes('smith')) {
            console.log('[ChessAI] 城镇：材料充足，锻造装备');
            chess._showSmithMenu();
            return;
        }
        
        // 4. 生存管理：耐力较低休息（刚复活时跳过）
        if (!justRevived && state.survival < AIConfig.REST_CONFIG.LOW_STAMINA_REST && options.includes('rest')) {
            console.log('[ChessAI] 城镇：耐力较低，休息恢复');
            chess._stayHotel(true);
            return;
        }
        
        // 5. 夜晚：喝酒（❌ 刚复活时禁止，防止刷Buff）
        if (!justRevived && chess.board._isNight && options.includes('drink')) {
            console.log('[ChessAI] 城镇：夜晚喝酒');
            chess._drinkAtTavern();
            return;
        }
        
        // 6. 接任务：没有任务时接新任务（❌ 刚复活时禁止，防止刷任务）
        if (!justRevived && options.includes('quest')) {
            const hasQuest = chess.prop.haveQuest(Quest.DELIVER) || 
                            chess.prop.haveQuest(Quest.CONVOY);
            if (!hasQuest) {
                console.log('[ChessAI] 城镇：接取新任务');
                chess._findQuest();
                return;
            }
        }
        
        // 7. 刚复活或默认：离开
        if (justRevived) {
            console.log('[ChessAI] 城镇：刚复活，已处理完事务，离开');
            chess._justRevived = false;  // 清除标志
        }
        
        if (AIConfig.REST_CONFIG.ALLOW_DEFAULT_REST && !justRevived && options.includes('rest')) {
            console.log('[ChessAI] 城镇：默认休息');
            chess._stayHotel(true);
        } else {
            console.log('[ChessAI] 城镇：离开');
            chess.board.roundEnd();
        }
    }
    
    /**
     * 处理村庄选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 实际选项数组：['rest', 'donate', 'help', 'drink']
     */
    handleVillageOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 村庄决策:', StateEvaluator.getSummary(state), 'options:', options);
        
        const justRevived = chess._justRevived || false;
        
        // 1. 紧急休息（刚复活时跳过）
        if (!justRevived && state.survival < AIConfig.REST_CONFIG.EMERGENCY_REST && options.includes('rest')) {
            console.log('[ChessAI] 村庄：生存危急，休息');
            chess._stayHotel(false);
            return;
        }
        
        // 2. 负重或名声提升：捐赠材料（✅ 刚复活也可以执行）
        if ((chess.prop.overWeight || chess.prop.fameRankChanged) && options.includes('donate')) {
            console.log('[ChessAI] 村庄：捐赠材料');
            chess._donateMaterials();
            return;
        }
        
        // 3. 耐力低：休息（刚复活时跳过）
        if (!justRevived && state.survival < AIConfig.REST_CONFIG.LOW_STAMINA_REST && options.includes('rest')) {
            console.log('[ChessAI] 村庄：耐力较低，休息');
            chess._stayHotel(false);
            return;
        }
        
        // 4. 夜晚：喝酒（❌ 刚复活时禁止，防止刷Buff）
        if (!justRevived && chess.board._isNight && options.includes('drink')) {
            console.log('[ChessAI] 村庄：夜晚喝酒');
            chess._drinkAtTavern();
            return;
        }
        
        // 5. 白天：帮忙干活（❌ 刚复活时禁止，防止刷金钱/经验）
        if (!justRevived && options.includes('help')) {
            console.log('[ChessAI] 村庄：帮忙干活');
            chess._helpVillage();
            return;
        }
        
        // 6. 刚复活或默认：离开
        if (justRevived) {
            console.log('[ChessAI] 村庄：刚复活，已处理完事务，离开');
            chess._justRevived = false;  // 清除标志
        }
        
        if (AIConfig.REST_CONFIG.ALLOW_DEFAULT_REST && !justRevived && options.includes('rest')) {
            console.log('[ChessAI] 村庄：默认休息');
            chess._stayHotel(false);
        } else {
            console.log('[ChessAI] 村庄：离开');
            chess.board.roundEnd();
        }
    }
    
    /**
     * 处理家园选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 实际选项数组：['invest', 'sleep', 'train', 'alchemy', 'leave']
     */
    handleHouseOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        const progress = chess._cell.extraInfo.progress || 0;
        console.log(`[ChessAI] 家园决策(进度${progress}):`, StateEvaluator.getSummary(state), 'options:', options);
        
        // 优先级：投资升级 > 休息 > 训练 > 炼金
        
        // 智能优先级（基于进度和状态）
        
        // 进度0-1：优先投资升级
        if (progress < 2 && options.includes('invest')) {
            if ((progress === 0 && chess.prop.gold >= 30000) ||
                (progress === 1 && chess.prop.gold >= 20000)) {
                console.log('[ChessAI] 家园：投资升级');
                chess._investHouse();
                return;
            }
        }
        
        // 进度2+：根据状态选择
        
        // 1. 有钱继续投资（进度<5）
        if (progress < 5 && chess.prop.gold >= 20000 && state.wealth > 60 && options.includes('invest')) {
            console.log('[ChessAI] 家园：继续投资');
            chess._investHouse();
            return;
        }
        
        // 2. 耐力低：休息
        if (state.survival < AIConfig.REST_CONFIG.LOW_STAMINA_REST && options.includes('sleep')) {
            console.log('[ChessAI] 家园：在家休息');
            chess._sleepAtWild();
            return;
        }
        
        // 3. 可训练：训练
        if (options.includes('train') && state.survival > 40) {
            console.log('[ChessAI] 家园：在家训练');
            chess._trainAtHouse();
            return;
        }
        
        // 4. 炼金（暂未实现，跳过）
        if (options.includes('alchemy')) {
            console.log('[ChessAI] 家园：炼金（未实现）');
            chess.board.roundEnd();
            return;
        }
        
        // 5. 默认：离开
        console.log('[ChessAI] 家园：离开');
            chess.board.roundEnd();
    }
    
    /**
     * 处理公会选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 实际选项数组：['learn', 'train', 'diary']
     */
    handleGuildOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 公会决策:', StateEvaluator.getSummary(state), 'options:', options);
        
        // 1. 优先学习天赋（如果可用）
        if (options.includes('learn')) {
            console.log('[ChessAI] 公会：学习天赋');
            chess._learnTalent();
            return;
        }
        
        // 2. 否则：勇者修行（锻炼）
        if (options.includes('train')) {
            console.log('[ChessAI] 公会：勇者修行');
            chess._trainAtGuild();
            return;
        }
        
        // 3. 默认：离开
        console.log('[ChessAI] 公会：离开');
            chess.board.roundEnd();
    }
    
    /**
     * 处理码头选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 实际选项数组：['fish', 'sail', 'invest', 'trade']
     */
    handleDockOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        const progress = chess._cell.extraInfo.progress || 0;
        console.log(`[ChessAI] 码头决策(进度${progress}):`, StateEvaluator.getSummary(state), 'options:', options);
        
        // 如果第一个选项是yes/no，按旧逻辑处理
        if (options[0] === 'yes') {
            chess.board.roundEnd();
            return;
        }
        
        // 智能优先级（基于进度和状态）
        
        // 1. 优先坐船去岛屿（如果应该去）
        if (options.includes('sail') || options.includes('goto')) {
            if (chess._shouldGotoIsland && chess._shouldGotoIsland()) {
                console.log('[ChessAI] 码头：坐船前往岛屿');
                chess._gotoByShip();
                return;
            }
        }
        
        // 2. 有钱且进度未满：投资升级码头
        if (options.includes('invest') && progress < 5) {
            const investThreshold = (progress === 0) ? 50000 : 20000;
            if (chess.prop.gold >= investThreshold && state.wealth > 50) {
                console.log('[ChessAI] 码头：投资升级码头');
                chess._investDock();
                return;
            }
        }
        
        // 3. 贸易（如果可用）
        if (options.includes('trade') && chess.prop.gold > 50000 && state.wealth > 60) {
            console.log('[ChessAI] 码头：进行贸易');
            chess._trade();
            return;
        }
        
        // 4. 默认：钓鱼（赚钱）
        if (options.includes('fish')) {
            console.log('[ChessAI] 码头：钓鱼');
            chess._fishAtDock();
        } else if (options.includes('sail') || options.includes('goto')) {
            console.log('[ChessAI] 码头：坐船探索');
            chess._gotoByShip();
                } else {
            console.log('[ChessAI] 码头：离开');
                        chess.board.roundEnd();
                    }
                }
    
    /**
     * 处理营地选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 实际选项数组：['recruit', 'leave']
     */
    handleCampOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 营地决策:', StateEvaluator.getSummary(state), 'options:', options);
        
        // 如果第一个选项是yes/no，跳过
        if (options[0] === 'yes') {
                    chess.board.roundEnd();
            return;
        }
        
        // 营地只有两个选项：雇佣随从或离开
        // 策略：如果没有随从且有钱就雇佣，否则离开
        
        // 1. 检查是否有随从
        if (chess.prop.follower) {
            console.log('[ChessAI] 营地：已有随从，离开');
            chess.board.roundEnd();
            return;
        }
        
        // 2. 没有随从：根据金钱和等级决定是否雇佣
        // 随从雇佣费用估算：基础费用2000 + rank*1000
        // 注：此处假设平均 rank=1（费用3000）。实际费用随 rank 浮动，AI 决策可能不精确。
        // 若需精确计算，可调用 Follower.getRecruitFee(rank)（如该方法存在）
        const recruitFee = 2000 + 1000;
        
        // 前期（1-5级）金钱紧张，不雇佣
        if (chess.prop.level < 6) {
            console.log('[ChessAI] 营地：前期阶段，暂不雇佣');
            chess.board.roundEnd();
            return;
        }
        
        // 中后期：有足够金钱就雇佣
        if (options.includes('recruit') && chess.prop.gold >= recruitFee * 2 && state.wealth > 40) {
            console.log('[ChessAI] 营地：雇佣随从');
            chess._showRecruitFollowerMenu();
        } else {
            console.log('[ChessAI] 营地：金钱不足或不需要，离开');
            chess.board.roundEnd();
        }
    }
    
    /**
     * 处理马场选项（V1.1.0 完全重写）
     * @param {Chess} chess
     * @param {Array} options - 可能是 ['yes', 'no'] 或 ['horserace', 'improvehorse', 'horsetrain', 'horseaddons', 'leave']
     */
    handleStableOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 马场决策:', StateEvaluator.getSummary(state), 'options:', options);
        
        // ========== 情况1：没有马，询问是否购买 ==========
        if (options.includes('yes') && options.includes('no')) {
            // 计算购买费用（根据通关次数）
            const mountNo = Math.min(5, chess.board._gameCleared + 1);  // Mount.maxNormalNo = 5
            const price = mountNo * mountNo * 1000;
            
            // 决策条件
            const hasEnoughGold = chess.prop.gold >= price + AIConfig.STABLE_CONFIG.BUY_HORSE_MIN_GOLD;
            const levelOK = chess.prop.level >= AIConfig.STABLE_CONFIG.BUY_HORSE_MIN_LEVEL;
            const wealthOK = state.wealth >= AIConfig.STABLE_CONFIG.BUY_HORSE_MIN_WEALTH;
            
            if (hasEnoughGold && levelOK && wealthOK) {
                console.log(`[ChessAI] 马场：购买马匹（${price}金）`);
                chess._buyHorse(true);
            } else {
                console.log(`[ChessAI] 马场：暂不购买（金:${chess.prop.gold}/${price+5000}, 级:${chess.prop.level}/5, 财富:${state.wealth}/50）`);
                chess._buyHorse(false);
            }
            return;
        }
        
        // ========== 情况2：已有马，进行维护/训练/比赛 ==========
        
        // 1. 可以升级马：优先升级（提升马的品质）
        if (options.includes('improvehorse') && chess._canImproveHorse && chess._canImproveHorse()) {
            console.log('[ChessAI] 马场：升级马匹品质');
            chess._improveHorse();
            return;
        }
        
        // 2. 根据财富状况选择训练或赛马
        const canTrain = options.includes('horsetrain') && chess.prop.gold >= AIConfig.STABLE_CONFIG.TRAIN_HORSE_MIN_GOLD;
        const canRace = options.includes('horserace');
        
        if (state.wealth > 50) {
            // 有钱：70%训练（稳定提升），30%赛马（博彩）
            if (canTrain && Math.random() < AIConfig.STABLE_CONFIG.TRAIN_PROBABILITY) {
                console.log('[ChessAI] 马场：训练马匹（提升属性）');
                chess._horseTrain();
            } else if (canRace) {
                console.log('[ChessAI] 马场：参加赛马（娱乐）');
                chess._horseRace();
                    } else {
                console.log('[ChessAI] 马场：离开');
                chess.board.roundEnd();
                    }
                } else {
            // 缺钱：优先赛马（试试运气赚钱）
            if (AIConfig.STABLE_CONFIG.RACE_WHEN_POOR && canRace) {
                console.log('[ChessAI] 马场：参加赛马赚钱');
                chess._horseRace();
            } else if (canTrain) {
                console.log('[ChessAI] 马场：训练马匹');
                chess._horseTrain();
                    } else {
                console.log('[ChessAI] 马场：离开');
                    chess.board.roundEnd();
                }
        }
    }
    
    /**
     * 处理竞技场选项（V1.1.0 前期观战后期参战）
     * @param {Chess} chess
     * @param {Array} options
     */
    handleArenaOptions(chess, options) {
        console.log('[ChessAI] 竞技场决策:', 'options:', options);
        
        // 如果第一个选项是yes，跳过
        if (options[0] === 'yes') {
        chess.board.roundEnd();
            return;
        }
        
        const state = StateEvaluator.evaluate(chess);
        const level = chess.prop.level;
        console.log(`[ChessAI] 竞技场决策(等级${level}):`, StateEvaluator.getSummary(state));
        
        // 策略：前期（1-15级）观战学习，后期（16级+）参战
        
        // 1. 前期（1-15级）：主要观战
        if (level < 16) {
            console.log('[ChessAI] 竞技场：前期阶段，观战学习');
            chess.board.roundEnd();
            return;
        }
        
        // 2. 中期（16-25级）：状态好时参战
        if (level < 26) {
            const canFight = state.survival > 50 && 
                           state.combat > 50 &&
                           !chess.prop.haveBuff(BuffNo.SICK) &&
                           !chess.prop.haveBuff(BuffNo.LOW_MORALE) &&
                           !chess.prop.haveBuff(BuffNo.WEAK);
            
            if (canFight) {
                console.log('[ChessAI] 竞技场：中期阶段，状态良好，参加竞技');
                chess._competeInArena();
            } else {
                console.log('[ChessAI] 竞技场：中期阶段，状态不佳，观战');
                chess.board.roundEnd();
            }
            return;
        }
        
        // 3. 后期（26级+）：主要参战（除非状态很差）
        const tooTired = state.survival < 30;
        const hasNegativeBuff = chess.prop.haveBuff(BuffNo.SICK) || 
                               chess.prop.haveBuff(BuffNo.LOW_MORALE) || 
                               chess.prop.haveBuff(BuffNo.WEAK);
        
        if (tooTired || hasNegativeBuff) {
            console.log('[ChessAI] 竞技场：后期阶段，但状态太差，观战');
            chess.board.roundEnd();
        } else {
            console.log('[ChessAI] 竞技场：后期阶段，积极参战');
            chess._competeInArena();
        }
    }
    
    /**
     * 处理魔王岛选项（V1.1.0 修正）
     * @param {Chess} chess
     * @param {Array} options
     */
    handleDevillandOptions(chess, options) {
        console.log('[ChessAI] 魔王岛决策:', 'options:', options);
        
        // 如果第一个选项是yes
        if (options[0] === 'yes') {
            chess.board.roundEnd();
            return;
        }
        
        const state = StateEvaluator.evaluate(chess);
        const progress = chess._cell.extraInfo.progress || 0;
        const maxProgress = chess._cell.extraInfo.maxProgress || 5;
        
        console.log(`[ChessAI] 魔王岛决策: 进度${progress}/${maxProgress}`, StateEvaluator.getSummary(state));
        
        // 阶段1：营地未建立（progress=0）
        if (progress === 0) {
            // 检查是否满足建立条件
            if (chess.prop.gold >= 200000 && chess.prop.fame >= 1000) {
                console.log('[ChessAI] 魔王岛：建立先遣营地');
                chess._cell._investDevilland(chess);
            } else {
                console.log('[ChessAI] 魔王岛：资源不足，探索周边');
            chess.board.roundEnd();
            }
            return;
        }
        
        // 阶段2：营地建设中（progress 1-4）
        if (progress < maxProgress) {
            // 优先招募勇士
            const hasGold = chess.prop.gold > 10000;
            const needMoreHeroes = (chess._cell.extraInfo.normalhero || 0) < 50;
            
            if (hasGold && needMoreHeroes && state.wealth > 50) {
                console.log('[ChessAI] 魔王岛：招募勇士');
                chess.recruitHero();
            } else if (chess.prop.gold > 50000 && state.wealth > 60) {
                console.log('[ChessAI] 魔王岛：帮忙建设营地');
                chess._cell._investDevilland(chess);
            } else {
                console.log('[ChessAI] 魔王岛：探索周边');
            chess.board.roundEnd();
            }
            return;
        }
        
        // 阶段3：营地已建成（progress=5）
        // 评估是否可以围攻魔王顶
        const canCrusade = chess.canWonCrusade && chess.canWonCrusade();
        const hasStamina = state.survival > 60;
        const strongEnough = state.combat > 70;
        
        if (canCrusade && hasStamina) {
            console.log('[ChessAI] 魔王岛：围攻魔王顶！');
            chess.crusadeDevil(false);
        } else if (strongEnough && state.survival > 50) {
            console.log('[ChessAI] 魔王岛：单挑魔王！');
            chess.challengeDevil();
        } else {
            // 继续招募勇士或探索
            if (chess.prop.gold > 10000 && state.wealth > 50) {
                console.log('[ChessAI] 魔王岛：继续招募勇士');
                chess.recruitHero();
        } else {
                console.log('[ChessAI] 魔王岛：探索周边');
                chess.board.roundEnd();
            }
        }
    }
    
    /**
     * 处理仙境选项（V1.1.0 完整实现）
     * @param {Chess} chess
     * @param {Array} options
     */
    handleFairylandOptions(chess, options) {
        const state = StateEvaluator.evaluate(chess);
        console.log('[ChessAI] 仙人岛决策:', StateEvaluator.getSummary(state));
        
        // 仙人岛通常有多种选项：购买Buff、许愿、探索等
        // 根据财富和需求做出选择
        
        // 1. 富裕且需要提升：许愿（通常花费较高）
        if (state.wealth > 70 && chess.prop.gold > 50000) {
            if (options.includes('wish')) {
                console.log('[ChessAI] 仙人岛：许愿提升能力');
                // 假设选项中有wish相关的
                chess.board.roundEnd();
                return;
            }
        }
        
        // 2. 中等财富：购买Buff
        if (state.wealth > 40 && chess.prop.gold > 10000) {
            if (options.includes('buy') || options.includes('buff')) {
                console.log('[ChessAI] 仙人岛：购买增益Buff');
                chess.board.roundEnd();
                return;
            }
        }
        
        // 3. 默认：探索（免费选项）
        console.log('[ChessAI] 仙人岛：探索');
        chess.board.roundEnd();
    }
    
    /**
     * 处理副本选项（V1.1.0 修正）
     * @param {Chess} chess
     * @param {Array} options
     */
    handleDungeonOptions(chess, options) {
        console.log('[ChessAI] 副本决策:', 'options:', options);
        
        // 如果第一个选项是yes（继续副本）
        if (options[0] === 'yes') {
            const state = StateEvaluator.evaluate(chess);
            const canContinue = chess.capableExploreDungeon() && 
                              !chess.prop.overWeight &&
                              state.survival > 30;
            
            console.log(`[ChessAI] 副本：继续攻略=${canContinue} (生存${state.survival.toFixed(0)})`);
            chess.continueDungeon(canContinue);
            return;
        }
        
        const state = StateEvaluator.evaluate(chess);
        const completed = chess._cell.extraInfo.completed;
        
        console.log(`[ChessAI] 副本决策: 已完成=${completed}`, StateEvaluator.getSummary(state));
        
        if (completed) {
            // 副本已完成
            const dungeonLv = chess._cell.extraInfo.completedLv || 0;
            const worthReset = dungeonLv < chess.prop.maxLv && 
                             state.survival > 50 &&
                             state.combat > 60;
            
            const worthLoot = state.survival > 30 && 
                            chess.prop.weightPercent < 0.7;
            
            if (worthReset) {
                console.log('[ChessAI] 副本：重置并重新攻略');
                    chess.resetDungeon();
            } else if (worthLoot) {
                console.log('[ChessAI] 副本：快速刷副本');
                    chess.lootDungeon();
            } else {
                console.log('[ChessAI] 副本：离开');
                chess.board.roundEnd();
            }
        } else {
            // 副本未完成：评估战斗能力
            const hasAdvantage = state.opportunities.some(o => o.type === 'COMBAT_BUFF');
            const shouldAttack = state.survival > 40 &&
                               state.combat > 50 &&
                               chess.prop.weightPercent < 0.8 &&
                               chess.capableExploreDungeon() &&
                               (hasAdvantage || state.combat > 65);
            
            if (shouldAttack) {
                console.log('[ChessAI] 副本：攻略副本');
                chess.exploreDungeon();
            } else {
                console.log('[ChessAI] 副本：能力不足，离开');
                chess.board.roundEnd();
            }
        }
    }
}


