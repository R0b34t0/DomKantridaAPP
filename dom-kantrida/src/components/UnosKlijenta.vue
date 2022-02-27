<template>
  <div>
    <q-btn color="primary" label="Dodaj klijenta" @click="handleClick" />
    <q-dialog v-model="state.prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-form style="width: 100%" @submit="dodajKlijenta(v$)">
          <q-card-section class="q-pt-none">
            <h6>Dodaj klijenta</h6>
            <div class="q-ma-lg">
              <q-input
                class="input-field"
                outlined
                label="Unesite ime"
                :dense="dense"
                v-model="state.ime"
                :error="v$.ime.$dirty && state.ime"
              />
              <div class="error" v-if="v$.ime.$error">
                {{ v$.ime.$errors[0].$message }}
              </div>
              <q-input
                class="input-field"
                outlined
                v-model="state.prezime"
                label="Molimo unesite prezime"
                :error="v$.prezime.$dirty && state.prezime"
                :dense="dense"
              />
              <div class="error" v-if="v$.prezime.$error">
                {{ v$.prezime.$errors[0].$message }}
              </div>
              <q-input
                outlined
                v-model="state.email"
                label="Molimo unesite email"
                :error="v$.email.$dirty && state.email"
                :dense="dense"
              />
              <div class="error" v-if="v$.email.$error">
                {{ v$.email.$errors[0].$message }}
              </div>
              <q-input
                outlined
                v-model="state.OIB"
                :error="v$.OIB.$dirty && state.OIB"
                label="Molimo unesite OIB"
                :dense="dense"
                error-message="OIB mora biti broj sa 11 znakova"
              />
              <div class="error" v-if="v$.OIB.$error">
                {{ v$.OIB.$errors[0].$message }}
              </div>

              <q-input
                outlined
                v-model="state.adresa"
                :error="v$.adresa.$dirty && state.adresa"
                label="Molimo unesite adresu"
                :dense="dense"
              />
              <div class="error" v-if="v$.adresa.$error">
                {{ v$.adresa.$errors[0].$message }}
              </div>
              <q-select
                class="q-gutter-md"
                v-model="state.odabraniDio"
                :options="dioGrada"
                label="Unesite dio grada u kojemu se korisnik nalazi"
                :dense="dense"
                :error="v$.odabraniDio.$dirty && state.odabraniDio"
                outlined
              />
              <div class="error" v-if="v$.odabraniDio.$error">
                {{ v$.odabraniDio.$errors[0].$message }}
              </div>
              <q-input
                v-model="state.datumRodjenja"
                outlined
                type="date"
                hint="Molimo unesite datum rođenja"
                :error="v$.datumRodjenja.$dirty && state.datumRodjenja"
                :dense="dense"
                :rules="provjeriDatumRule"
              />
              <div class="error" v-if="v$.datumRodjenja.$error">
                {{ v$.datumRodjenja.$errors[0].$message }}
              </div>
              <q-input
                outlined
                v-model="state.brojTelefona"
                :error="v$.brojTelefona.$dirty && state.brojTelefona"
                label="Molimo unesite broj telefona"
                :dense="dense"
              />
              <div class="error" v-if="v$.brojTelefona.$error">
                {{ v$.brojTelefona.$errors[0].$message }}
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Odustani" v-close-popup />
            <q-btn
              color="primary"
              flat
              label="Dodaj klijenta"
              type="submit"
              :disable="!provjeriDatum()"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-btn label="Ugovori" @click="this.handleUgovor = !this.handleUgovor" />
    <q-dialog v-model="handleUgovor" persistent wid>
      <q-card style="min-width: 500px" class="absolute-center">
        <Ugovori />
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { ref, computed, reactive, defineComponent } from "vue";
import Ugovori from "../components/Ugovori.vue";

import { collection, addDoc } from "firebase/firestore";
import { db } from "src/boot/firebase";

import useVuelidate from "@vuelidate/core";
import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
  helpers,
} from "@vuelidate/validators";
// import { phoneRegex } from "../utils/regex";

