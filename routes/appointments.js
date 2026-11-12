const express = require("express");
const router = express.Router();
const db = require("../config/db");
console.log("MEDICARE APPOINTMENTS ROUTES LOADED");

// ======================================
// 1. GET ALL HOSPITALS
// ======================================

router.get("/hospitals", (req, res) => {
  db.query("SELECT * FROM hospitals", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// ======================================
// 2. GET DEPARTMENTS BY HOSPITAL
// ======================================

router.get("/departments/:hospital_id", (req, res) => {
  const sql = "SELECT * FROM departments WHERE hospital_id = ?";

  db.query(sql, [req.params.hospital_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// ======================================
// 3. GET DOCTORS BY DEPARTMENT
// ======================================

router.get("/doctors/:department_id", (req, res) => {
  const sql = "SELECT * FROM doctors WHERE department_id = ?";

  db.query(sql, [req.params.department_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// ======================================
// 4. GET PATIENT APPOINTMENTS BY EMAIL
// ======================================

router.get("/my-appointments", (req, res) => {
  console.log("MY APPOINTMENTS ENDPOINT REGISTERED");

  const email = req.query.email;

  if (!email) {
    return res.status(400).json({
      error: "Please provide your email address.",
    });
  }

  const sql = `
    SELECT
      a.appointment_id,
      p.full_name,
      p.email,
      p.phone,
      h.hospital_name,
      d.doctor_name,
      d.specialization,
      a.appointment_date,
      a.appointment_time,
      a.reason,
      a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN hospitals h ON a.hospital_id = h.hospital_id
    JOIN doctors d ON a.doctor_id = d.doctor_id
    WHERE p.email = ?
    ORDER BY a.appointment_date DESC
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json(results);
  });
});

// CANCEL AN APPOINTMENT
router.put("/:appointment_id/cancel", (req, res) => {
  console.log("CANCELLATION ROUTE REACHED!");
  console.log("REQUEST BODY:", req.body);

  const appointmentId = req.params.appointment_id;
  const email = req.body?.email;

  if (!email) {
    return res.status(400).json({
      error: "Email address is required.",
    });
  }

  const sql = `
        UPDATE appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        SET a.status = 'Cancelled'
        WHERE a.appointment_id = ?
        AND p.email = ?
        AND a.status != 'Cancelled'
    `;

  db.query(sql, [appointmentId, email], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Appointment not found or already cancelled.",
      });
    }

    res.json({
      message: "Appointment cancelled successfully!",
    });
  });
});

// ======================================
// 5. BOOK AN APPOINTMENT
// ======================================

router.post("/", (req, res) => {
  const {
    full_name,
    email,
    phone,
    hospital_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
  } = req.body;

  if (
    !full_name ||
    !email ||
    !phone ||
    !hospital_id ||
    !doctor_id ||
    !appointment_date ||
    !appointment_time
  ) {
    return res.status(400).json({
      error: "Please fill in all required fields.",
    });
  }

  const patientSql = `
    INSERT INTO patients (full_name, email, phone)
    VALUES (?, ?, ?)
  `;

  db.query(patientSql, [full_name, email, phone], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    const patientId = result.insertId;

    const appointmentSql = `
      INSERT INTO appointments
      (
        patient_id,
        hospital_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      appointmentSql,
      [
        patientId,
        hospital_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason || null,
      ],
      (err, appointment) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
          });
        }

        res.status(201).json({
          message: "Appointment booked successfully!",
          appointment_id: appointment.insertId,
        });
      },
    );
  });
});

// ======================================
// EXPORT ROUTER
// ======================================

// 7. GET ALL DOCTORS
router.get("/doctors", (req, res) => {
  const sql = `
        SELECT
            doctors.doctor_id,
            doctors.doctor_name,
            doctors.specialization,
            hospitals.hospital_name,
            hospitals.location
        FROM doctors
        JOIN hospitals
        ON doctors.hospital_id = hospitals.hospital_id
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

module.exports = router;
