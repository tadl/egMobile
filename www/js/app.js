// Set up all URLs as vars
var ilsSearchBasic = 'https://ilscatcher2.herokuapp.com/search/basic';
var ilsAccountHolds = 'https://ilscatcher2.herokuapp.com/account/holds';
var ilsAccountCheckouts = 'https://ilscatcher2.herokuapp.com/account/checkouts';
var ilsAccountRenew = 'https://ilscatcher2.herokuapp.com/account/renew_items';
var webLocations = 'https://ilscatcher2.herokuapp.com/web/locations';
var webEvents = 'https://ilscatcher2.herokuapp.com/web/events';
var webNews = 'https://ilscatcher2.herokuapp.com/web/news';
var ilsAccountLogin = 'https://ilscatcher2.herokuapp.com/account/login';
var ilsAccountToken = 'https://ilscatcher2.herokuapp.com/account/check_token';
var webNode = 'https://www.tadl.org/export/node/json/';
var ilsItemDetails = 'https://ilscatcher2.herokuapp.com/items/details';
var ilsAccountHoldsPlace = 'https://ilscatcher2.herokuapp.com/account/place_holds';

var app = angular.module('egmobile', ['ionic','ngFitText'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.run(function($ionicPlatform, $state) {
    $ionicPlatform.registerBackButtonAction(function(e) {
        if ($state.is('main.home')) {
            ionic.Platform.exitApp();
        } else {
            navigator.app.backHistory();
        }
        e.preventDefault();
        return false;
    }, 101)
})

// Set gloabl variables and functions
.run(function($rootScope, $ionicSideMenuDelegate, $ionicLoading, $ionicScrollDelegate) {
    $rootScope.logged_in = ""
    $rootScope.user_basic = ""
    $rootScope.show_loading = function(custom){
        var loadingtext = custom || 'Loading...';
        $ionicLoading.show({
            template: '<i class="icon ion-loading-d big_loading"></i> <span class="loading_text">' + loadingtext + '</span>'
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

// Create routes
.config(function($stateProvider, $urlRouterProvider, fitTextConfigProvider) {
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
        templateUrl: 'template/search.html',
        controller: 'SearchCtrl',
    })

    .state('main.home', {
        url: 'home',
        templateUrl: 'template/home.html',
        controller: 'HomeCtrl',
    })

    .state('main.holds', {
        url: 'holds',
        templateUrl: 'template/holds.html',
        controller: 'HoldsCtrl',
    })

    .state('main.checkouts', {
        url: 'checkouts',
        templateUrl: 'template/checkouts.html',
        controller: 'CheckoutCtrl',
    })

    .state('main.card',{
        url: 'card',
        templateUrl: 'template/card.html',
        controller: 'CardCtrl',
    })

    .state('main.locations',{
        url: 'locations',
        templateUrl: 'template/locations.html',
        controller: 'LocationCtrl',
    })

    .state('main.events',{
        url: 'events',
        templateUrl: 'template/events.html',
        controller: 'EventsCtrl',
    })

    .state('main.news',{
        url: 'news',
        templateUrl: 'template/news.html',
        controller: 'NewsCtrl',
    })

    $urlRouterProvider.otherwise('/home');

    // Just put that anywhere, Bill...
    fitTextConfigProvider.config = {
        debounce: false,
        delay: 1000
    };

})

// Search Controller
app.controller('SearchCtrl', function($scope, $rootScope, $http, $location, $stateParams, $timeout, popup, hold, item_details){
    $scope.advance_search = false;
    $scope.search = function(more){
        if(more != 'true') {
            $scope.page = 0;
            $rootScope.show_loading('Searching...');
        }

        var search_params = {}
        search_params['query'] = $scope.query
        search_params['format'] = $scope.format
        search_params['sort'] = $scope.sort
        search_params['availability'] = $scope.availability
        search_params['loc'] = $scope.loc
        search_params['qtype'] = $scope.qtype

        if ($stateParams.query != $scope.query || $stateParams.format != $scope.format || $stateParams.sort != $scope.sort || $stateParams.availability != $scope.availability || $stateParams.loc != $scope.loc || $stateParams.qtype != $scope.qtype) {
            $scope.current_search = $scope.query
            $location.path('/search').search(search_params);
            return
        }

        search_params['page'] = $scope.page

        $http({
            method: 'GET',
            url: ilsSearchBasic,
            timeout: 15000,
            params: search_params
        }).success(function(data) {
            $rootScope.hide_loading();
            jQuery.each(data.results, function() {
                if (this.availability.length) {
                    var tmpavail = this.availability.pop();
                    this.availability = tmpavail;
                }
            });
            $scope.page = data.page
            $scope.more_results = data.more_results;
            $scope.new_results = data.results
            if (more == 'true') {
                $scope.results = $scope.results.concat($scope.new_results)
                $scope.page = +$scope.page + 1
            } else {
                $scope.results = data.results;
                $scope.page = +$scope.page + 1
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.');
        });
    };

    $scope.item_details = function(record_id) {
        item_details.show(record_id);
    };

    $scope.showAlert = function(title,message) {
        popup.alert(title,message);
    };

    $scope.resetSearch = function() {
        $scope.query = "";
        $timeout(function() {
            $('#searchBox').focus();
        }, 0);
    }

    $scope.openLink = function(link) {
        try {
            window.open(link, '_system', 'location=no,toolbar=yes');
        } catch (err) {
            popup.alert('Oops','Unable to open that link. Please try again.');
        }
    }

    $scope.toggle_advanced = function() {
        if($scope.advance_search == false) {
            $scope.advance_search = true;
        } else {
            $scope.advance_search = false;
        }
    }

    $scope.place_hold = function(record_id) {
        hold.place(record_id);
    }

    $scope.query = $stateParams.query;
    $scope.format = $stateParams.format;
    $scope.sort = $stateParams.sort;
    $scope.availability = $stateParams.availability;
    $scope.loc = $stateParams.loc;
    $scope.qtype = $stateParams.qtype;

    if (($scope.format != 'all') || ($scope.sort != 'relevance') || ($scope.loc != '22') || ($scope.availability != 'off') || ($scope.qtype != 'keyword')) {
        $scope.advance_search = true
    }

    if (($scope.query != null) || ($scope.current_search != $scope.query)) {
        $scope.search();
    }
});

// Home Controller (this does nothing, actually)
app.controller('HomeCtrl', function($scope, $rootScope, $ionicLoading) {
});

// Account Controller
app.controller('AccountCtrl', function($scope, $rootScope, $http, $location, $ionicLoading, login) {
    $scope.login = function() {
        login.login($scope.username, $scope.password)
    }

    $scope.logout = function() {
        localStorage.clear();
        $rootScope.logged_in = false
        $rootScope.user_basic = {}
        $location.path('/home');
    }

    if (localStorage['token'] != null){
    login.login();
    }
});

// Holds Controller
app.controller('HoldsCtrl', function($scope, $rootScope, $http, $ionicLoading, $q, item_details, popup) {
    $scope.holds = function() {
        var token = localStorage.getItem('token')
        $rootScope.show_loading('Loading holds...');
        $http({
            method: 'GET',
            url: ilsAccountHolds,
            params: {"token": token},
            timeout: 15000,
        }).success(function(data) {
            $rootScope.hide_loading();
            $scope.holds = data.holds
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    };

    $scope.change_hold = function(hold_id, task) {
        var token = localStorage.getItem('token')
        $rootScope.show_loading();
        $http({
            method: 'GET',
            url: ilsAccountHolds,
            params: {"token": token, "task": task, "hold_id": hold_id},
            timeout: 15000,
        }).success(function(data) {
            $rootScope.hide_loading();
            $scope.holds = data.holds
            $rootScope.user_basic['holds'] = data.count
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    }

    $scope.item_details = function(record_id) {
        item_details.show(record_id);
    };

    $scope.holds();
});

// Checkout Controller
app.controller('CheckoutCtrl', function($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $q, item_details, login, popup) {
    $scope.checkouts = function() {
        var token = localStorage.getItem('token')
        $rootScope.show_loading('Loading checkouts...');
        $http({
            method: 'GET',
            url: ilsAccountCheckouts,
            params: {"token": token},
            timeout: 15000,
        }).success(function(data) {
            $rootScope.hide_loading();
            var rightnow = new Date();
            var renewids = [];
            var dueids = [];
            jQuery.each(data.checkouts, function() {
                var due = new Date(this.iso_due_date);
                if (due < rightnow) {
                    this.overdue = true;
                    dueids.push(Number(this.checkout_id));
                } else { this.overdue = false; }
                if ((this.overdue == true) && (this.renew_attempts > 0)) {
                    this.renew_urgent = true;
                    renewids.push(Number(this.checkout_id));
                } else { this.renew_urgent = false; }
            });
            var renewall = sessionStorage.getItem('renewall');
            if ((renewids.length) && (renewall != 'nope')) {
                var message = '';
                if (renewids.length == dueids.length) {
                    message = 'You have ' + dueids.length + ' overdue item' + ((dueids.length>1)?'s':'') + ' with available renewals, would you like to attempt to renew ' + ((renewids.length>1)?'them':'it') + '?';
                } else {
                    message = 'You have ' + dueids.length + ' overdue item' + ((dueids.length>1)?'s,':',') + renewids.length + ' with available renewals, would you like to attempt to renew ' + ((renewids.length>1)?'them':'it') + '?';
                }
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Overdue Items',
                    template: message,
                    okText: 'Yes',
                    cancelText: 'Not now'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        $scope.renew(renewids.toString());
                    } else {
                        sessionStorage.setItem('renewall','nope');
                    }
                });
            }
            $scope.checkouts = data.checkouts
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    };

    $scope.item_details = function(record_id) {
        item_details.show(record_id);
    };

    $scope.renew = function(checkout_id) {
        $rootScope.show_loading('Renewing...');
        var token = localStorage.getItem('token')
        $http({
            method: 'GET',
            url: ilsAccountRenew,
            params: {"token": token, "circ_ids": checkout_id},
            timeout: 15000,
        }).success(function(data) {
            $rootScope.hide_loading();
            if (data.message != 'Invalid token') {
                var rightnow = new Date();
                var renewids = [];
                jQuery.each(data.checkouts, function() {
                    var due = new Date(this.iso_due_date);
                    if (due < rightnow) { this.overdue = true; }
                    else { this.overdue = false; }
                    if ((this.overdue == true) && (this.renew_attempts > 0)) {
                        this.renew_urgent = true;
                        renewids.push(Number(this.checkout_id));
                    } else { this.renew_urgent = false; }
                });
                var renewresponse = "";
                if (data.confirmation != null) { renewresponse += data.confirmation + '<br/>'; }
                if (data.errors.length >= 1) {
                    var errcount = 0;
                    jQuery.each(data.errors, function() {
                        errcount++;
                        renewresponse += '<strong>' + this.title + '</strong> ' + this.message;
                        renewresponse += (errcount == data.errors.length)?'.':', ';
                    });
                }
                popup.alert('Renewal Response',renewresponse);
                $scope.checkouts = data.checkouts
            } else {
                popup.alert('Oops','Your login session has expired. Please log in again.')
                login.login();
                $rootScope.show_account();
            }
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    };
    $scope.checkouts();
});

// Card Controller
app.controller('CardCtrl', function($scope, $rootScope, $ionicLoading, $timeout, $location, login) {
    $scope.show_card = function() {
        if(localStorage.getItem('card')) {
            var card = localStorage.getItem('card')
            $("#barcode").JsBarcode(card, { format:'CODE128', displayValue:true, fontSize:16, width: 2 });
        } else {
            if($rootScope.logged_in == true) {
                $timeout(function() { $scope.show_card() }, 1500);
            } else {
                $location.path('/home');
                $rootScope.show_account();
            }
        }
    }
    $scope.show_card()
});

// Location Controller
app.controller('LocationCtrl', function($scope, $rootScope, $http, $ionicLoading, popup) {
    $scope.get_locations = function() {
        $rootScope.show_loading();
        $http({
            method: 'GET',
            url: webLocations,
            timeout: 15000,
        }).success(function(data) {
            $scope.locations = data.locations
            $rootScope.hide_loading();
        }).error(function(){
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    };
    $scope.get_locations();
});


// Events Controller
app.controller('EventsCtrl', function($scope, $rootScope, $http, $ionicLoading, popup, node_details) {
    $scope.get_events = function() {
        $rootScope.show_loading();
        $http({
            method: 'GET',
            url: webEvents,
            timeout: 15000,
        }).success(function(data) {
            $scope.events = data.events
            $rootScope.hide_loading();
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    };
    $scope.node_details = function(record_id) {
        node_details.show(record_id);
    };
    $scope.get_events();
});

// News Controller
app.controller("NewsCtrl",function($scope, $rootScope, $http, $ionicLoading, popup, node_details) {
    $scope.get_news = function() {
        $rootScope.show_loading();
        $http({
            method: 'GET',
            url: webNews,
            timeout: 15000,
        }).success(function(data) {
            $scope.news = data.news
            $rootScope.hide_loading();
        }).error(function() {
            $rootScope.hide_loading();
            popup.alert('Oops','An error has occurred, please try again.')
        });
    };
    $scope.node_details = function(record_id) {
        node_details.show(record_id);
    };
    $scope.get_news();
});

// Login Factory
app.factory('login', function($http, $rootScope, popup) {
    return {
        login: function(username, password) {
            var username = username
            var password = password
            if (localStorage['token'] != null) {
                var token = localStorage.getItem('token'),
                login_url = ilsAccountToken,
                login_params = {"token": token}
            } else {
                login_url = ilsAccountLogin,
                login_params = {"username": username, "password": password}
                $rootScope.show_loading();
            }
            $http({
                method: 'GET',
                url: login_url,
                params: login_params,
                timeout: 15000,
            }).success(function(data) {
                $rootScope.hide_loading();
                if (data.message == 'login failed' || data.message == 'failed' ){
                    localStorage.removeItem('token');
                    $rootScope.logged_in = false
                    $rootScope.user_basic = {}
                } else {
                    localStorage.setItem('token', data.token)
                    localStorage.setItem('card', data.card)
                    var holdpickup = sessionStorage.getItem('holds');
                    if ((data.holds_ready >= 1) && (holdpickup != 'yep')) {
                        popup.alert('Holds available','You have holds available for pickup.');
                        sessionStorage.setItem('holds','yep');
                    }
                    $rootScope.user_basic = data
                    $rootScope.logged_in = true
                }
            }).error(function() {
                $rootScope.hide_loading();
                popup.alert('Oops','An error has occurred, please try again.')
            });
        }
    }
});

// Node Modal factory
app.factory('node_details', function($http, $ionicModal, $rootScope, popup) {
    return {
        show: function(nid, $scope) {
            $scope = $scope || $rootScope.$new();
            $ionicModal.fromTemplateUrl('template/node_modal.html', function(modal) {
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
            $rootScope.show_loading('Loading details...');
            $http({
                method: 'GET',
                url: webNode + nid,
                timeout: 15000,
            }).success(function(data) {
                $rootScope.hide_loading();
                var nodebody = jQuery('<div>' + data.nodes[0].node.body + '</div>').text();
                var nodetitle = jQuery('<span>' + data.nodes[0].node.nodetitle + '</span>').text();
                $scope.node = data.nodes[0].node;
                $scope.node.body = nodebody;
                $scope.node.nodetitle = nodetitle;
                $scope.openModal();
            }).error(function(){
                $rootScope.hide_loading();
                popup.alert('Oops','An error has occurred, please try again.')
            });
        }
    }
});

// Item Modal factory
app.factory('item_details', function($http, $ionicModal, $rootScope, popup) {
    return {
        show: function(record_id, $scope) {
            $scope = $scope || $rootScope.$new();
            $ionicModal.fromTemplateUrl('template/item_modal.html', function(modal) {
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
            $rootScope.show_loading('Loading details...');
            $http({
                method: 'GET',
                url: ilsItemDetails,
                params: {"record": record_id},
                timeout: 15000,
            }).success(function(data) {
                $rootScope.hide_loading();
                $scope.openModal();
                $scope.details = data.item_details
                $scope.copies = data.copies
                $scope.copies_on_shelf = data.copies_on_shelf
                var locations = new Array();
                for (var i = 0; i< data.copies_on_shelf.length; i++) {
                    locations.push(data.copies_on_shelf[i]['location'])
                }
                $scope.locations = jQuery.unique(locations)
            }).error(function() {
                $rootScope.hide_loading();
                popup.alert('Oops','An error has occurred, please try again.')
            });
        }
    }
});

// Popup Alert factory
app.factory('popup', function($rootScope, $ionicPopup, $timeout) {
    return {
        alert: function(title, message, $scope) {
            $scope = $scope || $rootScope.$new();
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
            alertPopup.then(function(res) {
            });
            $timeout(function() {
                alertPopup.close();
            }, 20000);
        }
    }
});

// Hold factory
app.factory('hold', function($http, $rootScope, login, popup) {
    return {
        place: function(record_ids) {
            var record_ids = record_ids
            if ($rootScope.logged_in == false) {
                popup.alert('Authorization required','Please log in to place holds.')
            } else {
                $rootScope.show_loading('Placing hold...');
                var token = localStorage.getItem('token')
                $http({
                    method: 'GET',
                    url: ilsAccountHoldsPlace,
                    params: {"record_ids": record_ids, "token": token},
                    timeout: 15000,
                }).success(function(data) {
                    $rootScope.hide_loading();
                    if (data.message != 'Invalid token') {
                        popup.alert('Hold Response',data.confirmation_messages[0].message);
                        if(data.confirmation_messages[0].message == 'Hold was successfully placed' || data.confirmation_messages[0].message == 'Hold was not successfully placed Problem: User already has an open hold on the selected item' ) {
                            var hold_button = document.getElementById('hold_' + record_ids)
                            hold_button.innerHTML = "On Hold";
                            hold_button.disabled = true;
                            login.login();
                        }
                    } else {
                        popup.alert('Oops','Your login session has expired, please log in again.')
                        login.login();
                        $rootScope.show_account();
                    }
                }).error(function() {
                    $rootScope.hide_loading();
                    popup.alert('Oops','An error has occurred, please try again.')
                });
            }
        }
    }
});

// ng-enter Directive
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

// err-src directive
app.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
            element.bind('load', function() {
                var image = new Image();
                image.src = attrs.src
                var w = image.width;
                if (w == 1) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});
