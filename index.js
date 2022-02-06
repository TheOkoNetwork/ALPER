//this enables us to require from child dir's
//By doing stuff like require('@models')
require('module-alias/register')

const express = require('express')
const app = express()
//app.use(express.json({ limit: '250mb' }))
const cors = require('cors')
app.use(cors({ origin: true, credentials: true }))
const serverTiming = require('server-timing');
app.use(serverTiming());

const pid = process.pid;
const port = process.env.PORT || 3000
const http = require('http');
const server = http.createServer(app);

const mongoose = require('mongoose');
const mongoHost = 'freesolvecluster.fdio4.mongodb.net'
const mongoUser = 'ALPER'
const mongoPassword = process.env.MONGO_PASSWORD
const mongoUrl = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoHost}/ALPER?retryWrites=true&w=majority`;

const dbConnect = async function () {
  console.log(`Connecting to mongoDB on host: ${mongoHost}`)
  await mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});
  console.log('Connected to MongoDB')
}

const initApp = async () => {
  try {
    await dbConnect()
  } catch (err) {
    console.log('Error connecting to mongoDB')
    console.log(err)
    process.exit(1)
  }

  server.listen(port, () => {
    console.log(`ALPER listening at http://0.0.0.0:${port}, PID: ${pid}`)
  });
}


app.use('/media', require("@routes/media"))

app.get('/', async (req, res) => {
  res.json({
    status: true,
    message: 'Welcome to ALPER',
    pid: pid
  })
})

initApp()
