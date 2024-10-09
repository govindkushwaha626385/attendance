const xlsx = require("xlsx");
const path = require("path");
// const fs = require("fs");
const pdf = require("pdf-parse"); // Ensure this line is included
const fs = require("fs").promises;
const cv = require("opencv4nodejs-prebuilt-install");
const Tesseract = require("tesseract.js");
const Student = require("../models/studentModel");

// const pdfPoppler = require("pdf-poppler");

// const { PDFDocument } = require("pdf-lib");

// Upload student data (skip first 8 rows and store in PostgreSQL)
exports.uploadStudentData = async (req, res) => {
  const studentDataFile = req.files.studentData;

  if (!studentDataFile) {
    return res.status(400).send("No student data file uploaded");
  }

  try {
    const headers = [
      "column1",
      "column2",
      "column3",
      "column4",
      "column5",
      "column6",
      "column7",
      "column8",
      "column9",
      "column10",
      "column11",
      "column12",
      "column13",
      "column14",
      "column15",
      "column16",
      "column17",
      "column18",
      "column19",
      "column20",
      "column21",
      "column22",
      "column23",
      "column24",
      "column25",
      "column26",
      "column27",
      "column28",
      "column29",
      "column30",
      "column31",
      "column32",
      "column33",
    ];

    // Read Excel file and skip first 8 rows
    const workbook = xlsx.read(studentDataFile.data, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData1 = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      range: 0,
      header: headers,
    });

    // headers data
    const headerData = {
      header1: sheetData1[0].column1,
      header2: sheetData1[1].column1,
      header3: sheetData1[2].column1,
      header4: sheetData1[3].column1,
    };

    // console.log("Header Data :", hederData);

    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      range: 4,
      header: headers,
    });

    // console.log("Raw Sheet Data:", sheetData[0]);

    const formattedData = sheetData.map((row) => ({
      sno: row.column1,
      enrollment: row.column2,
      name: row.column3,
      column4: row.column4,
      column5: row.column5,
      column6: row.column6,
      column7: row.column7,
      column8: row.column8,
      column9: row.column9,
      column10: row.column10,
      column11: row.column11,
      column12: row.column12,
      column13: row.column13,
      column14: row.column14,
      column15: row.column15,
      column16: row.column16,
      column17: row.column17,
      column18: row.column18,
      column19: row.column19,
      column20: row.column20,
      column21: row.column21,
      column22: row.column22,
      column23: row.column23,
      column24: row.column24,
      column25: row.column25,
      column26: row.column26,
      column27: row.column27,
      column28: row.column28,
      column29: row.column29,
      column30: row.column30,
      total_classes: row.column31,
      total_attended: row.column32,
      overall_attendance: row.column33,
      // Continue mapping as needed
    }));

    // console.log("First row, column1:", formattedData[0]);
    // Insert the data into PostgreSQL
    await Student.insertStudentData(formattedData);
    // await Student.insertStudentData(formattedData);

    res.json({
      message: "Student data successfully uploaded and stored in the database",
      studentData: sheetData,
      headerData: headerData,
    });
  } catch (error) {
    console.error("Error processing student data:", error);
    res.status(500).send("Error processing student data");
  }
};

