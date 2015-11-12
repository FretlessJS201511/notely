angular.module('notely')
.service('UsersService', ['$http', 'API_BASE', ($http, API_BASE) => {

  class UsersService {
    create(user) {
      return $http.post(
        API_BASE + 'users', {
          user: user
        }
      )
      .then((response) => {
        alert(response.data.message);
      });
    }
  }
  return new UsersService();

}]);
