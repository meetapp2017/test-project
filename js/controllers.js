kz_mob.controller('itemsCtrl', function($scope, $rootScope, $stateParams, $timeout, $ionicScrollDelegate, $window, site, service) {

  document.addEventListener('deviceready', onDeviceReady, false);

  function onDeviceReady(){
		site.init();

     	if ($rootScope.profile)
     		service.get_messages_count();

     	$scope.previewImage = function(item) {
     		var url = $rootScope.base_services + item.ImageName;
     		service.previewImage(url);
     	}

     	$scope.getItemsByCategory = function(item){

     		var type = 0;
     		if (typeof(item.type) != "undefined")
     			type = item.type.type;
     		service.itemsCount  = 0;
     		service.prepareItems($scope, type);
     	}

     	$scope.scrollTop = function(){
     		$ionicScrollDelegate.scrollTop(true);
     	}

     	$scope.item = {};
     	$scope.refresh = function(){
     		service.itemsCount  = 0;
     		$scope.item.type = $scope.itemTypes[-1];
     		service.prepareItems($scope, 0);
     		$ionicScrollDelegate.scrollTop();
     	}

		$scope.like = function(item){
			service.showLoader();
			
			var result = service.addLike(item);
			
			result.then(function(state) {	
				service.hideLoader();
			});
		}
		
		$scope.share = function(item) {
			
			var share = {
				method: 'stream.share',
				u: 'https://***.com/share.php?id=' + item.id
			};
   
			FB.ui(share, function(response) { console.log(response); });
			
		}
		
		$scope.viewProfile = function(item) {
			$window.location = "#/app/viewProfile/" + item.user_id + "/" + item.id;
		};
		
     	$scope.refresh();

     	initFareBase();

     	function initFareBase(){

     	    window.FirebasePlugin.subscribe("kz_mob_all_users");
			
       		window.FirebasePlugin.getToken(function(token) {
					if (token)
				    {
						localStorage.setItem('kz_mob_token', token);
						service.checkAndUpdateToken(token);	
					}
					else{
						window.FirebasePlugin.onTokenRefresh(function(token) {
								localStorage.setItem('kz_mob_token', token);
								service.checkAndUpdateToken(token);
						}, function(error){
								//
						});
					}
					
			}, function(error){
				    console.log(error);
			});
			
        }
  }

});

kz_mob.controller('viewProfileCtrl', function($rootScope, $scope, $window, $stateParams, service, site) {
	
	var user = service.getuserById($stateParams.targetUser);
	user.then(function(data) {
		$scope.profile = data;
	});
	
	var item = service.getItemById($stateParams.targetItem, $stateParams.targetUser, true);
	item.then(function(item) {
		var l = item.title.length;
		if (l >= 15) {
			var splitted = item.title.split(" ");
			while (splitted.join(" ").length > 15)
				splitted.pop();
			item.title = splitted.join(" ") + "...";
		}
		$scope.item = item;
	});
	
	$scope.sendMessage = function() {
		$window.location = "#/app/send_message/" + $scope.profile.id;
	};
	
	$scope.viewUserItems = function() {
		$window.location = "#/app/userItems/" + $scope.profile.id;
	};
	
	$scope.share = function() {
		var share = {
			method: 'stream.share',
			u: 'https://***.com/share.php?id=' + $scope.item.id
		};

		FB.ui(share, function(response) { console.log(response); });
	}
	
	$scope.closeProfile = function() {
		$window.history.back();
	};
	
	$scope.add_favs = function(item){
		if (!$rootScope.profile) {
			$window.location = "#/app/login";
			return;
		}
		
		
		var c = site.confirmBox("Любими!", "Добави в любими?");
        c.then(function(state){
			if (!state) return;
			service.showLoader();
			
			service.showLoader();
			var result = service.addFavs($scope.item.user_id);
	
			result.then(function(state) {
				service.hideLoader();
			});
			
		});
	}
	
});

kz_mob.controller('userItemsCtrl', function($scope, $window, $stateParams, service) {
	
	var user = service.getuserById($stateParams.targetUser);
	user.then(function(data) {
		$scope.profile = data;
	});
	
	$scope.refresh = function() {
		service.itemsCount = 0;
		service.prepareItems($scope, 0, $stateParams.targetUser);
	};
	
	$scope.refresh();
	
	$scope.closeUserItems = function() {
		$window.history.back();
	};
});

