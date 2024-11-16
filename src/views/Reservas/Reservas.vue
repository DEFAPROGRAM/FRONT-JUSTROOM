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
            <FormReservas 
              :initialData="currentReserva" 
              @submit="handleSubmit" 
              @cancel="dialogVisible = false" 
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="reservasConDetalles" style="width: 100%" v-loading="loading">
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="fecha" label="Fecha" />
        <el-table-column prop="hora_inicio" label="Hora Inicio" />
        <el-table-column prop="hora_fin" label="Hora Fin" />
        <el-table-column prop="nom_sala" label="Sala" />
        <el-table-column prop="nom_juzgado" label="Juzgado" />
        <el-table-column prop="estado" label="Estado" />
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
import { ref, onMounted, computed } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue'
import Formulario from '../../components/Formulario.vue'
import FormReservas from './components/FormReservas.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface Reserva {
  id_reserva: number;
  id_sala: number;
  id_juzgado: number;
  user_id: number;
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

const dialogVisible = ref(false)
const reservas = ref<Reserva[]>([])
const salas = ref<Sala[]>([])
const juzgados = ref<Juzgado[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentReserva = ref<Reserva | undefined>(undefined)
const loading = ref(false)

const reservasConDetalles = computed(() => {
  return reservas.value.map(reserva => ({
    ...reserva,
    nom_sala: salas.value.find(sala => sala.id_sala === reserva.id_sala)?.nom_sala || 'Sala no encontrada',
    nom_juzgado: juzgados.value.find(juzgado => juzgado.id_juzgado === reserva.id_juzgado)?.nom_juzgado || 'Juzgado no encontrado'
  }))
})

const loadReservas = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reservas')
    reservas.value = response.data
  } catch (error) {
    console.error('Error al cargar las Reservas:', error)
    ElMessage.error('Ocurrió un error al cargar las Reservas')
  } finally {
    loading.value = false
  }
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

const showForm = () => {
  formMode.value = 'create'
  currentReserva.value = undefined
  dialogVisible.value = true
}

const handleSubmit = async (formData: Reserva) => {
  try {
    const currentDate = new Date();
    const reservationDate = new Date(formData.fecha);
    const horaInicio = parseInt(formData.hora_inicio.split(':')[0], 10);
    const horaFin = parseInt(formData.hora_fin.split(':')[0], 10);

    // Validar la anticipación mínima de un día
    if (reservationDate <= currentDate) {
      ElMessage.error("La reserva debe ser realizada con al menos un día de anticipación.");
      return;
    }

    // Validar que la hora de inicio y fin están dentro del horario permitido
    if (horaInicio < 8 || horaFin > 17 || horaInicio >= horaFin) {
      ElMessage.error("La reserva debe ser entre las 8:00 AM y las 5:00 PM, con la hora de fin posterior a la de inicio.");
      return;
    }

    // Verificar conflictos de horario en la misma sala
    const conflictingReservation = reservas.value.find(reserva => 
      reserva.fecha === formData.fecha &&
      reserva.id_sala === formData.id_sala &&
      ((horaInicio >= parseInt(reserva.hora_inicio.split(':')[0], 10) && horaInicio < parseInt(reserva.hora_fin.split(':')[0], 10)) ||
       (horaFin > parseInt(reserva.hora_inicio.split(':')[0], 10) && horaFin <= parseInt(reserva.hora_fin.split(':')[0], 10)))
    );

    if (conflictingReservation) {
      ElMessage.error("Existe un conflicto de horario con otra reserva en la misma sala.");
      return;
    }

    // Procesar la reserva
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
    console.error('Error al procesar la Reserva:', error)
    ElMessage.error('Ocurrió un error al procesar la Reserva')
  }
}

const editReserva = (reserva: Reserva) => {
  formMode.value = 'edit'
  currentReserva.value = { ...reserva }
  dialogVisible.value = true
}

const deleteReserva = (reserva: Reserva) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar la Reserva del ${reserva.fecha}?`,
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
      console.error('Error al eliminar la Reserva:', error)
      ElMessage.error('Ocurrió un error al eliminar la Reserva')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(async () => {
  await loadSalas()
  await loadJuzgados()
  await loadReservas()
})
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>
