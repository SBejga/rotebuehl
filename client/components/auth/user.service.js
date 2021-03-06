'use strict';

angular.module('rotebuehlApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      createNewPassword: {
        method: "POST",
        params: {
          id: 'forgot'
        }
      }
	  });
  });
