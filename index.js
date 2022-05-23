const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
	res.send('Welcome to Manufacturer Website Server')
})
app.listen(port, () => {
	console.log('Listening to port', port)
})
