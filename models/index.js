let model = require("mongoose").model;

let SchemaFootage = require("@models/footage.js");
let SchemaFrame = require("@models/frame.js");

module.exports = {
  Footage: model("footage", SchemaFootage),
  Frame: model("frame", SchemaFrame),

};