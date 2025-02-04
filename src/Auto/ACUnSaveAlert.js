import {bindFormUnSavedUnloadAlert, resetFormChangedState} from "../Lang/Form.js";
import {ACAsync} from "./ACAsync.js";

/**
 * 复制内容
 * 参数：
 * *[data-copy-content]
 * *[data-copy-type] type 为 html 时表示复制内容为HTML
 * 使用举例：
 * <input type="button" value="复制链接” data-copy-content="http://abc.com" data-component="copy"/>
 */
export class ACUnSaveAlert {
	static init(form, params = {}){
		let msg = params.message || null;
		ACAsync.onSuccess.listen((node, rsp) => {
			if(node === form){
				resetFormChangedState(node)
			}
		});
		bindFormUnSavedUnloadAlert(form, msg);
	}
}