var express = require('express');
var app = express();

//google api key stored in environment variable:
// 'export VAR_NAME="value"'
//GOOGLE_API_KEY

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: process.env.GOOGLE_API_KEY,
  cx: process.env.GOOGLE_CX
});

app.get('/:term', function (req, res) {
    var term = req.params.term;
    googleSearch.build({
        q: term,
        num: 10
    }, function(error, response) {
        var res_arr = Object.keys(response).map(function(k) { return response[k] });
        var json_data = {};
        
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

var server_port = process.env.YOUR_PORT || process.env.PORT || 8080;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, function() {
    console.log('Listening on port %d', server_port);
});
