# TaskFlow - Premium To-Do App

TaskFlow is a modern, responsive, and high-fidelity card-based To-Do application designed for seamless task management. Built with pure HTML5, CSS3, and Vanilla JavaScript, it offers a premium user experience featuring subtle micro-animations, priority sorting, local state persistence, and automatic light/dark theme synchronization.

## Features

- **Add Task**: Quickly insert tasks with trimmed inputs and custom empty-form shake validation.
- **Edit Task**: Rename existing task titles inline by double-clicking the title or clicking the edit button.
- **Delete Task**: Safe individual deletions guided by a beautiful, custom confirmation modal.
- **Complete Task**: Easily toggle completion checkboxes to strike-through tasks.
- **Search Tasks**: Real-time keyword filter query to search for tasks as you type.
- **Filter Tasks**: Categorize viewports instantly between "All", "Pending", and "Completed" states.
- **Due Dates**: Assign deadline dates to tasks with clear, automatic overdue labels colored in crimson red.
- **Priority Levels**: Support for High, Medium, and Low priorities with vibrant, theme-conscious badges.
- **Smart Priority Sorting**: Pending tasks are sorted automatically by Priority (High > Medium > Low), then by due date or creation date. Completed tasks are automatically grouped at the bottom.
- **Dark Mode**: Smooth background color transitions between Light and Dark mode using a header toggle.
- **LocalStorage**: Auto-save and restore tasks list and theme choices on page reload.
- **Keyboard Shortcuts**: Accessible keyboard support, allowing task creations by hitting `Enter`.
- **Responsive Design**: Mobile-first responsive styling optimized across narrow viewports, tablets, and wide screens.
## Folder Structure

```text
todo-app/
│
├── index.html
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   └── script.js
│
├── assets/
│   ├── icons/
│   └── images/
│
├── README.md
└── .gitignore
```

## Technologies Used

- **HTML5**: Semantic layout hierarchy.
- **CSS3**: Variables, Flexbox, Grid, keyframe animations, media query structures.
- **JavaScript (ES6+)**: Event delegation, storage persistence, custom dialog hooks, array sorting.
- **Netlify**: Cloud hosting.

## Getting Started

1. Clone the repository to your local system:
   ```bash
   git clone https://github.com/JayanthKumarChinthakindi/todo-app.git
   ```
2. Open the project folder:
   ```bash
   cd todo-app
   ```
3. Open `index.html` in any modern web browser.

## Live Demo

- **GitHub Repository**: [GitHub Repository](https://github.com/JayanthKumarChinthakindi/todo-app)
- **Netlify Live Site**: [TaskFlow Live Site](https://jayanth-taskflow.netlify.app)
