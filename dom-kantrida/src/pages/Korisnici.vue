<template>
  <div class="q-pa-md">
    <UnosKorisnika />
    <q-table title="Korisnici" :rows="test" :columns="columns" row-key="id" />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import UnosKorisnika from "../components/UnosKorisnika.vue";

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
    field: "ime",
    sortable: true,
  },
  {
    name: "prezime",
    align: "center",
    label: "Prezime",
    field: "prezime",
    sortable: true,
  },
  {
    name: "OIB",
    required: true,
    align: "center",
    label: "OIB",
    field: "OIB",
    sortable: true,
  },
  {
    name: "adresa",
    align: "center",
    label: "adresa",
    field: "adresa",
    sortable: true,
  },
  {
    name: "brojTelefona",
    align: "center",
    label: "brojTelefona",
    field: "brojTelefona",
    sortable: true,
  },
  {
    name: "email",
    align: "center",
    label: "email",
    field: "email",
    sortable: true,
  },
  {
    name: "password",
    align: "center",
    label: "password",
    field: "password",
    sortable: true,
  },
];

export default defineComponent({
  components: { UnosKorisnika },
  name: "Korisnici",
  data() {
    return {
      test: [],
    };
  },
  methods: {
    async getData() {
      const q = query(collection(db, "Korisnici"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let data=doc.data();
        this.test.push({
          id: doc.id ? doc.id : " ",
          ime: data.ime ? data.ime : " ",
          prezime: data.prezime ? data.prezime : " ",
          OIB:data.OIB ? data.OIB : " ",
          adresa:data.adresa ? data.adresa : " ",
          brojTelefona:data.brojTelefona ? data.brojTelefona : " ",
          email:data.email ? data.email : " ",
          password:data.password ? data.password : " ",
          rola:data.rola ? data.rola : " ",
          });
      });
    },
  },
  mounted() {
    this.getData();
  },
});
</script>
