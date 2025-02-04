/**
 * 高亮内容
 * 参数：
 * *[data-highlight-keyword]
 * *[data-hl-kw]
 */
import {nodeHighlight} from "../Lang/Dom.js";

export class ACHighlight {
	static cssClass = 'highlight';

	static init(node, params = {}){
		let kw = (params.keyword || params.kw || '').trim();
		if(kw){
			nodeHighlight(node, kw, ACHighlight.cssClass);
		}
	}
}