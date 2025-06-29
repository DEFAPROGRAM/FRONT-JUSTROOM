<template>
  <div class="reporte-usuario">
    <div class="filters-section">
      <h4 class="section-title">
        <i class="fas fa-filter me-2"></i>
        Filtros de Búsqueda
      </h4>
      
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Usuario</label>
          <el-select 
            v-model="filtros.usuario_id" 
            placeholder="Seleccionar usuario"
            clearable
            filterable
            class="w-100"
          >
            <el-option
              v-for="usuario in usuarios"
              :key="usuario.id"
              :label="`${usuario.nombres || ''} ${usuario.apellidos || ''}`"
              :value="usuario.id"
            />
          </el-select>
        </div>
        
        <div class="col-md-4">
          <label class="form-label">Fecha Inicio</label>
          <el-date-picker
            v-model="filtros.fecha_inicio"
            type="date"
            placeholder="Seleccionar fecha inicio"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="w-100"
          />
        </div>
        
        <div class="col-md-4">
          <label class="form-label">Fecha Fin</label>
          <el-date-picker
            v-model="filtros.fecha_fin"
            type="date"
            placeholder="Seleccionar fecha fin"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="w-100"
          />
        </div>
      </div>
      
      <div class="row g-3 mt-3">
        <div class="col-md-4">
          <label class="form-label">Estado</label>
          <el-select 
            v-model="filtros.estado" 
            placeholder="Seleccionar estado"
            clearable
            class="w-100"
          >
            <el-option label="Pendiente" value="pendiente" />
            <el-option label="Confirmada" value="confirmada" />
            <el-option label="Cancelada" value="cancelada" />
          </el-select>
        </div>
        
        <div class="col-md-4">
          <label class="form-label">Sala</label>
          <el-select 
            v-model="filtros.sala_id" 
            placeholder="Seleccionar sala"
            clearable
            filterable
            class="w-100"
          >
            <el-option
              v-for="sala in salas"
              :key="sala.id"
              :label="sala.nom_sala"
              :value="sala.id"
            />
          </el-select>
        </div>
        
        <div class="col-md-4 d-flex align-items-end">
          <el-button 
            type="primary" 
            @click="generarReporte"
            :loading="loading"
            class="w-100"
          >
            <i class="fas fa-search me-2"></i>
            Generar Reporte
          </el-button>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div class="results-section mt-4" v-if="reporteData.length > 0">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="section-title mb-0">
          <i class="fas fa-list me-2"></i>
          Resultados ({{ reporteData.length }} registros)
        </h4>
        <div class="actions">
          <el-button 
            type="success" 
            size="small"
            @click="exportarExcel"
            :loading="exporting"
          >
            <i class="fas fa-file-excel me-2"></i>
            Exportar Excel
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            @click="exportarPDF"
            :loading="exporting"
          >
            <i class="fas fa-file-pdf me-2"></i>
            Exportar PDF
          </el-button>
        </div>
      </div>

      <!-- Tabla de resultados -->
      <el-table 
        :data="reporteData" 
        stripe 
        border
        style="width: 100%"
        max-height="400"
      >
        <el-table-column prop="usuario.nombres" label="Usuario" width="150">
          <template #default="scope">
            {{ scope.row.usuario?.nombres || '' }} {{ scope.row.usuario?.apellidos || '' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="sala.nom_sala" label="Sala" width="120" />
        
        <el-table-column prop="fecha" label="Fecha" width="100">
          <template #default="scope">
            {{ formatDate(scope.row.fecha) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="hora_inicio" label="Hora Inicio" width="100" />
        
        <el-table-column prop="hora_fin" label="Hora Fin" width="100" />
        
        <el-table-column prop="motivo" label="Motivo" min-width="200" />
        
        <el-table-column prop="estado" label="Estado" width="100">
          <template #default="scope">
            <el-tag 
              :type="getEstadoType(scope.row.estado)"
              size="small"
            >
              {{ scope.row.estado }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="Fecha Creación" width="120">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Resumen estadístico -->
      <div class="stats-summary mt-4">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ estadisticas.total_reservas }}</div>
              <div class="stat-label">Total Reservas</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ estadisticas.reservas_confirmadas }}</div>
              <div class="stat-label">Confirmadas</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ estadisticas.reservas_pendientes }}</div>
              <div class="stat-label">Pendientes</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ estadisticas.reservas_canceladas }}</div>
              <div class="stat-label">Canceladas</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-else-if="!loading" class="no-data mt-4">
      <div class="text-center">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No se encontraron reservas</h5>
        <p class="text-muted">Ajusta los filtros de búsqueda para obtener resultados</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['close', 'export'])

