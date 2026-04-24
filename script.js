document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 1) Grab elements from the page
  // -----------------------------
  const calendarTitle = document.getElementById("calendarTitle");
  const calendarContainer = document.getElementById("calendarContainer");
  const newAppointmentBtn = document.getElementById("newAppointmentBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const viewButtons = document.querySelectorAll(".view-btn");

  const appointmentModal = document.getElementById("appointmentModal");
  const detailsModal = document.getElementById("detailsModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const closeDetailsBtn = document.getElementById("closeDetailsBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const appointmentForm = document.getElementById("appointmentForm");
  const formError = document.getElementById("formError");
  const detailsContent = document.getElementById("detailsContent");

  const titleInput = document.getElementById("titleInput");
  const dateInput = document.getElementById("dateInput");
  const startTimeInput = document.getElementById("startTimeInput");
  const endTimeInput = document.getElementById("endTimeInput");
  const meetingTypeInput = document.getElementById("meetingTypeInput");
  const notesInput = document.getElementById("notesInput");

  if (!calendarTitle || !calendarContainer || !appointmentForm) {
    return;
  }

  // -----------------------------
  // 2) App state
  // -----------------------------
  let currentView = "month"; // month | week | day
  let currentDate = new Date();
  let appointments = loadAppointments();

  // -----------------------------
  // 3) Helper functions
  // -----------------------------

  // Turn Date into YYYY-MM-DD for easy comparisons.
  function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Friendly date text shown in title/details.
  function formatDatePretty(dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  // Load appointments from localStorage.
  function loadAppointments() {
    try {
      const saved = localStorage.getItem("appointments");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  // Save appointments to localStorage.
  function saveAppointments() {
    try {
      localStorage.setItem("appointments", JSON.stringify(appointments));
    } catch (error) {
      // If storage fails, the app still works during this page session.
    }
  }

  // Get appointments for a single date, sorted by start time.
  function getAppointmentsForDate(dateKey) {
    return appointments
      .filter((item) => item.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Convert meeting type to a CSS class so each type has a color.
  function getMeetingClass(meetingType) {
    switch (meetingType) {
      case "Consultation":
        return "meeting-consultation";
      case "Follow-up":
        return "meeting-follow-up";
      case "Internal meeting":
        return "meeting-internal";
      case "Client meeting":
        return "meeting-client";
      default:
        return "meeting-other";
    }
  }

  // -----------------------------
  // 4) UI rendering functions
  // -----------------------------

  function render() {
    renderTitle();
    renderViewButtons();
    renderCalendar();
  }

  function renderTitle() {
    if (currentView === "month") {
      calendarTitle.textContent = currentDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
      });
      return;
    }

    if (currentView === "week") {
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      calendarTitle.textContent = `${formatDatePretty(toDateKey(start))} - ${formatDatePretty(toDateKey(end))}`;
      return;
    }

    calendarTitle.textContent = formatDatePretty(toDateKey(currentDate));
  }

  function renderViewButtons() {
    viewButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.view === currentView);
    });
  }

  function renderCalendar() {
    if (currentView === "month") {
      renderMonthView();
      return;
    }

    if (currentView === "week") {
      renderWeekView();
      return;
    }

    renderDayView();
  }

  // Month view: 7-column grid with day cells.
  function renderMonthView() {
    calendarContainer.innerHTML = "";
    const monthGrid = document.createElement("div");
    monthGrid.className = "month-grid";

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((dayName) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "weekday-name";
      dayHeader.textContent = dayName;
      monthGrid.appendChild(dayHeader);
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const startDate = new Date(year, month, 1 - firstWeekday);

    // Show 6 rows x 7 days for consistent month layout.
    for (let i = 0; i < 42; i += 1) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      monthGrid.appendChild(createDayCell(dayDate, month));
    }

    calendarContainer.appendChild(monthGrid);
  }

  // Week view: list of 7 day rows.
  function renderWeekView() {
    calendarContainer.innerHTML = "";
    const weekView = document.createElement("div");
    weekView.className = "week-view";

    const weekStart = getStartOfWeek(currentDate);
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const row = document.createElement("div");
      row.className = "week-row";
      row.appendChild(createDayRowContent(date));
      weekView.appendChild(row);
    }

    calendarContainer.appendChild(weekView);
  }

  // Day view: one row showing only current date.
  function renderDayView() {
    calendarContainer.innerHTML = "";
    const dayView = document.createElement("div");
    dayView.className = "day-view";

    const row = document.createElement("div");
    row.className = "day-row";
    row.appendChild(createDayRowContent(currentDate));
    dayView.appendChild(row);

    calendarContainer.appendChild(dayView);
  }

  // Shared row content used by week/day view.
  function createDayRowContent(date) {
    const wrapper = document.createElement("div");
    const dateKey = toDateKey(date);
    const dayAppointments = getAppointmentsForDate(dateKey);

    const title = document.createElement("p");
    title.className = "row-title";
    title.textContent = formatDatePretty(dateKey);
    wrapper.appendChild(title);

    const list = document.createElement("div");
    list.className = "appt-list";

    if (dayAppointments.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No appointments";
      list.appendChild(empty);
    } else {
      dayAppointments.forEach((item) => {
        list.appendChild(createAppointmentChip(item));
      });
    }

    wrapper.appendChild(list);
    return wrapper;
  }

  // One day cell used in month view.
  function createDayCell(date, currentMonth) {
    const cell = document.createElement("div");
    cell.className = "day-cell";

    if (date.getMonth() !== currentMonth) {
      cell.classList.add("muted-day");
    }

    const number = document.createElement("p");
    number.className = "day-number";
    number.textContent = String(date.getDate());
    cell.appendChild(number);

    const dateKey = toDateKey(date);
    const dayAppointments = getAppointmentsForDate(dateKey);

    // Show up to 3 chips in month view to keep cells readable.
    dayAppointments.slice(0, 3).forEach((item) => {
      cell.appendChild(createAppointmentChip(item));
    });

    if (dayAppointments.length > 3) {
      const more = document.createElement("p");
      more.className = "empty-state";
      more.textContent = `+${dayAppointments.length - 3} more`;
      cell.appendChild(more);
    }

    return cell;
  }

  // Button that shows appointment summary and opens details on click.
  function createAppointmentChip(appointment) {
    const chip = document.createElement("button");
    chip.className = `appointment-chip ${getMeetingClass(appointment.meetingType)}`;
    chip.type = "button";
    chip.textContent = `${appointment.startTime}-${appointment.endTime} ${appointment.title}`;
    chip.addEventListener("click", () => openDetailsModal(appointment));
    return chip;
  }

  // -----------------------------
  // 5) Date navigation
  // -----------------------------

  function getStartOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function goToPrevious() {
    if (currentView === "month") {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === "week") {
      currentDate.setDate(currentDate.getDate() - 7);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    render();
  }

  function goToNext() {
    if (currentView === "month") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === "week") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    render();
  }

  // -----------------------------
  // 6) Modal and form behavior
  // -----------------------------

  function openCreateModal() {
    appointmentModal.classList.remove("hidden");
    formError.classList.add("hidden");
    formError.textContent = "";
    appointmentForm.reset();
    dateInput.value = toDateKey(currentDate);
  }

  function closeCreateModal() {
    appointmentModal.classList.add("hidden");
  }

  function openDetailsModal(appointment) {
    detailsContent.innerHTML = `
      <p><strong>Title:</strong> ${appointment.title}</p>
      <p><strong>Date:</strong> ${formatDatePretty(appointment.date)}</p>
      <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
      <p><strong>Meeting Type:</strong> ${appointment.meetingType}</p>
      <p><strong>Notes:</strong> ${appointment.notes || "No notes added"}</p>
    `;
    detailsModal.classList.remove("hidden");
  }

  function closeDetailsModal() {
    detailsModal.classList.add("hidden");
  }

  function validateForm(data) {
    if (!data.title || !data.date || !data.startTime || !data.endTime || !data.meetingType) {
      return "Please fill in all required fields.";
    }

    if (data.endTime <= data.startTime) {
      return "End time must be later than start time.";
    }

    return "";
  }

  function handleCreateAppointment(event) {
    event.preventDefault();

    const data = {
      id: Date.now(),
      title: titleInput.value.trim(),
      date: dateInput.value,
      startTime: startTimeInput.value,
      endTime: endTimeInput.value,
      meetingType: meetingTypeInput.value,
      notes: notesInput.value.trim()
    };

    const validationError = validateForm(data);
    if (validationError) {
      formError.textContent = validationError;
      formError.classList.remove("hidden");
      return;
    }

    appointments.push(data);
    saveAppointments();
    closeCreateModal();
    render();
  }

  // -----------------------------
  // 7) Events
  // -----------------------------

  newAppointmentBtn.addEventListener("click", openCreateModal);
  closeModalBtn.addEventListener("click", closeCreateModal);
  cancelBtn.addEventListener("click", closeCreateModal);
  closeDetailsBtn.addEventListener("click", closeDetailsModal);

  appointmentForm.addEventListener("submit", handleCreateAppointment);

  prevBtn.addEventListener("click", goToPrevious);
  nextBtn.addEventListener("click", goToNext);

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view || "month";
      render();
    });
  });

  // Close modal when clicking the dark overlay area.
  appointmentModal.addEventListener("click", (event) => {
    if (event.target === appointmentModal) {
      closeCreateModal();
    }
  });

  detailsModal.addEventListener("click", (event) => {
    if (event.target === detailsModal) {
      closeDetailsModal();
    }
  });

  // Initial render
  render();
});
