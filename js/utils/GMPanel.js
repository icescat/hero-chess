/**
 * GM测试面板
 * 用于快速测试游戏功能
 */

class GMPanel {
    constructor() {
        this._chess = null;
        this._setupToggle();
        this._makeDraggable();
        console.log('[GMPanel] GM测试面板已初始化（默认隐藏，控制台输入 showGM() 打开）');
    }

    /**
     * 显示GM面板
     */
    show() {
        const panel = document.getElementById('gm-panel');
        if (panel) {
            panel.style.display = 'block';
            console.log('[GMPanel] 面板已显示');
        }
    }

    /**
     * 隐藏GM面板
     */
    hide() {
        const panel = document.getElementById('gm-panel');
        if (panel) {
            panel.style.display = 'none';
            console.log('[GMPanel] 面板已隐藏');
        }
    }
    
    /**
     * 设置棋子引用
     */
    setChess(chess) {
        this._chess = chess;
        this.refreshStatus();
        console.log('[GMPanel] 已关联棋子对象');
    }
    
    /**
     * 设置折叠/展开功能
     */
    _setupToggle() {
        const toggleBtn = document.getElementById('gm-toggle');
        const content = document.getElementById('gm-content');
        
        if (toggleBtn && content) {
            toggleBtn.addEventListener('click', () => {
                content.classList.toggle('collapsed');
                toggleBtn.textContent = content.classList.contains('collapsed') ? '展开' : '收起';
            });
        }
    }
    
