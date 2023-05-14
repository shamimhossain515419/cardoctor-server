const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require("jsonwebtoken");
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());




// console.log( 'shamim',process.env.ACCESS_TOKEN_SECRET)



const uri = `mongodb+srv://${process.env.vite_USER}:${process.env.vite_PASSWORD}@cluster0.jt15atw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log( " shami kahn",authorization);
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
     if(err){
       return res.statue(404).send({error: true , massage:" unauthorization"});
     }
     req.decoded = decoded;
      next();

  });

 
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const CarDoctorCollection = client.db("CarDoctor").collection("Services");

    const bookingCollection = client.db("CardDoctor").collection("Booking")

    // jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log("kdfa", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log(token);
      res.send({ token });
    });




    app.get("/services", async (req, res) => {

      const cursor = CarDoctorCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, price: 1, img: 1 },
      };
      const result = await CarDoctorCollection.findOne(query, options);
      res.send(result);
    })


    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get('/booking', verifyJWT, async (req, res) => {
           
      const decoded = req.decoded;
      console.log('came back after verify', decoded)

      if(decoded.email !== req.query.email){
          return res.status(403).send({error: 1, message: 'forbidden access'})
      }

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    });

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })


    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatestatue = req.body;

      const updateBooking = {
        $set: {
          statue: updatestatue.statue
        },
      };
      const result = await bookingCollection.updateOne(filter, updateBooking);
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {

  res.send("Car Doctor use");

})

app.listen(port, () => {
  console.log(`Car Doctor Server is running on port ${port}`)
})