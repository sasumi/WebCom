import {formatDate, ONE_DAY, ONE_HOUR, ONE_MINUTE} from "../Lang/Time.js";
import {bindTargetMenu} from "../Widget/Menu.js";
import {triggerDomEvent} from "../Lang/Event.js";

const TYPE_TIME = 'time';
const TYPE_DATE = 'date';
const TYPE_DATETIME = 'datetime';
const TYPE_YEAR = 'year';

const NOW = (new Date).getTime();

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
			return [formatDate('00:00:00', NOW - ONE_HOUR * 3), formatDate('H:i:s')]
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
		['本周（周日） - 今天', () => {
			//todo
			return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['本周（周一） - 今天', () => {
			//todo
			return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['本月1日 - 今天', () => {
			return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['今年1月1日 - 今天', () => {
			return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		'-',
		['上一周', () => {
			//todo
			return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
		['上一个月', () => {
			return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
		}],
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
		['本周（周日） - 今天', () => {
			//todo
			return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d H:i:s')];
		}],
		['本周（周一） - 今天', () => {
			//todo
			return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d H:i:s')];
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
		['今年', () => {
			return [formatDate('Y'), formatDate('Y')];
		}],
		['去年', () => {
			//有误差，但是算了。
			return [formatDate('Y', NOW - 365 * ONE_DAY), formatDate('Y', NOW - 365 * ONE_DAY)];
		}],
		['前年', () => {
			//有误差，但是算了。
			return [formatDate('Y', NOW - 365 * ONE_DAY * 2), formatDate('Y', NOW - 365 * ONE_DAY * 2)];
		}],
		'-',
		['去年 - 今年', () => {
			//有误差，但是算了。
			return [formatDate('Y', NOW - 365 * ONE_DAY), formatDate('Y')];
		}],
		['前年 - 今年', () => {
			//有误差，但是算了。
			return [formatDate('Y', NOW - 365 * ONE_DAY * 2), formatDate('Y', NOW - 365 * ONE_DAY)];
		}],
		['过去5年', () => {
			//有误差，但是算了。
			return [formatDate('Y', NOW - 365 * ONE_DAY * 5), formatDate('Y')];
		}],
	]
};

const resolveType = input => {
	switch(input.type){
		case 'year':
			return TYPE_YEAR;

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
	static init(node, param = {}){
		let inputs = [];
		let target = param.target;
		if(target){
			inputs = document.querySelectorAll(target);
		}else{
			inputs = node.parentNode.querySelectorAll('input');
		}
		if(inputs.length < 2){
			throw "No date inputs found.";
		}
		let type = resolveType(inputs[0]);
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
		return Promise.resolve();
	}
}