<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-3">Dostave</h4>
      <div class="flex-start col-8">
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
      <UnosDostave class="flex-end col-1" />
    </div>

    <q-table
      :rows="dostave"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="Nema dostava za izabrani datum"
    >
      <!-- <template v-slot:top>
        <div class="table-header">
          <h5>Dostave</h5>
          <UnosDostave />
        </div>
      </template> -->
    </q-table>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import UnosDostave from "../components/UnosDostave.vue";
import { formatDate, formatDateDisplay } from "../utils/formatDate";

const columns = [
  {
    name: "id",
    required: true,
    label: "ID",
    align: "left",
    field: "id",
    sortable: false,
  },
  {
    name: "datumDostave",
    required: true,
    label: "Datum",
    align: "left",
    field: "datumDostave",
    sortable: true,
  },
  {
    name: "broj",
    align: "center",
    label: "Prezime",
    field: "prezime",
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
      proxyDate: formatDate(today),
    };
  },
  methods: {
    async getData(datum) {
      const q = query(
        collection(db, "Dostave"),
        where("datumDostave", ">=", new Date(this.izabraniDatum)),
        where("datumDostave", "<", this.dodajDanZaFilter(datum))
      );
      this.loading = true;
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        this.dostave.push({ id: doc.id, ...doc.data() });
        console.log(doc.data());
      });
      this.loading = false;
    },
    //za prikazivanje datuma u formatu dd.mm.yyyy
    formatDateDisplay,
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
