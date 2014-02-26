var express = require('express');
var comment = require('./routes/comments');

var app = express();

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
app.post('/comments', comment.addComment);
app.put('/comments/:id', comment.updateComment);
app.delete('/comments/:id', comment.deleteComment);

app.listen(3000);
console.log('Listening on port 3000...');