kz_mob.controller('favsCtrl', function($scope, $window, service, site) {
	
	$scope.favs = [];
	getFavs();
	
	function getFavs(){
	
		result = service.getFavs();
	
		result.then(function(favs) {
			$scope.favs = favs;
			service.hideLoader();
		});	
	}
	
	
	$scope.remove_fav = function(fav){
		
		var c = site.confirmBox("Внимание!", "Премахни от любими?");
        c.then(function(state){
			if (!state) return;
			service.showLoader();
			
			result = service.remove_fav(fav.user_id);
		
			result.then(function(state) {
				service.hideLoader();
				getFavs();
			});	
			
		});
	};
	
	$scope.sendMessage = function(profile) {
		$window.location = "#/app/send_message/" + profile.user_id;
	};
	
	$scope.viewUserItems = function(profile) {
		$window.location = "#/app/userItems/" + profile.user_id;
	};
	
	$scope.closeFavs = function() {
		$window.history.back();
	};
});


kz_mob.controller('itemDetailCtrl', function($scope, $rootScope, $stateParams, $window, $timeout, site, service) {

	service.showLoader();
	
	var likes = service.loadLikes($stateParams.itemId);
	likes.then(function(result) {
		$scope.likes = result;
		service.hideLoader();
	});

	
	$scope.share = function() {
		var share = {
			method: 'stream.share',
			u: 'https://***.com/share.php?id=' + $scope.item.id
		};

		FB.ui(share, function(response) { console.log(response); });
	}
	
	var item = service.getItemById($stateParams.itemId, $stateParams.user_id, true);

	item.then(function(item) {
		$scope.item = item;

		//load all comment for item
		var result = service.loadComments(item);
		result.then(function(comments) {
			$scope.comments = comments;
			service.hideLoader();
			//user history
			service.initHistory(item);
		});

		if (!$rootScope.profile) {
			$scope.item.visitCount = "***";
			return;
		}

		var visit = service.addVisitor(item);
		visit.then(function(item) {
			//
		});

		visitCount = service.getVisitorsByCount(item);
		visitCount.then(function(count) {
			$scope.item.visitCount = count;
		});

	});

	$scope.closeDetail = function(){
		$window.history.back();
	}

	$scope.add_favs = function(item){
		if (!$rootScope.profile) {
			$window.location = "#/app/login";
			return;
		}

		var c = confirm("Добави в любими?");
		if (!c) return;

		var result = service.addFavs(item.user_id);

		result.then(function(state) {
			service.hideLoader();
		});

	}

	$scope.addComment = function(comment) {

		if (typeof(comment) === "undefined") return;

		if (!$rootScope.profile) {
			$window.location = "#/app/login";
			return;
		}

		var com = {
			user_id: $rootScope.profile.id,
			item_id: $scope.item.id,
			descr: comment.descr
		}

		var result = service.addComment(com);
		result.then(function(data) {
			$window.location = "#/app/itemDetail/" + $scope.item.id + "/" + $scope.item.user_id;

		});
	};

	$scope.rem_comment = function(item) {
		var c = confirm("Изтриване на коментар?");
		if (!c) return;

		var result = service.remComment(item);
		result.then(function(data) {
			$window.location = "#/app/itemDetail/" + $scope.item.id + "/" + $scope.item.user_id;
		});
	};

	$scope.like = function(item){
		service.showLoader();
		
		var result = service.addLike(item);
		
		result.then(function(state) {	
			service.hideLoader();
		});
	}

	$scope.previewImage = function(profile) {
		var url = $rootScope.base_services + 	profile.ImageName;
		service.previewImage(url);
	}

});

kz_mob.controller('myItemsCtrl', function($scope, $stateParams, $window, $ionicScrollDelegate, service, site) {
	$scope.scrollTop = function(){
		$ionicScrollDelegate.scrollTop(true);
	}

	$scope.myItems = [];
	getItems();

	function getItems(){
		service.showLoader();
		var myItems = service.getMyItems();

		myItems.then(function(myItems) {
			service.hideLoader();
			$scope.myItems = myItems;
		});
	}

	$scope.remove_item = function(item){
		
		var c = site.confirmBox("Изтриване!", "Сигурен ли сте, че искате да изтриете обявата?");
        c.then(function(state){
			if (!state) return;
			service.showLoader();
			var myItems = service.removeItemById(item.id);
			myItems.then(function (state){
				service.hideLoader();
				getItems();
			});
			
		});
	}
	
	$scope.closeMyItems = function() {
		$window.history.back();
	}

});


