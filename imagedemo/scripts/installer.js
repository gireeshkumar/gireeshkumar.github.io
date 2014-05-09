//Create an application module for our demo.
var AppModule = angular.module( "installerModule",['Settings'] );

AppModule.run(['$rootScope','AppModel', function($rootScope,  AppModel) {


		AppModel.smsession = sessionStorage.VPPSession;

		var ssoid =  $.cookie('ssoid');

		AppModel.user = {sso: ssoid, name:'', email:''};
				
}]);

$(function(){

	$("body").on({
		ajaxStart: function() { 
			$(this).addClass("loading"); 
		},
		ajaxStop: function() { 
			$(this).removeClass("loading"); 
		}    
	});
	

});


//angular.bootstrap(document, ['loginModule']);