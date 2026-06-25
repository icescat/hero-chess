// 棋盘格子类 - AS3: csh.model.Chesscell
class Chesscell {
    constructor(board, index, gridX, gridY, pos) {
        this.board = board;
        this._index = index;
        this._gridX = gridX;      // 网格坐标X
        this._gridY = gridY;      // 网格坐标Y
        this._pos = pos;          // 实际显示坐标
        this._display = null;
        this._cellType = 0;
        this._cellName = '';
        this._canStay = false;
        this._noOption = false;
        this._isBuilding = false;
        this.extraInfo = {};
        
        this.initialize();
        this.drawDisplay();
    }
    
    get display() {
        return this._display;
    }
    
    get cellName() {
        return this._cellName;
    }
    
    get index() {
        return this._index;
    }
    
    get cellType() {
        return this._cellType;
    }
    
    get pos() {
        return this._pos;
    }
    
    get canStay() {
        return this._canStay;
    }
    
    get isBuilding() {
        return this._isBuilding;
    }
    
    // 初始化格子属性 - AS3: initialize()
    initialize() {
        this._isBuilding = false;
        this.extraInfo = {
            mustFlag: 0,
            mustRad: 0,
            flagRound: 0
        };
        
        switch(this._index) {
            case 0:
            case 19:
                this._cellType = CellType.TOWN;
                this._canStay = true;
                this._cellName = '城镇';
                this._isBuilding = true;
                this.extraInfo.popularity = 0;
                this.extraInfo.order = (this._index === 19) ? 2 : 1;  // 第几座城镇
                this.extraInfo.ruinedRound = 0;
                this.extraInfo.ruinedDuration = 0;
                break;
            
            case 11:
            case 30:
                this._cellType = CellType.VILLAGE;
                this._canStay = true;
                this._cellName = '村庄';
                this._isBuilding = true;
                this.extraInfo.popularity = 0;
                this.extraInfo.order = (this._index === 30) ? 2 : 1;  // 第几座村庄
                this.extraInfo.ruinedRound = 0;
                this.extraInfo.ruinedDuration = 0;
                break;
            
            case 1:
            case 20:
                this._cellType = CellType.HOUSE;
                this._cellName = '城边空地';
                this.extraInfo.progress = 0;
                this.extraInfo.maxProgress = 6;
                this.extraInfo.builtRound = 0;
                this.extraInfo.buildNeedRound = 120;
                this.extraInfo.builtRoundAdd = 24;
                this.extraInfo.buildUpdatedRound = 0;
                this.extraInfo.slimeExisted = false;
                break;
            
            case 3:
            case 7:
            case 16:
            case 22:
            case 26:
            case 35:
                this._cellType = CellType.DUNGEON;
                this._cellName = '副本入口';
                break;
            
            case 4:
            case 23:
                this._cellType = CellType.GRAVE;
                this._cellName = '墓地';
                this._noOption = true;
                break;
            
            case 5:
            case 24:
                this._cellType = CellType.GUILD;
                this._cellName = '勇者公会';
                this._isBuilding = true;
                break;
            
            case 8:
            case 27:
                this._cellType = CellType.DOCK;
                this._cellName = '废弃的码头';
                this._isBuilding = true;
                this.extraInfo.progress = 0;
                this.extraInfo.maxProgress = 5;
                this.extraInfo.builtRound = 0;
                this.extraInfo.buildNeedRound = 120;
                this.extraInfo.builtRoundAdd = 30;
                this.extraInfo.buildUpdatedRound = 0;
                this.extraInfo.gotoIndex = (this._index === 8) ? 13 : 32;
                break;
            
            case 13:
                this._cellType = CellType.FAIRYLAND;
                this._cellName = '仙人岛';
                break;
            
            case 15:
                this._cellType = CellType.CAMP;
                this._cellName = '冒险者营地';
                this._isBuilding = true;
                break;
            
            case 17:
                this._cellType = CellType.SPRING;
                this._cellName = '温泉圣地';
                break;
            
            case 32:
                this._cellType = CellType.DEVILLAND;
                this._cellName = '魔王岛';
                this.extraInfo.progress = 0;
                this.extraInfo.maxProgress = 5;
                this.extraInfo.builtRound = 0;
                this.extraInfo.buildNeedRound = 60;
                this.extraInfo.builtRoundAdd = 15;
                this.extraInfo.normalhero = 0;
                this.extraInfo.elitehero = 0;
                break;
            
            case 34:
                this._cellType = CellType.STABLE;
                this._cellName = '白云马场';
                this._isBuilding = true;
                break;
            
            case 36:
                this._cellType = CellType.ARENA;
                this._cellName = '竞技场';
                this._isBuilding = true;
                break;
            
            case 2:
            case 10:
            case 14:
            case 21:
            case 29:
            case 33:
                this._cellType = CellType.PLAIN;
                this._cellName = '平原';
                this._noOption = true;
                break;
            
            case 6:
            case 12:
            case 18:
            case 25:
            case 31:
            case 37:
                this._cellType = CellType.WOODS;
                this._cellName = '林地';
                this._noOption = true;
                break;
            
            case 9:
            case 28:
                this._cellType = CellType.BEACH;
                this._cellName = '沙滩';
                this._noOption = true;
                break;
            
            default:
                this._cellType = CellType.PLAIN;
                this._cellName = '未知';
        }
    }
    
