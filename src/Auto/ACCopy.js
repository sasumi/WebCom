import {copy, copyFormatted} from "../Widget/Copy.js";

/**
 * 复制内容
 * 参数：
 * *[data-copy-content]
 * *[data-copy-type] type 为 html 时表示复制内容为HTML
 */
export class ACCopy {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			let content = param.content;
			let type = param.type || 'html';
			if(!content){
				throw "复制内容为空";
			}
			type === 'html' ? copyFormatted(content) : copy(content);
			resolve();
		});
	}
}