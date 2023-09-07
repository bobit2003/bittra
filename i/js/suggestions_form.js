
angular.module('callApp', ['ngSanitize', 'vcRecaptcha'])

        .factory('mainData', function() {
            return new CallBackData();
        })

        .factory('suggestionsHandler', [
            '$http',
            'mainData',
            'suggestionsValidation',
            'vcRecaptchaService',
            function(http, mainData, validation, recaptcha) {
                var isAjax = false;

                function Handler() {
                    var success_message = '';

                    var self = this;

                    this.showLoader = function() {
                        return isAjax;
                    };

                    this.fireRequest = function(o) {
                        isAjax = true;
                        validation.clear();
                        angular.extend(o, {lng: mainData.lng});
                        http.post(mainData.handlerUrl, o)
                                .then(
                                        function(data) {
                                            var result = data.data;
                                            isAjax = false;
                                            if (result.status === 'success') {
                                                success_message = result.success_message;
                                            }
                                            else {
                                                success_message = '';
                                                grecaptcha.reset();
                                                validation.dirty = true;
                                                validation.errors = result.errors;
                                            }
                                        },
                                        function() {
                                        }
                                );
                    };

                    this.success_message = function()
                    {
                        return success_message;
                    };
                }


                return new Handler();
            }
        ])

        .factory('suggestionsValidation', [
            function() {
                var dummy = {};

                function Validation() {
                    var self = this;

                    this.dirty = false;
                    this.errors = {};

                    this.clear = function() {
                        self.dirty = false;
                        angular.copy(dummy, self.errors);
                    };

                    this.displayError = function(modelName) {
                        return self.dirty && self.errors.hasOwnProperty(modelName);
                    };

                    this.messageText = function(modelName) {
                        var messageText = '';
                        if (self.dirty && self.errors.hasOwnProperty(modelName)) {
                            messageText = self.errors[modelName];
                        }
                        return messageText;
                    };
                }

                return new Validation();
            }
        ])

        .controller('callFormCtrl', [
            '$scope',
            'suggestionsHandler',
            'suggestionsValidation',
            function($scope, handler, validation) {

                var dummy = {
                    name: '',
                    email: '',
                    title: '',
                    message: '',
                    recaptcha: {}
                };

                $scope.formData = {};

                var makeDummy = function() {
                    angular.copy(dummy, $scope.formData);
                    $scope.formData.recaptcha.response = '';
                };

                $scope.clearFields = function() {
                    validation.clear();
                    return makeDummy();
                };

                $scope.submit = function() {
                    return handler.fireRequest($scope.formData);
                };

                $scope.showLoader = function() {
                    return handler.showLoader();
                };

                $scope.showError = function(modelName) {
                    return validation.displayError(modelName);
                };

                $scope.errorMessage = function(modelName) {
                    return validation.messageText(modelName);
                };

                $scope.success_message = function() {
                    return handler.success_message();
                };

                makeDummy();
            }
        ]);