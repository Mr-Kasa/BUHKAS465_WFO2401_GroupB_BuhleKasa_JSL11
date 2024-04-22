// Import statements for initialData and taskFunctions
import { initialData } from "./initialData.js";
import { getTasks, saveTasks, createNewTask, putTask, deleteTask } from "./utils/taskFunctions.js";

// Function to initialize data if not already initialized
function initializeData() {
  try {
    if (!localStorage.getItem('tasks')) {
      localStorage.setItem('tasks', JSON.stringify(initialData));
      localStorage.setItem('showSideBar', 'true');
    } else {
      console.log('Data already exists in localStorage');
      // Retrieve tasks from localStorage
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      // Display tasks on the UI
      tasks.forEach(task => {
        addTaskToUI(task);
      });
    }
  } catch (error) {
    console.error('Error initializing data:', error.message);
  }
}

// Object containing DOM elements
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

// Function to refresh UI with tasks for the active board
function refreshTasksUI() {
  try {
    const activeBoard = JSON.parse(localStorage.getItem("activeBoard"));
    filterAndDisplayTasksByBoard(activeBoard);
  } catch (error) {
    console.error('Error refreshing tasks UI:', error.message);
  }
}

// Function to toggle modal visibility
function toggleModal(show, modal = elements.modalWindow) {
  try {
    if (modal) {
      modal.style.display = show ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Error toggling modal:', error.message);
  }
}

// Function to open edit task modal
function openEditTaskModal(task) {
  const editModal = elements.editTaskModal;
  const taskTitleInput = editModal.querySelector("#edit-task-title-input");
  const taskDescriptionInput = editModal.querySelector("#edit-task-desc-input");

  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description;
  editModal.dataset.taskId = task.id;

  toggleModal(true, editModal);
}

// Function to save task changes
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

// Function to set up event listeners
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
  elements.editTaskModal.addEventListener('click', event => {
    if (event.target.id === 'cancel-edit-btn' || event.target.id === 'filterDiv') {
      toggleModal(false, elements.editTaskModal);
    } else if (event.target.id === 'save-task-changes-btn') {
      const taskId = elements.editTaskModal.dataset.taskId;
      saveTaskChanges(taskId);
    } else if (event.target.id === 'delete-task-btn') {
      const taskId = elements.editTaskModal.dataset.taskId;
      deleteTask(taskId);
      toggleModal(false, elements.editTaskModal);
      removeTaskFromUI(taskId);
    }
  });

  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.themeSwitch.addEventListener('change', toggleTheme);
}

// Function to add task to UI
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
    console.error('Error adding task to UI:', error.message);
  }
}

// Function to add task
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

  const activeBoard = JSON.parse(localStorage.getItem("activeBoard"));
  const task = {
    title: taskTitleInput,
    description: taskDescriptionInput,
    status: taskStatusInput,
    board: activeBoard ? activeBoard.id : null
  };

  const newTask = createNewTask(task);

  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    event.target.reset();

    elements.layout.style.display = 'block';

    saveTasks(getTasks());
  }
}

// Function to toggle sidebar
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

// Function to toggle theme
function toggleTheme() {
  const body = document.body;
  const isLightTheme = elements.themeSwitch.checked;
  body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

// Function to filter and display tasks by board
function filterAndDisplayTasksByBoard(activeBoard) {
  try {
    clearTasksFromUI();

    if (!activeBoard || !activeBoard.tasks) {
      console.error('Active board or its tasks are missing.');
      return;
    }

    const filteredTasks = activeBoard.tasks.filter(task => task.board === activeBoard.id);

    filteredTasks.forEach(task => {
      addTaskToUI(task);
    });
  } catch (error) {
    console.error('Error filtering and displaying tasks:', error.message);
  }
}

// Function to remove task from UI
function removeTaskFromUI(taskId) {
  const taskDiv = document.querySelector(`.task[data-task-id="${taskId}"]`);
  if (taskDiv) {
    taskDiv.remove();
  }
}

// Initialization function
function init() {
  try {
    setupEventListeners();
    const showSidebar = localStorage.getItem('showSideBar') === 'true';
    toggleSidebar(showSidebar);
    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme);
    initializeData();
    refreshTasksUI();
  } catch (error) {
    console.error('Error initializing application:', error.message);
  }
}

// Call init function when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
});
