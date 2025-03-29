import { findAll, isButton, lockElementInteraction, mutationEffective, onDomTreeChange } from "./Dom.js";
import {guid, mergeDeep} from "./Util.js";
import { Theme } from "../Widget/Theme.js";
import { isEquals, objectPushByPath } from "./Array.js";
import { requestJSON } from "./Net.js";

/**
 * 检测元素是否可以输入（包含checkbox、radio类）
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export const inputAble = el => {
	if (el instanceof HTMLInputElement ||
		el instanceof HTMLTextAreaElement) {
		return !(el.disabled || //禁用
			el.readOnly || //只读
			el.tagName === 'BUTTON' || //按钮
			(el.tagName === 'INPUT' && ['hidden', 'button', 'submit', 'reset'].includes(el.type)) //特殊input
		);
	}
	return false;
}

/**
 * 检测元素是否可以按键输入（文本型）
 * @param {HTMLElement} el
 * @returns {Boolean}
 */
export const inputTypeAble = (el) => {
	return inputAble(el) && (
		['text', 'password', 'url', 'search', 'tel', 'address', 'number', 'date', 'datetime-local', 'month'].includes(el.type)
		|| el.tagName === 'TEXTAREA'
	);
}

/**
 * 获取form元素值。
 * 该函数过滤元素disabled情况，但不判断name是否存在
 * 针对多重选择，提取数据格式为数组
 * @param {HTMLFormElement} el
 * @returns {String|Array|Null} 元素值，元素不可用时返回null
 */
export const getElementValue = (el) => {
	if (el.disabled) {
		return null;
	}
	if (el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')) {
		return el.checked ? el.value : null;
	}
	if (el.tagName === 'SELECT' && el.multiple) {
		let vs = [];
		findAll('option:checked', el).forEach(item => {
			vs.push(item.value);
		});
		return vs;
	}
	return el.value;
}

/**
 * 根据表单元素名称获取值
 * @param {String} name
 * @param {Node} container 容器，缺省为整个文档
 * @return {String[]|String} 表单元素值，如果是checkbox或者select多选情况，返回类型为数组，其他返回为字符串
 */
export const getElementValueByName = (name, container = document) => {
	let elements = findAll(`[name="${name}"]:not([disabled])`, container);
	let values = [];
	let multiple = false;
	elements.forEach(element => {
		switch (element.type) {
			case 'checkbox':
				multiple = true;
				if (element.checked) {
					values.push(element.value);
				}
				break;
			case 'radio':
				if (element.checked) {
					values.push(element.value);
				}
				break;
			case 'select':
				if (element.multiple) {
					multiple = true;
					Array.from(element.selectedOptions).forEach(opt => {
						values.push(opt.value);
					});
				} else {
					values.push(element.value);
				}
				break;
			default:
				values.push(element.value);
		}
	})
	return multiple ? values : values[0];
}

/**
 * 表单元素同步变更
 * 该方法会检测元素数据合法性（表单校验）
 * @param {HTMLElement} dom
 * @param {Function} getter 函数执行返回 Promise，返回null时，不填充input
 * @param {Function} setter 函数执行返回 Promise，checkbox、radio类型元素未选择时，返回null，设置失败元素将还原初始值
 */
