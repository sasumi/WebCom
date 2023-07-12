import {Select} from "../Widget/Select.js";

/**
 * 将 select 或者 input[list] 对象绑定使用 Select UI组件
 */
export class ACSelect {
	static init(node){
		return new Promise((resolve, reject) => {
			if(node.tagName === 'SELECT'){
				Select.bindSelect(node);
				resolve();
				return;
			}
			if(node.tagName === 'INPUT' && node.list){
				Select.bindTextInput(node);
				resolve();
				return;
			}

			reject('node type no support');
		});
	}
}