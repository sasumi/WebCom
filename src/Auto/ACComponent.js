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

const DEFAULT_ATTR_COM_FLAG = 'data-component'; //data-component="com1,com2"
const COMPONENT_BIND_FLAG_KEY = 'component-init-bind';

/**
 * 组件映射配置
 * @type {Object}
 */
let AC_COMPONENT_NAME_MAPPING = {
	async: ACAsync,
	copy: ACCopy,
	dialog: ACDialog,
	confirm: ACConfirm,
	preview: ACPreview,
	select: ACSelect,
	hl: ACHighlight,
	highlight: ACHighlight,
	selectall: ACSelectAll,
	selectrelate: ACMultiSelectRelate,
	tip: ACTip,
	toast: ACToast,
	textcounter: ACTextCounter,
	uploader: ACUploader,
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
 * 从节点中解析出使用 data-key- 为前缀的属性
 * @param {Node} node
 * @param {String} ComAlias
 * @return {{}} 需要传递给组件方法的参数值（注意，由于属性名称仅支持小写（HTML中大写会转换成小写），返回参数值对象中不会出现大写情况。
 */
const resolveDataParam = (node, ComAlias) => {
	let param = {};
	Array.from(node.attributes).forEach(attr => {
		if(attr.name.indexOf('data-' + ComAlias.toLowerCase() + '-') >= 0){
			let objKeyPath = attr.name.substring(('data-' + ComAlias.toLowerCase()).length + 1);
			objectPushByPath(objKeyPath, attr.value, param);
		}
	})
	return param;
}

/**
 * 绑定节点
 * @param {Node} container
 * @param attr_flag
 */
const bindNode = function(container = document, attr_flag = DEFAULT_ATTR_COM_FLAG){
	container.querySelectorAll(`:not([${COMPONENT_BIND_FLAG_KEY}])[${attr_flag}]`).forEach(node => {
		let cs = parseComponents(node.getAttribute(attr_flag));
		let activeStacks = [];
		let init_count = 0;
		cs.forEach(componentAlias => {
			let C = AC_COMPONENT_NAME_MAPPING[componentAlias];
			if(!C){
				console.warn('component no found', componentAlias);
				return false;
			}
			init_count++;
			let data = resolveDataParam(node, componentAlias);
			console.info('com detected:', componentAlias);
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
			node.setAttribute(COMPONENT_BIND_FLAG_KEY, "1");
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
		let func = activeStacks[0];
		let pro = func(event);
		for(let i = 1; i < activeStacks.length; i++){
			pro = pro.then(() => {
				return activeStacks[i](event);
			}, () => {
			});
		}
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
