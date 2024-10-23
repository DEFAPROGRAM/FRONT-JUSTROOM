<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
      :titulo="'Juzgados'"
      :tituloBoton="'Crear Juzgados'"
      >
      </Header>
      <!-- componente/ -->
      <Formulario :titulo="'titulo del formulario'">

        <template #slotForm>
          <formJuzgados/>
        </template>

      </Formulario>

         
         
    </template>


    </LayoutMain>
  </template>
    
  
  <script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import LayoutMain from '../../components/LayoutMain.vue';
  import  formJuzgados from './components/formJuzgados.vue'
  import Formulario from '../../components/Formulario.vue';
  import Header from '../../components/Header.vue';
  import  {Delete,Edit} from "@element-plus/icons-vue"


  
  </script>