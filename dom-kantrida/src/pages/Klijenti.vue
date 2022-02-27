<template>
  <div class="q-pa-md">
    <UnosKlijenta class="flex col-1" />

    <q-table
      :rows="klijenti"
      :columns="columns"
      row-key="id"
      no-data-label="U bazi ne postoji popis korisnika"
    >
      <!-- :loading="loading" -->
    </q-table>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import "../css/app.css";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";
import UnosKlijenta from "../components/UnosKlijenta.vue";
import { formatDate, formatDateDisplay } from "../utils/formatDate";

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
    align: "left",
    label: "Ime",
    field: "ime",
    sortable: true,
  },
  {
    name: "prezime",
    align: "left",
    label: "Prezime",
    field: "prezime",
    sortable: true,
  },
  {
    name: "OIB",
    required: true,
    label: "OIB",
    align: "left",
    field: "OIB",
    sortable: true,
  },
  {
    name: "adresa",
    align: "center",
    label: "Adresa",
    field: "adresa",
    sortable: true,
  },
  {
    name: "brojTelefona",
    align: "left",
    label: "Broj telefona",
    field: "brojTelefona",
    sortable: false,
  },
  {
    name: "datumRodjenja",
    align: "left",
    label: "Datum rođenja",
    field: "datum Rodjenja",
    sortable: true,
  },
  {
    name: "email",
    align: "left",
    label: "E-mail",
    field: "email",
    sortable: true,
  },
  {
    name: "odabraniDio",
    align: "left",
    label: "Dio grada",
    field: "odabraniDio",
    sortable: true,
  },
];

export default defineComponent({
  components: { UnosKlijenta },
  name: "Dostave",
  data() {
    return {
      klijenti: [],
      loading: true,
    };
  },
  methods: {},
  mounted() {
    // this.klijenti.splice(0, this.klijenti.length);
    const q = query(collection(db, "Klijenti"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      this.klijenti.length = 0;

      querySnapshot.forEach((doc) => {
        this.klijenti.push({
          id: doc.id,
          ime: doc.data().ime,
          prezime: doc.data().prezime,
          adresa: doc.data().adresa,
          odabraniDio: doc.data().odabraniDio,
          brojTelefona: doc.data().brojTelefona,
          datumRodjenja: new Date(
            doc.data().datumRodjenja.seconds * 1000
          ).toLocaleDateString("en-GB"),
          email: doc.data().email,
        });
        // console.log(doc.data());
      });
    });
  },
});
</script>
