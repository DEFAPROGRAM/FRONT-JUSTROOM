<template>
  <div class="reporte-salas">
    <div class="filtros-section mb-4">
      <h4>Filtros de Salas Más Solicitadas</h4>
      <div class="row g-3">
        <div class="col-md-4">
          <el-form-item label="Fecha Inicio">
            <el-date-picker
              v-model="filtros.fecha_inicio"
              type="date"
              placeholder="Seleccione fecha inicio"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </div>
        <div class="col-md-4">
          <el-form-item label="Fecha Fin">
            <el-date-picker
              v-model="filtros.fecha_fin"
              type="date"
              placeholder="Seleccione fecha fin"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </div>
        <div class="col-md-4">
          <el-form-item label="Límite de Resultados">
            <el-input-number
              v-model="filtros.limite"
              :min="5"
              :max="50"
              placeholder="Número de salas"
            />
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
        <h4>Ranking de Salas Más Solicitadas</h4>
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
              <div class="stat-number">{{ datosReporte.total_salas }}</div>
              <div class="stat-label">Total Salas</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card bg-primary">
              <div class="stat-number">{{ getTotalReservas() }}</div>
              <div class="stat-label">Total Reservas</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card bg-success">
              <div class="stat-number">{{ getPromedioReservas() }}</div>
              <div class="stat-label">Promedio por Sala</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card bg-warning">
              <div class="stat-number">{{ datosReporte.data[0]?.nom_sala || 'N/A' }}</div>
              <div class="stat-label">Sala Más Popular</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- Tabla de ranking -->
      <el-table :data="datosReporte.data" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="Ranking" width="80" />
        <el-table-column prop="nom_sala" label="Sala" width="200" />
        <el-table-column prop="capacidad" label="Capacidad" width="100" />
        <el-table-column prop="total_reservas" label="Total Reservas" width="120">
          <template #default="scope">
            <el-tag type="primary" size="large">
              {{ scope.row.total_reservas }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reservas_confirmadas" label="Confirmadas" width="120">
          <template #default="scope">
            <el-tag type="success">
              {{ scope.row.reservas_confirmadas }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reservas_pendientes" label="Pendientes" width="120">
          <template #default="scope">
            <el-tag type="warning">
              {{ scope.row.reservas_pendientes }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reservas_canceladas" label="Canceladas" width="120">
          <template #default="scope">
            <el-tag type="danger">
              {{ scope.row.reservas_canceladas }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Porcentaje de Ocupación" width="150">
          <template #default="scope">
            <el-progress 
              :percentage="getPorcentajeOcupacion(scope.row)" 
              :color="getColorPorcentaje(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- Gráfico de ranking -->
      <div class="grafico-section mt-4">
        <h5>Ranking de Salas por Número de Reservas</h5>
        <div class="chart-container">
          <div class="placeholder-chart">
            <i class="fas fa-chart-bar fa-3x text-muted"></i>
            <p>Gráfico de ranking de salas</p>
          </div>
        </div>
      </div>

      <!-- Análisis de tendencias -->
      <div class="analisis-section mt-4">
        <h5>Análisis de Tendencias</h5>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="analisis-card">
              <div class="analisis-icon">
                <i class="fas fa-star text-warning"></i>
              </div>
              <h6>Sala Más Solicitada</h6>
              <p>{{ datosReporte.data[0]?.nom_sala || 'N/A' }}</p>
              <small>{{ datosReporte.data[0]?.total_reservas || 0 }} reservas</small>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="analisis-card">
              <div class="analisis-icon">
                <i class="fas fa-chart-line text-success"></i>
              </div>
              <h6>Promedio de Reservas</h6>
              <p>{{ getPromedioReservas() }} por sala</p>
              <small>Basado en {{ datosReporte.total_salas }} salas</small>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="analisis-card">
              <div class="analisis-icon">
                <i class="fas fa-percentage text-info"></i>
              </div>
              <h6>Tasa de Confirmación</h6>
              <p>{{ getTasaConfirmacion() }}%</p>
              <small>Reservas confirmadas vs total</small>
            </el-card>
          </el-col>
        </el-row>
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
  fecha_inicio: '',
  fecha_fin: '',
  limite: 10
})

const datosReporte = ref(null)
const loading = ref(false)

const generarReporte = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const params = new URLSearchParams()
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio)
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin)
    if (filtros.limite) params.append('limite', filtros.limite.toString())

    const response = await axios.get(`http://127.0.0.1:8000/api/reportes/salas-mas-solicitadas?${params}`, { headers })
    datosReporte.value = response.data
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte')
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  filtros.fecha_inicio = ''
  filtros.fecha_fin = ''
  filtros.limite = 10
  datosReporte.value = null
}

const getTotalReservas = () => {
  if (!datosReporte.value?.data) return 0
  return datosReporte.value.data.reduce((total, sala) => total + sala.total_reservas, 0)
}

const getPromedioReservas = () => {
  if (!datosReporte.value?.data || datosReporte.value.data.length === 0) return 0
  const total = getTotalReservas()
  return Math.round(total / datosReporte.value.data.length)
}

const getPorcentajeOcupacion = (sala) => {
  const maxReservas = Math.max(...datosReporte.value.data.map(s => s.total_reservas))
  return Math.round((sala.total_reservas / maxReservas) * 100)
}

const getColorPorcentaje = (sala) => {
  const porcentaje = getPorcentajeOcupacion(sala)
  if (porcentaje >= 80) return '#f56c6c'
  if (porcentaje >= 60) return '#e6a23c'
  if (porcentaje >= 40) return '#409eff'
  return '#67c23a'
}

const getTasaConfirmacion = () => {
  if (!datosReporte.value?.data) return 0
  const totalReservas = getTotalReservas()
  const confirmadas = datosReporte.value.data.reduce((total, sala) => total + sala.reservas_confirmadas, 0)
  return Math.round((confirmadas / totalReservas) * 100) || 0
}

const exportarExcel = () => {
  ElMessage.info('Función de exportación a Excel en desarrollo')
}

const exportarPDF = () => {
  ElMessage.info('Función de exportación a PDF en desarrollo')
}
</script>

<style scoped>
.reporte-salas {
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

.analisis-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.analisis-card {
  text-align: center;
  padding: 20px;
}

.analisis-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.analisis-card h6 {
  margin-bottom: 10px;
  color: #333;
}

.analisis-card p {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.analisis-card small {
  color: #666;
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

:deep(.el-form-item) {
  margin-bottom: 15px;
}

.bg-primary {
  background-color: #409eff !important;
}

.bg-success {
  background-color: #67c23a !important;
}

.bg-warning {
  background-color: #e6a23c !important;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.text-info {
  color: #409eff;
}
</style>
