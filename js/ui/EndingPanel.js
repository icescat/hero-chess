/**
 * 结局面板
 * 对应 AS3: csh.ui.EndingPanel
 * 
 * 功能：
 * 1. 显示游戏结局文本
 * 2. 显示结局背景
 * 3. 支持多种结局类型
 */

class EndingPanel extends createjs.Container {
    constructor() {
        super();
        this._initUI();
    }
    
    /**
     * 初始化UI
     */
    _initUI() {
        // 黑色背景
        this._background = new createjs.Shape();
        this._background.graphics.beginFill('#000000').drawRect(0, 0, 640, 480);
        this.addChild(this._background);
        
        // 半透明遮罩
        this._mask = new createjs.Shape();
        this._mask.graphics.beginFill('rgba(0,0,0,0.4)').drawRect(0, 0, 640, 480);
        this.addChild(this._mask);
        
        // 文本区域
        this._text = new createjs.Text('', '20px Arial', '#FFFFCC');
        this._text.x = 64;  // 640 * 0.1
        this._text.y = 64;
        this._text.lineWidth = 512;  // 640 * 0.8
        this._text.lineHeight = 28;
        this.addChild(this._text);
        
        // 提示文本
        this._hint = new createjs.Text('', '15px Arial', '#FFFF00');
        this._hint.x = 640 / 2;
        this._hint.y = 440;
        this._hint.textAlign = 'center';
        this.addChild(this._hint);
        
        this.visible = false;
        
        console.log('[EndingPanel] 结局面板已初始化');
    }
    
    /**
     * 显示结局
     * @param {number} endingType 结局类型（1-10）
     * @param {string} partnerName 伴侣名称
     * @param {boolean} animate 是否显示动画
     */
    showEnding(endingType, partnerName = null, animate = false) {
        const endingText = this._getEndingText(endingType, partnerName);
        
        this._text.text = endingText;
        this._hint.text = '按空格或点击鼠标继续';
        
        // 显示面板
        this.visible = true;
        this.alpha = 0;
        
        // 淡入动画
        createjs.Tween.get(this)
            .to({ alpha: 1 }, 1000, createjs.Ease.sineOut);
        
        // 添加到舞台
        if (window.game && window.game._stage) {
            window.game._stage.addChild(this);
        }
        
        // 添加点击关闭事件
        this._setupCloseEvent();
        
        console.log(`[EndingPanel] 显示结局类型${endingType}`);
    }
    
    /**
     * 获取结局文本
     * @param {number} type 结局类型
     * @param {string} partner 伴侣名称
     * @returns {string}
     */
    _getEndingText(type, partner) {
        let text = '';
        
        switch (type) {
            case 1:  // 村里两朵花
                text = `成为勇者王后不久，你与${partner}回村养猪种树，承包鱼塘，经营酒坊，将乡村经济发展得有色有色。次年，${partner}诞下一子，你恐其将来再当勇者，遂作女儿悉心教养，与其母并称村里两朵花。`;
                break;
                
            case 2:  // 龙翔技校
                text = `成为勇者王后不久，你在${partner}的支持下创办龙翔技校，旨在为国家勇者储备培养技术全面的复合型人才。次年，${partner}诞下一女，你开始钻研育女心经，在美少女养成领域也取得了相当成就。`;
                break;
                
            case 3:  // 浮空城颐养天年
                text = `成为勇者王后不久，你陪已怀有数月身孕的${partner}低调返回老家产子，儿子刚降生便能行走自如，于是你带上妻儿再度出发，此一去数十载，游遍天下名川大山奇观异景，最后定居浮空城颐养天年。`;
                break;
                
            case 4:  // 竞技场合体技
                text = `成为勇者王后不久，你与${partner}组队竞技场打22，独门合体技所向披靡未逢敌手，赛季冠军拿到手软。几年后，${partner}产下一对双胞胎，为赚奶粉你们开设武馆教人合体，生活忙碌却很幸福。`;
                break;
                
            case 5:  // 从天台掉下来
                text = `成为勇者王后不久，${partner}向你告知自己原是被魔王消灭的某国的公主，你二话不说变卖房产和宝物，一心为其筹备复国资金，却没想到这竟是个低俗骗局，最后得知真相的你从天台掉下来，卒。`;
                break;
                
            case 6:  // 与狼共舞
                text = `成为勇者王后不久，你回绝了所有来提亲的名门望族，悄然出发去履行与${partner}之间的约定，在山的那边海的那边找到了那片森林，你痴痴看着一丝不挂的${partner}与狼共舞，不禁热泪盈眶。`;
                break;
                
            case 7:  // 跃入大海
                text = `成为勇者王后不久，你厌倦了有名无权的头衔，曾经顶礼膜拜的民众也逐渐褪去热情，不甘被人遗忘的你转投商界目指海商王，却因不善经商很快便血本无归，一怒之下竟在最后一次跑商时纵身跃入大海，卒。`;
                break;
                
            case 8:  // 套马的汉子
                text = `成为勇者王后不久，你生活养尊处优很快便腐败堕落，不但败光家产更欠下巨额嫖资，为躲债潜逃至边陲小镇，凭借一身过硬的骑术干起替人套马的行当，这一干就停不下来，马背上的生活虽单调却也充实。`;
                break;
                
            case 10:  // 成为魔王
                text = `推倒大魔王后，你反复思忖着他临终前所说，人类不可一日无王，怪物也是如此，觉得很有道理，历尽艰险磨难换个勇者王的破头衔谁能忍，王侯将相宁有种乎，穿上这身神装，你便也成了魔王，那么成为下一个勇者的倒霉催又会是谁呢，真是让人期待啊。`;
                break;
                
            default:  // 隐居林中小屋
                text = `成为勇者王后不久，你有感于一身绝技和装备已无用武之地，索性隐居林中小屋，白天采菊捏泥，晚上请人代笔将冒险时期的风流韵事记录成册，发表过多部作品，因内容喜闻乐见在坊间引起过一定反响。`;
                break;
        }
        
        return text;
    }
    
    /**
     * 设置关闭事件
     */
    _setupCloseEvent() {
        // 移除旧的事件监听
        if (window.game && window.game._stage) {
            window.game._stage.off('stagemousedown', this._onCloseHandler);
        }
        
        // 添加新的事件监听
        this._onCloseHandler = () => {
            this.close();
        };
        
        if (window.game && window.game._stage) {
            window.game._stage.on('stagemousedown', this._onCloseHandler);
        }
        
        // 键盘空格关闭
        this._onKeyHandler = (e) => {
            if (e.keyCode === 32) {  // 空格键
                this.close();
            }
        };
        
        window.addEventListener('keydown', this._onKeyHandler);
    }
    
    /**
     * 关闭面板
     * @param {boolean} fadeOut 是否淡出
     */
    close(fadeOut = false) {
        // 移除事件监听
        if (window.game && window.game._stage) {
            window.game._stage.off('stagemousedown', this._onCloseHandler);
        }
        window.removeEventListener('keydown', this._onKeyHandler);
        
        if (fadeOut) {
            // 淡出动画
            createjs.Tween.get(this)
                .to({ alpha: 0 }, 2000, createjs.Ease.sineOut)
                .call(() => {
                    this._removeFromStage();
                });
        } else {
            this._removeFromStage();
        }
        
        console.log('[EndingPanel] 结局面板已关闭');
    }
    
    /**
     * 从舞台移除
     */
    _removeFromStage() {
        this.visible = false;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.removeAllChildren();
    }
}

