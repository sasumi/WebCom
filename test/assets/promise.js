(async () => {
	let step_login = () => {
		return new Promise((resolve, reject) => {
			console.log('step login resolve');
			resolve('step login resolve');
			// reject('step login reject');
		});
	};

	let step_security_code_check = () => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log('step_security_code_check resolve');
				resolve('step_security_code_check resolve');
			}, Math.round(Math.random() * 1000));
		});
	}

	let account_lock_detected = () => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log('account_lock_detected resolve');
				resolve('account_lock_detected resolve');
			}, Math.round(Math.random() * 1000));
		});
	}

	let browser_trust_confirm = () => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log('browser_trust_confirm resolve');
				resolve('browser_trust_confirm resolve');
			}, Math.round(Math.random() * 1000));
		});
	}

	let fetch_account_info = () => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log('fetch_account_info resolve');
				resolve('fetch_account_info resolve');
			}, Math.round(Math.random() * 1000));
		});
	}

	const packStep = (step) => {
		if(typeof step === 'function'){
			return step;
		}else if(Array.isArray(step)){
			let ps = [];
			step.forEach(s => {
				ps.push(packStep(s));
			});
			return promiseChain(ps);
		}else if(typeof (step) === 'object'){
			let ps = [];
			for(let k in step){
				ps.push(packStep(step[k]));
			}
			let f = ()=>{
				return promiseAny(ps);
			};
			return f;
		}else{
			console.error('Step type error', step);
			throw "Step type no supported";
		}
	}

	const promiseAny = (payloads)=>{
		let ps = [];
		payloads.forEach(payload=>{
			ps.push(payload());
		});
		return Promise.any(ps);
	}

	/**
	 * 将 Promise 数组打包成 Promise
	 * @param {Function[]} promise_payload_list
	 * @return {function(): Promise<unknown>}
	 */
	const promiseChain = (promise_payload_list) => {
		return () => {
			return new Promise(async resolve => {
				console.debug('promise_payload_list', promise_payload_list);
				let ret = null;
				for(const promise_payload of promise_payload_list){
					ret = await promise_payload(ret);
				}
				resolve(ret);
			});
		}
	}

	const callSteps = async (step_config) => {
		return await packStep(step_config)();
	}

	let ret = await callSteps([
		step_login,
		{
			'branch_2': account_lock_detected,
			'branch_3': fetch_account_info
		},
		{
			'branch_1': [step_security_code_check, browser_trust_confirm],
			'branch_2': account_lock_detected,
			'branch_3': fetch_account_info
		},
	]);
	console.log('[ret]', ret);
})();