export function frequencyControl(payload, hz, executeOnFistTime = false){
	if(payload._frq_tm){
		clearTimeout(payload._frq_tm);
	}
	payload._frq_tm = setTimeout(()=>{
		frequencyControl(payload,hz, executeOnFistTime);
	}, hz);
}