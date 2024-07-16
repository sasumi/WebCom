import {Select} from "../Widget/Select.js";

/**
 * 将 select 或者 input[list] 对象绑定使用 Select UI组件
 * 参数：
 * select
 * input[list]
 */
export class ACSelect {
	static init(node, params){
		if(params.displaysearchinput !== undefined){
			params.displaySearchInput = !!params.displaysearchinput; //修正大小写参数名称问题
		}
		if(node.tagName === 'SELECT'){
			Select.bindSelect(node, params);
		}else if(node.tagName === 'INPUT' && node.list){
			Select.bindTextInput(node, params);
		}
		return Promise.resolve();
	}
}