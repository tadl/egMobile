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



  .state('main', {
    url: '/',
    template: '<div ui-view></div>',
    views: {
        'account@': {
          templateUrl: 'template/account.html',
          controller: 'AccountCtrl',
        },
        'main@':{
          template: '<div ui-view></div>'
        }
      }

  })



  .state('main.search', {
    url: 'search?query',
    templateUrl: '/template/search.html',
    controller: 'SearchCtrl',

  })

  
  
 

 // $urlRouterProvider.otherwise("/");
})


function SearchCtrl($scope, $http, $ionicLoading, $ionicModal, $location, $stateParams){
  $ionicModal.fromTemplateUrl('/template/item_modal.html', function(modal) 
    {
      $scope.modal = modal;
    }, 
    {
      scope: $scope,
      animation: 'slide-in-up'
    }
  );

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };  



  $scope.search = function(more){
    if ($stateParams.query != $scope.query){
       $scope.page = 0
       $scope.current_search = $scope.query
      $location.path('/search').search('query', $scope.query);
      return
    }

    $ionicLoading.show({
      template: '<i class="icon ion-loading-d big_loading"></i> Loading...'
    });

    if(more != 'true'){
      $scope.page = 0;
    }

    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/search/basic',
      timeout: 15000,
      params: {query: $scope.query, page: $scope.page}
    }).success(function(data) {
       // response data
      $scope.page = data.page
      $scope.more_results = data.more_results;
      $scope.new_results = data.results
      if(more == 'true'){
        $scope.results = $scope.results.concat($scope.new_results)
        $scope.page = +$scope.page + 1
      }else{
        $scope.results = data.results;
        $scope.page = +$scope.page + 1
      }
      $ionicLoading.hide();
    }).error(function(){
      $ionicLoading.hide();
      alert("server taking to long to respond")

    });
  };

  $scope.item_details = function(item_id){
    $ionicLoading.show({
      template: '<i class="icon ion-loading-d big_loading"></i> Loading...'
    });

    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/items/details',
      params: {record: item_id},
      timeout: 15000, 
    }).success(function(data) {
      $ionicLoading.hide();
      $scope.openModal();
      $scope.details = data.item_details
    }).error(function(){
      $ionicLoading.hide();
      alert("server taking to long to respond")
    });
  };

  $scope.query = $stateParams.query;

  if($scope.query != null || $scope.current_search != $scope.query ){
    $scope.search();
  }


}

function AccountCtrl($scope, $http, $ionicLoading){
  $scope.login = function(){
    
    if (localStorage['token'] != null){
      $scope.token = localStorage.getItem('token'),    
      $scope.login_url = 'http://ilscatcher2.herokuapp.com/account/check_token',
      $scope.login_params = {token: $scope.token}
    }else{
      $scope.login_url = 'http://ilscatcher2.herokuapp.com/account/login',
      $scope.login_params = {username: $scope.username, password: $scope.password}
    }

    $http({
      method: 'GET',
      url: $scope.login_url,
      params: $scope.login_params,
      timeout: 15000, 
    }).success(function(data) {
       // response data
      if (data.message == 'failed'){
        localStorage.clear('token');
        $scope.logged_in = false
        return
      } else {
        $scope.full_name = data.full_name
        $scope.checkouts = data.checkouts
        $scope.holds = data.holds
        $scope.holds_ready = data.holds_ready
        $scope.fine = data.fine
        localStorage.setItem('token', data.token)
        $scope.logged_in = true
      }
    
    }).error(function(){
      alert("server taking to long to respond")
    });
  }

  $scope.logout = function(){
    localStorage.clear('token');
    $scope.logged_in = false
  }

  if (localStorage['token'] != null){
      $scope.login();
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