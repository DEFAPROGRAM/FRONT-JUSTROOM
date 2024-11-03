<template>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Sede" prop="nom_sede">
        <el-input v-model="form.nom_sede" placeholder="Ingrese el nombre de la Sede"></el-input>
      </el-form-item>
      <el-form-item label="Dirección" prop="direccion">
        <el-input v-model="form.direccion" placeholder="Ingrese la dirección de la Sede"></el-input>
      </el-form-item>
      <el-form-item label="Municipio" prop="municipio">
        <el-input v-model="form.municipio" placeholder="Ingrese el municipio de la Sede"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">Guardar</el-button>
        <el-button @click="resetForm">Limpiar</el-button>
      </el-form-item>
    </el-form>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref, watch, onMounted } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  
  // Definición del tipo Sede directamente en este archivo
  type Sede = {
    id_sede?: number
    nom_sede: string
    direccion: string
    municipio: string
  }
  
  const props = defineProps<{
    initialData: Sede | null
  }>()
  const emit = defineEmits(['submit', 'cancel'])
  
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  
  const form = reactive<Sede>({
    nom_sede: '',
    direccion: '',
    municipio: '',
  })
  
  const rules: FormRules = {
    nom_sede: [
      { required: true, message: 'Por favor ingrese el nombre de la Sede', trigger: 'blur' },
      { min: 3, max: 50, message: 'El nombre debe tener entre 3 y 50 caracteres', trigger: 'blur' }
    ],
    direccion: [
      { required: true, message: 'Por favor ingrese la dirección de la Sede', trigger: 'blur' },
      { max: 100, message: 'La dirección no debe exceder los 100 caracteres', trigger: 'blur' }
    ],
    municipio: [
      { required: true, message: 'Por favor ingrese el municipio de la Sede', trigger: 'blur' },
      { max: 50, message: 'El municipio no debe exceder los 50 caracteres', trigger: 'blur' }
    ]
  }
  
  // Actualizar el formulario con `initialData` cuando se edita una sede
  watch(() => props.initialData, (newData) => {
    if (newData) {
      form.id_sede = newData.id_sede  // Configura el id_sede solo si existe
      form.nom_sede = newData.nom_sede
      form.direccion = newData.direccion
      form.municipio = newData.municipio
    } else {
      resetForm()  // Limpia el formulario en modo de creación
    }
  }, { immediate: true })
  
  const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('submit', { ...form })
      } else {
        console.error('Error en el formulario')
      }
    })
  }
  
  const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
  }
  
  onMounted(() => {
    if (props.initialData) {
      form.id_sede = props.initialData.id_sede
      form.nom_sede = props.initialData.nom_sede
      form.direccion = props.initialData.direccion
      form.municipio = props.initialData.municipio
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
  