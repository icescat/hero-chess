/**
 * 棋子属性面板（左侧区域）
 * 对应 AS3: csh.ui.ChessPanel
 * 
 * 位置：棋盘中心区域的左侧40%
 * 显示：主角属性、背包物资、其他数据
 * 
 * 实现方式：使用DOM元素（支持HTML彩色文字和可点击链接）
 */

class ChessPanel extends createjs.Container {
    constructor(chess) {
        super();
        
        this.chess = chess;
        this._txtColor = '#000000';
        this._str = '';
        
        // DOM元素引用
        this._domContainer = null;
        this._extraPanel = null;
        
        this.initUI();
        
        console.log('[ChessPanel] 棋子面板已创建（DOM实现）');
    }
    
    // 初始化UI - AS3: initUI()
    initUI() {
        // 获取DOM容器
        this._domContainer = document.getElementById('chess-text-container');
        
        if (!this._domContainer) {
            console.error('[ChessPanel] chess-text-container未找到！');
            return;
        }
        
        // 获取浮窗容器
        this._extraPanel = document.getElementById('extra-info-panel');
        
        if (!this._extraPanel) {
            console.error('[ChessPanel] extra-info-panel未找到！');
            return;
        }
        
        // 绑定链接点击事件
        this._domContainer.addEventListener('click', this._onClickLink.bind(this));
        this._extraPanel.addEventListener('click', this._onExtraPanelClick.bind(this));
        
        console.log('[ChessPanel] DOM容器已连接');
    }
    
    // 更新UI显示 - AS3: updateUI()
    updateUI() {
        if (!this._domContainer) {
            console.error('[ChessPanel] DOM容器不存在！');
            return;
        }
        
        if (!this.chess) {
            console.error('[ChessPanel] chess对象不存在！');
            this._domContainer.innerHTML = 'chess对象未初始化...';
            return;
        }
        
        if (!this.chess.prop) {
            console.error('[ChessPanel] 属性系统未初始化！');
            this._domContainer.innerHTML = '属性系统未初始化...';
            return;
        }
        
        try {
            // 获取HTML格式的属性字符串
            this._str = this.chess.prop.printString();
            
            // 添加日期信息（小字号）
            if (this.chess.board && this.chess.board.getDateString) {
                this._str += `<br><font size='2'>${this.chess.board.getDateString()}</font>`;
            } else {
                this._str += `<br><font size='2'>第1轮 14年1月1日 昼</font>`;
            }
            
            // 更新DOM（CSS已在index.html中设置font-size: 15px）
            this._domContainer.innerHTML = this._str;
        } catch (error) {
            console.error('[ChessPanel] 更新UI时出错:', error);
            this._domContainer.innerHTML = `更新出错: ${error.message}`;
        }
    }
    
    // 链接点击处理 - AS3: onClickLink()
    _onClickLink(event) {
        event.preventDefault();
        
        // 检查是否点击了链接或链接内的元素
        let target = event.target;
        
        // 向上查找最近的<a>标签
        while (target && target !== this._domContainer) {
            if (target.tagName === 'A') {
                const action = target.getAttribute('data-action');
                console.log('[ChessPanel] 点击链接:', action);
                
                switch (action) {
                    case 'talent':
                        this._expandTalentInfo();
                        break;
                    case 'relic':
                        this._expandRelicInfo();
                        break;
                    case 'follower':
                        this._expandFollowerInfo();
                        break;
                    case 'mount':
                        this._expandMountInfo();
                        break;
                    case 'weapon':
                        this._expandWeaponInfo();
                        break;
                    case 'armor':
                        this._expandArmorInfo();
                        break;
                    case 'bag':
                        this._expandBagInfo();
                        break;
                }
                return;
            }
            target = target.parentElement;
        }
    }
    
    // 展开天赋信息 - AS3: expandMultiPageInfo(1)
    _expandTalentInfo() {
        if (!this.chess.talent) {
            this._showExtraInfo('天赋系统尚未解锁');
            return;
        }
        
        // TODO: 实现天赋翻页功能
        const talentText = this.chess.talent.printTalents ? this.chess.talent.printTalents() : '天赋系统正在开发中...';
        this._showExtraInfo(talentText);
    }
    
