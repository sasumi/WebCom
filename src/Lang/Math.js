/** 黄金分割比 0.618 **/
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2 - 1;

/**
 * 检测指定值是否在指定区间内
 * @param {Number} val
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} includeEqual 是否包含等于判断
 * @returns {boolean}
 */
export const between = (val, min, max, includeEqual = true) => {
	return includeEqual ? (val >= min && val <= max) : (val > min && val < max);
};

/**
 * 随机整数
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
export const randomInt = (min, max) => {
	return Math.floor(Math.random() * (max + 1 - min)) + min;
};

/**
 * 取整
 * @param {Number} num
 * @param {Number} precision 精度，默认为两位小数
 * @returns {number}
 */
export const round = (num, precision = 2) => {
	let multiple = Math.pow(10, precision);
	return Math.round(num * multiple) / multiple;
}