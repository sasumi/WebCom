import {domChangedWatch, findAll, findOne} from "../Lang/Dom.js";

/**
 * 多选关联，如多个checkbox必须至少存在一个选中项目，关联的按钮才允许被使用。
 * 参数：
 * *[data-multiselectrelate-container] 指定关联容器（会监听该容器dom变更）
 */
export class ACMultiSelectRelate {
	static active(button, param){
		return new Promise((resolve, reject) => {
			if(button.getAttribute('disabled')){
				reject('button disabled');
			}else{
				resolve();
			}
		});
	}

	static init(button, param = {}){
		return new Promise((resolve, reject) => {
			const container = findOne(param.container || 'body');
			const disableBtn = () => {
				button.title = '请选择要操作的项目';
				button.setAttribute('disabled', 'disabled');
				button.classList.add('button-disabled');
			}
			const enableBtn = () => {
				button.title = '';
				button.removeAttribute('disabled');
				button.classList.remove('button-disabled');

				//针对A标签或者input[formaction]的按钮，额外添加数据串
				if(button.href || button.formAction){
					let org_url = button.getAttribute('multiple-relate-select-org-url');
					if(!org_url){
						org_url = button.href || button.formAction;
						button.setAttribute('multiple-relate-select-org-url', org_url);
					}
					let data_str = [];
					findAll('input:checked', container).forEach(chk => {
						data_str.push(encodeURIComponent(chk.name) + '=' + encodeURIComponent(chk.value));
					});
					if(button.formAction){
						button.formAction = org_url + (org_url.indexOf('?') >= 0 ? '&' : '?') + data_str.join('&');
					}else{
						button.href = org_url + (org_url.indexOf('?') >= 0 ? '&' : '?') + data_str.join('&');
					}
				}
			}
			domChangedWatch(container, 'input:checked', coll => {
				coll.length ? enableBtn() : disableBtn()
			});
		})
	}
}
