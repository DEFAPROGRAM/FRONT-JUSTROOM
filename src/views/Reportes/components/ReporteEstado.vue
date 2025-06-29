<template>
  <div class="reporte-estado">
    <div class="filtros-section mb-4">
      <h4>Filtros por Estado</h4>
      <div class="row g-3">
        <div class="col-md-6">
          <el-form-item label="Estado de Reserva">
            <el-select v-model="filtros.estado" placeholder="Seleccione un estado" clearable>
              <el-option label="Todas las Reservas" value="" />
              <el-option label="Pendientes" value="pendiente" />
              <el-option label="Confirmadas" value="confirmada" />
              <el-option label="Canceladas" value="cancelada" />
            </el-select>
          </el-form-item>
        </div>
      </div>
      <div class="acciones-filtros">
        <el-button type="primary" @click="generarReporte" :loading="loading">
          <i class="fas fa-search me-2"></i>
          Generar Reporte
        </el-button>
        <el-button @click="limpiarFiltros">
          <i class="fas fa-eraser me-2"></i>
          Limpiar Filtros
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-section">
      <el-loading />
    </div>

    <div v-else-if="datosReporte" class="resultados-section">
      <div class="header-resultados">
        <h4>Reservas por Estado</h4>
        <div class="acciones">
          <el-button type="primary" @click="exportarExcel">
            <i class="fas fa-file-excel me-2"></i>
            Exportar Excel
          </el-button>
          <el-button type="success" @click="exportarPDF">
            <i class="fas fa-file-pdf me-2"></i>
            Exportar PDF
          </el-button>
        </div>
      </div>

      <!-- Resumen estadístico -->
      <div class="resumen-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-number">{{ datosReporte.total_reservas }}</div>
              <div class="stat-label">Total Reservas</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card bg-warning">
              <div class="stat-number">{{ datosReporte.resumen?.pendientes || 0 }}</div>
              <div class="stat-label">Pendientes</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card bg-success">
              <div class="stat-number">{{ datosReporte.resumen?.confirmadas || 0 }}</div>
              <div class="stat-label">Confirmadas</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card bg-danger">
              <div class="stat-number">{{ datosReporte.resumen?.canceladas || 0 }}</div>
              <div class="stat-label">Canceladas</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- Tabla de resultados -->
      <el-table :data="datosReporte.data" style="width: 100%" v-loading="loading">
        <el-table-column prop="fecha" label="Fecha" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.fecha) }}
          </template>
        </el-table-column>
        <el-table-column prop="hora_inicio" label="Hora Inicio" width="100" />
        <el-table-column prop="hora_fin" label="Hora Fin" width="100" />
        <el-table-column prop="sala.nom_sala" label="Sala" width="150" />
        <el-table-column prop="usuario.nombres" label="Usuario" width="200">
          <template #default="scope">
            {{ scope.row.usuario?.nombres }} {{ scope.row.usuario?.apellidos }}
          </template>
        </el-table-column>
        <el-table-column prop="juzgado.nom_juzgado" label="Juzgado" width="150" />
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="estado" label="Estado" width="120">
          <template #default="scope">
            <el-tag :type="getEstadoType(scope.row.estado)">
              {{ scope.row.estado }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Gráfico de distribución por estado -->
      <div class="grafico-section mt-4">
        <h5>Distribución de Reservas por Estado</h5>
        <div class="chart-container">
          <div class="placeholder-chart">
            <i class="fas fa-chart-pie fa-3x text-muted"></i>
            <p>Gráfico de distribución por estado</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <el-empty description="Configure los filtros y genere un reporte" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['close', 'export'])

const filtros = reactive({
  estado: ''
})

const datosReporte = ref(null)
const loading = ref(false)

const generarReporte = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const params = new URLSearchParams()
    if (filtros.estado) params.append('estado', filtros.estado)

    const response = await axios.get(`http://127.0.0.1:8000/api/reportes/reservas-por-estado?${params}`, { headers })
    datosReporte.value = response.data
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte')
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  filtros.estado = ''
  datosReporte.value = null
}

const getEstadoType = (estado) => {
  const tipos = {
    pendiente: 'warning',
    confirmada: 'success',
    cancelada: 'danger'
  }
  return tipos[estado] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

const exportarExcel = () => {
  ElMessage.info('Función de exportación a Excel en desarrollo')
}

const exportarPDF = () => {
  ElMessage.info('Función de exportación a PDF en desarrollo')
}
</script>

<style scoped>
.reporte-estado {
  padding: 20px;
}

.filtros-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.filtros-section h4 {
  margin-bottom: 15px;
  color: #333;
}

.acciones-filtros {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.header-resultados {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.acciones {
  display: flex;
  gap: 10px;
}

.resumen-stats {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  margin-top: 5px;
}

.grafico-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-chart {
  text-align: center;
  color: #999;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.loading-section {
  text-align: center;
  padding: 40px;
}

:deep(.el-table) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-tag) {
  text-transform: capitalize;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-success {
  background-color: #28a745 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}
</style>