export const formSync = (dom, getter, setter) => {
	let els = getAvailableElements(dom);
	els.forEach(function (el) {
		let name = el.name;
		let current_val = getElementValue(el);
		el.disabled = true;
		getter(name).then(v => {
			el.disabled = false;
			if (el.type === 'radio' || el.type === 'checkbox') {
				el.checked = el.value == v;
				current_val = v;
			} else if (v !== null) {
				el.value = v;
				current_val = v;
			}
		});
		el.addEventListener('change', e => {
			el.disabled = true;
			if (!el.checkValidity()) {
				el.reportValidity();
				return;
			}
			let val = el.value;
			if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) {
				val = null;
			}
			setter(el.name, val).then(() => {
				el.disabled = false;
			}, () => {
				if (el.type === 'radio' || el.type === 'checkbox') {
					el.checked = el.value == current_val;
				} else if (current_val !== null) {
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
		if (!el.checkValidity()) {
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
export const formSerializeString = (dom, validate = true) => {
	let data_list = getFormDataAvailable(dom, validate);
	let data_string_list = [];
	data_list.forEach(item => {
		let [name, value] = item;
		if (Array.isArray(value)) {
			value.forEach(val => {
				data_string_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(val)));
			});
		} else {
			data_string_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(value)));
		}
	});
	return data_string_list.join('&');
}

/**
 * 修正通过PHP表单获取到的表单JSON对象，转换成真正的JSON对象
 * 由于 PHP 表单元素名称允许使用中括号来表示多级数组，因此需要修正
 * @param {Object|Array} data 
 */
export const fixedPhpJSON = (data) => {
	let result = {};
	for (let key in data) {
		let val = data[key];
		if (key.indexOf('[') < 0) {
			result[key] = val;
			continue;
		}
		//去掉php数组key中的引号，方便后面转换成path
		key = key.replace(/['"]/g, '');

		//最后一级是数组，值需要打包成数组
		if (key.match(/\[]$/)) {
			key = key.replace(/\[]$/, '');
			val = Array.isArray(val) ? val : [val];
		}
		let tmp = {};
		let path = key.replace(/\[]$/, '.').replace(/]/g, '').replace(/\[/g, '.');
		objectPushByPath(path, val, tmp, '.');
		mergeDeep(result, tmp);
	}
	return result;
}

/**
 * 序列化PHP表单到JSON
 * PHP 表单元素名称允许使用中括号来表示多级数组
 * @param {HTMLElement} dom 表单节点或普通HTML容器节点
 * @param {Boolean} validate 是否校验表单
 * @return {Object}
 */
export const serializePhpFormToJSON = (dom, validate = true) => {
	let json = formSerializeJSON(dom, validate);
	if(json === null) {
		return null;
	}
	return fixedPhpJSON(json);
}

/**
 * 修正GET提交方式的表单action错误
 * @param {HTMLFormElement} form
 */
export const fixGetFormAction = (form) => {
	let action = form.action;
	if (form.method && form.method.toLowerCase() !== 'get' || !action.length || action.indexOf('?') < 0) {
		return;
	}
	let url = new URL(action);
	let ipt;
	url.searchParams.forEach((v, k) => {
		ipt = document.createElement('input');
		ipt.type = 'hidden';
		ipt.name = k;
		ipt.value = v;
		form.appendChild(ipt);
	});
}

/**
 * 绑定表单提交到JSON
 * @param {HTMLFormElement} form
 * @param {Function} onSubmitting
 * @return {Promise}
 */
export const bindFormSubmitAsJSON = (form, onSubmitting = () => { }) => {
	return new Promise((resolve, reject) => {
		form.addEventListener('submit', e => {
			lockElementInteraction(form, reset => {
				onSubmitting();
				requestJSON(form.action, formSerializeJSON(form), form.method).then(resolve, reject).finally(reset);
			});
			e.preventDefault();
			return false;
		});
	});
}

const objSame = (obj1, obj2) => {
	return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * 自动监听表单元素change，或表单dom变更，触发保存动作
 * @param {Node} form
 * @param {Function} savePromise():Promise
 * @param {Number} minSaveInterval 最小保存间隔，上次保存完成后至少等待间隔时间才继续下一次保存
 */
export const bindFormAutoSave = (form, savePromise, minSaveInterval = 2000) => {
	const PRO_KEY = '_auto_save_listen_' + guid();
	let last_execute_time = 0; //上次执行时间
	let last_submit_data = formSerializeJSON(form, false); //上次提交数据
	let submitting = false; //是否正在提交

	const save = () => {
		let data = formSerializeJSON(form, false);
		if (!data || objSame(last_submit_data, data)) {
			submitting = false;
			return;
		}
		last_submit_data = data;
		savePromise(data).finally(() => {
			last_execute_time = Date.now();
			if (objSame(last_submit_data, formSerializeJSON(form, false))) {
				submitting = false;
				return;
			}
			setTimeout(save, minSaveInterval);
		});
	};
	const trigger = () => {
		const form_data = formSerializeJSON(form, false);
		if (!form_data || submitting) {
			return;
		}
		const remains = minSaveInterval - (Date.now() - last_execute_time);
		submitting = true;
		setTimeout(save, Math.max(remains, 0));
	};
	mutationEffective(form, { attributes: false, subtree: true, childList: true }, obs => {
		findAll(`input:not([${PRO_KEY}]), textarea:not([${PRO_KEY}]), select:not([${PRO_KEY}])`).forEach(el => {
			el.setAttribute(PRO_KEY, '1');
			el.addEventListener('change', trigger);
		});
		trigger();
	}, 100);
	findAll('input,textarea,select').forEach(el => { el.addEventListener('change', trigger); });
}

/**
 * 获取表单可用数据，以数组方式返回
 * 注意：该数组包含 [name, value]，其中 name 可重复。
 * @param {HTMLElement} dom 表单节点或普通HTML容器节点
 * @param {Boolean} validate 是否校验表单
 * @return {Array[]} 如果表单校验失败，返回空数组
 */
export const getFormDataAvailable = (dom, validate = true) => {
	if (validate && !formValidate(dom)) {
		return [];
	}
	let els = getAvailableElements(dom);
	let data_list = [];
	els.forEach(el => {
		let name = el.name;
		let value = getElementValue(el);
		if (value !== null) {
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
 * @returns {Object|Null} JSON数据，如果数据为空或者表单校验失败返回NULL
 */
export const formSerializeJSON = (dom, validate = true) => {
	let data_list = getFormDataAvailable(dom, validate);
	if (!data_list.length) {
		return null;
	}
	let name_counts = {};
	data_list.forEach(item => {
		let [name] = item;
		if (name_counts[name] === undefined) {
			name_counts[name] = 1;
		} else {
			name_counts[name]++
		}
	});
	let json_obj = {};
	data_list.forEach(item => {
		let [name, value] = item;
		if (name_counts[name] > 1) {
			if (json_obj[name] === undefined) {
				json_obj[name] = [value];
			} else {
				json_obj[name].push(value);
			}
		} else {
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
	for (let key in formDataMap) {
		let value = formDataMap[key];
		let define = formatSchema[key];
		if (define === undefined) {
			if (mustExistsInSchema) {
				continue;
			}
			ret[key] = value;
			continue;
		}
		switch (typeof (define)) {
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
	for (let key in objectMap) {
		let value = objectMap[key];
		switch (typeof (value)) {
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

///////////////////////////  退出窗口未保存表单提示  ///////////////////////////
export const WINDOW_UNLOAD_ALERT_MAP_VAR_KEY = 'WINDOW_UNLOAD_ALERT_MAP_VAR_KEY';

window[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY] = [
	//{msg, target} 窗口、提示语、表单对象或ID（用于数据定位）
];

let unload_event_bind = false;

/**
 * 设置窗口跳转时提示语
 * @see 当前模式暂不支持多重设置
 * @param {String} msg 提示语为空表示不提示
 * @param {Node} target 关联对象DOM，例如Form对象
 */
export const setWindowUnloadMessage = (msg, target) => {
	let found = false;
	//如果是iframe里面调用，target改为iframe
	if (top !== window) {
		target = window.frameElement;
	}
	top[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY].map(item => {
		if (item.target === target) {
			item.msg = msg;
			found = true;
		}
	});
	if (!found) {
		top[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY].push({ msg, target });
	}
	console.debug('set window unload message', JSON.stringify(msg), target);

	//绑定一次 beforeunload 只能一次显示所有的告警
	if (!unload_event_bind) {
		console.debug('beforeunload bind');
		window.addEventListener('beforeunload', (e) => {
			let unload_alert_list = getWindowUnloadAlertList();
			console.debug('window.beforeunload, bind message:', JSON.stringify(unload_alert_list));
			if (unload_alert_list.length) {
				let msg = unload_alert_list.join("\n");
				e.preventDefault();
				e.returnValue = msg;
				return msg;
			}
		});
		unload_event_bind = true;
	}
}

/**
 * 获取跳转提示
 * @param {Node|null} specify_target 指定目标
 * @return {String[]}
 */
export const getWindowUnloadAlertList = (specify_target = null) => {
	let msg_list = [];
	top[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY].forEach(item => {
		if (item.msg.length //msg exists
			&& item.target.parentNode //dom exists
			&& (!specify_target || specify_target === item.target) //match target
		) {
			msg_list.push(item.msg);
		}
	});
	//对同样的提示内容去重
	return msg_list.filter((val, idx, arr) => arr.indexOf(val) === idx);
}

//设置方法到window对象，提供给类似dialog等组件使用
window['getWindowUnloadAlertList'] = getWindowUnloadAlertList;
window['setWindowUnloadMessage'] = setWindowUnloadMessage;

let _form_data_cache_init = {};
let _form_data_cache_new = {};
let _form_us_msg = {};
let _form_us_sid_attr_key = Theme.Namespace + 'form-unsaved-sid';

/**
 * 绑定页面离开时，表单未保存警告
 * @param {HTMLFormElement} form
 * @param {String} alertMsg 提示语
 */
export const bindFormUnSavedUnloadAlert = (form, alertMsg = '') => {
	if (form.getAttribute(_form_us_sid_attr_key)) {
		return;
	}
	let us_sid = guid();
	_form_us_msg[us_sid] = alertMsg || '表单尚未保存，是否确认离开？';
	form.setAttribute(_form_us_sid_attr_key, us_sid);

	let upd_tm = null;
	let upd = () => {
		upd_tm && clearTimeout(upd_tm);
		upd_tm = setTimeout(() => {
			_form_data_cache_new[us_sid] = formSerializeJSON(form, false);
			setWindowUnloadMessage(validateFormChanged(form, us_sid), form);
		}, 100);
	}

	//本来reset 需要setTimeout执行的，由于upd()中已经做了，这里就不用重复
	form.addEventListener('reset', upd);
	onDomTreeChange(form, () => {
		let els = getAvailableElements(form, true);
		els.forEach(el => {
			if (el.getAttribute('__form_unsaved_bind__')) {
				return;
			}
			el.setAttribute('__form_unsaved_bind__', '1');
			el.addEventListener('input', upd);
		});
	}, false);
	resetFormChangedState(form);
}

/**
 * 校验表单内容是否变更
 * @param {HTMLFormElement} form
 * @param us_sid
 * @return {String}
 */
export const validateFormChanged = (form, us_sid = null) => {
	us_sid = us_sid || form.getAttribute(_form_us_sid_attr_key);
	if (!us_sid) {
		console.warn("Form no init by bindFormUnSavedAlert()");
		return '';
	}
	if (!isEquals(_form_data_cache_init[us_sid], _form_data_cache_new[us_sid])) {
		return _form_us_msg[us_sid];
	}
	return '';
}

/**
 * 重置表单未保存提示状态
 * @param {HTMLFormElement} form
 */
export const resetFormChangedState = (form) => {
	let us_sid = form.getAttribute(_form_us_sid_attr_key);
	if (!us_sid) {
		console.warn("Form no init by bindFormUnSavedAlert()");
		return false;
	}
	_form_data_cache_init[us_sid] = _form_data_cache_new[us_sid] = formSerializeJSON(form, false);
	setWindowUnloadMessage('', form);
}
