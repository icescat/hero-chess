/**
 * 随机数工具类
 * 统一管理所有随机数生成逻辑
 * V1.0+ 优化：提取162处重复代码
 */

class RandomUtils {
    /**
     * 生成随机整数 [min, max]（包含两端）
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number} 随机整数
     */
    static randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 随机概率判断
     * @param {number} probability 概率（0-1之间）
     * @returns {boolean} 是否命中
     * 
     * 示例：
     * RandomUtils.chance(0.3)  // 30%概率返回true
     * RandomUtils.chance(0.5)  // 50%概率返回true
     */
    static chance(probability) {
        return Math.random() < probability;
    }
    
    /**
     * 随机选择数组中的一个元素
     * @param {Array} array 数组
     * @returns {*} 随机元素
     */
    static choice(array) {
        if (!array || array.length === 0) {
            return null;
        }
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * 随机选择数组中的多个不重复元素
     * @param {Array} array 数组
     * @param {number} count 选择个数
     * @returns {Array} 随机元素数组
     */
    static choices(array, count) {
        if (!array || array.length === 0 || count <= 0) {
            return [];
        }
        
        // 如果请求数量大于等于数组长度，返回打乱的完整数组
        if (count >= array.length) {
            return this.shuffle([...array]);
        }
        
        const result = [];
        const indices = new Set();
        
        while (result.length < count) {
            const index = Math.floor(Math.random() * array.length);
            if (!indices.has(index)) {
                indices.add(index);
                result.push(array[index]);
            }
        }
        
        return result;
    }
    
    /**
     * 打乱数组顺序（Fisher-Yates洗牌算法）
     * @param {Array} array 数组（会被修改）
     * @returns {Array} 打乱后的数组
     */
    static shuffle(array) {
        if (!array || array.length <= 1) {
            return array;
        }
        
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        
        return array;
    }
    
    /**
     * 权重随机选择
     * @param {Array} items 元素数组
     * @param {Array} weights 权重数组（必须与items长度相同）
     * @returns {*} 根据权重随机选择的元素
     * 
     * 示例：
     * RandomUtils.weightedChoice(['A', 'B', 'C'], [1, 2, 3])
     * // A: 16.7%, B: 33.3%, C: 50%
     */
    static weightedChoice(items, weights) {
        if (!items || items.length === 0 || !weights || weights.length !== items.length) {
            return null;
        }
        
        // 计算总权重
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        if (totalWeight <= 0) {
            return null;
        }
        
        // 生成随机数
        let random = Math.random() * totalWeight;
        
        // 根据权重选择
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }
    
    /**
     * 生成随机浮点数 [min, max)
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number} 随机浮点数
     */
    static randFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * 随机布尔值（50%概率）
     * @returns {boolean}
     */
    static randBool() {
        return Math.random() < 0.5;
    }
    
    /**
     * 按百分比概率判断
     * @param {number} percent 百分比（0-100）
     * @returns {boolean}
     * 
     * 示例：
     * RandomUtils.percent(30)  // 30%概率返回true
     */
    static percent(percent) {
        return Math.random() < (percent / 100);
    }
    
    /**
     * 骰子投掷（1-6）
     * @returns {number} 骰子点数
     */
    static rollDice() {
        return this.randInt(1, 6);
    }
    
    /**
     * 投掷多个骰子
     * @param {number} count 骰子数量
     * @returns {number} 总点数
     */
    static rollDices(count = 1) {
        let sum = 0;
        for (let i = 0; i < count; i++) {
            sum += this.rollDice();
        }
        return sum;
    }
}

