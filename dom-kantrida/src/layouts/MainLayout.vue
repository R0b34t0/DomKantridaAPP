<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="icons/logo-transparent.png" />
          </q-avatar>
          Dom Kantrida
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list padding class="menu-list">
        <q-item clickable v-ripple to="/korisnici">
          <q-item-section avatar>
            <q-icon name="manage_accounts" />
          </q-item-section>
          <q-item-section> Korisnici </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/dostave">
          <q-item-section avatar>
            <q-icon name="local_shipping" />
          </q-item-section>
          <q-item-section>
            <q-side-link item>Dostave</q-side-link></q-item-section
          >
        </q-item>
        <q-item clickable v-ripple to="/klijenti">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-side-link item>Klijenti</q-side-link></q-item-section
          >
        </q-item>
        <q-item clickable v-ripple @click="logout()">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-side-link item>Logout</q-side-link></q-item-section
          >
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import { getAuth, signOut } from "firebase/auth";
const auth = getAuth();

export default {
  setup() {
    const leftDrawerOpen = ref(true);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  methods: {
    logout() {
      signOut(auth)
        .then(() => {
          // Sign-out successful.
          this.$router.push("/login");
        })
        .catch((error) => {
          // An error happened.
        });
    },
  },
};
</script>
