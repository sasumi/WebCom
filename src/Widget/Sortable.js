import {Theme} from "./Theme.js";
import {domChangedWatch} from "../Lang/Dom.js";

const CLS_ON_DRAG = Theme.Namespace + '-on-drag';
const CLS_DRAG_PROXY = Theme.Namespace + '-drag-proxy';

/**
 * @param {Node} container
 * @param {Node} eventTarget
 * @return {Node}
 */
const matchTarget = (container, eventTarget) => {
	let children = Array.from(container.children);
	let p = eventTarget;
	while(p){
		if(children.includes(p)){
			return p;
		}
		p = p.parentNode;
	}
	throw "event target no in container";
}

/**
 * 节点排序
 * @param {Node} listNode 列表父容器（函数自动监听容器子节点变化，重新绑定）
 * @param {Object} option 选项
 * @param {String} option.ClassOnDrag 占位对象类名
 * @param {String} option.ClassProxy 拖动过程代理对象类名
 */
export const sortable = (listNode, option = {}) => {
	let currentNode = null;
	let currentParent = null; //当前父级，避免多个拖动组件使用出现混淆
	let ClassOnDrag = option.ClassOnDrag || CLS_ON_DRAG;
	let ClassProxy = option.ClassProxy || CLS_DRAG_PROXY;
	domChangedWatch(listNode, 'li', ()=>{
		Array.from(listNode.children).forEach(child => child.setAttribute('draggable', 'true'));
	}, true);
	listNode.addEventListener('dragstart', e => {
		if(e.target === listNode){
			return;
		}
		let tag = matchTarget(listNode, e.target);
		currentNode = tag;
		currentParent = listNode;
		currentNode.classList.add(ClassProxy);
		setTimeout(() => {
			tag.classList.remove(ClassProxy);
			tag.classList.add(ClassOnDrag);
		}, 0);
	});
	listNode.addEventListener('dragenter', e => {
		if(e.target === listNode){
			return;
		}
		let tag = matchTarget(listNode, e.target);
		if(!currentNode || currentParent !== listNode || tag === listNode || tag === currentNode){
			return;
		}
		let children = Array.from(listNode.children); //实时从拖动之后的children中拿
		let currentIndex = children.indexOf(currentNode);
		let targetIndex = children.indexOf(tag);
		if(currentIndex > targetIndex){
			listNode.insertBefore(currentNode, tag.previousSibling);
		}else{
			listNode.insertBefore(currentNode, tag.nextSibling);
		}
	});
	listNode.addEventListener('dragend', e => {
		if(e.target === listNode){
			return;
		}
		let tag = matchTarget(listNode, e.target);
		currentNode = null;
		currentParent = null;
		tag.classList.remove(ClassOnDrag);
	});
}