/**
 * 游戏资源清单
 * 
 * 此文件定义了游戏需要加载的所有资源
 * 资源路径相对于 index.html 文件
 * 
 * 资源分类说明：
 * - 地图格子背景图：2-28开头的图片
 * - UI元素：数字编号的图片
 * - 精灵图：用于动画的序列帧
 */

const AssetManifest = {
    // 资源清单数组
    manifest: [
        // ===== 地图格子背景图 (Map Tiles) =====
        {id: 'western_tile', src: 'assets/images/2_western_tile.jpg'},
        {id: 'village', src: 'assets/images/3_village.png'},
        {id: 'valley_tile', src: 'assets/images/4_valley_tile.jpg'},
        {id: 'trees', src: 'assets/images/5_trees.png'},
        {id: 'town_tile', src: 'assets/images/6_town_tile.jpg'},
        {id: 'town', src: 'assets/images/7_town.png'},
        {id: 'stable', src: 'assets/images/8_stable.png'},
        {id: 'spring', src: 'assets/images/9_spring.png'},
        {id: 'sea_leap', src: 'assets/images/10_sea_leap.jpg'},
        {id: 'school_tile', src: 'assets/images/11_school_tile.jpg'},
        {id: 'roof_leap', src: 'assets/images/12_roof_leap.jpg'},
        {id: 'plain', src: 'assets/images/13_plain.png'},
        {id: 'partner_tile', src: 'assets/images/14_partner_tile.jpg'},
        {id: 'king_crowing', src: 'assets/images/15_king_crowing.jpg'},
        {id: 'house', src: 'assets/images/16_house.png'},
        {id: 'guild', src: 'assets/images/17_guild.png'},
        {id: 'grave', src: 'assets/images/18_grave.png'},
        {id: 'forest_tile', src: 'assets/images/19_forest_tile.jpg'},
        {id: 'fairyland', src: 'assets/images/20_fairyland.png'},
        {id: 'dock', src: 'assets/images/21_dock.png'},
        {id: 'devil', src: 'assets/images/22_devil.png'},
        {id: 'cave', src: 'assets/images/23_cave.png'},
        {id: 'camp', src: 'assets/images/24_camp.png'},
        {id: 'blank', src: 'assets/images/25_blank.png'},
        {id: 'beach', src: 'assets/images/26_beach.png'},
        {id: 'arena', src: 'assets/images/27_arena.png'},
        {id: 'animal_tile', src: 'assets/images/28_animal_tile.jpg'},
        
        // ===== UI 元素图片 =====
        {id: 'ui_41', src: 'assets/images/41.png'},
        {id: 'ui_44', src: 'assets/images/44.png'},
        {id: 'ui_46', src: 'assets/images/46.png'},
        {id: 'ui_48', src: 'assets/images/48.png'},
        {id: 'ui_50', src: 'assets/images/50.png'},
        {id: 'ui_52', src: 'assets/images/52.png'},
        {id: 'ui_54', src: 'assets/images/54.png'},
        {id: 'ui_56', src: 'assets/images/56.png'},
        {id: 'ui_58', src: 'assets/images/58.png'},
        {id: 'ui_62', src: 'assets/images/62.png'},
        {id: 'ui_64', src: 'assets/images/64.png'},
        {id: 'ui_66', src: 'assets/images/66.png'},
        {id: 'ui_68', src: 'assets/images/68.png'},
        {id: 'ui_70', src: 'assets/images/70.png'},
        {id: 'ui_72', src: 'assets/images/72.png'},
        {id: 'ui_74', src: 'assets/images/74.png'},
        {id: 'ui_76', src: 'assets/images/76.png'},
        {id: 'ui_78', src: 'assets/images/78.png'},
        {id: 'ui_80', src: 'assets/images/80.png'},
        {id: 'ui_82', src: 'assets/images/82.png'},
        {id: 'ui_84', src: 'assets/images/84.png'},
        {id: 'ui_88', src: 'assets/images/88.png'},
        {id: 'ui_90', src: 'assets/images/90.png'},
        {id: 'ui_92', src: 'assets/images/92.png'},
        {id: 'ui_94', src: 'assets/images/94.png'},
        {id: 'ui_96', src: 'assets/images/96.png'},
        {id: 'ui_98', src: 'assets/images/98.png'},
        {id: 'ui_100', src: 'assets/images/100.png'},
        {id: 'ui_102', src: 'assets/images/102.png'},
        {id: 'ui_104', src: 'assets/images/104.png'},
        {id: 'ui_106', src: 'assets/images/106.png'},
        {id: 'ui_108', src: 'assets/images/108.png'},
        {id: 'ui_110', src: 'assets/images/110.png'},
        {id: 'ui_112', src: 'assets/images/112.png'},
        {id: 'ui_114', src: 'assets/images/114.png'},
        {id: 'ui_116', src: 'assets/images/116.png'},
        {id: 'ui_118', src: 'assets/images/118.png'},
        {id: 'ui_120', src: 'assets/images/120.png'},
        {id: 'ui_122', src: 'assets/images/122.png'},
        {id: 'ui_124', src: 'assets/images/124.png'},
        {id: 'ui_126', src: 'assets/images/126.png'},
        {id: 'ui_128', src: 'assets/images/128.png'},
        {id: 'ui_130', src: 'assets/images/130.png'},
        {id: 'ui_132', src: 'assets/images/132.png'},
        {id: 'ui_134', src: 'assets/images/134.png'},
        {id: 'ui_139', src: 'assets/images/139.jpg'},
        {id: 'ui_142', src: 'assets/images/142.png'},
        
        // ===== 精灵图 - 滚动骰子动画 (8帧旋转) =====
        {id: 'rolling_dice_1', src: 'assets/sprites/DefineSprite_61_RollingDice/1.png'},
        {id: 'rolling_dice_2', src: 'assets/sprites/DefineSprite_61_RollingDice/2.png'},
        {id: 'rolling_dice_3', src: 'assets/sprites/DefineSprite_61_RollingDice/3.png'},
        {id: 'rolling_dice_4', src: 'assets/sprites/DefineSprite_61_RollingDice/4.png'},
        {id: 'rolling_dice_5', src: 'assets/sprites/DefineSprite_61_RollingDice/5.png'},
        {id: 'rolling_dice_6', src: 'assets/sprites/DefineSprite_61_RollingDice/6.png'},
        {id: 'rolling_dice_7', src: 'assets/sprites/DefineSprite_61_RollingDice/7.png'},
        {id: 'rolling_dice_8', src: 'assets/sprites/DefineSprite_61_RollingDice/8.png'},
        
        // ===== 精灵图 - 骰子点数显示 (24帧) =====
        {id: 'dice_frame_1', src: 'assets/sprites/DefineSprite_136_Dice/1.png'},
        {id: 'dice_frame_2', src: 'assets/sprites/DefineSprite_136_Dice/2.png'},
        {id: 'dice_frame_3', src: 'assets/sprites/DefineSprite_136_Dice/3.png'},
        {id: 'dice_frame_4', src: 'assets/sprites/DefineSprite_136_Dice/4.png'},
        {id: 'dice_frame_5', src: 'assets/sprites/DefineSprite_136_Dice/5.png'},
        {id: 'dice_frame_6', src: 'assets/sprites/DefineSprite_136_Dice/6.png'},
        {id: 'dice_frame_7', src: 'assets/sprites/DefineSprite_136_Dice/7.png'},
        {id: 'dice_frame_8', src: 'assets/sprites/DefineSprite_136_Dice/8.png'},
        {id: 'dice_frame_9', src: 'assets/sprites/DefineSprite_136_Dice/9.png'},
        {id: 'dice_frame_10', src: 'assets/sprites/DefineSprite_136_Dice/10.png'},
        {id: 'dice_frame_11', src: 'assets/sprites/DefineSprite_136_Dice/11.png'},
        {id: 'dice_frame_12', src: 'assets/sprites/DefineSprite_136_Dice/12.png'},
        {id: 'dice_frame_13', src: 'assets/sprites/DefineSprite_136_Dice/13.png'},
        {id: 'dice_frame_14', src: 'assets/sprites/DefineSprite_136_Dice/14.png'},
        {id: 'dice_frame_15', src: 'assets/sprites/DefineSprite_136_Dice/15.png'},
        {id: 'dice_frame_16', src: 'assets/sprites/DefineSprite_136_Dice/16.png'},
        {id: 'dice_frame_17', src: 'assets/sprites/DefineSprite_136_Dice/17.png'},
        {id: 'dice_frame_18', src: 'assets/sprites/DefineSprite_136_Dice/18.png'},
        {id: 'dice_frame_19', src: 'assets/sprites/DefineSprite_136_Dice/19.png'},
        {id: 'dice_frame_20', src: 'assets/sprites/DefineSprite_136_Dice/20.png'},
        {id: 'dice_frame_21', src: 'assets/sprites/DefineSprite_136_Dice/21.png'},
        {id: 'dice_frame_22', src: 'assets/sprites/DefineSprite_136_Dice/22.png'},
        {id: 'dice_frame_23', src: 'assets/sprites/DefineSprite_136_Dice/23.png'},
        {id: 'dice_frame_24', src: 'assets/sprites/DefineSprite_136_Dice/24.png'},
        
        // ===== 精灵图 - 头像 =====
        {id: 'avatar_1', src: 'assets/sprites/DefineSprite_138_avatar/1.png'},
        {id: 'avatar_2', src: 'assets/sprites/DefineSprite_138_avatar/2.png'},
        
        // ===== 精灵图 - UI面板 =====
        {id: 'sprite_144', src: 'assets/sprites/DefineSprite_144/1.png'},
        {id: 'sprite_148', src: 'assets/sprites/DefineSprite_148/1.png'},
        
        // ===== 精灵图 - 其他UI元素 =====
        {id: 'tips_1', src: 'assets/sprites/DefineSprite_33_tips/1.png'},
        {id: 'tips_2', src: 'assets/sprites/DefineSprite_33_tips/2.png'},
        {id: 'paper1', src: 'assets/sprites/DefineSprite_35_paper1/1.png'},
        {id: 'diary_panel', src: 'assets/sprites/DefineSprite_37_csh.ui.DiaryPanel/1.png'},
        {id: 'autobutton_1', src: 'assets/sprites/DefineSprite_40_autobutton/1.png'},
        {id: 'autobutton_2', src: 'assets/sprites/DefineSprite_40_autobutton/2.png'},
        {id: 'skull', src: 'assets/sprites/DefineSprite_43_skull/1.png'},
        {id: 'savetip', src: 'assets/sprites/DefineSprite_157_savetip/1.png'},
        
        // 注意：标题面板、滚动骰子、英雄模型等多帧动画资源
        // 在实际使用时会按需加载，此处先注册关键帧
    ],
    
    /**
     * 根据 ID 获取资源
     */
    getAsset(id) {
        return this.manifest.find(item => item.id === id);
    },
    
    /**
     * 根据 ID 获取资源路径
     */
    getAssetPath(id) {
        const asset = this.getAsset(id);
        return asset ? asset.src : null;
    },
    
    /**
     * 获取所有地图格子资源
     */
    getTileAssets() {
        return this.manifest.filter(item => 
            item.id.includes('tile') || 
            item.id.match(/^(village|town|stable|spring|house|guild|grave|fairyland|dock|devil|cave|camp|blank|beach|arena|trees|plain)$/)
        );
    },
    
    /**
     * 获取所有UI资源
     */
    getUIAssets() {
        return this.manifest.filter(item => item.id.startsWith('ui_'));
    },
    
    /**
     * 获取骰子动画所有帧
     */
    getDiceFrames() {
        return this.manifest.filter(item => item.id.startsWith('dice_frame_'));
    },
    
    /**
     * 获取资源总数
     */
    getTotalCount() {
        return this.manifest.length;
    }
};

// 资源分类统计
AssetManifest.stats = {
    tiles: 27,      // 地图格子背景
    ui: 42,         // UI元素
    diceFrames: 24, // 骰子动画帧
    avatars: 2,     // 头像
    others: 10,     // 其他精灵图
    total: 0
};

AssetManifest.stats.total = AssetManifest.manifest.length;

console.log('[AssetManifest] 资源清单已加载');
console.log(`[AssetManifest] 资源总数: ${AssetManifest.stats.total}`);
console.log(`[AssetManifest] 地图格子: ${AssetManifest.stats.tiles}, UI元素: ${AssetManifest.stats.ui}`);
