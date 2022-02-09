// (0) Requires
let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;

let plateSchema = new Schema({
    plate: {type:String,required:true},
    dvlaSearched: { type: Boolean, default: false },
});

module.exports = plateSchema;