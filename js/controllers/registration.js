myApp.controller('RegistrationController',
  ['$scope', 'Authentication',
  function($scope, Authentication) {
  $scope.logoutStatus=false;
  
  $scope.login = function() {
    Authentication.login($scope.user);
    $scope.logoutStatus = true;
  }; //login

  $scope.logout = function() {
    Authentication.logout();
    $scope.logoutStatus = false;
  }; //logout

  $scope.register = function() {
    Authentication.register($scope.user);
  }; // register

}]); // Controller