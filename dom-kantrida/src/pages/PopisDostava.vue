<template>
  <q-page
    ><q-banner
      v-for="kasnjenje in state.kasnjenje"
      :key="kasnjenje.id"
      rounded
      inline-actions
      class="text-white bg-red"
      style="margin: 10px 10px 0px 10px"
    >
      <template v-slot:avatar>
        <q-icon name="warning" color="white" />
      </template>
      Lokacija: <strong>{{ kasnjenje.lokacija }}</strong
      ><br />
      Opis: {{ kasnjenje.razlogKasnjenja }}
    </q-banner>
    <div class="fixed-center text-h6" v-if="state.dostave.length === 0">
      Nema dostava...
    </div>
    <q-scroll-area
      v-if="state.dostave.length > 0"
      style="height: calc(100vh - 50px); width: 100vw; padding-bottom: 50px"
    >
      <CardDostava
        v-for="dostava in filterDostava()"
        :key="dostava.id"
        :dostava="dostava"
      />
    </q-scroll-area>
    <q-page-sticky position="bottom">
      <q-btn-toggle
        v-model="state.izabraniDioGrada"
        toggle-color="orange"
        spread
        color="white"
        text-color="orange"
        style="border-radius: 0px; height: 50px; width: 100vw"
        :options="[
          { label: 'ISTOK', value: 'ISTOK' },
          { label: 'ZAPAD', value: 'ZAPAD' },
        ]"
      />
    </q-page-sticky>
    <div v-if="state.loading" class="fixed-center">
      <q-spinner color="primary" size="3em" />
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 70]">
      <q-btn
        size="large"
        round
        color="red"
        icon="priority_high"
        @click="openPrijava"
      />
    </q-page-sticky>
    <PrijavaKasnjenja
      :prijavaKasnjenja="state.prijavaKasnjenja"
      :kasnjenjeCompleted="kasnjenjeCompleted"
      :uid="state.user && state.user.uid"
    />
  </q-page>
</template>
<script>
import { onMounted, onUnmounted, reactive } from "vue";
import { db, user } from "src/boot/firebase";
import {
  collection,
  query,
  getDoc,
  getDocs,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { formatDateDisplay } from "../utils/formatDate";

import CardDostava from "../components/CardDostava.vue";
import PrijavaKasnjenja from "../components/PrijavaKasnjenja.vue";
import { useRouter } from "vue-router";

export default {
  name: "PrikazDostava",
  components: { CardDostava, PrijavaKasnjenja },
  setup() {
    const today = new Date();
    today.setHours(0, 0, 0);
    const state = reactive({
      loading: false,
      dostave: [],
      izabraniDioGrada: "ISTOK",
      showActions: false,
      loading: false,
      disableBtn: false,
      prijavaKasnjenja: false,
      kasnjenje: [],
      user: {},
    });

    let unsub;
    let unsub1;
    const router = useRouter();
    //query za dostave na odabrani datum
    const getData = async () => {
      const q = query(
        collection(db, "Dostave"),
        where("datumDostave", ">=", oduzmiDanZaFilter(today)),
        where("datumDostave", "<", dodajDanZaFilter(today)),
        where("vozac", "==", state.user.uid)
      );
      state.dostave = [];
      state.loading = true;
      unsub = onSnapshot(q, (querySnapshot) => {
        state.dostave = [];
        let dostava = {};
        querySnapshot.forEach(async (doc) => {
          let data = doc.data();
          let klijent = await getUserData(data.klijent);
          let ugovor = await getUgovor(data.klijent);

          if (data.statusDostave === "NA ČEKANJU") {
            dostava = {
              id: doc.id,
              brojPaketa: ugovor ? ugovor.zaduzeniRuckovi : "Nema podatka",
              vrstaPrehrane: ugovor ? ugovor.vrstaPrehrane : "Nema podatka",
              adresa: klijent ? klijent.adresa : "Nema podataka",
              id_klijenta: klijent ? klijent.id : "Nema podatka",
              klijent: klijent ? klijent.ime : "Nema podataka",
              brojTelefona: klijent ? klijent.brojTelefona : "Nema podatka",
              dioGrada: data.odabraniDio ? data.odabraniDio : "ISTOK",
            };
            state.dostave.push(dostava);
          }
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
          brojTelefona: data.brojTelefona,
        };
        return klijent;
      } else {
        console.log("Klijent nije pronadjen!");
      }
    };
    // podaci o ugovori za odredjenog korisnika
    const getUgovor = async (uid) => {
      const docRef = collection(db, "Ugovori");
      const q = query(docRef, where("klijent", "==", uid));
      const docSnap = await getDocs(q);
      const datum = new Date();
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
    ///
    const getDataKasnjenja = async () => {
      const datum = new Date();
      datum.setHours(0, 0, 0);
      const q = query(
        collection(db, "Kasnjenja"),
        where("datumPrijave", ">=", oduzmiDanZaFilter(datum)),
        where("datumPrijave", "<", dodajDanZaFilter(datum))
      );
      state.kasnjenje = [];
      state.loading = true;

      unsub1 = onSnapshot(q, (querySnapshot) => {
        state.kasnjenje = [];

        querySnapshot.forEach(async (doc) => {
          let data = doc.data();

          if (data.vozac !== state.user.uid) {
            let datumPrijave = new Date(data.datumPrijave.seconds * 1000);
            datumPrijave.setMinutes(datumPrijave.getMinutes() + 15);
            let trenutnoVrijeme = new Date();

            if (datumPrijave > trenutnoVrijeme) {
              let kasnjenje = {
                id: doc.id,
                lokacija: data.lokacija ? data.lokacija : "Nema podatka!",
                razlogKasnjenja: data.razlogKasnjenja
                  ? data.razlogKasnjenja
                  : "Nema podatka!",
                datumPrijave: data.datumPrijave
                  ? data.datumPrijave
                  : "Nema podatka!",
              };
              state.kasnjenje.push(kasnjenje);
            }
          }
        });
        state.loading = false;
      });
    };

    const checkAuthState = async () => {
      let currentUser = await user();
      if (currentUser) {
        state.user = currentUser;
        getData();
        getDataKasnjenja();
      } else {
        router.push("/login");
      }
    };

    onMounted(() => {
      checkAuthState();
    });

    onUnmounted(() => {
      unsub();
      unsub1();
    });

    const kasnjenjeCompleted = () => {
      state.prijavaKasnjenja = false;
    };

    const openPrijava = () => {
      state.prijavaKasnjenja = true;
    };

    const showMore = () => {
      state.showActions = !state.showActions;
    };

    const formatDateForDisplay = (date) => {
      return formatDateDisplay(date);
    };

    // filtrira dostave na istok i zapad
    const filterDostava = () => {
      let dostave = [];
      state.dostave.filter((dostava) => {
        if (
          dostava?.dioGrada?.toUpperCase() ===
          state.izabraniDioGrada.toUpperCase()
        ) {
          dostave.push(dostava);
        }
      });
      return dostave;
    };

    return {
      state,
      filterDostava,
      formatDateForDisplay,
      kasnjenjeCompleted,
      showMore,
      openPrijava,
      getData,
    };
  },
};
</script>
