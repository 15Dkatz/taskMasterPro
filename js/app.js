var myApp = angular.module('taskApp',
  ['ngRoute', 'firebase'])
  .constant('FIREBASE_URL', 'https://taskmasterdk.firebaseio.com/');

myApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/login', {
      templateUrl: 'views/login.html',
      controller: 'RegistrationController'
    }).
    when('/register', {
      templateUrl: 'views/register.html',
      controller: 'RegistrationController'
    }).
    when('/taskmaster', {
      templateUrl: 'views/tasks.html',
      controller: 'TaskController'
    }).
    otherwise({
      redirectTo: '/login'
    });
}]);


// running a python server
// CMD + SPACE (open Spotlight)
// Type Terminal and hit ENTER
// Navigate to your development folder.
// Type python -m SimpleHTTPServer 8000
// Right click in Sublime and Open in Browser