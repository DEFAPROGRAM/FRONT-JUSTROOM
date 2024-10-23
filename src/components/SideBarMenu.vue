<template>
  <el-row>
    <el-col :span="12" class="sidebar">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        background-color="#0478d1"
        text-color="#fff"
        collapse-transition
       
      >
        <!-- Administrador Menu -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Administrador</span>
          </template>
          <el-menu-item index="1-2" @click="goToRoute('/reservas')">Reservas</el-menu-item>
          <el-menu-item index="1-3" @click="goToRoute('/salas')">Salas</el-menu-item>
          <el-menu-item index="1-4" @click="goToRoute('/sedes')">Sedes</el-menu-item>
          <el-menu-item index="1-5" @click="goToRoute('/juzgados')">Juzgados</el-menu-item>
        </el-sub-menu>

        <!-- Configuracion Menu -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Configuración</span>
          </template>
          <!-- Deja sin acción las opciones Usuarios y Reportes -->
          <el-menu-item index="2-1">Usuarios</el-menu-item>
          <el-menu-item index="2-2">Reportes</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { Location } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Método para manejar la navegación
const goToRoute = (route: string) => {
  router.push(route);
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
}

.sidebar {
  height: 100vh;
  overflow-y: auto;
}

.el-menu-vertical-demo {
  height: 100%;
}
</style>
