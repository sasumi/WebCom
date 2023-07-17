export class Hello {
	static init(node, param){
		node.setAttribute('data-message', 'World');
	}

	static active(node, param){
		return new Promise((resolve, reject) => {
			let msg = node.getAttribute('data-message');
			alert("Hello" + msg);
			resolve();
		})
	}
}