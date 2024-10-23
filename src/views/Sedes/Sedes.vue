<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
      :titulo="'Sedes'"
      :tituloBoton="'Crear Sedes'"
      >
      </Header>
      <!-- componente/ -->
      <Formulario :titulo="'titulo del formulario'">

        <template #slotForm>
          <formSedes/>
        </template>

      </Formulario>

          
         
    </template>


    </LayoutMain>
  </template>
    
  
  <script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import LayoutMain from '../../components/LayoutMain.vue';
  import  formSedes from './components/formSedes.vue'
  import Formulario from '../../components/Formulario.vue';
  import Header from '../../components/Header.vue';
  import  {Delete,Edit} from "@element-plus/icons-vue"


  
  </script>