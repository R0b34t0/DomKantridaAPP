const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "dostave", component: () => import("pages/Dostave.vue"),meta:{ requiresAuth: true } },
    ],
  },

  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },

  

  
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