const loading = ref(false)
const exporting = ref(false)
const reporteData = ref([])
const usuarios = ref([])
const salas = ref([])
const estadisticas = ref({
  total_reservas: 0,
  reservas_confirmadas: 0,
  reservas_pendientes: 0,
  reservas_canceladas: 0
})

const filtros = ref({
  usuario_id: null,
  fecha_inicio: null,
  fecha_fin: null,
  estado: null,
  sala_id: null
})

const loadUsuarios = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.get('http://127.0.0.1:8000/api/users', { headers })
    usuarios.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

const loadSalas = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.get('http://127.0.0.1:8000/api/salas', { headers })
    salas.value = response.data || []
  } catch (error) {
    console.error('Error al cargar salas:', error)
  }
}

const generarReporte = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const params = {}
    Object.keys(filtros.value).forEach(key => {
      if (filtros.value[key] !== null && filtros.value[key] !== '') {
        params[key] = filtros.value[key]
      }
    })
    
    const response = await axios.get('http://127.0.0.1:8000/api/reportes/reservas-por-usuario', { 
      params,
      headers 
    })
    
    // Manejar diferentes formatos de respuesta
    if (response.data.data) {
      reporteData.value = response.data.data.reservas || response.data.data
      estadisticas.value = response.data.data.estadisticas || {
        total_reservas: reporteData.value.length,
        reservas_confirmadas: reporteData.value.filter(r => r.estado === 'confirmada').length,
        reservas_pendientes: reporteData.value.filter(r => r.estado === 'pendiente').length,
        reservas_canceladas: reporteData.value.filter(r => r.estado === 'cancelada').length
      }
    } else {
      reporteData.value = response.data.reservas || response.data
      estadisticas.value = response.data.estadisticas || {
        total_reservas: reporteData.value.length,
        reservas_confirmadas: reporteData.value.filter(r => r.estado === 'confirmada').length,
        reservas_pendientes: reporteData.value.filter(r => r.estado === 'pendiente').length,
        reservas_canceladas: reporteData.value.filter(r => r.estado === 'cancelada').length
      }
    }
    
    ElMessage.success('Reporte generado correctamente')
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte')
    reporteData.value = []
    estadisticas.value = {
      total_reservas: 0,
      reservas_confirmadas: 0,
      reservas_pendientes: 0,
      reservas_canceladas: 0
    }
  } finally {
    loading.value = false
  }
}

const exportarExcel = async () => {
  exporting.value = true
  try {
    // Implementar exportación a Excel
    ElMessage.info('Función de exportación a Excel en desarrollo')
  } catch (error) {
    ElMessage.error('Error al exportar')
  } finally {
    exporting.value = false
  }
}

const exportarPDF = async () => {
  exporting.value = true
  try {
    // Implementar exportación a PDF
    ElMessage.info('Función de exportación a PDF en desarrollo')
  } catch (error) {
    ElMessage.error('Error al exportar')
  } finally {
    exporting.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('es-ES')
}

const getEstadoType = (estado) => {
  switch (estado) {
    case 'confirmada': return 'success'
    case 'pendiente': return 'warning'
    case 'cancelada': return 'danger'
    default: return 'info'
  }
}

onMounted(() => {
  loadUsuarios()
  loadSalas()
})
</script>

<style scoped>
.reporte-usuario {
  padding: 20px;
}

.filters-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 20px;
}

.results-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.actions {
  display: flex;
  gap: 10px;
}

.stats-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.no-data {
  background: white;
  padding: 40px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .stat-item {
    margin-bottom: 15px;
  }
}
</style>
