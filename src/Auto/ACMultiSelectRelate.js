import {domChangedWatch, findAll, findOne, toggleDisabled} from "../Lang/Dom.js";
import {mergerUriParam} from "../Lang/Net.js";

/**
 * 多选关联，如多个checkbox必须至少存在一个选中项目，关联的按钮才允许被使用。
 * 参数：
 * *[data-multiselectrelate-container] 指定关联容器（会监听该容器dom变更）
 */
export class ACMultiSelectRelate {
	static init(node, params = {}){
		const container = findOne(params.container || 'body');
		const orgUrl = node.href || node.formAction;

		//针对A标签或者input[formaction]的按钮，额外添加数据串
		const patchDataUri = () => {
			if(node.href || node.formAction){
				let data_str = [];
				findAll('input:checked', container).forEach(chk => {
					data_str.push(encodeURIComponent(chk.name) + '=' + encodeURIComponent(chk.value));
				});
				data_str = data_str.join('&');
				if(node.formAction){
					node.formAction = mergerUriParam(orgUrl, data_str);
				}else{
					node.href = mergerUriParam(orgUrl, data_str);
				}
			}
		}

		domChangedWatch(container, 'input:checked', coll => {
			const toEnabled = !!coll.length;
			toggleDisabled(node, '', toEnabled);
			node.title = toEnabled ? '' : '请选择要操作的项目';
			if(toEnabled){
				patchDataUri();
			}
		});
	}
}
