<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="Descripción" prop="descripcion">
      <el-input v-model="form.descripcion" type="textarea" :rows="2" placeholder="Ingrese la descripción de la reserva"></el-input>
    </el-form-item>
    <el-form-item label="Observaciones" prop="observaciones">
      <el-input v-model="form.observaciones" type="textarea" :rows="2" placeholder="Ingrese las observaciones de la reserva"></el-input>
    </el-form-item>
    <el-form-item label="Fecha" prop="fecha" required>
      <el-date-picker 
        v-model="form.fecha" 
        type="date" 
        placeholder="Seleccione la fecha" 
        format="DD-MM-YYYY" 
        value-format="DD-MM-YYYY">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="Hora Inicio" prop="hora_inicio" required>
      <el-time-picker 
        v-model="form.hora_inicio" 
        format="HH:mm" 
        value-format="HH:mm"
        placeholder="Seleccione la hora de inicio">
      </el-time-picker>
    </el-form-item>
    <el-form-item label="Hora Fin" prop="hora_fin" required>
      <el-time-picker 
        v-model="form.hora_fin" 
        format="HH:mm" 
        value-format="HH:mm"
        placeholder="Seleccione la hora de fin">
      </el-time-picker>
    </el-form-item>
    <el-form-item label="Estado" prop="estado" required>
      <el-select v-model="form.estado" placeholder="Seleccione el estado">
        <el-option label="Pendiente" value="pendiente"></el-option>
        <el-option label="Confirmada" value="confirmada"></el-option>
        <el-option label="Cancelada" value="cancelada"></el-option>
      </el-select>
    </el-form-item>
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
    <el-form-item label="Sede" prop="id_sede" required>
      <el-select 
        v-model="form.id_sede" 
        placeholder="Seleccione la sede" 
        @change="onSedeChange">
        <el-option 
          v-for="sede in sedes" 
          :key="sede.id_sede" 
          :label="sede.nom_sede" 
          :value="sede.id_sede">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Juzgado" prop="id_juzgado" required>
      <el-select v-model="form.id_juzgado" placeholder="Seleccione el juzgado">
        <el-option 
          v-for="juzgado in juzgados" 
          :key="juzgado.id_juzgado" 
          :label="juzgado.nom_juzgado" 
          :value="juzgado.id_juzgado">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Sala" prop="id_sala" required>
      <el-select v-model="form.id_sala" placeholder="Seleccione la sala">
        <el-option 
          v-for="sala in filteredSalas" 
          :key="sala.id_sala" 
          :label="sala.nom_sala" 
          :value="sala.id_sala">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="loading">Guardar</el-button>
      <el-button @click="resetForm">Limpiar</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { reactive, ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  props: {
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
  },
  setup(props, { emit }) {
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

    const salas = ref([]);
    const juzgados = ref([]);
    const sedes = ref([]);
    const loading = ref(false);
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
          pattern: /^\d{2}-\d{2}-\d{4}$/, 
          message: 'Formato de fecha inválido (DD-MM-YYYY)', 
          trigger: 'blur' 
        }
      ],
      hora_inicio: [
        { required: true, message: 'Por favor seleccione la hora de inicio', trigger: 'blur' },
        { pattern: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Formato de hora inválido (HH:mm)', trigger: 'blur' }
      ],
      hora_fin: [
        { required: true, message: 'Por favor seleccione la hora de fin', trigger: 'blur' },
        { pattern: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Formato de hora inválido (HH:mm)', trigger: 'blur' }
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
      ],
      id_sede: [
        { required: true, message: 'Por favor seleccione una sede', trigger: 'change' }
      ],
    };

    const formRef = ref(null);

    onMounted(() => {
      loadSalas();
      loadJuzgados();
      loadSedes();
    });

    watch(() => props.initialData, (newValue) => {
      if (newValue) {
        Object.assign(form, newValue);
      }
    }, { deep: true, immediate: true });

    const loadSalas = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/salas');
        salas.value = response.data;
      } catch (error) {
        console.error('Error al cargar las salas:', error);
        ElMessage.error('Error al cargar las salas');
      }
    };

    const loadJuzgados = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/juzgados');
        juzgados.value = response.data;
      } catch (error) {
        console.error('Error al cargar los juzgados:', error);
        ElMessage.error('Error al cargar los juzgados');
      }
    };

    const loadSedes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/sedes');
        sedes.value = response.data;
      } catch (error) {
        console.error('Error al cargar las sedes:', error);
        ElMessage.error('Error al cargar las sedes');
      }
    };

    const onUserChange = (userId) => {
      const selectedUser = props.users.find(user => user.id === userId);
      if (selectedUser) {
        form.id_juzgado = selectedUser.id_juzgado;
      } else {
        form.id_juzgado = null;
      }
      form.id_sede = null;
      form.id_sala = null;
    };

    const onSedeChange = () => {
      form.id_sala = null;
    };

    const filteredSalas = computed(() => {
      return salas.value.filter(sala => sala.id_sede === form.id_sede);
    });

    const submitForm = async () => {
      loading.value = true;
      try {
        await formRef.value.validate();
        const formData = { ...form };
        if (props.formMode === 'edit') {
          formData.id_reserva = props.initialData.id_reserva;
        }
        console.log('Datos del formulario a enviar:', formData);
        emit('submit', formData);
      } catch (error) {
        if (error.response && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();
          ElMessage.error(errorMessages.join('\n'));
        } else if (error instanceof Error) {
          console.error('Error al validar el formulario:', error.message);
          ElMessage.error(`Error de validación: ${error.message}`);
        } else {
          console.error('Error al validar el formulario:', error);
          ElMessage.error('Por favor, complete todos los campos requeridos correctamente.');
        }
      } finally {
        loading.value = false;
        resetForm
      }
    };

    const resetForm = () => {
      formRef.value.resetFields();
      Object.assign(form, {
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
      emit('formReset');
    };

    return {
      form,
      salas,
      juzgados,
      sedes,
      loading,
      rules,
      formRef,
      onUserChange,
      onSedeChange,
      submitForm,
      resetForm,
      filteredSalas,
    };
  }
};
</script>

<style scoped>
.el-form {
  max-width: 800px;
  margin: 20px auto;
}
</style>

