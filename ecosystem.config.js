module.exports = {
    apps : [{
      name   : "ALPER",
      script : "./index.js",
      instances : "1",
      exec_mode : "fork",
      env: {
        NODE_ENV: "development",
        PORT: 1307
      },
      env_test: {
        NODE_ENV: "test",
      },
      env_staging: {
        NODE_ENV: "staging",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }