
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Function to save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks.map(task => JSON.parse(JSON.stringify(task)))));
}


// Function to create a new task
function createNewTask(task) {
  const tasks = getTasks();
  const newTask = { id: generateId(), ...task };
  tasks.push(newTask);
  saveTasks(tasks); // Save tasks to local storage
  return newTask;
}

// Function to update an existing task
function putTask(taskId, updatedTask) {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === taskId);
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks); // Save updated tasks to local storage
  }
}

// Function to delete a task
function deleteTask(taskId) {
  const tasks = getTasks().filter(task => task.id !== taskId);
  saveTasks(tasks); // Save updated tasks to local storage
}

// Function to generate a unique task ID
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Exporting functions
export { getTasks, saveTasks, createNewTask, putTask, deleteTask };
