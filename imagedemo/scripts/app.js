/* 
 *  ================================================================================
 *  Copyright (C) 2012 General Electric. ALL RIGHTS RESERVED.
 * 
 *  This file contains proprietary and GE CONFIDENTIAL Information.
 *  Use, disclosure or reproduction is prohibited.
 * 
 *  File:  AssetSyncService.js
 *  Created On: 12/05/2013 02:15:29 PM
 *  Author: 0180422
 * 
 */
var AppModule = angular.module('appModule', ['ProductModule','StoryModule', 'Settings','ngResource']);

AppModule.config(['$routeProvider', function($routeProvider){
	//$routeProvider.otherwise({templateUrl: 'views/workspace.html', controller: 'WorkspaceController'});
	$routeProvider.when('', {templateUrl: 'views/workspace.html', controller: 'WorkspaceController'});
	$routeProvider.when('/workspace', {templateUrl: 'views/workspace.html', controller: 'WorkspaceController'});
	$routeProvider.when('/newpitch', {templateUrl: 'views/newPitch.html', controller: 'NewPitchCtrl'});
	$routeProvider.when('/customerdetails', {templateUrl: 'views/customerdetails.html'});
	$routeProvider.when('/vppcompose', {templateUrl: 'views/vppcompose.html', controller: 'VPPComposeController'});
	$routeProvider.when('/modifycustomer', {templateUrl: 'views/modifycustomer.html', controller: 'FooterBarCtrl'});
	
	
	//$routeProvider.when('/vppcompose/:viewType', {templateUrl: 'views/vppcompose.html', action: "tileView", controller: 'VPPComposeController'});

	//$routeProvider.when('/tileview', {templateUrl: 'views/storyTileView.html', controller: 'StoryTileViewCtrl'});

}]);

