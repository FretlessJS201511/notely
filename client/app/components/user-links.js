angular.module('notely')
.directive('userLinks', () => {

  class UserLinksController {
    constructor(CurrentUser, AuthToken) {
      this.CurrentUser = CurrentUser;
      this.AuthToken = AuthToken;
    }

    user() {
      return this.CurrentUser.get();
    }

    signedIn() {
      return !!(this.user()._id);
    }

    logout() {
      this.CurrentUser.clear();
      this.AuthToken.clear();
    }
  }
  UserLinksController.$inject = ['CurrentUser', 'AuthToken'];

  return {
    scope: {},
    controller: UserLinksController,
    controllerAs: 'ctrl',
    bindToController: true,
    template: `
      <div class="user-links">
        <div ng-show="ctrl.signedIn()">
          Signed in as {{ ctrl.user().name }}
          |
          <a href="#" ng-click="ctrl.logout()">Logout</a>
        </div>
      </div>
    `
  };

});
