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

//Set gloabl variables and functions
.run(function($rootScope, $ionicSideMenuDelegate, $ionicLoading) {
  $rootScope.logged_in = ""
  $rootScope.user_basic = ""

  $rootScope.close_menus = function(){
    $ionicSideMenuDelegate.toggleLeft(false);
    $ionicSideMenuDelegate.toggleRight(false);
  }

  $rootScope.show_loading = function(){
    $ionicLoading.show({
      template: '<i class="icon ion-loading-d big_loading"></i> Loading...'
    });
  }

  $rootScope.hide_loading = function(){
    $ionicLoading.hide();
  }
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

  .state('main.holds', {
    url: 'holds',
    templateUrl: "/template/holds.html",
    controller: 'HoldsCtrl',
  })

  .state('main.checkouts', {
    url: 'checkouts',
    templateUrl: '/template/checkouts.html',
    controller: 'CheckoutCtrl',
  })

  $urlRouterProvider.otherwise("/search");
})

//Search Controller
function SearchCtrl($scope, $rootScope, $http, $location, $stateParams, hold, item_details){

  $scope.search = function(more){
    if ($stateParams.query != $scope.query){
       $scope.page = 0
       $scope.current_search = $scope.query
      $location.path('/search').search('query', $scope.query);
      return
    }

    $rootScope.show_loading();

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
      $rootScope.hide_loading();
    }).error(function(){
      $rootScope.hide_loading();
      alert("server taking to long to respond")

    });
  };

  $scope.item_details = function(record_id){
    item_details.show(record_id);
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

//Hold Controller
function HoldsCtrl($scope, $rootScope, $http, $ionicLoading, $q, item_details){
  $scope.holds = function(){
    var token = localStorage.getItem('token')
    $rootScope.show_loading();
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/account/holds',
      params: {"token": token},
      timeout: 15000, 
    }).success(function(data) {
      $scope.holds = data.holds
      $rootScope.hide_loading();
    }).error(function(){
      alert("server taking to long to respond")
      $rootScope.hide_loading();
    });
  };

    $scope.item_details = function(record_id){
      item_details.show(record_id);
    };
  
  $rootScope.close_menus();    
  $scope.holds();
}

//Checkout Controller
function CheckoutCtrl($scope, $rootScope, $http, $ionicLoading, $q, item_details){
  $scope.checkouts = function(){
    var token = localStorage.getItem('token')
    $rootScope.show_loading();
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/account/checkouts',
      params: {"token": token},
      timeout: 15000, 
    }).success(function(data) {
      $scope.checkouts = data.checkouts
      $rootScope.hide_loading();
    }).error(function(){
      alert("server taking to long to respond")
      $rootScope.hide_loading();
    });
  };

  $scope.item_details = function(record_id){
    item_details.show(record_id);
  };

  $scope.renew = function(checkout_id){
    var token = localStorage.getItem('token')
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/account/checkouts',
      params: {"token": token, "checkout_id": checkout_id},
      timeout: 15000,
    }).success(function(data){
      if (data.message != 'Invalid token'){
        alert(data.confirmation_messages[0].message)
        var hold_button = document.getElementById('hold_' + record_ids)
        hold_button.innerHTML = "held!";
        hold_button.disabled = true;
        login.login();
      }else{
        alert("bad token")
      }
    })  
  };

  $rootScope.close_menus();  
  $scope.checkouts();
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
      $rootScope.show_loading();
    }
    $http({
      method: 'GET',
      url: login_url,
      params: login_params,
      timeout: 15000, 
    }).success(function(data) {
       // response data
      $rootScope.hide_loading();
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
      $rootScope.hide_loading();
    });
    
    }
  }
});

app.factory('item_details', function($http, $ionicModal, $rootScope){
  return {
    show: function(record_id, $scope){

      $scope = $scope || $rootScope.$new();

      $ionicModal.fromTemplateUrl('/template/item_modal.html', function(modal){
        $scope.modal = modal;
      }, 
      {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };

      $rootScope.show_loading();


      $http({
        method: 'GET',
        url: 'http://ilscatcher2.herokuapp.com/items/details',
        params: {"record": record_id},
        timeout: 15000, 
      }).success(function(data){
           $scope.openModal();
            $scope.details = data.item_details
            $scope.copies = data.copies
            $rootScope.hide_loading();
      })
    }  
  }
})

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
        var hold_button = document.getElementById('hold_' + record_ids)
        hold_button.innerHTML = "held!";
        hold_button.disabled = true;
        login.login();
      }else{
        alert("bad token")
      }
    }).error(function(){
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