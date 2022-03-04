<template>
  <div class="q-pa-md">
    <UnosKlijenta
      class="flex col-1 q-pa-sm"
      :podaciOdabranogKlijenta="this.odabirKlijenta"
      :urediKlijenta="this.aktivirajUredi"
    />
    <q-table
      :rows="klijenti"
      :columns="columns"
      row-key="id"
      no-data-label="U bazi ne postoji popis korisnika"
      selection="single"
      v-model:selected="odabirKlijenta"
    >
      <q-popup-edit v-model="columns" />
      <template v-slot:top class="q-pa-md">
        <q-btn
          icon-right="edit"
          color="primary"
          label="Uredi"
          @click="editUser()"
        />
        <q-btn
          icon-right="delete"
          class="q-ml-sm"
          color="primary"
          label="Ukloni"
          @click="popupBrisanje = true"
        />
      </template>
    </q-table>
    <q-dialog v-model="popupBrisanje" persistent>
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
            @click="this.deleteUser()"
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

        <q-card-actions align="right">
          <q-btn
            flat
            label="U redu"
            color="primary"
            @click="this.popupUredi = false"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-btn @click="testFunc()" />
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
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
      brisanje: false,
      popupBrisanje: false,
      aktivirajUredi: false,
      popupUredi: false,
      // popupUredi dodan u slucaju da se odabere tipka uredi/brisanje, a da nije odabran klijent
    };
  },
  setup() {
    return {
      odabirKlijenta: ref([]),
    };
  },
  methods: {
    editUser() {
      if (this.odabirKlijenta[0] === undefined) {
        this.popupUredi = true;
      } else {
        this.aktivirajUredi = !this.aktivirajUredi;
      }
    },
    deleteUser() {
      if (this.odabirKlijenta[0] === undefined) {
        this.popupUredi = true;
      } else {
        deleteDoc(doc(db, "Klijenti", this.odabirKlijenta[0].id));
        this.odabirKlijenta.length = 0;
        this.brisanje = false;
      }
    },
  },
  mounted() {
    const q = query(collection(db, "Klijenti"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      this.klijenti.length = 0;

      querySnapshot.forEach((doc) => {
        this.klijenti.push({
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
  },
});
</script>
