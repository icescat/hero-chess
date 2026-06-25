/**
 * 游戏机制 Mixin
 * 包含每圈/每回合的检查逻辑
 * 包括：生病检查、每天流逝检查等
 * 
 * 注意：本Mixin只包含Chess.js中缺少的方法，不会覆盖已有方法
 */

const GameMechanicsMixin = {
    /**
     * 检查是否触发生病
     * 对应 AS3: checkSick()
     * 在每回合结束时调用
     */
    checkSick() {
        if (this._isDead) {
            return;
        }
        
        // 随从有免疫生病能力
        if (this.prop.follower && this.prop.follower.canNoSick()) {
            return;
        }
        
        this.runningStat.nostayRound++;
        
        // 连续nostayRound超过maxNostay且在无选项格子上，20%概率生病
        if (this.runningStat.nostayRound > this.runningStat.maxNostay && this._cell && this._cell.noOption) {
            if (Math.random() > 0.8) {
                this.runningStat.nostayRound = 0;
                
                if (this.prop.haveBuff(BuffNo.SICK)) {
                    this.addRedChat('长时间奔波劳累使你病情每况愈下');
                } else {
                    this.addRedChat('长时间奔波劳累使你病来如山倒，应该尽快回城养病');
                    this.prop.addBuff(BuffNo.SICK, this.board._round + 1);
                    this.lastFlag.lastSickRound = this.board._round;
                    DiaryPanel.getInstance().addDiary('你为尽早打倒魔王日夜操劳终于不支病倒');
                }
            }
        }
    },
    
    
    /**
     * 每天流逝时的检查
     * 对应 AS3: checkDayLapse(roundLapse)
     * @param {number} round - 当前回合数
     */
    checkDayLapse(round) {
        this.checkSick();
        this.prop.checkQuestDuration(round);
        this.prop.checkBuffDuration(round);
        this.prop.checkFollowerDuration(round);
    },
    
};



