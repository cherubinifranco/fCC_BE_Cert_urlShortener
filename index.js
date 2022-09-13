require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const urlParser = require('url');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

////////////////////////////////////////////////////////////////

// DB Configuration

mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true});
const Schema = mongoose.Schema;


const urlSchema = new Schema({
  original_url: String,
  short_url: Number
})
const Url = mongoose.model('Url', urlSchema);



////////////////////////////////////////////////////////////////



// Your first API endpoint

app.post('/api/shorturl', (req, res, next)=>{
  let givenUrl = req.body.url;

  dns.lookup(urlParser.parse(givenUrl).hostname, (err, address)=>{
    if(!address || err){
      res.json({error: "invalid url"});
    } else {
      next()
    }
  })


})

app.post('/api/shorturl', (req, res) => {
  let givenUrl = req.body.url;
  Url.findOne({original_url: givenUrl}, {_id: 0, original_url: 1, short_url: 1}, (err, data)=>{
    if(err) console.log(err);

    if(data){
      res.json(data);

    }else{
      Url.countDocuments({}, (err, count)=>{
        if(err) console.log(err);
        let newObj = {
          original_url: givenUrl,
          short_url: count+1
        }
        new Url(newObj).save()
        res.json(newObj);
      })
    }


  });
});

app.get('/api/shorturl/:id?', (req, res)=>{
const id = req.params.id;
Url.findOne({short_url : id}, (err, data)=>{
  if(err) console.log(data)
  if(data) {
    res.redirect(data.original_url)
  }else{
    res.json({error:"No short URL found for the given input"})
  }
})

});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
