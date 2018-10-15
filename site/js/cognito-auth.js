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
      var verificationCode = prompt('SMS OTP', 'Jy behoort \'n SMS te ontvang');
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
          pin = prompt('Nuwe Pin' ,'Kies \'n nuwe 6 nommer pin kode');
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


// authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
//     var cognitoUser = userPool.getCurrentUser();

//     if (cognitoUser) {
//         cognitoUser.getSession(function sessionCallback(err, session) {
//             if (err) {
//                 reject(err);
//             } else if (!session.isValid()) {
//                 resolve(null);
//             } else {
//                 resolve(session.getIdToken().getJwtToken());
//             }
//         });
//     } else {
//         resolve(null);
//     }
// });



/*
    *  Event Handlers
    */
/*
$(function onDocReady() {
    var phoneNumber = localStorage.getItem("phoneNumber");
    if (phoneNumber != null) {
        $('#phoneInputSignin').val(phoneNumber);
    }
    $('#btn-signin').click(function() {
        handleSignin();
    });

    $('#btn-insidegate').click(function() {
        gateAPI.OpenGate('INSIDEGATE');
    });

    $('#btn-outsidegate').click(function() {
        gateAPI.OpenGate('OUTSIDEGATE');
    });
});

function handleSignin() {
    console.log(this);
    var phoneNumber = $('#phoneInputSignin').val();
    var password = $('#pinInputSignin').val();
    if (phoneNumber.startsWith("0")) { 
        phoneNumber = "+27" + phoneNumber.substr(1); 
    }        
    signin(phoneNumber, password);
}*/