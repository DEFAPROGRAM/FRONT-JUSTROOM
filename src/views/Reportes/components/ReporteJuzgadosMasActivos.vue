<template>
  <div class="reporte-juzgados-mas-activos">
    <div class="filtros-section mb-4">
      <h4>Juzgados que más reservas han hecho</h4>
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
        <div class="col-md-4 d-flex align-items-end">
          <el-button type="primary" @click="generarReporte" :loading="loading">
            <i class="fas fa-search me-2"></i>
            Generar Reporte
          </el-button>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading-section">
      <el-loading />
    </div>
    <div v-else-if="ranking.length" class="resultados-section">
      <div class="header-resultados">
        <h4>Ranking de Juzgados más Activos</h4>
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
      <el-table :data="ranking" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="Ranking" width="80" />
        <el-table-column prop="nom_juzgado" label="Juzgado" width="200" />
        <el-table-column prop="nom_sede" label="Sede" width="200" />
        <el-table-column prop="total_reservas" label="Total Reservas" width="120" />
        <el-table-column prop="salas" label="Salas Reservadas" :formatter="formatSalas" />
      </el-table>
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
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const filtros = reactive({
  fecha_inicio: '',
  fecha_fin: ''
})
const loading = ref(false)
const ranking = ref([])

const generarReporte = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    // Obtener reservas, juzgados, sedes y salas
    const [reservasRes, juzgadosRes, sedesRes, salasRes, usersRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/reservas', { headers }),
      axios.get('http://127.0.0.1:8000/api/juzgados', { headers }),
      axios.get('http://127.0.0.1:8000/api/sedes', { headers }),
      axios.get('http://127.0.0.1:8000/api/salas', { headers }),
      axios.get('http://127.0.0.1:8000/api/users', { headers })
    ])
    let reservas = reservasRes.data.data || reservasRes.data
    const juzgados = juzgadosRes.data
    const sedes = sedesRes.data
    const salas = salasRes.data
    const users = usersRes.data.data || usersRes.data
    // Filtrar por fechas
    if (filtros.fecha_inicio) {
      reservas = reservas.filter(r => new Date(r.fecha) >= new Date(filtros.fecha_inicio))
    }
    if (filtros.fecha_fin) {
      reservas = reservas.filter(r => new Date(r.fecha) <= new Date(filtros.fecha_fin))
    }
    // Agrupar reservas por juzgado
    const agrupado = {}
    reservas.forEach(r => {
      const user = users.find(u => u.id === r.id_usuario)
      if (!user || !user.id_juzgado) return
      if (!agrupado[user.id_juzgado]) {
        agrupado[user.id_juzgado] = {
          id_juzgado: user.id_juzgado,
          total_reservas: 0,
          salas: new Set(),
          nom_juzgado: '',
          nom_sede: ''
        }
      }
      agrupado[user.id_juzgado].total_reservas++
      const sala = salas.find(s => s.id === r.id_sala || s.id_sala === r.id_sala)
      if (sala) agrupado[user.id_juzgado].salas.add(sala.nom_sala)
    })
    // Enriquecer con nombres
    Object.values(agrupado).forEach(j => {
      const juz = juzgados.find(juz => juz.id_juzgado === j.id_juzgado)
      j.nom_juzgado = juz ? juz.nom_juzgado : 'Sin nombre'
      const sede = juz && juz.id_sede ? sedes.find(s => s.id_sede === juz.id_sede) : null
      j.nom_sede = sede ? sede.nom_sede : 'Sin sede'
      j.salas = Array.from(j.salas)
    })
    // Ranking
    ranking.value = Object.values(agrupado).sort((a, b) => b.total_reservas - a.total_reservas)
    ElMessage.success('Reporte generado correctamente')
  } catch (error) {
    console.error('Error al generar reporte:', error)
    ElMessage.error('Error al generar el reporte')
    ranking.value = []
  } finally {
    loading.value = false
  }
}

const formatSalas = (row) => {
  return row.salas && row.salas.length ? row.salas.join(', ') : 'Sin salas'
}

const exportarExcel = () => {
  if (!ranking.value.length) {
    ElMessage.warning('No hay datos para exportar')
    return
  }
  try {
    const wb = XLSX.utils.book_new()
    const data = ranking.value.map(row => ({
      'Juzgado': row.nom_juzgado,
      'Sede': row.nom_sede,
      'Total Reservas': row.total_reservas,
      'Salas Reservadas': row.salas.join(', ')
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const titulo = 'Ranking de Juzgados más Activos'
    XLSX.utils.sheet_add_aoa(ws, [[titulo]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' })
    const range = XLSX.utils.decode_range(ws['!ref'])
    const newRange = {
      s: { r: range.s.r + 2, c: range.s.c },
      e: { r: range.e.r + 2, c: range.e.c }
    }
    ws['!ref'] = XLSX.utils.encode_range(newRange)
    XLSX.utils.book_append_sheet(wb, ws, 'Juzgados más activos')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `Ranking_Juzgados_Mas_Activos_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    ElMessage.success('Archivo Excel exportado correctamente')
  } catch (error) {
    console.error('Error al exportar Excel:', error)
    ElMessage.error('Error al exportar el archivo Excel')
  }
}

const exportarPDF = () => {
  if (!ranking.value.length) {
    ElMessage.warning('No hay datos para exportar')
    return
  }
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const azul = '#205493'
    const azulRGB = [32, 84, 147]
    const blanco = '#FFFFFF'
    const gris = '#F5F6FA'
    // Barra superior azul
    doc.setFillColor(azul)
    doc.rect(0, 0, pageWidth, 80, 'F')
    // Título
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(255,255,255)
    doc.text('Ranking de Juzgados más Activos', pageWidth/2, 50, { align: 'center' })
    // Subtítulo
    doc.setFillColor(azul)
    doc.rect(0, 80, pageWidth, 30, 'F')
    doc.setFontSize(13)
    doc.setTextColor(255,255,255)
    doc.text('Sistema de Reservas y Préstamos de Salas de Audiencias', pageWidth/2, 100, { align: 'center' })
    // Área blanca para la tabla
    doc.setFillColor(blanco)
    doc.rect(0, 110, pageWidth, pageHeight-190, 'F')
    // Tabla
    autoTable(doc, {
      head: [['Juzgado', 'Sede', 'Total Reservas', 'Salas Reservadas']],
      body: ranking.value.map(row => [row.nom_juzgado, row.nom_sede, row.total_reservas, row.salas.join(', ')]),
      startY: 130,
      margin: { left: 30, right: 30 },
      styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak', valign: 'middle', halign: 'center', minCellHeight: 18 },
      headStyles: { fillColor: azulRGB, textColor: 255, fontStyle: 'bold', fontSize: 11 },
      alternateRowStyles: { fillColor: gris },
      tableLineColor: azulRGB,
      tableLineWidth: 0.5
    })
    // Pie de página azul
    doc.setFillColor(azul)
    doc.rect(0, pageHeight-60, pageWidth, 60, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(255,255,255)
    doc.text('Rama Judicial - Seccional Cartagena Área de Sistemas', pageWidth/2, pageHeight-35, { align: 'center' })
    doc.text('Calle del Cuartel, Cra 5 # 36-29 piso 2', pageWidth/2, pageHeight-15, { align: 'center' })
    doc.save(`Ranking_Juzgados_Mas_Activos_${new Date().toISOString().split('T')[0]}.pdf`)
    ElMessage.success('Archivo PDF exportado correctamente')
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    ElMessage.error('Error al exportar el archivo PDF')
  }
}
</script> 