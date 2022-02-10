import deepcopy from "deepcopy"
import { onUnmounted } from "vue"
import { events } from "./events"

export function useCommand(data, focusData) {
  /* 
    current 前进后退的索引
    queue 操作过的指令
    commands 制作指令和执行功能的映射表
      undo: () => {}
      redo: () => {}
    commandArray 存放所有的命令
  */
  const state = {
    current: -1,
    queue: [],
    commands: {},
    commandArray: [],
    destroyArray: [],
  }

  const registry = (command) => {
    state.commandArray.push(command)
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args)
      redo()
      if (!command.pushQueue) return
      let { queue, current } = state
      // 保存指令的前进后退
      if (queue.length > 0) {
        // 可能在拖拽过程中有撤销，所以根据当前最新的current值来计算新的队列
        queue = queue.slice(0, current + 1)
        state.queue = queue
      }
      queue.push({
        redo,
        undo
      })
      state.current = current + 1
    }
  }

  registry({
    name: 'redo',
    keyboard: 'ctrl+shift+z',
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1]
          if (item) {
            item.redo && item.redo()
            state.current++
          }
        }
      }
    }
  })

  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current === -1) return
          const item = state.queue[state.current]
          if (item) {
            item.undo && item.undo()
            state.current--
          }
        }
      }
    }
  })

  registry({
    // 如果希望将操作放到队列中可以增加一个属性，标识等会要放到队列中
    name: 'drag',
    pushQueue: true,
    // 初始化操作，默认就会执行
    init() {
      this.before = null
      // 监控拖拽开始事件，保存状体
      const start = () => this.before = deepcopy(data.value.blocks)
      // 拖拽之后，触发对应的指令
      const end = () => state.commands.drag()
      events.on('start', start)
      events.on('end', end)
      return () => {
        events.off('start')
        events.off('end')
      }
    },
    execute() {
      let before = this.before
      let after = data.value.blocks
      return {
        redo() {
          data.value = {
            ...data.value,
            blocks: after
          }
        },
        undo() {
          data.value = {
            ...data.value,
            blocks: before
          }
        }
      }
    }
  });

  // 更新整个容器, 带有历史记录的常用套路
  registry({
    name: 'updateContainer',
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: deepcopy(data.value),
        after: newValue
      }
      return {
        redo() {
          data.value = state.after
        },
        undo() {
          data.value = state.before
        }
      }
    }
  })

  registry({
    name: 'updateBlock',
    pushQueue: true,
    execute(newBlock, oldBlock) {
      let state = {
        before: deepcopy(data.value.blocks),
        after: (() => {
          const blocks = [...data.value.blocks]
          const index = data.value.blocks.indexOf(oldBlock)
          if (index > -1) {
            blocks.splice(index, 1, newBlock)
          }
          return blocks
        })()
      }
      return {
        redo() {
          data.value = {
            ...data.value,
            blocks: state.after
          }
        },
        undo() {
          data.value = {
            ...data.value,
            blocks: state.before
          }
        }
      }
    }
  })

  // 置顶
  registry({
    name: 'placeTop',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = (() => {
        // 在所有的blocks中，找到最大的
        const { focus, unfocused } = focusData.value
        const maxZIndex = unfocused.reduce((prev, block) => {
          return Math.max(prev, block.zIndex)
        }, -Infinity)
        focus.forEach((block) => block.zIndex = maxZIndex + 1) // 让当前选中的比最大值加1
        return data.value.blocks
      })()

      return {
        redo() {
          data.value = {
            ...data.value,
            blocks: after
          }
        },
        undo() {
          // 如果当前blocks前后一置，不会更新
          data.value = {
            ...data.value,
            blocks: before
          }
        }
      }
    }
  })

  registry({
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = (() => {
        // 在所有的blocks中，找到最大的
        const { focus, unfocused } = focusData.value
        let minZIndex = unfocused.reduce((prev, block) => {
          return Math.min(prev, block.zIndex)
        }, Infinity) - 1
        // 不能直接-1，因为z-index不能为负
        if (minZIndex < 0) {
          // 如果最小已经是负值，则让每选中的向上，自己为0
          const dur = Math.abs(minZIndex)
          minZIndex = 0
          unfocused.forEach(block => block.zIndex += dur)
        }
        focus.forEach((block) => block.zIndex = minZIndex)
        return data.value.blocks
      })()

      return {
        redo() {
          data.value = {
            ...data.value,
            blocks: after
          }
        },
        undo() {
          // 如果当前blocks前后一置，不会更新
          data.value = {
            ...data.value,
            blocks: before
          }
        }
      }
    }
  })

  registry({
    name: 'delete',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(data.value.blocks),
        after: focusData.value.unfocused
      }

      return {
        redo() {
          data.value = {
            ...data.value,
            blocks: state.after
          }
        },
        undo() {
          // 如果当前blocks前后一置，不会更新
          data.value = {
            ...data.value,
            blocks: state.before
          }
        }
      }
    }
  })

  const keyboardEvent = (() => {
    const keyCodes = {
      90: 'z',
    }
    const onKeydown = (e) => {
      const { ctrlKey, shiftKey, metaKey, keyCode } = e
      let keyString = []
      if (ctrlKey || metaKey) keyString.push('ctrl')
      if (shiftKey) keyString.push('shift')
      keyString.push(keyCodes[keyCode])
      keyString = keyString.join('+')
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return
        if (keyboard === keyString) {
          state.commands[name]()
          e.preventDefault()
        }
      })
    }
    const init = () => {
      window.addEventListener('keydown', onKeydown)
      return () => {
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })();

  (() => {
    // 监听键盘事件
    state.destroyArray.push(keyboardEvent())
    state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
  })();

  onUnmounted(() => {
    state.destroyArray.forEach(fn => fn && fn())
  })
  return state
}
