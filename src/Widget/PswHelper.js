const STRENGTH_MAP = {
	0: '非常弱',
	1: '弱',
	2: '普通',
	3: '强',
	4: '非常强',
	5: '安全',
	6: '非常安全'
};

const m_strUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const m_strLowerCase = "abcdefghijklmnopqrstuvwxyz";
const m_strNumber = "0123456789";
const m_strCharacters = "!@#$%^&*?_~";

/**
 * 产生密码
 * @param length 长度
 * @param rule 规则
 * @returns {string}
 */
const generatePassword = function(length, rule){
	const MAP = [
		'0123456789',
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		'abcdefghijklmnopqrstuvwxyz',
		'(!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~)',
		' '
	];
	rule = Object.assign({
		'NUM': true, //数字
		'UC': true, //大写字母
		'LC': true, //小写字母
		'SYM': false, //符号
		'SPC': false //空格
	}, rule);
	let rules = [];
	if(rule.NUM){
		rules.push(MAP[0]);
	}
	if(rule.UC){
		rules.push(MAP[1]);
	}
	if(rule.LC){
		rules.push(MAP[2]);
	}
	if(rule.SYM){
		rules.push(MAP[3]);
	}
	if(rule.SPC){
		rules.push(MAP[4]);
	}
	let charset = rules.join(''),
		retVal = "";
	for(let i = 0, n = charset.length; i < length; ++i){
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return retVal;
};

/**
 * 获取密码强度文本
 * @param strPassword
 * @returns {*}
 */
const getPasswordStrengthLevel = function(strPassword){
	let strength = getPasswordStrength(strPassword);
	return STRENGTH_MAP[strength];
};

/**
 * 获取密码强度
 * @param strPassword
 * @returns {number}
 */
const getPasswordStrength = function(strPassword){
	let score = getPasswordScore(strPassword);
	if(score >= 90){
		return 6;
	}
	if(score >= 80){
		return 5;
	}
	if(score >= 70){
		return 4;
	}
	if(score >= 60){
		return 3;
	}
	if(score >= 50){
		return 2;
	}
	if(score >= 25){
		return 1;
	}
	return 0;
};

/**
 * 包含字符的个数
 * @param strPassword
 * @param strCheck
 * @returns {number}
 */
let countContain = function(strPassword, strCheck){
	let nCount = 0;
	for(let i = 0; i < strPassword.length; i++){
		if(strCheck.indexOf(strPassword.charAt(i)) > -1){
			nCount++;
		}
	}
	return nCount;
};

/**
 * 计算密码得分
 * @param {String} strPassword
 * @returns {number}
 */
let getPasswordScore = function(strPassword){
	// Reset combination count
	let nScore = 0;

	// Password length
	// -- Less than 4 characters
	if(strPassword.length < 5){
		nScore += 5;
	}
	// -- 5 to 7 characters
	else if(strPassword.length > 4 && strPassword.length < 8){
		nScore += 10;
	}
	// -- 8 or more
	else if(strPassword.length > 7){
		nScore += 25;
	}

	// Letters
	let nUpperCount = countContain(strPassword, m_strUpperCase);
	let nLowerCount = countContain(strPassword, m_strLowerCase);
	let nLowerUpperCount = nUpperCount + nLowerCount;
	// -- Letters are all lower case
	if(nUpperCount === 0 && nLowerCount !== 0){
		nScore += 10;
	}
	// -- Letters are upper case and lower case
	else if(nUpperCount !== 0 && nLowerCount !== 0){
		nScore += 20;
	}

	// Numbers
	let nNumberCount = countContain(strPassword, m_strNumber);
	// -- 1 number
	if(nNumberCount === 1){
		nScore += 10;
	}
	// -- 3 or more numbers
	if(nNumberCount >= 3){
		nScore += 20;
	}

	// Characters
	let nCharacterCount = countContain(strPassword, m_strCharacters);
	// -- 1 character
	if(nCharacterCount === 1){
		nScore += 10;
	}
	// -- More than 1 character
	if(nCharacterCount > 1){
		nScore += 25;
	}

	// Bonus
	// -- Letters and numbers
	if(nNumberCount !== 0 && nLowerUpperCount !== 0){
		nScore += 2;
	}
	// -- Letters, numbers, and characters
	if(nNumberCount !== 0 && nLowerUpperCount !== 0 && nCharacterCount !== 0){
		nScore += 3;
	}
	// -- Mixed case letters, numbers, and characters
	if(nNumberCount !== 0 && nUpperCount !== 0 && nLowerCount !== 0 && nCharacterCount !== 0){
		nScore += 5;
	}
	return nScore;
};

export const PswHelper = {
	getPasswordScore,
	generatePassword,
	getPasswordStrengthLevel,
	getPasswordStrength
}