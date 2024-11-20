<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
        :titulo="'Reservas'"
        :tituloBoton="'Crear Reserva'"
        @click="showForm"
      />
      <el-dialog
        v-model="dialogVisible"
        :title="formMode === 'create' ? 'Crear Nueva Reserva' : 'Editar Reserva'"
        width="50%"
      >
        <Formulario :titulo="'Formulario de Reservas'">
          <template #slotForm>
            <formReservas 
              :initialData="currentReserva" 
              :formMode="formMode"
              @submit="handleSubmit" 
              @cancel="dialogVisible = false" 
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="reservas" style="width: 100%" v-loading="loading">
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="fecha" label="Fecha" />
        <el-table-column prop="hora_inicio" label="Hora Inicio" />
        <el-table-column prop="hora_fin" label="Hora Fin" />
        <el-table-column prop="estado" label="Estado" />
        <el-table-column prop="nom_sala" label="Sala" />
        <el-table-column prop="nom_juzgado" label="Juzgado" />
        <el-table-column prop="nombre_usuario" label="Usuario" />
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" @click="editReserva(scope.row)" />
            <el-button type="danger" :icon="Delete" @click="deleteReserva(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </template>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue'
import formReservas from './components/formReservas.vue'
import Formulario from '../../components/Formulario.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface Reserva {
  id_reserva?: number;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  id_sala: number;
  id_juzgado: number;
  id_usuario: number;
  nom_sala?: string;
  nom_juzgado?: string;
  nombre_usuario?: string;
}

const dialogVisible = ref(false)
const reservas = ref<Reserva[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentReserva = ref<Reserva | null>(null)
const loading = ref(false)

const loadReservas = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reservas')
    reservas.value = response.data.data
  } catch (error) {
    console.error('Error al cargar las reservas:', error)
    ElMessage.error('Ocurrió un error al cargar las reservas')
  } finally {
    loading.value = false
  }
}

const showForm = () => {
  formMode.value = 'create'
  currentReserva.value = { 
    descripcion: '', 
    fecha: '', 
    hora_inicio: '', 
    hora_fin: '', 
    estado: 'pendiente',
    id_sala: 0,
    id_juzgado: 0,
    id_usuario: 0
  }
  dialogVisible.value = true
}

const handleSubmit = async (formData: Reserva) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/reservas', formData)
      ElMessage.success('Reserva creada con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/reservas/${formData.id_reserva}`, formData)
      ElMessage.success('Reserva actualizada con éxito')
    }
    dialogVisible.value = false
    await loadReservas()
  } catch (error) {
    console.error('Error al procesar la reserva:', error)
    ElMessage.error('Ocurrió un error al procesar la reserva')
  }
}

const editReserva = (reserva: Reserva) => {
  formMode.value = 'edit'
  currentReserva.value = { ...reserva }
  dialogVisible.value = true
}

const deleteReserva = (reserva: Reserva) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar la reserva del ${reserva.fecha}?`,
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
      console.error('Error al eliminar la reserva:', error)
      ElMessage.error('Ocurrió un error al eliminar la reserva')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(loadReservas)
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>
