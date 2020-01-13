/** Configuration **/
const nanoNodeUrl = process.env.NANO_NODE_URL || `http://localhost:7076`; // Nano node RPC url
const listeningPort = process.env.APP_PORT || 9950; // Port this app will listen on

const callbackPort = process.env.CALLBACK_PORT || 9960; // Port that the webserver will listen on (For receiving new blocks from Nano node)
const statTime = 10; // Seconds between reporting statistics to console (Connected clients, TPS)
/** End Configuration **/

// Statistics reporting?
let tpsCount = 0;

const express = require('express');
const request = require('request-promise-native');
const cors = require('cors');
const matomo = require('./matomo');

// Set up the public webserver
const app = express();
app.use(cors());
app.use(express.json());
app.enable('trust proxy')

if (process.env.MATOMO_URL) {
  console.log('Matomo Analytics activated');
  
  app.use(matomo({
    siteId: process.env.MATOMO_SITE,
    matomoUrl: process.env.MATOMO_URL,
    matomoToken: process.env.MATOMO_TOKEN
  }));
}

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/health-check', (req, res) => {
  res.sendStatus(200);
});

// Allow certain requests to the Nano RPC and cache work requests
app.post('/api/node-api', async (req, res) => {
  const allowedActions = [
    'account_history',
    'account_info',
    'accounts_frontiers',
    'accounts_balances',
    'accounts_pending',
    'block',
    'blocks',
    'block_count',
    'blocks_info',
    'delegators_count',
    'pending',
    'process',
    'representatives_online',
    'validate_account_number',
    'work_generate',
  ];
  if (!req.body.action || allowedActions.indexOf(req.body.action) === -1) {
    return res.status(500).json({ error: `Action ${req.body.action} not allowed` });
  }

  if (req.body.action == 'work_generate') {
    if(process.env.DPOW_USER && process.env.DPOW_KEY){
      console.log('Generating work for ' + req.body.hash + ' via DPoW');
    } else {
      console.log('DPoW is not set up, cancelling...');
      return res.status(500).json({ error: `Action ${req.body.action} not allowed` });
    }

    return request({
      method: 'post',
      uri: 'https://dpow.nanocenter.org/service/',
      json: true,
      body: {
        user: process.env.DPOW_USER,
        api_key: process.env.DPOW_KEY,
        hash: req.body.hash,
        timeout: 10,
      }
    })
      .then(async (dpowRes) => {
        res.json(dpowRes)
      })
      .catch(err => res.status(500).json(err.toString()));
  }

  // Send the request to the Nano node and return the response
  request({ method: 'post', uri: nanoNodeUrl, body: req.body, json: true })
    .then(async (proxyRes) => {
      res.json(proxyRes)
    })
    .catch(err => res.status(500).json(err.toString()));
});

io.on('connection', function (socket) {
  console.log(socket.id + " connected");

  socket.on('subscribe', account => {
    console.log(socket.id + " subscribed to " + account);

    socket.join(account);
  });
  socket.on('unsubscribe', account => {
    console.log(socket.id + " unsubscribed to " + account);

    socket.leave(account);
  });
});

server.listen(listeningPort, () => console.log(`App listening on port ${listeningPort}!`));

// Set up the callback webserver
const app_callback = express();
app_callback.use(express.json());

app_callback.post('/api/new-block', (req, res) => {
  res.sendStatus(200);
  tpsCount++;

  const fullBlock = req.body;
  try {
    fullBlock.block = JSON.parse(fullBlock.block);
    //saveHashTimestamp(fullBlock.hash);
  } catch (err) {
    return console.log(`Error parsing block data! `, err.message);
  }

  let destinations = [];

  if (fullBlock.block.type === 'state') {
    if (fullBlock.is_send === 'true' && fullBlock.block.link_as_account) {
      destinations.push(fullBlock.block.link_as_account);
    }
    destinations.push(fullBlock.account);
  } else {
    destinations.push(fullBlock.block.destination);
  }

  // Send it to all!
  destinations.forEach(destination => {
    console.log(`Sending block to subscriber ${destination}: `, fullBlock.amount);

    io.to(destination).emit('newTransaction', fullBlock);
  });
});

app_callback.listen(callbackPort, () => console.log(`Callback App listening on port ${callbackPort}!`));

function printStats() {
  const connectedClients = Object.keys(io.sockets.connected).length;
  const tps = tpsCount / statTime;
  console.log(`[Stats] Connected clients: ${connectedClients}; TPS Average: ${tps}`);
  tpsCount = 0;
}

setInterval(printStats, statTime * 1000); // Print stats every x seconds