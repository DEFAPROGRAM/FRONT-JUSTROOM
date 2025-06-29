import { createRouter, createWebHistory } from 'vue-router';
import Reservas from '../views/Reservas/Reservas.vue';
import Salas from '../views/Salas/Salas.vue';
import Sedes from '../views/Sedes/Sedes.vue';
import Juzgados from '../views/Juzgados/Juzgados.vue';
import Users from '../views/Users/Users.vue';
import Reportes from '../views/Reportes/Reportes.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservas', 
    name: 'reservas',
    component: Reservas,
    meta: { requiresAuth: true }
  },
  {
    path: '/salas',
    name: 'salas',
    component: Salas,
    meta: { requiresAuth: true }
  },
  {
    path: '/juzgados',
    name: 'juzgados',
    component: Juzgados,
    meta: { requiresAuth: true }
  },
  {
    path: '/sedes',
    name: 'sedes',
    component: Sedes,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: Reportes,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
