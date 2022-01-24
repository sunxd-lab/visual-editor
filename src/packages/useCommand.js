import deepcopy from "deepcopy"
import { onUnmounted } from "vue"
import { events } from "./events"

export function useCommand(data) {
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
    state.commands[command.name] = () => {
      const { redo, undo } = command.execute()
      redo()
      if (!command.pushQueue) return
      let { queue, current } = state
      // 保存指令的亲啊进后退
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
