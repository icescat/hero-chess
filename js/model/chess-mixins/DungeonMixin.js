/**
 * 副本系统 Mixin
 * 从 Chess.js 拆分出的副本相关方法
 * 包含：副本触发、攻略、重置、刷副本等
 * 
 * 拆分日期：2025-11-14
 * V1.0.6：删除临时随从功能，必须携带随从才能进副本
 */

const DungeonMixin = {
    /**
     * 副本入口事件（Stage 5）
     * V1.0.6：必须携带随从才能进副本，否则只能门口打野怪
     */
    triggerDungeon() {
        // 检查耐力
        if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop._staConsume < 0) {
            this.addChat('你太累了没法对副本进行攻略，于是你守在副本外希望能有法师给点吃喝，可是这个世界根本没有这样的设定');
            this.board.roundEnd();
            return;
        }
        
        // 处理刚重置的副本
        if (this._cell.extraInfo.justReset) {
            this._cell.extraInfo.justReset = false;
        } else if (this.checkChestMobRaid()) {
            // 宝箱怪事件
            return;
        }
        
        // 副本已完成：显示重置/刷副本选项
        if (this._cell.extraInfo.completed === true) {
            this.board.chatPanel.addInlineOptions(
                '你打算干什么呢？',
                ['resetdungeon', 'lootdungeon', 'walk'],
                ['重置副本', '刷副本', '继续前进'],
                (choice) => {
                    switch (choice) {
                        case 'resetdungeon':
                            this.resetDungeon();
                            break;
                        case 'lootdungeon':
                            this.lootDungeon();
                            break;
                        case 'walk':
                            this._handleForwardChoice('walk', false);
                            break;
                    }
                }
            );
        } else {
            // 副本未完成：检查是否能进副本
            // V1.0.6：必须携带随从才能进副本
            if (this.checkNoFollowerRatting()) {
                return;  // 无随从在门口打野怪
            }
            
            // 有随从，显示攻略选项
            const isHeroic = this._cell.isHeroicDungeon();
            this.board.chatPanel.addInlineOptions(
                '你打算干什么呢？',
                ['exploredungeon', 'walk'],
                [isHeroic ? '攻略副本（英雄）' : '攻略副本', '继续前进'],
                (choice) => {
                    if (choice === 'exploredungeon') {
                        this.exploreDungeon();
                    } else {
                        this._handleForwardChoice('walk', false);
                    }
                }
            );
        }
    },
    
    /**
     * 检查宝箱怪事件
     * @returns {boolean} - 是否触发了宝箱怪
     */
    checkChestMobRaid() {
        if (RandomUtils.percent(20) && this.board._circleNo - this.lastFlag.lastMetChestLap > 1) {
            this.lastFlag.lastMetChestLap = this.board._circleNo;
            this.addChat('你发现一个华丽的大宝箱静静躺在那里，但伶俐如你当即就瞧出了违和感，偌大个宝箱不给绿字提示是闹哪样');
            
            const enemy = Enemy.createWithLevelOffset(this.prop.level, 5, Enemy.ELITE, 0, true);
            enemy.stuff = 0;
            enemy.rarestuff = 0;
            
            this.startBattleWith(enemy, {
                onWin: () => {
                    this.discoverChest(3);
                    DiaryPanel.getInstance().addDiary('你识破宝箱怪的伪装，成功爆得宝箱归');
                }
            });
            return true;
        }
        return false;
    },
    
    /**
     * V1.0.6：无随从检查（没有随从只能门口打野怪）
     * 替代原来的 checkRatting()
     * @returns {boolean} - 是否触发门口打野怪
     */
    checkNoFollowerRatting() {
        const hasFollower = !!this.prop.follower;
        
        console.log(`[DungeonMixin] 随从检查: 有随从=${hasFollower}`);
        
        if (!hasFollower) {
            this.addChat('副本凶险，独自一人进入难以为继，你决定先在门口找点小怪练练手');
            
            const enemy = Enemy.generateDemon(this.prop.level);
            this.addChat(`你遭遇了${enemy.getName()}，战斗开始`);
            this.battleWith(enemy);
            return true;
        }
        
        console.log(`[DungeonMixin] 携带随从，可以进副本`);
        return false;
    },
    
    /**
     * 检查是否有能力攻略副本（AI用）
     * @returns {boolean}
     */
    capableExploreDungeon() {
        // 检查士气低落Buff
        if (this.prop.haveBuff(BuffNo.LOW_MORALE)) {
            return false;
        }
        
        // V1.0.6：必须有随从才能进副本
        if (!this.prop.follower) {
            return false;
        }
        
        // 计算副本等级和实际等级
        let dungeonLv = this._cell.extraInfo.completedLv || this._cell.getDungeonLv(this.prop.level);
        const actualLv = this.prop.getActualLvWithAll();
        const ratio = actualLv / dungeonLv;
        
        // 判断是否碾压
        const nextEnemyType = this._cell.willMeetEnemyType();
        if (ratio > 2.5 || (ratio > 2 && nextEnemyType !== Enemy.BOSS)) {
            return true;
        }
        
        return false;
    },
    
    /**
     * 攻略副本
     * @param {boolean} checkStamina - 是否检查耐力
     */
    exploreDungeon(checkStamina = true) {
        // V1.0.6: 清空内容区域（保留地点信息）
        this.clearContent();
        this.addChat('副本攻略中');
        
        // 检查耐力
        if (checkStamina) {
            if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop._staConsume < 0) {
                this.addChat('你太累了没法对副本进行攻略', 1);
                return;
            }
        }
        
        // 标记副本战斗中
        if (!this._cell.extraInfo.battleInProgress) {
            this._cell.extraInfo.battleInProgress = true;
            this.addChat('你进入了副本');
        }
        
        // 检查宝箱
        if (this._cell.discoverDungeonChest(this)) {
            return;
        }
        
        // 检查神龛
        if (this._cell.discoverShrine(this)) {
            return;
        }
        
        // 检查材料平衡
        const stuffBalance = this.prop.checkStuffBalance();
        
        // 开始副本战斗
        this._cell.dungeonBattleFlag(this, stuffBalance);
    },
    
    /**
     * 重置副本
     */
    resetDungeon() {
        // V1.0.6: 清空内容区域（保留地点信息）
        this.clearContent();
        
        this._cell.resetDungeon();
        this._cell.extraInfo.justReset = true;
        this.addChat('你重置了副本，又可以重新攻略啦');
        this._cell.triggered(this);
    },
    
    /**
     * 刷副本
     */
    lootDungeon() {
        // V1.0.6: 清空内容区域（保留地点信息）
        this.clearContent();
        
        if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop._staConsume < 0) {
            this.addChat('你很累了还是下次再刷吧', 2);
            return;
        }
        
        // 消耗耐力和生命
        this.prop.consumeStamina(this.prop._staConsume);
        this.prop._curLife -= Math.floor(Math.random() * this.prop.maxLife);
        
        if (this.prop._curLife <= 0) {
            this.addChat('你不小心火车拉多了，被围殴致死');
            this.dead();
            return;
        } else {
            this.addChat('你驾轻就熟的刷了一遍副本，收获颇丰');
            this._cell.lootDungeon(this);
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        this.board.roundEnd();
    },
    
    /**
     * 继续副本
     * @param {boolean} isContinue - 是否继续
     */
    continueDungeon(isContinue) {
        // V1.0.6: 清空内容区域（保留地点信息）
        this.clearContent();
        
        if (isContinue) {
            this.addChat('副本攻略中');
            this.exploreDungeon(false);
        } else {
            this.leaveDungeon();
            this.board.roundEnd();
        }
    },
    
    /**
     * 离开副本
     * @param {number} leaveType - 离开类型（0=普通离开, 1=逃跑, 2=完成）
     */
    leaveDungeon(leaveType = 0) {
        this._cell.extraInfo.battleInProgress = false;
        
        switch (leaveType) {
            case 1:
                this.addRedChat('你成功逃离了副本');
                break;
            case 2:
                this.addGreenChat('你成功攻略了副本！');
                break;
            default:
                this.addChat('你离开了副本');
                break;
        }
    },
    
    /**
     * 更新副本完成统计
     * @param {number} dungeonLv - 副本等级
     * @param {boolean} isHeroic - 是否英雄模式
     */
    updateDungeonCount(dungeonLv, isHeroic) {
        this.runningStat.addDungeonCount(dungeonLv, isHeroic);
        console.log(`[Chess] 完成副本 Lv${dungeonLv} ${isHeroic ? '(英雄)' : ''}`);
    },
    
    /**
     * 检查副本战斗是否进行中
     * @returns {boolean} - 是否处理了战斗进行中状态
     */
    checkBattleInProgress() {
        if (!this._cell.extraInfo.battleInProgress) {
            return false;
        }
        
        // 副本战斗中
        if (this._cell._cellType === CellType.DUNGEON) {
            if (!this._cell.extraInfo.completed) {
                // 检查耐力
                if (this.prop.curStamina === 0 || this.prop.curStamina - this.prop._staConsume < 0) {
                    this.leaveDungeon(1);  // 耐力不足，逃跑
                    this.board.roundEnd();
                    return true;
                }
                
                // 显示继续菜单
                this.board.chatPanel.addInlineOptions(
                    '是否继续攻略副本',
                    ['yes', 'no'],
                    ['一鼓作气', '下次再来'],
                    (choice) => {
                        this.continueDungeon(choice === 'yes');
                    }
                );
                return true;
            }
        }
        
        return false;
    }
};

