var app = angular.module('app', ['ngMaterial', 'ngCookies']);


//401 interceptor
app.service('authInterceptor', ['$q','$rootScope', function ($q,$rootScope) {
    var service = this;

    service.responseError = function (response) {
        if (response.status == 401) {
            console.log('I caught you!!!');
            $rootScope.$broadcast('auth-call');
        }
        return $q.reject(response);
    };
}]);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}]);
