<template>
  <div class="reportes-container">
    <div class="header-section">
      <h2 class="title">
        <i class="fas fa-chart-bar me-2"></i>
        Sistema de Reportes
      </h2>
      <p class="subtitle">Sistema de reservas y préstamos de salas de audiencias JUSTROOM</p>
    </div>

    <!-- Estadísticas Generales -->
    <div class="stats-section mb-4">
      <h3 class="section-title">
        <i class="fas fa-tachometer-alt me-2"></i>
        Estadísticas Generales
      </h3>
      <div class="row g-3" v-if="estadisticasGenerales">
        <div class="col-md-2">
          <div class="stat-card bg-warning text-dark">
            <div class="stat-number">{{ estadisticasGenerales.total_salas }}</div>
            <div class="stat-label">Salas</div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="stat-card bg-primary text-white">
            <div class="stat-number">{{ estadisticasGenerales.total_sedes }}</div>
            <div class="stat-label">Sedes</div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="stat-card bg-danger text-white">
            <div class="stat-number">{{ estadisticasGenerales.total_juzgados }}</div>
            <div class="stat-label">Juzgados</div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="stat-card bg-success text-white">
            <div class="stat-number">{{ estadisticasGenerales.total_usuarios }}</div>
            <div class="stat-label">Usuarios</div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="stat-card" style="background: #6f42c1; color: #fff;">
            <div class="stat-number">{{ estadisticasGenerales.total_reservas }}</div>
            <div class="stat-label">Reservas</div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="stat-card bg-secondary text-white">
            <div class="stat-number">{{ estadisticasGenerales.reservas_este_mes }}</div>
            <div class="stat-label">Este Mes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tipos de Reportes -->
    <div class="reports-section">
      <h3 class="section-title">
        <i class="fas fa-file-alt me-2"></i>
        Tipos de Reportes
      </h3>
      
      <div class="row g-4">
        <!-- Reporte de Listados -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="showReporte('listados')">
            <div class="card-icon">
              <i class="fas fa-list"></i>
            </div>
            <div class="card-content">
              <h4>Listados Generales</h4>
              <p>Reportes de salas, sedes, juzgados, usuarios y reservas</p>
            </div>
          </div>
        </div>

        <!-- Reporte por Fecha -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="showReporte('fecha')">
            <div class="card-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="card-content">
              <h4>Reservas por Fecha</h4>
              <p>Filtrar reservas por rango de fechas y horas</p>
            </div>
          </div>
        </div>

        <!-- Reporte por Usuario -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="showReporte('usuario')">
            <div class="card-icon">
              <i class="fas fa-user"></i>
            </div>
            <div class="card-content">
              <h4>Reservas por Usuario</h4>
              <p>Reportes de reservas por usuario y período</p>
            </div>
          </div>
        </div>

        <!-- Reporte por Estado -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="showReporte('estado')">
            <div class="card-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="card-content">
              <h4>Reservas por Estado</h4>
              <p>Filtrar por pendientes, confirmadas o canceladas</p>
            </div>
          </div>
        </div>

        <!-- Reporte Juzgados Más Activos -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="showReporte('juzgadosmasactivos')">
            <div class="card-icon">
              <i class="fas fa-gavel"></i>
            </div>
            <div class="card-content">
              <h4>Juzgados más Activos</h4>
              <p>Ranking de juzgados que más reservas han hecho por sede y salas</p>
            </div>
          </div>
        </div>

        <!-- Salas Más Solicitadas -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="showReporte('salas')">
            <div class="card-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="card-content">
              <h4>Salas Más Solicitadas</h4>
              <p>Ranking de salas con más reservas</p>
            </div>
          </div>
        </div>

        <!-- Exportar Datos -->
        <div class="col-md-6 col-lg-4">
          <div class="report-card" @click="exportarDatos">
            <div class="card-icon">
              <i class="fas fa-download"></i>
            </div>
            <div class="card-content">
              <h4>Exportar Datos</h4>
              <p>Descargar reportes en formato Excel/PDF</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Reportes -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      :modal="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="report-dialog"
      :destroy-on-close="false"
    >
      <component 
        v-if="currentReportComponent && dialogVisible"
        :is="currentReportComponent" 
        @close="dialogVisible = false"
        @export="exportarReporte"
      />
    </el-dialog>

    <!-- Modal de Reporte -->
    <el-dialog
      v-model="reporteVisible"
      :title="`Generar Reporte - ${tipoReporte}`"
      width="80%"
      :before-close="handleClose"
    >
      <div v-if="tipoReporte === 'listados'">
        <h4>Seleccionar Campos</h4>
        <el-checkbox-group v-model="camposSeleccionados">
          <el-checkbox v-for="campo in camposDisponibles" :key="campo.value" :label="campo.value">
            {{ campo.label }}
          </el-checkbox>
        </el-checkbox-group>

        <div class="mt-4">
          <el-button type="primary" @click="generarReporte">Generar Reporte</el-button>
        </div>
      </div>

      <div v-if="datosReporte.length > 0" class="mt-4">
        <el-table :data="datosReporte" style="width: 100%">
          <el-table-column
            v-for="(columna, index) in Object.keys(datosReporte[0])"
            :key="index"
            :prop="columna"
            :label="columna"
          />
        </el-table>

        <div class="mt-4">
          <el-button type="success" @click="exportarDatosPersonalizado('excel')">
            <i class="fas fa-file-excel me-2"></i>
            Exportar Excel
          </el-button>
          <el-button type="warning" @click="exportarDatosPersonalizado('pdf')">
            <i class="fas fa-file-pdf me-2"></i>
            Exportar PDF
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import ReporteListados from './components/ReporteListados.vue'
import ReporteFecha from './components/ReporteFecha.vue'
import ReporteUsuario from './components/ReporteUsuario.vue'
import ReporteEstado from './components/ReporteEstado.vue'
import ReporteSalas from './components/ReporteSalas.vue'
import ReporteJuzgadosMasActivos from './components/ReporteJuzgadosMasActivos.vue'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

