export function useBlockDragger(focusData) {
  const dragState = {
    startX: 0,
    startY: 0
  }
  const mousedown = (e) => {
    dragState.startX = e.clientX
    dragState.startY = e.clientY
    dragState.startPos = focusData.value.focus.map(({ top, left }) => ({ top, left }))

    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }
  const mousemove = (e) => {
    const { clientX: moveX, clientY: moveY } = e
    const durX = moveX - dragState.startX
    const durY = moveY - dragState.startY
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY
      block.left = dragState.startPos[idx].left + durX
    })
  }
  const mouseup = (e) => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }

  return {
    mousedown
  }
}