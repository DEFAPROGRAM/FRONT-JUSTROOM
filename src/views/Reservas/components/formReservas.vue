<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="Descripción" prop="descripcion">
      <el-input v-model="form.descripcion" type="textarea" :rows="2" placeholder="Ingrese la descripción de la reserva"></el-input>
    </el-form-item>
    <el-form-item label="Fecha" prop="fecha">
      <el-date-picker v-model="form.fecha" type="date" placeholder="Seleccione la fecha" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
    </el-form-item>
    <el-form-item label="Hora Inicio" prop="hora_inicio">
      <el-time-picker v-model="form.hora_inicio" format="HH:mm" placeholder="Seleccione la hora de inicio"></el-time-picker>
    </el-form-item>
    <el-form-item label="Hora Fin" prop="hora_fin">
      <el-time-picker v-model="form.hora_fin" format="HH:mm" placeholder="Seleccione la hora de fin"></el-time-picker>
    </el-form-item>
    <el-form-item label="Estado" prop="estado">
      <el-select v-model="form.estado" placeholder="Seleccione el estado">
        <el-option label="Pendiente" value="pendiente"></el-option>
        <el-option label="Confirmada" value="confirmada"></el-option>
        <el-option label="Cancelada" value="cancelada"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Sala" prop="id_sala">
      <el-select v-model="form.id_sala" placeholder="Seleccione la sala">
        <el-option v-for="sala in salas" :key="sala.id_sala" :label="sala.nom_sala" :value="sala.id_sala"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Juzgado" prop="id_juzgado">
      <el-select v-model="form.id_juzgado" placeholder="Seleccione el juzgado">
        <el-option v-for="juzgado in juzgados" :key="juzgado.id_juzgado" :label="juzgado.nom_juzgado" :value="juzgado.id_juzgado"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Usuario" prop="id_usuario">
      <el-select v-model="form.id_usuario" placeholder="Seleccione el usuario">
        <el-option 
          v-for="usuario in users" 
          :key="usuario.id" 
          :label="`${usuario.nombres} ${usuario.apellidos}`" 
          :value="usuario.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="loading">Guardar</el-button>
      <el-button @click="resetForm">Limpiar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import axios from 'axios';

interface Reserva {
  id_reserva?: number;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  id_sala: number;
  id_juzgado: number;
  id_usuario: number;
}

interface Sala {
  id_sala: number;
  nom_sala: string;
}

interface Juzgado {
  id_juzgado: number;
  nom_juzgado: string;
}

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
}

const props = defineProps({
  initialData: Object,
  formMode: String
})

const emit = defineEmits(['submit', 'cancel']);

const form = reactive<Reserva>({
  descripcion: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  estado: 'pendiente',
  id_sala: 0,
  id_juzgado: 0,
  id_usuario: 0
});

const salas = ref<Sala[]>([]);
const juzgados = ref<Juzgado[]>([]);
const users = ref([]);
const loading = ref(false);

const rules: FormRules = {
  descripcion: [
    { required: true, message: 'Por favor ingrese una descripción', trigger: 'blur' }
  ],
  fecha: [
    { required: true, message: 'Por favor seleccione una fecha', trigger: 'blur' }
  ],
  hora_inicio: [
    { required: true, message: 'Por favor seleccione la hora de inicio', trigger: 'blur' }
  ],
  hora_fin: [
    { required: true, message: 'Por favor seleccione la hora de fin', trigger: 'blur' }
  ],
  estado: [
    { required: true, message: 'Por favor seleccione un estado', trigger: 'change' }
  ],
  id_sala: [
    { required: true, message: 'Por favor seleccione una sala', trigger: 'change' }
  ],
  id_juzgado: [
    { required: true, message: 'Por favor seleccione un juzgado', trigger: 'change' }
  ],
  id_usuario: [
    { required: true, message: 'Por favor seleccione un usuario', trigger: 'change' }
  ]
};

const formRef = ref<FormInstance | null>(null);

onMounted(() => {
  loadSalas();
  loadJuzgados();
  loadUsers();
  if (props.initialData) {
    Object.assign(form, props.initialData);
  }
});

const loadSalas = async () => {
  try {
    const response = await axios.get<Sala[]>('http://127.0.0.1:8000/api/salas');
    salas.value = response.data;
  } catch (error) {
    console.error('Error al cargar las salas:', error);
  }
};

const loadJuzgados = async () => {
  try {
    const response = await axios.get<Juzgado[]>('http://127.0.0.1:8000/api/juzgados');
    juzgados.value = response.data;
  } catch (error) {
    console.error('Error al cargar los juzgados:', error);
  }
};

const loadUsers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/users');
    users.value = response.data.data;
    console.log('users.value ',users.value)
  } catch (error) {
    console.error('Error al cargar los usuarios:', error);
  }
};

const submitForm = async () => {
  loading.value = true;
  try {
    await formRef.value?.validate();
    emit('submit', { ...form });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
};

watch(() => props.initialData, (newValue) => {
  if (newValue) {
    Object.assign(form, newValue);
  }
});
</script>

<style scoped>
.el-form {
  max-width: 800px;
  margin: 20px auto;
}
</style>
