<template>
  <div class="q-pa-md">
    <UnosKlijenta
      class="flex col-1 q-pa-sm"
      :activeEdit="state.activeEdit"
      :odabraniKorisnik="state.odabraniKorisnik"
      :editCompleted="editCompleted"
    />
    <q-table
      :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
      :rows="state.klijenti"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      no-data-label="U bazi ne postoji popis korisnika"
    >
      <!-- selection="single"
      v-model:selected="odabirKlijenta" -->

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
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="state.popupBrisanje" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Jeste sigurni da želite ukloniti klijenta?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Poništi" color="primary" v-close-popup />
          <q-btn
            flat
            @click="deleteUser()"
            label="Ukloni"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="this.popupUredi" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Molimo odaberite klijenta za uređivanje ili brisanje</span
          >
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { defineComponent, ref, reactive, onMounted } from "vue";
import "../css/app.css";
import { db } from "src/boot/firebase";
import {
  doc,
  collection,
  query,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import UnosKlijenta from "../components/UnosKlijenta.vue";

const columns = [
  {
    name: "actions",
    align: "center",
    label: "",
    field: (row) => row.name,
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
    field: "datumRodjenja",
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

const pagination = {
  rowsPerPage: 10,
};

export default defineComponent({
  components: { UnosKlijenta },
  name: "Dostave",
  data() {
    return {
      loading: true,

      aktivirajUredi: false,
      popupUredi: false,
      // popupUredi dodan u slucaju da se odabere tipka uredi/brisanje, a da nije odabran klijent
    };
  },
  setup() {
    const state = reactive({
      klijenti: [],
      popupBrisanje: false,
      activeEdit: false,
      odabraniKorisnik: {},
      brisanje: false,
      brisanjeKey: "",
    });

    const getData = async () => {
      const q = query(collection(db, "Klijenti"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        state.klijenti.length = 0;

        querySnapshot.forEach((doc) => {
          state.klijenti.push({
            id: doc.id,
            ime: doc.data().ime,
            prezime: doc.data().prezime,
            adresa: doc.data().adresa,
            OIB: doc.data().OIB,
            odabraniDio: doc.data().odabraniDio,
            brojTelefona: doc.data().brojTelefona,
            datumRodjenja: new Date(
              doc.data().datumRodjenja.seconds * 1000
            ).toLocaleDateString("en-GB"),
            email: doc.data().email,
          });
        });
      });
    };

    const editCompleted = () => {
      state.activeEdit = false;
    };

    const editKorisnika = (action) => {
      state.activeEdit = true;
      // state.activeEdit = true;
      state.odabraniKorisnik = {
        id: action.row.id,
        ime: action.row.ime,
        prezime: action.row.prezime,
        adresa: action.row.adresa,
        OIB: action.row.OIB,
        odabraniDio: action.row.odabraniDio,
        brojTelefona: action.row.brojTelefona,
        datumRodjenja: action.row.datumRodjenja,
        email: action.row.email,
      };
    };

    const deleteKorisnika = (action) => {
      // dodam podatak keya za brisanje, odobrim popup i u funkciji deleteUser brisem
      // laksi mi je ovaj pristup brisanju pa sam napravio tako
      state.brisanjeKey = action.key;
      state.popupBrisanje = true;
    };

    const deleteUser = () => {
      state.popupBrisanje = false;
      deleteDoc(doc(db, "Klijenti", state.brisanjeKey));
    };
    // Sluzi za punjenje baze prilikom pokretanja pagea
    onMounted(() => {
      getData();
    });
    return {
      odabirKlijenta: ref([]),
      pagination,
      state,
      getData,
      editKorisnika,
      columns,
      editCompleted,
      deleteKorisnika,
      deleteUser,
    };
  },
  methods: {
    // vjerojatno izbaciti editUser
    editUser() {
      if (this.odabirKlijenta[0] === undefined) {
        this.popupUredi = true;
      } else {
        this.aktivirajUredi = !this.aktivirajUredi;
      }
    },
  },
});
</script>
