<template>
  <div>
    <q-btn color="primary" label="Dodaj" icon="add" @click="handleClick" />
    <q-dialog v-model="state.prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-form style="width: 100%" @submit.stop="onSubmit(v$)">
          <q-card-section class="q-pt-none">
            <h5>Novi korisnik</h5>
            <q-input
              class="input-field"
              outlined
              v-model="state.ime"
              label="Ime"
              :error="v$.ime.$dirty && state.ime"
            />
            <div class="error" v-if="v$.ime.$error">
              {{ v$.ime.$errors[0].$message }}
            </div>
            <q-input
              class="input-field"
              outlined
              v-model="state.prezime"
              label="Prezime"
              :error="v$.prezime.$dirty && state.prezime"
            />
            <div class="error" v-if="v$.prezime.$error">
              {{ v$.prezime.$errors[0].$message }}
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="state.OIB"
              label="OIB"
              :error="v$.OIB.$dirty && state.OIB"
            />
            <div class="error" v-if="v$.OIB.$error">
              {{ v$.OIB.$errors[0].$message }}
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="state.email"
              label="Email"
              :error="v$.email.$dirty && state.email"
            />
            <div class="error" v-if="v$.email.$error">
              {{ v$.email.$errors[0].$message }}
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="state.adresa"
              label="Adresa"
              :error="v$.adresa.$dirty && state.adresa"
            />
            <div class="error" v-if="v$.adresa.$error">
              {{ v$.adresa.$errors[0].$message }}
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="state.brojTelefona"
              label="Broj telefona"
              mask="phone"
              :error="v$.brojTelefona.$dirty && state.brojTelefona"
            />
            <div class="error" v-if="v$.brojTelefona.$error">
              {{ v$.brojTelefona.$errors[0].$message }}
            </div>

            <q-select
              class="input-field"
              outlined
              v-model="state.rola"
              label="Rola"
              :error="v$.rola.$dirty && state.rola"
              :options="selectOptions"
            />
            <div class="error" v-if="v$.rola.$error">
              {{ v$.rola.$errors[0].$message }}
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="state.password"
              label="Lozinka"
              type="password"
              :error="v$.password.$dirty && state.password"
            />

            <div class="error" v-if="v$.password.$error">
              {{ v$.password.$errors[0].$message }}
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn label="Odustani" flat v-close-popup />
            <q-btn color="primary" label="Dodaj korisnika" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
      <div v-if="state.loading" class="loading">
        <h6 style="margin: 10px 0px 20px 0px">Molimo pricekajte...</h6>
        <q-spinner color="primary" size="3em" />
      </div>
    </q-dialog>
  </div>
</template>
<script>
import { reactive } from "vue";
import { initializeApp, deleteApp } from "firebase/app";
import useVuelidate from "@vuelidate/core";
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth";

import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
  helpers,
} from "@vuelidate/validators";

import { doc, setDoc } from "firebase/firestore";
import { db, auth, firebaseConfig } from "src/boot/firebase";
import { phoneRegex } from "../utils/regex";

export default {
  name: "UnosKorisnika",
  setup() {
    const state = reactive({
      prompt: false,
      ime: "",
      prezime: "",
      OIB: "",
      email: "",
      adresa: "",
      brojTelefona: "",
      rola: "VOZAC",
      password: "",
      loading: false,
      uid: null,
    });
    const selectOptions = ["ADMIN", "VOZAC"];
    const phoneRegexRule = helpers.regex(phoneRegex);
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
      adresa: {
        required: helpers.withMessage("Adresa je obavezno polje", required),
      },
      brojTelefona: {
        required: helpers.withMessage(
          "Broj telefona je obavezno polje",
          required
        ),
        // phoneRegex: helpers.withMessage(
        //   "Broj telefona mora biti u obliku 051 123 456",
        //   phoneRegexRule
        // ),
      },
      rola: {
        required: helpers.withMessage(
          "Morate odabrati korisničku rolu",
          required
        ),
      },
      password: {
        required: helpers.withMessage("Lozinka je obavezno polje", required),
      },
    };
    const v$ = useVuelidate(rules, state);

    const handleClick = () => {
      state.prompt = true;
    };

    const onSubmit = async (v$) => {
      // if form passes validation, call registerNewUser
      const formIsValid = await v$.$validate();
      if (formIsValid) {
        registerNewUser(state.email, state.password);
      }
    };
    // initialize and delete app for creating users
    const registerNewUser = async (email, password) => {
      let secondaryApp = initializeApp(firebaseConfig, "secondary");
      let secondaryAuth = getAuth(secondaryApp);
      state.loading = true;

      await createUserWithEmailAndPassword(secondaryAuth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          state.uid = user.uid;
          signOut(secondaryAuth).then(() => {
            console.log("signed out new user on secondary");
            deleteApp(secondaryApp).then(() => {
              console.log("secondary app deleted");
              addUserToCollection();
            });
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
    };
    // add new user to Korisnici collection with same uid from firebase users
    const addUserToCollection = async () => {
      await setDoc(doc(db, "Korisnici", state.uid), {
        ime: state.ime,
        prezime: state.prezime,
        OIB: state.OIB,
        email: state.email,
        adresa: state.adresa,
        brojTelefona: state.brojTelefona,
        rola: state.rola,
      });
      console.log("user added to collection");
      state.prompt = false;
      state.loading = false;
      state = {
        ...state,
        ime: "",
        prezime: "",
        OIB: "",
        email: "",
        adresa: "",
        brojTelefona: "",
        rola: "VOZAC",
        password: "",
      };
    };

    return {
      state,
      v$,
      handleClick,
      onSubmit,
      selectOptions,
    };
  },
};
</script>
