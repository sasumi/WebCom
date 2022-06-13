export const ONE_MINUTE = 60000;
export const ONE_HOUR = 3600000;
export const ONE_DAY = 86400000;
export const ONE_WEEK = 604800000;
export const ONE_MONTH_30 = 2592000000;
export const ONE_MONTH_31 = 2678400000;
export const ONE_YEAR_365 = 31536000000;

export function frequencyControl(payload, hz, executeOnFistTime = false){
	if(payload._frq_tm){
		clearTimeout(payload._frq_tm);
	}
	payload._frq_tm = setTimeout(() => {
		frequencyControl(payload, hz, executeOnFistTime);
	}, hz);
}
