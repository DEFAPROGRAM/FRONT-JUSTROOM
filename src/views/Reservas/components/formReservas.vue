<template>
  <el-form :model="formData" :rules="rules" ref="reservaForm" label-width="120px">
    <el-form-item label="Sala" prop="id_sala">
      <el-select v-model="formData.id_sala" placeholder="Seleccionar sala">
        <el-option
          v-for="sala in salas"
          :key="sala.id_sala"
          :label="sala.nom_sala"
          :value="sala.id_sala"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="Juzgado" prop="id_juzgado">
      <el-select v-model="formData.id_juzgado" placeholder="Seleccionar juzgado">
        <el-option
          v-for="juzgado in juzgados"
          :key="juzgado.id_juzgado"
          :label="juzgado.nom_juzgado"
          :value="juzgado.id_juzgado"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Descripción" prop="descripcion">
      <el-input v-model="formData.descripcion" placeholder="Descripción de la reserva" />
    </el-form-item>

    <el-form-item label="Fecha" prop="fecha">
      <el-date-picker
        v-model="formData.fecha"
        type="date"
        placeholder="Seleccionar fecha"
        format="yyyy-MM-dd"
        :picker-options="datePickerOptions"
      />
    </el-form-item>

    <el-form-item label="Hora de Inicio" prop="hora_inicio">
      <el-time-picker
        v-model="formData.hora_inicio"
        placeholder="Hora de inicio"
        :picker-options="timePickerOptions"
        format="HH:mm"
      />
    </el-form-item>

    <el-form-item label="Hora de Fin" prop="hora_fin">
      <el-time-picker
        v-model="formData.hora_fin"
        placeholder="Hora de fin"
        :picker-options="timePickerOptions"
        format="HH:mm"
      />
    </el-form-item>

    <el-form-item label="Observaciones" prop="observaciones">
      <el-input
        v-model="formData.observaciones"
        type="textarea"
        placeholder="Observaciones"
      />
    </el-form-item>

    <el-form-item label="Estado" prop="estado">
      <el-select v-model="formData.estado" placeholder="Seleccionar estado">
        <el-option label="Pendiente" value="Pendiente" />
        <el-option label="Confirmado" value="Confirmado" />
        <el-option label="Cancelado" value="Cancelado" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">Guardar</el-button>
      <el-button @click="$emit('cancel')">Cancelar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'  // Asegúrate de que onMounted está importado
import { ElMessage } from 'element-plus'
import axios from 'axios'

interface Reserva {
  id_sala: number | null;
  id_juzgado: number | null;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  observaciones: string;
  estado: string;
}

interface Sala {
  id_sala: number;
  nom_sala: string;
}

interface Juzgado {
  id_juzgado: number;
  nom_juzgado: string;
}

const props = defineProps<{ initialData: Reserva | undefined }>()
const emit = defineEmits(['submit', 'cancel'])

const formData = ref<Reserva>({
  id_sala: null,
  id_juzgado: null,
  descripcion: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  observaciones: '',
  estado: 'Pendiente'
})

const salas = ref<Sala[]>([])
const juzgados = ref<Juzgado[]>([])

const datePickerOptions = {
  disabledDate(date: Date) {
    const currentDate = new Date();
    return date <= currentDate;
  }
}

const timePickerOptions = {
  selectableRange: '08:00:00 - 17:00:00'
}

const rules = {
  id_sala: [{ required: true, message: 'Seleccione una sala', trigger: 'change' }],
  id_juzgado: [{ required: true, message: 'Seleccione un juzgado', trigger: 'change' }],
  descripcion: [{ required: true, message: 'Ingrese una descripción', trigger: 'blur' }],
  fecha: [{ required: true, message: 'Seleccione una fecha', trigger: 'change' }],
  hora_inicio: [{ required: true, message: 'Seleccione la hora de inicio', trigger: 'change' }],
  hora_fin: [{ required: true, message: 'Seleccione la hora de fin', trigger: 'change' }],
  estado: [{ required: true, message: 'Seleccione el estado de la reserva', trigger: 'change' }]
}

const loadSalas = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/salas')
    salas.value = response.data
  } catch (error) {
    console.error('Error al cargar las salas:', error)
    ElMessage.error('Ocurrió un error al cargar las salas')
  }
}

const loadJuzgados = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/juzgados')
    juzgados.value = response.data
  } catch (error) {
    console.error('Error al cargar los juzgados:', error)
    ElMessage.error('Ocurrió un error al cargar los juzgados')
  }
}

const submitForm = () => {
  const reservaForm = ref()
  reservaForm.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', formData.value)
    } else {
      ElMessage.error('Por favor complete todos los campos requeridos')
      return false
    }
  })
}

onMounted(async () => {
  await loadSalas()
  await loadJuzgados()
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = { ...newData }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.el-input,
.el-select,
.el-date-picker,
.el-time-picker {
  width: 100%;
}
</style>
