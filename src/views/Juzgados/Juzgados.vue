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
            <FormJuzgados 
              :initialData="currentJuzgado" 
              :sedes="sedes" 
              @submit="handleSubmit" 
              @cancel="dialogVisible = false" 
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="juzgadosConSedes" style="width: 100%" v-loading="loading">
        <el-table-column prop="nom_juzgado" label="Juzgado" />
        <el-table-column prop="nom_sede" label="Sede" />
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
import { ref, onMounted, computed } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue'
import Formulario from '../../components/Formulario.vue'
import FormJuzgados from './components/FormJuzgados.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface FormData {
  nom_juzgado: string;
  id_sede?: number;
}

interface Juzgado extends FormData {
  id_juzgado: number;
}

interface Sede {
  id_sede: number;
  nom_sede: string;
}

const dialogVisible = ref(false)
const juzgados = ref<Juzgado[]>([])
const sedes = ref<Sede[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentJuzgado = ref<Juzgado>({ id_juzgado: 0, nom_juzgado: '', id_sede: undefined })
const loading = ref(false)

const juzgadosConSedes = computed(() => {
  return juzgados.value.map(juzgado => ({
    ...juzgado,
    nom_sede: sedes.value.find(sede => sede.id_sede === juzgado.id_sede)?.nom_sede || 'Sede no encontrada'
  }))
})

const loadJuzgados = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/juzgados')
    juzgados.value = response.data
  } catch (error) {
    console.error('Error al cargar los Juzgados:', error)
    ElMessage.error('Ocurrió un error al cargar los Juzgados')
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
  currentJuzgado.value = { id_juzgado: 0, nom_juzgado: '', id_sede: undefined }
  dialogVisible.value = true
}

const handleSubmit = async (formData: FormData) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/juzgados', formData)
      ElMessage.success('Juzgado creado con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/juzgados/${currentJuzgado.value.id_juzgado}`, formData)
      ElMessage.success('Juzgado actualizado con éxito')
    }
    dialogVisible.value = false
    await loadJuzgados()
  } catch (error) {
    console.error('Error al procesar los Juzgados:', error)
    ElMessage.error('Ocurrió un error al procesar el Juzgado')
  }
}

const editJuzgado = (juzgado: Juzgado) => {
  formMode.value = 'edit'
  currentJuzgado.value = { ...juzgado }
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
      await loadJuzgados()
    } catch (error) {
      console.error('Error al eliminar el Juzgado:', error)
      ElMessage.error('Ocurrió un error al eliminar el Juzgado')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(async () => {
  await loadSedes()
  await loadJuzgados()
})
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>