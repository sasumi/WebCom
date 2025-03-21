var WebCom = (function (exports) {
	'use strict';

	const arrayColumn = (arr, col_name) => {
		let data = [];
		for(let i in arr){
			data.push(arr[i][col_name]);
		}
		return data;
	};
	const arrayIndex = (arr, val) => {
		for(let i in arr){
			if(arr[i] === val){
				return i;
			}
		}
		return null;
	};
	const isEquals = (obj1, obj2) => {
		let keys1 = Object.keys(obj1);
		let keys2 = Object.keys(obj2);
		return keys1.length === keys2.length && Object.keys(obj1).every(key => obj1[key] === obj2[key]);
	};
	const arrayDistinct = (arr) => {
		let tmpMap = new Map();
		return arr.filter(item => {
			if(!tmpMap.has(item)){
				tmpMap.set(item, true);
				return true;
			}
		});
	};
	const arrayGroup = (arr, by_key, limit) => {
		if(!arr || !arr.length){
			return arr;
		}
		let tmp_rst = {};
		arr.forEach(item => {
			let k = item[by_key];
			if(!tmp_rst[k]){
				tmp_rst[k] = [];
			}
			tmp_rst[k].push(item);
		});
		if(!limit){
			return tmp_rst;
		}
		let rst = [];
		for(let i in tmp_rst){
			rst[i] = tmp_rst[i][0];
		}
		return rst;
	};
	const sortByKey = (obj) => {
		return Object.keys(obj).sort().reduce(function(result, key){
			result[key] = obj[key];
			return result;
		}, {});
	};
	const chunk = (list, size) => {
		let len = list.length;
		if(size < 1 || !len){
			return [];
		}
		if(size > len){
			return [list];
		}
		let res = [];
		let integer = Math.floor(len / size);
		let rest = len % size;
		for(let i = 1; i <= integer; i++){
			res.push(list.splice(0, size));
		}
		if(rest){
			res.push(list.splice(0, rest));
		}
		return res;
	};
	const objectPushByPath = (path, value, srcObj = {}, glue = '.') => {
		let segments = path.split(glue),
			cursor = srcObj,
			segment,
			i;
		for(i = 0; i < segments.length - 1; ++i){
			segment = segments[i];
			cursor = cursor[segment] = cursor[segment] || {};
		}
		return cursor[segments[i]] = value;
	};
	const objectKeyMapping = (obj, mapping)=>{
		let ret = {};
		for(let key in obj){
			if(mapping[key] !== undefined){
				ret[mapping[key]] = obj[key];
			} else {
				ret[key] = obj[key];
			}
		}
		return ret;
	};
	const objectGetByPath = (obj, path, glue = '.') => {
		let ps = path.split(glue);
		for(let i = 0, len = ps.length; i < len; i++){
			if(obj[ps[i]] === undefined){
				return null;
			}
			obj = obj[ps[i]];
		}
		return obj;
	};
	const arrayFilterTree = (parent_id, all_list, option = {}, level = 0, group_by_parents = []) => {
		option = Object.assign({
			return_as_tree: false,
			level_key: 'tree_level',
			id_key: 'id',
			parent_id_key: 'parent_id',
			children_key: 'children'
		}, option);
		let pn_k = option.parent_id_key;
		let lv_k = option.level_key;
		let id_k = option.id_key;
		let as_tree = option.return_as_tree;
		let c_k = option.children_key;
		let result = [];
		group_by_parents = group_by_parents.length ?  group_by_parents : arrayGroup(all_list, pn_k);
		all_list.forEach(item=>{
			if(item[pn_k] === parent_id){
				item[lv_k] = level;
				if(!option.return_as_tree){
					result.push(item);
				}
				if(item[id_k] !== undefined && group_by_parents[item[id_k]] !== undefined && group_by_parents[item[id_k]]){
					let subTrees = arrayFilterTree(item[id_k], all_list, option, level + 1, group_by_parents);
					if(subTrees){
						if(as_tree){
							item[c_k] = subTrees;
						}else {
							result = result.concat(...subTrees);
						}
					}
				}
				if(as_tree){
					result.push(item);
				}
			}
		});
		return result;
	};

	const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2 - 1;
	const between = (val, min, max, includeEqual = true) => {
		return includeEqual ? (val >= min && val <= max) : (val > min && val < max);
	};
	const randomInt = (min, max) => {
		return Math.floor(Math.random() * (max + 1 - min)) + min;
	};
	const round = (num, precision = 2) => {
		let multiple = Math.pow(10, precision);
		return Math.round(num * multiple) / multiple;
	};

	const extract = (es_template, params) => {
		const names = Object.keys(params);
		const values = Object.values(params);
		return new Function(...names, `return \`${es_template}\`;`)(...values);
	};
	const toHtmlEntities = (str)=>{
		return str.replace(/./gm, function(s) {
			return (s.match(/[a-z0-9\s]+/i)) ? s : '&#' + s.charCodeAt(0) + ';';
		});
	};
	const explodeBy = (separator, str) => {
		let items = str.replace(/\r|\n/mg, '').split(separator);
		items = items.map(item => {
			return item.trim();
		});
		items = items.filter(item => {
			return item.length;
		});
		return items;
	};
	const fromHtmlEntities = (str)=>{
		return (str + '').replace(/&#\d+;/gm, function(s) {
			return String.fromCharCode(s.match(/\d+/gm)[0]);
		})
	};
	const stripSlashes = (str) => {
		return (str + '')
			.replace(/\\(.?)/g, function(s, n1){
				switch(n1){
					case '\\':
						return '\\'
					case '0':
						return '\u0000'
					case '':
						return ''
					default:
						return n1
				}
			})
	};
	const formatSize = (num, precision = 2) => {
		if(isNaN(num)){
			return num;
		}
		let str = '', i, mod = 1024;
		if(num < 0){
			str = '-';
			num = Math.abs(num);
		}
		let units = 'B KB MB GB TB PB'.split(' ');
		for(i = 0; num > mod; i++){
			num /= mod;
		}
		return str + round(num, precision) + units[i];
	};
	const cutString = (str, len, eclipse_text) => {
		if(eclipse_text === undefined){
			eclipse_text = '...';
		}
		let r = /[^\x00-\xff]/g;
		if(str.replace(r, "mm").length <= len){
			return str;
		}
		let m = Math.floor(len / 2);
		for(let i = m; i < str.length; i++){
			if(str.substr(0, i).replace(r, "mm").length >= len){
				return str.substr(0, i) + eclipse_text;
			}
		}
		return str;
	};
	const regQuote = (str) => {
		return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
	};
	const utf8Decode = (srcStr) => {
		let t = "";
		let n = 0;
		let r = 0,
			c2 = 0,
			c3 = 0;
		while(n < srcStr.length){
			r = srcStr.charCodeAt(n);
			if(r < 128){
				t += String.fromCharCode(r);
				n++;
			}else if(r > 191 && r < 224){
				c2 = srcStr.charCodeAt(n + 1);
				t += String.fromCharCode((r & 31) << 6 | c2 & 63);
				n += 2;
			}else {
				c2 = srcStr.charCodeAt(n + 1);
				c3 = srcStr.charCodeAt(n + 2);
				t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
				n += 3;
			}
		}
		return t
	};
	const isValidUrl = urlString => {
		try{
			return Boolean(new URL(urlString));
		}catch(e){
			return false;
		}
	};
	const isJSON = (json) => {
		let is_json = false;
		try{
			JSON.parse(json);
			is_json = true;
		}catch(error){
		}
		return is_json;
	};
	const utf8Encode = (srcStr) => {
		srcStr = srcStr.replace(/\r\n/g, "n");
		let t = "";
		for(let n = 0; n < srcStr.length; n++){
			let r = srcStr.charCodeAt(n);
			if(r < 128){
				t += String.fromCharCode(r);
			}else if(r > 127 && r < 2048){
				t += String.fromCharCode(r >> 6 | 192);
				t += String.fromCharCode(r & 63 | 128);
			}else {
				t += String.fromCharCode(r >> 12 | 224);
				t += String.fromCharCode(r >> 6 & 63 | 128);
				t += String.fromCharCode(r & 63 | 128);
			}
		}
		return t;
	};
	const getUTF8StrLen = (str) => {
		let realLength = 0;
		let len = str.length;
		let charCode = -1;
		for(let i = 0; i < len; i++){
			charCode = str.charCodeAt(i);
			if(charCode >= 0 && charCode <= 128){
				realLength += 1;
			}else {
				realLength += 3;
			}
		}
		return realLength;
	};
	const DEFAULT_RANDOM_STRING = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';
	const randomString = (length = 6, sourceStr = DEFAULT_RANDOM_STRING) => {
		let codes = '';
		for(let i = 0; i < length; i++){
			let rnd = Math.round(Math.random() * (sourceStr.length - 1));
			codes += sourceStr.substring(rnd, rnd + 1);
		}
		return codes;
	};
	const randomWords = (count = 1, letterMax = 8) => {
		let words = [];
		const possible = 'bcdfghjklmnpqrstvwxyz';
		const possibleVowels = 'aeiou';
		while(count-- > 0){
			let word = '';
			for(let i = 0; i < letterMax; i = i + 3){
				word += possible[Math.floor(Math.random() * possible.length)];
				word += possibleVowels[Math.floor(Math.random() * possibleVowels.length)];
				word += possible[Math.floor(Math.random() * possible.length)];
			}
			words.push(word);
		}
		return words;
	};
	const randomSentence = (maxLength = 0, multipleLine = false) => {
		let wordCount = Math.ceil(maxLength / 4);
		let words = randomWords(wordCount);
		if(multipleLine){
			let sep = '';
			let text = '';
			words.forEach(word => {
				text = text + sep + word;
				sep = randomInt(0, 1) > 0 ? ' ' : "\n";
			});
			return text.trim();
		}else {
			return words.join(' ').substring(0, maxLength).trim();
		}
	};
	const strToPascalCase = (str, capitalize_first = false) => {
		let words = [];
		str.replace(/[-_\s+]/g, ' ').split(' ').forEach((word, idx) => {
			words.push((idx === 0 && !capitalize_first) ? word : capitalize(word));
		});
		return words.join('');
	};
	const capitalize = (str) => {
		if(typeof str !== 'string'){
			return ''
		}
		return str.charAt(0).toUpperCase() + str.slice(1);
	};
	const isNum = (val) => {
		return !isNaN(val);
	};
	const TRIM_BOTH = 0;
	const TRIM_LEFT = 1;
	const TRIM_RIGHT = 2;
	const trim = (str, chars = '', dir = TRIM_BOTH) => {
		if(chars.length){
			let regLeft = new RegExp('^[' + regQuote(chars) + ']+'),
				regRight = new RegExp('[' + regQuote(chars) + ']+$');
			return dir === TRIM_LEFT ? str.replace(regLeft, '') : (dir === TRIM_RIGHT ? str.replace(regRight, '') : str.replace(regLeft, '').replace(regRight, ''));
		}else {
			return dir === TRIM_BOTH ? str.trim() : (dir === TRIM_LEFT ? str.trimStart() : dir === str.trimEnd());
		}
	};
	const cleanupVersion = (version) => {
		let trimmed = version ? version.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1") : '',
			pieces = trimmed.split('.'),
			partsLength,
			parts = [],
			value,
			piece,
			num,
			i;
		for(i = 0; i < pieces.length; i += 1){
			piece = pieces[i].replace(/\D/g, '');
			num = parseInt(piece, 10);
			if(isNaN(num)){
				num = 0;
			}
			parts.push(num);
		}
		partsLength = parts.length;
		for(i = partsLength - 1; i >= 0; i -= 1){
			value = parts[i];
			if(value === 0){
				parts.length -= 1;
			}else {
				break;
			}
		}
		return parts;
	};
	const versionCompare = (version1, version2, index) => {
		let stringLength = index + 1,
			v1 = cleanupVersion(version1),
			v2 = cleanupVersion(version2);
		if(v1.length > stringLength){
			v1.length = stringLength;
		}
		if(v2.length > stringLength){
			v2.length = stringLength;
		}
		let size = Math.min(v1.length, v2.length), i;
		for(i = 0; i < size; i += 1){
			if(v1[i] !== v2[i]){
				return v1[i] < v2[i] ? -1 : 1;
			}
		}
		if(v1.length === v2.length){
			return 0;
		}
		return (v1.length < v2.length) ? -1 : 1;
	};

	const BASE64_KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	const base64Decode = (text) => {
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
				t = t + String.fromCharCode(r);
			}
			if(a !== 64){
				t = t + String.fromCharCode(i);
			}
		}
		t = utf8Decode(t);
		return t
	};
	const base64UrlSafeEncode = (text) => {
		return utf8Encode(text)
			.replace('+', '-')
			.replace('/', '_');
	};
	const Base64Encode = (text) => {
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
				u = a = 64;
			}else if(isNaN(i)){
				a = 64;
			}
			t = t + BASE64_KEY_STR.charAt(s) + BASE64_KEY_STR.charAt(o) + BASE64_KEY_STR.charAt(u) + BASE64_KEY_STR.charAt(a);
		}
		return t
	};
	const convertBlobToBase64 = async (blob) => {
		return await blobToBase64(blob);
	};
	const blobToBase64 = blob => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});

	const setCookie = (name, value, days, path = '/') => {
		let expires = "";
		if(days){
			let date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path=" + path;
	};
	const getCookie = (name) => {
		let nameEQ = name + "=";
		let ca = document.cookie.split(';');
		for(let i = 0; i < ca.length; i++){
			let c = ca[i];
			while(c.charAt(0) === ' ') c = c.substring(1, c.length);
			if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	};
	const deleteCookie = (name) => {
		document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	};

	const BLOCK_TAGS = ['ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'NOSCRIPT', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TFOOT', 'UL', 'VIDEO'];
	const PAIR_TAGS = [
		'A', 'ABBR', 'ACRONYM', 'B', 'BDO', 'BIG', 'BUTTON', 'CITE', 'CODE', 'DFN', 'EM', 'I', 'KBD', 'LABEL', 'MAP', 'OBJECT', 'OUTPUT', 'Q', 'S', 'SAMP', 'SCRIPT', 'SELECT', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TEXTAREA', 'TIME', 'TT', 'U', 'VAR',
	].concat(...BLOCK_TAGS);
	const SELF_CLOSING_TAGS = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];
	const REMOVABLE_TAGS = [
		'STYLE', 'COMMENT', 'SELECT', 'OPTION', 'SCRIPT', 'TITLE', 'HEAD', 'BUTTON', 'META', 'LINK', 'PARAM', 'SOURCE'
	];
	const html2Text = (html)=>{
		REMOVABLE_TAGS.forEach(tag=>{
			html = html.replace(new RegExp(tag, 'ig'), '');
		});
		html = html.replace(/[\r|\n]/g, '');
		html = html.replace(/<(\w+)([^>]*)>/g, function(ms, tag, tail){
			if(BLOCK_TAGS.includes(tag.toUpperCase())){
				return "\n";
			}
			return "";
		});
		html = html.replace(/<\/(\w+)([^>]*)>/g, function(ms, tag, tail){
			return "";
		});
		html = html.replace(/<[^>]+>/g, '');
		let entityNamesMap = [
			[/&nbsp;/ig, ' '],
			[/&lt;/ig, '<'],
			[/&gt;/ig, '>'],
			[/&quot;/ig, '"'],
			[/&apos;/ig, '\''],
		];
		entityNamesMap.forEach(([matchReg, replacement])=>{
			html = html.replace(matchReg, replacement);
		});
		html = html.replace(/&#(\d+);/, function(ms, dec){
			return String.fromCharCode(dec);
		});
		html = html.replace(/&amp;/ig, '&');
		html = html.trim();
		return html;
	};
	const dimension2Style = h => {
		if(isNum(h)){
			return h + 'px';
		}
		return h+'';
	};
	const cssSelectorEscape = (str)=>{
		return (window.CSS && CSS.escape) ? CSS.escape(str) : str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
	};
	const entityToString = (entity) => {
		let entities = entity.split(';');
		entities.pop();
		return entities.map(item => String.fromCharCode(
			item[2] === 'x' ? parseInt(item.slice(3), 16) : parseInt(item.slice(2)))).join('')
	};
	let _helper_div;
	const decodeHTMLEntities = (str) => {
		if(!_helper_div){
			_helper_div = document.createElement('div');
		}
		str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		_helper_div.innerHTML = str;
		str = _helper_div.textContent;
		_helper_div.textContent = '';
		return str;
	};
	const buildHtmlHidden = (maps) => {
		let html = '';
		for(let key in maps){
			let val = maps[key] === null ? '' : maps[key];
			html += `<input type="hidden" name="${escapeAttr(key)}" value="${escapeAttr(val)}"/>`;
		}
		return html;
	};
	const escapeHtml = (str, tabSize = 2, allowLineBreaker = true) => {
		let s = String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
		if(allowLineBreaker){
			s = s.replace(/[\r\n]/g, '<br/>');
		}
		if(tabSize){
			s = s.replace(/\t/g, '&nbsp;'.repeat(tabSize));
		}
		s = s.replace(/\s/g, "&nbsp;");
		return s;
	};
	const unescapeHtml = (html)=>{
		return String(html)
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/<br.*>/, "\n");
	};
	const escapeAttr = (s, preserveCR = '') => {
		preserveCR = preserveCR ? '&#13;' : '\n';
		return ('' + s)
			.replace(/&/g, '&amp;')
			.replace(/'/g, '&apos;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\r\n/g, preserveCR)
			.replace(/[\r\n]/g, preserveCR);
	};
	const stringToEntity = (str, radix) => {
		let arr = str.split('');
		radix = radix || 0;
		return arr.map(item =>
			`&#${(radix ? 'x' + item.charCodeAt(0).toString(16) : item.charCodeAt(0))};`).join('')
	};
	const highlightText = (text, kw, replaceTpl = '<span class="matched">%s</span>') => {
		if(!kw){
			return text;
		}
		return text.replace(new RegExp(regQuote(kw), 'ig'), match => {
			return replaceTpl.replace('%s', match);
		});
	};

	let _guid = 0;
	const guid = (prefix = '') => {
		return 'guid_' + (prefix || randomString(6)) + (++_guid);
	};
	const getCurrentScript = function(){
		let error = new Error()
			, source
			, currentStackFrameRegex = new RegExp(getCurrentScript.name + "\\s*\\((.*):\\d+:\\d+\\)")
			, lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/);
		if((source = currentStackFrameRegex.exec(error.stack.trim()))){
			return source[1];
		}else if((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] !== ""){
			return source[1];
		}else if(error['fileName'] !== undefined){
			return error['fileName'];
		}
		return null;
	};
	const inMobile = () => {
		const useragent = window.navigator.userAgent;
		const regex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
		const regex2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
		return regex.test(useragent) || regex2.test(useragent.substr(0, 4));
	};
	const throttle = (fn, intervalMiSec) => {
		let context, args;
		let previous = 0;
		return function(){
			let now = +new Date();
			context = this;
			args = arguments;
			if(now - previous > intervalMiSec){
				fn.apply(context, args);
				previous = now;
			}
		}();
	};
	const throttleEffect = (fn, intervalMiSec) => {
		let context, args;
		let lastExecuteTime = 0;
		let queuing = false;
		return function(){
			if(queuing){
				return;
			}
			let now = +new Date();
			context = this;
			args = arguments;
			let remaining = intervalMiSec - (now - lastExecuteTime);
			if(remaining <= 0){
				fn.apply(context, args);
				lastExecuteTime = now;
			}else {
				queuing = true;
				setTimeout(() => {
					fn.apply(context, args);
					queuing = false;
					lastExecuteTime = now;
				}, remaining);
			}
		};
	};
	const debounce = (fn, intervalMiSec) => {
		let timeout;
		return function(){
			let context = this;
			let args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function(){
				fn.apply(context, args);
			}, intervalMiSec);
		}
	};
	const CURRENT_FILE = '/Lang/Util.js';
	const ENTRY_FILE = '/index.js';
	const getLibEntryScript = () => {
		let script = getCurrentScript();
		if(!script){
			throw "Get script failed";
		}
		if(script.indexOf(CURRENT_FILE) >= 0){
			return script.replace(CURRENT_FILE, ENTRY_FILE);
		}
		return script;
	};
	const getLibModule = async () => {
		let script = getLibEntryScript();
		return await import(script);
	};
	const getLibModuleTop = (() => {
		if(top === window){
			return getLibModule;
		}
		if(top.WEBCOM_GET_LIB_MODULE){
			return top.WEBCOM_GET_LIB_MODULE;
		}
		throw "No WebCom library script loaded detected.";
	})();
	const doOnce = (markKey, dataFetcher = null, storageType = 'storage') => {
		const MARKUP_STR_VAL = 'TRUE';
		let getMarkState = (key) => {
			switch(storageType.toLowerCase()){
				case 'cookie':
					return getCookie(key) === MARKUP_STR_VAL;
				case 'storage':
					return window.localStorage.getItem(key) === MARKUP_STR_VAL;
				case 'session':
					return window.sessionStorage.getItem(key) === MARKUP_STR_VAL;
				default:
					throw "no support:" + storageType;
			}
		};
		let markUp = (key) => {
			switch(storageType.toLowerCase()){
				case 'cookie':
					return setCookie(key, MARKUP_STR_VAL);
				case 'storage':
					return window.localStorage.setItem(key, MARKUP_STR_VAL);
				case 'session':
					return window.sessionStorage.setItem(key, MARKUP_STR_VAL);
				default:
					throw "no support:" + storageType;
			}
		};
		return new Promise((onHit, noHit) => {
			if(!getMarkState(markKey)){
				if(typeof (dataFetcher) === 'function'){
					dataFetcher().then(() => {
						markUp(markKey);
						onHit();
					}, () => {
						markUp(markKey);
						noHit();
					});
				}else {
					markUp(markKey);
					onHit();
				}
			}else {
				noHit();
			}
		});
	};
	const isObject = (item) => {
		return (item && typeof item === 'object' && !Array.isArray(item));
	};
	const isFunction = (value) => {
		return value ? (Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function) : false;
	};
	const mergeDeep = (target, ...sources) => {
		if(!sources.length) return target;
		const source = sources.shift();
		if(isObject(target) && isObject(source)){
			for(const key in source){
				if(isObject(source[key])){
					if(!target[key]){
						Object.assign(target, {[key]: {}});
					}else {
						target[key] = Object.assign({}, target[key]);
					}
					mergeDeep(target[key], source[key]);
				}else {
					Object.assign(target, {[key]: source[key]});
				}
			}
		}
		return mergeDeep(target, ...sources);
	};
	const CONSOLE_COLOR = {
		RESET: "\x1b[0m",
		BRIGHT: "\x1b[1m",
		DIM: "\x1b[2m",
		UNDERSCORE: "\x1b[4m",
		BLINK: "\x1b[5m",
		REVERSE: "\x1b[7m",
		HIDDEN: "\x1b[8m",
		FG: {
			BLACK: "\x1b[30m",
			RED: "\x1b[31m",
			GREEN: "\x1b[32m",
			YELLOW: "\x1b[33m",
			BLUE: "\x1b[34m",
			MAGENTA: "\x1b[35m",
			CYAN: "\x1b[36m",
			WHITE: "\x1b[37m",
			GRAY: "\x1b[90m",
		},
		BG: {
			BLACK: "\x1b[40m",
			RED: "\x1b[41m",
			GREEN: "\x1b[42m",
			YELLOW: "\x1b[43m",
			BLUE: "\x1b[44m",
			MAGENTA: "\x1b[45m",
			CYAN: "\x1b[46m",
			WHITE: "\x1b[47m",
			GRAY: "\x1b[100m",
		}
	};
	const CONSOLE_METHODS = ['debug', 'info', 'log', 'warn', 'error'];
	let org_console_methods = {};
	const bindConsole = (method, payload) => {
		if(method === '*'){
			method = CONSOLE_METHODS;
		}
		if(Array.isArray(method)){
			method.forEach(method => {
				bindConsole(method, payload);
			});
			return;
		}
		if(!org_console_methods[method]){
			org_console_methods[method] = console[method];
		}
		console[method] = function(...args){
			let ret = payload.apply(console, [method, Array.from(args)]);
			if(!Array.isArray(ret)){
				return;
			}
			org_console_methods[method].apply(console, ret);
		};
	};
	const isPromise = (obj) => {
		return obj && typeof (obj) === 'object' && obj.then && typeof (obj.then) === 'function';
	};
	const PROMISE_STATE_PENDING = 'pending';
	const PROMISE_STATE_FULFILLED = 'fulfilled';
	const PROMISE_STATE_REJECTED = 'rejected';
	const getPromiseState = (promise) => {
		const t = {};
		return Promise.race([promise, t])
			.then(v => (v === t) ? PROMISE_STATE_PENDING : PROMISE_STATE_FULFILLED)
			.catch(() => PROMISE_STATE_REJECTED);
	};
	window.WEBCOM_GET_LIB_MODULE = getLibModule;
	window.WEBCOM_GET_SCRIPT_ENTRY = getLibEntryScript;

	const getViewWidth = () => {
		return window.innerWidth;
	};
	const getViewHeight = () => {
		return window.innerHeight;
	};
	const hide = (dom) => {
		findOne(dom).style.display = 'none';
	};
	const remove = (dom) => {
		if(dom && dom.parentNode){
			dom.parentNode.removeChild(dom);
			return true;
		}
		return false;
	};
	const show = (dom) => {
		findOne(dom).style.display = '';
	};
	const toggle = (dom, toShow) => {
		toShow ? show(dom) : hide(dom);
	};
	const _el_disabled_class_ = '__element-lock__';
	const disabled = (el, disabledClass = '')=>{
		return toggleDisabled(el, disabledClass, false);
	};
	const enabled = (el, disabledClass = '')=>{
		return toggleDisabled(el, disabledClass, true);
	};
	const toggleDisabled = (el, disabledClass = '', forceEnabled = null) => {
		let toDisabled = forceEnabled === null ? !el.classList.has(_el_disabled_class_) : !forceEnabled;
		if(toDisabled){
			insertStyleSheet(`.${_el_disabled_class_} {pointer-event:none !important;}`, '__element_lock_style__');
		}
		el = findOne(el);
		el.classList.toggle(_el_disabled_class_, !toDisabled);
		el[toDisabled ? 'setAttribute' : 'removeAttribute']('disabled', 'disabled');
		el[toDisabled ? 'setAttribute' : 'removeAttribute']('data-disabled', 'disabled');
		if(disabledClass){
			el.classList.toggle(disabledClass, !toDisabled);
		}
	};
	const lockElementInteraction = (el, payload) => {
		disabled(el);
		let reset = () => {
			enabled(el);
		};
		payload(reset);
	};
	const nodeIndex = (node) => {
		return Array.prototype.indexOf.call(node.parentNode.children, node);
	};
	const findOne = (selector, parent = document) => {
		return typeof (selector) === 'string' ? parent.querySelector(selector) : selector;
	};
	const waitForSelector = (selector, option = {}) => {
		return new Promise((resolve, reject) => {
			waitForSelectors(selector, option).then(ns => {
				resolve(ns[0]);
			}, reject);
		})
	};
	const waitForSelectors = (selector, option = {}) => {
		let {timeout, parent, checkInterval} = option;
		checkInterval = checkInterval || 10;
		timeout = timeout || 10000;
		parent = parent || document;
		const st = Date.now();
		return new Promise((resolve, reject) => {
			let chk = () => {
				if(timeout && (Date.now() - st > timeout)){
					reject(`waitForSelectors timeout, ${selector} ${timeout}ms`);
					return;
				}
				let ns = parent.querySelectorAll(selector);
				if(ns.length){
					resolve(ns);
					return;
				}
				setTimeout(chk, checkInterval);
			};
			chk();
		})
	};
	const findAll = (selector, parent = document) => {
		if(typeof selector === 'string'){
			selector = selector.trim();
			if(selector.indexOf(':scope') !== 0){
				selector = ':scope ' + selector;
			}
			return Array.from(parent.querySelectorAll(selector));
		}else if(Array.isArray(selector)){
			let ns = [];
			selector.forEach(sel => {
				ns.push(...findAll(sel));
			});
			return ns;
		}else {
			return [selector];
		}
	};
	const findAllOrFail = (selector, parent = document) => {
		let ls = findAll(selector, parent);
		if(!ls.length){
			throw "no nodes found:" + selector;
		}
		return ls;
	};
	const getDomOffset = (target) => {
		let rect = target.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height,
			top: rect.top,
			bottom: rect.bottom,
			left: rect.left,
			right: rect.right,
			x: rect.x,
			y: rect.y,
		}
	};
	const isButton = (el) => {
		return el.tagName === 'BUTTON' ||
			(el.tagName === 'INPUT' && ['button', 'reset', 'submit'].includes(el.getAttribute('type')));
	};
	const bindTextAutoResize = (textarea, init = true) => {
		textarea.style.height = 'auto';
		textarea.addEventListener('input', () => {
			textarea.style.height = textarea.scrollHeight + 'px';
		});
		if(init){
			textarea.style.height = textarea.scrollHeight + 'px';
		}
	};
	let __divs = {};
	const NODE_HEIGHT_TMP_ATTR_KEY = 'data-NODE-HEIGHT-TMP-ATTR-KEY';
	const getNodeHeightWithMargin = (node) => {
		let tmp_div_id = node.getAttribute(NODE_HEIGHT_TMP_ATTR_KEY);
		if(tmp_div_id && __divs[tmp_div_id] && __divs[tmp_div_id].parentNode){
			return __divs[tmp_div_id].offsetTop;
		}
		tmp_div_id = guid('tmp_div_id');
		node.setAttribute(NODE_HEIGHT_TMP_ATTR_KEY, tmp_div_id);
		let tmp_div = document.createElement('div');
		tmp_div.style.cssText = 'height:0; width:100%; clear:both;';
		node.appendChild(tmp_div);
		__divs[tmp_div_id] = tmp_div;
		return tmp_div.offsetTop;
	};
	const resizeIframe = (iframe) => {
		let bdy = iframe.contentWindow.document.body;
		if(!bdy){
			return;
		}
		let h = getNodeHeightWithMargin(bdy);
		iframe.style.height = dimension2Style(h);
	};
	const bindIframeAutoResize = (iframe) => {
		let obs;
		try{
			iframe.addEventListener('load', () => {
				resizeIframe(iframe);
				mutationEffective(iframe.contentWindow.document.body, {
					attributes: true,
					subtree: true,
					childList: true
				}, () => {
					resizeIframe(iframe);
				});
			});
		}catch(err){
			try{
				obs && obs.disconnect();
			}catch(err){
				console.error('observer disconnect fail', err);
			}
			console.warn('iframe content upd', err);
		}
	};
	const bindTextSupportTab = (textarea, tabChar = "\t") => {
		textarea.addEventListener('keydown', function(e){
			if(e.key !== 'Tab'){
				return;
			}
			e.preventDefault();
			document.execCommand('insertText', false, tabChar);
		});
	};
	const matchParent = (dom, selector) => {
		return dom.closest(selector);
	};
	const domContained = (nodes, child, includeEqual = false) => {
		let contains = findAll(nodes);
		for(let i = 0; i < contains.length; i++){
			if((includeEqual ? contains[i] === child : false) ||
				contains[i].compareDocumentPosition(child) & 16){
				return true;
			}
		}
		return false;
	};
	const getFocusableElements = (dom = document) => {
		let els = findAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)', dom);
		return els.filter(el => {
			return !isNodeHidden(el);
		});
	};
	const isNodeHidden = (node) => {
		return node.offsetParent === null;
	};
	const getNodeXPath = (el) => {
		let allNodes = document.getElementsByTagName('*');
		let seg_list = [];
		for(seg_list = []; el && el.nodeType === 1; el = el.parentNode){
			if(el.hasAttribute('id')){
				let uniqueIdCount = 0;
				for(let n = 0; n < allNodes.length; n++){
					if(allNodes[n].hasAttribute('id') && allNodes[n].id === el.id) uniqueIdCount++;
					if(uniqueIdCount > 1) break;
				}
				if(uniqueIdCount === 1){
					seg_list.unshift('id("' + el.getAttribute('id') + '")');
					return seg_list.join('/');
				}else {
					seg_list.unshift(el.localName.toLowerCase() + '[@id="' + el.getAttribute('id') + '"]');
				}
			}else if(el.hasAttribute('class')){
				seg_list.unshift(el.localName.toLowerCase() + '[@class="' + el.getAttribute('class') + '"]');
			}else {
				let i, sib;
				for(i = 1, sib = el.previousSibling; sib; sib = sib.previousSibling){
					if(sib.localName === el.localName){
						i++;
					}
				}
				seg_list.unshift(el.localName.toLowerCase() + '[' + i + ']');
			}
		}
		return seg_list.length ? '/' + seg_list.join('/') : null;
	};
	const onDomTreeChange = (dom, callback, includeElementChanged = true) => {
		const PRO_KEY = 'ON_DOM_TREE_CHANGE_BIND_' + guid();
		let watchEl = () => {
			findAll(`input:not([${PRO_KEY}]), textarea:not([${PRO_KEY}]), select:not([${PRO_KEY}])`, dom).forEach(el => {
				el.setAttribute(PRO_KEY, '1');
				el.addEventListener('change', callback);
			});
		};
		mutationEffective(dom, {attributes: true, subtree: true, childList: true}, () => {
			includeElementChanged && watchEl();
			callback();
		}, 10);
		includeElementChanged && watchEl();
	};
	const mutationEffective = (dom, option, payload, minInterval = 10) => {
		let last_queue_time = 0;
		let callback_queueing = false;
		let obs = new MutationObserver(() => {
			if(callback_queueing){
				return;
			}
			let r = minInterval - (new Date().getTime() - last_queue_time);
			if(r > 0){
				callback_queueing = true;
				setTimeout(() => {
					callback_queueing = false;
					last_queue_time = new Date().getTime();
					payload(obs);
				}, r);
			}else {
				last_queue_time = new Date().getTime();
				payload(obs);
			}
		});
		obs.observe(dom, option);
	};
	const domChangedWatch = (container, matchedSelector, notification, executionFirst = true) => {
		onDomTreeChange(container, () => {
			notification(findAll(matchedSelector, container));
		});
		if(executionFirst){
			notification(findAll(matchedSelector, container));
		}
	};
	const keepRectCenter = (width, height, containerDimension = {
		left: 0,
		top: 0,
		width: window.innerWidth,
		height: window.innerHeight
	}) => {
		return [
			Math.max((containerDimension.width - width) / 2 + containerDimension.left, 0),
			Math.max((containerDimension.height - height) / 2 + containerDimension.top, 0)
		];
	};
	const keepDomInContainer = (target, container = document.body) => {
		keepRectInContainer({
			left: target.left,
			top: target.top,
			width: target.clientWidth,
			height: target.clientHeight,
		});
	};
	const keepRectInContainer = (objDim, ctnDim = {
		left: 0,
		top: 0,
		width: window.innerWidth,
		height: window.innerHeight
	}) => {
		let ret = {left: objDim.left, top: objDim.top};
		if(objDim.width > ctnDim.width || objDim.height > ctnDim.height){
			return ret;
		}
		if((objDim.width + objDim.left) > (ctnDim.width + ctnDim.left)){
			ret.left = objDim.left - ((objDim.width + objDim.left) - (ctnDim.width + ctnDim.left));
		}
		if((objDim.height + objDim.top) > (ctnDim.height + ctnDim.top)){
			ret.top = objDim.top - ((objDim.height + objDim.top) - (ctnDim.height + ctnDim.top));
		}
		if(objDim.left < ctnDim.left){
			ret.left = ctnDim.left;
		}
		if(objDim.top < ctnDim.top){
			ret.top = ctnDim.top;
		}
		return ret;
	};
	const getDomDimension = (dom) => {
		let org_visibility = dom.style.visibility;
		let org_display = dom.style.display;
		let width, height;
		dom.style.visibility = 'hidden';
		dom.style.display = 'block';
		width = dom.clientWidth;
		height = dom.clientHeight;
		dom.style.visibility = org_visibility;
		dom.style.display = org_display;
		return {width, height};
	};
	const rectAssoc = (rect1, rect2) => {
		if(rect1.left <= rect2.left){
			return (rect1.left + rect1.width) >= rect2.left && (
				between(rect2.top, rect1.top, rect1.top + rect1.height) ||
				between(rect2.top + rect2.height, rect1.top, rect1.top + rect1.height) ||
				rect2.top >= rect1.top && rect2.height >= rect1.height
			);
		}else {
			return (rect2.left + rect2.width) >= rect1.left && (
				between(rect1.top, rect2.top, rect2.top + rect2.height) ||
				between(rect1.top + rect1.height, rect2.top, rect2.top + rect2.height) ||
				rect1.top >= rect2.top && rect1.height >= rect2.height
			);
		}
	};
	const isElement = (obj) => {
		try{
			return obj instanceof HTMLElement;
		}catch(e){
			return (typeof obj === "object") &&
				(obj.nodeType === 1) && (typeof obj.style === "object") &&
				(typeof obj.ownerDocument === "object");
		}
	};
	let _c = {};
	const loadCss = (file, forceReload = false) => {
		if(!forceReload && _c[file]){
			return _c[file];
		}
		_c[file] = new Promise((resolve, reject) => {
			let link = document.createElement('link');
			link.rel = "stylesheet";
			link.href = file;
			link.onload = () => {
				resolve();
			};
			link.onerror = () => {
				reject();
			};
			document.head.append(link);
		});
		return _c[file];
	};
	const loadScript = (src, forceReload = false) => {
		if(!forceReload && _c[src]){
			return _c[src];
		}
		_c[src] = new Promise((resolve, reject) => {
			let script = document.createElement('script');
			script.src = src;
			script.onload = () => {
				resolve();
			};
			script.onerror = () => {
				reject();
			};
			document.head.append(script);
		});
		return _c[src];
	};
	const insertStyleSheet = (styleSheetStr, id = '', doc = document) => {
		if(id && doc.querySelector(`#${id}`)){
			return doc.querySelector(`#${id}`);
		}
		let style = doc.createElement('style');
		doc.head.appendChild(style);
		style.innerHTML = styleSheetStr;
		if(id){
			style.id = id;
		}
		return style;
	};
	const getRegion = (win = window) => {
		let info = {};
		let doc = win.document;
		info.screenLeft = win.screenLeft ? win.screenLeft : win.screenX;
		info.screenTop = win.screenTop ? win.screenTop : win.screenY;
		if(win.innerWidth){
			info.visibleWidth = win.innerWidth;
			info.visibleHeight = win.innerHeight;
			info.horizenScroll = win.pageXOffset;
			info.verticalScroll = win.pageYOffset;
		}else {
			let tmp = (doc.documentElement && doc.documentElement.clientWidth) ?
				doc.documentElement : doc.body;
			info.visibleWidth = tmp.clientWidth;
			info.visibleHeight = tmp.clientHeight;
			info.horizenScroll = tmp.scrollLeft;
			info.verticalScroll = tmp.scrollTop;
		}
		let tag = (doc.documentElement && doc.documentElement.scrollWidth) ?
			doc.documentElement : doc.body;
		info.documentWidth = Math.max(tag.scrollWidth, info.visibleWidth);
		info.documentHeight = Math.max(tag.scrollHeight, info.visibleHeight);
		return info;
	};
	const rectInLayout = (rect, layout) => {
		return between(rect.top, layout.top, layout.top + layout.height) && between(rect.left, layout.left, layout.left + layout.width)
			&& between(rect.top + rect.height, layout.top, layout.top + layout.height) && between(rect.left + rect.width, layout.left, layout.left + layout.width);
	};
	const setStyle = (dom, style = {}) => {
		for(let key in style){
			key = strToPascalCase(key);
			dom.style[key] = dimension2Style(style[key]);
		}
	};
	const nodeHighlight = (node, pattern, hlClass) => {
		let skip = 0;
		if(node.nodeType === 3){
			pattern = new RegExp(pattern, 'i');
			let pos = node.data.search(pattern);
			if(pos >= 0 && node.data.length > 0){
				let match = node.data.match(pattern);
				let spanNode = document.createElement('span');
				spanNode.className = hlClass;
				let middleBit = node.splitText(pos);
				middleBit.splitText(match[0].length);
				let middleClone = middleBit.cloneNode(true);
				spanNode.appendChild(middleClone);
				middleBit.parentNode.replaceChild(spanNode, middleBit);
				skip = 1;
			}
		}else if(node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)){
			for(let i = 0; i < node.childNodes.length; ++i){
				i += nodeHighlight(node.childNodes[i], pattern, hlClass);
			}
		}
		return skip;
	};
	const createDomByHtml = (html, parentNode = null) => {
		let tpl = document.createElement('template');
		html = html.trim();
		tpl.innerHTML = html;
		let nodes = [];
		if(parentNode){
			tpl.content.childNodes.forEach(node => {
				nodes.push(parentNode.appendChild(node));
			});
		}else {
			nodes = tpl.content.childNodes;
		}
		return nodes.length === 1 ? nodes[0] : nodes;
	};
	function repaint(element, delay = 0){
		setTimeout(() => {
			try{
				element.hidden = true;
				element.offsetHeight;
				element.hidden = false;
			}catch(_){
			}
		}, delay);
	}
	const enterFullScreen = (element) => {
		if(element.requestFullscreen){
			return element.requestFullscreen();
		}
		if(element.webkitRequestFullScreen){
			return element.webkitRequestFullScreen();
		}
		if(element.mozRequestFullScreen){
			element.mozRequestFullScreen();
		}
		if(element.msRequestFullScreen){
			element.msRequestFullScreen();
		}
		throw "Browser no allow full screen";
	};
	const exitFullScreen = () => {
		return document.exitFullscreen();
	};
	const toggleFullScreen = (element) => {
		return new Promise((resolve, reject) => {
			if(!isInFullScreen()){
				enterFullScreen(element).then(resolve).catch(reject);
			}else {
				exitFullScreen().then(resolve).catch(reject);
			}
		})
	};
	const toggleStickyClass = (node, className) => {
		const observer = new IntersectionObserver(([e]) => {
			e.target.classList.toggle(className, e.intersectionRatio < 1);
		}, {
			rootMargin: '-1px 0px 0px 0px',
			threshold: [1],
		});
		observer.observe(node);
	};
	const isInFullScreen = () => {
		return !!document.fullscreenElement;
	};
	let CURRENT_WINDOW;
	const setContextWindow = (win) => {
		CURRENT_WINDOW = win;
	};
	const getContextDocument = () => {
		let win = getContextWindow();
		return win.document;
	};
	const getContextWindow = () => {
		if(CURRENT_WINDOW){
			return CURRENT_WINDOW;
		}
		let win;
		try{
			win = window;
			while(win !== win.parent){
				win = win.parent;
			}
		}catch(err){
			console.warn('context window assign fail:', err);
		}
		return win || window;
	};

	const NS$7 = 'WebCom-';
	const VAR_PREFIX = '--' + NS$7;
	const ICON_FONT = NS$7 + 'iconfont';
	const CSS_VAR_COLOR = VAR_PREFIX + 'color';
	const CSS_VAR_COLOR_LIGHTEN = VAR_PREFIX + 'color-lighten';
	const CSS_VAR_DISABLE_COLOR = VAR_PREFIX + 'disable-color';
	const CSS_VAR_BACKGROUND_COLOR = VAR_PREFIX + 'background-color';
	const CSS_VAR_PANEL_SHADOW = VAR_PREFIX + 'panel-shadow';
	const CSS_VAR_PANEL_BORDER = VAR_PREFIX + 'panel-border';
	const CSS_VAR_PANEL_BORDER_COLOR = VAR_PREFIX + 'panel-border-color';
	const CSS_VAR_PANEL_RADIUS = VAR_PREFIX + 'panel-radius';
	const CSS_VAR_FULL_SCREEN_BACKDROP_FILTER = VAR_PREFIX + 'full-screen-backdrop-filter';
	const CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR = VAR_PREFIX + 'full-screen-background-color';
	insertStyleSheet(`
@font-face {
  font-family: '${ICON_FONT}';  /* Project id 3359671 */
  src: url('//at.alicdn.com/t/c/font_3359671_sytvh320ksc.woff2?t=1725530872922') format('woff2'),
       url('//at.alicdn.com/t/c/font_3359671_sytvh320ksc.woff?t=1725530872922') format('woff'),
       url('//at.alicdn.com/t/c/font_3359671_sytvh320ksc.ttf?t=1725530872922') format('truetype');
}

:root {
	${CSS_VAR_COLOR}:#333;
	${CSS_VAR_COLOR_LIGHTEN}:#666;
	${CSS_VAR_DISABLE_COLOR}:#aaa;
	${CSS_VAR_BACKGROUND_COLOR}:#fff;
	
	${CSS_VAR_PANEL_SHADOW}:1px 1px 5px #7c7c7c5c;
	${CSS_VAR_PANEL_BORDER_COLOR}:#ccc;
	${CSS_VAR_PANEL_BORDER}:1px solid var(${CSS_VAR_PANEL_BORDER_COLOR});
	${CSS_VAR_PANEL_RADIUS}:4px;
	
	${CSS_VAR_FULL_SCREEN_BACKDROP_FILTER}:blur(4px);
	${CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR}:#33333342;
}`, NS$7+'theme');
	const Theme = {
		Namespace: NS$7,
		CssVarPrefix: VAR_PREFIX,
		CssVar: {
			'COLOR': CSS_VAR_COLOR,
			'CSS_LIGHTEN': CSS_VAR_COLOR_LIGHTEN,
			'DISABLE_COLOR': CSS_VAR_DISABLE_COLOR,
			'BACKGROUND_COLOR': CSS_VAR_BACKGROUND_COLOR,
			'PANEL_SHADOW': CSS_VAR_PANEL_SHADOW,
			'PANEL_BORDER': CSS_VAR_PANEL_BORDER,
			'PANEL_BORDER_COLOR': CSS_VAR_PANEL_BORDER_COLOR,
			'PANEL_RADIUS': CSS_VAR_PANEL_RADIUS,
			'FULL_SCREEN_BACKDROP_FILTER': CSS_VAR_FULL_SCREEN_BACKDROP_FILTER,
			'FULL_SCREEN_BACKGROUND_COLOR': CSS_VAR_FULL_SCREEN_BACKGROUND_COLOR,
		},
		IconFont: ICON_FONT,
		TipIndex: 10,
		MaskIndex: 100,
		DialogIndex: 1000,
		FullScreenModeIndex: 10000,
		ContextIndex: 100000,
		ToastIndex: 1000000,
	};

	const MIME_BINARY_DEFAULT = 'application/octet-stream';
	const MIME_EXTENSION_MAP = {
		"323": "text/h323",
		"accdb": "application/msaccess",
		"accde": "application/msaccess",
		"accdt": "application/msaccess",
		"acx": "application/internet-property-stream",
		"ai": "application/postscript",
		"aif": "audio/x-aiff",
		"aifc": "audio/aiff",
		"aiff": "audio/aiff",
		"application": "application/x-ms-application",
		"art": "image/x-jg",
		"asf": "video/x-ms-asf",
		"asm": "text/plain",
		"asr": "video/x-ms-asf",
		"asx": "video/x-ms-asf",
		"atom": "application/atom+xml",
		"au": "audio/basic",
		"avi": "video/x-msvideo",
		"axs": "application/olescript",
		"bas": "text/plain",
		"bcpio": "application/x-bcpio",
		"bmp": "image/bmp",
		"c": "text/plain",
		"calx": "application/vnd.ms-office.calx",
		"cat": "application/vnd.ms-pki.seccat",
		"cdf": "application/x-cdf",
		"class": "application/x-java-applet",
		"clp": "application/x-msclip",
		"cmx": "image/x-cmx",
		"cnf": "text/plain",
		"cod": "image/cis-cod",
		"cpio": "application/x-cpio",
		"cpp": "text/plain",
		"crd": "application/x-mscardfile",
		"crl": "application/pkix-crl",
		"crt": "application/x-x509-ca-cert",
		"csh": "application/x-csh",
		"css": "text/css",
		"dcr": "application/x-director",
		"der": "application/x-x509-ca-cert",
		"dib": "image/bmp",
		"dir": "application/x-director",
		"disco": "text/xml",
		"dll": "application/x-msdownload",
		"dll.config": "text/xml",
		"dlm": "text/dlm",
		"doc": "application/msword",
		"docm": "application/vnd.ms-word.document.macroEnabled.12",
		"docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"dot": "application/msword",
		"dotm": "application/vnd.ms-word.template.macroEnabled.12",
		"dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
		"dtd": "text/xml",
		"dvi": "application/x-dvi",
		"dwf": "drawing/x-dwf",
		"dxr": "application/x-director",
		"eml": "message/rfc822",
		"eps": "application/postscript",
		"etx": "text/x-setext",
		"evy": "application/envoy",
		"exe.config": "text/xml",
		"fdf": "application/vnd.fdf",
		"fif": "application/fractals",
		"flr": "x-world/x-vrml",
		"flv": "video/x-flv",
		"gif": "image/gif",
		"gtar": "application/x-gtar",
		"gz": "application/x-gzip",
		"h": "text/plain",
		"hdf": "application/x-hdf",
		"hdml": "text/x-hdml",
		"hhc": "application/x-oleobject",
		"hlp": "application/winhlp",
		"hqx": "application/mac-binhex40",
		"hta": "application/hta",
		"htc": "text/x-component",
		"htm": "text/html",
		"html": "text/html",
		"htt": "text/webviewhtml",
		"hxt": "text/html",
		"ico": "image/x-icon",
		"ief": "image/ief",
		"iii": "application/x-iphone",
		"ins": "application/x-internet-signup",
		"isp": "application/x-internet-signup",
		"IVF": "video/x-ivf",
		"jar": "application/java-archive",
		"jck": "application/liquidmotion",
		"jcz": "application/liquidmotion",
		"jfif": "image/pjpeg",
		"jpe": "image/jpeg",
		"jpeg": "image/jpeg",
		"jpg": "image/jpeg",
		"js": "application/x-javascript",
		"jsx": "text/jscript",
		"latex": "application/x-latex",
		"lit": "application/x-ms-reader",
		"lsf": "video/x-la-asf",
		"lsx": "video/x-la-asf",
		"m13": "application/x-msmediaview",
		"m14": "application/x-msmediaview",
		"m1v": "video/mpeg",
		"m3u": "audio/x-mpegurl",
		"man": "application/x-troff-man",
		"manifest": "application/x-ms-manifest",
		"map": "text/plain",
		"mdb": "application/x-msaccess",
		"me": "application/x-troff-me",
		"mht": "message/rfc822",
		"mhtml": "message/rfc822",
		"mid": "audio/mid",
		"midi": "audio/mid",
		"mmf": "application/x-smaf",
		"mno": "text/xml",
		"mny": "application/x-msmoney",
		"mov": "video/quicktime",
		"movie": "video/x-sgi-movie",
		"mp2": "video/mpeg",
		"mp3": "audio/mpeg",
		"mpa": "video/mpeg",
		"mpe": "video/mpeg",
		"mpeg": "video/mpeg",
		"mpg": "video/mpeg",
		"mpp": "application/vnd.ms-project",
		"mpv2": "video/mpeg",
		"ms": "application/x-troff-ms",
		"mvb": "application/x-msmediaview",
		"mvc": "application/x-miva-compiled",
		"nc": "application/x-netcdf",
		"nsc": "video/x-ms-asf",
		"nws": "message/rfc822",
		"oda": "application/oda",
		"odc": "text/x-ms-odc",
		"ods": "application/oleobject",
		"one": "application/onenote",
		"onea": "application/onenote",
		"onetoc": "application/onenote",
		"onetoc2": "application/onenote",
		"onetmp": "application/onenote",
		"onepkg": "application/onenote",
		"osdx": "application/opensearchdescription+xml",
		"p10": "application/pkcs10",
		"p12": "application/x-pkcs12",
		"p7b": "application/x-pkcs7-certificates",
		"p7c": "application/pkcs7-mime",
		"p7m": "application/pkcs7-mime",
		"p7r": "application/x-pkcs7-certreqresp",
		"p7s": "application/pkcs7-signature",
		"pbm": "image/x-portable-bitmap",
		"pdf": "application/pdf",
		"pfx": "application/x-pkcs12",
		"pgm": "image/x-portable-graymap",
		"pko": "application/vnd.ms-pki.pko",
		"pma": "application/x-perfmon",
		"pmc": "application/x-perfmon",
		"pml": "application/x-perfmon",
		"pmr": "application/x-perfmon",
		"pmw": "application/x-perfmon",
		"png": "image/png",
		"pnm": "image/x-portable-anymap",
		"pnz": "image/png",
		"pot": "application/vnd.ms-powerpoint",
		"potm": "application/vnd.ms-powerpoint.template.macroEnabled.12",
		"potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
		"ppam": "application/vnd.ms-powerpoint.addin.macroEnabled.12",
		"ppm": "image/x-portable-pixmap",
		"pps": "application/vnd.ms-powerpoint",
		"ppsm": "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
		"ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
		"ppt": "application/vnd.ms-powerpoint",
		"pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
		"pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"prf": "application/pics-rules",
		"ps": "application/postscript",
		"pub": "application/x-mspublisher",
		"qt": "video/quicktime",
		"qtl": "application/x-quicktimeplayer",
		"ra": "audio/x-pn-realaudio",
		"ram": "audio/x-pn-realaudio",
		"ras": "image/x-cmu-raster",
		"rf": "image/vnd.rn-realflash",
		"rgb": "image/x-rgb",
		"rm": "application/vnd.rn-realmedia",
		"rmi": "audio/mid",
		"roff": "application/x-troff",
		"rpm": "audio/x-pn-realaudio-plugin",
		"rtf": "application/rtf",
		"rtx": "text/richtext",
		"scd": "application/x-msschedule",
		"sct": "text/scriptlet",
		"setpay": "application/set-payment-initiation",
		"setreg": "application/set-registration-initiation",
		"sgml": "text/sgml",
		"sh": "application/x-sh",
		"shar": "application/x-shar",
		"sit": "application/x-stuffit",
		"sldm": "application/vnd.ms-powerpoint.slide.macroEnabled.12",
		"sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
		"smd": "audio/x-smd",
		"smx": "audio/x-smd",
		"smz": "audio/x-smd",
		"snd": "audio/basic",
		"spc": "application/x-pkcs7-certificates",
		"spl": "application/futuresplash",
		"src": "application/x-wais-source",
		"ssm": "application/streamingmedia",
		"sst": "application/vnd.ms-pki.certstore",
		"stl": "application/vnd.ms-pki.stl",
		"sv4cpio": "application/x-sv4cpio",
		"sv4crc": "application/x-sv4crc",
		"svg": "image/svg+xml",
		"swf": "application/x-shockwave-flash",
		"t": "application/x-troff",
		"tar": "application/x-tar",
		"tcl": "application/x-tcl",
		"tex": "application/x-tex",
		"texi": "application/x-texinfo",
		"texinfo": "application/x-texinfo",
		"tgz": "application/x-compressed",
		"thmx": "application/vnd.ms-officetheme",
		"tif": "image/tiff",
		"tiff": "image/tiff",
		"tr": "application/x-troff",
		"trm": "application/x-msterminal",
		"tsv": "text/tab-separated-values",
		"txt": "text/plain",
		"uls": "text/iuls",
		"ustar": "application/x-ustar",
		"vbs": "text/vbscript",
		"vcf": "text/x-vcard",
		"vcs": "text/plain",
		"vdx": "application/vnd.ms-visio.viewer",
		"vml": "text/xml",
		"vsd": "application/vnd.visio",
		"vss": "application/vnd.visio",
		"vst": "application/vnd.visio",
		"vsto": "application/x-ms-vsto",
		"vsw": "application/vnd.visio",
		"vsx": "application/vnd.visio",
		"vtx": "application/vnd.visio",
		"wav": "audio/wav",
		"wax": "audio/x-ms-wax",
		"wbmp": "image/vnd.wap.wbmp",
		"wcm": "application/vnd.ms-works",
		"wdb": "application/vnd.ms-works",
		"wks": "application/vnd.ms-works",
		"wm": "video/x-ms-wm",
		"wma": "audio/x-ms-wma",
		"wmd": "application/x-ms-wmd",
		"wmf": "application/x-msmetafile",
		"wml": "text/vnd.wap.wml",
		"wmlc": "application/vnd.wap.wmlc",
		"wmls": "text/vnd.wap.wmlscript",
		"wmlsc": "application/vnd.wap.wmlscriptc",
		"wmp": "video/x-ms-wmp",
		"wmv": "video/x-ms-wmv",
		"wmx": "video/x-ms-wmx",
		"wmz": "application/x-ms-wmz",
		"wps": "application/vnd.ms-works",
		"wri": "application/x-mswrite",
		"wrl": "x-world/x-vrml",
		"wrz": "x-world/x-vrml",
		"wsdl": "text/xml",
		"wvx": "video/x-ms-wvx",
		"x": "application/directx",
		"xaf": "x-world/x-vrml",
		"xaml": "application/xaml+xml",
		"xap": "application/x-silverlight-app",
		"xbap": "application/x-ms-xbap",
		"xbm": "image/x-xbitmap",
		"xdr": "text/plain",
		"xht": "application/xhtml+xml",
		"xhtml": "application/xhtml+xml",
		"xla": "application/vnd.ms-excel",
		"xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
		"xlc": "application/vnd.ms-excel",
		"xlm": "application/vnd.ms-excel",
		"xls": "application/vnd.ms-excel",
		"xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
		"xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
		"xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"xlt": "application/vnd.ms-excel",
		"xltm": "application/vnd.ms-excel.template.macroEnabled.12",
		"xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
		"xlw": "application/vnd.ms-excel",
		"xml": "text/xml",
		"xof": "x-world/x-vrml",
		"xpm": "image/x-xpixmap",
		"xps": "application/vnd.ms-xpsdocument",
		"xsd": "text/xml",
		"xsf": "text/xml",
		"xsl": "text/xml",
		"xslt": "text/xml",
		"xwd": "image/x-xwindowdump",
		"z": "application/x-compress",
		"zip": "application/x-zip-compressed"
	};

	const resolveFileExtension = fileName => {
		if(fileName.indexOf('.') < 0){
			return '';
		}
		let segList = fileName.split('.');
		return segList[segList.length - 1];
	};
	const getMimeByExtension = (ext, defaultMIME = MIME_BINARY_DEFAULT) => {
		return MIME_EXTENSION_MAP[ext] || defaultMIME;
	};
	const resolveFileName = (fileName) => {
		fileName = fileName.replace(/.*?[/|\\]/ig, '');
		return fileName.replace(/\.[^.]*$/g, "");
	};
	const fileAcceptMath = (fileMime, acceptStr)=>{
		return !!(acceptStr.replace(/\s/g, '').split(',').filter(ac=>{
			return new RegExp(ac.replace('*', '.*')).test(fileMime);
		}).length);
	};
	const readFileInLine = (file, linePayload, onFinish = null, onError = null) => {
		const CHUNK_SIZE = 1024;
		const reader = new FileReader();
		let offset = 0;
		let line_buff = '';
		const seek = () => {
			if(offset < file.size){
				let slice = file.slice(offset, offset + CHUNK_SIZE);
				reader.readAsArrayBuffer(slice);
				offset += CHUNK_SIZE;
			}else {
				onFinish();
			}
		};
		reader.onload = evt => {
			line_buff += new TextDecoder().decode(new Uint8Array(reader.result));
			if(line_buff.indexOf("\n") >= 0){
				let break_down = false;
				let lines = line_buff.split("\n");
				line_buff = lines.pop();
				lines.find(line => {
					if(linePayload(line) === false){
						break_down = true;
						return true;
					}
				});
				if(break_down){
					return;
				}
			}
			seek();
		};
		reader.onerror = (err) => {
			console.error(err);
			onError(err);
		};
		seek();
	};
	const imgToFile = (img, fileAttr = {}) => {
		const name = fileAttr.name || img.alt || 'image';
		return new Promise(resolve => {
			fetch(img.src).then(res => res.blob()).then(blob => {
				resolve(blobToFile(blob, {name, lastModified: fileAttr.lastModified}));
			});
		})
	};
	const fileToImg = (file) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);
			img.onload = () => {
				if(file.name){
					img.alt = file.name;
				}
				resolve(img);
				URL.revokeObjectURL(file);
			};
		});
	};
	const imageFileFormatConvert = (file, toFormat, newName = null) => {
		return new Promise((resolve, reject) => {
			let img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				canvas.getContext('2d').drawImage(img, 0, 0);
				let blobBin = atob(canvas.toDataURL().split(',')[1]);
				let arr = [];
				for(let i = 0; i < blobBin.length; i++){
					arr.push(blobBin.charCodeAt(i));
				}
				newName = newName || `file.${toFormat}`;
				let pngFile = blobToFile(new Blob([new Uint8Array(arr)], {type: `image/${toFormat}`}), {name: newName});
				resolve(pngFile);
			};
			img.onerror = ()=>{
				reject('image convert error');
			};
			img.src = URL.createObjectURL(file);
		});
	};
	const blobToFile = (blob, fileAttr = {}) => {
		fileAttr = Object.assign({
			name: 'file',
			lastModified: Date.now()
		}, fileAttr);
		return new File([blob], fileAttr.name, {
			lastModified: fileAttr.lastModified,
			type: fileAttr.type || blob.type
		});
	};

	const HTTP_METHOD = {
		GET: 'GET',
		POST: 'POST',
		PUT: 'PUT',
		DELETE: 'DELETE',
		OPTIONS: 'OPTIONS',
		HEAD: 'HEAD',
		CONNECT: 'CONNECT',
		TRACE: 'TRACE',
		resolve: method => {
			if(!method){
				return HTTP_METHOD.GET;
			}
			let upMethod = method.toUpperCase();
			if(!HTTP_METHOD[upMethod]){
				throw `method no found: ${method}`;
			}
			return HTTP_METHOD[upMethod];
		}
	};
	const REQUEST_FORMAT = {
		JSON: 'JSON',
		FORM: 'FORM',
	};
	const RESPONSE_FORMAT = {
		JSON: 'JSON',
		XML: 'XML',
		HTML: 'HTML',
		TEXT: 'TEXT',
	};
	const mergerUriParam = (uri, data) => {
		if(data === null ||
			data === undefined ||
			(Array.isArray(data) && data.length === 0) ||
			(typeof (data) === 'string' && data.length === 0)
		){
			return uri;
		}
		return uri + (uri.indexOf('?') >= 0 ? '&' : '?') + QueryString.stringify(data);
	};
	const setHash = data => {
		location.href = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(data);
	};
	const getHash = () => {
		return location.hash ? location.hash.substring(1) : '';
	};
	const CODE_ABORT = 509;
	const DEFAULT_TIMEOUT = 0;
	const REQUEST_CONTENT_TYPE_MAP = {
		[REQUEST_FORMAT.JSON]: 'application/json',
		[REQUEST_FORMAT.FORM]: 'application/x-www-form-urlencoded',
	};
	const REQUEST_DATA_HANDLE_MAP = {
		[REQUEST_FORMAT.JSON]: (data, method) => {
			if(method === HTTP_METHOD.GET){
				return '';
			}
			if(data instanceof FormData){
				let obj = {};
				data.forEach((v, k) => {
					obj[k] = v;
				});
				return JSON.stringify(obj);
			}
			return JSON.stringify(data);
		},
		[REQUEST_FORMAT.FORM]: (data, method) => {
			if(method === HTTP_METHOD.GET){
				return '';
			}
			return data instanceof FormData ? data : QueryString.stringify(data);
		}
	};
	const RESPONSE_ACCEPT_TYPE_MAP = {
		[RESPONSE_FORMAT.JSON]: 'application/json',
		[RESPONSE_FORMAT.XML]: 'text/xml',
		[RESPONSE_FORMAT.HTML]: 'text/html',
		[RESPONSE_FORMAT.TEXT]: 'text/plain',
	};
	const dataToFormData = (data) => {
		let fd = new FormData;
		if(!data){
			return fd;
		}
		if(typeof (data) === 'string'){
			let dataMap = QueryString.parse(data);
			for(let k in dataMap){
				fd.append(k, dataMap[k]);
			}
			return fd;
		}else if(data.toString().indexOf('FormData') >= 0){
			data.forEach((val, name) => {
				fd.append(name, val);
			});
			return fd;
		}else if(typeof (data) === 'object'){
			for(let k in data){
				fd.append(k, data[k]);
			}
			return fd;
		}
		let err = "Convert data to FormData fail";
		console.error(err, data);
		throw err;
	};
	const requestJSON = (url, data, method = HTTP_METHOD.GET, option = {}) => {
		return HTTP_METHOD.resolve(method) === HTTP_METHOD.GET ?
			Net.getJSON(url, data, option) :
			Net.postJSON(url, data, option);
	};
	class Net {
		cgi = null;
		data = null;
		fileMap = null;
		option = {
			method: HTTP_METHOD.GET,
			timeout: DEFAULT_TIMEOUT,
			requestFormat: REQUEST_FORMAT.FORM,
			responseFormat: RESPONSE_FORMAT.TEXT,
			headers: {},
		};
		xhr = null;
		onError = new BizEvent();
		onResponse = new BizEvent();
		onStateChange = new BizEvent();
		onProgress = new BizEvent();
		constructor(cgi, data, option = {}, fileMap = null){
			this.cgi = cgi;
			this.data = data;
			this.fileMap = fileMap;
			this.option = {
				...this.option,
				...option
			};
			this.option.method = HTTP_METHOD.resolve(this.option.method);
			if(this.fileMap){
				this.option.method = HTTP_METHOD.POST;
				this.option.requestFormat = null;
			}
			if(this.option.method === HTTP_METHOD.GET && this.data){
				this.cgi = mergerUriParam(this.cgi, this.data);
			}
			this.xhr = new XMLHttpRequest();
			this.xhr.withCredentials = true;
			this.xhr.open(this.option.method, this.cgi, true);
			this.xhr.addEventListener("progress", e => {
				e.lengthComputable && this.onProgress.fire(e.loaded, e.total);
			});
			if(this.xhr.upload){
				this.xhr.upload.onprogress = e => {
					e.lengthComputable && this.onProgress.fire(e.loaded, e.total);
				};
			}
			this.xhr.onreadystatechange = () => {
				this.onStateChange.fire(this.xhr.status);
			};
			this.xhr.addEventListener("load", e => {
				if(this.xhr.readyState === 4){
					if(this.xhr.status === 200){
						this.onProgress.fire(e.loaded || e.total, e.total);
						let ret;
						switch(option.responseFormat){
							case RESPONSE_FORMAT.JSON:
								try{
									ret = JSON.parse(this.xhr.responseText);
								}catch(err){
									this.onError.fire('JSON解析失败：' + err, this.xhr.status);
								}
								break;
							case RESPONSE_FORMAT.XML:
							case RESPONSE_FORMAT.TEXT:
							case RESPONSE_FORMAT.HTML:
							default:
								ret = this.xhr.responseText;
								break;
						}
						this.onResponse.fire(ret);
					}else {
						this.onError.fire(this.xhr.responseText || this.xhr.statusText);
					}
				}
			});
			this.xhr.addEventListener("error", () => {
				this.onError.fire(this.xhr.statusText, this.xhr.status);
			});
			this.xhr.addEventListener("abort", () => {
				this.abort();
			});
			if(this.option.requestFormat){
				this.xhr.setRequestHeader('content-type', REQUEST_CONTENT_TYPE_MAP[this.option.requestFormat]);
			}
			if(this.option.responseFormat){
				this.xhr.setRequestHeader('Accept', RESPONSE_ACCEPT_TYPE_MAP[this.option.responseFormat]);
			}
			for(let key in this.option.headers){
				this.xhr.setRequestHeader(key, this.option.headers[key]);
			}
			if(this.option.timeout){
				setTimeout(() => {
					this.abort('timeout');
				}, this.option.timeout);
			}
		}
		send(){
			if(this.fileMap){
				let data = new FormData();
				for(let name in this.fileMap){
					data.append(name, this.fileMap[name]);
				}
				if(this.data){
					let d = dataToFormData(this.data);
					d.forEach((val, name) => {
						data.append(name, val);
					});
				}
				this.xhr.send(data);
			}else {
				let data = this.data ? REQUEST_DATA_HANDLE_MAP[this.option.requestFormat](this.data, this.option.method) : null;
				this.xhr.send(data);
			}
		}
		abort(reason = ''){
			this.xhr.abort();
			this.onError.fire(`Request abort(${reason})`, CODE_ABORT);
		}
		static get(cgi, data, option = {}){
			option.method = HTTP_METHOD.GET;
			return Net.request(cgi, data, option);
		}
		static getJSON(cgi, data, option = {}){
			option.requestFormat = REQUEST_FORMAT.JSON;
			option.responseFormat = RESPONSE_FORMAT.JSON;
			return Net.get(cgi, data, option);
		}
		static getJSONP(url, data, callback_name = 'callback', timeout = 3000){
			return new Promise((resolve, reject) => {
				let tm = window.setTimeout(function(){
					window[callback_name] = function(){
					};
					reject(`timeout in ${timeout}ms`);
				}, timeout);
				window[callback_name] = function(data){
					window.clearTimeout(tm);
					resolve(data);
				};
				let script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.src = mergerUriParam(url, data);
				document.getElementsByTagName('head')[0].appendChild(script);
			});
		}
		static post(cgi, data, option = {}){
			option.method = HTTP_METHOD.POST;
			return Net.request(cgi, data, option);
		}
		static postJSON(cgi, data, option = {}){
			option.requestFormat = REQUEST_FORMAT.JSON;
			option.responseFormat = RESPONSE_FORMAT.JSON;
			return Net.post(cgi, data, option);
		}
		static uploadFile = (url, fileMap, data = null, option = {}) => {
			let n = new Net(url, data, option, fileMap);
			setTimeout(() => {
				n.send();
			}, 0);
			return n;
		}
		static request(cgi, data, option = {}, fileMap = null){
			return new Promise((resolve, reject) => {
				let req = new Net(cgi, data, option, fileMap);
				req.onResponse.listen(ret => {
					resolve(ret);
				});
				req.onError.listen(error => {
					reject(error);
				});
				req.send();
			});
		}
	}
	const downloadString = (string, fileName, fileMime = '') => {
		fileMime = fileMime || getMimeByExtension(resolveFileExtension(fileName) || 'txt', MIME_BINARY_DEFAULT);
		let blob = new Blob([string], {type: fileMime});
		let a = document.createElement('a');
		a.download = fileName;
		a.href = URL.createObjectURL(blob);
		a.dataset.downloadurl = [fileMime, a.download, a.href].join(':');
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(function(){
			URL.revokeObjectURL(a.href);
		}, 1500);
	};
	const downloadFile = (url, saveName = '') => {
		if(!saveName){
			saveName = resolveFileName(url) + '.' + resolveFileExtension(url);
		}
		let link = document.createElement('a');
		link.rel = 'noopener noreferrer';
		link.target = '_blank';
		link.href = url;
		link.download = saveName;
		document.body.appendChild(link);
		link.click();
		remove(link);
	};
	const downloadFiles = (urls, itemCallback = null) => {
		let loop = () => {
			let item = urls.pop();
			let name = '';
			let url = '';
			if(isObject(item)){
				url = item.url;
				name = item.name;
			} else {
				url = item;
			}
			downloadFile(url, name);
			itemCallback && itemCallback(item);
			if(urls.length){
				setTimeout(loop, 50);
			}
		};
		loop();
	};
	const QueryString = {
		parse(str){
			if(str[0] === '?'){
				str = str.substring(1);
			}
			let retObj = {};
			let qs = str.split('&');
			qs.forEach(q => {
				let [k, v] = q.split('=');
				if(!k.length){
					return;
				}
				retObj[decodeURIComponent(k)] = decodeURIComponent(v);
			});
			return retObj;
		},
		replace(queryString, key, newValue){
			if(!new RegExp('[?&]' + regQuote(key) + '=').test(queryString)){
				return queryString + (queryString.indexOf('?') >= 0 ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(newValue);
			}
			return queryString.replace(new RegExp('([?&])(' + encodeURIComponent(key) + '=)[^\\&]+'), '$1$2' + encodeURIComponent(newValue));
		},
		stringify(data){
			if(typeof (data) === 'undefined' || typeof (data) !== 'object'){
				return data
			}
			let query = [];
			for(let param in data){
				if(data.hasOwnProperty(param)){
					if(data[param] === null){
						continue;
					}
					if(typeof (data[param]) === 'object' && data[param].length){
						data[param].forEach(item => {
							query.push(encodeURI(param + '=' + item));
						});
					}else if(typeof (data[param]) === 'object');else {
						query.push(encodeURI(param + '=' + data[param]));
					}
				}
			}
			return query.join('&')
		}
	};
	const openLinkWithoutReferer = (link) => {
		let instance = window.open("about:blank");
		instance.document.write("<meta http-equiv=\"refresh\" content=\"0;url=" + link + "\">");
		instance.document.close();
		return false;
	};

	const inputAble = el => {
		if(el instanceof HTMLInputElement){
			return !(el.disabled ||
				el.readOnly ||
				el.tagName === 'BUTTON' ||
				(el.tagName === 'INPUT' && ['hidden', 'button', 'submit', 'reset'].includes(el.type))
			);
		}
		return false;
	};
	const inputTypeAble = (el)=>{
		return inputAble(el) && (
			['text', 'password', 'url', 'search', 'tel', 'address', 'number', 'date', 'datetime-local', 'month'].includes(el.type)
			|| el.tagName === 'TEXTAREA'
		);
	};
	const getElementValue = (el) => {
		if(el.disabled){
			return null;
		}
		if(el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')){
			return el.checked ? el.value : null;
		}
		if(el.tagName === 'SELECT' && el.multiple){
			let vs = [];
			findAll('option:checked', el).forEach(item => {
				vs.push(item.value);
			});
			return vs;
		}
		return el.value;
	};
	const getElementValueByName = (name, container = document) => {
		let elements = findAll(`[name="${name}"]:not([disabled])`, container);
		let values = [];
		let multiple = false;
		elements.forEach(element => {
			switch(element.type){
				case 'checkbox':
					multiple = true;
					if(element.checked){
						values.push(element.value);
					}
					break;
				case 'radio':
					if(element.checked){
						values.push(element.value);
					}
					break;
				case 'select':
					if(element.multiple){
						multiple = true;
						Array.from(element.selectedOptions).forEach(opt => {
							values.push(opt.value);
						});
					}else {
						values.push(element.value);
					}
					break;
				default:
					values.push(element.value);
			}
		});
		return multiple ? values : values[0];
	};
	const formSync = (dom, getter, setter) => {
		let els = getAvailableElements(dom);
		els.forEach(function(el){
			let name = el.name;
			let current_val = getElementValue(el);
			el.disabled = true;
			getter(name).then(v => {
				el.disabled = false;
				if(el.type === 'radio' || el.type === 'checkbox'){
					el.checked = el.value == v;
					current_val = v;
				}else if(v !== null){
					el.value = v;
					current_val = v;
				}
			});
			el.addEventListener('change', e => {
				el.disabled = true;
				if(!el.checkValidity()){
					el.reportValidity();
					return;
				}
				let val = el.value;
				if((el.type === 'radio' || el.type === 'checkbox') && !el.checked){
					val = null;
				}
				setter(el.name, val).then(() => {
					el.disabled = false;
				}, () => {
					if(el.type === 'radio' || el.type === 'checkbox'){
						el.checked = el.value == current_val;
					}else if(current_val !== null){
						el.value = current_val;
					}
				});
			});
		});
	};
	const getAvailableElements = (dom, ignore_empty_name = false) => {
		let els = dom.querySelectorAll('input,textarea,select');
		return Array.from(els).filter(el => {
			return !isButton(el) && !el.disabled && (ignore_empty_name || el.name);
		});
	};
	const formValidate = (dom, name_validate = false) => {
		let els = getAvailableElements(dom, !name_validate);
		let pass = true;
		Array.from(els).every(el => {
			if(!el.checkValidity()){
				el.reportValidity();
				pass = false;
				return false;
			}
			return true;
		});
		return pass;
	};
	const formSerializeString = (dom, validate = true) => {
		let data_list = getFormDataAvailable(dom, validate);
		let data_string_list = [];
		data_list.forEach(item => {
			let [name, value] = item;
			if(Array.isArray(value)){
				value.forEach(val => {
					data_string_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(val)));
				});
			}else {
				data_string_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(value)));
			}
		});
		return data_string_list.join('&');
	};
	const serializePhpFormToJSON = (dom, validate = true) => {
		let data_list = getFormDataAvailable(dom, validate);
		let json_obj = {};
		let index_tmp = {
		};
		data_list.forEach(item => {
			let [name, value] = item;
			if(name.indexOf('[') < 0){
				json_obj[name] = value;
				return;
			}
			if(index_tmp[name] === undefined){
				index_tmp[name] = 0;
			}else {
				index_tmp[name]++;
			}
			let name_path = name.replace(/\[]$/, '.' + index_tmp[name]).replace(/]/g, '').replace(/\[/g, '.');
			objectPushByPath(name_path, value, json_obj, '.');
		});
		return json_obj;
	};
	const fixGetFormAction = (form) => {
		let action = form.action;
		if(form.method && form.method.toLowerCase() !== 'get' || !action.length || action.indexOf('?') < 0){
			return;
		}
		let url = new URL(action);
		let ipt;
		url.searchParams.forEach((v, k) => {
			ipt = document.createElement('input');
			ipt.type = 'hidden';
			ipt.name = k;
			ipt.value = v;
			form.appendChild(ipt);
		});
	};
	const bindFormSubmitAsJSON = (form, onSubmitting = () => {}) => {
		return new Promise((resolve, reject) => {
			form.addEventListener('submit', e => {
				lockElementInteraction(form, reset=>{
					onSubmitting();
					requestJSON(form.action, formSerializeJSON(form), form.method).then(resolve, reject).finally(reset);
				});
				e.preventDefault();
				return false;
			});
		});
	};
	const bindFormAutoSave = (form, savePromise, minSaveInterval = 2000)=>{
		let last_saved_data = formSerializeString(form, false);
		let last_execute_time = 0;
		let executing = false;
		let tasks = [];
		const PRO_KEY = '_auto_save_listen_' + guid();
		const doSaveAsync = () => {
			if(executing){
				return;
			}
			executing = true;
			let doTask = ()=>{
				let task = tasks.shift();
				let task_data = formSerializeString(form, false);
				task().finally(() => {
					last_saved_data = task_data;
					last_execute_time = (new Date()).getTime();
					executing = false;
					if(tasks.length){
						doSaveAsync();
					}
				});
			};
			let remains = minSaveInterval - (new Date().getTime() - last_execute_time);
			if(remains > 0){
				setTimeout(doTask, remains);
			} else {
				doTask();
			}
		};
		const queue = ()=>{
			if(tasks.length > 1){
				return;
			}
			if(last_saved_data === formSerializeString(form, false)){
				return;
			}
			tasks.push(savePromise);
			doSaveAsync();
		};
		mutationEffective(form,  {attributes: false, subtree: true, childList: true}, obs=>{
			findAll(`input:not([${PRO_KEY}]), textarea:not([${PRO_KEY}]), select:not([${PRO_KEY}])`).forEach(el=>{
				el.setAttribute(PRO_KEY, '1');
				el.addEventListener('change', queue);
			});
			queue();
		}, 100);
		findAll('input,textarea,select').forEach(el=>{el.addEventListener('change', queue);});
	};
	const getFormDataAvailable = (dom, validate = true) => {
		if(validate && !formValidate(dom)){
			return [];
		}
		let els = getAvailableElements(dom);
		let data_list = [];
		els.forEach(el => {
			let name = el.name;
			let value = getElementValue(el);
			if(value !== null){
				data_list.push([name, value]);
			}
		});
		return data_list;
	};
	const formSerializeJSON = (dom, validate = true) => {
		let json_obj = {};
		let data_list = getFormDataAvailable(dom, validate);
		let name_counts = {};
		data_list.forEach(item => {
			let [name] = item;
			if(name_counts[name] === undefined){
				name_counts[name] = 1;
			}else {
				name_counts[name]++;
			}
		});
		data_list.forEach(item => {
			let [name, value] = item;
			if(name_counts[name] > 1){
				if(json_obj[name] === undefined){
					json_obj[name] = [value];
				}else {
					json_obj[name].push(value);
				}
			}else {
				json_obj[name] = value;
			}
		});
		return json_obj;
	};
	const convertFormDataToObject = (formDataMap, formatSchema, mustExistsInSchema = true) => {
		let ret = {};
		for(let key in formDataMap){
			let value = formDataMap[key];
			let define = formatSchema[key];
			if(define === undefined){
				if(mustExistsInSchema){
					continue;
				}
				ret[key] = value;
				continue;
			}
			switch(typeof (define)){
				case 'string':
					ret[key] = value;
					break;
				case 'boolean':
					ret[key] = value === '1' || value === 'true';
					break;
				case 'number':
					ret[key] = parseInt(value, 10);
					break;
				case 'object':
					ret[key] = value ? JSON.parse(value) : {};
					break;
				default:
					throw "format schema no supported";
			}
		}
		return ret;
	};
	const convertObjectToFormData = (objectMap, boolMapping = ["1", "0"]) => {
		let ret = {};
		for(let key in objectMap){
			let value = objectMap[key];
			switch(typeof (value)){
				case 'string':
				case 'number':
					ret[key] = String(value);
					break;
				case 'boolean':
					ret[key] = value ? boolMapping[0] : boolMapping[1];
					break;
				case 'object':
					ret[key] = JSON.stringify(value);
					break;
				default:
					throw "format schema no supported";
			}
		}
		return ret;
	};
	const WINDOW_UNLOAD_ALERT_MAP_VAR_KEY = 'WINDOW_UNLOAD_ALERT_MAP_VAR_KEY';
	window[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY] = [
	];
	let unload_event_bind = false;
	const setWindowUnloadMessage = (msg, target) => {
		let found = false;
		if(top !== window){
			target = window.frameElement;
		}
		top[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY].map(item => {
			if(item.target === target){
				item.msg = msg;
				found = true;
			}
		});
		if(!found){
			top[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY].push({msg, target});
		}
		console.debug('set window unload message', JSON.stringify(msg), target);
		if(!unload_event_bind){
			console.debug('beforeunload bind');
			window.addEventListener('beforeunload', (e) => {
				let unload_alert_list = getWindowUnloadAlertList();
				console.debug('window.beforeunload, bind message:', JSON.stringify(unload_alert_list));
				if(unload_alert_list.length){
					let msg = unload_alert_list.join("\n");
					e.preventDefault();
					e.returnValue = msg;
					return msg;
				}
			});
			unload_event_bind = true;
		}
	};
	const getWindowUnloadAlertList = (specify_target = null) => {
		let msg_list = [];
		top[WINDOW_UNLOAD_ALERT_MAP_VAR_KEY].forEach(item => {
			if(item.msg.length
				&& item.target.parentNode
				&& (!specify_target || specify_target === item.target)
			){
				msg_list.push(item.msg);
			}
		});
		return msg_list.filter((val, idx, arr) => arr.indexOf(val) === idx);
	};
	window['getWindowUnloadAlertList'] = getWindowUnloadAlertList;
	window['setWindowUnloadMessage'] = setWindowUnloadMessage;
	let _form_data_cache_init = {};
	let _form_data_cache_new = {};
	let _form_us_msg = {};
	let _form_us_sid_attr_key = Theme.Namespace + 'form-unsaved-sid';
	const bindFormUnSavedUnloadAlert = (form, alertMsg = '') => {
		if(form.getAttribute(_form_us_sid_attr_key)){
			return;
		}
		let us_sid = guid();
		_form_us_msg[us_sid] = alertMsg || '表单尚未保存，是否确认离开？';
		form.setAttribute(_form_us_sid_attr_key, us_sid);
		let upd_tm = null;
		let upd = () => {
			upd_tm && clearTimeout(upd_tm);
			upd_tm = setTimeout(() => {
				_form_data_cache_new[us_sid] = formSerializeJSON(form, false);
				setWindowUnloadMessage(validateFormChanged(form, us_sid), form);
			}, 100);
		};
		form.addEventListener('reset', upd);
		onDomTreeChange(form, () => {
			let els = getAvailableElements(form, true);
			els.forEach(el => {
				if(el.getAttribute('__form_unsaved_bind__')){
					return;
				}
				el.setAttribute('__form_unsaved_bind__', '1');
				el.addEventListener('input', upd);
			});
		}, false);
		resetFormChangedState(form);
	};
	const validateFormChanged = (form, us_sid = null) => {
		us_sid = us_sid || form.getAttribute(_form_us_sid_attr_key);
		if(!us_sid){
			console.warn("Form no init by bindFormUnSavedAlert()");
			return '';
		}
		if(!isEquals(_form_data_cache_init[us_sid], _form_data_cache_new[us_sid])){
			return _form_us_msg[us_sid];
		}
		return '';
	};
	const resetFormChangedState = (form) => {
		let us_sid = form.getAttribute(_form_us_sid_attr_key);
		if(!us_sid){
			console.warn("Form no init by bindFormUnSavedAlert()");
			return false;
		}
		_form_data_cache_init[us_sid] = _form_data_cache_new[us_sid] = formSerializeJSON(form, false);
		setWindowUnloadMessage('', form);
	};

	let KEY_MAP = {
		0: 'Digit0', 1: 'Digit1', 2: 'Digit2', 3: 'Digit3', 4: 'Digit4', 5: 'Digit5', 6: 'Digit6', 7: 'Digit7', 8: 'Digit8', 9: 'Digit9',
		A: 'KeyA', B: 'KeyB', C: 'KeyC', D: 'KeyD', E: 'KeyE', F: 'KeyF', G: 'KeyG', H: 'KeyH', I: 'KeyI', J: 'KeyJ', K: 'KeyK', L: 'KeyL', M: 'KeyM', N: 'KeyN', O: 'KeyO', P: 'KeyP', Q: 'KeyQ', R: 'KeyR', S: 'KeyS', T: 'KeyT', U: 'KeyU', V: 'KeyV', W: 'KeyW', X: 'KeyX', Y: 'KeyY', Z: 'KeyZ',
		Space: ' ', Enter: 'Enter', Tab: 'Tab',
		Shift: 'Shift', Control: 'Control', Alt:'Alt',
		F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12', F13: 'F13', F14: 'F14', F15: 'F15', F16: 'F16', F17: 'F17', F19: 'F19', F20: 'F20',
		ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
		Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
		Escape: 'Escape', Backspace: 'Backspace', Delete: 'Delete', Insert: 'Insert', Clear: 'Clear', Copy: 'Copy', Paste: 'Paste', Redo: 'Redo', Undo: 'Undo',
		Meta: 'Meta',  Symbol:'Symbol',
		CapsLock:'CapsLock', NumLock: 'NumLock', ScrollLock: 'ScrollLock', SymbolLock: 'SymbolLock', FnLock: 'FnLock',
		ContextMenu: 'ContextMenu',
	};
	const SYMBOLS = '~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./'.split('');
	SYMBOLS.forEach(sym=>{
		KEY_MAP[sym] = sym;
	});
	KEY_MAP.Alpla = [KEY_MAP.A, KEY_MAP.B, KEY_MAP.C, KEY_MAP.D, KEY_MAP.E, KEY_MAP.F, KEY_MAP.G, KEY_MAP.H, KEY_MAP.I, KEY_MAP.J, KEY_MAP.K, KEY_MAP.L, KEY_MAP.M, KEY_MAP.N, KEY_MAP.O, KEY_MAP.P, KEY_MAP.Q, KEY_MAP.R, KEY_MAP.S, KEY_MAP.T, KEY_MAP.U, KEY_MAP.V, KEY_MAP.W, KEY_MAP.X, KEY_MAP.Y, KEY_MAP.Z];
	KEY_MAP.Number = [KEY_MAP[0], KEY_MAP[1], KEY_MAP[2], KEY_MAP[3], KEY_MAP[4], KEY_MAP[5], KEY_MAP[6], KEY_MAP[7], KEY_MAP[8], KEY_MAP[9]];
	KEY_MAP.Symbol = SYMBOLS;
	KEY_MAP.Whitespace = [KEY_MAP.Space, KEY_MAP.Enter, KEY_MAP.Tab];
	KEY_MAP.Content = [...KEY_MAP.Alpla, ...KEY_MAP.Whitespace, ...KEY_MAP.Number, ];
	KEY_MAP.Fn = [KEY_MAP.F1, KEY_MAP.F2, KEY_MAP.F3, KEY_MAP.F4, KEY_MAP.F5, KEY_MAP.F6, KEY_MAP.F7, KEY_MAP.F8, KEY_MAP.F9, KEY_MAP.F10, KEY_MAP.F11, KEY_MAP.F12, KEY_MAP.F13, KEY_MAP.F14, KEY_MAP.F15, KEY_MAP.F16, KEY_MAP.F17, KEY_MAP.F19, KEY_MAP.F20];
	KEY_MAP.Arrow = [KEY_MAP.ArrowUp, KEY_MAP.ArrowDown, KEY_MAP.ArrowLeft, KEY_MAP.ArrowRight];
	KEY_MAP.Navigation = [...KEY_MAP.Arrow, KEY_MAP.Home, KEY_MAP.End, KEY_MAP.PageUp, KEY_MAP.PageDown];
	const KEYBOARD_KEY_MAP = KEY_MAP;
	class BizEvent {
		events = [];
		breakOnFalseReturn = false;
		constructor(breakOnFalseReturn = false){
			this.breakOnFalseReturn = breakOnFalseReturn;
		}
		listen(payload){
			this.events.push(payload);
		}
		remove(payload){
			this.events = this.events.filter(ev => ev !== payload);
		}
		clean(){
			this.events = [];
		}
		fire(...args){
			let breakFlag = false;
			this.events.forEach(event => {
				let ret = event.apply(null, args);
				if(this.breakOnFalseReturn && ret === false){
					breakFlag = true;
					return false;
				}
			});
			return !breakFlag;
		}
	}
	const EVENT_ACTIVE = 'active';
	const onHover = (nodes, hoverIn = null, hoverOut = null, hoverClass = '') => {
		const _in = (e, node) => {
			hoverClass && node.classList.add(hoverClass);
			return hoverIn ? hoverIn(e) : null;
		};
		const _out = (e, node) => {
			hoverClass && node.classList.remove(hoverClass);
			return hoverOut ? hoverOut(e) : null;
		};
		findAll(nodes).forEach(node => {
			node.addEventListener('touchstart', e => {return _in(e, node);});
			node.addEventListener('touchend', e => {return _out(e, node);});
			node.addEventListener('mouseenter', e => {return _in(e, node);});
			node.addEventListener('mouseleave', e => {return _out(e, node);});
		});
	};
	const fireEvent = (nodes, event) => {
		findAll(nodes).forEach(node=>{
			if("createEvent" in document){
				let evo = document.createEvent("HTMLEvents");
				evo.initEvent(event, false, true);
				node.dispatchEvent(evo);
			}else {
				node.fireEvent("on" + event);
			}
		});
	};
	const bindNodeActive = (nodes, payload, cancelBubble = false, triggerAtOnce = false) => {
		findAll(nodes).forEach(node=>{
			node.addEventListener('click', e=>{
				payload.call(node, e, node);
			}, cancelBubble);
			node.addEventListener('keyup', e => {
				if(e.keyCode === KEYS.Space || e.keyCode === KEYS.Enter){
					node.click();
					e.preventDefault();
				}
			}, cancelBubble);
			if(triggerAtOnce){
				payload.call(node, null, node);
			}
		});
	};
	const objectOnChanged = (obj, onSet)=>{
		new Proxy(obj, {
			set: function(target, key, value){
				console.log(`${key} set to ${value}`);
				if(onSet(key, value) === false){
					return false;
				}
				target[key] = value;
				return true;
			}
		});
	};
	const onDocReady = (callback)=>{
		if (document.readyState === 'complete') {
			callback();
		} else {
			document.addEventListener("DOMContentLoaded", callback);
		}
	};
	const triggerDomEvent = (node, event) => {
		if("createEvent" in document){
			let evt = document.createEvent("HTMLEvents");
			evt.initEvent(event.toLowerCase(), false, true);
			node.dispatchEvent(evt);
		}else {
			node.fireEvent("on"+event.toLowerCase());
		}
	};
	const bindNodeEvents = (nodes, event, payload, option = null, triggerAtOnce = false) => {
		findAll(nodes).forEach(node => {
			let evs = Array.isArray(event) ? event : [event];
			evs.forEach(ev => {
				if(ev === EVENT_ACTIVE){
					bindNodeActive(node, payload, option);
				}else {
					node.addEventListener(ev, e => {
						payload.call(node, e, node);
					}, option);
				}
			});
			if(triggerAtOnce){
				payload.call(node, null, node);
			}
		});
	};
	const bindHotKeys = (keyStr, payload, option = {}) => {
		let keys = keyStr.replace(/\s/ig, '').toLowerCase().split('+');
		let {scope, event, preventDefault} = option;
		preventDefault = preventDefault === undefined ? true : !!preventDefault;
		event = event || 'keydown';
		scope = findOne(scope || document);
		scope.addEventListener(event, e => {
			if((keys.includes('shift') ^ e.shiftKey) ||
				(keys.includes('ctrl') ^ e.ctrlKey) ||
				(keys.includes('alt') ^ e.altKey)
			){
				return true;
			}
			if(e.target !== scope &&
				KEYBOARD_KEY_MAP.Content.includes(e.key) && (!e.altKey && !e.ctrlKey) &&
				inputAble(e.target)
			){
				return true;
			}
			let singleKeys = keys.filter(k => {
				return !['shift', 'ctrl', 'alt', 'meta'].includes(k);
			});
			if(singleKeys.length > 1){
				console.error('bindHotKeys no support pattern:', keyStr);
				return;
			}
			let pressKeyCode = [KEYBOARD_KEY_MAP.Shift, KEYBOARD_KEY_MAP.Control, KEYBOARD_KEY_MAP.Alt].includes(e.key) ? null : e.keyCode;
			if((!singleKeys.length && !pressKeyCode) || (singleKeys[0] === e.key)){
				payload.call(e.target, e);
				if(preventDefault){
					e.preventDefault();
					return false;
				}
			}
			return true;
		});
	};
	const eventDelegate = (container, selector, eventName, payload)=>{
		findAllOrFail(container).forEach(ctn=>{
			ctn.addEventListener(eventName, ev=>{
				let target = ev.target;
				while(target){
					if(target.matches(selector)){
						payload.call(target, ev, target);
						return;
					}
					if(target === ctn){
						return;
					}
					target = target.parentNode;
				}
			});
		});
	};
	const KEYS = {
		A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57,
		BackSpace: 8, Esc: 27, RightArrow: 39, Tab: 9, Space: 32, DownArrow: 40, Clear: 12, PageUp: 33, Insert: 45, Enter: 13, PageDown: 34, Delete: 46, Shift: 16, End: 35, NumLock: 144, Control: 17, Home: 36, Alt: 18, LeftArrow: 37, CapsLock: 20, UpArrow: 38,
		F1: 112,F2: 113,F3: 114,F4: 115,F5: 116,F6: 117,F7: 118,F8: 119,F9: 120,F10: 121,F11: 122,F12: 123,
		NumPad0: 96, NumPad1: 97, NumPad2: 98, NumPad3: 99, NumPad4: 100, NumPad5: 101, NumPad6: 102, NumPad7: 103, NumPad8: 104, NumPad9: 105, NumPadMultiple: 106, NumPadPlus: 107, NumPadDash: 109, NumPadDot: 110, NumPadSlash: 111, NumPadEnter: 108
	};

	const loadImgBySrc = (src)=>{
		return new Promise((resolve, reject) => {
			let img = new Image;
			img.referrerPolicy = 'no-referrer';
			img.onload = ()=>{
				resolve(img);
			};
			img.onabort = ()=>{
				reject('Image loading abort');
			};
			img.onerror = ()=>{
				reject('Image load failure');
			};
			img.src = src;
		});
	};
	const getHighestResFromSrcSet = (srcset_str) => {
		return srcset_str
			.split(",")
			.reduce(
				(acc, item) => {
					let [url, width] = item.trim().split(" ");
					width = parseInt(width);
					if(width > acc.width) return {width, url};
					return acc;
				},
				{width: 0, url: ""}
			).url;
	};
	const getBase64BySrc = (src)=>{
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.responseType = 'blob';
			xhr.onload = function(){
				if(this.status === 200){
					let blob = this.response;
					convertBlobToBase64(blob).then(base64 => {
						resolve(base64);
					}).catch(error => {
						reject(error);
					});
				}
			};
			xhr.onerror = function() {
				reject('Error:'+this.statusText);
			};
			xhr.onabort = function(){
				reject('Request abort');
			};
			xhr.send();
		});
	};
	const getBase64ByImg = (img) => {
		if(!img.src){
			return null;
		}
		if(img.src.indexOf('data:') === 0){
			return img.src;
		}
		let canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		let ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		return canvas.toDataURL("image/png")
	};
	const scaleFixCenter$1 = ({
	   contentWidth,
	   contentHeight,
	   containerWidth,
	   containerHeight,
	   spacing = 0,
	   zoomIn = false}) => {
		if(contentWidth <= containerWidth && contentHeight <= containerHeight && !zoomIn){
			return {
				width: contentWidth,
				height: contentHeight,
				left: (containerWidth - contentWidth) / 2,
				top: (containerHeight - contentHeight) / 2
			};
		}
		let ratioX = containerWidth / contentWidth;
		let ratioY = containerHeight / contentHeight;
		let ratio = Math.min(ratioX, ratioY);
		return {
			width: contentWidth * ratio - spacing * 2,
			height: contentHeight * ratio - spacing * 2,
			left: (containerWidth - contentWidth * ratio) / 2 + spacing,
			top: (containerHeight - contentHeight * ratio) / 2 + spacing,
		}
	};
	const getAverageRGB = (imgEl) => {
		let blockSize = 5,
			defaultRGB = {r: 0, g: 0, b: 0},
			canvas = document.createElement('canvas'),
			context = canvas.getContext && canvas.getContext('2d'),
			data, width, height,
			i = -4,
			length,
			rgb = {r: 0, g: 0, b: 0},
			count = 0;
		if(!context){
			return defaultRGB;
		}
		height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
		width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
		context.drawImage(imgEl, 0, 0);
		try{
			data = context.getImageData(0, 0, width, height);
		}catch(e){
			return defaultRGB;
		}
		length = data.data.length;
		while((i += blockSize * 4) < length){
			++count;
			rgb.r += data.data[i];
			rgb.g += data.data[i + 1];
			rgb.b += data.data[i + 2];
		}
		rgb.r = ~~(rgb.r / count);
		rgb.g = ~~(rgb.g / count);
		rgb.b = ~~(rgb.b / count);
		return rgb;
	};

	const safeAdd = (x, y) => {
		let lsw = (x & 0xffff) + (y & 0xffff);
		let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff)
	};
	const bitRotateLeft = (num, cnt) => {
		return (num << cnt) | (num >>> (32 - cnt))
	};
	const md5cmn = (q, a, b, x, s, t) => {
		return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
	};
	const md5ff = (a, b, c, d, x, s, t) => {
		return md5cmn((b & c) | (~b & d), a, b, x, s, t)
	};
	const md5gg = (a, b, c, d, x, s, t) => {
		return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
	};
	const md5hh = (a, b, c, d, x, s, t) => {
		return md5cmn(b ^ c ^ d, a, b, x, s, t)
	};
	const md5ii = (a, b, c, d, x, s, t) => {
		return md5cmn(c ^ (b | ~d), a, b, x, s, t)
	};
	const binlMD5 = (x, len) => {
		x[len >> 5] |= 0x80 << (len % 32);
		x[((len + 64) >>> 9 << 4) + 14] = len;
		let i;
		let olda;
		let oldb;
		let oldc;
		let oldd;
		let a = 1732584193;
		let b = -271733879;
		let c = -1732584194;
		let d = 271733878;
		for(i = 0; i < x.length; i += 16){
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;
			a = md5ff(a, b, c, d, x[i], 7, -680876936);
			d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
			a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = md5gg(b, c, d, a, x[i], 20, -373897302);
			a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
			a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
			d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = md5hh(d, a, b, c, x[i], 11, -358537222);
			c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
			a = md5ii(a, b, c, d, x[i], 6, -198630844);
			d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
			a = safeAdd(a, olda);
			b = safeAdd(b, oldb);
			c = safeAdd(c, oldc);
			d = safeAdd(d, oldd);
		}
		return [a, b, c, d]
	};
	const binl2rstr = (input) => {
		let i;
		let output = '';
		let length32 = input.length * 32;
		for(i = 0; i < length32; i += 8){
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
		}
		return output
	};
	const rstr2binl = (input) => {
		let i;
		let output = [];
		output[(input.length >> 2) - 1] = undefined;
		for(i = 0; i < output.length; i += 1){
			output[i] = 0;
		}
		let length8 = input.length * 8;
		for(i = 0; i < length8; i += 8){
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
		}
		return output
	};
	const rstrMD5 = (s) => {
		return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
	};
	const rstrHMACMD5 = (key, data) => {
		let i;
		let bkey = rstr2binl(key);
		let ipad = [];
		let opad = [];
		let hash;
		ipad[15] = opad[15] = undefined;
		if(bkey.length > 16){
			bkey = binlMD5(bkey, key.length * 8);
		}
		for(i = 0; i < 16; i += 1){
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5c5c5c5c;
		}
		hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
		return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
	};
	const rstr2hex = (input) => {
		let hexTab = '0123456789abcdef';
		let output = '';
		let x;
		let i;
		for(i = 0; i < input.length; i += 1){
			x = input.charCodeAt(i);
			output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
		}
		return output
	};
	const str2rstrUTF8 = (input) => {
		return unescape(encodeURIComponent(input))
	};
	const rawMD5 = (s) => {
		return rstrMD5(str2rstrUTF8(s))
	};
	const hexMD5 = (s) => {
		return rstr2hex(rawMD5(s))
	};
	const rawHMACMD5 = (k, d) => {
		return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
	};
	const hexHMACMD5 = (k, d) => {
		return rstr2hex(rawHMACMD5(k, d))
	};
	const MD5 = (string, key, raw) => {
		if(!key){
			if(!raw){
				return hexMD5(string)
			}
			return rawMD5(string)
		}
		if(!raw){
			return hexHMACMD5(key, string)
		}
		return rawHMACMD5(key, string)
	};

	let hook_flag = false;
	const RptEv = new BizEvent();
	const doHook = () => {
		let observer = new ReportingObserver((reports) => {
			onReportApi.fire(reports);
		}, {
			types: ['deprecation'],
			buffered: true
		});
		observer.observe();
	};
	const onReportApi = {
		listen(payload){
			!hook_flag && doHook();
			hook_flag = true;
			RptEv.listen(payload);
		},
		remove(payload){
			return RptEv.remove(payload);
		},
		fire(...args){
			return RptEv.fire(...args);
		}
	};

	let payloads = [];
	let popstate_bind = false;
	const pushState = (param, title = '') => {
		let url = location.href.replace(/#.*$/g, '') + '#' + QueryString.stringify(param);
		window.history.pushState(param, title, url);
		exePayloads(param);
	};
	const onStateChange = (payload) => {
		if(!popstate_bind){
			popstate_bind = true;
			window.addEventListener('popstate', e=>{
				let state = e.state ?? {};
				let hashObj = QueryString.parse(getHash());
				exePayloads({...state, ...hashObj});
			});
		}
		payloads.push(payload);
	};
	const exePayloads = (param) => {
		payloads.forEach(payload => {
			payload(param);
		});
	};

	const ONE_MINUTE = 60000;
	const ONE_HOUR = 3600000;
	const ONE_DAY = 86400000;
	const ONE_WEEK = 604800000;
	const ONE_MONTH_30 = 2592000000;
	const ONE_MONTH_31 = 2678400000;
	const ONE_YEAR_365 = 31536000000;
	function frequencyControl(payload, interval, executeOnFistTime = false){
		if(payload._frq_tm){
			clearTimeout(payload._frq_tm);
		}
		payload._frq_tm = setTimeout(() => {
			frequencyControl(payload, interval, executeOnFistTime);
		}, interval);
	}
	const getMonthLastDay = (year, month) => {
		const date1 = new Date(year, month, 0);
		return date1.getDate()
	};
	const getLastMonth = (year, month) => {
		return month === 1 ? [year - 1, 12] : [year, month - 1];
	};
	const getNextMonth = (year, month) => {
		return month === 12 ? [year + 1, 1] : [year, month + 1];
	};
	const getETA = (startTime, index, total, pretty = true)=>{
		if(!index){
			return '';
		}
		let sec = ((new Date().getTime()) - startTime) * (total - index)/index;
		if(!pretty){
			return sec;
		}
		return prettyTime(sec*1000);
	};
	const countDown = (timeout, tickFunc, onFinish) => {
		let loop = () => {
			tickFunc && tickFunc(timeout);
			if(timeout-- > 0){
				setTimeout(loop, 1000);
				return;
			}
			onFinish && onFinish();
		};
		loop();
	};
	const prettyTime = (micSec, delimiter = '') => {
		let d = 0, h = 0, m = 0, s = 0;
		if(micSec > ONE_DAY){
			d = Math.floor(micSec / ONE_DAY);
			micSec -= d * ONE_DAY;
		}
		if(micSec > ONE_HOUR){
			h = Math.floor(micSec / ONE_HOUR);
			micSec -= h * ONE_HOUR;
		}
		if(micSec > ONE_MINUTE){
			m = Math.floor(micSec / ONE_MINUTE);
			micSec -= m * ONE_MINUTE;
		}
		if(micSec > 1000){
			s = Math.floor(micSec / 1000);
			micSec -= s * 1000;
		}
		let txt = '';
		txt += d ? `${d}天` : '';
		txt += (txt || h) ? `${delimiter}${h}小时` : '';
		txt += (txt || m) ? `${delimiter}${m}分` : '';
		txt += (txt || s) ? `${delimiter}${s}秒` : '';
		return txt.trim();
	};
	const monthsOffsetCalc = (monthNum, start_date = new Date()) => {
		let year = start_date.getFullYear();
		let month = start_date.getMonth() + 1;
		month = month + monthNum;
		if(month > 12){
			let yearNum = Math.floor((month - 1) / 12);
			month = month % 12 === 0 ? 12 : month % 12;
			year += yearNum;
		}else if(month <= 0){
			month = Math.abs(month);
			let yearNum = Math.floor((month + 12) / 12);
			let n = month % 12;
			if(n === 0){
				year -= yearNum;
				month = 12;
			}else {
				year -= yearNum;
				month = Math.abs(12 - n);
			}
		}
		return {year, month}
	};
	const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const PHP_DATE_CHAR_MAP = {
		d: dateObj => {
			let d = dateObj.getDate();
			return (d < 10 ? '0' : '') + d
		},
		D: dateObj => {
			return shortDays[dateObj.getDay()]
		},
		j: dateObj => {
			return dateObj.getDate()
		},
		l: dateObj => {
			return longDays[dateObj.getDay()]
		},
		N: dateObj => {
			let N = dateObj.getDay();
			return (N === 0 ? 7 : N)
		},
		S: dateObj => {
			let S = dateObj.getDate();
			return (S % 10 === 1 && S !== 11 ? 'st' : (S % 10 === 2 && S !== 12 ? 'nd' : (S % 10 === 3 && S !== 13 ? 'rd' : 'th')))
		},
		w: dateObj => {
			return dateObj.getDay()
		},
		z: dateObj => {
			let d = new Date(dateObj.getFullYear(), 0, 1);
			return Math.ceil((dateObj - d) / 86400000)
		},
		W: dateObj => {
			let target = new Date(dateObj.valueOf());
			let dayNr = (dateObj.getDay() + 6) % 7;
			target.setDate(target.getDate() - dayNr + 3);
			let firstThursday = target.valueOf();
			target.setMonth(0, 1);
			if(target.getDay() !== 4){
				target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
			}
			let retVal = 1 + Math.ceil((firstThursday - target) / 604800000);
			return (retVal < 10 ? '0' + retVal : retVal)
		},
		F: dateObj => {
			return longMonths[dateObj.getMonth()]
		},
		m: dateObj => {
			let m = dateObj.getMonth();
			return (m < 9 ? '0' : '') + (m + 1)
		},
		M: dateObj => {
			return shortMonths[dateObj.getMonth()]
		},
		n: dateObj => {
			return dateObj.getMonth() + 1
		},
		t: dateObj => {
			let year = dateObj.getFullYear();
			let nextMonth = dateObj.getMonth() + 1;
			if(nextMonth === 12){
				year = year++;
				nextMonth = 0;
			}
			return new Date(year, nextMonth, 0).getDate()
		},
		L: dateObj => {
			let L = dateObj.getFullYear();
			return (L % 400 === 0 || (L % 100 !== 0 && L % 4 === 0))
		},
		o: dateObj => {
			let d = new Date(dateObj.valueOf());
			d.setDate(d.getDate() - ((dateObj.getDay() + 6) % 7) + 3);
			return d.getFullYear()
		},
		Y: dateObj => {
			return dateObj.getFullYear()
		},
		y: dateObj => {
			return ('' + dateObj.getFullYear()).substr(2)
		},
		a: dateObj => {
			return dateObj.getHours() < 12 ? 'am' : 'pm'
		},
		A: dateObj => {
			return dateObj.getHours() < 12 ? 'AM' : 'PM'
		},
		B: dateObj => {
			return Math.floor((((dateObj.getUTCHours() + 1) % 24) + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600) * 1000 / 24)
		},
		g: dateObj => {
			return dateObj.getHours() % 12 || 12
		},
		G: dateObj => {
			return dateObj.getHours()
		},
		h: dateObj => {
			let h = dateObj.getHours();
			return ((h % 12 || 12) < 10 ? '0' : '') + (h % 12 || 12)
		},
		H: dateObj => {
			let H = dateObj.getHours();
			return (H < 10 ? '0' : '') + H
		},
		i: dateObj => {
			let i = dateObj.getMinutes();
			return (i < 10 ? '0' : '') + i
		},
		s: dateObj => {
			let s = dateObj.getSeconds();
			return (s < 10 ? '0' : '') + s
		},
		v: dateObj => {
			let v = dateObj.getMilliseconds();
			return (v < 10 ? '00' : (v < 100 ? '0' : '')) + v
		},
		e: dateObj => {
			return Intl.DateTimeFormat().resolvedOptions().timeZone
		},
		I: dateObj => {
			let DST = null;
			for(let i = 0; i < 12; ++i){
				let d = new Date(dateObj.getFullYear(), i, 1);
				let offset = d.getTimezoneOffset();
				if(DST === null) DST = offset;
				else if(offset < DST){
					DST = offset;
					break
				}else if(offset > DST) break
			}
			return (dateObj.getTimezoneOffset() === DST) | 0
		},
		O: dateObj => {
			let O = dateObj.getTimezoneOffset();
			return (-O < 0 ? '-' : '+') + (Math.abs(O / 60) < 10 ? '0' : '') + Math.floor(Math.abs(O / 60)) + (Math.abs(O % 60) === 0 ? '00' : ((Math.abs(O % 60) < 10 ? '0' : '')) + (Math.abs(O % 60)))
		},
		P: dateObj => {
			let P = dateObj.getTimezoneOffset();
			return (-P < 0 ? '-' : '+') + (Math.abs(P / 60) < 10 ? '0' : '') + Math.floor(Math.abs(P / 60)) + ':' + (Math.abs(P % 60) === 0 ? '00' : ((Math.abs(P % 60) < 10 ? '0' : '')) + (Math.abs(P % 60)))
		},
		T: dateObj => {
			let tz = dateObj.toLocaleTimeString(navigator.language, {timeZoneName: 'short'}).split(' ');
			return tz[tz.length - 1]
		},
		Z: dateObj => {
			return -dateObj.getTimezoneOffset() * 60
		},
		c: dateObj => {
			return dateObj.format('Y-m-d\\TH:i:sP')
		},
		r: dateObj => {
			return dateObj.toString()
		},
		U: dateObj => {
			return Math.floor(dateObj.getTime() / 1000)
		}
	};
	const formatDate = function(format, date = null){
		let dateObj = null;
		if(typeof date === 'object' && date !== null){
			dateObj = date;
		}else {
			dateObj = new Date(date || (new Date().getTime()));
		}
		return format.replace(/(\\?)(.)/g, function(_, esc, chr){
			return (esc === '' && PHP_DATE_CHAR_MAP[chr]) ? PHP_DATE_CHAR_MAP[chr](dateObj) : chr
		})
	};

	const DOMAIN_DEFAULT = 'default';
	const trans = (text, domain = DOMAIN_DEFAULT) => {
		return text;
	};

	const DEFAULT_MAXLENGTH = 40;
	const DEFAULT_MAX = 100;
	let button_init = false;
	const initAutofillButton = (scopeSelector = 'body') => {
		if(button_init){
			throw "autofill button already initialized";
		}
		button_init = true;
		insertStyleSheet(`
		#auto-fill-form-btn {position: absolute; left:calc(100vw - 200px); top:50px;z-index:99999;user-select:none;opacity:0.4;transition:all 0.1s linear; border-color:#ddd; border:1px solid #aaa; --size:2em; border-radius:5px; width:var(--size); height:var(--size); line-height:var(--size); text-align:center; cursor:pointer; background-color:#fff;}
		#auto-fill-form-btn:hover {opacity:1}
		#auto-fill-form-btn:before {content:"\\e75d"; font-family:${Theme.IconFont}}
	`, Theme.Namespace+'-autofill');
		let button = createDomByHtml('<span id="auto-fill-form-btn" title="自动填充"></span>', document.body);
		button.addEventListener('click', e => {
			findAll(`${scopeSelector} form`).forEach(fillForm);
		});
		tryPositionInFirstForm(`${scopeSelector}`, button);
	};
	const tryPositionInFirstForm = (scope, button) => {
		let firstAvailableForm = findAll(`${scope} form`).find(form => {
			return !!getAvailableElements(form).length;
		});
		if(firstAvailableForm){
			button.style.left = firstAvailableForm.offsetLeft + firstAvailableForm.offsetWidth - button.offsetWidth + 'px';
			button.style.top = firstAvailableForm.offsetTop + 'px';
		}
	};
	const fillForm = (formOrContainer) => {
		let inputElements = getAvailableElements(formOrContainer, true);
		if(!inputElements.length){
			return false;
		}
		let radio_filled = {};
		inputElements.forEach(element => {
			if(element.type === 'hidden'){
				return;
			}
			let required = element.required ? true : randomInt(0, 5) > 2;
			let maxlength = parseInt(element.getAttribute('maxlength') || 0) || DEFAULT_MAXLENGTH;
			let name = element.name;
			switch(element.type){
				case 'text':
				case 'password':
				case 'search':
				case 'address':
					required && (element.value = randomSentence(maxlength));
					break;
				case 'checkbox':
					element.checked = Math.random() > 0.5;
					break;
				case 'radio':
					if(name.length && radio_filled[name]){
						break;
					}
					radio_filled[name] = true;
					required = true;
					let all_radios = Array.from(formOrContainer.querySelectorAll(`input[name=${name}]`));
					let matched_radio = all_radios[randomInt(0, all_radios.length - 1)];
					matched_radio.setAttribute('checked', 'checked');
					triggerDomEvent(element, 'change');
					return;
				case 'number':
					let min = element.min ? parseFloat(element.min) : 0;
					let max = element.max ? parseFloat(element.max) : DEFAULT_MAX;
					required && (element.value = randomInt(min, max));
					break;
				default:
					if(element.tagName === 'SELECT'){
						required && (element.selectedIndex = randomInt(0, element.querySelectorAll('option').length - 1));
					}else if(element.tagName === 'TEXTAREA'){
						required && (element.value = randomSentence(maxlength, true));
					}else {
						return;
					}
					break;
			}
			required && triggerDomEvent(element, 'change');
		});
	};

	const COM_ID$5 = Theme.Namespace + 'toast';
	const TOAST_CLS_MAIN = Theme.Namespace + 'toast';
	const rotate_animate = Theme.Namespace + '-toast-rotate';
	const fadeIn_animate = Theme.Namespace + '-toast-fadein';
	const fadeOut_animate = Theme.Namespace + '-toast-fadeout';
	const FADEIN_TIME = 200;
	const FADEOUT_TIME = 500;
	const STYLE_STR$a = `
	@keyframes ${rotate_animate} {
	    0% {transform:scale(1.4) rotate(0deg);}
	    100% {transform:scale(1.4) rotate(360deg);}
	} 
	@keyframes ${fadeIn_animate} {
		0% { opacity: 0; }
		100% { opacity: 1; } 
	}
	@keyframes ${fadeOut_animate} {
		0% { opacity:1;}
		100% { opacity: 0} 
	}
	.${TOAST_CLS_MAIN}-wrap{position:fixed; margin:0; padding:0; top:5px; pointer-events:none; background-color:transparent; width:100%; border:none; text-align:center; z-index:${Theme.ToastIndex};}
	.${TOAST_CLS_MAIN} {pointer-events:auto}
	.${TOAST_CLS_MAIN}>span {margin-bottom:0.5rem;}
	.${TOAST_CLS_MAIN} .ctn{display:inline-block;border-radius:3px;padding:.5rem 1rem .5rem 2.8rem; text-align:left; line-height:1.5rem; background-color:var(${Theme.CssVar.BACKGROUND_COLOR});color:var(${Theme.CssVar.COLOR});box-shadow:var(${Theme.CssVar.PANEL_SHADOW}); animation:${fadeIn_animate} ${FADEIN_TIME}ms}
	.${TOAST_CLS_MAIN} .ctn:before {content:"";font-family:${Theme.IconFont}; position:absolute; font-size:1.4rem; margin-left:-1.8rem;}
	.${TOAST_CLS_MAIN}-hide .ctn {animation:${fadeOut_animate} ${FADEOUT_TIME}ms; animation-fill-mode:forwards}
	.${TOAST_CLS_MAIN}-info .ctn:before {content:"\\e77e";color: gray;}
	.${TOAST_CLS_MAIN}-warning .ctn:before {content:"\\e673"; color:orange}
	.${TOAST_CLS_MAIN}-success .ctn:before {content:"\\e78d"; color:#007ffc}
	.${TOAST_CLS_MAIN}-error .ctn:before {content: "\\e6c6"; color:red;} 
	.${TOAST_CLS_MAIN}-loading .ctn:before {content:"\\e635";color:gray;animation: 1.5s linear infinite ${rotate_animate};animation-play-state: inherit;transform:scale(1.4);will-change: transform}
`;
	let toastWrap = null;
	const getWrapper = () => {
		if(!toastWrap){
			toastWrap = createDomByHtml(`<div class="${TOAST_CLS_MAIN}-wrap" popover="manual"></div>`, document.body);
		}
		return toastWrap;
	};
	class Toast {
		static TYPE_INFO = 'info';
		static TYPE_SUCCESS = 'success';
		static TYPE_WARNING = 'warning';
		static TYPE_ERROR = 'error';
		static TYPE_LOADING = 'loading';
		static DEFAULT_TIME_MAP = {
			[Toast.TYPE_INFO]: 1500,
			[Toast.TYPE_SUCCESS]: 1500,
			[Toast.TYPE_WARNING]: 2000,
			[Toast.TYPE_ERROR]: 2500,
			[Toast.TYPE_LOADING]: 0,
		};
		message = '';
		type = Toast.TYPE_INFO;
		timeout = Toast.DEFAULT_TIME_MAP[this.type];
		dom = null;
		constructor(message, type = null, timeout = null){
			insertStyleSheet(STYLE_STR$a, COM_ID$5 + '-style');
			this.message = message;
			this.type = type || Toast.TYPE_SUCCESS;
			this.timeout = timeout === null ? Toast.DEFAULT_TIME_MAP[this.type] : timeout;
		}
		static showToast = (message, type = null, timeout = null, timeoutCallback = null) => {
			let toast = new Toast(message, type, timeout);
			toast.show(timeoutCallback);
			return toast;
		}
		static showInfo = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_INFO, this.DEFAULT_TIME_MAP[Toast.TYPE_INFO], timeoutCallback);
		}
		static showSuccess = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_SUCCESS, this.DEFAULT_TIME_MAP[Toast.TYPE_SUCCESS], timeoutCallback);
		}
		static showWarning = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_WARNING, this.DEFAULT_TIME_MAP[Toast.TYPE_WARNING], timeoutCallback);
		}
		static showError = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_ERROR, this.DEFAULT_TIME_MAP[Toast.TYPE_ERROR], timeoutCallback);
		}
		static showLoading = (message, timeoutCallback = null) => {
			return this.showToast(message, Toast.TYPE_LOADING, this.DEFAULT_TIME_MAP[Toast.TYPE_LOADING], timeoutCallback);
		}
		static showLoadingLater = (message, delayMicroseconds = 200, timeoutCallback = null) => {
			let time = Toast.DEFAULT_TIME_MAP[Toast.TYPE_LOADING];
			let toast = new Toast(message, Toast.TYPE_LOADING, time);
			toast.show(timeoutCallback);
			hide(toast.dom);
			setTimeout(() => {
				toast.dom && show(toast.dom);
			}, delayMicroseconds);
			return toast;
		}
		show(onTimeoutClose = null){
			let wrapper = getWrapper();
			if(wrapper.showPopover){
				wrapper.showPopover();
			} else {
				show(wrapper);
			}
			this.dom = createDomByHtml(
				`<span class="${TOAST_CLS_MAIN} ${TOAST_CLS_MAIN}-${this.type}">
				<span class="ctn">${this.message}</span><div></div>
			</span>`, wrapper);
			if(this.timeout){
				setTimeout(() => {
					this.hide(true);
					onTimeoutClose && onTimeoutClose();
				}, this.timeout);
			}
		}
		update(html){
			findOne('.ctn', this.dom).innerHTML = html;
		}
		hide(fadeOut = false){
			if(!this.dom || !document.body.contains(this.dom)){
				return;
			}
			if(fadeOut){
				this.dom.classList.add(TOAST_CLS_MAIN + '-hide');
				setTimeout(() => {
					this.hide(false);
				}, FADEOUT_TIME);
				return;
			}
			remove(this.dom);
			this.dom = null;
			let wrapper = getWrapper();
			if(!wrapper.childNodes.length){
				if(wrapper.hidePopover){
					wrapper.hidePopover();
				} else {
					hide(wrapper);
				}
			}
		}
	}
	window[COM_ID$5] = Toast;
	let CONTEXT_WINDOW$2 = getContextWindow();
	let ToastClass = CONTEXT_WINDOW$2[COM_ID$5] || Toast;

	const COM_ID$4 = Theme.Namespace + 'dialog';
	const DLG_CLS_PREF = COM_ID$4;
	const DLG_CLS_TI = DLG_CLS_PREF + '-ti';
	const DLG_CLS_CTN = DLG_CLS_PREF + '-ctn';
	const DLG_CLS_OP = DLG_CLS_PREF + '-op';
	const DLG_CLS_TOP_BUTTON_ZONE = DLG_CLS_PREF + '-top-button-zone';
	const DLG_CLS_TOP_BUTTON = DLG_CLS_PREF + '-top-btn';
	const DLG_CLS_TOP_CLOSE = DLG_CLS_PREF + '-close-btn';
	const DLG_CLS_TOP_SCREEN_TOGGLE = DLG_CLS_PREF + '-screen-toggle-btn';
	const ARIA_LABEL_CONFIRM = 'Confirm';
	const ARIA_LABEL_CLOSE = 'Close';
	const DLG_CLS_BTN = DLG_CLS_PREF + '-btn';
	const DLG_CLS_WEAK_BTN = DLG_CLS_PREF + '-weak-btn';
	const IFRAME_ID_ATTR_FLAG = 'data-dialog-flag';
	const STATE_ACTIVE = 'active';
	const STATE_DISABLED = 'disabled';
	const STATE_HIDDEN = 'hidden';
	const DIALOG_TYPE_ATTR_KEY = 'data-dialog-type';
	const TYPE_NORMAL = 'normal';
	const TYPE_PROMPT = 'prompt';
	const TYPE_CONFIRM = 'confirm';
	const DLG_CTN_TYPE_IFRAME = DLG_CLS_PREF + '-ctn-iframe';
	const DLG_CTN_TYPE_HTML = DLG_CLS_PREF + '-ctn-html';
	const STYLE_STR$9 = `
	.${DLG_CLS_PREF} {border:none; margin:auto !important; padding:0 !important; /** 原生浏览器有1em内边距 **/ border-radius:var(${Theme.CssVar.PANEL_RADIUS}); overflow:auto; min-width:1em; box-sizing:border-box; background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); color:var(${Theme.CssVar.COLOR});}
	.${DLG_CLS_PREF} {position:fixed;inset-block-start: 0px;inset-block-end: 0px;}
	.${DLG_CLS_PREF}:focus {outline:none}
	.${DLG_CLS_PREF}[data-transparent] {background-color:transparent !important; box-shadow:none !important}
	.${DLG_CLS_PREF} .${DLG_CLS_TI} {box-sizing:border-box; line-height:1; padding:0.75em 2.5em 0.75em 0.75em; font-weight:normal;color:var(${Theme.CssVar.CSS_LIGHTEN})}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON_ZONE} {position:absolute; right:0; top:0; display:flex; gap:0.5em; }
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON} {display:flex; align-items:center; justify-content: center; line-height:1; width:2.25em; height:2.5em; overflow:hidden; opacity:0.6; cursor:pointer; box-sizing:border-box}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON}:after {content:""; font-size:0.9em; font-family:${Theme.IconFont}; line-height:1; display:block;}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_BUTTON}:hover {opacity:1;}
	
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_CLOSE}:after {content:"\\e61a"}
	.${DLG_CLS_PREF} .${DLG_CLS_TOP_SCREEN_TOGGLE}:after {content:"\\e629"; font-size:1.4em;}
	 
	.${DLG_CLS_PREF} .${DLG_CLS_CTN} {overflow-y:auto; max-height:calc(100vh - 5em)}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}:focus {outline:none !important;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} {padding:.75em; text-align:right;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} [role="button"]:first-child {margin-left:0;}
	.${DLG_CLS_PREF} .${DLG_CLS_OP} [role="button"] {margin-left:0.5em;}
	.${DLG_CLS_PREF}.full-dialog .${DLG_CLS_CTN} {max-height:calc(100vh - 100px); overflow-y:auto}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] {box-shadow:1px 1px 60px 1px #44444457}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_ACTIVE}"] .${DLG_CLS_TI} {color:#333}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"]:before {content:""; left:0; top:0; position:absolute; width:100%; height:100%;}
	.${DLG_CLS_PREF}[data-dialog-state="${STATE_DISABLED}"] * {opacity:0.85 !important; user-select:none;}
	
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_CTN} {padding:1.5em 1.5em 1em 1.5em; min-height:40px; word-wrap:break-word}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_CONFIRM}"] .${DLG_CLS_PREF}-confirm-ti {font-size:1.2em; margin-bottom:.75em;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} {padding:2em 2em 1em 2em}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} label {font-size:1.1em; margin-bottom:.75em; display:block;}
	.${DLG_CLS_PREF}[${DIALOG_TYPE_ATTR_KEY}="${TYPE_PROMPT}"] .${DLG_CLS_CTN} input[type=text] {width:100%; box-sizing:border-box;}
	
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}-iframe {padding:0 !important; max-height:inherit}
	.${DLG_CLS_PREF} .${DLG_CLS_CTN}-iframe iframe {width:100%; display:block; border:none; min-height:30px; max-height:calc(100vh - 5em)}
	.${DLG_CLS_PREF}::backdrop {backdrop-filter:brightness(0.65)}
`;
	let _bind_esc_ = false;
	const bindGlobalEsc = () => {
		if(_bind_esc_){
			return;
		}
		_bind_esc_ = true;
		document.addEventListener('keydown', e => {
			if(e.key === KEYBOARD_KEY_MAP.Escape){
				let current = DialogManager.getFrontDialog();
				if(current && current.config.showTopCloseButton){
					DialogManager.close(current);
					e.stopImmediatePropagation();
				}
			}
		});
	};
	let DIALOG_COLLECTION = [];
	const sortZIndex = (dialog1, dialog2) => {
		return dialog1.zIndex - dialog2.zIndex;
	};
	const getModalDialogs = (excludedDialog = null) => {
		let list = DIALOG_COLLECTION.filter(d => {
			return d.state !== STATE_HIDDEN && d.config.modal && (!excludedDialog || d !== excludedDialog);
		});
		return list.sort(sortZIndex);
	};
	const getNoModalDialogs = (excludedDialog = null) => {
		let list = DIALOG_COLLECTION.filter(d => {
			return d.state !== STATE_HIDDEN && !d.config.modal && (!excludedDialog || d !== excludedDialog);
		});
		return list.sort(sortZIndex);
	};
	const getAllAvailableDialogs = (excludedDialog = null) => {
		let modalDialogs = getModalDialogs(excludedDialog);
		let noModalDialogs = getNoModalDialogs(excludedDialog);
		return noModalDialogs.concat(modalDialogs);
	};
	const setState$1 = (dlg, toState) => {
		dlg.state = toState;
		dlg.dom.setAttribute('data-dialog-state', toState);
		dlg.dom[toState === STATE_HIDDEN ? 'hide' : (dlg.config.modal ? 'showModal' : 'show')]();
	};
	const setZIndex = (dlg, zIndex) => {
		dlg.zIndex = dlg.dom.style.zIndex = String(zIndex);
	};
	const setType = (dlg, type) => {
		dlg.dom.setAttribute('data-dialog-type', type);
	};
	const resolveContentType = (content) => {
		if(typeof (content) === 'object' && content.src){
			return DLG_CTN_TYPE_IFRAME;
		}
		return DLG_CTN_TYPE_HTML;
	};
	const domConstruct = (dlg) => {
		let html = `
		<dialog 
			class="${DLG_CLS_PREF} ${dlg.config.cssClass || ''}" 
			id="${dlg.id}" 
			data-dialog-type="${TYPE_NORMAL}"
			${dlg.config.transparent ? 'data-transparent' : ''}
			${dlg.state === STATE_HIDDEN ? '' : 'open'} 
			style="${dlg.config.width ? 'width:' + dimension2Style(dlg.config.width) : ''}">
		${dlg.config.title ? `<div class="${DLG_CLS_TI}">${dlg.config.title}</div>` : ''}
	`;
		html += `<div class="${DLG_CLS_CTN} ${resolveContentType(dlg.config.content)}" 
			style="min-height: ${dimension2Style(Dialog.CONTENT_MIN_HEIGHT)}; ${dlg.config.height ? 'height:' + dimension2Style(dlg.config.height) + ';' : ''}" 
			tabindex="0">${renderContent(dlg)}</div>`;
		if(dlg.config.buttons.length){
			html += `<div class="${DLG_CLS_OP}">`;
			dlg.config.buttons.forEach(button => {
				if(!button.callback && !button.ariaLabel){
					button.ariaLabel = 'Close';
				}
				html += `<input type="button" class="${button.className || ''}" 
				${button.default ? 'autofocus' : ''} 
				tabindex="0" 
				role="button"
				${button.ariaLabel ? 'aria-label="' + button.ariaLabel + '"' : ''}
				value="${escapeAttr(button.title)}">`;
			});
			html += '</div>';
		}
		html += `<div class="${DLG_CLS_TOP_BUTTON_ZONE}">` +
			(dlg.config.showTopFullscreenToggleButton ? `<span class="${DLG_CLS_TOP_BUTTON} ${DLG_CLS_TOP_SCREEN_TOGGLE}" title="切换全屏" tabindex="0"></span>` : '') +
			(dlg.config.showTopCloseButton ? `<span class="${DLG_CLS_TOP_BUTTON} ${DLG_CLS_TOP_CLOSE}" title="关闭" tabindex="0"></span>` : '') +
			'</div>';
		html += `</dialog>`;
		dlg.dom = createDomByHtml(html, document.body);
		if(resolveContentType(dlg.config.content) === DLG_CTN_TYPE_IFRAME){
			let iframe = dlg.dom.querySelector('iframe');
			if(dlg.config.height){
				iframe.style.height = '100%';
			}else {
				bindIframeAutoResize(iframe);
			}
			dlg.onClose.listen(() => {
				try{
					let win = iframe.contentWindow;
					if(win.getWindowUnloadAlertList){
						let alert_list = win.getWindowUnloadAlertList(iframe);
						if(alert_list.length){
							let unload_alert = alert_list.join("\n");
							if(!window.confirm(unload_alert)){
								return false;
							}
							win.setWindowUnloadMessage('', iframe);
							return true;
						}
					}
				}catch(err){
					console.warn(err);
				}
			});
		}
	};
	const eventBind = (dlg) => {
		dlg.dom.addEventListener('mousedown', () => {
			dlg.state === STATE_ACTIVE && DialogManager.trySetFront(dlg);
		});
		dlg.dom.addEventListener('cancel', e => {
			e.preventDefault();
		});
		for(let i in dlg.config.buttons){
			let cb = dlg.config.buttons[i].callback || dlg.close;
			let btn = dlg.dom.querySelectorAll(`.${DLG_CLS_OP} [role="button"]`)[i];
			btn.addEventListener('click', cb.bind(dlg), false);
		}
		if(dlg.config.showTopCloseButton){
			let close_btn = dlg.dom.querySelector(`.${DLG_CLS_TOP_CLOSE}`);
			bindNodeActive(close_btn, dlg.close.bind(dlg));
			bindGlobalEsc();
		}
	};
	const renderContent = (dlg) => {
		switch(resolveContentType(dlg.config.content)){
			case DLG_CTN_TYPE_IFRAME:
				return `<iframe src="${dlg.config.content.src}" ${IFRAME_ID_ATTR_FLAG}="${dlg.id}"></iframe>`;
			case DLG_CTN_TYPE_HTML:
				return dlg.config.content;
			default:
				console.error('Content type error', dlg.config.content);
				throw 'Content type error';
		}
	};
	const getCurrentFrameDialog = () => {
		return new Promise((resolve, reject) => {
			if(!window.parent || !window.frameElement){
				reject('no in iframe');
				return;
			}
			if(!parent[COM_ID$4].DialogManager){
				reject('No dialog manager found.');
				return;
			}
			let id = window.frameElement.getAttribute(IFRAME_ID_ATTR_FLAG);
			if(!id){
				reject("ID no found in iframe element");
			}
			let dlg = parent[COM_ID$4].DialogManager.findById(id);
			if(dlg){
				resolve(dlg);
			}else {
				reject('no dlg find:' + id);
			}
		});
	};
	const DialogManager = {
		register(dlg){
			DIALOG_COLLECTION.push(dlg);
		},
		show(dlg){
			dlg.state = STATE_DISABLED;
			let modalDialogs = getModalDialogs(dlg);
			let noModalDialogs = getNoModalDialogs(dlg);
			if(dlg.config.modal){
				noModalDialogs.forEach(d => {
					setState$1(d, STATE_DISABLED);
				});
				modalDialogs.forEach(d => {
					setState$1(d, STATE_DISABLED);
				});
				setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + modalDialogs.length);
				setState$1(dlg, STATE_ACTIVE);
			}else {
				modalDialogs.forEach((d, idx) => {
					setZIndex(d, dlg.zIndex + idx + 1);
				});
				setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length);
				setState$1(dlg, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
			}
			dlg.onShow.fire();
		},
		close: (dlg, destroy = true) => {
			if(dlg.onClose.fire() === false){
				console.warn('dialog close cancel by onClose events');
				return false;
			}
			let modalDialogs = getModalDialogs(dlg);
			let noModalDialogs = getNoModalDialogs(dlg);
			modalDialogs.forEach((d, idx) => {
				setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + noModalDialogs.length + idx);
			});
			if(modalDialogs.length){
				setState$1(modalDialogs[modalDialogs.length - 1], STATE_ACTIVE);
			}
			noModalDialogs.forEach((d, idx) => {
				setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
				setState$1(d, modalDialogs.length ? STATE_DISABLED : STATE_ACTIVE);
			});
			if(destroy){
				DIALOG_COLLECTION = DIALOG_COLLECTION.filter(d => d !== dlg);
				remove(dlg.dom);
			}else {
				setState$1(dlg, STATE_HIDDEN);
			}
			getAllAvailableDialogs().length || dlg.dom.classList.remove(`${DLG_CLS_PREF}-masker`);
		},
		hide(dlg){
			return this.close(dlg, false);
		},
		getFrontDialog(){
			let dialogs = getAllAvailableDialogs();
			return dialogs[dialogs.length - 1];
		},
		trySetFront(dlg){
			let modalDialogs = getModalDialogs();
			let currentFrontDialog = this.getFrontDialog();
			if(currentFrontDialog === dlg){
				return true;
			}
			if(modalDialogs.length){
				return false;
			}
			let otherNoModalDialogs = getNoModalDialogs(dlg);
			otherNoModalDialogs.forEach((d, idx) => {
				setZIndex(d, Dialog.DIALOG_INIT_Z_INDEX + idx);
			});
			setZIndex(dlg, Dialog.DIALOG_INIT_Z_INDEX + otherNoModalDialogs.length);
		},
		closeAll(){
			DIALOG_COLLECTION.forEach(dlg => {
				remove(dlg.dom);
			});
			DIALOG_COLLECTION = [];
		},
		findById(id){
			return DIALOG_COLLECTION.find(dlg => {
				return dlg.id === id
			});
		}
	};
	const CUSTOM_EVENT_BUCKS = {
	};
	class Dialog {
		static CONTENT_MIN_HEIGHT = 30;
		static DEFAULT_WIDTH = 500;
		static DIALOG_INIT_Z_INDEX = Theme.DialogIndex;
		id = null;
		dom = null;
		state = STATE_HIDDEN;
		zIndex = Theme.DialogIndex;
		onClose = new BizEvent(true);
		onShow = new BizEvent(true);
		config = {
			title: '',
			content: '',
			cssClass: '',
			modal: true,
			transparent: false,
			width: Dialog.DEFAULT_WIDTH,
			height: null,
			buttons: [],
			showTopCloseButton: true,
			showTopFullscreenToggleButton: false,
		};
		constructor(config = {}){
			insertStyleSheet(STYLE_STR$9, COM_ID$4 + '-style');
			this.config = Object.assign(this.config, config);
			this.id = this.id || 'dialog-' + Math.random();
			domConstruct(this);
			eventBind(this);
			DialogManager.register(this);
		}
		setWidth(width){
			this.config.width = width;
			this.dom.style.width = dimension2Style(width);
		}
		setTitle(title){
			this.config.title = title;
			findOne('.' + DLG_CLS_TI, this.dom).innerText = title;
		}
		show(){
			DialogManager.show(this);
		}
		hide(){
			DialogManager.hide(this);
		}
		close(){
			DialogManager.close(this);
		}
		fireCustomEvent(event, ...args){
			if(CUSTOM_EVENT_BUCKS[this.id] && CUSTOM_EVENT_BUCKS[this.id][event]){
				CUSTOM_EVENT_BUCKS[this.id][event].fire(...args);
				return true;
			}
			return false;
		}
		listenCustomEvent(event, callback){
			if(CUSTOM_EVENT_BUCKS[this.id] === undefined){
				CUSTOM_EVENT_BUCKS[this.id] = {};
			}
			if(CUSTOM_EVENT_BUCKS[this.id][event] === undefined){
				CUSTOM_EVENT_BUCKS[this.id][event] = new BizEvent();
			}
			CUSTOM_EVENT_BUCKS[this.id][event].listen(callback);
		}
		static show(title, content, config){
			let p = new Dialog({title, content, ...config});
			p.show();
			return p;
		}
		static confirm(title, content, opt = {}){
			return new Promise((resolve, reject) => {
				let p = new Dialog({
					content: `<div class="${DLG_CLS_PREF}-confirm-ti">${title}</div>
						<div class="${DLG_CLS_PREF}-confirm-ctn">${content}</div>`,
					buttons: [
						{
							title: '确定', default: true, ariaLabel: ARIA_LABEL_CONFIRM, callback: () => {
								p.close();
								resolve();
							}
						},
						{
							title: '取消', ariaLabel: ARIA_LABEL_CLOSE, callback: () => {
								p.close();
								reject && reject();
							}
						}
					],
					width: 420,
					modal: true,
					showTopCloseButton: false,
					...opt
				});
				setType(p, TYPE_CONFIRM);
				p.show();
			});
		}
		static alert(title, content, opt = {}){
			return new Promise(resolve => {
				let p = new Dialog({
					content: `<div class="${DLG_CLS_PREF}-confirm-ti">${title}</div>
						<div class="${DLG_CLS_PREF}-confirm-ctn">${content}</div>`,
					buttons: [{
						title: '确定', default: true, ariaLabel: ARIA_LABEL_CONFIRM, callback: () => {
							p.close();
							resolve();
						}
					},],
					width: 420,
					modal: true,
					showTopCloseButton: false,
					...opt
				});
				setType(p, TYPE_CONFIRM);
				p.show();
			});
		}
		static iframe(title = null, iframeSrc, opt = {}){
			return Dialog.show(title, {src: iframeSrc}, opt);
		}
		static prompt(title, option = {initValue: ""}){
			return new Promise((resolve, reject) => {
				let input_id = guid(Theme.Namespace + '-prompt-input');
				let input = null;
				let p = new Dialog({
					content: `<label for="${input_id}">${title}</label><input type="text" id="${input_id}" value="${escapeAttr(option.initValue || '')}"/>`,
					buttons: [
						{
							title: '确定', default: true, ariaLabel: ARIA_LABEL_CONFIRM, callback: () => {
								if(resolve(input.value) === false){
									return false;
								}
								p.close();
							}
						},
						{title: '取消', ariaLabel: ARIA_LABEL_CLOSE}
					],
					width: 400,
					modal: true,
					showTopCloseButton: true,
					...option
				});
				input = p.dom.querySelector('input[type=text]');
				setType(p, TYPE_PROMPT);
				p.onClose.listen(reject);
				p.onShow.listen(() => {
					input.focus();
					input.addEventListener('keydown', e => {
						if(e.key === KEYBOARD_KEY_MAP.Enter){
							if(resolve(input.value) === false){
								return false;
							}
							p.close();
						}
					});
				});
				p.show();
			});
		}
	}
	if(!window[COM_ID$4]){
		window[COM_ID$4] = {};
	}
	window[COM_ID$4].Dialog = Dialog;
	window[COM_ID$4].DialogManager = DialogManager;
	let CONTEXT_WINDOW$1 = getContextWindow();
	let DialogClass = CONTEXT_WINDOW$1[COM_ID$4].Dialog || Dialog;
	let DialogManagerClass = CONTEXT_WINDOW$1[COM_ID$4].DialogManager || DialogManager;

	const copy = (text, show_msg = false) => {
		let txtNode = createDomByHtml('<textarea readonly="readonly">', document.body);
		txtNode.style.cssText = 'position:absolute; left:-9999px;';
		let y = window.pageYOffset || document.documentElement.scrollTop;
		txtNode.addEventListener('focus', function(){
			window.scrollTo(0, y);
		});
		txtNode.value = text;
		txtNode.select();
		try{
			let succeeded = document.execCommand('copy');
			show_msg && ToastClass.showSuccess(trans('内容已复制到剪贴板'));
			return succeeded;
		}catch(err){
			console.error(err);
			show_msg && DialogClass.prompt('复制失败，请手工复制', {initValue:text});
		} finally{
			remove(txtNode);
		}
		return false;
	};
	const copyFormatted = (html, silent = false) => {
		let container = createDomByHtml(`
		<div style="position:fixed; pointer-events:none; opacity:0;">${html}</div>
	`, document.body);
		let activeSheets = Array.prototype.slice.call(document.styleSheets)
			.filter(function(sheet){
				return !sheet.disabled;
			});
		window.getSelection().removeAllRanges();
		let range = document.createRange();
		range.selectNode(container);
		window.getSelection().addRange(range);
		document.execCommand('copy');
		for(let i = 0; i < activeSheets.length; i++){
			activeSheets[i].disabled = true;
		}
		document.execCommand('copy');
		for(let i = 0; i < activeSheets.length; i++){
			activeSheets[i].disabled = false;
		}
		document.body.removeChild(container);
		!silent && ToastClass.showSuccess(trans('复制成功'));
	};

	const bindFileDrop = (container, Option = {}) => {
		Option = Object.assign({
			onTrigger: () => {
			},
			onFile: (file) => {
				return true;
			},
			onFinish: (files) => {
			},
			onError: (err, file = null) => {
				ToastClass.showError(err);
			},
			dragOverClass: 'drag-over',
			accept: ''
		}, Option);
		container = findOne(container);
		const fileInput = findOne('input[type=file]', container);
		let accept = Option.accept;
		if(fileInput && fileInput.accept){
			accept += (accept ? ',' : '') + fileInput.accept;
		}
		const processFile = file => {
			if(accept && !fileAcceptMath(file.type, accept)){
				console.warn('request accept:', accept, file);
				Option.onError(`文件 <b>${file.name}</b> 不符合，已被忽略。`, file);
				return false;
			}
			return !!Option.onFile(file);
		};
		const handleTransferFiles = (files) => {
			let fs = [];
			Array.from(files).forEach(file => {
				file.fullPath = '/' + file.name;
				processFile(file) && fs.push(file);
			});
			Option.onFinish(fs);
		};
		const handleTransferItems = (transferItems) => {
			let total_item_length = 0;
			Array.from(transferItems).forEach(item => {
				total_item_length += item.kind === 'file';
			});
			let files = [];
			let find_cnt = 0;
			for(let i = 0; i < transferItems.length; i++){
				if(transferItems[i].kind !== 'file'){
					console.warn('item is not file', transferItems[i]);
					continue;
				}
				let item = transferItems[i].webkitGetAsEntry();
				if(item){
					traverseFileTree(item, file => {
						processFile(file) && files.push(file);
					}, () => {
						find_cnt++;
						if(find_cnt === total_item_length){
							Option.onFinish(files);
						}
					});
				}
				else {
					find_cnt++;
					let file = transferItems[i].getAsFile();
					if(file && processFile(file)){
						file.fullPath = '/' + file.name;
						files.push(file);
					}
					if(find_cnt === total_item_length){
						Option.onFinish(files);
					}
				}
			}
		};
		if(fileInput){
			fileInput.addEventListener('change', e => {
				Option.onTrigger();
				handleTransferFiles(e.target.files);
				fileInput.value = '';
			});
		}
		['dragenter', 'dragover'].forEach(ev => {
			container.addEventListener(ev, e => {
				Option.dragOverClass && container.classList.add(Option.dragOverClass);
				e.preventDefault();
				return false;
			}, false);
		});
		['dragleave', 'drop'].forEach(ev => {
			container.addEventListener(ev, e => {
				Option.dragOverClass && container.classList.remove(Option.dragOverClass);
				e.preventDefault();
				return false;
			}, false);
		});
		if(!container.getAttribute('tabindex')){
			container.setAttribute('tabindex', 0);
		}
		container.addEventListener('paste', e => {
			let transferItems = Array.from(e.clipboardData.items);
			if(!transferItems.length){
				return;
			}
			handleTransferItems(transferItems);
		});
		container.addEventListener('drop', event => {
			event.preventDefault();
			Option.onTrigger();
			handleTransferItems(event.dataTransfer.items);
		}, false);
	};
	const traverseFileTree = (item, itemCallback, totalCallback, path = '/') => {
		if(item.isFile){
			item.file(function(file){
				file.fullPath = path + file.name;
				itemCallback(file);
				totalCallback();
			});
			return;
		}
		if(item.isDirectory){
			let dirReader = item.createReader();
			dirReader.readEntries(function(entries){
				let fin_count = 0;
				let entry_count = entries.length;
				if(!entry_count){
					totalCallback();
					return;
				}
				for(let i = 0; i < entry_count; i++){
					traverseFileTree(entries[i], itemCallback, () => {
						fin_count++;
						if(fin_count === entry_count){
							totalCallback();
						}
					}, path + item.name + "/");
				}
			});
			return;
		}
		console.warn('err', item);
		totalCallback();
	};

	const json_decode = (v) => {
		return v === null ? null : JSON.parse(v);
	};
	const json_encode = (v) => {
		return JSON.stringify(v);
	};
	let callbacks = [];
	const handler_callbacks = (key, newVal, oldVal)=>{
		callbacks.forEach(cb=>{cb(key, newVal, oldVal);});
	};
	let ls_listen_flag = false;
	class LocalStorageSetting {
		namespace = '';
		settingKeys = [];
		constructor(defaultSetting, namespace = ''){
			this.namespace = namespace;
			this.settingKeys = Object.keys(defaultSetting);
			for(let key in defaultSetting){
				let v = this.get(key);
				if(v === null){
					this.set(key, defaultSetting[key]);
				}
			}
		}
		get(key){
			let v = localStorage.getItem(this.namespace+key);
			if(v === null){
				return null;
			}
			return json_decode(v);
		}
		set(key, value){
			handler_callbacks(key, value, this.get(key));
			localStorage.setItem(this.namespace+key, json_encode(value));
		}
		remove(key){
			handler_callbacks(key, null, this.get(key));
			localStorage.removeItem(this.namespace+key);
		}
		onUpdated(callback){
			callbacks.push(callback);
			if(!ls_listen_flag){
				ls_listen_flag = true;
				window.addEventListener('storage', e => {
					if(!this.namespace || e.key.indexOf(this.namespace) === 0){
						handler_callbacks(e.key.substring(this.namespace.length), json_decode(e.newValue), json_decode(e.oldValue));
					}
				});
			}
		}
		each(payload){
			this.settingKeys.forEach(k=>{
				payload(k, this.get(k));
			});
		}
		removeAll(){
			this.settingKeys.forEach(k=>{
				this.remove(k);
			});
		}
		getAll(){
			let obj = {};
			this.settingKeys.forEach(k=>{
				obj[k] = this.get(k);
			});
			return obj;
		}
	}

	const COM_ID$3 = Theme.Namespace + 'com-image-viewer';
	const CONTEXT_WINDOW = getContextWindow();
	if(!CONTEXT_WINDOW[COM_ID$3]){
		CONTEXT_WINDOW[COM_ID$3] = {};
	}
	const DOM_CLASS = COM_ID$3;
	const DEFAULT_VIEW_PADDING = 20;
	const MAX_ZOOM_IN_RATIO = 2;
	const MIN_ZOOM_OUT_SIZE = 50;
	const THUMB_SIZE = 56+4;
	const ZOOM_IN_RATIO = 0.8;
	const ZOOM_OUT_RATIO = 1.2;
	const NAV_MAX_WIDTH = 'min(calc(100vw - 200px), 600px)';
	const ATTR_W_BIND_KEY = 'data-original-width';
	const ATTR_H_BIND_KEY = 'data-original-height';
	const DISABLED_ATTR_KEY = 'data-disabled';
	const GRID_IMG_BG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAABlBMVEXv7+////9mUzfqAAAAFElEQVQIW2NksN/ISAz+f9CBGAwAxtEddZlnB4IAAAAASUVORK5CYII=';
	const BASE_INDEX = Theme.FullScreenModeIndex;
	const OP_INDEX = BASE_INDEX + 1;
	const OPTION_DLG_INDEX = BASE_INDEX + 2;
	const IMG_PREVIEW_MODE_SINGLE = 1;
	const IMG_PREVIEW_MODE_MULTIPLE = 2;
	const IMG_PREVIEW_MS_SCROLL_TYPE_NONE = 0;
	const IMG_PREVIEW_MS_SCROLL_TYPE_SCALE = 1;
	const IMG_PREVIEW_MS_SCROLL_TYPE_NAV = 2;
	let PREVIEW_DOM = null;
	let CURRENT_MODE = 0;
	const CMD_CLOSE = ['close', '关闭', () => {
		destroy();
	}];
	const CMD_NAV_TO = ['nav_to', '关闭', (target) => {
		navTo(target.getAttribute('data-dir') !== '1');
	}];
	const CMD_SWITCH_TO = ['switch_to', '关闭', (target) => {
		switchTo(target.getAttribute('data-index'));
	}];
	const CMD_THUMB_SCROLL_PREV = ['thumb_scroll_prev', '关闭', () => {
		thumbScroll(true);
	}];
	const CMD_THUMB_SCROLL_NEXT = ['thumb_scroll_next', '关闭', () => {
		thumbScroll(false);
	}];
	const CMD_ZOOM_OUT = ['zoom_out', '放大', () => {
		zoom(ZOOM_OUT_RATIO);
		return false
	}];
	const CMD_ZOOM_IN = ['zoom_in', '缩小', () => {
		zoom(ZOOM_IN_RATIO);
		return false
	}];
	const CMD_ZOOM_ORG = ['zoom_org', '原始比例', () => {
		zoom(null);
		return false
	}];
	const CMD_ROTATE_LEFT = ['rotate_left', '左旋90°', () => {
		rotate(-90);
		return false
	}];
	const CMD_ROTATE_RIGHT = ['rotate_right', '右旋90°', () => {
		rotate(90);
		return false
	}];
	const CMD_VIEW_ORG = ['view_org', '查看原图', () => {
		viewOriginal();
	}];
	const CMD_DOWNLOAD = ['download', '下载图片', () => {
		downloadFile(srcSetResolve(IMG_SRC_LIST[IMG_CURRENT_INDEX]).original);
	}];
	const CMD_OPTION = ['option', '选项', () => {
		showOptionDialog();
	}];
	let IMG_SRC_LIST = [];
	let IMG_CURRENT_INDEX = 0;
	const DEFAULT_SETTING = {
		mouse_scroll_type: IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
		allow_move: true,
		show_thumb_list: false,
		show_toolbar: true,
	};
	let LocalSetting = new LocalStorageSetting(DEFAULT_SETTING, Theme.Namespace + 'com-image-viewer/');
	const srcSetResolve = srcSet => {
		srcSet = typeof (srcSet) === 'string' ? [srcSet] : srcSet;
		return {
			thumb: srcSet[0],
			normal: srcSet[1] || srcSet[0],
			original: srcSet[2] || srcSet[1] || srcSet[0]
		};
	};
	const STYLE_STR$8 = `
	 @keyframes ${Theme.Namespace}spin{
		100%{transform:rotate(360deg);}
	}
	.${DOM_CLASS}{width:100vw;height:100vh; max-height:100vh !important; max-width:100vw !important; overflow:hidden; padding:0; margin:0; border:none; background-color:#fff0;}
	.${DOM_CLASS}::backdrop {backdrop-filter:brightness(0.65) blur(10px)}
	.${DOM_CLASS} .civ-closer{position:fixed; opacity:0.7; z-index:${OP_INDEX}; background-color:#cccccc87; color:white; right:20px; top:20px; border-radius:3px; cursor:pointer; font-size:0; line-height:1; padding:5px;}
	.${DOM_CLASS} .civ-closer:before{font-family:"${Theme.IconFont}", serif; content:"\\e61a"; font-size:20px;}
	.${DOM_CLASS} .civ-closer:hover{opacity:1}
	.${DOM_CLASS} .civ-nav-btn{padding:10px; z-index:${OP_INDEX}; transition:all 0.1s linear; border-radius:3px; opacity:0.8; color:white; background-color:#8d8d8d6e; position:fixed; top:calc(50% - 25px); cursor:pointer;}
	.${DOM_CLASS} .civ-nav-btn[disabled]{color:gray; cursor:default !important;}
	.${DOM_CLASS} .civ-nav-btn:not([disabled]):hover{opacity:1;}
	.${DOM_CLASS} .civ-nav-btn:before{font-family:"${Theme.IconFont}"; font-size:20px;}
	.${DOM_CLASS} .civ-prev{left:10px}
	.${DOM_CLASS} .civ-prev:before{content:"\\e6103"}
	.${DOM_CLASS} .civ-next{right:10px}
	.${DOM_CLASS} .civ-next:before{content:"\\e73b";}

	.${DOM_CLASS} .civ-view-option {position:fixed;display:flex;--opt-btn-size:1.8rem;background-color: #6f6f6f26;backdrop-filter:blur(4px);padding:0.25em 0.5em;left:50%;transform:translate(-50%, 0);z-index:${OP_INDEX};gap: 0.5em;border-radius:4px;}
	.${DOM_CLASS} .civ-opt-btn {cursor:pointer;flex:1;user-select:none;width: var(--opt-btn-size); line-height:1; height:var(--opt-btn-size);overflow: hidden; color: white;padding: 0.2em;border-radius: 4px;transition: all 0.1s linear;opacity: 0.7;}
	.${DOM_CLASS} .civ-opt-btn:before {font-family:"${Theme.IconFont}";font-size:var(--opt-btn-size);display: block;width: 100%;height: 100%;}
	.${DOM_CLASS} .civ-opt-btn:hover {background-color: #ffffff3b;opacity: 1;}
	
	.${DOM_CLASS}-icon:before {content:""; font-family:"${Theme.IconFont}"; font-style:normal;}
	.${DOM_CLASS}-icon-${CMD_ZOOM_OUT[0]}:before {content: "\\e898";}
	.${DOM_CLASS}-icon-${CMD_ZOOM_IN[0]}:before {content:"\\e683"} 
	.${DOM_CLASS}-icon-${CMD_ZOOM_ORG[0]}:before {content:"\\e64a"} 
	.${DOM_CLASS}-icon-${CMD_ROTATE_LEFT[0]}:before {content:"\\e7be"} 
	.${DOM_CLASS}-icon-${CMD_ROTATE_RIGHT[0]}:before {content:"\\e901"} 
	.${DOM_CLASS}-icon-${CMD_VIEW_ORG[0]}:before {content:"\\e7de"} 
	.${DOM_CLASS}-icon-${CMD_DOWNLOAD[0]}:before {content:"\\e839"} 
	.${DOM_CLASS}-icon-${CMD_OPTION[0]}:before {content:"\\e9cb";}

	.${DOM_CLASS} .civ-nav-wrap{position:fixed;opacity: 0.8;transition:all 0.1s linear;background-color: #ffffff26;bottom:10px;left:50%;transform:translate(-50%, 0);z-index:${OP_INDEX};display: flex; padding:0.5em 0.25em;max-width: ${NAV_MAX_WIDTH};min-width: 100px;border-radius: 5px;backdrop-filter: blur(4px);box-shadow: 1px 1px 30px #6666666b;}
	.${DOM_CLASS} .civ-nav-wrap:hover {opacity:1}
	.${DOM_CLASS} .civ-nav-list-wrap {overflow:hidden; scroll-behavior: smooth;}
	.${DOM_CLASS} .civ-nav-list-prev,
	.${DOM_CLASS} .civ-nav-list-next {color:white; flex: 1; min-width:25px;cursor: pointer;opacity: 0.5;line-height: 48px;transition: all 0.1s linear; display: flex; align-items: center;}
	.${DOM_CLASS} .civ-nav-list-prev:hover,
	.${DOM_CLASS} .civ-nav-list-next:hover {opacity:1}
	.${DOM_CLASS} .civ-nav-list-prev:before,
	.${DOM_CLASS} .civ-nav-list-next:before{font-family:"${Theme.IconFont}";font-size:18px;}
	.${DOM_CLASS} .civ-nav-list-prev {}
	.${DOM_CLASS} .civ-nav-list-next {right: -20px;}
	.${DOM_CLASS} .civ-nav-list-prev:before{content:"\\e6103"}
	.${DOM_CLASS} .civ-nav-list-next:before{content:"\\e73b";}
	
	.${DOM_CLASS} .civ-nav-list{height:${THUMB_SIZE}px; transition:margin 0.4s ease-out; display:flex}
	.${DOM_CLASS} .civ-nav-thumb{min-width:${THUMB_SIZE}px; height:100%; flex:1; transition:all 0.1s linear;overflow:hidden; box-sizing:border-box; cursor: pointer;}
	.${DOM_CLASS} .civ-nav-thumb img{border:4px solid transparent; border-radius:3px; width:${THUMB_SIZE}px; height:${THUMB_SIZE}px; object-fit:cover; opacity: 0.6; box-sizing:border-box;}
	.${DOM_CLASS} .civ-nav-thumb:hover img {border-color:#ffffff82;opacity:0.8;}
	.${DOM_CLASS} .civ-nav-thumb.active img {border-color:white;opacity: 1;}

	.${DOM_CLASS} .civ-ctn{height:100%; width:100%; position:absolute; top:0; left:0;}
	.${DOM_CLASS} .civ-error{margin-top:calc(50% - 60px);}
	.${DOM_CLASS} .civ-loading{--loading-size:50px; position:absolute; left:50%; top:50%; margin:calc(var(--loading-size) / 2) 0 0 calc(var(--loading-size) / 2)}
	.${DOM_CLASS} .civ-loading:before{content:"\\e635"; font-family:"${Theme.IconFont}" !important; animation:${Theme.Namespace}spin 3s infinite linear; font-size:var(--loading-size); color:#ffffff6e; display:block; width:var(--loading-size); height:var(--loading-size); line-height:var(--loading-size)}
	.${DOM_CLASS} .civ-img{height:100%; display:block; box-sizing:border-box; position:relative;}
	.${DOM_CLASS} .civ-img img{position:absolute; left:50%; top:50%; transition:width 0.1s, height 0.1s, transform 0.1s; transform:translate(-50%, -50%); box-shadow:1px 1px 20px #484848; background:url('${GRID_IMG_BG}')}

	.${DOM_CLASS}[data-ip-mode="1"] .civ-nav-btn,
	.${DOM_CLASS}[data-ip-mode="1"] .civ-nav-wrap{display:none;}

	.${DOM_CLASS}-option-list {padding: 1em 2em 2em;display: block;list-style: none;font-size:1rem;}
	.${DOM_CLASS}-option-list>li {margin-bottom: 1em;padding-left: 5em;}
	.${DOM_CLASS}-option-list>li:last-child {margin:0;}
	.${DOM_CLASS}-option-list>li>label:first-child {display:block;float: left;width: 5em;margin-left: -5em;user-select:none;}
	.${DOM_CLASS}-option-list>li>label:not(:first-child) {display:block;user-select:none;margin-bottom: 0.25em;}

	.${DOM_CLASS}-tools-menu {position:fixed;background: white;padding: 5px 0;min-width: 150px; border-radius: 4px;box-shadow: 1px 1px 10px #3e3e3e94;}
	.${DOM_CLASS}-tools-menu>li {padding: 0.45em 1em;}
	.${DOM_CLASS}-tools-menu>li:hover {background: #eee;cursor: pointer;user-select: none;}

	.${DOM_CLASS}[show_thumb_list="false"] .civ-nav-wrap,
	.${DOM_CLASS}[show_toolbar="false"] .civ-view-option {display:none;}
`;
	const destroy = () => {
		if(!PREVIEW_DOM){
			return false;
		}
		remove(PREVIEW_DOM);
		PREVIEW_DOM = null;
		window.removeEventListener('resize', onWinResize);
		document.removeEventListener('keydown', bindKeyDown);
		return true;
	};
	const updateNavState = () => {
		let prev = PREVIEW_DOM.querySelector('.civ-prev');
		let next = PREVIEW_DOM.querySelector('.civ-next');
		let total = IMG_SRC_LIST.length;
		if(IMG_CURRENT_INDEX === 0){
			prev.setAttribute(DISABLED_ATTR_KEY, '1');
		}else {
			prev.removeAttribute(DISABLED_ATTR_KEY);
		}
		if(IMG_CURRENT_INDEX === (total - 1)){
			next.setAttribute(DISABLED_ATTR_KEY, '1');
		}else {
			next.removeAttribute(DISABLED_ATTR_KEY);
		}
		PREVIEW_DOM.querySelectorAll(`.civ-nav-list .civ-nav-thumb`).forEach(item => item.classList.remove('active'));
		PREVIEW_DOM.querySelector(`.civ-nav-list .civ-nav-thumb[data-index="${IMG_CURRENT_INDEX}"]`).classList.add('active');
		thumbScrollIntoView();
	};
	const listenSelector = (parentNode, selector, event, handler) => {
		parentNode.querySelectorAll(selector).forEach(target => {
			target.addEventListener(event, handler);
		});
	};
	const scaleFixCenter = ({
		                        contentWidth,
		                        contentHeight,
		                        containerWidth,
		                        containerHeight,
		                        spacing = 0,
		                        zoomIn = false
	                        }) => {
		if(contentWidth <= containerWidth && contentHeight <= containerHeight && !zoomIn){
			return {
				width: contentWidth,
				height: contentHeight
			};
		}
		let ratioX = containerWidth / contentWidth;
		let ratioY = containerHeight / contentHeight;
		let ratio = Math.min(ratioX, ratioY);
		return {
			width: contentWidth * ratio - spacing * 2,
			height: contentHeight * ratio - spacing * 2
		};
	};
	const bindImgMove = (img) => {
		let moving = false;
		let lastOffset = {};
		img.addEventListener('mousedown', e => {
			if(LocalSetting.get('allow_move')){
				moving = true;
				lastOffset = {
					clientX: e.clientX,
					clientY: e.clientY,
					marginLeft: parseInt(img.style.marginLeft || 0, 10),
					marginTop: parseInt(img.style.marginTop || 0, 10)
				};
				e.preventDefault();
				return false;
			}
		});
		['mouseup', 'mouseout'].forEach(ev => {
			img.addEventListener(ev, e => {
				moving = false;
			});
		});
		img.addEventListener('mousemove', e => {
			if(moving && LocalSetting.get('allow_move')){
				img.style.marginLeft = dimension2Style(lastOffset.marginLeft + (e.clientX - lastOffset.clientX));
				img.style.marginTop = dimension2Style(lastOffset.marginTop + (e.clientY - lastOffset.clientY));
			}
		});
	};
	const showImgSrc = (img_index = 0) => {
		return new Promise((resolve, reject) => {
			let imgItem = srcSetResolve(IMG_SRC_LIST[img_index]);
			let loading = PREVIEW_DOM.querySelector('.civ-loading');
			let err = PREVIEW_DOM.querySelector('.civ-error');
			let img_ctn = PREVIEW_DOM.querySelector('.civ-img');
			img_ctn.innerHTML = '';
			show(loading);
			hide(err);
			loadImgBySrc(imgItem.normal).then(img => {
				setStyle(img, scaleFixCenter({
					contentWidth: img.width,
					contentHeight: img.height,
					containerWidth: img_ctn.offsetWidth,
					containerHeight: img_ctn.offsetHeight,
					spacing: DEFAULT_VIEW_PADDING
				}));
				hide(loading);
				img_ctn.innerHTML = '';
				img.setAttribute(ATTR_W_BIND_KEY, img.width);
				img.setAttribute(ATTR_H_BIND_KEY, img.height);
				bindImgMove(img);
				img_ctn.appendChild(img);
				resolve(img);
			}, error => {
				hide(loading);
				err.innerHTML = `图片加载失败，<a href="${imgItem.normal}" target="_blank">查看详情(${error})</a>`;
				show(err);
				reject(err);
			});
		});
	};
	const constructDom = () => {
		let nav_thumb_list_html = `
		<div class="civ-nav-wrap">
			<span class="civ-nav-list-prev" tabindex="0" data-cmd="${CMD_THUMB_SCROLL_PREV[0]}"></span>
			<div class="civ-nav-list-wrap">
				<div class="civ-nav-list">
				${IMG_SRC_LIST.reduce((preStr, item, idx) => {
			return preStr + `<span class="civ-nav-thumb" tabindex="0" data-cmd="${CMD_SWITCH_TO[0]}" data-index="${idx}"><img src="${srcSetResolve(item).thumb}"/></span>`;
		}, "")}
				</div>
			</div>
			<span class="civ-nav-list-next" tabindex="0" data-cmd="${CMD_THUMB_SCROLL_NEXT[0]}"></span>
		</div>`;
		let option_html = `
	<span class="civ-view-option">
		${TOOLBAR_OPTIONS.reduce((lastVal, cmdInfo, idx) => {
		return lastVal + `<span class="civ-opt-btn ${DOM_CLASS}-icon ${DOM_CLASS}-icon-${cmdInfo[0]}" tabindex="0" data-cmd="${cmdInfo[0]}" title="${cmdInfo[1]}"></span>`;
	}, "")}
	</span>`;
		PREVIEW_DOM = createDomByHtml(`
		<dialog class="${DOM_CLASS}" data-ip-mode="${CURRENT_MODE}">
			<span tabindex="0" class="civ-closer" data-cmd="${CMD_CLOSE[0]}" title="ESC to close">close</span>
			<span tabindex="0" class="civ-nav-btn civ-prev" data-cmd="${CMD_NAV_TO[0]}" data-dir="0"></span>
			<span tabindex="0" class="civ-nav-btn civ-next" data-cmd="${CMD_NAV_TO[0]}" data-dir="1"></span>
			${option_html}
			${nav_thumb_list_html}
			<div class="civ-ctn">
				<span class="civ-loading"></span>
				<span class="civ-error"></span>
				<span class="civ-img"></span>
			</div>
		</dialog>
	`, document.body);
		LocalSetting.each((k, v) => {
			PREVIEW_DOM.setAttribute(k, JSON.stringify(v));
		});
		LocalSetting.onUpdated((k, v) => {
			PREVIEW_DOM && PREVIEW_DOM.setAttribute(k, JSON.stringify(v));
		});
		findAll('[data-cmd]', PREVIEW_DOM).forEach(node=>{
			bindNodeActive(node, ()=>{
				let cmd = node.getAttribute('data-cmd');
				if(node.getAttribute(DISABLED_ATTR_KEY)){
					return false;
				}
				let cmdInfo = getCmdViaID(cmd);
				if(cmdInfo){
					return cmdInfo[2](node);
				}
				throw "no command found.";
			});
		});
		bindNodeActive(findOne('.civ-ctn', PREVIEW_DOM), e => {
			if(e && e.target.tagName !== 'IMG'){
				destroy();
			}
		});
		findOne('.civ-nav-wrap', PREVIEW_DOM).addEventListener('mousewheel', e=>{
			navTo(e.wheelDelta > 0);
			e.preventDefault();
			return false;
		});
		listenSelector(PREVIEW_DOM, '.civ-ctn', 'mousewheel', e => {
			switch(LocalSetting.get('mouse_scroll_type')){
				case IMG_PREVIEW_MS_SCROLL_TYPE_SCALE:
					zoom(e.wheelDelta > 0 ? ZOOM_OUT_RATIO : ZOOM_IN_RATIO);
					break;
				case IMG_PREVIEW_MS_SCROLL_TYPE_NAV:
					navTo(e.wheelDelta > 0);
					break;
			}
			e.preventDefault();
			return false;
		});
		PREVIEW_DOM.showModal();
		window.addEventListener('resize', onWinResize);
		PREVIEW_DOM.addEventListener('keydown', bindKeyDown);
	};
	const bindKeyDown = (e) => {
		if(e.key === KEYBOARD_KEY_MAP.ArrowLeft){
			e.stopPropagation();
			navTo(true);
		}
		if(e.key === KEYBOARD_KEY_MAP.ArrowRight){
			e.stopPropagation();
			navTo(false);
		}
		if(e.key === KEYBOARD_KEY_MAP.Escape){
			if(destroy()){
				e.stopPropagation();
			}
		}
	};
	let resize_tm = null;
	const onWinResize = () => {
		resize_tm && clearTimeout(resize_tm);
		resize_tm = setTimeout(() => {
			resetView();
		}, 50);
	};
	const resetView = () => {
		let img = PREVIEW_DOM.querySelector('.civ-img img');
		if(!img){
			return;
		}
		let container = PREVIEW_DOM.querySelector('.civ-img');
		setStyle(img, scaleFixCenter({
			contentWidth: img.getAttribute(ATTR_W_BIND_KEY),
			contentHeight: img.getAttribute(ATTR_H_BIND_KEY),
			containerWidth: container.offsetWidth,
			containerHeight: container.offsetHeight,
			spacing: DEFAULT_VIEW_PADDING
		}));
		setStyle(img, {marginLeft: 0, marginTop: 0});
	};
	const navTo = (toPrev = false) => {
		let total = IMG_SRC_LIST.length;
		if((toPrev && IMG_CURRENT_INDEX === 0) || (!toPrev && IMG_CURRENT_INDEX === (total - 1))){
			return false;
		}
		toPrev ? IMG_CURRENT_INDEX-- : IMG_CURRENT_INDEX++;
		showImgSrc(IMG_CURRENT_INDEX);
		updateNavState();
	};
	const switchTo = (index) => {
		IMG_CURRENT_INDEX = index;
		showImgSrc(IMG_CURRENT_INDEX);
		updateNavState();
	};
	const thumbScroll = (toPrev, offset = 200) => {
		let thumb_wrap = findOne('.civ-nav-list-wrap', PREVIEW_DOM);
		let thumb_list = findOne('.civ-nav-list', PREVIEW_DOM);
		let max_scroll_left = thumb_list.scrollWidth - thumb_wrap.offsetWidth;
		let scroll_left = thumb_wrap.scrollLeft + (toPrev ? -1 : 1) * offset;
		thumb_wrap.scrollLeft = Math.max(Math.min(scroll_left, max_scroll_left), 0);
	};
	const thumbScrollIntoView = ()=>{
		let current = findOne('.civ-nav-list .active', PREVIEW_DOM);
		current.scrollIntoView();
	};
	const zoom = (ratioOffset) => {
		let img = PREVIEW_DOM.querySelector('.civ-img img');
		let origin_width = img.getAttribute(ATTR_W_BIND_KEY);
		let origin_height = img.getAttribute(ATTR_H_BIND_KEY);
		if(ratioOffset === null){
			ratioOffset = 1;
			img.style.left = dimension2Style(parseInt(img.style.left, 10) * ratioOffset);
			img.style.top = dimension2Style(parseInt(img.style.top, 10) * ratioOffset);
			img.style.width = dimension2Style(parseInt(origin_width, 10) * ratioOffset);
			img.style.height = dimension2Style(parseInt(origin_height, 10) * ratioOffset);
			return;
		}
		let width = parseInt(img.style.width, 10) * ratioOffset;
		let height = parseInt(img.style.height, 10) * ratioOffset;
		if(ratioOffset > 1 && width > origin_width && ((width / origin_width) > MAX_ZOOM_IN_RATIO || (height / origin_height) > MAX_ZOOM_IN_RATIO)){
			console.warn('zoom in limited');
			return;
		}
		if(ratioOffset < 1 && width < origin_width && (width < MIN_ZOOM_OUT_SIZE || height < MIN_ZOOM_OUT_SIZE)){
			console.warn('zoom out limited');
			return;
		}
		img.style.left = dimension2Style(parseInt(img.style.left, 10) * ratioOffset);
		img.style.top = dimension2Style(parseInt(img.style.top, 10) * ratioOffset);
		img.style.width = dimension2Style(parseInt(img.style.width, 10) * ratioOffset);
		img.style.height = dimension2Style(parseInt(img.style.height, 10) * ratioOffset);
	};
	const rotate = (degreeOffset) => {
		let img = PREVIEW_DOM.querySelector('.civ-img img');
		let rotate = parseInt(img.getAttribute('data-rotate') || 0, 10);
		let newRotate = rotate + degreeOffset;
		img.setAttribute('data-rotate', newRotate);
		img.style.transform = `translate(-50%, -50%) rotate(${newRotate}deg)`;
	};
	const viewOriginal = () => {
		window.open(srcSetResolve(IMG_SRC_LIST[IMG_CURRENT_INDEX]).original);
	};
	const showOptionDialog = () => {
		let html = `
<ul class="${DOM_CLASS}-option-list">
	<li>
		<label>界面：</label>
		<label style="display:none" title="该选项不启用，操作不闭环">
			<input type="checkbox" name="show_toolbar" value="1">显示顶部操作栏
		</label>
		<label>
			<input type="checkbox" name="show_thumb_list" value="1">显示底部缩略图列表（多图模式）
		</label>
	</li>	
	<li>
		<label>鼠标滚轮：</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_NAV}">切换前一张、后一张图片</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_SCALE}">缩放图片</label>
		<label><input type="radio" name="mouse_scroll_type" value="${IMG_PREVIEW_MS_SCROLL_TYPE_NONE}">无动作</label>
	</li>
	<li>
		<label>移动：</label>
		<label><input type="checkbox" name="allow_move" value="1">允许移动图片</label>
	</li>
</ul>
	`;
		let dlg = DialogClass.show('设置', html, {
			modal: true
		});
		dlg.dom.style.zIndex = OPTION_DLG_INDEX + "";
		let lsSetterTip = null;
		formSync(dlg.dom, (name) => {
			return new Promise((resolve, reject) => {
				let tmp = convertObjectToFormData({[name]: LocalSetting.get(name)});
				resolve(tmp[name]);
			});
		}, (name, value) => {
			return new Promise((resolve, reject) => {
				let obj = convertFormDataToObject({[name]: value}, DEFAULT_SETTING);
				LocalSetting.set(name, obj[name]);
				lsSetterTip && lsSetterTip.hide();
				lsSetterTip = ToastClass.showSuccess('设置已保存');
				resolve();
			});
		});
	};
	const ALL_COMMANDS = [
		CMD_CLOSE,
		CMD_NAV_TO,
		CMD_SWITCH_TO,
		CMD_THUMB_SCROLL_PREV,
		CMD_THUMB_SCROLL_NEXT,
		CMD_ZOOM_OUT,
		CMD_ZOOM_IN,
		CMD_ZOOM_ORG,
		CMD_ROTATE_LEFT,
		CMD_ROTATE_RIGHT,
		CMD_VIEW_ORG,
		CMD_DOWNLOAD,
		CMD_OPTION,
	];
	const TOOLBAR_OPTIONS = [
		CMD_ZOOM_OUT,
		CMD_ZOOM_IN,
		CMD_ZOOM_ORG,
		CMD_ROTATE_LEFT,
		CMD_ROTATE_RIGHT,
		CMD_VIEW_ORG,
		CMD_OPTION
	];
	const getCmdViaID = (id) => {
		for(let k in ALL_COMMANDS){
			let [_id] = ALL_COMMANDS[k];
			if(id === _id){
				return ALL_COMMANDS[k];
			}
		}
		return null;
	};
	const init = ({
		              mode,
		              srcList,
		              mouse_scroll_type = IMG_PREVIEW_MS_SCROLL_TYPE_NAV,
		              startIndex = 0,
		              showContextMenu = null,
		              showToolbar = null,
		              showThumbList = null,
		              preloadSrcList = null,
	              }) => {
		insertStyleSheet(STYLE_STR$8, Theme.Namespace + 'img-preview-style');
		destroy();
		CURRENT_MODE = mode;
		IMG_SRC_LIST = srcList;
		IMG_CURRENT_INDEX = startIndex;
		mouse_scroll_type !== null && LocalSetting.set('mouse_scroll_type', mouse_scroll_type);
		showThumbList !== null && LocalSetting.set('show_thumb_list', showThumbList);
		showToolbar !== null && LocalSetting.set('show_toolbar', showToolbar);
		constructDom();
		showImgSrc(IMG_CURRENT_INDEX).finally(() => {
			if(preloadSrcList){
				srcList.forEach(src => {
					new Image().src = src;
				});
			}
		});
		if(mode === IMG_PREVIEW_MODE_MULTIPLE){
			setTimeout(updateNavState, 100);
		}
	};
	const showImgPreview = CONTEXT_WINDOW[COM_ID$3]['showImgPreview'] || function(imgSrc, option = {}){
		init({mode: IMG_PREVIEW_MODE_SINGLE, srcList: [imgSrc], ...option});
	};
	const showImgListPreview = CONTEXT_WINDOW[COM_ID$3]['showImgListPreview'] || function(imgSrcList, startIndex = 0, option = {}){
		init({mode: IMG_PREVIEW_MODE_MULTIPLE, srcList: imgSrcList, startIndex, ...option});
	};
	const bindImgPreviewViaSelector = (nodeSelector = 'img', triggerEvent = 'click', srcFetcher = 'src', option = {}) => {
		let nodes = findAll(nodeSelector);
		let imgSrcList = [];
		if(!nodes.length){
			console.warn('no images found');
			return;
		}
		nodes.forEach((node, idx) => {
			switch(typeof (srcFetcher)){
				case 'function':
					imgSrcList.push(srcFetcher(node));
					break;
				case 'string':
					imgSrcList.push(node.getAttribute(srcFetcher));
					break;
				default:
					throw "No support srcFetcher types:" + typeof (srcFetcher);
			}
			node.addEventListener(triggerEvent, e => {
				if(nodes.length > 1){
					showImgListPreview(imgSrcList, idx, option);
				}else {
					showImgPreview(imgSrcList[0], option);
				}
			});
		});
	};
	window[COM_ID$3] = {
		showImgPreview,
		showImgListPreview,
		bindImgPreviewViaSelector,
	};
	let showImgPreviewFn = CONTEXT_WINDOW[COM_ID$3]['showImgPreview'] || showImgPreview;
	let showImgListPreviewFn = CONTEXT_WINDOW[COM_ID$3]['showImgListPreview'] || showImgListPreview;

	let default_masker = null;
	let CSS_CLASS = Theme.Namespace + '-masker';
	const showMasker = (masker) => {
		if(!masker){
			insertStyleSheet(`
			.${CSS_CLASS} {
				position:fixed;
				top:0;left:0;
				right:0;
				bottom:0;
				background:var(${Theme.CssVar.FULL_SCREEN_BACKGROUND_COLOR});
				backdrop-filter:var(${Theme.CssVar.FULL_SCREEN_BACKDROP_FILTER});
				z-index:${Masker.zIndex}}
			`, Theme.Namespace + 'masker-style');
			masker = createDomByHtml(`<div class="${CSS_CLASS}"></div>`, document.body);
		}
		masker.style.display = '';
		return masker;
	};
	const hideMasker = (masker) => {
		masker && (masker.style.display = 'none');
	};
	const Masker = {
		zIndex: Theme.MaskIndex,
		show: () => {
			default_masker = showMasker(default_masker);
		},
		hide: () => {
			hideMasker(default_masker);
		},
		instance: () => {
			let new_masker;
			return {
				show: () => {
					new_masker = showMasker(new_masker);
				},
				hide: () => {
					hideMasker(new_masker);
				}
			}
		}
	};

	let CTX_CLASS_PREFIX = Theme.Namespace + 'context-menu';
	let CTX_Z_INDEX = Theme.ContextIndex;
	const STYLE_STR$7 = `
	.${CTX_CLASS_PREFIX} {z-index:${CTX_Z_INDEX}; position:fixed;}
	.${CTX_CLASS_PREFIX},
	.${CTX_CLASS_PREFIX} ul {position:absolute; padding: 0.5em 0; max-height:20em; overflow:auto; list-style:none; backdrop-filter:var(${Theme.CssVar.FULL_SCREEN_BACKDROP_FILTER}); box-shadow:var(${Theme.CssVar.PANEL_SHADOW});border-radius:var(${Theme.CssVar.PANEL_RADIUS});background:var(${Theme.CssVar.BACKGROUND_COLOR});min-width:12em; display:none;}
	.${CTX_CLASS_PREFIX} ul {left:100%; top:0;}
	.${CTX_CLASS_PREFIX} li:not([disabled]):hover>ul {display:block;}
	.${CTX_CLASS_PREFIX} li[role=menuitem] {padding:0 1em; line-height:1; position:relative; min-height:2em; display:flex; align-items:center; background: transparent;user-select:none;opacity: 0.5; cursor:default;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]>* {flex:1; line-height:1}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]) {cursor:pointer; opacity:1;}
	.${CTX_CLASS_PREFIX} li[role=menuitem]:not([disabled]):hover {background-color: #eeeeee9c;text-shadow: 1px 1px 1px white;opacity: 1;}
	.${CTX_CLASS_PREFIX} li[data-has-child]:after {content:"\\e73b"; font-family:${Theme.IconFont}; zoom:0.7; position:absolute; right:0.5em; color:var(${Theme.CssVar.DISABLE_COLOR});}
	.${CTX_CLASS_PREFIX} li[data-has-child]:not([disabled]):hover:after {color:var(${Theme.CssVar.COLOR})}
	.${CTX_CLASS_PREFIX} .sep {margin:0.25em 0.5em;border-bottom:1px solid #eee;}
	.${CTX_CLASS_PREFIX} .caption {padding-left: 1em;opacity: 0.7;user-select: none;display:flex;align-items: center;}
	.${CTX_CLASS_PREFIX} .caption:after {content:"";flex:1;border-bottom: 1px solid #ccc;margin: 0 0.5em;padding-top: 3px;}
	.${CTX_CLASS_PREFIX} li i {--size:1.2em; display:block; width:var(--size); height:var(--size); max-width:var(--size); margin-right:0.5em;} /** icon **/
	.${CTX_CLASS_PREFIX} li i:before {font-size:var(--size)}
`;
	const createMenu = (commands, onExecute = null) => {
		insertStyleSheet(STYLE_STR$7, Theme.Namespace+'context-menu-style');
		bindGlobalEvent();
		let html = `<ul class="${CTX_CLASS_PREFIX}">`;
		let payload_map = {};
		let buildMenuItemHtml = (item) => {
			let html = '';
			if(item === '-'){
				html += '<li class="sep"></li>';
				return html;
			}
			let [title, cmdOrChildren, disabled] = item;
			let has_child = Array.isArray(cmdOrChildren);
			let mnu_item_id = guid();
			let sub_menu_html = '';
			if(has_child){
				sub_menu_html = '<ul>';
				cmdOrChildren.forEach(subItem => {
					sub_menu_html += buildMenuItemHtml(subItem);
				});
				sub_menu_html += '</ul>';
			}else {
				payload_map[mnu_item_id] = cmdOrChildren;
			}
			html += `<li role="menuitem" data-id="${mnu_item_id}" ${has_child ? ' data-has-child ' : ''} ${disabled ? 'disabled="disabled"' : 'tabindex="0"'}>${title}${sub_menu_html}</li>`;
			return html;
		};
		for(let i = 0; i < commands.length; i++){
			let item = commands[i];
			html += buildMenuItemHtml(item);
		}
		html += '</ul>';
		let menu = createDomByHtml(html, document.body);
		let items = menu.querySelectorAll('[role=menuitem]:not([disabled])');
		items.forEach(function(item){
			let id = item.getAttribute('data-id');
			let payload = payload_map[id];
			if(payload){
				item.addEventListener('click', () => {
					payload();
					onExecute && onExecute(item);
				});
			}
		});
		let sub_menus = menu.querySelectorAll('ul');
		sub_menus.forEach(function(sub_menu){
			let parent_item = sub_menu.parentNode;
			parent_item.addEventListener('mouseover', e => {
				let pos = alignSubMenuByNode(sub_menu, parent_item);
				sub_menu.style.left = dimension2Style(pos.left);
				sub_menu.style.top = dimension2Style(pos.top);
			});
		});
		return menu;
	};
	let LAST_MENU;
	const hideLastMenu = () => {
		remove(LAST_MENU);
		LAST_MENU = null;
	};
	const bindTargetContextMenu = (target, commands, option = {}) => {
		option.triggerType = 'contextmenu';
		return bindTargetMenu(target, commands, option);
	};
	const bindTargetClickMenu = (target, commands, option = {}) => {
		option.triggerType = 'click';
		return bindTargetMenu(target, commands, option);
	};
	const showContextMenu = (commands, position) => {
		hideLastMenu();
		let menuEl = createMenu(commands);
		LAST_MENU = menuEl;
		let pos = calcMenuByPosition(menuEl, {left: position.left, top: position.top});
		menuEl.style.left = dimension2Style(pos.left);
		menuEl.style.top = dimension2Style(pos.top);
		menuEl.style.display = 'block';
	};
	const bindTargetMenu = (target, commands, option = null) => {
		let triggerType = option?.triggerType || 'click';
		triggerType = triggerType.toLowerCase();
		let menuEl;
		const MOUSE_OUT_DELAY = 200;
		let out_timer = null;
		if(triggerType === 'mouseover'){
			target.addEventListener('mouseover', () => {
				out_timer && clearTimeout(out_timer);
			});
			target.addEventListener('mouseout', () => {
				out_timer = setTimeout(() => {
					menuEl.style.display = 'none';
				}, MOUSE_OUT_DELAY);
			});
		}
		target.addEventListener(triggerType, e => {
			hideLastMenu();
			menuEl = createMenu(commands);
			if(triggerType === 'mouseover'){
				menuEl.addEventListener('mouseover', () => {
					out_timer && clearTimeout(out_timer);
				});
				menuEl.addEventListener('mouseout', () => {
					out_timer = setTimeout(() => {
						menuEl.style.display = 'none';
					}, MOUSE_OUT_DELAY);
				});
			}
			LAST_MENU = menuEl;
			let pos;
			if(triggerType === 'contextmenu'){
				pos = calcMenuByPosition(menuEl, {left: e.clientX, top: e.clientY});
			}else {
				pos = alignMenuByNode(menuEl, target);
			}
			menuEl.style.left = dimension2Style(pos.left);
			menuEl.style.top = dimension2Style(pos.top);
			menuEl.style.display = 'block';
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	};
	const calcMenuByPosition = (menuEl, point) => {
		let menu_dim = getDomDimension(menuEl);
		let con_dim = {width: window.innerWidth, height: window.innerHeight};
		let top, left = point.left;
		let right_available = menu_dim.width + point.left <= con_dim.width;
		let bottom_available = menu_dim.height + point.top <= con_dim.height;
		let top_available = point.top - menu_dim.height > 0;
		if(right_available && bottom_available){
			left = point.left;
			top = point.top;
		}else if(right_available && !bottom_available){
			left = point.left;
			top = Math.max(con_dim.height - menu_dim.height, 0);
		}else if(!right_available && bottom_available){
			left = Math.max(con_dim.width - menu_dim.width, 0);
			top = point.top;
		}else if(!right_available && !bottom_available){
			if(top_available){
				left = Math.max(con_dim.width - menu_dim.width, 0);
				top = point.top - menu_dim.height;
			}else {
				left = Math.max(con_dim.width - menu_dim.width, 0);
				top = point.top;
			}
		}
		return {top, left};
	};
	const alignMenuByNode = (menuEl, relateNode) => {
		let top, left;
		let menu_dim = getDomDimension(menuEl);
		let relate_node_offset = relateNode.getBoundingClientRect();
		let con_dim = {width: window.innerWidth, height: window.innerHeight};
		if((con_dim.height - relate_node_offset.top) > menu_dim.height && (con_dim.height - relate_node_offset.top - relate_node_offset.height) < menu_dim.height){
			top = relate_node_offset.top - menu_dim.height;
		}else {
			top = relate_node_offset.top + relate_node_offset.height;
		}
		if((relate_node_offset.left + relate_node_offset.width) > menu_dim.width && (con_dim.width - relate_node_offset.left) < menu_dim.width){
			left = relate_node_offset.left + relate_node_offset.width - menu_dim.width;
		}else {
			left = relate_node_offset.left;
		}
		return {top, left};
	};
	const alignSubMenuByNode = (subMenuEl, triggerMenuItem) => {
		let menu_dim = getDomDimension(subMenuEl);
		let relate_node_offset = triggerMenuItem.getBoundingClientRect();
		let con_dim = {width: window.innerWidth, height: window.innerHeight};
		let top;
		let left;
		if((relate_node_offset.top + menu_dim.height > con_dim.height) && con_dim.height >= menu_dim.height){
			top = con_dim.height - (relate_node_offset.top + menu_dim.height);
		}else {
			top = 0;
		}
		if(relate_node_offset.left > menu_dim.width && (relate_node_offset.left + relate_node_offset.width + menu_dim.width > con_dim.width)){
			left = 0 - menu_dim.width;
		}else {
			left = relate_node_offset.width;
		}
		return {top, left};
	};
	let _global_event_bind_ = false;
	const bindGlobalEvent = () => {
		if(_global_event_bind_){
			return;
		}
		_global_event_bind_ = true;
		document.addEventListener('click', e => {
			hideLastMenu();
		});
		document.addEventListener('keyup', e => {
			if(e.key === KEYBOARD_KEY_MAP.Escape){
				hideLastMenu();
			}
		});
	};

	const GUID_BIND_KEY = Theme.Namespace+'-tip-guid';
	const NS$6 = Theme.Namespace + 'tip';
	const DEFAULT_DIR = 11;
	const TRY_DIR_MAP = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let TIP_COLLECTION = {};
	const STYLE_STR$6 = `
	.${NS$6}-container-wrap {position:absolute; filter:drop-shadow(var(${Theme.CssVar.PANEL_SHADOW})); --tip-arrow-size:10px; --tip-gap:calc(var(--tip-arrow-size) * 0.7071067811865476); --tip-mgr:calc(var(--tip-gap) - var(--tip-arrow-size) / 2); color:var(${Theme.CssVar.COLOR}); z-index:${Theme.TipIndex};}
	.${NS$6}-arrow {display:block; background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); clip-path:polygon(0% 0%, 100% 100%, 0% 100%); width:var(--tip-arrow-size); height:var(--tip-arrow-size); position:absolute; z-index:1}
	.${NS$6}-close {display:block; overflow:hidden; width:15px; height:20px; position:absolute; right:7px; top:10px; text-align:center; cursor:pointer; font-size:13px; opacity:.5}
	.${NS$6}-close:hover {opacity:1}
	.${NS$6}-content {border-radius:var(${Theme.CssVar.PANEL_RADIUS}); background-color:var(${Theme.CssVar.BACKGROUND_COLOR}); padding:1em;  max-width:30em; word-break:break-all}
	
	/** top **/
	.${NS$6}-container-wrap[data-tip-dir="11"],
	.${NS$6}-container-wrap[data-tip-dir="0"],
	.${NS$6}-container-wrap[data-tip-dir="1"]{padding-top:var(--tip-gap)}
	.${NS$6}-container-wrap[data-tip-dir="11"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="0"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="1"] .${NS$6}-arrow{top:var(--tip-mgr); transform:rotate(135deg);}
	.${NS$6}-container-wrap[data-tip-dir="11"] .${NS$6}-arrow{left:calc(25% - var(--tip-gap));}
	.${NS$6}-container-wrap[data-tip-dir="0"] .${NS$6}-arrow{left:calc(50% - var(--tip-gap));background:orange;}
	.${NS$6}-container-wrap[data-tip-dir="1"] .${NS$6}-arrow{left:calc(75% - var(--tip-gap));}
	
	/** left **/
	.${NS$6}-container-wrap[data-tip-dir="8"],
	.${NS$6}-container-wrap[data-tip-dir="9"],
	.${NS$6}-container-wrap[data-tip-dir="10"]{padding-left:var(--tip-gap)}
	.${NS$6}-container-wrap[data-tip-dir="8"] .${NS$6}-close,
	.${NS$6}-container-wrap[data-tip-dir="9"] .${NS$6}-close,
	.${NS$6}-container-wrap[data-tip-dir="10"] .${NS$6}-close{top:3px;}
	.${NS$6}-container-wrap[data-tip-dir="8"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="9"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="10"] .${NS$6}-arrow{left:var(--tip-mgr); transform:rotate(45deg);}
	.${NS$6}-container-wrap[data-tip-dir="8"] .${NS$6}-arrow{top:calc(75% - var(--tip-gap));}
	.${NS$6}-container-wrap[data-tip-dir="9"] .${NS$6}-arrow{top:calc(50% - var(--tip-gap));}
	.${NS$6}-container-wrap[data-tip-dir="10"] .${NS$6}-arrow{top:calc(25% - var(--tip-gap));}
	
	/** bottom **/
	.${NS$6}-container-wrap[data-tip-dir="5"],
	.${NS$6}-container-wrap[data-tip-dir="6"],
	.${NS$6}-container-wrap[data-tip-dir="7"]{padding-bottom:var(--tip-gap)}
	.${NS$6}-container-wrap[data-tip-dir="5"] .${NS$6}-close,
	.${NS$6}-container-wrap[data-tip-dir="6"] .${NS$6}-close,
	.${NS$6}-container-wrap[data-tip-dir="7"] .${NS$6}-close{top:3px;}
	.${NS$6}-container-wrap[data-tip-dir="5"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="6"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="7"] .${NS$6}-arrow{bottom:var(--tip-mgr); transform:rotate(-45deg);}
	.${NS$6}-container-wrap[data-tip-dir="5"] .${NS$6}-arrow{right: calc(25% - var(--tip-gap));}
	.${NS$6}-container-wrap[data-tip-dir="6"] .${NS$6}-arrow{right: calc(50% - var(--tip-gap));}
	.${NS$6}-container-wrap[data-tip-dir="7"] .${NS$6}-arrow{right: calc(75% - var(--tip-gap));}
	
	/** right **/
	.${NS$6}-container-wrap[data-tip-dir="2"],
	.${NS$6}-container-wrap[data-tip-dir="3"],
	.${NS$6}-container-wrap[data-tip-dir="4"]{padding-right:var(--tip-gap)}
	.${NS$6}-container-wrap[data-tip-dir="2"] .${NS$6}-close,
	.${NS$6}-container-wrap[data-tip-dir="3"] .${NS$6}-close,
	.${NS$6}-container-wrap[data-tip-dir="4"] .${NS$6}-close{right:13px;top:3px;}
	.${NS$6}-container-wrap[data-tip-dir="2"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="3"] .${NS$6}-arrow,
	.${NS$6}-container-wrap[data-tip-dir="4"] .${NS$6}-arrow{right:var(--tip-mgr);transform: rotate(-135deg);}
	.${NS$6}-container-wrap[data-tip-dir="2"] .${NS$6}-arrow{top:calc(25% - var(--tip-gap))}
	.${NS$6}-container-wrap[data-tip-dir="3"] .${NS$6}-arrow{top:calc(50% - var(--tip-gap));}
	.${NS$6}-container-wrap[data-tip-dir="4"] .${NS$6}-arrow{top:calc(75% - var(--tip-gap))}
`;
	let bindEvent = (tip)=>{
		if(tip.option.showCloseButton){
			let close_btn = tip.dom.querySelector(`.${NS$6}-close`);
			close_btn.addEventListener('click', () => {tip.hide();}, false);
			document.addEventListener('keyup', (e) => {
				if(e.key === KEYBOARD_KEY_MAP.Escape){
					tip.hide();
				}
			}, false);
		}
	};
	let calDir = (tipObj)=>{
		let tipWidth = tipObj.dom.offsetWidth;
		let tipHeight = tipObj.dom.offsetHeight;
		let relateNodeHeight = tipObj.relateNode.offsetHeight;
		let relateNodeWidth = tipObj.relateNode.offsetWidth;
		let relateNodeOffset = getDomOffset(tipObj.relateNode);
		let viewRegion = getRegion();
		for(let i = 0; i < TRY_DIR_MAP.length; i++){
			let [offsetLeft, offsetTop] = calcTipPositionByDir(TRY_DIR_MAP[i], tipWidth, tipHeight, relateNodeHeight, relateNodeWidth);
			let rect = {
				left: relateNodeOffset.left + offsetLeft,
				top: relateNodeOffset.top + offsetTop,
				width: tipWidth,
				height: tipHeight
			};
			let layout_rect = {
				left: document.body.scrollLeft,
				top: document.body.scrollTop,
				width: viewRegion.visibleWidth,
				height: viewRegion.visibleHeight
			};
			if(rectInLayout(rect, layout_rect)){
				return TRY_DIR_MAP[i];
			}
		}
		return DEFAULT_DIR;
	};
	let calcTipPositionByDir = function(dir, tipWidth, tipHeight, relateNodeHeight, relateNodeWidth){
		let offset = {
			11: [-tipWidth * 0.25 + relateNodeWidth / 2, relateNodeHeight],
			0: [-tipWidth * 0.5 + relateNodeWidth / 2, relateNodeHeight],
			1: [-tipWidth * 0.75 + relateNodeWidth / 2, relateNodeHeight],
			2: [-tipWidth, -tipHeight * 0.25 + relateNodeHeight / 2],
			3: [-tipWidth, -tipHeight * 0.5 + relateNodeHeight / 2],
			4: [-tipWidth, -tipHeight * 0.75 + relateNodeHeight / 2],
			5: [-tipWidth * 0.75 + relateNodeWidth / 2, -tipHeight],
			6: [-tipWidth * 0.5 + relateNodeWidth / 2, -tipHeight],
			7: [-tipWidth * 0.25 + relateNodeWidth / 2, -tipHeight],
			8: [relateNodeWidth, -tipHeight * 0.75 + relateNodeHeight / 2],
			9: [relateNodeWidth, -tipHeight * 0.5 + relateNodeHeight / 2],
			10: [relateNodeWidth, -tipHeight * 0.25 + relateNodeHeight / 2]
		};
		return offset[dir];
	};
	const updatePosition = (tipObj)=>{
		let direction = tipObj.option.direction;
		let tipWidth = tipObj.dom.offsetWidth;
		let tipHeight = tipObj.dom.offsetHeight;
		let relateNodePos = getDomOffset(tipObj.relateNode);
		let rh = tipObj.relateNode.offsetHeight;
		let rw = tipObj.relateNode.offsetWidth;
		if(direction === 'auto'){
			direction = calDir(tipObj);
		}
		tipObj.dom.setAttribute('data-tip-dir',direction);
		let [offsetLeft, offsetTop] = calcTipPositionByDir(direction, tipWidth, tipHeight, rh, rw);
		tipObj.dom.style.left = dimension2Style(relateNodePos.left + offsetLeft);
		tipObj.dom.style.top = dimension2Style(relateNodePos.top + offsetTop);
	};
	class Tip {
		id = null;
		relateNode = null;
		dom = null;
		option = {
			showCloseButton: true,
			width: 'auto',
			direction: 'auto',
		};
		onShow = new BizEvent(true);
		onHide = new BizEvent(true);
		onDestroy = new BizEvent(true);
		constructor(content, relateNode, opt = {}){
			insertStyleSheet(STYLE_STR$6, Theme.Namespace + 'tip-style');
			this.id = guid();
			this.relateNode = relateNode;
			this.option = Object.assign(this.option, opt);
			this.dom = createDomByHtml(
				`<div class="${NS$6}-container-wrap" style="display:none; ${this.option.width ? 'width:'+dimension2Style(this.option.width) : ''}">
				<s class="${NS$6}-arrow"></s>
				${this.option.showCloseButton ? `<span class="${NS$6}-close">&#10005;</span>` : ''}
				<div class="${NS$6}-content">${content}</div>
			</div>`);
			bindEvent(this);
			TIP_COLLECTION[this.id] = this;
		}
		setContent(html){
			this.dom.querySelector(`.${NS$6}-content`).innerHTML = html;
			updatePosition(this);
		}
		show(){
			if(!document.contains(this.dom)){
				document.body.appendChild(this.dom);
			}
			show(this.dom);
			updatePosition(this);
			this.onShow.fire(this);
		}
		hide(){
			hide(this.dom);
			this.onHide.fire(this);
		}
		destroy(){
			remove(this.dom);
			this.onDestroy.fire();
			for(let i in TIP_COLLECTION){
				if(TIP_COLLECTION[i] === this){
					delete(TIP_COLLECTION[i]);
				}
			}
		}
		static show(content, relateNode, option = {}){
			let tip = new Tip(content, relateNode, option);
			tip.show();
			return tip;
		}
		static hideAll(){
			for(let i in TIP_COLLECTION){
				TIP_COLLECTION[i].hide();
			}
		}
		static bindNode(content, relateNode, option = {triggerType:'hover'}){
			let guid = relateNode.getAttribute(GUID_BIND_KEY);
			let tipObj = TIP_COLLECTION[guid];
			if(!tipObj){
				tipObj = new Tip(content, relateNode, option);
				relateNode.setAttribute(GUID_BIND_KEY, tipObj.id);
				let tm = null;
				let hide = ()=>{
					tm && clearTimeout(tm);
					tm = setTimeout(()=>{
						tipObj.hide();
					}, 10);
				};
				let show = ()=>{
					tm && clearTimeout(tm);
					tipObj.show();
				};
				switch(option.triggerType){
					case 'hover':
						relateNode.addEventListener('mouseover', show);
						relateNode.addEventListener('mouseout', hide);
						tipObj.dom.addEventListener('mouseout', hide);
						tipObj.dom.addEventListener('mouseover', show);
						break;
					case 'click':
						relateNode.addEventListener('click', ()=>{
							let isShow = tipObj.dom.style.display !== 'none';
							!isShow ? show() : hide();
						});
						document.addEventListener('click', e=>{
							if(!domContained(relateNode, e.target, true) && !domContained(tipObj.dom, e.target, true)){
								hide();
							}
						});
						break;
					default:
						throw "option.triggerType no supported:" + option.triggerType;
				}
			}
			return tipObj;
		}
		static bindAsync(relateNode, dataFetcher, option = {}){
			let guid = relateNode.getAttribute(`data-${GUID_BIND_KEY}`);
			let tipObj = TIP_COLLECTION[guid];
			if(!tipObj){
				let loading = false;
				tipObj = Tip.bindNode('loading...', relateNode, option);
				tipObj.onShow.listen(() => {
					if(loading){
						return;
					}
					loading = true;
					dataFetcher().then(rspHtml => {
						tipObj.setContent(rspHtml);
					}, error => {
						tipObj.setContent(error);
					}).finally(()=>{
						loading = false;
					});
				});
			}
		};
	}

	const COM_ID$2 = Theme.Namespace + 'novice-guide';
	const CLASS_PREFIX$2 = COM_ID$2;
	const PADDING_SIZE = '5px';
	const STYLE_STR$5 = `
	.${CLASS_PREFIX$2}-highlight {
		position:absolute; 
		z-index:10000;
		--novice-guide-highlight-padding:${PADDING_SIZE}; 
		box-shadow:0 0 10px 2000px #00000057; 
		border-radius:var(${Theme.CssVar.PANEL_RADIUS}); 
		padding:var(--novice-guide-highlight-padding); 
		margin:calc(var(--novice-guide-highlight-padding) * -1) 0 0 calc(var(--novice-guide-highlight-padding) * -1); 
	}
	.${CLASS_PREFIX$2}-btn {user-select:none; cursor:pointer;}
	.${CLASS_PREFIX$2}-masker {width:100%; height:100%; position:absolute; left:0; top:0; z-index:10000}
	.${CLASS_PREFIX$2}-counter {float:left; color:${Theme.CssVar.COLOR}; opacity:0.7} 
	.${CLASS_PREFIX$2}-next-wrap {text-align:right; margin-top:10px;}
`;
	let highlightHelperEl,
		maskerEl;
	const show_highlight_zone = (highlightNode) => {
		hide_highlight_zone();
		if(!highlightHelperEl){
			highlightHelperEl = createDomByHtml(`<div class="${CLASS_PREFIX$2}-highlight"></div>`, document.body);
			maskerEl = createDomByHtml(`<div class="${CLASS_PREFIX$2}-masker"></div>`, document.body);
		}
		show(maskerEl);
		show(highlightHelperEl);
		if(highlightNode){
			let hlnOffset = getDomOffset(highlightNode);
			highlightHelperEl.style.left = dimension2Style(hlnOffset.left);
			highlightHelperEl.style.top = dimension2Style(hlnOffset.top);
			highlightHelperEl.style.width = dimension2Style(highlightNode.offsetWidth);
			highlightHelperEl.style.height = dimension2Style(highlightNode.offsetHeight);
			return;
		}
		highlightHelperEl.style.left = dimension2Style(document.body.offsetWidth/2);
		highlightHelperEl.style.top = dimension2Style(300);
		highlightHelperEl.style.width = dimension2Style(1);
		highlightHelperEl.style.height = dimension2Style(1);
		return highlightHelperEl;
	};
	const hide_highlight_zone = () => {
		maskerEl && hide(maskerEl);
		highlightHelperEl && hide(highlightHelperEl);
	};
	const showNoviceGuide = (steps, config = {}) => {
		config = Object.assign({
			next_button_text: '下一步',
			prev_button_text: '上一步',
			finish_button_text: '完成',
			top_close: false,
			cover_included: false,
			show_counter: false,
			on_finish: function(){
			}
		}, config);
		insertStyleSheet(STYLE_STR$5, COM_ID$2+'-style');
		let step_size = steps.length;
		let show_one = function(){
			if(!steps.length){
				hide_highlight_zone();
				config.on_finish();
				return;
			}
			let step = steps[0];
			steps.shift();
			let showing_cover = config.cover_included && step_size === (steps.length + 1);
			let highlightHelperEl;
			if(showing_cover){
				highlightHelperEl = show_highlight_zone(null, {
					left: document.body.offsetWidth / 2,
					top: 300,
					width: 1,
					height: 1
				});
			}else {
				highlightHelperEl = show_highlight_zone(step.relateNode);
			}
			let next_html = `<div class="${CLASS_PREFIX$2}-next-wrap">`;
			if((steps.length + 2) <= step_size.length){
				next_html += `<span class="${CLASS_PREFIX$2}-btn ${CLASS_PREFIX$2}-prev-btn ">${config.prev_button_text}</span> `;
			}
			if(steps.length && config.next_button_text){
				next_html += `<span class="${CLASS_PREFIX$2}-btn ${CLASS_PREFIX$2}-next-btn">${config.next_button_text}</span>`;
			}
			if(!steps.length && config.finish_button_text){
				next_html += `<span class="${CLASS_PREFIX$2}-btn ${CLASS_PREFIX$2}-finish-btn">${config.finish_button_text}</span>`;
			}
			if(config.show_counter){
				next_html += `<span class="${CLASS_PREFIX$2}-counter">${step_size.length - steps.length}/${step_size.length}</span>`;
			}
			next_html += `</div>`;
			let tp = new Tip(`<div class="${CLASS_PREFIX$2}-content">${step.content}</div>${next_html}`, showing_cover ? highlightHelperEl : step.relateNode, {
				showCloseButton: config.top_close,
				dir: showing_cover ? 6 : 'auto'
			});
			tp.onHide.listen(function(){
				tp.destroy();
				hide_highlight_zone();
				config.on_finish();
			});
			tp.onShow.listen(function(){
				tp.dom.style.zIndex = "10001";
				tp.dom.querySelector(`.${CLASS_PREFIX$2}-next-btn,.${CLASS_PREFIX$2}-finish-btn`).addEventListener('click', function(){
					tp.destroy();
					show_one();
				});
				let prevBtn = tp.dom.querySelector(`.${CLASS_PREFIX$2}-prev-btn`);
				if(prevBtn){
					prevBtn.addEventListener('click', function(){
						tp.destroy();
						let len = steps.length;
						steps.unshift(step_size[step_size.length - len - 1]);
						steps.unshift(step_size[step_size.length - len - 2]);
						show_one();
					});
				}
			});
			tp.show();
		};
		show_one();
	};

	const renderPaginate = (paginate, onChange) => {
		const NUM_OFFSET = 4;
		let item_total = paginate.item_total;
		let page_size = paginate.page_size;
		let page = paginate.page;
		let page_total = Math.ceil(item_total / page_size);
		const PAGINATE_DOM = createDomByHtml(`<div class="paginate paginate-total-${page_total}"></div>`);
		const render = (page) => {
			let html = ``, i;
			if(page > 1){
				html += `<span class="paginate-prev link" title="上一页" data-page="${page - 1}"></span>`;
			}else {
				html += `<span class="paginate-prev" title="上一页"></span>`;
			}
			if(page - NUM_OFFSET > 1){
				html += `<span class="paginate-dot"></span>`;
			}
			for(i = Math.min(NUM_OFFSET, page - 1); i > 0; i--){
				html += `<span class="paginate-num link" title="第${page - i}页" data-page="${page - i}">${page - i}</span>`;
			}
			html += `<span class="paginate-num paginate-current">${page}</span>`;
			for(i = page + 1; i <= Math.min(page_total, page + NUM_OFFSET); i++){
				html += `<span class="paginate-num link" title="第${i}页" data-page="${i}">${i}</span>`;
			}
			if(page + NUM_OFFSET < page_total){
				html += `<span class="paginate-dot"></span>`;
			}
			if(page < page_total){
				html += `<span class="paginate-next link" title="下一页" data-page="${page + 1}"></span>`;
			}else {
				html += `<span class="paginate-next"></span>`;
			}
			html += `<span class="paginate-total-info">共 ${page_total} 页</span>`;
			html += `<span class="paginate-size-changer">每页 ${page_size} 条</span>`;
			PAGINATE_DOM.innerHTML = html;
		};
		eventDelegate(PAGINATE_DOM, '[data-page]', 'click', e => {
			render(parseInt(e.target.dataset.page));
			onChange(parseInt(e.target.dataset.page));
		});
		render(page);
		return PAGINATE_DOM;
	};

	class ParallelPromise {
		option = {
			parallelLimit: 5,
			timeout: 60000,
			continueOnError: true,
		}
		stopFlag = false;
		running = 0;
		taskStack = [];
		onFinish = new BizEvent();
		successResults = [];
		failResults = [];
		constructor(option = {}){
			this.option = Object.assign(this.option, option);
			if(this.option.parallelLimit < 1){
				throw "最大并发数量必须大于0";
			}
		}
		_loop(){
			if((!this.taskStack.length && !this.running) || this.stopFlag){
				this.onFinish.fire(this.successResults, this.failResults);
				return;
			}
			while(!this.stopFlag && this.taskStack.length && this.option.parallelLimit > this.running){
				this.running++;
				let payload = this.taskStack.shift();
				new Promise((resolve, reject) => {
					let tm = null;
					if(this.option.timeout){
						tm = setTimeout(() => {reject('task timeout');}, this.option.timeout);
					}
					payload(successResult => {
						tm && clearTimeout(tm);
						this.successResults.push(successResult);
						resolve();
					}, err => {
						tm && clearTimeout(tm);
						if(!this.option.continueOnError){
							this.stopFlag = true;
						}
						this.failResults.push(err);
						reject(err);
					});
				}).finally(() => {
					this.running--;
					this._loop();
				});
			}
		}
		stop(){
			this.stopFlag = true;
		}
		start(){
			this._loop();
		}
		addTask(payload){
			this.taskStack.push(payload);
		}
	}

	const getToastOption = (showMsg) => {
		if(typeof showMsg === 'boolean' || showMsg === null){
			return {
				pending: !!showMsg,
				success: !!showMsg,
				error: !!showMsg,
			};
		}
		if(isObject(showMsg)){
			return {
				pending: !!showMsg.pending,
				success: !!showMsg.success,
				error: !!showMsg.error,
			};
		}
		throw "silent config param illegal";
	};
	const QuickJsonRequest = {
		PENDING_MSG: '正在请求，请稍候···',
		RESPONSE_SUCCESS_ERROR: (rsp) => {
			return (rsp && rsp.code === 0) ? [rsp.message || '操作成功', ''] : ['', rsp.message || '请求发生错误'];
		},
		request: (method, url, data, showMsg = false) => {
			let toastOpt = getToastOption(showMsg);
			let pendingToast = null;
			if(toastOpt.pending){
				pendingToast = ToastClass.showLoadingLater(QuickJsonRequest.PENDING_MSG);
			}
			return new Promise((resolve, reject) => {
				requestJSON(url, data, method)
					.then(rsp => {
						let [successMsg, errorMsg] = QuickJsonRequest.RESPONSE_SUCCESS_ERROR(rsp);
						if(successMsg){
							toastOpt.success && ToastClass.showSuccess(successMsg);
							resolve(rsp);
						}else if(errorMsg){
							toastOpt.error && ToastClass.showError(errorMsg);
							reject(rsp);
						}else {
							throw "response error";
						}
					})
					.finally(() => {
						pendingToast && pendingToast.hide();
					});
			});
		},
		get(url, data, showMsg = false){
			return QuickJsonRequest.request(HTTP_METHOD.GET, url, data, showMsg);
		},
		post(url, data, showMsg = true){
			return QuickJsonRequest.request(HTTP_METHOD.POST, url, data, showMsg);
		}
	};

	const isCheckBox = node => {
		return node.tagName === 'INPUT' && node.type === 'checkbox';
	};
	const isValueButton = node => {
		return node.tagName === 'INPUT' && ['reset', 'submit', 'button'].includes(node.type);
	};
	const isPairTag = node => {
		return ['BUTTON', 'SPAN', 'DIV', 'P'].includes(node.tagName);
	};
	class ACSelectAll {
		static SELECT_ALL_TEXT = '全选';
		static UNSELECT_ALL_TEXT = '取消选择';
		static SELECT_TIP_TEMPLATE = '已选择 %c/%s';
		static init(trigger, params = {}){
			const container = findOne(params.container || 'body');
			const checkbox_selector = params.selector || 'input[type=checkbox]';
			let tip = params.tip !== undefined ? params.tip :  ACSelectAll.SELECT_TIP_TEMPLATE;
			const disableTrigger = () => {
				trigger.setAttribute('disabled', 'disabled');
			};
			const enableTrigger = () => {
				trigger.removeAttribute('disabled');
			};
			let checks = [];
			let updateTrigger = () => {
				let checkedCount = 0;
				checks = checks.filter(chk=>!chk.disabled);
				checks.forEach(chk => {
					checkedCount += chk.checked ? 1 : 0;
				});
				if(tip){
					trigger.title = tip.replace(/%c/g, checkedCount).replace(/%s/g, checks.length);
				}
				if(isValueButton(trigger)){
					trigger.value = checkedCount ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
				}else if(isPairTag(trigger)){
					trigger.innerText = checkedCount ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
				}else if(isCheckBox(trigger)){
					trigger.indeterminate = checkedCount && checkedCount !== checks.length;
					trigger.checked = checkedCount;
				}
				checks.length ? enableTrigger() : disableTrigger();
			};
			onDomTreeChange(container, () => {
				checks = findAll('input[type=checkbox]', container);
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_all){
						return;
					}
					chk.dataset.__bind_select_all = "1";
					chk.addEventListener('change', updateTrigger);
				});
				updateTrigger();
			});
			trigger.addEventListener('click', () => {
				let toCheck;
				if(isValueButton(trigger) || isPairTag(trigger)){
					toCheck = (trigger.innerText || trigger.value) === this.SELECT_ALL_TEXT;
				}else if(isCheckBox(trigger)){
					toCheck = trigger.checked;
				}else {
					console.warn('Select All no support this type');
					return;
				}
				checks = checks.filter(chk=>!chk.disabled);
				checks.forEach(chk => {
					chk.checked = toCheck;
					triggerDomEvent(chk, 'change');
				});
				if(isValueButton(trigger)){
					trigger.value = toCheck ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
				}else if(isPairTag(trigger)){
					trigger.innerText = toCheck ? this.UNSELECT_ALL_TEXT : this.SELECT_ALL_TEXT;
				}
			});
			let containerInit = () => {
				checks = findAll(checkbox_selector, container);
				checks.forEach(chk => {
					if(chk.dataset.__bind_select_all){
						return;
					}
					chk.dataset.__bind_select_all = "1";
					chk.addEventListener('change', updateTrigger);
				});
				updateTrigger();
			};
			onDomTreeChange(container, containerInit);
			containerInit();
		}
	}

	const COM_ID$1 = Theme.Namespace + 'select';
	const CLASS_PREFIX$1 = COM_ID$1;
	const STYLE_STR$4 = `
	.${CLASS_PREFIX$1}-panel{
		${Theme.CssVarPrefix}sel-panel-max-width:20em;
		${Theme.CssVarPrefix}sel-list-max-height:15em;
		${Theme.CssVarPrefix}sel-item-matched-color:orange;
		${Theme.CssVarPrefix}sel-item-matched-font-weight:bold;
		${Theme.CssVarPrefix}sel-item-hover-bg:#eeeeee;
		${Theme.CssVarPrefix}sel-item-selected-bg:#abc9e140;
		
		max-width:var(${Theme.CssVarPrefix}sel-panel-max-width);
		background-color:var(${Theme.CssVar.BACKGROUND_COLOR});
		border:var(${Theme.CssVar.PANEL_BORDER});
		padding:.2em 0;
		box-sizing:border-box;
		box-shadow:var(${Theme.CssVar.PANEL_SHADOW});
		border-radius:var(${Theme.CssVar.PANEL_RADIUS});
		position:absolute;
		z-index:1;
	}
	
	.${CLASS_PREFIX$1}-panel .${CLASS_PREFIX$1}-search{padding:0.5em;}
	.${CLASS_PREFIX$1}-panel input[type=search]{
		width:100%;
		padding:0.5em;
		border:none;
		border-bottom:1px solid #dddddd;
		outline:none;
		box-shadow:none;
		transition:border 0.1s linear;
	}
	.${CLASS_PREFIX$1}-panel input[type=search]:focus{
		border-color:gray;
	}
	
	.${CLASS_PREFIX$1}-list{
		list-style:none;
		max-height:var(${Theme.CssVarPrefix}sel-list-max-height);
		overflow:auto;
	}
	
	.${CLASS_PREFIX$1}-list .sel-item{
		margin:0.2em 0;
	}
	
	.${CLASS_PREFIX$1}-list .sel-chk{opacity:0;width:1em;height:1em;position:absolute;margin:0.05em 0 0 -1.25em;}
	
	.${CLASS_PREFIX$1}-list .sel-chk:before{
		content:"\\e624";
		font-family:"${Theme.IconFont}", serif;
	}
	
	.${CLASS_PREFIX$1}-list .matched{
		color:var(${Theme.CssVarPrefix}sel-item-matched-color);
		font-weight:var(${Theme.CssVarPrefix}sel-item-matched-font-weight);
	}
	
	.${CLASS_PREFIX$1}-list input{display:block;position:absolute;z-index:1;left:-2em;top:0;opacity:0;}
	.${CLASS_PREFIX$1}-list .ti-wrap{cursor:pointer;position:relative;display:block;padding:.5em 1em .5em 2em;user-select:none;transition:all 0.1s linear;}
	.${CLASS_PREFIX$1}-list ul .ti-wrap{padding-left:2.25em;display:block; padding-left:3.5em;}
	.${CLASS_PREFIX$1}-list .desc {display:block; opacity:0.5}
	
	.${CLASS_PREFIX$1}-list label{
		display:block;
		overflow:hidden;
		position:relative;
	}
	.${CLASS_PREFIX$1}-list label:hover .ti-wrap{
		background:var(${Theme.CssVarPrefix}sel-item-hover-bg);
		text-shadow:1px 1px 1px white;
	}
	
	.${CLASS_PREFIX$1}-list li[data-group-title]:before{
		content:attr(data-group-title) " -";
		color:gray;
		display:block;
		padding:0.25em .5em .25em 2em;
	}
	
	/** checked **/
	.${CLASS_PREFIX$1}-list input:checked ~ .ti-wrap{
		background-color:var(${Theme.CssVarPrefix}sel-item-selected-bg);
	}
	
	.${CLASS_PREFIX$1}-list input:checked ~ .ti-wrap .sel-chk{
		opacity:1;
	}
	
	/** disabled **/
	.${CLASS_PREFIX$1}-list input:disabled ~ .ti-wrap{
		opacity:0.5;
		cursor:default;
		background-color:transparent
	}
	.${CLASS_PREFIX$1}-list input:disabled ~ .ti-wrap .sel-chk{
		opacity:.1;
	}
	
	.${CLASS_PREFIX$1}-multiple-operation {
		padding:0.25em 0.5em;
	}
	.${CLASS_PREFIX$1}-multiple-operation label {
		display:flex;
		gap:.25em
	}
	
`;
	const resolveSelectPlaceholder = sel =>{
		let pl = sel.getAttribute('placeholder') || '';
		if(pl){
			return pl;
		}
		findAll('option', sel).every(opt=>{
			if(!opt.value){
				pl = opt.innerText;
				return false;
			}
		});
		return pl;
	};
	const resolveSelectOptions = (sel) => {
		let options = [
		];
		let values = [];
		let selectedIndexes = [];
		sel.childNodes.forEach(node => {
			if(node.nodeType !== 1){
				return;
			}
			if(node.tagName === 'OPTION'){
				options.push(new Option({
					type: OPTION_TYPE_OPTION,
					title: node.title,
					text: node.innerText,
					value: node.value,
					disabled: node.disabled,
					selected: node.selected,
					index: node.index,
				}));
				if(node.selected){
					values.push(node.value);
					selectedIndexes.push(node.index);
				}
			}else if(node.tagName === 'OPTGROUP'){
				let opt_group = new Option({
					text: node.label || '',
					title: node.title,
					type: OPTION_TYPE_GROUP
				});
				node.childNodes.forEach(child => {
					if(child.nodeType !== 1){
						return;
					}
					opt_group.options.push(new Option({
						type: OPTION_TYPE_OPTION,
						title: child.title,
						text: child.innerText,
						value: child.value,
						disabled: child.disabled,
						selected: child.selected,
						index: child.index,
					}));
					if(child.selected){
						values.push(child.value);
						selectedIndexes.push(child.index);
					}
				});
				options.push(opt_group);
			}
		});
		return {options, values, selectedIndexes};
	};
	const buildOptionText = (options) => {
		let txt = [];
		options.forEach(opt => {
			if(opt.type === OPTION_TYPE_OPTION && opt.selected){
				txt.push(opt.text.trim());
			}
			if(opt.type === OPTION_TYPE_GROUP){
				opt.options.forEach(sub_opt=>{
					sub_opt.selected && txt.push(sub_opt.text.trim());
				});
			}
		});
		return txt.join(', ');
	};
	const resolveListOption = (datalistEl, initValue = null) => {
		let options = [];
		Array.from(datalistEl.options).forEach((option, index) => {
			let text = option.label || option.innerText || option.value;
			let title = option.title || '';
			let value = option.hasAttribute('value') ? option.getAttribute('value') : text;
			let selected = initValue !== null && value === initValue;
			options.push({text, title, value, disabled: false, selected, index});
		});
		return options;
	};
	const renderItemChecker = (name, multiple, option) => {
		return `<input type="${multiple ? 'checkbox' : 'radio'}" 
		tabindex="0"
		name="${name}" 
		value="${escapeAttr(option.value)}" 
		${option.selected ? 'checked' : ''} 
		${option.disabled ? 'disabled' : ''}/>
	`
	};
	const createPanel = (config) => {
		let list_html = `<ul class="${CLASS_PREFIX$1}-list">`;
		config.initOptions.forEach(option => {
			if(option.options && option.options.length){
				list_html += `<li data-group-title="${escapeAttr(option.text)}" class="sel-group"><ul>`;
				option.options.forEach(childOption => {
					list_html +=
						`<li class="sel-item" tabindex="0">
						<label data-text="${escapeAttr(childOption.text)}" tabindex="0">
							${renderItemChecker(config.name, config.multiple, childOption)} 
							<span class="ti-wrap">
								<span class="sel-chk"></span> 
								<span class="ti">${escapeHtml(childOption.text)}</span>
								<span class="desc">${escapeHtml(childOption.title)}</span>
							</span>
						</label>
					</li>`;
				});
				list_html += `</ul></li>`;
			}else {
				list_html +=
					`<li class="sel-item" tabindex="0">
					<label data-text="${escapeAttr(option.text)}">
						${renderItemChecker(config.name, config.multiple, option)} 
						<span class="ti-wrap">
							<span class="sel-chk"></span> 
							<span class="ti">${escapeHtml(option.text)}</span>
							<span class="desc">${escapeHtml(option.title)}</span>
						</span>
					</label>
				</li>`;
			}
		});
		list_html += '</ul>';
		let multiple_operation_html = config.multiple ?
`<div class="${CLASS_PREFIX$1}-multiple-operation">
	<label>
		<input type="checkbox" class="mul-sel-all-chk"> 全选
	</label>
</div>`	 : '';
		return createDomByHtml(`
		<div class="${CLASS_PREFIX$1}-panel" style="display:none;">
			<div class="${CLASS_PREFIX$1}-search" style="${config.displaySearchInput ? '' : 'display:none'}">
				<input type="search" placeholder="过滤..." aria-label="过滤选项" autocomplete="off">
			</div>
			${list_html}
			${multiple_operation_html}
		</div>
	`, document.body);
	};
	const tabNav = (liList, dir) => {
		let currentIndex = -1;
		liList.forEach((li, idx) => {
			if(li === document.activeElement){
				currentIndex = idx;
			}
		});
		if(dir > 0){
			currentIndex = currentIndex < (liList.length - 1) ? (currentIndex + 1) : 0;
		}else {
			currentIndex = currentIndex <= 0 ? (liList.length - 1) : (currentIndex - 1);
		}
		liList.forEach((li, idx) => {
			if(idx === currentIndex){
				li.focus();
			}
		});
	};
	const OPTION_TYPE_GROUP = 'group';
	const OPTION_TYPE_OPTION = 'option';
	class Option {
		constructor(param){
			for(let i in param){
				this[i] = param[i];
			}
		}
		type = OPTION_TYPE_OPTION;
		title = '';
		text = '';
		value = '';
		disabled = false;
		selected = false;
		index = 0;
		options = [];
	}
	class Select {
		config = {
			name: "",
			required: false,
			multiple: false,
			placeholder: '',
			displaySearchInput: true,
			hideNoMatchItems: true,
			initOptions: [],
		};
		panelEl = null;
		searchEl = null;
		onChange = new BizEvent();
		static PROXY_INPUT_CLASS = 'multiple-select-proxy-input';
		constructor(config){
			insertStyleSheet(STYLE_STR$4, COM_ID$1 + '-style');
			this.config = Object.assign(this.config, config);
			this.config.name = this.config.name || COM_ID$1 + guid();
			this.panelEl = createPanel(this.config);
			this.searchEl = this.panelEl.querySelector('input[type=search]');
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach(chk => {
				chk.addEventListener('change', () => {
					this.onChange.fire();
				});
			});
			this.searchEl.addEventListener('input', () => {
				this.search(this.searchEl.value);
			});
			this.searchEl.addEventListener('keydown', e => {
				if(e.key === KEYBOARD_KEY_MAP.ArrowUp){
					tabNav(liElList, false);
				}else if(e.key === KEYBOARD_KEY_MAP.ArrowDown){
					tabNav(liElList, true);
				}
			});
			let liElList = this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list .sel-item`);
			liElList.forEach(li => {
				bindNodeActive(li, e => {
					if(e.type !== 'click'){
						let chk = li.querySelector('input');
						chk.checked ? chk.removeAttribute('checked') : chk.checked = true;
						this.onChange.fire();
					}
					!this.config.multiple && this.hidePanel();
				});
				li.addEventListener('keydown', e => {
					if(e.key === KEYBOARD_KEY_MAP.ArrowUp){
						tabNav(liElList, false);
					}else if(e.key === KEYBOARD_KEY_MAP.ArrowDown){
						tabNav(liElList, true);
					}
				});
			});
			if(this.config.multiple){
				let list = findOne(`.${CLASS_PREFIX$1}-list`, this.panelEl);
				ACSelectAll.init(findOne('.mul-sel-all-chk', this.panelEl), {container: list});
			}
		}
		isShown(){
			return this.panelEl.style.display !== 'none';
		}
		search(kw){
			this.searchEl.value = kw;
			let liEls = this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list .sel-item`);
			let firstMatchedItem = null;
			liEls.forEach(li => {
				this.config.hideNoMatchItems && hide(li);
				let text = li.querySelector('label').dataset.text || '';
				li.blur();
				li.querySelector('.ti').innerHTML = highlightText(text, kw);
				if(!kw || text.toLowerCase().indexOf(kw.trim().toLowerCase()) >= 0){
					this.config.hideNoMatchItems && show(li);
					if(!firstMatchedItem){
						firstMatchedItem = li;
					}
				}
			});
			if(firstMatchedItem){
				firstMatchedItem.scrollIntoView({behavior: 'smooth'});
			}
			return firstMatchedItem;
		}
		selectByIndex(selectedIndexList){
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach((chk, idx) => {
				chk.checked = selectedIndexList.includes(idx);
			});
		}
		selectByValues(values){
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach((chk, idx) => {
				chk.checked = values.includes(chk.value);
			});
		}
		getValues(){
			let values = [];
			let tmp = this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input:checked`);
			tmp.forEach(chk => {
				values.push(chk.value);
			});
			values = arrayDistinct(values);
			return values;
		}
		getSelectedIndexes(){
			let selectedIndexes = [];
			this.getSelectedOptions().forEach(opt=>{
				selectedIndexes.push(opt.index);
			});
			return selectedIndexes;
		}
		getSelectedOptions(){
			let options = [];
			this.panelEl.querySelectorAll(`.${CLASS_PREFIX$1}-list input`).forEach((chk, idx) => {
				if(chk.checked){
					options.push(new Option({
						type: OPTION_TYPE_OPTION,
						text: chk.closest('label').dataset.text || '',
						value: chk.value,
						selected: true,
						index: idx,
					}));
				}
			});
			return options;
		}
		hidePanel(){
			if(this.panelEl){
				this.panelEl.style.display = 'none';
				this.search("");
			}
		}
		showPanel(pos = {top: 0, left: 0}){
			this.panelEl.style.display = '';
			if(pos){
				this.panelEl.style.top = dimension2Style(pos.top);
				this.panelEl.style.left = dimension2Style(pos.left);
			}
			this.searchEl.focus();
		}
		static bindSelect(selectEl, params = {}){
			let {options} = resolveSelectOptions(selectEl);
			let placeholder = resolveSelectPlaceholder(selectEl);
			let proxyInput;
			const sel = new Select({
				name: selectEl.name,
				required: selectEl.required,
				multiple: selectEl.multiple,
				placeholder,
				initOptions: options,
				...params
			});
			sel.panelEl.style.minWidth = dimension2Style(selectEl.offsetWidth);
			sel.onChange.listen(() => {
				let selectedIndexes = sel.getSelectedIndexes();
				selectEl.querySelectorAll('option').forEach((opt, idx) => {
					opt.selected = selectedIndexes.includes(idx);
				});
				triggerDomEvent(selectEl, 'change');
			});
			const showSelect = () => {
				let offset = getDomOffset(proxyInput || selectEl);
				sel.showPanel({top: offset.top + (proxyInput || selectEl).offsetHeight, left: offset.left});
			};
			const hideSelect = () => {
				sel.hidePanel();
			};
			if(selectEl.multiple){
				proxyInput = document.createElement('input');
				proxyInput.value = buildOptionText(options) || placeholder;
				proxyInput.title = buildOptionText(options) || placeholder;
				proxyInput.type = 'text';
				proxyInput.classList.add(this.PROXY_INPUT_CLASS);
				proxyInput.readOnly = true;
				placeholder && (proxyInput.placeholder = placeholder);
				selectEl.parentNode.insertBefore(proxyInput, selectEl);
				hide(selectEl);
				sel.onChange.listen(() => {
					let selectedOptions = sel.getSelectedOptions();
					proxyInput.value = buildOptionText(selectedOptions) || placeholder;
					proxyInput.title = buildOptionText(selectedOptions) || placeholder;
				});
				bindNodeEvents(proxyInput, ['active', 'focus', 'click'], () => {
					showSelect();
				});
			}
			else {
				selectEl.addEventListener('invalid', hideSelect);
				selectEl.addEventListener('input', showSelect);
				selectEl.addEventListener('focus', showSelect);
				selectEl.addEventListener('keydown', e => {
					showSelect();
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
				selectEl.addEventListener('mousedown', e => {
					sel.isShown() ? sel.hidePanel() : showSelect();
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
				selectEl.addEventListener('change', () => {
					let selectedIndexes = [];
					Array.from(selectEl.selectedOptions).forEach(opt => {
						selectedIndexes.push(opt.index);
					});
					sel.selectByIndex(selectedIndexes);
				});
			}
			document.addEventListener('click', e => {
				if(!domContained(sel.panelEl, e.target, true) && !domContained(proxyInput || selectEl, e.target, true)){
					hideSelect();
				}
			});
			document.addEventListener('keyup', e => {
				if(e.key === KEYBOARD_KEY_MAP.Escape){
					hideSelect();
				}
			});
		}
		static bindTextInput(inputEl, params = {}){
			params = params || {initOptions:null};
			if(!params.initOptions){
				let listTagId = inputEl.getAttribute('list');
				let datalistEl = document.getElementById(listTagId);
				if(!datalistEl){
					throw "no datalist found: " + inputEl.getAttribute('list');
				}
				params.initOptions = resolveListOption(datalistEl, inputEl.value);
				inputEl.removeAttribute('list');
				remove(datalistEl);
			}
			let sel = new Select({
				name: inputEl.name,
				required: inputEl.required,
				multiple: false,
				displaySearchInput: false,
				hideNoMatchItems: false,
				placeholder: inputEl.getAttribute('placeholder'),
				...params
			});
			sel.onChange.listen(() => {
				inputEl.value = sel.getValues()[0];
				triggerDomEvent(inputEl, 'change');
			});
			sel.panelEl.style.minWidth = dimension2Style(inputEl.offsetWidth);
			let sh = () => {
				let offset = getDomOffset(inputEl);
				sel.showPanel({top: offset.top + inputEl.offsetHeight, left: offset.left});
			};
			inputEl.setAttribute('autocomplete', 'off');
			inputEl.addEventListener('focus', sh);
			inputEl.addEventListener('click', sh);
			inputEl.addEventListener('input', () => {
				let matchSelItem = sel.search(inputEl.value.trim());
				findAll(`.${CLASS_PREFIX$1}-list input`, sel.panelEl).forEach(chk => {
					chk.checked = false;
				});
				if(matchSelItem){
					let lbl = findOne('label', matchSelItem).dataset.text || '';
					if(lbl.trim() === inputEl.value.trim()){
						findOne('input', matchSelItem).checked = true;
					}
				}
			});
			document.addEventListener('click', e => {
				if(!domContained(sel.panelEl, e.target, true) && !domContained(inputEl, e.target, true)){
					sel.hidePanel();
				}
			});
			document.addEventListener('keyup', e => {
				if(e.key === KEYBOARD_KEY_MAP.Escape){
					sel.hidePanel();
				}
			});
		}
	}

	const CLS_ON_DRAG = Theme.Namespace + '-on-drag';
	const CLS_DRAG_PROXY = Theme.Namespace + '-drag-proxy';
	const matchChildren = (container, eventTarget) => {
		let children = Array.from(container.children);
		let p = eventTarget;
		while(p){
			if(children.includes(p)){
				return p;
			}
			p = p.parentNode;
		}
		throw "event target no in container";
	};
	const sortable = (listContainer, option = {}) => {
		let dragNode = null;
		let dragIndex;
		let lastTargetIndex;
		listContainer = findOne(listContainer);
		option = Object.assign({
			ClassOnDrag: CLS_ON_DRAG,
			ClassProxy: CLS_DRAG_PROXY,
			triggerSelector: '',
			onStart: (child) => {
			},
			onInput: (currentIndex, targetIndex) => {
			},
			onChange: (currentIndex, targetIndex) => {
			}
		}, option);
		const setDraggable = () => {
			if(option.triggerSelector){
				findAll(option.triggerSelector, listContainer).forEach(trigger => trigger.setAttribute('draggable', 'true'));
			}else {
				Array.from(listContainer.children).forEach(child => child.setAttribute('draggable', 'true'));
			}
		};
		onDomTreeChange(listContainer, setDraggable, false);
		setDraggable();
		listContainer.addEventListener('dragover', e => {
			e.preventDefault();
			return false;
		});
		listContainer.addEventListener('dragstart', e => {
			dragIndex = lastTargetIndex = null;
			if(option.triggerSelector){
				if(!e.target.matches(option.triggerSelector) && !e.target.closest(option.triggerSelector)){
					e.preventDefault();
					return false;
				}
			}
			if(e.target === listContainer){
				e.preventDefault();
				return false;
			}
			dragNode = matchChildren(listContainer, e.target);
			dragIndex = nodeIndex(dragNode);
			if(option.onStart(dragNode) === false){
				console.debug('drag start canceled');
				return false;
			}
			dragNode.classList.add(option.ClassProxy);
			setTimeout(() => {
				dragNode.classList.remove(option.ClassProxy);
				dragNode.classList.add(option.ClassOnDrag);
			}, 0);
			return false;
		});
		listContainer.addEventListener('dragenter', e => {
			if(e.target === listContainer){
				return;
			}
			let childNode = matchChildren(listContainer, e.target);
			if(!dragNode || childNode === listContainer || dragNode === childNode){
				return;
			}
			let children = Array.from(listContainer.children);
			let currentIndex = children.indexOf(dragNode);
			let targetIndex = children.indexOf(childNode);
			if(currentIndex > targetIndex){
				listContainer.insertBefore(dragNode, childNode.previousSibling);
			}else {
				listContainer.insertBefore(dragNode, childNode.nextSibling);
			}
			lastTargetIndex = targetIndex;
			option.onInput(currentIndex, targetIndex);
		});
		listContainer.addEventListener('dragend', e => {
			if(e.target === listContainer){
				return;
			}
			let childNode = matchChildren(listContainer, e.target);
			dragNode = null;
			childNode.classList.remove(option.ClassOnDrag);
			if(lastTargetIndex === null || dragIndex === lastTargetIndex){
				return;
			}
			option.onChange(dragIndex, lastTargetIndex);
		});
	};

	const tabConnect = (tabs, contents, option = {}) => {
		let {contentActiveClass = 'active', tabActiveClass = 'active', triggerEvent = 'click'} = option;
		tabs = findAll(tabs);
		contents = findAll(contents);
		tabs.forEach((tab, idx) => {
			tab.addEventListener(triggerEvent, e => {
				contents.forEach(ctn => {
					ctn.classList.remove(contentActiveClass);
				});
				contents[idx].classList.add(contentActiveClass);
				tabs.forEach(t => {
					t.classList.remove(tabActiveClass);
				});
				tab.classList.add(tabActiveClass);
			});
		});
	};

	const CLASS_PREFIX = Theme.Namespace + 'toc';
	const COM_ID = Theme.Namespace + 'toc';
	const STYLE_STR$3 = `
	.${CLASS_PREFIX}-wrap {}
	.${CLASS_PREFIX}-wrap ul {list-style:none; padding:0; margin:0}
	.${CLASS_PREFIX}-wrap li {padding-left:calc((var(--toc-item-level) - 1) * 10px)}
	.${CLASS_PREFIX}-collapse>ul {display:none;}
	.${CLASS_PREFIX}-title {display:block; margin:0.1em 0 0; cursor:pointer; user-select:none; padding:0.5em 1em 0.5em 2em;}
	.${CLASS_PREFIX}-title:hover {border-radius:var(${Theme.CssVar.PANEL_RADIUS})}
	.${CLASS_PREFIX}-toggle {position:absolute; vertical-align:middle; width:0; height:0; border:0.4em solid transparent; margin:1em 0 0 0.5em; border-top-color:var(${Theme.CssVar.COLOR}); opacity:0; cursor:pointer;}
	.${CLASS_PREFIX}-collapse>.${CLASS_PREFIX}-toggle {border-top-color:transparent; border-left-color:var(${Theme.CssVar.COLOR}); margin:.75em 0 0 0.5em;}
	li:hover>.${CLASS_PREFIX}-toggle {opacity:.4}
	.${CLASS_PREFIX}-wrap .${CLASS_PREFIX}-toggle:hover {opacity:0.8}
`;
	const renderEntriesListHtml = (entries, config) => {
		console.log(config);
		let html = '<ul>';
		entries.forEach(entry => {
			html += `<li data-id="${entry.id}" data-level="${entry.level}" style="--toc-item-level:${entry.level}">
					${config.collapseAble && entry.children.length ? `<span class="${CLASS_PREFIX}-toggle"></span>` : ''}
					<span class="${CLASS_PREFIX}-title">${escapeHtml(entry.title)}</span>`;
			if(entry.children.length){
				html += renderEntriesListHtml(entry.children, config);
			}
		});
		html += '</ul>';
		return html;
	};
	const searchNodeById = (id, entries) => {
		for(let i = 0; i < entries.length; i++){
			if(entries[i].id === id){
				return entries[i].relateNode;
			}
			if(entries[i].children.length){
				let m = searchNodeById(id, entries[i].children);
				if(m){
					return m;
				}
			}
		}
		console.warn('no matched', id, entries);
		return null;
	};
	class Toc {
		dom = null;
		config = {
			container: null,
			collapseAble: true,
		};
		constructor(entries, config = {}){
			insertStyleSheet(STYLE_STR$3, COM_ID + '-style');
			this.config = Object.assign(this.config, {container:document.body}, config);
			this.dom = createDomByHtml(`<div class="${CLASS_PREFIX}-wrap">
				${renderEntriesListHtml(entries, this.config)}
			</div>`, this.config.container);
			this.dom.querySelectorAll(`li>span.${CLASS_PREFIX}-title`).forEach(span => {
				let id = span.parentNode.getAttribute('data-id');
				span.addEventListener('click', e => {
					let n = searchNodeById(id, entries);
					n.focus();
					n.scrollIntoView({behavior: 'smooth'});
				});
			});
			eventDelegate(this.dom, `.${CLASS_PREFIX}-toggle`, 'click', (e, target)=>{
				let li = target.closest('li');
				li.classList.toggle(CLASS_PREFIX+'-collapse');
			});
		}
		static createFromHeading(container = null, config = {}){
			container = container || document;
			let entries = Toc.resolveHeading(container);
			return new Toc(entries, config);
		}
		static resolveHeading(container){
			let levelMaps = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
			let allHeadings = Array.from(container.querySelectorAll(levelMaps.join(','))) || [];
			let entries = [
			];
			const addResult = (title, level, relateNode, list) => {
				if(!list.length){
					return list.push({id: guid('toc-'), title, level, relateNode, children: []});
				}
				if(list[list.length - 1].level < level){
					addResult(title, level, relateNode, list[list.length - 1].children);
				}else if(list[list.length - 1].level === level){
					return list.push({id: guid('toc-'), title, level, relateNode, children: []});
				}else {
					addResult(title, level, relateNode, list[list.length - 1].children);
				}
			};
			allHeadings.forEach(relateNode => {
				let level = parseInt(relateNode.tagName.replace(/\D+/g, ''), 10);
				let title = relateNode.innerText;
				addResult(title, level, relateNode, entries);
			});
			console.log(entries);
			return entries;
		}
	}

	const NS$5 = Theme.Namespace + 'uploader';
	const STYLE_STR$2 = `
	.${NS$5}{display:inline-block;position:relative;background-color:#dddddd;width:80px;height:80px;overflow:hidden;}
	
	.${NS$5}-file{width:100%;height:100%;position:absolute;cursor:pointer;display:flex;align-items:center;}
	.${NS$5}-file:before{flex:1;font-family:WebCom-iconfont, serif;content:"\\e9de";font-size:30px;text-align:center;}
	.${NS$5}-file input[type=file]{position:absolute;width:1px;height:1px;left:0;top:0;opacity:0;}
	
	.${NS$5}[data-state="empty"]{opacity:0.5}
	.${NS$5}[data-state="empty"]:hover{opacity:1; transition:all 0.2s linear}
	
	.${NS$5}[data-state="empty"] :is(.${NS$5}-handle,.${NS$5}-progress),
	.${NS$5}[data-state="pending"] :is(.${NS$5}-btn-clean, .${NS$5}-file, .${NS$5}-content),
	.${NS$5}[data-state="error"] :is(.${NS$5}-progress,.${NS$5}-btn-clean),
	.${NS$5}[data-state="normal"] :is(.${NS$5}-progress,.${NS$5}-btn-cancel),
	.${NS$5}[data-state="normal"] .${NS$5}-file:before{
		display:none;
	}
	
	.${NS$5}-handle{width:100%;position:absolute;padding:.25em;text-align:right;box-sizing:border-box;bottom:0;}
	.${NS$5}-content{width:100%;height:100%;}
	.${NS$5}-content img{display:inline-block;width:100%;height:100%;object-fit:cover;}
	
	.${NS$5}-progress{width:100%;height:100%;padding:0 .5em;display:flex;flex-direction:column;box-sizing:border-box;justify-content:center;align-items:center;font-size:0.9em;color:gray;user-select:none;}
	.${NS$5}-progress progress{width:100%; transition:all 1s linear}
	
	.${NS$5}-btn{display:inline-block;user-select:none;cursor:pointer;color:white;text-shadow:1px 1px 1px gray;opacity:0.7;}
	.${NS$5}-btn:hover{opacity:1;}
	.${NS$5}-btn:before{content:""; font-family:WebCom-iconfont, serif}
	.${NS$5}-btn-cancel:before{content:"\\e61a"}
	.${NS$5}-btn-clean:before{content:"\\e61b"}
`;
	const UPLOADER_IMAGE_DEFAULT_CLASS = `${NS$5}-image`;
	const UPLOADER_FILE_DEFAULT_CLASS = `${NS$5}-file`;
	const UPLOAD_STATE_EMPTY = 'empty';
	const UPLOAD_STATE_PENDING = 'pending';
	const UPLOAD_STATE_ERROR = 'error';
	const UPLOAD_STATE_NORMAL = 'normal';
	const FILE_TYPE_STATIC_IMAGE = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'];
	const FILE_TYPE_IMAGE = ['image/*'];
	const FILE_TYPE_VIDEO = ['video/*'];
	const FILE_TYPE_AUDIO = ['audio/*'];
	const FILE_TYPE_DOCUMENT = ['.txt', '.md', '.doc', '.docx'];
	const FILE_TYPE_SHEET = ['.xls', '.xlsx', '.csv'];
	const FILE_TYPE_ZIP = ['.7z', '.zip', '.rar'];
	const DEFAULT_REQUEST_HANDLE = (url, fileMap, callbacks) => {
		let n = Net.uploadFile(url, fileMap, null, {responseFormat: RESPONSE_FORMAT.JSON});
		n.onProgress.listen(callbacks.onProgress);
		n.onError.listen(callbacks.onError);
		n.onResponse.listen(rspObj => {
			if(rspObj.code === undefined || rspObj.message === undefined){
				callbacks.onError("{code, message} 字段必须提供（code=0表示成功）");
				return;
			}
			if(rspObj.code !== 0){
				callbacks.onError(rspObj.message);
				return;
			}
			callbacks.onSuccess({
				...rspObj.data,
				error: null
			});
		});
		return n.xhr;
	};
	const mergeNoNull = (target, source) => {
		for(let i in source){
			if(source[i] !== null){
				target[i] = source[i];
			}
		}
	};
	const abortUpload = up => {
		try{
			up.xhr && up.xhr.abort();
		}catch(err){
			console.error(err);
		}
		up.onAbort.fire();
		setState(up, up.value ? UPLOAD_STATE_NORMAL : UPLOAD_STATE_EMPTY);
	};
	const setState = (up, state, data = null) => {
		const fileEl = findOne('input[type=file]', up.dom);
		const contentCtn = findOne(`.${NS$5}-content`, up.dom);
		up.dom.setAttribute('data-state', state);
		up.dom.title = '';
		switch(state){
			case UPLOAD_STATE_EMPTY:
				fileEl.value = '';
				fileEl.required = !!fileEl.dataset.required;
				contentCtn.innerHTML = '';
				break;
			case UPLOAD_STATE_PENDING:
				break;
			case UPLOAD_STATE_NORMAL:
				fileEl.required = false;
				up.dom.title = up.name;
				up.dom.title = up.name;
				contentCtn.innerHTML = `<img alt="" src="${up.thumb}">`;
				break;
			case UPLOAD_STATE_ERROR:
				fileEl.value = '';
				fileEl.required = !!fileEl.dataset.required;
				setState(up, up.value ? UPLOAD_STATE_NORMAL : UPLOAD_STATE_EMPTY);
				break;
			default:
				throw "todo";
		}
	};
	const responseFormatValidate = response => {
		let vs = ['value', 'name', 'thumb', 'error'];
		if(typeof (response) !== 'object'){
			throw `文件上传返回结果必须是对象，包含 ${vs.join('、')} 属性`;
		}
		let objKeys = Object.keys(response);
		vs.forEach(v => {
			if(!objKeys.includes(v)){
				throw `文件上传返回对象必须包含 ${v} 属性`;
			}
		});
	};
	class Uploader {
		state = UPLOAD_STATE_EMPTY;
		xhr = null;
		dom = null;
		value = null;
		thumb = '';
		name = '';
		onSuccess = new BizEvent();
		onAbort = new BizEvent();
		onUploading = new BizEvent();
		onClean = new BizEvent();
		onError = new BizEvent();
		static globalUploadUrl = null;
		static globalRequestHandle = DEFAULT_REQUEST_HANDLE;
		option = {
			uploadUrl: null,
			uploadFileFieldName: 'file',
			required: false,
			allowFileTypes: [],
			fileSizeLimit: 0,
			requestHandle: null,
		};
		static bindInput(inputEl, initData = {}, option = {}){
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
				triggerDomEvent(inputEl, 'change');
			});
			if(inputEl.type !== 'file'){
				up.onSuccess.listen(data => {
					inputEl.value = data.value;
					triggerDomEvent(inputEl, 'change');
				});
			}
			return up;
		}
		constructor(container, initData = {}, option = {
			uploadUrl: null,
			required: null,
			fileSizeLimit: null,
			allowFileTypes: null,
		}){
			insertStyleSheet(STYLE_STR$2, Theme.Namespace + 'uploader');
			this.value = initData.value || '';
			this.thumb = initData.thumb || '';
			this.name = initData.name || '';
			mergeNoNull(this.option, option);
			const uploadUrl = this.option.uploadUrl || Uploader.globalUploadUrl;
			const requestHandle = this.option.requestHandle || Uploader.globalRequestHandle;
			if(!uploadUrl){
				throw "上传组件需要提供上传接口地址：option.uploadUrl 或者 Uploader.globalUploadUrl";
			}
			if(!requestHandle){
				throw "上传组件需要提供上传请求函数：option.requestHandle 或者 Uploader.globalRequestHandle"
			}
			this.onError.listen(err => {
				ToastClass.showError(err);
			});
			let acceptStr = this.option.allowFileTypes.join(',');
			const html =
				`<div class="${NS$5}" data-state="${this.state}">
			<label class="${NS$5}-file">
				<input type="file" tabindex="0" accept="${acceptStr}" data-required="${this.option.required ? 'required' : ''}">
			</label>
			<div class="${NS$5}-progress">
				<progress max="100" value="0">0%</progress>
				<span>0%</span>
			</div>
			<div class="${NS$5}-content"></div>
			<div class="${NS$5}-handle">
				<span tabindex="0" class="${NS$5}-btn ${NS$5}-btn-cancel" title="取消上传"></span>
				<span tabindex="0" class="${NS$5}-btn ${NS$5}-btn-clean" title="清除"></span>
			</div>
		</div>`;
			this.dom = createDomByHtml(html, container);
			const fileEl = findOne('input[type=file]', this.dom);
			bindNodeActive(findOne(`.${NS$5}-btn-clean`, this.dom), () => {
				setState(this, UPLOAD_STATE_EMPTY);
				this.onClean.fire();
			});
			bindNodeActive(findOne(`.${NS$5}-btn-cancel`, this.dom), () => {
				abortUpload(this);
			});
			setState(this, this.value ? UPLOAD_STATE_NORMAL : UPLOAD_STATE_EMPTY);
			fileEl.addEventListener('change', () => {
				let file = fileEl.files[0];
				if(file){
					if(file.size < 1){
						ToastClass.showError('所选的文件内容为空');
						return;
					}
					if(this.option.fileSizeLimit && file.size > this.option.fileSizeLimit){
						ToastClass.showError('所选的文件大小超出限制');
						return;
					}
					setState(this, UPLOAD_STATE_PENDING);
					this.onUploading.fire();
					this.xhr = requestHandle(isFunction(uploadUrl) ? uploadUrl() : uploadUrl, {[this.option.uploadFileFieldName]: file}, {
						onSuccess: rspObj => {
							try{
								responseFormatValidate(rspObj);
								let {value, thumb, name} = rspObj;
								this.value = value;
								this.thumb = thumb;
								this.name = name;
								setState(this, UPLOAD_STATE_NORMAL);
								this.onSuccess.fire(rspObj);
							}catch(err){
								setState(this, UPLOAD_STATE_ERROR, err);
								this.onError.fire(err);
							}
						},
						onProgress: (loaded, total) => {
							const progressEl = findOne('progress', this.dom);
							const progressPnt = findOne(`.${NS$5}-progress span`, this.dom);
							progressEl.value = loaded;
							progressEl.max = total;
							progressPnt.innerHTML = Math.round(100 * loaded / total) + '%';
							setState(this, UPLOAD_STATE_PENDING);
							this.onUploading.fire();
						},
						onError: (err) => {
							setState(this, UPLOAD_STATE_ERROR, err);
							this.onError.fire(err);
						},
						onAbort: () => {
							setState(this, UPLOAD_STATE_ERROR, '上传被中断');
							this.onAbort.fire();
						},
					});
				}
			});
		}
		abort(){
			abortUpload(this);
		}
		getValue(){
			return this.value;
		}
		getValueAsync(){
			return new Promise((resolve, reject) => {
				if(this.state !== UPLOAD_STATE_PENDING){
					resolve(this.getValue());
				}else {
					let success_handle = () => {
						resolve(this.getValue());
						this.onSuccess.remove(success_handle);
					};
					let error_handle = (msg) => {
						reject(msg);
						this.onError.remove(error_handle);
					};
					this.onSuccess.listen(success_handle);
					this.onError.listen(error_handle);
				}
			});
		}
	}

	const ASYNC_SUBMITTING_FLAG = 'data-submitting';
	const getSubmitterFormAction = (form, event = null) => {
		if(event && event.submitter && event.submitter.getAttribute('formaction')){
			return event.submitter.getAttribute('formaction');
		}
		return form.action;
	};
	class ACAsync {
		static REQUEST_FORMAT = REQUEST_FORMAT.JSON;
		static onSuccess = new BizEvent();
		static COMMON_SUCCESS_RESPONSE_HANDLE = (rsp) => {
			let next = () => {
				if(rsp.forward_url){
					parent.location.href = rsp.forward_url;
				}else {
					parent.location.reload();
				}
			};
			if(rsp.message){
				let tm = ToastClass.DEFAULT_TIME_MAP[ToastClass.TYPE_SUCCESS];
				ToastClass.showToast(rsp.message, ToastClass.TYPE_SUCCESS, tm);
				setTimeout(next, Math.max(tm - 500, 0));
			}else {
				next();
			}
		}
		static active(node, param, event){
			return new Promise((resolve, reject) => {
				event.preventDefault();
				if(node.getAttribute(ASYNC_SUBMITTING_FLAG)){
					return;
				}
				let url, data, method,
					requestFormat = param.requestformat ? param.requestformat.toUpperCase() : ACAsync.REQUEST_FORMAT,
					onsuccess = ACAsync.COMMON_SUCCESS_RESPONSE_HANDLE,
					submitter = null;
				if(param.onsuccess){
					if(typeof (param.onsuccess) === 'string'){
						onsuccess = window[param.onsuccess];
					}else {
						onsuccess = param.onsuccess;
					}
				}
				method = param.method;
				if(node.tagName === 'FORM'){
					url = getSubmitterFormAction(node, event);
					submitter = event.submitter;
					data = requestFormat === REQUEST_FORMAT.JSON ? formSerializeJSON(node) : formSerializeString(node);
					method = method || node.method;
				}else if(node.tagName === 'A'){
					url = node.href;
				}
				url = param.url || url;
				data = param.data || data;
				method = HTTP_METHOD.resolve(method);
				let loader = ToastClass.showLoadingLater('正在请求中，请稍候···');
				node.setAttribute(ASYNC_SUBMITTING_FLAG, '1');
				submitter && submitter.setAttribute(ASYNC_SUBMITTING_FLAG, '1');
				let sender = method === HTTP_METHOD.GET ? Net.get : Net.post;
				sender(url, data, {requestFormat, responseFormat:RESPONSE_FORMAT.JSON}).then(rsp => {
					if(rsp.code === 0){
						ACAsync.onSuccess.fire(node, rsp);
						onsuccess(rsp);
						resolve();
					}else {
						console.error('Request Error:', url, data, method, rsp);
						ToastClass.showError(rsp.message || '系统错误');
						reject(`系统错误(${rsp.message})`);
					}
				}, err => {
					ToastClass.showError(err);
					reject(err);
				}).finally(() => {
					node.removeAttribute(ASYNC_SUBMITTING_FLAG);
					submitter && submitter.removeAttribute(ASYNC_SUBMITTING_FLAG);
					loader && loader.hide();
				});
			})
		}
	}

	const NS$4 = Theme.Namespace + 'ac-batch-filler';
	const SUPPORT_INPUT_TYPES = [
		'color',
		'date',
		'datetime',
		'datetime-local',
		'month',
		'week',
		'time',
		'email',
		'number',
		'password',
		'range',
		'search',
		'tel',
		'text',
		'url',
	];
	const KEEP_ATTRIBUTES = ['type', 'required', 'pattern', 'placeholder', 'size', 'maxlength', 'title', 'min', 'max', 'step', 'multiple'];
	const cloneElementAsHtml = (el, newId = '') => {
		let keep_attr_str = [];
		if(newId){
			keep_attr_str.push(`id="${escapeAttr(newId)}"`);
		}
		KEEP_ATTRIBUTES.forEach(attr_name => {
			if(el.hasAttribute(attr_name)){
				let attr_val = el.getAttribute(attr_name);
				keep_attr_str.push(attr_val !== null ? `${attr_name}="${escapeAttr(attr_val)}"` : attr_name);
			}
		});
		switch(el.tagName){
			case 'SELECT':
				let option_html = '';
				Array.from(el.options).forEach(opt => {
					option_html +=
						`<option value="${escapeAttr(opt.value) || ''}" ${opt.disabled ? 'disabled' : ''}>
						${escapeHtml(opt.innerText)}
					</option>`;
				});
				return `<select ${keep_attr_str.join(' ')}>${option_html}</select>`;
			case 'INPUT':
				if(SUPPORT_INPUT_TYPES.includes(el.type.toLowerCase())){
					return `<input ${keep_attr_str.join(' ')}>`;
				}
				throw "no support type" + el.type;
			case 'TEXTAREA':
				return `<textarea ${keep_attr_str.join(' ')}></textarea>`;
			default:
				throw "no support type" + el.type;
		}
	};
	const initElement = el => {
		if(el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')){
			el.checked = false;
		}else if(el.tagName === 'SELECT'){
			Array.from(el.options).forEach(opt => {
				opt.selected = false;
			});
		}else {
			el.value = '';
		}
	};
	const syncValue = (fromEl, toEl) => {
		if(fromEl.tagName === 'INPUT' && (fromEl.type === 'checkbox' || fromEl.type === 'radio')){
			toEl.checked = fromEl.checked;
		}else if(fromEl.tagName === 'SELECT' && fromEl.multiple){
			Array.from(toEl.options).forEach(opt => {
				opt.selected = false;
			});
			Array.from(fromEl.selectedOptions).forEach(opt => {
				Array.from(toEl.options)[opt.index].selected = true;
			});
		}else {
			toEl.value = fromEl.value;
		}
	};
	class ACBatchFiller {
		static active(node, param, event){
			return new Promise((resolve, reject) => {
				let relative_elements = findAll(param.relative_elements);
				if(!relative_elements.length){
					throw "param.selector or param.container_selector required";
				}
				relative_elements = relative_elements.filter(el => {
					return el.type !== 'BUTTON' && el.type !== 'RESET' && el.tagName !== 'BUTTON';
				});
				if(!relative_elements.length){
					ToastClass.showInfo("没有可以填写的输入框");
					return;
				}
				let id = guid(NS$4);
				let shadow_el_html = cloneElementAsHtml(relative_elements[0], id);
				let el, dlg, form;
				let label_html = param.title || '批量设置';
				let doFill = () => {
					relative_elements.forEach(element => {
						syncValue(el, element);
						triggerDomEvent(element, 'change');
					});
					dlg.close();
				};
				dlg = DialogClass.show('',
`
<style>
.${NS$4} {padding:2em 2em 1em 2em}
.${NS$4} label {font-size:1.1em; margin-bottom:.75em; display:block;}
.${NS$4} input,
.${NS$4} textarea,
.${NS$4} select {width:100% !important; box-sizing:border-box; min-height:2.25em;}
.${NS$4} textarea {min-height:5em; resize:vertical}
</style>
<form class="${NS$4}">
	<label for="${id}">${label_html}</label>
	<div>${shadow_el_html}</div>
</form>`	, {
						width: 350,
						buttons: [
							{
								default: true,
								title: '确定', callback: () => {
									doFill();
									dlg.close();
								}
							},
							{title: '关闭', className: DLG_CLS_WEAK_BTN, ariaLabel: 'Close'}
						]
					});
				el = getAvailableElements(dlg.dom, true)[0];
				el.focus();
				initElement(el);
				form = dlg.dom.querySelector('form');
				form.addEventListener('submit', doFill);
				resolve();
			});
		}
	}

	const findParentTBody = (node) => {
		let tbody = node.closest('tbody') || findOne('tbody', node.closest('table')) || node.closest('table');
		if(!tbody){
			throw "no table body found";
		}
		return tbody;
	};
	const nodeInColumnIndex = (node) => {
		let column_index = 0;
		if(node.closest('th')){
			column_index = nodeIndex(node.closest('th'));
		}else if(node.closest('td')){
			column_index = nodeIndex(node.closest('td'));
		}else {
			throw "column index no detected";
		}
		return column_index;
	};
	class ACColumnFiller {
		static active(node, param, event){
			const tbody = findParentTBody(node);
			let column_idx = nodeInColumnIndex(node);
			let relative_elements = [];
			findAll('tr>td, tr>th', tbody).forEach(cell => {
				if(nodeIndex(cell) === column_idx){
					relative_elements.push(getAvailableElements(cell, true)[0]);
				}
			});
			param.relative_elements = relative_elements;
			return ACBatchFiller.active(node, param);
		}
	}

	class ACConfirm {
		static active(node, param, event){
			return new Promise((resolve, reject) => {
				let title = param.title;
				let message = param.message || '确认进行该项操作？';
				event.preventDefault();
				DialogClass.confirm(title || '确认', message).then(resolve, reject);
			});
		}
	}

	const NS$3 = Theme.Namespace + 'ac-copy';
	class ACCopy {
		static TRIGGER_SELF = 1;
		static TRIGGER_INSIDE = 2;
		static COPY_CLASS = NS$3;
		static init(node, param = {}){
			insertStyleSheet(`
			.${NS$3} {cursor:pointer; opacity:0.7; margin-left:0.2em;}
			.${NS$3}:hover {opacity:1}
			.${NS$3}:before {font-family:"${Theme.IconFont}", serif; content:"\\e6ae"}
		`, Theme.Namespace + 'ac-copy');
			let trigger = node;
			if((!param.trigger && PAIR_TAGS.includes(node.tagName)) ||
				(param.trigger && param.trigger === ACCopy.TRIGGER_INSIDE)){
				trigger = createDomByHtml(`<span class="${ACCopy.COPY_CLASS}" tabindex="1" title="复制"></span>`, node);
			}
			bindNodeActive(trigger, e => {
				let content = param.content || node.innerText;
				copy(content, true);
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		}
	}

	class ACDialog {
		static active(node, param, event){
			return new Promise((resolve, reject) => {
				let title, url, content;
				if(node.tagName === 'A'){
					event.preventDefault();
					url = node.href || url;
					title = node.title || title;
				}
				if(node.innerText){
					title = cutString(node.innerText, 30);
				}
				title = param.title || title;
				url = param.url || url;
				content = param.content || content;
				if(url){
					content = {src: url};
				}
				DialogClass.show(title || '对话框', content, param);
				resolve();
			})
		}
	}

	class ACHighlight {
		static cssClass = 'highlight';
		static init(node, params = {}){
			let kw = (params.keyword || params.kw || '').trim();
			if(kw){
				nodeHighlight(node, kw, ACHighlight.cssClass);
			}
		}
	}

	const NS$2 = Theme.Namespace + 'ac-inline-editor-';
	const patchStyle = () => {
		insertStyleSheet(`
		.${NS$2}view-wrap {cursor:pointer}
		.${NS$2}view-wrap:hover:after {opacity:1; color:var(--color-link)}
		.${NS$2}view-wrap:after {content:"\\e7a0";font-family:${Theme.IconFont};transform: scale(1.2);display: inline-block;margin-left: 0.25em;opacity: 0.3;}
		
		.${NS$2}editor-wrap {
		    display:inline-flex;
		    align-items:center;
		    gap:0.25em;
		}
		.${NS$2}save-btn,
		.${NS$2}cancel-btn {
		    display: inline-flex;
		    border: 1px solid gray;
		    align-items: center;
		    height: var(--element-height);
		    width: var(--element-height);
		    justify-content: center;
		    border-radius: var(--panel-radius);
		    line-height: 90%;
		    box-sizing: border-box;
		    zoom: 0.92;
		    cursor: pointer;
		}
		.${NS$2}save-btn:before {content:"\\e624"; font-family:${Theme.IconFont}}
		.${NS$2}cancel-btn:before {content:"\\e61a"; font-family:${Theme.IconFont}}
	`, NS$2 + 'style');
	};
	const SELECT_PLACEHOLDER_VALUE = NS$2 + guid();
	const renderView = (container, type, value, options = []) => {
		let html = '';
		switch (type) {
			case ACInlineEditor.TYPE_TEXT:
			case ACInlineEditor.TYPE_NUMBER:
			case ACInlineEditor.TYPE_DATE:
			case ACInlineEditor.TYPE_TIME:
			case ACInlineEditor.TYPE_DATETIME:
				html = escapeHtml(value);
				break;
			case ACInlineEditor.TYPE_MULTILINE_TEXT:
				html = escapeHtml(value).replace(/\n/g, '<br>');
				break;
			case ACInlineEditor.TYPE_OPTION_SELECT:
			case ACInlineEditor.TYPE_OPTION_RADIO:
				let opt = options.find(opt=>opt.value === value);
				html = escapeHtml(opt ? (opt?.text || '') : value);
				break;
			case ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT:
			case ACInlineEditor.TYPE_OPTION_CHECKBOX:
				let text_list = [];
				options.forEach(opt=>{
					if(opt.value === value){
						text_list.push(escapeHtml(opt.text));
					}
				});
				html = text_list.length ? text_list.join(',') : escapeHtml(value);
				break;
			default:
				throw `未知的编辑器类型：${type}`;
		}
		container.innerHTML = html;
	};
	const renderElement = (container, type, name, value, options = [], required = false) => {
		const INPUT_TYPE_MAP = {
			[ACInlineEditor.TYPE_TEXT]: 'text',
			[ACInlineEditor.TYPE_NUMBER]: 'number',
			[ACInlineEditor.TYPE_DATE]: 'date',
			[ACInlineEditor.TYPE_TIME]: 'time',
			[ACInlineEditor.TYPE_DATETIME]: 'datetime-local',
		};
		const REQUIRED_MESSAGES = {
			[ACInlineEditor.TYPE_TEXT]: '此项为必填项',
			[ACInlineEditor.TYPE_NUMBER]: '此项为必填项',
			[ACInlineEditor.TYPE_DATE]: '此项为必填项',
			[ACInlineEditor.TYPE_TIME]: '此项为必填项',
			[ACInlineEditor.TYPE_DATETIME]: '此项为必填项',
			[ACInlineEditor.TYPE_MULTILINE_TEXT]: '此项为必填项',
			[ACInlineEditor.TYPE_OPTION_SELECT]: '请选择一项',
			[ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT]: '请选择一项',
			[ACInlineEditor.TYPE_OPTION_RADIO]: '请选择一项',
			[ACInlineEditor.TYPE_OPTION_CHECKBOX]: '请选择一项',
		};
		let html = '';
		switch (type) {
			case INPUT_TYPE_MAP[type]:
				html = `<input type="${INPUT_TYPE_MAP[type]}" name="${escapeAttr(name)}" value="${escapeAttr(value)}" ${required ? 'required' : ''}/>`;
				break;
			case ACInlineEditor.TYPE_MULTILINE_TEXT:
				let v = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
				html = `<textarea name="${escapeAttr(name)}" ${required ? 'required' : ''}>${v}</textarea>`;
				break;
			case ACInlineEditor.TYPE_OPTION_SELECT:
				let option_html = '';
				if (!required) {
					option_html = `<option value="${SELECT_PLACEHOLDER_VALUE}">请选择</option>`;
				}
				option_html = options.map(option => `<option value="${escapeAttr(option.value)}" ${option.value == value ? 'selected' : ''}>
					${escapeHtml(option.text)}
				</option>`).join('');
				html = `<select name="${escapeAttr(name)}" ${required ? 'required' : ''}>${option_html}</select>`;
				break;
			case ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT:
				html = `<select name="${escapeAttr(name)}" multiple ${required ? 'required' : ''}>${value.map(option => `<option value="${escapeAttr(option.value)}">${escapeHtml(option.text)}</option>`).join('')}</select>`;
				break;
			case ACInlineEditor.TYPE_OPTION_RADIO:
				html = options.map(option => `<label><input type="radio" name="${escapeAttr(name)}" value="${escapeAttr(option.value)}" ${option.value == value ? 'checked' : ''}>${escapeHtml(option.text)}</label>`).join('');
				break;
			case ACInlineEditor.TYPE_OPTION_CHECKBOX:
				html = options.map(option => `<label><input type="checkbox" name="${escapeAttr(name)}" value="${escapeAttr(option.value)}" ${value.includes(option.value) ? 'checked' : ''}>${escapeHtml(option.text)}</label>`).join('');
				break;
			default:
				throw `未知的编辑器类型：${type}`;
		}
		createDomByHtml(html, container);
		return () => {
			let error = null;
			let value = null;
			let elements = container.querySelectorAll('input,textarea,select');
			switch (type) {
				case INPUT_TYPE_MAP[type]:
				case ACInlineEditor.TYPE_MULTILINE_TEXT:
				case ACInlineEditor.TYPE_OPTION_SELECT:
					value = elements[0].value;
					if (required && (!value || value == SELECT_PLACEHOLDER_VALUE)) {
						error = REQUIRED_MESSAGES[type];
						break;
					}
					break;
				case ACInlineEditor.TYPE_MULTIPLE_OPTION_SELECT:
					if (required && !elements[0].selectedOptions.length) {
						error = REQUIRED_MESSAGES[type];
						break;
					}
					value = Array.from(elements[0].selectedOptions).map(option => option.value);
					break;
				case ACInlineEditor.TYPE_OPTION_RADIO:
					if (required && !Array.from(elements).some(el => el.checked)) {
						error = REQUIRED_MESSAGES[type];
						break;
					}
					value = Array.from(elements).find(el => el.checked).value;
					break;
				case ACInlineEditor.TYPE_OPTION_CHECKBOX:
					if (required && !Array.from(elements).some(el => el.checked)) {
						error = REQUIRED_MESSAGES[type];
						break;
					}
					value = Array.from(elements).filter(el => el.checked).map(el => el.value);
					break;
				default:
					throw `未知的编辑器类型：${type}`;
			}
			return [value, error];
		}
	};
	class ACInlineEditor {
		static TYPE_TEXT = 'text';
		static TYPE_NUMBER = 'number';
		static TYPE_DATE = 'date';
		static TYPE_TIME = 'time';
		static TYPE_DATETIME = 'datetime';
		static TYPE_MULTILINE_TEXT = 'multiline_text';
		static TYPE_OPTION_SELECT = 'select';
		static TYPE_MULTIPLE_OPTION_SELECT = 'multiple_option';
		static TYPE_OPTION_RADIO = 'radio';
		static TYPE_OPTION_CHECKBOX = 'checkbox';
		static transmitter;
		static onUpdate = new BizEvent();
		static init(container, param) {
			const action = param.action;
			const method = param.method;
			const required = !!param.required;
			const name = param.name;
			const type = param.type ? String(param.type) : this.TYPE_TEXT;
			let value = param.value;
			if (value == null && [
				ACInlineEditor.TYPE_TEXT,
				ACInlineEditor.TYPE_NUMBER,
				ACInlineEditor.TYPE_DATE,
				ACInlineEditor.TYPE_TIME,
				ACInlineEditor.TYPE_DATETIME
			].includes(type)) {
				value = container.innerText.trim();
			}
			if (value == null && ACInlineEditor.TYPE_MULTILINE_TEXT === type) {
				value = unescapeHtml(container.innerHTML.trim());
			}
			let options = param.options || [
			];
			patchStyle();
			container.innerHTML = `
			<span class="${NS$2}editor-wrap" tabindex="0"></span>
			<span class="${NS$2}view-wrap" style="display:none"></span>`;
			let view_wrap = container.querySelector(`.${NS$2}view-wrap`);
			let editor_wrap = container.querySelector(`.${NS$2}editor-wrap`);
			const toggleState = toEdit => {
				toEdit ? show(editor_wrap) : hide(editor_wrap);
				!toEdit ? show(view_wrap) : hide(view_wrap);
			};
			const toEdit = () => {
				editor_wrap.innerHTML = '';
				createDomByHtml(`
						<span class="${NS$2}editor-text"></span>
						<span class="${NS$2}save-btn" tabindex="0"></span>
						<span class="${NS$2}cancel-btn" tabindex="0"></span>
					`, editor_wrap);
				const save_btn = editor_wrap.querySelector(`.${NS$2}save-btn`);
				const cancel_btn = editor_wrap.querySelector(`.${NS$2}cancel-btn`);
				const getVal = renderElement(editor_wrap.querySelector(`.${NS$2}editor-text`), type, name, value, options, required);
				setTimeout(() => {
					editor_wrap.querySelector('input,textarea,select').focus();
				});
				const doSave = () => {
					let [val, error] = getVal();
					if (error) {
						ToastClass.error(error);
						return;
					}
					if (!this.transmitter) {
						throw "ACInlineEditor.transmitter 未配置";
					}
					value = val;
					this.transmitter(action, { [name]: value }, method).then(() => {
						this.onUpdate.fire(name, value);
						renderView(view_wrap, type, value, options);
						toggleState(false);
					});
				};
				bindNodeActive(cancel_btn, () => { toggleState(false); });
				bindNodeActive(save_btn, doSave);
				toggleState(true);
			};
			bindNodeActive(view_wrap, toEdit);
			renderView(view_wrap, type, value, options);
			toggleState(false);
		}
	}

	class ACMultiSelectRelate {
		static init(node, params = {}){
			const container = findOne(params.container || 'body');
			const orgUrl = node.href || node.formAction;
			const patchDataUri = () => {
				if(node.href || node.formAction){
					let data_str = [];
					findAll('input:checked', container).forEach(chk => {
						data_str.push(encodeURIComponent(chk.name) + '=' + encodeURIComponent(chk.value));
					});
					data_str = data_str.join('&');
					if(node.formAction){
						node.formAction = mergerUriParam(orgUrl, data_str);
					}else {
						node.href = mergerUriParam(orgUrl, data_str);
					}
				}
			};
			domChangedWatch(container, 'input:checked', coll => {
				const toEnabled = !!coll.length;
				toggleDisabled(node, '', toEnabled);
				node.title = toEnabled ? '' : '请选择要操作的项目';
				if(toEnabled){
					patchDataUri();
				}
			});
		}
	}

	class ACPreview {
		static init(node, param = {}){
			let watchSelector = param.watch;
			if(watchSelector){
				eventDelegate(node, watchSelector, 'click', (e, clickNode) => {
					let currentIndex = 0,
						currentSrc = resolveSrc(clickNode),
						imgSrcList = [];
					node.querySelectorAll(watchSelector).forEach((n, idx) => {
						let src = resolveSrc(n);
						if(src === currentSrc){
							currentIndex = idx;
						}
						imgSrcList.push(src);
					});
					showImgListPreviewFn(imgSrcList, currentIndex);
				});
			}
		}
		static active(node, param, event){
			return new Promise((resolve, reject) => {
				if(param.watch){
					resolve();
					return;
				}
				let src = param.src || resolveSrc(node);
				let selector = param.selector;
				if(!src){
					console.warn('image preview src empty', node);
					return;
				}
				event.preventDefault();
				if(selector){
					let index = 0, imgSrcList = [];
					findAll(selector).forEach((n, idx) => {
						if(node === n){
							index = idx;
						}
						imgSrcList.push(resolveSrc(n));
					});
					showImgListPreviewFn(imgSrcList, index);
				}else {
					showImgPreviewFn(src);
				}
				resolve();
			});
		}
	}
	const resolveSrc = (node) => {
		let src = node.dataset.src;
		if(node.tagName === 'IMG'){
			if(!src && node.srcset){
				src = getHighestResFromSrcSet(node.srcset);
			}
			src = src || node.src || node.dataset.src;
		}else if(!src && node.tagName === 'A'){
			src = node.href;
		}
		return src;
	};

	class ACSelect {
		static init(node, params){
			if(params.displaysearchinput !== undefined){
				params.displaySearchInput = !!params.displaysearchinput;
			}
			if(node.tagName === 'SELECT'){
				Select.bindSelect(node, params);
			}else if(node.tagName === 'INPUT' && node.list){
				Select.bindTextInput(node, params);
			}
		}
	}

	const UI_STATE_ACTIVE = 'active';
	const UI_STATE_INACTIVE = 'inactive';
	const STATE_NORMAL = 'normal';
	const STATE_OVERLOAD = 'overload';
	const MAIN_CLASS = Theme.Namespace + 'text-counter';
	const STYLE_STR$1 = `
	.${MAIN_CLASS} {pointer-events:none; margin-left:0.5em; user-select:none;}
	.${MAIN_CLASS}[data-state="${STATE_NORMAL}"][data-ui-state="${UI_STATE_INACTIVE}"] {opacity:0.5}
	.${MAIN_CLASS}[data-state="${STATE_NORMAL}"][data-ui-state="${UI_STATE_ACTIVE}"] {}
	.${MAIN_CLASS}[data-state="${STATE_OVERLOAD}"][data-ui-state="${UI_STATE_INACTIVE}"] {opacity:0.8; color:red}
	.${MAIN_CLASS}[data-state="${STATE_OVERLOAD}"][data-ui-state="${UI_STATE_ACTIVE}"] {color:red}
`;
	class ACTextCounter {
		static init(input, params = {}){
			insertStyleSheet(STYLE_STR$1, Theme.Namespace + 'text-counter');
			let maxlength = parseInt(Math.max(input.maxLength, 0) || params.maxlength, 10) || 0;
			let trim = params.trim;
			if(!maxlength){
				console.debug('no maxlength set');
			}
			const trigger = createDomByHtml(`<span class="${MAIN_CLASS}" data-state="${STATE_NORMAL}" data-ui-state="${UI_STATE_INACTIVE}">0/${maxlength}</span>`);
			const updState = () => {
				let len = trim ? input.value.trim().length : input.value.length;
				let state = (maxlength && len > maxlength) ? STATE_OVERLOAD : STATE_NORMAL;
				trigger.setAttribute('data-state', state);
				trigger.innerHTML = maxlength ? (len + '/' + maxlength) : len;
			};
			input.parentNode.insertBefore(trigger, input.nextSibling);
			input.addEventListener('focus', () => {
				trigger.setAttribute('data-ui-state', UI_STATE_ACTIVE);
			});
			input.addEventListener('blur', () => {
				trigger.setAttribute('data-ui-state', UI_STATE_INACTIVE);
			});
			input.addEventListener('input', updState);
			updState();
		}
	}

	class ACTip {
		static init(node, params){
			let {content, triggertype = 'hover'} = params;
			if(!content && node.title){
				content = node.title;
				node.title = '';
			}
			if(!content){
				throw 'content required';
			}
			Tip.bindNode(content, node, {triggerType: triggertype});
		}
	}

	class ACToast {
		static active(node, param, event){
			return new Promise((resolve, reject) => {
				event.preventDefault();
				let message = param.message || '提示信息';
				let type = param.type || ToastClass.TYPE_INFO;
				ToastClass.showToast(message, type, ToastClass.DEFAULT_TIME_MAP[type], resolve);
			});
		}
	}

	class ACUnSaveAlert {
		static init(form, params = {}){
			let msg = params.message || null;
			ACAsync.onSuccess.listen((node, rsp) => {
				if(node === form){
					resetFormChangedState(node);
				}
			});
			bindFormUnSavedUnloadAlert(form, msg);
		}
	}

	class ACUploader {
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

	const NS$1 = Theme.Namespace + 'ac-view-copy';
	class ACViewCopy {
		static init(node, param){
			insertStyleSheet(`
			.${NS$1}-txt-wrap {padding:0.5em 1em;}
			.${NS$1}-txt {width:100%; box-sizing:border-box; min-height:12em; resize:vertical;}
		`, NS$1);
		}
		static active(node, param){
			return new Promise(resolve => {
				if(!param.content){
					console.error('没有内容', param);
					return;
				}
				let extButtons = [];
				if(param.file !== undefined){
					let fileName = param.file || '文件.txt';
					extButtons = [{title:"下载", callback:()=>{
						downloadString(param.content, fileName);
					}}];
				}
				let html =
`<div class="${NS$1}-txt-wrap">
	<textarea readonly class="${NS$1}-txt"></textarea>
</div>`	;
				let txt = null;
				let dlg = DialogClass.show('复制', html, {
					buttons:[
						{title:"复制内容", callback:()=>{
							try{
								txt.select();
								document.execCommand('copy');
								ToastClass.showSuccess(trans('内容已复制到剪贴板'));
							}catch(err){
								console.error(err);
								ToastClass.showWarning('复制失败，请手工复制');
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

	const TYPE_TIME = 'time';
	const TYPE_DATE = 'date';
	const TYPE_DATETIME = 'datetime';
	const TYPE_YEAR = 'year';
	const NOW = (new Date).getTime();
	const TYPE_MAP = {
		[TYPE_TIME]: [
			['近1分钟', () => {
				return [formatDate('H:i:s', NOW - ONE_MINUTE), formatDate('H:i:s')]
			}],
			['近10分钟', () => {
				return [formatDate('H:i:s', NOW - ONE_MINUTE * 10), formatDate('H:i:s')]
			}],
			['近30分钟', () => {
				return [formatDate('H:i:s', NOW - ONE_MINUTE * 30), formatDate('H:i:s')]
			}],
			'-',
			['近1个小时', () => {
				return [formatDate('H:i:s', NOW - ONE_HOUR), formatDate('H:i:s')]
			}],
			['近2个小时', () => {
				return [formatDate('H:i:s', NOW - ONE_HOUR * 2), formatDate('H:i:s')]
			}],
			['近3个小时', () => {
				return [formatDate('H:i:s', NOW - ONE_HOUR * 3), formatDate('H:i:s')]
			}],
			'-',
			['今日0点 - 现在', () => {
				return ['00:00:00', formatDate('H:i:s')]
			}],
		],
		[TYPE_DATE]: [
			['今天', () => {
				return [formatDate('Y-m-d'), formatDate('Y-m-d')]
			}],
			['昨天', () => {
				return [formatDate('Y-m-d', NOW - ONE_DAY), formatDate('Y-m-d', NOW - ONE_DAY)];
			}],
			['前天', () => {
				return [formatDate('Y-m-d', NOW - ONE_DAY * 2), formatDate('Y-m-d', NOW - ONE_DAY * 2)];
			}],
			'-',
			['昨天 - 今天', () => {
				return [formatDate('Y-m-d', NOW - ONE_DAY), formatDate('Y-m-d')];
			}],
			['前天 - 今天', () => {
				return [formatDate('Y-m-d', NOW - ONE_DAY * 2), formatDate('Y-m-d')];
			}],
			['本月1日 - 今天', () => {
				return [formatDate('Y-m-01', NOW - ONE_DAY), formatDate('Y-m-d')];
			}],
			['今年1月1日 - 今天', () => {
				return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
			}],
			'-',
		],
		[TYPE_DATETIME]: [
			['近1分钟', () => {
				return [formatDate('Y-m-d H:i:s', NOW - ONE_MINUTE), formatDate('Y-m-d H:i:s')]
			}],
			['近10分钟', () => {
				return [formatDate('Y-m-d H:i:s', NOW - ONE_MINUTE * 10), formatDate('Y-m-d H:i:s')]
			}],
			['近30分钟', () => {
				return [formatDate('Y-m-d H:i:s', NOW - ONE_MINUTE * 30), formatDate('Y-m-d H:i:s')]
			}],
			'-',
			['近1个小时', () => {
				return [formatDate('Y-m-d H:i:s', NOW - ONE_HOUR), formatDate('Y-m-d H:i:s')]
			}],
			['近2个小时', () => {
				return [formatDate('Y-m-d H:i:s', NOW - ONE_HOUR * 2), formatDate('Y-m-d H:i:s')]
			}],
			['近3个小时', () => {
				return [formatDate('Y-m-d H:i:s', NOW - ONE_HOUR * 3), formatDate('Y-m-d H:i:s')]
			}],
			'-',
			['今天', () => {
				return [formatDate('Y-m-d 00:00:00'), formatDate('Y-m-d H:i:s')]
			}],
			['昨天', () => {
				return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY), formatDate('Y-m-d 23:59:59')];
			}],
			['前天', () => {
				return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY * 2), formatDate('Y-m-d', NOW - ONE_DAY * 2)];
			}],
			'-',
			['昨天 - 今天', () => {
				return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY), formatDate('Y-m-d H:i:s')];
			}],
			['前天 - 今天', () => {
				return [formatDate('Y-m-d 00:00:00', NOW - ONE_DAY * 2), formatDate('Y-m-d H:i:s')];
			}],
			['本月1日 - 今天', () => {
				return [formatDate('Y-m-01 00:00:00'), formatDate('Y-m-d H:i:s')];
			}],
			['今年1月1日 - 今天', () => {
				return [formatDate('Y-01-01 00:00:00'), formatDate('Y-m-d H:i:s')];
			}],
			'-',
			['上一周', () => {
				return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
			}],
			['上一个月', () => {
				return [formatDate('Y-01-01', NOW - ONE_DAY), formatDate('Y-m-d')];
			}],
		],
		[TYPE_YEAR]: [
			[formatDate('Y') + ' 年', () => {
				return [formatDate('Y'), formatDate('Y')];
			}],
			[(new Date).getFullYear() - 1 + ' 年', () => {
				return [(new Date).getFullYear() - 1, (new Date).getFullYear() - 1];
			}],
			[(new Date).getFullYear() - 2 + ' 年', () => {
				return [(new Date).getFullYear() - 2, (new Date).getFullYear() - 2];
			}],
			'-',
			[(new Date).getFullYear() - 1 + ' - ' + formatDate('Y') + ' (去年至今)', () => {
				return [(new Date).getFullYear() - 1, formatDate('Y')];
			}],
			[(new Date).getFullYear() - 2 + ' - ' + formatDate('Y') + ' (前年至今)', () => {
				return [(new Date).getFullYear() - 2, (new Date).getFullYear() - 2];
			}],
			[(new Date).getFullYear() - 5 + ' - ' + formatDate('Y') + ' (过去5年)', () => {
				return [(new Date).getFullYear() - 5, formatDate('Y')];
			}],
		]
	};
	const resolveType = input => {
		switch(input.type){
			case 'date':
				return TYPE_DATE;
			case 'datetime-local':
			case 'datetime':
				return TYPE_DATETIME;
			case 'time':
				return TYPE_TIME;
			default:
				console.error("No Supported Type:", input);
				return null;
		}
	};
	class ACDateRangeSelector {
		static WEEK_START = 1;
		static init(node, params = {}){
			let inputs = [];
			let target = params.target;
			if(target){
				inputs = document.querySelectorAll(target);
			}else {
				inputs = node.parentNode.querySelectorAll('input');
			}
			if(inputs.length < 2){
				throw "No date inputs found.";
			}
			let type = params.type || resolveType(inputs[0]);
			if(!type){
				return;
			}
			let commands = [];
			TYPE_MAP[type].forEach(item => {
				if(item === '-'){
					commands.push(item);
				}else {
					let [title, timesFetcher] = item;
					commands.push([title, () => {
						let [st, ed] = timesFetcher();
						inputs[0].value = st;
						triggerDomEvent(inputs[0], 'change');
						inputs[1].value = ed;
						triggerDomEvent(inputs[1], 'change');
					}, false]);
				}
			});
			bindTargetMenu(node, commands, {triggerType: 'mouseover'});
		}
	}

	const HOTKEY_TIP_CLASS = Theme.Namespace + 'hotkey-tip';
	const HOTKEY_TIP_ATTR_ID = 'data-hotkey-tip-id';
	let hk_tip_bind = false;
	let hk_tip_is_hide = true;
	const STYLE_STR = `
.${HOTKEY_TIP_CLASS} {
	position:absolute; 
	background-color:#ffffffd9; 
	border:1px solid gray; 
	user-select:none; 
	border-radius:4px; 
	padding:0.1em 0.25em; 
	box-sizing:border-box; 
	margin-top:-0.2em; 
	box-shadow:1px 1px 5px 0px #5c5c5c7a;
	text-shadow:1px 1px 1px white;
}`;
	class ACHotKey {
		static TOGGLE_HOTKEY_TIP = true;
		static init(node, param = {}){
			insertStyleSheet(STYLE_STR, Theme.Namespace+'-hotkey');
			if(!hk_tip_bind && ACHotKey.TOGGLE_HOTKEY_TIP){
				hk_tip_bind = true;
				bindHotKeys('alt', e => {
					if(hk_tip_is_hide){
						ACHotKey.showAllHotKeyTips();
					}else {
						ACHotKey.hideAllHotKeyTips();
					}
					hk_tip_is_hide = !hk_tip_is_hide;
				});
				document.addEventListener('click', ACHotKey.hideAllHotKeyTips);
			}
			if(!param.key){
				throw 'param.key required';
			}
			bindHotKeys(param.key, e => {
				node.focus();
				node.click();
			});
		}
		static showAllHotKeyTips(){
			findAll('[data-hotkey-key]').forEach(node => {
				ACHotKey.showHotKeyTip(node);
			});
		}
		static hideAllHotKeyTips(){
			findAll(`.${HOTKEY_TIP_CLASS}`).forEach(tip => {
				hide(tip);
			});
		}
		static hideHotKeyTip(node){
			let tip_id = node.getAttribute(HOTKEY_TIP_ATTR_ID);
			if(tip_id){
				hide(findOne('#' + tip_id));
			}
		}
		static showHotKeyTip(node){
			if(node.offsetParent === null){
				return;
			}
			let tip_id = node.getAttribute(HOTKEY_TIP_ATTR_ID);
			let tip = null;
			if(tip_id){
				tip = findOne('#' + tip_id);
			}else {
				tip_id = guid('hotkey-tip-');
				node.setAttribute(HOTKEY_TIP_ATTR_ID, tip_id);
			}
			if(!tip){
				let key = node.getAttribute('data-hotkey-key');
				tip = createDomByHtml(`<div class="${HOTKEY_TIP_CLASS}" id="${tip_id}">${key}</div>`, document.body);
			}
			tip.style.visibility = 'hidden';
			let rect = node.getBoundingClientRect();
			tip.style.top = rect.top - tip.clientHeight + 'px';
			tip.style.left = rect.left + rect.width/2 - tip.clientWidth/2 + 'px';
			tip.style.visibility = 'visible';
			show(tip);
		}
	}

	const NS = Theme.Namespace + 'input-ellipsis';
	class ACInputEllipsis {
		static init(input, params = {}){
			insertStyleSheet(`.${NS}[readonly] {text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}`, NS);
			input.tabIndex = 0;
			bindNodeEvents(input, ['click', 'focus'], () => {
				input.classList.remove(NS);
				input.removeAttribute('readonly');
				input.title = '';
			});
			bindNodeEvents(input, 'blur', () => {
				input.title = input.value;
				input.classList.add(NS);
				input.setAttribute('readonly', 'readonly');
			}, null, true);
		}
	}

	const DEFAULT_ATTR_COM_FLAG = 'data-component';
	const COMPONENT_BIND_GUID_KEY = 'component-init-bind';
	let AC_COMPONENT_NAME_MAPPING = {
		async: ACAsync,
		batchfiller: ACBatchFiller,
		columnfiller: ACColumnFiller,
		confirm: ACConfirm,
		copy: ACCopy,
		viewcopy: ACViewCopy,
		daterangeselector: ACDateRangeSelector,
		dialog: ACDialog,
		highlight: ACHighlight,
		hl: ACHighlight,
		hotkey: ACHotKey,
		inlineeditor: ACInlineEditor,
		selectrelate: ACMultiSelectRelate,
		preview: ACPreview,
		select: ACSelect,
		selectall: ACSelectAll,
		textcounter: ACTextCounter,
		inputellipsis: ACInputEllipsis,
		tip: ACTip,
		toast: ACToast,
		unsavealert: ACUnSaveAlert,
		uploader: ACUploader,
	};
	const parseComponents = function(attr){
		let tmp = attr.split(',');
		let cs = [];
		tmp.forEach(v => {
			v = v.trim();
			if(v){
				cs.push(v);
			}
		});
		return cs;
	};
	const resolveDataParam = (node, ComAlias) => {
		let param = {};
		Array.from(node.attributes).forEach(attr => {
			if(attr.name.indexOf('data-' + ComAlias.toLowerCase() + '-') >= 0){
				let objKeyPath = attr.name.substring(('data-' + ComAlias.toLowerCase()).length + 1).replace(/-/g, '.');
				objectPushByPath(objKeyPath, attr.value, param, '.');
			}
		});
		return param;
	};
	let BIND_LIST = {
	};
	const bindNode = function(container = document, attr_flag = DEFAULT_ATTR_COM_FLAG){
		findAll(`:not([${COMPONENT_BIND_GUID_KEY}])[${attr_flag}]`, container).forEach(node => {
			let cs = parseComponents(node.getAttribute(attr_flag));
			let activeStacks = [];
			let init_count = 0;
			let id = guid('component-bind');
			cs.forEach(componentAlias => {
				let C = AC_COMPONENT_NAME_MAPPING[componentAlias];
				if(!C){
					console.error(`Component ${componentAlias} no found`);
					return false;
				}
				init_count++;
				if(!BIND_LIST[id]){
					BIND_LIST[id] = [];
				}
				BIND_LIST[id].push(C);
				let data = resolveDataParam(node, componentAlias);
				if(C.init){
					try{
						C.init(node, data);
					}catch(err){
						console.error(`Component ${componentAlias} initialize fail`, err);
					}
				}
				if(C.active){
					activeStacks.push((event) => {
						try{
							let p = C.active(node, resolveDataParam(node, componentAlias), event);
							if(!isPromise(p)){
								throw `Component ${componentAlias} active() method required <Promise> as return`;
							}
							return p;
						}catch(err){
							console.error(`Component ${componentAlias} active fail`, err);
							return Promise.resolve();
						}
					});
				}
				return true;
			});
			if(init_count !== 0){
				node.setAttribute(COMPONENT_BIND_GUID_KEY, id);
			}
			if(activeStacks.length){
				bindActiveChain(node, activeStacks);
			}
		});
	};
	const TEXT_TYPES = ['text', 'number', 'password', 'search', 'address', 'date', 'datetime', 'time', 'checkbox', 'radio'];
	const isInputAble = (node) => {
		if(node.disabled || node.readonly){
			return false;
		}
		return node.tagName === 'TEXTAREA' ||
			(node.tagName === 'INPUT' && (!node.type || TEXT_TYPES.includes(node.type.toLowerCase())));
	};
	const bindActiveChain = (node, activeStacks) => {
		let eventName;
		if(isInputAble(node)){
			eventName = 'keyup';
		}else if(node.tagName === 'FORM'){
			eventName = 'submit';
		}else {
			eventName = 'click';
		}
		node.addEventListener(eventName, event => {
			let stacks = [...activeStacks];
			let exe = () => {
				let func = stacks.shift();
				if(func){
					func(event).then(exe, err => {
						console.info('ACComponent active chain breakdown', err);
					});
				}
			};
			exe();
		});
	};
	const ACComponent = {
		watch: (container = document, attr_flag = DEFAULT_ATTR_COM_FLAG) => {
			let m_tm = null;
			let observer = new MutationObserver(() => {
				clearTimeout(m_tm);
				m_tm = setTimeout(function(){
					bindNode(container, attr_flag);
				}, 0);
			});
			observer.observe(container, {childList: true, subtree: true});
			bindNode(container, attr_flag);
		},
		getBindComponents: (node) => {
			let guid = node.getAttribute(COMPONENT_BIND_GUID_KEY);
			if(guid && BIND_LIST[guid]){
				return BIND_LIST[guid];
			}
			return [];
		},
		register: (ComponentName, define) => {
			AC_COMPONENT_NAME_MAPPING[ComponentName] = define;
		},
		unRegister: (componentName) => {
			delete (AC_COMPONENT_NAME_MAPPING[componentName]);
		}
	};

	exports.ACAsync = ACAsync;
	exports.ACBatchFiller = ACBatchFiller;
	exports.ACColumnFiller = ACColumnFiller;
	exports.ACComponent = ACComponent;
	exports.ACConfirm = ACConfirm;
	exports.ACCopy = ACCopy;
	exports.ACDialog = ACDialog;
	exports.ACHighlight = ACHighlight;
	exports.ACInlineEditor = ACInlineEditor;
	exports.ACMultiSelectRelate = ACMultiSelectRelate;
	exports.ACPreview = ACPreview;
	exports.ACSelect = ACSelect;
	exports.ACSelectAll = ACSelectAll;
	exports.ACTextCounter = ACTextCounter;
	exports.ACTip = ACTip;
	exports.ACToast = ACToast;
	exports.ACUnSaveAlert = ACUnSaveAlert;
	exports.ACUploader = ACUploader;
	exports.ACViewCopy = ACViewCopy;
	exports.ASYNC_SUBMITTING_FLAG = ASYNC_SUBMITTING_FLAG;
	exports.BLOCK_TAGS = BLOCK_TAGS;
	exports.Base64Encode = Base64Encode;
	exports.BizEvent = BizEvent;
	exports.CONSOLE_COLOR = CONSOLE_COLOR;
	exports.DLG_CLS_BTN = DLG_CLS_BTN;
	exports.DLG_CLS_WEAK_BTN = DLG_CLS_WEAK_BTN;
	exports.Dialog = DialogClass;
	exports.DialogManager = DialogManagerClass;
	exports.FILE_TYPE_AUDIO = FILE_TYPE_AUDIO;
	exports.FILE_TYPE_DOCUMENT = FILE_TYPE_DOCUMENT;
	exports.FILE_TYPE_IMAGE = FILE_TYPE_IMAGE;
	exports.FILE_TYPE_SHEET = FILE_TYPE_SHEET;
	exports.FILE_TYPE_STATIC_IMAGE = FILE_TYPE_STATIC_IMAGE;
	exports.FILE_TYPE_VIDEO = FILE_TYPE_VIDEO;
	exports.FILE_TYPE_ZIP = FILE_TYPE_ZIP;
	exports.GOLDEN_RATIO = GOLDEN_RATIO;
	exports.HTTP_METHOD = HTTP_METHOD;
	exports.IMG_PREVIEW_MODE_MULTIPLE = IMG_PREVIEW_MODE_MULTIPLE;
	exports.IMG_PREVIEW_MODE_SINGLE = IMG_PREVIEW_MODE_SINGLE;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_NAV = IMG_PREVIEW_MS_SCROLL_TYPE_NAV;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_NONE = IMG_PREVIEW_MS_SCROLL_TYPE_NONE;
	exports.IMG_PREVIEW_MS_SCROLL_TYPE_SCALE = IMG_PREVIEW_MS_SCROLL_TYPE_SCALE;
	exports.KEYBOARD_KEY_MAP = KEYBOARD_KEY_MAP;
	exports.KEYS = KEYS;
	exports.LocalStorageSetting = LocalStorageSetting;
	exports.MD5 = MD5;
	exports.MIME_BINARY_DEFAULT = MIME_BINARY_DEFAULT;
	exports.MIME_EXTENSION_MAP = MIME_EXTENSION_MAP;
	exports.Masker = Masker;
	exports.Net = Net;
	exports.ONE_DAY = ONE_DAY;
	exports.ONE_HOUR = ONE_HOUR;
	exports.ONE_MINUTE = ONE_MINUTE;
	exports.ONE_MONTH_30 = ONE_MONTH_30;
	exports.ONE_MONTH_31 = ONE_MONTH_31;
	exports.ONE_WEEK = ONE_WEEK;
	exports.ONE_YEAR_365 = ONE_YEAR_365;
	exports.PAIR_TAGS = PAIR_TAGS;
	exports.PROMISE_STATE_FULFILLED = PROMISE_STATE_FULFILLED;
	exports.PROMISE_STATE_PENDING = PROMISE_STATE_PENDING;
	exports.PROMISE_STATE_REJECTED = PROMISE_STATE_REJECTED;
	exports.ParallelPromise = ParallelPromise;
	exports.QueryString = QueryString;
	exports.QuickJsonRequest = QuickJsonRequest;
	exports.REMOVABLE_TAGS = REMOVABLE_TAGS;
	exports.REQUEST_FORMAT = REQUEST_FORMAT;
	exports.RESPONSE_FORMAT = RESPONSE_FORMAT;
	exports.SELF_CLOSING_TAGS = SELF_CLOSING_TAGS;
	exports.Select = Select;
	exports.TRIM_BOTH = TRIM_BOTH;
	exports.TRIM_LEFT = TRIM_LEFT;
	exports.TRIM_RIGHT = TRIM_RIGHT;
	exports.Theme = Theme;
	exports.Tip = Tip;
	exports.Toast = ToastClass;
	exports.Toc = Toc;
	exports.UPLOADER_FILE_DEFAULT_CLASS = UPLOADER_FILE_DEFAULT_CLASS;
	exports.UPLOADER_IMAGE_DEFAULT_CLASS = UPLOADER_IMAGE_DEFAULT_CLASS;
	exports.UPLOAD_STATE_EMPTY = UPLOAD_STATE_EMPTY;
	exports.UPLOAD_STATE_ERROR = UPLOAD_STATE_ERROR;
	exports.UPLOAD_STATE_NORMAL = UPLOAD_STATE_NORMAL;
	exports.UPLOAD_STATE_PENDING = UPLOAD_STATE_PENDING;
	exports.Uploader = Uploader;
	exports.WINDOW_UNLOAD_ALERT_MAP_VAR_KEY = WINDOW_UNLOAD_ALERT_MAP_VAR_KEY;
	exports.arrayColumn = arrayColumn;
	exports.arrayDistinct = arrayDistinct;
	exports.arrayFilterTree = arrayFilterTree;
	exports.arrayGroup = arrayGroup;
	exports.arrayIndex = arrayIndex;
	exports.base64Decode = base64Decode;
	exports.base64UrlSafeEncode = base64UrlSafeEncode;
	exports.between = between;
	exports.bindConsole = bindConsole;
	exports.bindFileDrop = bindFileDrop;
	exports.bindFormAutoSave = bindFormAutoSave;
	exports.bindFormSubmitAsJSON = bindFormSubmitAsJSON;
	exports.bindFormUnSavedUnloadAlert = bindFormUnSavedUnloadAlert;
	exports.bindHotKeys = bindHotKeys;
	exports.bindIframeAutoResize = bindIframeAutoResize;
	exports.bindImgPreviewViaSelector = bindImgPreviewViaSelector;
	exports.bindNodeActive = bindNodeActive;
	exports.bindNodeEvents = bindNodeEvents;
	exports.bindTargetClickMenu = bindTargetClickMenu;
	exports.bindTargetContextMenu = bindTargetContextMenu;
	exports.bindTargetMenu = bindTargetMenu;
	exports.bindTextAutoResize = bindTextAutoResize;
	exports.bindTextSupportTab = bindTextSupportTab;
	exports.blobToFile = blobToFile;
	exports.buildHtmlHidden = buildHtmlHidden;
	exports.capitalize = capitalize;
	exports.chunk = chunk;
	exports.convertBlobToBase64 = convertBlobToBase64;
	exports.convertFormDataToObject = convertFormDataToObject;
	exports.convertObjectToFormData = convertObjectToFormData;
	exports.copy = copy;
	exports.copyFormatted = copyFormatted;
	exports.countDown = countDown;
	exports.createDomByHtml = createDomByHtml;
	exports.createMenu = createMenu;
	exports.cssSelectorEscape = cssSelectorEscape;
	exports.cutString = cutString;
	exports.debounce = debounce;
	exports.decodeHTMLEntities = decodeHTMLEntities;
	exports.deleteCookie = deleteCookie;
	exports.dimension2Style = dimension2Style;
	exports.disabled = disabled;
	exports.doOnce = doOnce;
	exports.domChangedWatch = domChangedWatch;
	exports.domContained = domContained;
	exports.downloadFile = downloadFile;
	exports.downloadFiles = downloadFiles;
	exports.downloadString = downloadString;
	exports.enabled = enabled;
	exports.enterFullScreen = enterFullScreen;
	exports.entityToString = entityToString;
	exports.escapeAttr = escapeAttr;
	exports.escapeHtml = escapeHtml;
	exports.eventDelegate = eventDelegate;
	exports.exitFullScreen = exitFullScreen;
	exports.explodeBy = explodeBy;
	exports.extract = extract;
	exports.fileAcceptMath = fileAcceptMath;
	exports.fileToImg = fileToImg;
	exports.fillForm = fillForm;
	exports.findAll = findAll;
	exports.findAllOrFail = findAllOrFail;
	exports.findOne = findOne;
	exports.fireEvent = fireEvent;
	exports.fixGetFormAction = fixGetFormAction;
	exports.formSerializeJSON = formSerializeJSON;
	exports.formSerializeString = formSerializeString;
	exports.formSync = formSync;
	exports.formValidate = formValidate;
	exports.formatDate = formatDate;
	exports.formatSize = formatSize;
	exports.frequencyControl = frequencyControl;
	exports.fromHtmlEntities = fromHtmlEntities;
	exports.getAvailableElements = getAvailableElements;
	exports.getAverageRGB = getAverageRGB;
	exports.getBase64ByImg = getBase64ByImg;
	exports.getBase64BySrc = getBase64BySrc;
	exports.getContextDocument = getContextDocument;
	exports.getContextWindow = getContextWindow;
	exports.getCookie = getCookie;
	exports.getCurrentFrameDialog = getCurrentFrameDialog;
	exports.getCurrentScript = getCurrentScript;
	exports.getDomDimension = getDomDimension;
	exports.getDomOffset = getDomOffset;
	exports.getETA = getETA;
	exports.getElementValue = getElementValue;
	exports.getElementValueByName = getElementValueByName;
	exports.getFocusableElements = getFocusableElements;
	exports.getFormDataAvailable = getFormDataAvailable;
	exports.getHash = getHash;
	exports.getHighestResFromSrcSet = getHighestResFromSrcSet;
	exports.getLastMonth = getLastMonth;
	exports.getLibEntryScript = getLibEntryScript;
	exports.getLibModule = getLibModule;
	exports.getLibModuleTop = getLibModuleTop;
	exports.getMimeByExtension = getMimeByExtension;
	exports.getMonthLastDay = getMonthLastDay;
	exports.getNextMonth = getNextMonth;
	exports.getNodeXPath = getNodeXPath;
	exports.getPromiseState = getPromiseState;
	exports.getRegion = getRegion;
	exports.getUTF8StrLen = getUTF8StrLen;
	exports.getViewHeight = getViewHeight;
	exports.getViewWidth = getViewWidth;
	exports.getWindowUnloadAlertList = getWindowUnloadAlertList;
	exports.guid = guid;
	exports.hide = hide;
	exports.highlightText = highlightText;
	exports.html2Text = html2Text;
	exports.imageFileFormatConvert = imageFileFormatConvert;
	exports.imgToFile = imgToFile;
	exports.inMobile = inMobile;
	exports.initAutofillButton = initAutofillButton;
	exports.inputAble = inputAble;
	exports.inputTypeAble = inputTypeAble;
	exports.insertStyleSheet = insertStyleSheet;
	exports.isButton = isButton;
	exports.isElement = isElement;
	exports.isEquals = isEquals;
	exports.isFunction = isFunction;
	exports.isInFullScreen = isInFullScreen;
	exports.isJSON = isJSON;
	exports.isNodeHidden = isNodeHidden;
	exports.isNum = isNum;
	exports.isObject = isObject;
	exports.isPromise = isPromise;
	exports.isValidUrl = isValidUrl;
	exports.keepDomInContainer = keepDomInContainer;
	exports.keepRectCenter = keepRectCenter;
	exports.keepRectInContainer = keepRectInContainer;
	exports.loadCss = loadCss;
	exports.loadImgBySrc = loadImgBySrc;
	exports.loadScript = loadScript;
	exports.lockElementInteraction = lockElementInteraction;
	exports.matchParent = matchParent;
	exports.mergeDeep = mergeDeep;
	exports.mergerUriParam = mergerUriParam;
	exports.monthsOffsetCalc = monthsOffsetCalc;
	exports.mutationEffective = mutationEffective;
	exports.nodeHighlight = nodeHighlight;
	exports.nodeIndex = nodeIndex;
	exports.objectGetByPath = objectGetByPath;
	exports.objectKeyMapping = objectKeyMapping;
	exports.objectOnChanged = objectOnChanged;
	exports.objectPushByPath = objectPushByPath;
	exports.onDocReady = onDocReady;
	exports.onDomTreeChange = onDomTreeChange;
	exports.onHover = onHover;
	exports.onReportApi = onReportApi;
	exports.onStateChange = onStateChange;
	exports.openLinkWithoutReferer = openLinkWithoutReferer;
	exports.prettyTime = prettyTime;
	exports.pushState = pushState;
	exports.randomInt = randomInt;
	exports.randomSentence = randomSentence;
	exports.randomString = randomString;
	exports.randomWords = randomWords;
	exports.readFileInLine = readFileInLine;
	exports.rectAssoc = rectAssoc;
	exports.rectInLayout = rectInLayout;
	exports.regQuote = regQuote;
	exports.remove = remove;
	exports.renderPaginate = renderPaginate;
	exports.repaint = repaint;
	exports.requestJSON = requestJSON;
	exports.resetFormChangedState = resetFormChangedState;
	exports.resolveFileExtension = resolveFileExtension;
	exports.resolveFileName = resolveFileName;
	exports.round = round;
	exports.scaleFixCenter = scaleFixCenter$1;
	exports.serializePhpFormToJSON = serializePhpFormToJSON;
	exports.setContextWindow = setContextWindow;
	exports.setCookie = setCookie;
	exports.setHash = setHash;
	exports.setStyle = setStyle;
	exports.setWindowUnloadMessage = setWindowUnloadMessage;
	exports.show = show;
	exports.showContextMenu = showContextMenu;
	exports.showImgListPreview = showImgListPreviewFn;
	exports.showImgPreview = showImgPreviewFn;
	exports.showNoviceGuide = showNoviceGuide;
	exports.sortByKey = sortByKey;
	exports.sortable = sortable;
	exports.strToPascalCase = strToPascalCase;
	exports.stringToEntity = stringToEntity;
	exports.stripSlashes = stripSlashes;
	exports.tabConnect = tabConnect;
	exports.throttle = throttle;
	exports.throttleEffect = throttleEffect;
	exports.toHtmlEntities = toHtmlEntities;
	exports.toggle = toggle;
	exports.toggleDisabled = toggleDisabled;
	exports.toggleFullScreen = toggleFullScreen;
	exports.toggleStickyClass = toggleStickyClass;
	exports.trans = trans;
	exports.triggerDomEvent = triggerDomEvent;
	exports.trim = trim;
	exports.unescapeHtml = unescapeHtml;
	exports.utf8Decode = utf8Decode;
	exports.utf8Encode = utf8Encode;
	exports.validateFormChanged = validateFormChanged;
	exports.versionCompare = versionCompare;
	exports.waitForSelector = waitForSelector;
	exports.waitForSelectors = waitForSelectors;

	return exports;

})({});
