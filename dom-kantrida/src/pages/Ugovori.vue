<template>
  <div>
    <UnosUgovora
      :aktivniUgovori="state.IDAktivnihUgovora"
      :activeEdit="state.activeEdit"
      :odabraniUgovor="state.odabraniUgovor"
      :editCompleted="editCompleted"
    />

    <q-table
      :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
      :rows="state.ugovori"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      no-data-label="U bazi ne postoji popis korisnika"
    >
      <!-- zasto se ne prikazuje??? -->
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
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from "vue";

import UnosUgovora from "../components/UnosUgovora.vue";
import { db } from "src/boot/firebase";
import {
  doc,
  collection,
  query,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

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
    align: "center",
    label: "Ime korisnika",
    field: "ime",
  },
  {
    name: "prezime",
    align: "center",
    label: "Prezime korisnika",
    field: "prezime",
  },
  {
    name: "vrstaPrehrane",
    label: "Vrsta prehrane",
    field: "vrstaPrehrane",
    align: "center",
  },

  {
    name: "stanjeUgovora",
    required: true,
    label: "Status ugovora",
    align: "center",
    field: "stanjeUgovora",
    sortable: false,
    // classes: "bg-green-1",
    // trebam skuziti kako osposobiti da se bg mijenja ovisno o vrijednosti
    classes: (stanjeUgovora) =>
      stanjeUgovora.stanjeUgovora == "Aktivno" ? "bg-green-2" : "bg-red-2",
  },
  {
    name: "zaduzeniRuckovi",
    label: "Zaduzeni ručkovi",
    field: "zaduzeniRuckovi",
    align: "center",
  },
  {
    name: "datumUkljucivanja",
    label: "Datum uključivanja",
    field: "datumUkljucivanja",
    align: "center",
  },
  {
    name: "datumZavrsetkaTretmana",
    label: "Datum završetka ugovora",
    field: "datumZavrsetkaTretmana",
    align: "center",
  },

  //   datum uklj datumZavrsetkaTretmana
];

const pagination = {
  rowsPerPage: 10,
};

export default {
  components: { UnosUgovora },
  name: "Ugovori",

  setup() {
    const state = reactive({
      IDAktivnihUgovora: [],
      ugovori: [],
      klijenti: [],
      odabirUgovora: ref([]),
      odabraniUgovor: {},
      activeEdit: false,
      brisanje: false,
      brisanjeKey: "",
    });

    const getData = async () => {
      const q = query(collection(db, "Ugovori"));
      const trenutniDatum = new Date().toLocaleDateString("en-GB");

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        state.ugovori.length = 0;

        querySnapshot.forEach((doc) => {
          // state.IDAktivnihUgovora.push(doc.data().klijent);
          state.ugovori.push({
            id_ugovora: doc.id,
            id: doc.data().klijent,
            vrstaPrehrane: doc.data().vrstaPrehrane,
            zaduzeniRuckovi:
              " Ponedjeljak: " +
              doc.data().zaduzeniRuckovi[1] +
              " Utorak: " +
              doc.data().zaduzeniRuckovi[2] +
              " Srijeda: " +
              doc.data().zaduzeniRuckovi[3] +
              " Četvrtak: " +
              doc.data().zaduzeniRuckovi[4] +
              " Petak: " +
              doc.data().zaduzeniRuckovi[5] +
              " Subota: " +
              doc.data().zaduzeniRuckovi[6],
            zaduzeniRuckoviArray: doc.data().zaduzeniRuckovi,
            stanjeUgovora:
              new Date(
                doc.data().datumZavrsetkaTretmana.seconds * 1000
              ).toLocaleDateString("en-GB") > trenutniDatum
                ? "Aktivno"
                : "Neaktivno",
            datumUkljucivanja: new Date(
              doc.data().datumUkljucivanja.seconds * 1000
            ).toLocaleDateString("en-GB"),
            datumZavrsetkaTretmana: new Date(
              doc.data().datumZavrsetkaTretmana.seconds * 1000
            ).toLocaleDateString("en-GB"),
          });
        });
        for (let index = 0; index < state.ugovori.length; index++) {
          if (state.ugovori[index].stanjeUgovora === "Aktivno") {
            state.IDAktivnihUgovora.push(state.ugovori[index].id);
          }
        }
        // Dodavanje imena i prezimena korisnika iz kolekcije "Klijenti"
        const q2 = query(collection(db, "Klijenti"));
        const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
          state.klijenti.length = 0;

          querySnapshot.forEach((doc) => {
            state.klijenti.push({
              id: doc.id,
              ime: doc.data().ime,
              prezime: doc.data().prezime,
            });
          });
          for (let index = 0; index < state.ugovori.length; index++) {
            //   usporedba i potraga za imenima i prezimenima klijenata
            for (let index2 = 0; index2 < state.klijenti.length; index2++) {
              if (state.ugovori[index].id === state.klijenti[index2].id) {
                state.ugovori[index].ime = state.klijenti[index2].ime;
                state.ugovori[index].prezime = state.klijenti[index2].prezime;
              } else {
              }
            }
          }
        });
      });
    };
    const editCompleted = () => {
      state.activeEdit = false;
    };

    const editKorisnika = (action) => {
      state.activeEdit = true;
      state.odabraniUgovor = {
        ime: action.row.ime,
        prezime: action.row.prezime,
        id: action.row.id,
        id_ugovora: action.row.id_ugovora,
        vrstaPrehrane: action.row.vrstaPrehrane,
        zaduzeniRuckovi: action.row.zaduzeniRuckovi,
        datumUkljucivanja: action.row.datumUkljucivanja,
        datumZavrsetkaTretmana: action.row.datumZavrsetkaTretmana,
      };
    };

    const deleteKorisnika = (action) => {
      // dodam podatak keya za brisanje, odobrim popup i u funkciji deleteUser brisem
      // laksi mi je ovaj pristup brisanju pa sam napravio tako

      state.brisanjeKey = action.row.id_ugovora;
      state.popupBrisanje = true;
    };

    const deleteUser = () => {
      state.popupBrisanje = false;
      deleteDoc(doc(db, "Ugovori", state.brisanjeKey));
    };
    onMounted(() => {
      getData();
    });

    return {
      state,
      columns,
      pagination,
      editKorisnika,
      deleteKorisnika,
      deleteUser,
      getData,
      editCompleted,
    };
  },
};
</script>