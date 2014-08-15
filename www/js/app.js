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
.run(function($rootScope, $ionicSideMenuDelegate, $ionicLoading, $ionicScrollDelegate) {
  $rootScope.logged_in = ""
  $rootScope.user_basic = ""
  $rootScope.show_loading = function(){
    $ionicLoading.show({
      template: '<i class="icon ion-loading-d big_loading"></i> Loading...'
    });
  }

  $rootScope.hide_loading = function(){
    $ionicLoading.hide();
  }

  $rootScope.show_account = function(){
    $ionicSideMenuDelegate.toggleRight(true);
  }

  $rootScope.$on('$viewContentLoaded', function(){ 
    $ionicScrollDelegate.scrollTop();
  });

})

//Create routes
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('main', {
    url: '/',
    views: {
      'account@': {
        templateUrl: 'template/account.html',
        controller: 'AccountCtrl',
      },
      'main@':{
        template: '<ui-view/>'
      },
      'menu@':{
        templateUrl: 'template/menu.html'
      }
    }
  })

  .state('main.search', {
    url: 'search?query&format&sort&availability&loc&qtype',
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

  .state('main.card',{
    url: 'card',
    templateUrl: '/template/card.html',
    controller: 'CardCtrl',
  })

  .state('main.locations',{
    url: 'locations',
    templateUrl: '/template/locations.html',
    controller: 'LocationCtrl',
  })

  .state('main.events',{
    url: 'events',
    templateUrl: '/template/events.html',
    controller: 'EventsCtrl',
  })

  .state('main.news',{
    url: 'news',
    templateUrl: '/template/news.html',
    controller: 'NewsCtrl',
  })

  $urlRouterProvider.otherwise("/search");

})

//Search Controller
function SearchCtrl($scope, $rootScope, $http, $location, $stateParams, hold, item_details){
  $scope.advance_search = false
  
  $scope.search = function(more){

    if(more != 'true'){
      $scope.page = 0;
      $rootScope.show_loading();
    }

   
    var search_params = {}
    search_params['query'] = $scope.query
    search_params['format'] = $scope.format
    search_params['sort'] = $scope.sort
    search_params['availability'] = $scope.availability
    search_params['loc'] = $scope.loc
    search_params['qtype'] = $scope.qtype

    if ($stateParams.query != $scope.query || $stateParams.format != $scope.format || $stateParams.sort != $scope.sort || $stateParams.availability != $scope.availability || $stateParams.loc != $scope.loc || $stateParams.qtype != $scope.qtype){
      $scope.current_search = $scope.query
      $location.path('/search').search(search_params);
      return
    }

    search_params['page'] = $scope.page


    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/search/basic',
      timeout: 15000,
      params: search_params
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
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }).error(function(){
      $rootScope.hide_loading();
      alert("server taking to long to respond")

    });
  };

  $scope.item_details = function(record_id){
    item_details.show(record_id);
  };

  $scope.toggle_advanced = function(){
    if($scope.advance_search == false){
      $scope.advance_search = true
    }else{
      $scope.advance_search = false
    } 
  }

  $scope.place_hold = function(record_id){
    hold.place(record_id);
  }

  $scope.query = $stateParams.query;
  $scope.format = $stateParams.format;
  $scope.sort = $stateParams.sort;
  $scope.availability = $stateParams.availability; 
  $scope.loc = $stateParams.loc
  $scope.qtype = $stateParams.qtype

  if($scope.format != 'all' || $scope.sort != 'relevance' || $scope.loc != '22' || $scope.availability != 'off' || $scope.qtype != 'keyword' ){
    $scope.advance_search = true
  }

  if($scope.query != null || $scope.current_search != $scope.query ){
    $scope.search();
  }
}

