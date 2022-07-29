export const ACMultiOperate = (node, param) => {
	let targetSelector = param.target || 'input[type=checkbox][name][value]:not([disabled])';
	let checks = document.querySelectorAll(targetSelector);
	if(!checks.length){
		console.error('No checkbox found:'+targetSelector);
		return;
	}
	let updState = () => {
		let chk = Array.from(checks).filter(chk => {
			return chk.checked
		});
		chk.length ? node.removeAttribute('disabled') : node.setAttribute('disabled', 'disabled');
	}
	checks.forEach(chk => chk.addEventListener('change', updState));
	updState();
};