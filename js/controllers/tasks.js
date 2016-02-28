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


		auth.$onAuth(function(authUser) {
			if (authUser) {
				var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id);
				var tasksInfo = $firebaseArray(tasksRef);

				$scope.taskList = tasksInfo;

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
			// var taskOrigTimeRefVal = taskOrigTimeRef.val();
			// var taskOrigTimeObj = new $firebaseObject(taskOrigTimeRef);
			// var taskOrigTime = taskOrigTimeObj["time"];

			// var getTime = function(taskOrigTimeRef).$loaded().then(function(time) {
			//   console.log(time.$value);
			// });

			// getTime();

			//access the firebase attribute - !!!

			//then re-calculate times.

			console.log(taskOrigTimeRef.time + " tot " + taskTime);

			// var remainderTime = taskOrigTime-taskTime;
			// console.log(remainderTime);

			var tasksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/tasks');
			var tasksList = $firebaseArray(tasksRef);

			taskTime = 0;



		}


}]);