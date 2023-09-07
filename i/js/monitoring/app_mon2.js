'use strict';

(function() {

    angular.extend( angular, {
        toParam: toParam
    });

    /**
     * Преобразует объект, массив или массив объектов в строку,
     * которая соответствует формату передачи данных через url
     * Почти эквивалент [url]http://api.jquery.com/jQuery.param/[/url]
     * Источник [url]http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object/1714899#1714899[/url]
     *
     * @param object
     * @param [prefix]
     * @returns {string}
     */
    function toParam( object, prefix ) {
        var stack = [];
        var value;
        var key;
        for( key in object ) {
            value = object[ key ];
            key = prefix ? prefix + '[' + key + ']' : key;

            if ( value === null ) {
                value = encodeURIComponent( key ) + '=';
            } else if ( typeof( value ) !== 'object' ) {
                value = encodeURIComponent( key ) + '=' + encodeURIComponent( value );
            } else {
                value = toParam( value, key );
            }
            stack.push( value );
        }
        return stack.join( '&' );
    }
}());

//Angular POST fix
angular.module('postFix', [])
    .config(['$httpProvider'], function($httpProvider){
        $httpProvider.defaults.headers.post[ 'Content-Type' ] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.transformRequest = function(data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? angular.toParam(data) : data;
        };
});

//Monitoring route
angular.module('monRoute', ['ui.router'])
    .config([
        '$locationProvider',
        '$stateProvider',
        '$urlRouterProvider',
        function($locationProvider, $stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/");
            $stateProvider
                // .state('simple', {
                //     url: "",
                //     // template: "<simple-mon-table />",
                //     // abstract: true,
                //     template: "<ui-view/>"
                // })
                .state('simple', {
                    url: "/",
                    template: "<simple-mon-table />"
                })
                .state('list', {
                    url: "/list",
                    templateUrl: "template/mon-grid.html"
                })
                .state('cases', {
                    url: "/portfolios",
                    template: "<cases-mon-table />"
                })
                .state('cases.type', {
                    url: "/:type",
                    template: "<cases-mon-table />"
                });
            $locationProvider.html5Mode(false).hashPrefix('!');
        }
    ]);

//ngStrap config
angular.module('ngStrapConfig', ['mgcrea.ngStrap'])
    .config([
        '$popoverProvider',
        '$tooltipProvider',
        '$dropdownProvider',
        '$modalProvider',
        function($popoverProvider, $tooltipProvider, $dropdownProvider, $modalProvider) {
            angular.extend($tooltipProvider.defaults, {
                animation: 'am-flip-x',
                //trigger: 'click',
                //container: 'body',
                html: true,
                placement: 'bottom',
                delay: { show: 500, hide: 100 }
            });
            angular.extend($popoverProvider.defaults, {
                //animation: 'am-flip-x',
                //trigger: 'click',
                //container: 'body',
                //html: true,
                placement: 'bottom'
                //delay: { show: 500, hide: 100 }
            });
            angular.extend($dropdownProvider.defaults, {
                animation: 'am-flip-x',
                placement: 'bottom'
            });
            angular.extend($modalProvider.defaults, {
                //animation: 'am-flip-x',
                placement: 'center',
                backdrop: false
            });
        }
    ]);
//
////Monitoring config
//angular.module('monConfig', [])
//    .config([
//
//        function() {
//
//        }
//    ]);

//Monitoring modules
angular.module('monModules', [
    'monRoute',
    'ngStrapConfig',
    'ngTouch',
    'ngResource',
    'ngAnimate',
    'angularLocalStorage',
    'ui-rangeSlider',
    'ChartModule',
    'FBAngular',
    'accounts.grid',
    'accounts.compare',
    'monDirectives',
    'monServices',
    'monFilters',
    'i18N'
]);


