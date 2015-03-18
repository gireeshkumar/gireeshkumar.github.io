/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var app = angular.module('app', ['ngAnimate', 'ui.grid']);



app.controller('MainCtrl',  ['$scope', '$http', function ($scope, $http) {

/*
        $scope.myData = [
            {
                "firstName": "Cox",
                "lastName": "Carney",
                "company": "Enormo",
                "employed": true
            },
            {
                "firstName": "Lorraine",
                "lastName": "Wise",
                "company": "Comveyer",
                "employed": false
            },
            {
                "firstName": "Nancy",
                "lastName": "Waters",
                "company": "Fuelton",
                "employed": false
            }
        ];
*/

        $scope.gridOptions = {
        };

        $scope.gridOptions.columnDefs = [
            {name: 'id'},
            {name: 'name'},
            {field: 'age'}, // showing backwards compatibility with 2.x.  you can use field in place of name
            {name: 'address.city'},
            {name: 'age again', field: 'age'}
        ];

        $http.get('/data/10000_complex.json')
                .success(function(data) {
                    $scope.gridOptions.data = data;
                });
    }]);

