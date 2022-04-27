export const between = (val, min, max)=>{
	return val >= min && val <= max;
};

export const round = (num, digits)=>{
	digits = digits === undefined ? 2 : digits;
	let multiple = Math.pow(10, digits);
	return Math.round(num * multiple) / multiple;
};
