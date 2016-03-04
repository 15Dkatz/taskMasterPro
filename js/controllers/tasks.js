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

		auth.$onAuth(function(authUser) {
			if (authUser) {
				updateTasklist();
				updateDelTaskList();

				$scope.genTasks = function(tasks, time, type) {
					$scope.logoutStatus = true;
					console.log(tasks, time, type);
					var setTime = Math.round((time/tasks)*100)/100;

					var myTimeDate = new Date();
					var myTimeDisplay = "";
					currentTimeDate = new Date();

					console.log(setTime, "setTime"); //not running??
					// console.log(timeType.type, "type here!")
					// if (type=='hours') {
					// 	if (setTime<1) {
					// 		myTimeDate.setHours(0, setTime*60, 0);
					// 	} else {
					// 		myTimeDate.setHours(setTime);
							
					// 	}
					// 	// myTimeDisplay=minTwoDigits(myTimeDate.getHours())+":"+minTwoDigits(myTimeDate.getMinutes())+":"+minTwoDigits(myTimeDate.getSeconds());
					// 	// 	console.log(myTimeDisplay, "myTimeDisplay");
					// }
					// else if (type==='minutes') {
					// 	if (setTime<1) {
					// 		myTimeDate.setHours(0, 0, setTime*60);
					// 	} else {
					// 		myTimeDate.setHours(setTime);
							
					// 	}
					// } else {
					// 	myTimeDate.setHours(0, 0, setTime)
					// }
					// myTimeDisplay=minTwoDigits(myTimeDate.getHours())+":"+minTwoDigits(myTimeDate.getMinutes())+":"+minTwoDigits(myTimeDate.getSeconds());
					myTimeDisplay = toTimeDisplay(setTime, type);
					console.log(myTimeDisplay, "myTimeDisplay");

					for (var t=0; t<tasks; t++) {
					var taskData = {
						name: "task" + String(t+1), 
						time: setTime,
						currentTime: 0,
						showCurrent: false,
						type: type,
						timeDisplay: myTimeDisplay
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
			console.log(taskRef + "   " + taskName);
		}

		//timing
		var timer;
		var taskTime = 0;
		$scope.currentTime = "00:00:00";

		var currentTimeDate = new Date();

		var addTime = function(task) {
			console.log($scope.currentTime, "ct");
			switch($scope.timeType["type"]) {
				case('seconds'):
					taskTime += 0.1;
					break;
				case('minutes'):
					taskTime += 0.001666666667;
					break;
				case('hours'):
					taskTime += 0.0002777777778;
					break;
			}
			
			console.log(taskTime, "tt");

			if (taskTime<60) {
				currentTimeDate.setHours(0, 0, taskTime);
			}
			else if (taskTime<360) {
				currentTimeDate.setHours(0, taskTime, 0);
			}
			else {
				currentTimeDate.setHours(taskTime, 0, 0);	
			}
			$scope.$apply(function() {
				$scope.currentTime=minTwoDigits(currentTimeDate.getHours())+":"+minTwoDigits(currentTimeDate.getMinutes())+":"+minTwoDigits(currentTimeDate.getSeconds());
			});
		}

		var startOk = 0;

		$scope.startTask = function(task) {
			$scope.currentTime="00:00:00";
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"showCurrent": true});
			if (startOk<1) {
				timer=setInterval(addTime, 100, task);
			}
			startOk+=1; 

		}

		var oldName="blankTask";
		var oldTime=0;
		var taskType="";
		var newTime=0;


		// stopping and deletion of tasks ********************************************************************************
		var toTimeDisplay = function(time, type) {
			console.log("converting!", time, "in", type);
			var taskTimeDate = new Date();
			// if (type===	'hours') {
			// 	// if (time<1) {
			// 	// 	taskTimeDate.setHours(0, Math.ceil(time*60), 0);
			// 	// } else {
			// 	// 	taskTimeDate.setHours(time);
			// 	// }
			// }
			// else 
			if (type==='minutes') {
				time=time*0.01;
				// if (time<1) {
				// 	taskTimeDate.setHours(0, 0, time*60);
				// } else {
				// 	taskTimeDate.setHours(0, time, 0);
					
				// }
				// if ()
			} else if (type==='seconds') {
				// taskTimeDate.setHours(0, 0, time);
				time=time*0.0001;
				console.log(time, type);
			}
				var hours = Math.floor(time);
				if (hours>=1) {
					// console.log(time-hours, "t-h");
					var minutes = (Math.floor(time-hours)*100);
				} else {
					var minutes = time*100;
				}
				console.log(minutes, "minutes here")
				if (minutes>=1) {
					var seconds = Math.ceil(((((time-hours)*100)-Math.floor(minutes))*100)*0.6);
					console.log(minutes, "mins!", (time-hours)*100, "seconds!!")
				} else {
					var seconds = time*10000;
				}
				
				// console.log(hours, "hours", minutes, "minutes", seconds, "seconds");
				// minutes = Math.ceil(minutes*0.6);
				// seconds = Math.ceil(seconds*0.6);
				// console.log(hours, "hours", minutes, "minutes", seconds, "seconds");
				taskTimeDate.setHours(hours, minutes, seconds);

			return minTwoDigits(taskTimeDate.getHours())+":"+minTwoDigits(taskTimeDate.getMinutes())+":"+minTwoDigits(taskTimeDate.getSeconds());
		}



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
			// Math.floor10(55.59, -1);
			newTime = Math.round(newTime*100)/100;

			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksArray = $firebaseArray(tasksRef);

			var newTimeDisplay = toTimeDisplay(newTime, type);

			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				// need to display Newtime
				if ($scope.taskList[t].$id!=task.$id) {
					taskRef.update({"timeDisplay": newTimeDisplay});
					taskRef.update({"time": newTime});
				}
			}

			console.log(newTime, newTimeDisplay);

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


		var constructTaskData = function(task, time) {
  			if (task==null) {
  				name="blankTask";
  			}
  			if (time==null) {
  				time=0;
  			}
  			// if (currentTime==null) {
  			// 	currentTime=0;
  			// }
  			return {
  				name: task,
  				currentTime: $scope.currentTime,
  				timeDisplay: time
  				
  			}
  		}

		$scope.deleteTask = function(task) {
			var taskRefDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var taskDel = $firebaseObject(taskRefDel);
			console.log(task.timeDisplay, "td");
			addDelTasks(constructTaskData(oldName, task.timeDisplay));

			taskDel.$remove(task.$id);
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksInfo = $firebaseArray(tasksRef);

			$scope.taskList = tasksInfo;
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

// limit the display to two decimal places for time.
// convert hours to minutes, hours, minutes, seconds, 00:15

// User Feedback:
// e.g.v 
// You still had more than half to go! (if difference more than 50%...)
// You still had more than a quarter of the time to go! (difference>20%)
// Just on time! (difference<5%)
// Maybe a little quicker next time! (difference > -20%)
// You really took your time on that one! (difference > -100%)

