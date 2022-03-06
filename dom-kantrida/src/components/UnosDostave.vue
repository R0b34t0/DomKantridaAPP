<template>
  <div>
    <q-btn
      id="auto"
      color="orange"
      icon="autorenew"
      label="Generiraj"
      :disable="props.disableBtn || props.dostave.length > 0"
      style="margin-right: 20px"
      @click="handleClickAuto"
    />
    <q-btn
      id="manual"
      color="primary"
      label="Dodaj"
      icon="add"
      :disable="props.disableBtn"
      @click="handleClickManual"
    />

    <q-dialog v-model="state.prompt" persistent wid>
      <q-card style="min-width: 900px">
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

            <strong
              v-if="state.mode === 'manual' && state.klijenti.length === 0"
              style="color: red; margin-bottom: 20px"
              >PAŽNJA! Svi klijenti koji imaju ugovorenu dostavu za odabrani
              datum već se nalaze na dostavi!</strong
            ><strong
              v-if="state.mode === 'auto' && state.dostave.length > 0"
              style="color: red; margin-bottom: 20px"
              >PAŽNJA! Nije moguće koristiti automatskog generiranje ako već
              postoje dodane dostave!</strong
            >
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
                :disable="state.klijenti.length === 0"
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
                :disable="state.klijenti.length === 0"
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
                v-model="state.napomena"
                :disable="state.klijenti.length === 0"
                label="Napomena"
              />
            </div>
            <!-- Automatsko generiranje - ispisu se sve dostave za dan, potrebno je samo odabrati vozaca -->
            <div v-if="state.mode === 'auto'">
              <div class="flex-start">
                <q-btn-toggle
                  v-model="state.izabraniDioGrada"
                  toggle-color="primary"
                  spread
                  color="white"
                  text-color="primary"
                  style="
                    border-bottom-left-radius: 0px;
                    border-bottom-right-radius: 0px;
                    width: 300px;
                  "
                  :options="[
                    { label: 'ISTOK', value: 'ISTOK' },
                    { label: 'ZAPAD', value: 'ZAPAD' },
                  ]"
                />
              </div>

              <q-table
                :table-header-style="{
                  backgroundColor: '#1976D2',
                  color: 'white',
                }"
                style="border-top-left-radius: 0px"
                :rows="filterDostava()"
                :columns="columns"
                row-key="id"
                :loading="state.loading"
                no-data-label="Nema dostava za izabrani datum"
                loading-label="Podaci se učitavaju... "
                color="orange"
                hide-bottom
                :pagination="pagination"
              >
                <template v-slot:body-cell-vozac="vozac">
                  <q-td :props="vozac">
                    <!-- select za vozaca renderiran za svaki redak u tablici -->
                    <q-select
                      class="input-field"
                      outlined
                      v-model="state.izabraniVozaci[vozac.row.id_klijenta]"
                      :disable="state.klijenti.length === 0"
                      :options="state.vozaci"
                      :clearable="state.izabraniVozac !== null"
                      @update:model-value="dodajVozacaNaGeneriranuVoznju(vozac)"
                    >
                      <template v-slot:selected>
                        <q-chip
                          v-if="state.izabraniVozaci[vozac.row.id_klijenta]"
                          dense
                          square
                          color="white"
                          text-color="primary"
                          class="q-my-none q-ml-xs q-mr-none"
                        >
                          {{ state.izabraniVozaci[vozac.row.id_klijenta].ime }}
                        </q-chip>
                      </template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.ime }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template></q-select
                    >

                    <div class="my-table-details">
                      {{ vozac.row.details }}
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>
          <q-card-section
            v-if="state.mode === 'auto' && state.invalidForm"
            class="flex-center"
            style="font-size: 18px"
            ><strong style="margin-bottom: 30px; color: red">
              Vozač nije izabran za svaku dostavu i podaci se ne mogu
              spremiti.<br /> </strong
          ></q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Odustani" @click="handleClose(v$)" />
            <q-btn
              type="submit"
              color="primary"
              :disable="state.disableAutoBtn"
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
import { reactive, onMounted, watch, toRaw } from "vue";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  addDoc,
  limit,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
