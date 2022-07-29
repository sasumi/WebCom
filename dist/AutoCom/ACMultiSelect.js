import {triggerDomEvent} from "../Lang/Event.js";

export const ACMultiSelect = (node, param) => {
	let targetSelector = param.target || 'input[type=checkbox]:not([disabled])';
	let checks = document.querySelectorAll(targetSelector);
	if(!checks.length){
		throw new Error('No checkbox found:'+targetSelector);
	}

	let updLock = false;
	let updState = () => {
		if(updLock){
			console.log('lock by checkbox trigger manual');
			return;
		}
		let checked_list = Array.from(checks).filter(chk => {
			return chk.checked;
		});
		node.indeterminate = false;
		if(checked_list.length === checks.length){
			node.checked = true;
		}else if(checked_list.length === 0){
			node.checked = false;
		}else{
			node.indeterminate = true;
		}
	};

	node.addEventListener('change',()=>{
		checks.forEach(chk=>{
			chk.checked = node.checked;
			updLock = true;
			triggerDomEvent(chk, 'change');
			updLock = false;
		});
	})

	checks.forEach(chk=>{
		chk.addEventListener('change', updState);
	});
	updState();
};

export const ACBindSelectAll = (node, container)=>{
	let target = document.querySelector(container || 'body');
	let checks = target.querySelectorAll('input[type=checkbox]:not([disabled])');
	//ignore empty
	if(!checks.length){
		return;
	}
	node.addEventListener('click', e=>{
		checks.forEach(chk=>chk.checked = true);
	})
};

export const ACBindSelectNone = (node, container)=>{
	let target = document.querySelector(container || 'body');
	let checks = target.querySelectorAll('input[type=checkbox]:not([disabled])');
	//ignore empty
	if(!checks.length){
		return;
	}
	node.addEventListener('click', e=>{
		checks.forEach(chk=>chk.checked = true);
	});
}