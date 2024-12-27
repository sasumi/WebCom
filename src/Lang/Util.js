import {randomString} from "./String.js";
import {getCookie, setCookie} from "./Cookie.js";
import {BizEvent} from "./Event.js";

let _guid = 0;
export const guid = (prefix = '') => {
	return 'guid_' + (prefix || randomString(6)) + (++_guid);
};

/**
 * 获取当前函数所在script路径
 * @return {string|null}
 */
export const getCurrentScript = function(){
	let error = new Error()
		, source
		, currentStackFrameRegex = new RegExp(getCurrentScript.name + "\\s*\\((.*):\\d+:\\d+\\)")
		, lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/);
	if((source = currentStackFrameRegex.exec(error.stack.trim()))){
		return source[1];
	}else if((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] !== ""){
		return source[1];
	}else if(error['fileName'] !== undefined){
		return error['fileName'];
	}
	return null;
}

/**
 * 是否在移动设备中
 * @return {boolean}
 */
export const inMobile = () => {
	const useragent = window.navigator.userAgent;
	const regex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
	const regex2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
	return regex.test(useragent) || regex2.test(useragent.substr(0, 4));
}

/**
 * 节流
 * 规定在一个单位时间内，只能触发一次函数。如果这个函数单位时间内触发多次函数，只有一次生效。
 * @param {Function} fn
 * @param {Number} intervalMiSec
 * @return {(function(): void)|*}
 */
export const throttle = (fn, intervalMiSec) => {
	let context, args;
	let previous = 0;
	return function(){
		let now = +new Date();
		context = this;
		args = arguments;
		if(now - previous > intervalMiSec){
			fn.apply(context, args);
			previous = now;
		}
	}();
}

/**
 * 更有效果的节流函数
 * 区别：如果函数执行间隔还没到期，放入下一个时间周期执行，如果已经有下一周期未执行，当前触发作废。
 * 这种效果在 **Change 类型函数场景中更有效果，可以确保最后一次变更能够有效执行
 * @param {Function} fn
 * @param {Number} intervalMiSec
 */
export const throttleEffect = (fn, intervalMiSec) => {
	let context, args;
	let lastExecuteTime = 0;
	let queuing = false;
	return function(){
		if(queuing){
			return;
		}
		let now = +new Date();
		context = this;
		args = arguments;
		let remaining = intervalMiSec - (now - lastExecuteTime);
		if(remaining <= 0){
			fn.apply(context, args);
			lastExecuteTime = now;
		}else{
			queuing = true;
			setTimeout(() => {
				fn.apply(context, args);
				queuing = false;
				lastExecuteTime = now;
			}, remaining)
		}
	};
}

/**
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
 * @param {Function} fn
 * @param {Number} intervalMiSec
 * @return {(function(): void)|*}
 */
export const debounce = (fn, intervalMiSec) => {
	let timeout;
	return function(){
		let context = this;
		let args = arguments;
		clearTimeout(timeout)
		timeout = setTimeout(function(){
			fn.apply(context, args)
		}, intervalMiSec);
	}
}

const CURRENT_FILE = '/Lang/Util.js';
const ENTRY_FILE = '/index.js';

/**
 * 获取当前库脚本调用地址（这里默认当前库只有两种调用形式：独立模块调用以及合并模块调用）
 * @return {string}
 */
export const getLibEntryScript = () => {
	let script = getCurrentScript();
	if(!script){
		throw "Get script failed";
	}
	if(script.indexOf(CURRENT_FILE) >= 0){
		return script.replace(CURRENT_FILE, ENTRY_FILE);
	}
	return script;
}

/**
 * 加载当前库模块
 * @return {Promise<*>}
 */
export const getLibModule = async () => {
	let script = getLibEntryScript();
	return await import(script);
}

/**
 * 获取顶部窗口模块（如果没有顶部窗口，则获取当前窗口模块）
 * @type {(function(): Promise<*>)|undefined}
 */
export const getLibModuleTop = (() => {
	if(top === window){
		return getLibModule;
	}
	if(top.WEBCOM_GET_LIB_MODULE){
		return top.WEBCOM_GET_LIB_MODULE;
	}
	throw "No WebCom library script loaded detected.";
})();

