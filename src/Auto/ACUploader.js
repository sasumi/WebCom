import {Uploader} from "../Widget/Uploader.js";

/**
 * 上传组件
 * 参数：
 * *[data-uploader-value]
 * *[data-uploader-name]
 * *[data-uploader-thumb]
 * *[data-uploader-uploadUrl]
 * *[data-uploader-···] 更多参数请参考 Uploader.constructor()
 * 使用举例：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 */
export class ACUploader {
	static init(node, param){
		return new Promise(resolve => {
			Uploader.bindFileInput(node, param, param);
			resolve();
		});
	}
}