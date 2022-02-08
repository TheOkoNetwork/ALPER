// (0) Requires
let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;

let resultsSchema = new Schema({
    confidence: {type: mongoose.Decimal128, required: true},
    plate: {type: String, required: true},
    patternMatched: {type: Boolean, required: true},
    coordinates: [{
        x: {type: mongoose.Decimal128, required: true},
        y: {type: mongoose.Decimal128, required: true},
    }],
    candidates: [{
        plate: {type: String, required: true},
        confidence: {type: mongoose.Decimal128, required: true},
        patternMatched: {type: Boolean, required: true},
    }],
});

let frameSchema = new Schema({
    footage: {type: Schema.Types.ObjectId, ref: 'Frame'},
    frameNumber: {type: Number, required: true},
    frameTimestamp: {type: mongoose.Decimal128, required: true},
    filename: {type:String,required:true},
    uploadFilename: {type:String,required:true},
    uploaded: {type:Boolean,required:true}, 
    processed: { type: Boolean, default: false },
    results: [{ type: resultsSchema, default: [] }],
});

module.exports = frameSchema;