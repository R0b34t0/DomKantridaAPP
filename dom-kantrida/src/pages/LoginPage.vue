<template>
  <div>
    <q-card class="shadow-7">
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
          <q-input outlined v-model="email" type="email" label="Email" />
          <q-input
            outlined
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            label="Lozinka"
            ><template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </q-form>
      </q-card-section>
      <q-card-section>
        <div v-if="error !== null">{{ error }}</div>
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
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

export default {
  name: "Login",

  data() {
    return {
      email: null,
      password: null,
      error: null,
      isPwd: true,
    };
  },

  methods: {
    login() {
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((userCredential) => {
          const user = userCredential.user;
          this.$router.push("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          this.error = "Nešto je pošlo po zlu!";
        });
    },
  },
};
</script>
