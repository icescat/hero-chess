/**
 * 随从类
 * 对应 AS3: csh.model.Follower
 * 
 * 功能：
 * 1. 5个职业系统（战士、法师、牧师、盗贼、游侠）
 * 2. 5个等级（逗比到威猛/飒爽）
 * 3. 关系系统（0-100）
 * 4. 技能系统（每个职业4个技能）
 * 5. 战斗辅助和属性加成
 * 6. 合体技和鼓舞系统
 * 7. 婚姻系统
 */

class Follower {
    // 职业常量
    static WARRIOR = 1;  // 战士
    static MAGE = 2;     // 法师
    static PRIEST = 3;   // 牧师
    static ROGUE = 4;    // 盗贼
    static RANGER = 5;   // 游侠
    
    /**
     * 构造函数
     * @param {number} job 职业（1-5）
     * @param {number} rank 等级（1-5）
     * @param {number} sex 性别（0=男, 1=女）
     */
    constructor(job, rank, sex = 0) {
        // 职业和等级
        if (job < Follower.WARRIOR || job > Follower.RANGER) {
            job = Follower.WARRIOR;
        }
        this.job = job;
        
        this.maxRank = 5;
        if (rank < 1 || rank > this.maxRank) {
            rank = 1;
        }
        this.rank = rank;
        
        this.sex = sex;  // 0=男, 1=女
        
        // 属性
        this.life = 0;           // 生命加成
        this.attack = 0;         // 攻击加成
        this.defense = 0;        // 防御加成
        
        // 关系系统
        this._relationship = 0;   // 关系值（0-100）
        this.cooperate = 0;       // 合体技概率
        this.marriageType = 0;    // 婚姻类型（0=无, 1=已婚）
        
        // 雇佣信息
        this.name = '';           // 职业名称
        this.recruitFee = 0;      // 雇佣费用
        this.duration = 14;       // 雇佣时长（回合）
        this.beginRound = 0;      // 开始回合
        // V1.0.6: isTemp属性已废弃（临时随从功能已删除）
        
        // 技能系统
        this.skillNames = [];     // 技能名称
        this.skillIntros = [];    // 技能介绍
        this.skill1Lv = 0;        // 技能1等级
        this.skill2Lv = 0;        // 技能2等级
        this.skill1rate = 0;      // 技能1触发率
        this.skill2rate = 0;      // 技能2触发率
        this.useCount1 = 0;       // 技能1使用次数
        this.useCount2 = 0;       // 技能2使用次数
        this.increase1 = 0;       // 技能1本次战斗使用次数
        this.increase2 = 0;       // 技能2本次战斗使用次数
        
        // 其他
        this.cooperated = false;  // 本次战斗是否已使用合体技
        this.lastReturnRound = 0; // 上次回城回合
        this.townCellIndex = -1;  // 记录的城镇格子索引
        
        this.initialize();
    }
    
    /**
     * 获取关系值
     */
    get relationship() {
        return this._relationship;
    }
    
    /**
     * 是否已婚
     */
    get married() {
        return this.marriageType === 1;
    }
    
    /**
     * 初始化随从（数据驱动）
     */
    initialize() {
        this.skillNames = [];
        this.skillIntros = [];
        
        // ✅ 从JSON数据库加载职业数据
        const jobData = DataManager.getFollowerJob(this.job);
        const config = DataManager.getFollowerConfig();
        
        if (jobData) {
            this.name = jobData.name;
            this.skillNames = jobData.skills.map(s => s.name);
            this.skillIntros = jobData.skills.map(s => s.intro);
            this.duration = config.defaultDuration || 14;
            
            console.log(`[Follower] ✓ 随从初始化（数据驱动）: ${this.name} Rank${this.rank} ${this.sex === 0 ? '男' : '女'}`);
        } else {
            console.error(`[Follower] ❌ 未找到职业数据: jobNo=${this.job}`);
            this.name = '未知职业';
            this.duration = 14;
        }
        
        // 初始化属性
        this.initAttrs();
    }
    
