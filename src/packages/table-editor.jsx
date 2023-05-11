import deepcopy from "deepcopy";
import { ElButton, ElTag } from "element-plus";
import { computed, defineComponent } from "vue";
import { $tableDialog } from "../components/TableDialog";

export default defineComponent({
  props: {
    propConfig: { type: Object },
    modelValue: { type: Array }
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue || []
      },
      set(value) {
        ctx.emit('update:modelValue', deepcopy(value))
      }
    })
    const add = () => {
      $tableDialog({
        config: props.propConfig,
        data: data.value,
        onConfirm: (value) => {
          data.value = value
        }
      })
    }
    return () => {
      return (
        <div>
          {/* 此下拉框没有任何数据，直接显示一个按钮 */}
          {(!data.value || data.value.length === 0) && <ElButton onClick={add}>添加</ElButton>}
          {(data.value || []).map(item => <ElTag onClick={add}>{item[props.propConfig.table.key]}</ElTag>)}
        </div>
      )
    }
  }
})