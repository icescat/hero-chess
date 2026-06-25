/**
 * 任务类
 * 对应 AS3: csh.model.Quest
 * 
 * 功能：
 * 1. 7种任务类型（送信、护送、搜索、寻宝等）
 * 2. 任务触发和完成机制
 * 3. 任务时限管理
 * 4. 任务奖励计算
 * 5. 任务失败处理
 */

class Quest {
    // 任务类型常量
    static DELIVER = 1;      // 送信/送公文
    static CONVOY = 2;       // 商队/使团保镖
    static FIND_HUMAN = 3;   // 救援/缉凶行动
    static FIND_GOODS = 4;   // 失物搜索/宝物夺回
    static TRESURE = 5;      // 寻宝
    static INVADE = 6;       // 怪物侵袭
    static TRIUMPH = 7;      // 凯旋（通关任务）
    
    /**
     * 构造函数
     * @param {number} type 任务类型
     */
    constructor(type) {
        this.type = type;
        this.isRare = false;                    // 是否稀有任务
        
        // 触发和完成位置
        this.triggerCellType = 0;               // 触发格子类型
        this.triggerCellIndex = -1;             // 触发格子索引
        this.replyCellIndex = -1;               // 完成格子索引
        this.beginCellIndex = -1;               // 开始格子索引
        
        // 战斗触发
        this.battleTriggerType = 0;             // 战斗触发类型（Enemy.NORMAL/BOSS）
        this.battleTrigger = false;             // 是否触发战斗
        this.battleTriggerRate = 0;             // 战斗触发概率
        
        // 任务信息
        this.questName = '';                    // 任务名称
        this.questIntro = '';                   // 任务介绍
        this.questDest = '';                    // 目的地名称
        this.questDuration = 0;                 // 任务时限（回合数）
        this.beginRound = 0;                    // 开始回合
        
        // 任务规则
        this.cannotDie = false;                 // 是否不能死亡
        this.isTownQuest = false;               // 是否城镇任务
        
        // 奖励
        this.exp = 0;                           // 经验
        this.gold = 0;                          // 金币
        this.fame = 0;                          // 名声
        this.stuff = 0;                         // 普通材料
        this.rarestuff = 0;                     // 稀有材料
        this.popularity = 0;                    // 好感度
    }
    
    /**
     * 根据类型初始化任务
     */
    initializeByType() {
        switch (this.type) {
            case Quest.DELIVER:
                // 送信/送公文
                this.questDuration = Math.max(1, this.questDuration);
                if (this.isRare) {
                    this.questName = '送公文';
                    this.questIntro = `${this.questDuration}天内把公文送到${this.questDest}`;
                } else {
                    this.questName = '送信';
                    this.questIntro = `${this.questDuration}天内把信件派送到${this.questDest}`;
                }
                this.isTownQuest = true;
                break;
                
            case Quest.CONVOY:
                // 商队/使团保镖
                // V1.0.6: 使用传入的时限（根据距离计算），保底3/5天
                if (this.isRare) {
                    this.questDuration = Math.max(3, this.questDuration);
                    this.questName = '使团保镖';
                    this.questIntro = `${this.questDuration}天内把使团护送到${this.questDest}`;
                } else {
                    this.questDuration = Math.max(5, this.questDuration);
                    this.questName = '商队保镖';
                    this.questIntro = `${this.questDuration}天内把商队护送到${this.questDest}`;
                }
                this.cannotDie = true;
                this.isTownQuest = true;
                break;
                
            case Quest.FIND_HUMAN:
                // 救援/缉凶行动
                // V1.0.6: 使用传入的时限（根据距离计算），保底7/9天
                // 注意：这是第一阶段（找到目标），第二阶段（护送回城）有单独的时限
                if (this.isRare) {
                    this.questDuration = Math.max(7, this.questDuration);
                    this.questName = '缉凶行动';
                    this.questIntro = `${this.questDuration}天内找到潜逃至${this.questDest}的NPC并将其押送到城镇`;
                } else {
                    this.questDuration = Math.max(9, this.questDuration);
                    this.questName = '救援行动';
                    this.questIntro = `${this.questDuration}天内找到在${this.questDest}遇难的NPC并将其护送到城镇`;
                }
                this.isTownQuest = true;
                break;
                
            case Quest.FIND_GOODS:
                // 失物搜索/宝物夺回
                if (this.isRare) {
                    this.questDuration = 9;
                    this.battleTriggerType = 2; // Enemy.BOSS
                    this.questName = '宝物夺回';
                    this.questIntro = `${this.questDuration}天内找到被怪物头目抢走的宝物并带回这里`;
                } else {
                    this.questDuration = 7;
                    this.battleTriggerType = 1; // Enemy.NORMAL
                    this.questName = '失物搜索';
                    this.questIntro = `${this.questDuration}天内找到被怪物抢走的物品并带回这里`;
                }
                this.battleTriggerRate = 0.6;
                this.battleTrigger = true;
                this.isTownQuest = true;
                break;
                
            case Quest.TRESURE:
                // 寻宝
                // V1.0.6: 使用传入的时限（根据距离计算），保底7天
                this.questDuration = Math.max(7, this.questDuration);
                this.questName = '寻宝';
                this.questIntro = `根据地图指示，宝藏似乎被埋藏在${this.questDest}，${this.questDuration}天内赶到藏宝点吧`;
                this.replyCellIndex = this.triggerCellIndex;
                break;
                
            case Quest.INVADE:
                // 怪物侵袭
                // V1.0.6: 使用传入的时限（根据距离计算），保底2天
                this.questDuration = Math.max(2, this.questDuration);
                this.questName = '怪物侵袭';
                this.questIntro = `听闻${this.questDest}被怪物侵袭了，${this.questDuration}天内赶快去帮忙消灭怪物吧`;
                this.replyCellIndex = this.triggerCellIndex;
                break;
                
            case Quest.TRIUMPH:
                // 凯旋（通关任务）
                this.questName = '凯旋';
                this.questIntro = '魔王已死，快回城接受国王的封赏吧';
                this.questDuration = 0;
                this.replyCellIndex = this.triggerCellIndex;
                break;
        }
    }
    
