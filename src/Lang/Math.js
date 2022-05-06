export const between = (val, min, max)=>{
	return val >= min && val <= max;
};

/**
 * 取整
 * @param {Number} num
 * @param {Number} digits 小数点位数
 * @returns {number}
 */
export const round = (num, digits) => {
	digits = digits === undefined ? 2 : digits;
	let multiple = Math.pow(10, digits);
	return Math.round(num * multiple) / multiple;
}