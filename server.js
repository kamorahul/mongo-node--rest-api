const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID


var db

MongoClient.connect('mongodb://127.0.0.1:27017/category', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000')
  })
})

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.post('/project/settings/list', (req, res) => {
  console.log(req.body)
  db.collection('category').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.json({project_id : req.body.project_id,category : {total_count : result.length,category : result}});
  })
})

app.get('/project/settings/get', (req, res) => {

  console.log(req.params);
  console.log(req.param.category_id);
    console.log(req.query.category_id);
    db.collection('category').find({category_id : req.query.category_id}).toArray((err, result) => {
    if (err) return console.log(err)
      console.log(JSON.stringify(result));
    res.json({project_id : req.query.project_id,category : result[0]});
  })

})

app.post('/project/settings/set', (req, res) => {
  var category_id  = (new ObjectID()).toString();
  var category = req.body.category;
var categoryId = new ObjectID().toString();
if(req.body.operation == "add"  || req.body.operation=="edit"){
    for(var i=0;i<category.length;i++) {
      var data = category[i];

      data.category_id = category_id

      db.collection('category').save(data, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')

      })
    }
  }else{


    for(var i=0;i<category.length;i++){
      var data = category[i];
      db.collection('category')
          .findOneAndUpdate({category_name: data.category_name}, {
            $set: {
              category_name: data.category_name,
              category_detail: data.category_detail,
            }
          }, {
            sort: {_id: -1},
            upsert: true
          }, (err, result) => {
            if (err) return res.send(err)
            res.send(result)
          })
    }
    }
  res.json({status : true,category_id : category_id})


})
