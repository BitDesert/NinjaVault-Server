module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
  
      // First application
      {
        name      : "NinjaVault Server",
        script    : "index.js",
        env: {
          APP_PORT: "9950",
          CALLBACK_PORT: "9960",
          NANO_NODE_URL: "http://[::1]:7076"
        }
      }
    ]
  
  }