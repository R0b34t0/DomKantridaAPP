<template>
  <div class="flex-center" style="width: 100vw; height: 100vh">
    <div>
      <q-card class="shadow-7 login-card">
        <q-card-section class="text-center">
          <div>
            <img
              src="../../public/favicon1.png"
              alt="Logo Dom Kantrida"
              class="slika"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              outlined
              v-model="state.email"
              type="email"
              label="Email"
            />
            <q-input
              outlined
              v-model="state.password"
              :type="state.isPwd ? 'password' : 'text'"
              label="Lozinka"
              ><template v-slot:append>
                <q-icon
                  :name="state.isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="state.isPwd = !state.isPwd"
                />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
        <q-card-section>
          <div v-if="state.error !== null">{{ state.error }}</div>
        </q-card-section>
        <q-card-actions class="q-px-md" @click="login()">
          <q-btn
            unelevated
            color="blue"
            size="lg"
            class="full-width"
            label="Login"
          />
        </q-card-actions>
        <q-card-section class="text-center q-pa-none">
          <p class="text-grey-6">
            Niste registrirani? Javite se administratoru :)
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../boot/firebase";

export default {
  name: "Login",
  setup() {
    const state = reactive({
      email: null,
      password: null,
      error: null,
      isPwd: true,
    });
    const router = useRouter();
    const login = () => {
      signInWithEmailAndPassword(auth, state.email, state.password)
        .then((userCredential) => {
          const user = userCredential.user;
          router.push("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          state.error = "Nešto je pošlo po zlu!";
        });
    };
    return {
      state,
      login,
    };
  },
};
</script>
