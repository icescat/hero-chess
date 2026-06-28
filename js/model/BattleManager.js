/**
 * 战斗管理器（完整版 - Phase 7-A）
 * 对应 AS3: csh.model.BattleManager
 * 
 * 功能：
 * 1. 回合制战斗流程
 * 2. 伤害计算（考虑攻防、暴击、闪避）
 * 3. 随从技能集成（战斗辅助）
 * 4. 属性倍率系统（濒死奋战、准备充分等）
 * 5. 战斗统计和日志
 * 6. 战利品发放
 */

class BattleManager {
    // 战斗结果常量
    static RESULT_IN_PROGRESS = 0;  // 战斗中
    static RESULT_WIN = 1;          // 胜利
    static RESULT_LOSE = 2;         // 失败
    static RESULT_TIMEOUT = 3;      // 超时
    
    /**
     * 构造函数
     * @param {Chess} chess - 玩家棋子
     */
    constructor(chess) {
        this.chess = chess;
        this.chessProp = chess.prop;
        this.chessTalent = chess.talent;  // 天赋系统
        
        // 战斗状态 - 优化：使用GameConstants
        this._battleInProgress = false;
        this._round = 0;
        this._maxRound = GameConstants.BATTLE_MAX_ROUNDS;
        this._result = BattleManager.RESULT_IN_PROGRESS;
        this._enemy = null;
        
        // 战斗统计
        this._stat = this._createEmptyStat();
        
        // 战斗日志
        this._battleLog = [];
        
        // 属性倍率
        this._attrMul = 1;
        
        // 随从
        this._follower = null;
        
        // 战斗开始时的生命百分比
        this._beginLifePercent = 1;
        
        console.log('[BattleManager] 战斗管理器已创建');
    }
    
    /**
     * 创建空统计对象
     */
    _createEmptyStat() {
        return {
            totalDamage: 0,      // 总伤害
            totalHurt: 0,        // 总受伤
            rounds: 0,           // 回合数
            critical: 0,         // 暴击次数
            dodge: 0,            // 闪避次数
            counter: 0,          // 反击次数
            combo: 0,            // 连击次数
            miss: 0,             // 未命中次数
            defend: 0,           // 防御次数
            expose: 0,           // 破甲次数
            execute: 0,          // 斩杀次数
            fury: 0,             // 狂怒次数
            wusuo: 0,            // 奥义次数
            staToHp: 0,          // 耐力分流次数
            pursuit: 0,          // 乘胜追击次数
            awaken: 0,           // 觉醒次数
            money: 0             // 砸钱金额
        };
    }
    
    /**
     * 是否战斗中
     */
    get battleInProgress() {
        return this._battleInProgress;
    }
    
    /**
     * 战斗结果
     */
    get result() {
        return this._result;
    }
    
    /**
     * 战斗统计
     */
    get stat() {
        return this._stat;
    }
    
    /**
     * 战斗日志
     */
    get battleLog() {
        return this._battleLog;
    }
    
    /**
     * 瞬间获胜（几乎必胜buff使用）
     * 直接设置胜利结果，复用结算逻辑
     * @param {Enemy} enemy - 敌人对象
     * @returns {number} 战斗结果（RESULT_WIN）
     */
    instantWin(enemy, isDungeonBattle = false) {
        console.log(`[BattleManager] 瞬间获胜: Lv${this.chessProp.level}玩家 vs ${enemy.getDescription()}`);
        
        // 初始化战斗（复制battleWith的初始化逻辑）
        this._enemy = enemy;
        this._round = 1;
        this._result = BattleManager.RESULT_WIN;
        this._battleInProgress = true;
        this._battleLog = [];
        this._stat = this._createEmptyStat();
        this._stat.rounds = 1;
        this._isDungeonBattle = isDungeonBattle;
        
        // 获取随从
        this._follower = this.chessProp.getFollower();
        
        // 敌人直接死亡
        this._enemy.curLife = 0;
        
        // 调用统一结算逻辑
        this._handleBattleResult();
        
        return this._result;
    }
    