/**
 * 客户端一次性动作
 * @example
 * doOnce('newbee', ()=>{
 *     return new Promise((resolve)=>{
 *          fetch('/cgi-bin/isNewBee', rsp=>{
 *              if(rsp.is_new_bee){
 *                  resolve();
 *              }
 *          });
 *     });
 * }, 'storage').then(()=>{
 *      alert('新人第一次弹出来');
 * }, ()={
 *      console.log('已经不是新人，或者已经弹过对话框了');
 * });
 * @param {String} markKey
 * @param {Function|Null} dataFetcher(): Promise 数据获取器，或者为空（表示第一次触发）
 * @param storageType
 * @returns {Promise<unknown>}
 */
export const doOnce = (markKey, dataFetcher = null, storageType = 'storage') => {
	const MARKUP_STR_VAL = 'TRUE';
	let getMarkState = (key) => {
		switch(storageType.toLowerCase()){
			case 'cookie':
				return getCookie(key) === MARKUP_STR_VAL;
			case 'storage':
				return window.localStorage.getItem(key) === MARKUP_STR_VAL;
			case 'session':
				return window.sessionStorage.getItem(key) === MARKUP_STR_VAL;
			default:
				throw "no support:" + storageType;
		}
	}
	let markUp = (key) => {
		switch(storageType.toLowerCase()){
			case 'cookie':
				return setCookie(key, MARKUP_STR_VAL);
			case 'storage':
				return window.localStorage.setItem(key, MARKUP_STR_VAL);
			case 'session':
				return window.sessionStorage.setItem(key, MARKUP_STR_VAL);
			default:
				throw "no support:" + storageType;
		}
	}
	return new Promise((onHit, noHit) => {
		if(!getMarkState(markKey)){
			if(typeof (dataFetcher) === 'function'){
				dataFetcher().then(() => {
					markUp(markKey);
					onHit()
				}, () => {
					markUp(markKey);
					noHit();
				});
			}else{
				markUp(markKey);
				onHit();
			}
		}else{
			noHit();
		}
	});
}

/**
 * 并发控制器
 * @example 使用方法：
 * let pm = new ParallelPromise({
 *     parallelLimit: 10, //并发数量
 *     timeout: 120, //设置超时时间
 * });
 * pm.onFinish.listen(()=>{});
 * pm.addTask((resolve, reject)=>{
 *     //doSomething
 *     resolve(); //mark done
 * });
 * pm.start();
 */
export class ParallelPromise {
	option = {
		parallelLimit: 5,
		timeout: 60000,
		continueOnError: true,
	}

	stopFlag = false;
	currentRunningCount = 0;
	taskStack = [];

	//完成事件，fire(successResults, failResults)
	onFinish = new BizEvent();

	successResults = [];
	failResults = [];

	/**
	 * constructor
	 * @param {Object} option
	 * @param {Number} option.parallelLimit 并发数量(必须大于0)
	 * @param {Number} option.timeout 超时时间,0表示不设置超时
	 * @param {Boolean} option.continueOnError 是否在错误是继续运行,默认为继续
	 */
	constructor(option = {}){
		this.option = Object.assign(this.option, option);
		if(this.option.parallelLimit < 1){
			throw "最大并发数量必须大于0";
		}
	}

	_loop(){
		let finCount = 0;
		let orgTaskCount = this.taskStack.length;
		for(let i = 0; i < (this.option.parallelLimit - this.currentRunningCount); i++){
			if(finCount === orgTaskCount){
				this.onFinish.fire(this.successResults, this.failResults);
				return;
			}
			if(this.stopFlag || !this.taskStack.length){
				return;
			}
			this.currentRunningCount++;
			let payload = this.taskStack.shift();
			new Promise((resolve, reject) => {
				let tm = null;
				if(this.option.timeout){
					tm = setTimeout(() => {
						reject('task timeout');
					}, this.option.timeout);
				}
				payload((rst) => {
					tm && clearTimeout(tm);
					this.successResults.push(rst);
					resolve();
				}, err => {
					tm && clearTimeout(tm);
					if(!this.option.continueOnError){
						this.stopFlag = true;
					}
					this.failResults.push(err);
					reject(err);
				});
			}).finally(() => {
				this.currentRunningCount--;
				finCount++;
				this._loop();
			});
		}
	}