/* App MonGrid */
angular.module('monApp', ['monModules', 'monConfig'])
    .constant('defaultStyle', {
        colGrid: {
            setting: true,
            class: 'text-right',
            width: 100,
            visible: true,
            filterValue: null,
            sorted: false,
            sortOrder: null,
            canSort: true
        }
    })
    .constant('gridChartConfig', {
        id: 'profit_equity_',
        swfUrl: '/chart_xt/MSCombi2D.swf',
        height: '300',
        bgColor: '#FFFFFF',
        renderer: 'javascript'
    })
    .constant('monGridConfig', {
        rpOptions: [5, 10, 15, 25, 50],
        url: null,
        storageKey: 'monapp',
        params: {
            rp: 10,
            page: 1,
            sortname: null,
            sortorder: null
        },
        chartUrl: null,
        actionUrl: null
    })
    .value('monData', {
        grid: {
            rows: [],
            page: null,
            total: null
        },
        compare: []
    })
    .value('monGridOptions', {
        name: 'Default',
        params: {},
        columns: []
    })
    .config([
        '$langProvider',
        'monGridInit',
        function($langProvider, monGridInit){
            $langProvider.load(monGridInit.columnsInfo);
        }
    ])
    .run([
        '$rootScope',
        '$log',
        '$lang',
        'monGridConfig',
        'monGridOptions',
        'monGridInit',
        'storage',
        function($rootScope, $log, $lang, monGridConfig, monGridOptions, monGridInit, storage){
            $rootScope.$log   = $log;
            $rootScope.$lang  = $lang;
            _.merge(monGridConfig, monGridInit);
            monGridOptions.params  = _.cloneDeep(monGridConfig.params);
            storage.bind($rootScope, 'monGridOptions', {defaultValue: monGridOptions , storeName: monGridConfig.storageKey + '_current'});

            $rootScope.$on('modal.hide.before', function (e) {
                var body = angular.element(document).find('body');
                body.removeClass('modal-open');
            });
        }
    ])
    .controller('MonAppCtrl', [
        '$scope',
        '$rootScope',
        'monData',
        'gridColumns',
        'monGrid',
        'monLikes',
        'compareAccounts',
        'gridSetting',
        'monGridConfig',
        function($scope, $rootScope, monData, gridColumns, monGrid, monLikes, compareAccounts, gridSetting, monGridConfig){
            $scope.gridColumns      = gridColumns;
            $scope.monGrid          = monGrid;
            $scope.monData          = monData;
            $scope.monLikes         = monLikes;
            $scope.compareAccounts  = compareAccounts;
            $scope.gridSetting      = gridSetting;
            $scope.monGridConfig    = monGridConfig;
            $scope.isFullscreen = false;
            $scope.toggleFullScreen = function() {
                $scope.isFullscreen = !$scope.isFullscreen;
            };
        }
    ])
;

/* Directives */

angular.module('monDirectives', [])
    .directive('onEnter',function(){
        var linkFn = function(scope,element,attrs) {
            element.bind("keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.onEnter);
                    });
                    event.preventDefault();
                }
            });
        };
        return {
            link:linkFn
        };
    })
    .directive("centered", function() {
        return {
            restrict : "ECA",
            transclude : true,
            template : "<div class=\"angular-center-container\">\
						<div class=\"angular-centered\" ng-transclude>\
						</div>\
					</div>"
        };
    })
    .directive("scrollEvent", ['$window',function($window) {
        return function(scope, element) {
            scope.scrollInfo = {
                isScroll: false,
                isLeft: false,
                isRight: false
            };
            function getWidth() {
                return {
                    scrollWidth: element[0].scrollWidth,
                    offsetWidth: element[0].offsetWidth,
                    scrollLeft: element[0].scrollLeft,
                    scrollSpan: element[0].scrollWidth - element[0].offsetWidth
                };
            };
            function testScroll(data) {
                if(angular.isUndefined(data)) {
                    data = getWidth();
                }
                scope.scrollInfo.isScroll = data.scrollSpan > 0;
                scope.scrollInfo.isLeft   = scope.scrollInfo.isScroll && data.scrollLeft > 0;
                scope.scrollInfo.isRight  = scope.scrollInfo.isScroll && data.scrollLeft < data.scrollSpan;
            };
            scope.$watch(getWidth, testScroll, true);
            angular.element($window).on('resize', function(){
                scope.$apply(testScroll);
            });
            element.on('scroll', function(){
                scope.$apply(testScroll);
            });
        };
    }])
    .directive('btnRadio', function () {
        return {
            require: ['ngModel'],
            link: function (scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0];

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass('active', angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
                };

                //ui->model
                element.bind('click', function () {
                    if (!element.hasClass('active')) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
                            ngModelCtrl.$render();
                        });
                    }
                });
            }
        };
    })
