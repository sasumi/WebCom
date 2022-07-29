import {Dialog} from "../Widget/Dialog.js";
import {ACEventChainBind} from "./ACBase.js";

export const ACConfirm = (node, param) => {
	ACEventChainBind(node, 'click', next=>{
		Dialog.confirm('确认', param.message).then(()=>{
			next();
		}, ()=>{
			console.log('cancel');
		});
	});
};