import {guid} from "../Lang/Util.js";
import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {escapeHtml} from "../Lang/Html.js";

let CLS = Theme.Namespace + 'toc';

insertStyleSheet(`
	.${CLS} {position:fixed; padding:.75em; box-shadow:var(${Theme.CssVar.PANEL_SHADOW});}
`, Theme.Namespace + 'toc-style');

export const resolveTocListFromDom = (dom = document.body, levelMaps = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) => {
	let allHeads = dom.querySelectorAll(levelMaps.join(','));
	let tocList = [];
	let serials = [];

	levelMaps.forEach(selector => {
		serials.push(Array.from(dom.querySelectorAll(selector)));
	});

	let calcLvl = (h) => {
		for(let i = 0; i < serials.length; i++){
			if(serials.includes(h)){
				return i;
			}
		}
	};

	allHeads.forEach(h => {
		tocList.push({
			text: h.innerText,
			refNode: h,
			level: calcLvl(h)
		})
	});
	return tocList;
}

export const Toc = (dom, levelMaps = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) => {
	let tocList = resolveTocListFromDom(dom, levelMaps);
	let tocHtml = '';
	tocList.forEach(item => {
		let id = Theme.Namespace+'toc' + guid();
		let helpNode = document.createElement('A');
		helpNode.id = id;
		item.refNode.parentNode.insertBefore(item.refNode, helpNode);
		tocHtml.push(`<a href="#${id}" data-level="${item.level}">${escapeHtml(item.text)}</a>`);
	});
	createDomByHtml(`
	<dl class="${CLS}">
		<dt>本页目录</dt>
		<dd>
			${tocHtml}
		</dd>
	</dl>`, document.body);
};
