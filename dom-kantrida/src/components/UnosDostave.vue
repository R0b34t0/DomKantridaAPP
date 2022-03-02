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
            <p v-if="state.mode === 'manual'" style="margin-bottom: 30px">
              Za dodavanje nove dostave potrebno je odabrati klijenta i vozača.
              Ukoliko je potrebno, dodatne informacije se mogu upisati u
              napomenu. Broj paketa i adresa korisnika popunjavaju se
              automatski.
            </p>
            <p v-if="state.mode === 'auto'" style="margin-bottom: 30px">
              Kod automatskog generiranja dostava dostave su automatski
              postavljene za određreni datum.<br />
              <strong style="color: red"
                >VAŽNO! Potrebno je odabrati vozača za svaku dostavu!</strong
              >
            </p>
            <!-- Manualno dodavanje - 1 po 1 dostava za dan -->
            <!-- select za korisnika -->
            <div v-if="state.mode === 'manual'">
              <q-select
                class="input-field"
                use-input
                outlined
                v-model="state.izabraniKlijent"
                stack-label
                input-debounce="2"
                label="Klijent"
                :options="
                  state.klijentiOptions ? state.klijentiOptions : state.klijenti
                "
                @filter="filterFn"
                :error="v$.izabraniKlijent.$error"
              >
                <template v-slot:selected>
                  <q-chip
                    v-if="state.izabraniKlijent"
                    dense
                    square
                    color="white"
                    text-color="primary"
                    class="q-my-none q-ml-xs q-mr-none"
                  >
                    {{ state.izabraniKlijent.ime }}
                  </q-chip>
                  <q-badge v-else>Molimo izaberite klijenta</q-badge>
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
              <div class="error" v-if="v$.izabraniKlijent.$error">
                {{ v$.izabraniKlijent.$errors[0].$message }}
              </div>
              <!-- read-only polja koja prikazuju broj dostava i adresu ovisno o odabranom korisniku -->
              <div
                v-if="
                  state.izabraniKlijent.brojPaketa &&
                  state.izabraniKlijent.adresa
                "
              >
                <q-input
                  class="input-field"
                  outlined
                  v-model="state.izabraniKlijent.adresa"
                  label="Adresa"
                  readonly
                />
                <q-input
                  class="input-field"
                  outlined
                  v-model="state.izabraniKlijent.brojPaketa"
                  label="Broj paketa"
                  readonly
                />
              </div>
              <!-- select za vozaca -->
              <q-select
                class="input-field"
                outlined
                v-model="state.izabraniVozac"
                input-debounce="2"
                label="Vozač"
                clearable
                :options="state.vozaci"
                :error="v$.izabraniVozac.$error"
              >
                <template v-slot:selected>
                  <q-chip
                    v-if="state.izabraniVozac"
                    dense
                    square
                    color="white"
                    text-color="primary"
                    class="q-my-none q-ml-xs q-mr-none"
                  >
                    {{ state.izabraniVozac.ime }}
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
              <div class="error" v-if="v$.izabraniVozac.$error">
                {{ v$.izabraniVozac.$errors[0].$message }}
              </div>
              <!--  -->
              <q-input
                class="input-field"
                outlined
                v-model="state.novaDostava.napomena"
                label="Napomena"
              />
            </div>
            <!-- Automatsko generiranje - ispisu se sve dostave za dan, potrebno je samo odabrati vozaca -->
            <div v-if="state.mode === 'auto'">h</div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Odustani" @click="handleClose(v$)" />
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
import { reactive, onMounted, onUnmounted } from "vue";
import { db } from "src/boot/firebase";
import { collection, query, getDocs, where, addDoc } from "firebase/firestore";
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
      autoGeneriraneDostave: [],
      loading: false,
      klijenti: [],
      vozaci: [],
      dostave: [],
      mode: "manual",
      izabraniKlijent: {},
      izabraniVozac: {},
      izabraniDatum: new Date(props.izabraniDatum),
      novaDostava: {
        datumDostave: new Date(props.izabraniDatum),
        statusDostave: "NA ČEKANJU",
        napomena: "",
      },
      klijentiOptions: [],
    });
    const today = new Date();

    const rules = {
      izabraniKlijent: {
        required: helpers.withMessage(
          "Obavezno je odabrati klijenta!",
          required
        ),
      },
      izabraniVozac: {
        required: helpers.withMessage("Obavezno je odabrati vozača!", required),
      },
    };
    const v$ = useVuelidate(rules, state);

    // query za vozace koji se prikazuju u select-u
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
    // query za klijente koji se koriste u select-u (prikazuju se samo oni klijenti koji za obabrani dan imaju vise od 0 zaduzenih ruckova)
    const getDataKlijenti = async () => {
      state.loading = true;
      const q = query(collection(db, "Klijenti"));
      const querySnapshot = await getDocs(q);
      state.klijenti = [];
      querySnapshot.forEach(async (doc) => {
        let data = doc.data();
        let ugovor = await getDataUgovor(doc.id);
        if (ugovor && ugovor.zaduzeniRuckovi > 0) {
          state.klijenti.push({
            id: doc.id,
            ime: data.ime && data.prezime ? data.ime + " " + data.prezime : "",
            OIB: data.OIB ? data.OIB : "",
            adresa: data.adresa ? data.adresa : "",
            brojTelefona: data.brojTelefona ? data.brojTelefona : "",
            brojPaketa: ugovor.zaduzeniRuckovi,
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
    /* submit dostave, ako je korisnik kliknuo na dodaj dostavu onda se dodaje jedna dostava,
    inace se dodaje vise dostava odjednom - u oba slucaja forma se submita samo ako prodje validaciju */
    const onSubmit = async (v$) => {
      if (state.mode === "auto") {
        console.log("auto");
      } else if (state.mode === "manual") {
        const formIsValid = await v$.$validate();
        if (formIsValid) {
          state.loading = true;
          await addDoc(collection(db, "Dostave"), {
            brojPaketa: state.izabraniKlijent.brojPaketa,
            datumDostave: state.novaDostava.datumDostave,
            klijent: state.izabraniKlijent.id,
            statusDostave: state.novaDostava.statusDostave,
            vozac: state.izabraniVozac.id,
            napomena: state.novaDostava.napomena,
          }).catch((err) => {
            console.log(err);
          });
          handleClose(v$);
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

    const handleClose = (v$) => {
      state.loading = false;
      state.prompt = false;
      state.izabraniKlijent = {};
      state.izabraniVozac = {};
      state.novaDostava = {
        datumDostave: null,
        statusDostave: "NA ČEKANJU",
        napomena: "",
      };
      v$.$reset();
    };

    return {
      state,
      handleClickManual,
      handleClickAuto,
      onSubmit,
      handleClose,
      v$,
      filterFn(val, update) {
        update(() => {
          const needle = val.toLowerCase();
          state.klijentiOptions = state.klijenti.filter(
            (v) =>
              String(v.ime).toLowerCase().indexOf(needle) > -1 ||
              String(v.OIB).toLowerCase().indexOf(needle) > -1 ||
              String(v.adresa).toLowerCase().indexOf(needle) > -1
          );
        });
      },
    };
  },
};
</script>
