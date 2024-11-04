<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="Juzgado" prop="nom_juzgado">
      <el-input v-model="form.nom_juzgado" placeholder="Ingrese el nombre del Juzgado"></el-input>
    </el-form-item>
    
    <el-form-item label="Sede" prop="id_sede">
      <el-select v-model="form.id_sede" placeholder="Seleccione una sede">
        <el-option
          v-for="sede in sedes"
          :key="sede.id_sede"
          :label="sede.nom_sede"
          :value="sede.id_sede"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="loading">Guardar</el-button>
      <el-button @click="resetForm">Limpiar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

type Juzgado = {
  id_juzgado?: number
  nom_juzgado: string
  id_sede?: number // Agregar id_sede
}

const props = defineProps<{
  initialData: Juzgado | null
  sedes: { id_sede: number; nom_sede: string }[] // Prop para recibir las sedes
}>()
const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<Juzgado>({
  nom_juzgado: '',
  id_sede: undefined, // Inicializar id_sede
})

const rules: FormRules = {
  nom_juzgado: [
    { required: true, message: 'Por favor ingrese el nombre del Juzgado', trigger: 'blur' },
    { min: 3, max: 50, message: 'El nombre debe tener entre 3 y 50 caracteres', trigger: 'blur' }
  ],
  id_sede: [
    { required: true, message: 'Por favor seleccione una sede', trigger: 'change' }
  ]
}

// Actualizar el formulario con `initialData` cuando se edita un juzgado
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.id_juzgado = newData.id_juzgado  // Configura el id_juzgado solo si existe
    form.nom_juzgado = newData.nom_juzgado
    form.id_sede = newData.id_sede // Configurar id_sede al editar
  } else {
    resetForm()  // Limpia el formulario en modo de creación
  }
})

const submitForm = async () => {
  await formRef.value?.validate()
  emit('submit', { ...form })
}

const resetForm = () => {
  form.nom_juzgado = ''
  form.id_sede = undefined // Reiniciar el campo id_sede
}

onMounted(() => {
  // Cualquier inicialización adicional que necesites
})
</script>

<style scoped>
/* Puedes añadir estilos adicionales aquí si es necesario */
</style>
