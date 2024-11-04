<template>
  <el-form :model="formData" ref="formRef" label-width="120px">
    <el-form-item 
      label="Nombre del Juzgado" 
      prop="nom_juzgado" 
      :rules="[{ required: true, message: 'Por favor ingresa el nombre del juzgado', trigger: 'blur' }]">
      <el-input v-model="formData.nom_juzgado" />
    </el-form-item>

    <el-form-item label="Sede" prop="id_sede">
      <el-select v-model="formData.id_sede" placeholder="Selecciona una sede">
        <el-option
          v-for="sede in sedes"
          :key="sede.id_sede"
          :label="sede.nom_sede"
          :value="sede.id_sede"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">Guardar</el-button>
      <el-button @click="$emit('cancel')">Cancelar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

interface FormData {
  nom_juzgado: string;
  id_sede?: number; // Puede ser undefined si no se selecciona una sede
}

const props = defineProps<{
  initialData: FormData;
  sedes: Array<{ id_sede: number; nom_sede: string }>; // Asegúrate de definir el tipo de sedes
}>();

const emit = defineEmits<{
  (e: 'submit', data: FormData): void;
  (e: 'cancel'): void;
}>();

const formData = ref<FormData>({ 
  nom_juzgado: props.initialData.nom_juzgado || '', 
  id_sede: props.initialData.id_sede 
});

const submitForm = () => {
  // Emite el evento con los datos del formulario
  emit('submit', { ...formData.value });
};
</script>

<style scoped>
/* Agrega tus estilos aquí */
</style>
