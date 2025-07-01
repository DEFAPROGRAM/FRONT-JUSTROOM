<template>
  <div class="reporte-listados">
    <div class="filtros-section mb-4">
      <h4>Seleccionar Tipos de Datos</h4>
      <el-checkbox-group v-model="camposSeleccionados">
        <el-checkbox v-for="campo in camposDisponibles" :key="campo.value" :label="campo.value">
          {{ campo.label }}
        </el-checkbox>
      </el-checkbox-group>

      <div class="mt-4">
        <el-button type="primary" @click="generarReporte" :disabled="!camposSeleccionados.length">
          Generar Reporte
        </el-button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-section">
      <el-loading />
    </div>

    <!-- Resultados -->
    <div v-else-if="datosReporte && datosReporte.length > 0" class="resultados-section">
      <div class="header-resultados">
        <h4>Reporte Personalizado</h4>
        <div class="acciones">
          <el-button type="primary" @click="exportarExcel">
            <i class="fas fa-file-excel me-2"></i>
            Exportar Excel
          </el-button>
          <el-button type="warning" @click="exportarPDF">
            <i class="fas fa-file-pdf me-2"></i>
            Exportar PDF
          </el-button>
        </div>
      </div>

      <div class="resumen-stats">
        <el-card class="stat-card">
          <div class="stat-number">{{ datosReporte.length }}</div>
          <div class="stat-label">Total de Registros</div>
        </el-card>
      </div>

      <!-- Tabla dinámica -->
      <el-table :data="datosReporte" style="width: 100%" v-loading="loading" class="reporte-table">
        <el-table-column
          v-for="(columna, index) in columnasSeleccionadas"
          :key="index"
          :prop="columna.prop"
          :label="columna.label"
          min-width="150"
        />
      </el-table>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-else-if="!loading && camposSeleccionados.length" class="no-data">
      <el-empty description="No se encontraron datos para los campos seleccionados" />
    </div>

    <!-- Mensaje inicial -->
    <div v-else-if="!loading && !camposSeleccionados.length" class="no-data">
      <el-empty description="Seleccione al menos un tipo de datos para comenzar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
// @ts-ignore
import jsPDF from 'jspdf'
// @ts-ignore
import autoTable from 'jspdf-autotable'
// @ts-ignore
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { logoJustroomBase64, logoInstitucionalBase64 } from '@/assets/logosBase64'

const emit = defineEmits(['close', 'export'])

const camposSeleccionados = ref<string[]>([])
const loading = ref(false)
const datosReporte = ref<any[]>([])
const sedes = ref<any[]>([])
const juzgados = ref<any[]>([])
const salas = ref<any[]>([])
const users = ref<any[]>([])
const tipoSeleccionado = ref('')
const camposDisponibles = [
  { label: 'Salas', value: 'salas' },
  { label: 'Sedes', value: 'sedes' },
  { label: 'Juzgados', value: 'juzgados' },
  { label: 'Usuarios', value: 'usuarios' },
  { label: 'Reservas', value: 'reservas' }
]

// Definición de columnas para cada tipo
const columnasConfig = {
  salas: [
    { prop: 'nom_sala', label: 'Nombre Sala' },
    { prop: 'capacidad', label: 'Capacidad' },
    { prop: 'nom_sede', label: 'Sede' }
  ],
  sedes: [
    { prop: 'nom_sede', label: 'Nombre Sede' },
    { prop: 'direccion', label: 'Dirección' },
    { prop: 'municipio', label: 'Municipio' }
  ],
  juzgados: [
    { prop: 'nom_juzgado', label: 'Nombre Juzgado' },
    { prop: 'nom_sede', label: 'Sede' }
  ],
  usuarios: [
    { prop: 'nombres', label: 'Nombres' },
    { prop: 'apellidos', label: 'Apellidos' },
    { prop: 'email', label: 'Email' },
    { prop: 'cargo', label: 'Cargo' },
    { prop: 'nom_sede', label: 'Sede' },
    { prop: 'nom_juzgado', label: 'Juzgado' },
    { prop: 'rol', label: 'Rol' }
  ],
  reservas: [
    { prop: 'descripcion', label: 'Descripción' },
    { prop: 'fecha', label: 'Fecha' },
    { prop: 'hora_inicio', label: 'Hora Inicio' },
    { prop: 'hora_fin', label: 'Hora Fin' },
    { prop: 'estado', label: 'Estado' },
    { prop: 'nom_sala', label: 'Sala' },
    { prop: 'usuario', label: 'Usuario' },
    { prop: 'nom_juzgado', label: 'Juzgado' },
    { prop: 'nom_sede', label: 'Sede' }
  ]
}

const columnasSeleccionadas = computed(() => {
  return camposSeleccionados.value
    .map(campo => columnasConfig[campo])
    .flat()
    .filter((columna, index, self) => 
      self.findIndex(c => c.prop === columna.prop) === index
    )
})

