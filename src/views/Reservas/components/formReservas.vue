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
    <el-form-item label="Usuario" prop="id_usuario">
      <el-select 
        v-model="form.id_usuario" 
        placeholder="Seleccione el usuario" 
        @change="onUserChange(form.id_usuario)">
        <el-option 
          v-for="usuario in users" 
          :key="usuario.id" 
          :label="`${usuario.nombres} ${usuario.apellidos}`" 
          :value="usuario.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Sede" prop="id_sede">
      <el-select 
        v-model="form.id_sede" 
        placeholder="Seleccione la sede" 
        :disabled="!form.id_juzgado">
        <el-option 
          v-for="sede in sedes" 
          :key="sede.id_sede" 
          :label="sede.nom_sede" 
          :value="sede.id_sede">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Juzgado" prop="id_juzgado">
      <el-select v-model="form.id_juzgado" placeholder="Seleccione el juzgado" :disabled="!form.id_usuario">
        <el-option 
          v-for="juzgado in juzgados" 
          :key="juzgado.id_juzgado" 
          :label="juzgado.nom_juzgado" 
          :value="juzgado.id_juzgado">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Sala" prop="id_sala">
      <el-select v-model="form.id_sala" placeholder="Seleccione la sala" :disabled="!form.id_sede">
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
import { reactive, ref, onMounted, computed } from 'vue';
import axios from 'axios';

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
  setup(props) {
    const form = reactive({
      descripcion: '',
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
      id_sede: [
        { required: true, message: 'Por favor seleccione una sede', trigger: 'change' }
      ],
      id_juzgado: [
        { required: true, message: 'Por favor seleccione un juzgado', trigger: 'change' }
      ],
      id_usuario: [
        { required: true, message: 'Por favor seleccione un usuario', trigger: 'change' }
      ],
      id_sala: [
        { required: true, message: 'Por favor seleccione una sala', trigger: 'change' }
      ],
    };

    const formRef = ref(null);

    onMounted(() => {
      loadSalas();
      loadJuzgados();
      loadSedes();
      if (props.initialData) {
        Object.assign(form, props.initialData);
        onUserChange(form.id_usuario); // Cargar juzgado y sala si hay datos iniciales
      }
    });

    const loadSalas = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/salas');
        salas.value = response.data;
      } catch (error) {
        console.error('Error al cargar las salas:', error);
      }
    };

    const loadJuzgados = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/juzgados');
        juzgados.value = response.data;
      } catch (error) {
        console.error('Error al cargar los juzgados:', error);
      }
    };

    const loadSedes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/sedes');
        sedes.value = response.data;
      } catch (error) {
        console.error('Error al cargar las sedes:', error);
      }
    };

    const onUserChange = (userId) => {
      const selectedUser = props.users.find(user => user.id === userId);
      if (selectedUser) {
        form.id_juzgado = selectedUser.id_juzgado;
        form.id_sede = null; // Reiniciar selección de sede y sala
        form.id_sala = null;
      } else {
        form.id_juzgado = null;
        form.id_sede = null;
        form.id_sala = null;
      }
    };

    const filteredSalas = computed(() => {
      return salas.value.filter(sala => sala.id_sede === form.id_sede);
    });

    const submitForm = async () => {
      loading.value = true;
      try {
        await formRef.value.validate();
        emit('submit', { ...form });
      } catch (error) {
        console.error('Error al validar el formulario:', error);
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      formRef.value.resetFields();
      Object.assign(form, {
        descripcion: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        estado: 'pendiente',
        id_sala: null,
        id_juzgado: null,
        id_usuario: null,
        id_sede: null,
      });
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