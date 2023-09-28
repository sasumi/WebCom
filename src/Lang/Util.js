import {randomString} from "./String.js";
import {getCookie, setCookie} from "./Dom.js";

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
 * @param fn
 * @param intervalMiSec
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
	}
}

/**
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
 * @param fn
 * @param intervalMiSec
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
 * 清理版本，去除无用字符
 * @param {String} version
 * @return {Number[]}
 */
const normalizeVersion = (version) => {
	let trimmed = version ? version.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1") : '',
		pieces = trimmed.split('.'),
		partsLength,
		parts = [],
		value,
		piece,
		num,
		i;
	for(i = 0; i < pieces.length; i += 1){
		piece = pieces[i].replace(/\D/g, '');
		num = parseInt(piece, 10);
		if(isNaN(num)){
			num = 0;
		}
		parts.push(num);
	}
	partsLength = parts.length;
	for(i = partsLength - 1; i >= 0; i -= 1){
		value = parts[i];
		if(value === 0){
			parts.length -= 1;
		}else{
			break;
		}
	}
	return parts;
};

/**
 * 版本比较
 * @param {String} version1
 * @param {String} version2
 * @param {Number} index
 * @return {number|number}
 */
export const versionCompare = (version1, version2, index) => {
	let stringLength = index + 1,
		v1 = normalizeVersion(version1),
		v2 = normalizeVersion(version2);
	if(v1.length > stringLength){
		v1.length = stringLength;
	}
	if(v2.length > stringLength){
		v2.length = stringLength;
	}
	let size = Math.min(v1.length, v2.length), i;
	for(i = 0; i < size; i += 1){
		if(v1[i] !== v2[i]){
			return v1[i] < v2[i] ? -1 : 1;
		}
	}
	if(v1.length === v2.length){
		return 0;
	}
	return (v1.length < v2.length) ? -1 : 1;
}

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
		console.log('并发任务添加：', args);
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
 * 检测对象是否为Promise对象
 * @param {*} obj
 * @returns {boolean}
 */
export const isPromise = (obj)=>{
	return obj && typeof(obj) === 'object' && obj.then && typeof(obj.then) === 'function';
}

window.WEBCOM_GET_LIB_MODULE = getLibModule;
window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;
