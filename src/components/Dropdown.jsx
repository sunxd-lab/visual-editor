import { computed, createVNode, defineComponent, inject, onBeforeUnmount, onMounted, provide, reactive, ref, render } from "vue";

export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String,
  },
  setup(props, ctx) {
    const hide = inject('hide')
    return () => (
      <div class="dropdown-item" onClick={hide}>
        <i class={`iconfont ${props.icon}`}></i>
        <span>{props.label}</span>
      </div>
    )
  }
})

const DropdownComponent = defineComponent({
  props: {
    option: { type: Object }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0
    })
    ctx.expose({
      showDropdown(option) {
        state.option = option;
        state.isShow = true;
        const { top, left, height } = option.el.getBoundingClientRect()
        state.top = top + height;
        state.left = left;
      }
    })
    provide('hide', () => state.isShow = false )
    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ])
    const styles = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px'
    }))
    const el = ref(null)
    const onMounsedownDocument = (e) => {
      // 如果点击的是dropdown内部，什么都不做
      if (!el.value.contains(e.target)) {
        state.isShow = false
      }
    }
    onMounted(() => {
      // 事件的传递行为 是先捕获，再冒泡
      // 之前为了阻止事件传播，给每个block添加了 stopPropagation
      document.body.addEventListener('mousedown', onMounsedownDocument, true)
    })
    onBeforeUnmount(() => {
      document.body.removeEventListener('mousedown', onMounsedownDocument)
    })
    return () => {
      return (
        <div class={classes.value} style={styles.value} ref={el}>
          {state.option.content()}
        </div>
      )
    }
  }
})

let vm;

export function $dropdown(option) {
  // 手动挂载组件
  if (!vm) {
    const el = document.createElement('div')
    // vue3 将组件渲染到el上，可先创建一个虚拟节点
    vm = createVNode(DropdownComponent, { option })
    // 将虚拟节点 渲染 成真实节点
    document.body.appendChild((render(vm, el), el))
  }
  const { showDropdown } = vm.component.exposed
  showDropdown(option)
}