<template>
  <div class="q-ma-lg">
    <q-card-section class="q-pt-none">
      <h6>Pregled ugovora</h6>
      <div class="q-ma-lg">
        <div class="q-gutter-md">
          <q-select
            filled
            v-model="model"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Lazy filter"
            :options="options"
            @filter="filterFn"
            @filter-abort="abortFilterFn"
            style="width: 250px"
            hint="With hide-selected and fill-input"
          >
          </q-select>
        </div>
        <div v-if="model" class="q-ma-md">
          <q-input
            outlined
            v-model="vrstaPrehrane"
            label="Molimo unesite vrstu prehrane"
            :dense="dense"
            :rules="[(val) => !!val || 'Molimo unesite vrijednost']"
          />
          <q-input
            filled
            v-model="zaduzeniRuckovi"
            label="Unos zaduzenih ruckova"
            mask="# - # - # - # - # - #"
            fill-mask="#"
            unmasked-value
            hint="Unos: Ponedjeljak - Utorak - Srijeda - Cetvrtak - Petak - Subota, FillMask: Unesite u određene dane"
            :dense="dense"
            class="q-ma-sm"
          />
          <q-input
            v-model="datumUkljucivanja"
            outlined
            type="date"
            hint="Molimo unesite datum početka ugovora"
            :dense="dense"
            :rules="provjeriDatumRuleUkljucivanje"
          />
          <q-input
            v-model="datumZavrsetkaTretmana"
            outlined
            type="date"
            hint="Molimo unesite datum kraja ugovora klijenta"
            :dense="dense"
            :rules="provjeriDatumRuleKraj"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Odustani" v-close-popup />
      <q-btn
        @click="dodajUgovor()"
        color="primary"
        flat
        label="Dodaj ugovor"
        v-close-popup
        :disable="greskaUnosa"
      />
    </q-card-actions>
  </div>
</template>

<script>
import { db } from "src/boot/firebase";

import {
  addDoc,
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";

export default {
  data() {
    return {
      test: "123",
      prikazPodataka: false,
      model: null,
      options: [],
      stringOptions: "",
      vrstaPrehrane: "",
      zaduzeniRuckovi: [],
      datumUkljucivanja: "",
      brojUgovora: "",
      datumZavrsetkaTretmana: "",
      greskaUnosa: true,
      provjeriDatumRuleUkljucivanje: [
        (vrijednost) =>
          this.provjeriDatumUkljucivanja() ||
          "Unijeli ste datum koji je više od 7 dana manji od trenutnog ili datum koji je veći od datuma završetka ugovora",
      ],
      provjeriDatumRuleKraj: [
        (vrijednost) =>
          this.provjeriDatumZavrsavanja() ||
          "Molimo unesite datum koji je veći od unesenog datuma početka ugovora",
      ],
    };
  },
  methods: {
    provjeriDatumUkljucivanja() {
      // uzimanje trenutnog datuma i pretvaranje u istu vrijednost koju dobivamo iz inputa
      let date = new Date();
      let trenutniDatum =
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + (date.getDate() - 7)).slice(-2);
      // -7 je napravljeno da bi dobili datum koji oznacava maksimum koliko mozemo ici unatrag za napraviti ugovor
      // provjera stanja unosa, blokiranje tipke dodavanja
      trenutniDatum <= this.datumUkljucivanja
        ? (this.greskaUnosa = false)
        : (this.greskaUnosa = true);
      if (this.datumZavrsetkaTretmana) {
        if (
          this.datumZavrsetkaTretmana >= this.datumUkljucivanja &&
          trenutniDatum <= this.datumUkljucivanja
        ) {
          this.greskaUnosa = false;
          return true;
        } else {
          this.greskaUnosa = true;
          return false;
        }
      } else return trenutniDatum <= this.datumUkljucivanja;
    },
    provjeriDatumZavrsavanja() {
      // provjera stanja unosa, blokiranje tipke dodavanja
      this.datumZavrsetkaTretmana > this.datumUkljucivanja
        ? (this.greskaUnosa = false)
        : (this.greskaUnosa = true);

      //   if (this.datumUkljucivanja) {
      if (this.datumUkljucivanja <= this.datumZavrsetkaTretmana) {
        this.greskaUnosa = false;
        return true;
      } else {
        this.greskaUnosa = true;
        return false;
      }
      //   } else return this.datumZavrsetkaTretmana >= trenutniDatum;
    },
    filterFn(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow

      setTimeout(() => {
        update(() => {
          const needle = val.toLowerCase();
          this.options = this.options.filter(
            // (v) => v.toLowerCase().indexOf(needle) > -1
            (v) =>
              (v[0].toLowerCase().indexOf(needle) &&
                v[1].toLowerCase().indexOf(needle)) > -1
            // (v) => console.log(v)
          );
        });
      }, 1500);
    },
    async dodajUgovor() {
      let num = this.zaduzeniRuckovi;

      this.zaduzeniRuckovi = String(num)
        .split("")
        .map((num) => {
          return Number(num);
        });

      const docRef = await addDoc(collection(db, "Ugovori"), {
        vrstaPrehrane: this.vrstaPrehrane,
        zaduzeniRuckovi: this.zaduzeniRuckovi,
        datumUkljucivanja: this.datumUkljucivanja,
        datumZavrsetkaTretmana: this.datumZavrsetkaTretmana,
        korisnik: this.model[2],
      });
      this.vrstaPrehrane = "";
      this.zaduzeniRuckovi = "";
      this.datumUkljucivanja = "";
      this.datumZavrsetkaTretmana = "";
      console.log("Document written with ID: ", docRef.id);
    },
  },
  mounted() {
    const q = query(collection(db, "Klijenti"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.options.push([doc.data().ime, doc.data().prezime, doc.id]);
        console.log(doc.data().ime + doc.data().prezime);
      });
    });
  },
};
</script>