<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="Sala" prop="nom_sala">
      <el-input v-model="form.nom_sala" placeholder="Ingrese el nombre de la Sala"></el-input>
    </el-form-item>
    
    <el-form-item label="Capacidad" prop="capacidad">
      <el-input-number
        v-model="form.capacidad"
        :min="10"
        :max="50"
        placeholder="Ingrese la Capacidad de la Sala"
      />
    </el-form-item>
    
    <el-form-item label="Sede" prop="id_sede">
      <el-select v-model="form.id_sede" placeholder="Seleccione una Sede">
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

type Sala = {
  id_sala?: number
  nom_sala: string
  capacidad: number
  id_sede?: number
}

const props = defineProps<{
  initialData: Sala | null
  sedes: { id_sede: number; nom_sede: string }[]
}>()
const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<Sala>({
  nom_sala: '',
  capacidad: 0,
  id_sede: null,
})

const rules: FormRules = {
  nom_sala: [
    { required: true, message: 'Por favor ingrese el nombre de la Sala', trigger: 'submit' },
    { min: 3, max: 50, message: 'El nombre debe tener entre 3 y 50 caracteres', trigger: 'submit' }
  ],
  capacidad: [
    { required: true, message: 'Por favor ingrese la Capacidad de la Sala', trigger: 'submit' },
    { type: 'number', min: 10, max: 50, message: 'La capacidad debe tener entre 10 y 50 personas', trigger: 'submit' }
  ],
  id_sede: [
    { required: true, message: 'Por favor seleccione una sede', trigger: 'submit' }
  ]
}

// Actualizar el formulario con `initialData` cuando se edita una Sala
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.id_sala = newData.id_sala
    form.nom_sala = newData.nom_sala
    form.capacidad = newData.capacidad
    form.id_sede = newData.id_sede
  } else {
    resetForm()
  }
}, { immediate: true })

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...form })
  } catch (error) {
    console.error('Error en la validación:', error)
  }
}

const resetForm = () => {
  if (!formRef.value) return
  
  formRef.value.clearValidate()
  form.nom_sala = ''
  form.capacidad = 0
  form.id_sede = null
  form.id_sala = undefined
}

onMounted(() => {
  resetForm()
})
</script>

<style scoped>
.el-form {
  max-width: 100%;
  margin: 0;
  padding: 20px;
  overflow-x: hidden;
}

.el-select,
.el-input,
.el-input-number {
  width: 100%;
}

:deep(.el-dialog) {
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  width: 50% !important;
}

:deep(.el-dialog__body) {
  padding: 0;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #dcdfe6;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  margin: 0;
  border-top: 1px solid #dcdfe6;
}
</style>
