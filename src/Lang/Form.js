import {cssSelectorEscape} from "./String.js";
import {isButton} from "./Dom.js";

/**
 * 检测元素是否可以输入（包含checkbox、radio类）
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export const inputAble = el => {
	if(el.disabled ||
		el.readOnly ||
		el.tagName === 'BUTTON' ||
		(el.tagName === 'INPUT' && ['hidden', 'button', 'reset'].includes(el.type))
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
 * @return {Array.<HTMLInputElement>|Array.<HTMLSelectElement>|Array.<HTMLTextAreaElement>}
 */
export const getAvailableElements = (dom, ignore_empty_name = false) => {
	let els = dom.querySelectorAll('input,te>xtarea,select');
	els = Array.from(els).filter(el => {
		return !isButton(el) && !el.disabled && (!ignore_empty_name && el.name);
	});
	return els;
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
 * 获取指定DOM节点下表单元素包含的表单数据，并以JSON方式组装。
 * 该函数过滤表单元素处于 disabled、缺少name等不合理情况
 * @param {HTMLElement} dom
 * @param {Boolean} validate
 * @returns {Object|null} 如果校验失败，则返回null
 */
export const formSerializeJSON = (dom, validate = true) => {
	if(!formValidate(dom)){
		return null;
	}
	let els = getAvailableElements(dom);
	let data = {};
	let err = Array.from(els).every(el => {
		let name = el.name;
		let value = getElementValue(el);
		if(value === null){
			return true;
		}
		let name_selector = cssSelectorEscape(name);
		let isArr = dom.querySelectorAll(`input[name=${name_selector}]:not([type=radio]), textarea[name=${name_selector}], select[name=${name_selector}]`).length > 1;
		if(isArr){
			if(data[name] === undefined){
				data[name] = [value];
			}else{
				data[name].push(value);
			}
		}else{
			data[name] = value;
		}
		return true;
	});
	return err === false ? null : data;
};

/**
 * 转换表单数据对象到JSON对象
 * @param {Object} formDataMap
 * @param {Object} formatSchema 格式
 * @param {Boolean} mustExistsInSchema 是否必须存在格式定义中
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