    /**
     * 开始战斗
     * @param {Enemy} enemy - 敌人
     * @returns {number} 战斗结果（WIN/LOSE/TIMEOUT）
     */
    battleWith(enemy, isDungeonBattle = false) {
        console.log(`[BattleManager] 开始战斗: Lv${this.chessProp.level}玩家 vs ${enemy.getDescription()} ${isDungeonBattle ? '(副本)' : ''}`);
        
        this._enemy = enemy;
        this._round = 0;
        this._result = BattleManager.RESULT_IN_PROGRESS;
        this._battleInProgress = true;
        this._battleLog = [];
        this._stat = this._createEmptyStat();
        this._isDungeonBattle = isDungeonBattle;
        
        // 根据敌人类型设置最大回合数
        this._maxRound = (enemy.type === Enemy.BOSS || enemy.type === Enemy.LEGEND) ? 50 : 30;
        
        // 获取随从
        this._follower = this.chessProp.getFollower();
        
        // 记录开始时的生命百分比
        this._beginLifePercent = this.chessProp.curLife / this.chessProp.maxLife;
        
        // 计算属性倍率
        this._calculateAttrMultiplier();
        
        // 战斗开始（AS3原版：调用方已显示"遭遇"消息，这里不重复）
        
        // 随从开始战斗
        if (this._follower) {
            this._follower.startBattle();
            this.chess.addChat(`${this._follower.name}与你并肩作战`);
            
            // 游侠：步伐轻盈（闪避+20%）
            if (this._follower.canDodgeBonus()) {
                this.chessTalent.actualDodge += 0.2;
                console.log(`[BattleManager] 游侠步伐轻盈，闪避+20%`);
            }
        }
        
        // 乘胜追击（连续战斗时回复生命）
        if (this.chessTalent.victoryPursuit(this.chessProp)) {
            this.chess.addGreenChat('乘胜追击！连续战斗回复生命');
        }
        
        // 嘴炮天赋判定
        if (this.chessTalent.haveTalent(Talent.TALK)) {
            const talkResult = this.chessTalent.checkTalkAttack(this.chess);
            if (talkResult >= 0) {
                // 0: 无效果
                // 1: 敌人破绽（降低防御）
                // 2: 敌人自杀（直接胜利）
                // 3: 敌人激怒（提升攻击）
                if (talkResult === 1) {
                    this._enemy.defense = Math.floor(this._enemy.defense * 0.5);
                } else if (talkResult === 2) {
                    this._result = BattleManager.RESULT_WIN;
                    this._battleInProgress = false;
                    this._handleBattleResult();
                    return this._result;
                } else if (talkResult === 3) {
                    this._enemy.attack = Math.floor(this._enemy.attack * 1.5);
                }
            }
        }
        
        // 回合循环
        while (this._round <= this._maxRound && this._result === BattleManager.RESULT_IN_PROGRESS) {
            this._stepRound();
        }
        
        // 战斗结束
        this._battleInProgress = false;
        
        // 重置天赋状态
        this.chessTalent.resetDurationTalent();
        
        // 处理战斗结果
        this._handleBattleResult();
        
        return this._result;
    }
    
    /**
     * 计算属性倍率
     */
    _calculateAttrMultiplier() {
        this._attrMul = 1;
        
        const isBoss = this._enemy.type === Enemy.BOSS || this._enemy.type === Enemy.LEGEND;
        
        if (!isBoss) {
            return;
        }
        
        // 濒死奋战（生命低于30%）
        if (this._beginLifePercent < 0.3) {
            this._attrMul = 2;
            this.chess.addChat('由于濒临死亡你决定奋起一搏');
        }
        // 准备充分（满血+高耐力+有Buff）
        else if (this._beginLifePercent === 1 && this.chessProp.stamina > this.chessProp.maxStamina * 0.8) {
            // 检查是否有有益Buff
            const buffs = this.chessProp.getBuffs();
            const hasBuff = buffs && buffs.length > 0 && buffs.some(b => !b.isDebuff);
            if (hasBuff) {
                this._attrMul = 2;
                this.chess.addChat('由于准备充分你感到胸有成竹');
            }
        }
        
        // 随从鼓舞（特殊BOSS战）
        if (this._follower && this._enemy.race >= 5) {
            if (this._follower.canInspire(this.chess)) {
                this._attrMul = this._follower.married ? (this._attrMul + 1) : (this._attrMul + 0.5);
            }
        }
        
        if (this._attrMul > 1) {
            console.log(`[BattleManager] 属性倍率: ${this._attrMul}x`);
        }
    }
    