    /**
     * 使面板可拖动
     */
    _makeDraggable() {
        const panel = document.getElementById('gm-panel');
        const header = document.querySelector('.gm-header');
        
        if (!panel || !header) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === header || e.target.parentElement === header) {
                isDragging = true;
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                setTranslate(currentX, currentY, panel);
            }
        }
        
        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
        
        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }
    
    /**
     * 投指定点数的骰子
     */
    rollDice(points) {
        if (!this._chess) {
            alert('棋子对象未初始化！');
            return;
        }
        
        if (points < 1 || points > 6) {
            alert('骰子点数必须在1-6之间！');
            return;
        }
        
        if (!this._chess.readyMove || this._chess.isMoving || this._chess.isDiceRolling) {
            alert('棋子正在移动中，请等待！');
            return;
        }
        
        console.log(`[GMPanel] GM投掷${points}点骰子`);
        
        // 移除旧的骰子
        this._chess.board.removeAllDice();
        
        // 立即设置骰子滚动标志
        this._chess._isDiceRolling = true;
        this._chess._readyMove = false;
        
        // 播放骰子动画（使用指定点数）
        this._chess.board.playRollingDice(points, 0);
        
        // 延迟后开始移动
        setTimeout(() => {
            this._chess.forward(points);
        }, 500);
    }
    
    /**
     * 设置等级
     */
    setLevel() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const level = parseInt(document.getElementById('gm-level').value);
        if (level < 1 || level > 90) {
            alert('等级必须在1-90之间！');
            return;
        }
        
        this._chess.prop._level = level;
        this._chess.prop.recountLv();
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置等级为${level}`);
    }
    
    /**
     * 设置经验
     */
    setExp() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const exp = parseInt(document.getElementById('gm-exp').value);
        this._chess.prop._exp = exp;
        this._chess.prop.recountLv();
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置经验为${exp}`);
    }
    
    /**
     * 设置金钱
     */
    setGold() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const gold = parseInt(document.getElementById('gm-gold').value);
        this._chess.prop._gold = gold;
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置金钱为${gold}`);
    }
    
    /**
     * 设置生命
     */
    setLife() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const life = parseInt(document.getElementById('gm-life').value);
        this._chess.prop._life = Math.min(life, this._chess.prop._maxLife);
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置生命为${life}`);
    }
    
    /**
     * 设置耐力
     */
    setStamina() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const stamina = parseInt(document.getElementById('gm-stamina').value);
        if (isNaN(stamina) || stamina < 0) {
            alert('请输入有效的耐力值（0或正整数）');
            return;
        }
        
        // 耐力不能超过最大耐力
        const maxStamina = this._chess.prop.maxStamina;
        const actualValue = Math.min(stamina, maxStamina);
        
        this._chess.prop._curStamina = actualValue;  // ✅ 修正：使用_curStamina而不是_stamina
        
        if (this._chess._panel) {
            this._chess._panel.updateUI();
        }
        
        this.refreshStatus();
        console.log(`[GMPanel] 设置耐力为: ${actualValue}/${maxStamina}`);
        
        if (stamina > maxStamina) {
            alert(`耐力已设置为最大值 ${maxStamina}（输入的 ${stamina} 超过最大值）`);
        }
    }
    
    /**
     * 设置材料
     */
    setStuff() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const stuff = parseInt(document.getElementById('gm-stuff').value);
        this._chess.prop._stuff = stuff;
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置材料为${stuff}`);
    }
    
    /**
     * 设置稀有材料
     */
    setRareStuff() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const rareStuff = parseInt(document.getElementById('gm-rarestuff').value);
        this._chess.prop._rarestuff = rareStuff;
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置稀有材料为${rareStuff}`);
    }
    
    /**
     * 设置名声
     */
    setFame() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        const fame = parseInt(document.getElementById('gm-fame').value);
        this._chess.prop._fame = fame;
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 设置名声为${fame}`);
    }
    
    /**
     * 完全恢复
     */
    fullRestore() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        this._chess.prop.fullRestore();
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log('[GMPanel] 完全恢复生命和耐力');
    }
    
    /**
     * 增加金钱
     */
    addGold(amount) {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        this._chess.prop.addGold(amount);
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 增加${amount}金钱`);
    }
    
    /**
     * 增加材料
     */
    addStuff(amount) {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        this._chess.prop._stuff += amount;
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 增加${amount}材料`);
    }
    
    /**
     * 升级
     */
    levelUp() {
        if (!this._chess || !this._chess.prop) {
            alert('棋子属性未初始化！');
            return;
        }
        
        if (this._chess.prop._level >= 90) {
            alert('已达到最高等级！');
            return;
        }
        
        this._chess.prop._level++;
        this._chess.prop.recountLv();
        this._chess._panel.updateUI();
        this.refreshStatus();
        console.log(`[GMPanel] 升到${this._chess.prop._level}级`);
    }
    
    /**
     * 传送到指定格子
     */
    teleport() {
        if (!this._chess) {
            alert('棋子对象未初始化！');
            return;
        }
        
        const cellIndex = prompt('请输入格子索引（0-37）：', '0');
        if (cellIndex === null) return;
        
        const index = parseInt(cellIndex);
        if (isNaN(index) || index < 0 || index >= this._chess.board.cellNum) {
            alert(`格子索引必须在0-${this._chess.board.cellNum - 1}之间！`);
            return;
        }
        
        // 直接传送
        this._chess._index = index;
        this._chess._cell = this._chess.board.getCell(index);
        
        if (this._chess._cell) {
            this._chess._display.x = this._chess._cell.pos.x;
            this._chess._display.y = this._chess._cell.pos.y;
            this._chess.newChat(`[GM] 传送到 ${this._chess._cell.cellName}`);
            this.refreshStatus();
            console.log(`[GMPanel] 传送到格子#${index}`);
        }
    }
    
    /**
     * 刷新状态显示
     */
    refreshStatus() {
        if (!this._chess || !this._chess.prop) return;
        
        const prop = this._chess.prop;
        
        // 只更新HTML中存在的元素
        const levelEl = document.getElementById('gm-status-level');
        const goldEl = document.getElementById('gm-status-gold');
        const lifeEl = document.getElementById('gm-status-life');
        const cellEl = document.getElementById('gm-status-cell');
        
        if (levelEl) levelEl.textContent = prop._level;
        if (goldEl) goldEl.textContent = prop._gold;
        if (lifeEl) lifeEl.textContent = `${prop._life}/${prop._maxLife}`;
        if (cellEl) {
            cellEl.textContent = this._chess._cell ? 
                `#${this._chess._index} ${this._chess._cell.cellName}` : '-';
        }
    }
}

// 创建全局GM面板实例
window.gmPanel = new GMPanel();

// 绑定全局函数
window.showGM = () => window.gmPanel.show();
window.hideGM = () => window.gmPanel.hide();
window.gmRollDice = (points) => window.gmPanel.rollDice(points);
window.gmSetLevel = () => window.gmPanel.setLevel();
window.gmSetExp = () => window.gmPanel.setExp();
window.gmSetGold = () => window.gmPanel.setGold();
window.gmSetLife = () => window.gmPanel.setLife();
window.gmSetStamina = () => window.gmPanel.setStamina();
window.gmSetStuff = () => window.gmPanel.setStuff();
window.gmSetRareStuff = () => window.gmPanel.setRareStuff();
window.gmSetFame = () => window.gmPanel.setFame();
window.gmFullRestore = () => window.gmPanel.fullRestore();
window.gmAddGold = (amount) => window.gmPanel.addGold(amount);
window.gmAddStuff = (amount) => window.gmPanel.addStuff(amount);
window.gmLevelUp = () => window.gmPanel.levelUp();
window.gmTeleport = () => window.gmPanel.teleport();
window.gmRefreshStatus = () => window.gmPanel.refreshStatus();

