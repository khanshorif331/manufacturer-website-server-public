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
		const reviewCollection = client.db('manufacturer').collection('reviews')

		app.get('/products', async (req, res) => {
			const query = {}
			const products = await productCollection.find(query).toArray()
			res.send(products)
		})

		app.get('/myOrders', async (req, res) => {
			const email = req.query.email
			const query = { email }
			const result = await orderCollection.find(query).toArray()
			res.send(result)
		})

		// delete order
		app.delete('/myOrder/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: ObjectId(id) }
			const result = await orderCollection.deleteOne(query)
			res.send(result)
		})
		// delete user
		app.delete('/user/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: ObjectId(id) }
			const result = await userCollection.deleteOne(query)
			res.send(result)
		})

		// delete product
		app.delete('/product/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: ObjectId(id) }
			const result = await productCollection.deleteOne(query)
			res.send(result)
		})

		// all users
		app.get('/users', async (req, res) => {
			const query = {}
			const result = await userCollection.find(query).toArray()
			res.send(result)
		})

		// all reviews
		app.get('/reviews', async (req, res) => {
			const query = {}
			const result = await reviewCollection.find(query).toArray()
			res.send(result)
		})
		// post a review
		app.post('/review', async (req, res) => {
			const review = req.body
			const result = await reviewCollection.insertOne(review)
			res.send(result)
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

		// all orders for admin
		app.get('/orders', async (req, res) => {
			const result = await orderCollection.find().toArray()
			res.send(result)
		})

		// adding admin role
		app.put(
			'/user/admin/:email',
			// verifyJWT,
			// verifyAdmin,
			async (req, res) => {
				const email = req.params.email
				const filter = { email: email }
				const updateDoc = {
					$set: { role: 'admin' },
				}
				const result = await userCollection.updateOne(filter, updateDoc)
				res.send(result)
			}
		)

		// adding status
		app.put(
			'/order/shipped/:id',
			// verifyJWT,
			// verifyAdmin,
			async (req, res) => {
				const id = req.params.id
				const filter = { _id: ObjectId(id) }
				const updateDoc = {
					$set: { status: 'shipped' },
				}
				const result = await orderCollection.updateOne(filter, updateDoc)
				res.send(result)
			}
		)

		// creating token and adding usercollection
		app.put('/user/:email', async (req, res) => {
			const email = req.params.email
			const user = req.body
			console.log(email, user)
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
			console.log(`${process.env.ACCESS_TOKEN_SECRET}`)

			const token = jwt.sign(
				{ email: email },
				'c239c02477833f1aa393635e2eb65d74d6087de6caa66d399fa5b365e61e7fc0b8c380add7a76e40fe1faf66918a49231bd77ebafdb8b4b6622bc8561aca55e1',
				// `${process.env.ACCESS_TOKEN_SECRET}`,
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
