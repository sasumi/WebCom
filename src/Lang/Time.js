export const ONE_MINUTE = 60000;
export const ONE_HOUR = 3600000;
export const ONE_DAY = 86400000;
export const ONE_WEEK = 604800000;
export const ONE_MONTH_30 = 2592000000;
export const ONE_MONTH_31 = 2678400000;
export const ONE_YEAR_365 = 31536000000;

export function frequencyControl(payload, hz, executeOnFistTime = false){
	if(payload._frq_tm){
		clearTimeout(payload._frq_tm);
	}
	payload._frq_tm = setTimeout(() => {
		frequencyControl(payload, hz, executeOnFistTime);
	}, hz);
}

/**
 * 获取指定月份天数
 * @param {Number} year
 * @param {Number} month 月份，从1开始
 * @returns {number}
 */
export const getMonthLastDay = (year, month) => {
	const date1 = new Date(year, month, 0)
	return date1.getDate()
}

/**
 * 获取指定上一个月份
 * @param {Number} year
 * @param {Number} month 当前月份，从1开始
 * @returns {Array}
 */
export const getLastMonth = (year, month) => {
	return month === 1 ? [year - 1, 12] : [year, month - 1];
}

/**
 * 获取指定下一个月份
 * @param {Number} year
 * @param {Number} month 当前月份，从1开始
 * @returns {Array}
 */
export const getNextMonth = (year, month) => {
	return month === 12 ? [year + 1, 1] : [year, month + 1];
}

/**
 * 格式化时间长度
 * @param {Number} micSec 毫秒
 * @param {String} delimiter 单位之间的间隔文本
 * @return {string}
 */
export const prettyTime = (micSec, delimiter = '') => {
	let d = 0, h = 0, m = 0, s = 0;
	if(micSec > ONE_DAY){
		d = Math.floor(micSec / ONE_DAY);
		micSec -= d * ONE_DAY;
	}
	if(micSec > ONE_HOUR){
		h = Math.floor(micSec / ONE_HOUR);
		micSec -= h * ONE_HOUR;
	}
	if(micSec > ONE_MINUTE){
		m = Math.floor(micSec / ONE_MINUTE);
		micSec -= m * ONE_MINUTE;
	}
	if(micSec > 1000){
		s = Math.floor(micSec / 1000);
		micSec -= s * 1000;
	}
	let txt = '';
	txt += d ? `${d}天` : '';
	txt += (txt || h) ? `${delimiter}${h}小` : '';
	txt += (txt || m) ? `${delimiter}${m}分` : '';
	txt += (txt || s) ? `${delimiter}${s}秒` : '';
	return txt.trim();
}

/**
 * 指定偏移月数计算
 * @param {Number} monthNum
 * @param {Date|Null} start_date
 * @return {{month: number, year: number}} 返回年、月（以1开始）
 */
export const monthsOffsetCalc = (monthNum, start_date = new Date())=>{
	let year = start_date.getFullYear();
	let month = start_date.getMonth()+1;
	month = month + monthNum;
	if(month > 12){
		let yearNum = parseInt((month - 1) / 12);
		month = month % 12 === 0 ? 12 : month % 12;
		year += yearNum;
	}else if(month <= 0){
		month = Math.abs(month);
		let yearNum = parseInt((month + 12) / 12);
		let n = month % 12;
		if(n === 0){
			year -= yearNum;
			month = 12
		}else{
			year -= yearNum;
			month = Math.abs(12 - n)
		}
	}
	return {year, month}
}