    // 绘制格子显示对象 - AS3: drawDisplay()
    drawDisplay() {
        this._display = new createjs.Container();
        
        let assetId = null;
        
        switch(this._cellType) {
            case CellType.TOWN:
                assetId = 'town';
                break;
            case CellType.VILLAGE:
                assetId = 'village';
                break;
            case CellType.HOUSE:
                assetId = 'blank';
                break;
            case CellType.DUNGEON:
                assetId = 'cave';
                break;
            case CellType.GRAVE:
                assetId = 'grave';
                break;
            case CellType.GUILD:
                assetId = 'guild';
                break;
            case CellType.DOCK:
                assetId = 'dock';
                break;
            case CellType.FAIRYLAND:
                assetId = 'fairyland';
                break;
            case CellType.CAMP:
                assetId = 'camp';
                break;
            case CellType.SPRING:
                assetId = 'spring';
                break;
            case CellType.DEVILLAND:
                assetId = 'devil';
                break;
            case CellType.STABLE:
                assetId = 'stable';
                break;
            case CellType.ARENA:
                assetId = 'arena';
                break;
            case CellType.PLAIN:
                assetId = 'plain';
                break;
            case CellType.WOODS:
                assetId = 'trees';
                break;
            case CellType.BEACH:
                assetId = 'beach';
                break;
        }
        
        if (assetId && Game.assets) {
            const bitmap = Game.assets.createBitmap(assetId);
            if (bitmap) {
                const bounds = bitmap.getBounds();
                if (bounds) {
                    bitmap.x = -bounds.width / 2;
                    bitmap.y = -bounds.height / 2;
                }
                this._display.addChild(bitmap);
                
                if (this._cellType === CellType.HOUSE) {
                    const houseBitmap = Game.assets.createBitmap('house');
                    if (houseBitmap) {
                        const houseBounds = houseBitmap.getBounds();
                        if (houseBounds) {
                            houseBitmap.x = -houseBounds.width / 2;
                            houseBitmap.y = -houseBounds.height / 2;
                        }
                        this._display.addChildAt(houseBitmap, 0);
                    }
                }
            } else {
                console.warn(`[Chesscell] 格子 #${this._index} 资源加载失败: ${assetId}`);
                this._createPlaceholder();
            }
        } else {
            this._createPlaceholder();
        }
        
        this._display.x = this._pos.x;
        this._display.y = this._pos.y;
        
        if (false) {
            const text = new createjs.Text(this._index.toString(), '12px Arial', '#ffffff');
            text.textAlign = 'center';
            text.y = 20;
            text.shadow = new createjs.Shadow('#000000', 1, 1, 2);
            this._display.addChild(text);
        }
    }
    
    // 创建占位图形 - AS3: _createPlaceholder()
    _createPlaceholder() {
        const shape = new createjs.Shape();
        shape.graphics.beginFill('#cccccc');
        shape.graphics.drawRect(-25, -25, 50, 50);
        shape.graphics.endFill();
        shape.graphics.setStrokeStyle(2);
        shape.graphics.beginStroke('#666666');
        shape.graphics.drawRect(-25, -25, 50, 50);
        this._display.addChild(shape);
        
        // 添加索引文本
        const text = new createjs.Text(this._index.toString(), 'bold 14px Arial', '#333333');
        text.textAlign = 'center';
        text.textBaseline = 'middle';
        this._display.addChild(text);
    }
    
    // 高亮显示格子 - AS3: highlight()
    highlight(canMove) {
        const color = canMove ? '#00ff00' : '#ff0000';
        const filter = new createjs.ColorFilter(1, 1, 1, 1, 50, 50, 50, 0);
        this._display.filters = [filter];
        this._display.cache(-50, -50, 100, 100);
    }
    
