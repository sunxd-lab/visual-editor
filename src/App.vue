<template>
  <Editor v-model="state" :formData="formData" />
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

    const formData = ref({
      username: 'editor',
      password: '123',
      start: 0,
      end: 100
    })
    return {
      state,
      formData
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
