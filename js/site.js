kz_mob.factory('site', function ($rootScope, $timeout, $q, $window, $anchorScroll, $http, $ionicPopup) {
	
	//main object
	return {
		profile: null,
		
		init: function(){
			
			this.profile = localStorage.getItem('profile');
			
			if (this.profile != null ){
				this.profile = $.parseJSON(this.profile);
				
				if (!this.profile.ThumbName)
					this.profile.ThumbName = "images/user.png";
				
				$rootScope.profile = this.profile;
			}
			
			$rootScope.base_services = '***';
			
			$rootScope.itemTypes =
				[
				{
					name : 'Предлагам',
					type: 1
				},
				{
					name : 'Търся',
					type: 2
				},
				{
					name : 'Aвтомобили, авточасти',
					type: 3
				}, {
					name : 'Работа',
					type: 4
				}, {
					name : 'Услуги',
					type: 5
				}, {
					name : 'Имоти, Агенции',
					type: 6
				}, 
				{
					name : 'Хотели',
					type: 7
				},
				{
					name : 'Заведения',
					type: 8
				},
				{
					name : 'Реклама, Бизнес',
					type: 9
				}, 
				{
					name : 'Мода, Красота',
					type: 10
				},
				{
					name : 'Запознанства',
					type: 11
				},
				{
					name : 'Други',
					type: 12
				}
			];
			
		},
		
		LogOut: function(){
			$rootScope.profile = null;
			localStorage.removeItem('profile');
		},

		checkValidImageEx: function(files){

			if (!files) return false;
			var ext = files[0].name.match(/\.(.+)$/)[1];
			
			if (angular.lowercase(ext) === 'jpg' || angular.lowercase(ext) === 'jpeg') 
				return true;
			else
			{
				angular.element("input[type='file']").val(null);
				return false;
			}
		},
		
		initRegError: function(r, isUpdate){
			
			if (r.username == undefined) {
				this.regError("username");
			return;
			} else if (r.username.length < 6 || r.username.length > 25) {
				this.regError("username");
				return "error";
			}
			if (r.email == undefined) {
				this.regError("email");
				return;
			} else if (r.email.length == 0 || !this.validateEmail(r.email)) {
				this.regError("email");
				return "error";
			}
			if (!isUpdate){
					if (r.password == undefined) {
					this.regError("password");
					return "error";
				} else if (r.password.length < 6) {
					this.regError("password");
					return "error";
				} else if (r.rePassword != r.password) {
					this.regError("rePassword");
					return "error";
				}
			}
		},
		
		initHtmlStruct: function(text){
				
			var htmlStruct = "<div id=\"regError\" style=\"position: fixed;top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, .5); z-index: 999999;\" onclick=\"$('#regError').remove();\">";
			htmlStruct += "<div style=\"position: fixed;  padding: 10px; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: #fff; width: 350px; height: 100px; border-radius: .4em;\">";
			htmlStruct += "<div style=\"color: #f00; font-weight: bold; font-size: 14pt; min-width: 100%; text-align: center; margin-top: 37.5px;\">";
			
			if (text)
				htmlStruct += text;
				
			return htmlStruct;
		},
		
		initImageStruct: function(url) {
			var htmlStruct = "<div id=\"regError\" style=\"position: fixed;top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, .5); z-index: 999999;\" onclick=\"$('#regError').remove();\">";
			htmlStruct += "<img src=\"" + url + "\" style=\"position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);\"></div>";
			return htmlStruct;
		},
		
		regError: function(type, text) {
			
			var htmlStruct = this.initHtmlStruct();
			
			switch (type) {
				case "username":
					htmlStruct = this.initHtmlStruct("Невалидно потребителско име!");
					break;
				case "password":
					htmlStruct = this.initHtmlStruct("Невалидна парола!");
					break;
				case "rePassword":
					htmlStruct = this.initHtmlStruct("Паролите не съвпадат!");
					break;
				case "email":
					htmlStruct = this.initHtmlStruct("Невалиден имейл!");
					break;
			}
			htmlStruct += "</div></div></div>";
			$("body").append(htmlStruct);
		},
		
		validateEmail: function(email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
			return re.test(email.toLowerCase());
		},
		
		confirmBox: function(title, descr){
			var d = $q.defer();
			
			var confirmPopup = $ionicPopup.confirm({
			 title: title,
			 template: descr
		   });

		   confirmPopup.then(function(res) {
				d.resolve(res);
		   });
		   
		   return d.promise;
			
		},
	}
});
