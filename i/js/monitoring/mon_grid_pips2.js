(function (window, document, undefined) {
    'use strict';

    const noCondition = () => true;
    const inRange = (value, min, max) => {
        return value >= min && value <= max;
    }
    const numberFilter = (filter, value) => {
        if (filter === null || filter === '') {
            return true;
        }
        if (filter.includes('-')) {
            const [min, max] = filter.split('-');
            return inRange(Number(value), Number(min), Number(max));
        } else if (filter.includes('>')) {
            return Number(value) > Number(filter.replace('>', ''));
        } else if (filter.includes('<')) {
            return Number(value) < Number(filter.replace('<', ''));
        } else {
            return Number(filter) === Number(value);
        }
    };

    const stringFilter = (filter, value) => {
        return String(value).toLowerCase().includes(filter.toLowerCase());
    };

    const baseFilters = {
        days: (filter, { mon_start_date }) => {
            const days =
                ((((Date.now() / 1000) | 0) - mon_start_date) / 86400) |
                0;
            return days >= Number(filter);
        },
        leverage: noCondition,
        risk: (filter, { risk }) => {
            if (Array.isArray(filter)) {
                return filter.includes(risk.toString());
            }
            return filter === risk.toString();
        },
        balance: (filter, { balance }) => numberFilter(filter, balance),
        grows_profit: (filter, { grows_profit }) =>
            numberFilter(filter, grows_profit),
        day_profit: (filter, { day_profit }) =>
            numberFilter(filter, day_profit),
        month3_profit: (filter, { month3_profit }) =>
            numberFilter(filter, month3_profit),
        month6_profit: (filter, { month6_profit }) =>
            numberFilter(filter, month6_profit),
        month9_profit: (filter, { month9_profit }) =>
            numberFilter(filter, month9_profit),
        month_profit: (filter, { month_profit }) =>
            numberFilter(filter, month_profit),
        week_profit: (filter, { week_profit }) =>
            numberFilter(filter, week_profit),
        account: (filter, { account_id, project_name, type }) => {
            return (
                stringFilter(filter, account_id) ||
                stringFilter(filter, project_name) ||
                stringFilter(filter, type.type)
            );
        },
        category: (filter, { type }) => {
            if (Array.isArray(filter)) {
                return filter.includes(type.type);
            }
            return filter === type.type;
        },
    };

    const CURRENCY_LIST = {
        US: { currency: 'USD' },
        EU: { currency: 'EUR' },
        RU: { currency: 'RUB' },
        UC: { currency: 'USD', isCent: true },
        EC: { currency: 'EUR', isCent: true },
    };

    function pipsFilter(
        pips,
        queryFilter,
        filters = baseFilters
    ) {
        return pips.filter((account) => {
            const testKeys = Object.keys(queryFilter);
            return testKeys.every((key) => {
                const test = filters[key](queryFilter[key], account);
                return test
            });
        });
    }


    angular
        .module("accounts.grid")
        .factory('Pips', ['$resource', 'monGridConfig', function($resource, monGridConfig){
            return $resource(monGridConfig.actionUrl, {}, {
                list: {method:'GET', params:{action:'pips'}},
                types: {method:'GET', isArray: true, params:{action:'pip_types'}}
            });
        }])
        .filter('pagination', function ($filter) {
            return function (input, currentPage, limit) {
                var page = currentPage > 0 ? currentPage - 1 : 0;
                if (input && angular.isArray(input)) {
                    return $filter('limitTo')(input.slice(page * limit), limit);
                }
            }
        })
        .filter('currency', function () {
            return function (input, currency) {
                const money = CURRENCY_LIST[currency || 'US'] || CURRENCY_LIST.US;
                const _value = money.isCent ? input / 100 : input;
                return new Intl.NumberFormat('en', {
                    style: 'currency',
                    currency: money.currency,
                    minimumFractionDigits: 2,
                    useGrouping: false,
                    currencySign: 'standard',
                }).format(_value)
            }
        })
        .filter('percentFormat', function () {
            return function (input) {
                return new Intl.NumberFormat('en', {
                    style: 'percent',
                    minimumFractionDigits: 2,
                    useGrouping: false,
                }).format(input)
            }
        })
        .factory("PipsService", function (Pips, $state, $rootScope, $log) {
            const types = {
                items: [],
                loading: false,
                current: ''
            };

            const grid = {
                pips: [],
                rows: [],
                total: 0,
                loading: false,
            };

            const params = {
                sortname: 'grows_profit',
                sortorder: 'desc',
                page: 1,
                rp: 25,
                include_image_equity_preview: true,
                acc_type: "pips",
            };

            const filters = {};

            const profitFilter = {
                name: 'grows_profit',
                value: null,
            };

            function getFilters() {
                var profit = _.zipObject([profitFilter.name], [profitFilter.value]);
                var category = $state.params.type ? _.zipObject(['category'], [$state.params.type]) : {}
                return _.merge({}, profit, filters, category);
            }

            function gotoCategoryType(type) {
                $state.go('cases.type', { type });
            }

            function makeData() {
                const queryFilter = getFilters();
                grid.rows = _.orderBy(pipsFilter(grid.pips, queryFilter), [params.sortname], [params.sortorder])
            }

            function fetchPips() {
                if (grid.loading) {
                    return;
                }
                grid.loading = true;
                Pips.list({}, function(result) {
                    grid.loading = false;
                    grid.total = result.total;
                    grid.pips = result.rows;
                    makeData();
                }, function() {
                    grid.loading = false;
                    grid.total = 0;
                });
            }
            function fetchPipTypes() {
                types.loading = true;
                Pips.types({}, function (data) {
                    // types.items = data.map(function (item) {
                    //     if (item.id === 1) {
                    //         return {
                    //             value: '',
                    //             label: 'All'
                    //         }
                    //     }
                    //     return {
                    //         value: item.type,
                    //         label: item.type
                    //     };
                    // });
                    types.items = data;
                    types.loading = false;
                }, function () {
                    types.loading = false;
                });
            }

            function reset() {
                params.sortorder = "desc";
                params.sortname = 'grows_profit';
                params.page = 1;
                profitFilter.value = null;
                profitFilter.name = "grows_profit";
                angular.copy({}, filters);
                makeData();
            }

            function changeOrder(name) {
                if (params.sortname === name) {
                    params.sortorder = params.sortorder === "desc" ? "asc" : "desc";
                } else {
                    params.sortname = name;
                }
                makeData();
            }

            function onChangeType() {
                gotoCategoryType(types.current);
            }

            $rootScope.$watch(function () {
                return $state.params.type;
            }, function (newValue) {
                types.current = newValue;
                params.page = 1;
                $log.info("State params have been updated", $state.params.type);
                makeData();
            }, true);

            return {
                grid,
                types,
                filters,
                params: params,
                profitFilter,
                reset,
                fetchPips,
                changeOrder,
                makeData,
                gotoCategoryType,
                fetchPipTypes,
                onChangeType
            };
        })
        .component("pipsMonTableOrder", {
            templateUrl: "template/simple-mon-table-order.html",
            bindings: {
                name: "@",
            },
            controller: function (PipsService) {
                this.isOrder = function () {
                    return this.name === PipsService.params.sortname;
                };
                this.orderClass = function () {
                    return PipsService.params.sortorder === "desc"
                        ? "fa-chevron-down"
                        : "fa-chevron-up";
                };
            },
        })
        .component("casesMonTable", {
            templateUrl: "template/pips-mon-table.html",
            bindings: {},
            controller: function casesMonTableCtrl(
                PipsService,
                monGridInit,
                $filter,
                $timeout,
                $state,
                $scope,
                $log
            ) {
                var $ctrl = this;

                $ctrl.changeOrder = function (name) {
                    PipsService.changeOrder(name);
                };

                $ctrl.onChangePager = function () {
                    $timeout(PipsService.makeData);
                };

                $ctrl.onChangeRp = function () {
                    $timeout(PipsService.makeData);
                };

                $ctrl.isEmptyData = function () {
                    return (
                        !PipsService.grid.loading && PipsService.grid.rows.length === 0
                    );
                };

                $ctrl.$onInit = function () {
                    $ctrl.profitColumns = $filter('where')(monGridInit.columns, {
                        group: 'profit',
                    });
                    $ctrl.filters = monGridInit.filters;
                    $ctrl.columnsInfo = monGridInit.columnsInfo;
                    $ctrl.isEU = monGridInit.isEU;
                    $ctrl.service = PipsService;
                    $ctrl.types = PipsService.types;
                    PipsService.fetchPips();
                    PipsService.fetchPipTypes();
                };
            },
        });
})(window, document);
