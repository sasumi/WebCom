import {guid} from "../Lang/Util.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {escapeHtml} from "../Lang/Html.js";
import {eventDelegate} from "../Lang/Event.js";

let CLASS_PREFIX = Theme.Namespace + 'toc';

insertStyleSheet(`
	.${CLASS_PREFIX}-wrap {}
	.${CLASS_PREFIX}-wrap ul {list-style:none; padding:0; margin:0}
	.${CLASS_PREFIX}-wrap li {padding-left:calc((var(--toc-item-level) - 1) * 10px)}
	.${CLASS_PREFIX}-collapse>ul {display:none;}
	.${CLASS_PREFIX}-title {display:block; margin:0.1em 0 0; cursor:pointer; user-select:none; padding:0.5em 1em 0.5em 2em;}
	.${CLASS_PREFIX}-title:hover {border-radius:var(${Theme.CssVar.PANEL_RADIUS})}
	.${CLASS_PREFIX}-toggle {position:absolute; vertical-align:middle; width:0; height:0; border:0.4em solid transparent; margin:1em 0 0 0.5em; border-top-color:var(${Theme.CssVar.COLOR}); opacity:0; cursor:pointer;}
	.${CLASS_PREFIX}-collapse>.${CLASS_PREFIX}-toggle {border-top-color:transparent; border-left-color:var(${Theme.CssVar.COLOR}); margin:.75em 0 0 0.5em;}
	li:hover>.${CLASS_PREFIX}-toggle {opacity:.4}
	.${CLASS_PREFIX}-wrap .${CLASS_PREFIX}-toggle:hover {opacity:0.8}
`, Theme.Namespace + 'toc-style');

const renderEntriesListHtml = (entries, config) => {
	console.log(config);
	let html = '<ul>';
	entries.forEach(entry => {
		html += `<li data-id="${entry.id}" data-level="${entry.level}" style="--toc-item-level:${entry.level}">
					${config.collapseAble && entry.children.length ? `<span class="${CLASS_PREFIX}-toggle"></span>` : ''}
					<span class="${CLASS_PREFIX}-title">${escapeHtml(entry.title)}</span>`;
		if(entry.children.length){
			html += renderEntriesListHtml(entry.children, config);
		}
	});
	html += '</ul>';
	return html;
}

const searchNodeById = (id, entries) => {
	for(let i = 0; i < entries.length; i++){
		if(entries[i].id === id){
			return entries[i].relateNode;
		}
		if(entries[i].children.length){
			let m = searchNodeById(id, entries[i].children);
			if(m){
				return m;
			}
		}
	}
	console.warn('no matched', id, entries);
	return null;
}

class Toc {
	dom = null; //toc 面板 DOM
	config = {
		container: null, //toc 挂载的容器
		collapseAble: true, //是否支持折叠
	};

	constructor(entries, config = {}){
		this.config = Object.assign(this.config, {container:document.body}, config);
		this.dom = createDomByHtml(`<div class="${CLASS_PREFIX}-wrap">
				${renderEntriesListHtml(entries, this.config)}
			</div>`, this.config.container);
		this.dom.querySelectorAll(`li>span.${CLASS_PREFIX}-title`).forEach(span => {
			let id = span.parentNode.getAttribute('data-id');
			span.addEventListener('click', e => {
				let n = searchNodeById(id, entries);
				n.focus();
				n.scrollIntoView({behavior: 'smooth'});
			});
		});
		eventDelegate(this.dom, `.${CLASS_PREFIX}-toggle`, 'click', (e, target)=>{
			let li = target.closest('li');
			li.classList.toggle(CLASS_PREFIX+'-collapse');
		});
	}

	/**
	 * 从指定 DOM 容器中解析标题节点并创建 TOC
	 * @param {HTMLElement} container
	 * @param {Object} config
	 */
	static createFromHeading(container = null, config = {}){
		container = container || document;
		let entries = Toc.resolveHeading(container);
		return new Toc(entries, config);
	}

	/**
	 * 从指定 DOM 节点中解析出标题节点列表
	 * @param {HTMLElement} container
	 */
	static resolveHeading(container){
		let levelMaps = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
		let allHeadings = Array.from(container.querySelectorAll(levelMaps.join(','))) || [];
		let entries = [
			//{id, title, level, relateNode, [
			// 		{id, title, level, relateNode, children}
			// 		{id, title, level, relateNode, children}
			// 		{id, title, level, relateNode, children}
			// ]}
			//{id, title, level, relateNode, children}
			//{id, title, level, relateNode, children}
		];
		const addResult = (title, level, relateNode, list) => {
			if(!list.length){
				return list.push({id: guid('toc-'), title, level, relateNode, children: []});
			}
			if(list[list.length - 1].level < level){
				addResult(title, level, relateNode, list[list.length - 1].children);
			}else if(list[list.length - 1].level === level){
				return list.push({id: guid('toc-'), title, level, relateNode, children: []});
			}else{
				addResult(title, level, relateNode, list[list.length - 1].children);
			}
		}
		allHeadings.forEach(relateNode => {
			let level = parseInt(relateNode.tagName.replace(/\D+/g, ''), 10);
			let title = relateNode.innerText;
			addResult(title, level, relateNode, entries);
		});
		console.log(entries);
		return entries;
	}
}

export {Toc};