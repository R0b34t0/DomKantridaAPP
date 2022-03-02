<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-3">Dostave</h4>
      <div class="flex-start col-5">
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

      <UnosDostave
        class="flex-end col-4"
        :izabraniDatum="state.izabraniDatum"
      />
    </div>

    <q-table
      :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
      :rows="state.dostave"
      :columns="columns"
      row-key="id"
      :loading="state.loading"
      no-data-label="Nema dostava za izabrani datum"
      loading-label="Podaci se učitavaju... "
      color="orange"
    >
      <template v-slot:body-cell-statusDostave="statusDostave">
        <q-td :props="statusDostave">
          <div>
            <q-badge
              :class="getStyleForStatus(statusDostave.value)"
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
import { onMounted, onUnmounted, reactive } from "vue";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  getDoc,
  getDocs,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
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
    today.setHours(0, 0, 0);
    const state = reactive({
      dostave: [],
      loading: false,
      prikaziDatePicker: false,
      izabraniDatum: formatDate(today),
      disableBtn: false,
    });
    let unsub;
    //query za dostave na odabrani datum
    const getData = async (datum) => {
      const q = query(
        collection(db, "Dostave"),
        where("datumDostave", ">=", new Date(state.izabraniDatum)),
        where("datumDostave", "<", dodajDanZaFilter(datum))
      );
      state.loading = true;
      unsub = onSnapshot(q, (querySnapshot) => {
        state.dostave = [];
        querySnapshot.forEach(async (doc) => {
          let data = doc.data();
          let klijent = await getUserData(data.klijent);
          let ugovor = await getUgovor(data.klijent);
          let vozac = await getDataVozaci(data.vozac);
          state.dostave.push({
            id: doc.id,
            brojPaketa: ugovor ? ugovor.zaduzeniRuckovi : "Nema podatka",
            vrstaPrehrane: ugovor ? ugovor.vrstaPrehrane : "Nema podatka",
            datumDostave: data.datumDostave
              ? getDate(data.datumDostave.seconds)
              : "",
            statusDostave: data.statusDostave ? data.statusDostave : "",
            vrijemeZavrsetkaDostave: data.vrijemeZavrsetkaDostave
              ? getDateAndTime(data.vrijemeZavrsetkaDostave.seconds)
              : "/",
            adresa: klijent ? klijent.adresa : "Nema podataka",
            klijent: klijent ? klijent.ime : "Nema podataka",
            vozac: vozac ? vozac.ime : "Nema podatka",
            brojTelefona: vozac ? vozac.brojTelefona : "Nema podatka",
          });
        });
        state.loading = false;
      });
    };
    // podaci o korisniku koji se nalazi na dostavi
    const getUserData = async (uid) => {
      const docRef = doc(db, "Klijenti", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const klijent = {
          id: docSnap.id,
          ime: data.ime + " " + data.prezime,
          adresa: data.adresa,
        };
        return klijent;
      } else {
        console.log("Klijent nije pronadjen!");
      }
    };
    // podaci o ugovori za odredjenog korisnika
    const getUgovor = async (uid) => {
      const docRef = collection(db, "Ugovori");
      const q = query(docRef, where("korisnik", "==", uid));
      const docSnap = await getDocs(q);
      const datum = new Date(state.izabraniDatum);
      const izabraniDan = datum.getDay();
      let ugovorTest = {};
      docSnap.forEach((doc) => {
        let data = doc.data();
        const ugovor = {
          id: doc.id,
          vrstaPrehrane: data.vrstaPrehrane,
          zaduzeniRuckovi: data.zaduzeniRuckovi[izabraniDan],
        };
        ugovorTest = ugovor;
      });
      return ugovorTest;
    };
    // podaci o vozacima
    const getDataVozaci = async (uid) => {
      const docRef = doc(db, "Korisnici", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const vozac = {
          id: docSnap.id,
          ime: data.ime + " " + data.prezime,
          brojTelefona: data.brojTelefona,
        };
        return vozac;
      } else {
        console.log("Vozac nije pronadjen!");
      }
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
      const datum = new Date(state.izabraniDatum);
      datum.setHours(1, 0, 0);
      if (datum <= today) {
        state.disableBtn = true;
      } else {
        state.disableBtn = false;
      }
      getData(state.izabraniDatum);
    };
    //
    onMounted(() => {
      getData(state.izabraniDatum);
    });

    onUnmounted(() => {
      unsub();
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
        name: "vozac",
        label: "Vozac",
        align: "center",
        field: "vozac",
        sortable: false,
      },
      {
        name: "brojPaketa",
        align: "center",
        label: "Broj paketa",
        field: "brojPaketa",
        sortable: true,
      },
      {
        name: "vrstaPrehrane",
        align: "center",
        label: "Vrsta prehrane",
        field: "vrstaPrehrane",
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
    const getStyleForStatus = (status) => {
      if (status === "DOSTAVLJENO") {
        return "green-bg";
      } else if (status === "NIJE DOSTAVLJENO") {
        return "red-bg";
      } else {
        return "orange-bg";
      }
    };
    return {
      state,
      columns,
      prikaziDate,
      formatDateForDisplay,
      onDateChange,
      getData,
      getStyleForStatus,
    };
  },
};
</script>
