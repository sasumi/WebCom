import {findAll, findOne, insertStyleSheet, nodeIndex} from "../Lang/Dom.js";
import {Dialog, DLG_CLS_WEAK_BTN} from "../Widget/Dialog.js";
import {Theme} from "../Widget/Theme.js";
import {getAvailableElements} from "../Lang/Form.js";

const NS = Theme.Namespace + 'ac-column-filler';

insertStyleSheet(`
	.${NS} {padding:2em 2em 1em 2em; text-align:center;}
`)

const syncValue = (fromEl, toEl) => {
	if(fromEl.tagName === 'INPUT' && (fromEl.type === 'checkbox' || fromEl.type === 'radio')){
		toEl.checked = fromEl.checked;
	}else if(fromEl.tagName === 'SELECT' && fromEl.multiple){
		Array.from(toEl.options).forEach(opt => {
			opt.selected = false;
		});
		Array.from(fromEl.selectedOptions).forEach(opt => {
			Array.from(toEl.options)[opt.index].selected = true;
		});
	}else{
		toEl.value = fromEl.value;
	}
}

/**
 * 批量填充功能
 */
export class ACColumnFiller {
	static active(node, param = {}){
		const TABLE = node.closest('tbody') || findOne('tbody', node.closest('table')) || node.closest('table');
		if(!TABLE){
			throw "no table found";
		}

		const _current_tr = node.closest('tr');
		let COL_IDX = 0;
		if(node.closest('th')){
			COL_IDX = nodeIndex(node.closest('th'));
		}else if(node.closest('td')){
			COL_IDX = nodeIndex(node.closest('td'));
		}else{
			throw "column index no detected";
		}
		let trs = findAll('tr', TABLE);
		let AVAILABLE_ROWS = trs.filter(t => {
			return t !== _current_tr;
		});
		if(!AVAILABLE_ROWS.length){
			throw "no form row find";
		}
		let tmpl_cell = Array.from(AVAILABLE_ROWS[0].children)[COL_IDX];
		if(!tmpl_cell){
			throw "no cell found by IDX:" + COL_IDX;
		}
		if(!getAvailableElements(tmpl_cell, true).length){
			throw "no form element found";
		}

		let form_html = tmpl_cell.innerHTML;
		let form, dlg;
		return new Promise((resolve, reject) => {
			let doFill = () => {
				let els = getAvailableElements(form, true);
				AVAILABLE_ROWS.forEach(row => {
					let _els = getAvailableElements(Array.from(row.children)[COL_IDX], true);
					els.forEach((e, idx) => {
						syncValue(e, _els[idx]);
					});
				})
				dlg.close();
			};
			dlg = Dialog.show('批量设置',
				`<form class="${NS}">${form_html}</form>`, {
					width: 350,
					buttons: [
						{
							default: true,
							title: '确定', callback: () => {
								doFill();
								dlg.close();
							}
						},
						{title: '关闭', className: DLG_CLS_WEAK_BTN}
					]
				});
			form = dlg.dom.querySelector('form');
			form.addEventListener('submit', doFill);
			let els = getAvailableElements(form, true);
			els[0].focus();
			resolve();
		});
	}
}