    // 取消高亮 - AS3: cancelHighlight()
    cancelHighlight() {
        this._display.filters = null;
        this._display.uncache();
    }
    
    // 更新建设进度 - AS3: updateProgress()
    updateProgress(currentRound) {
        if (this.extraInfo.progress > 0 && this.extraInfo.progress < this.extraInfo.maxProgress) {
            const rounds = currentRound - (this.extraInfo.buildUpdatedRound || 0);
            this.extraInfo.builtRound = Math.min(
                this.extraInfo.buildNeedRound,
                (this.extraInfo.builtRound || 0) + rounds
            );
            this.extraInfo.buildUpdatedRound = currentRound;
            
            const percent = this.extraInfo.builtRound / this.extraInfo.buildNeedRound;
            
            if (this._cellType === CellType.DOCK) {
                if (percent >= 1) {
                    this.extraInfo.progress = this.extraInfo.maxProgress;
                } else if (percent >= 0.75) {
                    this.extraInfo.progress = 4;
                } else if (percent >= 0.5) {
                    this.extraInfo.progress = 3;
                } else if (percent >= 0.25) {
                    this.extraInfo.progress = 2;
                }
            } else if (this._cellType === CellType.HOUSE) {
                if (percent >= 1) {
                    this.extraInfo.progress = this.extraInfo.maxProgress;
                } else if (percent >= 0.8) {
                    this.extraInfo.progress = 5;
                } else if (percent >= 0.6) {
                    this.extraInfo.progress = 4;
                } else if (percent >= 0.4) {
                    this.extraInfo.progress = 3;
                } else if (percent >= 0.2) {
                    this.extraInfo.progress = 2;
                }
            } else if (this._cellType === CellType.DEVILLAND) {
                if (percent >= 1) {
                    this.extraInfo.progress = this.extraInfo.maxProgress;
                } else if (percent >= 0.75) {
                    this.extraInfo.progress = 4;
                } else if (percent >= 0.5) {
                    this.extraInfo.progress = 3;
                } else if (percent >= 0.25) {
                    this.extraInfo.progress = 2;
                }
            }
        }
    }
    
    // 获取建设进度说明文本 - AS3: getProgressString()
    getProgressString() {
        let str = '';
        
        if (this.extraInfo.progress < this.extraInfo.maxProgress) {
            const remainDays = Math.ceil((this.extraInfo.buildNeedRound - this.extraInfo.builtRound) / 2);
            str += `距离完工还有${remainDays}天\n`;
        }
        
        if (this._cellType === CellType.DOCK) {
            if (this.extraInfo.progress > 0) {
                if (this.extraInfo.progress >= 2) {
                    str += '第1阶段已完成\n小型船只出现，可以坐船了\n';
                }
                if (this.extraInfo.progress >= 3) {
                    str += '第2阶段已完成\n货船出现，木筏逐渐损坏不再可用\n';
                }
                if (this.extraInfo.progress >= 4) {
                    str += '第3阶段已完成\n商船出现，可以进行贸易了\n';
                }
                if (this.extraInfo.progress >= this.extraInfo.maxProgress) {
                    str += '最后阶段已完成\n每次回到' + this._cellName + '时可以获得分红\n';
                }
            }
        } else if (this._cellType === CellType.HOUSE) {
            if (this.extraInfo.progress > 0) {
                if (this.extraInfo.progress >= 2) {
                    str += '第1阶段已完成\n卧室出现，可以睡觉了\n';
                }
                if (this.extraInfo.progress >= 3) {
                    str += '第2阶段已完成\n练功房出现，可以训练了\n';
                }
                if (this.extraInfo.progress >= 4) {
                    str += '第3阶段已完成\n炼金室出现，可以炼制秘药了\n';
                }
                if (this.extraInfo.progress >= 5) {
                    str += '第4阶段已完成\n会客大厅出现，可以举办派对了\n';
                }
                if (this.extraInfo.progress >= this.extraInfo.maxProgress) {
                    str += '最后阶段已完成\n每次回到' + this._cellName + '时回复一半生命耐力\n';
                }
            }
        }
        
        return str;
    }
    
