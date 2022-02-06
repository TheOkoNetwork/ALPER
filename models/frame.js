// (0) Requires
let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;

let frameSchema = new Schema({
    footage: {type: Schema.Types.ObjectId, ref: 'Frame'},
    frameNumber: {type: Number, required: true},
    frameTimestamp: {type: mongoose.Decimal128, required: true},
    filename: {type:String,required:true},
    uploadFilename: {type:String,required:true},
    uploaded: {type:Boolean,required:true}, 
});

module.exports = frameSchema;