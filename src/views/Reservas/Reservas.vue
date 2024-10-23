<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
      :titulo="'Reservas'"
      :tituloBoton="'Crear Reservas'"
      >
      </Header>
      <!-- componente/ -->
      <Formulario :titulo="'titulo del formulario'">

        <template #slotForm>
          <formReservas/>
        </template>

      </Formulario>

          
         
    </template>


    </LayoutMain>
  </template>
    
  
  <script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import LayoutMain from '../../components/LayoutMain.vue';
  import  formReservas from './components/formReservas.vue'
  import Formulario from '../../components/Formulario.vue';
  import Header from '../../components/Header.vue';
  import  {Delete,Edit} from "@element-plus/icons-vue"


 
  </script>