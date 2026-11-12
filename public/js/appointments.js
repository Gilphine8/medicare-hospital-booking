const hospitalSelect = document.getElementById("hospital");
const departmentSelect = document.getElementById("department");
const doctorSelect = document.getElementById("doctor");
const appointmentForm = document.getElementById("appointmentForm");
const message = document.getElementById("message");

const API_URL = "http://localhost:3001/api/appointments";

// Load hospitals
async function loadHospitals() {
  try {
    const response = await fetch(`${API_URL}/hospitals`);
    const hospitals = await response.json();

    hospitalSelect.innerHTML = '<option value="">Choose a hospital</option>';

    hospitals.forEach((hospital) => {
      hospitalSelect.innerHTML += `
                <option value="${hospital.hospital_id}">
                    ${hospital.hospital_name} - ${hospital.location}
                </option>
            `;
    });
  } catch (error) {
    console.error(error);
    hospitalSelect.innerHTML =
      '<option value="">Failed to load hospitals</option>';
  }
}

// Load departments when hospital changes
hospitalSelect.addEventListener("change", async function () {
  const hospitalId = this.value;

  departmentSelect.innerHTML =
    '<option value="">Loading departments...</option>';
  doctorSelect.innerHTML =
    '<option value="">Select a department first</option>';

  if (!hospitalId) return;

  try {
    const response = await fetch(`${API_URL}/departments/${hospitalId}`);
    const departments = await response.json();

    departmentSelect.innerHTML =
      '<option value="">Choose a department</option>';

    departments.forEach((department) => {
      departmentSelect.innerHTML += `
                <option value="${department.department_id}">
                    ${department.department_name}
                </option>
            `;
    });
  } catch (error) {
    console.error(error);
    departmentSelect.innerHTML =
      '<option value="">Failed to load departments</option>';
  }
});

// Load doctors when department changes
departmentSelect.addEventListener("change", async function () {
  const departmentId = this.value;

  doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';

  if (!departmentId) return;

  try {
    const response = await fetch(`${API_URL}/doctors/${departmentId}`);
    const doctors = await response.json();

    doctorSelect.innerHTML = '<option value="">Choose a doctor</option>';

    doctors.forEach((doctor) => {
      doctorSelect.innerHTML += `
                <option value="${doctor.doctor_id}">
                    ${doctor.doctor_name}
                </option>
            `;
    });
  } catch (error) {
    console.error(error);
    doctorSelect.innerHTML = '<option value="">Failed to load doctors</option>';
  }
});

// Submit appointment
appointmentForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const appointmentData = {
    full_name: document.getElementById("full_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    hospital_id: hospitalSelect.value,
    doctor_id: doctorSelect.value,
    appointment_date: document.getElementById("appointment_date").value,
    appointment_time: document.getElementById("appointment_time").value,
    reason: document.getElementById("reason").value.trim(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Booking failed.");
    }

    message.textContent = `${result.message} Your appointment ID is ${result.appointment_id}.`;
    message.style.color = "green";

    appointmentForm.reset();

    departmentSelect.innerHTML =
      '<option value="">Select a hospital first</option>';
    doctorSelect.innerHTML =
      '<option value="">Select a department first</option>';
  } catch (error) {
    message.textContent = error.message;
    message.style.color = "red";
  }
});

// Start loading hospitals
loadHospitals();
