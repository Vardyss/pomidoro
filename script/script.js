'use strict';
const container = document.querySelector('body');

const minutesEL = document.querySelector('.timer__minutes');
const secondsEL = document.querySelector('.timer__seconds');

const workInput = document.querySelector('#timer__settings-input--work');
const brakeInput = document.querySelector('#timer__settings-input--break');

const form = document.querySelector('.timer__form');
const formInput = document.querySelector('.timer__input--task');
const taskList = document.querySelector('.timer__tasks');

const playBtn = document.querySelector('.timer__play-btn')

const currentTasks = [];

let workTime = +localStorage.setWorkTime || 30;
let brakeTime = +localStorage.setBrakeTime || 5;

setMinEl(workTime);

let state, currentInterval;
let currentTimer = workTime;
let currentSeconds = 15;

// Render items from localStorage if it exists
if (localStorage.currentTasks) {
    const localStorageItems = localStorage.getItem('currentTasks').replaceAll("\n", "").replaceAll(" ", "");
    const localStorageItemsArray = localStorageItems.split(",");
    localStorageItemsArray.forEach(item => renderTask(item));
}

// Set propriate time for client
function setMinEl(time) {
    const seconds = time * 60;
    const secondsStandart = seconds % 60;

    if(time < 0) minutesEL.textContent = "00";
    else if(time >= 0 && time <= 1) minutesEL.textContent = "00";
    else if(time < 10) minutesEL.textContent = '0' + Math.floor(time);
    else minutesEL.textContent = Math.floor(time);
    secondsEL.textContent = seconds % 60 < 10 ? "0" + seconds % 60 : secondsStandart;
}

// render items
function renderTask(data) {
    taskList.insertAdjacentHTML('beforeend', `
    <li class="timer__task">
    <div class="timer__task-mark">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.393 7.5l-5.643 5.784-2.644-2.506-1.856 1.858 4.5 4.364 7.5-7.643-1.857-1.857z"/></svg>
    </div>
    <p class="timer__task-text">${data.slice(0,1).toUpperCase()}${data.slice(1)}</p><button type="button" class="timer__task-options"><span class="timer__task-dot"></span></button></li>
    `);
}

// Timer functionallity
const timer = function(minutes, state = 'work') {
    if (state === 'work') {
        currentSeconds = minutes * 60;
        if (currentSeconds > 0) {
            currentInterval = setInterval(() => {
                if (currentSeconds > 0) {
                    currentSeconds--;
                    document.title = Math.floor(currentSeconds / 60) + ':' + (currentSeconds % 60) + " Work"
                    minutesEL.textContent = Math.floor(currentSeconds / 60) > 9 ? Math.floor(currentSeconds / 60) : '0' + Math.floor(currentSeconds / 60);
                    secondsEL.textContent = currentSeconds % 60 > 9 ? currentSeconds % 60 : "0" + currentSeconds % 60;
                    currentTimer = currentSeconds / 60;
                } else if (currentSeconds === 0) {
                    clearInterval(currentInterval);
                    timer(brakeTime, 'break');
                    document.querySelector('#sound--break').play();
                    container.classList.toggle('break');
                }
            }, 1000);
        };
    }
    if (state === 'break') {
        currentSeconds = minutes * 60;
        currentTimer = currentSeconds / 60;
        if (currentSeconds > 0) {
            currentInterval = setInterval(() => {
                if (currentSeconds > 0) {
                    currentSeconds--;
                    minutesEL.textContent = Math.floor(currentSeconds / 60) > 0 ? Math.floor(currentSeconds / 60) : '0' + Math.floor(currentSeconds / 60);
                    secondsEL.textContent = currentSeconds % 60 > 9 ? currentSeconds % 60 : "0" + currentSeconds % 60;
                    currentTimer = currentSeconds / 60;
                    document.title = Math.floor(currentSeconds / 60) + ':' + (currentSeconds % 60) + " Break"
                } else if (currentSeconds === 0) {
                    clearInterval(currentInterval);
                    timer(workTime);
                    document.querySelector('#sound--work').play();
                    container.classList.toggle('break');
                }
            }, 1000);
        }
    }
}

// PlayBtn functionallity
playBtn.addEventListener('click', (e) => {
    if (playBtn.classList.contains('state--pause')) timer(currentTimer);
    if (playBtn.classList.contains('state--active')) clearInterval(currentInterval);

    playBtn.classList.toggle('state--active');
    playBtn.classList.toggle('state--pause');

})

// Add task
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskContent = formInput.value;
    console.log(taskContent);

    if (taskContent.length > 0 && taskContent.trim() !== "") {
        renderTask(taskContent);    
        currentTasks.push(`${taskContent.trim()}`);
        formInput.value = '';
    }

    const tasks12 = document.querySelectorAll('.timer__task:not(.done):not(.deleted)');
    currentTasks.splice(0, currentTasks.length);
    tasks12.forEach(item => currentTasks.push(item.textContent));
    localStorage.removeItem('currentTasks');
    localStorage.setItem('currentTasks', currentTasks);
})

// Task items manipulation based on click
taskList.addEventListener('click', (e) => {
    // Toggle class "done" to list item
    console.log(e.target);
    if (e.target.closest('.timer__task-mark') || e.target.closest('.timer__task-text')) {
        e.target.closest('.timer__task').classList.toggle('done');
    }
    // Delete item from list 
    if (e.target.closest('.timer__task-options.close')) {
        e.target.closest('.timer__task').style.opacity = '0';
        setTimeout(() => e.target.closest('.timer__task').style.display = 'none', 400);
        e.target.closest('.timer__task').classList.add('deleted');
    };
    // Double click to delete item
    if (e.target.closest('button')) {
        if (!e.target.closest('button').classList.contains('close')) {
            e.target.closest('button').classList.add('close');
            setTimeout(() => {
                e.target.closest('button').classList.remove('close');
            }, 4000)
        }
    }

    const tasks12 = document.querySelectorAll('.timer__task:not(.done):not(.deleted)');
    currentTasks.splice(0, currentTasks.length);
    tasks12.forEach(item => currentTasks.push(item.textContent));
    localStorage.removeItem('currentTasks');
    localStorage.setItem('currentTasks', currentTasks);
    console.log(currentTasks);

})

// Change current Work Time, stop timer, reset
workInput.addEventListener('change', () => {
    workTime = workInput.value;
    workInput.value = '';

    // If given time is more than 1 minute
    if (workTime >= 1 && Number.isInteger(+workTime)) {
        setMinEl(workTime);
        currentTimer = workTime;
        clearInterval(currentInterval);

        // change play button
        if (playBtn.classList.contains('state--active')) {
            playBtn.classList.remove('state--active')
            if (!playBtn.classList.contains('state--pause')) playBtn.classList.add('state--pause')
        }
    }

    // If given time is less than 1 minute(seconds)
    if (workTime < 1) {
        currentSeconds = workTime * 60;
        setMinEl(workTime);
        currentTimer = workTime;
        clearInterval(currentInterval);

        // change play button
        if (playBtn.classList.contains('state--active')) {
            playBtn.classList.remove('state--active')
            if (!playBtn.classList.contains('state--pause')) playBtn.classList.add('state--pause')
        }
    }

    localStorage.setItem('setWorkTime', workTime);
    console.log(localStorage);
})

// Clean Brake input
brakeInput.addEventListener('change', () => {
    brakeTime = brakeInput.value;
    brakeInput.value = '';
    localStorage.setItem('setBrakeTime', brakeTime);
})