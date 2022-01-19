<template>
  <div id="app">
    <Editor v-model="state" />
  </div>
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
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
