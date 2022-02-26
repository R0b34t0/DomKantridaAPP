<template>
  <div>
    <q-btn color="primary" label="Dodaj" icon="add" @click="handleClick" />
    <q-dialog v-model="state.prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pt-none">
          <h6>Dodaj dostavu</h6>
          <q-input outlined v-model="state.test" label="Test" :dense="dense" />
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
import { reactive } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

export default {
  name: "UnosDostave",
  setup() {
    const state = reactive({
      prompt: false,
      dostave: [],
      test: "",
      loading: false,
    });
    const today = new Date();

    const handleClick = () => {
      state.prompt = true;
    };
    return {
      state,
      handleClick,
    };
  },
};
</script>
