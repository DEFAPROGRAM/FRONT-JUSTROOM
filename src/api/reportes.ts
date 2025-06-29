import axios from 'axios'

export const apiReportes = {
  getEstadisticasGenerales: () => axios.get('http://127.0.0.1:8000/api/reportes/estadisticas'),
  getReportePersonalizado: (params: any) => axios.post('http://127.0.0.1:8000/api/reportes/personalizado', params),
  exportarExcel: (data: any) => axios.post('http://127.0.0.1:8000/api/reportes/export/excel', data, {
    responseType: 'blob'
  }),
  exportarPdf: (data: any) => axios.post('http://127.0.0.1:8000/api/reportes/export/pdf', data, {
    responseType: 'blob'
  })
}