    /**
     * 初始化属性（数据驱动）
     */
    initAttrs() {
        // ✅ 从数据库获取等级基数
        const rankData = DataManager.getFollowerRank(this.rank);
        let levelBase = rankData ? rankData.levelBase : (3 + this.rank * 15);
        
        // ✅ 从数据库获取职业属性比例
        const jobData = DataManager.getFollowerJob(this.job);
        let lifeRatio = 0.4;    // 默认值
        let attackRatio = 0.3;  // 默认值
        
        if (jobData) {
            lifeRatio = jobData.lifeRatio;
            attackRatio = jobData.attackRatio;
        } else {
            console.warn(`[Follower] ⚠️ 未找到职业${this.job}的属性比例，使用默认值`);
        }
        
        const lifePoints = Math.floor(levelBase * lifeRatio);
        const attackPoints = Math.floor(levelBase * attackRatio);
        const defensePoints = levelBase - lifePoints - attackPoints;
        
        this.life = lifePoints * 100;
        this.attack = attackPoints * 10;
        this.defense = defensePoints * 5;
        
        console.log(`[Follower] 属性 - 生命:${this.life} 攻击:${this.attack} 防御:${this.defense}`);
    }
    
    /**
     * 升级技能
     * @param {number} skill1Inc 技能1升级次数
     * @param {number} skill2Inc 技能2升级次数
     */
    upgradeSkill(skill1Inc = 0, skill2Inc = 0) {
        this.skill1Lv += skill1Inc;
        this.skill2Lv += skill2Inc;
        
        // 根据职业更新技能触发率
        switch (this.job) {
            case Follower.WARRIOR:
                this.skill1rate = 0.2 + this.skill1Lv / 100;
                this.skill2rate = 0.2 + this.skill2Lv / 100;
                break;
            case Follower.MAGE:
                this.skill1rate = 0.2 + this.skill1Lv / 100;
                this.skill2rate = 0.2 + this.skill2Lv / 100;
                break;
            case Follower.PRIEST:
                this.skill1rate = 0.2 + this.skill1Lv / 100;
                this.skill2rate = 0.3 + this.skill2Lv / 100;
                break;
            case Follower.ROGUE:
                this.skill1rate = 0.2 + this.skill1Lv / 100;
                this.skill2rate = 0.2 + this.skill2Lv / 100;
                break;
            case Follower.RANGER:
                this.skill1rate = 0.2 + this.skill1Lv / 100;
                this.skill2rate = 0.2 + this.skill2Lv / 100;
                break;
        }
        
        console.log(`[Follower] 技能升级 - Lv1:${this.skill1Lv} Lv2:${this.skill2Lv}`);
    }
    
    /**
     * 检查技能是否可升级
     * @returns {boolean}
     */
    checkUpgradeSkill() {
        let skill1Up = 0;
        if (this.useCount1 >= this.skill1Lv * this.maxRank) {
            this.useCount1 -= this.skill1Lv * this.maxRank;
            skill1Up++;
        }
        
        let skill2Up = 0;
        if (this.useCount2 >= this.skill2Lv * this.maxRank) {
            this.useCount2 -= this.skill2Lv * this.maxRank;
            skill2Up++;
        }
        
        if (skill1Up !== 0 || skill2Up !== 0) {
            this.upgradeSkill(skill1Up, skill2Up);
            return true;
        }
        
        return false;
    }
    
