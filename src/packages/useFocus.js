import { computed, ref } from "vue"

export function useFocus(data, previewRef, callback) {
  const selectIndex = ref(-1);  // 表示没有任何一个被选中
  const lastSelectedBlock = computed(() => data.value.blocks[selectIndex.value])
  // 方便后面移动选中的元素
  const focusData = computed(() => {
    const focus = []
    const unfocused = []
    data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
    return {
      focus,
      unfocused
    }
  })
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => block.focus = false)
  }
  const blockMousedown = (e, block, index) => {
    if(previewRef.value) return;
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true
      } else {
        block.focus = !block.focus
      }
    } else {
      if (!block.focus) {
        clearBlockFocus()
        block.focus = true
      }
    }
    selectIndex.value = index
    callback(e)
  }
  const containerMousedown = (e) => {
    if(previewRef.value) return;
    selectIndex.value = -1
    clearBlockFocus()
  }
  return {
    clearBlockFocus,
    blockMousedown,
    containerMousedown,
    focusData,
    lastSelectedBlock
  }
}