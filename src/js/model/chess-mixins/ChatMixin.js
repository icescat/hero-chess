/**
 * 聊天消息系统 Mixin
 * 从 Chess.js 拆分
 * 包含所有聊天消息相关方法
 * 
 * V1.0.6 重构：分离地点信息和内容区域
 * - 地点信息：只在到达新地点时更新，不受清屏影响
 * - 内容区域：可通过 clearContent() 清除
 */

const ChatMixin = {
    /**
     * 设置地点信息（同时清空内容区域）
     * 用于到达新格子、瞬移到达、死亡复活等场景
     * @param {string} locationName 地点名称
     */
    setLocation(locationName) {
        console.log(`[Location] 到达 ${locationName}`);
        
        if (this.board && this.board.chatPanel) {
            this.board.chatPanel.setLocation(locationName);
        }
    },
    
    /**
     * 清空内容区域（保留地点信息）
     * 用于点击菜单、开始移动、任务完成等场景
     */
    clearContent() {
        if (this.board && this.board.chatPanel) {
            this.board.chatPanel.clearContent();
        }
    },
    
    /**
     * 追加一行聊天消息到内容区域
     * @param {string} message 消息内容
     */
    newChat(message) {
        console.log(`[NewChat] ${message}`);
        
        if (this.board && this.board.chatPanel) {
            this.board.chatPanel.startLine(message);
        }
    },
    
    /**
     * 添加聊天消息（追加）
     * @param {string} message 消息内容
     * @param {number} colorType 颜色类型 (0=黑色, 1=绿色, 2=红色, 3=黄色)
     */
    addChat(message, colorType = 0) {
        console.log(`[Chat] ${message}`);
        
        // 如果有聊天面板，显示在面板上
        if (this.board && this.board.chatPanel) {
            this.board.chatPanel.appendLine(message, colorType);
        }
    },
    
    /**
     * 添加绿色聊天（好事）
     */
    addGreenChat(message) {
        this.addChat(message, 1);
    },
    
    /**
     * 添加红色聊天（坏事）
     */
    addRedChat(message) {
        this.addChat(message, 2);
    },
    
    /**
     * 添加黄色聊天（提示）
     */
    addYellowChat(message) {
        this.addChat(message, 3);
    },
    
    /**
     * 添加可扩展的聊天链接（点击显示详细信息）
     * 用于建设进度等可查看详情的内容
     * @param {string} linkText 链接文本
     */
    addExpandedChat(linkText) {
        console.log(`[ExpandedChat] ${linkText}`);
        
        // V1.1+: 可扩展聊天（需要ChatPanel支持更多元素类型）
        this.addChat(linkText);
    }
};

