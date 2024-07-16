import {ACAsync} from "./ACAsync.js";
import {ACDialog} from "./ACDialog.js";
import {ACConfirm} from "./ACConfirm.js";
import {ACTip} from "./ACTip.js";
import {ACCopy} from "./ACCopy.js";
import {ACToast} from "./ACToast.js";
import {objectPushByPath} from "../Lang/Array.js";
import {ACPreview} from "./ACPreview.js";
import {ACSelect} from "./ACSelect.js";
import {ACHighlight} from "./ACHighlight.js";
import {ACSelectAll} from "./ACSelectAll.js";
import {ACMultiSelectRelate} from "./ACMultiSelectRelate.js";
import {ACUploader} from "./ACUploader.js";
import {ACTextCounter} from "./ACTextCounter.js";
import {findAll} from "../Lang/Dom.js";
import {ACBatchFiller} from "./ACBatchFiller.js";
import {guid} from "../Lang/Util.js";
import {ACUnSaveAlert} from "./ACUnSaveAlert.js";
import {ACDateRangeSelector} from "./ACDateRangeSelector.js";
import {ACInlineEditor} from "./ACInlineEditor.js";

const DEFAULT_ATTR_COM_FLAG = 'data-component'; //data-component="com1,com2"
const COMPONENT_BIND_GUID_KEY = 'component-init-bind';

/**
 * 组件映射配置
 * @type {Object}
 */
let AC_COMPONENT_NAME_MAPPING = {
	async: ACAsync,
	unsavealert: ACUnSaveAlert,
	copy: ACCopy,
	dialog: ACDialog,
	confirm: ACConfirm,
	preview: ACPreview,
	select: ACSelect,
	hl: ACHighlight,
	highlight: ACHighlight,
	inlineeditor: ACInlineEditor,
	selectall: ACSelectAll,
	selectrelate: ACMultiSelectRelate,
	tip: ACTip,
	toast: ACToast,
	textcounter: ACTextCounter,
	uploader: ACUploader,
	batchfiller: ACBatchFiller,
	daterangeselector: ACDateRangeSelector,
};

/**
 * 从属性中解析出组件列表
 * @param {String} attr
 * @return {String[]}
 */
const parseComponents = function(attr){
	let tmp = attr.split(',');
	let cs = [];
	tmp.forEach(v => {
		v = v.trim();
		if(v){
			cs.push(v);
		}
	});
	return cs;
};

/**
 * 从节点中解析出使用 data-coma-param1 为前缀的属性
 * 注意：data-coma-* 属性名不支持大写（HTML getAttribute仅支持小写），英文句号或破折号将会被解析成多级属性
 * 例1：data-coma-param1.param2="Hello"，
 * 或 data-coma-param1-param2="Hello" 将会被解析成参数：{param1: {param2: "hello"}}
 * @param {Node} node
 * @param {String} ComAlias
 * @return {*}
 */
const resolveDataParam = (node, ComAlias) => {
	let param = {};
	Array.from(node.attributes).forEach(attr => {
		if(attr.name.indexOf('data-' + ComAlias.toLowerCase() + '-') >= 0){
			let objKeyPath = attr.name.substring(('data-' + ComAlias.toLowerCase()).length + 1).replace(/-/g, '.');
			objectPushByPath(objKeyPath, attr.value, param, '.');
		}
	})
	return param;
}

let BIND_LIST = {
	//node-bind-guid: [Com1, Com2]
};

/**
 * 绑定节点
 * @param {Node} container
 * @param attr_flag
 */
const bindNode = function(container = document, attr_flag = DEFAULT_ATTR_COM_FLAG){
	findAll(`:not([${COMPONENT_BIND_GUID_KEY}])[${attr_flag}]`, container).forEach(node => {
		let cs = parseComponents(node.getAttribute(attr_flag));
		let activeStacks = [];
		let init_count = 0;
		let id = guid('component-bind');
		cs.forEach(componentAlias => {
			let C = AC_COMPONENT_NAME_MAPPING[componentAlias];
			if(!C){
				console.warn('component no found', componentAlias);
				return false;
			}
			init_count++;
			if(!BIND_LIST[id]){
				BIND_LIST[id] = [];
			}
			BIND_LIST[id].push(C);
			let data = resolveDataParam(node, componentAlias);
			if(C.init){
				C.init(node, data);
			}
			if(C.active){
				activeStacks.push((event) => {
					return C.active(node, resolveDataParam(node, componentAlias), event); //点击时实时解析参数
				});
			}
			return true;
		});
		//只有在有成功初始化情况才忽略下次初始化
		if(init_count !== 0){
			node.setAttribute(COMPONENT_BIND_GUID_KEY, id);
		}
		if(activeStacks.length){
			bindActiveChain(node, activeStacks);
		}
	});
};

/**
 * 可以转换成文本类型的输入类型
 * @type {string[]}
 */
const TEXT_TYPES = ['text', 'number', 'password', 'search', 'address', 'date', 'datetime', 'time', 'checkbox', 'radio'];

/**
 * 是否为可输入元素
 * @param {HTMLFormElement} node
 * @return {boolean}
 */
const isInputAble = (node) => {
	if(node.disabled || node.readonly){
		return false;
	}
	return node.tagName === 'TEXTAREA' ||
		(node.tagName === 'INPUT' && (!node.type || TEXT_TYPES.includes(node.type.toLowerCase())));
}

/**
 * 绑定节点触发事件，不同节点触发行为定义不同
 * @param {HTMLElement} node
 * @param {Function[]} activeStacks 链式调用列表
 */
const bindActiveChain = (node, activeStacks) => {
	let eventName;
	if(isInputAble(node)){
		eventName = 'keyup';
	}else if(node.tagName === 'FORM'){
		eventName = 'submit';
	}else{
		eventName = 'click';
	}
	node.addEventListener(eventName, event => {
		let stacks = [...activeStacks];
		let exe = () => {
			let func = stacks.shift();
			if(func){
				func(event).then(exe, err => {
					console.info('ACComponent active chain breakdown', err);
				});
			}
		}
		exe();
		event.preventDefault();
		return false;
	});
}

export const ACComponent = {
	/**
	 * 监听组件
	 * @param {Node} container
	 * @param {String} attr_flag 绑定属性格式，缺省为 data-component形式
	 */
	watch: (container = document, attr_flag = DEFAULT_ATTR_COM_FLAG) => {
		let m_tm = null;
		let observer = new MutationObserver(() => {
			clearTimeout(m_tm);
			m_tm = setTimeout(function(){
				bindNode(container, attr_flag);
			}, 0);
		});
		observer.observe(container, {childList: true, subtree: true});
		bindNode(container, attr_flag);
	},

	/**
	 * 获取已经绑定的组件列表
	 * @param node
	 * @return {*[]|*}
	 */
	getBindComponents: (node) => {
		let guid = node.getAttribute(COMPONENT_BIND_GUID_KEY);
		if(guid && BIND_LIST[guid]){
			return BIND_LIST[guid];
		}
		return [];
	},

	/**
	 * 注册组件
	 * @param {String} ComponentName
	 * @param {Object} define
	 * @param {Function} define.init 节点初始化函数
	 * @param {Function} define.active 节点交互函数（交互行为包括：表单提交、链接点击、按钮点击、输入框回车提交等）
	 */
	register: (ComponentName, define) => {
		AC_COMPONENT_NAME_MAPPING[ComponentName] = define;
	},

	/**
	 * 取消注册组件
	 * @param {String} componentName
	 */
	unRegister: (componentName) => {
		delete (AC_COMPONENT_NAME_MAPPING[componentName]);
	}
}
