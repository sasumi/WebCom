import {cssSelectorEscape, escapeAttr} from "./String.js";
import {isButton} from "./Dom.js";
import {guid} from "./Util.js";
import {Theme} from "../Widget/Theme.js";
import {isEquals} from "./Array.js";

/**
 * 检测元素是否可以输入（包含checkbox、radio类）
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export const inputAble = el => {
	if(el.disabled || //禁用
		el.readOnly || //只读
		el.tagName === 'BUTTON' || //按钮
		(el.tagName === 'INPUT' && ['hidden', 'button','submit', 'reset'].includes(el.type)) //隐藏表单、按钮、提交按钮、重置按钮
	){
		return false;
	}
	return true;
}

/**
 * 获取form元素值。
 * 该函数过滤元素disabled情况，但不判断name是否存在
 * 针对多重选择，提取数据格式为数组
 * @param {HTMLFormElement} el
 * @returns {String|Array|null} 元素值，发生错误时返回null
 */
export const getElementValue = (el) => {
	if(el.disabled){
		return null;
	}
	if(el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')){
		return el.checked ? el.value : null;
	}
	if(el.tagName === 'SELECT' && el.multiple){
		let vs = [];
		el.querySelectorAll('option[selected]').forEach(item => {
			vs.push(item.value);
		});
		return vs;
	}
	return el.value;
};

/**
 * 表单元素同步变更
 * 该方法会检测元素数据合法性（表单校验）
 * @param {HTMLElement} dom
 * @param {Function} getter 函数执行返回 Promise，返回null时，不填充input
 * @param {Function} setter 函数执行返回 Promise，checkbox、radio类型元素未选择时，返回null，设置失败元素将还原初始值
 */
export const formSync = (dom, getter, setter) => {
	let els = getAvailableElements(dom);
	els.forEach(function(el){
		let name = el.name;
		let current_val = getElementValue(el);
		el.disabled = true;
		getter(name).then(v => {
			el.disabled = false;
			if(el.type === 'radio' || el.type === 'checkbox'){
				el.checked = el.value == v;
				current_val = v;
			}else if(v !== null){
				el.value = v;
				current_val = v;
			}
		});
		el.addEventListener('change', e => {
			el.disabled = true;
			if(!el.checkValidity()){
				el.reportValidity();
				return;
			}
			let val = el.value;
			if((el.type === 'radio' || el.type === 'checkbox') && !el.checked){
				val = null;
			}
			setter(el.name, val).then(() => {
				el.disabled = false;
			}, () => {
				if(el.type === 'radio' || el.type === 'checkbox'){
					el.checked = el.value == current_val;
				}else if(current_val !== null){
					el.value = current_val;
				}
			});
		});
	});
}


/**
 * 获取指定容器下所有可用表单元素
 * @param {HTMLElement} dom
 * @param {Boolean} ignore_empty_name 是否忽略没有name属性的元素，缺省为必须校验
 * @return {HTMLFormElement[]}
 */
export const getAvailableElements = (dom, ignore_empty_name = false) => {
	let els = dom.querySelectorAll('input,textarea,select');
	return Array.from(els).filter(el => {
		return !isButton(el) && !el.disabled && (ignore_empty_name || el.name);
	});
}

/**
 * 表单元素校验
 * @param {HTMLElement} dom
 * @param {Boolean} name_validate 是否校验名称必填
 * @return boolean 是否校验通过
 */
export const formValidate = (dom, name_validate = false) => {
	let els = getAvailableElements(dom, !name_validate);
	let pass = true;
	Array.from(els).every(el => {
		if(!el.checkValidity()){
			el.reportValidity();
			pass = false;
			return false;
		}
		return true;
	});
	return pass;
}

/**
 * 获取指定DOM节点下表单元素包含的表单数据，并以Body String方式组装。
 * 该函数过滤表单元素处于 disabled、缺少name等不合理情况
 * @param {HTMLElement} dom 表单节点或普通HTML容器节点
 * @param {Boolean} validate 是否校验表单
 * @returns {String} 如果校验失败，则返回null
 */
export const formSerializeString = (dom, validate= true)=>{
	let data_list = getFormDataAvailable(dom, validate);
	let data_string_list = [];
	data_list.forEach(item => {
		let [name, value] = item;
		data_string_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(value)));
	});
	return data_string_list.join('&');
}

/**
 * 获取表单可用数据，以数组方式返回
 * 注意：该数组包含 [name, value]，其中 name 可重复。
 * @param {HTMLElement} dom 表单节点或普通HTML容器节点
 * @param {Boolean} validate 是否校验表单
 * @return {*[]}
 */
const getFormDataAvailable = (dom, validate = true) => {
	if(validate && !formValidate(dom)){
		return [];
	}
	let els = getAvailableElements(dom);
	let data_list = [];
	els.forEach(el=>{
		let name = el.name;
		let value = getElementValue(el);
		if(value !== null){
			data_list.push([name, value]);
		}
	})
	return data_list;
}

/**
 * 获取指定DOM节点下表单元素包含的表单数据，并以JSON方式组装。
 * 注意：同名表单项以JS数组方式组装，PHP方法名称中中括号将被作为变量名一部分使用
 * @param {HTMLElement} dom 表单节点或普通HTML容器节点
 * @param {Boolean} validate 是否校验表单
 * @returns {Object} JSON数据
 */
