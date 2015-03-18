var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.moveColumns', 'addressFormatter', 'ui.grid.exporter', 'ui.grid.expandable', 'ui.grid.selection', 'ui.grid.pinning', 'ui.grid.pagination', 'ui.grid.pinning', 'ui.grid.resizeColumns']);

angular.module('addressFormatter', []).filter('address', function() {
    return function(input) {
        return input.street + ', ' + input.city + ', ' + input.state + ', ' + input.zip;
    };
});

app.controller('MainCtrl', ['$scope', '$http', 'uiGridConstants', '$interval', '$q', function($scope, $http, uiGridConstants, $interval, $q) {

        $scope.dataset = "500_complex.json";

        $scope.clearFilter = function() {
            $scope.gridOptions.data = $scope.gridOptions.orgData;
            $scope.filterData = "";
        };
        $scope.matchcase = true;

        var doFilter = function() {

            if (typeof ($scope.filterData) != "undefined" && $scope.filterData != null) {

                $scope.flen = $scope.filterData.length;
                if ($scope.flen < 3) {
                    if ($scope.flen == 0) {
                        $scope.clearFilter();
                    }
                    return;
                }

                var dataToFilter = $scope.gridOptions.orgData;
                var filtered = [];

                var filterKey = ($scope.matchcase ? $scope.filterData : $scope.filterData.toLowerCase());

                var hasFilterStr = function(inputval) {

                    inputval = ($scope.matchcase ? inputval : inputval.toLowerCase());

                    return inputval.indexOf(filterKey) != -1;
                };

                angular.forEach(dataToFilter, function(value, key) {
                    // filter 'value', by columns in '$scope.gridOptions.columnDefs'

                    for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
                        var colval = $scope.gridOptions.columnDefs[i];
                        var val = value[colval.name];

                        var selectedObject = null;

                        if (typeof (val) === "object") {
                            for (var prop in val) {
                                if (val.hasOwnProperty(prop)) {
                                    if (hasFilterStr("" + val[prop])) {
                                        selectedObject = value;
                                        continue;
                                    }
                                }
                            }
                        } else {
                            if (hasFilterStr("" + val)) {
                                selectedObject = value;
                            }
                        }

                        if (selectedObject != null) {
                            filtered.push(value);
                            continue;
                        }

                    }
                });

                $scope.gridOptions.data = filtered;
            }

        };

        $scope.$watch("filterData", doFilter);
        $scope.$watch("matchcase", doFilter);

        $scope.gridOptions = {
            enableSorting: true,
            showGridFooter: true,
            expandableRowTemplate: 'expandableRowTemplate.html',
            expandableRowHeight: 150,
            //subGridVariable will be available in subGrid scope
            expandableRowScope: {
                subGridVariable: 'subGridScopeVariable'
            },
            exporterMenuCsv: false,
            enableGridMenu: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            useExternalPagination: true,
            useExternalSorting: false,
            enableFiltering: true
        };
        $scope.gridOptions.columnDefs = [
            {name: 'id', enableCellEdit: false, width: '10%', enablePinning: false},
            {name: 'name', displayName: 'Name (editable)', width: '150', pinnedLeft: true},
            {name: 'age', displayName: 'Age', type: 'number', width: '80', pinnedLeft: true},
            {name: 'gender', displayName: 'Gender', editableCellTemplate: 'ui-grid/dropdownEditor', width: '20%',
                cellFilter: 'mapGender', editDropdownValueLabel: 'gender', editDropdownOptionsArray: [
                    {id: 1, gender: 'male'},
                    {id: 2, gender: 'female'}
                ]},
            {name: 'registered', displayName: 'Registered', type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '20%'},
            {name: 'address', displayName: 'Address', type: 'object', cellFilter: 'address', width: '30%'},
            {name: 'address.city', displayName: 'Address (even rows editable)', width: '20%',
                cellEditableCondition: function($scope) {
                    return $scope.rowRenderIndex % 2
                }
            },
            {name: 'isActive', displayName: 'Active', type: 'boolean', width: '10%'},
            {name: 'pet', displayName: 'Pet', width: '20%', editableCellTemplate: 'ui-grid/dropdownEditor',
                editDropdownRowEntityOptionsArrayPath: 'foo.bar[0].options', editDropdownIdLabel: 'value'
            }
        ];
        $scope.msg = {};
        $scope.gridOptions.onRegisterApi = function(gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                $scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue;
                $scope.$apply();
            });
        };

//$scope.dataset
        //$http.get('/data/500_complex.json')
        var loadRecords = function() {

            $scope.gridOptions.data = $scope.gridOptions.orgData = [];

            var url = 'data/' + $scope.dataset;
            console.log(url);
            $scope.loadMessage = "Loading";
            $scope.loadStartTime = new Date().getTime();
            
            $http.get(url)
                    .error(function(data) {
                        alert("failed");
                    })
                    .success(function(data) {
                        for (i = 0; i < data.length; i++) {
                            data[i].registered = new Date(data[i].registered);
                            data[i].gender = data[i].gender === 'male' ? 1 : 2;
                            if (i % 2) {
                                data[i].pet = 'fish'
                                data[i].foo = {bar: [{baz: 2, options: [{value: 'fish'}, {value: 'hamster'}]}]}
                            }
                            else {
                                data[i].pet = 'dog'
                                data[i].foo = {bar: [{baz: 2, options: [{value: 'dog'}, {value: 'cat'}]}]}
                            }
                        }
                        
                         $scope.loadEndTime = new Date().getTime();
                        var timetoload = $scope.loadEndTime - $scope.loadStartTime;
                         $scope.loadMessage = "Data loaded[TimeToLoad:"+timetoload+" ms]";
                        $scope.gridOptions.data = data;
                        $scope.gridOptions.orgData = data;
                    });
        }

        $scope.$watch("dataset", loadRecords);

    }])

        .filter('mapGender', function() {
            var genderHash = {
                1: 'male',
                2: 'female'
            };
            return function(input) {
                if (!input) {
                    return '';
                } else {
                    return genderHash[input];
                }
            };
        });
;


        