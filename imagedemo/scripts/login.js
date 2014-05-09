//Create an application module for our demo.
var AppModule = angular.module( "loginModule", ['ngResource','Settings'] );

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