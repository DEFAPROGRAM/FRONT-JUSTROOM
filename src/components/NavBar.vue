<template>
    <el-menu
      :default-active="activeIndex"
        background-color="#0478d1 "
        text-color="#fff"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
    <el-menu-item index="0">
      <img
        src="../assets/JUSTROOM.png" 
        style="width: 100px"
        alt="Element logo"
      />
    </el-menu-item>
  
      <el-sub-menu index="1" >
        <template #title>DEFA</template>
        <el-menu-item index="2-1">Perfil</el-menu-item>
        <el-menu-item index="2-2">Cerrar Sesion</el-menu-item>

      </el-sub-menu>
    </el-menu>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  
  const activeIndex = ref('1')
  const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
  }
  </script>
  
  <style scoped>
 .el-menu-demo{
    top: 0;
    width: 100%;
    z-index: 10;
 }

 .el-menu-item, 
span.el-avatar.el-avatar--circle {
  margin-right: auto;
  padding: 0;
}
  
  </style>
  