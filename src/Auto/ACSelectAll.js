import {findAll, findOne, onDomTreeChange} from "../Lang/Dom.js";
import {triggerDomEvent} from "../Lang/Event.js";

const isCheckBox = node => {
	return node.tagName === 'INPUT' && node.type === 'checkbox';
}

const isValueButton = node => {
	return node.tagName === 'INPUT' && ['reset', 'submit', 'button'].includes(node.type);
}

const isPairTag = node => {
	return ['BUTTON', 'SPAN', 'DIV', 'P'].includes(node.tagName);
}

/**
 * 全选功能按钮，逻辑为：全选|取消选择，
 * 如果是checkbox控制，则支持显示部分选择状态
 */
export class ACSelectAll {
	static SELECT_ALL_TEXT = '全选';
	static UNSELECT_ALL_TEXT = '取消选择';
	static SELECT_TIP_TEMPLATE = '已选择 %c/%s';

	/**
	 * @param trigger
	 * @param {Object} params
	 * @param {String} params.container checkbox所在容器，缺省为body
	 * @param {String} params.selector checkbox 表达式，默认为 'input[type=checkbox]'
	 * @param {String} params.tip 提示语，%c 表示选中数量，%s 表示总数。
	 * @return {Promise<void>}
	 */
	static init(trigger, params = {}){
		const container = findOne(params.container || 'body');
		const checkbox_selector = params.selector || 'input[type=checkbox]';
		let tip = params.tip !== undefined ? params.tip :  ACSelectAll.SELECT_TIP_TEMPLATE;

		const disableTrigger = () => {
			trigger.setAttribute('disabled', 'disabled');
		}
		const enableTrigger = () => {
			trigger.removeAttribute('disabled');
		}

		let checks = [];
		let updateTrigger = () => {
			let checkedCount = 0;
			checks = checks.filter(chk=>!chk.disabled);
			checks.forEach(chk => {
				checkedCount += chk.checked ? 1 : 0;
			});
			if(tip){
				trigger.title = tip.replace(/%c/g, checkedCount).replace(/%s/g, checks.length);
			}
			if(isValueButton(trigger)){
				trigger.value = checkedCount ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
			}else if(isPairTag(trigger)){
				trigger.innerText = checkedCount ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
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

		trigger.addEventListener('click', () => {
			let toCheck;
			if(isValueButton(trigger) || isPairTag(trigger)){
				toCheck = (trigger.innerText || trigger.value) === this.SELECT_ALL_TEXT;
			}else if(isCheckBox(trigger)){
				toCheck = trigger.checked;
			}else{
				console.warn('Select All no support this type');
				return;
			}
			checks = checks.filter(chk=>!chk.disabled);
			checks.forEach(chk => {
				chk.checked = toCheck;
				triggerDomEvent(chk, 'change');
			});
			if(isValueButton(trigger)){
				trigger.value = toCheck ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT
			}else if(isPairTag(trigger)){
				trigger.innerText = toCheck ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
			}
		});

		let containerInit = () => {
			checks = findAll(checkbox_selector, container);
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
	}
}