    /**
     * 执行一个回合
     */
    _stepRound() {
        this._round++;
        this._stat.rounds = this._round;
        
        // 检查持续效果天赋（狂怒、觉醒）
        this.chessTalent.checkDurationTalent(this._round, this._stat);
        
        // 玩家回合
        this._playerTurn();
        
        // 检查战斗是否结束
        if (this._result !== BattleManager.RESULT_IN_PROGRESS) {
            return;
        }
        
        // 敌人回合
        this._enemyTurn();
        
        // 检查超时（仅在战斗未分出胜负时）
        if (this._round >= this._maxRound && this._result === BattleManager.RESULT_IN_PROGRESS) {
            this._result = BattleManager.RESULT_TIMEOUT;
        }
    }
    
    /**
     * 玩家回合
     */
    _playerTurn() {
        // 命中判定（使用天赋系统）
        if (!this.chessTalent.canHit()) {
            this._missHit = true;
            this._stat.miss++;
            this._addLog('你的攻击落空了！');
            return;
        }
        
        this._missHit = false;
        
        // 计算基础伤害
        let damage = 0;
        
        // 破甲判定
        if (this.chessTalent.canExposeArmor()) {
            // 破甲：无视防御
            damage = this.chessProp.attack;
            this._stat.exposearmor = (this._stat.exposearmor || 0) + 1;
            this._addLog('破甲！');
        } else {
            // 正常：攻击力-敌人防御
            damage = Math.max(
                this.chessProp.attack * 0.1,
                this.chessProp.attack - this._enemy.defense
            );
        }
        
        // 应用属性倍率和天赋攻击倍率
        damage *= this._attrMul;
        damage *= this.chessTalent.atkMul;
        
        // 奥义伤害（×6）
        const wusuoDamage = damage * 6;
        
        // 金钱攻击（对非不死敌人）
        const moneyDamage = (this._enemy.race !== 3) ? 
            this.chessTalent.checkMoneyAttack(this.chessProp) : 0;
        if (moneyDamage > 0) {
            this._stat.money = (this._stat.money || 0) + moneyDamage;
            this._addLog(`金钱攻击！${moneyDamage}点伤害`);
        }
        
        // 连击判定
        let comboDamage = 0;
        if (this.chessTalent.canCombo()) {
            comboDamage = damage;
            this._stat.combo = (this._stat.combo || 0) + 1;
            this._addLog('连击！');
        }
        
        // 随从技能标记（用于判断是否跳过天赋暴击）
        let followerCritical = false;
        
        // 随从技能处理
        if (this._follower) {
            // 盗贼：背刺（无视防御×2）
            if (this._follower.canBackstab()) {
                damage = this.chessProp.attack * this._attrMul * this.chessTalent.atkMul * 2;
                this.chess.addChat(`${this._follower.name}背刺！`);
            }
            // 游侠：瞄准射击（必定暴击）
            else if (this._follower.canHelpCritical()) {
                damage *= 2;
                followerCritical = true;
                this._stat.critical++;
                this.chess.addChat(`${this._follower.name}瞄准射击！`);
            }
            // 法师：炎爆术（×2伤害，降低敌人防御）
            else if (this._follower.canPyroblast()) {
                damage *= 2;
                this._enemy.defense = Math.floor(this._enemy.defense * 0.5);
                this.chess.addChat(`${this._follower.name}炎爆术！`);
            }
            // 战士：战吼（×1.5伤害）
            else if (this._follower.canWarCry()) {
                damage = Math.ceil(damage * 1.5);
                this.chess.addChat(`${this._follower.name}战吼！`);
            }
            // 法师：闪电术（×1.5伤害）
            else if (this._follower.canLightning()) {
                damage = Math.ceil(damage * 1.5);
                this.chess.addChat(`${this._follower.name}闪电术！`);
            }
            
            // 游侠：乱射（额外攻击2-4次）
            if (this._follower.canCombo()) {
                const extraHits = RandomUtils.randInt(2, 4);  // 优化：2-4次额外攻击
                comboDamage += damage * extraHits;
                this._stat.combo++;
                this.chess.addChat(`${this._follower.name}乱射${extraHits}次！`);
            }
            
            // 合体技（×6伤害）
            if (this._follower.canCooperate(this.chess, this._round)) {
                damage *= 6;
            }
        }
        
        // 最后一回合×3伤害
        if (this._round === this._maxRound) {
            damage *= 3;
            this._addLog('最后一击！');
        }
        
        // 天赋暴击判定（随从没有暴击时才判定）
        if (!followerCritical && this.chessTalent.canCritical()) {
            damage *= 2;
            this._stat.critical++;
            this._addLog('暴击！');
        }
        
        // 累加连击伤害
        damage += comboDamage;
        
        // 斩杀判定（敌人濒死时×3）
        if (this._enemy.isNearDeath && this.chessTalent.canExecute()) {
            damage *= 3;
            this._stat.execute = (this._stat.execute || 0) + 1;
            this._addLog('斩杀！');
        }
        // 奥义判定（没触发斩杀时才判定）
        else if (this.chessTalent.canWusuo()) {
            damage += wusuoDamage;
            this._stat.wusuo = (this._stat.wusuo || 0) + 1;
            this._addLog('奥义！');
        }
        
        // 累加金钱攻击伤害
        damage += moneyDamage;
        
        this._addLog(`造成${Math.floor(damage)}点伤害`);
        
        // 造成伤害
        this._enemy.takeDamage(Math.floor(damage));
        this._stat.totalDamage += Math.floor(damage);
        
        // 检查敌人是否死亡
        if (this._enemy.isDead) {
            this._result = BattleManager.RESULT_WIN;
        }
    }
    
