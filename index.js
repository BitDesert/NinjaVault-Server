require('dotenv').config(); // Load variables from .env into the environment

/** Configuration **/
const nanoNodeUrl = process.env.NANO_NODE_URL || `http://localhost:7076`; // Nano node RPC url
const listeningPort = process.env.APP_PORT || 9950; // Port this app will listen on

const express = require('express');
const request = require('request-promise-native');
const cors = require('cors');

// Set up the webserver
const app = express();
app.use(cors());
app.use(express.json());

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
  ];
  if (!req.body.action || allowedActions.indexOf(req.body.action) === -1) {
    return res.status(500).json({ error: `Action ${req.body.action} not allowed` });
  }

  // Send the request to the Nano node and return the response
  request({ method: 'post', uri: nanoNodeUrl, body: req.body, json: true })
    .then(async (proxyRes) => {
      res.json(proxyRes)
    })
    .catch(err => res.status(500).json(err.toString()));
});

app.listen(listeningPort, () => console.log(`App listening on port ${listeningPort}!`));
