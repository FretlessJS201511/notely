angular.module('notely')
.directive('userLinks', () => {

  class UserLinksController {
    constructor(CurrentUser) {
      this.CurrentUser = CurrentUser;
    }

    user() {
      return this.CurrentUser.get();
    }

    signedIn() {
      return !!(this.user()._id);
    }
  }
  UserLinksController.$inject = ['CurrentUser'];

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
          <a href="#">Logout</a>
        </div>
      </div>
    `
  };

});
