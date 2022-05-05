import {convertBlobToBase64} from "./String.js";

let cache = {
	//src: {state:STATE_*, data: null, error:'', callbacks: []}
};

const STATE_PENDING = 1;
const STATE_SUCCESS = 2;
const STATE_ERROR = 3;

const processCallback = (src) => {
	let ch = cache[src];
	if(ch.state === STATE_PENDING){
		return;
	}
	if(ch.state === STATE_SUCCESS){
		let img = new Image();
		img.src = ch.data;
		ch.success_callbacks.forEach(resolve => {
			resolve(img);
		});
		ch.success_callbacks = [];
	}
	else if(ch.state === STATE_ERROR){
		ch.error_callbacks.forEach(reject=>{
			reject(ch.error);
		});
		ch.error_callbacks = [];
	}
};

/**
 * 加载一次图片
 * @param {String} src
 * @returns {Promise<unknown>}
 */
const loadSingleton = (src) => {
	return new Promise((resolve, reject) => {
		if(!cache[src]){
			cache[src] = {
				state: null,
				data: null,
				error: '',
				success_callbacks: [],
				error_callbacks: []
			};
		}
		cache[src].success_callbacks.push(resolve);
		cache[src].error_callbacks.push(reject);

		if(!cache[src].data){
			let xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.responseType = 'blob';
			xhr.onload = function(){
				if(this.status === 200){
					let blob = this.response;
					let d = convertBlobToBase64(blob);
					d.then(base64 => {
						cache[src].state = STATE_SUCCESS;
						cache[src].data = base64;
						processCallback(src);
					}).catch(error => {
						cache[src].error = error;
						cache[src].state = STATE_ERROR;
						processCallback(src);
					});
				}
			};
			xhr.onerror = function() {
				cache[src].error = 'Error:'+this.statusText;
				cache[src].state = STATE_ERROR;
				processCallback(src);
			};
			xhr.onabort = function(){
				cache[src].error = 'Request abort';
				cache[src].state = STATE_ERROR;
				processCallback(src);
			}
			xhr.send();
		}
		processCallback(src);
	});
};

let _base_cache = {};
const getBase64FromImage = (img) => {
	let src = img.src;
	if(src.indexOf('data:') === 0){
		return img.src;
	}
	if(_base_cache[src]){
		return _base_cache[src];
	}
	let canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	let ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height);
	_base_cache[src] = canvas.toDataURL("image/png")
	return _base_cache[src];
};

export const Img = {
	getBase64FromImage,
	loadSingleton
};