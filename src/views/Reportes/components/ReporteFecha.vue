<template>
  <div class="reporte-fecha">
    <div class="filtros-section mb-4">
      <h4>Filtros de Fecha y Hora</h4>
      <div class="row g-3">
        <div class="col-md-6">
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
        <div class="col-md-6">
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
        <div class="col-md-6">
          <el-form-item label="Hora Inicio">
            <el-time-picker
              v-model="filtros.hora_inicio"
              placeholder="Seleccione hora inicio"
              format="HH:mm"
              value-format="HH:mm"
            />
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="Hora Fin">
            <el-time-picker
              v-model="filtros.hora_fin"
              placeholder="Seleccione hora fin"
              format="HH:mm"
              value-format="HH:mm"
            />
          </el-form-item>
        </div>
      </div>
      <div class="acciones-filtros">
        <el-button type="primary" @click="generarReporte" :loading="loading">
          <i class="fas fa-search me-2"></i>
          Generar Reporte
        </el-button>
        <el-button type="success" @click="generarReporteSinFiltros" :loading="loading">
          <i class="fas fa-list me-2"></i>
          Ver Todas las Reservas
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
        <h4>Reservas por Fecha y Hora</h4>
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

      <div class="resumen-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-number">{{ datosReporte.total }}</div>
              <div class="stat-label">Total Reservas</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-number">{{ getReservasPorEstado('pendiente') }}</div>
              <div class="stat-label">Pendientes</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-number">{{ getReservasPorEstado('confirmada') }}</div>
              <div class="stat-label">Confirmadas</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-number">{{ getReservasPorEstado('cancelada') }}</div>
              <div class="stat-label">Canceladas</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- Tabla de reservas -->
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
        <el-table-column prop="sede.nom_sede" label="Sede" width="150" />
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="estado" label="Estado" width="120">
          <template #default="scope">
            <el-tag :type="getEstadoType(scope.row.estado)">
              {{ scope.row.estado }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Gráfico de distribución por fecha -->
      <div class="grafico-section mt-4">
        <h5>Distribución de Reservas por Fecha</h5>
        <div class="chart-container">
          <!-- Aquí se puede agregar un gráfico con Chart.js o similar -->
          <div class="placeholder-chart">
            <i class="fas fa-chart-line fa-3x text-muted"></i>
            <p>Gráfico de distribución temporal</p>
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { logoJustroomBase64, logoInstitucionalBase64 } from '@/assets/logosBase64'

const emit = defineEmits(['close', 'export'])

const filtros = reactive({
  fecha_inicio: '',
  fecha_fin: '',
  hora_inicio: '',
  hora_fin: ''
})

const datosReporte = ref(null)
const loading = ref(false)

const generarReporte = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // Obtener todas las reservas
    const response = await axios.get('http://127.0.0.1:8000/api/reservas', { headers })
    let reservas = response.data.data || response.data
    
    console.log('Todas las reservas obtenidas:', reservas.length)
    console.log('Filtros aplicados:', filtros)
    
    // Mostrar algunas reservas para depuración
    if (reservas.length > 0) {
      console.log('Ejemplo de reserva:', reservas[0])
    }
    
    // Filtrar por fecha y hora de manera robusta SOLO reservas completamente dentro del rango
    if (filtros.fecha_inicio || filtros.fecha_fin || filtros.hora_inicio || filtros.hora_fin) {
      reservas = reservas.filter(reserva => {
        // Combinar fecha y hora de la reserva
        const fechaReserva = reserva.fecha
        const horaInicioReserva = reserva.hora_inicio || '00:00'
        const horaFinReserva = reserva.hora_fin || '23:59'
        // Formato: 'YYYY-MM-DDTHH:mm'
        const inicioReserva = new Date(`${fechaReserva}T${horaInicioReserva}`)
        const finReserva = new Date(`${fechaReserva}T${horaFinReserva}`)

        // Combinar fecha y hora de los filtros
        const filtroFechaInicio = filtros.fecha_inicio ? filtros.fecha_inicio : fechaReserva
        const filtroHoraInicio = filtros.hora_inicio ? filtros.hora_inicio : '00:00'
        const filtroInicio = new Date(`${filtroFechaInicio}T${filtroHoraInicio}`)

        const filtroFechaFin = filtros.fecha_fin ? filtros.fecha_fin : fechaReserva
        const filtroHoraFin = filtros.hora_fin ? filtros.hora_fin : '23:59'
        const filtroFin = new Date(`${filtroFechaFin}T${filtroHoraFin}`)

        // SOLO reservas completamente dentro del rango
        return (
          inicioReserva >= filtroInicio && finReserva <= filtroFin
        )
      })
    }
    
    // Obtener información adicional de salas, usuarios, juzgados y sedes
    const [salasResponse, usersResponse, juzgadosResponse, sedesResponse] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/salas', { headers }),
      axios.get('http://127.0.0.1:8000/api/users', { headers }),
      axios.get('http://127.0.0.1:8000/api/juzgados', { headers }),
      axios.get('http://127.0.0.1:8000/api/sedes', { headers })
    ])
    
    const salas = salasResponse.data
    const users = usersResponse.data.data || usersResponse.data
    const juzgados = juzgadosResponse.data
    const sedes = sedesResponse.data
    
    // Enriquecer las reservas con información relacionada
    const reservasEnriquecidas = reservas.map(reserva => {
      const sala = salas.find(s => s.id_sala === reserva.id_sala)
      const user = users.find(u => u.id === reserva.id_usuario)
      const juzgado = user ? juzgados.find(j => j.id_juzgado === user.id_juzgado) : null
      const sede = user ? sedes.find(s => s.id_sede === user.id_sede) : null
      
      return {
        ...reserva,
        sala: sala || { nom_sala: 'Sin sala' },
        usuario: user || { nombres: 'Sin usuario', apellidos: '' },
        juzgado: juzgado || { nom_juzgado: 'Sin juzgado' },
        sede: sede || { nom_sede: 'Sin sede' }
      }
    })
    
    datosReporte.value = {
      total: reservasEnriquecidas.length,
      data: reservasEnriquecidas
    }
    
    ElMessage.success(`Se encontraron ${reservasEnriquecidas.length} reservas`)
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte. Verifique que el servidor backend esté funcionando.')
  } finally {
    loading.value = false
  }
}

