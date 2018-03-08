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
  begin: function(username) {
    statsParser.global.username = username;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var userData = JSON.parse(this.responseText);
        //process();
        console.log(userData);
        statsParser.callback.parseRepo(userData);
			}
		};
		xhttp.open("GET", "https://api.github.com/users/" + statsParser.global.username + "/repos", true);
		xhttp.send();
  },
  getRepo: function(name) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
  			if (this.readyState == 4 && this.status == 200) {
  				var repoData = JSON.parse(this.responseText);
          console.log(repoData);
          statsParser.callback.countLines(repoData);
  			}
  		};
  		xhttp.open("GET", "https://api.github.com/repos/" + statsParser.global.username + "/" + name + "/stats/contributors", true);
  		xhttp.send();
  },
  getSubscriptions: function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var subData = JSON.parse(this.responseText);
        statsParser.callback.parseSubscription(subData);
      }
    };
    xhttp.open("GET", "https://api.github.com/users/" + statsParser.global.username + "/subscriptions");
    xhttp.send();
  },
  getSubRepo: function(repoFName) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var repData = JSON.parse(this.responseText);
        statsParser.callback.countLines(repData);
      }
    };
    xhttp.open("GET", "https://api.github.com/repos/" + repoFName + "/stats/contributors");
    xhttp.send();
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
