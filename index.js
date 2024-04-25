// Import statements for initialData and taskFunctions
import { initialData } from "./initialData.js";
import { getTasks, saveTasks, createNewTask, putTask, deleteTask,} from "./utils/taskFunctions.js";



// Function to initialize data if not already initialized
function initializeData() {
  try {
    // Check if tasks exist in localStorage
    let tasks = getTasks();

    if (!tasks || tasks.length === 0) {
      // If not, initialize with initialData
      tasks = initialData;
      // Save initialData to localStorage after stringifying
      saveTasks(tasks); // Call saveTasks function
    } else {
      console.log('Data already exists in localStorage');
    }

    // Display tasks on the UI
    tasks.forEach(task => {
      // Create a deep copy of the task to ensure it's editable
      const editableTask = JSON.parse(JSON.stringify(task));
      addTaskToUI(editableTask);
    });
  } catch (error) {
    console.error('Error initializing data:', error.message);
  }
}


// Function to save tasks to localStorage in string form
function saveTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
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

function openEditTaskModal(task) {
  console.log('Opening edit modal for task:', task); // Add this log statement
  const editModal = elements.editTaskModal;
  const taskId = task.id.toString(); // Convert task ID to string
  console.log(taskId)
  // Retrieve the task details from local storage based on the task ID
  const tasks = getTasks();
  console.log('Tasks from localStorage:', tasks); // Add this log statement
  
  const taskFromLocalStorage = tasks.find(t => t.id == taskId);
  if (taskFromLocalStorage) {
    const taskTitleInput = editModal.querySelector("#edit-task-title-input");
    const taskDescriptionInput = editModal.querySelector("#edit-task-desc-input");
    const taskStatusSelect = editModal.querySelector("#edit-select-status");

    // Clear previous data in the modal fields
    taskTitleInput.value = "";
    taskDescriptionInput.value = "";
    taskStatusSelect.value = "";

    // Populate the modal inputs with the latest task details
    taskTitleInput.value = taskFromLocalStorage.title;
    taskDescriptionInput.value = taskFromLocalStorage.description;
    taskStatusSelect.value = taskFromLocalStorage.status;
    editModal.dataset.taskId = taskFromLocalStorage.id;
    toggleModal(true, editModal);
    console.log('Task ID:', taskId);
    console.log('Tasks from localStorage:', tasks);
  } else {
    console.error('Task not found in local storage.');
    // Provide feedback to the user, e.g., display an error message in the modal
  }
}



function saveTaskChanges(taskId) {
  try {
     console.log('Task ID received in saveTaskChanges:', taskId);
    const editModal = elements.editTaskModal;
    const taskTitleInput = editModal.querySelector("#edit-task-title-input").value;
    const taskDescriptionInput = editModal.querySelector("#edit-task-desc-input").value;
    const taskStatusInput = editModal.querySelector("#edit-select-status").value;

    // Retrieve the original task details from localStorage
    const tasks = getTasks();
    console.log("Tasks from localStorage:", tasks);
    console.log("Target task ID:", taskId);

    let originalTask;
    if (tasks.length === 0) {
      console.log("No tasks found in localStorage.");
    } else {
      for (let i = 0; i < tasks.length; i++) {
        console.log("Checking task:", tasks[i]);
        console.log("Type of taskId:", typeof taskId);
        console.log("Type of tasks[i].id:", typeof tasks[i].id);
        console.log("Current task ID:", tasks[i].id);
        if (tasks[i].id.toString() === taskId) {
          originalTask = tasks[i];
          console.log("Original task found:", originalTask);
          break;
        }
      }
    }

    console.log(originalTask); // Log the originalTask to see if it's null or undefined

    // Check if values have changed
    const updatedTask = {
      id: taskId,
      title: taskTitleInput !== "" ? taskTitleInput : originalTask.title,
      description: taskDescriptionInput !== "" ? taskDescriptionInput : originalTask.description,
      status: taskStatusInput !== "" ? taskStatusInput : originalTask.status
    };

    // Update the task in localStorage
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return updatedTask;
      } else {
        return task;
      }
    });
    saveTasksToLocalStorage(updatedTasks);

    // Update the task in the UI
    const taskElement = document.querySelector(`.task[data-task-id="${taskId}"]`);
    console.log(taskElement); // Log the taskElement to see if it's null or undefined
    if (taskElement) {
      const taskTitle = taskElement.querySelector('.task-title');
      const taskDescription = taskElement.querySelector('.task-description');
      const taskStatus = taskElement.querySelector('.task-status');
    
      // Check if taskTitle, taskDescription, and taskStatus are not null
      if (taskTitle && taskDescription && taskStatus) {
        // Update UI with new title, description, and status
        taskTitle.textContent = updatedTask.title;
        taskDescription.textContent = updatedTask.description;
        taskStatus.textContent = updatedTask.status;
    
        // Move the task to the appropriate status column if the status has changed
        if (taskStatusInput !== taskElement.parentElement.dataset.status) {
          taskElement.remove();
          addTaskToUI(updatedTask);
        }
      } else {
        console.error('One or more task elements are null.');
        console.log('taskTitle:', taskTitle);
console.log('taskDescription:', taskDescription);
console.log('taskStatus:', taskStatus);
      }
    }
    

    // Close the edit modal
    toggleModal(false, editModal);
  } catch (error) {
    console.error('Error saving task changes:', error.message);
  }
}


