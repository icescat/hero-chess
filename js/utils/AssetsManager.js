/**
 * 资源管理器
 * 对应 AS3: csh.utils.AssetsManager
 * 
 * 职责：
 * 1. 管理已加载的资源
 * 2. 提供资源缓存池
 * 3. 根据ID获取资源对象
 */

class AssetsManager {
    constructor() {
        this._pool = {};
        this._loadQueue = null;
    }
    
    /**
     * 初始化资源管理器
     * @param {createjs.LoadQueue} loadQueue - PreloadJS加载队列
     */
    initialize(loadQueue) {
        this._loadQueue = loadQueue;
        console.log('[AssetsManager] 资源管理器已初始化');
    }
    
    /**
     * 根据ID获取资源对象
     * @param {string} id - 资源ID
     * @param {boolean} useCache - 是否使用缓存（默认true）
     * @returns {*} 资源对象
     */
    getObjById(id, useCache = true) {
        // 如果使用缓存且缓存中存在
        if (useCache && this._pool[id]) {
            return this._pool[id];
        }
        
        // 从PreloadJS获取资源
        let obj = null;
        if (this._loadQueue) {
            obj = this._loadQueue.getResult(id);
        }
        
        // 如果需要缓存
        if (obj && useCache) {
            this._pool[id] = obj;
        }
        
        return obj;
    }
    
    /**
     * 添加对象到缓存池
     * @param {*} obj - 要缓存的对象
     * @param {string} id - 对象ID
     */
    addObjToPool(obj, id) {
        this._pool[id] = obj;
    }
    
    /**
     * 从缓存池获取对象
     * @param {string} id - 对象ID
     * @returns {*} 缓存的对象
     */
    getObjFromPool(id) {
        return this._pool[id];
    }
    
    /**
     * 创建位图对象
     * @param {string} id - 图片资源ID
     * @returns {createjs.Bitmap} 位图对象
     */
    createBitmap(id) {
        const img = this.getObjById(id, false);
        if (img) {
            return new createjs.Bitmap(img);
        }
        console.warn(`[AssetsManager] 图片资源不存在: ${id}`);
        return null;
    }
    
    /**
     * 创建精灵对象（从序列帧创建动画）
     * @param {string} prefix - 资源ID前缀（如 'dice_frame_'）
     * @param {number} frameCount - 帧数
     * @returns {Array} 精灵帧数组
     */
    createSpriteFrames(prefix, frameCount) {
        const frames = [];
        for (let i = 1; i <= frameCount; i++) {
            const id = `${prefix}${i}`;
            const img = this.getObjById(id);
            if (img) {
                frames.push(img);
            }
        }
        return frames;
    }
    
    /**
     * 清空缓存池
     */
    clearPool() {
        this._pool = {};
        console.log('[AssetsManager] 缓存池已清空');
    }
}

