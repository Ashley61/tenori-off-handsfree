let dots = [];
let ripples = [];
let isMouseDown = false;
let isPlaying = false;
const RIPPLE_RADIUS = 3;

init();

;(function animloop(){
  setTimeout(() => {
    window.requestAnimationFrame(draw);
    animloop();
  }, 200);
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

function draw() {
  // First, advance all the ripples.
  for (let i = 0; i < ripples.length; i++) {
    if (ripples[i].distance > 6) {
        ripples.splice(i, 1);
    } else {
      ripples[i].distance += 1;
    }
  }

  const rows = document.querySelectorAll('.container > .row');
  for (let i = 0; i < 16; i++) {
    const pixels = rows[i].querySelectorAll('.pixel');
    for (let j = 0; j < 16; j++) {
      const dot = dots[i][j];
      
      if (dot.on) {
        pixels[j].classList.add('on');
        continue;
      } else {
        pixels[j].classList.remove('on');
      }

      // Clear the old ripple, if it exists.
      pixels[j].classList.remove('ripple');
      
      // Is this pixel inside a ripple?
      for(let r = 0; r < ripples.length; r++) {
        const ripple = ripples[r];
        let distanceFromRippleCenter = Math.sqrt((i-ripple.x)*(i-ripple.x) + (j-ripple.y)*(j-ripple.y));
  
        if(distanceFromRippleCenter > ripple.distance - 0.7 && 
           distanceFromRippleCenter < ripple.distance + 0.7 &&
           distanceFromRippleCenter < 3.5) {
          pixels[j].classList.add('ripple');
        }
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
  const x = parseInt(button.dataset.row);
  const y = parseInt(button.dataset.col);
  
  const dot = dots[x][y];
  dot.on = isOn ? 0 : 1;
  draw();
}

let playTimeout;
function play() {
  let currentColumn = 0;
  const rows = document.querySelectorAll('.container > .row');
  
  function playStep() {
    // Every new full frame, add ripples for the dots that are on
    for (let i = 0; i < 16; i++) {
      const pixels = rows[i].querySelectorAll('.pixel');
      
      if (dots[i][currentColumn].on) {
        ripples.push({x: i, y: currentColumn, distance: 0});
      } else {
        pixels[currentColumn].classList.add('
      }
      
      pixels[currentColumn]
      
      
      // Strike all the active notes in this current column.
//       const pixels = rows[i].querySelectorAll('.pixel');
//       if (dots[i][currentColumn].on) {
//         const pixel = pixels[currentColumn];
//         pixel.classList.add('strike');
        
//         // setTimeout(() => {
//         //   console.log('removing', pixel); 
//         //   pixel.classList.remove('strike');
//         // }, 100);   
//       }
    }
    
    draw();
    
    // Get ready for the next column.
    currentColumn++;
    if (currentColumn === 16) {
      currentColumn = 0;
    }
    if (isPlaying) {
      setTimeout(playStep, 100);
    } else {
      clearTimeout(playTimeout);
    }
  }
  playTimeout = setTimeout(playStep, 100);
}

function playOrPause() {
  const container = document.getElementById('container');
  if (isPlaying) {
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


function Ripple(x, y, distance) {
  this.x = x;
  this.y = y;
  this.distance = distance;
  this.draw = function() {
  }
}