AppModule.run(['$rootScope','StateModel','AppModel','HomeModel','LookupService','UserlogService','$http','AppSettings', function($rootScope, StateModel, AppModel, HomeModel, LookupService, UserlogService, $http, AppSettings) {

	var bool = false;
	// Prevent the backspace key from navigating back.
	$(document).unbind('keydown').bind('keydown', function (event) {
		var doPrevent = false;
		if (event.keyCode === 8) {
			var d = event.srcElement || event.target;
			if ((d.tagName.toUpperCase() === 'INPUT' && ( d.type.toUpperCase() === 'EMAIL' || d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD')) 
				 || d.tagName.toUpperCase() === 'TEXTAREA') {
				doPrevent = d.readOnly || d.disabled;
			}
			else {
				doPrevent = true;
			}
		}

		if (doPrevent) {
			event.preventDefault();
		}
	});
	
	//For Preview
	$(document).keyup(function(event){

		if(win.isFullscreen ){
		
			if (event.which == 37 || event.which == 39 || event.which == 38 || event.which == 40) {
			
				
					if(event.which == 38)
						Reveal.prev();

					if(event.which == 40)
						Reveal.next();

					if(bool && (event.which == 39 || event.which == 40))
					{
						event.which = 27;

					}else{
						bool = false;
					}
/*
					if(Reveal.isLastSlide())
					{
						bool = true;
					}else{
						bool = false;
					}
*/
			}

			// if key is ESC
			if (event.which == 27) {
				
					bool = false;
					$rootScope.$apply(function(){
						$('#reveal').unbind();
						if (StateModel.vppComposeMode == 'edit') {
						
							StateModel.subview = StateModel.oldView;
						} else if (StateModel.vppComposeMode == 'preview') {
						
							StateModel.subview = "standard";
							StateModel.state = "workspace";
						}
						
					});
				
			}
			
		}
	});
	
	// checking valid login / smsession / user sesison expir
	
	var smsession = $.cookie('smsession');
	AppModel.smsession = sessionStorage.VPPSession;
	//TODO enable logout/session expire
	//	if(typeof smsession === "undefined"){
	//		alert("Session / Offline expired, Please login again");
	//	}
	var ssoid =  $.cookie('ssoid');
	var current_date_time = moment().format('YYYY-MM-DD HH:mm:ss');
	
	if(typeof $.url().param('ssoid') !== "undefined") {
		//Check user is a registered user
		var dbvjson = {
					Table:"user",
					TableKey:"id",
					id:"1"
				}
		dbObject.read(dbvjson, function(response) {

			if (response.exists == 1) {
				//Update the last logged date
				AppModel.userDetails = {firstName:response.result[0].first_name, lastName:response.result[0].last_name, email:response.result[0].email};
				AppModel.user = {sso: response.result[0].ssoid, name:response.result[0].first_name+' '+response.result[0].last_name, email:response.result[0].email};
				
				AppModel.smsession = sessionStorage.VPPSession; // smsession;
				HomeModel.user = AppModel.user;
				var jsonuser = {
							"user" :[
										{
											"id":1,
											"last_logged_time":current_date_time
										}
									],
							"Table":"user"
						}
				dbObject.write(jsonuser, function (data) {
					
				});
				//Log user login
				var logobj = {
					action:'login',
					tablename:'user',
					message:ssoid+' logged in at '+current_date_time
				}
				UserlogService.write(logobj);
			} else {
				// service to get the user details
				
				$http.get(AppSettings.web_server_url + AppSettings.servicePath + "user/"+ssoid+"?ssoid="+ssoid).success(function(jsondata) {
					AppModel.userDetails = jsondata;
					//AppModel.smsession = smsession;
					
					var firstName = (typeof jsondata.result.first_name !== "undefined")?jsondata.result.first_name:ssoid;
					var lastName = (typeof jsondata.result.last_name !== "undefined")?jsondata.result.last_name:"";
					var email = (typeof jsondata.result.email !== "undefined")?jsondata.result.email:ssoid+'@ge.com';
					
					AppModel.user = {sso: ssoid, name:firstName+' '+lastName, email:email};
					HomeModel.user = AppModel.user;
					
					var jsonuser = {
							"user" :[
										{
											"id":1,
											"ssoid":ssoid,
											"first_name":firstName,
											"last_name":lastName,
											"email":email,
											"last_logged_time":current_date_time
										}
									],
							"Table":"user"
						}

					dbObject.write(jsonuser, function (data) {
						//console.log(data);
					});
					//Log user login
					var logobj = {
						action:'login',
						tablename:'user',
						message:ssoid+' logged in first time at '+current_date_time
					}
					UserlogService.write(logobj);
				}).error(function (data, status, headers, config) {
					
				});
			}
		});
	} else {
		
		var dbvjson = {
				Table:"user",
				TableKey:"id",
				id:"1"
			}
		dbObject.read(dbvjson, function(response) {
			//Update AppModel
			AppModel.userDetails = {firstName:response.result[0].first_name, lastName:response.result[0].last_name, email:response.result[0].email};
			AppModel.user = {sso: response.result[0].ssoid, name:response.result[0].first_name+' '+response.result[0].last_name, email:response.result[0].email};
			
			AppModel.smsession = sessionStorage.VPPSession;
			HomeModel.user = AppModel.user;
			var logobj = {
			action:'login',
				tablename:'user',
				message:ssoid+' accessed at '+current_date_time
			}
			UserlogService.write(logobj);
			
		});
		
		
	}
	
	//Client DB metadata setting up
	$http.get(AppSettings.web_server_url + AppSettings.servicePath + 'metadata?ssoid='+ssoid).success(function(data) {
		if (data.exists == 1 && data.status == 'success') {
			var json;
			$.each(data.result, function(key, value) {
				if (value.length > 0) {
					json = {
						  key : value,
						  "Table":key
						}
					dbObject.write(json, function (data) {
						//console.log(data);
					})
				}
			});
		}
  	});
	
	
}]);

AppModule.directive('sortableMaster', function() {
	return{
		transclude: true,
		link:function($scope, element, attrs) {
		    if ($scope.$last){
		    	
		    	
		    }
		  }
	};
});

//angular.bootstrap(document, ['appModule']);