;
/* Filters */
angular.module('monFilters', [])
    .filter('checkmark',function () {
        return function (input) {
            return input ? '\u2713' : '\u2718';
        };
    })
    .filter('formatDate', ['$filter', function ($filter, format) {
        return function (input) {
            return $filter('date')(input, format || 'yyyy-MM-dd');
        };
    }])
    .filter('fixed', function(){
        return function(val, round){
            val = typeof val !== 'undefined' ? val : 0;
            var precision_number = Math.pow(10, round);
            return (Math.round(val * precision_number) / precision_number).toFixed(round);
        };
    })
    .filter('where', function(){
        return function(val, where){
            return _.filter(val, where);
        };
    })
    .filter('percent', function () {
        return function (input) {
            input = angular.isUndefined(input) ? 0: input;
            return parseFloat(input) + '%';
        };
    })
    .filter('formatRange', function() {
        return function(input, unit) {
            return input + unit;
        };
    })
;

/* Services */

angular.module('monServices', [])
    .factory('Accounts', ['$resource', 'monGridConfig', function($resource, monGridConfig){
        // console.log(monGridConfig);
        return $resource(monGridConfig.actionUrl, {}, {
            table: {method:'GET', params:{action:'table'}},
            compare: {method:'GET', params:{action:'compare'}},
            pips: {method:'GET', params:{action:'pips'}},
            pipTypes: {method:'GET', isArray: true, params:{action:'pip_types'}}
        });
    }])
    .factory('monLikes', ['$rootScope', 'storage', 'monGridConfig', function ($rootScope, storage, monGridConfig) {
        var object = {};
        object.getLikes = function() {
            return $rootScope.monLikes;
        };
        object.has = function(account) {
            return _.some($rootScope.monLikes, {id: parseInt(account)});
        };
        object.toggle = function(account, acc_type) {
            if(object.has(account)) {
                _.remove($rootScope.monLikes, {id: parseInt(account)});
            }
            else {
                $rootScope.monLikes.push({id: parseInt(account), acc_type: acc_type});
            }
        };
        object.clear = function() {
            $rootScope.monLikes = [];
        };
        storage.bind($rootScope, 'monLikes', {defaultValue: [] , storeName: monGridConfig.storageKey + '_likes'});

        return object;
    }])
    .factory('monSets', ['$rootScope', 'storage', 'monGridConfig', function ($rootScope, storage, monGridConfig) {
        var object = {};
        object.getAll = function() {
            return $rootScope.monSets;
        };
        object.get = function (name) {
            return  _.find($rootScope.monSets, {name: name});
        };
        object.add = function (name, sets) {
            var item = object.get(name);
            sets.name = name;
            if (_.isUndefined(item)) {
                $rootScope.monSets.push(sets);
            } else {
                _.merge(item, sets);
            }
        };
        object.remove = function (name) {
            _.remove($rootScope.monSets, {name: name});
        };
        object.clear = function() {
            $rootScope.monSets = [];
        };
        storage.bind($rootScope, 'monSets', {defaultValue: [] , storeName: monGridConfig.storageKey + '_sets'});

        return object;
    }])
;

angular.module('i18N', [])
    .provider('$lang', function() {
        var dictionary = {};
        return {
            load: function (newVal) {
                dictionary = newVal;
            },
            $get: function () {
                function translate(prop) {
                    var data     = _.cloneDeep(dictionary) || {},
                        keys     = prop.split('.'),
                        ret      = keys.join('.');

                    var i = 1;
                    _.each(keys, function(key){
                        if(_.isObject(data[key]) && (i !== keys.length)) {
                            data = data[key];
                        } else {
                            ret = data[key] || ret;
                        }
                        i++;
                    });
                    return ret ? ret: prop;
                };
                return {
                    __: translate
                };
            }
        };
    })
    .filter('t', ['$lang', function($lang) {
        return function(input) {
            return $lang.__(input);
        }
    }])
    .directive('i18nText', ['$filter', function($filter) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var key = attrs.i18nText;
                element.text($filter('t')(key));
            }
        };
    }])
;
