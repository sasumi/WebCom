import {Theme} from "./Theme.js";
import {findAll, findOne, onDomTreeChange} from "../Lang/Dom.js";

const CLS_ON_DRAG = Theme.Namespace + '-on-drag';
const CLS_DRAG_PROXY = Theme.Namespace + '-drag-proxy';

/**
 * 匹配事件对象到指定父容器子节点列表中
 * @param {Node} container
 * @param {Node} eventTarget
 * @return {Node}
 */
const matchChildren = (container, eventTarget) => {
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
 * @param {Node} listContainer 列表父容器（函数自动监听容器子节点变化，重新绑定）
 * @param {Object} option 选项
 * @param {String} option.ClassOnDrag 占位对象类名
 * @param {String} option.ClassProxy 拖动过程代理对象类名
 * @param {String} option.triggerSelector 触发拖动推对象选择器
 * @param {Function} option.onChange
 */
export const sortable = (listContainer, option = {}) => {
	let currentNode = null;
	let currentParent = null; //当前父级，避免多个拖动组件使用出现混淆
	listContainer = findOne(listContainer);

	option = Object.assign({
		ClassOnDrag: CLS_ON_DRAG,
		ClassProxy: CLS_DRAG_PROXY,
		triggerSelector: '',
		onChange: ()=>{}
	}, option);

	const setDraggable = () => {
		if(option.triggerSelector){
			findAll(option.triggerSelector, listContainer).forEach(trigger=>trigger.setAttribute('draggable', 'true'));
		} else {
			Array.from(listContainer.children).forEach(child => child.setAttribute('draggable', 'true'));
		}
	};

	onDomTreeChange(listContainer, setDraggable, false);
	setDraggable();

	listContainer.addEventListener('dragover', e=>{
		e.preventDefault();
		return false;
	});

	listContainer.addEventListener('dragstart', e => {
		//如果设置了可拖动对象，且点击处不在对象内，禁止拖动
		if(option.triggerSelector){
			if(!e.target.matches(option.triggerSelector) && !e.target.closest(option.triggerSelector)){
				e.preventDefault();
				return false;
			}
		}

		//点击了父容器，禁止拖动
		if(e.target === listContainer){
			e.preventDefault();
			return false;
		}
		let childNode = matchChildren(listContainer, e.target);
		currentNode = childNode;
		currentParent = listContainer;
		currentNode.classList.add(option.ClassProxy);
		setTimeout(() => {
			childNode.classList.remove(option.ClassProxy);
			childNode.classList.add(option.ClassOnDrag);
		}, 0);
		return false;
	});

	listContainer.addEventListener('dragenter', e => {
		if(e.target === listContainer){
			return;
		}
		let childNode = matchChildren(listContainer, e.target);
		if(!currentNode || currentParent !== listContainer || childNode === listContainer || childNode === currentNode){
			return;
		}
		let children = Array.from(listContainer.children); //实时从拖动之后的children中拿
		let currentIndex = children.indexOf(currentNode);
		let targetIndex = children.indexOf(childNode);
		if(currentIndex > targetIndex){
			listContainer.insertBefore(currentNode, childNode.previousSibling);
		}else{
			listContainer.insertBefore(currentNode, childNode.nextSibling);
		}
		option.onChange(currentIndex, targetIndex);
	});

	listContainer.addEventListener('dragend', e => {
		if(e.target === listContainer){
			return;
		}
		let childNode = matchChildren(listContainer, e.target);
		currentNode = null;
		currentParent = null;
		childNode.classList.remove(option.ClassOnDrag);
	});
}