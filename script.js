let dots = [];
let ripples = [];
let isMouseDown = false;
let isPlaying = false;
const RIPPLE_RADIUS = 3;

init();

;(function animloop(){
  setTimeout(() => {
    console.log('animating'); 
    window.requestAnimationFrame(draw);
    animloop();
  }, 2000);
})()



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
      dots[i][j] = {on:false, opacity: 1, ripple: false};
      
      const button = document.createElement('button');
      button.classList.add('pixel');
      button.dataset.row = i;
      button.dataset.col = j;
      rowEl.appendChild(button);
    }
  }
  draw();
  
  //document.getElementById('container').addEventListener('click', activate);
  document.getElementById('container').addEventListener('mousedown', (event) => {isMouseDown = true; activate(event)});
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', activate);
}

function draw(time = 0) {
  const rows = document.querySelectorAll('.container > .row');
  for (let i = 0; i < 16; i++) {
    const pixels = rows[i].querySelectorAll('.pixel');
    for (let j = 0; j < 16; j++) {
      if (dots[i][j].on) {
        pixels[j].classList.add('on');
        continue;
      } else {
        pixels[j].classList.remove('on');
      }
      
      if (dots[i][j].ripple) {
        pixels[j].style.opacity = dots[i][j].opacity - time;
        console.log(time);
        pixels[j].classList.add('ripple');
      } else {
        pixels[j].classList.remove('ripple');
      }
    }
  }
  
  time += 0.001;
}

function activate(event) {
  const button = event.target;
  // We only care about clicking on the buttons, not the container itself.
  if (button.localName !== 'button' || !isMouseDown) {
    return;
  }
  
  const isOn = button.classList.contains('on');
  const x = parseInt(button.dataset.row);
  const y = parseInt(button.dataset.col);
  
  const dot = dots[x][y];
  dot.on = isOn ? 0 : 1;
  
  // Draw a circle around this pixel of radius 2.
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if (x === i && y === j) {
        continue;
      }
      
      const dist = Math.sqrt((i-x)*(i-x) + (j-y)*(j-y)); 
      
      if (dist <= RIPPLE_RADIUS ) {
        dots[i][j].ripple = true;
        dots[i][j].opacity = 1/dist;
      }
    }
  }
  
  draw(0);
}

let playTimeout;
function play() {
  // Go through every note
  let currentColumn = 0;
  const rows = document.querySelectorAll('.container > .row');
  
  function playStep() {
    // Strike all the active notes in this current column.
    for (let i = 0; i < 16; i++) {
      const pixels = rows[i].querySelectorAll('.pixel');
      if (dots[i][currentColumn]) {
        const pixel = pixels[currentColumn];
        pixel.classList.add('strike');
        
        setTimeout(() => {
          console.log('removing', pixel); 
          pixel.classList.remove('strike');
        }, 100);   
      }
    }
    // Get ready for the next column.
    currentColumn++;
    if (currentColumn === 16) {
      currentColumn = 0;
    }
    if (isPlaying) {
      setTimeout(playStep, 100);
    }
  }
  playTimeout = setTimeout(playStep, 100);
}

function playOrPause() {
  const container = document.getElementById('container');
  if (container.classList.contains('playing')) {
    container.classList.remove('playing');
    clearTimeout(playTimeout);
    isPlaying = false;
  } else {
    container.classList.add('playing');
    play();
    isPlaying = true;
  }
  updateButtons(isPlaying);
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
