/**
 * 岛屿事件Mixin - 仙人岛和魔王岛事件
 * 从Chesscell.js拆分出的岛屿事件系统
 * 
 * 包含功能：
 * - 仙人岛6种随机事件（神秘商人、金矿、仙女、远古遗迹、高人传功、上古巨龙）
 * - 魔王岛6种随机事件（尸体搜刮、女妖、怪物巢穴、恶魔王等）
 */

const IslandEventMixin = {
    // ========== 仙人岛事件 ==========
    
    /**
     * 仙人岛随机事件
     * 对应 AS3: fairylandFlag()
     * @param {Chess} chess - 棋子对象
     */
    fairylandFlag(chess) {
        chess.addChat('岛上风景恰似仙境令你流连忘返');
        
        let eventType = Math.floor(Math.random() * 6);
        let randValue = Math.random();
        
        // 检查mustFlag
        if (this.extraInfo.mustFlag) {
            eventType = this.extraInfo.mustFlag;
            if (this.extraInfo.mustRad) {
                randValue = this.extraInfo.mustRad;
            }
            this.extraInfo.mustFlag = null;
            this.extraInfo.mustRad = null;
        }
        
        let useDefaultFlag = false;
        
        switch (eventType) {
            case 1:
                // 神秘商人（卖Buff）- 需要至少10000金（最低商品旅行秘药）
                if (chess.prop.gold < 10000) {
                    useDefaultFlag = true;  // 金钱不足，改触发默认事件
                } else {
                    chess.addChat('你遇到了神秘商人');
                    chess.showBuffSeller();
                }
                break;
                
            case 2:
                // 金矿
                this._fairylandGoldMine(chess, randValue);
                break;
                
            case 3:
                // 仙女（装备升级）
                this._fairylandFairy(chess, randValue);
                break;
                
            case 4:
                // 远古遗迹（神兽战斗）
                this._fairylandRuin(chess, randValue);
                break;
                
            case 5:
                // 高人传功/嘴炮术
                useDefaultFlag = this._fairylandMaster(chess, randValue);
                break;
                
            case 6:
                // 挑战上古巨龙
                this._fairylandDragon(chess);
                break;
                
            default:
                useDefaultFlag = true;
        }
        
        chess.defaultFairylandFlag(useDefaultFlag);
    },
    
    /**
     * 仙境 - 金矿
     */
    _fairylandGoldMine(chess, rand) {
        let goldGain;
        let message = '你发现了金矿，赶紧抄起矿工锄开挖';
        
        if (rand > 0.8) {
            goldGain = 60000;
            message += '\n这条矿脉含金量极高，金钱+' + goldGain;
        } else if (rand > 0.6) {
            goldGain = 30000;
            message += '\n这条矿脉含金量很高，金钱+' + goldGain;
        } else if (rand > 0.4) {
            goldGain = 10000;
            message += '\n这条矿脉含金量一般，金钱+' + goldGain;
        } else {
            goldGain = 4000;
            message += '\n可惜这是条快枯竭的矿脉，金钱+' + goldGain;
        }
        
        chess.addChat(message);
        chess.prop.addGold(goldGain);
        DiaryPanel.getInstance().addDiary(`你在${this._cellName}上挖到金矿`);
        chess.board.roundEnd();
    },
    
    /**
     * 仙境 - 仙女（装备升级）
     */
    _fairylandFairy(chess, rand) {
        if (rand > 0.6) {
            const isWeapon = RandomUtils.percent(60);  // 优化：60%概率武器
            let message = '你不慎把装备掉落湖中，很快便有仙女拿着三件装备浮出水面';
            
            let giveCoat = false;
            if (RandomUtils.randBool()) {  // 优化：50%概率
                message += '\n你连忙将自己外套给她披上，殷殷关切令仙女喜不自胜';
                giveCoat = true;
            } else {
                message += '\n你诚实选择旧装备，仙女夸你品德大标兵';
                giveCoat = false;
            }
            
            chess.addChat(message);
            chess.prop.checkEquipUpgrade(giveCoat, isWeapon);
            DiaryPanel.getInstance().addDiary('你的旧装备掉落湖中，仙女见你帅强插你新装备');
        } else {
            const message = '你不慎把装备掉落湖中，苦等许久仙女才拿着装备悠悠浮出水面' +
                          '\n她微笑着刚要开口，你却大怒道，说好的三选一呢' +
                          '\n原来是你掉落装备的姿势不对，呜呼';
            chess.addChat(message);
        }
        chess.board.roundEnd();
    },
    
    /**
     * 仙境 - 远古遗迹（神兽战斗）
     */
    _fairylandRuin(chess, rand) {
        let message = '你发现了远古遗迹，决定进去一探究竟';
        let enemy = null;
        
        if (rand > 0.7) {
            message += '\n哇，你好像惊动了镇守这里的神兽';
            enemy = Enemy.generateLegendDemon(chess.prop.level);
            enemy.alias = '守护神兽';
        } else if (rand > 0.4) {
            enemy = new Enemy(chess.prop.level, Enemy.ELITE);
        } else {
            const rubbishGain = Math.ceil(chess.prop.level / 15) * 4;
            message += '\n这里早被搜刮过了，只找到' + rubbishGain + '个垃圾';
            chess.addChat(message);
            chess.prop.rubbish += rubbishGain;
            chess.board.roundEnd();
            return;
        }
        
        if (enemy) {
            message += '\n你遭遇了' + enemy.getName() + '，战斗开始';
            chess.addChat(message);
            chess.battleWith(enemy);
        }
    },
    
    /**
     * 仙境 - 高人传功/嘴炮术
     */
    _fairylandMaster(chess, rand) {
        if (rand > 0.8) {
            const expGain = chess.prop.maxLevel * 40;
            chess.addChat('你爬树逗猴玩时不慎坠崖，本应嗝屁了却被高人所救\n得高人传功，经验+' + expGain);
            chess.prop.addExp(expGain);
            DiaryPanel.getInstance().addDiary('你因爬树救猴而坠崖，幸得高人传功施救，实力大增');
            chess.board.roundEnd();
            return false;
        }
        
        // 嘴炮术天赋（30%概率或金钱>100万时触发）
        if ((rand > 0.6 || chess.prop.gold > 1000000) && !chess.talent.haveTalent(Talent.TALK)) {
            chess.addChat('遇到了自称嘴炮王的家伙向你兜售嘴炮术');
            
            // 使用内嵌链接方式（原版风格）
            chess.board.chatPanel.addInlineOptions(
                '是否花费1000000学习嘴炮术？',
                ['yes', 'no'],
                ['再多钱都学', '根本没兴趣'],
                (choice) => {
                    if (choice === 'yes') {
                        if (chess.prop.gold >= 1000000) {
                            chess.prop.reduceGold(1000000);
                            chess.talent.unlockTalent(Talent.TALK);
                            chess.addGreenChat('你学会了【嘴炮】天赋！');
                            DiaryPanel.getInstance().addDiary('你花巨资学会了嘴炮术', true);
                        } else {
                            chess.addChat('你身上没那么多钱');
                        }
                    }
                    chess.board.roundEnd();
                }
            );
            return false;
        }
        
        return true;  // 使用默认事件
    },
    
    /**
     * 仙境 - 挑战上古巨龙
     */
    _fairylandDragon(chess) {
        const dragon = Enemy.generateLegendDemon(chess.prop.maxLevel + 30);
        dragon.alias = '上古巨龙';
        dragon.setAsHeroic();
        dragon.isRare = true;
        
        chess.addChat(`你深入龙穴挑战${dragon.alias}，穴内蜿蜒曲折寸步难行`);
        chess.addChat('你顶着强大的龙威终于匍匐至巨龙脚下');
        chess.battleWith(dragon);
    },
    
    // ========== 魔王岛事件 ==========
    
    /**
     * 魔王岛事件（完整版）
     * @param {Chess} chess 棋子
     */
    triggeredDevilland(chess) {
        const prevProgress = this.extraInfo.progress;
        this.updateProgress(chess.board._round + 1);
        const currentProgress = this.extraInfo.progress;
        
        if (prevProgress !== currentProgress && currentProgress === this.extraInfo.maxProgress) {
            chess.prop.fame += 100;
            chess.addGreenChat('先遣军营地已建成，名声+100');
            DiaryPanel.getInstance().addDiary('你出资创立的先遣军营地建成', true);
        }
        
        if (currentProgress >= 3) {
            const rounds = chess.board._round + 1 - (this.extraInfo.lastTriggeredRound || 0);
            chess.checkCollectedStuff(rounds);
        }
        this.extraInfo.lastTriggeredRound = chess.board._round + 1;
        
        if (chess.devilDefeated) {
            chess.addChat('魔王虽死但怪物们并没有跟着殉葬，也许被你打倒的也只是一具傀儡罢了');
            chess.board.roundEnd();
            return;
        }
        
        switch (currentProgress) {
            case this.extraInfo.maxProgress:
                // 营地建成
                chess.addExpandedChat('营地状况一览');
                this._checkMoreHeroJoined(chess);
                
                if (this.extraInfo.crusadeWon) {
                    chess.board.chatPanel.addInlineOptions(
                        '你打算干什么呢？',
                        ['exploreland', 'recruithero', 'challengedevil', 'walk'],
                        ['探索四周', '招募勇士', '攻略魔王', '继续前进'],
                        (choice) => this._handleDevillandChoice(choice, chess)
                    );
                } else {
                    chess.board.chatPanel.addInlineOptions(
                        '你打算干什么呢？',
                        ['exploreland', 'recruithero', 'crusade', 'walk'],
                        ['探索四周', '招募勇士', '围攻魔王顶', '继续前进'],
                        (choice) => this._handleDevillandChoice(choice, chess)
                    );
                }
                chess._canTeleportDevilland = true;
                break;
                
            case 0:
                // 未建设
                if (chess.prop.fame < 1000) {
                    chess.addChat('岛上遍布魔王的爪牙，你不敢独自深入');
                    this.devillandFlag(chess);
                    break;
                }
                chess.addChat('岛上遍布魔王的爪牙，你得先组织起一支先遣军才能与敌人叫板');
                chess.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    ['exploreland', 'invest', 'walk'],
                    ['探索四周', '建立先遣营地（200000金）', '继续前进'],
                    (choice) => this._handleDevillandChoice(choice, chess)
                );
                break;
                
            case 1:
                // 刚开始建设
                chess.addChat('营地的修建工作似乎人手不足，你来帮忙的话可以加快进度');
                chess.addExpandedChat('营地状况一览');
                chess.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    ['exploreland', 'invest', 'walk'],
                    ['探索四周', '营地帮忙', '继续前进'],
                    (choice) => this._handleDevillandChoice(choice, chess)
                );
                break;
                
            default:
                // 建设中
                chess.addChat('营地的修建工作似乎人手不足，你来帮忙的话可以加快进度');
                chess.addExpandedChat('营地状况一览');
                chess.board.chatPanel.addInlineOptions(
                    '你打算干什么呢？',
                    ['exploreland', 'recruithero', 'invest', 'walk'],
                    ['探索四周', '招募勇士', '营地帮忙', '继续前进'],
                    (choice) => this._handleDevillandChoice(choice, chess)
                );
        }
    },
    
    /**
     * 魔王岛随机事件
     */
    devillandFlag(chess) {
        chess.addChat('你决定先对四周进行一番探索');
        
        let eventType = Math.floor(Math.random() * 6);
        let randValue = Math.random();
        
        // 检查mustFlag
        if (this.extraInfo.mustFlag) {
            eventType = this.extraInfo.mustFlag;
            if (this.extraInfo.mustRad) {
                randValue = this.extraInfo.mustRad;
            }
            this.extraInfo.mustFlag = null;
            this.extraInfo.mustRad = null;
        }
        
        let useDefaultFlag = false;
        
        switch (eventType) {
            case 1:
                // 搜刮勇士尸体
                this._devillandCorpse(chess);
                break;
                
            case 2:
                // 发现其他勇士
                if (this._devillandDiscoverHero(chess)) {
                    return;
                } else {
                    useDefaultFlag = true;
                }
                break;
                
            case 3:
                // 遇到女妖
                this._devillandSuccubus(chess, randValue);
                break;
                
            case 4:
                // 怪物巢穴
                this._devillandNest(chess, randValue);
                break;
                
            case 5:
                // 宝箱
                if (chess.discoverChest(2)) {  // 2 = 魔王岛宝箱
                    return;
                } else {
                    useDefaultFlag = true;
                }
                break;
                
            case 6:
                // 挑战恶魔王
                this._devillandDevilKing(chess);
                break;
                
            default:
                useDefaultFlag = true;
        }
        
        chess.defaultDevillandFlag(useDefaultFlag);
    },
    
    /**
     * 魔界 - 搜刮勇士尸体
     */
    _devillandCorpse(chess) {
        const goldGain = RandomUtils.randInt(1, 6) * 500;  // 优化：金钱[500,3000]
        const stuffGain = RandomUtils.randInt(6, 18);  // 优化：材料[6,18]
        const rareStuffGain = RandomUtils.randInt(0, 12);  // 优化：稀有材料[0,12]
        
        let message = '你发现一具战败勇士的尸体，为了不让他白白牺牲还是搜刮一番吧\n';
        message += `金钱+${goldGain} 基础锻材+${stuffGain}`;
        if (rareStuffGain) {
            message += ` 稀有锻材+${rareStuffGain}`;
        }
        
        chess.addChat(message);
        chess.prop.addGold(goldGain);
        chess.prop.stuff += stuffGain;
        chess.prop.rarestuff += rareStuffGain;
        
        // 尝试获取遗物（优先type 2，否则type 1）
        const relicMgr = Relic.getInstance();
        let relic = relicMgr.getRandomRelic(2);
        if (!relic) {
            relic = relicMgr.getRandomRelic(1);
        }
        if (relic && chess.prop.addRelic(relic)) {
            chess.addGreenChat(`你还发现了${relic.colorName}！`);
        }
        
        chess.board.roundEnd();
    },
    
    /**
     * 魔界 - 遇到女妖
     */
    _devillandSuccubus(chess, rand) {
        const succubiNames = ['紫妖', '蓝妖', '红妖', '白妖', '黑妖'];
        const succubiName = succubiNames[Math.floor(Math.random() * succubiNames.length)];
        
        if (rand > 0.6) {
            const message = `你遇到几个新兵蛋子在围攻${succubiName}，你呵斥岂能以多欺少将他们赶走` +
                          `\n受伤的女妖倒在地上娇喘连连，你深知留她性命只会祸害人间` +
                          `\n于是你决定最后再让她祸害一次`;
            chess.addChat(message);
            chess.prop.addBuff(BuffNo.SATISFIED, chess.board._round + 1);  // 满足Buff
            chess.prop.restoreStamina(chess.prop.maxStamina);
            DiaryPanel.getInstance().addDiary(`你为了不让${succubiName}再祸害他人，毅然以身饲妖`);
        } else {
            const goldGain = 50 + Math.round(Math.random() * 5) * 50;
            const stuffGain = 1 + Math.round(Math.random() * 5);
            
            const message = `你遇到受伤的${succubiName}，仔细看去此妖美艳异常令人难以把持` +
                          `\n你清楚人妖殊途，可眼看四下无人你还是起了歹念` +
                          `\n于是你扑过去夺走她的财物后扬长而去` +
                          `\n金钱+${goldGain} 基础锻材+${stuffGain}`;
            chess.addChat(message);
            chess.prop.addGold(goldGain);
            chess.prop.stuff += stuffGain;
        }
        chess.board.roundEnd();
    },
    
    /**
     * 魔界 - 怪物巢穴
     */
    _devillandNest(chess, rand) {
        let message = '你误闯了怪物巢穴';
        let enemy = null;
        
        if (rand > 0.7) {
            message += '\n哇，这里好像是恶魔领主的地盘';
            enemy = Enemy.generateLegendDemon(chess.prop.level);
            enemy.alias = '恶魔领主';
        } else {
            enemy = new Enemy(chess.prop.level, Enemy.ELITE, 3);  // 魔族
        }
        
        message += '\n你遭遇了' + enemy.getName() + '，战斗开始';
        chess.addChat(message);
        chess.battleWith(enemy);
    },
    
    /**
     * 魔界 - 挑战恶魔王
     */
    _devillandDevilKing(chess) {
        const devilKing = Enemy.generateLegendDemon(chess.prop.maxLevel + 30);
        devilKing.alias = '恶魔之王';
        devilKing.setAsHeroic();
        devilKing.isRare = true;
        
        chess.addChat(`你深入魔王殿挑战${devilKing.alias}，四周魔气缭绕压得你喘不过气`);
        chess.addChat('你顶着恐怖的魔威终于来到魔王宝座前');
        chess.battleWith(devilKing);
    },
    
    /**
     * 魔界 - 发现其他勇士（招募囚犯）
     * AS3: discoverHero()
     */
    _devillandDiscoverHero(chess) {
        if (this.extraInfo.progress >= 2) {
            const normalCount = 1 + Math.floor(Math.random() * 20);
            const eliteCount = Math.floor(Math.random() * 6);
            
            chess.heroArmyAdd(normalCount, eliteCount);
            
            let message = '你遇到一批被流放的囚犯，遂游说他们加入讨魔先遣军';
            message += `<br>有${normalCount + eliteCount}个囚犯被你打到感动加入`;
            chess.addChat(message);
            
            DiaryPanel.getInstance().addDiary('你的肺腑感言吸引到一批流亡囚犯加入讨魔先遣军');
            chess.board.roundEnd();
            return true;
        }
        return false;
    },
    
    /**
     * 处理魔王岛选项
     */
    _handleDevillandChoice(choice, chess) {
        switch (choice) {
            case 'exploreland':
                this.devillandFlag(chess);
                break;
                
            case 'recruithero':
                chess.recruitHero();
                break;
                
            case 'invest':
                this._investDevilland(chess);
                break;
                
            case 'crusade':
                chess.crusadeDevil(false);
                break;
                
            case 'challengedevil':
                if (!chess.capableChallengeDevil()) {
                    chess.addChat('你的实力还不足以挑战魔王');
                    chess.addChat('（需要军队战力>200 或 综合等级>400）');
                    chess.board.roundEnd();
                } else {
                    chess.challengeDevil();
                }
                break;
                
            case 'walk':
                chess._handleForwardChoice('walk', false);
                break;
        }
    },
    
    /**
     * 投资魔王岛建设
     */
    _investDevilland(chess) {
        const isFirstInvest = (this.extraInfo.progress === 0);
        const cost = isFirstInvest ? 200000 : 0;
        
        if (isFirstInvest) {
            if (chess.prop.gold < cost) {
                chess.addChat(`金钱不足，需要${cost}金`);
                chess.board.roundEnd();
                return;
            }
            
            chess.prop.reduceGold(cost);
            this.extraInfo.progress = 1;
            this.extraInfo.buildUpdatedRound = chess.board._round + 1;
            chess.addGreenChat('你决定建立先遣军营地，工人们开始忙碌起来');
        } else {
            // 帮忙加快进度
            this.extraInfo.builtRound += this.extraInfo.builtRoundAdd || 30;
            chess.addGreenChat('你加入营地建设，进度加快了');
        }
        
        if (chess._panel) {
            chess._panel.updateUI();
        }
        
        chess.board.roundEnd();
    },
    
    /**
     * 检查是否有脑残粉自动加入
     * AS3: checkMoreHeroJoined()
     */
    _checkMoreHeroJoined(chess) {
        if (this.extraInfo.progress >= 2 && chess.prop.fame > 1500 && Math.random() > 0.7) {
            const normalCount = 1 + Math.floor(Math.random() * 20);
            const eliteCount = Math.floor(Math.random() * 6);
            
            chess.heroArmyAdd(normalCount, eliteCount);
            
            const message = `随着你名声日益提高，有${normalCount + eliteCount}个你的脑残粉自主加入讨魔先遣军`;
            chess.addChat(message);
            
            DiaryPanel.getInstance().addDiary('你的人格魅力吸引到一批有为青年加入讨魔先遣军');
        }
    }
};

