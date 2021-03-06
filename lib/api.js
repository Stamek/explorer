var bitcoin = require('bitcoin');
var express = require('express');

module.exports = function(){

  function express_app(){
    var app = express();

    app.get('*', hasAccess, function(req, res){
      var method = req.path.substring(1,req.path.length);

      if('undefined' != typeof requires_passphrase[method]){
        if(wallet_passphrase) client.walletPassphrase(wallet_passphrase, 10);
        else res.send('A wallet passphrase is needed and has not been set.');
      }

      var query_parameters = req.query;
      var params = [];

      for(var parameter in query_parameters){
        if(query_parameters.hasOwnProperty(parameter)){
          var param = query_parameters[parameter];
          if(!isNaN(param)){
            param = parseFloat(param);
          }
          params.push(param);
        }
      }

      var command = [];
      command = [{
        method: method,
        params: params
      }];

      client.cmd(command, function(err, response){
        if(err){console.log(err); res.send("There was an error. Check your console.");}
        else{
          if(typeof response === 'object'){
            res.send(response);
          }
          else{
            res.send(""+response);
          }
        }
      });
    });

    function hasAccess(req, res, next){
      if(accesslist.type == 'all'){
        return next();
      }

      var method = req.path.substring(1,req.path.length);
      if('undefined' == typeof accesslist[method]){
        if(accesslist.type == 'only') res.end('This method is restricted.');
        else return next();
      }
      else{
        if(accesslist[method] == true){
          return next();
        }
        else res.end('This method is restricted.');
      }
    }

    return app;
  };

  var accesslist = {};
  accesslist.type = 'all';
  var client = {};
  var wallet_passphrase = null;
  var requires_passphrase = {
    'dumpprivkey': true,
    'importprivkey': true,
    'keypoolrefill': true,
    'sendfrom': true,
    'sendmany': true,
    'sendtoaddress': true,
    'signmessage': true,
    'signrawtransaction': true
  };

  function setAccess(type, access_list){
    //Reset//
    accesslist = {};
    accesslist.type = type;

    if(type == "only"){
      var i=0;
      for(; i<access_list.length; i++){
        accesslist[access_list[i]] = true;
      }
    }

    if(type == "restrict"){
      var i=0;
      for(; i<access_list.length; i++){
        accesslist[access_list[i]] = false;
      }
    }

    //Default is for security reasons. Prevents accidental theft of coins/attack

    if(type == 'default-safe'){
      accesslist.type = 'restrict';
      var restrict_list = ['dumpprivkey', 'walletpassphrasechange'];
      var i=0;
      for(;i<restrict_list.length;i++){
        accesslist[restrict_list[i]] = false;
      }
    }
  };

  function setWalletDetails(details){
    if('undefined' == typeof details.rpc){
      client = new bitcoin.Client(details);
    }
    else{
      client = details;
    }
  };

  function setWalletPassphrase(passphrase){
    wallet_passphrase = passphrase;
  };

  return {
    app: express_app(),
    setAccess: setAccess,
    setWalletDetails: setWalletDetails,
    setWalletPassphrase: setWalletPassphrase
  }
}();
