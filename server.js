var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;

//google api key stored in environment variable:
// 'export VAR_NAME="value"'
//GOOGLE_API_KEY 
//GOOGLE_CX 
//MONGOLAB_URI 

var mongo_url = process.env.MONGOLAB_URI;

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
    key: process.env.GOOGLE_API_KEY,
    cx: process.env.GOOGLE_CX
});

app.get('/search/:term', function (req, res) {
    var term = req.params.term;
    var offset = req.query.offset;
    if (offset == undefined){ offset = 10; }
    console.log(term + " " + offset);
    
    //connect to mongodb through mlab
    mongo.connect(mongo_url, function(err, db){
        if (err) throw err;
            
        var currentdate = new Date();
        var datetime = currentdate.getDay() + "/"+ (currentdate.getMonth()+1) 
            + "/" + currentdate.getFullYear() + " @ " 
            + currentdate.getHours() + ":" 
            + currentdate.getMinutes() + ":" + currentdate.getSeconds();
            
        var doc = { term: term, when: datetime }

        //add doc with search term and current timestamp
        var records = db.collection('record');
        records.insert(doc, function(err, data){
            if (err) throw err;
            console.log(JSON.stringify(doc));
        });
            
        db.close();
    });
    
    googleSearch.build({
        q: term,
        num: parseInt(offset),
    }, function(error, response) {
        var res_arr = Object.keys(response).map(function(k) { return response[k]; });
        var json_data = {};
        console.log(response);
        var i = 1;
        
        res_arr[5].forEach(function(entry){
            var title = "Search Result " + i;
            json_data[title] = {
                "url": entry["pagemap"]["cse_image"][0]["src"],
                "snippet": entry["snippet"],
                "thumbnail": entry["pagemap"]["cse_thumbnail"][0]["src"],
                "context": entry["link"]
            }
            i++;
        });
        
        console.log(json_data);
        res.send(json_data);
    });
});

//add get method for getting latest requests to app
app.get('/latest', function (req, res) {
    //connenct to db
    mongo.connect(mongo_url, function(err, db){
        if (err) throw err;
        console.log("connecting to database...");

        //find all records
        var records = db.collection('record');
        console.log("found records:");
        //find all records and add to data
        var all_records = records.find({},{"term":1, "when":1, "_id":0}).toArray(function(err, all_records){
            if (err) throw err;
            console.log(all_records);
            var recent_records = all_records.reverse().slice(0,10);
            res.send(recent_records);
            db.close();
        });
    });
});

app.get('/', function(req, res){
   res.send("add '/search/' with a term and an optional offset to the url above, such as '/search/flipper?offset=5'"); 
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 8080;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, function() {
    console.log('Listening on port %d', server_port);
});
