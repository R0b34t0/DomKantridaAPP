<template>
  <div class="flex">
    <q-btn color="primary" label="Dodaj" @click="handleClick" />
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
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

const today = new Date();

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
      this.getData();
    },
    async getData() {
      const q = query(collection(db, "Klijenti"));
      this.loading = true;
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        console.log(doc.data());
      });
      this.loading = false;
    },
  },
  mounted() {},
});
</script>