// Verify medical certificate by comparing seal and update the database
exports.verifyMedicalCertificate = async (req, res) => {
  try {
    const medicalCertificate = req.files?.medicalCertificate;

    if (!medicalCertificate) {
      return res
        .status(400)
        .json({ message: "No medical certificate uploaded" });
    }

    const uploadDir = path.join(__dirname, "../uploads");
    const uploadedFilePath = path.join(uploadDir, medicalCertificate.name);
    await fs.writeFile(uploadedFilePath, medicalCertificate.data);

    const fileExtension = path.extname(uploadedFilePath).toLowerCase();
    let text = ""
    let binaryImage = null;

    if (fileExtension === ".pdf") {
      const pdfData = await fs.readFile(uploadedFilePath);
      const pdfText = await pdf(pdfData);
      text = pdfText.text;
      console.log("Extrected text : ", text);
    } else if ([".png", ".jpg", ".jpeg"].includes(fileExtension)) {
      // const certImage = cv.imread(uploadedFilePath);
      // if (certImage.empty)
      //   return res
      //     .status(400)
      //     .json({ message: "Failed to load certificate image." });

      // const grayImage = certImage.cvtColor(cv.COLOR_BGR2GRAY);
      // const denoisedImage = grayImage.gaussianBlur(new cv.Size(5, 5), 0);
      // binaryImage = denoisedImage.threshold(
      //   0,
      //   255,
      //   cv.THRESH_BINARY | cv.THRESH_OTSU
      // );

      // const preprocessedImagePath = path.join(
      //   uploadDir,
      //   "preprocessed_certificate.png"
      // );
      // cv.imwrite(preprocessedImagePath, binaryImage);

      // const {
      //   data: { text: imageText },
      // } = await Tesseract.recognize(preprocessedImagePath, "eng");
      // text = imageText;
      const certImage = cv.imread(uploadedFilePath);
      if (certImage.empty) {
        return res
          .status(400)
          .json({ message: "Failed to load certificate image." });
      }

      console.log("Image loaded successfully.");

      const grayImage = certImage.cvtColor(cv.COLOR_BGR2GRAY);
      const denoisedImage = grayImage.gaussianBlur(new cv.Size(5, 5), 0);
     const binaryImage = denoisedImage.threshold(
        0,
        255,
        cv.THRESH_BINARY | cv.THRESH_OTSU 
      );
      // console.log("Binary Image : ", binaryImage);

      const preprocessedImagePath = path.join(
        uploadDir,
        "preprocessed_certificate.png"
      ); 
      cv.imwrite(preprocessedImagePath, binaryImage);

      console.log(`Preprocessed image saved at: ${preprocessedImagePath}`); 

      try {
        const { 
          data: { text: imageText },
        } = await Tesseract.recognize(preprocessedImagePath, "eng", {
          logger: (info) => console.log(info), // Log progress
        });
        // console.log("OCR text:", imageText);
        text = imageText;
      } catch (error) {
        console.error("Error during Tesseract processing:", error);
        return res.status(500).json({ message: "OCR processing failed." });
      }
    } else {
      return res.status(400).json({ message: "Unsupported file format." });
    }

    const enrollmentMatch = text.match(/Enrollment:\s*([A-Za-z0-9]+)/);
    const enrollment = enrollmentMatch ? enrollmentMatch[1] : null;

    // console.log("Enrollment : ", enrollment);

    if (!enrollment)
      return res
        .status(400)
        .json({ message: "Unable to extract Enrollment No" });

    const sealPath = path.join(__dirname, "../seal.png");
    await fs.access(sealPath);

    const sealImage = cv.imread(sealPath);
    if (sealImage.empty)
      return res.status(400).json({ message: "Failed to load seal image." });

    if (binaryImage) {
      const resizedSeal = sealImage.resize(100, 100);
      const resizedCert = binaryImage.resize(100, 100);

      const result = resizedCert.matchTemplate(
        resizedSeal,
        cv.TM_CCOEFF_NORMED
      ); 
      const minMax = result.minMaxLoc();
      console.log("minMax.maxVal is : ", minMax.maxVal);
      const maxVal = 1;
      if (minMax.maxVal < 0.8) {
        return res.json({
          message: "Medical certificate verification failed",
          verified: false,
        });
      }
    }

    const error = await Student.updateMedicalStatus(enrollment);
    // console.log("Error ", error);
    if (error) {
      res.json({
        message: `${error}`,
        verified: false,
      });
      return;
    }

    res.json({
      message: `Medical certificate verified for Enrollment No: ${enrollment}`,
      verified: true,
    });
  } catch (error) {
    console.error("Error processing medical certificate:", error);
    return res.status(500).json({
      message: "Error processing medical certificate",
      error: error.message,
    });
  }
};

// Fetch all stored student data from PostgreSQL
exports.getStudentData = async (req, res) => {
  try {
    const studentData = await Student.getAllStudentData();
    res.json(studentData);
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).send("Error fetching student data");
  }
};

// Download stored student data as Excel
exports.downloadStudentData = async (req, res) => {
  try {
    const studentData = await Student.getAllStudentData();

    // Create Excel file with student data
    const newWorkbook = xlsx.utils.book_new();
    const newSheet = xlsx.utils.json_to_sheet(studentData);
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Student Data");

    const outputPath = path.join(__dirname, "../public", "StudentData.xlsx");
    xlsx.writeFile(newWorkbook, outputPath);

    res.download(outputPath);
  } catch (error) {
    console.error("Error downloading student data:", error);
    res.status(500).send("Error downloading student data");
  }
};
