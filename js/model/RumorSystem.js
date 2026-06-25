/**
 * 线索/传闻系统 - V1.0.6
 * 
 * 功能：
 * - 玩家通过喝酒打听消息获得Boss线索
 * - 线索有有效期（10回合）
 * - 持有线索时到达对应格子必定触发Boss战
 * - 增强游戏的策略性和互动性
 */

class RumorSystem {
    // 线索类型常量（仅限特殊Boss/NPC，野生Boss不在此列）
    static CLUE_TYPES = {
        CROW_KING: 'crow_king',           // 乌鸦王（营地）- 特殊Boss
        HORSE_THIEF: 'horse_thief',       // 盗马贼（马场）- 特殊Boss
        CYCLOPS: 'cyclops',               // 独眼巨人（马场）- 特殊Boss
        SMITH_MASTER: 'smith_master'      // 铁匠大师（温泉）- 特殊NPC
    };
    
    // 线索配置（只包含特殊Boss/NPC，不包含野生Boss）
    static CLUE_CONFIGS = {
        [RumorSystem.CLUE_TYPES.CROW_KING]: {
            name: '乌鸦王',
            cellType: CellType.CAMP,
            cellName: '营地',
            description: '据说最近有只巨大的乌鸦王在营地上空盘旋，袭击冒险者',
            reward: '击败后营地质量提升，雇佣的随从亲密度更高'
        },
        [RumorSystem.CLUE_TYPES.HORSE_THIEF]: {
            name: '盗马贼',
            cellType: CellType.STABLE,
            cellName: '马场',
            description: '听说夜晚有盗马贼潜入马场偷马，被抓住的话...',
            reward: '击败后可能获得高级马匹'
        },
        [RumorSystem.CLUE_TYPES.CYCLOPS]: {
            name: '独眼巨人',
            cellType: CellType.STABLE,
            cellName: '马场',
            description: '据传白天有独眼巨人在马场吞食马匹，非常凶残',
            reward: '击败后永久攻击+30'
        },
        [RumorSystem.CLUE_TYPES.SMITH_MASTER]: {
            name: '铁匠大师',
            cellType: CellType.SPRING,
            cellName: '温泉',
            description: '传说中的铁匠大师会在温泉休养，遇到他可以免费强化装备',
            reward: '免费强化装备+1（100%成功）'
        }
    };
    
    constructor(chess) {
        this.chess = chess;
        this.clues = new Map();  // key: clueType, value: {obtainedRound, expireRound, config}
        console.log('[RumorSystem] 线索系统已初始化');
    }
    
    /**
     * 添加线索
     * @param {string} clueType - 线索类型
     * @param {number} validRounds - 有效回合数（默认10回合）
     */
    addClue(clueType, validRounds = 10) {
        if (!RumorSystem.CLUE_CONFIGS[clueType]) {
            console.error(`[RumorSystem] 未知的线索类型: ${clueType}`);
            return false;
        }
        
        const config = RumorSystem.CLUE_CONFIGS[clueType];
        const currentRound = this.chess.board._round;
        
        const clue = {
            type: clueType,
            config: config,
            obtainedRound: currentRound,
            expireRound: currentRound + validRounds,
            valid: true
        };
        
        this.clues.set(clueType, clue);
        
        console.log(`[RumorSystem] 获得线索：${config.name}（${config.cellName}），有效期${validRounds}回合`);
        
        return true;
    }
    
    /**
     * 检查是否有特定类型的线索
     * @param {string} clueType - 线索类型
     * @returns {boolean}
     */
    hasClue(clueType) {
        const clue = this.clues.get(clueType);
        if (!clue) return false;
        
        // 检查是否过期
        if (this.chess.board._round > clue.expireRound) {
            console.log(`[RumorSystem] 线索已过期：${clue.config.name}`);
            this.clues.delete(clueType);
            return false;
        }
        
        return true;
    }
    
    /**
     * 使用线索（触发事件后）
     * @param {string} clueType - 线索类型
     */
    useClue(clueType) {
        const clue = this.clues.get(clueType);
        if (!clue) return false;
        
        console.log(`[RumorSystem] 使用线索：${clue.config.name}`);
        this.clues.delete(clueType);
        return true;
    }
    
    /**
     * 获取所有有效线索
     * @returns {Array}
     */
    getAllValidClues() {
        const validClues = [];
        const currentRound = this.chess.board._round;
        
        for (const [type, clue] of this.clues) {
            if (currentRound <= clue.expireRound) {
                validClues.push(clue);
            } else {
                // 自动清除过期线索
                this.clues.delete(type);
            }
        }
        
        return validClues;
    }
    
    /**
     * 清理所有过期线索
     */
    clearExpiredClues() {
        const currentRound = this.chess.board._round;
        const expiredTypes = [];
        
        for (const [type, clue] of this.clues) {
            if (currentRound > clue.expireRound) {
                expiredTypes.push(type);
                console.log(`[RumorSystem] 线索已过期：${clue.config.name}`);
            }
        }
        
        expiredTypes.forEach(type => this.clues.delete(type));
        
        return expiredTypes.length;
    }
    
    /**
     * 获取可在酒馆打听的消息列表（随机）
     * @returns {string} - 返回线索类型，如果没有可打听的则返回null
     */
    getRandomRumor() {
        // 过滤掉已有的线索
        const availableTypes = Object.keys(RumorSystem.CLUE_CONFIGS).filter(
            type => !this.hasClue(type)
        );
        
        if (availableTypes.length === 0) {
            return null;  // 所有线索都已获得
        }
        
        // 随机选择一个
        const randomIndex = Math.floor(Math.random() * availableTypes.length);
        return availableTypes[randomIndex];
    }
    
    /**
     * 序列化为JSON对象（用于存档）
     */
    toJSON() {
        const cluesArray = [];
        for (const [type, clue] of this.clues) {
            cluesArray.push({
                type: type,
                obtainedRound: clue.obtainedRound,
                expireRound: clue.expireRound
            });
        }
        return { clues: cluesArray };
    }
    
    /**
     * 从JSON对象恢复（用于读档）
     */
    fromJSON(data) {
        if (!data || !data.clues) return;
        
        this.clues.clear();
        for (const clueData of data.clues) {
            const config = RumorSystem.CLUE_CONFIGS[clueData.type];
            if (config) {
                this.clues.set(clueData.type, {
                    type: clueData.type,
                    config: config,
                    obtainedRound: clueData.obtainedRound,
                    expireRound: clueData.expireRound,
                    valid: true
                });
            }
        }
        
        console.log(`[RumorSystem] 从存档恢复 ${this.clues.size} 个线索`);
    }
}