kz_mob.controller('addItemCtrl', function($scope, $rootScope, $window, $stateParams, $timeout, site, service) {

	if (!$rootScope.profile) $window.location = "#/app/login";

	$scope.isValidImage = true;

	$scope.item = {};

	$scope.uploadFile = function ($files) {

		$timeout(function () {
			//$scope.isValidImage = site.checkValidImageEx($files);
		}, 500);

		$scope.image = $files[0];
	}

	$scope.addItem = function() {

		//if (!$scope.item.title) return;
		//if (!$scope.item.type) return;
		//if (!$scope.item.descr) return;

		service.showLoader();

		var s = $scope.item;

		if (typeof(s) == "undefined" || typeof(s.title) == "undefined" ||
			typeof(s.descr) == "undefined" || typeof(s.type) == "undefined" ||
			s.type.type <= 0)
		{
			service.errorMessage("Моля, попълнете всички задължителни полета (*).");
			service.hideLoader();
			return;
		}

		var item = {
			title: s.title,
			descr: s.descr,
			end_date: (s.end_date) ? s.end_date : null,
			type: s.type.type
		}

		var result = service.addItem(item);
		result.then(function(data) {

			service.hideLoader();

			if (data) {

				if ($scope.image)
					service.uploadFileToServer($scope.image, data.id, service.ImageItemType);

				window.location = "#app/items";
				service.errorMessage("Обявата ви ще бъде прегледана от администратор.");
			} else
				service.errorMessage("Възникна грежка. Опитайте по-късно.");
		});
	};

	$scope.closeNewItem = function(){
		$window.history.back();
	}
});


kz_mob.controller('editItemCtrl', function($scope, $rootScope, $stateParams, $window, site, service) {

	service.showLoader();

	$scope.previewImage = function(item) {
		var url = $rootScope.base_services + item.ImageName;
		service.previewImage(url);
	}

	var item = service.getItemById($stateParams.itemId, $rootScope.profile.id, false);

	item.then(function(item) {

		service.hideLoader();
		item.category = service.getItemCategory(item);
		$scope.item = item;
	});

	$scope.editItem = function(item){

		if (!item.title) {
			service.errorMessage("Моля, попълнете полето заглавие.");
			return;
		}

		if (!item.type.type) {
			service.errorMessage("Моля, изберете категория.");
			return;
		}

		if (!item.descr) {
			service.errorMessage("Моля, попълнете полето описание.");
			return;
		}

		service.showLoader();

		if (typeof(item) == "undefined" || typeof(item.title) == "undefined" ||
			typeof(item.descr) == "undefined" || typeof(item.type) == "undefined" ||
			item.type.type <= 0)
		{
			service.errorMessage("Моля, попълнете всички задължителни полета (*).");
			return;
		}


		var data = {
			id: item.id,
			title: item.title,
			descr: item.descr,
			end_date: (item.end_date) ? item.end_date : null,
			type: item.type.type
		}

		var result = service.editItem(data);
		result.then(function(data) {
			service.hideLoader();
			$window.history.back();
		});

	}

	$scope.closeEdit = function(){
		$window.history.back();
	}

});


kz_mob.controller('registerCtrl', function($scope, $ionicModal, $window, $stateParams, $timeout, service, site) {
	$scope.register = {};

	$ionicModal.fromTemplateUrl('templates/register.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.closeRegister = function() {
		$window.location = "#/app/login";
	};

	$scope.doRegister = function() {

		var r = $scope.register;
		//make validation
		if (site.initRegError(r, false) == "error") return;

		service.showLoader();

		var user = {
			username: r.username,
			password: r.password,
			email: r.email,
			descr: r.descr,
			registration_type: service.mobile_register,
		}

		var result = service.register(user);

		result.then(function(user) {
			if (user)
			{
				$timeout(function () {
					service.hideLoader();
					$window.location = "#/app/items";
					site.init();
				}, 500);
			}
		});
	};
});

kz_mob.controller('profileCtrl', function($scope, $stateParams, $window, $rootScope, $timeout, site, service) {

	if (!$rootScope.profile) $window.location = "#/app/login";

	site.init();
	$scope.closeProfile = function(){
		$window.history.back();
	}
});

kz_mob.controller('loginCtrl', function($scope, $ionicModal, $window, $timeout, site, service) {

	$scope.login = {};

	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.register = function() {
		$window.location = "#/app/register";
	}

	$scope.closeLogin = function(){
		$window.location = "#/app/items";
	}

	$scope.doLogin = function() {

		var login = $scope.login;

		if (!login.username) return;
		if (!login.password) return;

		service.showLoader();

		var user = {
			username: login.username,
			password: login.password,
			registration_type: service.mobile_register
		}

		var result = service.login(user);

		result.then(function(user) {
			if (user)
			{
				$timeout(function () {
					service.hideLoader();
					$window.location = "#/app/items";
					site.init();
				}, 500);
			}
		});

	};

	$scope.fb_register = function(){
		var result = service.facebookRegister();
		result.then(function(user) {
			 $timeout(function () {
				service.hideLoader();
				$window.location = "#/app/items";
				site.init();
			}, 500);
		});
	}
	
	$scope.gmail_register = function(){
		alert("В момента не поддържаме тази функционалност!");
		/*
		var result = service.gmail_register();

		result.then(function(user) {
			$timeout(function () {
				service.hideLoader();
				$window.location = "#app/items";
				site.init();
			}, 500);
		});
		*/
	}
})

