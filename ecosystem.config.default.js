module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
  
      // First application
      {
        name      : "NanoVault Server",
        script    : "index.js",
        env: {
          APP_PORT: "9950",
          NANO_NODE_URL: "http://[::1]:7076"
        }
      },
      {
        name      : "NanoVault Server BETA",
        script    : "index.js",
        env : {
          APP_PORT: "9951",
          NANO_NODE_URL: "http://[::1]:55000"
        }
      }
    ]
  
  }