import {randomString} from "./String.js";
import {getCookie, setCookie} from "./Cookie.js";

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
 * let pp = new ParallelPromise(10); //设置控制器最大并发数量为10
 * let task = (param)=>{  //并发处理任务函数必须返回 promise
 *     return new Promise(resolve=>{
 *         console.log('param:', param);
 *         setTimeout(()=>{
 *             resolve(1);
 *         }, 1000);
 *     });
 * }
 * pp.addPromiseFn(task, {id:'1'}).then(rsp=>{
 *     //task resolve 回调
 * });
 * pp.addPromiseFn(task, {id:'2'}).then(rsp=>{
 *     //task resolve 回调
 * });
 */
export class ParallelPromise {
	parallel_limit = 0; //最大并发数量
	current_running_count = 0; //当前运行中数量
	task_stack = [
		//{promiseFn, args, resolve, reject}
	]; //剩余任务堆栈

	constructor(parallelLimit){
		if(parallelLimit < 1){
			throw "最大并发数量必须大于0";
		}
		this.parallel_limit = parallelLimit;
	}

	loop(){
		for(let i = 0; i < (this.parallel_limit - this.current_running_count); i++){
			if(!this.task_stack.length){
				return;
			}
			this.current_running_count++;
			let {promiseFn, args, resolve, reject} = this.task_stack.shift();
			promiseFn(...args).then(resolve, reject).finally(() => {
				this.current_running_count--;
				this.loop();
			});
		}
	}

	addPromiseFn(promiseFn, ...args){
		return new Promise((resolve, reject) => {
			this.task_stack.push({
				promiseFn: promiseFn,
				args: args,
				resolve,
				reject
			});
			this.loop();
		});
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
export const bindConsole = (method, payload)=>{
	if(method === '*'){
		method = CONSOLE_METHODS;
	}
	if(Array.isArray(method)){
		method.forEach(method=>{
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
export const isPromise = (obj)=>{
	return obj && typeof(obj) === 'object' && obj.then && typeof(obj.then) === 'function';
}

export const PROMISE_STATE_PENDING = 'pending';
export const PROMISE_STATE_FULFILLED = 'fulfilled';
export const PROMISE_STATE_REJECTED = 'rejected';

/**
 * 获取 promise 对象状态
 * @param promise
 * @return {Promise<string>}
 */
export const getPromiseState = (promise)=>{
	const t = {};
	return Promise.race([promise, t])
		.then(v => (v === t) ? PROMISE_STATE_PENDING : PROMISE_STATE_FULFILLED)
		.catch(() => PROMISE_STATE_REJECTED);
}

window.WEBCOM_GET_LIB_MODULE = getLibModule;
window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;
