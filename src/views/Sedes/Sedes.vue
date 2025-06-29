<template>
  <div>
    <Header 
      :titulo="'Sedes'"
      :tituloBoton="'Crear Sede'"
      @click="showForm"
    />
    <el-dialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? 'Crear Nueva Sede' : 'Editar Sede'"
      width="50%"
      :modal="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="custom-dialog"
    >
      <FormSedes 
        :initialData="currentSede" 
        @submit="handleSubmit" 
        @cancel="dialogVisible = false" 
      />
    </el-dialog>
    
    <el-table :data="sedes" style="width: 100%" v-loading="loading">
      <el-table-column prop="nom_sede" label="Sede" />
      <el-table-column prop="direccion" label="Dirección" />
      <el-table-column prop="municipio" label="Municipio" />
      <el-table-column label="Acciones" width="200">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" @click="editSede(scope.row)" />
          <el-button type="danger" :icon="Delete" @click="deleteSede(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import Formulario from '../../components/Formulario.vue'
import FormSedes from './components/FormSedes.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface Sede {
  id_sede?: number;  // Hacer opcional id_sede
  nom_sede: string;
  direccion: string;
  municipio: string;
}

const dialogVisible = ref(false)
const sedes = ref<Sede[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentSede = ref<Sede | null>(null)
const loading = ref(false)

// Obtener la función updateStats del componente padre
const updateStats = inject('updateStats')

const loadSedes = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/sedes')
    sedes.value = response.data
  } catch (error) {
    console.error('Error al cargar las sedes:', error)
    ElMessage.error('Ocurrió un error al cargar las sedes')
  } finally {
    loading.value = false
  }
}

const showForm = () => {
  formMode.value = 'create'
  currentSede.value = { nom_sede: '', direccion: '', municipio: '' }  // iniciar con campos vacíos
  dialogVisible.value = true
}

const handleSubmit = async (formData: Sede) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/sedes', formData)
      ElMessage.success('Sede creada con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/sedes/${formData.id_sede}`, formData)
      ElMessage.success('Sede actualizada con éxito')
    }
    dialogVisible.value = false
    await loadSedes()  // Refresca la lista de sedes
    // Actualizar estadísticas del dashboard
    if (updateStats) {
      await updateStats('sedes')
    }
  } catch (error) {
    console.error('Error al procesar la sede:', error)
    ElMessage.error('Ocurrió un error al procesar la sede')
  }
}

const editSede = (sede: Sede) => {
  formMode.value = 'edit'
  currentSede.value = { ...sede }  // Copia los datos de la sede a editar
  dialogVisible.value = true
}

const deleteSede = (sede: Sede) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar la sede "${sede.nom_sede}"?`,
    'Advertencia',
    {
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/sedes/${sede.id_sede}`)
      ElMessage.success('Sede eliminada con éxito')
      await loadSedes()  // Refresca la lista de sedes
      // Actualizar estadísticas del dashboard
      if (updateStats) {
        await updateStats('sedes')
      }
    } catch (error) {
      console.error('Error al eliminar la sede:', error)
      ElMessage.error('Ocurrió un error al eliminar la sede')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(loadSedes)
</script>

<style scoped>
.el-table {
  margin-top: 20px;
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
  