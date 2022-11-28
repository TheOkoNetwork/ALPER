// (0) Requires
let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;

const dvlaDataSchema = new Schema({
    registrationNumber: {
        type: String,
        required: true,
    },
    taxStatus: {
        type: String,
        enum: [
            'Not Taxed for on Road Use',
            'SORN',
            'Taxed',
            'Untaxed',
        ],
        required: false,
    },
    taxDueDate: {
        type: String,
        required: false,
    },
    artEndDate: {
        type: String,
        required: false,
    },
    motStatus: {
        type: String,
        enum: [
            'No details held by DVLA',
            'No results returned',
            'Not valid',
            'Valid',
        ],
        required: false,
    },
    motExpiryDate: {
        type: String,
        required: false,
    },
    make: {
        type: String,
        required: false,
    },
    monthOfFirstDvlaRegistration: {
        type: String,
        required: false,
    },
    monthOfFirstRegistration: {
        type: String,
        required: false,
    },
    yearOfManufacture: {
        type: Number,
        required: false,
    },
    engineCapacity: {
        type: Number,
        required: false,
    },
    co2Emissions: {
        type: Number,
        required: false,
    },
    fuelType: {
        type: String,
        required: false,
    },
    markedForExport: {
        type: Boolean,
        required: false,
    },
    colour: {
        type: String,
        required: false,
    },
    typeApproval: {
        type: String,
        required: false,
    },
    wheelplan: {
        type: String,
        required: false,
    },
    revenueWeight: {
        type: Number,
        required: false,
    },
    realDrivingEmissions: {
        type: String,
        required: false,
    },
    dateOfLastV5CIssued: {
        type: String,
        required: false,
    },
    euroStatus: {
        type: String,
        required: false,
    },
});
let plateSchema = new Schema({
    plate: {type:String,required:true},
    dvlaSearched: { type: Boolean, default: false },
    dvlaSearchStatus: { type: Number, required: true },
    dvlaData: { type: dvlaDataSchema, required: false },
});

module.exports = plateSchema;