    // 触发格子事件 - AS3: triggered()
    triggered(chess) {
        console.log(`[Chesscell] 触发事件: ${this._cellName} (类型${this._cellType})`);
        
        switch (this._cellType) {
            case CellType.PLAIN:
            case CellType.WOODS:
            case CellType.BEACH:
                this.outdoorFlag(chess);
                break;
                
            case CellType.DUNGEON:
                chess.triggerDungeon();
                break;
                
            case CellType.TOWN:
                chess.triggeredTownOrVillage(true);
                break;
                
            case CellType.VILLAGE:
                chess.triggeredTownOrVillage(false);
                break;
                
            case CellType.GUILD:
                chess.triggerGuild();
                break;
                
            case CellType.DOCK:
                chess.triggeredDock();
                break;
                
            case CellType.HOUSE:
                chess.triggeredHouse();
                break;
                
            case CellType.GRAVE:
                chess.woship();
                break;
                
            case CellType.SPRING:
                chess.springBath();
                break;
                
            case CellType.FAIRYLAND:
                this.fairylandFlag(chess);
                break;
                
            case CellType.DEVILLAND:
                this.triggeredDevilland(chess);
                break;
                
            case CellType.CAMP:
                chess.triggeredCamp();
                break;
                
            case CellType.STABLE:
                chess.triggeredStable();
                break;
                
            case CellType.ARENA:
                chess.triggeredArena();
                break;
                
            default:
                console.warn(`[Chesscell] 未处理的格子类型: ${this._cellType}`);
                this.board.roundEnd();
                break;
        }
    }
    
    // 户外格子随机事件 - AS3: outdoorFlag()
    outdoorFlag(chess) {
        if (chess.checkTriggerInvade()) {
            return;
        }
        
        let foodId = 0;
        let hasMonster = false;
        const rand = Math.random();
        
        switch (this._cellType) {
            case CellType.BEACH:
                if (rand > 0.8) {
                    chess.addChat('你找到一个被冲上岸的漂流瓶');
                    if (chess.prop.haveQuest(Quest.TRESURE)) {
                        chess.addChat('抽出里面纸条一看，尽是没吃药累不爱各种莫名其妙内容');
                        chess.addChat('你大失所望把漂流瓶扔回大海');
                        chess.board.roundEnd();
                        return;
                    }
                    chess.addChat('你惊喜的发现里面装着一张藏宝图');
                    chess.triggerQuest(Quest.TRESURE);
                    return;
                }
                foodId = 102;
                hasMonster = true;
                break;
                
            case CellType.PLAIN:
                // 平原：强盗事件
                if (rand > 0.8) {
                    chess.addChat('你被半路杀出的强盗给拦住了');
                    // 判断是否敢反抗：耐力>10%或金钱<1000
                    const dareToFight = chess.prop.staminaPercent > 0.1 || chess.prop.gold < 1000;
                    this.handlePlainFlag(chess, dareToFight);
                    return;
                }
                foodId = 100;
                hasMonster = true;
                break;
                
            case CellType.WOODS:
                // 林地：救助珍兽事件
                if (rand > 0.8) {
                chess.addChat('你看到有怪物正在欺凌一只珍兽');
                // 判断是否敢救：生命不濒死
                const dareToSave = !chess.prop._isNearDeath();
                this.handleWoodsFlag(chess, dareToSave);
                    return;
                }
                foodId = 101;
                hasMonster = true;
                break;
        }
        
        // 80%情况：普通户外场景
        if (hasMonster) {
            // 检查是否发现宝箱（优先级最高）
            if (chess.discoverChest(1)) {
                return;
            }
            
            // 检查是否触发烹饪事件（耐力<50%，20%概率）
            const rand2 = Math.random();
            if (rand2 > 0.8 && chess.prop.staminaPercent < 0.5 && foodId) {
                ChessBuff.gainCookingBuff(chess, foodId);
                chess.board.roundEnd();
                return;
            }
            
            // 检查是否触发随从亲密度事件（10%概率）
            if (rand2 > 0.9 && this.triggerFollowerFlag(chess)) {
                return;
            }
            
            // 默认：遇到怪物战斗
            const enemy = Enemy.generateDemon(chess.prop.level);
            chess.addChat(`你遭遇了${enemy.getName()}，战斗开始`);
            chess.battleWith(enemy);
            
            // V1.0.5: battleWith()内部已调用roundEnd()，这里不需要再调用
            // 战斗胜利：材料已在BattleManager中自动掉落
            // 战斗失败：等待玩家点击复活按钮
        }
    }
    
