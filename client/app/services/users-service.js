angular.module('notely')
.service('UsersService', ['$http', 'API_BASE', 'AuthToken', ($http, API_BASE, AuthToken) => {

  class UsersService {
    create(user) {
      return $http.post(
        API_BASE + 'users', {
          user: user
        }
      )
      .then((response) => {
        AuthToken.set(response.data.auth_token);
        console.log(`Gotten: ${AuthToken.get()}`);
      });
    }
  }
  return new UsersService();

}]);
