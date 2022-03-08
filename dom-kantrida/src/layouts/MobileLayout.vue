<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="icons/logo-transparent.png" />
          </q-avatar>
          Dom Kantrida
        </q-toolbar-title>
        <div v-if="state.user">
          <q-avatar
            v-if="state.collectionUser"
            color="orange"
            text-color="white"
            >{{
              state.collectionUser.ime.charAt(0).toUpperCase() +
              state.collectionUser.prezime.charAt(0).toUpperCase()
            }}</q-avatar
          >
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../boot/firebase";
import { doc, getDoc } from "firebase/firestore";

export default {
  setup() {
    const state = reactive({
      user: null,
      collectionUser: null,
    });
    const router = useRouter();
    const leftDrawerOpen = ref(true);

    const logout = () => {
      signOut(auth)
        .then(() => {
          router.push("/login");
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const getUserData = async (uid) => {
      const docRef = doc(db, "Korisnici", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        state.collectionUser = docSnap.data();
      } else {
        alert("Korisnik nije pronadjen! Molimo da se ponovno prijavite!");
        router.push("/login");
      }
    };
    //we can use this data to later hide routes for admin/vozac
    const checkAuthState = async () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          state.user = user;
          getUserData(user.uid);
        } else {
          router.push("/login");
        }
      });
    };

    onMounted(() => {
      checkAuthState();
    });

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      logout,
      state,
    };
  },
};
</script>
