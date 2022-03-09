<template>
  <div>
    <q-btn color="primary" label="Dodaj" icon="add" @click="handleClick" />
    <q-dialog v-model="state.prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-form style="width: 100%" @submit.stop="onSubmit(v$)">
          <q-card-section class="q-pt-none">
            <h5>
              {{ props.activeEdit ? "Uredi korisnika" : "Novi korisnik" }}
            </h5>
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
              :disable="props.activeEdit"
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
              v-if="!props.activeEdit"
              class="input-field"
              outlined
              v-model="state.password"
              label="Lozinka"
              :type="state.isPwd ? 'password' : 'text'"
              :error="v$.password.$dirty && state.password"
              ><template v-slot:append>
                <q-icon
                  :name="state.isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="state.isPwd = !state.isPwd"
                />
              </template>
            </q-input>

            <div class="error" v-if="v$.password.$error">
              {{ v$.password.$errors[0].$message }}
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn label="Odustani" flat @click="handleClose(v$)" />
            <q-btn
              color="primary"
              :label="props.activeEdit ? 'Spremi promjene' : 'Dodaj korisnika'"
              type="submit"
            />
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
import { reactive, watch } from "vue";
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
  requiredIf,
} from "@vuelidate/validators";

import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth, firebaseConfig } from "src/boot/firebase";

export default {
  name: "UnosKorisnika",
  props: ["activeEdit", "odabraniKorisnik", "editCompleted"],
  setup(props) {
    const state = reactive({
      activeEdit: props.activeEdit,
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
      isPwd: true,
    });

    watch(
      () => props.activeEdit,
      () => {
        if (props.activeEdit) {
          (state.prompt = true),
            (state.ime = props.odabraniKorisnik.ime),
            (state.prezime = props.odabraniKorisnik.prezime),
            (state.OIB = props.odabraniKorisnik.OIB),
            (state.adresa = props.odabraniKorisnik.adresa),
            (state.email = props.odabraniKorisnik.email),
            (state.brojTelefona = props.odabraniKorisnik.brojTelefona),
            (state.rola = props.odabraniKorisnik.rola);
        } else {
          (state.ime = ""),
            (state.prezime = ""),
            (state.OIB = ""),
            (state.adresa = ""),
            (state.email = ""),
            (state.brojTelefona = ""),
            (state.rola = "");
        }
      }
    );

    const selectOptions = ["ADMIN", "VOZAC"];
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
      },
      rola: {
        required: helpers.withMessage(
          "Morate odabrati korisničku rolu",
          required
        ),
      },
      password: {
        required: helpers.withMessage(
          "Lozinka je obavezno polje",
          requiredIf(() => {
            return !props.activeEdit;
          })
        ),
      },
    };
    const v$ = useVuelidate(rules, state);

    const handleClick = () => {
      state.prompt = true;
    };
    // kad se zatvori modalni prozor, ocisti podatke iz formi
    const handleClose = (v$) => {
      state.prompt = false;
      state.loading = false;
      state.ime = "";
      state.prezime = "";
      state.OIB = "";
      state.email = "";
      state.adresa = "";
      state.brojTelefona = "";
      state.rola = "VOZAC";
      state.password = "";
      props.editCompleted();
      v$.$reset();
    };

    const onSubmit = async (v$) => {
      // if form passes validation, call registerNewUser
      const formIsValid = await v$.$validate();
      if (formIsValid) {
        if (!props.activeEdit) {
          registerNewUser(state.email, state.password);
        } else {
          state.loading = true;
          const docRef = doc(db, "Korisnici", props.odabraniKorisnik.id);
          await updateDoc(docRef, {
            ime: state.ime,
            prezime: state.prezime,
            OIB: state.OIB,
            email: state.email,
            adresa: state.adresa,
            brojTelefona: state.brojTelefona,
            rola: state.rola,
            deleted: false,
          });
          state.loading = false;
          state.prompt = false;
          props.editCompleted();
        }
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
        deleted: false,
      });
      console.log("user added to collection");
      state.prompt = false;
      state.loading = false;
      state.ime = "";
      state.prezime = "";
      state.OIB = "";
      state.email = "";
      state.adresa = "";
      state.brojTelefona = "";
      state.rola = "VOZAC";
    };
    return {
      state,
      props,
      v$,
      handleClick,
      handleClose,
      onSubmit,
      selectOptions,
    };
  },
};
</script>
