import {domChangedWatch} from "../Lang/Dom.js";
/**
 * 多选关联，如多个checkbox必须至少存在一个选中项目，关联的按钮才允许被使用。
 * 参数：
 * *[data-multiselectrelate-container] 指定关联容器（会监听该容器dom变更）
 */
export class ACMultiSelectRelate {
	static init(button, param = {}){
		return new Promise((resolve, reject) => {
			const container = document.querySelector(param.container || 'body');
			const disableBtn = () => {
				button.title = '请选择要操作的项目';
				button.setAttribute('disabled', 'disabled');
				button.classList.add('button-disabled');
			}
			const enableBtn = () => {
				button.title = '';
				button.removeAttribute('disabled');
				button.classList.remove('button-disabled');
			}
			domChangedWatch(container, 'input:checked', exists => {
				exists ? enableBtn() : disableBtn()
			});
		})
	}
}
