import {Select} from "../Widget/Select.js";

export class ACSelect {
	static init(node){
		return new Promise((resolve, reject) => {
			Select.bindSelect(node);
			resolve();
		});
	}
}