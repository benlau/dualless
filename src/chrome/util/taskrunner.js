
define(function taskrunner(){
	
	/** Execute a set of task with callback. It is a solution to prevent nested callback 
	 * 
	 */

	TaskRunner = function() {
		this._tasks = [];
		this._lastArgument;
		this._lastStep = 0;
	};

	/** Enqueue a task
	 * 
	 */

	TaskRunner.prototype.step = function(task,count){
		if (count == undefined)
			count = 1;
		while (count-- > 0)
			this._tasks.push(task);
	};


	/** Create a listener callback.
	 * 
	 * @returns A closure that will involve the next function in the task queue
	 */

	TaskRunner.prototype.listener = function() {
		var runner = this;
		return function() {
			runner.next.apply(runner,arguments);
		};
	};
	
	/** Dequeue the task from the task queue , and execute it. 
	 *
	 * @params {any} You may pass any argument to this function. It will be passed to next task.
	 */

	TaskRunner.prototype.next = function() {
		this._lastArguments = arguments;
		
		if (this._tasks.length == 0) {
			if (this._callback) {
				this._callback.apply(Window,arguments);
			}
		} else {
			var task = this._tasks.shift();
			this._lastStep++;
			task.apply(Window,arguments); // Extract arguments
		}
	};

	TaskRunner.prototype.run = function(callback) {
		this._step = 0;
		this._callback = callback;
		this.next();	
	};

	/** 
	 * 
	 * @returns No. of task leave
	 */

	TaskRunner.prototype.size = function(){
		return this._tasks.length;
	};

	/** The last argument passed to TaskRunner.next()
	 * 
	 */

	TaskRunner.prototype.lastArguments = function() {
		return this._lastArguments;
	};

	/** Stop the execution
	 * 
	 */
	TaskRunner.prototype.stop = function() {
		if (this._callback != undefined)
			this._callback();
	};
	
	/** Get the last step of task process
	 * 
	 * @returns {Number}
	 */
	
	TaskRunner.prototype.lastStep = function(){
		return this._lastStep;
	};
	
	return TaskRunner;
});