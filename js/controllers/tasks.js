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
			// updateGlobalTimes();
  		}

  // 		$scope.init = function(){
		// 	updateTasklist();
		// 	updateGlobalTimes();
		// 	updateNumLocked();
		// }


  		$scope.timeTypes = ["hours", "minutes", "seconds"];
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

		var toTimeDisplay = function(time) {
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
			

			taskTimeDate.setHours(hours, minutes, seconds);

			return minTwoDigits(taskTimeDate.getHours())+":"+minTwoDigits(taskTimeDate.getMinutes())+":"+minTwoDigits(taskTimeDate.getSeconds());
		}

		var displayToTime = function(timeDisplay) {
			var taskTimeDate = new Date();

			console.log("timeDisplay", timeDisplay);

			var hours = parseInt(timeDisplay.substring(0, 2))*3600;
			var minutes = parseInt(timeDisplay.substring(3, 5))*60;
			var seconds = parseInt(timeDisplay.substring(6, 8))*1;

			var sumTime = hours+minutes+seconds;

			console.log("hours:", hours, "minutes:", minutes, "seconds:", seconds, "sumTime:", sumTime);



			return sumTime;
		}

	


		auth.$onAuth(function(authUser) {
			updateTasklist();
			if (authUser) {
				updateTasklist();
				updateDelTaskList();
				// updateGlobalTimes();

				var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');
				var intialGlobalTime;
				globalTimeRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	intialGlobalTime = snapshot.val()["globalTime"];
					    	console.log("intialGlobalTime:", intialGlobalTime);
					    	$scope.globalTime = toTimeDisplay(intialGlobalTime);
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});



				$scope.genTasks = function(tasks, hours, minutes, seconds) {
					$scope.logoutStatus = true;
					if (!hours) {
						hours = 0;
					}
					if (!minutes) {
						minutes = 0;
					}
					if (!seconds) {
						seconds = 0;
					}
					if (!tasks) {
						tasks=1;
					}

					var time = 0;
				    time += hours*3600;
				    // console.log(time, "time hours");
				    time += minutes*60;
				    // console.log(time, "+minutes");
				    time += seconds*1;
				    // console.log(time, "+seconds");

					// console.log(seconds, "s", minutes, "m", hours, "h");

					// console.log(time, "time");
					// find the value of globalTime within the set, and add this time to global time to set.
					// globalTime+=time;
					// $scope.globalTime = toTimeDisplay(globalTime);


					// var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');
					// var intialGlobalTime;
					// globalTimeRef.once("value", function(snapshot) {
					// 	    if (snapshot.exists()) {
					// 	    	intialGlobalTime = snapshot.val()["globalTime"];
					// 	    	console.log("intialGlobalTime:", intialGlobalTime);
					// 	    }
					// 	}, function (errorObject) {
					// 	  console.log("The read failed: " + errorObject.code);
					// });

					// if (intialGlobalTime>0) {
					// 	$scope.globalTime = toTimeDisplay(intialGlobalTime);	
					// } else {
					// 	globalTime+=time;
					// 	$scope.globalTime = toTimeDisplay(globalTime);
					// 	// globalTimeRef.set({"globalTime": intialGlobalTime});
					// }
					// var newGlobalTime = intialGlobalTime+time;

					// figure out bug that causes incorrect $scope.globalTime setting on second submit.


					intialGlobalTime+=time;
					globalTimeRef.set({"globalTime": intialGlobalTime});
					$scope.globalTime = toTimeDisplay(intialGlobalTime);



					// $scope.globalTime = toTimeDisplay(globalTime);

					// $scope.globalTime = toTimeDisplay(globalTime);

					var setTime = Math.ceil((time/tasks)*100)/100;

					var myTimeDate = new Date();
					var myTimeDisplay = "";
					// currentTimeDate = new Date();

					// console.log(setTime, "setTime"); 
					myTimeDisplay = toTimeDisplay(setTime);
					// console.log(myTimeDisplay, "myTimeDisplay");

					for (var t=0; t<tasks; t++) {
					var taskData = {
						name: "task" + String(t+1), 
						time: setTime,
						showCurrent: false,
						// type: type,
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
					numLockedRef.set({"numLocked": 0});
				} 

					$scope.taskList = tasksInfo;
				}

				// updateGlobalTimes();
			} //userAuthenticated
			// updateGlobalTimes(); 
		}) //on Authentication


		$scope.renameTask = function(task, taskName) {
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			// taskRef.set({name: taskName, time: time/tasks});
			taskRef.update({"name": taskName});
			// console.log(taskRef + "   " + taskName);
		}

		var numLocked=0;

		$scope.updateNumLocked = function() {
			var numLockedRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/numLocked');
			numLocked = 0;	


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
				if (locked) {
					numLocked+=1;
				} 
			}

			numLockedRef.set({"numLocked": numLocked});
			console.log("updated numLocked to", numLocked);

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
			$scope.updateNumLocked();

		}


		//timing
		var timer;
		var taskTime = 0;

		var addTime = function(task, type, contTime) {

			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskTime += 1;
			$scope.$apply(function() {
				// console.log(taskTime, "changing Display", type);
				taskRef.update({"contTime": taskTime})
				taskRef.update({"currentTimeDisplay": toTimeDisplay(taskTime)});
				updateGlobalTimes();
			});
			// updateGlobalTimes();
		}

		var startOk = 0;

		

		// updateTasklist();
		$scope.globalTime;
		$scope.globalContTime = toTimeDisplay(0);
		var globalTime = 0;
		var globalContTime = 0;


		var updateGlobalTimes = function() {
			// updateTasklist();
			globalTime = 0;
			globalContTime = 0;

			for (var t=0; t<$scope.taskList.length; t++) {
				var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				// var locked;
				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	globalTime += snapshot.val()["time"];
					    	globalContTime += snapshot.val()["contTime"];
					    	console.log("globalContTime:", $scope.globalContTime, "globalTime:", $scope.globalTime);
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});
			}

			var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');
			// var intialGlobalTime;
			// globalTimeRef.once("value", function(snapshot) {
			// 	    if (snapshot.exists()) {
			// 	    	intialGlobalTime = snapshot.val()["globalTime"];
			// 	    }
			// 	}, function (errorObject) {
			// 	  console.log("The read failed: " + errorObject.code);
			// });
			globalTimeRef.set({"globalTime": globalTime});

			$scope.globalTime = toTimeDisplay(globalTime);
			$scope.globalContTime = toTimeDisplay(globalContTime);
			console.log("globalContTime:", $scope.globalContTime, "globalTime:", $scope.globalTime);

		}
		// updateNumLocked();
		// updateTasklist();
		// updateGlobalTimes();





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
			var time;
			var origLocked;
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var taskOrigRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskOrigRef.on("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	time = snapshot.val()["time"];
				    	origLocked=snapshot.val()["locked"];

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
			$scope.updateNumLocked();
			// time = abs(time);
			updateGlobalTimes();

			if (!origLocked) {
				for (var t=0; t<$scope.taskList.length; t++) {
					var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
					var indTime;

					// console.log(indTime);
					taskRef.once("value", function(snapshot) {
						    if (snapshot.exists()) {
						    	indTime = snapshot.val()["time"];
						    }
						}, function (errorObject) {
						  console.log("The read failed: " + errorObject.code);
					});

					// $scope.updateNumLocked();

					if ($scope.taskList[t].$id!=task.$id) {
						if (sign==="positive") {
							indTime -= (timeToAdd/($scope.taskList.length-1-numLocked));
							// console.log("positive", indTime);
						} else {
							indTime += (timeToAdd/($scope.taskList.length-1-numLocked));
							// console.log("negative", indTime);
						}
						indTime = abs(indTime);

						var locked;
						taskRef.once("value", function(snapshot) {
							    if (snapshot.exists()) {
							    	locked = snapshot.val()["locked"];
							    }
							}, function (errorObject) {
							  console.log("The read failed: " + errorObject.code);
						});


						if ((!locked)) {
							taskRef.update({"time": indTime});
							taskRef.update({"timeDisplay": toTimeDisplay(indTime)});
						}
					} else {
						taskRef.update({"time": time});
						taskRef.update({"timeDisplay": toTimeDisplay(time)});
					}
				}

			}

			updateTasklist();
			


		}

		$scope.clearTasks = function() {
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
		    var record = $firebaseObject(tasksRef);
		    record.$remove(tasksRef);
			updateTasklist();
			$scope.updateNumLocked();
			updateGlobalTimes();

			var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');

			globalTimeRef.set({"globalTime": 0});
			globalTime = 0;
		}


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
			// var numLocked;

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

			$scope.updateNumLocked();
			// updateGlobalTimes();


			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksArray = $firebaseArray(tasksRef);

			

			var sumTimeOfTasks = 0;

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
			var dividend = $scope.taskList.length-1-numLocked

			newTime = (sumTimeOfTasks)/dividend;
			newTime = Math.round(newTime*100)/100;
			newTime = zerofy(newTime);
			var newTimeDisplay = toTimeDisplay(newTime);

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
				if (!locked&&isFinite(newTime)) {
					if ($scope.taskList[t].$id!=task.$id) {
						taskRef.update({"timeDisplay": newTimeDisplay});
						taskRef.update({"time": newTime});
					}
				} 
			}

			$scope.deleteTask(task);
			
			updateTasklist();
			// updateGlobalTimes();
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
  			if (task===undefined) {
  				name="blankTask";
  			}
  			if (time===NaN) {
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
			addDelTasks(constructTaskData(task.name, task.currentTimeDisplay, task.timeDisplay));

			taskDel.$remove(task.$id);

			updateTasklist();
		}

		$scope.hardDeleteTask = function(task) {
			var taskRefDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var taskDel = $firebaseObject(taskRefDel);
			// console.log(task.timeDisplay, "td");
			// addDelTasks(constructTaskData(task.name, task.currentTimeDisplay, task.timeDisplay));

			var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');
			var newGlobalTime;

			// console.log("task.time:", task.time);


			newGlobalTime = displayToTime($scope.globalTime)-task.time;

			console.log("newGlobalTime:", newGlobalTime);

			$scope.globalTime = toTimeDisplay(newGlobalTime);

			globalTimeRef.set({"globalTime": newGlobalTime});



			taskDel.$remove(task.$id);

			updateTasklist();
			// updateGlobalTimes();
			// $scope.globalTimes -= 

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


// add globalTime
// when complete

// add globalContTime/globalTime in TasksToComplete header.

// Mom's input:
// Pause/Resume button [check]
// Add and Subtract time for each task. [check]
// Reset times? - Clear all button, that simply removes each task, but does not add thetime.[check]
// locks? [check]

// Projects.

// globalPause


// add a delete taskButton that does not factor time
// add total time passed/total Time next to Tasks to Complete

// User Feedback:
// e.g.v 
// You still had more than half to go! (if difference more than 50%...)
// You still had more than a quarter of the time to go! (difference>20%)
// Just on time! (difference<5%)
// Maybe a little quicker next time! (difference > -20%)
// You really took your time on that one! (difference > -100%)
// global Time

// Bugs: