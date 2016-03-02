myApp.controller('TaskController', 
  ['$scope', '$rootScope', '$firebaseAuth', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);

  		var constructTaskData = function(task, time) {
  			if (task==null) {
  				name="blankTask";
  			}
  			if (time==null) {
  				time=0;
  			}
  			return {
  				name: task,
  				time: time
  			}
  		}

  		var tasksInfo;
  		var updateTasklist = function() {
  			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			tasksInfo = $firebaseArray(tasksRef);

			$scope.taskList = tasksInfo;
  		}

  		// updateTasklist();

		auth.$onAuth(function(authUser) {
			if (authUser) {
				updateTasklist();

				$scope.genTasks = function(tasks, time) {
					console.log(tasks, time);
					for (var t=0; t<tasks; t++) {
					var taskData = {
						name: "task" + String(t+1), 
						time: time/tasks
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

		var addTime = function() {
			taskTime += 0.1;
			console.log(taskTime);
		}

		$scope.startTask = function() {
			timer=setInterval(addTime, 100);
		}

		//default namevalues
		var oldName="blankTask";
		var oldTime=0;

		$scope.stopTask = function(task) {
			console.log(taskTime);
			clearInterval(timer);
			var taskOrigTimeRefChangeLim = 0;

			var taskOrigTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var newTime=0;

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

			// console.log(newTime, "nt");

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
			console.log(delTasksInfo, "dti");
			$scope.delTaskList = delTasksInfo;
		}

		$scope.deleteTask = function(task) {
			var taskRefDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var taskDel = $firebaseObject(taskRefDel);
			addDelTasks(constructTaskData(oldName, oldTime))

			// **************************************
			// Add to delete function!
			// add deleted time evenly to other tasks.

			taskDel.$remove(task.$id);
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksInfo = $firebaseArray(tasksRef);



			$scope.taskList = tasksInfo;
		}

		// implement a clearTask method which clears the deletedTasks array, and keeps an overall count of the number of tasks that you have completed

}]);


// Goals:
// Make the user cannot press start while start is already going, to prevent slowing down of site.
// implement a clearTask method which clears the deletedTasks array, and keeps an overall count of the number of tasks that you have completed
// Improve UX significantly


