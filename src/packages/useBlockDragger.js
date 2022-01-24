import { reactive } from "vue"
import { events } from "./events"

export function useBlockDragger(focusData, lastSelectedBlock, data) {
  const dragState = {
    startX: 0,
    startY: 0,
    dragging: false, // 当前block是否正在被拖动
  }
  const markLine = reactive({
    x: null,
    y: null
  })
  const mousedown = (e) => {
    const { width: BWidth, height: BHeight, left, top } = lastSelectedBlock.value

    dragState.startX = e.clientX
    dragState.startY = e.clientY
    dragState.startPos = focusData.value.focus.map(({ top, left }) => ({ top, left }))
    dragState.startLeft = left
    dragState.startTop = top
    dragState.dragging = false
    dragState.lines = (() => {
      const { unfocused } = focusData.value
      const lines = {
        x: [],
        y: []
      };
      [
        ...unfocused,
        {
          top: 0,
          left: 0,
          width: data.value.container.width,
          height: data.value.container.height
        }
      ].forEach((block) => {
        const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = block
        // 横向辅助线
        lines.y.push({ showTop: ATop, top: ATop })  // 顶对顶
        lines.y.push({ showTop: ATop, top: ATop - BHeight }) // 顶对底
        lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 }) // 中间对齐
        lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight }) // 底对底
        lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }) // 底对顶
        // 纵向辅助线
        lines.x.push({ showLeft: ALeft, left: ALeft })  // 左对左
        lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }) // 左对右
        lines.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 }) // 中对中
        lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth }) // 右对左
        lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }) // 右对右
      })
      return lines
    })()

    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }
  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e
    if(!dragState.dragging) {
      dragState.dragging = true
      events.emit('start')
    }
    const left = moveX - dragState.startX + dragState.startLeft
    const top = moveY - dragState.startY + dragState.startTop

    let y = null, x = null
    // 距离A5px，显示
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { showTop: s, top: t } = dragState.lines.y[i]
      if (Math.abs(t - top) < 5) {
        y = s
        moveY = dragState.startY - dragState.startTop + t
        break
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { showLeft: s, left: l } = dragState.lines.x[i]
      if (Math.abs(l - left) < 5) {
        x = s
        moveX = dragState.startX - dragState.startLeft + l
        break
      }
    }

    // markLine 响应式数据，x,y更新导致视图更新
    markLine.x = x
    markLine.y = y

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
    markLine.x = null
    markLine.y = null
    // 如果只是点击选中，就不会触发，只有移动才会触发
    if(dragState.dragging) {
      events.emit('end')
    }
  }

  return {
    mousedown,
    markLine
  }
}