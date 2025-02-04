import {formatDate, ONE_DAY, ONE_HOUR, ONE_MINUTE} from "../Lang/Time.js";
import {bindTargetMenu} from "../Widget/Menu.js";
import {triggerDomEvent} from "../Lang/Event.js";

const TYPE_TIME = 'time';
const TYPE_DATE = 'date';
const TYPE_DATETIME = 'datetime';
const TYPE_YEAR = 'year';

const WEEK_TXT_MAP = '一二三四五六日';

const NOW = (new Date).getTime();
const WS = () => {
	return WEEK_TXT_MAP[ACDateRangeSelector.WEEK_START - 1];
}

const TYPE_MAP = {
	[TYPE_TIME]: [
		['近1分钟', () => {
			return [formatDate('H:i:s', NOW - ONE_MINUTE), formatDate('H:i:s')]
		}],
		['近10分钟', () => {
			return [formatDate('H:i:s', NOW - ONE_MINUTE * 10), formatDate('H:i:s')]
		}],
		['近30分钟', () => {
			return [formatDate('H:i:s', NOW - ONE_MINUTE * 30), formatDate('H:i:s')]
		}],
		'-',
		['近1个小时', () => {
			return [formatDate('H:i:s', NOW - ONE_HOUR), formatDate('H:i:s')]
		}],
		['近2个小时', () => {
			return [formatDate('H:i:s', NOW - ONE_HOUR * 2), formatDate('H:i:s')]
		}],
		['近3个小时', () => {
			return [formatDate('H:i:s', NOW - ONE_HOUR * 3), formatDate('H:i:s')]
		}],
		'-',
		['今日0点 - 现在', () => {
			return ['00:00:00', formatDate('H:i:s')]
		}],
	],
	[TYPE_DATE]: [
		['今天', () => {
			return [formatDate('Y-m-d'), formatDate('Y-m-d')]
		}],
		['昨天', () => {
			return [formatDate('Y-m-d', NOW - ONE_DAY), formatDate('Y-m-d', NOW - ONE_DAY)];
		}],
		['前天', () => {
			return [formatDate('Y-m-d', NOW - ONE_DAY * 2), formatDate('Y-m-d', NOW - ONE_DAY * 2)];
		}],
		'-',
		['昨天 - 今天', () => {
			return [formatDate('Y-m-d', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['前天 - 今天', () => {
			return [formatDate('Y-m-d', NOW - ONE_DAY * 2), formatDate('Y-m-d')];
		}],
		['本月1日 - 今天', () => {
			return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['今年1月1日 - 今天', () => {
			return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		'-',
	],
	[TYPE_DATETIME]: [
		['近1分钟', () => {
			return [formatDate('Y-m-d H:i:s', NOW - ONE_MINUTE), formatDate('Y-m-d H:i:s')]
		}],
		['近10分钟', () => {
			return [formatDate('Y-m-d H:i:s', NOW - ONE_MINUTE * 10), formatDate('Y-m-d H:i:s')]
		}],
		['近30分钟', () => {
			return [formatDate('Y-m-d H:i:s', NOW - ONE_MINUTE * 30), formatDate('Y-m-d H:i:s')]
		}],
		'-',
		['近1个小时', () => {
			return [formatDate('Y-m-d H:i:s', NOW - ONE_HOUR), formatDate('Y-m-d H:i:s')]
		}],
		['近2个小时', () => {
			return [formatDate('Y-m-d H:i:s', NOW - ONE_HOUR * 2), formatDate('Y-m-d H:i:s')]
		}],
		['近3个小时', () => {
			return [formatDate('Y-m-d H:i:s', NOW - ONE_HOUR * 3), formatDate('Y-m-d H:i:s')]
		}],
		'-',
		['今天', () => {
			return [formatDate('Y-m-d 00:00:00'), formatDate('Y-m-d H:i:s')]
		}],
		['昨天', () => {
			return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY), formatDate('Y-m-d 23:59:59')];
		}],
		['前天', () => {
			return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY * 2), formatDate('Y-m-d', NOW - ONE_DAY * 2)];
		}],
		'-',
		['昨天 - 今天', () => {
			return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY), formatDate('Y-m-d H:i:s')];
		}],
		['前天 - 今天', () => {
			return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY * 2), formatDate('Y-m-d H:i:s')];
		}],
		['本月1日 - 今天', () => {
			return [formatDate('Y-m-01 00:00:00'), formatDate('Y-m-d H:i:s')];
		}],
		['今年1月1日 - 今天', () => {
			return [formatDate('Y-01-01 00:00:00'), formatDate('Y-m-d H:i:s')];
		}],
		'-',
		['上一周', () => {
			return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['上一个月', () => {
			return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
	],
	[TYPE_YEAR]: [
		[formatDate('Y') + ' 年', () => {
			return [formatDate('Y'), formatDate('Y')];
		}],
		[(new Date).getFullYear() - 1 + ' 年', () => {
			return [(new Date).getFullYear() - 1, (new Date).getFullYear() - 1];
		}],
		[(new Date).getFullYear() - 2 + ' 年', () => {
			return [(new Date).getFullYear() - 2, (new Date).getFullYear() - 2];
		}],
		'-',
		[(new Date).getFullYear() - 1 + ' - ' + formatDate('Y') + ' (去年至今)', () => {
			return [(new Date).getFullYear() - 1, formatDate('Y')];
		}],
		[(new Date).getFullYear() - 2 + ' - ' + formatDate('Y') + ' (前年至今)', () => {
			return [(new Date).getFullYear() - 2, (new Date).getFullYear() - 2];
		}],
		[(new Date).getFullYear() - 5 + ' - ' + formatDate('Y') + ' (过去5年)', () => {
			return [(new Date).getFullYear() - 5, formatDate('Y')];
		}],
	]
};

const resolveType = input => {
	switch(input.type){
		//year 暂不支持，需要由参数指定
		/**
		case 'year':
			return TYPE_YEAR;
		 **/

		case 'date':
			return TYPE_DATE;

		case 'datetime-local':
		case 'datetime':
			return TYPE_DATETIME;

		case 'time':
			return TYPE_TIME;
		default:
			console.error("No Supported Type:", input);
			return null;
	}
}

/**
 * 日期范围选择器
 * 参数：
 * node[data-daterangeselector-target] 日期输入框对象，缺省由node上一级找input
 */
export class ACDateRangeSelector {
	static WEEK_START = 1; //每周是从周一(1)开始算，还是周日(7)开始
	static init(node, params = {}){
		let inputs = [];
		let target = params.target;
		if(target){
			inputs = document.querySelectorAll(target);
		}else{
			inputs = node.parentNode.querySelectorAll('input');
		}
		if(inputs.length < 2){
			throw "No date inputs found.";
		}
		let type = params.type || resolveType(inputs[0]);
		if(!type){
			return;
		}
		let commands = [];
		TYPE_MAP[type].forEach(item => {
			if(item === '-'){
				commands.push(item);
			}else{
				let [title, timesFetcher] = item;
				commands.push([title, () => {
					let [st, ed] = timesFetcher();
					inputs[0].value = st;
					triggerDomEvent(inputs[0], 'change');
					inputs[1].value = ed;
					triggerDomEvent(inputs[1], 'change');
				}, false])
			}
		});
		bindTargetMenu(node, commands, {triggerType: 'mouseover'});
	}
}