const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");

const downloadReceipt = async (
  req,
  res
) => {
  try {

    const { feeId } =
      req.params;

    const [rows] =
      await pool.query(
        `
        SELECT

          f.fees_id,
          f.academic_year,

          ft.transaction_ref,
          ft.amount,
          ft.payment_method,
          ft.paid_at,

          up.full_name,

          sd.usn,

          c.college_name,
          d.department_name,
          deg.degree_name,
          sem.semester_name

        FROM fees f

        JOIN fee_transactions ft
          ON ft.fee_id = f.id

        LEFT JOIN user_profiles up
          ON up.user_id = f.student_id

        LEFT JOIN student_details sd
          ON sd.user_id = f.student_id

        LEFT JOIN colleges c
          ON c.id = sd.college_id

        LEFT JOIN departments d
          ON d.id = sd.department_id

        LEFT JOIN degrees deg
          ON deg.id = sd.degree_id

        LEFT JOIN semesters sem
          ON sem.id = sd.semester_id

        WHERE f.id = ?
        `,
        [feeId]
      );

    if (!rows.length) {
      return res.status(404).json({
        message:
          "Receipt not found",
      });
    }

    const data = rows[0];

    const doc =
      new PDFDocument({
        margin: 50,
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FeeReceipt-${data.fees_id}.pdf`
    );

    doc.pipe(res);

    /* ==========================
       VTU LOGO
    ========================== */

    doc.image(
      "public/vtu-logo.png",
      240,
      20,
      {
        width: 80,
      }
    );

    doc.moveDown(5);

    doc
      .fontSize(20)
      .text(
        "VISVESVARAYA TECHNOLOGICAL UNIVERSITY",
        {
          align: "center",
        }
      );

    doc
      .fontSize(16)
      .text(
        "FEE RECEIPT",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    /* ==========================
       STUDENT DETAILS
    ========================== */

    doc
      .fontSize(12)
      .text(
        `Student Name : ${data.full_name}`
      );

    doc.text(
      `USN : ${data.usn}`
    );

    doc.text(
      `College : ${data.college_name}`
    );

    doc.text(
      `Department : ${data.department_name}`
    );

    doc.text(
      `Degree : ${data.degree_name}`
    );

    doc.text(
      `Semester : ${data.semester_name}`
    );

    doc.text(
      `Academic Year : ${data.academic_year}`
    );

    doc.moveDown(2);

    /* ==========================
       PAYMENT DETAILS TABLE
    ========================== */

    const startY = 320;

    doc.rect(
      50,
      startY,
      500,
      30
    ).stroke();

    doc.text(
      "Fee ID",
      60,
      startY + 8
    );

    doc.text(
      "Transaction Ref",
      140,
      startY + 8
    );

    doc.text(
      "Method",
      320,
      startY + 8
    );

    doc.text(
      "Amount",
      430,
      startY + 8
    );

    doc.rect(
      50,
      startY + 30,
      500,
      30
    ).stroke();

    doc.text(
      data.fees_id,
      60,
      startY + 38
    );

    doc.text(
      data.transaction_ref,
      140,
      startY + 38
    );

    doc.text(
      data.payment_method,
      320,
      startY + 38
    );

    doc.text(
      `₹${data.amount}`,
      430,
      startY + 38
    );

    doc.moveDown(8);

    doc.text(
      `Paid On : ${
        new Date(
          data.paid_at
        ).toLocaleDateString()
      }`
    );

    doc.moveDown();

    doc.text(
      "This is a computer-generated receipt.",
      {
        align: "center",
      }
    );

    doc.end();

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message:
        "Failed to generate receipt",
    });
  }
};

module.exports = {
  downloadReceipt,
};