    // 随从亲密度特殊事件
    triggerFollowerFlag(chess) {
        const follower = chess.prop.follower;
        if (!follower || follower.married) {
            return false;
        }
        
        let message = '';
        const sexStr = follower.getSexString();
        
        switch (this._cellType) {
            case CellType.BEACH:
                message = '你与随从在海边玩耍时被一波巨浪卷走';
                message += `\n随从不幸溺水，你为${sexStr}人工呼吸令其大为感动`;
                break;
            case CellType.WOODS:
                message = '你与随从在树下小憩时被一条毒蛇偷袭';
                message += `\n随从不幸被咬伤，你为${sexStr}吮出毒液令其大为感动`;
                break;
            case CellType.PLAIN:
                message = '你与随从在夕阳下奔跑时一个踉跄摔倒';
                message += `\n随从不幸脚崴，你为${sexStr}冰敷止疼令其大为感动`;
                break;
        }
        
        message += '\n经过此次事件，你们变得更加亲密了';
        chess.addChat(message);
        follower.relationshipUp(20);
        DiaryPanel.getInstance().addDiary('你救了随从一命，从此你们变得更加亲密');
        chess.board.roundEnd();
        return true;
    }
    
    // 平原强盗事件
    handlePlainFlag(chess, dareToFight) {
        if (dareToFight) {
            chess.addChat('面对这种不知死活的渣渣你必诛之');
            const enemy = new Enemy(chess.prop.level + 3, Enemy.NORMAL, 1);  // 人族
            if (Math.random() > 0.95) {
                enemy.isRare = true;
                enemy.scaleAttrs(1.5);
            }
            chess.battleWith(enemy);  // battleWith内部会处理roundEnd
        } else {
            chess.addChat('你慑于强盗的淫威决定花钱消灾');
            if (chess.prop.gold === 0) {
                const enemy = new Enemy(chess.prop.level, Enemy.NORMAL, 1);
                chess.addChat('你根本没钱可给，想不打也不行了');
                chess.battleWith(enemy);  // battleWith内部会处理roundEnd
            } else {
                const goldLost = Math.ceil(chess.prop.gold * 0.1);
                chess.prop.reduceGold(goldLost);
                chess.addChat(`留下了买路钱，金钱-${goldLost}`);
                chess.board.roundEnd(true);
            }
        }
    }
    
    // 林地救助珍兽事件
    handleWoodsFlag(chess, dareToSave) {
        if (dareToSave) {
            const enemy = Enemy.createWithLevelOffset(chess.prop.level, 3, Enemy.NORMAL, 2);
            chess.saveAnimalFrom(enemy);
        } else {
            chess.addChat('你不愿惹麻烦便径直离开了，心里想着要换个妹子被欺凌我能见死不救');
            chess.board.roundEnd();
        }
    }
    
    // ==================== 副本系统 ====================
    
    // 计算副本等级
    getDungeonLv(playerLv) {
        let dungeonLv = Math.floor(playerLv / 10);
        if (playerLv % 10 > 5) {
            dungeonLv++;
        }
        dungeonLv = Math.max(1, dungeonLv);
        return dungeonLv * 10;
    }
    
    // 初始化副本敌人数量
    initDungeonEnemys(playerLv) {
        this.extraInfo.initialLv = this.getDungeonLv(playerLv);
        this.extraInfo.enemyKill = 0;
        
        const groupCount = Math.ceil(this.extraInfo.initialLv / 20);
        this.extraInfo.chestTotal = this.extraInfo.chestRemain = groupCount;
        this.extraInfo.bossTotal = this.extraInfo.bossRemain = groupCount;
        this.extraInfo.enemyTotal = this.extraInfo.enemyRemain = groupCount * 2;
        
        console.log(`[Chesscell] 初始化副本 Lv${this.extraInfo.initialLv} - 小怪${this.extraInfo.enemyTotal} BOSS${this.extraInfo.bossTotal} 宝箱${this.extraInfo.chestTotal}`);
    }
    
    // 副本战斗
    dungeonBattleFlag(chess, stuffBalance = 0) {
        this.lastDungeonFlag = 0;
        
        // 确定敌人类型
        if (!this.lastEnemyType) {
            this.lastEnemyType = Enemy.ELITE;
        } else if (this.extraInfo.lastBattleWin) {
            if (this.lastEnemyType === Enemy.BOSS) {
                this.lastEnemyType = Enemy.ELITE;
            } else if ((this.extraInfo.enemyRemain !== this.extraInfo.enemyTotal && this.extraInfo.enemyRemain % 2 === 0) || this.extraInfo.enemyRemain === 0) {
                this.lastEnemyType = Enemy.BOSS;
            }
        }
        this.extraInfo.lastBattleWin = false;
        
        // 计算敌人等级
        let enemyLv = 1;
        if (!this.extraInfo.completedLv) {
            this.initDungeonEnemys(chess.prop.level);
            enemyLv = this.extraInfo.initialLv;
        } else {
            enemyLv = Math.max(10, this.extraInfo.completedLv);
        }
        enemyLv += this.extraInfo.enemyKill;
        
        // 生成敌人
        const enemy = new Enemy(enemyLv, this.lastEnemyType, 0, Math.random() > 0.8);
        
        // 英雄模式
        if (this.extraInfo.enableHeroic) {
            enemy.setAsHeroic();
        }
        
        // 材料掉落调整
        if (stuffBalance === 2) {
            enemy.stuff = 0;
        } else if (stuffBalance === 1) {
            enemy.rarestuff = 0;
        }
        
        chess.addChat(`你遭遇了${enemy.getName()}，战斗开始`);
        
        // 开始战斗（副本战斗，跳过内部roundEnd，由updateDungeonProgress统一处理）
        const result = chess.battleWith(enemy, true);
        if (result === BattleManager.RESULT_WIN) {
            this.extraInfo.lastBattleWin = true;
            this.lastDungeonFlag = 1;
        }
    }
    
