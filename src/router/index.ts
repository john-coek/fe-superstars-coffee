import AppLayout from "@/layout/AppLayout.vue";
import Login from '@/pages/auth/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import CategoryList from '@/pages/product-categories/CategoryList.vue';
import { useAuthStore } from '@/stores/auth.store';
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guest: true }
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true }, // Semua children otomatis butuh auth
      children: [
        {
          path: '', // Path kosong berarti '/'
          name: 'dashboard',
          component: Dashboard
        },
        {
          path: 'product-categories', // Path menjadi '/product-categories'
          name: 'product-categories',
          component: CategoryList
        }
      ]
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  // 1. Jika punya token tapi data user belum ada (misal: refresh halaman)
  if (auth.isAuthenticated && !auth.user) {
    try {
      await auth.fetchUser();
    } catch (error) {
      auth.logout(); // Hapus token/state yang tidak valid
      return next({ name: 'login' });
    }
  }

  // 2. Proteksi Halaman: Butuh Login
  if (to.matched.some(record => record.meta.requiresAuth) && !auth.isAuthenticated) {
    return next({ name: 'login' });
  }

  // 3. Proteksi Halaman: Hanya untuk Guest (Login/Register)
  if (to.matched.some(record => record.meta.guest) && auth.isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  next();
});

export default router;