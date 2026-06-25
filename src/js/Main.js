/**
 * 游戏主入口
 * 对应 AS3: csh.Main
 * 
 * 职责：
 * 1. 初始化 CreateJS 舞台
 * 2. 加载游戏资源
 * 3. 启动游戏主控制器
 */

class Main {
    constructor() {
        console.log('[Main] 初始化游戏入口...');
        
        // 获取画布和创建舞台
        this._canvas = document.getElementById('gameCanvas');
        this._stage = new createjs.Stage(this._canvas);
        
        // 启用鼠标悬停事件（频率：10次/秒）
        this._stage.enableMouseOver(10);
        
        // 设置帧率（与原 Flash 保持一致）
        createjs.Ticker.framerate = 30;
        createjs.Ticker.addEventListener('tick', this._onTick.bind(this));
        
        // 获取UI元素
        this._loadingScreen = document.getElementById('loading-screen');
        this._loadingProgress = document.getElementById('loadingProgress');
        this._loadingText = document.getElementById('loadingText');
        
        // 开始加载资源
        this._loadAssets();
    }
    
    /**
     * 加载游戏资源
     */
    _loadAssets() {
        console.log('[Main] 开始加载资源...');
        
        // 性能优化：提前并行启动 JSON 数据加载（不阻塞图片加载）
        // DataManager.init() 内部并行 fetch 7 个 JSON，与 LoadQueue 互不依赖
        this._dataPromise = DataManager.init().catch(err => {
            console.error('[Main] 数据预加载失败（将在 _initGame 中重试）:', err);
            return null; // 标记失败，_initGame 会再次尝试
        });
        
        // 检查资源清单是否有内容
        if (typeof AssetManifest !== 'undefined' && 
            AssetManifest.manifest && 
            AssetManifest.manifest.length > 0) {
            
            // 创建加载队列
            // 第一个参数 false = 使用标签加载（HTMLImageElement等），避免 CreateJS 的 IndexedDB 缓存机制
            // （IndexedDB 在某些环境会触发 MANIFEST-000001 IO error，且对图片加载无性能收益）
            this._loadQueue = new createjs.LoadQueue(false);
            
            // 只有在有音频资源时才注册音频插件
            const hasSound = AssetManifest.getSoundAssets().length > 0;
            if (hasSound) {
                this._loadQueue.installPlugin(createjs.Sound);
                console.log('[Main] 音频插件已注册');
            } else {
                console.log('[Main] 没有音频资源，跳过音频插件');
            }
            
            // 监听加载事件
            this._loadQueue.on('progress', this._onLoadProgress.bind(this));
            this._loadQueue.on('complete', this._onLoadComplete.bind(this));
            this._loadQueue.on('error', this._onLoadError.bind(this));
            
            // 加载资源清单
            this._loadQueue.loadManifest(AssetManifest.manifest);
            
        } else {
            console.warn('[Main] 资源清单为空，跳过资源加载');
            // 直接进入游戏初始化
            setTimeout(() => this._onLoadComplete(), 500);
        }
    }
    
    /**
     * 资源加载进度
     */
    _onLoadProgress(event) {
        const progress = Math.round(event.progress * 100);
        this._loadingProgress.style.width = progress + '%';
        this._loadingText.textContent = `加载中... ${progress}%`;
        // 性能优化：仅在关键节点打印日志，避免每帧 console.log 拖慢加载
        if (progress % 25 === 0 || progress === 100) {
            console.log(`[Main] 加载进度: ${progress}%`);
        }
    }
    
    /**
     * 资源加载完成
     */
    _onLoadComplete() {
        console.log('[Main] 资源加载完成');
        
        // 显示加载结果
        if (this._failedAssets && this._failedAssets.length > 0) {
            console.warn(`[Main] 部分资源加载失败 (${this._failedAssets.length}个):`);
            this._failedAssets.forEach(asset => {
                console.warn(`  - ${asset.id}: ${asset.src}`);
            });
            this._loadingText.textContent = `加载完成（${this._failedAssets.length}个资源失败）`;
        } else {
            console.log('[Main] 所有资源加载成功！');
            this._loadingText.textContent = '加载完成！';
        }
        
        // 延迟隐藏加载屏幕
        setTimeout(() => {
            this._loadingScreen.classList.add('hidden');
            // 再延迟一段时间后移除元素
            setTimeout(() => {
                this._loadingScreen.style.display = 'none';
            }, 500);
        }, 500);
        
        // 初始化游戏
        this._initGame();
        
        // 初始化GM面板（延迟确保棋子已创建）
        setTimeout(() => {
            if (window.gmPanel && this._game && this._game._chess) {
                window.gmPanel.setChess(this._game._chess);
                console.log('[Main] GM测试面板已连接到棋子对象');
            } else {
                console.error('[Main] GM面板连接失败:', {
                    gmPanel: !!window.gmPanel,
                    game: !!this._game,
                    chess: !!this._game?._chess
                });
            }
        }, 500);
    }
    
