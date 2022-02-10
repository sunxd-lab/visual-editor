import { ElInputNumber, ElOption, ElSelect } from "element-plus";
import { ElColorPicker } from "element-plus";
import { ElInput } from "element-plus";
import { ElForm, ElFormItem, ElButton } from "element-plus";
import { defineComponent, inject } from "vue";

export default defineComponent({
  props: {
    block: { type: Object }, // 用户最后选中的元素
    data: { type: Object } // 当前所有的数据
  },
  setup(props) {
    const config = inject('config') // 组件的配置信息
    return () => {
      let content = []
      if (!props.block) {
        content.push(<>
          <ElFormItem label="容器宽度">
            <ElInputNumber></ElInputNumber>
          </ElFormItem>
          <ElFormItem label="容器高度">
            <ElInputNumber></ElInputNumber>
          </ElFormItem>
        </>)
        // eslint-disable-next-line no-empty
      } else {
        let component = config.componentMap[props.block.key]
        if (component && component.props) {
          content.push(Object.entries(component.props).map(([propName, propConfig]) => {
            return (
              <ElFormItem label={propConfig.label}>
                {{
                  input: () => <ElInput></ElInput>,
                  color: () => <ElColorPicker></ElColorPicker>,
                  select: () => <ElSelect>
                    {propConfig.options.map(opt => (
                      <ElOption label={opt.label} value={opt.value}></ElOption>
                    ))}
                  </ElSelect>
                }[propConfig.type]()}
              </ElFormItem>
            )
          }))
        }
      }
      return (
        <ElForm labelPosition="top" style={{ padding: '10px' }}>
          {content}
          <ElFormItem>
            <ElButton type="primary">应用</ElButton>
            <ElButton>重置</ElButton>
          </ElFormItem>
        </ElForm>
      )
    }
  }
})