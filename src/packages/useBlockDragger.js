export function useBlockDragger(focusData, lastSelectedBlock) {
  const dragState = {
    startX: 0,
    startY: 0
  }
  const mousedown = (e) => {
    const { width: BWidth, height: BHeight } = lastSelectedBlock.value

    dragState.startX = e.clientX
    dragState.startY = e.clientY
    dragState.startPos = focusData.value.focus.map(({ top, left }) => ({ top, left }))
    dragState.lines = (() => {
      const { unfocused } = focusData.value
      const lines = {
        x: [],
        y: []
      }
      unfocused.forEach((block) => {
        const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = block
        // 横向辅助线
        lines.y.push({ showTop: ATop, top: ATop })  // 顶对顶
        lines.y.push({ showTop: ATop, top: ATop - BHeight }) // 顶对底
        lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 }) // 中间对齐
        lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight}) // 底对底
        lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }) // 底对顶
        // 纵向辅助线
        lines.x.push({ showTop: ALeft, left: ALeft })  // 左对左
        lines.x.push({ showTop: ALeft, left: ALeft - BWidth }) // 左对右
        lines.x.push({ showTop: ALeft + AWidth / 2, left: ATop + AWidth / 2 - BWidth / 2 }) // 中对中
        lines.x.push({ showTop: ALeft + AWidth, left: ATop + AWidth - BWidth}) // 右对左
        lines.x.push({ showTop: ALeft + AWidth, left: ATop + AWidth }) // 右对右
      })
    })()

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