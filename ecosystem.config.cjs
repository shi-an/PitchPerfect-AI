module.exports = {
  apps: [{
    name: "pitchperfect-api",
    script: "./server/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 4000,
      MONGO_URI: "mongodb://localhost:27017/pitchperfect"
    }
  }]
}
