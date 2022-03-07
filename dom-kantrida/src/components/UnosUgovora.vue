<template >
  <div class="q-ma-lg">
    <q-btn label="Dodaj ugovor" @click="this.prompt = !this.prompt" />
    <q-dialog persistent wid v-model="prompt">
      <q-card style="min-width: 500px" class="absolute-center">
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
                label="Pretraga klijenata"
                :options="options"
                @filter="filterFn"
                @filter-abort="abortFilterFn"
                style="width: 250px"
                hint="With hide-selected and fill-input"
              >
              </q-select>
              <span v-if="this.ugovorPostoji" class="text-red">
                Aktivni ugovor postoji za odabranog korisnika!
              </span>
            </div>
            <div v-if="model && !this.ugovorPostoji" class="q-ma-md">
              <q-input
                outlined
                v-model="state.vrstaPrehrane"
                label="Molimo unesite vrstu prehrane"
                :dense="dense"
                :error="v$.vrstaPrehrane.$dirty && state.vrstaPrehrane"
              />
              <span
                >Unos: Ponedjeljak - Utorak - Srijeda - Cetvrtak - Petak -
                Subota, unesite broj obroka u određene dane</span
              >
              <q-input
                filled
                v-model="state.zaduzeniRuckovi"
                label="Unos zaduzenih ruckova"
                mask="# - # - # - # - # - #"
                fill-mask="#"
                unmasked-value
                :dense="dense"
                :error="v$.zaduzeniRuckovi.$dirty && state.zaduzeniRuckovi"
              />
              <q-input
                v-model="state.datumUkljucivanja"
                outlined
                type="date"
                hint="Molimo unesite datum početka ugovora"
                :dense="dense"
                :error="v$.datumUkljucivanja.$dirty && state.datumUkljucivanja"
                :rules="provjeriDatumRuleUkljucivanje"
              />
              <q-input
                v-model="state.datumZavrsetkaTretmana"
                outlined
                type="date"
                hint="Molimo unesite datum kraja ugovora klijenta"
                :dense="dense"
                :error="
                  v$.datumZavrsetkaTretmana.$dirty &&
                  state.datumZavrsetkaTretmana
                "
                :rules="provjeriDatumRuleKraj"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn
            @click="dodajUgovor(v$)"
            color="primary"
            flat
            label="Dodaj ugovor"
            :disable="greskaUnosa"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, reactive } from "vue";

import { db } from "src/boot/firebase";
import {
  addDoc,
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";
import useVuelidate from "@vuelidate/core";
import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
  helpers,
} from "@vuelidate/validators";

export default {
  data() {
    return {
      // prompt sluzi da otvori popup za unos ugovora
      prompt: false,
      model: null,
      prikazPodataka: false,
      ugovorPostoji: false,

      options: [],
      greskaUnosa: false,
      // greskaunosa je bilo true
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
  setup() {
    const state = reactive({
      test: "123",
      stringOptions: "",
      vrstaPrehrane: "",
      zaduzeniRuckovi: [],
      datumUkljucivanja: "",
      brojUgovora: "",
      datumZavrsetkaTretmana: "",
    });
    const rules = {
      vrstaPrehrane: {
        required: helpers.withMessage(
          "Vrsta prehrane je obavezno polje",
          required
        ),
      },
      zaduzeniRuckovi: {
        required: helpers.withMessage(
          "Zaduzeni ruckovi su obavezno polje",
          required
        ),
      },
      datumUkljucivanja: {
        required: helpers.withMessage(
          "Datum uključivanja je obavezno polje",
          required
        ),
      },
      datumZavrsetkaTretmana: {
        required: helpers.withMessage(
          "Datum završetka tretmana je obavezno polje",
          required
        ),
      },
    };
    const v$ = useVuelidate(rules, state);

    return {
      state,
      v$,
    };
  },
  methods: {
    pretvoriDatum(stariDatum) {
      let myDate = stariDatum;
      myDate = myDate.split("-");
      console.log(myDate[0], myDate[1] - 1, myDate[2]);
      return new Date(myDate[0], myDate[1] - 1, myDate[2]);
    },
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
      if (this.state.datumZavrsetkaTretmana) {
        if (
          this.state.datumZavrsetkaTretmana >= this.state.datumUkljucivanja &&
          trenutniDatum <= this.state.datumUkljucivanja
        ) {
          this.greskaUnosa = false;
          return true;
        } else {
          this.greskaUnosa = true;
          return false;
        }
      } else return trenutniDatum <= this.state.datumUkljucivanja;
    },
    provjeriDatumZavrsavanja() {
      // provjera stanja unosa, blokiranje tipke dodavanja
      this.state.datumZavrsetkaTretmana > this.state.datumUkljucivanja
        ? (this.greskaUnosa = false)
        : (this.greskaUnosa = true);

      //   if (this.datumUkljucivanja) {
      if (this.state.datumUkljucivanja <= this.state.datumZavrsetkaTretmana) {
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
      }, 500);
    },
    async dodajUgovor(v$) {
      const formIsValid = await v$.$validate();
      console.log(formIsValid);
      let zaduzeniRuckoviArray = this.state.zaduzeniRuckovi;

      if (!this.ugovorPostoji && formIsValid) {
        zaduzeniRuckoviArray = String(zaduzeniRuckoviArray)
          .split("")
          .map((zaduzeniRuckoviArray) => {
            return Number(zaduzeniRuckoviArray);
          });

        zaduzeniRuckoviArray.unshift(0);

        const docRef = await addDoc(collection(db, "Ugovori"), {
          vrstaPrehrane: this.state.vrstaPrehrane,
          zaduzeniRuckovi: zaduzeniRuckoviArray,
          datumUkljucivanja: this.pretvoriDatum(this.state.datumUkljucivanja),
          datumZavrsetkaTretmana: this.pretvoriDatum(
            this.state.datumZavrsetkaTretmana
          ),
          klijent: this.model[2],
        });

        this.prompt = false;
        this.model = "";
        this.state.vrstaPrehrane = "";
        this.state.zaduzeniRuckovi = "";
        this.state.datumUkljucivanja = "";
        this.state.datumZavrsetkaTretmana = "";
        console.log("Document written with ID: ", docRef.id);
      }
    },
  },
  mounted() {
    const q = query(collection(db, "Klijenti"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.options.push([doc.data().ime, doc.data().prezime, doc.id]);
      });
    });
  },
  props: ["aktivniUgovori"],

  watch: {
    model: function () {
      const found = this.aktivniUgovori.find(
        (element) => element == this.model[2]
      );
      if (!found) {
        console.log("nije pronasao");
        this.ugovorPostoji = false;
      } else this.ugovorPostoji = true;
    },
  },
};
</script>