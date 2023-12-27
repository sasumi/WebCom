import {onDomTreeChange} from "../Lang/Dom.js";

/**
 * 多选关联，如多个checkbox必须至少存在一个选中项目，关联的按钮才允许被使用。
 * 参数：
 * *[data-multiselectrelate-container] 指定关联容器（会监听该容器dom变更）
 */
export class ACMultiSelectRelate {
	static init(button, param = {}){
		return new Promise((resolve, reject) => {
			let checks = [];
			let container = document.querySelector(param.container || 'body');
			let disableBtn = () => {
				button.setAttribute('disabled', 'disabled');
			}
			let enableBtn = () => {
				button.removeAttribute('disabled');
			}
			let upd = () => {
				let hasChecked = false;
				checks.every(chk => {
					if(chk.checked){
						hasChecked = true;
						return false;
					}
				});
				hasChecked ? enableBtn() : disableBtn();
			};
			let containerInit = () => {
				checks = Array.from(container.querySelectorAll('input[type=checkbox]'));
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_relate){
						return;
					}
					chk.dataset.__bind_select_relate = "1";
					chk.addEventListener('change', upd);
				});
				upd();
			}
			onDomTreeChange(container, containerInit);
			containerInit();
		})
	}
}
