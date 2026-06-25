/**
 * 码头系统 Mixin
 * 从 Chess.js 拆分出的码头相关方法
 * 包含：钓鱼、坐船、投资建设、贸易等
 * 
 * 拆分日期：2025-11-14
 */

const DockMixin = {
    triggeredDock() {
        const prevProgress = this._cell.extraInfo.progress;
        this._cell.updateProgress(this.board._round + 1);
        const currentProgress = this._cell.extraInfo.progress;
        
        if (prevProgress !== currentProgress && currentProgress === this._cell.extraInfo.maxProgress) {
            this.prop.fame += 30;
            this.addGreenChat('码头的重建工作已完成，名声+30');
            this.runningStat.dockCount++;
            DiaryPanel.getInstance().addDiary(`你投资重建的第${this.runningStat.dockCount}座码头落成`, true);
        }
        
        switch (currentProgress) {
            case 0:
                this.addChat('虽然码头废弃已久，但仍依稀可见当年的繁忙景象');
                this.board.chatPanel.addInlineOptions('你打算干什么呢？', ['fish', 'sail', 'invest', 'walk'], ['钓鱼', '自制木筏出海', '投资重建（50000金）', '继续前进'], this._handleDockChoice.bind(this));
                break;
            case 1:
                this.addChat('码头的重建工作正在如火如荼的进行中，追加投资可以加快进度');
                this.addExpandedChat('重建进度');
                this.board.chatPanel.addInlineOptions('你打算干什么呢？', ['fish', 'sail', 'invest', 'walk'], ['钓鱼', '自制木筏出海', '追加投资（20000金）', '继续前进'], this._handleDockChoice.bind(this));
                break;
            case 2:
            case 3:
                this.addChat('码头的重建工作正在如火如荼的进行中，追加投资可以加快进度');
                this.addExpandedChat('重建进度');
                this.board.chatPanel.addInlineOptions('你打算干什么呢？', ['fish', 'goto', 'invest', 'walk'], ['钓鱼', '坐船', '追加投资（20000金）', '继续前进'], this._handleDockChoice.bind(this));
                break;
            case 4:
                this.addChat('码头的重建已进入尾声,不日即可竣工');
                this.addExpandedChat('重建进度');
                this.board.chatPanel.addInlineOptions('你打算干什么呢？', ['fish', 'goto', 'trade', 'walk'], ['钓鱼', '坐船', '贸易', '继续前进'], this._handleDockChoice.bind(this));
                break;
            case 5:
            default:
                const dividend = RandomUtils.randInt(1, 6) * 5000;  // 优化：分红[5000,30000]
                this.prop.addGold(dividend);
                this.addGreenChat(`你获得${this._cell.cellName}分红，金钱+${dividend}`);
                this.addExpandedChat('重建进度');
                this.board.chatPanel.addInlineOptions('你打算干什么呢？', ['fish', 'goto', 'trade', 'walk'], ['钓鱼', '坐船', '贸易', '继续前进'], this._handleDockChoice.bind(this));
                break;
        }
    },
    
    _handleDockChoice(choice) {
        switch (choice) {
            case 'fish': this._fishAtDock(); break;
            case 'sail':
            case 'goto': this._gotoByShip(); break;
            case 'invest': this._investDock(); break;
            case 'trade': this._trade(); break;
            case 'walk': this._handleForwardChoice('walk', false); break;
        }
    },
    
    _investDock() {
        const isFirstInvest = (this._cell.extraInfo.progress === 0);
        const cost = isFirstInvest ? 50000 : 20000;
        if (this.prop.gold < cost) { this.addChat(`金钱不足，需要${cost}金`); this.board.roundEnd(); return; }
        this.prop.reduceGold(cost);
        if (isFirstInvest) {
            this._cell.extraInfo.progress = 1;
            this._cell.extraInfo.buildUpdatedRound = this.board._round + 1;
            this.addGreenChat('你决定投资重建这座码头，工人们开始忙碌起来');
        } else {
            this._cell.extraInfo.builtRound += this._cell.extraInfo.builtRoundAdd;
            this.addGreenChat('追加投资成功，重建进度加快了');
        }
        this.finishAction();
    },
    
    _fishAtDock() {
        this.lastFlag.fishRound = this.board._round;
        this.addChat('你在码头钓了一会儿鱼');
        const goldGain = RandomUtils.randInt(20, 49);  // 优化：钓鱼金钱[20,49]
        const expGain = this.prop.level * 2;
        this.prop.addGold(goldGain);
        this.prop.addExp(expGain);
        this.addGreenChat(`卖掉渔获，获得${goldGain}金钱和${expGain}经验`);
        this.finishAction();
    },
    
    _gotoByShip() {
        const targetIndex = this._cell.extraInfo.gotoIndex;
        const targetCell = this.board.getCell(targetIndex);
        if (!targetCell) { 
            this.addChat('暂时无法出航'); 
            this.board.roundEnd(); 
            return; 
        }
        
        // 根据码头建设进度显示不同的乘船描述
        const progress = this._cell.extraInfo.progress;
        let shipMessage;
        if (progress < 2) {
            shipMessage = `你坐上了自制木筏出海前往${targetCell.cellName}`;
        } else if (progress >= 3) {
            shipMessage = `你搭上了前往${targetCell.cellName}的客船`;
        } else {
            shipMessage = `你乘坐小船前往${targetCell.cellName}`;
        }
        
        // 使用统一的瞬移逻辑
        this.teleportAndArrive(targetIndex, shipMessage);
    },
    
    _trade() {
        const rand = RandomUtils.randInt(0, 4);  // 优化：贸易类型[0,4]
        this.addChat('你决定与往来的商船做点小生意');
        if (rand === 2 || this.prop.overWeight) {
            this._tradeSell();
        } else if (rand === 3) {
            this._tradeLabor();
        } else {
            this._tradeBuy();
        }
    },
    
    _tradeSell() {
        let amount, value;
        if (this.prop.overWeight) {
            if (this.prop.rarestuff / this.prop.stuff > 0.5) {
                amount = Math.ceil(this.prop.rarestuff * 0.2);
                value = amount * 600;
                this.prop.rarestuff -= amount;
                this.addGreenChat(`你卖掉了${amount}个稀有锻材，金钱+${value}`);
            } else {
                amount = Math.ceil(this.prop.stuff * 0.4);
                value = amount * 200;
                this.prop.stuff -= amount;
                this.addGreenChat(`你卖掉了${amount}个基础锻材，金钱+${value}`);
            }
            this.prop.addGold(value);
        } else {
            this.addChat('商人对你的货物不感兴趣');
        }
        this.finishAction();
    },
    
    _tradeBuy() {
        if (this.prop.overWeight) { this.addChat('你的背包已经超重，无法购买'); this.board.roundEnd(); return; }
        let amount, cost;
        if (this.prop.rarestuff < this.prop.stuff) {
            amount = Math.ceil(this.prop.actualWeight * 0.2);
            amount = Math.min(this.prop.remainWeight, amount);
            cost = amount * 600;
            if (this.prop.gold < cost) { amount = Math.floor(this.prop.gold / 600); cost = amount * 600; }
            if (amount > 0) { this.prop.reduceGold(cost); this.prop.rarestuff += amount; this.addChat(`你买到了${amount}个稀有锻材，金钱-${cost}`); }
        } else {
            amount = Math.ceil(this.prop.actualWeight * 0.4);
            amount = Math.min(this.prop.remainWeight, amount);
            cost = amount * 200;
            if (this.prop.gold < cost) { amount = Math.floor(this.prop.gold / 200); cost = amount * 200; }
            if (amount > 0) { this.prop.reduceGold(cost); this.prop.stuff += amount; this.addChat(`你买到了${amount}个基础锻材，金钱-${cost}`); }
        }
        if (amount === 0) this.addChat('交易失败，金钱或负重不足');
        this.finishAction();
    },
    
    _tradeLabor() {
        const rand2 = Math.random();
        if (rand2 > 0.7) {
            this.addChat('你投机倒把遭举报，被惩罚干了1天苦力');
            this.prop.consumeStamina(Math.floor(this.prop.maxStamina * 0.5));
        } else {
            const goldGain = this.prop.level * 50;
            this.prop.addGold(goldGain);
            this.addGreenChat(`你帮商船搬运货物，获得${goldGain}金钱`);
        }
        this.finishAction();
    }
};

