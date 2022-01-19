import deepcopy from "deepcopy";
import { computed, defineComponent, inject, ref } from "vue";
import EditorBlock from "./editor-block";
import "./editor.scss"
import { useBlockDragger } from "./useBlockDragger";
import { useFocus } from "./useFocus";
import { useMenuDragger } from "./useMenuDragger";

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    }
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue));
      }
    })

    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px',
    }))

    const config = inject('config');

    const containerRef = ref(null)
    // 拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data)
    // 获取焦点
    const { 
      blockMousedown, 
      containerMousedown, 
      focusData, 
      lastSelectedBlock
    } = useFocus(data, (e) => mousedown(e))
    const { mousedown } = useBlockDragger(focusData, lastSelectedBlock)

    // 内部拖拽多个元素

    return () => (
      <div class="editor">
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={(e) => {
                console.log(e)
                dragstart(e, component)
              }}
              onDragEnd={dragend}
            >
              <span>{component.label}</span>
              {component.preview()}
            </div>
          ))}
        </div>
        <div class="editor-top">菜单栏</div>
        <div class="editor-right">属性控制栏目</div>
        <div class="editor-container">
          <div class="editor-container-canvas">
            <div
              ref={containerRef}
              class="editor-container-canvas__content"
              style={containerStyles.value}
              onMousedown={containerMousedown}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  block={block}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                ></EditorBlock>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
})