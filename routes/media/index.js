const express = require("express");
const router = express.Router();

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

router.get("/footage/getUnsplit", async function (req, res) {
    const pendingSplitFootage = await model.Footage.findOne({
        framesSplit: false,
        uploaded: true,
    });
    return res.status(200).send({
        status: true,
        footage: pendingSplitFootage        
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
module.exports = router;
