const { Pool } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "attendence",
  password: "myPassword",
  port: 5432,
});

// Insert student data into PostgreSQL
exports.insertStudentData = async (sheetData) => {
  const client = await pool.connect();
  try {
    for (let row of sheetData) {
      const values = [
        row.sno,
        row.enrollment,
        row.name,
        row.column4,
        row.column5,
        row.column6,
        row.column7,
        row.column8,
        row.column9,
        row.column10,
        row.column11,
        row.column12,
        row.column13,
        row.column14,
        row.column15,
        row.column16,
        row.column17,
        row.column18,
        row.column19,
        row.column20,
        row.column21,
        row.column22,
        row.column23,
        row.column24,
        row.column25,
        row.column26,
        row.column27,
        row.column28,
        row.column29,
        row.column30,
        row.total_classes,
        row.total_attenden,
        row.overall_attendance,
      ];

      //   console.log("data " + row.column2);
      // Prepare SQL query
      const query = `
        INSERT INTO students_data (
            column1, column2, column3, column4, column5, column6, column7, column8, column9, column10,
            column11, column12, column13, column14, column15, column16, column17, column18, column19, column20,
            column21, column22, column23, column24, column25, column26, column27, column28, column29, column30,
            column31, column32, column33
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33
        )`;

      // Execute the query
      await client.query(query, values);
    }
  } catch (err) {
    console.error("Error inserting student data:", err);
    throw err;
  } finally {
    client.release();
  }
};

// Update medical status for a specific student
exports.updateMedicalStatus = async (enrollment) => {
  const client = await pool.connect();
  try {
    // const query = `UPDATE students_data SET medical = $1 WHERE column2 = $2`;
    // const query1 = `SELECT * FROM students_data WHERE column33 = $1`;
    // const values1 = [enrollment];
    // await client.query(query1, values1);
    const result = await client.query(
      `SELECT * FROM students_data WHERE column2 = $1`,
      [enrollment]
    );

    // console.log("Data ", result.rows[0]);

    if (result.rows.length !== 0) {
      const query1 =
        "SELECT CAST(column33 AS INTEGER) AS percentage FROM students_data WHERE column2 = $1 ORDER BY createdAt ASC LIMIT 1";
      const values1 = [enrollment];
      const result1 = await client.query(query1, values1);
      if (result1.rows[0].percentage <= 95) {
        const query = `UPDATE students_data SET medical = $1,column33 = (CAST(column33 AS INTEGER) + 5)::VARCHAR WHERE column2 = $2`; // Assuming column1 is 'Enrollment No'
        const values = ["Verified", enrollment];
        await client.query(query, values); 
        console.log("Medical Status Update Successfully");
      } else {
        const error = `Enrollment ${enrollment} already have sufficient attendance.No medical certificate required`;
      return error;
      }
    } else {
      const error = `Enrollment ${enrollment} not found in database`;
      return error;
    }
  } catch (err) {
    console.error("Error updating medical status:", err);
    throw err;
  } finally {
    client.release();
  }
};

// Fetch all student data from PostgreSQL
exports.getAllStudentData = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM students_data ORDER BY createdAt ASC"
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching student data:", err);
    throw err;
  } finally {
    client.release();
  }
};
