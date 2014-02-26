var mongo = require('mongodb');

var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('commentdb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'commentdb' database");
        db.collection('comments', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'comments' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving comment: ' + id);
    db.collection('comments', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findByUrl = function(req, res) {
    var host = req.params.host;
    var path = req.params.path;
    console.log("Getting comments for: "+host+path);
    db.collection('comments', function(err, collection) {
        // find() for all
        collection.find({'host':host, 'path':path}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addComment = function(req, res) {
    var c = req.body;
    var comment = {host:c.host, path:c.path, element:c.element, index:c.index, author:c.author, text:c.text};
    console.log('Adding comment: ' + JSON.stringify(comment));
    db.collection('comments', function(err, collection) {
        collection.insert(comment, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.redirect("http://"+c.host+c.path);
                //res.send(result[0]);
            }
        });
    });
}

exports.updateComment = function(req, res) {
    var id = req.params.id;
    var comment = req.body;
    console.log('Updating comment: ' + id);
    console.log(JSON.stringify(comment));
    db.collection('comments', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, comment, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating comment: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(comment);
            }
        });
    });
}

exports.deleteComment = function(req, res) {
    var id = req.params.id;
    console.log('Deleting comment: ' + id);
    db.collection('comments', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var comments = [
    {
        host: "api.jquery.com",
        path: "/category/effects/fading/",
        element: "html body #container #content-wrapper div #content #post-221 header.entry-header h1.entry-title",
        index: 0,
        author: "t875949",
        text: "I like this font."
    },
    {
        host: "api.jquery.com",
        path: "/category/effects/fading/",
        element: "html body #container #content-wrapper div #content #post-221 header.entry-header h1.entry-title",
        index: 0,
        author: "Anonymous",
        text: "Completely agree. Can we use that on Habitat?"
    },
    {
        host: "habitat.tsl.telus.com",
        path: "/telusEmployeePortal/appmanager/iep/front",
        element: "div#habitat-portal-darren_letter-excerpt-container",
        index: 0,
        author: "Anonymous",
        text: "Does anyone read this part?"
    },
    {
        host: "habitat.tsl.telus.com",
        path: "/telusEmployeePortal/appmanager/iep/front",
        element: "div#habitat-portal-darren_letter-excerpt-container",
        index: 0,
        author: "t875949",
        text: "Only 68% of our users."
    },
    {
        host: "habitat.tsl.telus.com",
        path: "/telusEmployeePortal/appmanager/iep/front",
        element: "div#habitat-portal-darren_letter-excerpt-container",
        index: 0,
        author: "t864114",
        text: "Hacking your site:<script>alert('Formatting C:/')</script>"
    }];

    db.collection('comments', function(err, collection) {
        collection.insert(comments, {safe:true}, function(err, result) {});
    });

};
