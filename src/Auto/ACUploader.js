import {Uploader} from "../Widget/Uploader.js";
import {objectKeyMapping} from "../Lang/Array.js";

/**
 * 上传组件
 * 参数：
 * *[data-uploader-value]
 * *[data-uploader-name]
 * *[data-uploader-thumb]
 * *[data-uploader-uploadurl]
 * *[data-uploader-···] 更多参数请参考 Uploader.constructor()
 * 使用举例：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 */
export class ACUploader {
	static init(node, params){
		return new Promise(resolve => {
			params = objectKeyMapping(params, {
				'uploadurl': 'uploadUrl',
				'uploadfilefieldname': 'uploadFileFieldName',
				'allowfiletypes': 'allowFileTypes',
				'filesizelimit': 'fileSizeLimit',
			});
			if(node.accept){
				params.allowFileTypes = node.accept;
			}
			Uploader.bindFileInput(node, params, params);
			resolve();
		});
	}
}