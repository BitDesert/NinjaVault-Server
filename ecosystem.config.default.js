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
          NANO_NODE_URL: "http://[::1]:7076",
          DPOW_USER: "myuser",
          DPOW_KEY: "mysuperlongdpowkey",
          MATOMO_URL: "https://piwik.org/piwik.php",
          MATOMO_TOKEN: "yourtoken",
          MATOMO_SITE: "1"
        }
      }
    ]
  
  }