// Function to delete a task from UI and localStorage
function deleteTaskFromUI(taskId) {
  removeTaskFromUI(taskId);
  // Delete the task from localStorage
  deleteTask(taskId);
}

// Function to remove a task from UI
function removeTaskFromUI(taskId) {
  const taskElement = document.querySelector(`.task[data-task-id="${taskId}"]`);
  if (taskElement) {
    taskElement.remove();
  }
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

  elements.createNewTaskBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event propagation
    toggleModal(true);
  });

  elements.modalWindow.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event propagation
  });

  elements.modalWindow.addEventListener('submit', event => {
    addTask(event);
  });

  const cancelAddTaskBtn = elements.modalWindow.querySelector('#cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.modalWindow);
  });

  const cancelEditBtn = elements.editTaskModal.querySelector('#cancel-edit-btn');
  cancelEditBtn.addEventListener('click', event => {
    event.preventDefault();
    toggleModal(false, elements.editTaskModal);
  });

  elements.editTaskModal.addEventListener('click', event => {
    if (event.target.id === 'cancel-edit-btn' || event.target.id === 'filterDiv') {
      event.preventDefault();
      toggleModal(false, elements.editTaskModal);
    } else if (event.target.id === 'save-task-changes-btn') {
      const taskId = elements.editTaskModal.dataset.taskId;
      saveTaskChanges(taskId)
      toggleModal(false, elements.editTaskModal);; // Call saveTaskChanges function
    } else if (event.target.id === 'delete-task-btn') {
      const taskId = elements.editTaskModal.dataset.taskId;
      deleteTaskFromUI(taskId);
      toggleModal(false, elements.editTaskModal);
    }
  });
}

  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.themeSwitch.addEventListener('change', toggleTheme);

