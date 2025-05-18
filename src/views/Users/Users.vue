<template>
  <div>
    <Header 
      :titulo="'Usuarios'"
      :tituloBoton="'Crear Usuario'"
      @click="showForm"
    />
    <el-dialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'"
      width="50%"
<<<<<<< HEAD
      :modal="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="custom-dialog"
=======
>>>>>>> d40af07fb4a6dc75182023493d4407b3ac87cd0f
    >
      <FormUsers 
        :initialData="currentUser" 
        :formMode="formMode"
        :sedes="sedes"
        :juzgados="juzgados"
        @submit="handleSubmit" 
        @cancel="dialogVisible = false" 
      />
    </el-dialog>
    
    <el-table :data="usersConDetalles" style="width: 100%" v-loading="loading">
      <el-table-column prop="nombres" label="Nombres" />
      <el-table-column prop="apellidos" label="Apellidos" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="cargo" label="Cargo" />
      <el-table-column prop="nom_sede" label="Sede" />
      <el-table-column prop="nom_juzgado" label="Juzgado" />
      <el-table-column prop="rol" label="Rol" />
      <el-table-column label="Acciones" width="200">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" @click="editUser(scope.row)" />
          <el-button type="danger" :icon="Delete" @click="deleteUser(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Formulario from '../../components/Formulario.vue'
import FormUsers from './components/FormUsers.vue'
import Header from '../../components/Header.vue'
import { Delete, Edit } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

interface User {
  id?: number;
  nombres: string;
  apellidos: string;
  cargo: string;
  id_sede: number;
  id_juzgado: number;
  email: string;
  password?: string;
  rol: string;
}

interface Sede {
  id_sede: number;
  nom_sede: string;
}

interface Juzgado {
  id_juzgado: number;
  nom_juzgado: string;
}

const dialogVisible = ref(false)
const users = ref<User[]>([])
const sedes = ref<Sede[]>([])
const juzgados = ref<Juzgado[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentUser = ref<User | null>(null)
const loading = ref(false)

const usersConDetalles = computed(() => {
  return users.value.map(user => ({
    ...user,
    nom_sede: sedes.value.find(sede => sede.id_sede === user.id_sede)?.nom_sede || 'Sede no asignada',
    nom_juzgado: juzgados.value.find(juzgado => juzgado.id_juzgado === user.id_juzgado)?.nom_juzgado || 'Juzgado no asignado'
  }))
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/users')
    users.value = response.data.data
  } catch (error) {
    console.error('Error al cargar los usuarios:', error)
    ElMessage.error('Ocurrió un error al cargar los usuarios')
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
  currentUser.value = { 
    nombres: '', 
    apellidos: '', 
    cargo: '', 
    id_sede: 0,
    id_juzgado: 0,
    email: '',
    rol: ''
  }
  dialogVisible.value = true
}

const handleSubmit = async (formData: User) => {
  try {
    if (formMode.value === 'create') {
      await axios.post('http://127.0.0.1:8000/api/users', formData)
      ElMessage.success('Usuario creado con éxito')
    } else {
      await axios.put(`http://127.0.0.1:8000/api/users/${formData.id}`, formData)
      ElMessage.success('Usuario actualizado con éxito')
    }
    dialogVisible.value = false
    await loadUsers()
  } catch (error) {
    console.error('Error al procesar el usuario:', error)
    ElMessage.error('Ocurrió un error al procesar el usuario')
  }
}

const editUser = (user: User) => {
  formMode.value = 'edit'
  currentUser.value = { ...user }
  dialogVisible.value = true
}

const deleteUser = (user: User) => {
  ElMessageBox.confirm(
    `¿Está seguro que desea eliminar al usuario ${user.nombres} ${user.apellidos}?`,
    'Advertencia',
    {
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${user.id}`)
      ElMessage.success('Usuario eliminado con éxito')
      await loadUsers()
    } catch (error) {
      console.error('Error al eliminar el usuario:', error)
      ElMessage.error('Ocurrió un error al eliminar el usuario')
    }
  }).catch(() => {
    ElMessage.info('Eliminación cancelada')
  })
}

onMounted(async () => {
  await Promise.all([
    loadSedes(),
    loadJuzgados(),
    loadUsers()
  ])
})
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