    // 展开遗物信息 - AS3: expandExtraInfo(printRelics())
    _expandRelicInfo() {
        const relicText = this.chess.prop.printRelics();
        this._showExtraInfo(relicText);
    }
    
    // 显示浮窗 - AS3: showExtraSp()
    _showExtraInfo(content) {
        if (!this._extraPanel) return;
        
        // 添加关闭按钮（AS3: #ffff00黄色）
        const htmlContent = content + "<br><a href='#' data-action='close'><font color='#ffff00'>&gt;关闭&lt;</font></a>";
        
        this._extraPanel.innerHTML = htmlContent;
        this._extraPanel.style.display = 'block';
        
        // 先让浏览器计算浮窗的实际大小
        requestAnimationFrame(() => {
            // 固定定位：与属性面板对齐（65px, 63px）
            // 属性面板宽度214px，浮窗也设置为同宽
            const chessPanelLeft = 65;
            const chessPanelTop = 63;
            const chessPanelWidth = 214;
            
            this._extraPanel.style.width = chessPanelWidth + 'px';
            this._extraPanel.style.left = chessPanelLeft + 'px';
            this._extraPanel.style.top = chessPanelTop + 'px';
            
            // 如果超出屏幕底部，向上调整
            const panelRect = this._extraPanel.getBoundingClientRect();
            if (panelRect.bottom > window.innerHeight) {
                const newTop = Math.max(10, window.innerHeight - panelRect.height - 10);
                this._extraPanel.style.top = newTop + 'px';
            }
            
            console.log('[ChessPanel] 浮窗已显示 - 位置:', chessPanelLeft, this._extraPanel.style.top);
        });
    }
    
    // 关闭浮窗 - AS3: closeExtraInfo()
    _closeExtraInfo() {
        if (!this._extraPanel) return;
        
        this._extraPanel.style.display = 'none';
        this._extraPanel.innerHTML = '';
        console.log('[ChessPanel] 浮窗已关闭');
    }
    
    // 浮窗点击处理
    _onExtraPanelClick(event) {
        event.preventDefault();
        
        // 向上查找最近的<a>标签
        let target = event.target;
        while (target && target !== this._extraPanel) {
            if (target.tagName === 'A') {
                const action = target.getAttribute('data-action');
                
                if (action === 'close') {
                    this._closeExtraInfo();
                }
                return;
            }
            target = target.parentElement;
        }
    }
    
    // 展开随从信息 - AS3: expandExtraInfo(follower.printFollower())
    _expandFollowerInfo() {
        const follower = this.chess.prop._follower;
        if (!follower) {
            return;
        }
        
        // 使用 printFollower() 显示完整随从信息（包含技能）
        const followerInfo = follower.printFollower();
        this._showExtraInfo(followerInfo);
    }
    
    // 展开坐骑信息 - AS3: expandExtraInfo(mount.printMount())
    _expandMountInfo() {
        const mount = this.chess.prop._mount;
        if (!mount) {
            return;
        }
        
        // 使用 printMount() 显示完整坐骑信息
        const mountInfo = mount.printMount();
        this._showExtraInfo(mountInfo);
    }
    
    // 展开背包信息
    _expandBagInfo() {
        const bagInfo = this.chess.prop.printBag();
        this._showExtraInfo(bagInfo);
    }
    
    // 展开武器信息
    _expandWeaponInfo() {
        const weapon = this.chess.prop._weapon;
        const weaponInfo = this.chess.prop.printEquipInfo(weapon, false);
        this._showExtraInfo(weaponInfo);
    }
    
    // 展开护甲信息
    _expandArmorInfo() {
        const armor = this.chess.prop._armor;
        const armorInfo = this.chess.prop.printEquipInfo(armor, true);
        this._showExtraInfo(armorInfo);
    }
    
    // 公共方法：关闭扩展信息 - AS3: closeExtraInfo()
    closeExtraInfo() {
        this._closeExtraInfo();
    }
}

