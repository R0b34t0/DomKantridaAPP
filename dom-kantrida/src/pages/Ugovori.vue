<template>
  <div>
    <UnosUgovora :aktivniUgovori="this.IDAktivnihUgovora" />

    <q-table
      :columns="columns"
      :rows="ugovori"
      row-key="id"
      no-data-label="U bazi ne postoji popis korisnika"
      selection="single"
      v-model:selected="odabirUgovora"
    >
    </q-table>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

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
    align: "left",
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
export default {
  components: { UnosUgovora },
  name: "Ugovori",
  data() {
    return {
      ugovori: [],
      klijenti: [],
      IDAktivnihUgovora: [],
    };
  },
  setup() {
    return {
      odabirUgovora: ref([]),
      columns,
    };
  },
  mounted() {
    const q = query(collection(db, "Ugovori"));
    const trenutniDatum = new Date().toLocaleDateString("en-GB");

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      this.ugovori.length = 0;

      querySnapshot.forEach((doc) => {
        // this.IDAktivnihUgovora.push(doc.data().klijent);
        this.ugovori.push({
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

      for (let index = 0; index < this.ugovori.length; index++) {
        if (this.ugovori[index].stanjeUgovora === "Aktivno") {
          this.IDAktivnihUgovora.push(this.ugovori[index].id);
        }
      }

      // Dodavanje imena i prezimena korisnika iz kolekcije "Klijenti"
      const q2 = query(collection(db, "Klijenti"));
      const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
        this.klijenti.length = 0;

        querySnapshot.forEach((doc) => {
          this.klijenti.push({
            id: doc.id,
            ime: doc.data().ime,
            prezime: doc.data().prezime,
          });
        });
        for (let index = 0; index < this.ugovori.length; index++) {
          //   usporedba i potraga za imenima i prezimenima klijenata
          for (let index2 = 0; index2 < this.klijenti.length; index2++) {
            if (this.ugovori[index].id === this.klijenti[index2].id) {
              //   console.log(this.ugovori[index]);

              this.ugovori[index].ime = this.klijenti[index2].ime;
              this.ugovori[index].prezime = this.klijenti[index2].prezime;
            } else {
            }
          }
        }
      });
    });
  },
};
</script>