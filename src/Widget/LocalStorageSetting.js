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

	set(key, value){
		handler_callbacks(key, value, this.get(key));
		localStorage.setItem(this.namespace+key, json_encode(value));
	}

	get(key){
		let v = localStorage.getItem(this.namespace+key);
		if(v === null){
			return null;
		}
		return json_decode(v);
	}

	each(payload){
		this.settingKeys.forEach(k=>{
			payload(k, this.get(k));
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