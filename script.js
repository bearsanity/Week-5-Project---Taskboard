// 02-Challenge: Task Board (Unsolved Starter)
//
// Use this file to implement:
// - Task creation
// - Task rendering
// - Drag-and-drop across columns
// - Color-coding by due date using Day.js
// - Persistence with localStorage

// ===== State & Initialization =====

// Load tasks and nextId from localStorage (or use defaults)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

// Utility to save tasks + nextId
function saveState() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', JSON.stringify(nextId));
}

// ===== Core Functions (implement these) =====

// TODO: generateTaskId()
// - Return a unique id
// - Increment nextId and persist using saveState()
function generateTaskId() {
    const id = nextId;
    nextId++;
    saveState();
    return id;
}

// TODO: createTaskCard(task)
// - Return a jQuery element representing a task card
// - Include:
//   - Title
//   - Description
//   - Due date
//   - Delete button
// - Add a data-task-id attribute for later lookups
// - Use Day.js to color-code:
//   - If task is not in "done":
//     - Add a warning style if due soon / today
//     - Add an overdue style if past due

function createTaskCard(task) {
    const taskCard = $('<div>')
        .addClass('task-card')
        .attr('data-task-id', task.id);
    const titleEl = $('<h3>')
        .addClass('task-card-title')
        .text(task.title);
    const descriptionEl = $('<p>')
        .addClass('task-card-text')
        .text(task.description);
    const dueDateEl = $('<p>')
        .addClass('task-card-meta')
        .text(task.dueDate);
    const deleteButtonEl = $('<button>')
        .addClass('btn btn-danger btn-sm delete-task')
        .attr('data-task-id', task.id)
        .text('Delete');
    const actionsEl = $('<div>')
        .addClass('task-actions')
        .append(deleteButtonEl);


    // To colour code the cards
    const today = dayjs();
    const due = dayjs(task.dueDate);

    if (task.status !== 'done') {
        if (due.isBefore(today, 'day')) {
            taskCard.addClass('task-due-overdue');
        } else if (due.diff(today, 'day') <= 1) {
            taskCard.addClass('task-due-warning');
        }
    }

    // Put everything on the card
    taskCard.append(titleEl, descriptionEl, dueDateEl, actionsEl);

    return taskCard;
}


// TODO: renderTaskList()
// - Clear all lane containers (#todo-cards, #in-progress-cards, #done-cards)
// - Loop through tasks array
// - For each task, create a card and append it to the correct lane
// - After rendering, make task cards draggable with jQuery UI

//Clears the containers so it doesnt create dupes and instead reloads all the tasks
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

     //Different way to do the if/else if loop - Maps the cards to the corresponding column
    const columnMap = {
        'to-do': '#todo-cards',
        'in-progress': '#in-progress-cards',
        'done': '#done-cards'}

    //For each card created, calls the create function then sets them in the correct column based on the status
    tasks.forEach(task => {
        const card = createTaskCard(task);
        $(columnMap[task.status]).append(card);
     });
    $('.task-card').draggable({
        revert: 'invalid',
        helper: 'clone',
        start: function () {
            $(this).css('opacity', 0.5);
        },
        stop: function () {
            $(this).css('opacity', 1);
        }
});
}


// TODO: handleAddTask(event)
// - Prevent default form submission
// - Read values from #taskTitle, #taskDescription, #taskDueDate
// - Validate: if missing, you can show a message or just return
// - Create a new task object with:
//   - id from generateTaskId()
//   - title, description, dueDate
//   - status: 'to-do'
// - Push to tasks array, save, re-render
// - Reset the form and close the modal
function handleAddTask(event) {
     event.preventDefault();
//Store the values given into constants and trim the excess
     const title = $('#taskTitle').val().trim();
     const description = $('#taskDescription').val().trim();
     const dueDate = $('#taskDueDate').val().trim();

//alert if one of the fields was missing, then returns so it doesn't still create the task
     if (!title || !description || !dueDate) {
        alert('One of the fields was not entered!');
        return;
     }
     const task = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status:'to-do'
     }
//pushes the data to the task array => saves the task info to local storage
     tasks.push(task);
     saveState();
     renderTaskList();

     $('#taskForm')[0].reset();   // This clears the form
     $('#taskModal').modal('hide');  // Closes the modal after submitting

}

// TODO: handleDeleteTask(event)
// - Get the task id from the clicked button (data-task-id)
// - Remove that task from tasks array
// - Save and re-render
function handleDeleteTask(event) {
 //Number works like parseInt but doesn't stop at decimals => This doesn't matter in this case just wanted to try Number
     const id = Number($(event.target).attr('data-task-id'));
     tasks = tasks.filter(task => task.id !== id);
     saveState();
     renderTaskList();
}

// TODO: handleDrop(event, ui)
// - Get the task id from the dragged card
// - Determine the new status from the lane's dataset/status or id
// - Update the task's status in the tasks array
// - Save and re-render
function handleDrop(event, ui) {
     const taskId = Number(ui.draggable.attr('data-task-id'));

     // Get the new status from the lane that this card was dropped into
     const newStatus = $(event.target).closest('.lane').data('status');
 
     // Update the task's status
     const task = tasks.find(t => t.id === taskId);
     if (task) {
        task.status = newStatus;
     }

     saveState();
     renderTaskList();
}



// ===== Document Ready =====

$(function () {
    // Show current date in header using Day.js
    $('#current-date').text(dayjs().format('[Today:] dddd, MMM D, YYYY'));

    // Initialize datepicker for due date
    // Hint: keep format consistent and use it in your parsing
    $('#taskDueDate').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: 0,
    });

    // Render tasks on load (will do nothing until you implement renderTaskList)
    renderTaskList();

    // Form submit handler
    $('#taskForm').on('submit', handleAddTask);

    //event listener for the delete button
    $(document).on('click', '.delete-task', handleDeleteTask);

    // Make lanes droppable
    // TODO: configure droppable to accept task cards and use handleDrop
    $('.lane-body').droppable({
        accept: '.task-card',
        drop: handleDrop,
        hoverClass: 'ui-droppable-hover'
    });
   
   //Darkmode button
    $('#darkToggle').on('click', function () {
    $('body').toggleClass('dark-mode');
});

});

// NOTE:
// - You are encouraged to use Day.js for ALL date logic.
// - You may adjust “due soon” rules, as long as they’re clearly implemented.
