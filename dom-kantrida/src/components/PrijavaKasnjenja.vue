<template>
  <q-page>
    <q-dialog
      v-model="props.prijavaKasnjenja"
      persistent
      :maximized="state.maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      style="background-color: white"
    >
      <q-card>
        <q-bar
          style="
            height: 50px;
            background-color: #1976d2;
            color: white;
            margin-bottom: 30px;
          "
        >
          PRIJAVA KAŠNJENJA
        </q-bar>
        <q-form style="width: 100%" @submit.stop="onSubmit(v$)">
          <q-card-section class="q-pt-none">
            <q-input
              class="input-field"
              outlined
              v-model="state.lokacija"
              label="Lokacija"
              :error="v$.lokacija.$dirty && state.lokacija"
            />
            <div class="error" v-if="v$.lokacija.$error">
              {{ v$.lokacija.$errors[0].$message }}
            </div>
            <q-input
              class="input-field"
              outlined
              v-model="state.razlogKasnjenja"
              autogrow
              label="Razlog kašnjenja"
              :error="v$.razlogKasnjenja.$dirty && state.razlogKasnjenja"
            />
            <div class="error" v-if="v$.razlogKasnjenja.$error">
              {{ v$.razlogKasnjenja.$errors[0].$message }}
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn label="Odustani" flat @click="handleClose(v$)" />
            <q-btn color="primary" label="Prijavi kašnjenje" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { reactive } from "@vue/reactivity";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { addDoc, collection } from "@firebase/firestore";
import { db, auth } from "src/boot/firebase";
import { onMounted } from "@vue/runtime-core";
import { onAuthStateChanged } from "@firebase/auth";

export default {
  props: ["prijavaKasnjenja", "kasnjenjeCompleted", "uid"],
  setup(props) {
    const state = reactive({
      maximizedToggle: true,
      lokacija: "",
      razlogKasnjenja: "",
      user: "",
    });
    const rules = {
      lokacija: {
        required: helpers.withMessage("Lokacija je obavezno polje", required),
      },
      razlogKasnjenja: {
        required: helpers.withMessage(
          "Razlog kašnjenja je obavezno polje",
          required
        ),
      },
    };

    const v$ = useVuelidate(rules, state);

    const onSubmit = async (v$) => {
      const formIsValid = await v$.$validate();
      if (formIsValid) {
        await addDoc(collection(db, "Kasnjenja"), {
          lokacija: state.lokacija,
          razlogKasnjenja: state.razlogKasnjenja,
          datumPrijave: new Date(),
          vozac: state.user.uid,
        });
        handleClose(v$);
      }
    };
    const handleClose = (v$) => {
      state.lokacija = "";
      state.razlogKasnjenja = "";
      props.kasnjenjeCompleted();
      v$.$reset();
    };

    const checkAuthState = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          state.user = user;
        } else {
          router.push("/login");
        }
      });
    };
    onMounted(() => {
      checkAuthState();
    });
    return { state, props, v$, onSubmit, handleClose };
  },
};
</script>
