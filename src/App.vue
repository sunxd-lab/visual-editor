<template>
  <Editor v-model="state" />
</template>

<script>
import { provide, ref } from "vue";
import data from "./data.json";
import Editor from "./packages/editor";
import { registerConfig as config } from "./utils/editor-config";

export default {
  components: {
    Editor,
  },
  setup() {
    const state = ref(data);
    provide("config", config);
    return {
      state,
    };
  },
};
</script>

<style lang="scss">
#app {
  position: fixed;
  top: 0.2667rem;
  left: 0.2667rem;
  right: 0.2667rem;
  bottom: 0.2667rem;
  overflow-y: auto;
}
</style>
