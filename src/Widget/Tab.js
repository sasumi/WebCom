import {findAll} from "../Lang/Dom.js";

/**
 * tab 连接
 * @param {Element[]|String} tabs tab节点列表
 * @param {Element[]|String} contents 内容节点列表
 * @param {Object} option 选项
 * @param {string} option.contentActiveClass 内容区激活类名，默认为active
 * @param {string} option.tabActiveClass tab区激活类名，默认为active
 * @param {string} option.triggerEvent tab激活事件类型，默认为click
 */
export const tabConnect = (tabs, contents, option = {}) => {
	let {contentActiveClass = 'active', tabActiveClass = 'active', triggerEvent = 'click'} = option;
	tabs = findAll(tabs);
	contents = findAll(contents);
	tabs.forEach((tab, idx) => {
		tab.addEventListener(triggerEvent, e => {
			contents.forEach(ctn => {
				ctn.classList.remove(contentActiveClass);
			});
			contents[idx].classList.add(contentActiveClass);
			tabs.forEach(t => {
				t.classList.remove(tabActiveClass);
			});
			tab.classList.add(tabActiveClass);
		});
	});
}
