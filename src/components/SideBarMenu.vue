<template>
  <el-menu
    :default-openeds="['1', '2']"
    class="el-menu-vertical-demo"
    background-color="#0478d1"
    text-color="#fff"
    :collapse-transition="false"
  >
    <el-sub-menu v-for="(item, index) in menuItems" :key="index" :index="String(index + 1)">
      <template #title>
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </template>
      <el-menu-item
        v-for="(child, childIndex) in item.children"
        :key="childIndex"
        :index="`${index + 1}-${childIndex + 1}`"
        @click="goToRoute(child.route)"
      >
        {{ child.title }}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Location, Setting } from '@element-plus/icons-vue';

const router = useRouter();

const menuItems = ref([
  {
    title: 'Menu Principal',
    icon: Location,
    children: [
      { title: 'Reservas', route: '/reservas' },
      { title: 'Salas', route: '/salas' },
      { title: 'Sedes', route: '/sedes' },
      { title: 'Juzgados', route: '/juzgados' },
    ],
  },
  {
    title: 'Configuración',
    icon: Setting,
    children: [
      { title: 'Usuarios', route: '/usuarios' },
      { title: 'Reportes', route: '/reportes' },
    ],
  },
]);

const goToRoute = (route: string) => {
  router.push(route);
};
</script>

<style scoped>
.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-icon {
  margin-right: 8px;
}
</style>