    /**
     * 敌人回合
     */
    _enemyTurn() {
        // 闪避判定（使用天赋系统）
        if (this.chessTalent.canDodge()) {
            this._stat.dodge++;
            this._addLog('你闪避了攻击！');
            
            // 反击判定（需要反击天赋）
            if (this.chessTalent.canCounter()) {
                let counterDamage = Math.max(
                    this.chessProp.attack * 0.1,
                    this.chessProp.attack - this._enemy.defense
                );
                counterDamage *= this._attrMul;
                counterDamage *= this.chessTalent.atkMul;
                
                // 反击可以暴击
                if (this.chessTalent.canCritical()) {
                    counterDamage *= 2;
                    this._stat.critical++;
                    this._addLog('反击暴击！');
                }
                
                this._enemy.takeDamage(Math.floor(counterDamage));
                this._stat.totalDamage += Math.floor(counterDamage);
                this._stat.counter = (this._stat.counter || 0) + 1;
                this._addLog(`反击！造成${Math.floor(counterDamage)}点伤害`);
                
                // 检查敌人是否死亡
                if (this._enemy.isDead) {
                    this._result = BattleManager.RESULT_WIN;
                }
            }
            return;
        }
        
        // 防御判定（使用天赋系统）
        let defended = false;
        if (this.chessTalent.canDefense()) {
            defended = true;
            this._addLog('你防御了攻击！');
        }
        
        // 计算玩家防御力
        let defense = this.chessProp.defense * this.chessTalent.defMul;
        defense *= this._attrMul;
        
        // 计算敌人伤害
        let damage = Math.max(
            this._enemy.attack * 0.1,
            this._enemy.attack - defense
        );
        
        // 如果防御成功，伤害降低
        if (defended) {
            damage = Math.floor(damage * (1 - this.chessTalent.defendrate));
        }
        
        // 如果玩家miss了，敌人伤害×2
        if (this._missHit) {
            damage *= 2;
            this._addLog('攻击落空后破绽百出！');
        }
        
        // 敌人暴击
        if (this._enemy.canCritical) {
            damage *= 2;
            this._addLog(`敌人暴击！`);
        }
        
        // 敌人濒死一击（生命<30%时×3伤害）
        if (this._enemy.canDeathAttack) {
            damage *= 3;
            this._addLog('敌人的濒死一击！');
        }
        
        // 随从防御技能
        if (this._follower) {
            damage = this._applyFollowerDefenseSkills(damage);
        }
        
        damage = Math.floor(damage);
        this._addLog(`受到${damage}点伤害`);
        
        // 玩家受伤
        const originalLife = this.chessProp.curLife;
        this.chessProp.takeDamage(damage);
        this._stat.totalHurt += damage;
        
        // 检查玩家是否死亡（生命<=0）
        if (this.chessProp.curLife <= 0) {
            console.log('[BattleManager] 检测到玩家生命<=0，开始救命检查');
            
            // 救命手段1：牧师恢复术（优先级最高，战斗中自动治疗）
            if (this._follower) {
                this._follower.checkHelpHeal(this.chessProp);
                // 如果治疗后生命>0，重置死亡标志，继续战斗
                if (this.chessProp.curLife > 0) {
                    this.chessProp._isDead = false;
                    console.log('[BattleManager] 牧师恢复术救命成功，继续战斗');
                    return;
                }
            }
            
            // 救命手段2：耐力分流（濒死时用耐力换生命）
            if (this.chessTalent.staminaToLife(this.chessProp)) {
                this._addLog('耐力分流！用耐力换取生命');
                this._stat.staToHp++;
                this.chessProp._isDead = false;  // 重置死亡标志
                return;
            }
            
            // 救命手段3：觉醒（濒死时攻防激增）
            if (this.chessTalent.checkAwake(this._round, this.chessProp)) {
                this._addLog('觉醒！攻击和防御大幅提升！');
                this._stat.awaken++;
                this.chessProp._isDead = false;  // 重置死亡标志
                return;
            }
            
            // 救命手段4：牧师绝望祷言（避免死亡）
            if (this._follower && this._follower.checkAvoidDeath()) {
                this.chessProp._curLife = Math.floor(this.chessProp.maxLife * 0.2);
                this.chess.addChat(`${this._follower.name}的绝望祷言救了你一命！`);
                this.chessProp._isDead = false;  // 重置死亡标志
                return;
            }
            
            // 救命手段5：灵魂石复活（战斗中满血复活，战斗继续）- 遗物，一次性
            if (this.chessProp.checkSoulstoneRevive()) {
                // 延长战斗时间（AS3: round += maxRound, maxRound *= 2）
                this._round += this._maxRound;
                this._maxRound *= 2;
                this.chessProp._isDead = false;  // 重置死亡标志
                
                console.log(`[BattleManager] 灵魂石复活触发 - 满血:${this.chessProp._curLife}, 战斗延长至${this._maxRound}回合`);
                return;  // 战斗继续
            }
            
            // 所有救命手段都失败，玩家死亡
            this._result = BattleManager.RESULT_LOSE;
            console.log('[BattleManager] 所有救命手段失败，玩家死亡，设置结果为RESULT_LOSE');
            
            // V1.0.5: 立即设置等待复活标志，确保自动游戏能检测到
            this.chess._waitingForRevive = true;
            
            // ⚠️ 不在这里调用 chess.dead()，让战斗正常结束
            // 死亡处理会在 _handleBattleResult() 中统一调用，保证信息顺序正确
            
            return;  // 立即返回，中断战斗循环
        }
    }
    