    /**
     * 任务完成
     * @param {Chess} chess 棋子
     * @param {ChessProperty} prop 属性
     */
    completed(chess, prop) {
        let message = '';
        
        switch (this.type) {
            case Quest.DELIVER:
                // 送信/送公文
                this.exp = prop.level * 5;
                this.gold = this.isRare ? prop.level * 120 : prop.level * 40;
                this.fame = this.isRare ? Math.ceil(prop.level / 5) : Math.ceil(prop.level / 15);
                this.popularity = this.isRare ? 18 : 6;
                
                if (this.isRare) {
                    message = `你按时将公文送到了${chess._cell.cellName}<br>`;
                } else {
                    message = `你按时将信件送到了${chess._cell.cellName}<br>`;
                }
                message += `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>委托【${this.questName}】顺利完成</font><br>`;
                message += `经验+${this.exp} 金钱+${this.gold} 名声+${this.fame}`;
                break;
                
            case Quest.CONVOY:
                // 商队/使团保镖
                this.exp = prop.level * 10;
                this.gold = this.isRare ? prop.level * 240 : prop.level * 80;
                this.fame = this.isRare ? Math.ceil(prop.level / 5) * 2 : Math.ceil(prop.level / 15) * 2;
                this.popularity = this.isRare ? 24 : 8;
                
                if (this.isRare) {
                    message = `你将使团平安护送到了${chess._cell.cellName}<br>`;
                } else {
                    message = `你将商队平安护送到了${chess._cell.cellName}<br>`;
                }
                message += `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>委托【${this.questName}】顺利完成</font><br>`;
                message += `经验+${this.exp} 金钱+${this.gold} 名声+${this.fame}`;
                break;
                
            case Quest.FIND_HUMAN:
                // 救援/缉凶行动
                this.exp = prop.level * 20;
                this.fame = this.isRare ? Math.ceil(prop.level / 5) * 4 : Math.ceil(prop.level / 15) * 4;
                this.stuff = this.isRare ? Math.ceil(prop.level / 10) * 8 : Math.ceil(prop.level / 30) * 8;
                this.rarestuff = this.isRare ? Math.ceil(prop.level / 10) * 4 : Math.ceil(prop.level / 30) * 4;
                this.popularity = this.isRare ? 36 : 12;
                
                if (this.isRare) {
                    message = `你将潜逃的NPC及时押送到了${chess._cell.cellName}<br>`;
                } else {
                    message = `你将伤重的NPC及时护送到了${chess._cell.cellName}<br>`;
                }
                message += `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>委托【${this.questName}】顺利完成</font><br>`;
                message += `经验+${this.exp} 名声+${this.fame}<br>`;
                message += `基础锻材+${this.stuff} 稀有锻材+${this.rarestuff}`;
                break;
                
            case Quest.FIND_GOODS:
                // 失物搜索/宝物夺回
                this.exp = prop.level * 15;
                this.fame = this.isRare ? Math.ceil(prop.level / 5) * 3 : Math.ceil(prop.level / 15) * 3;
                this.stuff = this.isRare ? Math.ceil(prop.level / 10) * 6 : Math.ceil(prop.level / 30) * 6;
                this.rarestuff = this.isRare ? Math.ceil(prop.level / 10) * 3 : Math.ceil(prop.level / 30) * 3;
                this.popularity = this.isRare ? 30 : 10;
                
                if (this.isRare) {
                    message = `你将被抢走的宝物带回了${chess._cell.cellName}<br>`;
                } else {
                    message = `你将被抢走的物品带回了${chess._cell.cellName}<br>`;
                }
                message += `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>委托【${this.questName}】顺利完成</font><br>`;
                message += `经验+${this.exp} 名声+${this.fame}<br>`;
                message += `基础锻材+${this.stuff} 稀有锻材+${this.rarestuff}`;
                break;
                
            case Quest.TRESURE:
                // 寻宝
                this.gold = 60000;
                this.fame = 20;
                this.stuff = 36;
                this.rarestuff = 18;
                
                message = `你按照藏宝图指示来到了${chess._cell.cellName}<br>`;
                message += '你挖地三尺始终没有收获，即将放弃的时候，突然摸到硬邦邦的东西<br>';
                message += `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>几铲子下去你成功挖到了宝藏</font><br>`;
                message += `金钱+${this.gold} 名声+${this.fame}<br>`;
                message += `基础锻材+${this.stuff} 稀有锻材+${this.rarestuff}`;
                break;
                
            case Quest.INVADE:
                // 怪物侵袭
                this.gold = Math.ceil(prop.level / 30) * 10000;
                this.fame = Math.ceil(prop.level / 30) * 15;
                this.stuff = 18;
                this.rarestuff = 9;
                this.popularity = 14;
                
                message = `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>你成功阻止了怪物侵袭${chess._cell.cellName}</font><br>`;
                message += `金钱+${this.gold} 名声+${this.fame}<br>`;
                message += `基础锻材+${this.stuff} 稀有锻材+${this.rarestuff}`;
                break;
                
            case Quest.TRIUMPH:
                // 凯旋（通关任务）
                message = '卫兵们列队恭迎英雄凯旋，红毯一路铺至皇宫，全城彩旗飘扬礼炮齐鸣万众欢呼<br>';
                message += '<font color=\'#00FF00\'>你接过国王手中王冠，加冕为勇者王</font>';
                break;
        }
        
        // V1.0.5: 任务完成消息统一使用addChat追加（cellReached已经清屏并显示到达）
        chess.addChat(message);
        
        // 发放奖励
        if (this.gold > 0) {
            prop.addGold(this.gold);
        }
        if (this.fame > 0) {
            prop.fame += this.fame;
        }
        if (this.stuff > 0) {
            prop.stuff += this.stuff;
        }
        if (this.rarestuff > 0) {
            prop.rarestuff += this.rarestuff;
        }
        if (this.exp > 0) {
            prop.addExp(this.exp);
        }
        
        // 移除任务
        prop.removeQuest(this);
        
        // 寻宝任务：从宝箱获得装备 - AS3: checkLootEquipFromChest
        if (this.type === Quest.TRESURE) {
            prop.checkLootEquipFromChest(5);
        }
        
        console.log(`[Quest] 任务完成: ${this.questName}`);
    }
    
