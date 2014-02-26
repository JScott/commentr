var express = require('express');
var comment = require('./routes/comments');
var fs = require('fs');

var app = express();/*.createServer({
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem')
});*/
var server = app.listen(3000);
var io = require('socket.io').listen(server);

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.get('/comments/:host/:path', comment.findByUrl);
app.get('/comments/:id', comment.findById);
//app.post('/comments', comment.addComment); moved to socket io call
app.put('/comments/:id', comment.updateComment);
app.delete('/comments/:id', comment.deleteComment);

express.static.mime.define({'application/x-font-woff': ['woff']});
app.use('/static', express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
  socket.on('comment', function (data) {
    comment.addComment(data);
    io.sockets.emit(data.host+data.path+'add', data);
  })
  socket.on('remove', function (data) {
    comment.removeElementComments(data);
    io.sockets.emit(data.host+data.path+'remove', data);
  })
});

console.log('Listening on port 3000...');
