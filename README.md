# NinjaVault Server

This is the backend for the node communication from [NinjaVault](https://github.com/BitDesert/NinjaVault).

## Installation

1. Copy the `ecosystem.config.default.js` file as `ecosystem.config.js`
2. Modify the environment values according to your setup
3. Serve the API endpoint (`APP_PORT`) via Nginx
4. Configure your node callback in the `config.json` to the `CALLBACK_PORT` e.g.:
```
        "callback_address": "127.0.0.1",
        "callback_port": "9960",
        "callback_target": "/api/new-block",
```