    // 预测下一个敌人类型
    willMeetEnemyType() {
        let enemyType = 0;
        
        if (!this.lastEnemyType) {
            enemyType = Enemy.ELITE;
        } else if (this.extraInfo.lastBattleWin) {
            if (this.lastEnemyType === Enemy.BOSS) {
                enemyType = Enemy.ELITE;
            } else if ((this.extraInfo.enemyRemain !== this.extraInfo.enemyTotal && this.extraInfo.enemyRemain % 2 === 0) || this.extraInfo.enemyRemain === 0) {
                enemyType = Enemy.BOSS;
            }
        }
        
        return enemyType;
    }
    
    // 是否英雄模式
    isHeroicDungeon() {
        return this.extraInfo.enableHeroic || false;
    }
    
    // 重置副本 - AS3: resetDungeon()
    resetDungeon() {
        this.lastEnemyType = 0;
        this.lastDungeonFlag = 0;
        this.extraInfo.completedLv = 0;
        this.extraInfo.initialLv = 0;
        this.extraInfo.completed = false;
        this.extraInfo.battleInProgress = false;
        this.extraInfo.enemyKill = 0;
        
        console.log('[Chesscell] 副本已重置');
    }
    
    // 刷副本（快速获得奖励）
    lootDungeon(chess) {
        const dungeonLv = this.extraInfo.completedLv;
        
        // 计算奖励（60%）
        let gold = this.extraInfo.enemyTotal * dungeonLv * 20 + this.extraInfo.bossTotal * dungeonLv * 40;
        let stuff = this.extraInfo.enemyTotal * Math.ceil(dungeonLv / 10) + this.extraInfo.bossTotal * Math.ceil(dungeonLv / 10) * 2;
        let rarestuff = this.extraInfo.enemyTotal * Math.ceil(dungeonLv / 30) + this.extraInfo.bossTotal * Math.ceil(dungeonLv / 15);
        let exp = this.extraInfo.enemyTotal * dungeonLv * 5 + this.extraInfo.bossTotal * dungeonLv * 10;
        
        gold = Math.ceil(gold * 0.6);
        exp = Math.ceil(exp * 0.6);
        stuff = Math.ceil(stuff * 0.6);
        rarestuff = Math.ceil(rarestuff * 0.6);
        
        const message = `金钱+${gold} 经验+${exp}<br>基础锻材+${stuff} 稀有锻材+${rarestuff}`;
        chess.addChat(message);
        
        chess.prop.addGold(gold);
        chess.prop.stuff += stuff;
        chess.prop.rarestuff += rarestuff;
        chess.prop.addExp(exp);
        
        console.log(`[Chesscell] 刷副本奖励：金${gold} 经${exp} 材${stuff}/${rarestuff}`);
    }
    
    // 发现副本宝箱
    discoverDungeonChest(chess) {
        if (this.extraInfo.chestRemain && this.extraInfo.enemyKill && this.extraInfo.enemyKill > 1) {
            if (Math.random() > 0.8 && this.lastDungeonFlag === 1) {
                if (chess.discoverChest()) {
                    this.lastDungeonFlag = 2;
                    this.extraInfo.chestRemain = Math.max(0, this.extraInfo.chestRemain - 1);
                    console.log(`[Chesscell] 发现副本宝箱，剩余${this.extraInfo.chestRemain}`);
                    return true;
                }
            }
        }
        return false;
    }
    
    // 发现神龛
    discoverShrine(chess) {
        if (this.extraInfo.enemyKill && this.extraInfo.enemyKill > 1) {
            if (Math.random() > 0.7 && this.lastDungeonFlag === 1) {
                this.lastDungeonFlag = 3;
                ChessBuff.gainShrineBuff(chess);
                chess.board.roundEnd();
                console.log('[Chesscell] 发现神龛');
                return true;
            }
        }
        return false;
    }
    
