// validator
var validationApp = angular.module('validationApp', []);

// controller
validationApp.controller('mainController', function($scope) {

    // function to submit the form after all validation has occurred
    $scope.submitForm = function(isValid) {

        // als het valid is
        if (isValid) {
            alert('BAC Promillage '+ 1.10);
        }
    };

});