export const formSerializeJSON = (dom, validate = true) => {
	let json_obj = {};
	let data_list = getFormDataAvailable(dom, validate);
	let name_counts = {};
	data_list.forEach(item=>{
		let [name, value] = item;
		if(name_counts[name] === undefined){
			name_counts[name] = 1;
		} else {
			name_counts[name]++
		}
	});
	data_list.forEach(item => {
		let [name, value] = item;
		if(name_counts[name] > 1){
			if(json_obj[name] === undefined){
				json_obj[name] = [value];
			}else{
				json_obj[name].push(value);
			}
		}else{
			json_obj[name] = value;
		}
	});
	return json_obj;
};

/**
 * 转换表单数据对象到JSON对象
 * @example convertFormDataToObject({name:"hello", age:"10", isBoy:0, ext:"{city:'shenzhen'}"}, {name:"", age:0, isBoy:true, ext:{}})，
 * 结果返回： {name:"hello", age:10, isBoy:false, ext:{city:shenzhen}}
 * @param {Object} formDataMap 数据对象（从表单获取到的数据都是字符串类型的）
 * @param {Object} formatSchema 格式定义对象，如： {name:"Jack", age:10, isBoy:true}
 * @param {Boolean} mustExistsInSchema 是否必须存在格式定义中
 * @return {Object}
 */
export const convertFormDataToObject = (formDataMap, formatSchema, mustExistsInSchema = true) => {
	let ret = {};
	for(let key in formDataMap){
		let value = formDataMap[key];
		let define = formatSchema[key];
		if(define === undefined){
			if(mustExistsInSchema){
				continue;
			}
			ret[key] = value;
			continue;
		}
		switch(typeof (define)){
			case 'string':
				ret[key] = value;
				break;
			case 'boolean':
				ret[key] = value === '1' || value === 'true';
				break;
			case 'number':
				ret[key] = parseInt(value, 10);
				break;
			case 'object':
				ret[key] = value ? JSON.parse(value) : {};
				break;
			default:
				throw "format schema no supported";
		}
	}
	return ret;
}

let _form_data_cache_init = {};
let _form_data_cache_new = {};
let _form_us_msg = {};
let _form_us_sid_attr_key = Theme.Namespace+'form-unsaved-sid';

/**
 * 绑定页面离开时，表单未保存警告
 * @param {HTMLFormElement} form
 * @param {String} alertMsg
 */
export const bindFormUnSavedUnloadAlert = (form, alertMsg = '您的表单尚未保存，是否确认离开？')=>{
	if(form.getAttribute(_form_us_sid_attr_key)){
		return;
	}
	let us_sid = guid();
	_form_us_msg[us_sid] = alertMsg;
	form.setAttribute(_form_us_sid_attr_key, us_sid);
	window.addEventListener('beforeunload', (e) => {
		if(!document.body.contains(form)){
			return "";
		}
		let msg = validateFormChanged(form);
		console.log('unchanged msg', msg);
		if(msg){
			e.preventDefault();
			e.returnValue = msg;
			return msg;
		}
	});
	let els = getAvailableElements(form, true);
	els.forEach(el=>{
		el.addEventListener('input', ()=>{
			_form_data_cache_new[us_sid] = formSerializeJSON(form, false);
		});
	});
	resetFormChangedState(form);
}

/**
 * 校验表单内容是否变更
 * @param {HTMLFormElement} form
 * @return {boolean|String}
 */
export const validateFormChanged = (form) => {
	let us_sid = form.getAttribute(_form_us_sid_attr_key);
	if(!us_sid){
		throw "Form no init by bindFormUnSavedAlert()";
	}
	if(!isEquals(_form_data_cache_init[us_sid], _form_data_cache_new[us_sid])){
		return _form_us_msg[us_sid];
	}
	return false;
}

/**
 * 重置表单未保存提示状态
 * @param {HTMLFormElement} form
 */
export const resetFormChangedState = (form) => {
	let us_sid = form.getAttribute(_form_us_sid_attr_key);
	if(!us_sid){
		throw "Form no init by bindFormUnSavedAlert()";
	}
	_form_data_cache_init[us_sid] = _form_data_cache_new[us_sid] = formSerializeJSON(form, false);
}

/**
 * 转换对象为表单元素数值
 * @param {Object} objectMap
 * @param {Array} boolMapping
 * @return {Object}
 */
export const convertObjectToFormData = (objectMap, boolMapping = ["1", "0"]) => {
	let ret = {};
	for(let key in objectMap){
		let value = objectMap[key];
		switch(typeof (value)){
			case 'string':
			case 'number':
				ret[key] = String(value);
				break;
			case 'boolean':
				ret[key] = value ? boolMapping[0] : boolMapping[1];
				break;
			case 'object':
				ret[key] = JSON.stringify(value);
				break;
			default:
				throw "format schema no supported";
		}
	}
	return ret;
}

/**
 * 构建 HTML Input:hidden 标签
 * @param {Object} maps {key:value}
 * @return {string}
 */
export const buildHtmlHidden = (maps)=>{
	let html = '';
	for(let key in maps){
		let val = maps[key] === null ? '' : maps[key];
		html += `<input type="hidden" name="${escapeAttr(key)}" value="${escapeAttr(val)}"/>`;
	}
	return html;
}