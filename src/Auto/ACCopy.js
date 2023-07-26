import {copy, copyFormatted} from "../Widget/Copy.js";

/**
 * 复制内容
 * 参数：
 * *[data-copy-content]
 * *[data-copy-type] type 为 html 时表示复制内容为HTML
 * 使用举例：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 */
export class ACCopy {
	static active(node, param = {}){
		return new Promise((resolve, reject) => {
			if(!param.content){
				throw "复制内容为空";
			}
			param.type === 'html' ? copyFormatted(param.content) : copy(param.content);
			resolve();
		});
	}
}