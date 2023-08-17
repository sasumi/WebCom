import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {BizEvent} from "../Lang/Event.js";
import {Toast} from "./Toast.js";

const NS = Theme.Namespace + 'uploader';
insertStyleSheet(`
	.${NS} {}
`);

export const UPLOAD_STATE_EMPTY = 'empty';
export const UPLOAD_STATE_PENDING = 'pending';
export const UPLOAD_STATE_ERROR = 'error';
export const UPLOAD_STATE_NORMAL = 'normal';

export const UPLOAD_ERROR_FILE_SIZE_OVERLOAD = 'file_size_overload';
export const UPLOAD_ERROR_FILE_EMPTY = 'file_empty';

export const FILE_TYPE_IMAGE = 'image/*';
export const FILE_TYPE_VIDEO = 'video/*';
export const FILE_TYPE_AUDIO = 'audio/*';
export const FILE_TYPE_DOC = '.txt,.md,.doc,.docx';
export const FILE_TYPE_SHEET = '.xls,.xlsx,.csv'

const UPLOAD_PROGRESS_CHECK_INTERVAL_DEFAULT = 100;
const UPLOAD_FILE_SIZE_MAX_DEFAULT = 10 * 1024 * 1024; //10MB

/**
 * 缺省后端返回格式处理器
 * @param {String} rspText
 * @return {{thumb, error: *, value}}
 * @constructor
 */
const DEFAULT_RSP_HANDLE = (rspText) => {
	let rsp = JSON.parse(rspText);
	return {
		error: rsp.code !== 0 ? rsp.message : '',
		value: rsp.data,
		thumb: rsp.data
	}
}

/**
 * @param {Uploader} up
 * @param {File} file
 * @param {Object} callbacks
 * @param {Function} callbacks.onSuccess
 * @param {Function} callbacks.onProgress
 * @param {Function} callbacks.onError
 * @param {Function} callbacks.onAbort
 */
const startUpload = (up, file, callbacks) => {
	let {onSuccess, onProgress, onError, onAbort} = callbacks;
	let xhr = new XMLHttpRequest();
	up.xhr = xhr;
	let formData = new FormData();
	let total = file.size;
	formData.append(up.option.uploadFileFieldName, file);
	xhr.withCredentials = true;
	xhr.upload.addEventListener('progress', e => {
		onProgress(e.loaded, total);
	}, false);
	xhr.addEventListener('load', e => {
		onProgress(total, total);
		let v = up.option.uploadResponseHandle(xhr.responseText);
		onSuccess(v);
	});
	xhr.addEventListener('error', e => {
		onError(e);
	});
	xhr.addEventListener('abort', e => {
		onAbort();
	});
	xhr.open('POST', up.option.uploadUrl);
	xhr.send(formData);
}

/**
 * @param {Uploader} up
 */
const renderDom = (up) => {

}

const mergeNoNull = (target, source) => {
	for(let i in source){
		if(source[i] !== null){
			target[i] = source[i];
		}
	}
}

const cleanUpload = (up) => {

}

const cancelUpload = up => {

}

const resetUpload = (up) => {
	const fileEl = up.container.querySelector('input[type=file]');
	fileEl.value = up.initValue || '';
	updateState(up, UPLOAD_STATE_EMPTY);
}

const updateState = (up, state) => {
	const dom = up.container.querySelector('.' + NS);
	dom.setAttribute('data-state', state);
	switch(state){
		case UPLOAD_STATE_PENDING:
			up.onUploading.fire();
			break;
		case UPLOAD_STATE_NORMAL:
			up.onSuccess.fire();
			break;
		case UPLOAD_STATE_ERROR:
			up.onError.fire();
			break;
	}
}

export class Uploader {
	state = UPLOAD_STATE_EMPTY;
	xhr = null;

	/**
	 * 渲染容器
	 * @type {HTMLElement}
	 */
	container = null;

	onSuccess = new BizEvent();
	onAbort = new BizEvent();
	onResponse = new BizEvent();
	onUploading = new BizEvent();
	onDelete = new BizEvent();
	onError = new BizEvent();

	static globalUploadUrl = '';

