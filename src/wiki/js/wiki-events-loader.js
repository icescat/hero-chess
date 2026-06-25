/**
 * 勇者棋 Wiki - 格子事件数据加载器
 * 统一管理所有格子事件数据
 */

// 获取指定格子的详细数据
function getCellDetailData(cellId) {
    // 根据cellId返回对应的事件数据
    // 数据定义在各个独立的事件文件中
    
    switch(cellId) {
        // 城镇和仙人岛（在wiki-events-data.js中）
        case 'town':
            return typeof CELL_EVENTS_DATA !== 'undefined' ? CELL_EVENTS_DATA.town : null;
        
        case 'fairyland':
            return typeof CELL_EVENTS_DATA !== 'undefined' ? CELL_EVENTS_DATA.fairyland : null;
        
        // 独立事件文件
        case 'village':
            return typeof VILLAGE_EVENTS !== 'undefined' ? VILLAGE_EVENTS : null;
        
        case 'guild':
            return typeof GUILD_EVENTS !== 'undefined' ? GUILD_EVENTS : null;
        
        case 'camp':
            return typeof CAMP_EVENTS !== 'undefined' ? CAMP_EVENTS : null;
        
        case 'stable':
            return typeof STABLE_EVENTS !== 'undefined' ? STABLE_EVENTS : null;
        
        case 'arena':
            return typeof ARENA_EVENTS !== 'undefined' ? ARENA_EVENTS : null;
        
        case 'dungeon':
            return typeof DUNGEON_EVENTS !== 'undefined' ? DUNGEON_EVENTS : null;
        
        case 'dock':
            return typeof DOCK_EVENTS !== 'undefined' ? DOCK_EVENTS : null;
        
        case 'house':
            return typeof HOUSE_EVENTS !== 'undefined' ? HOUSE_EVENTS : null;
        
        case 'spring':
            return typeof SPRING_EVENTS !== 'undefined' ? SPRING_EVENTS : null;
        
        case 'grave':
            return typeof GRAVE_EVENTS !== 'undefined' ? GRAVE_EVENTS : null;
        
        case 'plain':
            return typeof PLAIN_EVENTS !== 'undefined' ? PLAIN_EVENTS : null;
        
        case 'forest':
            return typeof FOREST_EVENTS !== 'undefined' ? FOREST_EVENTS : null;
        
        case 'beach':
            return typeof BEACH_EVENTS !== 'undefined' ? BEACH_EVENTS : null;
        
        // 魔王岛有单独页面
        case 'devilland':
            return {
                id: 'devilland',
                title: '🌋 魔王岛',
                description: '终极挑战区域，请查看"魔王岛"专页',
                location: '通过码头（#8或#27）乘船到达',
                events: [
                    {
                        name: '前往专页查看',
                        probability: '专页详情',
                        trigger: '点击侧边栏"魔王岛"',
                        flow: '<div class="probability-tree"><div class="tree-node info"><div class="node-content">📄 魔王岛有独立专页</div><div class="node-detail">请点击侧边栏"魔王岛"查看详细信息</div></div></div>',
                        details: ['魔王岛系统较为复杂，拥有独立的专页介绍']
                    }
                ]
            };
        
        default:
            return {
                id: cellId,
                title: '未完成',
                description: '该格子的详细事件数据尚未完成',
                location: '待补充',
                events: []
            };
    }
}

console.log('[wiki-events-loader] 事件数据加载器已就绪');
