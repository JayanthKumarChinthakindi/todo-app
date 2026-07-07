/**
 * TaskFlow - Premium To-Do App
 * Vanilla JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Application State ---
  let tasks = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let taskIdToDelete = null;
  const todayISO = new Date().toISOString().split('T')[0];

  // --- DOM Elements ---
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const dueDateInput = document.getElementById('dueDateInput');
  const taskList = document.getElementById('taskList');
  
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  
  const filterButtons = document.querySelectorAll('.btn-filter');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  
  const totalCounter = document.getElementById('totalCounter');
  const pendingCounter = document.getElementById('pendingCounter');
  const completedCounter = document.getElementById('completedCounter');
  const emptyState = document.getElementById('emptyState');
  
  const themeToggle = document.getElementById('themeToggle');
  
  // Custom Modal Elements
  const confirmModal = document.getElementById('confirmModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // --- Initial Setup ---
  initTheme();
  loadTasks();
  renderTasks();

  // --- Event Listeners ---
  
  // Task Submission
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
  });

  // Theme Toggling
  themeToggle.addEventListener('click', toggleTheme);

  // Search Functionality
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    toggleClearSearchBtn();
    renderTasks();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    toggleClearSearchBtn();
    renderTasks();
    searchInput.focus();
  });

  // Filter Toolbar Buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      filterTasks(e.target.dataset.filter);
    });
  });

  // Clear Completed Tasks
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Task List Interaction (Event Delegation)
  taskList.addEventListener('click', handleTaskListClick);
  taskList.addEventListener('dblclick', handleTaskListDoubleClick);

  // Modal Cancel / Backdrop Clicks
  cancelDeleteBtn.addEventListener('click', closeConfirmModal);
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
  });

  // Modal Delete Confirm Click
  confirmDeleteBtn.addEventListener('click', () => {
    if (taskIdToDelete !== null) {
      executeDelete(taskIdToDelete);
    }
  });

  // Escape key mapping for modal closing
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !confirmModal.classList.contains('hidden')) {
      closeConfirmModal();
    }
  });

  // Set default minimum date to today for due date input
  dueDateInput.min = todayISO;

  // --- Core Functions ---

  /**
   * Loads tasks from LocalStorage or injects sample tasks for first-time use
   */
  function loadTasks() {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        tasks = JSON.parse(storedTasks);
      } else {
        // First-time load setup with beautiful samples
        tasks = [
          {
            id: Date.now() - 3000,
            title: "🚀 Learn Vanilla JS event delegation practices",
            completed: false,
            priority: "High",
            dueDate: todayISO,
            createdAt: new Date(Date.now() - 3000).toISOString()
          },
          {
            id: Date.now() - 2000,
            title: "🎨 Design high-fidelity Glassmorphic UI layout",
            completed: true,
            priority: "Medium",
            dueDate: todayISO,
            createdAt: new Date(Date.now() - 2000).toISOString()
          },
          {
            id: Date.now() - 1000,
            title: "📝 Write professional README documentation",
            completed: false,
            priority: "Low",
            dueDate: "",
            createdAt: new Date(Date.now() - 1000).toISOString()
          }
        ];
        saveTasks();
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
      tasks = [];
    }
  }

  /**
   * Saves task state array into LocalStorage
   */
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  /**
   * Creates a new task object, validates values, and handles injection animation
   */
  function addTask() {
    const titleVal = taskInput.value.trim();
    const priorityVal = prioritySelect.value;
    const dueDateVal = dueDateInput.value;

    if (!titleVal) {
      // Small shake animation feedback for empty inputs
      taskInput.classList.add('error-shake');
      taskInput.focus();
      setTimeout(() => taskInput.classList.remove('error-shake'), 500);
      return;
    }

    const newTask = {
      id: Date.now(),
      title: titleVal,
      completed: false,
      priority: priorityVal,
      dueDate: dueDateVal,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    
    // Clear inputs
    taskInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'Medium';

    renderTasks();
    updateCounters();
  }

  /**
   * Intercepts delete actions and shows custom modal overlay
   */
  function deleteTask(id) {
    taskIdToDelete = id;
    confirmModal.classList.remove('hidden');
    // Force browser reflow to enable transition fade
    confirmModal.offsetWidth;
    confirmModal.classList.add('active');
    confirmModal.setAttribute('aria-hidden', 'false');
  }

  /**
   * Closes confirmation modal cleanly
   */
  function closeConfirmModal() {
    confirmModal.classList.remove('active');
    confirmModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      confirmModal.classList.add('hidden');
      taskIdToDelete = null;
    }, 250);
  }

  /**
   * Animates list-item delete, updates state array and counters
   */
  function executeDelete(id) {
    closeConfirmModal();
    const taskEl = taskList.querySelector(`[data-id="${id}"]`);
    if (taskEl) {
      taskEl.classList.add('deleting');
      // Wait for deletion animation to conclude
      taskEl.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateCounters();
      });
    }
  }

  /**
   * Replaces title block with inline editing text input and binds save handlers
   */
  function editTask(taskItemEl) {
    const id = parseInt(taskItemEl.dataset.id);
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return; // Prevent editing completed tasks

    const detailsEl = taskItemEl.querySelector('.task-details');
    const titleWrapper = detailsEl.querySelector('.task-title-wrapper');
    const titleSpan = titleWrapper.querySelector('.task-title');
    
    // Avoid double edit layout triggers
    if (titleWrapper.querySelector('.task-edit-input')) return;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.title;

    titleSpan.style.display = 'none';
    titleWrapper.appendChild(editInput);
    editInput.focus();
    editInput.select();

    // Save editing action
    const saveChanges = () => {
      const updatedTitle = editInput.value.trim();
      if (updatedTitle && updatedTitle !== task.title) {
        task.title = updatedTitle;
        saveTasks();
      }
      renderTasks();
    };

    // Cancel editing action
    const cancelChanges = () => {
      renderTasks();
    };

    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveChanges();
      } else if (e.key === 'Escape') {
        cancelChanges();
      }
    });

    editInput.addEventListener('blur', saveChanges);
  }

  /**
   * Toggles task completion state checkbox
   */
  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      updateCounters();
    }
  }

  /**
   * Sorts priority values into integer categories for algorithm
   */
  function getPriorityWeight(priority) {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  }

  /**
   * Main rendering routine. Sorts, filters, builds elements and binds accessibility attributes
   */
  function renderTasks() {
    taskList.innerHTML = '';

    // 1. Filter tasks
    let filtered = tasks;
    if (currentFilter === 'pending') {
      filtered = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filtered = tasks.filter(t => t.completed);
    }

    // 2. Search tasks
    if (searchQuery) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery));
    }

    // 3. Smart Sorting Algorithm:
    // - Uncompleted tasks first, Completed tasks last.
    // - Within uncompleted: High Priority > Medium > Low.
    // - Within same priority: Sort by due date (earlier date first; items with dates take priority over no-dates).
    // - If no due dates, sort by creation timestamp (newest first).
    const sorted = [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      if (!a.completed) {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // 4. Update Empty State Visibility
    if (sorted.length === 0) {
      emptyState.classList.remove('hidden');
      // Customize empty state wording depending on current actions
      if (searchQuery) {
        document.getElementById('emptyStateTitle').textContent = "No matching tasks";
        document.getElementById('emptyStateText').textContent = "Try refining your keywords or search query.";
      } else if (currentFilter === 'completed') {
        document.getElementById('emptyStateTitle').textContent = "No completed tasks yet";
        document.getElementById('emptyStateText').textContent = "Finish outstanding items to see them archive here.";
      } else if (currentFilter === 'pending') {
        document.getElementById('emptyStateTitle').textContent = "No pending tasks!";
        document.getElementById('emptyStateText').textContent = "Hooray! Relax, or create a new task to organize next steps.";
      } else {
        document.getElementById('emptyStateTitle').textContent = "Get started with a clean slate";
        document.getElementById('emptyStateText').textContent = "Add some tasks, set due dates, and prioritize your goals.";
      }
    } else {
      emptyState.classList.add('hidden');
    }

    // 5. Render individual elements using DocumentFragment for rendering performance
    const fragment = document.createDocumentFragment();

    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      // Check for overdue state
      const isTaskOverdue = isOverdue(task.dueDate, task.completed);

      // Checkbox container
      const leftDiv = document.createElement('div');
      leftDiv.className = 'task-left';

      const labelCheckbox = document.createElement('label');
      labelCheckbox.className = 'checkbox-container';
      labelCheckbox.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'pending' : 'completed'}`);

      const inputCheck = document.createElement('input');
      inputCheck.type = 'checkbox';
      inputCheck.checked = task.completed;
      inputCheck.className = 'task-checkbox';

      const checkmarkSpan = document.createElement('span');
      checkmarkSpan.className = 'checkbox-checkmark';

      labelCheckbox.appendChild(inputCheck);
      labelCheckbox.appendChild(checkmarkSpan);
      leftDiv.appendChild(labelCheckbox);

      // Details structure
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'task-details';

      const titleWrapper = document.createElement('div');
      titleWrapper.className = 'task-title-wrapper';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'task-title';
      titleSpan.textContent = task.title;
      titleSpan.title = "Double-click to edit";
      titleWrapper.appendChild(titleSpan);
      detailsDiv.appendChild(titleWrapper);

      // Meta container (priority badge, due date)
      const metaDiv = document.createElement('div');
      metaDiv.className = 'task-meta';

      const priorityBadge = document.createElement('span');
      priorityBadge.className = `badge-priority ${task.priority.toLowerCase()}`;
      priorityBadge.textContent = task.priority;
      metaDiv.appendChild(priorityBadge);

      if (task.dueDate) {
        const dueDateBadge = document.createElement('span');
        dueDateBadge.className = `task-due-date ${isTaskOverdue ? 'overdue' : ''}`;
        
        // Inline Calendar icon
        dueDateBadge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${formatDateString(task.dueDate)}</span>
        `;
        
        if (isTaskOverdue) {
          dueDateBadge.setAttribute('title', 'This task is overdue!');
        }
        metaDiv.appendChild(dueDateBadge);
      }

      detailsDiv.appendChild(metaDiv);
      leftDiv.appendChild(detailsDiv);
      li.appendChild(leftDiv);

      // Actions section
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-task-action btn-edit';
      editBtn.setAttribute('aria-label', `Edit task title: "${task.title}"`);
      editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
      if (task.completed) {
        editBtn.disabled = true;
        editBtn.style.opacity = '0.35';
        editBtn.style.cursor = 'not-allowed';
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-task-action btn-delete';
      deleteBtn.setAttribute('aria-label', `Delete task: "${task.title}"`);
      deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      li.appendChild(actionsDiv);

      fragment.appendChild(li);
    });

    taskList.appendChild(fragment);
    updateCounters();
  }

  /**
   * Handles task click delegation (checkbox, delete triggers, edit triggers)
   */
  function handleTaskListClick(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const id = parseInt(taskItem.dataset.id);

    // 1. Checkbox toggle event
    if (e.target.classList.contains('task-checkbox') || e.target.closest('.checkbox-container')) {
      // Ensure we don't double trigger toggle if target is wrapper label click
      if (e.target.tagName !== 'INPUT') return;
      toggleTask(id);
    }
    
    // 2. Delete button event
    else if (e.target.closest('.btn-delete')) {
      deleteTask(id);
    }
    
    // 3. Edit button event
    else if (e.target.closest('.btn-edit')) {
      editTask(taskItem);
    }
  }

  /**
   * Double clicking on task items will launch inline title editing
   */
  function handleTaskListDoubleClick(e) {
    const titleSpan = e.target.closest('.task-title');
    if (!titleSpan) return;

    const taskItem = titleSpan.closest('.task-item');
    if (taskItem) {
      editTask(taskItem);
    }
  }

  /**
   * Category Filter state modifier
   */
  function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();
  }

  /**
   * Updates display indicators for stats cards
   */
  function updateCounters() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCounter.textContent = total;
    pendingCounter.textContent = pending;
    completedCounter.textContent = completed;
  }

  /**
   * Batch processes pending array filters, keeping only non-completed tasks
   */
  function clearCompleted() {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    if (completedTasksCount === 0) return;

    // Apply deleting class to list elements for smooth fade-out animation first
    const completedElements = taskList.querySelectorAll('.task-item.completed');
    
    if (completedElements.length > 0) {
      completedElements.forEach(el => el.classList.add('deleting'));
      
      // Wait for transition, then save and re-render
      completedElements[0].addEventListener('animationend', () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateCounters();
      }, { once: true });
    } else {
      tasks = tasks.filter(t => !t.completed);
      saveTasks();
      renderTasks();
      updateCounters();
    }
  }

  // --- Theme Utilities ---

  /**
   * Setup theme class mappings based on Storage values
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /**
   * Smoothly changes system dataset attributes and updates localStorage state
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // --- Helper Functions ---

  /**
   * Determines if the selected due date is before today
   */
  function isOverdue(dueDateString, completed) {
    if (!dueDateString || completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  /**
   * Formats ISO dates into readable visual strings
   */
  function formatDateString(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Format like 'Jul 7, 2026'
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  /**
   * Toggle visibility of close-search buttons depending on text length
   */
  function toggleClearSearchBtn() {
    if (searchInput.value.length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
  }
});
