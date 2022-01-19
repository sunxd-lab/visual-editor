import { computed } from "vue"

export function useFocus(data, callback) {
  // 方便后面移动选中的元素
  const focusData = computed(() => {
    const focus = []
    const unFocus = []
    data.value.blocks.forEach(block => (block.focus ? focus : unFocus).push(block))
    return {
      focus,
      unFocus
    }
  })
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => block.focus = false)
  }
  const blockMousedown = (e, block) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      block.focus = !block.focus
    } else {
      if (!block.focus) {
        clearBlockFocus()
        block.focus = true
      }
    }
    callback(e)
  }
  const containerMousedown = (e) => {
    clearBlockFocus()
  }
  return {
    blockMousedown,
    containerMousedown,
    focusData
  }
}