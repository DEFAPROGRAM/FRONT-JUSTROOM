<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="Nombres" prop="nombres">
      <el-input v-model="form.nombres" placeholder="Ingrese los nombres"></el-input>
    </el-form-item>
    <el-form-item label="Apellidos" prop="apellidos">
      <el-input v-model="form.apellidos" placeholder="Ingrese los apellidos"></el-input>
    </el-form-item>
    <el-form-item label="Cargo" prop="cargo">
      <el-input v-model="form.cargo" placeholder="Ingrese el cargo"></el-input>
    </el-form-item>
    <el-form-item label="Sede" prop="id_sede">
      <el-select v-model="form.id_sede" placeholder="Seleccione la sede" @change="onSedeChange">
        <el-option v-for="sede in sedes" :key="sede.id_sede" :label="sede.nom_sede" :value="sede.id_sede"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Juzgado" prop="id_juzgado">
      <el-select v-model="form.id_juzgado" placeholder="Seleccione el juzgado">
        <el-option v-for="juzgado in filteredJuzgados" :key="juzgado.id_juzgado" :label="juzgado.nom_juzgado" :value="juzgado.id_juzgado"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Email" prop="email">
      <el-input v-model="form.email" placeholder="Ingrese el email"></el-input>
    </el-form-item>
    <el-form-item v-if="formMode === 'edit'" label="Cambiar contraseña">
      <el-checkbox v-model="changePassword">Cambiar contraseña</el-checkbox>
    </el-form-item>
    <el-form-item label="Contraseña" prop="password" v-if="formMode === 'create' || changePassword">
      <el-input v-model="form.password" type="password" placeholder="Ingrese la contraseña"></el-input>
    </el-form-item>
    <el-form-item label="Rol" prop="rol">
      <el-select v-model="form.rol" placeholder="Seleccione el rol">
        <el-option label="Admin" value="admin"></el-option>
        <el-option label="Usuario" value="usuario"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="loading">Guardar</el-button>
      <el-button @click="resetForm">Limpiar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
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
  id_sede: number;
}

const props = defineProps<{
  initialData: User | null;
  formMode: 'create' | 'edit';
}>()

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<FormInstance>()
const loading = ref(false)
const sedes = ref<Sede[]>([])
const juzgados = ref<Juzgado[]>([])
const changePassword = ref(false)

const form = reactive<User>({
  nombres: '',
  apellidos: '',
  cargo: '',
  id_sede: 0,
  id_juzgado: 0,
  email: '',
  password: '',
  rol: ''
})

const filteredJuzgados = computed(() => {
  if (!form.id_sede) return []
  return juzgados.value.filter(juzgado => juzgado.id_sede === form.id_sede)
})

const rules: FormRules = {
  nombres: [
    { required: true, message: 'Por favor ingrese los nombres', trigger: 'blur' },
    { max: 50, message: 'Los nombres no deben exceder los 50 caracteres', trigger: 'blur' }
  ],
  apellidos: [
    { required: true, message: 'Por favor ingrese los apellidos', trigger: 'blur' },
    { max: 50, message: 'Los apellidos no deben exceder los 50 caracteres', trigger: 'blur' }
  ],
  cargo: [
    { required: true, message: 'Por favor ingrese el cargo', trigger: 'blur' },
    { max: 50, message: 'El cargo no debe exceder los 50 caracteres', trigger: 'blur' }
  ],
  id_sede: [
    { required: true, message: 'Por favor seleccione la sede', trigger: 'change' }
  ],
  id_juzgado: [
    { required: true, message: 'Por favor seleccione el juzgado', trigger: 'change' }
  ],
  email: [
    { required: true, message: 'Por favor ingrese el email', trigger: 'blur' },
    { type: 'email', message: 'Por favor ingrese un email válido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Por favor ingrese la contraseña', trigger: 'blur' },
    { min: 8, message: 'La contraseña debe tener al menos 8 caracteres', trigger: 'blur' }
  ],
  rol: [
    { required: true, message: 'Por favor seleccione el rol', trigger: 'change' }
  ]
}

const onSedeChange = () => {
  form.id_juzgado = 0
}

watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(form, newData)
    form.password = ''
  } else {
    resetForm()
  }
}, { immediate: true })

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const formData = { ...form }
      if (props.formMode === 'edit' && !changePassword.value) {
        delete formData.password
      }
      emit('submit', formData)
    } else {
      console.error('Error en el formulario')
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  changePassword.value = false
}

const loadSedes = async () => {
  try {
    const response = await axios.get<Sede[]>('http://127.0.0.1:8000/api/sedes')
    sedes.value = response.data
  } catch (error) {
    console.error('Error al cargar las sedes:', error)
  }
}

const loadJuzgados = async () => {
  try {
    const response = await axios.get<Juzgado[]>('http://127.0.0.1:8000/api/juzgados')
    juzgados.value = response.data
  } catch (error) {
    console.error('Error al cargar los juzgados:', error)
  }
}

onMounted(() => {
  loadSedes()
  loadJuzgados()
  if (props.initialData) {
    Object.assign(form, props.initialData)
    form.password = ''
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.el-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>