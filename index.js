const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



console.log(process.env.vite_USER)



const uri = `mongodb+srv://${process.env.vite_USER}:${process.env.vite_PASSWORD}@cluster0.jt15atw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const CarDoctorCollection = client.db("CarDoctor").collection("Services");

    const bookingCollection = client.db("CardDoctor").collection("Booking")

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
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get('/booking', async (req, res) => {
      console.log(req.query.email);

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


   app.patch('/bookings/:id' , async (req,res)=>{
    const id=req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updatestatue=req.body;
    // console.log(updatestatue);  
    const updateBooking = {
      $set: {
        statue:updatestatue.statue
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