    /**
     * 应用随从防御技能
     * @param {number} damage - 敌人伤害
     * @returns {number} 修正后伤害
     */
    _applyFollowerDefenseSkills(damage) {
        let finalDamage = damage;
        
        // 战士：复仇（根据受伤反击50%）
        if (this._follower.canRevenge()) {
            const revengeDamage = Math.floor(damage * 0.5);
            this._enemy.takeDamage(revengeDamage);
            this.chess.addChat(`${this._follower.name}复仇！造成${revengeDamage}伤害`);
        }
        
        // 法师：寒冰护体（降低伤害至30%）
        if (this._follower.canHelpIceShield()) {
            finalDamage = Math.floor(finalDamage * 0.3);
            this.chess.addChat(`${this._follower.name}寒冰护体！`);
        }
        
        return finalDamage;
    }
    
    /**
     * 处理战斗结果
     */
    _handleBattleResult() {
        let resultText = '';
        
        switch (this._result) {
            case BattleManager.RESULT_WIN:
                // 生成丰富的胜利描述（对应AS3的endRound）
                resultText = this._generateVictoryText();
                this.chess.addChat(resultText);
                
                // 更新战斗统计（Phase 7-C）
                if (this.chess.runningStat) {
                    this.chess.runningStat.addWinCount();
                    this.chess.runningStat.updateDpsAndDpb(
                        Math.floor(this._stat.totalDamage / this._stat.rounds),
                        this._stat.totalDamage
                    );
                }
                
                // 记录重要战斗到日记（Phase 7-D）
                const isBoss = this._enemy.type === Enemy.BOSS || this._enemy.type === Enemy.LEGEND;
                if (isBoss) {
                    const diary = DiaryPanel.getInstance();
                    if (diary) {
                        diary.addDiary(`你击败了${this._enemy.getName()}，耗时${this._stat.rounds}回合`, true);
                    }
                }
                
                // 随从结束战斗（增加关系）
                if (this._follower) {
                    this._follower.endBattle(this._stat.rounds, isBoss);
                }
                
                // 战斗统计（先显示战斗结束信息）
                this.chess.addChat(`战斗结束，耗时${this._stat.rounds}回合`);
                this.chess.addChat(`<a href="event:stat" style="color: #FFFF00; cursor: pointer;">点击查看战斗统计</a>`);
                
                // 计算战利品
                const expGained = this._applyExpMultiplier(this._enemy.exp);
                const goldGained = this._applyLootMultiplier(this._enemy.gold);
                const fameGained = this.chessProp.getFameAdd(this._enemy.fame);
                // 盗贼：偷窃（战利品×1.25）
                let stuffBase = this._enemy.stuff;
                let rarestuffBase = this._enemy.rarestuff;
                let rubbishBase = this._enemy.rubbish;
                
                if (this._follower && this._follower.canSteal()) {
                    stuffBase = Math.ceil(stuffBase * 1.25);
                    rarestuffBase = Math.ceil(rarestuffBase * 1.25);
                    rubbishBase = Math.ceil(rubbishBase * 1.25);
                    this.chess.addChat(`${this._follower.name}偷窃！战利品+25%`);
                }
                
                const stuffGained = this.chessProp.getStuffAdd(stuffBase);
                const rarestuffGained = this.chessProp.getRareAdd(rarestuffBase);
                
                // 显示战利品信息（原版AS3格式：第一行经验/金钱/名声，第二行材料）
                // 只在有战利品时才显示
                if (expGained > 0 || goldGained > 0 || fameGained > 0 || stuffGained > 0 || rarestuffGained > 0 || this._enemy.rubbish > 0) {
                    let lootText = '';
                    
                    // 第一行：经验/金钱/名声
                    if (expGained > 0) {
                        lootText += `经验+${expGained}`;
                    }
                    if (goldGained > 0) {
                        lootText += (lootText ? ' ' : '') + `金钱+${goldGained}`;
                    }
                    if (fameGained > 0) {
                        lootText += (lootText ? ' ' : '') + `名声+${fameGained}`;
                    }
                    
                    // 材料单独一行（如果不是坦克型怪物且不是无材料怪物）
                    if (this._enemy.race !== 3 && !this._enemy.nostuff) {
                        let materialText = '';
                        if (rubbishBase > 0) {
                            materialText += `垃圾+${rubbishBase} `;
                        }
                        if (stuffGained > 0) {
                            materialText += `基础锻材+${stuffGained} `;
                        }
                        if (rarestuffGained > 0) {
                            materialText += `稀有锻材+${rarestuffGained}`;
                        }
                        
                        if (materialText) {
                            lootText += '<br>' + materialText.trim();
                        }
                    }
                    
                    if (lootText) {
                        this.chess.addChat(lootText);
                    }
                }
                
                // 发放战利品（注意：addExp会触发升级检查，所以要在显示完战利品信息后再调用）
                this.chessProp.addExp(expGained);
                this.chessProp.addGold(goldGained);
                this.chessProp.fame += fameGained;
                this.chessProp.stuff += stuffGained;
                this.chessProp.rarestuff += rarestuffGained;
                this.chessProp.rubbish += rubbishBase;
                
                // 副本进度更新（如果是副本战斗）
                if (this._isDungeonBattle && this.chess._cell) {
                    const enemyType = this._enemy.type;
                    this.chess._cell.updateDungeonProgress(enemyType, this.chess);
                }
                
                break;
                
            case BattleManager.RESULT_LOSE:
                // 先显示战斗结果和统计
                this.chess.addChat(`战斗结束，耗时${this._stat.rounds}回合`);
                this.chess.addChat(`<a href="event:stat" style="color: #FFFF00; cursor: pointer;">点击查看战斗统计</a>`);
                
                // 更新战斗统计
                if (this.chess.runningStat) {
                    this.chess.runningStat.addLoseCount();
                }
                
                // 显示死亡提示
                this.chess.addRedChat('你体力不支最终倒下...');
                
                // 显示复活按钮（红色但不加粗）
                this.chess.addChat(`<a href="event:revive" style="color: #FF0000; cursor: pointer;">点击复活</a>`);
                
                // V1.0.5: 自动游戏模式下，调用ChessAI自动处理复活
                if (ChessAI.enableAuto) {
                    ChessAI.getInstance().autoHandleRevive(this.chess);
                }
                break;
                
            case BattleManager.RESULT_TIMEOUT:
                resultText = this._generateTimeoutText();
                this.chess.addChat(resultText);
                this.chess.addChat(`战斗结束，耗时${this._stat.rounds}回合`);
                this.chess.addChat(`<a href="event:stat" style="color: #FFFF00; cursor: pointer;">点击查看战斗统计</a>`);
                break;
        }
        
        console.log(`[BattleManager] ${resultText}`);
        console.log(`[BattleManager] 统计:`, this._stat);
        
        this._addLog(resultText);
    }
    
