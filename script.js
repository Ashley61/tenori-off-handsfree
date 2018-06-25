let dots = [];
let isMouseDown = false;

init();
draw();

function init() {
  const container = document.getElementById('container');
  
  // Draw the grid.
  for (let i = 0; i < 16; i++) {
    let row = [];
    dots.push(row);
    const rowEl = document.createElement('div');
    rowEl.classList.add('row');
    container.appendChild(rowEl);
    
    for (let j = 0; j < 16; j++) {
      dots[i][j] = 0;
      const button = document.createElement('button');
      button.classList.add('pixel');
      button.dataset.row = i;
      button.dataset.col = j;
      rowEl.appendChild(button);
    }
  }
  
  //document.getElementById('container').addEventListener('click', activate);
  document.getElementById('container').addEventListener('mousedown', (event) => {isMouseDown = true; activate(event)});
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', activate);
}

function draw() {
  const rows = document.querySelectorAll('.container > .row');
  for (let i = 0; i < 16; i++) {
    const pixels = rows[i].querySelectorAll('.pixel');
    for (let j = 0; j < 16; j++) {
      pixels[j].classList.remove('on');
      if (dots[i][j]) {
        pixels[j].classList.add('on');
      }
    }
  }
}

function activate(event) {
  const button = event.target;
    
  // We only care about clicking on the buttons, not the container itself.
  if (button.localName !== 'button' || !isMouseDown) {
    return;
  }
  
  const isOn = button.classList.contains('on');

  // We could also just call draw() here but let's not loop if we don't have to.
  if (isOn) {
    // Turn it off.
    dots[button.dataset.row][button.dataset.col] = 0;
    button.classList.remove('on');
  } else {
    // Turn it on.
    dots[button.dataset.row][button.dataset.col] = 1;
    button.classList.add('on');
  }
}

function playOrPause() {
  const container = document.getElementById('container');
  if (container.classList.contains('playing')) {
    container.classList.remove('playing');
    clearTimeout(playTimeout);
    updateButtons(false);
  } else {
    container.classList.add('playing');
    play();
    updateButtons(true);
  }
}

let playTimeout;
function play() {
  // Go through every note
  let currentColumn = 0;
  const rows = document.querySelectorAll('.container > .row');
  
  function playStep() {
    console.log(currentColumn);
    // Clear all the previously struck notes.
    const struck = document.querySelectorAll('.container .struck');
    for (let i = 0; i < struck.length; i++) {
      struck[i].classList.remove('struck');
    }
    
    // Strike all the active notes in this current column.
    for (let i = 0; i < 16; i++) {
      const pixels = rows[i].querySelectorAll('.pixel');
      if (dots[i][currentColumn]) {
        pixels[currentColumn].classList.add('strike');
      }
    }
    
    // Get ready for the next column.
    currentColumn++;
    if (currentColumn === 16) {
      clearTimeout(playTimeout);
    } else {
      window.requestAnimationFrame(() => {
        playStep();
      });
    }  
  }

  playTimeout = setTimeout(playStep, 1000);
}

function updateButtons(isPlaying) {
  const btn = document.getElementById('btnPlay');
  if (isPlaying) {
    btn.querySelector('.iconPlay').setAttribute('hidden', true);
    btn.querySelector('.iconPause').removeAttribute('hidden');
    btn.title = 'Pause';
  } else {
    btn.querySelector('.iconPlay').removeAttribute('hidden');
    btn.querySelector('.iconPause').setAttribute('hidden', true);
    btn.title = 'Play';
  }
}