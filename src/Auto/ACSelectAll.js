import {findAll, findOne, isButton, onDomTreeChange} from "../Lang/Dom.js";
import {triggerDomEvent} from "../Lang/Event.js";

const isCheckBox = node => {
	return node.tagName === 'INPUT' && node.type === 'checkbox';
}

/**
 * 全选功能按钮，逻辑为：全选|取消选择，
 * 如果是checkbox控制，则支持显示部分选择状态
 */
export class ACSelectAll {
	static SELECT_ALL_TEXT = '全选';
	static UNSELECT_ALL_TEXT = '取消选择';

	static init(trigger, param = {}){
		return new Promise((resolve, reject) => {
			const container = findOne(param.container || 'body');
			const disableTrigger = () => {
				trigger.setAttribute('disabled', 'disabled');
			}
			const enableTrigger = () => {
				trigger.removeAttribute('disabled');
			}

			let checks = [];
			let updateTrigger = () => {
				let checkedCount = 0;
				checks.forEach(chk => {
					checkedCount += chk.checked ? 1 : 0;
				});
				if(isButton(trigger)){
					if(trigger.innerText){
						trigger.innerText = checkedCount ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
					}else{
						trigger.value = checkedCount ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
					}
				}else if(isCheckBox(trigger)){
					trigger.indeterminate = checkedCount && checkedCount !== checks.length;
					trigger.checked = checkedCount;
				}
				checks.length ? enableTrigger() : disableTrigger();
			};

			onDomTreeChange(container, () => {
				checks = findAll('input[type=checkbox]', container);
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_all){
						return;
					}
					chk.dataset.__bind_select_all = "1";
					chk.addEventListener('change', updateTrigger);
				});
				updateTrigger();
			});

			trigger.addEventListener('click', e => {
				let toCheck;
				if(isButton(trigger)){
					toCheck = (trigger.innerText || trigger.value) === this.SELECT_ALL_TEXT;
				}else if(isCheckBox(trigger)){
					toCheck = trigger.checked;
				}else{
					console.warn('Select All no support this type');
					return;
				}
				checks.forEach(chk => {
					chk.checked = toCheck;
					triggerDomEvent(chk, 'change');
				});
				if(isButton(trigger)){
					if(trigger.innerText){
						trigger.innerText = toCheck ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
					}else{
						trigger.value = toCheck ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT
					}
				}
			});

			let containerInit = () => {
				checks = findAll('input[type=checkbox]', container);
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_all){
						return;
					}
					chk.dataset.__bind_select_all = "1";
					chk.addEventListener('change', updateTrigger);
				});
				updateTrigger();
			}
			onDomTreeChange(container, containerInit);
			containerInit();
			resolve();
		})
	}
}