    /**
     * 生成胜利描述文本（对应AS3的endRound）
     * @returns {string}
     */
    _generateVictoryText() {
        // 濒死反杀
        if (this._beginLifePercent < 0.3) {
            return '你险中求胜成功反杀敌人';
        }
        // 秒杀
        else if (this._stat.rounds === 1) {
            return '你一招就把敌人秒了';
        }
        // 快速击杀
        else if (this._stat.rounds < 5) {
            return '你三下五除二就灭了敌人';
        }
        // 艰难取胜（受伤>80%生命）
        else if (this._stat.totalHurt / this.chessProp.maxLife > 0.8) {
            return '你使出浑身解数艰难取胜';
        }
        // 正常胜利
        else {
            return '你稳扎稳打成功击杀敌人';
        }
    }
    
    /**
     * 生成失败描述文本
     * @returns {string}
     */
    _generateDefeatText() {
        // 濒死失败
        if (this._beginLifePercent < 0.3) {
            return '你欲置之死地可惜没有后生';
        }
        // 被秒杀
        else if (this._stat.rounds === 1) {
            return '你被一招放倒简直耻辱';
        }
        // 快速失败
        else if (this._stat.rounds < 5) {
            return '敌人太强你绝壁不是对手';
        }
        // 顽抗失败
        else if (this._stat.totalHurt / this.chessProp.maxLife > 0.8) {
            return '虽然你负隅顽抗但还是跪了';
        }
        // 大意失败
        else {
            return '你大意落败不禁流下悔恨的泪水';
        }
    }
    
