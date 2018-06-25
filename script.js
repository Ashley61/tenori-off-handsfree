let dots = [];
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
  
  document.getElementById('container').addEventListener('click', (event) => {
    
  });
}

function enableSome() {
  dots[3][5] = 1;
  draw();
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
  if (button.localName !== 'button') {
    return;
  }
  
  const isOn = button.classList.contains('on');
  if (isOn) {
    
  dots[button.dataset.row][button.dataset.col] = !button.classList.contains('on');
  draw();
}