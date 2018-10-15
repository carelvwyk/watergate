$(function() {
  var gateAPI = new GateAPI();
  var cognitoAPI = new CognitoAPI();

  var mobileNumInput = $('#input-mobilenum');
  var pinInput = $('#input-pin');

  mobileNumInput.val(localStorage.getItem('mobileNumber'));
  pinInput.val(localStorage.getItem('pin'));

  // Signin input Validation:
  pinInput.change(function() {
    // Test for 6 digits (pin)
    if (!/^\d{6}$/.test($(this).val())) {
      $(this).val('');
      return;
    }
    localStorage.setItem('pin', $(this).val());
  });
  mobileNumInput.change(function() {
    var m = $(this).val();
    if (!/^\+?\d{10,11}$/.test(m)) { // Test for 10 digits or 11 starting with a + (mobile number)
      $(this).val('');
      return;
    }
    if (m.startsWith('0')) {
      m = '+27'+m.substring(1);
      $(this).val(m);
    }
    localStorage.setItem('mobileNumber', $(this).val());
  });

  // Signin button:
  function successCallback(token) {
    gateAPI.SetToken(token);
    $('#open-buttons').show('fade');
  }
  function errorCallback(err) {
    $('#open-buttons').hide('fade');
    alert('Daar was \'n probleem!\n"'+err.message+'"');
    $('#login').show('fade');
  };

  $('#btn-signin').click(function() {
    console.log("Clicked");
    $('#login').hide('fade');
    cognitoAPI.SignIn(mobileNumInput.val(), pinInput.val(), successCallback, 
      errorCallback);    
  });

  // Gate buttons
  $('#btn-insidegate').click(function() {
    console.log(gateAPI);
    gateAPI.OpenGate("CAREL");
    //gateAPI.OpenGate('INSIDEGATE');
  });
  $('#btn-outsidegate').click(function() {
    gateAPI.OpenGate("CAREL");
    console.log(gateAPI);
    //gateAPI.OpenGate('INSIDEGATE');
  });

});