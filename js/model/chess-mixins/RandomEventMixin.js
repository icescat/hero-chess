/**
 * 随机事件系统 Mixin
 * 包含各种随机触发的特殊事件
 * 包括：黄金史莱姆、日光马戏团、兽人斗士等
 */

const RandomEventMixin = {
    /**
     * 检查黄金史莱姆袭击事件
     * 对应 AS3: checkSlimeRaid()
     * @returns {boolean} true=触发了事件，false=未触发
     */
    // 黄金史莱姆袭击 - 野生Boss，保持原有随机逻辑
    _checkSlimeRaid() {
        const slimeExisted = this._cell.extraInfo.slimeExisted;
        
        if (RandomUtils.percent(10) && this.board._circleNo > 2 || slimeExisted) {  // 10%概率，圈数>2触发
            if (slimeExisted) {
                this.addChat('那杀千刀的黄金史莱姆仍安家于此，无论它如何卖萌都无法平息你的怒火');
            } else {
                this.addChat('不知何时竟有黄金史莱姆在此安了家，虽然圆滚滚看着憨态可掬，但要夺你地盘孰不可忍');
            }
            
            const enemy = Enemy.createWithLevelOffset(this.prop.level, 5, Enemy.ELITE, 0, true);
            enemy.gold = 0;
            this._cell.extraInfo.slimeExisted = true;
            
            this.startBattleWith(enemy, {
                onWin: () => {
                    this._cell.extraInfo.slimeExisted = false;
                    this.rewardAfterBattle({
                        gold: 30000,
                        message: '你将史莱姆金水炼制成锭，金钱+30000',
                        diary: '你干掉一只黄金史莱姆并将其炼成金锭'
                    });
                }
            });
            
            return true;
        }
        return false;
    },
    
    /**
     * 检查日光马戏团事件
     * 对应 AS3: checkCircusShow()
     * @returns {boolean} true=触发了事件，false=未触发
     */
    _checkCircusShow() {
        if (!this.board._isNight && RandomUtils.percent(20)) {  // 优化：20%概率马戏团
            if (this._cell.cellType === CellType.ARENA) {
                this.addChat('今日无赛事，因为有日光马戏团的演出，各种精彩纷呈的人与兽表演让你大饱眼福');
            } else {
                this.addChat('正赶上日光马戏团在这里搭台演出，各种精彩纷呈的人与兽表演让你大饱眼福');
            }
            
            if (this.prop.gold < 5000) {
                this.addChat('除了演出还有不少新奇玩意出售，只可惜你囊中羞涩');
            } else {
                // 可购买的道具列表：3个buff + 1个遗物（灵魂石）
                const itemList = ['soulstone', 'goldendye', 'waterrun', 'perfume'];
                const item = RandomUtils.choice(itemList);
                
                if (item === 'soulstone') {
                    // 灵魂石 - 遗物（一次性）
                    const relic = Relic.getInstance().getRelicByNo(18);
                    if (relic && this.prop.addRelic(relic)) {
                        this.addChat(`除了演出还有不少新奇玩意出售，你千挑万选买到了【灵魂石】，金钱-3000`);
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
                    this.addChat(`除了演出还有不少新奇玩意出售，你千挑万选买到了${buff.buffName}，金钱-${buff.fee}`);
                    this.prop.addBuffObj(buff, this.board._round + 1);
                    this.prop.reduceGold(buff.fee);
                }
            }
            
            this.board.roundEnd();
            return true;
        }
        return false;
    },
    
    /**
     * 检查兽人斗士袭击事件
     * 对应 AS3: checkOrcRaid()
     * @returns {boolean} true=触发了事件，false=未触发
     */
    _checkOrcRaid() {
        if (RandomUtils.percent(10)) {  // 优化：10%概率小仙女
            this.addChat('突然好几条汉子飞将过来差点没砸到你，原来是个兽人斗士在寻衅滋事叫嚣着要打十个，你从未见过如此狂妄自大之人，愤然出手');
            
            const enemy = new Enemy(this.prop.getActualLv(), Enemy.RIVAL, 4);
            enemy.setStuffNone();
            enemy.scaleAttrs(1.2);
            
            this.startBattleWith(enemy, {
                onWin: () => {
                    // 掉落装备（类型5：兽人斗士）
                    this.prop.checkLootEquipFromChest(5);
                    
                    const fameGain = Math.ceil(this.prop.level / 30) * 4;
                    this.rewardAfterBattle({
                        fame: fameGain,
                        message: `兽斗士跪谢你教他做人，名声+${fameGain}`,
                        diary: '你面对兽斗士的挑衅，愤然出手教他做人'
                    });
                    this.runningStat.addWinDuelCount();
                },
                onLose: () => {
                    this.addChat('你惨败于兽人斗士手下');
                    this.runningStat.addLoseDuelCount();
                },
                onTimeout: () => {
                    this.addChat('你俩不打不相识，相约日后再战');
                }
            });
            
            return true;
        }
        return false;
    }
};