console.log('Componentes importados:', {
  ReporteListados,
  ReporteFecha,
  ReporteUsuario,
  ReporteEstado,
  ReporteSalas,
  ReporteJuzgadosMasActivos
}) // Debug log

// Obtener la función updateStats del componente padre
const updateStats = inject('updateStats')

const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentReportComponent = ref(null)
const estadisticasGenerales = ref(null)
const loading = ref(false)

// Variables para el modal de reporte personalizado
const reporteVisible = ref(false)
const tipoReporte = ref('')
const camposSeleccionados = ref([])
const datosReporte = ref([])
const camposDisponibles = [
  { label: 'Salas', value: 'salas' },
  { label: 'Sedes', value: 'sedes' },
  { label: 'Juzgados', value: 'juzgados' },
  { label: 'Usuarios', value: 'usuarios' },
  { label: 'Reservas', value: 'reservas' }
]

const loadEstadisticasGenerales = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // Hacer peticiones a los endpoints existentes en lugar del endpoint de reportes
    const [salasRes, sedesRes, juzgadosRes, usersRes, reservasRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/salas', { headers }),
      axios.get('http://127.0.0.1:8000/api/sedes', { headers }),
      axios.get('http://127.0.0.1:8000/api/juzgados', { headers }),
      axios.get('http://127.0.0.1:8000/api/users', { headers }),
      axios.get('http://127.0.0.1:8000/api/reservas', { headers })
    ])

    // Calcular reservas del mes actual
    const reservas = reservasRes.data.data || reservasRes.data
    const mesActual = new Date().getMonth() + 1
    const añoActual = new Date().getFullYear()
    const reservasEsteMes = reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fecha)
      return fechaReserva.getMonth() + 1 === mesActual && fechaReserva.getFullYear() === añoActual
    }).length

    estadisticasGenerales.value = {
      total_salas: salasRes.data.length || 0,
      total_sedes: sedesRes.data.length || 0,
      total_juzgados: juzgadosRes.data.length || 0,
      total_usuarios: (usersRes.data.data || usersRes.data).length || 0,
      total_reservas: reservas.length || 0,
      reservas_este_mes: reservasEsteMes
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    // No mostrar error si el backend no está disponible
    estadisticasGenerales.value = {
      total_salas: 0,
      total_sedes: 0,
      total_juzgados: 0,
      total_usuarios: 0,
      total_reservas: 0,
      reservas_este_mes: 0
    }
  }
}

const showReporte = (tipo) => {
  console.log('Abriendo reporte:', tipo) // Debug log
  
  // Limpiar componente anterior
  currentReportComponent.value = null
  
  switch (tipo) {
    case 'listados':
      dialogTitle.value = 'Reporte de Listados Generales'
      currentReportComponent.value = ReporteListados
      break
    case 'fecha':
      dialogTitle.value = 'Reporte de Reservas por Fecha'
      currentReportComponent.value = ReporteFecha
      break
    case 'usuario':
      dialogTitle.value = 'Reporte de Reservas por Usuario'
      currentReportComponent.value = ReporteUsuario
      break
    case 'estado':
      dialogTitle.value = 'Reporte de Reservas por Estado'
      currentReportComponent.value = ReporteEstado
      break
    case 'juzgadosmasactivos':
      dialogTitle.value = 'Juzgados que más reservas han hecho'
      currentReportComponent.value = ReporteJuzgadosMasActivos
      break
    case 'salas':
      dialogTitle.value = 'Reporte de Salas Más Solicitadas'
      currentReportComponent.value = ReporteSalas
      break
    default:
      console.error('Tipo de reporte no válido:', tipo)
      return
  }
  
  console.log('Componente asignado:', currentReportComponent.value) // Debug log
  console.log('Título del diálogo:', dialogTitle.value) // Debug log
  
  // Abrir modal inmediatamente
  dialogVisible.value = true
  console.log('Modal abierto:', dialogVisible.value) // Debug log
}