	/**
	 * 停止后续任务继续执行,已经开始的不受影响
	 */
	stop(){
		this.stopFlag = true;
	}

	/**
	 * 开始运行
	 */
	start(){
		this._loop();
	}

	/**
	 * 添加任务
	 * @param {Function} payload 参数为 resolve, reject, 表示函数执行完成或中断
	 */
	addTask(payload){
		this.taskStack.push(payload);
	}
}

/**
 * 检测目标是否为 Object
 * @param {*} item
 * @returns {boolean}
 */
export const isObject = (item) => {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

export const isFunction = (value) => {
	return value ? (Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function) : false;
}

/**
 * 对象深度拷贝（合并）
 * @param {Object} target
 * @param {Object} sources
 * @returns {Object}
 */
export const mergeDeep = (target, ...sources) => {
	if(!sources.length) return target;
	const source = sources.shift();

	if(isObject(target) && isObject(source)){
		for(const key in source){
			if(isObject(source[key])){
				if(!target[key]){
					Object.assign(target, {[key]: {}});
				}else{
					target[key] = Object.assign({}, target[key])
				}
				mergeDeep(target[key], source[key]);
			}else{
				Object.assign(target, {[key]: source[key]});
			}
		}
	}
	return mergeDeep(target, ...sources);
}

/**
 * 控制台颜色枚举
 */
export const CONSOLE_COLOR = {
	RESET: "\x1b[0m",
	BRIGHT: "\x1b[1m",
	DIM: "\x1b[2m",
	UNDERSCORE: "\x1b[4m",
	BLINK: "\x1b[5m",
	REVERSE: "\x1b[7m",
	HIDDEN: "\x1b[8m",
	FG: {
		BLACK: "\x1b[30m",
		RED: "\x1b[31m",
		GREEN: "\x1b[32m",
		YELLOW: "\x1b[33m",
		BLUE: "\x1b[34m",
		MAGENTA: "\x1b[35m",
		CYAN: "\x1b[36m",
		WHITE: "\x1b[37m",
		GRAY: "\x1b[90m",
	},
	BG: {
		BLACK: "\x1b[40m",
		RED: "\x1b[41m",
		GREEN: "\x1b[42m",
		YELLOW: "\x1b[43m",
		BLUE: "\x1b[44m",
		MAGENTA: "\x1b[45m",
		CYAN: "\x1b[46m",
		WHITE: "\x1b[47m",
		GRAY: "\x1b[100m",
	}
}

const CONSOLE_METHODS = ['debug', 'info', 'log', 'warn', 'error'];
let org_console_methods = {};
/**
 * 绑定控制台的console
 * @param {String|String[]} method
 * @param {Function} payload 处理函数，参数为：(method, args），如果返回是数组，则回回调回原生console
 */
export const bindConsole = (method, payload) => {
	if(method === '*'){
		method = CONSOLE_METHODS;
	}
	if(Array.isArray(method)){
		method.forEach(method => {
			bindConsole(method, payload);
		});
		return;
	}
	if(!org_console_methods[method]){
		org_console_methods[method] = console[method];
	}
	console[method] = function(...args){
		let ret = payload.apply(console, [method, Array.from(args)]);
		if(!Array.isArray(ret)){
			return; //breakup
		}
		org_console_methods[method].apply(console, ret);
	}
}


/**
 * 检测对象是否为Promise对象
 * @param {*} obj
 * @returns {boolean}
 */
export const isPromise = (obj) => {
	return obj && typeof (obj) === 'object' && obj.then && typeof (obj.then) === 'function';
}

export const PROMISE_STATE_PENDING = 'pending';
export const PROMISE_STATE_FULFILLED = 'fulfilled';
export const PROMISE_STATE_REJECTED = 'rejected';

/**
 * 获取 promise 对象状态
 * @param promise
 * @return {Promise<string>}
 */
export const getPromiseState = (promise) => {
	const t = {};
	return Promise.race([promise, t])
		.then(v => (v === t) ? PROMISE_STATE_PENDING : PROMISE_STATE_FULFILLED)
		.catch(() => PROMISE_STATE_REJECTED);
}

window.WEBCOM_GET_LIB_MODULE = getLibModule;
window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;
