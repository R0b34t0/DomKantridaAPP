<template>
  <q-page class="full-width row">
    <div class="col-12" style="padding: 10px">
      <h4>Prijavljena kašnjenja</h4>
      <q-table
        :table-header-style="{ backgroundColor: '#1976D2', color: 'white' }"
        :rows="state.kasnjenje"
        :columns="columnsKasnjenje"
        row-key="id"
        :loading="state.loading"
        no-data-label="Nema prijavljenih kašnjenja..."
        loading-label="Podaci se učitavaju... "
        color="orange"
        :pagination="pagination"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, reactive } from "vue";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  getDoc,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";

export default defineComponent({
  name: "PageIndex",
  setup() {
    const state = reactive({
      dostave: [],
      kasnjenje: [],
      loading: false,
    });
    const today = new Date();
    today.setHours(0, 0, 0);
    let unsub;

    const getDataKasnjenja = async () => {
      const q = query(
        collection(db, "Kasnjenja"),
        where("datumPrijave", ">=", oduzmiDanZaFilter(today)),
        where("datumPrijave", "<", dodajDanZaFilter(today))
      );
      state.kasnjenje = [];
      state.loading = true;

      unsub = onSnapshot(q, (querySnapshot) => {
        state.kasnjenje = [];

        querySnapshot.forEach(async (doc) => {
          let data = doc.data();
          const vozac = await getDataVozaci(data.vozac);
          const datumPrijave = new Date(data.datumPrijave.seconds * 1000);
          let minute = datumPrijave.getMinutes();
          if (String(minute).length == 1) {
            minute = "0" + minute;
          }
          let kasnjenje = {
            id: doc.id,
            lokacija: data.lokacija ? data.lokacija : "Nema podatka!",
            razlogKasnjenja: data.razlogKasnjenja
              ? data.razlogKasnjenja
              : "Nema podatka!",
            vozac: vozac.ime,
            brojTelefona: vozac.brojTelefona,
            vrijemePrijave: datumPrijave.getHours() + ":" + minute + " h",
          };
          state.kasnjenje.push(kasnjenje);
        });
        state.loading = false;
      });
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
    const oduzmiDanZaFilter = (date) => {
      let noviDatum = date;
      noviDatum.setDate(noviDatum.getDate() - 1);
      noviDatum.setHours(23, 59, 59);
      return noviDatum;
    };
    const dodajDanZaFilter = (date) => {
      let noviDatum = new Date(date);
      noviDatum.setDate(noviDatum.getDate() + 1);
      return noviDatum;
    };

    onMounted(() => {
      getDataKasnjenja();
    });
    onUnmounted(() => {
      unsub();
    });

    const columnsKasnjenje = [
      {
        name: "vrijemePrijave",
        label: "Vrijeme prijave",
        align: "center",
        field: "vrijemePrijave",
        sortable: false,
      },

      {
        name: "lokacija",
        label: "Lokacija",
        align: "center",
        field: "lokacija",
        sortable: true,
      },
      {
        name: "razlogKasnjenja",
        label: "Razlog kašnjenja",
        align: "center",
        field: "razlogKasnjenja",
        sortable: true,
      },
      {
        name: "vozac",
        label: "Vozač",
        align: "center",
        field: "vozac",
        sortable: true,
      },
      {
        name: "brojTelefona",
        label: "Broj telefona vozača",
        align: "center",
        field: "brojTelefona",
        sortable: true,
      },
    ];
    const pagination = {
      rowsPerPage: 10,
    };
    return { state, pagination, columnsKasnjenje };
  },
});
</script>
