import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    start: Number,
    end: Number,
  },
  emits: ['update:start', 'update:end'],
  setup(props, ctx) {
    const start = computed({
      get() {
        return props.start
      },
      set(value) {
        ctx.emit('update:start', value)
      }
    })
    const end = computed({
      get() {
        return props.end
      },
      set(value) {
        ctx.emit('update:end', value)
      }
    })

    return () => {
      return (
        <div class="range">
          <input type="text" v-model={start.value} />
          <span>~</span>
          <input type="text" v-model={end.value} />
        </div>
      )
    }
  }
})