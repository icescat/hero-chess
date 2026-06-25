/**
 * 聊天面板类（右侧区域）
 * 对应 AS3: csh.ui.ChatPanel
 * 
 * 位置：棋盘中心区域的右侧65%
 * 显示：游戏消息、剧情文本
 * 
 * 实现方式：使用DOM元素（支持HTML彩色文字）
 */

class ChatPanel extends createjs.Container {
    constructor() {
        super();
        
        this._txtColor = '#000000';
        this._infoStr = '';
        this._titleStr = '';
        
        // DOM元素引用
        this._domContainer = null;
        this._domTitle = null;
        this._domContent = null;
        
        // 内嵌选项自动处理
        this._currentInlineOptions = null;
        this._inlineOptionsShowTime = 0;
        
        this.initUI();
        
        console.log('[ChatPanel] 聊天面板已创建（DOM实现）');
    }
    
    /**
     * 初始化UI
     * 使用DOM元素实现，支持HTML标签和彩色文字
     */
    initUI() {
        // 获取DOM容器
        this._domContainer = document.getElementById('chat-text-container');
        this._domTitle = document.getElementById('chat-title');
        this._domContent = document.getElementById('chat-content');
        
        if (!this._domContainer || !this._domTitle || !this._domContent) {
            console.error('[ChatPanel] DOM容器未找到！');
            return;
        }
        
        // 绑定链接点击事件
        this._domContainer.addEventListener('click', this._onClickLink.bind(this));
        
        console.log('[ChatPanel] DOM容器已连接');
    }
    
    /**
     * 清空内容区域（保留地点信息）
     * 用于：点击菜单、开始移动、任务完成等场景
     */
    clearContent() {
        this._infoStr = '';
        
        if (this._domContent) {
            this._domContent.innerHTML = '';
        }
        
        // 同时清除内嵌选项
        this.clearInlineOptions();
    }
    
    /**
     * 设置地点信息（同时清空内容区域）
     * 用于：到达新格子、瞬移到达、死亡复活等场景
     * @param {string} locationName 地点名称
     */
    setLocation(locationName) {
        this._titleStr = `你大步流星来到了【${locationName}】`;
        this._infoStr = '';
        
        if (this._domTitle) {
            this._domTitle.innerHTML = this._titleStr;
        }
        if (this._domContent) {
            this._domContent.innerHTML = '';
        }
        
        // 同时清除内嵌选项
        this.clearInlineOptions();
        
        console.log(`[ChatPanel] 更新地点: ${locationName}`);
    }
    
    /**
     * 追加一行文本到内容区域
     * @param {string} str 文本内容
     */
    startLine(str) {
        if (this._infoStr) {
            this._infoStr += '<br>';
        }
        this._infoStr += str;
        this._updateText();
    }
    
    /**
     * 追加行
     * @param {string} str 要追加的文本
     * @param {number} colorType 颜色类型（0=默认黑色，1=绿色，2=红色，3=黄色）
     */
    appendLine(str, colorType = 0) {
        let color = '#000000';  // 默认黑色
        let shadow = '';        // 文本阴影
        
        switch(colorType) {
            case 1:
                // 绿色（好事）- 6-2效果
                color = '#00FF00';
                shadow = 'text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);';
                break;
            case 2:
                // 红色（坏事）- 5-15效果：暗红+粗体+红光晕
                color = '#990000';
                shadow = 'font-weight: bold; text-shadow: 0 0 2px rgba(255, 100, 100, 0.5);';
                break;
            case 3:
                // 黄色（提示）- 5-19效果
                color = '#FFFF00';
                shadow = 'text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);';
                break;
        }
        
        if (this._infoStr) {
            this._infoStr += '<br>';
        }
        
        // 如果需要彩色，包裹font标签并添加阴影样式
        if (colorType !== 0) {
            this._infoStr += `<font color='${color}' style='${shadow}'>${str}</font>`;
        } else {
            this._infoStr += str;
        }
        
        this._updateText();
    }
    
    /**
     * 更新文本显示（DOM版本）
     */
    _updateText() {
        if (!this._domTitle || !this._domContent || !this._domContainer) {
            return;
        }
        
        // 更新标题
        this._domTitle.innerHTML = this._titleStr;
        
        // 更新普通文本
        this._domContent.innerHTML = this._infoStr;
        
        // 自动滚动到底部
        this._domContainer.scrollTop = this._domContainer.scrollHeight;
    }
    