    /**
     * 任务失败
     * @param {boolean} isTimeout 是否超时失败（false=死亡失败）
     * @returns {string} 失败消息
     */
    failed(isTimeout = true) {
        let message = '';
        
        switch (this.type) {
            case Quest.DELIVER:
            case Quest.FIND_GOODS:
                message = `委托【${this.questName}】已超过${this.questDuration}天期限`;
                break;
                
            case Quest.CONVOY:
                if (isTimeout) {
                    message = `委托【${this.questName}】已超过${this.questDuration}天期限`;
                } else {
                    message = `委托【${this.questName}】由于你的死亡而失败`;
                }
                break;
                
            case Quest.FIND_HUMAN:
                if (this.triggerCellIndex !== this.replyCellIndex) {
                    message = `委托【${this.questName}】已超过${this.questDuration}天期限`;
                } else if (isTimeout) {
                    message = `委托【${this.questName}】由于NPC没有得到及时救治而失败`;
                } else {
                    message = `委托【${this.questName}】由于NPC死亡而失败`;
                }
                break;
                
            case Quest.TRESURE:
                message = `已经过去${this.questDuration}天了，宝藏早就被人挖走了`;
                break;
                
            case Quest.INVADE:
                // 获取格子名称（暂时简化）
                const cellName = this.questDest || '某地';
                if (isTimeout) {
                    message = `已经过去${this.questDuration}天了，你没能赶到${cellName}阻止怪物侵袭`;
                } else {
                    message = `你眼睁睁看着${cellName}遭受怪物侵袭却无力阻止，不禁咬破了嘴唇`;
                }
                // V1.1+: 格子被摧毁效果（视觉反馈）
                break;
        }
        
        console.log(`[Quest] 任务失败: ${this.questName} - ${message}`);
        return `<font color='#ff3333' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>${message}</font>`;
    }
    
    /**
     * 获取任务名称
     * @returns {string}
     */
    getQuestName() {
        return this.questName;
    }
    
    /**
     * 释放资源
     */
    dispose() {
        this.questName = null;
        this.questIntro = null;
        this.questDest = null;
    }
}

