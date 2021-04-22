var express = require('express');
var router = express.Router();
var fs = require('fs');

var mainHeader = 'Campus Halo Night | '

// main map route.
router.get('/', async function(req, res, next) {
  // vv variables get and read information of locations stored in .json file.
  var rawdata = fs.readFileSync('./public/data/data.json');
  var info = JSON.parse(rawdata);
  // vv sorts locations by name
  info.sort(function(a, b){
    if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
  });
  // vv renders page.
  res.render('index', {
    info: info
  })
});

module.exports = router;
