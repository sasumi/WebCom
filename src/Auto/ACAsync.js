import {postJSON} from "./ACForm.js";
import {Toast} from "../Widget/Toast.js";

export class ACAsync {
	nodeInit(node, {url}){
		let cgi_url = url || node.getAttribute('href');
		return new Promise((resolve, reject) => {
			postJSON(cgi_url, null).then(() => {
				location.reload();
				resolve();
			}, err => {
				Toast.showError(err);
				reject(err);
			})
		})
	}
}