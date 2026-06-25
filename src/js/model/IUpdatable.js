/**
 * 可更新对象接口基类
 * 对应 AS3: csh.model.IUpdatable
 * 
 * 所有需要在游戏主循环中更新的对象都应该继承此类
 */

class IUpdatable {
    constructor() {
        this._id = 0;
    }
    
    /**
     * 获取对象ID
     */
    get id() {
        return this._id;
    }
    
    /**
     * 设置对象ID
     */
    set id(value) {
        this._id = value;
    }
    
    /**
     * 更新方法（子类需要重写）
     */
    update() {
        // 子类实现
    }
}

