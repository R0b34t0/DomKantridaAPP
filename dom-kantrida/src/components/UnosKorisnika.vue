<template>
  <div>
    <q-btn color="primary" label="Dodaj" @click="handleClick" />
    <q-dialog v-model="prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-form style="width: 100%" @submit.stop="onSubmit">
          <q-card-section class="q-pt-none">
            <h6>Dodaj korisnika</h6>
            <q-input
              class="input-field"
              outlined
              v-model="korisnik.ime"
              label="Ime"
              :error="v$.korisnik.ime.$dirty && korisnik.ime"
            />
            <div class="error" v-if="v$.korisnik.ime.$error">
              Ime je obavezno polje.
            </div>
            <q-input
              class="input-field"
              outlined
              v-model="korisnik.prezime"
              label="Prezime"
              :error="v$.korisnik.prezime.$dirty && korisnik.prezime"
            />
            <div class="error" v-if="v$.korisnik.prezime.$error">
              Prezime je obavezno polje.
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="korisnik.OIB"
              label="OIB"
              :error="v$.korisnik.OIB.$dirty && korisnik.OIB"
            />
            <div class="error" v-if="v$.korisnik.OIB.$error">
              OIB mora sadržavati 11 znakova.
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="korisnik.email"
              label="Email"
              :error="v$.korisnik.email.$dirty && korisnik.email"
            />
            <div class="error" v-if="v$.korisnik.email.$error">
              Email mora biti u obliku primjer@email.com.
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="korisnik.adresa"
              label="Adresa"
              :error="v$.korisnik.adresa.$dirty && korisnik.adresa"
            />
            <div class="error" v-if="v$.korisnik.adresa.$error">
              Adresa je obavezno polje.
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="korisnik.brojTelefona"
              label="Broj telefona"
              :error="v$.korisnik.brojTelefona.$dirty && korisnik.brojTelefona"
            />
            <div class="error" v-if="v$.korisnik.brojTelefona.$error">
              Broj telefona je obavezno polje.
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="korisnik.rola"
              label="Rola"
              :error="v$.korisnik.rola.$dirty && korisnik.rola"
            />
            <div class="error" v-if="v$.korisnik.rola.$error">
              Rola je obavezno polje.
            </div>

            <q-input
              class="input-field"
              outlined
              v-model="korisnik.password"
              label="Password"
              type="password"
              :error="v$.korisnik.password.$dirty && korisnik.password"
            />
            <div class="error" v-if="v$.korisnik.password.$error">
              Lozinka je obavezno polje.
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn label="Odustani" flat v-close-popup />
            <q-btn color="primary" label="Dodaj korisnika" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import useVuelidate from "@vuelidate/core";
import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
} from "@vuelidate/validators";

export default defineComponent({
  name: "UnosKorisnika",
  data() {
    return {
      v$: useVuelidate(),
      prompt: false,
      korisnik: {
        ime: "",
        prezime: "",
        OIB: "",
        email: "",
        adresa: "",
        brojTelefona: "",
        rola: "",
        password: "",
      },
    };
  },
  validations() {
    return {
      korisnik: {
        ime: { required },
        prezime: { required },
        OIB: {
          required,
          numeric,
          minLength: minLength(11),
          maxLength: maxLength(11),
        },
        email: { required, email },
        adresa: { required },
        brojTelefona: { required, numeric },
        rola: { required },
        password: { required },
      },
    };
  },
  methods: {
    handleClick() {
      this.prompt = true;
    },
    async onSubmit() {
      const isFormCorrect = await this.v$.$validate();
      console.log(this.v$);
      if (!isFormCorrect) {
        alert("nije dobro");
      } else {
        alert("dobro je");
      }
    },
  },
  mounted() {},
});
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
