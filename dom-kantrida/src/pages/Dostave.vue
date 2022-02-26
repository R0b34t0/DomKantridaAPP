<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-3">Dostave</h4>
      <div class="flex-start col-7">
        <h4>{{ formatDateForDisplay(state.izabraniDatum) }}</h4>
        <q-icon
          name="calendar_month"
          size="4em"
          @click="prikaziDate"
          style="color: #1976d2"
        >
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="state.izabraniDatum" minimal @change="getData()"
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
      :rows="state.dostave"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="Nema dostava za izabrani datum"
    >
      <template v-slot:body-cell-statusDostave="statusDostave">
        <q-td :props="statusDostave">
          <div>
            <q-badge
              :class="
                statusDostave.value == 'DOSTAVLJENO' ? 'green-bg' : 'red-bg'
              "
              :label="statusDostave.value"
            />
          </div>
          <div class="my-table-details">
            {{ statusDostave.row.details }}
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script>
import { onMounted, reactive } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import UnosDostave from "../components/UnosDostave.vue";
import {
  formatDate,
  formatDateDisplay,
  getDateAndTime,
  getDate,
} from "../utils/formatDate";

export default {
  components: { UnosDostave },
  name: "Dostave",
  setup() {
    const today = new Date();
    const state = reactive({
      dostave: [],
      loading: false,
      prikaziDatePicker: false,
      izabraniDatum: formatDate(today),
    });
    //
    //query za dostave na odabrani datum
    const getData = async (datum) => {
      const q = query(
        collection(db, "Dostave"),
        where("datumDostave", ">=", new Date(state.izabraniDatum)),
        where("datumDostave", "<", dodajDanZaFilter(datum))
      );
      state.loading = true;
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        state.dostave.push({
          id: doc.id,
          brojPaketa: data.brojPaketa ? data.brojPaketa : "",
          datumDostave: data.datumDostave
            ? getDate(data.datumDostave.seconds)
            : "",
          statusDostave: data.statusDostave ? data.statusDostave : "",
          vrijemeZavrsetkaDostave: data.vrijemeZavrsetkaDostave
            ? getDateAndTime(data.vrijemeZavrsetkaDostave.seconds)
            : "/",
          adresa: "test",
          klijent: "ime prezime",
        });
      });
      state.loading = false;
    };
    const formatDateForDisplay = (date) => {
      return formatDateDisplay(date);
    };
    //za prikazivanje pop-up prozora s date pickerom
    const prikaziDate = () => {
      state.prikaziDatePicker = !state.prikaziDatePicker;
    };
    //za firebase where filter - jer su zbog vremena potrebna 2 datuma npr. 19.02.2022 00:00 - 20.2.2022 00:00 za sve dostave na 19.2.2022.
    const dodajDanZaFilter = (date) => {
      var noviDatum = new Date(date);
      noviDatum.setDate(noviDatum.getDate() + 1);
      return noviDatum;
    };
    //kod promjene datuma ponovi query
    const onDateChange = () => {
      state.dostave = [];
      getData(state.izabraniDatum);
    };
    //
    onMounted(() => {
      getData(state.izabraniDatum);
    });
    // stupci
    const columns = [
      {
        name: "id",
        label: "ID",
        align: "center",
        field: "id",
        sortable: false,
      },
      {
        name: "datumDostave",
        label: "Datum",
        align: "center",
        field: "datumDostave",
        sortable: true,
      },
      {
        name: "brojPaketa",
        align: "center",
        label: "Broj paketa",
        field: "brojPaketa",
        sortable: true,
      },
      {
        name: "klijent",
        label: "Klijent",
        align: "center",
        field: "klijent",
        sortable: false,
      },
      {
        name: "adresa",
        label: "Adresa",
        align: "center",
        field: "adresa",
        sortable: false,
      },
      {
        name: "statusDostave",
        align: "center",
        label: "Status dostave",
        field: "statusDostave",
        sortable: true,
      },
      {
        name: "vrijemeZavrsetkaDostave",
        align: "center",
        label: "Vrijeme zavrsetka dostave",
        field: "vrijemeZavrsetkaDostave",
        sortable: true,
      },
    ];
    return {
      state,
      columns,
      prikaziDate,
      formatDateForDisplay,
      onDateChange,
      getData,
    };
  },
};
</script>