    /**
     * 提升关系
     * @param {number} amount 提升量
     */
    relationshipUp(amount) {
        if (this._relationship >= 100) {
            return;
        }
        
        this._relationship += amount;
        this._relationship = Math.round(this._relationship * 10) / 10;  // 保留1位小数
        this._relationship = Math.min(100, this._relationship);
        
        // 更新雇佣费用
        this.recruitFee *= (100 - this._relationship) / 100;
        
        // 更新合体技概率
        this.cooperate = Math.ceil(this._relationship / 30) * 0.01;
        
        // 更新雇佣时长
        this.duration = 14 + Math.floor(this._relationship / 25) * 3;
        
        // 达到满关系
        if (this._relationship === 100) {
            this.cooperate = this.marriageType === 1 ? 0.06 : 0.05;
            console.log(`[Follower] 关系达到100！成为${this.getRelationString()}`);
        }
    }
    
    /**
     * 是否达到最高等级
     */
    isMaxRank() {
        return this.rank === this.maxRank;
    }
    
    /**
     * 是否达到最高关系
     */
    isMaxRelationship() {
        return this._relationship >= 100;
    }
    
    /**
     * 是否可以结婚
     */
    canMarry() {
        return this.marriageType === 0 && this.sex === 1 && this._relationship >= 100;
    }
    
    /**
     * 开始战斗
     */
    startBattle() {
        this.increase1 = 0;
        this.increase2 = 0;
    }
    
    /**
     * 结束战斗
     * @param {number} turns 战斗回合数
     * @param {boolean} isBoss 是否BOSS战
     */
    endBattle(turns, isBoss = false) {
        this.cooperated = false;
        
        let relationshipGain = turns / 5;
        if (isBoss) {
            relationshipGain *= 3;
        }
        
        this.relationshipUp(relationshipGain);
    }
    
    // ========== 战斗技能判定 ==========
    
    /**
     * 是否可以使用合体技
     * @param {Chess} chess 棋子
     * @param {number} turn 当前回合
     * @returns {boolean}
     */
    canCooperate(chess, turn) {
        if (!this.cooperated && turn > 3 && RandomUtils.chance(this.cooperate)) {  // 优化：合体技概率
            this.cooperated = true;
            const message = this.marriageType === 1 ? 
                '你与妻子在战斗中使出了合体技' : 
                '你与随从在战斗中使出了合体技';
            chess.addChat(message);
            return true;
        }
        return false;
    }
    
    /**
     * 是否可以鼓舞
     * @param {Chess} chess 棋子
     * @returns {boolean}
     */
    canInspire(chess) {
        const rate = this._relationship / 100;
        if (RandomUtils.chance(rate)) {  // 优化：鼓舞概率
            if (this.sex === 1) {
                if (this.marriageType === 1) {
                    chess.addChat(`${this.name}献上一吻令你飘飘欲仙`);
                } else {
                    chess.addChat(`${this.name}大跳艳舞令你血脉贲张`);
                }
            } else {
                chess.addChat(`${this.name}高唱战歌使你勇气倍增`);
            }
            return true;
        }
        return false;
    }
    
    // ========== 盗贼技能 ==========
    
    /**
     * 盗贼：偷窃（战斗技能1，Rank 3解锁）
     * 战利品获得×1.25
     */
    canSteal() {
        if (this.job === Follower.ROGUE && this.rank >= 3 && RandomUtils.chance(this.skill1rate)) {
            this.useCount1++;
            this.increase1++;
            return true;
        }
        return false;
    }
    
    /**
     * 盗贼：背刺（战斗技能2，Rank 5解锁）
     * 无视防御×2伤害
     */
    canBackstab() {
        if (this.job === Follower.ROGUE && this.rank >= 5 && RandomUtils.chance(this.skill2rate)) {
            this.useCount2++;
            this.increase2++;
            return true;
        }
        return false;
    }
    
    // ========== 游侠技能 ==========
    
    /**
     * 游侠：瞄准射击（战斗技能1，Rank 3解锁）
     */
    canHelpCritical() {
        if (this.job === Follower.RANGER && this.rank >= 3 && RandomUtils.chance(this.skill1rate)) {
            this.useCount1++;
            this.increase1++;
            return true;
        }
        return false;
    }
    
