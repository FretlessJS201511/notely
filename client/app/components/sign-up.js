angular.module('notely')
.directive('signUp', () => {

  class SignUpController {
    constructor() {
      this.user = {};
    }
    submit() {
      console.log(this.user);
    }
  }

  return {
    scope: {},
    controller: SignUpController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-up.html'
  };
});
