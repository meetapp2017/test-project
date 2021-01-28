kz_mob.factory('service', function ($rootScope, site, $timeout, $q, $window, $ionicLoading, $anchorScroll, $http) {
	
	return {
		base_api_url: "***",
		base_url: '***',
		base_photo_url: '***',
		ImageUserType: 0, //image type for user profile
		ImageItemType: 1, //image type for new item
		maxLen: 100,
		normal_register: 1,
		facebook_register: 2,
		google_register: 3,
		mobile_register: 4,
		isExistUser: 1,
		itemsCount: 0,
		loadAmount: 24,
		my_history: [],
		
		initUserProfile: function(data){
			
			return (data.length > 0) ? $.parseJSON(JSON.stringify(data))[0]: false;
		},
		
		request : function (_file, _data, mainObject, callBack) {
			
			this.showLoader();
			
			if ($rootScope.profile){
				_data.user_hash = $rootScope.profile.user_hash;
				_data.login_id = $rootScope.profile.id;
			}
			
			$.ajax({
				url : this.base_api_url + _file,
				type : 'POST',
				dataType : 'json',
				data : _data,
				cashe : false,
				success : function (data) {
					mainObject.hideLoader();
					callBack(data, mainObject);
				},
				
				error : function (err) {
					mainObject.hideLoader();
					return err;
				}
				
			});
			
		},

		checkAndUpdateToken: function(myToken){
			
			if (!$rootScope.profile) return;
			
			var params = {
				id: $rootScope.profile.id,
				token: myToken,
				method : "updateToken"
			};
			
			this.request('user.php', params, this, function (result, mainObject) {
					//
			});
			
		},
		
		login: function(user){
			
			var d = $q.defer();

			var myToken = localStorage.getItem('kz_mob_token');

			var params = {
				username : user.username,
				password : user.password,
				registration_type : user.registration_type,
				token: myToken,
				method : "SignIn"
			};
			
			this.request('user.php', params, this, function (result, mainObject) {
				
				if (result.length <= 0){
					mainObject.errorMessage("Грешен потребител или парола!");
					mainObject.hideLoader();
				}
				else{
					var user = mainObject.initProfile(result);
					d.resolve(user);
				}
				
				
			});
			
			return d.promise;
		},
		
		initProfile: function(result){
			var user = this.initUserProfile(result);
			localStorage.setItem("profile", JSON.stringify(user));
			return user;
		},
		
		showLoader: function() {
			$ionicLoading.show({
			  template: 'Loading...'
			}).then(function(){
			   console.log("The loading indicator is now displayed");
			});
		},
		
		hideLoader: function() {
			$ionicLoading.hide().then(function(){
			   console.log("The loading indicator is now hidden");
			});
		},
		
		errorMessage: function(text){
			var htmlStruct = site.initHtmlStruct(text);
			htmlStruct += "</div></div></div>";
			$("body").append(htmlStruct);
		},
		
		previewImage: function(url) {
			if (url.indexOf("null") > 0) return;
			var htmlStruct = site.initImageStruct(url);
			htmlStruct += "</div></div></div>";
			$("body").append(htmlStruct);
		},

		register: function (register){
			var d = $q.defer();
			var myToken = localStorage.getItem('kz_mob_token');
			
			register.token = myToken;
			register.method = "insert";
			
			this.request('user.php', register, this, function (result, mainObject) {
				if (result == mainObject.isExistUser) {
					if (register.registration_type == mainObject.normal_register) 
						mainObject.errorMessage(register.username + " вече съществува, моля изберете друг!");
					d.resolve(false);
					
				} 
				else{
					var user = mainObject.initProfile(result);
					d.resolve(user);
				}
				 
			});
			
			return d.promise;
		},
		
		uploadFileToServer : function (file, id, type) {
			var mainObject = this;
			var fd = new FormData();
			fd.append('file', file);
			fd.append('id', id);
			
			if (typeof(type) != "undefined")
				fd.append('type', type);
			
			fd.append('username', $rootScope.profile.username);
			
			$http.post(this.base_photo_url, fd, {
				transformRequest : angular.identity,
				headers : {
					'Content-Type' : undefined
				},
			})
			.success(function (state) {
				mainObject.reloadProfile();
			})
			.error(function () {
				alert("error while uploading file");
			});
		},
		
		getuserById : function (id) {
			var d = $q.defer();
			
			var data = {
				id : id,
				method : "getUserById"
			}
			
			var user = null;
			
			this.request("user.php", data, this, function (result, mainObject) {
				var user = mainObject.initUserProfile(result);
				d.resolve(user);
			});
			
			return d.promise;
			
		},
		
		reloadProfile : function () {
			
			var result = this.getuserById($rootScope.profile.id);
			
			result.then(function(user){
				$rootScope.profile = user;
				localStorage.setItem('profile', JSON.stringify(user));
			});
		},
		
		removeUserImage : function (imgId) {
			
			var data = {
				id : imgId,
				has_permission : true,
				method : 'deleteUserImg'
			}
			
			this.request("user.php", data, this, function (_data, mainObject) {
			    mainObject.reloadProfile();
			});
			
		},
		
		updateUser: function(user){
			var d = $q.defer();
			
			if (user.descr.length > this.maxLen)
					user.descr = user.descr.substring(0, this.maxLen);
			
			var data = {
				id: $rootScope.profile.id,
				email: user.email,
				descr: user.descr,
				method : 'update'
			}
			
			this.request("user.php", data, this, function (result, mainObject) {
				var user = mainObject.initUserProfile(result);
						
				d.resolve(user);
			    mainObject.reloadProfile();
			});
			
			
			return d.promise;
		},
		
		addItem: function(item) {
			if (!$rootScope.profile) window.location = "#login";
			
			var d = $q.defer();
			
			var data = item;
			data.method = "addItem";
			data.user_id = $rootScope.profile.id;
			
			this.request("item.php", data, this, function (result, mainObject) {
				var item = $.parseJSON(JSON.stringify(result))[0];
				d.resolve(item);
			});
			
			return d.promise;
		},
		
		prepareItems: function($scope, type, user_id){
			
			var mainObject = this;
			var items = this.getItems(this.itemsCount, this.loadAmount, type, user_id);
	
			items.then(function(items) {
				$scope.items = items;
			});
			
			$scope.LoadMore = function() {
				
				var moreItems = mainObject.getMoreItems(mainObject.loadAmount, type, user_id);
				moreItems.then(function(newItems) {
					if (newItems){
						for (i = 0; i < newItems.length; i++)
							$scope.items.push(newItems[i]);
					}
					
				});
			};	
				
		},
		
		getItems: function(st, end, type, user_id) {
			var d = $q.defer();
			
			if (st == undefined) st = 0;
			if (end == undefined) end = this.loadAmount;
			
			var data = {
				method: "getItems",
				start: st,
				count: end - st,
				type:  (type !="undefined") ? type : 0,
				user_id: user_id
			};
			
			
			this.request("item.php", data, this, function (result, mainObject) {
				
				var items = mainObject.checkData(result, mainObject.maxLen);
				
				$timeout(function () {
					mainObject.itemsCount = end;
					d.resolve(items);
				}, 200);
			
			
			});
			
			return d.promise;
		},
		
		getMoreItems: function(amount, type, user_id) {
			return this.getItems(this.itemsCount, this.itemsCount + amount, type, user_id);
        },
        
		removeItemById: function(id){
			
			var d = $q.defer();
			
			var data = { 
				id: id,
				method: "deleteItemById" 
			};
			
			this.request("item.php", data, this, function (result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		editItem: function(data){
			
			if (!$rootScope.profile) window.location = "#login";
			
			var d = $q.defer();
			
			data.method = "editItem";
			
			this.request("item.php", data, this, function (result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		fixString: function(str, tagMode, selector){
			
			if (tagMode)
				str = str.replace(/\\n/g, "<br/>");
			else
				str = str.replace(/\\n/g, "\n");
			
			if (selector){
				
				 str.replace(/\/\*/g, "<span style='font-weight: bold;'>")
										.replace(/\*\//g, "</span>")
										.replace(/\/\_/g, "<span style='font-style: italic;'>")
										.replace(/\_\//g, "</span>")
										.replace(/<br>/gim, '\n')
										//.replace(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,'<a href="$1" class="my_link" target="_blank" style="color: blue; text-decoration: underline;">$1</a>')
										//.replace(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gim,'$1<a onclick="tl.window.open(\'http://$2\', \'_blank\');" href="" class="my_link" target="_blank" style="color: blue; text-decoration: underline;">$2</a>')
										.replace(/\n/gim, '<br>');
				
				$(selector).html(str);
			}
			
			return str;
			
		},
		
		checkData: function(data, max){
			
			for(var i in data){
					
					var object = data[i];
					
					object.title = this.fixString(object.title);
					object.title = object.title.substring(0, 35) + '...';
					object.descr = this.fixString(object.descr);
					object.category = this.getItemCategory(object);
					
					if (object.descr.length > max){
						
						object.descr = object.descr.substring(0, max) + '...';
						data[i] = object;
					}
						
			}
			
			return data;
		},
		
		fb_register : function () {
			var d = $q.defer();
			FB.login(function(response) {
				if (response.authResponse) {
				 console.log('Welcome!  Fetching your information.... ');
				 FB.api('/me', function(response) {
				   console.log('Good to see you, ' + response.name + '.');
				   d.resolve(true);
				 });
				} else {
					console.log('User cancelled login or did not fully authorize.');
					d.resolve(false);
				}
			});
			
			return d.promise;
		},
		
		gmail_register: function(){
			
			var mainObject = this;
			var CLIENT_ID = '***';
			var API_KEY = '***';
			
			var d = $q.defer();
			
			gapi.load('auth2', function() {
				auth2 = gapi.auth2.init({
					apiKey: API_KEY,
					client_id: CLIENT_ID,
					fetch_basic_profile: true,
					scope: 'profile'
				});
				
				// Sign the user in, and then retrieve their ID.
				auth2.signIn().then(function() {
					var profile  = auth2.currentUser.get().getBasicProfile();
					
					var data = {
						username: mainObject.translate(profile.getName()),
						password: mainObject.translate(profile.getName()),
						email: profile.getEmail(),
						registration_type: mainObject.google_register,
						descr: ""
					}
					
					var result = mainObject.register(data);
		
					result.then(function(state) {
						
						if (!state){
						
							var user = {
								username: data.username,
								password: data.password,
								registration_type: data.registration_type
							}
							
							var result = mainObject.login(user);
							
							result.then(function(user){
								//
							});
							
						}
						
						d.resolve(true);
						
					});
					
				});
			});
			
			return d.promise;
		},
		
		translate: function(word){
			var answer = ""
			var a = {};

		    a["Ё"]="YO";a["Й"]="I";a["Ц"]="TS";a["У"]="U";a["К"]="K";a["Е"]="E";a["Н"]="N";a["Г"]="G";a["Ш"]="SH";a["Щ"]="SCH";a["З"]="Z";a["Х"]="H";a["Ъ"]="'";
		    a["ё"]="yo";a["й"]="i";a["ц"]="ts";a["у"]="u";a["к"]="k";a["е"]="e";a["н"]="n";a["г"]="g";a["ш"]="sh";a["щ"]="sch";a["з"]="z";a["х"]="h";a["ъ"]="'";
		    a["Ф"]="F";a["Ы"]="I";a["В"]="V";a["А"]="a";a["П"]="P";a["Р"]="R";a["О"]="O";a["Л"]="L";a["Д"]="D";a["Ж"]="ZH";a["Э"]="E";
		    a["ф"]="f";a["ы"]="i";a["в"]="v";a["а"]="a";a["п"]="p";a["р"]="r";a["о"]="o";a["л"]="l";a["д"]="d";a["ж"]="zh";a["э"]="e";
		    a["Я"]="Ya";a["Ч"]="CH";a["С"]="S";a["М"]="M";a["И"]="I";a["Т"]="T";a["Ь"]="'";a["Б"]="B";a["Ю"]="YU";
		    a["я"]="ya";a["ч"]="ch";a["с"]="s";a["м"]="m";a["и"]="i";a["т"]="t";a["ь"]="'";a["б"]="b";a["ю"]="yu";

		    for (i in word){
				if (word.hasOwnProperty(i)) {
					if (a[word[i]] === undefined)
						answer += word[i];
				    else 
						answer += a[word[i]];
				}
			}
			
			return answer;
		},
		
		get_messages_count: function(){
				
			if (!$rootScope.profile) return;
			
			$rootScope.messages_count = 0;
			
			var message = {
				id: $rootScope.profile.id,
				method: "get_messages_count"
			}
			
			this.request("message.php", message, this, function (result, mainObject) {
				
				$timeout(function () {
					$rootScope.messages_count = result[0].count;
				}, 200);
			});
		},
		
		getMessages: function(_type){
			var d = $q.defer();
			
			var message = {
				id: $rootScope.profile.id,
				type: _type,
				method: "get_messages"
			}
			
			this.request("message.php", message, this, function (messages, mainObject) {
				
				var mess = [];
				for(var i in messages){
					
					var object = messages[i];
					
					object.title = mainObject.fixString(object.title);
					object.title = object.title.substring(0, 35) + '...';
					mess[i] = object;
						
				}
				
				d.resolve(mess);
			});
			
			return d.promise;
				
		},
		
		remove_message: function(message){
			
			var d = $q.defer();
			
			var data = {
				id: message.id,
				method: "remove_message"
			}
			
			this.request("message.php", data, this, function (result, mainObject) {
				d.resolve(true);
			});
			
			return d.promise;
		},
		
		getFavs: function(){
			
			var d = $q.defer();
			
			var fav = {
				send_to: $rootScope.profile.id,
				method: "load"
			}
			
			this.request("favs.php", fav, this, function (result, mainObject) {
				var favs = $.parseJSON(JSON.stringify(result));
				d.resolve(favs);
			});
			
			return d.promise;
			
		},	
		
		addFavs: function(user_id){
			
			var d = $q.defer();
			
			var fav = {
				user_id: user_id,
				send_to: $rootScope.profile.id,
				method: "insert"
			}
			
			this.request("favs.php", fav, this, function (result, mainObject) {
				var fav = $.parseJSON(JSON.stringify(result))[0];
				d.resolve(fav);
			});
			
			return d.promise;
			
		},	
	
		remove_fav: function(user_id){
	
			var d = $q.defer();
			
			var fav = {
				user_id: user_id,
				send_to: $rootScope.profile.id,
				method: "remove_fav"
			}
			
			this.request("favs.php", fav, this, function (result, mainObject) {
				d.resolve(fav);
			});
			
			return d.promise;
		},
		
		loadLikes: function(itemId){
			
			var d = $q.defer();
			
			data = {
				send_to: itemId,
				method: "load"
			}
			
			this.request("likes.php", data, this, function(result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		addLike: function(item){
			
			var d = $q.defer();
			
			if (!$rootScope.profile) {
				d.resolve(true);
				return d.promise;
			}
			
			data = {
				user_id: $rootScope.profile.id,
				send_to: item.id,
				method: "insert"
			}
			
			this.request("likes.php", data, this, function(result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},

		loadComments: function(item) {
			var d = $q.defer();
			
			comment = {
				user_id: item.user_id,
				item_id: item.id,
				method: "loadComments"
			}
		
			this.request("comments.php", comment, this, function(result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		addComment: function(comment) {
			var d = $q.defer();
			
			var comm = {
				user_id: comment.user_id,
				item_id: comment.item_id,
				descr: comment.descr,
				method: "addComment",
			};
			
			this.request("comments.php", comm, this, function(result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		remComment: function(comment) {
			var d = $q.defer();
			
			var comment = {
				id: comment.c_id,
				method: "remComment",
			};
			
			this.request("comments.php", comment, this, function(result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		getItemById: function(itemId, user_id, mode){
			
			var d = $q.defer();
			
			var data = { 
				id: itemId,
				user_id: user_id,
				method: "getItemById"
			};
			
			this.request("item.php", data, this, function (item, mainObject) {
				
				var item = item[0];
				
				if(!item.ImageName)
					item.ImageName = "images/noimage.png";	
				
				if(!item.userImage)
					item.userImage = "images/user.png";	
				
				item.title = mainObject.fixString(item.title);
				item.descr = mainObject.fixString(item.descr, mode, '#item-descr');
					
				item.category = mainObject.getItemCategory(item);
				
				d.resolve(item);
			});
			
			return d.promise;
			
		},
		
		getMyItems: function(){
			
			var d = $q.defer();
			
			var data = { 
				user_id: $rootScope.profile.id,
				method: "getMyItems"
			};
			
			this.request("item.php", data, this, function (items, mainObject) {
				var items = mainObject.checkData(items, mainObject.maxLen);
				d.resolve(items);
			});
			
			return d.promise;
			
		},
		
		addVisitor: function(item){
			
			var d = $q.defer();
			
			var visitor = {
				user_id: $rootScope.profile.id,
				send_to: item.id,
				method: "insert"
			}
			
			this.request("visitors.php", visitor, this, function (result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		getVisitors: function(item){
			
			var d = $q.defer();
			
			var visitor = {
				user_id: $rootScope.profile.id,
				method: "load"
			}
			
			this.request("visitors.php", visitor, this, function (result, mainObject) {
				var visitors = $.parseJSON(JSON.stringify(result));
				d.resolve(visitors);
			});
			
			return d.promise;
			
		},
		
		getVisitorsByCount: function(item){
			
			var d = $q.defer();
			
			var visitor = {
				send_to: item.id,
				method: "visitCount"
			}
			
			this.request("visitors.php", visitor, this, function (result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
			
		},
		
		getItemCategory: function(item){
			
			var category = "";
			
			for(var i in $rootScope.itemTypes){
				category = $rootScope.itemTypes[i];
				
				if (item.type == category.type)
					break;
			}
			
			return category.name;
			
		},
		
		send_message: function(message){
			
			var d = $q.defer();
			
			message.method = "send_message";
			
			this.request("message.php", message, this, function (result, mainObject) {
				d.resolve(result);
			});
			
			return d.promise;
		},
		
		initHistory : function (item) {

			//add to history
			if (this.my_history == null) {
				this.my_history = [];
				this.addHistory(item);
			} else {
				var hasFound = false;

				for (var i in this.my_history) {
					var _item = this.my_history[i];
					if (_item.id == item.id) {
						hasFound = true;
						break;
					}
				}

				if (!hasFound)
					this.addHistory(item);
			}

		},
		
		addHistory : function (item) {
			this.my_history.push(item);
			localStorage.setItem('my_history', JSON.stringify(this.my_history));
			$rootScope.history_count++;
		},

		myHistory : function () {
	
			var d = $q.defer();
			this.my_history = $.parseJSON(localStorage.getItem('my_history'));

			var items = [];
			$rootScope.history_count = 0;

			if (typeof this.my_history === "undefined")
				return false;
			if (typeof this.my_history == null)
				return false;

			for (var i in this.my_history) {
				var user = this.my_history[i];
				items.push(user);
			}

			d.resolve(items);
			$rootScope.history_count = items.length;
			return d.promise;
		},
		
		facebookRegister : function () {

			var mainObject = this;
			
			FB.init({
				appId : "****",
				nativeInterface : CDV.FB,
				useCachedDialogs : false
			});

			var d = $q.defer();

			function me(response) {
				// user has auth'd your app and is logged into Facebook
				FB.api('/me', 'get', { access_token: response.authResponse.accessToken, fields: 'id,name,email' }, function(res) {
					
					var result = mainObject.make_user_profile_by_social(res);
					result.then(function(data){
						d.resolve(data);
					});
					
				});
			}
			
			FB.login(
				function (response) {

				if (response.authResponse) {
					me(response);
				} else {
					alert("error");
				}

			}, {scope: 'email', return_scopes: true});

			return d.promise;

		},
		
		make_user_profile_by_social : function (resp) {
			
			var d = $q.defer();
			var mainObject = this;
			var data = {};
			
			data = {
				id : resp.id,
				method : 'getUserByFaceBookID'
			};
			
			this.request('user.php', data, this, function (result, mainObject) {

				var checkLogin = (result.length > 0) ? true : false;
				
				if (checkLogin){
					mainObject.initProfile(result);
					d.resolve(result);
				}
				else 
				{
					var user = {
						username : resp.name,
						password : "***",
						email : "***",
						descr: "***",
						registration_type: mainObject.mobile_register,
						faceUserName : resp.id,
						method:  "insert"
					};
					
					var user = mainObject.register(user);
					user.then(function(user) {
						d.resolve(user);
					});
					
				}
						
			});
			
			return d.promise;
		},
		
	}
});
