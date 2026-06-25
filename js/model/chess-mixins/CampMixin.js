/**
 * 营地系统 Mixin
 * 从 Chess.js 拆分出的营地相关方法
 * 包含：随从雇佣、天赋学习、临时中介等
 * 
 * 拆分日期：2025-11-14
 */

const CampMixin = {
    /**
     * 营地事件（完整版）
     * 对应 AS3: triggeredCamp()
     */
    triggeredCamp() {
        // 检查是否可以与随从结婚（Stage 6）
        if (this.marriage.checkMarryWithFollower(this)) {
            return;
        }
        
        // 检查乌鸦王袭击（10%概率）
        if (this._checkCrowKingRaid()) {
            return;
        }
        
        this.addChat('这里聚集了形形色色的冒险者，有菜鸟儿也有老鸟，大多是为了找老板来的');
        
        const options = [];
        const values = [];
        
        // 雇佣新随从（总是有）
        options.push('雇佣新随从');
        values.push('recruit');
        
        // V1.1+: 雇佣旧相识功能（需要实现旧随从系统）
        // if (this.prop.haveOldFollowers()) {
        //     options.push('雇佣旧相识');
        //     values.push('recruitold');
        // }
        
        // V1.1+: 延长雇佣期功能（需要实现期限管理）
        // if (this.prop.canExtendFollowerDuration()) {
        //     options.push('延长雇佣期');
        //     values.push('recruitext');
        // }
        
        // 如果只有一个选项，检查特殊事件
        if (options.length === 1) {
            // 检查免费学习天赋
            if (this._checkFollowerTeachTalent()) {
                return;
            }
            // 检查临时中介赚钱
            if (this._checkFollowerAgency()) {
                return;
            }
        }
        
        options.push('继续前进');
        values.push('walk');
        
        // 使用内嵌链接方式（原版风格）
        this.board.chatPanel.addInlineOptions(
            '你打算干什么呢？',
            values,
            options,
            (value) => {
                this._handleCampChoice(value);
            }
        );
    },
    
    /**
     * 检查是否触发免费学习天赋
     * @returns {boolean}
     */
    _checkFollowerTeachTalent() {
        if (this._canLearnTalent()) {
            if (this.prop.gold < 1000 || this.prop.follower) {
                this.addChat('你刚好赶上有战斗大师免费传授天赋，每人限学1个，先到先得');
                this._learnTalentForFree();
                return true;
            }
        }
        return false;
    },
    
    /**
     * 检查是否可以学习天赋
     * @returns {boolean}
     */
    _canLearnTalent() {
        const availableTalent = Math.floor(this.prop.level / 5);
        const unlockedTalent = this.talent.getUnlockedNo();
        
        if (availableTalent === unlockedTalent) {
            return false;
        }
        
        const fee = this.talent.countTalentFee(availableTalent, unlockedTalent);
        if (this.prop.gold < fee) {
            return false;
        }
        
        return true;
    },
    
    /**
     * 免费学习一个天赋
     */
    _learnTalentForFree() {
        const availableTalent = Math.floor(this.prop.level / 5);
        const unlockedTalent = this.talent.getUnlockedNo();
        
        if (availableTalent > unlockedTalent) {
            const talentId = unlockedTalent + 1;
            this.talent.unlockTalent(talentId);
            const talentName = this.talent.getTalentName(talentId);
            this.addGreenChat(`你习得了新的天赋：${talentName}`);
        }
        
        this.board.roundEnd();
    },
    
    /**
     * 检查是否触发临时中介赚钱
     * @returns {boolean}
     */
    _checkFollowerAgency() {
        if (this.prop.level < 10 && this.prop.gold < 1000) {
            this.addChat('你虽无钱可雇却也没闲着，凭借口舌功夫了得你干起临时中介');
            const goldEarn = RandomUtils.randInt(1, 5) * 100;  // 优化：金钱[100,500]
            this.addChat(`尽管就挣了${goldEarn}金，但对于现在的你，每一金都弥足珍贵`);
            this.prop.addGold(goldEarn);
            this.board.roundEnd();
            return true;
        }
        return false;
    },
    
    /**
     * 处理营地选择
     * @param {string} choice 选择的选项
     */
    _handleCampChoice(choice) {
        const follower = this.prop.getFollower();
        
        switch (choice) {
            case 'recruit':
                // 雇佣随从
                this._showRecruitFollowerMenu();
                break;
                
            case 'info':
                // 查看随从信息
                if (follower) {
                    this.addChat(follower.printFollower());
                }
                this.board.roundEnd();
                break;
                
            case 'fire':
                // 解雇随从
                if (follower) {
                    this.addChat(`你解雇了${follower.name}`);
                    this.prop.fireFollower();
                }
                this.board.roundEnd();
                break;
                
            case 'walk':
                // 直接离开，开始投骰子
                this._handleForwardChoice('walk', false);
                break;
                
            default:
                this.board.roundEnd();
                break;
        }
    },
    
    /**
     * 显示雇佣随从菜单
     */
    _showRecruitFollowerMenu() {
        // 根据玩家等级确定可雇佣的最高随从等级
        const maxRank = Follower.getCurrentMaxRank(this.prop.level);
        
        this.addChat('营地中可以雇佣的随从：');
        
        const options = [];
        const values = [];
        
        // 生成3个随机随从供选择
        for (let i = 0; i < 3; i++) {
            const tempFollower = Follower.generateFollower(this.prop.level);
            const fee = 2000 + tempFollower.rank * 1000;
            const rankName = Follower.getRankName(tempFollower.rank);
            options.push(`${rankName}${tempFollower.name} (${fee}金)`);
            values.push(`recruit_${i}`);
            
            // 暂存随从信息
            if (i === 0) this._tempFollower1 = tempFollower;
            else if (i === 1) this._tempFollower2 = tempFollower;
            else this._tempFollower3 = tempFollower;
        }
        
        options.push('取消');
        values.push('cancel');
        
        // 使用内嵌链接方式（原版风格）
        this.board.chatPanel.addInlineOptions(
            '选择要雇佣的随从：',
            values,
            options,
            (value) => {
                this._handleRecruitChoice(value);
            }
        );
    },
    
    /**
     * 处理雇佣选择
     * @param {string} choice 选择的选项
     */
    _handleRecruitChoice(choice) {
        if (choice === 'cancel') {
            this.addChat('取消雇佣');
            this.board.roundEnd();
            return;
        }
        
        let selectedFollower = null;
        if (choice === 'recruit_0') selectedFollower = this._tempFollower1;
        else if (choice === 'recruit_1') selectedFollower = this._tempFollower2;
        else if (choice === 'recruit_2') selectedFollower = this._tempFollower3;
        
        if (!selectedFollower) {
            this.board.roundEnd();
            return;
        }
        
        // 计算雇佣费用
        const fee = 2000 + selectedFollower.rank * 1000;
        
        if (this.prop.gold < fee) {
            this.addChat(`雇佣费用不足，需要${fee}金`);
            this.board.roundEnd();
            return;
        }
        
        // 检查是否已有随从
        if (this.prop.follower) {
            this.addChat('你已经有一个随从了，必须先解雇才能雇佣新的');
            this.board.roundEnd();
            return;
        }
        
        // 雇佣成功
        this.prop.reduceGold(fee);
        selectedFollower.beginRound = this.board._round + 1;
        this.prop.changeFollower(selectedFollower);
        
        this.addGreenChat(`成功雇佣${selectedFollower.name}！`);
        this.addChat(selectedFollower.printRecruitedInfo());
        
        this.finishAction();
    },
    
    // 检查乌鸦王袭击 - V1.0.6: 只能通过喝酒线索触发（特殊Boss）
    _checkCrowKingRaid(mustFlag = false) {
        // V1.0.6: 只能通过线索触发，不再随机
        const hasClue = this.rumorSystem && this.rumorSystem.hasClue(RumorSystem.CLUE_TYPES.CROW_KING);
        
        if (hasClue || mustFlag) {  // 特殊Boss：只能通过线索或强制触发
            // V1.0.6: 线索触发提示
            if (hasClue) {
                this.addGreenChat('【 线索触发 】');
                this.addChat('你想起酒馆打听到的消息，乌鸦王果然在这里！');
                this.rumorSystem.useClue(RumorSystem.CLUE_TYPES.CROW_KING);
            }
            
            this.addChat('一只乌鸦王在营地上空盘旋，伺机而动。据传只要被它掳走就会变成鸦人，如此邪恶的怪物你无法放任不管');
            
            const enemy = Enemy.createWithLevelOffset(this.prop.level, 5, Enemy.ELITE, 0, true);
            this.startBattleWith(enemy, {
                onWin: () => {
                    this.runningStat.killCrowCount++;
                    this.addChat('你击败乌鸦王的消息很快传遍整个营地');
                    this.addGreenChat('今后在这里雇佣的新随从初始亲密更高');
                    DiaryPanel.getInstance().addDiary('你从乌鸦王爪中保护了冒险者营地');
                }
            });
            
            return true;
        }
        return false;
    }
};

