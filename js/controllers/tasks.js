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

		var abs = function(n) {
			if (n<1) {
				n*=-1;
			}
			return n;
		}

		var zerofy = function(n) {
			if (n<0) {
				n=0;
			}
			return n;
		}

		$scope.informationStatus = false;

		$scope.toggleInformation = function() {
		    $scope.informationStatus = !$scope.informationStatus;
		    console.log($scope.informationStatus);
		}

		var toTimeDisplay = function(time, type) {
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

					var setTime = Math.ceil((time/tasks)*100)/100;

					var myTimeDate = new Date();
					var myTimeDisplay = "";
					// currentTimeDate = new Date();

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
						paused: false,
						pauseIcon: "pause",
						contTime: 0,
						locked: false,
						checked: "checked"
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



		$scope.lockTask = function(task) {
			taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var lockStatus;

			// console.log(indTime);
			taskRef.once("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	lockStatus = snapshot.val()["locked"];
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			lockStatus = !lockStatus;
			console.log("lockStatus should change each time:", lockStatus);

			taskRef.update({"locked": lockStatus});
			// keep track of how many locked
			var numLockedRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/numLocked');
			var numLocked;
			numLockedRef.once("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	numLocked = snapshot.val()["numLocked"];
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});


			if (numLocked===undefined) {
				numLockedRef.set({"numLocked": 1});
			} else {
				if (lockStatus) {
					numLocked += 1;
					// taskRef.update({"locked": false});
				} else {
					numLocked -= 1;
					// taskRef.update({"locked": true});
				}
				numLockedRef.update({"numLocked": numLocked});
			}
			
		}


		//timing
		var timer;
		var taskTime = 0;

		var addTime = function(task, type, contTime) {

			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskTime += 1;
			$scope.$apply(function() {
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
			if (startOk<1) {
				timer=setInterval(addTime, 1000, task, type, contTime);
			}
			startOk+=1; 

		}


		$scope.pauseOrResumeTask = function(task, type, contTime) {

			clearInterval(timer);
			var paused;
			var contTime;

			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"buttonLabel": "resume"});
			taskRef.update({"pauseIcon": "play_arrow"});
			// taskRef.update({"contTime": taskTime});
			
			startOk = 0;

			taskRef.on("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	paused = snapshot.val()["paused"];
				    	contTime = snapshot.val()["contTime"]; 
				    	// console.log(contTime, "contTime!");
				    }
				    
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			taskRef.update({"paused": !paused});

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
		// ng-hold

		$scope.addTimeToTask = function(task, type, sign) {
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
						indTime -= (timeToAdd/($scope.taskList.length-1));
					} else {
						indTime += (timeToAdd/($scope.taskList.length-1));
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

		$scope.clearTasks = function() {
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
		    var record = $firebaseObject(tasksRef);
		    record.$remove(tasksRef);
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

			var locked;
			var numLocked;

			taskOrigTimeRef.once("value", function(snapshot) {
				    if (snapshot.exists()&&taskOrigTimeRefChangeLim<1&&$scope.taskList.length>1) {
				    	oldName = snapshot.val()["name"];
				    	oldTime = snapshot.val()["time"];
				    	taskType = snapshot.val()["taskType"];
				    	locked = snapshot.val()["locked"];

				    	taskOrigTimeRefChangeLim+=1;

				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			var numLockedRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/numLocked');
			numLockedRef.once("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	numLocked = snapshot.val()["numLocked"]-1;
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			// if task is locked, subtract from the locked total
			if (locked) {
				numLockedRef.update({"numLocked": numLocked});
			}

			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksArray = $firebaseArray(tasksRef);

			

			var sumTimeOfTasks = 0;

			// take a sum of all the times that aren't locked
			// apply that sum/($scope.taskList.length-numLocked) to each non-locked task.
			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				var locked;
				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	locked = snapshot.val()["locked"];
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});
				if (!locked) {
					taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	var taskTime = snapshot.val()["time"];
					    	var contTime = snapshot.val()["contTime"];
					    	sumTimeOfTasks += (taskTime-contTime)
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
					});
				}
			}
			console.log("sumTimeOfTasks", sumTimeOfTasks);

			newTime = (sumTimeOfTasks)/($scope.taskList.length-1-numLocked-1);
			newTime = Math.round(newTime*100)/100;
			newTime = zerofy(newTime);

			var newTimeDisplay = toTimeDisplay(newTime, type);

			console.log("newTime: ", newTime, "newTimeDisplay", newTimeDisplay);

			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				var locked;
				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	locked = snapshot.val()["locked"];
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});
				if (!locked) {
					if ($scope.taskList[t].$id!=task.$id) {
						taskRef.update({"timeDisplay": newTimeDisplay});
						taskRef.update({"time": newTime});
					}
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
// locks?

// Projects.

// add total time passed/total Time next to Tasks to Complete

// User Feedback:
// e.g.v 
// You still had more than half to go! (if difference more than 50%...)
// You still had more than a quarter of the time to go! (difference>20%)
// Just on time! (difference<5%)
// Maybe a little quicker next time! (difference > -20%)
// You really took your time on that one! (difference > -100%)

