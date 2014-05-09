/* 
 *  ================================================================================
 *  Copyright (C) 2012 General Electric. ALL RIGHTS RESERVED.
 * 
 *  This file contains proprietary and GE CONFIDENTIAL Information.
 *  Use, disclosure or reproduction is prohibited.
 * 
 *  File:  index.js
 *  Created On: 22/07/2013 02:15:29 PM
 *  Author: 0180422
 * 
 */
var AppModule = angular.module( "appModule", ['Settings'] );


AppModule.controller("indexCtr",
	function ($http,$scope,$location,$browser,$timeout,AppSettings) {
	
		//Session timeout feature
		$scope.sessionverify = function(callback) {
			var dbsettings = {
					Table:"settings",
					TableKey:"name",
					id:"LOGOUT_TIME"
				}
			//Reading LOGOUT_TIME from the settings table
			dbObject.read(dbsettings, function(setresponse) {
				var logouttime = (setresponse.result.length > 0)?setresponse.result[0].value:0;
				var dbvjson = {
						Table:"user",
						TableKey:"id",
						id:"1"
					}
				//Reading user informations from the user table
				dbObject.read(dbvjson, function(response) {
					
					var timeout = 0;
					var diff = 0;
					var tmdiff = 0;
					var last_logged_date = '00:00:00 00:00:00';
					var ssoid = '';
					var d1,d2;
					var current_date = moment().format('YYYY-MM-DD HH:mm:ss');
					if (response.result.length > 0) {
						$.each(response.result, function(key, value) {
							last_logged_date = value.last_logged_time;
							ssoid = value.ssoid;
							document.cookie = "ssoid=" + ssoid +"; path=/; ";
							document.cookie = "RSOStub=" + ssoid +"; path=/; domain=.ge.com";
						});
					}
					d1 = new Date(last_logged_date.split(" ").join("T"));
					d2 = new Date(current_date.split(" ").join("T"));
					diff = d2 - d1;
					timeout = (logouttime*3600000) - diff;
					if(timeout > 0) {
						$timeout(
						function(){
							callback({status:true,ssoid:ssoid});
							}
						,1000);
					} else {
						callback({status:false,ssoid:ssoid});
					}
					
				});
			});
		}
		
		/*
		* Client schema creation
		**/
		$scope.runSchema = function(callback) {
			//Schema creation
			$.getJSON('config/schema.json', function(data) {
				var dbvjson = {
					Table:"dbversion",
					TableKey:"id",
					id:"1"
				}
				dbObject.read(dbvjson, function(response) {
					var dbvupjson;
					var dbversion = 0;
					var datalen;
					var dataversion;
					var totdatavr = 0;
					if (response.result.length > 0) {
						$.each(response.result, function(key,value) {
							dbversion = value.version_id;
						});
					}
					
					if (data.version > dbversion) {
						totdatavr = data.versions.length;
						if (data.versions.length > 0) {
							$.each(data.versions, function(key1,value1) {
								var loopcnt = 0;
								if(value1.version > dbversion) {
									if(value1.data.length > 0) {
										db.transaction(function(tx) {
											datalen = value1.data.length;
											dataversion = value1.version;
											$.each(value1.data, function(key2,value2) {
												tx.executeSql(value2.sql, [], function (tx, results) {
													loopcnt++;
													if (loopcnt == datalen) {
														dbvupjson = {
															"dbversion" :[
																{"id":1, "version_id":dataversion, "description":value1.description, "type":"db"}
															],
															"Table":"dbversion"
														}
														dbObject.write(dbvupjson, function (data) {
															if (key1 == (totdatavr-1)) callback(true);
														})
													}
												}, function (tx, error) {
													callback(true);
												});
											});
										}, function(error) {
											callback(true);
										});
									}
								}
							});
						} else {
							callback(true);
						}
					}else{
						callback(true);
					}
				});
			});
		}
		
		
		$scope.checkIsLogined = function() {
			
			$scope.sessionverify(function(response){
				$scope.isLogin = response.status;

				$scope.runSchema(function(data){
					if (response.ssoid != '') {
						
						$http({
						    url: AppSettings.web_server_url + AppSettings.servicePath + "validate/"+response.ssoid + "?ssoid=" + response.ssoid ,
						    dataType: "json",
						    method: "GET",
						    headers: {
						        "Content-Type": "application/json"
						    }
						}).success(function(result, status, headers, config){
						    if(typeof result.exists == 'undefined') {
								location.href = 'login.html?status='+status;
							} else {
								location.href = ($scope.isLogin == true && result.exists == 1 && result.result == true)?'home.html':'login.html';
							}
						}).error(function(error, status, headers, config) {
							location.href = ((status == 0 || status == 503 || status == 404) && $scope.isLogin == true)?'home.html?status='+status:'login.html?status='+status;
						});
					} else {
						location.href = 'login.html';
					}
				});
				
			});
		};
		
		$scope.$on("$destroy", function() {
			$scope.destroy();
		});
		
		$scope.destroy = function () {
			dbObject = null;
			db = null;
			delete dbObject;
			delete db;
		}
		$scope.checkIsLogined();
	}
);