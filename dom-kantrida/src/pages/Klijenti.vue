<template>
  <div class="q-pa-md">
    <UnosKlijenta class="flex col-1" />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import "../css/app.css";
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import UnosKlijenta from "../components/UnosKlijenta.vue";
import { formatDate, formatDateDisplay } from "../utils/formatDate";

const today = new Date();
export default defineComponent({
  components: { UnosKlijenta },
  name: "Dostave",
  data() {
    return {
      klijenti: [],
    };
  },
  methods: {},
  mounted() {
    // this.getData(this.izabraniDatum);
    // tu vuci podatke iz baze kada pokreces page
  },
});
</script>
