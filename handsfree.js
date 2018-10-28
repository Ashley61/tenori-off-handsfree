window.handsfree = new Handsfree({debug: true})

// Click on containers
handsfree.use({
  // The unique name of the plugin
  name: 'clickContainers',

  // This is called on every frame, with an array of face objects
  onFrame: faces => {
    // Lets loop through each detected face
    faces.forEach(face => {
      // Let's detect the mousedown state
      if (face.cursor.state.mouseDown) {
        // Dispatch a mousedown at the point of click, bubbling in case we click a span element inside a button for example
        face.cursor.$target.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: face.cursor.x,
          clientY: face.cursor.y
        }))
      }
    })
  }
})