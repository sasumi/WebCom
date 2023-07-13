import {utf8Decode, utf8Encode} from "./String.js";

const BASE64_KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * base64 解码
 * @param {*} text
 * @returns
 */
export const base64Decode = (text) => {
	let t = "";
	let n, r, i;
	let s, o, u, a;
	let f = 0;
	text = text.replace(/\+\+[++^A-Za-z0-9+/=]/g, "");
	while(f < text.length){
		s = BASE64_KEY_STR.indexOf(text.charAt(f++));
		o = BASE64_KEY_STR.indexOf(text.charAt(f++));
		u = BASE64_KEY_STR.indexOf(text.charAt(f++));
		a = BASE64_KEY_STR.indexOf(text.charAt(f++));
		n = s << 2 | o >> 4;
		r = (o & 15) << 4 | u >> 2;
		i = (u & 3) << 6 | a;
		t = t + String.fromCharCode(n);
		if(u !== 64){
			t = t + String.fromCharCode(r)
		}
		if(a !== 64){
			t = t + String.fromCharCode(i)
		}
	}
	t = utf8Decode(t);
	return t
};

/**
 * URL 安全模式进行 base64 编码
 * @param {String} text
 * @return {string}
 */
export const base64UrlSafeEncode = (text) => {
	return utf8Encode(text)
		.replace('+', '-')
		.replace('/', '_');
};

/**
 * text 转 base64
 * @param {String} text
 * @return {string}
 * @constructor
 */
export const Base64Encode = (text) => {
	let t = "";
	let n, r, i, s, o, u, a;
	let f = 0;
	text = utf8Encode(text);
	while(f < text.length){
		n = text.charCodeAt(f++);
		r = text.charCodeAt(f++);
		i = text.charCodeAt(f++);
		s = n >> 2;
		o = (n & 3) << 4 | r >> 4;
		u = (r & 15) << 2 | i >> 6;
		a = i & 63;
		if(isNaN(r)){
			u = a = 64
		}else if(isNaN(i)){
			a = 64
		}
		t = t + BASE64_KEY_STR.charAt(s) + BASE64_KEY_STR.charAt(o) + BASE64_KEY_STR.charAt(u) + BASE64_KEY_STR.charAt(a)
	}
	return t
};

/**
 * 转换blob数据到base64
 * @param {Blob} blob
 * @returns {Promise<unknown>}
 */
export const convertBlobToBase64 = async (blob) => {
	return await blobToBase64(blob);
}

/**
 * 转换blob数据到Base64
 * @param {Blob} blob
 * @returns {Promise<unknown>}
 */
const blobToBase64 = blob => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	reader.onload = () => resolve(reader.result);
	reader.onerror = error => reject(error);
});