//Account Controller
function AccountCtrl($scope, $rootScope, $http, $location, $ionicLoading, login){
 
  $scope.login = function(){
    login.login($scope.username, $scope.password)    
  }

  $scope.logout = function(){
    localStorage.clear();
    $rootScope.logged_in = false
    $rootScope.user_basic = {}
    $location.path( "/home" );
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

  
  $scope.change_hold = function(hold_id, task){
    var token = localStorage.getItem('token')
    $rootScope.show_loading();
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/account/holds',
      params: {"token": token, "task": task, "hold_id": hold_id},
      timeout: 15000, 
    }).success(function(data) {
      $scope.holds = data.holds
      $rootScope.user_basic['holds'] = data.count
      $rootScope.hide_loading();
    }).error(function(){
      alert("server taking to long to respond")
      $rootScope.hide_loading();
    });
  }



  $scope.item_details = function(record_id){
    item_details.show(record_id);
  };
    
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
      url: 'http://ilscatcher2.herokuapp.com/account/renew_items',
      params: {"token": token, "circ_ids": checkout_id},
      timeout: 15000,
    }).success(function(data){
      if (data.message != 'Invalid token'){
        if (data.confirmation != null){
          alert(data.confirmation);
        }else{
          alert(data.errors[0].message);
        }
        $scope.checkouts = data.checkouts
      }else{
        alert("Your login has expired")
      }
    })  
  };

  $scope.checkouts();
}

//Card Controller

function CardCtrl($scope, $rootScope, $ionicLoading, $location, login){
  $scope.show_card = function(){
    if(localStorage.getItem('card')){
      var card = localStorage.getItem('card')
      $("#barcode").JsBarcode(card,{format:"CODE128",displayValue:true,fontSize:15, width: 2}); 
    }else{
      if($rootScope.logged_in == true){
        setTimeout(function() { $scope.show_card()}, 1500);
      }else{
        $location.path( "/home" );
        $rootScope.show_account();
      }  
    }
  }
  $scope.show_card()
}



//Location Controller

function LocationCtrl($scope, $rootScope, $http, $ionicLoading){
  $scope.get_locations = function(){
    $rootScope.show_loading();
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/web/locations',
      timeout: 15000, 
    }).success(function(data) {
      $scope.locations = data.locations
      $rootScope.hide_loading();
    }).error(function(){
      alert("server taking to long to respond")
      $rootScope.hide_loading();
    });
  };

  $scope.get_locations();
}


//Events Controller

function EventsCtrl($scope, $rootScope, $http, $ionicLoading){
  $scope.get_events = function(){
    $rootScope.show_loading();
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/web/events',
      timeout: 15000, 
    }).success(function(data) {
      $scope.events = data.events
      $rootScope.hide_loading();
    }).error(function(){
      alert("server taking to long to respond")
      $rootScope.hide_loading();
    });
  };

  $scope.get_events();
}

//News Controller

function NewsCtrl($scope, $rootScope, $http, $ionicLoading){
  $scope.get_news = function(){
    $rootScope.show_loading();
    $http({
      method: 'GET',
      url: 'http://ilscatcher2.herokuapp.com/web/news',
      timeout: 15000, 
    }).success(function(data) {
      $scope.news = data.news
      $rootScope.hide_loading();
    }).error(function(){
      alert("server taking to long to respond")
      $rootScope.hide_loading();
    });
  };

  $scope.get_news();
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
        localStorage.setItem('card', data.card)
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
        $rootScope.show_loading();
        var token = localStorage.getItem('token')
        $http({
        method: 'GET',
        url: 'http://ilscatcher2.herokuapp.com/account/place_holds',
        params: {"record_ids": record_ids, "token": token},
        timeout: 15000, 
      }).success(function(data) {
      $rootScope.hide_loading(); 
        if (data.message != 'Invalid token'){
          alert(data.confirmation_messages[0].message)
          if(data.confirmation_messages[0].message == 'Hold was successfully placed' || data.confirmation_messages[0].message == 'Hold was not successfully placed Problem: User already has an open hold on the selected item' ){
            var hold_button = document.getElementById('hold_' + record_ids)
            hold_button.innerHTML = "On Hold";
            hold_button.disabled = true;
            login.login();
          }  
        }else{
          alert("bad token")
          login.login();
        }
      }).error(function(){
        $rootScope.hide_loading(); 
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