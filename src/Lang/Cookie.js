
/**
 * 设置cookie
 * @param {String} name
 * @param {String} value
 * @param {Number} days
 * @param {String} path
 */
export const setCookie = (name, value, days, path = '/') => {
	let expires = "";
	if(days){
		let date = new Date();
		date.setTime(Date.now() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=" + path;
}

/**
 * 获取cookie
 * @param {String} name
 * @returns {string|null}
 */
export const getCookie = (name) => {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++){
		let c = ca[i];
		while(c.charAt(0) === ' ') c = c.substring(1, c.length);
		if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

/**
 * 删除cookie
 * @param name
 */
export const deleteCookie = (name) => {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}