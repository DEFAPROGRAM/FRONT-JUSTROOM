<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => null,
  },
  formMode: {
    type: String,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['submit', 'cancel', 'updateReservas']);

const form = reactive({
  id_reserva: null,
  descripcion: '',
  observaciones: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  estado: 'pendiente',
  id_sala: null,
  id_juzgado: null,
  id_usuario: null,
  id_sede: null,
});

const formRef = ref(null);
const loading = ref(false);
const salas = ref([]);
const juzgados = ref([]);
const sedes = ref([]);
const reservas = ref([]);
const availableSalas = ref([]);
const selectedSedeName = ref('');
const selectedJuzgadoName = ref('');

const rules = {
  descripcion: [
    { required: false, message: 'La descripción es opcional', trigger: 'blur' }
  ],
  observaciones: [
    { required: false, message: 'Las observaciones son opcionales', trigger: 'blur' }
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
  id_usuario: [
    { required: true, message: 'Por favor seleccione un usuario', trigger: 'change' }
  ]
};

const loadInitialData = async () => {
  try {
    const [salasRes, juzgadosRes, sedesRes, reservasRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/salas'),
      axios.get('http://127.0.0.1:8000/api/juzgados'),
      axios.get('http://127.0.0.1:8000/api/sedes'),
      axios.get('http://127.0.0.1:8000/api/reservas')
    ]);

    salas.value = salasRes.data;
    juzgados.value = juzgadosRes.data;
    sedes.value = sedesRes.data;
    reservas.value = reservasRes.data.data;
    await checkAvailableSalas();
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    ElMessage.error('Error al cargar los datos necesarios');
  }
};

const onUserChange = async (userId) => {
  const selectedUser = props.users.find(user => user.id === userId);
  if (selectedUser) {
    form.id_juzgado = selectedUser.id_juzgado;
    const juzgado = juzgados.value.find(j => j.id_juzgado === selectedUser.id_juzgado);
    if (juzgado) {
      form.id_sede = juzgado.id_sede;
      const sede = sedes.value.find(s => s.id_sede === juzgado.id_sede);
      selectedSedeName.value = sede ? sede.nom_sede : '';
      selectedJuzgadoName.value = juzgado.nom_juzgado;
      form.id_sala = null;
      await refreshAvailableSalas();
    }
  }
};

const isTimeOverlap = (start1, end1, start2, end2) => {
  return (start1 < end2 && end1 > start2);
};

const refreshAvailableSalas = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reservas');
    reservas.value = response.data.data;
    await checkAvailableSalas();
  } catch (error) {
    console.error('Error al actualizar las reservas:', error);
  }
};

const checkAvailableSalas = async () => {
  if (!form.fecha || !form.hora_inicio || !form.hora_fin || !form.id_sede) {
    availableSalas.value = [];
    return;
  }

  const [day, month, year] = form.fecha.split('-');
  const formattedDate = `${year}-${month}-${day}`;

  const sedesSalas = salas.value.filter(sala => sala.id_sede === form.id_sede);
  const salasOcupadas = new Map();

  for (const sala of sedesSalas) {
    const reservasSala = reservas.value.filter(reserva => {
      if (reserva.estado === 'cancelada' || 
          (props.formMode === 'edit' && reserva.id_reserva === form.id_reserva)) {
        return false;
      }

      return (
        reserva.id_sala === sala.id_sala && 
        reserva.fecha === formattedDate &&
        isTimeOverlap(
          form.hora_inicio,
          form.hora_fin,
          reserva.hora_inicio,
          reserva.hora_fin
        )
      );
    });

    if (reservasSala.length > 0) {
      salasOcupadas.set(sala.id_sala, true);
    }
  }

  availableSalas.value = sedesSalas.filter(sala => !salasOcupadas.has(sala.id_sala));

  if (form.id_sala && !availableSalas.value.find(s => s.id_sala === form.id_sala)) {
    form.id_sala = null;
  }
};

const disablePastDates = (date) => {
  return date < new Date(new Date().setHours(0, 0, 0, 0));
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    await refreshAvailableSalas();
    
    if (form.id_sala && !availableSalas.value.find(s => s.id_sala === form.id_sala)) {
      ElMessage.error('La sala seleccionada no está disponible para este horario');
      return;
    }
    
    loading.value = true;
    emit('submit', { ...form });
    await refreshAvailableSalas();
  } catch (error) {
    console.error('Error en la validación:', error);
    ElMessage.error('Por favor, complete todos los campos requeridos correctamente');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
  selectedSedeName.value = '';
  selectedJuzgadoName.value = '';
  availableSalas.value = [];
};

