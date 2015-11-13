angular.module('notely')
  .service('UsersService', [
    '$http', 'API_BASE', 'AuthToken', 'CurrentUser',
     ($http, API_BASE, AuthToken, CurrentUser) => {
    class UsersService {
      create(user) {
        let userPromise = $http.post(`${API_BASE}users`, {
          user: user
        });
        userPromise.then((response) => {
          AuthToken.set(response.data.auth_token);
          CurrentUser.set(response.data.user);
        });
        return userPromise;
      }

      login(user) {
        let loginPromise = $http.post(`${API_BASE}sessions`, {
          user: user
        });
        loginPromise.then((response) => {
          AuthToken.set(response.data.auth_token);
          CurrentUser.set(response.data.user);
        });
        return loginPromise;
      }
    }
    return new UsersService();

  }]);
