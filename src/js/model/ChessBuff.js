/**
 * Buff类（增益/减益效果）
 * 对应 AS3: csh.model.ChessBuff
 * 
 * 功能：
 * 1. Buff属性（生命、攻击、防御等倍率加成）
 * 2. Buff持续时间管理
 * 3. Buff类型（战斗/移动/其他）
 * 4. 自定义Buff创建
 */

class ChessBuff {
    // Buff类型常量
    static FOR_BATTLE = 1;   // 战斗相关Buff
    static FOR_MOVE = 2;     // 移动相关Buff
    static FOR_OTHER = 3;    // 其他Buff
    
    /**
     * 构造函数
     * @param {number} buffNo Buff编号（BuffNo常量）
     */
    constructor(buffNo) {
        this._buffNo = buffNo;
        this._type = ChessBuff.FOR_BATTLE;
        
        // 属性倍率加成（0表示无加成，正数增益，负数减益）
        this.lifeMul = 0;      // 生命倍率
        this.atkMul = 0;       // 攻击倍率
        this.defMul = 0;       // 防御倍率
        this.staMul = 0;       // 耐力倍率
        this.wgtMul = 0;       // 负重倍率
        this.lootMul = 0;      // 战利品倍率
        this.fameMul = 0;      // 名声倍率
        this.expMul = 0;       // 经验倍率
        
        // Buff状态
        this.duration = 0;     // 持续回合数
        this.beginRound = 0;   // 开始回合
        this.isDebuff = false; // 是否是减益Buff
        this.isItem = false;   // 是否是道具Buff
        this.fee = 0;          // 移除费用
        this.buffName = '';    // Buff名称
        
        // 注意：不在构造函数中调用initialize()
        // initialize()需要由外部在设置buffNo后调用
    }
    
    /**
     * 获取Buff编号
     */
    get buffNo() {
        return this._buffNo;
    }
    
    /**
     * 获取Buff类型
     */
    get type() {
        return this._type;
    }
    
    /**
     * 初始化Buff（根据编号设置属性）
     * 改造：从DataManager加载数据（数据驱动）
     * @param {number} buffNo - Buff编号
     * @param {number} beginRound - 开始回合数
     */
    initialize(buffNo, beginRound) {
        this._buffNo = buffNo;
        this.beginRound = beginRound || 0;
        
        // 从JSON数据库加载（唯一数据源）
        const data = DataManager.getBuff(this._buffNo);
        
        if (!data) {
            // 数据不存在，报错并使用默认值
            console.error(`[ChessBuff] ❌ Buff ${this._buffNo} 在buffs.json中不存在！请检查数据文件`);
            this.buffName = `【未知Buff(${this._buffNo})】`;
            this._type = ChessBuff.FOR_OTHER;
            this.duration = 1;
            return;
        }
        
        // ✅ 数据驱动：从JSON读取所有配置
        this.buffName = `【${data.name}】`;
        this._type = data.type;
        this.lifeMul = data.lifeMul || 0;
        this.atkMul = data.atkMul || 0;
        this.defMul = data.defMul || 0;
        this.staMul = data.staMul || 0;
        this.wgtMul = data.wgtMul || 0;
        this.lootMul = data.lootMul || 0;
        this.fameMul = data.fameMul || 0;
        this.expMul = data.expMul || 0;
        this.duration = data.duration || 0;
        this.isDebuff = data.isDebuff || false;
        this.isItem = data.isItem || false;
        this.fee = data.fee || 0;
        
        console.log(`[ChessBuff] ✓ Buff初始化：${this.buffName}`);
    }
    
    /**
     * 创建自定义Buff
     * @param {string} name Buff名称
     * @param {number} buffNo 自定义Buff编号
     * @param {number} type Buff类型（FOR_BATTLE/FOR_MOVE/FOR_OTHER）
     * @param {number} duration 持续回合数
     * @returns {ChessBuff}
     */
    static getCustomBuff(name, buffNo, type, duration) {
        const buff = new ChessBuff(0);
        buff._buffNo = buffNo;
        buff._type = type;
        buff.duration = duration;
        buff.buffName = `【${name}】`;
        return buff;
    }
    
    /**
     * 获取Buff描述文本
     * @param {boolean} removeHtmlTags 是否移除HTML标签（用于聊天显示）
     * @returns {string}
     */
    getDescription(removeHtmlTags = true) {
        let buffName = this.buffName;
        
        // 移除HTML标签（CreateJS Text不支持HTML）
        if (removeHtmlTags) {
            buffName = buffName.replace(/<\/?font[^>]*>/g, '');
        }
        
        // buffName已经包含【】，不要重复添加
        let desc = buffName;
        
        // 优先从JSON读取effectText
        const data = DataManager.getBuff(this._buffNo);
        if (data && data.effectText) {
            desc += ` (${data.effectText})`;
        } else {
            // 降级：根据属性自动生成效果描述
            const effects = [];
            if (this.lifeMul !== 0) effects.push(`生命${this.lifeMul > 0 ? '+' : ''}${(this.lifeMul * 100).toFixed(0)}%`);
            if (this.atkMul !== 0) effects.push(`攻击${this.atkMul > 0 ? '+' : ''}${(this.atkMul * 100).toFixed(0)}%`);
            if (this.defMul !== 0) effects.push(`防御${this.defMul > 0 ? '+' : ''}${(this.defMul * 100).toFixed(0)}%`);
            if (this.staMul !== 0) effects.push(`耐力${this.staMul > 0 ? '+' : ''}${(this.staMul * 100).toFixed(0)}%`);
            if (this.wgtMul !== 0) effects.push(`负重${this.wgtMul > 0 ? '+' : ''}${(this.wgtMul * 100).toFixed(0)}%`);
            if (this.lootMul !== 0) effects.push(`战利品${this.lootMul > 0 ? '+' : ''}${(this.lootMul * 100).toFixed(0)}%`);
            if (this.expMul !== 0) effects.push(`经验${this.expMul > 0 ? '+' : ''}${(this.expMul * 100).toFixed(0)}%`);
            if (this.fameMul !== 0) effects.push(`名声${this.fameMul > 0 ? '+' : ''}${(this.fameMul * 100).toFixed(0)}%`);
            
            if (effects.length > 0) {
                desc += ` (${effects.join(', ')})`;
            }
        }
        
        // 显示持续时间（duration > 0 时显示）
        if (this.duration > 0) {
            desc += ` 持续${this.duration}回合`;
        }
        
        return desc;
    }
    
