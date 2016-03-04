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
					console.log(tasks, time, type);
					var setTime = Math.ceil((time/tasks)*100)/100;

					


					var myTimeDate = new Date();
					var myTimeDisplay = "";
					currentTimeDate = new Date();

					console.log(setTime, "setTime"); //not running??
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

		var addTime = function(task, type) {
			console.log($scope.currentTime, "ct", type);
			taskTime += 1;
			$scope.$apply(function() {
				$scope.currentTime=toTimeDisplay(taskTime, type);
			});
		}

		var startOk = 0;

		$scope.startTask = function(task, type) {
			$scope.currentTime="00:00:00";
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"showCurrent": true});
			if (startOk<1) {
				timer=setInterval(addTime, 1000, task, type);
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
			console.log(seconds, "s", minutes, "m", hours, "h");

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