const generarReporte = async () => {
  if (!camposSeleccionados.value.length) {
    ElMessage.warning('Por favor seleccione al menos un tipo de datos')
    return
  }

  loading.value = true
  datosReporte.value = []
  
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // Obtener datos de cada endpoint según los campos seleccionados
    const promises: Promise<any>[] = []
    const resultados = {}
    
    if (camposSeleccionados.value.includes('salas')) {
      promises.push(axios.get('http://127.0.0.1:8000/api/salas', { headers }))
    }
    if (camposSeleccionados.value.includes('sedes')) {
      promises.push(axios.get('http://127.0.0.1:8000/api/sedes', { headers }))
    }
    if (camposSeleccionados.value.includes('juzgados')) {
      promises.push(axios.get('http://127.0.0.1:8000/api/juzgados', { headers }))
    }
    if (camposSeleccionados.value.includes('usuarios')) {
      promises.push(axios.get('http://127.0.0.1:8000/api/users', { headers }))
    }
    if (camposSeleccionados.value.includes('reservas')) {
      promises.push(axios.get('http://127.0.0.1:8000/api/reservas', { headers }))
    }
    
    const responses = await Promise.all(promises)
    
    // Procesar las respuestas
    let index = 0
    if (camposSeleccionados.value.includes('salas')) {
      const salasData = responses[index].data
      // Agregar información de sede a cada sala
      const salasConSede = salasData.map(sala => {
        const sede = sedes.value.find(s => s.id_sede === sala.id_sede)
        return {
          ...sala,
          nom_sede: sede ? sede.nom_sede : 'Sin sede'
        }
      })
      datosReporte.value.push(...salasConSede)
      index++
    }
    
    if (camposSeleccionados.value.includes('sedes')) {
      datosReporte.value.push(...responses[index].data)
      index++
    }
    
    if (camposSeleccionados.value.includes('juzgados')) {
      const juzgadosData = responses[index].data
      // Agregar información de sede a cada juzgado
      const juzgadosConSede = juzgadosData.map(juzgado => {
        const sede = sedes.value.find(s => s.id_sede === juzgado.id_sede)
        return {
          ...juzgado,
          nom_sede: sede ? sede.nom_sede : 'Sin sede'
        }
      })
      datosReporte.value.push(...juzgadosConSede)
      index++
    }
    
    if (camposSeleccionados.value.includes('usuarios')) {
      const usersData = responses[index].data.data || responses[index].data
      // Agregar información de sede y juzgado a cada usuario
      const usersConInfo = usersData.map(user => {
        const sede = sedes.value.find(s => s.id_sede === user.id_sede)
        const juzgado = juzgados.value.find(j => j.id_juzgado === user.id_juzgado)
        return {
          ...user,
          nom_sede: sede ? sede.nom_sede : 'Sin sede',
          nom_juzgado: juzgado ? juzgado.nom_juzgado : 'Sin juzgado'
        }
      })
      datosReporte.value.push(...usersConInfo)
      index++
    }
    
    if (camposSeleccionados.value.includes('reservas')) {
      const reservasData = responses[index].data.data || responses[index].data
      // Agregar información de sala, usuario, juzgado y sede a cada reserva
      const reservasConInfo = reservasData.map(reserva => {
        const sala = salas.value.find(s => s.id_sala === reserva.id_sala)
        const user = users.value.find(u => u.id === reserva.id_usuario)
        
        // Obtener información de juzgado y sede del usuario
        let nom_juzgado = 'Sin juzgado'
        let nom_sede = 'Sin sede'
        
        if (user) {
          const juzgado = juzgados.value.find(j => j.id_juzgado === user.id_juzgado)
          const sede = sedes.value.find(s => s.id_sede === user.id_sede)
          nom_juzgado = juzgado ? juzgado.nom_juzgado : 'Sin juzgado'
          nom_sede = sede ? sede.nom_sede : 'Sin sede'
        }
        
        return {
          ...reserva,
          nom_sala: sala ? sala.nom_sala : 'Sin sala',
          usuario: user ? `${user.nombres || ''} ${user.apellidos || ''}`.trim() : 'Sin usuario',
          nom_juzgado: nom_juzgado,
          nom_sede: nom_sede
        }
      })
      datosReporte.value.push(...reservasConInfo)
    }

    ElMessage.success('Reporte generado exitosamente')
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte. Verifique que el servidor backend esté funcionando.')
    datosReporte.value = []
  } finally {
    loading.value = false
  }
}

