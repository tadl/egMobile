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

//Set gloabl variables
.run(function($rootScope) {
    $rootScope.logged_in = ""
    $rootScope.user_basic = "baseball"
})

//Create routes
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

  $urlRouterProvider.otherwise("/search");
})

//Search Controller
function SearchCtrl($scope, $http, $ionicLoading, $ionicModal, $location, $stateParams, hold){
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
      $scope.copies = data.copies
    }).error(function(){
      $ionicLoading.hide();
      alert("server taking to long to respond")
    });
  };

  $scope.place_hold = function(record_id){
    hold.place(record_id);
  }

  $scope.query = $stateParams.query;

  if($scope.query != null || $scope.current_search != $scope.query ){
    $scope.search();
  }
}

//Account Controller
function AccountCtrl($scope, $rootScope, $http, $ionicLoading, login){
 
  $scope.login = function(){
    login.login($scope.username, $scope.password)    
  }

  $scope.logout = function(){
    localStorage.removeItem('token');
    $rootScope.logged_in = false
  }

  if (localStorage['token'] != null){
    login.login();
  }
}

//Login Factory
app.factory('login', function($http, $rootScope){
  return {
    login: function(username, password){
      var username = username
      var password = password
      if (localStorage['token'] != null){
        var token = localStorage.getItem('token'),    
        login_url = 'http://ilscatcher2.herokuapp.com/account/check_token',
        login_params = {"token": token}
    }else{
      login_url = 'http://ilscatcher2.herokuapp.com/account/login',
      login_params = {"username": username, "password": password}
    }
    $http({
      method: 'GET',
      url: login_url,
      params: login_params,
      timeout: 15000, 
    }).success(function(data) {
       // response data
      if (data.message == 'login failed' || data.message == 'failed' ){
        localStorage.removeItem('token');
        $rootScope.logged_in = false
        $rootScope.user_basic = {}
      } else {
        localStorage.setItem('token', data.token)
        $rootScope.user_basic = data
        $rootScope.logged_in = true
      }   
    }).error(function(){
      alert("server taking to long to respond")
    });

    }
  }

});

app.factory('hold', function($http, $rootScope, login){
  return {
    place: function(record_ids){
      var record_ids = record_ids
      if ($rootScope.logged_in == false){
        alert("login to place hold")
      }else{
        var token = localStorage.getItem('token')
        $http({
        method: 'GET',
        url: 'http://ilscatcher2.herokuapp.com/account/place_holds',
        params: {"record_ids": record_ids, "token": token},
        timeout: 15000, 
    }).success(function(data) {
      if (data.message != 'Invalid token'){
        alert(data.confirmation_messages[0].message)
        login.login();
      }else{
        alert("bad token")
      }
    }).error(function(){
      $ionicLoading.hide();
      alert("server taking to long to respond")
    });
        
      }
    }
  }
});

//NgEnter Directive
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