    // 更新副本进度
    updateDungeonProgress(enemyType, chess) {
        let message = '';
        
        if (enemyType === Enemy.BOSS) {
            this.extraInfo.bossRemain = Math.max(0, this.extraInfo.bossRemain - 1);
            message = `副本进度已更新，还剩余${this.extraInfo.bossRemain}个头目`;
        } else {
            this.extraInfo.enemyRemain = Math.max(0, this.extraInfo.enemyRemain - 1);
            message = `副本进度已更新，还剩余${this.extraInfo.enemyRemain}批小怪`;
        }
        
        if (!this.extraInfo.completedLv) {
            this.extraInfo.completedLv = this.extraInfo.initialLv;
        }
        this.extraInfo.enemyKill = (this.extraInfo.enemyKill || 0) + 1;
        
        // 检查是否完成副本
        if (this.extraInfo.bossRemain === 0 && this.extraInfo.enemyRemain === 0) {
            this.extraInfo.completed = true;
            chess.updateDungeonCount(this.extraInfo.completedLv, this.extraInfo.enableHeroic);
            
            // 检查是否解锁英雄模式
            if (this.extraInfo.completedLv === chess.prop.maxLv && !this.extraInfo.enableHeroic) {
                this.extraInfo.enableHeroic = true;
                chess.addGreenChat('该副本已升级为英雄模式，更难攻略啦');
            }
            
            chess.leaveDungeon(2);
            chess.board.roundEnd();
        } else {
            // 副本未完成，显示进度并结束回合（下次会显示继续菜单）
            chess.addChat(message);
            chess.board.roundEnd();
        }
        
        console.log(`[Chesscell] 副本进度：小怪${this.extraInfo.enemyRemain}/${this.extraInfo.enemyTotal} BOSS${this.extraInfo.bossRemain}/${this.extraInfo.bossTotal}`);
    }
    
    // ==================== 人气系统 ====================
    
    // 检查人气是否满（满100）
    isFullPopularity() {
        return this.extraInfo.popularity != null && this.extraInfo.popularity >= 100;
    }
    
    // ==================== 废墟系统 ====================
    
    // 标记为废墟（被怪物入侵后）
    beRuined(ruinedRound, duration = 3) {
        this.extraInfo.ruinedRound = ruinedRound;
        this.extraInfo.ruinedDuration = duration;
        console.log(`[Chesscell] ${this._cellName}被侵袭，需要${duration}天恢复`);
    }
    
    // 检查废墟是否已恢复
    checkRuinedOver(currentRound) {
        if (!this.extraInfo.ruinedRound) {
            // 从未被侵袭，或已经清除标记
            return true;
        }
        
        // 计算经过的天数 = (当前回合 - 侵袭回合) / 2
        const daysElapsed = (currentRound - this.extraInfo.ruinedRound) / 2;
        
        if (this.extraInfo.ruinedDuration <= daysElapsed) {
            // 恢复期已过，清除标记
            this.extraInfo.ruinedRound = 0;
            this.extraInfo.ruinedDuration = 0;
            return true;
        }
        
        // 还在恢复期
        return false;
    }
    