// Cargar datos de referencia para relaciones
const cargarDatosReferencia = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // Usar el proxy de Vite para las llamadas al backend
    const sedesResponse = await axios.get('http://127.0.0.1:8000/api/sedes', { headers })
    sedes.value = Array.isArray(sedesResponse.data) ? sedesResponse.data : []
    
    const juzgadosResponse = await axios.get('http://127.0.0.1:8000/api/juzgados', { headers })
    juzgados.value = Array.isArray(juzgadosResponse.data) ? juzgadosResponse.data : []
    
    const salasResponse = await axios.get('http://127.0.0.1:8000/api/salas', { headers })
    salas.value = Array.isArray(salasResponse.data) ? salasResponse.data : []
    
    const usersResponse = await axios.get('http://127.0.0.1:8000/api/users', { headers })
    const userData = usersResponse.data.data || usersResponse.data
    users.value = Array.isArray(userData) ? userData : []
    
    console.log('Datos de referencia cargados:', {
      sedes: sedes.value.length,
      juzgados: juzgados.value.length,
      salas: salas.value.length,
      users: users.value.length
    })
  } catch (error) {
    console.error('Error al cargar datos de referencia:', error)
  }
}

const getTituloReporte = () => {
  if (camposSeleccionados.value.length === 0) return 'Reporte';
  // Convertir los valores seleccionados a sus labels
  const labels = camposSeleccionados.value.map(val => {
    const campo = camposDisponibles.find(c => c.value === val)
    return campo ? campo.label : val
  })
  return `Reporte Listado de ${labels.join(', ')}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES')
}

const formatEstado = (estado) => {
  if (!estado) return ''
  return estado.charAt(0).toUpperCase() + estado.slice(1)
}

const getUserFullName = (user) => {
  if (!user) return 'Sin usuario asignado'
  return `${user.nombres || ''} ${user.apellidos || ''}`.trim() || 'Usuario sin nombre'
}

const exportarExcel = () => {
  if (!datosReporte.value.length) {
    ElMessage.warning('No hay datos para exportar')
    return
  }

  try {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Obtener el título del reporte
    const titulo = getTituloReporte()
    
    // Crear la hoja de datos
    const ws = XLSX.utils.json_to_sheet(datosReporte.value)
    
    // Agregar el título en la primera fila
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
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
    
    // Generar el archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Descargar el archivo
    saveAs(data, `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('Archivo Excel exportado correctamente')
  } catch (error) {
    console.error('Error al exportar Excel:', error)
    ElMessage.error('Error al exportar el archivo Excel')
  }
}

const exportarPDF = async () => {
  if (!datosReporte.value.length) {
    ElMessage.warning('No hay datos para exportar')
    return
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Colores institucionales
    const azul = '#205493'
    const azulRGB = [32, 84, 147]
    const blanco = '#FFFFFF'
    const gris = '#F5F6FA'

    // Fondo superior azul
    doc.setFillColor(azul)
    doc.rect(0, 0, pageWidth, 120, 'F')

    // Título dinámico
    const tituloReporte = getTituloReporte()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(255,255,255)
    doc.text(tituloReporte, pageWidth/2, 60, { align: 'center' })

    // Subtítulo barra azul
    doc.setFillColor(azul)
    doc.rect(0, 120, pageWidth, 30, 'F')
    doc.setFontSize(14)
    doc.setTextColor(255,255,255)
    doc.text('Sistema de Reservas y Prestamos de Salas de Audiencias', pageWidth/2, 140, { align: 'center' })

    // Área blanca para la tabla
    doc.setFillColor(blanco)
    doc.rect(0, 150, pageWidth, pageHeight-230, 'F')

    // Preparar datos para la tabla
    const headers = columnasSeleccionadas.value.map(col => col.label)
    const data = datosReporte.value.map(row =>
      columnasSeleccionadas.value.map(col => {
        const value = row[col.prop]
        if (value === null || value === undefined) return ''
        return String(value)
      })
    )

    // Tabla con encabezado azul
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

    // Pie de página azul
    doc.setFillColor(azul)
    doc.rect(0, pageHeight-80, pageWidth, 80, 'F')

    // Texto institucional
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(255,255,255)
    doc.text('Rama Judicial - Seccional Cartagena Área de Sistemas', pageWidth/2, pageHeight-50, { align: 'center' })
    doc.text('Calle del Cuartel, Cra 5 # 36-29 piso 2', pageWidth/2, pageHeight-30, { align: 'center' })

    // Guardar PDF
    doc.save(`${tituloReporte.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    ElMessage.success('Archivo PDF exportado correctamente')
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    ElMessage.error('Error al exportar el archivo PDF: ' + error.message)
  }
}

// Cargar datos de referencia al montar el componente
onMounted(() => {
  console.log('ReporteListados componente montado') // Debug log
  cargarDatosReferencia()
})
</script>

<style scoped>
.reporte-listados {
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

.no-data {
  text-align: center;
  padding: 40px;
}

.loading-section {
  text-align: center;
  padding: 40px;
}

.reporte-table {
  border-radius: 10px;
  overflow: hidden;
  margin-top: 20px;
  min-height: 400px;
}

:deep(.el-table) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-table__body-wrapper) {
  min-height: 300px;
}

:deep(.el-table__empty-block) {
  min-height: 300px;
}

/* Ocultar columnas vacías */
:deep(.el-table__header-wrapper th:empty),
:deep(.el-table__body-wrapper td:empty) {
  display: none;
}
</style> 