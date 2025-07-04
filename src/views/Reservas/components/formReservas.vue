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

// Configuración de horarios permitidos
const timePickerOptions = {
  start: '08:00',
  step: '00:30',
  end: '17:00',
  minTime: '08:00',
  maxTime: '17:00',
  format: 'HH:mm',
  valueFormat: 'HH:mm',
  selectableRange: ['08:00:00 - 12:00:00', '13:00:00 - 17:00:00']
};

const isLunchTime = (time) => {
  return time >= '12:00' && time <= '13:00';
};

const isWeekend = (date) => {
  if (!date) return false;
  const [day, month, year] = date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const rules = {
  descripcion: [
    { required: false, message: 'La descripción es opcional', trigger: 'blur' }
  ],
  observaciones: [
    { required: false, message: 'Las observaciones son opcionales', trigger: 'blur' }
  ],
  fecha: [
    { required: true, message: 'Por favor seleccione una fecha', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value && isWeekend(value)) {
          callback(new Error('No se pueden hacer reservas los fines de semana'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  hora_inicio: [
    { required: true, message: 'Por favor seleccione la hora de inicio', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        const hour = parseInt(value.split(':')[0]);
        const minute = parseInt(value.split(':')[1]);
        
        if (hour < 8 || hour >= 17) {
          callback(new Error('El horario debe estar entre 8:00 AM y 5:00 PM'));
        } else if (hour === 12) {
          callback(new Error('No se pueden hacer reservas durante el horario de almuerzo (12:00 PM - 1:00 PM)'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  hora_fin: [
    { required: true, message: 'Por favor seleccione la hora de fin', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        const hour = parseInt(value.split(':')[0]);
        const minute = parseInt(value.split(':')[1]);
        
        if (hour < 8 || hour >= 17) {
          callback(new Error('El horario debe estar entre 8:00 AM y 5:00 PM'));
        } else if (hour === 12) {
          callback(new Error('No se pueden hacer reservas durante el horario de almuerzo (12:00 PM - 1:00 PM)'));
        } else if (value && form.hora_inicio && value <= form.hora_inicio) {
          callback(new Error('La hora de fin debe ser mayor a la hora de inicio'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
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
      
      // Mantener la sala seleccionada en modo edición
      if (props.formMode !== 'edit') {
        form.id_sala = null;
      }
      
      await checkAvailableSalas();
    }
  }
};

const isTimeOverlap = (start1, end1, start2, end2) => {
  return (start1 < end2 && end1 > start2);
};

const checkAvailableSalas = async () => {
  if (!form.fecha || !form.hora_inicio || !form.hora_fin || !form.id_sede) {
    availableSalas.value = [];
    return;
  }

  const [day, month, year] = form.fecha.split('-');
  const formattedDate = `${year}-${month}-${day}`;

  // Obtener todas las salas de la sede seleccionada
  const sedesSalas = salas.value.filter(sala => sala.id_sede === form.id_sede);
  
  // Filtrar las salas ocupadas
  const salasOcupadas = new Set();

  reservas.value.forEach(reserva => {
    if (reserva.estado !== 'cancelada' && 
        reserva.fecha === formattedDate &&
        !(props.formMode === 'edit' && reserva.id_reserva === form.id_reserva)) {
      
      // Verificar si hay superposición de horarios
      if (isTimeOverlap(
        form.hora_inicio,
        form.hora_fin,
        reserva.hora_inicio,
        reserva.hora_fin
      )) {
        salasOcupadas.add(reserva.id_sala);
      }
    }
  });

  // Actualizar salas disponibles
  availableSalas.value = sedesSalas.filter(sala => 
    !salasOcupadas.has(sala.id_sala)
  );

  // Si la sala seleccionada ya no está disponible, limpiarla
  if (form.id_sala && !availableSalas.value.find(s => s.id_sala === form.id_sala)) {
    form.id_sala = null;
    ElMessage.warning('La sala seleccionada ya no está disponible para el horario elegido');
  }
};

const disablePastDates = (date) => {
  return date < new Date(new Date().setHours(0, 0, 0, 0));
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    await checkAvailableSalas();
    
    if (form.id_sala && !availableSalas.value.find(s => s.id_sala === form.id_sala)) {
      ElMessage.error('La sala seleccionada no está disponible para este horario');
      return;
    }
    
    loading.value = true;
    await emit('submit', { ...form });
    resetForm(); // Llamar a resetForm aquí
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
  form.descripcion = '';
  form.observaciones = '';
  form.fecha = '';
  form.hora_inicio = '';
  form.hora_fin = '';
  form.estado = 'pendiente';
  form.id_sala = null;
  form.id_usuario = null;
  // No reiniciamos id_sede ni id_juzgado para mantener la lógica de salas disponibles
};

const updateReservas = (newReservas) => {
  reservas.value = newReservas;
  checkAvailableSalas();
};

watch(() => props.initialData, (newValue) => {
  if (newValue) {
    Object.assign(form, newValue);
    const user = props.users.find(u => u.id === newValue.id_usuario);
    if (user) {
      onUserChange(user.id);
    }
  } else {
    resetForm();
  }
}, { deep: true, immediate: true });

watch(
  () => [form.fecha, form.hora_inicio, form.hora_fin],
  async () => {
    if (form.id_sede) {
      await checkAvailableSalas();
    }
  }
);

onMounted(() => {
  loadInitialData();
});

defineExpose({ resetForm, updateReservas });
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
        :locale="{
          name: 'es',
          el: {
            datepicker: {
              now: 'Ahora',
              today: 'Hoy',
              cancel: 'Cancelar',
              clear: 'Limpiar',
              confirm: 'Confirmar',
              selectDate: 'Seleccionar fecha',
              selectTime: 'Seleccionar hora',
              startDate: 'Fecha inicial',
              startTime: 'Hora inicial',
              endDate: 'Fecha final',
              endTime: 'Hora final',
              prevYear: 'Año anterior',
              nextYear: 'Año siguiente',
              prevMonth: 'Mes anterior',
              nextMonth: 'Mes siguiente',
              year: 'Año',
              month1: 'Enero',
              month2: 'Febrero',
              month3: 'Marzo',
              month4: 'Abril',
              month5: 'Mayo',
              month6: 'Junio',
              month7: 'Julio',
              month8: 'Agosto',
              month9: 'Septiembre',
              month10: 'Octubre',
              month11: 'Noviembre',
              month12: 'Diciembre',
              weeks: {
                sun: 'Dom',
                mon: 'Lun',
                tue: 'Mar',
                wed: 'Mié',
                thu: 'Jue',
                fri: 'Vie',
                sat: 'Sáb'
              },
              months: {
                jan: 'Ene',
                feb: 'Feb',
                mar: 'Mar',
                apr: 'Abr',
                may: 'May',
                jun: 'Jun',
                jul: 'Jul',
                aug: 'Ago',
                sep: 'Sep',
                oct: 'Oct',
                nov: 'Nov',
                dec: 'Dic'
              }
            }
          }
        }"
        @change="checkAvailableSalas">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="Hora Inicio" prop="hora_inicio" required>
      <el-time-picker 
        v-model="form.hora_inicio" 
        format="HH:mm" 
        value-format="HH:mm"
        :disabled="!form.fecha"
        :picker-options="timePickerOptions"
        placeholder="Seleccione la hora de inicio"
        :disabled-hours="() => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            if (i < 8 || i >= 17 || i === 12) {
              hours.push(i);
            }
          }
          return hours;
        }"
        @change="checkAvailableSalas">
      </el-time-picker>
    </el-form-item>
    <el-form-item label="Hora Fin" prop="hora_fin" required>
      <el-time-picker 
        v-model="form.hora_fin" 
        format="HH:mm" 
        value-format="HH:mm"
        :disabled="!form.hora_inicio"
        :picker-options="timePickerOptions"
        placeholder="Seleccione la hora de fin"
        :disabled-hours="() => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            if (i < 8 || i >= 17 || i === 12) {
              hours.push(i);
            }
          }
          return hours;
        }"
        @change="checkAvailableSalas">
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
  max-width: 100%;
  margin: 0;
  padding: 20px;
  overflow-x: hidden;
}

.el-select,
.el-date-picker,
.el-time-picker,
.el-input {
  width: 100%;
}

.text-warning {
  color: #e6a23c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

:deep(.el-dialog) {
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  width: 50% !important;
}

:deep(.el-dialog__body) {
  padding: 0;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-textarea__inner) {
  min-height: 80px !important;
}

:deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #dcdfe6;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  margin: 0;
  border-top: 1px solid #dcdfe6;
}

:deep(.el-time-picker__input) {
  font-weight: bold;
}

:deep(.el-time-picker__input[disabled]) {
  color: #999;
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}
</style>

