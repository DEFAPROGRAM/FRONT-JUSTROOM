<template>
  <div>
    <Header 
      :titulo="'Reservas'"
      :tituloBoton="'Crear Reserva'"
      @click="showForm"
    />
    <el-dialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? 'Crear Nueva Reserva' : 'Editar Reserva'"
      width="50%"
      :modal="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="custom-dialog"
    >
      <Formulario :titulo="'Formulario de Reservas'">
        <template #slotForm>
          <FormReservas 
            :initialData="currentReserva" 
            :formMode="formMode"
            :users="users"
            :salas="salas"
            :juzgados="juzgados"
            :sedes="sedes"
            @submit="handleSubmit" 
            @cancel="dialogVisible = false" 
            @updateReservas="updateReservas"
            ref="formReservasRef"
          />
        </template>
      </Formulario>
    </el-dialog>
    
    <el-table :data="reservasConDetalles" style="width: 100%" v-loading="loading">
      <el-table-column prop="descripcion" label="Descripción" />
      <el-table-column prop="fecha" label="Fecha">
        <template #default="scope">
          {{ formatDate(scope.row.fecha) }}
        </template>
      </el-table-column>
      <el-table-column prop="hora_inicio" label="Hora Inicio" />
      <el-table-column prop="hora_fin" label="Hora Fin" />
      <el-table-column prop="estado" label="Estado">
        <template #default="scope">
          <span 
            class="status-badge"
            :class="{
              'status-pending': scope.row.estado === 'pendiente',
              'status-confirmed': scope.row.estado === 'confirmada',
              'status-cancelled': scope.row.estado === 'cancelada'
            }"
          >
            {{ scope.row.estado.charAt(0).toUpperCase() + scope.row.estado.slice(1) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="nom_sala" label="Sala" />
      <el-table-column prop="nom_juzgado" label="Juzgado" />
      <el-table-column label="Usuario">
        <template #default="scope">
          {{ getUserFullName(scope.row.usuario) }}
        </template>
      </el-table-column>
      <el-table-column label="Acciones" width="200">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" @click="editReserva(scope.row)" />
          <el-button type="danger" :icon="Delete" @click="deleteReserva(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Formulario from '../../components/Formulario.vue'
import FormReservas from './components/FormReservas.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface User {
  id: number;
  nombres: string;
  apellidos: string;
}

interface Sala {
  id_sala: number;
  nom_sala: string;
}

interface Juzgado {
  id_juzgado: number;
  nom_juzgado: string;
}

interface Sede {
  id_sede: number;
  nom_sede: string;
}

const dialogVisible = ref(false)
const reservas = ref([])
const formMode = ref('create')
const currentReserva = ref(null)
const loading = ref(false)
const users = ref<User[]>([])
const salas = ref<Sala[]>([])
const juzgados = ref<Juzgado[]>([])
const sedes = ref<Sede[]>([])
const formReservasRef = ref(null)

const reservasConDetalles = computed(() => {
  return reservas.value.map(reserva => ({
    ...reserva,
    nom_sala: salas.value.find(s => s.id_sala === reserva.id_sala)?.nom_sala || 'Sala no encontrada',
    nom_juzgado: juzgados.value.find(j => j.id_juzgado === reserva.id_juzgado)?.nom_juzgado || 'Juzgado no encontrado'
  }))
})

const loadReservas = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reservas')
    reservas.value = response.data.data
    if (formReservasRef.value) {
      formReservasRef.value.updateReservas(reservas.value)
    }
  } catch (error) {
    console.error('Error al cargar las reservas:', error)
    ElMessage.error('Error al cargar las reservas')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/users')
    users.value = response.data.data
  } catch (error) {
    console.error('Error al cargar los usuarios:', error)
    ElMessage.error('Error al cargar los usuarios')
  }
}

const loadSalas = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/salas')
    salas.value = response.data
  } catch (error) {
    console.error('Error al cargar las salas:', error)
    ElMessage.error('Error al cargar las salas')
  }
}

const loadJuzgados = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/juzgados')
    juzgados.value = response.data
  } catch (error) {
    console.error('Error al cargar los juzgados:', error)
    ElMessage.error('Error al cargar los juzgados')
  }
}

const loadSedes = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/sedes')
    sedes.value = response.data
  } catch (error) {
    console.error('Error al cargar las sedes:', error)
    ElMessage.error('Error al cargar las sedes')
  }
}

const showForm = () => {
  formMode.value = 'create'
  currentReserva.value = { 
    descripcion: '', 
    observaciones: '',
    fecha: '', 
    hora_inicio: '', 
    hora_fin: '', 
    estado: 'pendiente',
    id_sala: null,
    id_juzgado: null,
    id_usuario: null,
    id_sede: null
  }
  dialogVisible.value = true
  if (formReservasRef.value) {
    formReservasRef.value.resetForm()
  }
}

const handleSubmit = async (formData) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/reservas', formData)
      ElMessage.success('Reserva creada con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/reservas/${formData.id_reserva}`, formData)
      ElMessage.success('Reserva actualizada con éxito')
    }
    dialogVisible.value = false
    if (formReservasRef.value) {
      formReservasRef.value.resetForm()
    }
    await loadReservas()
  } catch (error) {
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat()
      ElMessage.error(errorMessages.join('\n'))
    } else {
      ElMessage.error('Error al procesar la reserva')
    }
  }
}

const editReserva = (reserva) => {
  formMode.value = 'edit'
  currentReserva.value = { 
    ...reserva,
    id_reserva: reserva.id_reserva,
    id_sala: reserva.sala.id_sala,
    id_juzgado: reserva.juzgado.id_juzgado,
    id_usuario: reserva.usuario.id,
    id_sede: reserva.sala.id_sede,
    fecha: formatDate(reserva.fecha),
    hora_inicio: reserva.hora_inicio.substring(0, 5), 
    hora_fin: reserva.hora_fin.substring(0, 5), 
    estado: reserva.estado,
    descripcion: reserva.descripcion,
    observaciones: reserva.observaciones
  }
  dialogVisible.value = true
}

const deleteReserva = (reserva) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar la reserva del ${formatDate(reserva.fecha)}?`,
    'Advertencia',
    {
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/reservas/${reserva.id_reserva}`)
      ElMessage.success('Reserva eliminada con éxito')
      await loadReservas()
    } catch (error) {
      ElMessage.error('Error al eliminar la reserva')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}-${month}-${year}`
}

const getUserFullName = (usuario) => {
  if (!usuario) return 'Usuario no asignado'
  return `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || 'Nombre no disponible'
}

const updateReservas = (newReservas) => {
  reservas.value = newReservas
}

onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadSalas(),
    loadJuzgados(),
    loadSedes(),
    loadReservas()
  ])
})
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
  font-size: 0.875rem;
}

.status-pending {
  background-color: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde047;
}

.status-confirmed {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

:deep(.custom-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
}

:deep(.custom-dialog .el-dialog) {
  margin: 0 !important;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}

:deep(.custom-dialog .el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #dcdfe6;
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 0;
  overflow: auto;
}

:deep(.custom-dialog .el-dialog__footer) {
  padding: 20px;
  margin: 0;
  border-top: 1px solid #dcdfe6;
}

:deep(.el-overlay) {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-overlay-dialog) {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

