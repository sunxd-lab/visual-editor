import { events } from "./events"

export function useMenuDragger(containerRef, data) {
  let currentComponent = null
  const dragenter = (e) => {
    e.dataTransfer.dropEffect = 'move'
  }

  const dragover = (e) => {
    // 阻止默认行为 否则无法触发drop
    e.preventDefault()
  }

  const dragleave = (e) => {
    e.dataTransfer.dropEffect = 'none'
  }

  const drop = (e) => {
    let blocks = data.value.blocks  // 画布上已经渲染好的组件
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true
        }
      ]
    }
    currentComponent = null
  }

  const dragstart = (e, component) => {
    currentComponent = component
    containerRef.value.addEventListener('dragenter', dragenter)
    containerRef.value.addEventListener('dragover', dragover)
    containerRef.value.addEventListener('dragleave', dragleave)
    containerRef.value.addEventListener('drop', drop)
    // 拖拽前订阅start事件
    events.emit('start')
  }

  const dragend = (e) => {
    containerRef.value.removeEventListener('dragenter', dragenter)
    containerRef.value.removeEventListener('dragover', dragover)
    containerRef.value.removeEventListener('dragleave', dragleave)
    containerRef.value.removeEventListener('drop', drop)
    // 放置后订阅end
    console.log('e');
    events.emit('end')
  }

  return {
    dragstart,
    dragend
  }
}