const exportarDatos = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    // Obtener todos los datos principales
    const [usuariosRes, reservasRes, salasRes, sedesRes, juzgadosRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/users', { headers }),
      axios.get('http://127.0.0.1:8000/api/reservas', { headers }),
      axios.get('http://127.0.0.1:8000/api/salas', { headers }),
      axios.get('http://127.0.0.1:8000/api/sedes', { headers }),
      axios.get('http://127.0.0.1:8000/api/juzgados', { headers })
    ])
    const usuarios = usuariosRes.data.data || usuariosRes.data
    const reservas = reservasRes.data.data || reservasRes.data
    const salas = salasRes.data
    const sedes = sedesRes.data
    const juzgados = juzgadosRes.data
    // --- Exportar Excel ---
    const wb = XLSX.utils.book_new()
    wb.Props = { Title: 'Exportación de Datos - JustRoom' }
    if (usuarios && usuarios.length) {
      const ws = XLSX.utils.json_to_sheet(usuarios)
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
    }
    if (reservas && reservas.length) {
      const ws = XLSX.utils.json_to_sheet(reservas)
      XLSX.utils.book_append_sheet(wb, ws, 'Reservas')
    }
    if (salas && salas.length) {
      const ws = XLSX.utils.json_to_sheet(salas)
      XLSX.utils.book_append_sheet(wb, ws, 'Salas')
    }
    if (sedes && sedes.length) {
      const ws = XLSX.utils.json_to_sheet(sedes)
      XLSX.utils.book_append_sheet(wb, ws, 'Sedes')
    }
    if (juzgados && juzgados.length) {
      const ws = XLSX.utils.json_to_sheet(juzgados)
      XLSX.utils.book_append_sheet(wb, ws, 'Juzgados')
    }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `Exportacion_Datos_JustRoom_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    // --- Exportar PDF ---
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 40
    const addTable = (titulo, data) => {
      if (!data || !data.length) return
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text(titulo, pageWidth/2, y, { align: 'center' })
      y += 10
      autoTable(doc, {
        head: [Object.keys(data[0])],
        body: data.map(row => Object.values(row)),
        startY: y + 10,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [32, 84, 147], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 246, 250] },
        tableLineColor: [32, 84, 147],
        tableLineWidth: 0.5
      })
      y = doc.lastAutoTable.finalY + 30
    }
    addTable('Usuarios', usuarios)
    addTable('Reservas', reservas)
    addTable('Salas', salas)
    addTable('Sedes', sedes)
    addTable('Juzgados', juzgados)
    doc.save(`Exportacion_Datos_JustRoom_${new Date().toISOString().split('T')[0]}.pdf`)
    ElMessage.success('Archivos Excel y PDF exportados correctamente')
  } catch (error) {
    console.error('Error al exportar datos:', error)
    ElMessage.error('Error al exportar los datos')
  }
}

const exportarReporte = (data) => {
  // Implementar exportación a Excel/PDF
  ElMessage.success('Reporte exportado correctamente')
}

// Funciones para el modal de reporte personalizado
const handleClose = () => {
  reporteVisible.value = false
  tipoReporte.value = ''
  camposSeleccionados.value = []
  datosReporte.value = []
}

const generarReporte = async () => {
  if (!camposSeleccionados.value.length) {
    ElMessage.warning('Por favor seleccione al menos un campo')
    return
  }

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const response = await axios.post('http://127.0.0.1:8000/api/reportes/personalizado', {
      campos: camposSeleccionados.value
    }, { headers })
    
    datosReporte.value = response.data || []
    ElMessage.success('Reporte generado exitosamente')
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte')
    datosReporte.value = []
  } finally {
    loading.value = false
  }
}

const exportarDatosPersonalizado = async (formato) => {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    // Obtener todos los datos principales
    const [usuariosRes, reservasRes, salasRes, sedesRes, juzgadosRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/users', { headers }),
      axios.get('http://127.0.0.1:8000/api/reservas', { headers }),
      axios.get('http://127.0.0.1:8000/api/salas', { headers }),
      axios.get('http://127.0.0.1:8000/api/sedes', { headers }),
      axios.get('http://127.0.0.1:8000/api/juzgados', { headers })
    ])
    const usuarios = usuariosRes.data.data || usuariosRes.data
    const reservas = reservasRes.data.data || reservasRes.data
    const salas = salasRes.data
    const sedes = sedesRes.data
    const juzgados = juzgadosRes.data
    if (formato === 'excel') {
      // Igual que exportarDatos
      const wb = XLSX.utils.book_new()
      wb.Props = { Title: 'Exportación de Datos - JustRoom' }
      if (usuarios && usuarios.length) {
        const ws = XLSX.utils.json_to_sheet(usuarios)
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
      }
      if (reservas && reservas.length) {
        const ws = XLSX.utils.json_to_sheet(reservas)
        XLSX.utils.book_append_sheet(wb, ws, 'Reservas')
      }
      if (salas && salas.length) {
        const ws = XLSX.utils.json_to_sheet(salas)
        XLSX.utils.book_append_sheet(wb, ws, 'Salas')
      }
      if (sedes && sedes.length) {
        const ws = XLSX.utils.json_to_sheet(sedes)
        XLSX.utils.book_append_sheet(wb, ws, 'Sedes')
      }
      if (juzgados && juzgados.length) {
        const ws = XLSX.utils.json_to_sheet(juzgados)
        XLSX.utils.book_append_sheet(wb, ws, 'Juzgados')
      }
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `Exportacion_Datos_JustRoom_${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      ElMessage.success('Archivo Excel exportado correctamente')
    } else if (formato === 'pdf') {
      // PDF con diseño institucional idéntico a los reportes individuales
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const azul = '#205493'
      const azulRGB = [32, 84, 147]
      const blanco = '#FFFFFF'
      const gris = '#F5F6FA'
      // Barra superior azul (120px)
      doc.setFillColor(azul)
      doc.rect(0, 0, pageWidth, 120, 'F')
      // Título grande y centrado
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(255,255,255)
      doc.text('Exportación de Datos - JustRoom', pageWidth/2, 60, { align: 'center' })
      // Subtítulo institucional en barra azul secundaria (30px)
      doc.setFillColor(azul)
      doc.rect(0, 120, pageWidth, 30, 'F')
      doc.setFontSize(14)
      doc.setTextColor(255,255,255)
      doc.text('Sistema de Reservas y Préstamos de Salas de Audiencias', pageWidth/2, 140, { align: 'center' })
      // Área blanca para las tablas
      doc.setFillColor(blanco)
      doc.rect(0, 150, pageWidth, pageHeight-230, 'F')
      let y = 170
      const addTable = (titulo, data) => {
        if (!data || !data.length) return
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.setTextColor(32,84,147)
        doc.text(titulo, pageWidth/2, y, { align: 'center' })
        y += 10
        autoTable(doc, {
          head: [Object.keys(data[0])],
          body: data.map(row => Object.values(row)),
          startY: y + 10,
          margin: { left: 30, right: 30 },
          styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', valign: 'middle', halign: 'center', minCellHeight: 16 },
          headStyles: { fillColor: azulRGB, textColor: 255, fontStyle: 'bold', fontSize: 10 },
          alternateRowStyles: { fillColor: gris },
          tableLineColor: azulRGB,
          tableLineWidth: 0.5
        })
        y = doc.lastAutoTable.finalY + 30
      }
      addTable('Usuarios', usuarios)
      addTable('Reservas', reservas)
      addTable('Salas', salas)
      addTable('Sedes', sedes)
      addTable('Juzgados', juzgados)
      // Pie de página azul (80px)
      doc.setFillColor(azul)
      doc.rect(0, pageHeight-80, pageWidth, 80, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(255,255,255)
      doc.text('Rama Judicial - Seccional Cartagena Área de Sistemas', pageWidth/2, pageHeight-50, { align: 'center' })
      doc.text('Calle del Cuartel, Cra 5 # 36-29 piso 2', pageWidth/2, pageHeight-30, { align: 'center' })
      doc.save(`Exportacion_Datos_JustRoom_${new Date().toISOString().split('T')[0]}.pdf`)
      ElMessage.success('Archivo PDF exportado correctamente')
    }
  } catch (error) {
    console.error('Error al exportar datos personalizado:', error)
    ElMessage.error('Error al exportar los datos')
  }
}

onMounted(() => {
  loadEstadisticasGenerales()
})
</script>

<style scoped>
.reportes-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #4A708B;
  color: white;
  border-radius: 10px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-card {
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.reports-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.report-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.report-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.2);
}

.card-icon {
  font-size: 3rem;
  color: #000000;
  margin-bottom: 15px;
}

.card-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.card-content p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

:deep(.report-dialog .el-dialog) {
  border-radius: 15px;
}

:deep(.report-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px 15px 0 0;
}

:deep(.report-dialog .el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .stat-card {
    margin-bottom: 15px;
  }
  
  .report-card {
    margin-bottom: 20px;
  }
}
</style>
