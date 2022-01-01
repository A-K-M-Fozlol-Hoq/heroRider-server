//external imports
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { MongoClient } = require("mongodb");

const port = process.env.PORT || 4000;

const app = express();
require("dotenv").config();

//database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nlclv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
const client = new MongoClient(uri, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000, 
  keepAlive: 1,
});
// const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
//middlewars
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
// app.use((req, res, next) => {
//   res.header({"Access-Control-Allow-Origin": "*"});
//   next();
// }) 
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

app.get("/", (req, res) => res.send("Hello World!"));

client.connect((err) => {
  const userCollection = client.db("heroRider").collection("usersData");
  const ordersCollection = client.db("heroRider").collection("ordersCollection");

  app.post("/addUser", (req, res) => {
    // fullName,email, age, address, phone, role, nid, profile,vehicleType
    const fullName = req.body.fullName;
    const email = req.body.email;
    const age = req.body.age;
    const address = req.body.address;
    const phone = req.body.phone;
    const role = req.body.role;
    const nid = req.body.nid;
    const profile = req.body.profile;
    const vehicleType = req.body.vehicleType;
    console.log(req.body);
    userCollection.find({ email: email }).toArray((err, users) => {
      userCollection
          .insertOne({ fullName,email, age: parseInt(age), address, phone, role, nid, profile,vehicleType })
          .then((result) => {
            // console.log(result);
            res.send(result.acknowledged);
          });
    });
  });

  app.post("/getFullUserByEmail", (req, res) => {
    const email = req.body.email;
    userCollection.find({ email: email }).toArray((err, user) => {
      if (user && user.length > 0) {
        res.send(user);
      } else {
        console.log(
          "user not found, server side error -getFullUserByEmail",
          user,
          email,
          err
        );
      }
    });
  });

  app.post("/addOrder", (req, res) => {
    // const order = req.body;
    const {fullName, email, age, address, phone, vehicleType, shipment, orderTime} = req.body;
  //   fullName: 'Fozlol',
  // email: 'metul6532@gmail.com',
  // age: '10',
  // address: 'q3raesf',
  // phone: '+88 01758600731',
  // role: 'learner',
  // nid: 'https://i.ibb.co/ySTbZ9B/14.png',
  // profile: 'https://i.ibb.co/2h5bLCz/1.png',
  // vehicleType: 'car',
  // paymentId: 'pm_1KD34KCsTKnXwRxWZ92WLNMc',
  // carType: 'bike',
  // shipment: {
  //   name: '3wrwr4wt',
  //   email: 'metul6532@gmail.com',
  //   address: 'q3wr4ewtr',
  //   phone: 'ertt'
  // },
  // orderTime: '2022-01-01T08:36:05.545Z'
    ordersCollection
      .insertOne({fullName, email, age, address, phone, vehicleType, shipment, orderTime})
      .then((result) => {
        res.send(result.insertedCount > 0);
      })
      .catch((err) => {
        console.log(err);
        console.log("DB Connection Error");
      });
  });

  app.post("/getUsersBySearch", (req, res) => {
    let {query, minAge, maxAge,pageNumber} = req.body;
    if(!minAge){
      minAge=0;
    }
    if(!maxAge){
      maxAge=1000;
    }
  var perPage = 10;
 
  // get records to skip
  var startFrom = (pageNumber ) * perPage;
  // get data from mongo DB using pagination
  userCollection.find({
    $or: [
      {
        fullName: {$regex:`.*${query}*`},
      },
      {
        phone: {$regex:`.*${query}*`},
      },
      {
        phone: {$regex:`.*${query}*`},
      },
      {
        email: {$regex:`.*${query}*`},
      },
    ],
    $and:[
      {
         age: { $gte: minAge }
      },
      {
        age: {$lte:maxAge},
      },
      // {age:{$gt:minAge,$lt:maxAge}}
    ]
  })
      .skip(startFrom)
      .limit(perPage)
      .toArray()
      .then((response) => {
        res.send(response);
      })
      .catch((err) => console.log(err));
    // userCollection
    //   .updateOne({ email: email }, { $set: { profile: profile } })
    //   .then((response) => {
    //     res.send(response);
    //   })
    //   .catch((err) => console.log(err));
  });

  app.post('/deleteSelectedUsers', async (req, res)=> {
    const {haveToDeleteUsersList} = req.body;
      // await userCollection.deleteMany(
      //   {
      //     _id: {$in: haveToDeleteUsersList},
      //   })
      // return res.send({success: true});
      await userCollection.deleteMany({
        email: {$in: haveToDeleteUsersList},
      })
      return res.send({success: true});
  });

  // (async () => {
  //   for (let i = 0; i < request.body.old.length; i++) {
  //     const newItem = request.body.new[i];
  //     const oldItem = request.body.old[i];
  //     await db.cb.update(oldItem, {$set: newItem });
  //   }
  // })()
  
  console.log("database connected successfully");
    // client.close();
});


app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
// app.listen(port, () =>
//   console.log(`Example app listening at http://localhost:${port}`)
// );
