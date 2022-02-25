<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-11">Korisnici</h4>
      <UnosKorisnika class="flex-end col-1" />
    </div>

    <q-table :rows="state.korisnici" :columns="columns" row-key="id" />
  </div>
</template>
<script>
import { defineComponent, reactive, onMounted, onUnmounted } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import UnosKorisnika from "../components/UnosKorisnika.vue";

export default defineComponent({
  components: { UnosKorisnika },
  name: "Korisnici",
  setup() {
    const state = reactive({
      korisnici: [],
    });
    let unsub;

    const getData = async () => {
      const q = query(collection(db, "Korisnici"));
      unsub = onSnapshot(q, (querySnapshot) => {
        state.korisnici = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          state.korisnici.push({
            id: doc.id ? doc.id : " ",
            ime: data.ime ? data.ime : " ",
            prezime: data.prezime ? data.prezime : " ",
            OIB: data.OIB ? data.OIB : " ",
            adresa: data.adresa ? data.adresa : " ",
            brojTelefona: data.brojTelefona ? data.brojTelefona : " ",
            email: data.email ? data.email : " ",
            rola: data.rola ? data.rola : " ",
          });
        });
      });
    };
    onMounted(() => {
      getData();
    });

    onUnmounted(() => {
      unsub();
    });

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
    ];

    const pagination = {
      rowsPerPage: 10,
    };

    return { state, getData, columns, pagination };
  },
});
</script>
