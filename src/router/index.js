import { createRouter, createWebHistory } from 'vue-router';
import Reservas from '../views/Reservas/Reservas.vue';
import Salas from '../views/Salas/Salas.vue';
import Sedes from '../views/Sedes/Sedes.vue';
import Juzgados from '../views/Juzgados/Juzgados.vue';
import Users from '../views/Users/Users.vue';
import LayoutMain from '../components/LayoutMain.vue';
import Login from '../components/Login.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: LayoutMain,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/reservas', 
    name: 'reservas',
    component: Reservas,
  },
  {
    path: '/salas',
    name: 'salas',
    component: Salas,
  },
  {
    path: '/juzgados',
    name: 'juzgados',
    component: Juzgados,
  },
  {
    path: '/sedes',
    name: 'sedes',
    component: Sedes,
  },
 
  {
    path: '/users',
    name: 'users',
    component: Users,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
