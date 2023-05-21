const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
  app.use(cors(corsConfig))
  app.options("", cors(corsConfig))
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eo0io7y.mongodb.net/?retryWrites=true&w=majority`;

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
    
    
    const toyCollection = client.db('toyDB').collection('toys');
    
    // to get all my toys
    app.get('/myAllToys', async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result)
    })
    app.get('/myAllToys/:id' , async(req , res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}

      const option = {
        projection: { name: 1 , price: 1 , category: 1 , quantity: 1, seller: 1 , photo: 1 , email: 1 , rating: 1 , details: 1}
      }
      const result = await toyCollection.findOne(query , option)
      res.send(result)
    })

    app.get('/toys/:id' , async(req, res) =>{
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { seller: 1, price: 1, name: 1, photo: 1 },
      };
      const result = await toyCollection.findOne(query , options)
      res.send(result)
    })

    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy)
      res.send(result);
    })



    // to see all toys 
    app.get("/allToys/:text", async (req, res) => {
      console.log(req.params.text)
      if (req.params.text == "Horse" || req.params.text == "dinosaur" || req.params.text == 'teddy bear') {
        const result = await toyCollection.find({ category: req.params.text }).toArray();
        console.log(result)
        return res.send(result)
      }
      const result = await toyCollection.find({}).toArray();
      res.send(result)
    })


    app.get("/myToys/:email", async (req, res) => {
      const toys = await toyCollection
        .find({
          email: req.params.email,
        })
        .toArray();
        const sorted = toys.sort((a ,b) => a.price - b.price);
      res.send(sorted);
    });


    // for delete toys method
    app.delete('/myAllToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    app.put("/myAllToys/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: body.quantity,
          details: body.details,
          price: body.price,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    app.get("/getToyByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('simple toys is runnig')
})

app.listen(port, () => {
  console.log(`simple toy is runnnng on port ${port}`)
})