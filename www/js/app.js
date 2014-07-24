// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('egmobile', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('search', {
    url: '/search?query', 
    //If in a folder, template/welcome.html    
    templateUrl: 'template/search.html',
    controller: 'SearchCtrl'
  })
  
 

  $urlRouterProvider.otherwise("/");
})


function SearchCtrl($scope, $http, $ionicLoading, $location, $stateParams){




  $scope.search = function(){

    if($scope.results){
      $scope.page = +$scope.page + 1
    }else{
      $scope.page = 0
    }
    

    $location.path('/search').search('query', $scope.query);

    $ionicLoading.show({
      template: 'Loading...'
    });

    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/search/basic',
      timeout: 10000,
      params: {query: $scope.query, page: $scope.page}
    }).success(function(data) {
       // response data
      $scope.page = data.page
      $scope.more_results = data.more_results;
      $scope.new_results = data.results
      if(data.page != 0){
        alert('trying to get more')
        $scope.results = $scope.results.concat($scope.new_results)
        alert($scope.new_results)
      }else{
        $scope.results = data.results;
      }
      $ionicLoading.hide();
    }).error(function(){
      $ionicLoading.hide();
    });
  };

    $scope.query = $stateParams.query;

  if($scope.query != null){
    $scope.search();
  }

}

//This lets us use ngEnter 

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});






