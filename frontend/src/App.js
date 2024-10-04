import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

const App = () => {
  const [studentDataFile, setStudentDataFile] = useState(null);
  const [medicalCertificate, setMedicalCertificate] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [headersData, setHeadersData] = useState([]);

  // Fetch student data on component load 
  useEffect(() => {
    fetchStudentData();
    fetchHeaders();
  }, []);

  const fetchHeaders = () => {
    const headerData = JSON.parse(localStorage.getItem("headerData"));
    setHeadersData(headerData);
  };

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/get-student-data"
      );
      setStudentData(response.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Error fetching student data");
    }
  };

  // Handle file change for student data
  const handleStudentDataFileChange = (e) => {
    setStudentDataFile(e.target.files[0]);
  };

  // Handle file change for medical certificate
  const handleMedicalCertificateChange = (e) => {
    setMedicalCertificate(e.target.files[0]);
  };

  // Upload and process student data
  const handleStudentDataUpload = async () => {
    if (!studentDataFile) {
      alert("Please upload student data file");
      return;
    }

    const formData = new FormData();
    formData.append("studentData", studentDataFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload-student-data",
        formData
      );
      alert(response.data.message);

      const headerData = {
        header1: response.data.headerData.header1,
        header2: response.data.headerData.header3,
        header3: response.data.headerData.header3,
        header4: response.data.headerData.header4,
      };

      setHeadersData(headerData);
      localStorage.setItem("headerData", JSON.stringify(headerData));

      fetchStudentData();
    } catch (error) {
      console.error("Error uploading student data:", error.message);
      alert("Error uploading student data");
    }
  };

  // Upload and process medical certificate
  const handleMedicalCertificateUpload = async (e) => {
    e.preventDefault();
    if (!medicalCertificate) {
      alert("Please upload a medical certificate");
      return;
    }

    const formData = new FormData();
    formData.append("medicalCertificate", medicalCertificate);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/verify-medical-certificate",
        formData
      );
      if (response.data.verified) {
        setVerificationMessage(response.data.message);
      } else {
        setVerificationMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading medical certificate:", error);
      setVerificationMessage("Error processing medical certificate");
    }
  };

  // Download the student data as Excel
  const handleDownloadStudentData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/download-student-data",
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "StudentData.xlsx");
    } catch (error) {
      console.error("Error downloading student data:", error);
      alert("Error downloading student data");
    }
  };

  return (
    <div className="container mx-auto p-5 bg-gray-100">
      <div className="p-5 bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Student Data and Medical Certificate Management
        </h1>

        {/* Upload Student Data Section */}
        <div className="mb-8 p-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Upload Student Data
          </h2>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleStudentDataFileChange}
            className="border border-gray-300 rounded-lg p-2 mb-3 w-full hover:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200 transition duration-300"
          />
          <button
            onClick={handleStudentDataUpload}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Upload Student Data
          </button>
        </div>

        {/* Upload Medical Certificate Section */}
        <div className="mb-8 p-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Upload Medical Certificate
          </h2>
          <input
            type="file"
            accept=".pdf, .jpg, .png, .jpeg"
            onChange={handleMedicalCertificateChange}
            className="border border-gray-300 rounded-lg p-2 mb-3 w-full hover:border-green-500 focus:outline-none focus:ring focus:ring-green-200 transition duration-300"
          />
          <button
            onClick={handleMedicalCertificateUpload}
            className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Verify Medical Certificate
          </button>
          <p className="mt-2 text-center text-red-500">{verificationMessage}</p>
        </div>
      </div>

      {/* Display Student Data */}
      {studentData.length > 0 && headersData ? (
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Stored Student Data
            </h2>

            <table className="w-full border-collapse border border-gray-300 mb-5">
              <thead>
                <tr>
                  <th className="border-b-2 border-gray-300 text-center py-2 bg-red-200">
                    {headersData.header1}
                  </th>
                </tr>
                <tr>
                  <th className="border-b-2 border-gray-300 text-center py-2 bg-blue-200">
                    {headersData.header2}
                  </th>
                </tr>
                <tr>
                  <th className="border-b-2 border-gray-300 text-center py-2 bg-green-200">
                    {headersData.header3}
                  </th>
                </tr>
                <tr>
                  <th className="border-b-2 border-gray-300 text-center py-2 bg-yellow-200">
                    {headersData.header4}
                  </th>
                </tr>
              </thead>
            </table>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <tbody>
                  {studentData.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-200 transition duration-300"
                    >
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-red-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column1}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-blue-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column2}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-green-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column3}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-yellow-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column4}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-purple-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column5}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-pink-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column6}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-orange-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column7}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-teal-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column8}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-indigo-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column9}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-gray-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column10}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-red-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column11}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-blue-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column12}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-green-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column13}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-yellow-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column14}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-purple-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column15}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-pink-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column16}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-orange-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column17}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-teal-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column18}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-indigo-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column19}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-gray-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column20}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-red-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column21}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-blue-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column22}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-green-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column23}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-yellow-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column24}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-purple-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column25}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-pink-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column26}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-orange-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column27}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-teal-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column28}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-indigo-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column29}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-gray-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column30}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-red-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column31}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-blue-100 px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column32}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-green-300 font-bold px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.column33}
                      </td>
                      <td
                        className="border-b border-gray-300 text-center py-2 bg-yellow-300 font-bold px-4"
                        style={{ minWidth: "80px" }}
                      >
                        {student.medical}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleDownloadStudentData}
              className="bg-purple-500 text-white py-2 px-6 rounded-lg hover:bg-purple-600 transition duration-300 mt-5 block mx-auto"
            >
              Download Student Data
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default App;
