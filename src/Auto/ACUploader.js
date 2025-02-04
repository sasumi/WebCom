import {Uploader} from "../Widget/Uploader.js";
import {objectKeyMapping} from "../Lang/Array.js";

/**
 * 上传组件
 * 参数：
 * *[data-uploader-value] 上传值
 * *[data-uploader-name] 上传文件文件名
 * *[data-uploader-thumb] 上传初始值缩略图地址
 * *[data-uploader-uploadurl] 上传CGI
 * *[data-uploader-···] 更多参数请参考 Uploader.constructor()
 * 使用举例：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 */
export class ACUploader {
	static init(node, params){
		params = objectKeyMapping(params, {
			'uploadurl': 'uploadUrl',
			'uploadfilefieldname': 'uploadFileFieldName',
			'allowfiletypes': 'allowFileTypes',
			'filesizelimit': 'fileSizeLimit',
		});
		if(node.accept){
			params.allowFileTypes = node.accept;
		}
		Uploader.bindInput(node, params, params);
	}
}