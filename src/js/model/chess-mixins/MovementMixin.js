/**
 * 移动系统 Mixin
 * 从 Chess.js 拆分出的移动相关方法
 * 包含：前进、经过格子、到达格子、传送等
 * 
 * 拆分日期：2025-11-14
 */

const MovementMixin = {
    /**
     * 前进指定步数（逐格移动）
     * 对应 AS3: forward(steps)
     */
    forward(steps) {
        if (steps > 0) {
            steps--;
            this.prevCellIndex = this._index;
            
            // 标记为移动中
            this._isMoving = true;
            this._readyMove = false;
            this._isDiceRolling = false;  // 开始移动时，骰子滚动结束
            console.log('[Chess] 骰子滚动结束，开始移动');
            
            // 移动到下一格
            this._index = (this._index + 1) % this.board.cellNum;  // 环形棋盘循环
            this._cell = this.board.getCell(this._index);
            
            if (!this._cell) {
                console.error(`[Chess] 格子 #${this._index} 不存在`);
                return;
            }
            
            // 移动速度（秒）
            const moveTime = 0.5;
            
            // 改变朝向
            this._display.changeDir(this.board.getMoveDir(this._index));
            this._display.startPlay();
            
            // 清除可能存在的旧补间动画
            createjs.Tween.removeTweens(this._display);
            
            // 使用补间动画移动到目标格子
            createjs.Tween.get(this._display)
                .to({
                    x: this._cell.pos.x,
                    y: this._cell.pos.y
                }, moveTime * 1000, createjs.Ease.linear)
                .call(() => {
                    this.cellPassed(steps);
                });
        }
    },
    
    /**
     * 经过格子时触发
     * 对应 AS3: cellPassed(remainingSteps)
     */
    cellPassed(remainingSteps = 0) {
        console.log(`[Chess] 经过格子 #${this._index} "${this._cell.cellName}"`);
        
        // 更新UI面板
        if (this._panel) {
            this._panel.updateUI();
        }
        
        // 检查是否回到起点（索引0）- 原版AS3逻辑：直接检查无条件
        if (this._index === 0) {
            console.log('[Chess] 经过起点！触发lapAdd()');
            this.board.lapAdd();
        }
        
        // V1.0.5：已取消跑尸系统，死亡后直接原地虚弱复活
        
        // 检查任务触发（路过时）
        if (!this._isDead && this.checkQuestTriggered(false)) {
            this._display.stopPlay();
            this.board.roundEnd();
            return;
        }
        
        // 检查道路格子的随机事件（AS3: cell.noOption判断）
        if (this._cell.noOption && remainingSteps > 0) {
            // 材料银行自动托管事件
            if (this._checkBringStuffBank()) {
                return; // 触发了事件，停止移动
            }
            // 行脚商人事件
            if (this._checkMetMerchant()) {
                return; // 触发了事件，停止移动
            }
            // V1.1+: 其他随机事件（雷击、流星、彩虹等）
            // - checkHitByThunder() 雷击
        }
        
        // *** 每步消耗耐力（关键！）- AS3: prop.moveConsumeStamina(moveType) ***
        if (!this._isDead && !this.onBigShip) {
            this.prop.moveConsumeStamina(this.moveType);
            // 统计移动距离
            if (this.runningStat && this.runningStat.addDistance) {
                this.runningStat.addDistance(this.moveType === this.WALK);
            }
        }
        
        // 如果还有剩余步数
        if (remainingSteps > 0) {
            // 检查耐力是否耗尽
            if (this.prop.curStamina > 0 || this._isDead) {
                // 有耐力或已死亡，继续前进
                this.forward(remainingSteps);
            } else if (this.moveType === this.SHIP) {
                // 坐船时耐力耗尽，获得晕船Buff
                if (this.prop._actualStaConsume > 0 && !this.prop.haveBuff(BuffNo.SEASICK)) {
                    this.addChat("过度疲劳和波浪颠簸让你上吐下泻");
                    this.prop.addBuff(BuffNo.SEASICK, this.board._round + 1);
                }
                this.forward(remainingSteps);
            } else {
                // 步行或骑行时耐力耗尽，到达当前位置
                this.cellReached(true);
            }
            return;
        }
        
        // 检查是否到达特殊岛屿（仙人岛/魔王岛）
        if (this._checkIslandAccess(remainingSteps)) {
            return; // 无法登陆，已绕道
        }
        
        // 到达目标格子（remainingSteps === 0）
        this._display.stopPlay();
        this.cellReached();
    },
    
    /**
     * 检查任务是否被触发
     * 对应 AS3: checkQuestTriggered()
     * @param {boolean} isArrival - 是否真正到达（true）还是只是路过（false）
     * @returns {boolean} - 是否触发了任务
     * 
     * V1.0.6: 任务触发时自动清屏
     */
    checkQuestTriggered(isArrival = true) {
        // 如果是坐船且只是路过，不触发
        if (!isArrival && this.moveType === this.SHIP) {
            return false;
        }
        
        let quest = null;
        
        // 检查是否有任务在当前格子
        if (this.devilDefeated) {
            // 打败魔王后，检查凯旋任务
            quest = this.prop.getQuestByType(Quest.TRIUMPH);
        } else {
            // 普通任务检查
            quest = this.prop.getQuest(this._cell.index, this._cell._cellType);
        }
        
        if (!quest) {
            return false;
        }
        
        // V1.0.6: 任务触发时清空内容区域，给任务消息腾空间
        this.clearContent();
        
        // 根据任务类型执行特殊逻辑
        switch (quest.type) {
            case Quest.FIND_HUMAN:
                // 搜救任务：第一阶段是找到目标，第二阶段是送回
                if (quest.triggerCellIndex !== quest.replyCellIndex) {
                    if (isArrival) {
                        // 找到目标NPC
                        const replyCell = this.board.getCell(quest.replyCellIndex);
                        
                        // V1.0.6: 根据当前位置到回程城镇的距离计算时限
                        const distance = this.board.getShortestDistance(this._index, replyCell.index);
                        const baseDuration = this.board.calculateQuestDuration(distance, quest.isRare);
                        
                        // 设置新的触发位置为回程城镇
                        quest.triggerCellIndex = replyCell.index;
                        quest.triggerCellType = replyCell._cellType;
                        quest.beginRound = this.board._round + 1;
                        quest.questDest = replyCell.cellName;
                        quest.cannotDie = true;
                        
                        if (quest.isRare) {
                            // 稀有任务：NPC伤势更重，时限更紧迫（保底1天，最多为距离计算值）
                            quest.questDuration = Math.max(1, Math.min(baseDuration, 3));
                            this.addChat('你开始在岛上搜索潜逃NPC的踪迹');
                            this.addChat(`你顺着脚印找到其窝点，可是他竟然畏罪自杀仅一息尚存，${quest.questDuration}天内不送回${quest.questDest}必屎无疑`);
                        } else {
                            // 普通任务：时限较宽松（保底2天）
                            quest.questDuration = Math.max(2, baseDuration);
                            this.addChat(`你顺着呼救声找到了这倒霉催的，他伤势严重，${quest.questDuration}天内不送回${quest.questDest}必屎无疑`);
                        }
                        console.log(`[Quest] 护送回城距离${distance}格，时限${quest.questDuration}天`);
                        return true;
                    }
                    return false;
                }
                break;
                
            case Quest.FIND_GOODS:
                // 失物搜索/宝物夺回：第一阶段找到物品（战斗），第二阶段带回城镇
                if (quest.triggerCellIndex !== quest.replyCellIndex) {
                    if (!isArrival) {
                        return false;
                    }
                    
                    // 第一阶段：找到物品，可能触发战斗
                    if (quest.battleTrigger && RandomUtils.percent(quest.battleTriggerRate * 100)) {
                        const enemyType = quest.battleTriggerType === 2 ? Enemy.BOSS : Enemy.NORMAL;
                        const enemy = new Enemy(this.prop.level, enemyType);
                        this.addChat(`你找到了被抢走的物品，但守卫的怪物向你发起了攻击`);
                        
                        const result = this.battleWith(enemy);
                        if (result !== BattleManager.RESULT_WIN) {
                            this.addChat(quest.failed(false));
                            this.prop.removeQuest(quest);
                            return true;
                        }
                        this.addChat('你击败了怪物，成功夺回物品');
                    } else {
                        this.addChat('你找到了被抢走的物品');
                    }
                    
                    // 进入第二阶段：带回城镇
                    const replyCell = this.board.getCell(quest.replyCellIndex);
                    const distance = this.board.getShortestDistance(this._index, replyCell.index);
                    const baseDuration = this.board.calculateQuestDuration(distance, quest.isRare);
                    
                    quest.triggerCellIndex = replyCell.index;
                    quest.triggerCellType = replyCell._cellType;
                    quest.beginRound = this.board._round + 1;
                    quest.questDest = replyCell.cellName;
                    quest.questDuration = Math.max(3, baseDuration);
                    quest.battleTrigger = false;  // 回程不再触发战斗
                    
                    this.addChat(`现在需要在${quest.questDuration}天内将物品带回${quest.questDest}`);
                    console.log(`[Quest] 带回物品距离${distance}格，时限${quest.questDuration}天`);
                    return true;
                }
                // 第二阶段完成：到达城镇
                DiaryPanel.getInstance().addDiary(`你成功将物品带回${this._cell.cellName}`);
                break;
                
            case Quest.TRESURE:
                // 寻宝任务：只在真正到达时触发
                if (!isArrival) {
                    return false;
                }
                DiaryPanel.getInstance().addDiary('你遵照藏宝图指示成功挖到宝藏');
                break;
                
            case Quest.INVADE:
                // 怪物侵袭任务：需要战斗
                const invadeEnemy = new Enemy(this.prop.level, Enemy.ELITE);
                this.addChat(`你与袭击${this._cell.cellName}的怪物展开了激烈战斗`);
                
                // 开始战斗
                const result = this.battleWith(invadeEnemy);
                if (result !== BattleManager.RESULT_WIN) {
                    // 战斗失败
                    this.addChat(quest.failed(false));
                    this.prop.removeQuest(quest);
                    return true;
                }
                DiaryPanel.getInstance().addDiary(`你成功阻止怪物侵袭${this._cell.cellName}`);
                break;
                
            case Quest.TRIUMPH:
                // 凯旋任务
                this.addChat(`你提着魔王的脑袋回到了${this._cell.cellName}`);
                DiaryPanel.getInstance().addDiary('你加冕成为新一代勇者王', true);
                break;
        }
        
        // 完成任务
        quest.completed(this, this.prop);
        this.runningStat.addQuestCount(quest.type, quest.isTownQuest);
        
        // 每完成10个城镇任务，可以领取遗物奖励
        if (quest.isTownQuest && this.runningStat.totalQuestCount % 10 === 0) {
            this.addGreenChat(`你已完成${this.runningStat.totalQuestCount}个委托，可去公会领奖`);
            if (Relic.getInstance().getRelicRemain(1)) {
                this.prop.undrawRelic += 1;
            }
        }
        
        // V1.0.5: 有坐骑时完成城镇任务，坐骑成长
        if (this.prop.mount && quest.isTownQuest) {
            if (this.prop.mount.grow()) {
                this.addChat(`${this.prop.mount.colorName}在任务中成长了`);
            }
        }
        
        // 更新好感度（如果任务有好感度奖励）
        if (quest.popularity !== 0) {
            const beginCell = this.board.getCell(quest.beginCellIndex);
            if (beginCell) {
                const popularity = quest.popularity + Math.floor(this.prop.fame / 250);
                beginCell.updatePopularity(this, popularity);
            }
        }
        
        return true;
    },
    
    /**
     * 到达目标格子
     * 对应 AS3: cellReached()
     * 
     * V1.0.6: 使用新的地点/内容分离机制
     */
    cellReached() {
        console.log(`[Chess] 到达 "${this._cell.cellName}"`);
        
        // 标记移动结束
        this._isMoving = false;
        this._readyMove = true;
        
        // 移除骰子显示
        this.board.removeAllDice();
        
        // 更新UI面板
        if (this._panel) {
            this._panel.updateUI();
        }
        
        // V1.0.6: 副本/魔王岛连续战斗时不更新地点，只清内容
        const isContinuousBattle = this._cell.extraInfo && this._cell.extraInfo.battleInProgress;
        
        if (isContinuousBattle) {
            // 连续战斗：清空内容区域，追加探索消息
            this.clearContent();
            this.addChat(`你继续在【${this._cell.cellName}】探索`);
        } else {
            // 正常到达：更新地点信息（自动清空内容区域）
            this.setLocation(this._cell.cellName);
        }
        
        // 第2步：检查任务触发（任务消息会用addChat追加）
        if (this.checkQuestTriggered(true)) {
            this.board.roundEnd();
            return;
        }
        
        // 检查副本战斗是否进行中（需要显示继续菜单）
        if (this.checkBattleInProgress()) {
            return;
        }
        
        // 第3步：触发格子事件（事件消息会用addChat追加）
        this._cell.triggered(this);
    },
    
    /**
     * 在家休息（恢复100%耐力和生命）
     */
    _sleepAtHome() {
        this.prop.fullRestore();
        this.addGreenChat('睡了一觉，精神饱满！');
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 野外休息（根据随从/马车能力恢复耐力）
     * 对应 AS3: Chess.as prepareNextRound()第717-742行
     * 
     * V1.0.5: 移除内部的 roundEnd() 调用，由调用方统一控制
     */
    _sleepAtWild() {
        // 检查随从能力（可野外休息）
        if (this.prop.follower && this.prop.follower.canWildRest && this.prop.follower.canWildRest()) {
            if (this.prop.follower.married) {
                this.addChat(`${this.prop.follower.name}支起了帐篷，接着你们便开始滚起床单来`);
                this.prop.addBuff(BuffNo.SATISFIED, this.board._round + 1);
            } else {
                this.addChat(`${this.prop.follower.name}支起了帐篷，你得以安心休息`);
            }
            this.prop.fullRestore();  // 完全恢复（生命+耐力）
        }
        // 普通野外休息（只恢复50%耐力）
        else {
            this.prop.halfRestoreStamina();
            this.addChat('在户外你无法安心休息，疲惫没有消除');
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        // V1.0.5: 不再调用 roundEnd()，由 prepareNextRound() 统一控制
    },
    
    /**
     * 移动到指定格子（直接传送，不经过中间格子）
     * 对应 AS3: teleportTo(cellIndex)
     */
    teleportTo(cellIndex) {
        this._cell = this.board.getCell(cellIndex);
        if (this._cell) {
            this._index = cellIndex;
            this._display.x = this._cell.pos.x;
            this._display.y = this._cell.pos.y;
            console.log(`[Chess] 传送到格子 #${cellIndex}`);
        }
    },
    
    /**
     * 瞬移到目标格子并触发到达事件（统一瞬移逻辑）
     * 用于：坐船、死亡回城等不消耗耐力、不触发路过事件的瞬移场景
     * 
     * @param {number} targetIndex - 目标格子索引
     * @param {string} beforeMessage - 传送前的消息（可选，会清屏）
     * @param {Array<string>} afterMessages - 到达后的消息数组（可选）
     * @returns {boolean} - 是否成功传送
     */
    teleportAndArrive(targetIndex, beforeMessage = null, afterMessages = null) {
        const targetCell = this.board.getCell(targetIndex);
        if (!targetCell) {
            console.error(`[Chess] 瞬移失败：目标格子 #${targetIndex} 不存在`);
            return false;
        }
        
        // 1. 显示传送前消息（如果有）- 先清屏再显示
        if (beforeMessage) {
            this.clearContent();
            this.addChat(beforeMessage);
        }
        
        // 2. 执行瞬移
        this.teleportTo(targetIndex);
        
        // 3. V1.0.6: 使用 setLocation 更新地点信息（自动清空内容区域）
        this.setLocation(targetCell.cellName);
        
        // 4. 显示额外消息（如死亡剧情、交易信息等）
        if (afterMessages && Array.isArray(afterMessages)) {
            afterMessages.forEach(msg => {
                if (typeof msg === 'string') {
                    this.addChat(msg);
                } else if (msg && msg.text) {
                    // 支持带颜色的消息：{ text: '内容', color: 'red'/'green'/'yellow' }
                    switch(msg.color) {
                        case 'red':
                            this.addRedChat(msg.text);
                            break;
                        case 'green':
                            this.addGreenChat(msg.text);
                            break;
                        case 'yellow':
                            this.addYellowChat(msg.text);
                            break;
                        default:
                            this.addChat(msg.text);
                    }
                }
            });
        }
        
        // 5. 更新UI
        if (this._panel) {
            this._panel.updateUI();
        }
        
        // 6. 触发目标格子事件
        targetCell.triggered(this);
        
        console.log(`[Chess] 瞬移完成：${targetCell.cellName} (#${targetIndex})`);
        return true;
    },
    
    /**
     * 检查材料银行自动托管事件
     * 对应 AS3: checkBringStuffBank()
     * @returns {boolean} - 是否触发了事件
     */
    _checkBringStuffBank() {
        // 条件：未触发过 + 非坐船 + 超重 + 天数是8的倍数
        if (this._stuffBankTriggered || 
            this.moveType === this.SHIP || 
            !this.prop.overWeight ||
            this.board._dayLapse % 8 !== 0) {
            return false;
        }
        
        // 尝试将所有材料存入银行（每个材料10金）
        const totalFee = this.prop.allStuffToBank(10);
        
        if (totalFee) {
            this._stuffBankTriggered = true;
            this.addChat(`你赶路时遇到同乡，你请他帮忙把材料都带回城存起来，金钱-${totalFee}`);
            
            if (this._panel) {
                this._panel.updateUI();
            }
            
            console.log('[Chess] 材料银行事件触发');
            return true;
        }
        
        return false;
    },
    
    /**
     * 检查行脚商人事件
     * 对应 AS3: checkMetMerchant()
     * @returns {boolean} - 是否触发了事件
     */
    _checkMetMerchant() {
        // 条件：白天 + 圈数变化 + 天数是15的倍数 + 金钱>=3000（最低商品价格） + 不是同一天
        if (this.board._isNight ||
            this.board._circleNo === this.lastFlag.lastMerchantLap ||
            this.board._dayLapse % 15 !== 0 ||
            this.prop.gold < 3000) {
            return false;
        }
        
        // 同一天不重复触发
        if (this.lastFlag.lastMerchantDay === this.board._dayLapse) {
            return false;
        }
        
        // 更新标志
        this.lastFlag.lastMerchantLap = this.board._circleNo;
        this.lastFlag.lastMerchantDay = this.board._dayLapse;
        
        // 可购买的道具列表：3个buff + 1个遗物（灵魂石）
        const itemList = ['soulstone', 'goldendye', 'waterrun', 'perfume'];
        const item = RandomUtils.choice(itemList);
        
        this.addChat('你赶路时遇到个行脚商人');
        
        if (item === 'soulstone') {
            // 灵魂石 - 遗物（一次性）
            const relic = Relic.getInstance().getRelicByNo(Relic.SOUL_STONE_NO);
            if (relic && this.prop.addRelic(relic)) {
                this.addChat(`你跟他买了【灵魂石】，金钱-3000`);
                this.prop.reduceGold(3000);
            }
        } else {
            // 其他buff道具
            const buffMap = {
                'goldendye': BuffNo.GOLDENDYE,
                'waterrun': BuffNo.WATER_RUN,
                'perfume': BuffNo.PERFUME
            };
            const buffNo = buffMap[item];
            const buff = new ChessBuff(buffNo);
            buff.initialize(buffNo);
            this.addChat(`你跟他买了${buff.buffName}，金钱-${buff.fee}`);
            this.prop.addBuffObj(buff, this.board._round + 1);
            this.prop.reduceGold(buff.fee);
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        console.log('[Chess] 行脚商人事件触发');
        return true;
    },
    
    /**
     * 判断是否应该坐船前往岛屿（魔王岛/仙境）
     * 供 ChessAI 调用
     * @returns {boolean}
     */
    _shouldGotoIsland() {
        // 条件1：玩家等级足够（30级+）
        if (this.prop.level < 30) return false;

        // 条件2：有足够金钱坐船
        if (this.prop.gold < 5000) return false;

        // 条件3：状态良好（非死亡/虚弱）
        if (this.prop.isDead || this.prop.haveBuff(BuffNo.WEAK)) return false;

        return true;
    },

    /**
     * 检查是否可以登陆特殊岛屿（仙人岛/魔王岛）
     * 统一管理仙人岛和魔王岛的上岛限制逻辑
     * @param {number} remainingSteps - 剩余步数
     * @returns {boolean} 是否需要绕道（true=无法登陆需要绕道，false=可以登陆或不是岛屿）
     */
    _checkIslandAccess(remainingSteps) {
        const cellType = this._cell._cellType;
        
        // 不是特殊岛屿，直接通过
        if (cellType !== CellType.FAIRYLAND && cellType !== CellType.DEVILLAND) {
            return false;
        }
        
        // 坐船可以直接上岛，不需要检查
        if (this.moveType === this.SHIP) {
            return false;
        }
        
        // 判断是否需要检查水上行走能力：最后一步 或 耐力不足
        const isLastStep = remainingSteps === 0;
        const notEnoughStamina = this.prop._actualStaConsume > 0 && 
                                this.prop.curStamina - this.prop._actualStaConsume <= 0;
        
        if (!isLastStep && !notEnoughStamina) {
            return false; // 还在移动中，暂时不检查
        }
        
        // 检查是否有水上行走能力
        if (this._checkWaterWalkAbility()) {
            return false; // 有能力，可以登陆
        }
        
        // 无法登陆，绕道前方
        this.addChat(`${this._cell.cellName}需要乘船到达，你只好绕道前方`);
        this.forward(1);
        return true;
    },
    
    /**
     * 检查是否有水上行走能力
     * @returns {boolean}
     */
    _checkWaterWalkAbility() {
        // 1. 检查坐骑能力（V1.0.5: 有坐骑即可）
        if (this.prop.mount && 
            this.prop.mount.canWaterRun && this.prop.mount.canWaterRun()) {
            this.addChat(`${this.prop.mount.name}飞驰在水面上如履平地`);
            return true;
        }
        
        // 2. 检查随从能力
        if (this.prop.follower && this.prop.follower.canWaterRun && 
            this.prop.follower.canWaterRun()) {
            this.addChat(`${this.prop.follower.name}对你施展了漂浮术`);
            return true;
        }
        
        // 3. 检查水上漂Buff
        if (this.prop.haveBuff && this.prop.haveBuff(BuffNo.WATER_RUN)) {
            this.addChat('漂浮雕文的神力使你稳稳站在水面上');
            return true;
        }
        
        return false;
    }
};

