var kz_mob = angular.module('kz_mob', ['ionic']);

kz_mob.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

kz_mob.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
	cache: false,
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  })
  
  .state('app.items', {
	  cache: true,
      url: '/items',
      views: {
        'menuContent': {
          templateUrl: 'templates/items.html',
		  controller: 'itemsCtrl'
        }
      }
    })
	
	.state('app.myItems', {
	  cache: false,
      url: '/myItems',
      views: {
        'menuContent': {
          templateUrl: 'templates/myItems.html',
		  controller: 'myItemsCtrl'
        }
      }
    })
	
	.state('app.itemDetail', {
	  cache: false,
      url: '/itemDetail/:itemId/:user_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/itemDetail.html',
		  controller: 'itemDetailCtrl'
        }
      }
    })
	
	.state('app.addItem', {
	  cache: false,
      url: '/addItem',
      views: {
        'menuContent': {
          templateUrl: 'templates/addItem.html',
		  controller: 'addItemCtrl'
        }
      }
    })
	
	.state('app.editItem', {
	  cache: false,
      url: '/editItem/:itemId',
      views: {
        'menuContent': {
          templateUrl: 'templates/editItem.html',
		  controller: 'editItemCtrl'
        }
      }
    })
	
	.state('app.login', {
	  cache: false,
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl'
        }
      }
    })
	
    .state('app.register', {
	  cache: false,
      url: '/register',
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'registerCtrl'
        }
      }
    })
	
	 .state('app.profile', {
	  cache: false,
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html',
          controller: 'profileCtrl'
        }
      }
    })
	
	 .state('app.about', {
	  cache: false,
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html',
          controller: 'aboutCtrl'
        }
      }
    })
	
	.state("app.logout", {
		cache: false,
		url: '/logout',
		views: {
			'menuContent': {
				templateUrl: 'templates/items.html',
				controller: 'logoutCtrl'
			}
		}
	})
	
	.state('app.messages', {
		cache: false,
		url: "/messages",
		views: {
			"menuContent": {
				templateUrl : 'templates/messages.html',
				controller : 'messagesCtrl'
			}
		}
	})
	
	.state('app.view_message', {
	  cache: false,
      url: '/view_message',
      views: {
        'menuContent': {
          templateUrl: 'templates/view_message.html',
		  controller: 'viewMessageCtrl'
        }
      }
    })
	
   .state('app.send_message', {
	  cache: false,
	  url: '/send_message/:user_id',
	  views: {
		'menuContent': {
		  templateUrl: 'templates/send_message.html',
		  controller: 'sendMessageCtrl'
		}
	  }
    })
	
	.state('app.history', {
	  cache: false,
      url: '/history',
      views: {
        'menuContent': {
          templateUrl: 'templates/history.html',
		  controller: 'historyCtrl'
        }
      }
    })
	
	.state('app.viewProfile', {
		cache: false,
		url: '/viewProfile/:targetUser/:targetItem',
		views: {
			'menuContent': {
				templateUrl: 'templates/viewProfile.html',
				controller: 'viewProfileCtrl'
			}
		}
	})
	  
	.state('app.userItems', {
		cache: false,
		url: '/userItems/:targetUser',
		views: {
			'menuContent': {
				templateUrl: 'templates/userItems.html',
				controller: 'userItemsCtrl'
			}
		}
	})
	
	.state('app.favs', {
		cache: false,
		url: '/favs',
		views: {
			'menuContent': {
				templateUrl: 'templates/favs.html',
				controller: 'favsCtrl'
			}
		}
	})
	  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/items');
});
