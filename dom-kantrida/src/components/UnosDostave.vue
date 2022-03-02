<template>
  <div>
    <q-btn
      id="auto"
      color="orange"
      icon="autorenew"
      label="Generiraj"
      :disabled="state.disableBtn"
      style="margin-right: 20px"
      @click="handleClickAuto"
    />
    <q-btn
      id="manual"
      color="primary"
      label="Dodaj"
      icon="add"
      @click="handleClickManual"
    />

    <q-dialog v-model="state.prompt" persistent wid>
      <q-card style="min-width: 700px">
        <q-form style="width: 100%" @submit.stop="onSubmit(v$)">
          <q-card-section class="q-pt-none">
            <h5 class="col-6" style="margin-bottom: 20px">
              {{
                state.mode === "manual"
                  ? "Dodaj dostavu"
                  : "Automatsko generiranje dostava"
              }}
            </h5>
            <p style="margin-bottom: 30px">
              Za dodavanje nove dostave potrebno je odabrati klijenta i vozača.
              Ukoliko je potrebno, dodatne informacije se mogu upisati u
              napomenu. Broj paketa i adresa korisnika popunjavaju se
              automatski.
            </p>
            <!-- Manualno dodavanje - 1 po 1 dostava za dan -->
            <!-- select za korisnika -->
            <div v-if="state.mode === 'manual'">
              <q-select
                class="input-field"
                use-input
                outlined
                v-model="state.novaDostava.klijent"
                stack-label
                input-debounce="2"
                label="Klijent"
                :options="state.klijenti"
                @filter="filterFn"
                :error="v$.novaDostava.klijent.$error"
              >
                <template v-slot:selected>
                  <q-chip
                    v-if="state.novaDostava.klijent"
                    dense
                    square
                    color="white"
                    text-color="primary"
                    class="q-my-none q-ml-xs q-mr-none"
                  >
                    {{ state.novaDostava.klijent.ime }}
                  </q-chip>
                  <q-badge v-else>*none*</q-badge>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.ime }}</q-item-label>
                      <q-item-label caption
                        >OIB: {{ scope.opt.OIB }}</q-item-label
                      >
                      <q-item-label caption>{{
                        scope.opt.adresa
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template></q-select
              >
              <div
                v-if="
                  state.novaDostava.klijent.brojPaketa &&
                  state.novaDostava.klijent.adresa
                "
              >
                <q-input
                  class="input-field"
                  outlined
                  v-model="state.novaDostava.klijent.adresa"
                  label="Adresa"
                  readonly
                />
                <q-input
                  class="input-field"
                  outlined
                  v-model="state.novaDostava.klijent.brojPaketa"
                  label="Broj paketa"
                  readonly
                />
              </div>
              <!-- select za vozaca -->
              <q-select
                class="input-field"
                outlined
                v-model="state.novaDostava.vozac"
                input-debounce="2"
                label="Vozač"
                :options="state.vozaci"
                :error="v$.novaDostava.vozac.$error"
              >
                <template v-slot:selected>
                  <q-chip
                    v-if="state.novaDostava.vozac"
                    dense
                    square
                    color="white"
                    text-color="primary"
                    class="q-my-none q-ml-xs q-mr-none"
                  >
                    {{ state.novaDostava.vozac.ime }}
                  </q-chip>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.ime }}</q-item-label>
                      <q-item-label caption
                        >Broj telefona:
                        {{ scope.opt.brojTelefona }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </template></q-select
              >
              <!--  -->
              <q-input
                class="input-field"
                outlined
                v-model="state.novaDostava.napomena"
                label="Napomena"
              />
            </div>
            <!-- Automatsko generiranje - ispisu se sve dostave za dan, potrebno je samo odabrati vozaca -->
            <div v-if="state.mode === 'auto'">
              <q-input outlined v-model="state.test" label="Test" />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Odustani" v-close-popup />
            <q-btn
              type="submit"
              color="primary"
              :label="
                state.mode === 'manual'
                  ? 'Dodaj dostavu'
                  : 'Spremi generirane dostave'
              "
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
import { reactive, onMounted, onUnmounted, defineProps } from "vue";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

export default {
  name: "UnosDostave",
  props: {
    izabraniDatum: String,
  },
  setup(props) {
    const state = reactive({
      prompt: false,
      dostave: [],
      test: "",
      loading: false,
      klijenti: [],
      vozaci: [],
      dostave: [],
      mode: "manual",
      izabraniDatum: new Date(props.izabraniDatum),
      novaDostava: {
        datumDostave: new Date(props.izabraniDatum),
        klijent: {},
        statusDostave: "NA ČEKANJU",
        vozac: {},
        napomena: "",
      },
      klijentiOptions: [],
    });
    const today = new Date();
    let unsub;

    const rules = {
      novaDostava: {
        klijent: {
          required: helpers.withMessage(
            "Obavezno je odabrati klijenta!",
            required
          ),
        },
        vozac: {
          required: helpers.withMessage(
            "Obavezno je odabrati vozača!",
            required
          ),
        },
      },
    };
    const v$ = useVuelidate(rules, state);

    const getDataVozaci = async () => {
      state.loading = true;
      const q = query(
        collection(db, "Korisnici"),
        where("rola", "==", "VOZAC")
      );
      const querySnapshot = await getDocs(q);
      state.vozaci = [];
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        state.vozaci.push({
          id: doc.id ? doc.id : "",
          ime: data.ime && data.prezime ? data.ime + " " + data.prezime : "",
          brojTelefona: data.brojTelefona ? data.brojTelefona : "",
        });
        state.loading = false;
      });
    };

    const getDataKlijenti = async () => {
      state.loading = true;
      const q = query(collection(db, "Klijenti"));
      const querySnapshot = await getDocs(q);
      state.klijenti = [];
      querySnapshot.forEach(async (doc) => {
        let data = doc.data();
        let ugovor = await getDataUgovor(doc.id);
        console.log(ugovor);
        if (ugovor && ugovor.zaduzeniRuckovi > 0) {
          state.klijenti.push({
            id: doc.id,
            ime: data.ime && data.prezime ? data.ime + " " + data.prezime : "",
            OIB: data.OIB ? data.OIB : "",
            adresa: data.adresa ? data.adresa : "",
            brojTelefona: data.brojTelefona ? data.brojTelefona : "",
            brojPaketa: ugovor.zaduzeniRuckovi
              ? ugovor.zaduzeniRuckovi
              : "Nema podatka",
          });
        }

        state.klijentiOptions = state.klijenti;
        state.loading = false;
      });
    };

    // podaci o ugovori za odredjenog korisnika
    const getDataUgovor = async (uid) => {
      const docRef = collection(db, "Ugovori");
      const q = query(
        docRef,
        where("korisnik", "==", uid),
        where("zavrsetakTretmana", ">=", state.izabraniDatum)
      );
      const docSnap = await getDocs(q);
      const izabraniDan = state.izabraniDatum.getDay();
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

    const onSubmit = async (v$) => {
      if (state.mode === "auto") {
        console.log("auto");
      } else if (state.mode === "manual") {
        const formIsValid = await v$.$validate();
        if (formIsValid) {
          state.loading = true;
          await addDoc(collection(db, "Dostave"), {
            brojPaketa: state.novaDostava.klijent.brojPaketa,
            datumDostave: state.novaDostava.datumDostave,
            klijent: state.novaDostava.klijent.id,
            statusDostave: state.novaDostava.statusDostave,
            vozac: state.novaDostava.vozac.id,
            napomena: state.novaDostava.napomena,
          }).catch((err) => {
            console.log(err);
          });
          state.prompt = false;
          state.loading = false;
          state.novaDostava = {
            brojPaketa: null,
            datumDostave: null,
            klijent: {},
            statusDostave: "NA ČEKANJU",
            vozac: {},
            napomena: "",
          };
        }
      }
    };

    onMounted(() => {
      getDataKlijenti();
      getDataVozaci();
    });

    onUnmounted(() => {
      // unsub();
    });

    const handleClickManual = () => {
      state.prompt = true;
      state.mode = "manual";
    };
    const handleClickAuto = () => {
      state.prompt = true;
      state.mode = "auto";
    };

    const selectKorisnika = [];
    return {
      state,
      handleClickManual,
      handleClickAuto,
      onSubmit,
      v$,
      // filterFn(val, update, abort) {
      //   update(() => {
      //     const needle = val.toLowerCase();
      //     state.klijenti = state.klijenti.filter(
      //       (v) => v.toLowerCase().indexOf(needle) > -1
      //     );
      //   });
      // },
    };
  },
};
</script>
