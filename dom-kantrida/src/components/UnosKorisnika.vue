<template>
  <div>
    <q-btn color="primary" label="Dodaj" @click="handleClick" />
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
    <q-dialog v-model="state.confirmPasswordPrompt" persistent wid>
      <q-card style="min-width: 300px">
        <q-card-section class="q-pt-none">
          <h6 style="margin: 20px 0px 20px 0px">Potvrdi lozinku</h6>
          <p>
            Kako bi mogli dodati novog korisnika, potrebno je potvrditi lozinku!
          </p>
          <q-input
            class="input-field"
            outlined
            v-model="state.currentUserPassword"
            label="Lozinka"
            type="password"
          />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn
            label="Odustani"
            flat
            @click="
              () => {
                state.confirmPasswordPrompt = false;
                state.prompt = false;
              }
            "
          />
          <q-btn
            color="primary"
            label="Potvrdi lozinku"
            @click="confirmCurrentUserPassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { reactive } from "vue";
import useVuelidate from "@vuelidate/core";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  EmailAuthProvider,
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
import { db } from "src/boot/firebase";

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
      rola: "",
      password: "",
      currentUser: "",
      confirmPasswordPrompt: false,
      currentUserEmail: "",
      currentUserPassword: "",
      loading: "false",
    });
    const selectOptions = ["ADMIN", "VOZAC"];
    const phoneRegex = helpers.regex(
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
    );
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
        phoneRegex: helpers.withMessage(
          "Broj telefona mora biti u obliku 051 123 456",
          phoneRegex
        ),
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
    const auth = getAuth();
    state.currentUser = auth.currentUser;

    if (auth.currentUser) {
      state.currentUserEmail = auth.currentUser.email;
    }

    const onSubmit = async (v$) => {
      // if form passes validation, open modal to confirm password
      const formIsValid = await v$.$validate();
      if (formIsValid) {
        state.confirmPasswordPrompt = true;
      }
    };
    // confirms current logged in user and current password is saved in state
    const confirmCurrentUserPassword = async () => {
      const credential = EmailAuthProvider.credential(
        state.currentUserEmail,
        state.currentUserPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential)
        .then(() => {
          state.confirmPasswordPrompt = false;
          console.log("user reauthenticated");
          registerNewUser();
        })
        .catch((error) => {
          alert("Pogrešna lozinka");
        });
    };
    // after current user is reauthenticated (after password is confirmed) we can register new user
    const registerNewUser = async () => {
      state.loading = true;
      await createUserWithEmailAndPassword(auth, state.email, state.password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user.uid);
          // after new user is created and for no reason signed in by default (da fak u doin firebase) we can add user to the collection
          addUserToCollection(user.uid);
        })
        .catch((error) => {
          console.log(error.message);
        });
    };
    // add new user to Korisnici collection with same uid from firebase users and call sign out function for new user
    const addUserToCollection = async (uid) => {
      await setDoc(doc(db, "Korisnici", uid), {
        ime: state.ime,
        prezime: state.prezime,
        OIB: state.OIB,
        email: state.email,
        adresa: state.adresa,
        brojTelefona: state.brojTelefona,
        rola: state.rola,
      });
      console.log("user added to collection");
      signOutNewUser();
    };
    // sign out newly created user and call function to log in current user
    const signOutNewUser = () => {
      signOut(auth)
        .then(() => {
          console.log("signed out");
          signCurrentUserBackIn();
        })
        .catch((error) => {
          console.log(error);
        });
    };
    // after new user is signed out, we can sign back in current user haha
    const signCurrentUserBackIn = () => {
      signInWithEmailAndPassword(
        auth,
        state.currentUserEmail,
        state.currentUserPassword
      )
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log("yooo i'm back");
          state.prompt = false;
          state.loading = false;
          // ...
        })
        .catch((error) => {
          console.log(error.message);
        });
    };

    return {
      state,
      v$,
      handleClick,
      onSubmit,
      confirmCurrentUserPassword,
      selectOptions,
    };
  },
};
</script>
<style>
.input-field {
  padding-bottom: 10px;
}
.error {
  color: red;
  font-size: 12px;
  margin: -10px 0px 10px 10px;
}
</style>
