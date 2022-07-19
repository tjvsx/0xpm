//@ts-nocheck
export function move(element: any) {
  return {
    destroy() {
    }
  }
}

export function resizeX(element: { appendChild: (arg0: HTMLDivElement) => void; getBoundingClientRect: () => any; style: { width: string }; removeChild: (arg0: HTMLDivElement) => void }) {
  const div = document.createElement('div')
  div.classList.add('resizer')
  let active = null, initialWidth = null, initialPos = null
  element.appendChild(div)
  div.addEventListener('mousedown', onMousedown);
  
  function onMousedown(event: { target: any; pageX: any }) {
    active = event.target
    const rect = element.getBoundingClientRect()
    initialWidth = rect.width
    initialPos = event.pageX
    active.classList.add('selected')
  }
  
  function onMouseup(event: any) {
    if (!active) return;
    active.classList.remove('selected')
    active = null
    initialWidth = null
    initialPos = null
  }
  
  function onMove(event: { pageX: number }) {
    if (!active) return;
    let delta = event.pageX - initialPos
    let width = `${initialWidth + delta}px`	
    element.style.width = width;
  }
  
  window.addEventListener('mousemove', onMove)	
  window.addEventListener('mouseup', onMouseup)	
  
  return {
    destroy() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousemove', onMousedown)
      element.removeChild(div)
    }
  }
}

export function clickOutside(node) {
	const handleClick = (event) => {
		if (!node.contains(event.target)) {
			node.dispatchEvent(new CustomEvent("outclick"));
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		}
	};
}

export function drag(node) {
  let moving = false;
  let leftPos = 300;
  let topPos = 100;

  node.style.position = 'absolute';
  node.style.top = `${topPos}px`;
  node.style.left = `${leftPos}px`;
  node.style.userSelect = 'none';

  node.addEventListener('mousedown', () => {
    moving = true;
  });
  
 window.addEventListener('mousemove', (e) => {
     if (moving) {
        leftPos += e.movementX;
        topPos += e.movementY;
        node.style.top = `${topPos}px`;
        node.style.left = `${leftPos}px`;
     }
  });
 
  window.addEventListener('mouseup', () => {
    moving = false;
  });

}


export function scalable(element) {

  let moving = false;
  let leftPos = (window.innerWidth - element.getBoundingClientRect().width) * 0.5;
  let topPos = (window.innerHeight - element.getBoundingClientRect().height) * 0.5;

  element.style.position = 'absolute';
  element.style.top = `${topPos}px`;
  element.style.left = `${leftPos}px`;
  element.style.userSelect = 'none';
  
  const top = document.createElement('div')
  top.direction = 'north'
  top.classList.add('mover')
  top.classList.add('top')

  const right = document.createElement('div')
  right.direction = 'east'
  right.classList.add('grabber')
  right.classList.add('right')
  
  const left = document.createElement('div')
  left.direction = 'west'
  left.classList.add('grabber')
  left.classList.add('left')
  
  const bottom = document.createElement('div')
  bottom.direction = 'south'
  bottom.classList.add('grabber')
  bottom.classList.add('bottom')
  
  const bottomLeft = document.createElement('div')
  bottomLeft.direction = 'southwest'
  bottomLeft.classList.add('grabber')
  bottomLeft.classList.add('bottom-left')
  
  const bottomRight = document.createElement('div')
  bottomRight.direction = 'southeast'
  bottomRight.classList.add('grabber')
  bottomRight.classList.add('bottom-right')
      
  const grabbers = [top, right, left, bottom, bottomLeft, bottomRight]
  
  let active = null, initialRect = null, initialPos = null
  
  grabbers.forEach(grabber => {
    element.appendChild(grabber)
    grabber.addEventListener('mousedown', onMousedown)
  })
  
  function onMousedown(event) {
    active = event.target
    if (active.direction === 'north') {
      moving = true
    } else {
      const rect = element.getBoundingClientRect()
      const parent = element.parentElement.getBoundingClientRect()
      
      console.log({rect, parent})
      
      initialRect = {
        width: rect.width,
        height: rect.height,
        left: rect.left - parent.left,
        right: parent.right - rect.right,
        top: rect.top - parent.top,
        bottom: parent.bottom - rect.bottom
      }
      initialPos = { x: event.pageX, y: event.pageY }
      active.classList.add('selected')
    }
  }
  
  function onMouseup(event) {
    if (!active) return
    
    active.classList.remove('selected')
    active = null
    initialRect = null
    initialPos = null
    moving = false;
  }
  
  function onMove(event) {
    if (!active) return

    if (moving) {
      leftPos += event.movementX;
      topPos += event.movementY;
      element.style.top = `${topPos}px`;
      element.style.left = `${leftPos}px`;
   }
    
    const direction = active.direction
    let delta
    
    if (direction.match('east')) {
      delta = event.pageX - initialPos.x
      element.style.width = `${initialRect.width + delta}px`				
    }
    
    if (direction.match('west')) {
      delta = initialPos.x - event.pageX
      element.style.left = `${initialRect.left - delta}px`
      element.style.width = `${initialRect.width + delta}px`
    }
    
    if (direction.match('south')) {
      delta = event.pageY - initialPos.y
      element.style.height = `${initialRect.height + delta}px`
    }
  }
  
  window.addEventListener('mousemove', onMove)	
  window.addEventListener('mouseup', onMouseup)	
  
  return {
    destroy() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousemove', onMousedown)
      
      grabbers.forEach(grabber => {
        element.removeChild(grabber)
      })
    }
  }
}