// Inside setupEventListeners function
elements.layout.addEventListener('click', event => {
  const taskElement = event.target.closest('.task');
  if (taskElement) {
    const taskId = taskElement.dataset.taskId;
    console.log('Clicked task ID:', taskId); // Add this log statement
    const tasks = getTasks();
    const task = tasks.find(task => task.id === taskId);
    if (task) {
      openEditTaskModal(task);
    }
  } else {
    // If the edit modal is open, cancel changes when clicking outside of a task
    if (elements.editTaskModal.style.display === 'block') {
      toggleModal(false, elements.editTaskModal);
    }
  }
});


  // Close modal or form when clicking outside
  document.addEventListener('click', event => {
    const modalVisible = elements.modalWindow.style.display === 'block';
    const formVisible = elements.editTaskModal.style.display === 'block';

    if (modalVisible && !elements.modalWindow.contains(event.target)) {
      toggleModal(false, elements.modalWindow);
    }

    if (formVisible && !elements.editTaskModal.contains(event.target)) {
      toggleModal(false, elements.editTaskModal);
    }
  });


  function addTaskToUI(task) {
    try {
      const columnDiv = document.querySelector(`.column-div[data-status="${task.status}"] .tasks-container`);
      const taskDiv = document.createElement('div');
      taskDiv.classList.add('task');
      taskDiv.dataset.taskId = task.id;
  
      taskDiv.style.backgroundColor = 'green';
      taskDiv.style.padding = '2rem';
      taskDiv.style.margin = '2rem';
      taskDiv.style.borderRadius = '2rem';
  
      const taskTitle = document.createElement('h4');
      taskTitle.textContent = task.title;
      taskTitle.classList.add('task-title');
      taskDiv.appendChild(taskTitle);
  
      // Create taskDescription element (invisible)
      const taskDescription = document.createElement('p');
      taskDescription.textContent = task.description;
      taskDescription.classList.add('task-description');
      taskDescription.style.display = 'none'; // Make it invisible
      taskDiv.appendChild(taskDescription);
  
      // Create taskStatus element (invisible)
      const taskStatus = document.createElement('span');
      taskStatus.textContent = task.status;
      taskStatus.classList.add('task-status');
      taskStatus.style.display = 'none'; // Make it invisible
      taskDiv.appendChild(taskStatus);
  
      // Add event listener to show edit modal when task is clicked
      taskDiv.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event propagation
        openEditTaskModal(task);
      });
  
      columnDiv.appendChild(taskDiv);
    } catch (error) {
      console.error('Error adding task to UI:', error.message);
    }
  }


  
  function addTask(event) {
    event.preventDefault();
  
    // Function to generate a unique ID
    function generateUniqueId() {
      const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
      const randomString = Math.random().toString(36).substr(2, 5); // Generate random string
      return timestamp + randomString; // Combine timestamp and random string
    }
  
    const taskTitleInput = elements.modalWindow.querySelector("#title-input").value;
    const taskDescriptionInput = elements.modalWindow.querySelector("#desc-input").value;
    const taskStatusInput = elements.modalWindow.querySelector("#select-status").value;
  
    // Basic input validation
    if (!taskTitleInput || !taskDescriptionInput || !taskStatusInput) {
      console.error('All fields are required.');
      return;
    }
  
    const activeBoard = JSON.parse(localStorage.getItem("activeBoard"));
    console.log("Active Board:", activeBoard); // Debug statement
  
    const taskId = generateUniqueId(); // Generate a unique task ID
  
    const task = {
      id: taskId,
      title: taskTitleInput,
      description: taskDescriptionInput,
      status: taskStatusInput,
      board: activeBoard ? activeBoard.id : null
    };
  
    console.log("New Task:", task); // Debug statement
  
    const newTask = createNewTask(task);
    console.log("Newly created task:", newTask); // Debug statement
  
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      event.target.reset();
  
      elements.layout.style.display = 'block';
  
      const tasks = getTasks();
      console.log("Tasks from localStorage before adding new task:", tasks); // Debug statement
  
      tasks.push(newTask);
      console.log("Tasks after adding new task:", tasks); // Debug statement
  
      saveTasksToLocalStorage(tasks);
      console.log("Tasks saved to localStorage."); // Debug statement
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
    if (!activeBoard || !activeBoard.tasks) {
      console.error('Active board or its tasks are missing.');
      return;
    }

    const filteredTasks = activeBoard.tasks.filter(task => task.board === activeBoard.id);

    filteredTasks.forEach(task => {
      addTaskToUI(task);
      refreshTasksUI();
    });
  } catch (error) {
    console.error('Error filtering and displaying tasks:', error.message);
  }
}

function refreshTasksUI() {
  try {
    // Clear all tasks from UI
    const tasksContainers = document.querySelectorAll('.tasks-container');
    tasksContainers.forEach(container => {
      container.innerHTML = '';
    });

    // Retrieve tasks from localStorage
    const tasks = getTasks();

    // Render tasks to UI
    tasks.forEach(task => {
      addTaskToUI(task);
    });
  } catch (error) {
    console.error('Error refreshing tasks UI:', error.message);
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