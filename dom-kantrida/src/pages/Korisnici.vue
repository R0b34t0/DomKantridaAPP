<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-10">Korisnici</h4>
      <UnosKorisnika class="flex-end col-2" />
    </div>

    <q-table
      :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
      :rows="state.korisnici"
      :columns="columns"
      :pagination="pagination"
      :loading="state.loading"
      no-data-label="Nema dostava za izabrani datum"
      loading-label="Podaci se učitavaju... "
      row-key="id"
      color="white"
    />
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
      loading: false,
    });
    let unsub;

    const getData = async () => {
      state.loading = true;
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
          state.loading = false;
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
        label: "ID",
        align: "center",
        field: "id",
        sortable: false,
        style: "max-width: 150px",
      },
      {
        name: "ime",
        label: "Ime",
        align: "center",
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
        align: "center",
        label: "OIB",
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
        align: "center",
        label: "Broj telefona",
        field: "brojTelefona",
        sortable: true,
      },
      {
        name: "email",
        align: "center",
        label: "Email",
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