    // 获取建设进度信息 - AS3: getProgressString()
    getProgressString() {
        let info = '';
        
        if (this.extraInfo.progress < this.extraInfo.maxProgress) {
            const remainDays = Math.ceil((this.extraInfo.buildNeedRound - this.extraInfo.builtRound) / 2);
            info = `距离完工还有${remainDays}天<br>`;
        }
        
        if (this._cellType === CellType.DOCK) {
            if (this.extraInfo.progress > 0) {
                if (this.extraInfo.progress >= 2) {
                    const targetCell = this.board.getCell(this.extraInfo.gotoIndex);
                    info += `第1阶段已完成<br>客船出现，可以坐船前往${targetCell ? targetCell.cellName : '目标地'}了<br>`;
                }
                if (this.extraInfo.progress >= 3) {
                    info += `第2阶段已完成<br>大型客船出现，坐船前进不会消耗耐力<br>`;
                }
                if (this.extraInfo.progress >= 4) {
                    info += `第3阶段已完成<br>商船出现，可以进行贸易了<br>`;
                }
                if (this.extraInfo.progress >= this.extraInfo.maxProgress) {
                    info += `最后阶段已完成<br>每次回到${this.cellName}时可以获得分红<br>`;
                }
            }
        } else if (this._cellType === CellType.HOUSE) {
            if (this.extraInfo.progress > 0) {
                if (this.extraInfo.progress >= 2) {
                    info += `第1阶段已完成<br>卧室出现，可以睡觉了<br>`;
                }
                if (this.extraInfo.progress >= 3) {
                    info += `第2阶段已完成<br>练功房出现，可以训练了<br>`;
                }
                if (this.extraInfo.progress >= 4) {
                    info += `第3阶段已完成<br>炼金室出现，可以炼制秘药了<br>`;
                }
                if (this.extraInfo.progress >= 5) {
                    info += `第4阶段已完成<br>会客大厅出现，可以举办派对了<br>`;
                }
                if (this.extraInfo.progress >= this.extraInfo.maxProgress) {
                    info += `最后阶段已完成<br>每次回到${this.cellName}时回复一半生命耐力<br>`;
                }
            }
        } else if (this._cellType === CellType.DEVILLAND) {
            if (this.extraInfo.progress > 0) {
                if (this.extraInfo.progress >= 2) {
                    info += `炮灰数量${this.extraInfo.normalhero || 0}，勇士数量${this.extraInfo.elitehero || 0}<br>`;
                    info += `第1阶段已完成<br>军需官出现，可以招募勇士了<br>`;
                }
                if (this.extraInfo.progress >= 3) {
                    info += `第2阶段已完成<br>后勤官出现，可以自动收集锻材<br>`;
                }
                if (this.extraInfo.progress >= 4) {
                    info += `第3阶段已完成<br>传送门出现，每隔7天可从城镇传送回此<br>`;
                }
                if (this.extraInfo.progress >= this.extraInfo.maxProgress) {
                    info += `最后阶段已完成<br>可以发动总攻讨伐魔王了<br>`;
                }
            }
        }
        
        return info;
    }
    
    // 更新好感度 - AS3: updatePopularity()
    updatePopularity(chess, popularity) {
        if (this.extraInfo.popularity != null && this.extraInfo.popularity < 100) {
            this.extraInfo.popularity = Math.min(100, this.extraInfo.popularity + popularity);
            if (this.extraInfo.popularity === 100) {
                chess.addGreenChat(`你在第${this.extraInfo.order}座${this._cellName}的声望已经崇拜`);
                DiaryPanel.getInstance().addDiary(`你好事做尽终于在第${this.extraInfo.order}座${this._cellName}声望崇拜`, true);
            } else {
                chess.addGreenChat(`你在第${this.extraInfo.order}座${this._cellName}的声望提高了`);
            }
        }
    }
    
    // 检查是否满好感度 - AS3: isFullPopularity()
    isFullPopularity() {
        return this.extraInfo.popularity != null && this.extraInfo.popularity >= 100;
    }
    
    // 获取格子记录用于存档 - AS3: getCellRecord()
    getCellRecord() {
        let record = null;
        
        switch (this._cellType) {
            case CellType.TOWN:
            case CellType.VILLAGE:
                // 保存好感度
                if (this.extraInfo.popularity) {
                    record = {
                        index: this._index,
                        popularity: this.extraInfo.popularity
                    };
                }
                break;
                
            case CellType.HOUSE:
            case CellType.DOCK:
                // 保存建设进度
                if (this.extraInfo.progress) {
                    record = {
                        index: this._index,
                        progress: this.extraInfo.progress,
                        builtRound: this.extraInfo.builtRound,
                        buildUpdatedRound: this.extraInfo.buildUpdatedRound
                    };
                }
                break;
                
            case CellType.FAIRYLAND:
                // 保存仙人岛标记
                if (this.extraInfo.mustFlag === 6) {
                    record = {
                        index: this._index,
                        mustFlag: this.extraInfo.mustFlag
                    };
                }
                break;
                
            case CellType.DEVILLAND:
                // 保存魔王岛进度
                if (this.extraInfo.progress) {
                    record = {
                        index: this._index,
                        progress: this.extraInfo.progress,
                        builtRound: this.extraInfo.builtRound,
                        buildUpdatedRound: this.extraInfo.buildUpdatedRound,
                        lastTriggeredRound: this.extraInfo.lastTriggeredRound
                    };
                    record.crusadeWon = this.extraInfo.crusadeWon;
                    record.normalhero = this.extraInfo.normalhero;
                    record.elitehero = this.extraInfo.elitehero;
                    
                    if (this.extraInfo.mustFlag === 6) {
                        record.mustFlag = 6;
                    }
                }
                break;
        }
        
        return record;
    }
}

// 应用岛屿事件Mixin
Object.assign(Chesscell.prototype, IslandEventMixin);
