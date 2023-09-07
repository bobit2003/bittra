(function(window, document, undefined) {
    'use strict';
    angular.module('accounts.grid')
        .factory('simpleMonTableData', function (Accounts, monGridInit) {
            var grid = {
                rows: [],
                total: 0,
                loading: false
            };
            var filters = {};
            var params = {
                acc_type: monGridInit.isEU ? 'fc' : monGridInit.params.acc_type,
                include_image_equity_preview: true,
                sortname: null,
                sortorder: 'desc',
                page: 1,
                rp: 50
            };

            var profitFilter = {
                name: 'grows_profit',
                value: '',
                reverse: false
            };

            function updateTable() {
                if(grid.loading) {
                    return;
                }
                grid.loading = true;
                var profit = _.zipObject([profitFilter.name], [profitFilter.value]);
                var requestParams = _.merge({}, params, filters, profit);
                if(!_.isEmpty(requestParams.account)) {
                    // requestParams.sortname =  'balance';
                    requestParams.acc_type = 'all';
                    requestParams.include_archive = false;
                }

                function success(result) {
                    grid.loading = false;
                    grid.total = result.total;
                    grid.rows = result.rows;
                }

                function error() {
                    grid.loading = false;
                    grid.total = 0;
                    angular.copy([],  grid.rows);
                }

                Accounts.table(requestParams, success, error);
            }

            function changeOrder(name) {
                if(params.sortname === name) {
                    params.sortorder = params.sortorder === 'desc' ? 'asc' : 'desc';
                } else {
                    params.sortname = name;
                }
                updateTable();
            }

            function reset() {
                params.sortorder = 'desc';
                params.sortname = null;
                params.page = 1;
                profitFilter.value = null;
                profitFilter.name = 'grows_profit';
                angular.copy({}, filters);
                updateTable();
            }

            return {
                grid: grid,
                filters: filters,
                params: params,
                profitFilter: profitFilter,
                reset: reset,
                updateTable: updateTable,
                changeOrder: changeOrder
            };

        })
        .component('simpleMonTableOrder', {
            templateUrl: 'template/simple-mon-table-order.html',
            bindings: {
                name: '@'
            },
            controller: simpleMonTableOrderCtrl
        })
        .component('simpleMonTable', {
            templateUrl: 'template/simple-mon-table.html',
            bindings: {},
            controller: simpleMonTableCtrl
        })
    ;

    function simpleMonTableOrderCtrl(simpleMonTableData) {

        this.isOrder = function () {
          return this.name === simpleMonTableData.params.sortname;
        };

        this.orderClass = function () {
          return simpleMonTableData.params.sortorder === 'desc' ? 'fa-chevron-down' : 'fa-chevron-up';
        };
    }

    function simpleMonTableCtrl(simpleMonTableData, monGridInit, $filter, $timeout) {
        var $ctrl = this;

        $ctrl.changeOrder = function (name) {
            simpleMonTableData.changeOrder(name);
        };

        $ctrl.onChangePager = function () {
            $timeout(simpleMonTableData.updateTable);
        };

        $ctrl.onChangeRp = function() {
            $timeout(simpleMonTableData.updateTable);
        };

        $ctrl.isEmptyData = function () {
            return !simpleMonTableData.grid.loading && simpleMonTableData.grid.total === 0;
        };

        $ctrl.$onInit = function() {
            $ctrl.profitColumns = $filter('where')(monGridInit.columns, {group: 'profit'});
            $ctrl.filters = monGridInit.filters;
            $ctrl.columnsInfo = monGridInit.columnsInfo;
            $ctrl.isEU = monGridInit.isEU;
            $ctrl.rpOptions = [5, 10, 15, 25, 50];
            $ctrl.service = simpleMonTableData;

            if($ctrl.service.grid.total === 0) {
                simpleMonTableData.updateTable();
            }
        };
    }

})(window, document);
