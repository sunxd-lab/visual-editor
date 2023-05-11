import { ElButton, ElInput, ElSelect } from 'element-plus';
import Range from '../components/Range';

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
const createTableProps = (label, table) => ({ type: 'table', label, table })

registerConfig.register({
  label: '下拉框',
  preview: () => <ElSelect modelValue=""></ElSelect>,
  render: ({ props }) => <ElSelect modelValue=""></ElSelect>,
  key: 'select',
  props: {
    // [{label: 'a', value: '1'}, {label: 'b', value: '2'}]
    options: createTableProps('下拉选项', {
      options: [
        {label: '显示值', field: 'label'},
        {label: '绑定值', field: 'value'},
      ],
      key: 'label' // 显示给用户的值
    })
  }
})

registerConfig.register({
  label: '文本',
  preview: () => "预览文本",
  render: ({ props }) => <span style={{ color: props.color, fontSize: props.size }}>{props.text || '渲染文本'}</span>,
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
  render: ({ props }) => <ElButton type={props.type} size={props.size}>{props.text || '渲染按钮'}</ElButton>,
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
      { label: '大', value: 'large' },
    ]),
  }
})

registerConfig.register({
  label: '输入框',
  preview: () => <ElInput placeholder="预览"></ElInput>,
  render: ({ model }) => <ElInput placeholder="渲染" {...model.default}></ElInput>,
  key: "input",
  model: {
    default: '绑定字段',
  }
})

registerConfig.register({
  label: '范围选择器',
  preview: () => <Range></Range>,
  render: ({ model }) => <Range {...{
    start: model.start.modelValue,
    end: model.end.modelValue,
    'onUpdate:start': model.start['onUpdate:modelValue'],
    'onUpdate:end': model.end['onUpdate:modelValue'],
  }}></Range>,
  key: "range",
  model: {
    start: '开始范围字段',
    end: '结束范围字段'
  }
})
