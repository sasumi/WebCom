import {Theme} from "./Theme.js";
import {findAll, findOne, nodeIndex, onDomTreeChange} from "../Lang/Dom.js";

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
 * @param {Function(child:Node)} option.onStart 开始拖动事件回调，如果返回false终止拖动
 * @param {Function(currentIndex:Number, targetIndex:Number)} option.onInput 拖动过程切换顺序事件回调
 * @param {Function(currentIndex:Number, targetIndex:Number)} option.onChange 拖动结束事件回调
 */
export const sortable = (listContainer, option = {}) => {
	let dragNode = null;

	let dragIndex;
	let lastTargetIndex;

	listContainer = findOne(listContainer);

	option = Object.assign({
		ClassOnDrag: CLS_ON_DRAG,
		ClassProxy: CLS_DRAG_PROXY,
		triggerSelector: '',
		onStart: (child) => {
		},
		onInput: (currentIndex, targetIndex) => {
		},
		onChange: (currentIndex, targetIndex) => {
		}
	}, option);

	const setDraggable = () => {
		if(option.triggerSelector){
			findAll(option.triggerSelector, listContainer).forEach(trigger => trigger.setAttribute('draggable', 'true'));
		}else{
			Array.from(listContainer.children).forEach(child => child.setAttribute('draggable', 'true'));
		}
	};

	onDomTreeChange(listContainer, setDraggable, false);
	setDraggable();

	listContainer.addEventListener('dragover', e => {
		e.preventDefault();
		return false;
	});

	listContainer.addEventListener('dragstart', e => {
		dragIndex = lastTargetIndex = null;

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

		//开始拖动
		dragNode = matchChildren(listContainer, e.target);
		dragIndex = nodeIndex(dragNode);
		if(option.onStart(dragNode) === false){
			console.debug('drag start canceled');
			return false;
		}

		dragNode.classList.add(option.ClassProxy);
		setTimeout(() => {
			dragNode.classList.remove(option.ClassProxy);
			dragNode.classList.add(option.ClassOnDrag);
		}, 0);
		return false;
	});

	listContainer.addEventListener('dragenter', e => {
		if(e.target === listContainer){
			return;
		}
		let childNode = matchChildren(listContainer, e.target);
		if(!dragNode || childNode === listContainer || dragNode === childNode){
			return;
		}
		let children = Array.from(listContainer.children); //实时从拖动之后的children中拿
		let currentIndex = children.indexOf(dragNode);
		let targetIndex = children.indexOf(childNode);
		if(currentIndex > targetIndex){
			listContainer.insertBefore(dragNode, childNode.previousSibling);
		}else{
			listContainer.insertBefore(dragNode, childNode.nextSibling);
		}
		lastTargetIndex = targetIndex;
		option.onInput(currentIndex, targetIndex);
	});

	listContainer.addEventListener('dragend', e => {
		if(e.target === listContainer){
			return;
		}
		let childNode = matchChildren(listContainer, e.target);
		dragNode = null;
		childNode.classList.remove(option.ClassOnDrag);
		if(lastTargetIndex === null || dragIndex === lastTargetIndex){
			return;
		}
		option.onChange(dragIndex, lastTargetIndex);
	});
}