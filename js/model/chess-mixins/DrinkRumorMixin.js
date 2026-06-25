/**
 * 喝酒打听消息 Mixin - V1.0.6
 * 酒馆喝酒事件：多种随机结果
 * 
 * 概率分布：
 * - 50% 毫无所获（普通聊天）
 * - 20% 喝醉被丢出去（负面效果）
 * - 10% 赌博赢钱（随机金额）
 * - 10% 欢度春宵（状态全满）
 * - 10% 获得Boss/NPC线索（稀有）
 */

const DrinkRumorMixin = {
    // 喝两杯（酒馆）- V1.0.6 完全重写
    _drinkAtTavern() {
        // 刚复活时不能喝酒
        if (this._justRevived) {
            this.addChat('你刚死里逃生，老板看你脸色苍白不肯卖酒给你');
            this._justRevived = false;
            this.board.roundEnd();
            return;
        }
        
        const cost = 100;
        
        if (this.prop.gold < cost) {
            this.addChat('你本想去酒馆喝两杯打听消息，可摸摸荷包又放弃了');
            this.board.roundEnd();
            return;
        }
        
        this.addChat('你去酒馆点了两杯，顺便和酒客们闲聊');
        this.addChat(`金钱-${cost}`);
        this.prop.reduceGold(cost);
        
        // V1.0.6: 随机事件（概率分布）
        const roll = Math.random() * 100;
        
        if (roll < 50) {
            // 50% - 毫无所获（普通聊天）
            this._drinkResult_Nothing();
        } else if (roll < 70) {
            // 20% - 喝醉被丢出去
            this._drinkResult_Drunk();
        } else if (roll < 80) {
            // 10% - 赌博赢钱
            this._drinkResult_Gamble();
        } else if (roll < 90) {
            // 10% - 欢度春宵
            this._drinkResult_Romance();
        } else {
            // 10% - 获得线索
            this._drinkResult_Rumor();
        }
        
        if (this._panel) {
            this._panel.updateUI();
        }
        
        this.board.roundEnd();
    },
    
    // 50% - 毫无所获
    _drinkResult_Nothing() {
        const messages = [
            '你和酒客们天南地北的聊了一通，但并没有打听到什么有价值的消息',
            '酒客们只顾着吹嘘自己的冒险经历，你听了半天也没什么收获',
            '今天酒馆里都是些老面孔，没什么新鲜事',
            '你仔细倾听酒客们的闲聊，可惜都是些陈年旧事',
            '酒保说最近太平得很，没什么传闻值得一提'
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        this.addChat(msg);
    },
    
    // 20% - 喝醉被丢出去
    _drinkResult_Drunk() {
        this.addChat('你不知不觉喝多了开始胡言乱语，酒保见状直接把你架出门外丢在路边');
        this.addRedChat('你醉倒在街头，感觉头昏脑涨...');
        
        // 负面效果：获得醉酒debuff（如果有的话）或损失少量耐力
        const staminaLoss = Math.floor(this.prop.curStamina * 0.2);
        if (staminaLoss > 0) {
            this.prop.curStamina = Math.max(0, this.prop.curStamina - staminaLoss);
            this.addChat(`耐力-${staminaLoss}`);
        }
    },
    
    // 10% - 赌博赢钱
    _drinkResult_Gamble() {
        this.addChat('你被酒客拉去玩骰子赌博');
        
        // 随机金额：100-1000
        const winAmount = Math.floor(Math.random() * 901) + 100;
        
        this.addGreenChat('手气不错，你赢了！');
        this.addGreenChat(`金钱+${winAmount}`);
        this.prop.addGold(winAmount);
    },
    
    // 10% - 欢度春宵
    _drinkResult_Romance() {
        const messages = [
            '酒馆女郎被你的风趣幽默所吸引，邀请你去楼上坐坐',
            '你和酒馆的漂亮服务员眉来眼去，她悄悄塞给你一把房间钥匙',
            '酒馆老板娘看你一表人才，硬要请你喝杯好酒，顺便聊聊人生'
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        this.addChat(msg);
        this.addChat('...第二天一早，你神清气爽地离开酒馆');
        
        // 状态全满
        this.prop._curLife = this.prop.maxLife;
        this.prop.curStamina = this.prop.maxStamina;
        
        this.addGreenChat('生命和耐力完全恢复！');
    },
    
    // 10% - 获得线索
    _drinkResult_Rumor() {
        const rumorType = this.rumorSystem.getRandomRumor();
        
        if (!rumorType) {
            // 所有线索都已获得，改为普通聊天
            this.addChat('你想打听点消息，但最近的传闻你都已经知道了，看来要等过段时间才有新消息');
            return;
        }
        
        // 获得新线索
        this.rumorSystem.addClue(rumorType, 10);  // 10回合有效期
        const clue = RumorSystem.CLUE_CONFIGS[rumorType];
        
        this.addGreenChat('═══════【 酒馆传闻 】═══════');
        this.addChat('你从酒客口中打听到一个消息：');
        this.addChat(`📰 ${clue.description}`);
        this.addChat(`📍 地点：${clue.cellName}`);
        this.addChat(`🎁 奖励：${clue.reward}`);
        this.addGreenChat('⏰ 有效期：10回合内到达触发');
        this.addGreenChat('═════════════════════════');
    }
};

