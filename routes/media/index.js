const express = require("express");
const router = express.Router();
router.use(express.json({ limit: "250mb" }));

const fileUpload = require("express-fileupload");
let model = require("@models");

const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

router.get("/frames/getUnprocessed", async function (req, res) {
  const framesPendingProcessing = await model.Frame.aggregate([
    {
      $match: {
        uploaded: true,
        processed: false,
      },
    },
    { $sample: { size: 1 } },
  ]);
  if (framesPendingProcessing.length == 0) {
    res.status(200).json({
      status: false,
      message: "No frames to process",
    });
  }

  return res.status(200).send({
    status: true,
    frame: framesPendingProcessing[0],
  });
});

router.get("/frames/:frameId/noResults", async function (req, res) {
  const frame = await model.Frame.findOne({
    _id: req.params.frameId,
  });
  if (!frame) {
    return res.status(404).send({
      status: false,
      message: "Frame not found",
    });
  }
  await model.Frame.deleteOne({
    _id: req.params.frameId,
  });
  return res.status(200).send({
    status: true,
  });
});
router.post("/frames/:frameId/results", async function (req, res) {
  const frame = await model.Frame.findOne({
    _id: req.params.frameId,
  });
  if (!frame) {
    return res.status(404).send({
      status: false,
      message: "Frame not found",
    });
  }
  const rawResults = req.body;
  const results = [];

  //UK Plate regex
  const plateRegex =
    /(?<Current>^[A-Z]{2}[0-9]{2}[A-Z]{3}$)|(?<Prefix>^[A-Z][0-9]{1,3}[A-Z]{3}$)|(?<Suffix>^[A-Z]{3}[0-9]{1,3}[A-Z]$)|(?<DatelessLongNumberPrefix>^[0-9]{1,4}[A-Z]{1,2}$)|(?<DatelessShortNumberPrefix>^[0-9]{1,3}[A-Z]{1,3}$)|(?<DatelessLongNumberSuffix>^[A-Z]{1,2}[0-9]{1,4}$)|(?<DatelessShortNumberSufix>^[A-Z]{1,3}[0-9]{1,3}$)|(?<DatelessNorthernIreland>^[A-Z]{1,3}[0-9]{1,4}$)|(?<DiplomaticPlate>^[0-9]{3}[DX]{1}[0-9]{3}$)/g;

  for (const detectedPlate of rawResults) {
    const plate = {
      plate: detectedPlate.plate,
      patternMatched: detectedPlate.plate.search(plateRegex) > 0,
      confidence: Number(detectedPlate.confidence),
      coordinates: detectedPlate.coordinates,
      candidates: [],
    };
    for (const plateCandidate of detectedPlate.candidates) {
      plate.candidates.push({
        plate: plateCandidate.plate,
        confidence: Number(plateCandidate.confidence),
        patternMatched: plateCandidate.plate.search(plateRegex) >= 0,
      });
    }
    results.push(plate);
  }

  //@TODO this in a transactionth
  await model.Frame.updateOne(
    {
      _id: req.params.frameId,
    },
    {
      $set: {
        results: results,
        processed: true,
      },
    }
  );
  return res.status(200).send({
    status: true,
  });
});
router.get("/footage/getUnsplit", async function (req, res) {
  const pendingSplitFootage = await model.Footage.findOne({
    framesSplit: false,
    uploaded: true,
  });
  return res.status(200).send({
    status: true,
    footage: pendingSplitFootage,
  });
});

router.get("/footage/:footageId/splitComplete", async function (req, res) {
  const footage = await model.Footage.findOne({
    _id: req.params.footageId,
  });
  if (!footage) {
    return res.status(404).send({
      status: false,
      message: "Footage not found",
    });
  }
  await model.Footage.updateOne(
    { _id: footage._id },
    { $set: { framesSplit: true } }
  );
  return res.status(200).send({
    status: true,
  });
});

router.get("/footage/:footageFilename", async function (req, res) {
  const fullFilePath = `${appDir}/media/footage/${req.params.footageFilename}`;
  console.log(`Testing if file: ${fullFilePath} exists`);
  if (await checkFileExists(fullFilePath)) {
    console.log(`file: ${fullFilePath} exists`);
    return res.sendFile(fullFilePath);
  } else {
    console.log(`file: ${fullFilePath} does NOT exist`);
    return res.status(404).send({
      status: false,
      message: "Not found",
    });
  }
});
router.get("/frames/:frameFilename", async function (req, res) {
  const fullFilePath = `${appDir}/media/frames/${req.params.frameFilename}`;
  console.log(`Testing if file: ${fullFilePath} exists`);
  if (await checkFileExists(fullFilePath)) {
    console.log(`file: ${fullFilePath} exists`);
    return res.sendFile(fullFilePath);
  } else {
    console.log(`file: ${fullFilePath} does NOT exist`);
    return res.status(404).send({
      status: false,
      message: "Not found",
    });
  }
});

router.post(
  "/upload",
  fileUpload({
    limits: { fileSize: 250 * 1024 * 1024 },
  }),
  async function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send("No files were uploaded.");
      return;
    }
    console.log("Got file upload");
    const file = req.files.upload;
    const uploadAsFilename = uuidv4() + "_" + file.name;
    const uploadPath = `${appDir}/media/footage/${uploadAsFilename}`;

    const footageDoc = await model.Footage.create({
      filename: uploadAsFilename,
      uploadFilename: file.name,
      uploaded: false,
      framesSplit: false,
    });

    // Use the mv() method to place the file somewhere on your server
    await file.mv(uploadPath);

    console.log(`File uploaded to: ${uploadPath}`);
    await model.Footage.updateOne(
      { _id: footageDoc._id },
      {
        $set: {
          uploaded: true,
        },
      }
    );
    res.send({
      status: true,
      message: "File uploaded",
      footageId: footageDoc._id,
    });
  }
);

router.post(
  "/frame/upload/:footageId/:frameNumber/:frameTimestamp",
  fileUpload({
    limits: { fileSize: 250 * 1024 * 1024 },
  }),
  async function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send("No files were uploaded.");
      return;
    }
    console.log("Got file upload");
    const file = req.files.upload;

    const footage = await model.Footage.findOne({
      _id: req.params.footageId,
    });
    if (!footage) {
      return res.status(404).send({
        status: false,
        message: "Footage not found",
      });
    }
    const uploadAsFilename = uuidv4() + "_" + file.name;
    const uploadPath = `${appDir}/media/frames/${uploadAsFilename}`;

    const frameDoc = await model.Frame.create({
      footage: footage._id,
      filename: uploadAsFilename,
      frameNumber: Number(req.params.frameNumber),
      frameTimestamp: Number(req.params.frameTimestamp),
      uploadFilename: file.name,
      uploaded: false,
      framesSplit: false,
    });

    // Use the mv() method to place the file somewhere on your server
    await file.mv(uploadPath);

    console.log(`File uploaded to: ${uploadPath}`);
    await model.Frame.updateOne(
      { _id: frameDoc._id },
      {
        $set: {
          uploaded: true,
        },
      }
    );
    res.send({
      status: true,
      message: "File uploaded",
      frameId: frameDoc._id,
    });
  }
);

module.exports = router;
