// Run app setup only after HTML is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get references to input, button, and task list
  const taskInput = document.getElementById("taskInput");
  const addTaskButton = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  // Stop early if required elements are missing
  if (!taskInput || !addTaskButton || !taskList) {
    return;
  }

  // Keep all tasks in this array
  let tasks = [];

  // Load tasks from local storage when page starts
  function loadTasks() {
    try {
      const savedTasks = localStorage.getItem("todoTasks");

      // If there are saved tasks, convert JSON text back to an array
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
      }
    } catch (error) {
      // If storage is not available, continue without saved data
      tasks = [];
    }
  }

  // Save the current tasks array into local storage
  function saveTasks() {
    try {
      localStorage.setItem("todoTasks", JSON.stringify(tasks));
    } catch (error) {
      // If storage is blocked, app still works for current session
    }
  }

  // Render all tasks on the page
  function renderTasks() {
    // Clear current list before drawing again
    taskList.innerHTML = "";

    // Create one list item for each task
    tasks.forEach(function (task, index) {
      const listItem = document.createElement("li");
      listItem.className = "task-item";

      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = task;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "Delete";

      // Delete this specific task when button is clicked
      deleteButton.addEventListener("click", function () {
        deleteTask(index);
      });

      listItem.appendChild(taskText);
      listItem.appendChild(deleteButton);
      taskList.appendChild(listItem);
    });
  }

  // Add a new task from input
  function addTask() {
    const newTask = taskInput.value.trim();

    // Do nothing if input is empty
    if (!newTask) {
      return;
    }

    tasks.push(newTask);
    taskInput.value = "";
    saveTasks();
    renderTasks();
  }

  // Remove task by index
  function deleteTask(taskIndex) {
    tasks.splice(taskIndex, 1);
    saveTasks();
    renderTasks();
  }

  // Add task when add button is clicked
  addTaskButton.addEventListener("click", addTask);

  // Also add task when Enter key is pressed in input
  taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addTask();
    }
  });

  // Initial app setup
  loadTasks();
  renderTasks();
});
