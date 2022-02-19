<template>
  <div>
    <q-card>
      <q-card-section class="text-center">
        <q-avatar class="shadow-7">
          <img src="~assets\logoDomKantrida2.png" alt="Logo Dom Kantrida" />
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md">
          <q-input
            square
            filled
            clearable
            v-model="email"
            type="email"
            label="email"
          />
          <q-input
            square
            filled
            clearable
            v-model="password"
            type="password"
            label="password"
          />
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
          this.error = "test";
        });
    },
  },
};
</script>

<style>
.q-card {
  width: 350px;
  margin: auto;
  margin-top: 20px;
  border: 1px solid red;
}
.q-avatar {
  width: 120px;
  height: 120px;
}
</style>
