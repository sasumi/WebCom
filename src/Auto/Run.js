import {onDocReady} from "../Lang/Event.js";

const DEFAULT_NS = 'AC';
const COMPONENT_ATTR_KEY = 'data-com'; //data-com="com1,com2"
const COMPONENT_BIND_FLAG_KEY = 'component-init-bind';
const SUPPORT_EVENTS = 'click mousedown mouseup keydown keyup';
let INIT_COMPLETED = false;
let INIT_CALLBACK = [];

const parseComponents = function(attr){
	let tmp = attr.split(',');
	let cs = [];
	tmp.each(v => {
		v = v.trim();
		if(v){
			cs.push(DEFAULT_NS + v);
		}
	});
	return cs;
};


/**
 * 检测节点是否拥有组件
 * @param {HTMLElement} node
 * @param component_name
 * @returns {*}
 */
let nodeHasComponent = function(node, component_name){
	let cs = parseComponents(node.getAttribute(COMPONENT_ATTR_KEY));
	return cs.includes(component_name);
};


/**
 * 获取节点所有组件参数
 * @param node
 * @returns {{}}
 */
let getDataParam = function(node){
	let param = {};
	for(let i = 0; i < node[0].attributes.length; i++){
		let attr = node[0].attributes[i];
		if(attr.name.indexOf('data-') === 0){
			let data_str = attr.name.replace(/^data-/i, '');
			if(data_str.indexOf('-') > 0){
				let component_name = data_str.substring(0, data_str.indexOf('-'));
				component_name = component_name.replace(/_/, '/');
				if(!param[component_name]){
					param[component_name] = {};
				}
				let key = data_str.substring(data_str.indexOf('-') + 1);
				param[component_name][key] = attr.value;
			}else{
				param[data_str] = attr.value;
			}
		}
	}
	return param;
};


/**
 * 根据组件名称获取参数
 * @param node
 * @param component_name
 */
let getDataParamByComponent = function(node, component_name){
	let all = getDataParam(node);
	let c = component_name.replace(new RegExp('^' + DEFAULT_NS + '/'), '').toLowerCase();
	return all[c] || {};
};

/**
 * @param node
 * @param event
 * @param handler
 */
const bindUp = function(node, event, handler){
	node.addEventListener(event, handler, false);
};

//自启动
onDocReady(() => {
	//使用异步，一定程度可以缓解data-component组件如果在调用AutoComponent组件方法的时候，
	//出现的互相嵌套等待的情况，但是这种情况是没太好的办法解耦。
	setTimeout(function(){
		let $body = $('body');
		let _LS = {};
		let bindNode = function(){
			document.querySelectorAll('[' + COMPONENT_ATTR_KEY + ']').forEach(node => {
				if(node.getAttribute(COMPONENT_BIND_FLAG_KEY)){
					return;
				}
				node.setAttribute(COMPONENT_BIND_FLAG_KEY, "1");
				let all_data = getDataParam(node);
				let cs = parseComponents(node.getAttribute(COMPONENT_ATTR_KEY));
				if(!_LS[cs]){
					console.debug('%cLoad COM: ' + cs.join(','), 'color:green');
					_LS[cs] = true;
				}
				require.async(cs, function(){
					let args = arguments;
					for(let i = 0; i < cs.length; i++){
						let c = cs[i].replace(new RegExp('^' + DEFAULT_NS + '/'), '');
						if(!args[i]){
							continue;
						}
						new c(all_data[c.toLowerCase()]);
					}
					node.addEventListener(SUPPORT_EVENTS.join(','), e=>{
						let all_data = getDataParam(node);
						let ev = e.type;
						let method = 'node' + ev[0].toUpperCase() + ev.slice(1);
						for(let i = 0; i < cs.length; i++){
							if(!args[i]){
								continue;
							}
							let c = cs[i].replace(new RegExp('^' + DEFAULT_NS + '/'), '');
							let param = all_data[c] || all_data[c.toLowerCase()] || {};
							if(isFunction(args[i][method])){
								if(args[i][method](node, param) === false){
									e.stopImmediatePropagation(); //stop other jQuery event binding
									e.preventDefault();
									return false;
								}
							}
						}
					});
				});
			});
		};

		let m_tm = null;
		$body.on('DOMSubtreeModified propertychange', function(){
			clearTimeout(m_tm);
			m_tm = setTimeout(function(){
				bindNode();
			}, 100);
		});
		bindNode();

		INIT_COMPLETED = true;
		INIT_CALLBACK.forEach(cb => {
			cb();
		})
	}, 0);
})