const generarReporteSinFiltros = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // Obtener todas las reservas sin filtros
    const response = await axios.get('http://127.0.0.1:8000/api/reservas', { headers })
    let reservas = response.data.data || response.data
    
    console.log('Todas las reservas sin filtros:', reservas.length)
    if (reservas.length > 0) {
      console.log('Ejemplo de reserva:', reservas[0])
    }
    
    // Obtener información adicional de salas, usuarios, juzgados y sedes
    const [salasResponse, usersResponse, juzgadosResponse, sedesResponse] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/salas', { headers }),
      axios.get('http://127.0.0.1:8000/api/users', { headers }),
      axios.get('http://127.0.0.1:8000/api/juzgados', { headers }),
      axios.get('http://127.0.0.1:8000/api/sedes', { headers })
    ])
    
    const salas = salasResponse.data
    const users = usersResponse.data.data || usersResponse.data
    const juzgados = juzgadosResponse.data
    const sedes = sedesResponse.data
    
    // Enriquecer las reservas con información relacionada
    const reservasEnriquecidas = reservas.map(reserva => {
      const sala = salas.find(s => s.id_sala === reserva.id_sala)
      const user = users.find(u => u.id === reserva.id_usuario)
      const juzgado = user ? juzgados.find(j => j.id_juzgado === user.id_juzgado) : null
      const sede = user ? sedes.find(s => s.id_sede === user.id_sede) : null
      
      return {
        ...reserva,
        sala: sala || { nom_sala: 'Sin sala' },
        usuario: user || { nombres: 'Sin usuario', apellidos: '' },
        juzgado: juzgado || { nom_juzgado: 'Sin juzgado' },
        sede: sede || { nom_sede: 'Sin sede' }
      }
    })
    
    datosReporte.value = {
      total: reservasEnriquecidas.length,
      data: reservasEnriquecidas
    }
    
    ElMessage.success(`Se encontraron ${reservasEnriquecidas.length} reservas (sin filtros)`)
  } catch (error) {
    console.error('Error al generar reporte sin filtros:', error)
    ElMessage.error('Error al generar el reporte. Verifique que el servidor backend esté funcionando.')
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  filtros.fecha_inicio = ''
  filtros.fecha_fin = ''
  filtros.hora_inicio = ''
  filtros.hora_fin = ''
  datosReporte.value = null
}