/*TODO: DOSTAVE
4. dodaj mogucnost edita vozaca - unutar same tablice u polje vozaca dodaj olovku, ako se klikne olovka onda se stvori select u tablici i samo se spremi
5. dodaj mogucnost brisanja dostava i sa tablice dostave i sa auto generiranja
TODO: KORISNICI
2. dodaj edit i delete opciju za korisnike - mozda ne dopustit potpuni delete nego samo soft zbog prethodnih dostava - samo blokirat korisnika
3. dodat mogucnost promjene lozinke za korisnike
4. mogucnost ispisa podataka o korisniku
TODO: ALL
1. dodaj blokiranje ruta
2. dodaj grafikone na nadzornu plocu i mogucnost pregleda prijavljenih kasnjenja za odredjeni dan i popisa sa zadnjom dostavljenom dostavom po vozacu i vremenom dostave
TODO: MOBILNA APLIKACIJA
1. pregled dostava prema prijavljenom vozacu - istok/zapad
2. responsive design - pwa
3. mogucnost potvrde dostave ili oznacavanja sa 'nije dostavljeno'
4. mogucnost prijave kasnjenja u svakom trenutku
*/
export default {
  name: "UnosDostave",
  props: ["dostave", "izabraniDatum", "disableBtn", "brojDostava"],
  setup(props) {
    const state = reactive({
      today: new Date(),
      prompt: false,
      disableBtn: false,
      invalidForm: false,
      autoGeneriraneDostave: [],
      izabraniDioGrada: "ISTOK",
      loading: false,
      klijenti: [],
      vozaci: [],
      dostave: [],
      mode: "manual",
      izabraniKlijent: {},
      izabraniVozac: null,
      izabraniVozaci: [],
      napomena: "",
      klijentiOptions: [],
    });

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
      let popisKlijenata = [];
      state.loading = true;
      const q = query(collection(db, "Klijenti"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let data = doc.data();
        let ugovor = await getDataUgovor(doc.id);
        if (ugovor && ugovor.zaduzeniRuckovi > 0) {
          if (props.dostave.length === 0) {
            popisKlijenata.push({
              id: doc.id,
              ime:
                data.ime && data.prezime ? data.ime + " " + data.prezime : "",
              OIB: data.OIB ? data.OIB : "",
              adresa: data.adresa ? data.adresa : "",
              brojTelefona: data.brojTelefona ? data.brojTelefona : "",
              brojPaketa: ugovor.zaduzeniRuckovi,
              dioGrada: data.odabraniDio ? data.odabraniDio : "ISTOK",
            });
          } else if (props.dostave.length > 0) {
            const alreadyPicked = props.dostave.find(
              (dostava) => dostava.id_klijenta === doc.id
            );
            if (alreadyPicked === undefined) {
              popisKlijenata.push({
                id: doc.id,
                ime:
                  data.ime && data.prezime ? data.ime + " " + data.prezime : "",
                OIB: data.OIB ? data.OIB : "",
                adresa: data.adresa ? data.adresa : "",
                brojTelefona: data.brojTelefona ? data.brojTelefona : "",
                brojPaketa: ugovor.zaduzeniRuckovi,
                dioGrada: data.odabraniDio ? data.odabraniDio : "ISTOK",
              });
            }
          }
        }
      });
      state.klijenti = popisKlijenata;
      state.klijentiOptions = popisKlijenata;
      state.loading = false;
    };

    // podaci o ugovori za odredjenog korisnika
    const getDataUgovor = async (uid) => {
      const docRef = collection(db, "Ugovori");
      const q = query(
        docRef,
        where("korisnik", "==", uid),
        where("zavrsetakTretmana", ">=", new Date(props.izabraniDatum))
      );
      const docSnap = await getDocs(q);
      const datum = new Date(props.izabraniDatum);
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
    /* submit dostave, ako je korisnik kliknuo na dodaj dostavu onda se dodaje jedna dostava,
    inace se dodaje vise dostava odjednom - u oba slucaja forma se submita samo ako prodje validaciju */
    const onSubmit = async (v$) => {
      if (state.mode === "auto") {
        if (Object.keys(state.izabraniVozaci).length < state.klijenti.length) {
          state.invalidForm = true;
        } else {
          let batch = writeBatch(db);
          state.loading = true;
          for (const dostava of state.autoGeneriraneDostave) {
            const newDoc = {
              brojPaketa: dostava.brojPaketa,
              datumDostave: dostava.datumDostave,
              klijent: dostava.id_klijenta,
              statusDostave: "NA ČEKANJU",
              vozac: state.izabraniVozaci[dostava.id_klijenta].id,
            };
            var docRef = doc(collection(db, "Dostave"));
            batch.set(docRef, toRaw(newDoc));
          }
          await batch.commit();
          state.loading = false;
          state.prompt = false;
        }
      } else if (state.mode === "manual") {
        const formIsValid = await v$.$validate();
        if (formIsValid) {
          state.loading = true;
          await addDoc(collection(db, "Dostave"), {
            brojPaketa: state.izabraniKlijent.brojPaketa,
            datumDostave: new Date(props.izabraniDatum),
            klijent: state.izabraniKlijent.id,
            statusDostave: "NA ČEKANJU",
            vozac: state.izabraniVozac.id,
            napomena: state.napomena,
          }).catch((err) => {
            console.log(err);
          });
          handleClose(v$);
        }
      }
    };
    // trazi podatke o vozacu koji se nalazi na odredjenoj dostavi i ako postoji vozac vraca njegove podatke, a ako ne vraca null
    const pronadjiVozacaZaKlijenta = async (uid) => {
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
        return null;
      }
    };
    // trazi prethodne dostave za odredjenog klijenta i vraca jednu te poziva funkciju koja trazi podatke vozaca za tu dostavu
    const pronadjiPrethodneDostaveKlijenta = async (uid) => {
      state.loading = true;
      const q = query(
        collection(db, "Dostave"),
        where("klijent", "==", uid),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        let data = doc.data();
        let vozac = await pronadjiVozacaZaKlijenta(data.vozac);
        let noviVozac = {
          id: vozac.id ? vozac.id : "",
          ime: vozac.ime ? vozac.ime : "",
          brojTelefona: vozac.brojTelefona ? vozac.brojTelefona : "",
        };
        state.loading = false;
        state.izabraniVozaci[uid] = noviVozac;
      });
    };
    // za automatsko generiranje dostava, prolazi kroz klijente i za svakog poziva funckiju koja trazi prethodne dostave
    const autoGenerate = async () => {
      state.izabraniVozaci = [];
      state.autoGeneriraneDostave = [];
      for (const klijent of state.klijenti) {
        await pronadjiPrethodneDostaveKlijenta(klijent.id);
        state.autoGeneriraneDostave.push({
          brojPaketa: klijent.brojPaketa,
          datumDostave: new Date(props.izabraniDatum),
          statusDostave: "NA ČEKANJU",
          adresa: klijent.adresa,
          id_klijenta: klijent.id,
          imeKlijenta: klijent.ime,
          vozac: "",
          dioGrada: klijent.dioGrada,
        });
      }
    };
    // prati izmjene datuma i na temelju tog ponovno fetcha klijente za odabrani dan
    watch(
      () => props.dostave,
      async () => {
        await getDataKlijenti(props.dostave);
      }
    );

    onMounted(() => {
      getDataVozaci();
    });

    const handleClickManual = () => {
      state.prompt = true;
      state.mode = "manual";
    };
    const handleClickAuto = () => {
      state.mode = "auto";
      autoGenerate();
      state.prompt = true;
    };
    // kad se zatvori modalni prozor, ocisti podatke iz formi
    const handleClose = (v$) => {
      state.loading = false;
      state.prompt = false;
      state.izabraniKlijent = {};
      state.izabraniVozac = {};
      state.napomena = "";
      v$.$reset();
    };
    // filtrira dostave na istok i zapad
    const filterDostava = () => {
      let dostave = [];
      state.autoGeneriraneDostave.filter((dostava) => {
        if (
          dostava?.dioGrada?.toUpperCase() ===
          state.izabraniDioGrada.toUpperCase()
        ) {
          dostave.push(dostava);
        }
      });
      return dostave;
    };
    // kada se odabere vozac u auto generiranju formi
    const dodajVozacaNaGeneriranuVoznju = (vozac) => {
      const edit = state.autoGeneriraneDostave.map((dostava) => {
        if (dostava.id_klijenta === vozac.row.id_klijenta) {
          dostava.vozac = state.izabraniVozaci[vozac.row.id_klijenta].id;
        }
        return dostava;
      });
      state.autoGeneriraneDostave = edit;
      if (Object.keys(state.izabraniVozaci).length < state.klijenti.length) {
        state.invalidForm = true;
      } else {
        state.invalidForm = false;
      }
    };

    const columns = [
      {
        name: "vozac",
        label: "Vozac",
        align: "center",
        field: "vozac",
        sortable: false,
        style: "width:300px",
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
        field: "imeKlijenta",
        sortable: false,
      },
      {
        name: "adresa",
        label: "Adresa",
        align: "center",
        field: "adresa",
        sortable: false,
      },
    ];
    const pagination = {
      page: 1,
      rowsPerPage: 0,
    };

    return {
      state,
      props,
      columns,
      pagination,
      handleClickManual,
      dodajVozacaNaGeneriranuVoznju,
      handleClickAuto,
      onSubmit,
      handleClose,
      v$,
      filterDostava,
      //koristi se za search klijenata
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
