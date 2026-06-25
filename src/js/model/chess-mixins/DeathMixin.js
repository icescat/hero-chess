/**
 * 死亡/复活系统 Mixin
 * 从 Chess.js 拆分
 * 
 * V1.0.5 重构：死亡后传送回城复活
 */

const DeathMixin = {
    /**
     * 处理复活按钮点击
     * 使用统一的瞬移逻辑，目标为最后经过的城镇/村庄
     */
    handleRevive() {
        console.log('[Chess] 玩家点击复活按钮 - 返回安全地点');
        
        // V1.0.6: 清屏逻辑已移至 teleportAndArrive，这里不需要额外清屏
        
        // 1. 清理副本状态（如果在副本中死亡）
        if (this._cell && this._cell.extraInfo && this._cell.extraInfo.battleInProgress) {
            console.log('[Chess] 副本中死亡，清理副本状态');
            this._cell.extraInfo.battleInProgress = false;
        }
        
        // 3. V1.0.6: 临时随从功能已删除，无需特殊处理
        // 正式随从（雇佣的）在死亡后保留
        
        // 4. 获取最后经过的安全地点（城镇或村庄）
        const safeIndex = this._getLastSafePlace();
        const safeCell = this.board.getCell(safeIndex);
        const isTown = safeCell.cellType === CellType.TOWN;
        const placeType = isTown ? '城镇' : '村庄';
        console.log(`[Chess] 复活地点: ${safeIndex} - ${safeCell.cellName} (${placeType})`);
        
        // 5. 计算损失（20%金钱 + 30%材料，向上取整）
        const goldLoss = this.prop.gold > 0 ? Math.ceil(this.prop.gold * 0.2) : 0;
        const stuffLoss = this.prop.stuff > 0 ? Math.ceil(this.prop.stuff * 0.3) : 0;
        
        // 6. 应用惩罚
        if (goldLoss > 0) {
            this.prop.reduceGold(goldLoss);
        }
        if (stuffLoss > 0) {
            this.prop.stuff = Math.max(0, this.prop.stuff - stuffLoss);
        }
        
        // 7. 恢复生命和耐力到满
        this.prop._curLife = this.prop.maxLife;
        this.prop.curStamina = this.prop.maxStamina;
        
        // 8. 重置死亡标志
        this._isDead = false;
        this.prop._isDead = false;
        
        // 9. 重置等待复活标志并设置刚复活标志
        this._waitingForRevive = false;
        this._justRevived = true;  // 标记刚复活，AI会根据此标志调整决策
        
        // 10. 准备到达后的消息（根据城镇/村庄调整剧情）
        const afterMessages = [];
        
        // 死亡复活剧情（城镇和村庄不同）
        if (isTown) {
            afterMessages.push('你被路过的好心商队带回了附近城镇的医馆');
            afterMessages.push('你悠悠醒来，老中医从你身上搜出了财物作为医疗费');
        } else {
            afterMessages.push('你被路过的村民救起，带回了村庄');
            afterMessages.push('醒来后，善良的村民要求你支付一些报酬');
        }
        
        // 损失信息
        if (goldLoss > 0 || stuffLoss > 0) {
            const losses = [];
            if (goldLoss > 0) losses.push(`金钱-${goldLoss}`);
            if (stuffLoss > 0) losses.push(`材料-${stuffLoss}`);
            afterMessages.push({ text: `损失：${losses.join('，')}`, color: 'red' });
        } else {
            afterMessages.push('医馆老板见你一贫如洗，摇头叹息让你离开了');
        }
        
        // 11. 更新统计和任务
        this.runningStat.addDeadCount();
        this.prop.checkCannotDieQuest();
        DiaryPanel.getInstance().addDiary('你不幸身死，被商队救回城镇', false);
        
        console.log(`[Chess] 复活完成 - 位置:${safeIndex}, 损失:金${goldLoss}/材料${stuffLoss}`);
        
        // 12. 使用统一的瞬移逻辑
        this.teleportAndArrive(safeIndex, null, afterMessages);
    },
    
    /**
     * 获取最近的前方安全地点（城镇或村庄）
     * 从当前位置向前查找（格子编号递减），找到第一个城镇/村庄
     * @returns {number} 安全地点格子索引
     */
    _getLastSafePlace() {
        const currentIndex = this._index;
        
        // 从当前位置向前查找（递减）
        for (let i = currentIndex - 1; i >= 0; i--) {
            const cell = this.board.getCell(i);
            if (cell && (cell.cellType === CellType.TOWN || cell.cellType === CellType.VILLAGE)) {
                console.log(`[Chess] 找到前方最近的安全点: #${i} ${cell.cellName}`);
                return i;
            }
        }
        
        // 如果没找到（理论上不会发生，因为起点是城镇），返回起点
        console.warn('[Chess] 未找到前方安全地点，返回起点城镇');
        return 0;
    },
    
    /**
     * 非战斗死亡处理（围攻魔王失败、副本被围殴等）
     * 设置死亡状态，显示复活选项，等待玩家或AI触发复活
     */
    dead() {
        if (!this._isDead) {
            console.log('[Chess] 玩家非战斗死亡，等待复活');
            this._isDead = true;
            this.prop._isDead = true;
            this._waitingForRevive = true;
            this.runningStat.addDeadCount();
            this.prop.checkCannotDieQuest();
            
            // 显示死亡消息和复活链接
            this.addRedChat('你已卒，灵魂回到最近的安全点');
            this.addChat('<a href="event:revive" style="color: #FF0000; cursor: pointer;">点击复活</a>');
            
            // AI模式下自动复活
            if (ChessAI.enableAuto) {
                ChessAI.getInstance().autoHandleRevive(this);
            }
        }
    }
};

