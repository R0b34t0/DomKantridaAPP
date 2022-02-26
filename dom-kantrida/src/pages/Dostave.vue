<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-3">Dostave</h4>
      <div class="flex-start col-7">
        <h4>{{ this.formatDateDisplay(izabraniDatum) }}</h4>
        <q-icon
          name="calendar_month"
          size="4em"
          @click="prikaziDate"
          style="color: #1976d2"
        >
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="izabraniDatum" minimal @change="getData()"
              ><div class="row items-center justify-end q-gutter-sm">
                <q-btn label="Cancel" color="primary" flat v-close-popup />
                <q-btn
                  label="OK"
                  color="primary"
                  flat
                  @click="onDateChange"
                  v-close-popup
                /></div
            ></q-date>
          </q-popup-proxy>
        </q-icon>
      </div>
      <UnosDostave class="flex-end col-2" />
    </div>

    <q-table
      :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
      :rows="dostave"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="Nema dostava za izabrani datum"
    >
    </q-table>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import UnosDostave from "../components/UnosDostave.vue";
import {
  formatDate,
  formatDateDisplay,
  getDateAndTime,
  getDate,
} from "../utils/formatDate";

const columns = [
  {
    name: "id",
    label: "ID",
    align: "left",
    field: "id",
    sortable: false,
  },
  {
    name: "datumDostave",
    label: "Datum",
    align: "left",
    field: "datumDostave",
    sortable: true,
  },
  {
    name: "brojPaketa",
    align: "left",
    label: "Broj paketa",
    field: "brojPaketa",
    sortable: true,
  },
  {
    name: "klijent",
    label: "Klijent",
    align: "left",
    field: "klijent",
    sortable: false,
  },
  {
    name: "adresa",
    label: "Adresa",
    align: "left",
    field: "adresa",
    sortable: false,
  },
  {
    name: "statusDostave",
    align: "left",
    label: "Status dostave",
    field: "statusDostave",
    sortable: true,
  },
  {
    name: "vrijemeZavrsetkaDostave",
    align: "left",
    label: "Vrijeme zavrsetka dostave",
    field: "vrijemeZavrsetkaDostave",
    sortable: true,
  },
];

const today = new Date();
export default defineComponent({
  components: { UnosDostave },
  name: "Dostave",
  data() {
    return {
      dostave: [],
      columns,
      loading: false,
      prikaziDatePicker: false,
      izabraniDatum: formatDate(today),
    };
  },
  methods: {
    //query za dostave na odabrani datum
    async getData(datum) {
      const q = query(
        collection(db, "Dostave"),
        where("datumDostave", ">=", new Date(this.izabraniDatum)),
        where("datumDostave", "<", this.dodajDanZaFilter(datum))
      );
      this.loading = true;
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        this.dostave.push({
          id: doc.id,
          brojPaketa: data.brojPaketa ? data.brojPaketa : "",
          datumDostave: data.datumDostave
            ? getDate(data.datumDostave.seconds)
            : "",
          statusDostave: data.statusDostave ? data.statusDostave : "",
          vrijemeZavrsetkaDostave: data.vrijemeZavrsetkaDostave
            ? getDateAndTime(data.vrijemeZavrsetkaDostave.seconds)
            : "",
          adresa: "test",
          klijent: "ime prezime",
        });
      });
      this.loading = false;
    },
    //za prikazivanje datuma u formatu dd.mm.yyyy iz oblika yyyy/mm/dd
    formatDateDisplay,
    //za prikaz datuma i vremena u tablici u formatu dd.mm.yyyy hh:mm iz unix timestampa
    getDateAndTime,
    //za prikaz datuma u formatu dd.mm.yyyy iz unix timestampa
    getDate,
    //za prikazivanje pop-up prozora s date pickerom
    prikaziDate() {
      this.prikaziDatePicker = !this.prikaziDatePicker;
    },
    //za firebase where filter - jer su zbog vremena potrebna 2 datuma npr. 19.02.2022 00:00 - 20.2.2022 00:00 za sve dostave na 19.2.2022.
    dodajDanZaFilter(date) {
      var noviDatum = new Date(date);
      noviDatum.setDate(noviDatum.getDate() + 1);
      return noviDatum;
    },
    //kod promjene datuma ponovi query
    onDateChange() {
      this.dostave = [];
      this.getData(this.izabraniDatum);
    },
  },
  mounted() {
    this.getData(this.izabraniDatum);
  },
});
</script>
