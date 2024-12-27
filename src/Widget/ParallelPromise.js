import {BizEvent} from "../Lang/Event.js";

/**
 * 并发控制器
 * @example 使用方法：
 * let pm = new ParallelPromise({
 *     parallelLimit: 10, //并发数量
 *     timeout: 120, //设置超时时间
 * });
 * pm.onFinish.listen(()=>{});
 * pm.addTask((resolve, reject)=>{
 *     //doSomething
 *     resolve(); //mark done
 * });
 * pm.start();
 */
export class ParallelPromise {
	option = {
		parallelLimit: 5,
		timeout: 60000,
		continueOnError: true,
	}

	stopFlag = false;
	currentRunningCount = 0;
	taskStack = [];

	//完成事件，fire(successResults, failResults)
	onFinish = new BizEvent();

	successResults = [];
	failResults = [];

	/**
	 * constructor
	 * @param {Object} option
	 * @param {Number} option.parallelLimit 并发数量(必须大于0)
	 * @param {Number} option.timeout 超时时间,0表示不设置超时
	 * @param {Boolean} option.continueOnError 是否在错误是继续运行,默认为继续
	 */
	constructor(option = {}){
		this.option = Object.assign(this.option, option);
		if(this.option.parallelLimit < 1){
			throw "最大并发数量必须大于0";
		}
	}

	_loop(){
		let finCount = 0;
		let orgTaskCount = this.taskStack.length;
		for(let i = 0; i < (this.option.parallelLimit - this.currentRunningCount); i++){
			if(finCount === orgTaskCount){
				this.onFinish.fire(this.successResults, this.failResults);
				return;
			}
			if(this.stopFlag || !this.taskStack.length){
				return;
			}
			this.currentRunningCount++;
			let payload = this.taskStack.shift();
			new Promise((resolve, reject) => {
				let tm = null;
				if(this.option.timeout){
					tm = setTimeout(() => {
						reject('task timeout');
					}, this.option.timeout);
				}
				payload((rst) => {
					tm && clearTimeout(tm);
					this.successResults.push(rst);
					resolve();
				}, err => {
					tm && clearTimeout(tm);
					if(!this.option.continueOnError){
						this.stopFlag = true;
					}
					this.failResults.push(err);
					reject(err);
				});
			}).finally(() => {
				this.currentRunningCount--;
				finCount++;
				this._loop();
			});
		}
	}

	/**
	 * 停止后续任务继续执行,已经开始的不受影响
	 */
	stop(){
		this.stopFlag = true;
	}

	/**
	 * 开始运行
	 */
	start(){
		this._loop();
	}

	/**
	 * 添加任务
	 * @param {Function} payload 参数为 resolve, reject, 表示函数执行完成或中断
	 */
	addTask(payload){
		this.taskStack.push(payload);
	}
}
