<template>
  <LayoutMain>
    <template #slotLayout>
      <Header 
        :titulo="'Reservas'"
        :tituloBoton="'Crear Reserva'"
        @click="showForm"
      />
      <el-dialog
        v-model="dialogVisible"
        :title="formMode === 'create' ? 'Crear Nueva Reserva' : 'Editar Reserva'"
        width="50%"
        @close="closeDialog"
      >
        <Formulario :titulo="'Formulario de Reservas'">
          <template #slotForm>
            <formReservas 
              :initialData="currentReserva" 
              :formMode="formMode"
              :users="users" 
              @submit="handleSubmit" 
              @cancel="dialogVisible = false"
            />
          </template>
        </Formulario>
      </el-dialog>
      
      <el-table :data="reservas" style="width: 100%" v-loading="loading">
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="fecha" label="Fecha">
          <template #default="scope">
            {{ formatDate(scope.row.fecha) }}
          </template>
        </el-table-column>
        <el-table-column prop="hora_inicio" label="Hora Inicio" />
        <el-table-column prop="hora_fin" label="Hora Fin" />
        <el-table-column prop="estado" label="Estado">
          <template #default="scope">
            <span 
              class="status-badge"
              :class="{
                'status-pending': scope.row.estado === 'pendiente',
                'status-confirmed': scope.row.estado === 'confirmada',
                'status-cancelled': scope.row.estado === 'cancelada'
              }"
            >
              {{ scope.row.estado.charAt(0).toUpperCase() + scope.row.estado.slice(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sala.nom_sala" label="Sala" />
        <el-table-column prop="juzgado.nom_juzgado" label="Juzgado" />
        <el-table-column label="Usuario">
          <template #default="scope">
            {{ getUserFullName(scope.row.usuario) }}
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" @click="editReserva(scope.row)" />
            <el-button type="danger" :icon="Delete" @click="deleteReserva(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </template>
  </LayoutMain>
</template>

<script>
import { ref, onMounted } from 'vue';
import LayoutMain from '../../components/LayoutMain.vue';
import formReservas from './components/formReservas.vue';
import Formulario from '../../components/Formulario.vue';
import Header from '../../components/Header.vue';
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from 'element-plus';
import axios from 'axios';

export default {
  components: {
    LayoutMain,
    formReservas,
    Formulario,
    Header,
  },
  setup() {
    const dialogVisible = ref(false);
    const reservas = ref([]);
    const formMode = ref('create');
    const currentReserva = ref(null);
    const loading = ref(false);
    const users = ref([]);

    const loadReservas = async () => {
      loading.value = true;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/reservas');
        reservas.value = response.data.data;
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
        ElMessage.error('Error al cargar las reservas');
      } finally {
        loading.value = false;
      }
    };

    const loadUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users');
        users.value = response.data.data;
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
        ElMessage.error('Error al cargar los usuarios');
      }
    };

    const showForm = () => {
      formMode.value = 'create';
      currentReserva.value = { 
        descripcion: '', 
        observaciones: '',
        fecha: '', 
        hora_inicio: '', 
        hora_fin: '', 
        estado: 'pendiente',
        id_sala: null,
        id_juzgado: null,
        id_usuario: null,
        id_sede: null
      };
      dialogVisible.value = true;
    };

    const handleSubmit = async (formData) => {
      try {
        if (formMode.value === 'create') {
          await axios.post('http://127.0.0.1:8000/api/reservas', formData);
          ElMessage.success('Reserva creada con éxito');
        } else {
          await axios.put(`http://127.0.0.1:8000/api/reservas/${formData.id_reserva}`, formData);
          ElMessage.success('Reserva actualizada con éxito');
        }
        dialogVisible.value = false;
        await loadReservas();
      } catch (error) {
        if (error.response?.data?.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();
          ElMessage.error(errorMessages.join('\n'));
        } else {
          ElMessage.error('Error al procesar la reserva');
        }
      }
    };

    const editReserva = (reserva) => {
      formMode.value = 'edit';
      currentReserva.value = { 
        ...reserva,
        id_reserva: reserva.id_reserva,
        id_sala: reserva.sala.id_sala,
        id_juzgado: reserva.juzgado.id_juzgado,
        id_usuario: reserva.usuario.id,
        id_sede: reserva.sala.id_sede,
        fecha: formatDate(reserva.fecha),
        hora_inicio: reserva.hora_inicio.substring(0, 5), 
        hora_fin: reserva.hora_fin.substring(0, 5), 
        estado: reserva.estado,
        descripcion: reserva.descripcion,
        observaciones: reserva.observaciones
      };
      dialogVisible.value = true;
    };

    const deleteReserva = (reserva) => {
      ElMessageBox.confirm(
        `¿Está seguro que desea eliminar la reserva del ${formatDate(reserva.fecha)}?`,
        'Advertencia',
        {
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/reservas/${reserva.id_reserva}`);
          ElMessage.success('Reserva eliminada con éxito');
          await loadReservas();
        } catch (error) {
          ElMessage.error('Error al eliminar la reserva');
        }
      }).catch(() => {
        ElMessage.info('Eliminación cancelada');
      });
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    };

    const getUserFullName = (usuario) => {
      if (!usuario) return 'Usuario no asignado';
      return `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || 'Nombre no disponible';
    };

    const closeDialog = () => {
      dialogVisible.value = false;
      currentReserva.value = null;
      formMode.value = 'create';
      loadReservas();
    };

    onMounted(() => {
      loadReservas();
      loadUsers();
    });

    return {
      dialogVisible,
      reservas,
      formMode,
      currentReserva,
      loading,
      users,
      showForm,
      handleSubmit,
      editReserva,
      deleteReserva,
      Edit,
      Delete,
      formatDate,
      getUserFullName,
      closeDialog,
    };
  }
};
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
  font-size: 0.875rem;
}

.status-pending {
  background-color: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde047;
}

.status-confirmed {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
</style>