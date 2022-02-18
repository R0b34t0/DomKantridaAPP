<template>
  <div>
    <q-btn color="primary" label="Dodaj" @click="handleClick" />
    <q-dialog v-model="prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pt-none">
          <h6>Dodaj korisnika</h6>
          <q-input outlined v-model="korisnik.ime" label="Ime" :dense="dense" />
          <q-input
            outlined
            v-model="korisnik.prezime"
            label="Prezime"
            :dense="dense"
          />
          <q-input outlined v-model="korisnik.OIB" label="OIB" :dense="dense" />
          <q-input
            outlined
            v-model="korisnik.email"
            label="Email"
            :dense="dense"
          />
          <q-input
            outlined
            v-model="korisnik.adresa"
            label="Adresa"
            :dense="dense"
          />
          <q-input
            outlined
            v-model="korisnik.brojTelefona"
            label="Broj telefona"
            :dense="dense"
          />
          <q-input
            outlined
            v-model="korisnik.rola"
            label="Rola"
            :dense="dense"
          />
          <q-input
            outlined
            v-model="password"
            label="Password"
            :dense="dense"
            type="password"
          />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn flat label="Dodaj korisnika" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnosKorisnika",
  data() {
    return {
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
  methods: {
    handleClick() {
      this.prompt = true;
    },
  },
  mounted() {},
});
</script>
