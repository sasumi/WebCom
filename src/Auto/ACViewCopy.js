import {Theme} from "../Widget/Theme.js";
import {Dialog} from "../Widget/Dialog.js";
import {copy} from "../Widget/Copy.js";
import {Toast} from "../Widget/Toast.js";
import {trans} from "../I18N/Lang.js";
import {insertStyleSheet} from "../Lang/Dom.js";
import {downloadString} from "../Lang/Net.js";

const NS = Theme.Namespace + 'ac-view-copy';

/**
 * 查看并复制内容
 * 参数：
 * *[data-viewcopy-content]
 * *[data-viewcopy-file] 支持下载保存为文件，文件名为空缺省使用 <文件.txt>
 * *[data-viewcopy-filemime] 指定下载文件MIME，缺省使用 text/plain
 */
export class ACViewCopy {
	static init(node, param){
		insertStyleSheet(`
			.${NS}-txt-wrap {padding:0.5em 1em;}
			.${NS}-txt {width:100%; box-sizing:border-box; min-height:12em; resize:vertical;}
		`, NS);
	}

	static active(node, param){
		return new Promise(resolve => {
			if(!param.content){
				console.error('没有内容', param);
				return;
			}

			//另存为文件
			let extButtons = [];
			if(param.file !== undefined){
				let fileName = param.file || '文件.txt';
				extButtons = [{title:"下载", callback:()=>{
					downloadString(param.content, fileName);
				}}];
			}

			let html =
`<div class="${NS}-txt-wrap">
	<textarea readonly class="${NS}-txt"></textarea>
</div>`;
			let txt = null;
			let dlg = Dialog.show('复制', html, {
				buttons:[
					{title:"复制内容", callback:()=>{
						try{
							txt.select();
							document.execCommand('copy');
							Toast.showSuccess(trans('内容已复制到剪贴板'));
						}catch(err){
							console.error(err);
							Toast.showWarning('复制失败，请手工复制');
						}
					}},
					...extButtons,
					{title:"关闭"},
				]
			});
			txt = dlg.dom.querySelector('textarea');
			txt.value = param.content;
			resolve();
		})
	}
}