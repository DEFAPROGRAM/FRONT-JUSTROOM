<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
        :titulo="'Juzgados'"
        :tituloBoton="'Crear Juzgados'"
        @click="showForm"
      />
      <el-dialog
        v-model="dialogVisible"
        :title="formMode === 'create' ? 'Crear Nuevo Juzgado' : 'Editar Juzgado'"
        width="50%"
      >
        <Formulario :titulo="'Formulario de Juzgados'">
          <template #slotForm>
            <formJuzgados 
              :initialData="currentJuzgado" 
              :sedes="sedes" 
              @submit="handleSubmit" 
              @cancel="dialogVisible = false" 
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="juzgados" style="width: 100%" v-loading="loading">
        <el-table-column prop="nom_juzgado" label="Juzgado" />
        <el-table-column prop="nom_sede" label="Sede" /> <!-- Nueva columna para la Sede -->
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" @click="editJuzgado(scope.row)" />
            <el-button type="danger" :icon="Delete" @click="deleteJuzgado(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </template>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue'
import formJuzgados from './components/formJuzgados.vue'
import Formulario from '../../components/Formulario.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface Juzgado {
  id_juzgado?: number;  // Hacer opcional id_juzgado
  nom_juzgado: string;
  id_sede?: number; // Agregar el id_sede para la relación
  nom_sede?: string; // Agregar el nombre de la sede
}

const dialogVisible = ref(false)
const juzgados = ref<Juzgado[]>([])
const sedes = ref<{ id_sede: number; nom_sede: string }[]>([]) // Lista de sedes
const formMode = ref<'create' | 'edit'>('create')
const currentJuzgado = ref<Juzgado | null>(null)
const loading = ref(false)

const loadJuzgados = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/juzgados')
    juzgados.value = response.data.map((juzgado: Juzgado) => ({
      ...juzgado,
      nom_sede: sedes.value.find(sede => sede.id_sede === juzgado.id_sede)?.nom_sede // Mapeamos el nombre de la sede
    }))
  } catch (error) {
    console.error('Error al cargar los Juzgados:', error)
    ElMessage.error('Ocurrió un error al cargar los Juzgados')
  } finally {
    loading.value = false
  }
}

// Nueva función para cargar las sedes
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
  currentJuzgado.value = { nom_juzgado: '', id_sede: undefined } // iniciar con campos vacíos
  dialogVisible.value = true
}

const handleSubmit = async (formData: Juzgado) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/juzgados', formData)
      ElMessage.success('Juzgado creado con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/juzgados/${formData.id_juzgado}`, formData)
      ElMessage.success('Juzgado actualizado con éxito')
    }
    dialogVisible.value = false
    await loadJuzgados()  // Refresca la lista de juzgados
  } catch (error) {
    console.error('Error al procesar el Juzgado:', error)
    ElMessage.error('Ocurrió un error al procesar el Juzgado')
  }
}

const editJuzgado = (juzgado: Juzgado) => {
  formMode.value = 'edit'
  currentJuzgado.value = { ...juzgado }  // Copia los datos del juzgado a editar
  dialogVisible.value = true
}

const deleteJuzgado = (juzgado: Juzgado) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar el Juzgado "${juzgado.nom_juzgado}"?`,
    'Advertencia',
    {
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/juzgados/${juzgado.id_juzgado}`)
      ElMessage.success('Juzgado eliminado con éxito')
      await loadJuzgados()  // Refresca la lista de Juzgados
    } catch (error) {
      console.error('Error al eliminar el Juzgado:', error)
      ElMessage.error('Ocurrió un error al eliminar el Juzgado')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(() => {
  loadJuzgados()  // Cargar juzgados al iniciar
  loadSedes()  // Cargar sedes al iniciar
})
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>
