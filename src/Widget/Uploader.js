import {buttonActiveBind, createDomByHtml, findOne, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {BizEvent} from "../Lang/Event.js";
import {Toast} from "./Toast.js";
import {uploadFile} from "../Lang/Net.js";

const NS = Theme.Namespace + 'uploader';
insertStyleSheet(`
	.${NS}{display:inline-block;position:relative;background-color:#dddddd;width:80px;height:80px;overflow:hidden;}
	
	.${NS}-file{width:100%;height:100%;position:absolute;cursor:pointer;display:flex;align-items:center;}
	.${NS}-file:before{flex:1;font-family:WebCom-iconfont, serif;content:"\\e9de";font-size:30px;text-align:center;}
	.${NS}-file input[type=file]{position:absolute;width:1px;height:1px;left:0;top:0;opacity:0;}
	
	.${NS}[data-state="empty"]{opacity:0.5}
	.${NS}[data-state="empty"]:hover{opacity:1; transition:all 1s linear}
	
	.${NS}[data-state="empty"] :is(.${NS}-handle,.${NS}-progress),
	.${NS}[data-state="pending"] :is(.${NS}-btn-clean, .${NS}-file, .${NS}-content),
	.${NS}[data-state="error"] :is(.${NS}-progress,.${NS}-btn-clean),
	.${NS}[data-state="normal"] :is(.${NS}-progress,.${NS}-btn-cancel),
	.${NS}[data-state="normal"] .${NS}-file:before{
		display:none;
	}
	
	.${NS}-handle{width:100%;position:absolute;padding:.25em;text-align:right;box-sizing:border-box;bottom:0;}
	.${NS}-content{width:100%;height:100%;}
	.${NS}-content img{display:inline-block;width:100%;height:100%;object-fit:cover;}
	
	.${NS}-progress{width:100%;height:100%;padding:0 .5em;display:flex;flex-direction:column;box-sizing:border-box;justify-content:center;align-items:center;font-size:0.9em;color:gray;user-select:none;}
	.${NS}-progress progress{width:100%; transition:all 1s linear}
	
	.${NS}-btn{display:inline-block;user-select:none;cursor:pointer;color:white;text-shadow:1px 1px 1px gray;opacity:0.7;}
	.${NS}-btn:hover{opacity:1;}
	.${NS}-btn:before{content:""; font-family:WebCom-iconfont, serif}
	.${NS}-btn-cancel:before{content:"\\e61a"}
	.${NS}-btn-clean:before{content:"\\e61b"}
`);

export const UPLOADER_IMAGE_DEFAULT_CLASS = `${NS}-image`;
export const UPLOADER_FILE_DEFAULT_CLASS = `${NS}-file`;

export const UPLOAD_STATE_EMPTY = 'empty'; //空值情况
export const UPLOAD_STATE_PENDING = 'pending'; //上传中
export const UPLOAD_STATE_ERROR = 'error'; //上传失败
export const UPLOAD_STATE_NORMAL = 'normal'; //正常情况(有值)

export const FILE_TYPE_IMAGE = 'image/*';
export const FILE_TYPE_VIDEO = 'video/*';
export const FILE_TYPE_AUDIO = 'audio/*';
export const FILE_TYPE_DOC = '.txt,.md,.doc,.docx';
export const FILE_TYPE_SHEET = '.xls,.xlsx,.csv'

/**
 * 缺省后端返回格式处理器
 * @param {String} rspText
 * @return {Object}
 * @constructor
 */
const DEFAULT_RSP_HANDLE = (rspText) => {
	let rsp = JSON.parse(rspText);
	return {
		error: rsp.error,
		value: rsp.value,
		name: rsp.name,
		thumb: rsp.thumb,
	}
}

const mergeNoNull = (target, source) => {
	for(let i in source){
		if(source[i] !== null){
			target[i] = source[i];
		}
	}
}

/**
 * @param {Uploader} up
 */
const cleanUpload = (up) => {
	updateState(up, UPLOAD_STATE_EMPTY);
}

/**
 * @param {Uploader} up
 */
const cancelUpload = up => {
	try{
		up.xhr && up.xhr.abort()
	}catch(err){
		console.error(err)
	}
	updateState(up, up.value ? UPLOAD_STATE_NORMAL : UPLOAD_STATE_EMPTY);
}

/**
 * 更新上传状态
 * @param {Uploader} up
 * @param {String} state
 * @param {*} data
 */
const updateState = (up, state, data = null) => {
	const fileEl = findOne('input[type=file]', up.dom);
	const contentCtn = findOne(`.${NS}-content`, up.dom);
	up.dom.setAttribute('data-state', state);
	up.dom.title = '';
	switch(state){
		case UPLOAD_STATE_EMPTY:
			fileEl.value = '';
			contentCtn.innerHTML = '';
			up.onClean.fire();
			break;

		case UPLOAD_STATE_PENDING:
			up.onUploading.fire();
			break;

		case UPLOAD_STATE_NORMAL:
			fileEl.value = '';
			up.dom.title = up.name;
			contentCtn.innerHTML = `<img alt="" src="${up.thumb}">`;
			up.onSuccess.fire({name: up.name, value: up.value, thumb: up.thumb});
			break;

		case UPLOAD_STATE_ERROR:
			fileEl.value = '';
			updateState(up, up.value ? UPLOAD_STATE_NORMAL : UPLOAD_STATE_EMPTY); //出现错误还原上一个状态
			console.error('Uploader Error:', data);
			up.onError.fire(data);
			break;
		default:
			throw "todo";
	}
}

/**
 * 上传组件
 */
export class Uploader {
	state = UPLOAD_STATE_EMPTY;
	xhr = null;

	dom = null; //组件节点
	value = null; //上传结果值
	thumb = ''; //上传结果缩略图URL
	name = ''; //上传结果名称

	onSuccess = new BizEvent();
	onAbort = new BizEvent();
	onUploading = new BizEvent();
	onClean = new BizEvent();
	onError = new BizEvent();

	static globalUploadUrl = ''; //全局默认上传地址。如果option里面uploadUrl为空，则使用该配置

	option = {
		uploadUrl: null, //上传接口地址
		uploadFileFieldName: 'file', //上传接口调用中文件名称对应变量名称
		required: false, //上传组件是否必填
		allowFileTypes: [], //允许文件类型
		fileSizeLimit: 0, //允许最大上传文件大小
		uploadResponseHandle: DEFAULT_RSP_HANDLE //默认相应处理函数
	};

	/**
	 * 通过input绑定文件上传，这个input可以是file，也可以是hidden
	 * @param {HTMLFormElement} inputEl
	 * @param {Object} initData
	 * @param {Object} option
	 * @return {Uploader}
	 */
	static bindFileInput(inputEl, initData = {}, option = {}){
		let name = initData.name || inputEl.name;
		let value = initData.value || inputEl.value;
		let accepts = inputEl.accept.split(',');
		let virtualDom = document.createElement('span');
		option.required = inputEl.required;
		if(accepts.length){
			option.allowFileTypes = accepts;
		}
		inputEl.parentNode.insertBefore(virtualDom, inputEl.nextSibling);
		inputEl.required = false;
		inputEl.style.cssText = 'display:none';
		const up = new Uploader(virtualDom, {name, value, thumb: initData.thumb}, option);
		up.onClean.listen(() => {
			inputEl.value = '';
		});
		if(inputEl.type !== 'file'){
			up.onSuccess.listen(data => {
				inputEl.value = data.value;
			})
		}
		return up;
	}

	/**
	 * 构造函数
	 * @param {Node} container
	 * @param {Object} initData 初始化数据（可为空）
	 * @param {String} initData.value 初始化数据 - 值（可为空）
	 * @param {String} initData.thumb 初始化数据 - 缩略图（可为空）
	 * @param {String} initData.name 初始化数据 - 显示名称（可为空）
	 * @param {Object} option
	 * @param {String} option.uploadUrl
	 * @param {Boolean} option.required
	 * @param {Number} option.fileSizeLimit
	 * @param {String[]} option.allowFileTypes
	 */
	constructor(container, initData = {}, option = {
		uploadUrl: null,
		required: null,
		fileSizeLimit: null,
		allowFileTypes: null,
		uploadResponseHandle: null
	}){
		this.value = initData.value || '';
		this.thumb = initData.thumb || '';
		this.name = initData.name || '';

		mergeNoNull(this.option, option);
		this.option.uploadUrl = this.option.uploadUrl || Uploader.globalUploadUrl;
		if(!this.option.uploadUrl){
			throw "需要提供上传接口地址：option.uploadUrl 或者 Uploader.globalUploadUrl";
		}

		//default error handle
		this.onError.listen(err => {Toast.showError(err);});
		let acceptStr = this.option.allowFileTypes.join(',');
		const html =
			`<div class="${NS}" data-state="${this.state}">
			<label class="${NS}-file">
				<input type="file" tabindex="0" accept="${acceptStr}" value="${this.value}" ${this.option.required ? 'required' : ''}>
			</label>
			<div class="${NS}-progress">
				<progress max="100" value="0">0%</progress>
				<span>0%</span>
			</div>
			<div class="${NS}-content"></div>
			<div class="${NS}-handle">
				<span role="button" tabindex="0" class="${NS}-btn ${NS}-btn-cancel" title="取消上传"></span>
				<span role="button" tabindex="0" class="${NS}-btn ${NS}-btn-clean" title="清除"></span>
			</div>
		</div>`;
		this.dom = createDomByHtml(html, container);
		const fileEl = findOne('input[type=file]', this.dom);

		buttonActiveBind(findOne(`.${NS}-btn-clean`, this.dom), () => {cleanUpload(this);});
		buttonActiveBind(findOne(`.${NS}-btn-cancel`, this.dom), () => {cancelUpload(this);});

		updateState(this, this.value ? UPLOAD_STATE_NORMAL : UPLOAD_STATE_EMPTY);
		fileEl.addEventListener('change', () => {
			let file = fileEl.files[0];
			if(file){
				if(file.size < 1){
					Toast.showError('所选的文件内容为空');
					return;
				}
				if(this.option.fileSizeLimit && file.size < this.option.fileSizeLimit){
					Toast.showError('所选的文件大小超出限制');
					return;
				}
				updateState(this, UPLOAD_STATE_PENDING);
				this.xhr = uploadFile(this.option.uploadUrl, {[this.option.uploadFileFieldName]: file}, {
					onSuccess: responseText => {
						try{
							console.log('response text', responseText);
							let tmp = this.option.uploadResponseHandle(responseText);
							this.value = tmp.value;
							this.thumb = tmp.thumb;
							this.name = tmp.name
							updateState(this, UPLOAD_STATE_NORMAL);
						}catch(err){
							updateState(this, UPLOAD_STATE_ERROR, err);
						}
					},
					onProgress: (percent, total) => {
						updateState(this, UPLOAD_STATE_PENDING);
						const progressEl = findOne('progress', this.dom);
						const progressPnt = findOne(`.${NS}-progress span`, this.dom);
						progressEl.value = percent;
						progressEl.max = total;
						progressPnt.innerHTML = Math.round(100 * percent / total) + '%';
					},
					onError: (err) => {
						updateState(this, UPLOAD_STATE_ERROR, err);
					},
					onAbort: () => {
						updateState(this, UPLOAD_STATE_EMPTY);
					},
				});
			}
		});

	}

	/**
	 * 停止上传
	 */
	abort(){
		cancelUpload(this);
	}

	/**
	 * 获取当前值
	 * @return {null}
	 */
	getValue(){
		return this.value;
	}

	/**
	 * 获取当前值（异步）
	 * @return {Promise<unknown>}
	 */
	getValueAsync(){
		return new Promise((resolve, reject) => {
			if(this.state !== UPLOAD_STATE_PENDING){
				resolve(this.getValue());
			}else{
				let success_handle = () => {
					resolve(this.getValue());
					this.onSuccess.remove(success_handle);
				};
				let error_handle = (msg) => {
					reject(msg);
					this.onError.remove(error_handle);
				}
				this.onSuccess.listen(success_handle)
				this.onError.listen(error_handle);
			}
		});
	}
}