<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
        :titulo="'Salas'"
        :tituloBoton="'Crear Salas'"
        @click="showForm"
      />
      <el-dialog
        v-model="dialogVisible"
        :title="formMode === 'create' ? 'Crear Nueva Sala' : 'Editar Sala'"
        width="50%"
      >
        <Formulario :titulo="'Formulario de Salas'">
          <template #slotForm>
            <FormSalas 
              :initialData="currentSala" 
              :sedes="sedes" 
              @submit="handleSubmit" 
              @cancel="dialogVisible = false" 
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="salasConSedes" style="width: 100%" v-loading="loading">
        <el-table-column prop="nom_sala" label="Sala" />
        <el-table-column prop="capacidad" label="Capacidad" />
        <el-table-column prop="nom_sede" label="Sede" />
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" @click="editSala(scope.row)" />
            <el-button type="danger" :icon="Delete" @click="deleteSala(scope.row)" />
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
import FormSalas from './components/formSalas.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface Sala {
  id_sala?: number;
  nom_sala: string;
  capacidad: number;
  id_sede?: number;
}

interface Sede {
  id_sede: number;
  nom_sede: string;
}

const dialogVisible = ref(false)
const salas = ref<Sala[]>([])
const sedes = ref<Sede[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentSala = ref<Sala>({ nom_sala: '', capacidad: 0, id_sede: undefined })
const loading = ref(false)

const salasConSedes = computed(() => {
  return salas.value.map(sala => ({
    ...sala,
    nom_sede: sedes.value.find(sede => sede.id_sede === sala.id_sede)?.nom_sede || 'Sede no encontrada'
  }))
})

const loadSalas = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/salas')
    salas.value = response.data
  } catch (error) {
    console.error('Error al cargar las Salas:', error)
    ElMessage.error('Ocurrió un error al cargar las Salas')
  } finally {
    loading.value = false
  }
}

const loadSedes = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/sedes')
    sedes.value = response.data
  } catch (error) {
    console.error('Error al cargar las sedes:', error)
    ElMessage.error('Ocurrió un error al cargar las sedes')
  }
}

const showForm = () => {
  formMode.value = 'create'
  currentSala.value = { nom_sala: '', capacidad: 0, id_sede: undefined }
  dialogVisible.value = true
}

const handleSubmit = async (formData: Sala) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/salas', formData)
      ElMessage.success('Sala creada con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/salas/${formData.id_sala}`, formData)
      ElMessage.success('Sala actualizada con éxito')
    }
    dialogVisible.value = false
    await loadSalas()
  } catch (error) {
    console.error('Error al procesar las Salas:', error)
    ElMessage.error('Ocurrió un error al procesar la Sala')
  }
}

const editSala = (sala: Sala) => {
  formMode.value = 'edit'
  currentSala.value = { ...sala }
  dialogVisible.value = true
}

const deleteSala = (sala: Sala) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar la Sala "${sala.nom_sala}"?`,
    'Advertencia',
    {
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/salas/${sala.id_sala}`)
      ElMessage.success('Sala eliminada con éxito')
      await loadSalas()
    } catch (error) {
      console.error('Error al eliminar la Sala:', error)
      ElMessage.error('Ocurrió un error al eliminar la Sala')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(async () => {
  await loadSedes()
  await loadSalas()
})
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>