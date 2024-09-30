export const ONE_MINUTE = 60000;
export const ONE_HOUR = 3600000;
export const ONE_DAY = 86400000;
export const ONE_WEEK = 604800000;
export const ONE_MONTH_30 = 2592000000;
export const ONE_MONTH_31 = 2678400000;
export const ONE_YEAR_365 = 31536000000;

/**
 * 限制函数执行频率
 * @param {Function} payload
 * @param interval
 * @param executeOnFistTime
 */
export function frequencyControl(payload, interval, executeOnFistTime = false){
	if(payload._frq_tm){
		clearTimeout(payload._frq_tm);
	}
	payload._frq_tm = setTimeout(() => {
		frequencyControl(payload, interval, executeOnFistTime);
	}, interval);
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
 * 计时（该方法采用timeout方式，不够精准
 * @param {Number} timeout
 * @param {Function} tickFunc
 * @param {Function} onFinish
 */
export const countDown = (timeout, tickFunc, onFinish) => {
	let loop = () => {
		tickFunc && tickFunc(timeout);
		if(timeout-- > 0){
			setTimeout(loop, 1000);
			return;
		}
		onFinish && onFinish();
	};
	loop();
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
	txt += (txt || h) ? `${delimiter}${h}小时` : '';
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
export const monthsOffsetCalc = (monthNum, start_date = new Date()) => {
	let year = start_date.getFullYear();
	let month = start_date.getMonth() + 1;
	month = month + monthNum;
	if(month > 12){
		let yearNum = Math.floor((month - 1) / 12);
		month = month % 12 === 0 ? 12 : month % 12;
		year += yearNum;
	}else if(month <= 0){
		month = Math.abs(month);
		let yearNum = Math.floor((month + 12) / 12);
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

/**
 * Defining locale
 * @type {string[]}
 */
const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * PHP 时间函数映射
 * 具体含义可以参考：http://php.net/manual/en/function.date.php
 * 或者 php.date.en.md
 */
const PHP_DATE_CHAR_MAP = {
	d: dateObj => {
		let d = dateObj.getDate();
		return (d < 10 ? '0' : '') + d
	},
	D: dateObj => {
		return shortDays[dateObj.getDay()]
	},
	j: dateObj => {
		return dateObj.getDate()
	},
	l: dateObj => {
		return longDays[dateObj.getDay()]
	},
	N: dateObj => {
		let N = dateObj.getDay();
		return (N === 0 ? 7 : N)
	},
	S: dateObj => {
		let S = dateObj.getDate();
		return (S % 10 === 1 && S !== 11 ? 'st' : (S % 10 === 2 && S !== 12 ? 'nd' : (S % 10 === 3 && S !== 13 ? 'rd' : 'th')))
	},
	w: dateObj => {
		return dateObj.getDay()
	},
	z: dateObj => {
		let d = new Date(dateObj.getFullYear(), 0, 1);
		return Math.ceil((dateObj - d) / 86400000)
	},
	// Week
	W: dateObj => {
		let target = new Date(dateObj.valueOf())
		let dayNr = (dateObj.getDay() + 6) % 7
		target.setDate(target.getDate() - dayNr + 3)
		let firstThursday = target.valueOf()
		target.setMonth(0, 1)
		if(target.getDay() !== 4){
			target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
		}
		let retVal = 1 + Math.ceil((firstThursday - target) / 604800000)

		return (retVal < 10 ? '0' + retVal : retVal)
	},
	// Month
	F: dateObj => {
		return longMonths[dateObj.getMonth()]
	},
	m: dateObj => {
		let m = dateObj.getMonth();
		return (m < 9 ? '0' : '') + (m + 1)
	},
	M: dateObj => {
		return shortMonths[dateObj.getMonth()]
	},
	n: dateObj => {
		return dateObj.getMonth() + 1
	},
	t: dateObj => {
		let year = dateObj.getFullYear()
		let nextMonth = dateObj.getMonth() + 1
		if(nextMonth === 12){
			year = year++
			nextMonth = 0
		}
		return new Date(year, nextMonth, 0).getDate()
	},
	// Year
	L: dateObj => {
		let L = dateObj.getFullYear();
		return (L % 400 === 0 || (L % 100 !== 0 && L % 4 === 0))
	},
	o: dateObj => {
		let d = new Date(dateObj.valueOf());
		d.setDate(d.getDate() - ((dateObj.getDay() + 6) % 7) + 3);
		return d.getFullYear()
	},
	Y: dateObj => {
		return dateObj.getFullYear()
	},
	y: dateObj => {
		return ('' + dateObj.getFullYear()).substr(2)
	},
	// Time
	a: dateObj => {
		return dateObj.getHours() < 12 ? 'am' : 'pm'
	},
	A: dateObj => {
		return dateObj.getHours() < 12 ? 'AM' : 'PM'
	},
	B: dateObj => {
		return Math.floor((((dateObj.getUTCHours() + 1) % 24) + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600) * 1000 / 24)
	},
	g: dateObj => {
		return dateObj.getHours() % 12 || 12
	},
	G: dateObj => {
		return dateObj.getHours()
	},
	h: dateObj => {
		let h = dateObj.getHours();
		return ((h % 12 || 12) < 10 ? '0' : '') + (h % 12 || 12)
	},
	H: dateObj => {
		let H = dateObj.getHours();
		return (H < 10 ? '0' : '') + H
	},
	i: dateObj => {
		let i = dateObj.getMinutes();
		return (i < 10 ? '0' : '') + i
	},
	s: dateObj => {
		let s = dateObj.getSeconds();
		return (s < 10 ? '0' : '') + s
	},
	v: dateObj => {
		let v = dateObj.getMilliseconds();
		return (v < 10 ? '00' : (v < 100 ? '0' : '')) + v
	},
	// Timezone
	e: dateObj => {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	},
	I: dateObj => {
		let DST = null
		for(let i = 0; i < 12; ++i){
			let d = new Date(dateObj.getFullYear(), i, 1)
			let offset = d.getTimezoneOffset()

			if(DST === null) DST = offset
			else if(offset < DST){
				DST = offset;
				break
			}else if(offset > DST) break
		}
		return (dateObj.getTimezoneOffset() === DST) | 0
	},
	O: dateObj => {
		let O = dateObj.getTimezoneOffset();
		return (-O < 0 ? '-' : '+') + (Math.abs(O / 60) < 10 ? '0' : '') + Math.floor(Math.abs(O / 60)) + (Math.abs(O % 60) === 0 ? '00' : ((Math.abs(O % 60) < 10 ? '0' : '')) + (Math.abs(O % 60)))
	},
	P: dateObj => {
		let P = dateObj.getTimezoneOffset();
		return (-P < 0 ? '-' : '+') + (Math.abs(P / 60) < 10 ? '0' : '') + Math.floor(Math.abs(P / 60)) + ':' + (Math.abs(P % 60) === 0 ? '00' : ((Math.abs(P % 60) < 10 ? '0' : '')) + (Math.abs(P % 60)))
	},
	T: dateObj => {
		let tz = dateObj.toLocaleTimeString(navigator.language, {timeZoneName: 'short'}).split(' ');
		return tz[tz.length - 1]
	},
	Z: dateObj => {
		return -dateObj.getTimezoneOffset() * 60
	},
	// Full Date/Time
	c: dateObj => {
		return dateObj.format('Y-m-d\\TH:i:sP')
	},
	r: dateObj => {
		return dateObj.toString()
	},
	U: dateObj => {
		return Math.floor(dateObj.getTime() / 1000)
	}
}

/**
 * 格式化日期（以PHP方式格式化）
 * @param {String} format
 * @param {Object,Number,String} date 日期，可以是日期对象、毫秒数或者日期字符串，缺省为今天
 * @return {String}
 */
export const formatDate = function(format, date = null){
	let dateObj = null;
	if(typeof date === 'object' && date !== null){
		dateObj = date;
	}else{
		dateObj = new Date(date || (new Date().getTime()));
	}
	return format.replace(/(\\?)(.)/g, function(_, esc, chr){
		return (esc === '' && PHP_DATE_CHAR_MAP[chr]) ? PHP_DATE_CHAR_MAP[chr](dateObj) : chr
	})
}