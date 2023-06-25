import {Tip} from "../Widget/Tip.js";


export class ACTip {
	static init(node, {content}){
		return new Promise((resolve, reject) => {
			new Tip(content, node);
			resolve();
		});
	}
}