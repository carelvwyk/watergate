function CognitoAPI() {
  // this.userPoolId = 'eu-west-1_UHO44LdrK';
  // this.userPoolClientId = '7r17mtpra51a483hp1i5o3vcte';
  //this.region = 'eu-west-1';
  var poolData = {
    UserPoolId: 'eu-west-1_UHO44LdrK',
    ClientId: '7r17mtpra51a483hp1i5o3vcte'
  };
  this.userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
}


CognitoAPI.prototype.SignIn = function(mobileNumber, pin, successCallback,
  failureCallback) {
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: mobileNumber,
    Password: pin
  });

  var userData = {
    Username : mobileNumber,
    Pool : this.userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      console.log("SignIn Success");
      console.log(result.getIdToken());
      console.log(result.session);
      let token = result.getIdToken().getJwtToken();
      successCallback(token);
    },
    onFailure: function(err) {
      console.log("error");
      console.log(err);
      failureCallback(err);
    },
    mfaRequired: function(codeDeliveryDetails) {
      console.log("mfa required");
      var verificationCode = prompt('SMS OTP', '');
      cognitoUser.sendMFACode(verificationCode, this);
    },
    newPasswordRequired: function(userAttributes, requiredAttributes) {
      console.log("new password required");
      var nn = '';
      while (nn.length == 0) {
        nn = prompt('Wat is jou naam?', 'Pieter Pompies');
      }
      var pin;
      while (!/^\d{6}$/.test(pin)) {
          pin = prompt('Kies \'n Nuwe 6 Nommer Pin' ,'');
      }
      // Get these details and call
      let attributesData = {nickname: nn};
      cognitoUser.completeNewPasswordChallenge(pin, attributesData, this);
    }
  });
}

CognitoAPI.prototype.SignOut = function() {
  this.userPool.getCurrentUser().signOut();
}