    /**
     * 游侠：乱射（战斗技能2，Rank 5解锁）
     */
    canCombo() {
        if (this.job === Follower.RANGER && this.rank >= 5 && RandomUtils.chance(this.skill2rate)) {
            this.useCount2++;
            this.increase2++;
            return true;
        }
        return false;
    }
    
    // ========== 战士技能 ==========
    
    /**
     * 战士：战吼（战斗技能1，Rank 3解锁）
     * 攻击伤害×1.5
     */
    canWarCry() {
        if (this.job === Follower.WARRIOR && this.rank >= 3 && RandomUtils.chance(this.skill1rate)) {
            this.useCount1++;
            this.increase1++;
            return true;
        }
        return false;
    }
    
    /**
     * 战士：复仇（战斗技能2，Rank 5解锁）
     * 受到伤害时反击50%
     */
    canRevenge() {
        if (this.job === Follower.WARRIOR && this.rank >= 5 && RandomUtils.chance(this.skill2rate)) {
            this.useCount2++;
            this.increase2++;
            return true;
        }
        return false;
    }
    
    // ========== 法师技能 ==========
    
    /**
     * 法师：闪电术（战斗技能1，Rank 3解锁）
     * 攻击伤害×1.5
     */
    canLightning() {
        if (this.job === Follower.MAGE && this.rank >= 3 && RandomUtils.chance(this.skill1rate)) {
            this.useCount1++;
            this.increase1++;
            return true;
        }
        return false;
    }
    
    /**
     * 法师：炎爆术（战斗技能2，Rank 5解锁）
     * ×2伤害，敌人防御-50%
     */
    canPyroblast() {
        if (this.job === Follower.MAGE && this.rank >= 5 && RandomUtils.chance(this.skill2rate)) {
            this.useCount2++;
            this.increase2++;
            return true;
        }
        return false;
    }
    
    /**
     * 法师：寒冰护体（战斗技能，Rank 4解锁）
     * 降低伤害至30%
     */
    canHelpIceShield() {
        if (this.job === Follower.MAGE && this.rank >= 4 && RandomUtils.chance(this.skill1rate)) {
            return true;
        }
        return false;
    }
    
    // ========== 牧师技能 ==========
    
    /**
     * 牧师：恢复术（战斗技能1，Rank 3解锁）
     * 回复20%最大生命
     * @param {ChessProperty} prop 属性对象
     */
    checkHelpHeal(prop) {
        if (this.job === Follower.PRIEST && this.rank >= 3 && RandomUtils.chance(this.skill1rate)) {
            this.useCount1++;
            this.increase1++;
            // 恢复20%生命（使用heal方法，会自动处理上限和日志）
            const healAmount = Math.floor(prop.maxLife * 0.2);
            prop.heal(healAmount);
            console.log(`[Follower] 牧师恢复术触发，恢复${healAmount}生命`);
        }
    }
    
    /**
     * 牧师：绝望祷言（战斗技能，Rank 4解锁）
     * 濒死时避免死亡
     */
    checkAvoidDeath() {
        if (this.job === Follower.PRIEST && this.rank >= 4 && RandomUtils.chance(this.skill2rate)) {
            this.useCount2++;
            this.increase2++;
            return true;
        }
        return false;
    }
    
    // ========== 被动技能 ==========
    
    /**
     * 战士被动1：临时苦力（Rank 2解锁）
     * 负重+20%
     */
    canAddWeight() {
        return this.job === Follower.WARRIOR && this.rank >= 2;
    }
    
    /**
     * 战士被动2：强健体质（Rank 4解锁）
     * 免疫疾病
     */
    canNoSick() {
        return this.job === Follower.WARRIOR && this.rank >= 4;
    }
    
    /**
     * 法师被动1：漂浮术（Rank 2解锁）
     * 水上行走
     */
    canWaterRun() {
        return this.job === Follower.MAGE && this.rank >= 2;
    }
    
