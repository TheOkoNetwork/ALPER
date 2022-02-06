// (0) Requires
let Schema = require("mongoose").Schema;

let footageSchema = new Schema({
    filename: {type:String,required:true},
    uploadFilename: {type:String,required:true},
    uploaded: {type:Boolean,required:true},
    framesSplit: {type:Boolean,default: false}, 
});

module.exports = footageSchema;