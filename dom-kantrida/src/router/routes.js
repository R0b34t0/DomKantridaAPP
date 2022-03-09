const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/Index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "korisnici",
        component: () => import("pages/Korisnici.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "dostave",
        component: () => import("pages/Dostave.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "klijenti",
        component: () => import("pages/Klijenti.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "ugovori",
        component: () => import("pages/Ugovori.vue"),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },

  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },
  {
    path: "/popisdostava",
    component: () => import("layouts/MobileLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/PopisDostava.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
