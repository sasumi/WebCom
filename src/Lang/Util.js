import {randomString} from "./String.js";

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

const CURRENT_FILE = '/Lang/Util.js';
const ENTRY_FILE = '/index.js';

/**
 * 获取当前库脚本调用地址（这里默认当前库只有两种调用形式：独立模块调用以及合并模块调用）
 * @return {string}
 */
export const getLibEntryScript = ()=>{
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
export const getLibModuleTop =(()=>{
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
const normalizeVersion = (version)=>{
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
export const versionCompare = (version1, version2, index)=>{
	let stringLength = index + 1,
		v1 = normalizeVersion(version1),
		v2 = normalizeVersion(version2);
	if(v1.length > stringLength){
		v1.length = stringLength;
	}
	if(v2.length > stringLength){
		v2.length = stringLength;
	}
	let size = Math.min(v1.length, v2.length),i;
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

window.WEBCOM_GET_LIB_MODULE = getLibModule;
window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;
