<template>
  <div>
    <q-btn color="primary" label="Dodaj" icon="add" @click="handleClick" />
    <q-dialog v-model="prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pt-none">
          <h6>Dodaj dostavu</h6>
          <q-input outlined v-model="test" label="Test" :dense="dense" />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn flat label="Dodaj dostavu" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnosDostave",
  data() {
    return {
      prompt: false,
      test: "",
    };
  },
  methods: {
    handleClick() {
      this.prompt = true;
    },
  },
  mounted() {},
});
</script>
