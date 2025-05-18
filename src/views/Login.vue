<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center" :style="backgroundStyle">
    <div class="row justify-content-center w-100">
      <div class="col-md-4">
        <div class="card shadow-lg border-0 transparent-card">
          <div class="card-header text-white text-center py-4 border-0 transparent-header">
            <h3 class="mb-0">
              <i class="fas fa-user-circle fa-2x mb-3 d-block"></i>
              Acceso al Sistema
            </h3>
          </div>
          <div class="card-body p-4 transparent-body">
            <div v-if="loginError" class="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>
              {{ loginError }}
            </div>
            <form @submit.prevent="handleLogin" class="needs-validation">
              <div class="mb-4">
                <label for="username" class="form-label fw-bold">
                  <i class="fas fa-user me-2"></i>Usuario
                </label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  id="username"
                  v-model="formData.username"
                  :class="{ 'is-invalid': errors.username }"
                  placeholder="Ingrese su usuario"
                  required
                />
                <div class="invalid-feedback" v-if="errors.username">
                  {{ errors.username }}
                </div>
              </div>
              <div class="mb-4">
                <label for="password" class="form-label fw-bold">
                  <i class="fas fa-lock me-2"></i>Contraseña
                </label>
                <input
                  type="password"
                  class="form-control form-control-lg"
                  id="password"
                  v-model="formData.password"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Ingrese su contraseña"
                  required
                />
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
              </div>
            </form>
          </div>
          <div class="card-footer bg-white text-center py-3 border-0">
            <p class="text-muted mb-0">Sistema de Administración de Salas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import backgroundImage from '../assets/sala.jpg'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const isLoading = ref(false)
    const loginError = ref('')
    const backgroundStyle = {
      background: `linear-gradient(rgba(76, 180, 255, 0.4), rgba(76, 180, 255, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
    const formData = reactive({
      username: '',
      password: ''
    })
    const errors = reactive({
      username: '',
      password: ''
    })

    const validateForm = () => {
      let isValid = true
      errors.username = ''
      errors.password = ''

      if (!formData.username) {
        errors.username = 'El usuario es requerido'
        isValid = false
      }

      if (!formData.password) {
        errors.password = 'La contraseña es requerida'
        isValid = false
      } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
      }

      return isValid
    }

    const handleLogin = async () => {
      if (validateForm()) {
        try {
          isLoading.value = true
          loginError.value = ''
          
          const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
            email: formData.username,
            password: formData.password
          })

          // Guardar el token en localStorage
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('isAuthenticated', 'true')

          // Configurar el token para futuras peticiones
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

          router.push('/dashboard')
        } catch (error) {
          console.error('Error durante el login:', error)
          loginError.value = error.response?.data?.message || 'Error al iniciar sesión. Por favor, intente nuevamente.'
        } finally {
          isLoading.value = false
        }
      }
    }

    return {
      formData,
      errors,
      handleLogin,
      isLoading,
      loginError,
      backgroundStyle
    }
  }
}
</script>

<style scoped>
.transparent-card {
  background-color: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(4px);
}

.transparent-header {
  background-color: rgba(13, 110, 253, 0.15) !important;
}

.transparent-body {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.card {
  transition: all 0.3s ease;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #000 !important;
}

.form-control::placeholder {
  color: rgba(0, 0, 0, 0.5);
}

.form-control:focus {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(13, 110, 253, 0.2);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
}

.btn-primary {
  transition: all 0.3s ease;
  background-color: rgba(13, 110, 253, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  background-color: rgba(13, 110, 253, 0.3) !important;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}

.alert {
  border-radius: 8px;
  border: none;
  background-color: rgba(220, 53, 69, 0.2) !important;
}

.card-footer {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.form-label {
  color: rgba(0, 0, 0, 0.7);
  font-weight: 600 !important;
}

.text-muted {
  color: rgba(0, 0, 0, 0.5) !important;
}
</style> 