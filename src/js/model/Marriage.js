/**
 * 婚姻系统
 * 对应 AS3: csh.model.Marriage
 * 
 * 功能：
 * 1. 6种妻子类型（村长女儿、贵族千金、随从、女斗士、神秘女子、兽耳美少女）
 * 2. 结婚条件和流程
 * 3. 妻子在家/跟随管理
 * 4. 妻子特殊能力（炼金、派对、训练）
 * 5. 存档/读档
 */

class Marriage {
    // 妻子类型常量
    static VILLAGER = 1;    // 村长女儿
    static NOBLE = 2;       // 贵族千金
    static FOLLOWER = 3;    // 随从
    static FIGHTER = 4;     // 女斗士
    static MYSTERY = 5;     // 神秘女子
    static ANIMAL = 6;      // 兽耳美少女
    
    // 单例实例
    static _instance = null;
    
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!Marriage._instance) {
            Marriage._instance = new Marriage();
        }
        return Marriage._instance;
    }
    
    constructor() {
        // 防止重复创建
        if (Marriage._instance) {
            return Marriage._instance;
        }
        
        this.initialize();
        Marriage._instance = this;
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 婚姻状态
        this.married = false;           // 是否已婚
        this.wifeAtHome = false;        // 妻子是否在家
        this.wifeName = null;           // 妻子名字
        this.wifeNo = 0;                // 妻子类型编号
        
        // 房屋信息
        this.homeCellIndex = -1;        // 当前家的格子索引
        this.homeCellIndexEver = -1;    // 曾经家的格子索引
        
        // 拒绝记录
        this.galRefusedCells = [];      // 拒绝过求婚的格子索引列表
        
        // 随从妻子引用
        this.refFollower = null;
        
        // 妻子数据
        this.gals = [
            {
                name: '村长女儿',
                galNo: Marriage.VILLAGER,
                gifts: 80000
            },
            {
                name: '贵族千金',
                galNo: Marriage.NOBLE,
                gifts: 300000
            },
            {
                name: '随从',
                galNo: Marriage.FOLLOWER,
                gifts: 0
            },
            {
                name: '女斗士',
                galNo: Marriage.FIGHTER,
                gifts: 0
            },
            {
                name: '神秘女子',
                galNo: Marriage.MYSTERY,
                gifts: 0
            },
            {
                name: '兽耳美少女',
                galNo: Marriage.ANIMAL,
                gifts: 0,
                promised: false
            }
        ];
        
        console.log('[Marriage] 婚姻系统已初始化');
    }
    
    /**
     * 重置婚姻状态
     */
    reset() {
        this.initialize();
    }
    
    /**
     * 获取妻子类型编号
     */
    getWifeNo() {
        return this.wifeNo;
    }
    
    /**
     * 根据编号获取妻子名称
     */
    getWifeNameByNo(wifeNo) {
        const gal = this.gals[wifeNo - 1];
        return gal ? gal.name : null;
    }
    
    /**
     * 是否已婚随从
     */
    get marriedFollower() {
        return this.married && this.wifeNo === Marriage.FOLLOWER;
    }
    
    // ========== 位置检查 ==========
    
    /**
     * 检查妻子是否在家
     */
    checkWifeAtHome(chess) {
        return chess.cell.index === this.homeCellIndex;
    }
    
    /**
     * 检查妻子是否可以帮助炼金
     */
    canHelpAlchemy(chess) {
        if (this.wifeNo === Marriage.VILLAGER) {
            return chess.cell.index === this.homeCellIndex;
        }
        return false;
    }
    
    /**
     * 检查妻子是否可以帮助派对
     */
    canHelpParty(chess) {
        if (this.wifeNo === Marriage.NOBLE) {
            return chess.cell.index === this.homeCellIndex;
        }
        return false;
    }
    
    /**
     * 检查妻子是否可以帮助训练
     */
    canHelpTrain(chess) {
        if (this.wifeNo === Marriage.FIGHTER) {
            return chess.cell.index === this.homeCellIndex;
        }
        return false;
    }
    
    // ========== 妻子接回家 ==========
    
    /**
     * 检查并把妻子接回家
     */
    checkTakeWifeHome(chess) {
        if (this.married && !this.wifeAtHome) {
            if (this.wifeNo === Marriage.FOLLOWER) {
                // 随从妻子
                if (chess.prop.removeWifeFromOldFollower(this.refFollower)) {
                    if (this.refFollower !== chess.prop.follower) {
                        chess.addChat(this.refFollower.name + '从冒险者营地赶过来了');
                        this.wifeAtHome = true;
                        this.homeCellIndex = chess.cell.index;
                        this.homeCellIndexEver = this.homeCellIndex;
                    }
                }
            } else if (this.wifeNo !== Marriage.ANIMAL) {
                // 其他类型妻子（兽耳美少女不能接回家）
                this.wifeAtHome = true;
                this.homeCellIndex = chess.cell.index;
                chess.addChat('你欢天喜地把新婚妻子接回了家<br>但冒险还要继续，想过没羞没臊的生活要等打败魔王以后');
                DiaryPanel.getInstance().addDiary('你将新婚妻子接回自家宅邸', true);
            }
        }
    }
    
    /**
     * 妻子欢迎回家
     */
    checkWifeGreet(chess) {
        if (this.married && this.wifeAtHome && chess.cell.index === this.homeCellIndex) {
            chess.addChat('刚进家门，妻子忙迎上来伺候你宽衣脱鞋');
        }
    }
    
    // ========== 随从妻子跟随/留守 ==========
    
    /**
     * 询问随从妻子是否跟随/留守
     */
    askWifeFollowOrStay(chess) {
        if (this.wifeNo === Marriage.FOLLOWER && chess.haveHouse) {
            if (chess.cell.index === this.homeCellIndex || 
                (!this.wifeAtHome && chess.cell.cellType === CellType.HOUSE)) {
                
                if (this.wifeAtHome) {
                    // 使用内嵌链接方式（原版风格）
                    chess.board.chatPanel.addInlineOptions(
                        `你要带${this.refFollower.name}在身边解乏吗？`,
                        ['yes', 'no'],
                        ['解乏你懂的', '还是留下好'],
                        (choice) => this.checkWifeFollowOrStay(chess, choice === 'yes')
                    );
                } else {
                    // 使用内嵌链接方式（原版风格）
                    chess.board.chatPanel.addInlineOptions(
                        `你要留${this.refFollower.name}下来看家吗？`,
                        ['yes', 'no'],
                        ['家里得留人', '还是带着好'],
                        (choice) => this.checkWifeFollowOrStay(chess, choice === 'yes')
                    );
                }
                return true;
            }
        }
        return false;
    }
    
    /**
     * 处理随从妻子跟随/留守选择
     */
    checkWifeFollowOrStay(chess, agree) {
        if (agree) {
            if (this.wifeAtHome) {
                // 带走
                this.wifeAtHome = false;
                this.homeCellIndexEver = this.homeCellIndex;
                this.homeCellIndex = -1;
                chess.addChat(`你决定带${this.refFollower.name}在身边，夫妻同行骑乐无穷`);
                
                if (chess.prop.follower !== this.refFollower) {
                    chess.prop.changeFollower(this.refFollower, chess.board._round);
                    chess.addChat(`${this.refFollower.name}加入了你的队伍`);
                }
            } else {
                // 留守
                this.wifeAtHome = true;
                this.homeCellIndex = chess.cell.index;
                this.homeCellIndexEver = this.homeCellIndex;
                chess.addChat(`你决定留${this.refFollower.name}在家里，免得在外磕着碰着`);
                
                if (chess.prop.follower === this.refFollower) {
                    chess.prop.removeFollower();
                }
            }
        }
        
        // 显示前进选项
        chess.board.roundEnd();
    }
    
    /**
     * 让随从妻子回家
     */
    letWifeFollowerHome(chess) {
        this.wifeAtHome = true;
        this.homeCellIndex = this.homeCellIndexEver;
        
        if (this.homeCellIndex === -1) {
            // 找最近的房屋
            const nearestHouse = chess.board.getNearestCell(chess.cell.index, CellType.HOUSE);
            if (nearestHouse) {
                this.homeCellIndex = nearestHouse.index;
            }
        }
    }
    
    // ========== 求婚检查 ==========
    
    /**
     * 检查是否可以与随从结婚
     */
    checkMarryWithFollower(chess) {
        if (this.married) {
            return false;
        }
        
        if (chess.prop.follower && chess.prop.follower.canMarry()) {
            chess.addChat(`你和${chess.prop.follower.name}在长期的旅途中积累了深厚情谊，你寻思着是否该向她求婚`);
            
            // 使用内嵌链接方式（原版风格）
            chess.board.chatPanel.addInlineOptions(
                `是否要向${chess.prop.follower.name}求婚呢？（你只能有1个妻子，一旦选择就没得反悔）`,
                ['yes', 'no'],
                ['等这天很久了', '她不是我真爱'],
                (choice) => this.propose(chess, choice === 'yes')
            );
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否可以与女斗士结婚
     */
    checkMarryWithFighter(chess) {
        if (this.married || this.galRefusedCells.indexOf(chess.cell.index) !== -1) {
            return false;
        }
        
        chess.addChat('曾是你比赛对手的女斗士表示很认同你的实力，希望能成为你的女人');
        
        // 使用内嵌链接方式（原版风格）
        chess.board.chatPanel.addInlineOptions(
            '是否接受这个提议呢？（你只能有1个妻子，一旦选择就没得反悔）',
            ['yes', 'no'],
            ['她就是我的菜', '全然没有感觉'],
            (choice) => this.propose(chess, choice === 'yes')
        );
        return true;
    }
    
    /**
     * 检查是否可以与村姑/贵族结婚
     */
    checkMarryWithGal(chess, isNoble) {
        if (this.married || this.galRefusedCells.indexOf(chess.cell.index) !== -1) {
            return false;
        }
        
        if (isNoble) {
            return this._checkMarryWithNoble(chess);
        } else {
            return this._checkMarryWithVillager(chess);
        }
    }
    
    /**
     * 检查是否可以与村长女儿结婚
     */
    _checkMarryWithVillager(chess) {
        if (chess.haveHouse && chess.prop.fame >= 500) {
            const gifts = this.gals[Marriage.VILLAGER - 1].gifts;
            chess.addChat('村长看你年少有为，有意把女儿许配给你');
            
            // 使用内嵌链接方式（原版风格）
            chess.board.chatPanel.addInlineOptions(
                '是否要答应这门婚事呢？（你只能有1个妻子，一旦选择就没得反悔）',
                ['yes', 'no'],
                [`应允（${gifts}礼金）`, '婉拒'],
                (choice) => this.propose(chess, choice === 'yes')
            );
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否可以与贵族千金结婚
     */
    _checkMarryWithNoble(chess) {
        if (chess.haveHouse && chess.prop.fame >= 1000) {
            const gifts = this.gals[Marriage.NOBLE - 1].gifts;
            chess.addChat('有贵族看中你的名声，想把千金下嫁于你');
            
            // 使用内嵌链接方式（原版风格）
            chess.board.chatPanel.addInlineOptions(
                '是否要答应这门婚事呢？（你只能有1个妻子，一旦选择就没得反悔）',
                ['yes', 'no'],
                [`应允（${gifts}礼金）`, '婉拒'],
                (choice) => this.propose(chess, choice === 'yes')
            );
            return true;
        }
        return false;
    }
    
    // ========== 求婚和结婚 ==========
    
    /**
     * 处理求婚回应
     */
    propose(chess, agree) {
        if (agree) {
            // 同意结婚
            switch (chess.cell.cellType) {
                case CellType.TOWN:
                    this.wedding(chess, this.gals[Marriage.NOBLE - 1]);
                    break;
                case CellType.VILLAGE:
                    this.wedding(chess, this.gals[Marriage.VILLAGER - 1]);
                    break;
                case CellType.CAMP:
                    this.wedding(chess, this.gals[Marriage.FOLLOWER - 1]);
                    break;
                case CellType.ARENA:
                    this.wedding(chess, this.gals[Marriage.FIGHTER - 1]);
                    break;
            }
        } else {
            // 拒绝结婚
            switch (chess.cell.cellType) {
                case CellType.TOWN:
                    chess.addChat('你婉拒了贵族提出的婚事，千金大小姐非你所爱');
                    DiaryPanel.getInstance().addDiary('你婉拒了与贵族千金的婚事');
                    this.galRefusedCells.push(chess.cell.index);
                    chess.triggeredTownOrVillage(true);
                    break;
                    
                case CellType.VILLAGE:
                    chess.addChat('你婉拒了村长提出的婚事，村姑太天真不适合你');
                    DiaryPanel.getInstance().addDiary('你婉拒了与村长女儿的婚事');
                    this.galRefusedCells.push(chess.cell.index);
                    chess.triggeredTownOrVillage(false);
                    break;
                    
                case CellType.CAMP:
                    chess.prop.follower.marriageType = 2;  // 标记为已拒绝
                    chess.addChat('你三思过后还是觉得保持现状最好');
                    DiaryPanel.getInstance().addDiary('你打消了把随从变成妻子的念头');
                    chess.board.roundEnd();
                    break;
                    
                case CellType.ARENA:
                    chess.addChat('你对女汉子只有敬意没有爱意，只能表示肥肠抱歉');
                    DiaryPanel.getInstance().addDiary('你拒绝了女斗士对你的爱');
                    this.galRefusedCells.push(chess.cell.index);
                    chess.board.roundEnd();
                    break;
                    
                default:
                    chess.board.roundEnd();
            }
        }
    }
    
    /**
     * 举行婚礼
     */
    wedding(chess, gal) {
        const gifts = gal.gifts;
        
        // 检查礼金是否足够
        if (gifts > 0 && chess.prop.gold < gifts) {
            chess.addChat('你很想答应这门婚事可却因凑不齐礼金而告吹');
            chess.board.roundEnd();
            return;
        }
        
        // 设置妻子信息
        this.wifeNo = gal.galNo;
        
        // 根据妻子类型显示不同消息
        switch (this.wifeNo) {
            case Marriage.VILLAGER:
                chess.prop.reduceGold(gifts);
                chess.addChat(`你早就对村长那天真烂漫小清新的闺女垂涎已久，自然是一口答应<br>支付了${gifts}礼金`);
                chess.addChat('所谓择日不如撞日，你在村口大摆筵席当天就把这婚办了');
                break;
                
            case Marriage.NOBLE:
                chess.prop.reduceGold(gifts);
                chess.addChat(`你早就听闻那贵族千金美貌冠绝全城，没有理由不答应<br>支付了${gifts}礼金`);
                chess.addChat('正好今天就是吉日，你宴请全城场面之浩大堪比王室婚礼');
                break;
                
            case Marriage.FOLLOWER:
                chess.addChat('你鼓起勇气向心仪已久的她求婚，而对方也欣然同意');
                chess.addChat('你们在其他冒险者的祝福与见证之下交换了信物和唾液');
                this.refFollower = chess.prop.follower;
                this.refFollower.marriageType = 1;
                this.refFollower.duration = 0;  // 永久
                gal.name = this.refFollower.name;
                
                if (chess.haveHouse) {
                    chess.prop.removeWifeFromOldFollower(this.refFollower);
                }
                break;
                
            case Marriage.FIGHTER:
                chess.addChat('虽然她腹肌发达，但修长健美的体型还是让你颇为心动');
                chess.addChat('没有戒指和海誓山盟，你们就地来一发权当是结婚仪式了');
                break;
        }
        
        // 完成结婚
        this.married = true;
        this.wifeName = gal.name;
        
        chess.addGreenChat(`${this.wifeName}成为了你的妻子`);
        DiaryPanel.getInstance().addDiary(`你与${this.wifeName}喜结连理，世人传为佳话`, true);
        
        chess.board.roundEnd();
    }
    
    // ========== 特殊结婚事件 ==========
    
    /**
     * 检查与神秘女子结婚
     */
    checkMarryWithMystery(chess) {
        if (this.married) {
            chess.addChat('可惜你已有妻室，否则她就嫁你了');
            DiaryPanel.getInstance().addDiary('你没能娶到神秘女子只因你已有妻室');
            return;
        }
        
        if (!chess.haveHouse) {
            chess.addChat('可惜你没有房产，否则她就嫁你了');
            DiaryPanel.getInstance().addDiary('你没能娶到神秘女子只因你没有房产');
            return;
        }
        
        // 直接结婚
        const gal = this.gals[Marriage.MYSTERY - 1];
        this.wifeNo = gal.galNo;
        this.married = true;
        this.wifeName = gal.name;
        
        chess.addChat('她依偎在你肩膀，神情流露出只要你一个眼神肯定她的爱就有意义<br>你没法子不肯定，因为这是命中注定');
        chess.addGreenChat(`${this.wifeName}成为了你的妻子`);
        DiaryPanel.getInstance().addDiary(`你与${this.wifeName}喜结连理，世人传为佳话`, true);
    }
    
    /**
     * 检查与兽耳美少女约定
     */
    checkPromiseAnimalGal(chess) {
        if (!this.married) {
            const gal = this.gals[Marriage.ANIMAL - 1];
            
            if (!gal.promised) {
                gal.promised = true;
                this.wifeNo = gal.galNo;
                this.wifeName = gal.name;
                
                chess.addChat(`你与${this.wifeName}一见钟情，她的耳朵正是你喜欢的类型<br>可是兽人禁止通婚，于是你们约定若干年后你若未娶，就去山的那边海的那边有一群兽精灵的地方找她`);
                DiaryPanel.getInstance().addDiary(`你与${this.wifeName}作了一个日后相见的约定`);
                
                chess.board.roundEnd();
                return true;
            }
        }
        return false;
    }
    
    // ========== 存档/读档 ==========
    
    /**
     * 保存数据
     */
    getSaveData() {
        if (!this.wifeNo && this.galRefusedCells.length === 0) {
            return null;
        }
        
        const data = {};
        
        if (this.wifeNo) {
            data.wifeNo = this.wifeNo;
            data.wifeName = this.wifeName;
            data.married = this.married;
            data.wifeAtHome = this.wifeAtHome;
            data.homeCellIndex = this.homeCellIndex;
            data.homeCellIndexEver = this.homeCellIndexEver;
        }
        
        if (this.galRefusedCells.length > 0) {
            data.galRefusedCells = this.galRefusedCells;
        }
        
        return data;
    }
    
    /**
     * 加载数据
     */
    loadData(data) {
        if (!data) {
            return;
        }
        
        if (data.wifeNo) {
            this.wifeNo = data.wifeNo;
            this.wifeName = data.wifeName;
            this.married = data.married;
            this.wifeAtHome = data.wifeAtHome;
            this.homeCellIndex = data.homeCellIndex;
            this.homeCellIndexEver = data.homeCellIndexEver;
        }
        
        if (data.galRefusedCells) {
            this.galRefusedCells = data.galRefusedCells;
        }
        
        console.log('[Marriage] 婚姻数据已加载:', data);
    }

    /**
     * 保存婚姻数据到存档对象（与 loadRecord 对称）
     * @param {Object} info - getChessInfo 收集的存档对象
     */
    checkSaveRecord(info) {
        info.marriage = this.getSaveData();
    }

    /**
     * 从主角存档恢复婚姻数据
     * @param {Object} heroData - 主角存档对象（包含 marriage 字段）
     */
    loadRecord(heroData) {
        if (heroData && heroData.marriage) {
            this.loadData(heroData.marriage);
        }
    }
}

