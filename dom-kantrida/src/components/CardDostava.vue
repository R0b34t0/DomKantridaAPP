<template>
  <div class="row">
    <q-card
      class="my-card"
      style="width: 100%; margin: 10px 10px 0px 10px"
      flat
      bordered
    >
      <q-card-section class="row" horizontal @click="showMore">
        <q-card-section
          style="background-color: #1976d2; color: white"
          class="q-pt-xs col-8"
        >
          <strong style="font-size: 18px"> {{ props.dostava.adresa }}</strong>
          <div class="text-caption q-mt-sm q-mb-xs">
            {{ props.dostava.klijent }}
          </div>
          <div class="text-caption">{{ props.dostava.brojTelefona }}</div>
        </q-card-section>
        <q-card-section
          class="col-4 flex-center"
          style="flex-direction: column"
        >
          <strong style="color: primary; font-size: 25px">
            {{ props.dostava.brojPaketa }}
            <q-icon name="local_shipping" color="primary"
          /></strong>

          <div class="text-caption">
            {{ props.dostava.vrstaPrehrane }}
          </div></q-card-section
        >
      </q-card-section>

      <q-card-actions v-if="state.showActions" class="flex-center row">
        <q-btn
          class="col-5"
          color="red"
          icon="error"
          @click="potvrdiDostavu(props.dostava.id, 0)"
        />
        <q-btn
          class="col-5"
          color="primary"
          icon="done"
          @click="potvrdiDostavu(props.dostava.id, 1)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>
<script>
import { reactive } from "@vue/reactivity";
import { db } from "src/boot/firebase";
import {
  collection,
  query,
  getDoc,
  getDocs,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
export default {
  props: ["dostava"],
  setup(props) {
    const state = reactive({
      showActions: false,
      id: "",
      ime: "",
      adresa: "",
      brojTelefona: "",
      vrstaPrehrane: "",
      brojPaketa: "",
    });
    const showMore = () => {
      state.showActions = !state.showActions;
    };
    const potvrdiDostavu = async (idDostave, status) => {
      const docRef = doc(db, "Dostave", idDostave);
      await updateDoc(docRef, {
        statusDostave: status === 1 ? "DOSTAVLJENO" : "NIJE DOSTAVLJENO",
      });
    };
    return { state, props, showMore, potvrdiDostavu };
  },
};
</script>
