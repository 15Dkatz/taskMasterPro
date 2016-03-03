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


		auth.$onAuth(function(authUser) {
			if (authUser) {
				updateTasklist();
				updateDelTaskList();

				$scope.genTasks = function(tasks, time, type) {
					$scope.logoutStatus = true;
					console.log(tasks, time, type);
					for (var t=0; t<tasks; t++) {
					var taskData = {
						name: "task" + String(t+1), 
						time: Math.round((time/tasks)*100)/100,
						currentTime: 0,
						showCurrent: false
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
		$scope.currentTime = 0;

		var addTime = function(task) {
			console.log($scope.timeType["type"], 'ttt')
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
			$scope.$apply(function() {
				$scope.currentTime=taskTime.toFixed(1);
			});
		}

		var startOk = 0;

		$scope.startTask = function(task) {
			$scope.currentTime=0;
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"showCurrent": true});
			if (startOk<1) {
				timer=setInterval(addTime, 100, task);
			}
			startOk+=1; 

		}

		var oldName="blankTask";
		var oldTime=0;


		// stopping and deletion of tasks ********************************************************************************

		$scope.stopTask = function(task) {
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
				    	console.log(snapshot.val()["time"], "svt");
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

			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				taskRef.update({"time": newTime});
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


		var constructTaskData = function(task, time, currentTime, timeType) {
  			if (task==null) {
  				name="blankTask";
  			}
  			if (time==null) {
  				time=0;
  			}
  			if (currentTime==null) {
  				currentTime=0;
  			}
  			return {
  				name: task,
  				time: Math.round(time*100)/100,
  				currentTime: Math.round(currentTime*100)/100,
  				type: timeType
  			}
  		}

		$scope.deleteTask = function(task) {
			var taskRefDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var taskDel = $firebaseObject(taskRefDel);
			addDelTasks(constructTaskData(oldName, oldTime, taskTime, $scope.timeType["type"]))

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