export default defineComponent({
  components: { Ugovori },
  name: "UnosDostave",

  data() {
    return {
      handleUgovor: false,

      provjeriDatumRule: [
        (vrijednost) =>
          this.provjeriDatum() ||
          "Molimo unesite datum koji je manji od današnjeg",
      ],
    };
  },
  setup() {
    const dioGrada = ["istok", "zapad"];

    const state = reactive({
      prompt: false,
      ime: "",
      prezime: "",
      email: "",
      OIB: "",
      adresa: "",
      odabraniDio: "",
      datumRodjenja: "",
      brojTelefona: "",
    });
    const rules = {
      ime: { required: helpers.withMessage("Ime je obavezno polje", required) },
      prezime: {
        required: helpers.withMessage("Prezime je obavezno polje", required),
      },
      OIB: {
        required: helpers.withMessage("OIB je obavezno polje", required),
        numeric: helpers.withMessage(
          "OIB mora biti numerička vrijednost",
          numeric
        ),
        minLength: helpers.withMessage(
          "OIB mora sadržavati 11 znakova",
          minLength(11)
        ),
        maxLength: helpers.withMessage(
          "OIB mora sadržavati 11 znakova",
          maxLength(11)
        ),
      },
      email: {
        required: helpers.withMessage("Email je obavezno polje", required),
        email: helpers.withMessage(
          "Email mora biti u obliku primjer@email.com",
          email
        ),
      },
      datumRodjenja: {
        required: helpers.withMessage(
          "Datum rođenja je obavezno polje",
          required
        ),
      },
      adresa: {
        required: helpers.withMessage("Adresa je obavezno polje", required),
      },
      brojTelefona: {
        required: helpers.withMessage(
          "Broj telefona je obavezno polje",
          required
        ),
        numeric: helpers.withMessage(
          "Broj telefona mora biti numerička vrijednost",
          numeric
        ),
      },
      odabraniDio: {
        required: helpers.withMessage(
          "Morate odabrati korisničku rolu",
          required
        ),
      },
    };
    const v$ = useVuelidate(rules, state);

    return {
      state,
      v$,
      dioGrada,
    };
  },
  methods: {
    pretvoriDatum(stariDatum) {
      let myDate = stariDatum;
      myDate = myDate.split("-");
      console.log(myDate[0], myDate[1] - 1, myDate[2]);
      return new Date(myDate[0], myDate[1] - 1, myDate[2]);
    },
    handleClick() {
      this.state.prompt = true;
    },
    async dodajKlijenta(v$) {
      const formIsValid = await v$.$validate();

      // provjeriDatum();
      if (formIsValid) {
        const docRef = await addDoc(collection(db, "Klijenti"), {
          ime: this.state.ime,
          prezime: this.state.prezime,
          email: this.state.email,
          OIB: this.state.OIB,
          adresa: this.state.adresa,
          odabraniDio: this.state.odabraniDio,
          datumRodjenja: this.pretvoriDatum(this.state.datumRodjenja),
          brojTelefona: this.state.brojTelefona,
        });
        console.log("Document written with ID: ", docRef.id);
        this.ime = "";
        this.state.prompt = false;
        this.state.prezime = "";
        this.state.email = "";
        this.state.OIB = "";
        (this.state.adresa = ""), (this.state.odabraniDio = "");
        this.state.datumRodjenja = "";
        this.state.brojTelefona = "";
      }
    },
    provjeriDatum() {
      // uzimanje trenutnog datuma i pretvaranje u istu vrijednost koju dobivamo iz inputa
      let date = new Date();
      let trenutniDatum =
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2);

      return this.state.datumRodjenja < trenutniDatum;
    },
    provjeriVrijednost(val) {
      console.log(val);
    },
  },

  mounted() {},
});
</script>

<style >
.error {
  color: #c10015;
  font-size: 12px;
  margin: -10px 0px 10px 10px;
}
</style>