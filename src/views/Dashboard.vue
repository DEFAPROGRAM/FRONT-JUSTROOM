<template>
  <div class="dashboard-container">
    <!-- Sidebar con accesos rápidos -->
    <div class="quick-access-sidebar" style="background-color: #4A708B;">
      <div class="logo-container mb-4">
        <img :src="logoUrl" alt="JUSTROOM Logo" class="logo-img">
      </div>
      <h5 class="sidebar-title" style="color: black; font-weight: bold;">
        <i class="fas fa-tasks me-2"></i>Accesos Rápidos
      </h5>
      <div class="sidebar-links" style="color: black;">
        <a href="#" class="sidebar-link" @click.prevent="currentModule = null" style="font-weight: bold;">
          <i class="fas fa-home fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Inicio</span>
        </a>
        <a href="#" class="sidebar-link" @click.prevent="showModule('sedes')">
          <i class="fas fa-building fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Administrar Sedes</span>
        </a>
        <a href="#" class="sidebar-link" @click.prevent="showModule('juzgados')">
          <i class="fas fa-gavel fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Administrar Juzgados</span>
        </a>
        <a href="#" class="sidebar-link" @click.prevent="showModule('salas')">
          <i class="fas fa-door-closed fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Administrar Salas</span>
        </a>
        <a href="#" class="sidebar-link" @click.prevent="showModule('reservas')">
          <i class="fas fa-calendar-plus fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Gestionar Reservas</span>
        </a>
        <a href="#" class="sidebar-link" @click.prevent="showModule('reportes')">
          <i class="fas fa-chart-bar fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Reportes</span>
        </a>
        <a href="#" class="sidebar-link" @click.prevent="showModule('users')">
          <i class="fas fa-users fa-lg" style="color: black; font-weight: bold;"></i>
          <span style="color: black; font-weight: bold;">Usuarios</span>
        </a>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content" style="background: linear-gradient(rgba(76, 180, 255, 0.1), rgba(76, 180, 255, 0.1)), url('/src/assets/sala.jpg'); background-size: cover; background-position: center; min-height: 100vh; position: relative;">
      <div class="overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(76, 180, 255, 0.05);"></div>
      <div class="card shadow-sm border-0" style="background-color: #87CEEB; position: relative; z-index: 1;">
        <div class="card-header" style="background-color: #87CEEB; color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <i class="fas fa-user me-2" style="color: white;"></i>
            <span style="color: white; font-size: 1.25rem; font-weight: bold;">Bienvenido, {{ userName }}</span>
          </div>
          <button @click="logout" class="btn" style="background-color: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-sign-out-alt me-2" style="color: white;"></i>
            Cerrar Sesión
          </button>
        </div>
        <div class="card-body">
          <!-- Contadores -->
          <div v-if="!currentModule" class="row g-4" style="background-color: #87CEEB; padding: 20px; border-radius: 10px;">
            <!-- Reservas -->
            <div class="col">
              <div class="card bg-success text-white shadow-sm h-100">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fas fa-calendar-check me-2"></i>Reservas
                  </h5>
                  <p class="display-4 mb-0">{{ stats.reservas || 0 }}</p>
                </div>
              </div>
            </div>
            <!-- Salas -->
            <div class="col">
              <div class="card bg-primary text-white shadow-sm h-100">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fas fa-door-open me-2"></i>Salas
                  </h5>
                  <p class="display-4 mb-0">{{ stats.salas || 0 }}</p>
                </div>
              </div>
            </div>
            <!-- Sedes -->
            <div class="col">
              <div class="card" style="background-color: #dc3545; color: white; border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 100%;">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fas fa-building me-2"></i>Sedes
                  </h5>
                  <p class="display-4 mb-0">{{ stats.sedes || 0 }}</p>
                </div>
              </div>
            </div>
            <!-- Juzgados -->
            <div class="col">
              <div class="card bg-warning text-white shadow-sm h-100">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fas fa-gavel me-2"></i>Juzgados
                  </h5>
                  <p class="display-4 mb-0">{{ stats.juzgados || 0 }}</p>
                </div>
              </div>
            </div>
            <!-- Usuarios -->
            <div class="col">
              <div class="card bg-purple text-white shadow-sm h-100">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fas fa-users me-2"></i>Usuarios
                  </h5>
                  <p class="display-4 mb-0">{{ stats.usuarios || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Módulos dinámicos -->
          <div v-else>
            <div class="mb-4">
              <h4 class="mb-0">{{ getTitulo }}</h4>
            </div>
            <component :is="currentModule"></component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, defineAsyncComponent, computed, provide } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
const logoUrl = new URL('../assets/JUSTROOM.png', import.meta.url).href

// Importación dinámica de componentes
const Sedes = defineAsyncComponent(() => import('./Sedes/Sedes.vue'))
const Juzgados = defineAsyncComponent(() => import('./Juzgados/Juzgados.vue'))
const Salas = defineAsyncComponent(() => import('./Salas/Salas.vue'))
const Reservas = defineAsyncComponent(() => import('./Reservas/Reservas.vue'))
const Users = defineAsyncComponent(() => import('./Users/Users.vue'))
const Reportes = defineAsyncComponent(() => import('./Reportes/Reportes.vue'))

export default {
  name: 'Dashboard',
  components: {
    Sedes,
    Juzgados,
    Salas,
    Reservas,
    Users,
    Reportes
  },
  setup() {
    const router = useRouter()
    const stats = ref({
      salas: 0,
      reservas: 0,
      sedes: 0,
      juzgados: 0,
      usuarios: 0
    })
    const currentModule = ref(null)
    const userName = ref('')

    const fetchUserInfo = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      userName.value = `${user.nombres || ''} ${user.apellidos || ''}`.trim()
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const [salasRes, reservasRes, sedesRes, juzgadosRes, usersRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/salas'),
          axios.get('http://127.0.0.1:8000/api/reservas'),
          axios.get('http://127.0.0.1:8000/api/sedes'),
          axios.get('http://127.0.0.1:8000/api/juzgados'),
          axios.get('http://127.0.0.1:8000/api/users')
        ])

        stats.value = {
          salas: salasRes.data.length || 0,
          reservas: reservasRes.data.data?.length || 0,
          sedes: sedesRes.data.length || 0,
          juzgados: juzgadosRes.data.length || 0,
          usuarios: usersRes.data.data?.length || 0
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error)
      }
    }

    // Función para actualizar estadísticas específicas
    const updateStats = async (type) => {
      try {
        const token = localStorage.getItem('token')
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        let response
        switch(type) {
          case 'salas':
            response = await axios.get('http://127.0.0.1:8000/api/salas')
            stats.value.salas = response.data.length || 0
            break
          case 'reservas':
            response = await axios.get('http://127.0.0.1:8000/api/reservas')
            stats.value.reservas = response.data.data?.length || 0
            break
          case 'sedes':
            response = await axios.get('http://127.0.0.1:8000/api/sedes')
            stats.value.sedes = response.data.length || 0
            break
          case 'juzgados':
            response = await axios.get('http://127.0.0.1:8000/api/juzgados')
            stats.value.juzgados = response.data.length || 0
            break
          case 'usuarios':
            response = await axios.get('http://127.0.0.1:8000/api/users')
            stats.value.usuarios = response.data.data?.length || 0
            break
          default:
            await fetchStats()
        }
      } catch (error) {
        console.error('Error al actualizar estadísticas:', error)
      }
    }

    // Proporcionar la función updateStats a los componentes hijos
    provide('updateStats', updateStats)

    const showModule = (moduleName) => {
      switch(moduleName) {
        case 'sedes':
          currentModule.value = Sedes
          break
        case 'juzgados':
          currentModule.value = Juzgados
          break
        case 'salas':
          currentModule.value = Salas
          break
        case 'reservas':
          currentModule.value = Reservas
          break
        case 'users':
          currentModule.value = Users
          break
        case 'reportes':
          currentModule.value = Reportes
          break
        default:
          currentModule.value = null
          // Actualizar estadísticas cuando se regresa al dashboard
          fetchStats()
      }
    }

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      router.push('/login')
    }

    const getTitulo = computed(() => {
      switch(currentModule.value) {
        case Sedes:
          return 'Sedes'
        case Juzgados:
          return 'Juzgados'
        case Salas:
          return 'Salas'
        case Reservas:
          return 'Reservas'
        case Users:
          return 'Usuarios'
        case Reportes:
          return 'Reportes'
        default:
          return ''
      }
    })

    onMounted(() => {
      fetchStats()
      fetchUserInfo()
    })

    return {
      stats,
      logout,
      currentModule,
      showModule,
      getTitulo,
      userName,
      logoUrl,
      updateStats
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.quick-access-sidebar {
  width: 250px;
  background-color: #fff;
  padding: 1.5rem;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
}

.logo-container {
  text-align: center;
}

.logo-img {
  max-width: 100%;
  height: auto;
  margin-bottom: 1rem;
}

.sidebar-title {
  color: #0d6efd;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #495057;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.sidebar-link:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  transform: translateX(5px);
}

.main-content {
  flex: 1;
  padding: 1.5rem;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.display-4 {
  font-size: 2.5rem;
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.btn-danger {
  transition: all 0.3s ease;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.bg-purple {
  background-color: #6f42c1 !important;
}

.row.g-4 {
  margin-right: -0.5rem;
  margin-left: -0.5rem;
}

.row.g-4 > .col {
  padding: 0 0.5rem;
}
</style> 