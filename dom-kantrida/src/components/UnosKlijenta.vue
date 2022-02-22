<template>
  <div>
    <q-btn color="primary" label="Dodaj klijenta" @click="handleClick" />
    <q-dialog v-model="prompt" persistent wid>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pt-none">
          <h6>Dodaj klijenta</h6>
          <div class="q-ma-lg">
            <q-input
              outlined
              v-model="ime"
              label="Molimo unesite ime"
              :dense="dense"
              :rules="[(val) => !!val || 'Molimo unesite vrijednost']"
            />
            <q-input
              outlined
              v-model="prezime"
              label="Molimo unesite prezime"
              :dense="dense"
              lazy-rules
              :rules="[
                (val) => provjeriVrijednost(val) || 'Molimo unesite vrijednost',
              ]"
            />
            <q-input
              outlined
              v-model="email"
              label="Molimo unesite email"
              :dense="dense"
            />
            <q-input
              outlined
              v-model="OIB"
              label="Molimo unesite OIB"
              :dense="dense"
            />
            <q-input
              outlined
              v-model="adresa"
              label="Molimo unesite adresu"
              :dense="dense"
            />
            <q-select
              class="q-gutter-md"
              v-model="odabraniDio"
              :options="dioGrada"
              label="Unesite dio grada u kojemu se korisnik nalazi"
              :dense="dense"
              outlined
            />
            <q-input
              v-model="datumRodjenja"
              outlined
              type="date"
              hint="Molimo unesite datum rođenja"
              :dense="dense"
              :rules="provjeriDatumRule"
            />

            <q-input
              outlined
              v-model="brojTelefona"
              label="Molimo unesite broj telefona"
              :dense="dense"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn
            color="primary"
            flat
            label="Dodaj klijenta"
            v-close-popup
            @click="dodajKlijenta()"
            :disable="!provjeriDatum()"
          />
        </q-card-actions>
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
import { collection, addDoc } from "firebase/firestore";

import { db } from "src/boot/firebase";

import { defineComponent } from "vue";
import Ugovori from "../components/Ugovori.vue";

export default defineComponent({
  components: { Ugovori },
  name: "UnosDostave",
  data() {
    return {
      prompt: false,
      handleUgovor: false,
      ime: "",
      prezime: "",
      email: "",
      OIB: "",
      adresa: "",
      dioGrada: ["istok", "zapad"],
      odabraniDio: "",
      datumRodjenja: "",
      brojTelefona: "",
      provjeriDatumRule: [
        (vrijednost) =>
          this.provjeriDatum() ||
          "Molimo unesite datum koji je manji od današnjeg",
      ],
    };
  },
  methods: {
    handleClick() {
      this.prompt = true;
    },
    async dodajKlijenta() {
      // provjeriDatum();
      const docRef = await addDoc(collection(db, "Klijenti"), {
        ime: this.ime,
        prezime: this.prezime,
        email: this.email,
        OIB: this.OIB,
        adresa: this.adresa,
        odabraniDio: this.odabraniDio,
        datumRodjenja: this.datumRodjenja,
        brojTelefona: this.brojTelefona,
      });
      console.log("Document written with ID: ", docRef.id);
      this.ime = "";
      this.prezime = "";
      this.email = "";
      this.OIB = "";
      (this.adresa = ""), (this.odabraniDio = "");
      this.datumRodjenja = "";
      this.brojTelefona = "";
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

      return this.datumRodjenja < trenutniDatum;
    },
    provjeriVrijednost(val) {
      console.log(val);
    },
  },
  mounted() {},
});
</script>
