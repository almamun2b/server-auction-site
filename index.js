const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u222i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("auction-site");
        const productCollection = database.collection("products");
        const bidCollection = database.collection('bids');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');

        //GET products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        // GET Single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        });
        // GET bids
        app.get('/bids', async (req, res) => {
            const query = {};
            const cursor = bidCollection.find(query);
            const bids = await cursor.toArray();
            res.send(bids);
        });
        // GET Mybids
        app.get('/my-bids', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = bidCollection.find(query);
            const bids = await cursor.toArray();
            res.json(bids);
        });
        // GET isAdmin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        // POST products
        app.post('/products', async (req, res) => {
            const products = req.body;
            console.log(products);
            const result = await productCollection.insertOne(products);
            res.send(result);
        });
        // POST Add Orders
        app.post('/bids', async (req, res) => {
            const bid = req.body;
            console.log(bid);
            const result = await bidCollection.insertOne(bid);
            res.send(result);
        });
        // POST users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // UPDATE users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //UPDATE users Role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // DELETE product by id
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        });
        // DELETE orders by id
        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await bidCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server is Running");
});

app.listen(port, () => {
    console.log(`Server is Running at: http://localhost:${port}`);
});
