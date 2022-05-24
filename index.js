const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.85nxi.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
})

async function run() {
	try {
		await client.connect()
		console.log('Database connected')
		const productCollection = client.db('manufacturer').collection('products')
		const orderCollection = client.db('manufacturer').collection('orders')
		const userCollection = client.db('manufacturer').collection('users')

		app.get('/products', async (req, res) => {
			const query = {}
			const products = await productCollection.find(query).toArray()
			res.send(products)
		})

		app.get('/purchase/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: ObjectId(id) }
			const product = await productCollection.findOne(query)
			res.send(product)
		})
		app.post('/order', async (req, res) => {
			const order = req.body
			const result = await orderCollection.insertOne(order)
			res.send(result)
		})

		// creating token and adding usercollection
		app.put('/user/:email', async (req, res) => {
			const email = req.params.email
			const user = req.body
			const filter = { email: email }
			const options = { upsert: true }
			const updateDoc = {
				$set: user,
			}
			const result = await userCollection.updateOne(
				filter,
				updateDoc,
				options
			)

			const token = jwt.sign(
				{ email: email },
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: '1h' }
			)

			res.send({ result, token })
		})
	} finally {
	}
}

run().catch(console.dir)

app.get('/', (req, res) => {
	res.send('Welcome to Manufacturer Website Server')
})
app.listen(port, () => {
	console.log('Listening to port', port)
})