    /**
     * 获取行数
     */
    getNumLine() {
        return this._infoStr.split('<br>').length;
    }
    
    /**
     * 添加可扩展的链接（点击查看详细信息）
     * @param {string} linkText 链接文本
     * @param {Function} callback 点击回调
     */
    appendExpandedLink(linkText, callback) {
        // 简化版：直接显示为带颜色的文本，点击触发callback
        // 完整版应该使用HTML或交互式文本对象
        const displayText = `<${linkText}>`;
        this.appendLine(displayText, 3);  // 黄色显示
        
        // 暂存回调，供外部调用
        this._expandedCallback = callback;
    }
    
    /**
     * 显示扩展信息（在聊天区域显示详细内容）
     * @param {string} info 详细信息
     */
    showExpandedInfo(info) {
        // 将换行符\n转换为实际换行
        const lines = info.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                this.appendLine(line);
            }
        }
    }
    
    /**
     * 显示内嵌选项链接（原版Flash风格）
     * 选项直接显示在聊天区域，无弹窗，点击即执行
     * 
     * @param {string} introText - 介绍文本
     * @param {Array} options - 选项值数组 ['yes', 'no']
     * @param {Array} optionsText - 选项显示文本数组 ['确定', '取消']
     * @param {Function} callback - 选择后的回调函数
     */
    addInlineOptions(introText, options, optionsText, callback) {
        // 保存选项信息用于自动游戏
        this._currentInlineOptions = { introText, options, optionsText, callback };
        this._inlineOptionsShowTime = Date.now();
        
        // 1. 显示介绍文本
        if (introText) {
            this.appendLine(introText);
        }
        
        // 2. 获取DOM容器并清空旧链接
        const container = document.getElementById('chat-link-container');
        if (!container) {
            console.error('[ChatPanel] chat-link-container not found');
            return;
        }
        container.innerHTML = '';
        
        // 4. 等待DOM更新后再计算位置（避免文本换行导致的位置偏移）
        requestAnimationFrame(() => {
            // 计算链接显示位置（使用DOM实际高度）
            const titleHeight = this._domTitle ? this._domTitle.offsetHeight : 0;
            const contentHeight = this._domContent ? this._domContent.offsetHeight : 0;
            const linkY = titleHeight + contentHeight + 8;  // 标题高度 + 内容高度 + padding
            
            // 5. 创建链接包装div
            const linksWrapper = document.createElement('div');
            linksWrapper.style.cssText = `
                position: absolute;
                top: ${linkY}px;
                left: 8px;
                width: 270px;
            `;
            
            // 6. 创建每个选项链接（原版格式：同一行，空格分隔）
            options.forEach((value, index) => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = `>${optionsText[index]}<`;
                link.style.cssText = `
                    display: inline-block;
                    color: #FFFFFF;
                    text-decoration: none;
                    font-size: 15px;
                    font-family: "Microsoft YaHei", Arial, sans-serif;
                    margin-right: 20px;
                    padding: 2px 0;
                    pointer-events: auto;
                    cursor: pointer;
                    transition: color 0.2s;
                `;
                
                // 悬停效果（原版黄色高亮）
                link.onmouseenter = () => {
                    link.style.color = '#FFFF00';
                };
                link.onmouseleave = () => {
                    link.style.color = '#FFFFFF';
                };
                
                // 点击处理
                // V1.0.6: 点击选项时先清空内容区域，再执行回调
                link.onclick = (e) => {
                    e.preventDefault();
                    this.clearContent();  // 清空内容区域（包含clearInlineOptions）
                    callback(value);
                };
                
                linksWrapper.appendChild(link);
            });
            
            container.appendChild(linksWrapper);
            
            console.log('[ChatPanel] 内嵌选项已显示', options, `位置: ${linkY}px`);
            
            // 自动游戏：延迟后自动选择
            if (ChessAI.enableAuto) {
                console.log('[ChatPanel] 自动游戏模式：将在2秒后自动处理选项');
                setTimeout(() => {
                    if (this._currentInlineOptions && ChessAI.enableAuto) {
                        const elapsed = Date.now() - this._inlineOptionsShowTime;
                        if (elapsed >= ChessAI.HANDLE_DELAY * 1000 - 100) {
                            console.log('[ChatPanel] 自动处理内嵌选项');
                            // 调用ChessAI处理
                            const chess = window.game ? window.game._chess : null;
                            if (chess) {
                                ChessAI.getInstance().autoHandleOptions(chess, this._currentInlineOptions.options);
                            }
                        }
                    }
                }, ChessAI.HANDLE_DELAY * 1000);
            }
        });
    }
    
    /**
     * 清除内嵌选项链接
     */
    clearInlineOptions() {
        const container = document.getElementById('chat-link-container');
        if (container) {
            container.innerHTML = '';
        }
        // 清除保存的选项信息
        this._currentInlineOptions = null;
    }
    
    /**
     * 处理链接点击事件
     * 对应 AS3: onClickLink()
     */
    _onClickLink(event) {
        let target = event.target;
        
        // 向上查找<a>标签（处理点击链接内部元素的情况）
        while (target && target !== this._domContainer) {
            if (target.tagName === 'A') {
                break;
            }
            target = target.parentElement;
        }
        
        // 如果没找到<a>标签，退出
        if (!target || target.tagName !== 'A') {
            return;
        }
        
        // 获取href属性
        const href = target.getAttribute('href');
        if (!href || !href.startsWith('event:')) {
            return;
        }
        
        event.preventDefault();
        
        // 解析事件类型
        const eventType = href.replace('event:', '');
        console.log(`[ChatPanel] 点击链接事件: ${eventType}`);
        
        // 处理不同类型的事件
        switch (eventType) {
            case 'stat':
                // 显示战斗统计
                if (window.game && window.game._chess) {
                    window.game._chess.showBattleStat();
                }
                break;
                
            case 'revive':
                // 处理复活
                if (window.game && window.game._chess) {
                    window.game._chess.handleRevive();
                }
                break;
                
            case 'close':
                // 关闭额外信息浮层
                this.closeExtraInfo();
                break;
                
            default:
                console.warn(`[ChatPanel] 未知的事件类型: ${eventType}`);
        }
    }
    
    /**
     * 展开额外信息浮层（黑色半透明背景）
     * 对应 AS3: expandExtraInfo()
     * @param {string} content HTML格式的内容
     */
    expandExtraInfo(content) {
        // 添加关闭按钮
        const fullContent = content + `<a href="event:close" style="color: #FFFF00; cursor: pointer;">&gt;关闭&lt;</a>`;
        
        // 创建或获取浮层容器
        let extraPanel = document.getElementById('chat-extra-info');
        if (!extraPanel) {
            extraPanel = document.createElement('div');
            extraPanel.id = 'chat-extra-info';
            extraPanel.style.cssText = `
                position: absolute;
                background-color: rgba(0, 0, 0, 0.6);
                border: 1px solid #CC9966;
                color: #FFFFFF;
                font-size: 15px;
                line-height: 20px;
                padding: 10px;
                max-width: 400px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
            `;
            document.body.appendChild(extraPanel);
            
            // 绑定点击事件
            extraPanel.addEventListener('click', this._onClickLink.bind(this));
        }
        
        // 设置内容
        extraPanel.innerHTML = fullContent;
        
        // 定位：与聊天面板对齐
        const chatContainer = this._domContainer;
        if (chatContainer) {
            const rect = chatContainer.getBoundingClientRect();
            extraPanel.style.left = rect.left + 'px';
            extraPanel.style.top = rect.top + 'px';
        }
        
        // 显示浮层
        extraPanel.style.display = 'block';
        
        // 检查是否超出屏幕底部，如果超出则调整位置
        requestAnimationFrame(() => {
            const panelRect = extraPanel.getBoundingClientRect();
            if (panelRect.bottom > window.innerHeight) {
                extraPanel.style.top = (window.innerHeight - panelRect.height) + 'px';
            }
        });
        
        console.log('[ChatPanel] 额外信息浮层已显示');
    }
    
    /**
     * 关闭额外信息浮层
     * 对应 AS3: closeExtraInfo()
     */
    closeExtraInfo() {
        const extraPanel = document.getElementById('chat-extra-info');
        if (extraPanel) {
            extraPanel.style.display = 'none';
            console.log('[ChatPanel] 额外信息浮层已关闭');
        }
    }
}

