import {findAll, findOne, onDomTreeChange} from "../Lang/Dom.js";
import {triggerDomEvent} from "../Lang/Event.js";

const SELECT_ALL_TEXT = '全选';
const UNSELECT_ALL_TEXT = '取消选择';

/**
 * 全选功能按钮，逻辑为：全选|取消选择
 */
export class ACSelectAll {
	static init(node, param = {}){
		return new Promise((resolve, reject) => {
			let checks = [];
			let container = findOne(param.container || 'body');
			let disableBtn = () => {
				node.setAttribute('disabled', 'disabled');
			}
			let enableBtn = () => {
				node.removeAttribute('disabled');
			}
			let updBtn = () => {
				let checkedCount = 0;
				checks.forEach(chk => {
					checkedCount += chk.checked ? 1 : 0;
				});
				node.innerHTML = checkedCount ? UNSELECT_ALL_TEXT : SELECT_ALL_TEXT;
				checks.length ? enableBtn() : disableBtn();
			};
			onDomTreeChange(container, () => {
				checks = findAll('input[type=checkbox]', container);
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_all){
						return;
					}
					chk.dataset.__bind_select_all = "1";
					chk.addEventListener('change', updBtn);
				});
				updBtn();
			});

			node.addEventListener('click', e => {
				let toCheck = node.innerHTML === SELECT_ALL_TEXT;
				checks.forEach(chk => {
					chk.checked = toCheck;
					triggerDomEvent(chk, 'change');
				});
				node.innerHTML = toCheck ? UNSELECT_ALL_TEXT : SELECT_ALL_TEXT;
			});

			let containerInit = () => {
				checks = findAll('input[type=checkbox]', container);
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_all){
						return;
					}
					chk.dataset.__bind_select_all = "1";
					chk.addEventListener('change', updBtn);
				});
				updBtn();
			}
			onDomTreeChange(container, containerInit);
			containerInit();
		})
	}
}
