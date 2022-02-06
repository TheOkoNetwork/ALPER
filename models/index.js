let model = require("mongoose").model;

let SchemaFootage = require("@models/footage.js");

module.exports = {
  Footage: model("footage", SchemaFootage),
};