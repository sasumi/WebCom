import {Select} from "../Widget/Select.js";

/**
 * 将 select 或者 input[list] 对象绑定使用 Select UI组件
 * 参数：
 * select
 * input[list]
 */
export class ACSelect {
	static init(node){
		if(node.tagName === 'SELECT'){
			Select.bindSelect(node);
		}
		else if(node.tagName === 'INPUT' && node.list){
			Select.bindTextInput(node);
		}
		return Promise.resolve();
	}
}