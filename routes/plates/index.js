const express = require("express");
const router = express.Router();
router.use(express.json({ limit: "250mb" }));

let model = require("@models");
const fetch = require("node-fetch");

router.get("/processDVLA", async function (req, res) {
  const plate = await model.DetectedPlate.findOne({
    dvlaSearched: false,
  });

  if (!plate) {
    return res.json({
      status: false,
      message: "No plates to process",
    });
  };

  const DVLARes = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
  "headers": {
    "accept": "application/json",
    "accept-language": "application/json",
    "x-api-key": process.env.DVLA_VES_KEY
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": JSON.stringify({registrationNumber: plate.plate}),
  "method": "POST"
});
 const DVLAData = await DVLARes.json();
 switch (DVLARes.status) {
    case 200:
      console.log("Successfully fetched vehicle");
      console.log(DVLAData);
      await model.DetectedPlate.findOneAndUpdate({
        plate: plate.plate,
      }, {
        dvlaSearched: true,
        dvlaSearchStatus: 200,
        dvlaData: DVLAData,
      });
      break;
    case 400:
      console.log("Bad request");
      break;
    case 404:
      console.log("Vehicle not found");
      await model.DetectedPlate.findOneAndUpdate({
        plate: plate.plate,
      }, {
        dvlaSearched: true,
        dvlaSearchStatus: 404,
      });
      return res.status(404).json({
        status: false,
        message: `Vehicle with plate ${plate.plate} not found`,
      });
      break;
    case 500:
      console.log("DVLA internal server error");
      break;
    case 503:
      console.log("DVLA service unavailable");
      break;
    default:
      console.log(`Unknown HTTP status: ${DVLARes.status}`);
      break;
 };
    return res.json({
      status: true,
      message: "Plate to process",
      plate: plate,
      DVLAData: DVLAData
    });
});


module.exports = router;
