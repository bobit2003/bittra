(function(window, document, undefined) {
    'use strict';
    angular.module('accounts.grid', [])
        .controller('MonGridTabBarCtrl', [
            '$scope',
            'monGrid',
            'gridSetting',
            'monGridConfig',
            function($scope, monGrid, gridSetting, monGridInit){
                $scope.monGrid      = monGrid;
                $scope.gridSetting  = gridSetting;
                $scope.monGridInit  = monGridInit;
            }
        ])
        .controller('MonGridRowCtrl', [
            '$scope',
            '$rootScope',
            'monLikes',
            'compareAccounts',
            '$modal',
            function($scope, $rootScope, monLikes, compareAccounts, $modal){
                $scope.getInfo = function() {
                    var scopeDetail = $scope.$new();
                    scopeDetail.row = this.row;
                    $scope.modal = $modal({
                        template:  'modal/grid-row-details.html',
                        animation: 'am-fade-and-scale',
                        placement: 'center',
                        scope:     scopeDetail,
                        backdrop: true
                    });
                };
                $scope.isLike = function() {
                    var row = this.row;
                    return monLikes.has(row.id);
                };
                $scope.likeClass = function() {
                    var row = this.row;
                    return monLikes.has(row.id) ? 'fa-heart': 'fa-heart-o';
                };
                $scope.toggleSubClass = function() {
                    return this.row.showSubData ? 'fa-collapse-up': 'fa-collapse-down';
                };
                $scope.toggleLike = function() {
                    var row = this.row;
                    monLikes.toggle(row.id, row.account_type);
                };
                $scope.toggleCompare = function() {
                    var row = this.$parent.row;
                    compareAccounts.toggleAccount(row.account_id);
                };
                $scope.isCompare = function() {
                    var row = this.$parent.row;
                    return compareAccounts.isCompare(row.account_id);
                }
            }
        ])
        .factory('monGrid', [
            '$rootScope',
            'monGridConfig',
            'gridColumns',
            'gridSetting',
            'Accounts',
            'monData',
            function ($rootScope, monGridConfig, gridColumns, gridSetting, Accounts, monData){
                var current = gridSetting.options;
                var object = {};

                object.loading       = false;
                object.isEmpty       = false;
                object.columns       = gridColumns.columns;

                function getParams () {
                    return _.merge({}, current.params, object.getFilters());
                }

                object.update = function() {
                    if(object.loading) return;
                    var params = getParams();
                    object.loading = true;

                    function success(data) {
                        object.loading = false;
                        monData.grid   = data;
                        object.isEmpty = data.rows.length == 0;
                    }

                    function error() {
                        object.loading = false;
                        monData.grid   = [];
                        object.isEmpty = true;
                    }
                    Accounts.table(params, success, error);
                };
                object.updateLikes = function() {
                    var rows = [];

                    function success(data) {
                        object.loading = false;
                        rows.push(data.rows[0]);
                        object.isEmpty = data.rows.length == 0;
                    }

                    function error() {
                        object.loading = false;
                        monData.grid   = [];
                        object.isEmpty = true;
                    }

                    $rootScope.monLikes.forEach(function (like){
                        var params = _.merge({}, current.params, {'account': like.id});

                        Accounts.table(params, success, error);
                    });
                    monData.grid.rows = rows;
                };
                // object.updateLikes = function() {
                //     var accounts = [];
                //
                //     $rootScope.monLikes.forEach(function (like){
                //         accounts.push(like.id);
                //     });
                //
                //     function success(data) {
                //         object.loading = false;
                //         monData.grid.rows = data.result;
                //         object.isEmpty = data.result.length == 0;
                //     }
                //
                //     function error(data) {
                //         console.log(data)
                //         object.loading = false;
                //         monData.grid   = [];
                //         object.isEmpty = true;
                //     }
                //
                //     console.log(accounts);
                //     accounts = [2796930, 70799269, 5668157, 20624616, 20595172];
                //     var params = {"accounts[]": accounts };
                //     Accounts.compare(params, success, error);
                //
                // };
                object.gotoFirstPage = function() {
                    if(current.params.page === 1) {
                        object.update();
                    }
                    else {
                        current.params.page = 1;
                    }
                };
                object.getFilters = function() {
                    return gridColumns.getFilters();
                };
                object.getArrayFilter = function() {
                    return gridColumns.getArrayFilter();
                };
                object.clearFilter = function(name) {
                    gridColumns.clearFilter(name);
                    object.gotoFirstPage();
                };
                object.setLike = function(like) {
                    gridColumns.clearFilters();
                    current.params.acc_type = like.acc_type;
                    gridColumns.setFilter('account', like.id);
                    object.gotoFirstPage();
                };
                object.clearFilters = function() {
                    gridColumns.clearFilters();
                    object.gotoFirstPage();
                };

                object.toggleSorted = function(name) {
                    if(!gridColumns.canSorted(name) || object.loading) return;
                    current.params.sortorder = gridColumns.setColumnSort(name);
                    current.params.sortname  = name;
                };
                object.getOrder = function(name) {
                    var order = null;
                    if(name === current.params.sortname) {
                        order = current.params.sortorder;
                    }
                    return order;
                };

                object.setSetting = function(name) {
                    if(name && !object.loading) {
                        gridSetting.set(name);
                        gridColumns.initColumns();
                        object.update();
                    }
                };
                object.resetSettings  = function() {
                    gridSetting.reset();
                    gridColumns.initColumns(true);
                    object.gotoFirstPage();
                };
                $rootScope.$watch(function() {return current.params}, function(newVal, oldVal){
                    if(newVal.page === oldVal.page) {
                        current.params.page = 1;
                    }
                    object.update();
                }, true);
                return object;
            }
        ])
        .factory('gridColumns', [
            '$rootScope',
            'monGridConfig',
            'gridSetting',
            'defaultStyle',
            function ($rootScope, monGridConfig, gridSetting, defaultStyle) {
                var current     = gridSetting.options,
                    colDefault  = angular.copy(defaultStyle.colGrid),
                    colsDefault = _.map(monGridConfig.columns, function(column){
                        column.info = monGridConfig.columnsInfo[column.name] || {label: column.name};
                        return _.merge({}, colDefault, column);
                    });

                var object = {};
                object.columns = angular.copy(colsDefault);
                object.initColumns = function(clear) {
                    if(clear) {
                        current.columns = [];
                        var columns =  angular.copy(colsDefault);
                        _.forEach(object.columns, function(config){
                            var column = _.find(columns, {name: config.name});
                            column = setColumnOrder(column);
                            if(!angular.isUndefined(column)) {
                                config.filterValue = null;
                                _.merge(config, column);
                            }
                        });
                    }
                    _.forEach(current.columns, function(config){
                        var column = object.get(config.name);
                        column = setColumnOrder(column);
                        if(!angular.isUndefined(column)) {
                            _.merge(column, config);
                        };
                    });
                };
                object.get = function(name) {
                    return _.find(object.columns, {name: name});
                };
                object.getFilters = function() {
                    var filter = {};
                    _.forEach(object.columns, function(column){
                        if(column.filterValue) {
                            filter[column.name] = column.filterValue;
                        }
                    });
                    return filter;
                };
                object.clearFilter = function(name) {
                    var column = object.get(name);
                    column.filterValue = null;
                };
                object.setFilter = function(name, value) {
                    var column = object.get(name);
                    column.filterValue = value;
                };
                object.clearFilters = function() {
                    _.forEach(object.columns, function(column){
                        column.filterValue = null;
                    });
                };
                object.getArrayFilter = function() {
                    var filters = [];
                    _.forEach(object.columns, function(column){
                        if(!_.isEmpty(column.filterValue)) {
                            var filter = _.find(column.filter, {val:column.filterValue});
                            filters.push({
                                label: column.info.label,
                                name: column.name,
                                filterValue: column.filterValue,
                                filterText: _.isUndefined(filter) ? column.filterValue: filter.name
                            });
                        }
                    });
                    return filters;
                };
                object.canSorted = function(name) {
                    var column = object.get(name);
                    return !angular.isUndefined(column) && column.canSort;
                };
                object.getLenVisible = function() {
                    return _.where(object.columns, { visible: true }).length + 1;
                };
                object.setColumnSort = function(name) {
                    var sortorder = 'desc';
                    _.map(object.columns, function(column){
                        if(column.name === name) {
                            column.sorted = true;
                            column.sortOrder = (column.sortOrder === sortorder) ? 'asc': sortorder;
                            sortorder = column.sortOrder;
                        }
                        else {
                            column.sorted    = false;
                            column.sortOrder = null;
                        }
                        return column;
                    });
                    return sortorder;
                };
                function setColumnOrder(column) {
                    var sorted = column.name === current.params.sortname;
                    column.sorted    = sorted;
                    column.sortOrder = sorted ? current.params.sortorder: null;
                    return column;
                }
                function getColumns() {
                    return object.columns
                }
                function saveToConfig(columns) {
                    _.forEach(columns, function(column){
                        var columnConfig = _.find(current.columns, {name: column.name});
                        var config = {
                            name: column.name,
                            visible: column.visible,
                            filterValue: column.filterValue || null
                        };
                        if(!angular.isUndefined(columnConfig)) {
                            _.merge(columnConfig, config);
                        } else {
                            current.columns.push(config);
                        };
                    });
                };
                object.initColumns();
                $rootScope.$watch(getColumns, saveToConfig, true);
                return object;
            }
        ])
        .factory('gridSetting', [
            '$rootScope',
            'monSets',
            'monGridConfig',
            'monGridOptions',
            function ($rootScope, monSets, monGridConfig, monGridOptions) {
                var object = {};
                object.options = $rootScope.monGridOptions;
                object.add = function (name) {
                    var current = _.cloneDeep(object.options);
                    current.params.page = 1;
                    monSets.add(name, current);
                };
                object.getAll = function() {
                  return  monSets.getAll();
                };

                object.set = function (name) {
                    var item =  _.cloneDeep(monSets.get(name));
                    _.merge(object.options, item);
                };

                object.reset = function() {
                    var params  = _.cloneDeep(monGridConfig.params);
                    var current = _.cloneDeep(monGridOptions);
                    object.options.params  = params;
                    object.options.name    = current.name;
                };

                object.remove = function (name) {
                    monSets.remove(name);
                };

                object.clear = function () {
                    object.options.name = 'Default';
                    monSets.clear();
                };

                return object;
            }
        ])
        .directive('cellTable', [
            '$compile', '$templateCache',
            function($compile, $templateCache) {
                var Object = {
                    restrict: 'ECA',
                    scope: false,
                    compile: function() {
                        return {
                            pre: function preLink(scope, iElement, iAttrs) {
                                var col         = scope.col;
                                scope.cellValue = scope.$parent.row[col.name];
                                var templateUrl = angular.isDefined(col.templateUrl) ? col.templateUrl : 'template/td.html';
                                if(col.class) {
                                    iElement.addClass(col.class);
                                };
                                if(col.pinnable) {
                                    iElement.addClass('pinnable');
                                };
                                iElement.append($compile($templateCache.get(templateUrl))(scope));
                            },
                            post: function postLink(scope, iElement, iAttrs) {}
                        };
                    }
                };
                return Object;
            }
        ])
        .directive('colHeader', [function() {
            var Object = {
                restrict: 'ECA',
                replace: false,
                priority: 1000,
                scope: false,
                templateUrl: 'template/grid-col-header.html',
                compile: function(tElement, tAttrs) {
                    tElement.attr({
                        //'ng-click': 'monGrid.toggleSorted(col.name)',
                        'ng-show': 'col.visible',
                        'ng-style': '{width: col.width}',
                        'ng-class': '{pinnable: col.pinnable}'
                    });
                    return function postLink(scope, iElement, iAttrs) {}
                }
            };
            return Object;
        }])
        .directive('filterBar', [
            'monGrid',
            function(monGrid) {
                var Object = {
                    restrict: 'EA',
                    replace: true,
                    scope: true,
                    templateUrl: 'template/filter-bar.html',
                    controller: function($scope, $element, $attrs) {
                        $scope.tooltip = {
                            animation: 'am-flip-x',
                            placement: 'bottom'
                        };
                        $scope.monGrid = monGrid;
                        $scope.filters = [];
                        $scope.$watch('monGrid.getArrayFilter()', function(newValue){
                            $scope.filters = newValue;
                        }, true);
                        $scope.remove = function(name) {
                            if(!monGrid.loading) {
                                monGrid.clearFilter(name);
                            };
                        };
                    }
                };
                return Object;
            }
        ])
        .directive('profitBar', [
            'gridColumns',
            function(gridColumns) {
                var Object = {
                    restrict: 'EA',
                    replace: true,
                    templateUrl: 'template/profit-bar.html',
                    controller: function($scope) {
                        $scope.tooltip = {
                            animation: 'am-fade',
                            placement: 'bottom'
                        };
                        $scope.gridColumns = gridColumns;
                    }
                };
                return Object;
            }
        ])
        .directive('detailsChart', [
            'monGridConfig',
            'gridChartConfig',
            '$window',
            'ChartsState',
            '$filter',
            function(monGridConfig, gridChartConfig, $window, ChartsState, $filter) {
                var Object = {
                    restrict: 'ECA',
                    templateUrl: 'template/details-row-chart.html',
                    controller: function($scope, $element, $attrs) {

                        function getUrl(period) {
                            var params = {
                                account: $scope.row.id
                            };
                            var chartUrl = monGridConfig.chartUrl;
                            if(!_.isEmpty(period)) {
                                angular.extend(params, period);
                            };
                            return chartUrl;
                        };

                        function init(row) {
                            $scope.basePeriod  = {};
                            $scope.chartUrl    = getUrl();
                            $scope.dayPeriod   = 0;
                            $scope.chartPeriod = {};
                            $scope.chartConfig = _.merge({}, gridChartConfig);
                            $scope.chartConfig.id += row.id;
                        };

                        init($scope.row);

                        $window.FC_DataLoaded = function(chartId) {
                            function setPeriod(period) {
                                $scope.basePeriod.start_date = new Date(period.from);
                                $scope.basePeriod.end_date = new Date(period.to);
                            };
                            if(_.isEmpty($scope.basePeriod)) {
                                try {
                                    var chart  = FusionCharts.getObjectReference(chartId),
                                        period = angular.fromJson(chart.getChartAttribute('chartPeriod'));

                                    $scope.$apply(setPeriod(period));
                                }
                                catch (e) {}
                            };
                        };

                        $scope.chartIsLoading = function() {
                            return ChartsState.getByName($scope.chartConfig.id);
                        };

                        var setDayPeriod = function(days){
                            if($scope.chartIsLoading()) return;
                            if(days == 0) {
                                $scope.chartPeriod = {};
                            }
                            else {
                                var end_date = angular.copy($scope.basePeriod.end_date),
                                    start_date = new Date(end_date.setUTCDate(end_date.getUTCDate() - days));
                                $scope.chartPeriod.start_date =  $filter('formatDate')(start_date);
                                $scope.chartPeriod.end_date   =  $filter('formatDate')($scope.basePeriod.end_date);
                            }
                        };
                        var updateChart = function(newPeriod, oldPeriod) {
                            $scope.chartUrl = getUrl(newPeriod);
                        };

                        $scope.$watch('dayPeriod', setDayPeriod);
                        $scope.$watch('chartPeriod', updateChart, true);
                        var start = $scope.$watch('chartIsLoading()', function(newValue) {
                            if($scope.row.chartLoading && !newValue) {
                                $scope.row.chartLoading = newValue;
                                start(); //remove $watch
                            };
                        });
                    }
                };
                return Object;
            }
        ])
        .directive('colFilter', ['$compile','$templateCache', function($compile, $templateCache) {
            var Object = {
                restrict: 'ECA',
                compile: function(){
                    return {
                        pre: function(scope, iElement, iAttrs) {
                            if(scope.col.filter) {
                                if(angular.isArray(scope.col.filter)) {
                                    var template = $templateCache.get('template/filter-select.html');
                                }
                                else {
                                    var template = $templateCache.get('template/filter-input.html');
                                }
                                iElement.append($compile(template)(scope));
                            };
                            if(scope.col.pinnable) {
                                iElement.addClass('pinnable');
                            };
                        }
                    }
                }
            };
            return Object;
        }])
        .directive('modalSettings', [
            'gridColumns',
            'monGrid',
            'gridSetting',
            'monGridInit',
            function(gridColumns, monGrid, gridSetting, monGridInit) {
                var Object = {
                    restrict: 'EA',
                    templateUrl: 'settings/colums.html',
                    link: function(scope) {
                        scope.tab         = 'main';
                        scope.gridColumns = gridColumns;
                        scope.monGrid     = monGrid;
                        scope.gridSetting = gridSetting;
                        scope.monGridInit = monGridInit;
                        scope.listColumns = gridColumns.columns.filter(function (column) {
                            return !(monGridInit.isEU && ['investors_count'].indexOf(column.name) > -1);
                        });
                    }
                };
                return Object;
            }
        ])
        .directive('monPager', [
            function() {
                var Object = {
                    restrict: 'EA',
                    replace: true,
                    scope: {
                        page: '=',
                        total: '=',
                        pageSize: '=',
                        disabled: '=',
                        rpOptions: '=',
                        onChange: '&onChange',
                        onChangeRp: '&'
                    },
                    templateUrl: 'template/grid-pager.html',
                    link: function(scope, element, attr) {
                        scope.page      = parseInt(scope.page) || 1;
                        scope.total     = parseInt(scope.total) || 0;
                        scope.pageSize  = parseInt(scope.pageSize) || 10;
                        scope.rpOptions = scope.rpOptions || [5, 10, 15, 25, 50];
                        scope.pages    = 0;
                        scope.from     = 0;
                        scope.to       = 0;
                        scope.isFirstPage = true;
                        scope.isLastPage  = true;
                        scope.current = {
                            pageSize: scope.pageSize,
                            inputPage: scope.page
                        };
                        scope.setPage = function() {
                            scope.current.inputPage = parseInt(scope.current.inputPage) || 1;
                            if(scope.current.inputPage > scope.pages) {
                                scope.current.inputPage = scope.pages;
                            }
                            scope.page = scope.current.inputPage;
                            scope.onChange();
                        };

                        var inputPage = element.find('input'),
                            inputPageCtrl = inputPage.controller('ngModel');

                        if(inputPageCtrl) {

                            inputPageCtrl.$parsers.unshift(function(val) {
                                if(! isNaN(val)) {
                                    inputPageCtrl.$setValidity('valid', true);
                                } else {
                                    inputPageCtrl.$setValidity('valid', false);
                                }
                                return val;
                            });

                            inputPageCtrl.$formatters.push(function(text) {
                                return text + '/' + scope.pages;
                            });
                            scope.$watch('current.inputPage', function(val, old){
                                if(!inputPageCtrl.$valid) {
                                    inputPageCtrl.$setViewValue(old);
                                    inputPageCtrl.$render();
                                }
                            });
                            inputPage.bind('focus', function(){
                                inputPageCtrl.$viewValue = null;
                                inputPageCtrl.$render();
                            });
                            inputPage.bind('blur', function(){
                                if(inputPageCtrl.$viewValue !== scope.page) {
                                    inputPageCtrl.$viewValue = scope.page + '/' + scope.pages;
                                    inputPageCtrl.$render();
                                }
                            });
                            scope.$watch('pages', function(newValue) {
                                inputPageCtrl.$viewValue = scope.page + '/' + newValue;
                                inputPageCtrl.$render();
                            });
                        }

                        function currentParams() {
                            return {
                                pageSize: scope.current.pageSize,
                                page:     scope.page,
                                total:    scope.total
                            };
                        }

                        function calcPages(newValue, oldValue) {
                            if(oldValue.pageSize !== newValue.pageSize){
                                scope.page = 1;
                            }
                            scope.isFirstPage = (newValue.page === 1);
                            scope.isLastPage  = (newValue.page === scope.pages);
                            scope.pages       = Math.ceil(scope.total / newValue.pageSize);
                            scope.current.inputPage   = newValue.page;
                            scope.pageSize    = newValue.pageSize;
                            calcStatistic();
                        }

                        function calcStatistic() {
                            scope.from  = (scope.page - 1) * scope.pageSize + 1;
                            var to = scope.from + scope.pageSize - 1;
                            scope.to = (to > scope.total) ? scope.total: to;
                        }

                        scope.firstPage = function () {
                            scope.page = 1;
                            scope.onChange();
                        };
                        scope.nextPage = function () {
                            if(scope.page < scope.pages) {
                                scope.page++
                            }
                            scope.onChange();
                        };
                        scope.prevPage = function () {
                            if(scope.page > 1) {
                                scope.page--
                            }
                            scope.onChange();
                        };
                        scope.lastPage = function () {
                            if(scope.pages !== 0) {
                                scope.page = scope.pages;
                            }
                            scope.onChange();
                        };
                        scope.$watch(currentParams, calcPages, true);
                    }
                };
                return Object;
            }
        ])
        .directive('settingsPanel', [
            '$popover',
            '$dropdown',
            '$timeout',
            'monGrid',
            'gridSetting',
            function($popover, $dropdown, $timeout, monGrid, gridSetting) {
                var Object = {
                    restrict: 'EA',
                    replace: true,
                    scope: true,
                    templateUrl: 'template/settings-panel.html',
                    controller: function($scope, $element) {
                        var listBtn = angular.element($element.children()[0]);
                        var saveBtn = angular.element($element.children()[1]);
                        $scope.disabled     = false;
                        $scope.set          = {};
                        $scope.monGrid      = monGrid;
                        $scope.gridSetting  = gridSetting;
                        var listDropdown = $dropdown(listBtn, {
                            template:  'template/dropdown-list-settings.html',
                            animation: 'am-flip-x',
                            placement: 'bottom-left',
                            //container: 'body',
                            scope: $scope
                        });
                        var savePopover = $popover(saveBtn, {
                            trigger:   'click',
                            template:  'template/popover-list-save-setting.html',
                            animation: 'am-flip-x',
                            placement: 'bottom',
                            //container: 'body',
                            scope:     $scope
                        });
                        $scope.addSetting = function() {
                            gridSetting.add($scope.set.nameSetting);
                            gridSetting.options.name = $scope.set.nameSetting;
                            $scope.set.nameSetting = null;
                            $timeout(savePopover.toggle);
                        };

                        $scope.$watch(
                            function() {
                                return gridSetting.getAll().length === 0;
                            },
                            function(value) {
                                $scope.disabled = value;
                            }
                        );
                    }
                };
                return Object;
            }
        ])
        .directive('likesPanel', [
            '$dropdown',
            '$timeout',
            'gridSetting',
            'monLikes',
            'monGrid',
            function($dropdown, $timeout, gridSetting, monLikes, monGrid) {
                var Object = {
                    restrict: 'EA',
                    scope: {},
                    link: function(scope, element) {
                        scope.monLikes   = monLikes;
                        scope.gridSetting = gridSetting;
                        scope.monGrid     = monGrid;
                        var listPopover = $dropdown(element, {
                            trigger:   'click',
                            template:  'template/popover-list-likes.html',
                            animation: 'am-flip-x',
                            placement: 'bottom-left',
                            scope: scope
                        });

                        scope.$watch(function () {
                            // return monLikes.getLikes().length === 0;
                        }, function (value) {
                            element.css('pointer-events', value ? 'none' : 'auto');
                        });
                    }
                };
                return Object;
            }
        ])
    ;
})(window, document);