watch(() => props.initialData, (newValue) => {
  if (newValue) {
    Object.assign(form, newValue);
    const user = props.users.find(u => u.id === newValue.id_usuario);
    if (user) {
      onUserChange(user.id);
    }
  }
}, { deep: true, immediate: true });

watch(
  () => [form.fecha, form.hora_inicio, form.hora_fin],
  async () => {
    if (form.id_sede) {
      await refreshAvailableSalas();
    }
  }
);

onMounted(() => {
  loadInitialData();
});
</script>

<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="Usuario" prop="id_usuario" required>
      <el-select 
        v-model="form.id_usuario" 
        placeholder="Seleccione el usuario" 
        @change="onUserChange">
        <el-option 
          v-for="usuario in users" 
          :key="usuario.id" 
          :label="`${usuario.nombres} ${usuario.apellidos}`" 
          :value="usuario.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Sede" prop="id_sede">
      <el-input 
        v-model="selectedSedeName" 
        placeholder="Sede del usuario"
        disabled>
      </el-input>
    </el-form-item>
    <el-form-item label="Juzgado" prop="id_juzgado">
      <el-input 
        v-model="selectedJuzgadoName" 
        placeholder="Juzgado del usuario"
        disabled>
      </el-input>
    </el-form-item>
    <el-form-item label="Descripción" prop="descripcion">
      <el-input 
        v-model="form.descripcion" 
        type="textarea" 
        :rows="2" 
        placeholder="Ingrese la descripción de la reserva">
      </el-input>
    </el-form-item>
    <el-form-item label="Observaciones" prop="observaciones">
      <el-input 
        v-model="form.observaciones" 
        type="textarea" 
        :rows="2" 
        placeholder="Ingrese las observaciones de la reserva">
      </el-input>
    </el-form-item>
    <el-form-item label="Fecha" prop="fecha" required>
      <el-date-picker 
        v-model="form.fecha" 
        type="date" 
        placeholder="Seleccione la fecha" 
        format="DD-MM-YYYY" 
        value-format="DD-MM-YYYY"
        :disabled-date="disablePastDates"
        @change="refreshAvailableSalas">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="Hora Inicio" prop="hora_inicio" required>
      <el-time-picker 
        v-model="form.hora_inicio" 
        format="HH:mm" 
        value-format="HH:mm"
        :disabled="!form.fecha"
        placeholder="Seleccione la hora de inicio"
        @change="refreshAvailableSalas">
      </el-time-picker>
    </el-form-item>
    <el-form-item label="Hora Fin" prop="hora_fin" required>
      <el-time-picker 
        v-model="form.hora_fin" 
        format="HH:mm" 
        value-format="HH:mm"
        :disabled="!form.hora_inicio"
        placeholder="Seleccione la hora de fin"
        @change="refreshAvailableSalas">
      </el-time-picker>
    </el-form-item>
    <el-form-item label="Sala" prop="id_sala" required>
      <el-select 
        v-model="form.id_sala" 
        placeholder="Seleccione la sala"
        :disabled="!form.hora_fin || availableSalas.length === 0">
        <el-option 
          v-for="sala in availableSalas" 
          :key="sala.id_sala" 
          :label="sala.nom_sala" 
          :value="sala.id_sala">
        </el-option>
      </el-select>
      <span v-if="availableSalas.length === 0 && form.hora_fin" class="text-warning">
        No hay salas disponibles para el horario seleccionado
      </span>
    </el-form-item>
    <el-form-item label="Estado" prop="estado" required>
      <el-select v-model="form.estado" placeholder="Seleccione el estado">
        <el-option label="Pendiente" value="pendiente"></el-option>
        <el-option label="Confirmada" value="confirmada"></el-option>
        <el-option label="Cancelada" value="cancelada"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="loading">Guardar</el-button>
      <el-button @click="resetForm">Limpiar</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.el-form {
  max-width: 800px;
  margin: 20px auto;
}

.el-select {
  width: 100%;
}

.el-date-picker,
.el-time-picker {
  width: 100%;
}

.text-warning {
  color: #e6a23c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}
</style>