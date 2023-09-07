/* App accounts.compare */

(function(window, document, undefined) {
    'use strict';

angular.module('accounts.compare', ['ui.router'])
    .factory('compareConfig', ['monGridInit', function (monGridInit) {
        var cFields = [
            'balance', 'equity', 'count_deals_market', 'count_total_deals',
            'day_profit', 'week_profit', 'month_profit', 'month3_profit',
            'month6_profit', 'month9_profit', 'grows_profit', 'delta_day_balance',
            'delta_day_equity', 'delta_start_balance', 'delta_start_equity', 'subscribers_count', 'investors_count', 'mon_start_date',
            'pamm_min_inv_sum', 'pamm_commission_share', 'pamm_min_inv_time', 'pamm_penalty_percent',
            'fc_price_per_trade', 'fc_price_per_lot', 'fc_percent_of_profits', 'fc_price_per_day', 'fc_per_any_lot', 'fc_spread_commission'
        ];

        var pammFields = [
            'investors_count',
            'pamm_min_inv_sum',
            'pamm_commission_share',
            'pamm_min_inv_time',
            'pamm_penalty_percent'
        ];

        if(monGridInit.isEU) {
            cFields = cFields.filter(function (name) {
                return pammFields.indexOf(name) === -1;
            });
        }

        return {
            maxAccounts: 12,
            cFields: cFields
        }

    }])
    .config([
        '$stateProvider',
        function($stateProvider) {
            $stateProvider
                .state('compare', {
                    url: "/compare/:accounts",
                    templateUrl: "template/compare.html",
                    controller: 'compareCtrl'
                });
        }
    ])
    .factory('compareAccounts', [
        'compareConfig',
        'Accounts',
        '$location',
        '$state',
        function (compareConfig, Accounts, $location, $state){
            var object = {};
            object.loading   = false;
            object.accounts  = [];
            object.profiles  = [];
            function getData (accounts) {
                if(_.isEmpty(accounts)) return false;
                var params = {
                    'accounts[]': _.uniq(accounts)
                };
                object.loading = true;
                Accounts.compare(params, function(response){
                    object.profiles  = response.result;
                    object.loading   = false;
                    object.accounts  = _.pluck(object.profiles, 'account_id');
                });
            }
            object.clearProfiles = function() {
                object.profiles = [];
            };
            object.toggleAccount = function(account){
                var account = parseInt(account),
                    index = _.indexOf(object.accounts, account);
                if(index === -1) {
                    if(object.accounts.length < compareConfig.maxAccounts) {
                        object.accounts.push(account);
                    }
                } else {
                    object.accounts.splice(index, 1);
                }
            };

            object.isCompare = function(account) {
                return _.indexOf(object.accounts, account) !== -1;
            };
            object.getCompare = function(accounts) {
                if(!_.isEmpty(accounts)) {
                    if(_.isString(accounts)) {
                        accounts = accounts.split(',')
                    }
                    if(_.isArray(accounts)) {
                        _.map(accounts, function(val){
                            return parseInt(val);
                        });
                    }
                    getData(accounts.slice(0, compareConfig.maxAccounts));
                } else {
                    object.profiles = [];
                    object.accounts  = [];
                }
            };
            object.getCompareUrl = function(account_id) {
                var accounts = _.cloneDeep(object.accounts);
                if(account_id) {
                    _.remove(accounts, function(value) {
                        return value === account_id;
                    });
                }
                return $state.href('compare', {accounts: accounts.join(',')});
            };
            object.getParam = function() {
                return object.accounts.join(',');
            };
            object.go = function() {
                $state.go('compare', {accounts: object.accounts.join(',')});
            };

            return object;
        }
    ])
    .factory('compareFields', ['compareConfig', '$filter',
        function (compareConfig, $filter){
            var object = {};
            object.fields  = [];
            function addField(key){
                var field = {};
                field.name = key;
                field.info = $filter('t')(key);
                object.fields.push(field);
            }
            angular.forEach(compareConfig.cFields, function(key){
                addField(key);
            });
            return object;
        }
    ])
    .controller('compareCtrl', [
        '$scope',
        'compareFields',
        'compareAccounts',
        '$state',
        function($scope, compareFields, compareAccounts, $state){
            $scope.compareFields   = compareFields;
            $scope.compareAccounts = compareAccounts;
            compareAccounts.getCompare($state.params.accounts);
        }
    ])
    .controller('compareAddAccount', [
        '$scope',
        'compareConfig',
        'compareAccounts',
        '$modal',
        '$document',
        'Accounts',
        'monGridInit',
        function($scope, compareConfig, compareAccounts, $modal, $document, Accounts, monGridInit){
            $scope.maxAccounts = compareConfig.maxAccounts;
            $scope.loading = false;
            $scope.rows = [];
            $scope.total = 0;
            $scope.accounts = angular.copy(compareAccounts.accounts);
            $scope.profit = {from: 0, to: 10000, min: 0, max: 10000, step: 1};
            $scope.age = {from: 0, to: 0, min: 0, max: 1800, step: 1};
            $scope.params = {
                page: 1,
                acc_type: monGridInit.isEU ? 'fc' : 'all',
                rp: 20,
                grows_profit: null,
                mon_start_date: null,
                sortname: 'grows_profit',
                sortorder: 'desc'
            };
            $scope.monGridInit = monGridInit;
            $scope.pages = function(){
                return Math.ceil($scope.total / $scope.params.rp)
            };
            function getFilter(obj, glue) {
                var filter;
                if(angular.equals(obj.from, obj.to)) {
                    filter = glue + obj.from;
                }else {
                    filter = [obj.from, '-', obj.to].join('');
                }
                return filter;
            }

            function toggleAccount(account) {
                var account = parseInt(account),
                    index = _.indexOf($scope.accounts, account);

                if(index === -1) {
                    if($scope.accounts.length < $scope.maxAccounts) {
                        $scope.accounts.push(account);
                    }
                }
                else {
                    $scope.accounts.splice(index, 1);
                }
            }
            function isCompare(account) {
                return _.indexOf($scope.accounts, account) !== -1;
            }

            $scope.setOrder = function(sortname) {
                if($scope.loading) return;
                var sortorder = 'desc';
                if(sortname === $scope.params.sortname) {
                    sortorder =  $scope.params.sortorder === 'desc' ? 'asc' : 'desc';
                }
                $scope.params.sortorder = sortorder;
                $scope.params.sortname  = sortname;
                $scope.search();
            };

            $scope.pageNext = function() {
                if($scope.params.page < $scope.pages()) {
                    $scope.params.page++;
                    $scope.getData();
                }
            };
            $scope.pagePrev = function() {
                if($scope.params.page > 1) {
                    $scope.params.page--;
                    $scope.getData();
                }
            };
            $scope.hideNext = function() {
                return $scope.params.page === $scope.pages();
            };
            $scope.hidePrev = function() {
                return $scope.params.page === 1;
            };
            $scope.search = function() {
                $scope.params.page = 1;
                $scope.getData();
            };
            $scope.getData = function() {
                $scope.loading = true;
                Accounts.table($scope.params, function(response){
                    $scope.rows     = response.rows;
                    $scope.total    = response.total;
                    $scope.loading  = false;
                });
            };
            $scope.isSorted = function(sortname) {
                return sortname ===  $scope.params.sortname;
            };
            $scope.toggleAccount = function(){
                toggleAccount(this.row.account_id);
            };
            $scope.isCompare = function() {
                return isCompare(this.row.account_id);
            };
            $scope.removeAccount = function() {
                toggleAccount(this.account_id);
            };
            $scope.$watch('profit', function(value){
                var params = angular.copy(value);
                params.from = parseInt(params.from) / 100;
                params.to   = parseInt(params.to) / 100;
                $scope.params.grows_profit = getFilter(params, '>');
            },true);

            $scope.$watch('params.acc_type', function(){
                $scope.search();
            });

            $scope.$watch('age', function(value){
                var params = angular.copy(value);
                $scope.params.mon_start_date = parseInt(params.from);
            },true);

            $scope.add = function() {
                compareAccounts.accounts = $scope.accounts;
                $document.find('body').removeClass('modal-open');
                compareAccounts.go();
            };
            //$scope.search();
        }
    ])
    .directive('compareBlock', [
        'compareAccounts', 'compareFields', '$compile', '$templateCache',
        function(compareAccounts, compareFields, $compile, $templateCache) {
            var Object = {
                restrict: 'EA',
                replace: true,
                scope: {
                    fields: '=',
                    profiles: '=',
                    loading: '='
                },
                templateUrl: 'compare/body.html',
                compile: function compile(tElement, tAttrs) {
                    return function postLink(scope, iElement, iAttrs){
                        scope.emptyBlocks     = [];
                        scope.viewWidth       = 0;
                        scope.slideWidth      = 0;
                        scope.viewSlide       = 0;
                        scope.currentSlide    = 1;
                        scope.getSlideCss = function() {
                            return {
                                'min-width': scope.slideWidth,
                                'max-width': scope.slideWidth
                            };
                        };
                        scope.fullWidth = function() {
                            return scope.slideWidth * (scope.totalCount() + scope.emptyBlocks.length);
                        };
                        scope.leftPos = function() {
                            var left = 0;
                            if(!scope.hidePrev()) {
                                left = scope.slideWidth * (scope.currentSlide - 1);
                            }
                            return -left;
                        };
                        scope.hideNav = function() {
                            return scope.totalCount() <= scope.viewSlide;
                        };
                        scope.nextSlide = function() {
                            if(!scope.hideNext()){
                                scope.currentSlide++;
                            }
                        };
                        scope.prevSlide = function() {
                            if(!scope.hidePrev()){
                                scope.currentSlide--;
                            }
                        };
                        scope.hidePrev = function() {
                            return scope.currentSlide === 1 || scope.hideNav();
                        };
                        scope.hideNext = function() {
                            return (scope.currentSlide + scope.viewSlide - 1) === scope.totalCount() || scope.hideNav();
                        };
                        scope.totalCount = function() {
                            return compareAccounts.profiles.length;
                        };
                        scope.$on("TEST_BLOCK_SIZE", function(event, data){
                            scope.currentSlide  = 1;
                            scope.viewSlide     = data.count;
                            scope.slideWidth    = data.width;
                            scope.viewWidth     = data.width * data.count;
                        });

                        function countEmptyBlock() {
                            return scope.viewSlide - scope.totalCount();
                        }
                        scope.$watch(countEmptyBlock, function(newValue){
                            scope.emptyBlocks = _.range(newValue);
                        });
                    };
                }
            };
            return Object;
        }
    ])
    .directive('testBlockSize', ['$window','$timeout' , function($window, $timeout) {
        return {
            restrict: 'A',
            templateUrl: 'compare/test-count-slide.html',
            scope: {
                blockWidth: '=testBlockSize',
                minCount: '=minCount'
            },
            replace: true,
            link: function (scope, element, attrs, ctrl) {
                scope.blockWidth = scope.blockWidth || element.width();
                scope.minCount   = scope.minCount || 1;
                scope.testSlides = [];
                function getSize() {
                    var count = Math.floor(element.width()/scope.blockWidth);
                    if(count < scope.minCount) {
                        count = 1;
                    }
                    scope.testSlides  = [];
                    for (var i = 0; i < count; i++) {
                        scope.testSlides.push(i);
                    }
                    $timeout(function(){
                        var testElement = angular.element(element.children()[0]),
                            data = {count: count, width: testElement.width()};
                        scope.$emit('TEST_BLOCK_SIZE', data);
                    }, 100);

                }
                getSize();
                angular.element($window).on('resize', function(){
                    scope.$apply(getSize);
                });
            }
        };
    }])
    .directive('compareProfile', ['compareAccounts', 'monLikes', function(compareAccounts, monLikes) {
        return {
            restrict: 'A',
            templateUrl: 'compare/profile.html',
            link: function (scope, element, attrs) {
                scope.removeUrl = compareAccounts.getCompareUrl(scope.profile.account_id);
                scope.toggleLike = function(){
                    monLikes.toggle(scope.profile.account_id, scope.profile.account_type);
                };
                scope.likeClass = function(){
                    return monLikes.has(scope.profile.account_id) ? 'fa-heart' : 'fa-heart-o';
                }
            }
        };
    }])
    .directive('compareProfileEmpty', [function() {
        return {
            restrict: 'A',
            templateUrl: 'compare/profile-empty.html'
        };
    }])
    .directive('compareField', function() {
        return {
            restrict: 'A',
            link: function (scope, element) {
                function setHovered(value){
                    scope.field.hover = value;
                }
                element.on('mouseenter', function(){
                    scope.$apply(setHovered(true));
                });
                element.on('mouseleave', function(){
                    scope.$apply(setHovered(false));
                });

                scope.isWin = function() {
                    return _.indexOf(scope.$parent.profile.fields, scope.field.name) !== -1
                };

            }
        };
    })
;
})(window, document);