javascript: (function () {
  var baseUrl = "http://localhost:3000";
  var scripts = [
    {url: baseUrl+'/static/jquery.1.8.3.min.js', useIf: (typeof jQuery == 'undefined')},
    {url: baseUrl+'/socket.io/socket.io.js', useIf: (typeof io == 'undefined')},
    {url: baseUrl+'/static/main.js', useIf: (true)}
  ];
  for(var i = 0; i < scripts.length; i++) {
    if (scripts[i].useIf) {
      var jsCode = document.createElement('script');
      jsCode.setAttribute('src', scripts[i].url);
      document.body.appendChild(jsCode);
    }
  }
}());
