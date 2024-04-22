// JavaScript Import

import { initialData } from "./initialData.js";
import { getTasks, saveTasks, createNewTask, putTask, deleteTask } from "./utils/taskFunctions.js";

function initializeData() {
  try {
    if (!localStorage.getItem('tasks')) {
      localStorage.setItem('tasks', JSON.stringify(initialData));
      localStorage.setItem('showSideBar', 'true');
    } else {
      console.log('Data already exists in localStorage');
    }
  } catch (error) {
    console.error('Error initializing data:', error.message); // Improved error message
  }
}

const elements = {
  sideBarDiv: document.getElementById("side-bar-div"),
  headerBoardName: document.getElementById("header-board-name"),
  layout: document.getElementById("layout"),
  columnDivs: document.querySelectorAll(".column-div"),
  filterDiv: document.getElementById("filterDiv"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),
  editTaskModal: document.querySelector(".edit-task-modal-window")
};

function refreshTasksUI() {
  try {
    const activeBoard = getTasks();
    filterAndDisplayTasksByBoard(activeBoard);
  } catch (error) {
    console.error('Error refreshing tasks UI:', error.message); // Improved error message
  }
}

function toggleModal(show, modal = elements.modalWindow) {
  try {
    if (modal) {
      modal.style.display = show ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Error toggling modal:', error.message); // Improved error message
  }
}

function openEditTaskModal(task) {
  const editModal = elements.editTaskModal;
  const taskTitleInput = editModal.querySelector("#edit-task-title-input");
  const taskDescriptionInput = editModal.querySelector("#edit-task-desc-input");

  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description;
  editModal.dataset.taskId = task.id;

  toggleModal(true, editModal);
}

function saveTaskChanges(taskId) {
  const editModal = elements.editTaskModal;
  const taskTitleInput = editModal.querySelector("#edit-task-title-input").value;
  const taskDescriptionInput = editModal.querySelector("#edit-task-desc-input").value;

  const updatedTask = {
    id: taskId,
    title: taskTitleInput,
    description: taskDescriptionInput
  };

  putTask(taskId, updatedTask);
  toggleModal(false, editModal);
  refreshTasksUI();
}

function setupEventListeners() {
  const showSideBarBtn = document.getElementById("show-side-bar-btn");
  const hideSideBarBtn = document.getElementById("hide-side-bar-btn");

  showSideBarBtn.addEventListener("click", () => {
    localStorage.setItem('showSideBar', 'true');
    toggleSidebar(true);
  });

  hideSideBarBtn.addEventListener("click", () => {
    localStorage.setItem('showSideBar', 'false');
    toggleSidebar(false);
  });

  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
  });

  elements.modalWindow.addEventListener('submit', event => {
    addTask(event);
  });

  const cancelAddTaskBtn = elements.modalWindow.querySelector('#cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.modalWindow);
  });

  const cancelEditBtn = elements.editTaskModal.querySelector('#cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
  });
  
  // Update the event listener for elements.editTaskModal to handle delete task button
  // Update the event listener for elements.editTaskModal to handle save and delete task buttons
elements.editTaskModal.addEventListener('click', event => {
  if (event.target.id === 'cancel-edit-btn' || event.target.id === 'filterDiv') {
    toggleModal(false, elements.editTaskModal);
  } else if (event.target.id === 'save-task-changes-btn') {
    const taskId = elements.editTaskModal.dataset.taskId;
    saveTaskChanges(taskId);
  } else if (event.target.id === 'delete-task-btn') {
    const taskId = elements.editTaskModal.dataset.taskId;
    deleteTask(taskId); // Delete the task
    toggleModal(false, elements.editTaskModal); // Hide the modal
    removeTaskFromUI(taskId); // Remove the task from UI
  }
});
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.themeSwitch.addEventListener('change', toggleTheme);
}

function addTaskToUI(task) {
  try {
    const columnDiv = document.querySelector(`.column-div[data-status="${task.status}"] .tasks-container`);
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    taskDiv.dataset.taskId = task.id;

    const taskTitle = document.createElement('h4');
    taskTitle.textContent = task.title;
    taskTitle.classList.add('task-title');
    taskDiv.appendChild(taskTitle);

    const taskDescription = document.createElement('p');
    taskDescription.textContent = task.description;
    taskDescription.classList.add('task-description');
    taskDiv.appendChild(taskDescription);

    // Add event listener to show edit modal when task is clicked
    taskDiv.addEventListener('click', () => {
      openEditTaskModal(task);
    });

    columnDiv.appendChild(taskDiv);
  } catch (error) {
    console.error('Error adding task to UI:', error.message); // Improved error message
  }
}


function addTask(event) {
  event.preventDefault();

  const taskTitleInput = elements.modalWindow.querySelector("#title-input").value;
  const taskDescriptionInput = elements.modalWindow.querySelector("#desc-input").value;
  const taskStatusInput = elements.modalWindow.querySelector("#select-status").value;

  // Basic input validation
  if (!taskTitleInput || !taskDescriptionInput || !taskStatusInput) {
    console.error('All fields are required.');
    return;
  }

  const task = {
    title: taskTitleInput,
    description: taskDescriptionInput,
    status: taskStatusInput,
    board: JSON.parse(localStorage.getItem("activeBoard"))
  };

  const newTask = createNewTask(task);

  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    event.target.reset();

    elements.layout.style.display = 'block';

    saveTasks(getTasks()); // Save tasks after adding the new task
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div");
  const showSideBarBtn = document.getElementById("show-side-bar-btn");

  if (show) {
    sidebar.style.display = 'block';
    showSideBarBtn.style.display = "none";
  } else {
    sidebar.style.display = 'none';
    showSideBarBtn.style.display = "block";
  }
}

function toggleTheme() {
  const body = document.body;
  const isLightTheme = elements.themeSwitch.checked;
  body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

function filterAndDisplayTasksByBoard(activeBoard) {
  try {
    // Clear existing tasks from UI
    clearTasksFromUI();

    if (!activeBoard || !activeBoard.tasks) {
      console.error('Active board or its tasks are missing.');
      return;
    }

    // Filter tasks based on active board
    const filteredTasks = activeBoard.tasks.filter(task => task.board === activeBoard.id);

    // Display filtered tasks
    filteredTasks.forEach(task => {
      addTaskToUI(task);
    });
  } catch (error) {
    console.error('Error filtering and displaying tasks:', error.message);
  }
}

function clearTasksFromUI() {
  try {
    // Clear tasks from all column-divs
    elements.columnDivs.forEach(columnDiv => {
      columnDiv.querySelector('.tasks-container').innerHTML = '';
    });
  } catch (error) {
    console.error('Error clearing tasks from UI:', error.message);
  }
}

function removeTaskFromUI(taskId) {
  try {
    const taskToRemove = document.querySelector(`.task[data-task-id="${taskId}"]`);
    if (taskToRemove) {
      taskToRemove.remove();
    }
  } catch (error) {
    console.error('Error removing task from UI:', error.message);
  }
}

function init() {
  try {
    setupEventListeners();
    const showSidebar = localStorage.getItem('showSideBar') === 'true';
    toggleSidebar(showSidebar);
    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme);
    initializeData();
    refreshTasksUI(); // Refresh UI with tasks on initialization
  } catch (error) {
    console.error('Error initializing application:', error.message); // Improved error message
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init(); // Call init function when DOM content is loaded
});