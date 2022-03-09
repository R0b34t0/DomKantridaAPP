<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-10">Korisnici</h4>
      <UnosKorisnika
        class="flex-end col-2"
        :activeEdit="state.activeEdit"
        :odabraniKorisnik="state.odabraniKorisnik"
        :editCompleted="editCompleted"
      />
    </div>

    <q-table
      :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
      :rows="state.korisnici"
      :columns="columns"
      :pagination="pagination"
      :loading="state.loading"
      no-data-label="Nema podataka o korisnicima"
      loading-label="Podaci se učitavaju... "
      row-key="id"
      color="orange"
    >
      <template v-slot:body-cell-actions="actions">
        <q-td :props="actions">
          <div>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="editKorisnika(actions)"
            />
            <q-btn
              flat
              round
              color="red"
              icon="delete"
              @click="deleteKorisnika(actions)"
            />
          </div>
          <div class="my-table-details">
            {{ actions.row.details }}
          </div>
        </q-td>
      </template></q-table
    >
  </div>
</template>
<script>
import { defineComponent, reactive, onMounted, onUnmounted } from "vue";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import UnosKorisnika from "../components/UnosKorisnika.vue";

export default defineComponent({
  components: { UnosKorisnika },
  name: "Korisnici",
  setup() {
    const state = reactive({
      korisnici: [],
      loading: false,
      activeEdit: false,
      odabraniKorisnik: {},
    });
    let unsub;

    const getData = async () => {
      state.loading = true;
      const q = query(
        collection(db, "Korisnici"),
        where("deleted", "!=", true)
      );
      unsub = onSnapshot(q, (querySnapshot) => {
        state.korisnici = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          state.korisnici.push({
            id: doc.id ? doc.id : "",
            ime: data.ime ? data.ime : "",
            prezime: data.prezime ? data.prezime : "",
            OIB: data.OIB ? data.OIB : "",
            adresa: data.adresa ? data.adresa : "",
            brojTelefona: data.brojTelefona ? data.brojTelefona : "",
            email: data.email ? data.email : "",
            rola: data.rola ? data.rola : "",
          });
          state.loading = false;
        });
      });
    };
    const editCompleted = () => {
      state.activeEdit = false;
    };

    const editKorisnika = (action) => {
      state.activeEdit = true;
      state.odabraniKorisnik = {
        id: action.row.id,
        ime: action.row.ime,
        prezime: action.row.prezime,
        OIB: action.row.OIB,
        adresa: action.row.adresa,
        brojTelefona: action.row.brojTelefona,
        email: action.row.email,
        rola: action.row.rola,
      };
    };

    const deleteKorisnika = async (action) => {
      const docRef = doc(db, "Korisnici", action.row.id);
      await updateDoc(docRef, { deleted: true });
    };
    onMounted(() => {
      getData();
    });

    onUnmounted(() => {
      unsub();
    });

    const columns = [
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
      {
        name: "actions",
        align: "center",
        label: "",
        field: (row) => row.name,
        sortable: false,
      },
    ];

    const pagination = {
      rowsPerPage: 10,
    };

    return {
      state,
      getData,
      columns,
      pagination,
      editKorisnika,
      deleteKorisnika,
      editCompleted,
    };
  },
});
</script>
