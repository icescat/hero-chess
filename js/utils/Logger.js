/**
 * 日志工具类
 * V1.0+ 优化：统一管理游戏的日志输出，支持分级控制
 */

class Logger {
    // 日志级别常量
    static LEVEL = {
        DEBUG: 0,  // 调试信息（开发时）
        INFO: 1,   // 一般信息
        WARN: 2,   // 警告信息
        ERROR: 3,  // 错误信息
        NONE: 4    // 不输出任何日志
    };
    
    // 当前日志级别（默认：DEBUG - 显示所有）
    static currentLevel = Logger.LEVEL.DEBUG;
    
    // 是否显示时间戳
    static showTimestamp = false;
    
    // 是否显示调用栈（仅ERROR）
    static showStack = false;
    
    /**
     * 获取时间戳字符串
     */
    static _getTimestamp() {
        if (!this.showTimestamp) return '';
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const ms = now.getMilliseconds().toString().padStart(3, '0');
        return `${time}.${ms} `;
    }
    
    /**
     * 格式化消息
     */
    static _format(level, args) {
        const timestamp = this._getTimestamp();
        return `${timestamp}[${level}] ${args.join(' ')}`;
    }
    
    /**
     * 调试日志（最详细）
     * 用于开发调试，生产环境应关闭
     */
    static debug(...args) {
        if (this.currentLevel <= this.LEVEL.DEBUG) {
            console.log(this._format('DEBUG', args));
        }
    }
    
    /**
     * 信息日志（常规信息）
     * 用于记录重要的程序流程
     */
    static info(...args) {
        if (this.currentLevel <= this.LEVEL.INFO) {
            console.log(this._format('INFO', args));
        }
    }
    
    /**
     * 警告日志（潜在问题）
     * 用于提示可能的问题，但不影响运行
     */
    static warn(...args) {
        if (this.currentLevel <= this.LEVEL.WARN) {
            console.warn(this._format('WARN', args));
        }
    }
    
    /**
     * 错误日志（严重问题）
     * 用于记录错误，始终显示（除非NONE）
     */
    static error(...args) {
        if (this.currentLevel <= this.LEVEL.ERROR) {
            console.error(this._format('ERROR', args));
            
            // 如果启用，显示调用栈
            if (this.showStack) {
                console.trace();
            }
        }
    }
    
    /**
     * 设置日志级别
     * @param {number} level Logger.LEVEL中的值
     */
    static setLevel(level) {
        this.currentLevel = level;
        console.log(`[Logger] 日志级别设置为: ${this._getLevelName(level)}`);
    }
    
    /**
     * 获取级别名称
     */
    static _getLevelName(level) {
        const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'];
        return names[level] || 'UNKNOWN';
    }
    
    /**
     * 启用/禁用时间戳
     */
    static setShowTimestamp(show) {
        this.showTimestamp = show;
    }
    
    /**
     * 启用/禁用错误栈追踪
     */
    static setShowStack(show) {
        this.showStack = show;
    }
    
    /**
     * 快捷方法：设置为生产模式（只显示ERROR）
     */
    static setProductionMode() {
        this.setLevel(Logger.LEVEL.ERROR);
        console.log('[Logger] 已切换到生产模式（只显示ERROR）');
    }
    
    /**
     * 快捷方法：设置为开发模式（显示所有）
     */
    static setDevelopmentMode() {
        this.setLevel(Logger.LEVEL.DEBUG);
        this.setShowTimestamp(true);
        console.log('[Logger] 已切换到开发模式（显示所有日志）');
    }
    
    /**
     * 快捷方法：完全静音
     */
    static setSilentMode() {
        this.setLevel(Logger.LEVEL.NONE);
        console.log('[Logger] 已切换到静音模式（不显示任何日志）');
    }
}

// 在开发环境中可以方便地切换模式
// 在浏览器控制台中输入：Logger.setProductionMode()


