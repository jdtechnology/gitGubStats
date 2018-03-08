"use strict";
(function () {
  window.statsParser = window.statsParser || {};
}());

statsParser.global = {
  total_additions: 0,
  total_removals: 0,
  username: ""
};
//todo: collect code, and pass function as callback param
statsParser.async = {
  getData: function(apiUrl, callbackFunction) {
    console.log(apiUrl);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var userData = JSON.parse(this.responseText);
        console.log(userData);
        callbackFunction(userData);
      }
    };
    xhttp.open("GET", apiUrl, true);
    xhttp.send();
  },
  begin: function(username) {
    statsParser.global.username = username;
    statsParser.async.getData("https://api.github.com/users/" + statsParser.global.username + "/repos", statsParser.callback.parseRepo)
  },
  getRepo: function(name) {
    statsParser.async.getData("https://api.github.com/repos/" + statsParser.global.username + "/" + name + "/stats/contributors", statsParser.callback.countLines)
  },
  getSubscriptions: function() {
    statsParser.async.getData("https://api.github.com/users/" + statsParser.global.username + "/subscriptions", statsParser.callback.parseSubscription)
  },
  getSubRepo: function(repoFName) {
    statsParser.async.getData("https://api.github.com/repos/" + repoFName + "/stats/contributors", statsParser.callback.countLines)
  },

};
statsParser.callback = {
  parseRepo: function(repo) {
    for(var i in repo) {
      console.log(repo[i].owner.login);
      statsParser.async.getRepo(repo[i].name, statsParser.global.username);
    }
  },
  parseSubscription: function(subData) {
    for(var i in subData) {
      statsParser.async.getSubRepo(subData[i].full_name, statsParser.global.username);
    }
  },
  countLines: function(rData) {
    for(var a in rData) {
      if(rData[a].author.login == statsParser.global.username) {
        for(var i in rData[a].weeks) {
          statsParser.global.total_additions += rData[a].weeks[i].a;
          statsParser.global.total_removals += rData[a].weeks[i].d;
        }
      }
    }
    showResult();
  }
};

//Debugging purposes
function getResult() {
  var uname = document.getElementById("uname").value;
  statsParser.async.begin(uname);
}
function showResult() {
  document.getElementById("res0").innerHTML = statsParser.global.total_additions - statsParser.global.total_removals;
}