    /**
     * 牧师被动1：坚韧祷言（Rank 2解锁）
     * 耐力上限+20%
     */
    canAddStamina() {
        return this.job === Follower.PRIEST && this.rank >= 2;
    }
    
    /**
     * 牧师被动2：复活术（Rank 5解锁）
     * 死亡后原地复活
     */
    canRevive() {
        return this.job === Follower.PRIEST && this.rank >= 5;
    }
    
    /**
     * 盗贼被动1：追踪宝箱（Rank 2解锁）
     * 提高宝箱发现率
     */
    canDiscover() {
        return this.job === Follower.ROGUE && this.rank >= 2;
    }
    
    /**
     * 盗贼被动2：开锁（Rank 4解锁）
     * 解锁上锁宝箱
     */
    canUnlockBox() {
        return this.job === Follower.ROGUE && this.rank >= 4;
    }
    
    /**
     * 游侠被动1：搭帐篷（Rank 2解锁）
     * 户外休息完全恢复
     */
    canWildRest() {
        return this.job === Follower.RANGER && this.rank >= 2;
    }
    
    /**
     * 游侠被动2：步伐轻盈（Rank 4解锁）
     * 闪避+20%
     */
    canDodgeBonus() {
        return this.job === Follower.RANGER && this.rank >= 4;
    }
    
    // ========== 显示方法 ==========
    
    /**
     * 获取雇佣信息文本
     */
    printRecruitedInfo() {
        let text = '你雇到了一个';
        
        // 等级描述
        switch (this.rank) {
            case 1:
                text += '逗比的';
                break;
            case 2:
                text += '靠谱的';
                break;
            case 3:
                text += '专业的';
                break;
            case 4:
                text += this.sex === 0 ? '犀利的' : '能干的';
                break;
            case 5:
                text += this.sex === 0 ? '威猛的' : '飒爽的';
                break;
        }
        
        // 性别
        text += this.sex === 0 ? '汉子' : '妹子';
        
        return text;
    }
    
    /**
     * 获取性别代词
     */
    getSexString() {
        return this.sex === 0 ? '他' : '她';
    }
    
    /**
     * 获取关系描述
     */
    getRelationString() {
        return this.sex === 0 ? '基友' : '知己';
    }
    
    /**
     * 获取技能使用统计
     */
    printSkillUsedStat() {
        let text = `随从》${this.skillNames[0]}：${this.increase1}`;
        if (this.skillNames.length > 1) {
            text += `<br>随从》${this.skillNames[1]}：${this.increase2}`;
        }
        return text;
    }
    
    /**
     * 打印随从信息
     */
    printFollower() {
        let text = `${this.name}<br>`;
        text += this.sex === 0 ? '性别：男' : '性别：女';
        
        // 关系
        if (this._relationship === 100) {
            if (this.marriageType === 1) {
                text += '<br>关系：汝妻<br>';
            } else if (this.sex === 0) {
                text += '<br>关系：基友<br>';
            } else {
                text += '<br>关系：知己<br>';
            }
        } else {
            text += `<br>关系：${this._relationship}<br>`;
        }
        
        // 属性
        text += `生命+${this.life}<br>`;
        text += `攻击+${this.attack}<br>`;
        text += `防御+${this.defense}<br>`;
        
        // 技能（根据Rank显示已解锁的技能）
        // 技能解锁规则：
        // - 技能0（战斗1）: Rank 3+
        // - 技能1（战斗2）: Rank 5+
        // - 技能2（被动1）: Rank 2+
        // - 技能3（被动2）: Rank 4+
        const skillUnlockRanks = [3, 5, 2, 4];  // 对应4个技能的解锁等级
        
        for (let i = 0; i < this.skillNames.length; i++) {
            // 检查技能是否解锁
            if (this.rank < skillUnlockRanks[i]) {
                continue;  // 跳过未解锁的技能
            }
            
            // 显示技能
            if (i === 0) {
                text += `${this.skillNames[i]}（Lv.${this.skill1Lv}）<br>`;
                text += `<font color='#AAAAAA'>${this.skillIntros[i]}</font><br>`;
            } else if (i === 1) {
                text += `${this.skillNames[i]}（Lv.${this.skill2Lv}）<br>`;
                text += `<font color='#AAAAAA'>${this.skillIntros[i]}</font><br>`;
            } else {
                text += `${this.skillNames[i]}<br>`;
                text += `<font color='#AAAAAA'>${this.skillIntros[i]}</font><br>`;
            }
        }
        
        // 如果是Rank 1，提示无技能
        if (this.rank === 1) {
            text += `<font color='#888888'>【暂无技能】</font><br>`;
        }
        
        return text;
    }
    
