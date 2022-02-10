import { ElDialog, ElInput, ElButton } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: { type: Object }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option, // 用户给组件的属性
      isShow: false
    })
    // 让外界可以调用组件暴露的方法
    ctx.expose({
      showDialog(option) {
        state.option = option;
        state.isShow = true;
      }
    })
    const onCancel = () => state.isShow = false;
    const onConfirm = () => {
      state.isShow = false;
      state.option.onConfirm && state.option.onConfirm(state.option.content)
    }
    return () => {
      return <ElDialog
        v-model={state.isShow}
        title={state.option.title}
      >
        {{
          default: () => <ElInput
            type="textarea"
            v-model={state.option.content}
            rows={10}
          ></ElInput>,
          footer: () => state.option.footer && <div>
            <ElButton onClick={onCancel}>取消</ElButton>
            <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
          </div>
        }}
      </ElDialog>
    }
  }
})

let vm;

export function $dialog(option) {
  // 手动挂载组件
  if (!vm) {
    const el = document.createElement('div')
    // vue3 将组件渲染到el上，可先创建一个虚拟节点
    vm = createVNode(DialogComponent, { option })
    // 将虚拟节点 渲染 成真实节点
    document.body.appendChild((render(vm, el), el))
  }
  const { showDialog } = vm.component.exposed
  showDialog(option)
}