const searchForm = document.getElementById("searchForm");
const emailInput = document.getElementById("email");
const appointmentsList = document.getElementById("appointmentsList");
const message = document.getElementById("message");

const API_URL = "http://localhost:3001/api/appointments/my-appointments";

// Search for appointments
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();

  message.textContent = "Searching for your appointments...";
  appointmentsList.innerHTML = "";

  try {
    const response = await fetch(
      `${API_URL}?email=${encodeURIComponent(email)}`,
    );

    const appointments = await response.json();

    if (!response.ok) {
      throw new Error(appointments.error || "Something went wrong.");
    }

    if (appointments.length === 0) {
      message.textContent = "No appointments found for this email.";
      return;
    }

    message.textContent = `Found ${appointments.length} appointment(s).`;

    appointments.forEach((appointment) => {
      const card = document.createElement("div");
      card.className = "appointment-card";

      card.innerHTML = `
                <h3>Appointment #${appointment.appointment_id}</h3>

                <p><strong>Patient:</strong> ${appointment.full_name}</p>
                <p><strong>Hospital:</strong> ${appointment.hospital_name}</p>
                <p><strong>Doctor:</strong> ${appointment.doctor_name}</p>
                <p><strong>Specialization:</strong> ${appointment.specialization}</p>
                <p><strong>Date:</strong> ${appointment.appointment_date}</p>
                <p><strong>Time:</strong> ${appointment.appointment_time}</p>
                <p><strong>Reason:</strong> ${appointment.reason || "Not specified"}</p>

                <p class="status">
                    <strong>Status:</strong> ${appointment.status}
                </p>

                ${
                  appointment.status !== "Cancelled"
                    ? `
                    <button class="cancel-btn">
                        Cancel Appointment
                    </button>
                `
                    : ""
                }
            `;

      appointmentsList.appendChild(card);

      // CANCEL APPOINTMENT
      const cancelButton = card.querySelector(".cancel-btn");

      if (cancelButton) {
        cancelButton.addEventListener("click", async function () {
          const confirmed = confirm(
            "Are you sure you want to cancel this appointment?",
          );

          if (!confirmed) return;

          try {
            const response = await fetch(
              `http://localhost:3001/api/appointments/${appointment.appointment_id}/cancel`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: email,
                }),
              },
            );

            const responseText = await response.text();

            console.log("CANCELLATION RESPONSE:", responseText);

            let result;

            try {
              result = JSON.parse(responseText);
            } catch {
              throw new Error(
                "The server returned an unexpected response. Check the backend route.",
              );
            }

            if (!response.ok) {
              throw new Error(result.error || "Cancellation failed.");
            }

            alert(result.message);

            // Reload appointments
            searchForm.requestSubmit();
          } catch (error) {
            alert(error.message);
            console.error(error);
          }
        });
      }
    });
  } catch (error) {
    message.textContent = error.message;
    console.error(error);
  }
});
