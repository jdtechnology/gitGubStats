"use strict";
/**
  * A simple class for (currently) finding the number of lines a "username"
  * has added/deleted to github.com.
  *
  * Copyright 2018 (c) Jack Fisher
  *
  * Copyright notice to go here
  * and here
  * and here
  *
  * Author:
  * Jack Fisher <https://github.com/jdtechnology>
  */
(function () {
  window.StatsParser = window.StatsParser || {};
  window.Logger = window.Logger || {};
}());

Logger.debug = function(message) {
    if(StatsParser.options.db) console.log(message);
};

Logger.log = function(message) {
    console.log(message);
};

Logger.warn = function(message) {
    console.log("%c" + message, 'color: red; font-weight: bold');
};

Logger.info = function(message) {
    console.log("%c" + message, 'color: green');
};

StatsParser.options = {
    db: true //debug
};

StatsParser.global = {
  total_additions: 0,
  total_removals: 0,
  username: ""
};

StatsParser.async = {
  getData: function(apiUrl, callbackFunction) {
    console.log(apiUrl);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var userData = JSON.parse(this.responseText);
        Logger.debug(userData);
        callbackFunction(userData);
      }
    };
    xhttp.open("GET", apiUrl, true);
    xhttp.send();
  },
  begin: function(username) {
    StatsParser.global.username = username;
    StatsParser.global.total_additions = 0;
    StatsParser.global.total_removals = 0;
    StatsParser.async.getData("https://api.github.com/users/" + StatsParser.global.username + "/repos", StatsParser.callback.parseRepo);
  },
  getRepo: function(name) {
    StatsParser.async.getData("https://api.github.com/repos/" + StatsParser.global.username + "/" + name + "/stats/contributors", StatsParser.callback.countLines);
  },
  getSubscriptions: function() {
    StatsParser.async.getData("https://api.github.com/users/" + StatsParser.global.username + "/subscriptions", StatsParser.callback.parseSubscription);
  },
  getSubRepo: function(repoFName) {
    StatsParser.async.getData("https://api.github.com/repos/" + repoFName + "/stats/contributors", StatsParser.callback.countLines);
  },
};
StatsParser.callback = {
  parseRepo: function(repo) {
    for(var i in repo) {
      Logger.debug(repo[i].owner.login);
      StatsParser.async.getRepo(repo[i].name, StatsParser.global.username);
    }
  },
  parseSubscription: function(subData) {
    for(var i in subData) {
      StatsParser.async.getSubRepo(subData[i].full_name, StatsParser.global.username);
    }
  },
  countLines: function(rData) {
    for(var a in rData) {
      if(rData[a].author.login == StatsParser.global.username) {
        for(var i in rData[a].weeks) {
          StatsParser.global.total_additions += rData[a].weeks[i].a;
          StatsParser.global.total_removals += rData[a].weeks[i].d;
        }
      }
    }
    showResult();
  }
};

//Debugging purposes
function getResult() {
  var uname = document.getElementById("uname").value;
  StatsParser.async.begin(uname);
}
function showResult() {
  document.getElementById("res0").innerHTML = StatsParser.global.total_additions - StatsParser.global.total_removals;
}
