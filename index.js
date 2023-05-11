const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.XMART_USER}:${process.env.XMART_PASSWORD}@cluster0.qujfvjg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    client.connect();
    const productCollection = client.db('Products').collection('allProducts');
    // Get All The Products
    app.get('/allProducts', async (req, res) => {
      // console.log('query', req.query)
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = productCollection.find(query);
      let products;
      if(page || size){
        products = await cursor.skip(page*size).limit(size).toArray();
      }
      else{
        products = await cursor.toArray();
      }
      res.send(products);
    });
    // Get A Single Product By ID
    app.get('/allProducts/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    //Add A Single Product from Client Side using Form and ID
    app.post('/allProducts', async(req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    //Delete A Single Product from Client Side using ID
    app.delete('/allProducts/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })
    // PUT: Update A User
    app.put('/allProducts/:id', async(req, res) =>{
      const id = req.params.id;
      const updatedProduct = req.body;
      console.log(updatedProduct);
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          item_name: updatedProduct.itemName, //left side: -->attribute name in api/json file
          item_price: updatedProduct.itemRegularPrice,// right side -->variable name
          item_disc_price: updatedProduct.itemDiscountPrice,
          item_final_price: updatedProduct.itemFinalPrice,
          item_description: updatedProduct.itemDescription,
          item_img_url: updatedProduct.itemPhotoURL  
        }
      };
      const result = await productCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })
    //Count All The Products
    app.get('/allProductsCount', async(req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({count});
    })
  }
  catch (error) {
    console.error('Error: ', error);
  } 
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Running Xlusive Mart Server")
})

app.listen(port, () => {
  console.log("Listening to port: ", port);
})