	option = {
		uploadUrl: '',
		required: false,
		initValue: null,
		initThumb: null,
		allowFileTypes: [],
		fileSizeLimit: 0,
		uploadFileFieldName: 'file',
		uploadResponseHandle: DEFAULT_RSP_HANDLE
	};

	static bindFileInput(fileEl, option){

	}

	constructor(container, option = {
		uploadUrl: null, //上传URL【必填】
		required: null,
		initValue: null,
		initThumb: null,
		fileSizeLimit: null,
		allowFileTypes: null,
		uploadResponseHandle: null
	}){
		this.container = container;
		mergeNoNull(this.option, option);
		option.uploadUrl = option.uploadUrl || Uploader.globalUploadUrl;
		if(!option.uploadUrl){
			throw "upload url required";
		}
		//default error handle
		this.onError.listen(err=>{
			Toast.showError(err);
		});
		let acceptStr = this.option.allowFileTypes.join(',');
		const html =
			`<div class="${NS}" data-state="${this.state}">
			<label class="${NS}-file">
				<input type="file" accept="${acceptStr}" value="${this.option.initValue || ''}" ${this.option.required ? 'required' : ''}>
			</label>
			<div class="${NS}-progress">
				<progress max="100" value="0">0%</progress>
				<span>0%</span>
			</div>
			<div class="${NS}-content"></div>
			<div class="${NS}-error"></div>
			<div class="${NS}-handle">
				<span role="button" class="${NS}-btn ${NS}-btn-reset" title="重置"></span>
				<span role="button" class="${NS}-btn ${NS}-btn-cancel" title="取消上传"></span>
				<span role="button" class="${NS}-btn ${NS}-btn-delete" title="删除"></span>
			</div>
		</div>`;
		const dom = createDomByHtml(html, this.container);
		const fileEl = dom.querySelector('input[type=file]');
		const progressEl = dom.querySelector('progress');
		const progressPnt = dom.querySelector(`.${NS}-progress span`);
		const contentCtn = dom.querySelector(`.${NS}-content`);
		const errorCtn = dom.querySelector(`.${NS}-error`);
		const resetBtn = dom.querySelector(`.${NS}-btn-reset`);
		const cancelBtn = dom.querySelector(`.${NS}-btn-cancel`);
		const deleteBtn = dom.querySelector(`.${NS}-btn-delete`);

		resetBtn.addEventListener('click', e => {
			resetUpload(this);
		});

		deleteBtn.addEventListener('click', e => {
			cleanUpload(this);
		});

		cancelBtn.addEventListener('click', e => {
			cancelUpload(this);
		});

		fileEl.addEventListener('change', e => {
			let file = fileEl.files[0];
			if(file){
				if(file.size < 1){
					this.onError.fire('所选的文件内容为空', UPLOAD_ERROR_FILE_EMPTY);
					resetUpload(this);
					return;
				}
				if(this.option.fileSizeLimit && file.size < this.option.fileSizeLimit){
					this.onError.fire('所选的文件大小超出限制', UPLOAD_ERROR_FILE_SIZE_OVERLOAD);
					resetUpload(this);
					return;
				}
				updateState(this, UPLOAD_STATE_PENDING);
				startUpload(this, file, {
					onSuccess: result=>{
						updateState(this, UPLOAD_STATE_NORMAL);
						contentCtn.innerHTML = `<img src="${result.thumb}">`;
					},
					onProgress: (percent, total) => {
						updateState(this, UPLOAD_STATE_PENDING);
						progressEl.value = percent;
						progressEl.max = total;
						progressPnt.innerHTML = Math.round(100 * percent / total) + '%';
					},
					onError: (err) => {
						updateState(this, UPLOAD_STATE_ERROR);
						errorCtn.innerHTML = err;
					},
					onAbort: ()=>{
						updateState(this, UPLOAD_STATE_EMPTY);
					},
				});
			}
		});
	}

	abort(){
		if(this.xhr && this.xhr.abort()){
			resetUpload(this);
		}
	}

	getData(){

	}

	getDataAsync(){
		return new Promise((resolve, reject) => {
			if(this.state !== UPLOAD_STATE_PENDING){
				resolve(this.getData());
			}else{
				let fn = () => {
					resolve(this.getData());
					this.onSuccess.remove(fn);
				};
				this.onSuccess.listen(fn)
			}
		});
	}
}