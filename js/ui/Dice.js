/**
 * 骰子结果显示类
 * 对应 AS3: Dice (symbol136)
 * 
 * 功能：
 * 1. 显示骰子的最终点数
 * 2. 每个点数有4种不同样式
 * 3. 支持1-6点
 * 
 * 资源映射（24帧，每个点数4种样式）：
 * - 1点：dice_frame_1~4
 * - 2点：dice_frame_5~8
 * - 3点：dice_frame_9~12
 * - 4点：dice_frame_13~16
 * - 5点：dice_frame_17~20
 * - 6点：dice_frame_21~24
 * 
 * 备用方案（使用单张图片）：
 * - 46.png (1点)
 * - 48.png (2点)
 * - 50.png (3点)
 * - 52.png (4点)
 * - 54.png (5点)
 * - 56.png (6点)
 */

class Dice extends createjs.Container {
    constructor() {
        super();
        
        // 当前显示的点数
        this._points = 1;
        
        // 显示骰子图像
        this._sprite = null;
        
        this.initialize();
    }
    
    /**
     * 初始化
     */
    initialize() {
        // 默认显示1点
        this.showPoints(1);
    }
    
    /**
     * 显示指定点数
     * @param {number} points 点数（1-6）
     */
    showPoints(points) {
        // 确保点数在1-6范围内
        points = Math.max(1, Math.min(6, points));
        this._points = points;
        
        // 移除旧的显示
        if (this._sprite) {
            this.removeChild(this._sprite);
            this._sprite = null;
        }
        
        // 尝试使用精灵图（24帧版本）
        // 每个点数有4种样式，随机选择一种
        const variant = Math.floor(Math.random() * 4) + 1;  // 1-4
        const frameIndex = (points - 1) * 4 + variant;
        
        let bitmap = Game.assets.createBitmap(`dice_frame_${frameIndex}`);
        
        // 如果精灵图不存在，使用备用单张图片
        if (!bitmap) {
            const backupIds = {
                1: 'ui_46',
                2: 'ui_48',
                3: 'ui_50',
                4: 'ui_52',
                5: 'ui_54',
                6: 'ui_56'
            };
            bitmap = Game.assets.createBitmap(backupIds[points]);
        }
        
        if (bitmap) {
            // 居中对齐
            const bounds = bitmap.getBounds();
            if (bounds) {
                bitmap.x = -bounds.width / 2;
                bitmap.y = -bounds.height / 2;
            }
            this._sprite = bitmap;
            this.addChild(bitmap);
        } else {
            // 创建占位图形
            this._createPlaceholder(points);
        }
    }
    
    /**
     * 创建占位图形
     */
    _createPlaceholder(points) {
        const shape = new createjs.Shape();
        shape.graphics.beginFill('#ffffff');
        shape.graphics.drawRoundRect(-15, -15, 30, 30, 3);
        shape.graphics.endFill();
        
        // 添加点数文字
        const text = new createjs.Text(points.toString(), 'bold 20px Arial', '#000000');
        text.textAlign = 'center';
        text.textBaseline = 'middle';
        
        this._sprite = new createjs.Container();
        this._sprite.addChild(shape);
        this._sprite.addChild(text);
        this.addChild(this._sprite);
    }
    
    /**
     * 获取当前点数
     */
    get points() {
        return this._points;
    }
}

