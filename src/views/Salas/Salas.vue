<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
      :titulo="'Salas'"
      :tituloBoton="'Crear Salas'"
      >
      </Header>
      <!-- componente/ -->
      <Formulario :titulo="'titulo del formulario'">

        <template #slotForm>
          <formSalas/>
        </template>

      </Formulario>

          
    </template>


    </LayoutMain>
  </template>
    
  
  <script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import LayoutMain from '../../components/LayoutMain.vue';
  import  formSalas from './components/formSalas.vue'
  import Formulario from '../../components/Formulario.vue';
  import Header from '../../components/Header.vue';
  import  {Delete,Edit} from "@element-plus/icons-vue"


  
  </script>