kz_mob.controller('logoutCtrl', function($scope, $stateParams, site) {
	site.LogOut();
});

kz_mob.controller('aboutCtrl', function($scope, $stateParams, $window) {
	$scope.closeAbout = function(){
		$window.location = "#/app/items";
	}
});

kz_mob.controller('messagesCtrl', function($scope, $rootScope, $window, site, service) {

	site.init();
	
	$scope.currentMessages = 0;
	$scope.messages = [];
	
	$scope.switchMessages = function(type) {
		$scope.currentMessages = type;
		$(".messages-selector").css("background-color", "#387ef5");
		$(".messages-selector").eq(type).css("background-color", "green");
	};
	
	$scope.switchMessages(0);
	
	if ($rootScope.profile)
		service.get_messages_count();
	
	result = service.getMessages(0);
	result.then(function(messages) {
		$scope.messages = messages;
	});	
	
	result = service.getMessages(1);
	result.then(function(messages) {
		$scope.outMessages = messages;
	});
	
	$scope.view_message = function(message){
		$rootScope.message = message;
		$window.location = "#/app/view_message";
	}
	
	$scope.remove_message = function(message){
		
		var c = site.confirmBox("Изтриване!", "Сигурен ли сте, че искате да изтриете съобщение?");
        c.then(function(state){
			if (!state) return;
			
			var result = service.remove_message(message);
			result.then(function (state){
				$scope.messages = [];
				$scope.switchMessages(0);
				//reload messafes
				result = service.getMessages(0);
				result.then(function(messages) {
					service.get_messages_count();
					$scope.messages = messages;
				});	
				
			});
			
		});
		
	}
	
	$scope.closeMessages = function() {
		$window.history.back();
	}

});


kz_mob.controller('historyCtrl', function($scope, $stateParams, $window, site, service, $ionicScrollDelegate) {
	
	$scope.myHistory = [];
	getHistory();
	
	function getHistory(){
		service.showLoader();
		var result = service.myHistory();
		
		result.then(function (items) {
			$scope.myHistory = items;
			service.hideLoader();
		});
	}

	$scope.remove = function () {
		
			var c = site.confirmBox("Изтриване!", "Сигурен ли сте, че искате да изтриете вашата история?");
			c.then(function(state){
				if (!state) return;
				
				service.my_history = [];
				$scope.history = [];
				localStorage.removeItem('my_history');
				service.myHistory();
				getHistory();
			});
	}
	
	$scope.scrollTop = function(){
		$ionicScrollDelegate.scrollTop(true);
	}

	
});

kz_mob.controller('viewMessageCtrl', function($scope, $rootScope, $timeout, $window, site, service) {

	$scope.isSendMessage = false;
	$scope.send_message = function(sendMessage){

		$scope.sendMessage = sendMessage;

		if (!$scope.sendMessage) return;
		if ($scope.sendMessage === "undefined") return;

		var message = {
			user_id: $rootScope.profile.id,
			send_to: $scope.message.user_id,
			title: $scope.sendMessage.title,
			message: $scope.sendMessage.message,
			status: 1
		}

		var result = service.send_message(message);

		result.then(function (state){
			if (state){

			$timeout(function () {
				$scope.isSendMessage = true;
				$scope.sendMessage.title = "";
				$scope.sendMessage.message = "";
			}, 500);

			}

		});
	}

	$scope.closeViewMessage = function() {
		$window.history.back();
	};

});

kz_mob.controller('sendMessageCtrl', function($scope, $rootScope, $stateParams, $window, $timeout, site, service) {

	if (!$rootScope.profile) $window.location = "#/app/login";
	if (typeof($rootScope.profile) == "undefined") return;

	//do not send self message
	if ($stateParams.user_id == $rootScope.profile.id) $window.location = "#/app/profile";

	var user = service.getuserById($stateParams.user_id);

	user.then(function(user) {
		$scope.user = user;
	});

	$scope.sendMessage = {};

	$scope.isSendMessage = false;
	$scope.send_message = function(){

		if (!$scope.sendMessage) return;
		if ($scope.sendMessage === "undefined") return;

		var message = {
			user_id: $rootScope.profile.id,
			send_to: $stateParams.user_id,
			title: $scope.sendMessage.title,
			message: $scope.sendMessage.message,
			status: 1
		}

		var result = service.send_message(message);

		result.then(function (state){
			if (state){

				$timeout(function () {
					$scope.isSendMessage = true;
					$scope.sendMessage.title = "";
					$scope.sendMessage.message = "";
				}, 500);

			}

		});
	}

	$scope.previewImage = function(profile) {
		var url = $rootScope.base_services + 	profile.ImageName;
		service.previewImage(url);
	}

	$scope.closeMessage = function(){
		$window.history.back();
	}

});