    // ========== 存档相关 ==========
    
    /**
     * 获取存档数据
     */
    getRecord() {
        return {
            job: this.job,
            rank: this.rank,
            sex: this.sex,
            duration: this.duration,
            beginRound: this.beginRound,
            relationship: this._relationship,
            recruitFee: this.recruitFee,
            marriageType: this.marriageType,
            useCount1: this.useCount1,
            useCount2: this.useCount2,
            skill1Lv: this.skill1Lv,
            skill2Lv: this.skill2Lv,
            skill1rate: this.skill1rate,
            skill2rate: this.skill2rate,
            cooperate: this.cooperate
        };
    }
    
    /**
     * 从存档恢复随从
     * @param {Object} record 存档数据
     * @returns {Follower}
     */
    static getFollowerByRecord(record) {
        const follower = new Follower(record.job, record.rank, record.sex);
        follower.duration = record.duration;
        follower.beginRound = record.beginRound;
        follower._relationship = record.relationship;
        follower.recruitFee = record.recruitFee;
        follower.marriageType = record.marriageType;
        follower.useCount1 = record.useCount1;
        follower.useCount2 = record.useCount2;
        follower.skill1Lv = record.skill1Lv;
        follower.skill2Lv = record.skill2Lv;
        follower.skill1rate = record.skill1rate;
        follower.skill2rate = record.skill2rate;
        follower.cooperate = record.cooperate;
        return follower;
    }
    
    /**
     * 生成随机随从
     * @param {number} playerLevel 玩家等级
     * @param {number} specifiedRank 指定等级（0=自动）
     * @returns {Follower}
     */
    static generateFollower(playerLevel, specifiedRank = 0) {
        // 随机职业
        const job = RandomUtils.randInt(Follower.WARRIOR, Follower.RANGER);  // 优化：随机职业[1,5]
        
        // 随机性别
        const sex = RandomUtils.randInt(0, 1);  // 优化：性别[0,1]
        
        // 确定等级范围
        let maxRank = 1;
        if (!specifiedRank) {
            maxRank = Follower.getCurrentMaxRank(playerLevel);
            specifiedRank = 1 + Math.floor(Math.random() * maxRank);
        }
        
        return new Follower(job, specifiedRank, sex);
    }
    
    /**
     * 获取当前等级可雇佣的最高随从等级
     * @param {number} playerLevel 玩家等级
     * @returns {number}
     */
    static getCurrentMaxRank(playerLevel) {
        if (playerLevel === 90) {
            return 5;
        } else if (playerLevel >= 45) {
            return 4;
        } else if (playerLevel >= 30) {
            return 3;
        } else if (playerLevel >= 15) {
            return 2;
        }
        return 1;
    }
    
    /**
     * 获取等级的中文名称
     * @param {number} rank 等级（1-5）
     * @returns {string}
     */
    static getRankName(rank) {
        const rankNames = ['', '1级', '2级', '3级', '4级', '5级'];
        return rankNames[rank] || `${rank}级`;
    }
}

