myApp.controller('TaskController', 
  ['$scope', '$rootScope', '$firebaseAuth', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);


  // if (authUser) {
  //     var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid );
  //     var userObj = $firebaseObject(userRef);
  //     $rootScope.currentUser = userObj;
  //   } else {
  //     $rootScope.currentUser = '';
  //   }
  // });
  		var updateTasklist = function() {
  			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksInfo = $firebaseArray(tasksRef);

			$scope.taskList = tasksInfo;
  		}


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
					// set $scope.taskList to firebase Array
					$scope.taskList = tasksInfo;
				} 
			} //userAuthenticated
		}) //on Authentication

		$scope.renameTask = function(task, taskName) {
			var taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			// var taskInfo = $firebaseObject(taskRef);
			// tasksInfo[]	
			taskRef.set({name: taskName, time: time/tasks});
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

		$scope.stopTask = function(task) {
			console.log(taskTime);
			clearInterval(timer);

			//reset times
			var taskOrigTimeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			var newTime;
			// if (task)
			taskOrigTimeRef.on("value", function(snapshot) {
				    if (snapshot.exists()) {
				    	newTime = snapshot.val()["time"] + taskTime/$scope.taskList.length;
				    }
				}, function (errorObject) {
				  console.log("The read failed: " + errorObject.code);
			});

			console.log(newTime, "nt");

			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksArray = $firebaseArray(tasksRef);
			console.log(tasksArray[1]);
			for (var t=0; t<$scope.taskList.length; t++) {
				taskRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + $scope.taskList[t].$id);

				taskRef.update({"time": newTime});
			}

			updateTasklist();

			taskTime = 0;

		}

		$scope.deleteTask = function(task) {
			var refDel = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks/' + task.$id);
			// var tasksList = $firebaseArray(tasksRef);
			var taskDel = $firebaseObject(refDel);
			$scope.delTaskList.push(taskDel);
			taskDel.$remove(task.$id);
			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksInfo = $firebaseArray(tasksRef);



			$scope.taskList = tasksInfo;
		}

		$scope.delTaskList = [];

}]);