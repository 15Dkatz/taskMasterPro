myApp.controller('CheckInsController', 
	['$scope', '$rootScope', '$location', '$firebaseObject', '$routeParams', '$firebaseArray', 'FIREBASE_URL', 
	function($scope, $rootScope, $location, $firebaseObject, $routeParams, $firebaseArray, FIREBASE_URL) {

		$scope.whichmeeting = $routeParams.mId;
		$scope.whichuser = $routeParams.uId;

		var ref = new Firebase(FIREBASE_URL + 'users/' + 
			$scope.whichuser + '/meetings/' + $scope.whichmeeting + '/checkins');

		//asking the info from the database, the list of checkins, since that's what ref refers to by esetablishing '/checkins'
		var checkinsList = $firebaseArray(ref);
		$scope.checkins = checkinsList; //later ng-repeated in checkinslist.html

		//defaulting the filter selections
		$scope.order="firstname";
		$scope.direction=null;
		$scope.query='';
		$scope.recordId='';

		$scope.addCheckin = function() {
			var checkinsInfo = $firebaseArray(ref);
			var myData = {
				firstname: $scope.user.firstname,
				lastname: $scope.user.lastname,
				email: $scope.user.email,
				date: Firebase.ServerValue.TIMESTAMP
			};

			checkinsInfo.$add(myData).then(function() {
				$location.path('/checkins/' + $scope.whichuser + '/' + 
					$scope.whichmeeting + '/checkinsList')
			});
		}; //AddCheckin
		//checkin -> go to a newpage.

		$scope.deleteCheckin = function(id) {
			console.log("deleting");
			var refDel = new Firebase(FIREBASE_URL + '/users/' +
				$scope.whichuser + '/meetings/' + 
				$scope.whichmeeting + '/checkins/' + id);
			var record = $firebaseObject(refDel);
			record.$remove(id);
		}

		$scope.pickRandom = function() {
			var whichRecord = Math.floor(Math.random()*checkinsList.length);
			$scope.recordId = checkinsList.$keyAt(whichRecord);
		};

		$scope.showLove = function(myCheckin) {
			myCheckin.show = !myCheckin.show;
			//above setting to true or false, opposite of what it used to be

			if (myCheckin.userState == 'expanded') {
				myCheckin.userState = '';
			} else {
				myCheckin.userState = 'expanded';
			}
		};

		$scope.giveLove = function(myCheckin, myGift) {
			var refLove = new Firebase(FIREBASE_URL + '/users/' +
				$scope.whichuser + '/meetings/' + 
				$scope.whichmeeting + '/checkins/' + myCheckin.$id +
				'/awards');
			var checkinsArray = $firebaseArray(refLove);

			if (myGift==null) {
				myGift='';
			}

			var myData = {
				name: myGift,
				date: Firebase.ServerValue.TIMESTAMP
			};	//myData

			checkinsArray.$add(myData);
		}; //giveLove

		$scope.deleteLove = function(checkinId, award) {
			var refLove = new Firebase(FIREBASE_URL + '/users/' +
				$scope.whichuser + '/meetings/' + 
				$scope.whichmeeting + '/checkins/' + checkinId +
				'/awards');
			var record = $firebaseObject(refLove);
			record.$remove(award);
		}

}]);