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
      <el-checkbox v-model="changePassword">¿Desea cambiar la contraseña?</el-checkbox>
    </el-form-item>
    <el-form-item 
      label="Contraseña" 
      prop="password" 
      v-if="formMode === 'create' || changePassword"
      :rules="passwordRules"
    >
      <el-input 
        v-model="form.password" 
        type="password" 
        placeholder="Ingrese la contraseña"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item 
      label="Confirmar" 
      prop="confirmPassword" 
      v-if="formMode === 'create' || changePassword"
      :rules="confirmPasswordRules"
    >
      <el-input 
        v-model="form.confirmPassword" 
        type="password" 
        placeholder="Confirme la contraseña"
        show-password
      ></el-input>
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
  id_sede?: number | null;
  id_juzgado?: number | null;
  email: string;
  password?: string;
  confirmPassword?: string;
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
  id_sede: null,
  id_juzgado: null,
  email: '',
  password: '',
  confirmPassword: '',
  rol: ''
})

const filteredJuzgados = computed(() => {
  if (!form.id_sede) return []
  return juzgados.value.filter(juzgado => juzgado.id_sede === form.id_sede)
})

const rules: FormRules = {
  nombres: [
    { required: true, message: 'Por favor ingrese los nombres', trigger: 'submit' },
    { max: 50, message: 'Los nombres no deben exceder los 50 caracteres', trigger: 'submit' }
  ],
  apellidos: [
    { required: true, message: 'Por favor ingrese los apellidos', trigger: 'submit' },
    { max: 50, message: 'Los apellidos no deben exceder los 50 caracteres', trigger: 'submit' }
  ],
  cargo: [
    { required: true, message: 'Por favor ingrese el cargo', trigger: 'submit' },
    { max: 50, message: 'El cargo no debe exceder los 50 caracteres', trigger: 'submit' }
  ],
  id_sede: [
    { required: true, message: 'Por favor seleccione la sede', trigger: 'submit' }
  ],
  id_juzgado: [
    { required: true, message: 'Por favor seleccione el juzgado', trigger: 'submit' }
  ],
  email: [
    { required: true, message: 'Por favor ingrese el email', trigger: 'submit' },
    { type: 'email', message: 'Por favor ingrese un email válido', trigger: 'submit' }
  ],
  rol: [
    { required: true, message: 'Por favor seleccione el rol', trigger: 'submit' }
  ]
}

// Reglas dinámicas para la contraseña
const passwordRules = computed(() => {
  const rules = [
    { min: 8, message: 'La contraseña debe tener al menos 8 caracteres', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      trigger: 'blur'
    }
  ]

  // Solo agregar la regla required si es modo crear o si se está cambiando la contraseña
  if (props.formMode === 'create' || changePassword.value) {
    rules.unshift({ required: true, message: 'Por favor ingrese la contraseña', trigger: 'blur' })
  }

  return rules
})

// Reglas dinámicas para la confirmación de contraseña
const confirmPasswordRules = computed(() => {
  const rules = [
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.password) {
          callback(new Error('Las contraseñas no coinciden'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]

  // Solo agregar la regla required si es modo crear o si se está cambiando la contraseña
  if (props.formMode === 'create' || changePassword.value) {
    rules.unshift({ required: true, message: 'Por favor confirme la contraseña', trigger: 'blur' })
  }

  return rules
})

const onSedeChange = () => {
  form.id_juzgado = null
}

watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(form, newData)
    form.password = ''
    form.confirmPassword = ''
  } else {
    resetForm()
  }
}, { immediate: true })

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const formData = { ...form }
    
    // Eliminar campos de contraseña si no es necesario
    if (props.formMode === 'edit' && !changePassword.value) {
      delete formData.password
      delete formData.confirmPassword
    }
    
    // Siempre eliminar confirmPassword antes de enviar
    delete formData.confirmPassword
    
    emit('submit', formData)
  } catch (error) {
    console.error('Error en la validación del formulario:', error)
  }
}

const resetForm = () => {
  if (!formRef.value) return
  
  formRef.value.clearValidate()
  form.nombres = ''
  form.apellidos = ''
  form.cargo = ''
  form.id_sede = null
  form.id_juzgado = null
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.rol = ''
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
    form.confirmPassword = ''
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