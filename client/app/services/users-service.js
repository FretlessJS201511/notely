angular.module('notely')
  .service('UsersService', [
    '$http', 'API_BASE', 'AuthToken', ($http, API_BASE, AuthToken) => {

    class UsersService {
      create(user) {
        let userPromise = $http.post(`${API_BASE}users`, {
          user: user
        });
        userPromise.then((response) => {
          AuthToken.set(response.data.auth_token);
        });
        return userPromise;
      }
    }
    return new UsersService();

  }]);