    /**
     * 生成超时描述文本
     * @returns {string}
     */
    _generateTimeoutText() {
        // 特殊种族（坦克型敌人）
        if (this._enemy.race === 3) {
            return '你攻击乏力秒伤不足还是再练练吧';
        }
        // 普通超时
        else {
            return '你与敌人僵持不下，只好暂时撤退';
        }
    }
    
    /**
     * 应用经验倍率（Buff加成）
     * @param {number} baseExp - 基础经验
     * @returns {number}
     */
    _applyExpMultiplier(baseExp) {
        const multiplier = this.chessProp.getExpMultiplier();
        return Math.floor(baseExp * multiplier);
    }
    
    /**
     * 应用战利品倍率（Buff加成）
     * @param {number} baseLoot - 基础战利品
     * @returns {number}
     */
    _applyLootMultiplier(baseLoot) {
        const multiplier = this.chessProp.getLootMultiplier();
        return Math.floor(baseLoot * multiplier);
    }
    
    /**
     * 添加战斗日志
     * @param {string} message - 日志消息
     */
    _addLog(message) {
        this._battleLog.push(message);
    }
    
    /**
     * 获取战斗日志文本
     * @returns {string}
     */
    getBattleLogText() {
        return this._battleLog.join('\n');
    }
    
    /**
     * 获取战斗统计字符串
     * 对应 AS3: getStatString()
     * @returns {string} HTML格式的统计信息
     */
    getStatString() {
        let result = '';
        
        // 平均伤害
        const avgDamage = Math.round(this._stat.totalDamage / this._stat.rounds);
        result += `每回合平均伤害：${avgDamage}<br>`;
        
        // 累计数据
        result += `累计造成伤害：${this._stat.totalDamage}<br>`;
        result += `累计受到伤害：${this._stat.totalHurt}<br>`;
        
        // 战斗事件统计
        result += `未命中：${this._stat.miss}<br>`;
        result += `防御：${this._stat.defend}<br>`;
        result += `暴击：${this._stat.critical}<br>`;
        result += `闪避：${this._stat.dodge}<br>`;
        result += `反击：${this._stat.counter}<br>`;
        result += `破甲：${this._stat.expose}<br>`;
        result += `连击：${this._stat.combo}<br>`;
        result += `斩杀：${this._stat.execute}<br>`;
        result += `狂怒：${this._stat.fury}<br>`;
        result += `奥义：${this._stat.wusuo}<br>`;
        result += `耐力分流：${this._stat.staToHp}<br>`;
        result += `乘胜追击：${this._stat.pursuit}<br>`;
        result += `觉醒：${this._stat.awaken}<br>`;
        
        // 砸钱统计
        if (this._stat.money > 0) {
            result += `你为本次战斗砸了${this._stat.money}金<br>`;
        }
        
        // 随从技能统计
        if (this._follower) {
            result += this._follower.printSkillUsedStat() + '<br>';
        }
        
        return result;
    }
    
    /**
     * 保存战斗记录到存档对象（与 loadWinsRecord 对称）
     * @param {Object} info - getChessInfo 收集的存档对象
     */
    checkSaveWinsRecord(info) {
        info.winsRecord = this._stat;
    }

    /**
     * 从存档恢复战斗记录
     * @param {Object} record - winsRecord 数据
     */
    loadWinsRecord(record) {
        if (record) {
            this._stat = record;
        }
    }

    /**
     * 清理资源
     */
    dispose() {
        this.chess = null;
        this.chessProp = null;
        this._enemy = null;
        this._follower = null;
        this._battleLog = [];
    }
}
