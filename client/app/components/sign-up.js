angular.module('notely')
.directive('signUp', ['$state', 'Flash', 'UsersService', ($state, Flash, UsersService) => {

  class SignUpController {
    constructor() {
      this.user = {};
    }
    submit() {
      UsersService.create(this.user).then(function(response) {
        $state.go('notes.form', { noteId: undefined });
        Flash.create('success', response.data.message);
      }, function(response) {
        Flash.create('danger', response.data);
      });
    }
  }

  return {
    scope: {},
    controller: SignUpController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/components/sign-up.html'
  };
}]);
