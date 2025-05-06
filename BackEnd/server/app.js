//app.js decides where each requests go: for now only have route.js 

const express = require('express') //load express lib to use for NodeJs

const cors = require('cors') //loads Cross Origin Resource Sharing to connect front and back that are running on different ports

const router = require('./routes/route')

const app = express()
const PORT = process.env.PORT || 3001; // cannot set to frontend port as port can only run one server

//app can now access cors and auto parse JSON files
app.use(cors)
app.use(express.json())

app.use('/generateRoute', router) //frontend use /generateRoute, will direct to router's generate

//Starts server on port and logs onto terminal
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  app.get('/ping', (req, res) => {
    res.send('pong');
  });
  