    /**
     * 检查Buff是否过期
     * @param {number} currentRound 当前回合数
     * @returns {boolean}
     */
    isExpired(currentRound) {
        return currentRound > this.beginRound + this.duration;
    }
    
    /**
     * 获得烹饪Buff（野外打猎烹饪）
     * 对应 AS3: ChessBuff.gainCookingBuff()
     * @param {Chess} chess - 棋子对象
     * @param {number} foodId - 食物ID（100=平原鹰, 101=野狼, 102=大闸蟹）
     */
    static gainCookingBuff(chess, foodId) {
        let message = '';
        const buff = new ChessBuff(0);  // 自定义Buff
        buff._buffNo = foodId;
        buff._type = ChessBuff.FOR_BATTLE;
        buff.buffName = '【进食充分】';
        buff.duration = 2;  // 持续2回合
        
        switch (foodId) {
            case 100:
                // 平原鹰：生命+30%
                message = '你射下1只平原鹰并饱餐了一顿香烤鹰腿';
                buff.lifeMul = 0.3;
                break;
            case 101:
                // 野狼：攻击+20%
                message = '你猎到1匹野狼并饱餐了一顿黑椒狼肋排';
                buff.atkMul = 0.2;
                break;
            case 102:
                // 大闸蟹：防御+20%
                message = '你捉到1只大闸蟹并饱餐了一顿清蒸肥蟹';
                buff.defMul = 0.2;
                break;
        }
        
        chess.addChat(message);
        buff.beginRound = chess.board._round + 1;
        
        // 添加Buff到玩家
        chess.prop._buffs.push(buff);
        chess.prop._recalculateAttributes();
        
        // 显示Buff获得提示（统一格式，getDescription已包含持续时间）
        chess.addGreenChat(buff.getDescription());
    }
    
    /**
     * 神龛Buff（副本中发现）
     * 对应 AS3: ChessBuff.gainShrineBuff()
     * @param {Chess} chess - 棋子对象
     */
    static gainShrineBuff(chess) {
        // 随机选择神龛类型（200-203）
        const shrineType = 200 + Math.floor(Math.random() * 4);
        const buff = new ChessBuff(0);  // 自定义Buff
        buff._buffNo = shrineType;
        buff.duration = 2;  // 持续2回合
        
        // 随机前缀
        const discoverPrefixs = [
            '你在副本深处',
            '你在岔路口',
            '你在密室中',
            '你在石柱旁'
        ];
        let message = discoverPrefixs[Math.floor(Math.random() * discoverPrefixs.length)];
        
        // 根据类型设置Buff
        let expGain = 0;
        switch (shrineType) {
            case 200:
                // 生命祭坛
                message += '找到一处生命祭坛';
                buff._type = ChessBuff.FOR_BATTLE;
                buff.lifeMul = 0.4;
                buff.buffName = '生命充盈';
                break;
            case 201:
                // 力量祭坛
                message += '找到一处力量祭坛';
                buff._type = ChessBuff.FOR_BATTLE;
                buff.atkMul = 0.3;
                buff.buffName = '力量充盈';
                break;
            case 202:
                // 耐力祭坛
                message += '找到一处耐力祭坛';
                buff._type = ChessBuff.FOR_MOVE;
                buff.staMul = 0.2;
                buff.buffName = '耐力充盈';
                break;
            default:
                // 经验祭坛（直接给经验，不是Buff）
                expGain = chess.prop.level * 10;
                message += `找到一处经验祭坛，经验+${expGain}`;
                chess.addChat(message);
                chess.prop.addExp(expGain);
                return;
        }
        
        buff.buffName = `<font color='#00ff88' style='text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'>${buff.buffName}</font>`;
        chess.addChat(message);
        
        // 10%概率是陷阱
        if (Math.random() > 0.9) {
            chess.addChat('你十万个没想到这尼玛竟是个坑爹陷阱');
            
            if (shrineType === 200) {
                buff.buffName = '中毒';
                buff.lifeMul = -0.4;
            } else if (shrineType === 201) {
                buff.buffName = '虚弱诅咒';
                buff.atkMul = -0.3;
            } else if (shrineType === 202) {
                buff.buffName = '气运不济';
                buff.staMul = -0.2;
            }
        }
        
        const beginRound = chess.board._round + 1;
        
        // 使用 addBuffObj 添加Buff（会自动处理重复、重计算属性、显示消息）
        chess.prop.addBuffObj(buff, beginRound);
        
        console.log(`[ChessBuff] 神龛Buff: ${buff.buffName} (${buff._buffNo})`);
    }
}

