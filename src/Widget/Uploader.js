import {createDomByHtml, insertStyleSheet} from "../Lang/Dom.js";
import {Theme} from "./Theme.js";
import {BizEvent} from "../Lang/Event.js";

const NS = Theme.Namespace + '-uploader';
insertStyleSheet(`
	.${NS} {}
	
	.${NS}-btn {display:inline-block; use-select:none; cursor:pointer}
	.${NS}-btn-reset:before {content:"重新上传"}
	.${NS}-btn-cancel:before {content:"取消"}
	.${NS}-btn-delete:before {content:"删除"}
`);

export const UPLOAD_STATE_INIT = 0;
export const UPLOAD_STATE_PENDING = 1;
export const UPLOAD_STATE_ERROR = 2;
export const UPLOAD_STATE_SUCCESS = 3;

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
 * @param rsp
 * @return {{thumb, error: *, value}}
 * @constructor
 */
const DEFAULT_RSP_HANDLE = (rsp) => {
	return {
		error: rsp.code !== 0 ? rsp.message : '',
		value: rsp.data,
		thumb: rsp.data
	}
}

/**
 * @param {Uploader} up
 * @param {File} file
 */
const startUpload = (up, file) => {
	let xhr = new XMLHttpRequest();
	up.xhr = xhr;
	let formData = new FormData();
	formData.append(up.option.uploadFileFieldName, file);
	xhr.withCredentials = true;
	xhr.upload.addEventListener('progress', e => {
		up.onUploading.fire(e.loaded, e.total);
	}, false);
	xhr.addEventListener('load', e => {
		let v = up.option.uploadResponseHandle(e.returnValue);
	});
	xhr.addEventListener('error', e => {
	});
	xhr.addEventListener('abort', e => {
		up.onAbort.fire()
	});
	xhr.open('POST', up.option.uploadUrl);
	xhr.send(formData);
}

/**
 * @param {Uploader} up
 */
const renderDom = (up) => {
	let acceptStr = up.option.allowFileTypes.join(',');
	const html =
		`<div class="${NS}" data-state="${up.state}">
		<label class="${NS}-file">
			<input type="file" accept="${acceptStr}" value="${up.option.initValue || ''}" ${up.option.required ? 'required' : ''}>
		</label>
		<div class="${NS}-progress">
			<progress max="100" value="0">0%</progress>
			<span>0%</span>
		</div>
		<div class="${NS}-content"></div>
		<div class="${NS}-handle">
			<span role="button" class="${NS}-btn ${NS}-btn-reset"></span>
			<span role="button" class="${NS}-btn ${NS}-btn-clean"></span>
			<span role="button" class="${NS}-btn ${NS}-btn-cancel"></span>
			<span role="button" class="${NS}-btn ${NS}-btn-delete"></span>
		</div>
	</div>`;
	const dom = createDomByHtml(html, up.container);
	const fileEl = dom.querySelector('input[type=file]');

	dom.querySelector(`.${NS}-btn-reset`).addEventListener('click', e => {
		resetUpload(up);
	});
	dom.querySelector(`.${NS}-btn-clean`).addEventListener('click', e => {
		cleanUpload(up);
	});

	dom.querySelector(`.${NS}-btn-delete`).addEventListener('click', e => {

	});

	dom.querySelector(`.${NS}-btn-cancel`).addEventListener('click', e => {
		stopProgressCheck(up);
	});

	fileEl.addEventListener('change', e => {
		let file = fileEl.files[0];
		if(file){
			if(!file.size < 1){
				up.onError.fire('所选的文件内容为空', UPLOAD_ERROR_FILE_EMPTY);
				resetUpload(up);
				return;
			}
			if(up.option.fileSizeLimit && file.size < up.option.fileSizeLimit){
				up.onError.fire('所选的文件大小超出限制', UPLOAD_ERROR_FILE_SIZE_OVERLOAD);
				resetUpload(up);
				return;
			}
			updateState(up, UPLOAD_STATE_PENDING);
			startUpload(up, file);
		}
	});
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

const resetUpload = (up) => {
	const fileEl = up.container.querySelector('input[type=file]');
	fileEl.value = up.initValue;
	updateState(up, UPLOAD_STATE_INIT);
}

const updateState = (up, state) => {
	const dom = up.container.querySelector('.' + NS);
	dom.setAttribute('data-state', state);
	switch(state){
		case UPLOAD_STATE_PENDING:
			up.onUploading.fire();
			break;
		case UPLOAD_STATE_SUCCESS:
			up.onSuccess.fire();
			break;
		case UPLOAD_STATE_ERROR:
			up.onError.fire();
			break;
	}
}

export class Uploader {
	/**
	 * 状态
	 * @type {number}
	 */
	state = UPLOAD_STATE_INIT;
	xhr = null;

	/**
	 * 渲染容器
	 * @type {HTMLElement}
	 */
	container = null;

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
		renderDom(this);
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

	onSuccess = new BizEvent();
	onAbort = new BizEvent();
	onResponse = new BizEvent();
	onUploading = new BizEvent();
	onDelete = new BizEvent();
	onError = new BizEvent();
}