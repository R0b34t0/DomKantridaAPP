<template >
  <div class="q-ma-lg">
    <q-btn label="Dodaj ugovor" @click="handleClick()" />
    <q-dialog persistent wid v-model="state.prompt">
      <q-card style="min-width: 500px" class="absolute-center">
        <q-form style="width: 100%" @submit.stop="this.onSubmit(v$)">
          <q-card-section class="q-pt-none">
            <h6>Pregled ugovora</h6>
            <div class="q-ma-lg">
              <div class="q-gutter-md">
                <q-select
                  filled
                  v-model="state.model"
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
                  :disable="state.editState"
                >
                </q-select>
                <span v-if="state.ugovorPostoji" class="text-red">
                  Aktivni ugovor postoji za odabranog korisnika!
                </span>
              </div>
              <div v-if="state.model && !this.ugovorPostoji" class="q-ma-md">
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
                  :error="
                    v$.datumUkljucivanja.$dirty && state.datumUkljucivanja
                  "
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
            <q-btn flat label="Odustani" @click="handleClose(v$)" />

            <q-btn
              type="submit"
              color="primary"
              flat
              :label="state.editState ? 'Uredi ugovor' : 'Dodaj ugovor'"
              :disable="greskaUnosa"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from "vue";

import { db } from "src/boot/firebase";
import {
  addDoc,
  doc,
  updateDoc,
  collection,
  query,
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
  name: "UnosUgovora",
  props: [
    "activeEdit",
    "odabraniUgovor",
    "editCompleted",
    "aktivniUgovori",
    "vrstaPrehrane",
    "zaduzeniRuckovi",
    "datumUkljucivanja",
    "datumZavrsetkaTretmana",
  ],
  data() {
    return {
      // model: null,
      prikazPodataka: false,

      options: [],
      greskaUnosa: false,
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
  setup(props) {
    const state = reactive({
      activeEdit: props.activeEdit,
      prompt: false,
      stringOptions: "",
      vrstaPrehrane: "",
      zaduzeniRuckovi: [],
      datumUkljucivanja: "",
      datumZavrsetkaTretmana: "",
      ugovorPostoji: false,
      model: null,
      editState: false,
      id_ugovora: "",
    });

    watch(
      () => props.activeEdit,
      () => {
        if (props.activeEdit) {
          state.editState = true;
          // model.length = 0;
          state.model = [
            props.odabraniUgovor.ime,
            props.odabraniUgovor.prezime,
            props.odabraniUgovor.id,
          ];
          state.prompt = true;
          (state.vrstaPrehrane = props.odabraniUgovor.vrstaPrehrane),
            (state.zaduzeniRuckovi = props.odabraniUgovor.zaduzeniRuckovi),
            (state.datumUkljucivanja = pretvoriDatumQuasar(
              props.odabraniUgovor.datumUkljucivanja
            )),
            (state.datumZavrsetkaTretmana = pretvoriDatumQuasar(
              props.odabraniUgovor.datumZavrsetkaTretmana
            ));
          state.id_ugovora = props.odabraniUgovor.id_ugovora;
        } else {
          state.editState = false;
          (state.vrstaPrehrane = ""),
            (state.zaduzeniRuckovi = ""),
            (state.datumUkljucivanja = ""),
            (state.datumZavrsetkaTretmana = "");
        }
      }
    );
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

    const pretvoriDatumQuasar = (stariDatum) => {
      let myDate = stariDatum;
      myDate = myDate.split("/");
      const newDate = myDate[2] + "-" + myDate[1] + "-" + myDate[0];

      return newDate;
    };

    const handleClose = (v$) => {
      (state.disableEdit = false),
        (state.model = null),
        (state.vrstaPrehrane = ""),
        (state.zaduzeniRuckovi = ""),
        (state.datumUkljucivanja = ""),
        (state.datumZavrsetkaTretmana = "");
      state.prompt = false;
      props.editCompleted();

      v$.$reset();
    };
    const pretvoriDatum = (stariDatum) => {
      let myDate = stariDatum;
      myDate = myDate.split("-");

      return new Date(myDate[0], myDate[1] - 1, myDate[2]);
    };
    const onSubmit = async (v$) => {
      state.ugovorPostoji = false;
      const formIsValid = await v$.$validate();
      let zaduzeniRuckoviArray = state.zaduzeniRuckovi;
      if (formIsValid) {
        // Unos u bazu
        if (!props.activeEdit) {
          const found = props.aktivniUgovori.find(
            (element) => element == state.model[2]
          );
          if (!found) {
            state.ugovorPostoji = false;
          } else state.ugovorPostoji = true;
          // ako ugovor ne postoji spremamo u bazu
          if (!state.ugovorPostoji) {
            zaduzeniRuckoviArray = String(zaduzeniRuckoviArray)
              .split("")
              .map((zaduzeniRuckoviArray) => {
                return Number(zaduzeniRuckoviArray);
              });
            zaduzeniRuckoviArray.unshift(0);
            const docRef = await addDoc(collection(db, "Ugovori"), {
              vrstaPrehrane: state.vrstaPrehrane,
              zaduzeniRuckovi: zaduzeniRuckoviArray,
              datumUkljucivanja: pretvoriDatum(state.datumUkljucivanja),
              datumZavrsetkaTretmana: pretvoriDatum(
                state.datumZavrsetkaTretmana
              ),
              klijent: state.model[2],
            });
            state.prompt = false;
            state.model = "";
            resetState();
            v$.$reset();
            props.editCompleted();
          }
        } else if (props.activeEdit) {
          // edit

          zaduzeniRuckoviArray = String(zaduzeniRuckoviArray)
            .split("")
            .map((zaduzeniRuckoviArray) => {
              return Number(zaduzeniRuckoviArray);
            });
          // obrada arraya zaduzeniRuckovi, pretvara se sve u array brojeva i onda se doda 0 sa unshiftom
          zaduzeniRuckoviArray.unshift(0);

          const dbRef = doc(db, "Ugovori", state.id_ugovora);
          updateDoc(dbRef, {
            vrstaPrehrane: state.vrstaPrehrane,
            zaduzeniRuckovi: zaduzeniRuckoviArray,
            datumUkljucivanja: pretvoriDatum(state.datumUkljucivanja),
            datumZavrsetkaTretmana: pretvoriDatum(state.datumZavrsetkaTretmana),
          }).then(() => {
            resetState();
            handleClose(v$);
          });
        }
      }
    };

    const resetState = () => {
      state.model = null;
      state.editState = false;
      state.vrstaPrehrane = "";
      state.zaduzeniRuckovi = "";
      state.datumUkljucivanja = "";
      state.datumZavrsetkaTretmana = "";
      // v$.$reset();
    };

    const v$ = useVuelidate(rules, state);

    return {
      state,
      v$,
      onSubmit,
      handleClose,
    };
  },
  methods: {
    handleClick() {
      this.state.prompt = !this.state.prompt;
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
          );
        });
      }, 500);
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
};
</script>