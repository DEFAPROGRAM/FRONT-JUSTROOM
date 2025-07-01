<template>
  <div class="reporte-usuario">
    <div class="filters-section">
      <h4 class="section-title">
        <i class="fas fa-filter me-2"></i>
        Buscar Usuario
      </h4>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nombre del Usuario</label>
          <el-autocomplete
            v-model="usuarioBusqueda"
            :fetch-suggestions="buscarUsuarios"
            placeholder="Escriba el nombre o apellido"
            @select="seleccionarUsuario"
            class="w-100"
            clearable
          />
        </div>
        <div class="col-md-6 d-flex align-items-end">
          <el-button 
            type="primary" 
            @click="generarReporte"
            :loading="loading"
            class="w-100"
            :disabled="!usuarioSeleccionado"
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { logoJustroomBase64, logoInstitucionalBase64 } from '@/assets/logosBase64'

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

const usuarioBusqueda = ref('')
const usuarioSeleccionado = ref(null)

const buscarUsuarios = (queryString, cb) => {
  const results = usuarios.value.filter(u => {
    const nombreCompleto = `${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase()
    return nombreCompleto.includes(queryString.toLowerCase())
  })
  cb(results.map(u => ({ value: `${u.nombres || ''} ${u.apellidos || ''}`, id: u.id })))
}

const seleccionarUsuario = (item) => {
  usuarioSeleccionado.value = usuarios.value.find(u => u.id === item.id)
}

const generarReporte = async () => {
  if (!usuarioSeleccionado.value) {
    ElMessage.warning('Seleccione un usuario')
    return
  }
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    // Obtener todas las reservas
    const response = await axios.get('http://127.0.0.1:8000/api/reservas', { headers })
    let reservas = response.data.data || response.data
    // Filtrar solo por usuario seleccionado
    reservas = reservas.filter(r => r.id_usuario === usuarioSeleccionado.value.id)
    // Enriquecer reservas con info de usuario y sala
    const salasResponse = await axios.get('http://127.0.0.1:8000/api/salas', { headers })
    const salasList = salasResponse.data
    reporteData.value = reservas.map(r => ({
      ...r,
      usuario: usuarioSeleccionado.value,
      sala: salasList.find(s => s.id === r.id_sala) || {}
    }))
    calcularEstadisticas()
    ElMessage.success(`Se encontraron ${reporteData.value.length} reservas`)
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte')
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
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const azul = '#205493'
    const azulRGB = [32, 84, 147]
    const blanco = '#FFFFFF'
    const gris = '#F5F6FA'
    
    doc.setFillColor(azul)
    doc.rect(0, 0, pageWidth, 120, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(255,255,255)
    doc.text('Reporte Listado de Reservas por Usuario', pageWidth/2, 60, { align: 'center' })
    
    doc.setFillColor(azul)
    doc.rect(0, 120, pageWidth, 30, 'F')
    doc.setFontSize(14)
    doc.setTextColor(255,255,255)
    doc.text('Sistema de Reservas y Prestamos de Salas de Audiencias', pageWidth/2, 140, { align: 'center' })
    
    doc.setFillColor(blanco)
    doc.rect(0, 150, pageWidth, pageHeight-230, 'F')
    
    // Encabezados y datos de la tabla
    const headers = [
      'Usuario', 'Sala', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Motivo', 'Estado', 'Fecha Creación'
    ]
    const data = reporteData.value.map(row => [
      `${row.usuario?.nombres || ''} ${row.usuario?.apellidos || ''}`,
      row.sala?.nom_sala || '',
      formatDate(row.fecha),
      row.hora_inicio,
      row.hora_fin,
      row.motivo,
      row.estado,
      formatDateTime(row.created_at)
    ])
    
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 170,
      margin: { left: 30, right: 30 },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'center',
        minCellHeight: 18
      },
      headStyles: {
        fillColor: azulRGB,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: gris
      },
      tableLineColor: azulRGB,
      tableLineWidth: 0.5
    })
    
    doc.setFillColor(azul)
    doc.rect(0, pageHeight-80, pageWidth, 80, 'F')
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(255,255,255)
    doc.text('Rama Judicial - Seccional Cartagena Área de Sistemas', pageWidth/2, pageHeight-50, { align: 'center' })
    doc.text('Calle del Cuartel, Cra 5 # 36-29 piso 2', pageWidth/2, pageHeight-30, { align: 'center' })
    
    doc.save(`Reporte_Listado_Reservas_Usuario_${new Date().toISOString().split('T')[0]}.pdf`)
    ElMessage.success('Archivo PDF exportado correctamente')
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    ElMessage.error('Error al exportar el archivo PDF: ' + error.message)
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

const calcularEstadisticas = () => {
  estadisticas.value = {
    total_reservas: reporteData.value.length,
    reservas_confirmadas: reporteData.value.filter(r => r.estado === 'confirmada').length,
    reservas_pendientes: reporteData.value.filter(r => r.estado === 'pendiente').length,
    reservas_canceladas: reporteData.value.filter(r => r.estado === 'cancelada').length
  }
}

onMounted(async () => {
  // Cargar todos los usuarios al iniciar
  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await axios.get('http://127.0.0.1:8000/api/users', { headers })
  usuarios.value = response.data.data || response.data
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
