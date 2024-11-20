<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
        :titulo="'Usuarios'"
        :tituloBoton="'Crear Usuario'"
        @click="showForm"
      />
      <el-dialog
        v-model="dialogVisible"
        :title="formMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'"
        width="50%"
      >
        <Formulario :titulo="'Formulario de Usuarios'">
          <template #slotForm>
            <formUsers 
              :initialData="currentUser" 
              :formMode="formMode"
              @submit="handleSubmit" 
              @cancel="dialogVisible = false" 
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="nombres" label="Nombres" />
        <el-table-column prop="apellidos" label="Apellidos" />
        <el-table-column prop="cargo" label="Cargo" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="rol" label="Rol" />
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" @click="editUser(scope.row)" />
            <el-button type="danger" :icon="Delete" @click="deleteUser(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </template>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue'
import formUsers from './components/formUsers.vue'
import Formulario from '../../components/Formulario.vue'
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

const dialogVisible = ref(false)
const users = ref<User[]>([])
const formMode = ref<'create' | 'edit'>('create')
const currentUser = ref<User | null>(null)
const loading = ref(false)

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

onMounted(loadUsers)
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>