import {BizEvent} from "./Event.js";

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

export const onReportApi = {
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
