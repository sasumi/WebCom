import {Theme} from "./Theme.js";

const CLS_ON_DRAG = Theme.Namespace + '-on-drag';
const CLS_DRAG_PROXY = Theme.Namespace + '-drag-proxy';

/**
 * @param {Node} listNode
 * @param {Object} option
 * @param {String} option.ClassOnDrag 占位对象类名
 * @param {String} option.ClassProxy 拖动过程代理对象类名
 */
export const sortable = (listNode, option = {}) => {
	let currentNode = null;
	let currentParent = null; //当前父级，避免多个拖动组件使用出现混淆
	let ClassOnDrag = option.ClassOnDrag || CLS_ON_DRAG;
	let ClassProxy = option.ClassProxy || CLS_DRAG_PROXY;
	Array.from(listNode.children).forEach(child => child.setAttribute('draggable', 'true'));
	listNode.addEventListener('dragstart', e => {
		currentNode = e.target;
		currentParent = listNode;
		currentNode.classList.add(ClassProxy);
		setTimeout(() => {
			e.target.classList.remove(ClassProxy);
			e.target.classList.add(ClassOnDrag);
		}, 0);
	});
	listNode.addEventListener('dragenter', e => {
		if(!currentNode || currentParent !== listNode || e.target === listNode || e.target === currentNode){
			return;
		}
		let children = Array.from(listNode.children); //实时从拖动之后的children中拿
		let currentIndex = children.indexOf(currentNode);
		let targetIndex = children.indexOf(e.target);
		if(currentIndex > targetIndex){
			listNode.insertBefore(currentNode, e.target.previousSibling);
		}else{
			listNode.insertBefore(currentNode, e.target.nextSibling);
		}
	});
	listNode.addEventListener('dragend', e => {
		currentNode = null;
		currentParent = null;
		e.target.classList.remove(ClassOnDrag);
	});
}