    /**
     * 资源加载错误
     */
    _onLoadError(event) {
        const errorInfo = event && event.data ? event.data : event;
        console.error('[Main] 资源加载失败:', errorInfo);
        
        const errorId = errorInfo && errorInfo.id ? errorInfo.id : '未知资源';
        const errorSrc = errorInfo && errorInfo.src ? errorInfo.src : '';
        
        // 记录失败的资源
        if (!this._failedAssets) {
            this._failedAssets = [];
        }
        this._failedAssets.push({
            id: errorId,
            src: errorSrc,
            type: errorInfo.type
        });
        
        // 判断是否是音频资源
        const isAudio = errorId.startsWith('sound_') || errorSrc.includes('.mp3') || errorSrc.includes('.wav');
        
        if (isAudio) {
            console.warn(`[Main] 音频资源加载失败: ${errorId} (${errorSrc})`);
            console.warn('[Main] 音频资源将被跳过，不影响游戏运行');
        } else {
            console.error(`[Main] 关键资源加载失败: ${errorId} (${errorSrc})`);
            this._loadingText.textContent = '加载失败：' + errorId;
        }
    }
    
    /**
     * 初始化游戏
     */
    async _initGame() {
        console.log('[Main] 初始化游戏...');
        
        // ✅ 等待并行启动的 JSON 数据加载完成
        // （此时 LoadQueue 已完成，数据通常早就加载好了）
        this._loadingText.textContent = '加载游戏数据...';
        try {
            const result = await this._dataPromise;
            // 如果预加载失败（result === null），DataManager 内部 _loaded 标志仍为 false，需要重试
            if (result === null) {
                await DataManager.init();
            }
        } catch (error) {
            console.error('[Main] 数据加载失败:', error);
            this._loadingText.textContent = '数据加载失败！';
            alert('游戏数据加载失败，请刷新页面重试');
            return;
        }
        
        // 创建游戏实例并保存引用
        this._game = new Game();
        this._game.initialize(this._stage, this._loadQueue);
        
        // 设置全局引用（供DiaryPanel等UI组件使用）
        window.game = this._game;
        
        console.log('[Main] 游戏已启动！');
    }
    
    /**
     * 显示欢迎屏幕（已弃用，改用Game类）
     */
    _showWelcomeScreen_deprecated() {
        console.log('[Main] 开始创建欢迎屏幕...');
        
        // 清空舞台
        this._stage.removeAllChildren();
        
        // 创建背景
        const bg = new createjs.Shape();
        bg.graphics.beginLinearGradientFill(
            ['#667eea', '#764ba2'],
            [0, 1],
            0, 0, 0, 480
        );
        bg.graphics.drawRect(0, 0, 640, 480);
        this._stage.addChild(bg);
        console.log('[Main] 背景已创建');
        
        // 字体配置（使用多个 fallback）
        const fontFamily = '"Microsoft YaHei", "微软雅黑", "SimHei", "黑体", Arial, sans-serif';
        
        // 创建标题文本
        const title = new createjs.Text('勇者棋', `bold 48px ${fontFamily}`, '#ffffff');
        title.x = 320;
        title.y = 180;
        title.textAlign = 'center';
        title.textBaseline = 'middle';
        title.shadow = new createjs.Shadow('#000000', 2, 2, 4);
        this._stage.addChild(title);
        console.log('[Main] 标题已创建');
        
        // 创建副标题
        const subtitle = new createjs.Text('Hero Chess', `24px ${fontFamily}`, '#ffffff');
        subtitle.x = 320;
        subtitle.y = 240;
        subtitle.textAlign = 'center';
        subtitle.textBaseline = 'middle';
        subtitle.alpha = 0.8;
        this._stage.addChild(subtitle);
        console.log('[Main] 副标题已创建');
        
        // 创建版本信息
        const version = new createjs.Text('HTML5 版本 - 开发中', `16px ${fontFamily}`, '#ffffff');
        version.x = 320;
        version.y = 300;
        version.textAlign = 'center';
        version.textBaseline = 'middle';
        version.alpha = 0.6;
        this._stage.addChild(version);
        console.log('[Main] 版本信息已创建');
        
        // 创建提示文本
        const hint = new createjs.Text('项目框架已就绪，准备开始迁移...', `14px ${fontFamily}`, '#ffffff');
        hint.x = 320;
        hint.y = 380;
        hint.textAlign = 'center';
        hint.textBaseline = 'middle';
        hint.alpha = 0.5;
        this._stage.addChild(hint);
        console.log('[Main] 提示文本已创建');
        
        // 添加闪烁动画
        createjs.Tween.get(hint, {loop: true})
            .to({alpha: 0.2}, 1000, createjs.Ease.sineInOut)
            .to({alpha: 0.5}, 1000, createjs.Ease.sineInOut);
        console.log('[Main] 动画已启动');
        
        // 强制更新舞台
        this._stage.update();
        
        console.log('[Main] 欢迎屏幕显示完成');
        console.log('[Main] 舞台子对象数量:', this._stage.children.length);
    }
    
    /**
     * 每帧更新
     */
    _onTick(event) {
        // 更新舞台
        this._stage.update(event);
    }
}

// 页面加载完成后启动游戏
window.addEventListener('load', () => {
    console.log('[Main] 页面加载完成，启动游戏...');
    new Main();
});

