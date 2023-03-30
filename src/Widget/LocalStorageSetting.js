const json_decode = (v) => {
	return v === null ? null : JSON.parse(v);
}

const json_encode = (v) => {
	return JSON.stringify(v);
}

let callbacks = [];
let handler_callbacks = (key, newVal, oldVal)=>{
	callbacks.forEach(cb=>{cb(key, newVal, oldVal)});
};

let ls_listen_flag = false;

/**
 * 基于LocalStorage的设置项存储
 * localStorage中按照 key-value 方式进行存储，value支持数据类型
 */
export class LocalStorageSetting {
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

	/**
	 * 获取配置
	 * @param {String} key
	 * @return {null|any}
	 */
	get(key){
		let v = localStorage.getItem(this.namespace+key);
		if(v === null){
			return null;
		}
		return json_decode(v);
	}

	/**
	 * 设置配置
	 * @param {String} key
	 * @param {any} value
	 */
	set(key, value){
		handler_callbacks(key, value, this.get(key));
		localStorage.setItem(this.namespace+key, json_encode(value));
	}

	/**
	 * 移除指定配置
	 * @param {String} key
	 */
	remove(key){
		handler_callbacks(key, null, this.get(key));
		localStorage.removeItem(this.namespace+key);
	}

	/**
	 * 配置更新回调（包含配置变更、配置删除）
	 * @param {Function} callback (key, newValue, oldValue)
	 */
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

	/**
	 * 遍历
	 * @param {Function} payload (key, value)
	 */
	each(payload){
		this.settingKeys.forEach(k=>{
			payload(k, this.get(k));
		});
	}

	/**
	 * 移除所有
	 */
	removeAll(){
		this.settingKeys.forEach(k=>{
			this.remove(k);
		});
	}

	/**
	 * 获取所有
	 * @return {Object} {key:value}
	 */
	getAll(){
		let obj = {};
		this.settingKeys.forEach(k=>{
			obj[k] = this.get(k);
		});
		return obj;
	}
}