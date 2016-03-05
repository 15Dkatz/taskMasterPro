myApp.controller('TaskController', 
  ['$scope', '$rootScope', '$firebaseAuth', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);

  		var tasksInfo;
  		var updateTasklist = function() {
  			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			tasksInfo = $firebaseArray(tasksRef);

			$scope.taskList = tasksInfo;
  		}


  		$scope.timeTypes = ["seconds", "minutes", "hours"];
  		$scope.timeType = {type: "seconds"};


		var minTwoDigits = function(n) {
	  		return (n < 10 ? '0' : '') + n;
		}

		var toTimeDisplay = function(time, type) {
			// console.log("converting!", time, "in", type);
			var taskTimeDate = new Date();
			var hours=0;
			var minutes=0;
			var seconds=0;

			if (time<60) {
				seconds = time;
			}
			if (time>=60&&time<=3600) {
				seconds = time%60;
				minutes = Math.floor(time/60);
			}
			else if (time>3600) {
				hours=Math.floor(time/3600);
				// minutes = Math.ceil((time-hours)/60);
				minutes = (time-(hours*3600))/60;
				seconds=time%60;
			}
			// console.log(seconds, "s", minutes, "m", hours, "h");

			taskTimeDate.setHours(hours, minutes, seconds);

			return minTwoDigits(taskTimeDate.getHours())+":"+minTwoDigits(taskTimeDate.getMinutes())+":"+minTwoDigits(taskTimeDate.getSeconds());
		}

		auth.$onAuth(function(authUser) {
			if (authUser) {
				updateTasklist();
				updateDelTaskList();

				$scope.genTasks = function(tasks, time, type) {
					$scope.logoutStatus = true;
					switch(type) {
						case ('seconds'):
							time=time;
							break;
						case ('minutes'):
							time*=60;
							break;
						case ('hours'):
							time*=3600;
							break;

					}
					// console.log(tasks, time, type);
					var setTime = Math.ceil((time/tasks)*100)/100;

					


					var myTimeDate = new Date();
					var myTimeDisplay = "";
					currentTimeDate = new Date();

					// console.log(setTime, "setTime"); 
					myTimeDisplay = toTimeDisplay(setTime, type);
					// console.log(myTimeDisplay, "myTimeDisplay");

					for (var t=0; t<tasks; t++) {
					var taskData = {
						name: "task" + String(t+1), 
						time: setTime,
						showCurrent: false,
						type: type,
						timeDisplay: myTimeDisplay,
						currentTimeDisplay: "00:00:00",
						buttonLabel: "pause",
						showPaused: false,
						Paused: false,
						pauseIcon: "pause",
						contTime: 0
					}
					tasksInfo.$add(taskData);

				}
					$scope.taskList = tasksInfo;
				} 
			} //userAuthenticated
		}) //on Authentication

		$scope.renameTask = function(task, taskName) {
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			// taskRef.set({name: taskName, time: time/tasks});
			taskRef.update({"name": taskName});
			// console.log(taskRef + "   " + taskName);
		}

		//timing
		var timer;
		var taskTime = 0;
		// $scope.currentTime = "00:00:00";

		var currentTimeDate = new Date();

		var addTime = function(task, type, contTime) {
			// need to define time here...

			// add according to time
			// if (contTime!=undefined) {
			// 	taskTime=contTime;
			// }
			// console.log(contTime, "time");

			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			// console.log($scope.currentTime, "ct", type);
			taskTime += 1;

			// if time defined, then add according to that time!

			$scope.$apply(function() {
				// $scope.currentTime=toTimeDisplay(taskTime, type);
				console.log(taskTime, "changing Display", type);
				taskRef.update({"contTime": taskTime})
				taskRef.update({"currentTimeDisplay": toTimeDisplay(taskTime, type)});
			});
		}

		var startOk = 0;

		$scope.startTask = function(task, type, contTime) {
			// $scope.currentTime="00:00:00";
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"showCurrent": true});
			taskRef.update({"showPaused": true});

			// important! setting the global taskTime to the current task's time
			taskTime = contTime;
			// if (time!=null) {
			// 	taskTime = time;
			// }
			if (startOk<1) {
				timer=setInterval(addTime, 1000, task, type, contTime);
			}
			startOk+=1; 

		}

		// var toggle = function()

		$scope.pauseOrResumeTask = function(task, type, contTime) {

			clearInterval(timer);
			var paused=false;
			var contTime;

			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"buttonLabel": "resume"});
			taskRef.update({"pauseIcon": "play_arrow"});
			// taskRef.update({"contTime": taskTime});
			
			startOk = 0;

			taskRef.on("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	paused = snapshot.val()["Paused"];
				    	contTime = snapshot.val()["contTime"]; 
				    	// console.log(contTime, "contTime!");
				    }
				    
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			taskRef.update({"Paused": !paused});

			// important! setting the global taskTime to the current task's time
			taskTime = contTime;

			if (!paused) {
				//doesn't update quickly... alternate solution?
				taskRef.update({"buttonLabel": "pause"})
				taskRef.update({"pauseIcon": "pause"})
				$scope.startTask(task, type, contTime);
				
			}
		}

		// add more according to how long user holds button
		var abs = function(n) {
			if (n<1) {
				n*=-1;
			}
			return n;
		}


		$scope.addTimeToTask = function(task, type, sign) {
			// console.log(type, "type in addTimeToTask function passed by tasks.html");
			// add one to this task, update
			var contTime;
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var taskOrigRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskOrigRef.on("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	time = snapshot.val()["time"];
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			var timeToAdd;
			if (type==='seconds') {
				timeToAdd=1;
			} else if (type==='minutes') {
				timeToAdd=60;
			} else {
				timeToAdd=3600;
			}

			if (sign==="positive") {
				time+=timeToAdd;

			} else {
				time-=timeToAdd;
			}
			
			time = abs(time);


			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				var indTime;

				console.log(indTime);
				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	indTime = snapshot.val()["time"];
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});

				if ($scope.taskList[t].$id!=task.$id) {
					if (sign==="positive") {
						indTime -= (timeToAdd/$scope.taskList.length);
					} else {
						indTime += (timeToAdd/$scope.taskList.length);
					}
					indTime = abs(indTime);
					taskRef.update({"time": indTime});
					taskRef.update({"timeDisplay": toTimeDisplay(indTime)});
				} else {
					taskRef.update({"time": time});
					taskRef.update({"timeDisplay": toTimeDisplay(time)});
				}
			}

			updateTasklist();


		}


		// stopping and deletion of tasks ********************************************************************************

		var oldName="blankTask";
		var oldTime=0;
		var taskType="";
		var newTime=0;


		$scope.stopTask = function(task, type) {
			startOk=0;
			console.log(taskTime);
			clearInterval(timer);
			var taskOrigTimeRefChangeLim = 0;

			var taskOrigTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			newTime=0;

			taskOrigTimeRef.on("value", function(snapshot) {
				    if (snapshot.exists()&&taskOrigTimeRefChangeLim<1&&$scope.taskList.length>1) {
				    	oldName = snapshot.val()["name"];
				    	oldTime = snapshot.val()["time"];
				    	taskType = snapshot.val()["taskType"];
				    	taskOrigTimeRefChangeLim+=1;
				    	newTime = oldTime + (oldTime-taskTime)/($scope.taskList.length-1);
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});
			newTime = Math.round(newTime*100)/100;

			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksArray = $firebaseArray(tasksRef);

			var newTimeDisplay = toTimeDisplay(newTime, type);

			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);

				if ($scope.taskList[t].$id!=task.$id) {
					taskRef.update({"timeDisplay": newTimeDisplay});
					taskRef.update({"time": newTime});
				}
			}

			$scope.deleteTask(task);

			updateTasklist();
			taskTime = 0;
		}


		var addDelTasks = function(taskObj) {
			var refDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/deletedTasks');
			var delTasksInfo = $firebaseArray(refDel);
			delTasksInfo.$add(taskObj);
			$scope.delTaskList = delTasksInfo;
		}

		var updateDelTaskList = function() {
  			var refDelL = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/deletedTasks');
			var delTasksInfoL = $firebaseArray(refDelL);

			$scope.delTaskList = delTasksInfoL;
  		}


		var constructTaskData = function(task, currentTimeDisplay, time) {
  			if (task==null) {
  				name="blankTask";
  			}
  			if (time==null) {
  				time=0;
  			}

  			return {
  				name: task,
  				timeDisplay: time,
  				currentTimeDisplay: currentTimeDisplay				
  			}
  		}

		$scope.deleteTask = function(task) {
			var taskRefDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var taskDel = $firebaseObject(taskRefDel);
			// console.log(task.timeDisplay, "td");
			addDelTasks(constructTaskData(oldName, task.currentTimeDisplay, task.timeDisplay));

			taskDel.$remove(task.$id);

			updateTasklist();
		}

		// keep track of num deleted?

		$scope.clearDeletedTasks = function() {
		    var delTasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/deletedTasks');
		    var record = $firebaseObject(delTasksRef);
		    record.$remove(delTasksRef);
			$scope.delTaskList = [];
		}

}]);

// ******************************************************************************************************************
// Goals:

// Path: /Users/davidkatz/Coding/webDev/15Dkatz/15Dkatz.github.io/projects/taskMaster

// Add minutes, and hours **********!
// Improve UX significantly



// Ideas:


// Mom's input:
// Pause/Resume button [check]
// Add and Subtract time for each task. [check]
// Reset times? - Clear all button, that simply removes each task, but does not add thetime.

// Projects.


// User Feedback:
// e.g.v 
// You still had more than half to go! (if difference more than 50%...)
// You still had more than a quarter of the time to go! (difference>20%)
// Just on time! (difference<5%)
// Maybe a little quicker next time! (difference > -20%)
// You really took your time on that one! (difference > -100%)

