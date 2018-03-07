"use strict";
(function () {
  window.statsParser = window.statsParser || {};
}());

statsParser.global = {
  total_additions: 0,
  total_removals: 0
};
//todo: collect code, and pass function as callback param
statsParser.async = {
  begin: function(username) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var userData = JSON.parse(this.responseText);
        //process();
        console.log(userData);
        statsParser.async.parseRepo(userData, username);
			}
		};
		xhttp.open("GET", "https://api.github.com/users/" + username + "/repos", true);
		xhttp.send();
  },
  parseRepo: function(repo, username) {
    for(var i in repo) {
      console.log(repo[i].owner.login);
      statsParser.async.getRepo(repo[i].name, username);
    }
  },
  getRepo: function(name, username) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
  			if (this.readyState == 4 && this.status == 200) {
  				var repoData = JSON.parse(this.responseText);
          console.log(repoData);
          statsParser.async.countLines(repoData, username);
  			}
  		};
  		xhttp.open("GET", "https://api.github.com/repos/" + username + "/" + name + "/stats/contributors", true);
  		xhttp.send();
  },
  countLines: function(rData, username) {
    for(var a in rData) {
      if(rData[a].author.login == username) {
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