const getReservasPorEstado = (estado) => {
  if (!datosReporte.value?.data) return 0
  return datosReporte.value.data.filter(r => r.estado === estado).length
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
  if (!datosReporte.value?.data?.length) {
    ElMessage.warning('No hay datos para exportar')
    return
  }

  try {
    // Importar XLSX dinámicamente
    import('xlsx').then(XLSX => {
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new()
      
      // Preparar los datos para la hoja
      const data = datosReporte.value.data.map(row => ({
        'Fecha': formatDate(row.fecha),
        'Hora Inicio': row.hora_inicio,
        'Hora Fin': row.hora_fin,
        'Sala': row.sala?.nom_sala || '',
        'Usuario': `${row.usuario?.nombres || ''} ${row.usuario?.apellidos || ''}`.trim(),
        'Juzgado': row.juzgado?.nom_juzgado || '',
        'Sede': row.sede?.nom_sede || '',
        'Descripción': row.descripcion || '',
        'Estado': row.estado || ''
      }))
      
      // Crear la hoja de datos
      const ws = XLSX.utils.json_to_sheet(data)
      
      // Agregar el título en la primera fila
      const titulo = 'Reporte de Reservas por Fecha'
      XLSX.utils.sheet_add_aoa(ws, [[titulo]], { origin: 'A1' })
      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' }) // Fila vacía
      
      // Mover los datos hacia abajo para dejar espacio al título
      const range = XLSX.utils.decode_range(ws['!ref'])
      const newRange = {
        s: { r: range.s.r + 2, c: range.s.c },
        e: { r: range.e.r + 2, c: range.e.c }
      }
      ws['!ref'] = XLSX.utils.encode_range(newRange)
      
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Reservas por Fecha')
      
      // Generar el archivo
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // Descargar el archivo
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `Reporte_Reservas_Fecha_${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      
      ElMessage.success('Archivo Excel exportado correctamente')
    }).catch(error => {
      console.error('Error al cargar XLSX:', error)
      ElMessage.error('Error al exportar Excel: No se pudo cargar la librería')
    })
  } catch (error) {
    console.error('Error al exportar Excel:', error)
    ElMessage.error('Error al exportar el archivo Excel')
  }
}

const exportarPDF = async () => {
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
    doc.text('Reporte Listado de Reservas por Fecha', pageWidth/2, 60, { align: 'center' })
    
    doc.setFillColor(azul)
    doc.rect(0, 120, pageWidth, 30, 'F')
    doc.setFontSize(14)
    doc.setTextColor(255,255,255)
    doc.text('Sistema de Reservas y Prestamos de Salas de Audiencias', pageWidth/2, 140, { align: 'center' })
    
    doc.setFillColor(blanco)
    doc.rect(0, 150, pageWidth, pageHeight-230, 'F')
    
    // Encabezados y datos de la tabla
    const headers = [
      'Fecha', 'Hora Inicio', 'Hora Fin', 'Sala', 'Usuario', 'Juzgado', 'Sede', 'Descripción', 'Estado'
    ]
    const data = (datosReporte.value?.data || []).map(row => [
      formatDate(row.fecha),
      row.hora_inicio,
      row.hora_fin,
      row.sala?.nom_sala || '',
      `${row.usuario?.nombres || ''} ${row.usuario?.apellidos || ''}`,
      row.juzgado?.nom_juzgado || '',
      row.sede?.nom_sede || '',
      row.descripcion,
      row.estado
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
    
    doc.save(`Reporte_Listado_Reservas_Fecha_${new Date().toISOString().split('T')[0]}.pdf`)
    ElMessage.success('Archivo PDF exportado correctamente')
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    ElMessage.error('Error al exportar el archivo PDF: ' + error.message)
  }
}
</script>

<style scoped>
.reporte-fecha {
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
  color: #667eea;
}

.stat-label {
  color: #666;
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
</style> 