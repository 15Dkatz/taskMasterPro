myApp.controller('TaskController', 
  ['$scope', '$rootScope', '$firebaseAuth', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

		// $scope.whichuser = $rootScope.currentUser.$id;

		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);

		// set $scope.taskList
		// $scope.taskList = [];
		// $scope.genTasks = function(tasks, time) {
		// 	console.log(tasks, time);

		// 	var tasksInfo = $firebaseArray(ref);

		// 	for (var t=0; t<tasks; t++) {
		// 		var taskData = {
		// 			name: t+1, 
		// 			time: time/tasks
		// 		}
		// 		// $scope.taskList.push(
		// 		// 	{name: t+1, time: tasks/time}
		// 		// )
		// 		tasksInfo.$add(taskData);

		// 	}


		// 	// set $scope.taskList to firebase ARray
		// 	$scope.taskList = tasksInfo;
		// } 




		auth.$onAuth(function(authUser) {
			if (authUser) {
				var tasksRef = new Firebase(FIREBASE_URL + 'users/' +
					$rootScope.currentUser.$id + '/tasks');
				var tasksInfo = $firebaseArray(tasksRef);
				$scope.taskList = [];
				$scope.genTasks = function(tasks, time) {
					console.log(tasks, time);

					// var tasksInfo = $firebaseArray(tasksRef);

					for (var t=0; t<tasks; t++) {
						var taskData = {
							name: t+1, 
							time: time/tasks
						}
						// $scope.taskList.push(
						// 	{name: t+1, time: tasks/time}
						// )
						tasksInfo.$add(taskData);

					}


					// set $scope.taskList to firebase ARray
					$scope.taskList = tasksInfo;
				} 



			} //userAuthenticated
		}) //on Authentication

}]);