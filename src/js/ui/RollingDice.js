/**
 * 滚动骰子动画类
 * 对应 AS3: RollingDice (symbol61)
 * 
 * 功能：
 * 1. 8帧旋转动画（透明底图）
 * 2. 从起点弹跳到目标位置
 * 3. 到达后切换为静止骰子
 * 
 * 资源：DefineSprite_61_RollingDice/1-8.png
 */

class RollingDice extends createjs.Container {
    constructor() {
        super();
        
        // 动画帧数组
        this._frames = [];
        this._currentFrame = 0;
        this._totalFrames = 8;  // 8帧旋转动画
        this._isPlaying = false;
        
        this.initialize();
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 加载8帧旋转动画（透明底图）
        for (let i = 1; i <= this._totalFrames; i++) {
            const bitmap = Game.assets.createBitmap(`rolling_dice_${i}`);
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
            // 显示第一帧
            this._showFrame(0);
            // 监听Ticker事件来播放动画
            createjs.Ticker.addEventListener('tick', this._onTick.bind(this));
        }
        
        console.log(`[RollingDice] 滚动骰子已创建，共${this._frames.length}帧`);
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
     * 帧循环事件
     */
    _onTick(event) {
        // 如果骰子在舞台上且有帧数据，就播放动画
        if (this.parent && this._frames.length > 0) {
            this._currentFrame = (this._currentFrame + 1) % this._totalFrames;
            this._showFrame(this._currentFrame);
        }
    }
    
    /**
     * 创建占位图形
     */
    _createPlaceholder() {
        const shape = new createjs.Shape();
        shape.graphics.beginFill('#ff6b6b');
        shape.graphics.drawRect(-15, -15, 30, 30);
        shape.graphics.endFill();
        
        // 添加问号
        const text = new createjs.Text('?', 'bold 20px Arial', '#ffffff');
        text.x = -6;
        text.y = -12;
        
        const container = new createjs.Container();
        container.addChild(shape);
        container.addChild(text);
        this._frames.push(container);
        this.addChild(container);
    }
}

