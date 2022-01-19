import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    block: { type: Object }
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex
    }))

    const config = inject('config')

    const blockRef = ref(null)
    onMounted(() => {
      const block = props.block
      const {offsetWidth, offsetHeight} = blockRef.value
      if(props.block.alignCenter) {
        block.left = block.left - offsetWidth / 2;
        block.top = block.top - offsetHeight / 2;
        block.alignCenter = false
      } 
      block.width = offsetWidth
      block.height = offsetHeight
    })

    return () => {
      const component = config.componentMap[props.block.key]
      const RenderComponent = component.render()
      return (
        <div 
          ref={blockRef}
          class="editor-block" 
          style={blockStyles.value}
        >
          {RenderComponent}
        </div>
      )
    }
  }
})