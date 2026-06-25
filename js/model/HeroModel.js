/**
 * 英雄模型类 - 完整版
 * 对应 AS3: csh.model.HeroModel
 * 
 * 功能：
 * 1. 帧动画系统（4方向 × 3帧 = 12帧）
 * 2. 方向切换（上下左右）
 * 3. 动画播放控制（开始/停止）
 * 4. 死亡/复活状态
 * 
 * 资源映射：
 * - 向上：帧1-3（ui_62, ui_64, ui_66）
 * - 向右：帧4-6（ui_68, ui_70, ui_72）
 * - 向下：帧7-9（ui_74, ui_76, ui_78）
 * - 向左：帧10-12（ui_80, ui_82, ui_84）
 */

class HeroModel extends createjs.Container {
    constructor() {
        super();
        
        // 帧数据定义（对应原AS3的帧编号）
        this._upFrame = 0;      // 向上起始帧索引（对应AS3帧1）
        this._rightFrame = 3;   // 向右起始帧索引（对应AS3帧4）
        this._downFrame = 6;    // 向下起始帧索引（对应AS3帧7）
        this._leftFrame = 9;    // 向左起始帧索引（对应AS3帧10）
        
        // 当前状态
        this._curDir = Chessboard.RIGHT;  // 默认朝右（与原AS3一致）
        this._loopBegin = this._rightFrame;
        this._currentFrame = 0;
        
        // 动画状态
        this._awaiting = true;   // 等待状态（不播放动画）
        this._isDead = false;    // 死亡状态
        this._flag = false;      // 帧标志（用于降低动画速度）
        
        // 显示对象
        this._sprite = null;
        this._frames = [];       // 帧图片数组
        
        this.initialize();
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 加载所有帧图片（62-84，偶数编号，共12帧）
        const frameIds = [
            'ui_62', 'ui_64', 'ui_66',  // 向上3帧
            'ui_68', 'ui_70', 'ui_72',  // 向右3帧
            'ui_74', 'ui_76', 'ui_78',  // 向下3帧
            'ui_80', 'ui_82', 'ui_84'   // 向左3帧
        ];
        
        // 创建所有帧的Bitmap对象
        for (let i = 0; i < frameIds.length; i++) {
            const bitmap = Game.assets.createBitmap(frameIds[i]);
            if (bitmap) {
                // 居中对齐
                const bounds = bitmap.getBounds();
                if (bounds) {
                    bitmap.x = -bounds.width / 2;
                    bitmap.y = -bounds.height / 2;
                }
                bitmap.visible = false;  // 默认隐藏
                this._frames.push(bitmap);
                this.addChild(bitmap);
            }
        }
        
        // 如果没有加载到图片，创建占位图形
        if (this._frames.length === 0) {
            this._createPlaceholder();
        } else {
            // 显示初始帧
            this._currentFrame = this._loopBegin;
            this._showFrame(this._currentFrame);
        }
        
        // 监听Ticker事件（相当于AS3的ENTER_FRAME）
        createjs.Ticker.addEventListener('tick', this._onTick.bind(this));
        
        // 缓存到资源管理器
        if (Game.assets) {
            Game.assets.addObjToPool(this, 'heromodel');
        }
        
        console.log('[HeroModel] 英雄模型已创建，共加载', this._frames.length, '帧');
    }
    
    /**
     * 创建占位图形
     */
    _createPlaceholder() {
        const shape = new createjs.Shape();
        shape.graphics.beginFill('#ff6b6b');
        shape.graphics.drawCircle(0, 0, 15);
        shape.graphics.endFill();
        
        // 添加眼睛
        shape.graphics.beginFill('#ffffff');
        shape.graphics.drawCircle(-5, -3, 3);
        shape.graphics.drawCircle(5, -3, 3);
        shape.graphics.endFill();
        
        shape.graphics.beginFill('#000000');
        shape.graphics.drawCircle(-5, -3, 1);
        shape.graphics.drawCircle(5, -3, 1);
        shape.graphics.endFill();
        
        this._sprite = shape;
        this.addChild(shape);
    }
    
    /**
     * 显示指定帧
     */
    _showFrame(frameIndex) {
        // 隐藏所有帧
        for (let i = 0; i < this._frames.length; i++) {
            this._frames[i].visible = false;
        }
        
        // 显示指定帧
        if (frameIndex >= 0 && frameIndex < this._frames.length) {
            this._frames[frameIndex].visible = true;
        }
    }
    
    /**
     * 帧循环事件（相当于AS3的ENTER_FRAME）
     */
    _onTick(event) {
        // 如果处于等待状态或死亡状态，不播放动画
        if (this._awaiting || this._frames.length === 0) {
            return;
        }
        
        // 使用flag降低动画速度（每2帧更新1次）
        if (!this._flag) {
            this._flag = true;
            
            // 计算当前在循环中的位置
            const relativeFrame = this._currentFrame - this._loopBegin;
            
            if (relativeFrame < 2) {
                // 还在循环的前2帧，继续下一帧
                this._currentFrame++;
            } else {
                // 到达第3帧，回到起始帧
                this._currentFrame = this._loopBegin;
            }
            
            this._showFrame(this._currentFrame);
            return;
        }
        
        this._flag = false;
    }
    
    /**
     * 改变方向
     * @param {number} dir 方向（Chessboard.UP/RIGHT/DOWN/LEFT）
     */
    changeDir(dir) {
        // 如果方向相同，不需要改变
        if (this._curDir === dir) {
            return;
        }
        
        this._curDir = dir;
        
        // 根据方向选择起始帧
        switch(dir) {
            case Chessboard.UP:
                this._loopBegin = this._upFrame;
                break;
            case Chessboard.RIGHT:
                this._loopBegin = this._rightFrame;
                break;
            case Chessboard.DOWN:
                this._loopBegin = this._downFrame;
                break;
            case Chessboard.LEFT:
                this._loopBegin = this._leftFrame;
                break;
        }
        
        // 切换到该方向的起始帧
        this._currentFrame = this._loopBegin;
        this._showFrame(this._currentFrame);
        
        console.log(`[HeroModel] 方向改变: ${dir}, 起始帧: ${this._loopBegin}`);
    }
    
    /**
     * 开始播放动画
     */
    startPlay() {
        if (!this._isDead) {
            this._awaiting = false;
            console.log('[HeroModel] 开始播放动画');
        }
    }
    
    /**
     * 停止播放动画
     */
    stopPlay() {
        this._awaiting = true;
        // 回到当前方向的起始帧
        this._currentFrame = this._loopBegin;
        this._showFrame(this._currentFrame);
        console.log('[HeroModel] 停止播放动画');
    }
    
    /**
     * 死亡
     */
    dead() {
        this._awaiting = true;
        this._isDead = true;
        
        // 显示死亡状态（最后一帧或半透明）
        this.alpha = 0.5;
        console.log('[HeroModel] 死亡状态');
    }
    
    /**
     * 复活
     */
    revive() {
        this._isDead = false;
        this.alpha = 1.0;
        
        // 回到当前方向的起始帧
        this._currentFrame = this._loopBegin;
        this._showFrame(this._currentFrame);
        console.log('[HeroModel] 复活');
    }
}

