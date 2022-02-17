<template>
  <div>
    <q-btn color="primary" label="Dodaj" @click="handleClick" />
    <q-dialog v-model="prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pt-none">
          <h6>Dodaj vozaca</h6>
          <q-input outlined v-model="ime" label="Ime" :dense="dense" />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn flat label="Dodaj vozaca" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnosVozaca",
  data() {
    return {
      prompt: false,
      ime: "",
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