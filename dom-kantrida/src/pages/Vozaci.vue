<template>
  <div class="q-pa-md">
    <UnosVozaca />
    <q-table title="Vozaci" :rows="test" :columns="columns" row-key="id" />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import UnosVozaca from "../components/UnosVozaca.vue";

const columns = [
  {
    name: "id",
    required: true,
    label: "ID",
    align: "left",
    field: "id",
    sortable: false,
  },
  {
    name: "ime",
    required: true,
    label: "Ime",
    align: "left",
    field: "Ime",
    sortable: true,
  },
  {
    name: "prezime",
    align: "center",
    label: "Prezime",
    field: "Prezime",
    sortable: true,
  },
    {
    name: "OIB",
    align: "center",
    label: "OIB",
    field: "OIB",
    sortable: true,
    },
];

export default defineComponent({
  components: { UnosVozaca },
  name: "Vozaci",
  data() {
    UnosVozaca;
    return {
      test: [],
    };
  },
  methods: {
    async getData() {
      const q = query(collection(db, "Vozaci"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        this.test.push({ id: doc.id, ...doc.data() });
      });
    },
  },
  mounted() {
    this.getData();
  },
});
</script>