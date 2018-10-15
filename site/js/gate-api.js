function GateAPI() {
    this.token = '';
    this.endpoint = 'https://api.carelenlindie.com/maakoop/open-requests';
}

GateAPI.prototype.SetToken = function (token) {
    this.token = token;
    console.log("Set token to "+this.token);
    console.log(this);
};

GateAPI.prototype.OpenGate = function (gateID) {
    console.log(this);
    console.log(this.token);
    if (this.token == '') {
        throw 'token is not set';
    }
    console.log('time for the API call!');
    console.log('Opening '+gateID);
    let d = {gate_id: gateID};
    $.ajax({
        url: this.endpoint,
        type: 'post',
        data: JSON.stringify(d),
        headers: {
            'Authorization': this.token
        },
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            console.log(data);
        },
        error: function (data){
            console.log(data);
        }
    });
}