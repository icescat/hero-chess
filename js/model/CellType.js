/**
 * 格子类型枚举
 * 对应 AS3: csh.model.CellType
 * 
 * 定义所有棋盘格子的类型常量
 */

class CellType {
    // 所有格子类型常量
    static TOWN = 1;        // 城镇
    static VILLAGE = 2;     // 村庄
    static HOUSE = 3;       // 房屋/空地
    static GRAVE = 4;       // 墓地
    static GUILD = 5;       // 勇者公会
    static DOCK = 6;        // 码头
    static CAMP = 7;        // 营地
    static SPRING = 8;      // 温泉
    static STABLE = 9;      // 马场
    static ARENA = 10;      // 竞技场
    static FAIRYLAND = 11;  // 仙人岛
    static DEVILLAND = 12;  // 魔王岛
    static DUNGEON = 13;    // 副本
    static PLAIN = 14;      // 平原
    static WOODS = 15;      // 林地
    static BEACH = 16;      // 沙滩
    
    /**
     * 获取格子类型名称
     * @param {number} cellType
     * @returns {string}
     */
    static getName(cellType) {
        const names = {
            1: '城镇', 2: '村庄', 3: '房屋', 4: '墓地',
            5: '公会', 6: '码头', 7: '营地', 8: '温泉',
            9: '马场', 10: '竞技场', 11: '仙人岛', 12: '魔王岛',
            13: '副本', 14: '平原', 15: '林地', 16: '沙滩'
        };
        return names[cellType] || `未知(${cellType})`;
    }
}

