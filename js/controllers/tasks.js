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
			// resetButtons();
  		}

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

				setTimeout(function(){
					console.log("reset called");
					resetButtons();
					// updateGlobalTimes();
				}, 600);

				$scope.genTasks = function(tasks, hours, minutes, seconds) {
					// updateGlobalTimes();
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

					console.log(seconds, "s", minutes, "m", hours, "h");
					var globalTimeExists;

					globalTimeRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
						    	intialGlobalTime = snapshot.val()["globalTime"];
						    	console.log("intialGlobalTime:", intialGlobalTime);
						    	$scope.globalTime = toTimeDisplay(intialGlobalTime);
						    	globalTimeExists=true;
						    }
						}, function (errorObject) {
						  console.log("The read failed: " + errorObject.code);
					});


					intialGlobalTime+=time;
					
					if (globalTimeExists) {
						globalTimeRef.set({"globalTime": intialGlobalTime});	
					}
					
					$scope.globalTime = toTimeDisplay(intialGlobalTime);

					var setTime = Math.ceil((time/tasks)*100)/100;

					var myTimeDate = new Date();
					var myTimeDisplay = "";

					myTimeDisplay = toTimeDisplay(setTime);
					// console.log(myTimeDisplay, "myTimeDisplay");

					for (var t=0; t<tasks; t++) {
					var taskData = {
						name: "task" + String(t+1), 
						time: setTime,
						showCurrent: false,
						timeDisplay: myTimeDisplay,
						currentTimeDisplay: "00:00:00",
						buttonLabel: "pause",
						showPaused: false,
						paused: false,
						buttonIcon: "pause",
						contTime: 0,
						locked: false,
						checked: "checked",
						canSkip: false
					}
					tasksInfo.$add(taskData);

					// resetButtons();

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

			} //userAuthenticated
		}) //on Authentication


		$scope.renameTask = function(task, taskName) {
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"name": taskName});
		}

		$scope.autostart = false;

		$scope.toggleAutostart = function() {
			// var allPaused = true;
			// 	for (var t=0; t<$scope.taskList.length; t++) {
			// 	taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
			// 	var paused;
			// 	// var showPaused;
			// 	taskRef.once("value", function(snapshot) {
			// 		    if (snapshot.exists()) {
			// 		    	paused = snapshot.val()["paused"];
			// 		    	// showPaused = snapshot.val()["showPaused"];
			// 		    }
			// 		}, function (errorObject) {
			// 		  console.log("The read failed: " + errorObject.code);
			// 	});				
			// 	if (paused==false) {
			// 		allPaused = false;
			// 		// breaking
			// 		t=$scope.taskList.length;
			// 	}
			// }	

			// if ($scope.autoStart) {
			// 	if (allPaused) {
			// 		$scope.autostart = !$scope.autostart;
			// 	}

			// } else {
				$scope.autostart = !$scope.autostart;
			// }

			
			console.log("autostart status: ", $scope.autostart);
			resetButtons();
			clearInterval(timer);

			if ($scope.autostart) {
				setTimeout(function() {

				console.log($scope.taskList.length, "$scope.taskList.length");

					if ($scope.taskList.length>1) {
						var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[0].$id);
						var type;
						var contTime;
						taskRef.once("value", function(snapshot) {
							    if (snapshot.exists()) {
							    	type = snapshot.val()["type"];
							    	contTime = snapshot.val()["contTime"];
							    }
							}, function (errorObject) {
							  console.log("The read failed: " + errorObject.code);
						});

						var taskRefObject = $firebaseObject(taskRef);
						taskRef.update({"paused": true});
						// taskRef.update({"showPaused": true});
						// $scope.autostart=true;
						taskRef.update({"showCurrent": true});
						setTimeout(function() {
						$scope.startTask(taskRefObject, type, contTime);
						}, 10);

						
						console.log("starting first task.");
					}
				}, 600)

			}
		}


		var resetButtons = function() {
			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				// if contTime>0 {
					// showPaused = true;
				// }
				var contTime;
				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	contTime = snapshot.val()["contTime"];
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});

				if ($scope.autostart) {
					taskRef.update({"showPaused": true});
					
					// taskRef.update({"buttonLabel": "pending"});
					// taskRef.update({"buttonIcon": ""});

					taskRef.update({"paused": false});
					
				} else {
					if (contTime==0) {
						taskRef.update({"showPaused": false});
					} else {
						taskRef.update({"showPaused": true});
						taskRef.update({"paused": true});
						taskRef.update({"buttonLabel": "resume"});
						taskRef.update({"buttonIcon": "play_arrow"});
					}
				}
				taskRef.update({"showCurrent": false});	
			}	
			updateTasklist();
			console.log("resetting the buttons");
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

		}

		var startOk = 0;

		
		$scope.globalTime;
		$scope.globalContTime = toTimeDisplay(0);
		var globalTime = 0;
		var globalContTime = 0;


		var updateGlobalTimes = function() {
				
			globalTime = 0;
			globalContTime = 0;

			for (var t=0; t<$scope.taskList.length; t++) {
				var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);

				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	globalTime += snapshot.val()["time"];
					    	globalContTime += snapshot.val()["contTime"];
					    	console.log("looking at task", t);
					    	console.log("globalContTime:", $scope.globalContTime, "globalTime:", $scope.globalTime);
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});
			}

			var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');

			if (!isFinite(globalTime)) {
				// globalTimeRef.set({"globalTime": 0});
			} else {
				globalTimeRef.set({"globalTime": globalTime});
			}
			

			$scope.globalTime = toTimeDisplay(globalTime);
			$scope.globalContTime = toTimeDisplay(globalContTime);
			console.log("globalContTime:", $scope.globalContTime, "globalTime:", $scope.globalTime, "taskList.length", $scope.taskList.length);

		}


		$scope.startTask = function(task, type, contTime) {
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			taskRef.update({"showCurrent": true});
			taskRef.update({"showPaused": true});

			// if ($scope.autostart) {
			// 	taskRef.update({"buttonLabel": "skip"});
			// 	taskRef.update({"buttonIcon": "fast_forward"});
			// }

			// important! setting the global taskTime to the current task's time
			taskTime = contTime;
			if (startOk<1) {
				timer=setInterval(addTime, 1000, task, type, contTime);
			}
			startOk+=1; 

		}


		$scope.pauseOrResumeTask = function(task, type, contTime, nextTask) {
			// debugging
			console.log("The boolean value of $scope.autostart is ", $scope.autostart);
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);

			// if ($scope.autostart==false) {
				// make sure pause button only shows on a globalScale on not on each task if $scope.autostart===false
				clearInterval(timer);
				var paused;
				var contTime;

				// var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
				taskRef.update({"buttonLabel": "resume"});
				taskRef.update({"buttonIcon": "play_arrow"});
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

				if (paused==false) {
					taskRef.update({"buttonLabel": "pause"})
					taskRef.update({"buttonIcon": "pause"})
					$scope.startTask(task, type, contTime);

					console.log("updating label to pause");
				}

		}


		$scope.skipTask = function(task, nextTask) {
			// current Task
			// clearInterval(timer);
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			// taskRef.update("");
			taskRef.update({"buttonLabel": "pending"});
			taskRef.update({"buttonIcon": ""});
			taskRef.update({"showCurrent": false});
			// taskRef.update({"showPaused": false});

			var index=0;

			if (nextTask!=undefined) {
				console.log("starting nextTask");
				$scope.startTask(nextTask, nextTask.type, nextTask.contTime);	
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


					if ($scope.taskList[t].$id!=task.$id) {
						if (sign==="positive") {
							indTime -= (timeToAdd/($scope.taskList.length-1-numLocked));
						} else {
							indTime += (timeToAdd/($scope.taskList.length-1-numLocked));
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
			console.log("attempting clear.")
			var clearOk = true;
			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);
				var paused;
				var showPaused;
				taskRef.once("value", function(snapshot) {
					    if (snapshot.exists()) {
					    	paused = snapshot.val()["paused"];
					    	showPaused = snapshot.val()["showPaused"];
					    }
					}, function (errorObject) {
					  console.log("The read failed: " + errorObject.code);
				});				
				if (paused===false&&showPaused===true) {
					clearOk = false;
				}
			}			

			if (clearOk) {
				var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			    var record = $firebaseObject(tasksRef);
			    record.$remove(tasksRef);

			    clearInterval(timer);

				updateTasklist();
				$scope.updateNumLocked();
				updateGlobalTimes();
			}
		}


		var oldName="blankTask";
		var oldTime=0;
		var taskType="";
		var newTime=0;

		$scope.stopTask = function(task, type, nextTask) {
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

			// console.log("newTime: ", newTime, "newTimeDisplay", newTimeDisplay);

			var nextTaskIndex = 0;


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

			// if ($scope.taskList.length<1) {
			// 	updateGlobalTimes();
			// 	console.log($scope.taskList.length, "is less than 1.")
			// }
			updateTasklist();
			// resetting timer.
			taskTime = 0;

			// If auto-start on, start next task.
			if ($scope.autostart) {
				if (nextTask!=undefined) {
					$scope.startTask(nextTask, nextTask.type, nextTask.contTime);
				}
			}
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
			// updateGlobalTimes();
		}

		$scope.hardDeleteTask = function(task) {
			var taskRefDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var taskDel = $firebaseObject(taskRefDel);

			var paused;
			var showPaused;
			taskRefDel.once("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	paused = snapshot.val()["paused"];
				    	showPaused = snapshot.val()["showPaused"];
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});


			var globalTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/globalTime');
			var newGlobalTime;

			// console.log("task.time:", task.time);	

			if ((!paused&&!showPaused)||(paused&&showPaused)) {
				newGlobalTime = displayToTime($scope.globalTime)-task.time;

				console.log("newGlobalTime:", newGlobalTime);

				$scope.globalTime = toTimeDisplay(newGlobalTime);

				// globalTimeRef.set({"globalContTime"})
				$scope.globalContTime = toTimeDisplay(0);
				globalTimeRef.set({"globalTime": newGlobalTime});

				taskDel.$remove(task.$id);

				updateTasklist();
			}

		}

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


// Ideas:
// Timeline Projects.


// User Feedback:
// e.g.v 
// You still had more than half to go! (if difference more than 50%...)
// You still had more than a quarter of the time to go! (difference>20%)
// Just on time! (difference<5%)
// Maybe a little quicker next time! (difference > -20%)
// You really took your time on that one! (difference > -100%)
// global Time

// Bugs:
// only pause if autostart not on.


// bug watch for updates on $scope.taskList.length - probably causing so many errors throughout code.
// possible solution, storing a taskList.length variable in firebase, and updating that variable as needed, and
// using that variable to check throught program.
// or to have such a variable within this js scope.
// taskmaster now autostart by default.

// if autoStart on, change the start task button to pending, add a start button next to the globalCount which represents a global start
// also each started task then turns into a skip, which starts the next task


// bug when you switch back to autostart off - start does not work 

// fix bug in switching autostart back and forth, why wont autostart work automatically?