const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Route to upload student data
router.post("/upload-student-data", studentController.uploadStudentData);

// Route to verify medical certificate
router.post(
  "/verify-medical-certificate",
  studentController.verifyMedicalCertificate
);

// Route to fetch all student data
router.get("/get-student-data", studentController.getStudentData);

// Route to download student data as Excel
router.get("/download-student-data", studentController.downloadStudentData);

module.exports = router;
