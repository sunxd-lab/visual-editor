import { ElButton, ElInput } from 'element-plus';

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};
  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}

export const registerConfig = createEditorConfig()

const createInputProps = (label) => ({ type: 'input', label })
const createColorProps = (label) => ({ type: 'color', label })
const createSelectProps = (label, options) => ({ type: 'select', label, options })

registerConfig.register({
  label: '文本',
  preview: () => "预览文本",
  render: () => "渲染文本",
  key: "text",
  props: {
    text: createInputProps('文本内容'),
    color: createColorProps('字体颜色'),
    size: createSelectProps('字体大小', [
      { label: '14px', value: '14px' },
      { label: '20px', value: '20px' },
      { label: '24px', value: '24px' },
    ])
  }
})

registerConfig.register({
  label: '按钮',
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
  key: "button",
  props: {
    text: createInputProps('按钮内容'),
    type: createSelectProps('按钮类型', [
      { label: '默认', value: 'primary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '文本', value: 'text' },
    ]),
    size: createSelectProps('按钮尺寸', [
      { label: '默认', value: '' },
      { label: '中等', value: 'medium' },
      { label: '小', value: 'small' },
      { label: '迷你', value: 'mini' },
    ]),
  }
})

registerConfig.register({
  label: '输入框',
  preview: () => <ElInput placeholder="预览"></ElInput>,
  render: () => <ElInput placeholder="渲染"></ElInput>,
  key: "input"
})