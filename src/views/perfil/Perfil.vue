<template>
  <div>
    <CCard class="profile-card shadow-sm">
      <div class="card-hero">
        <div class="hero-left">
        </div>
        <div class="hero-actions">
          <CButton v-if="!loading" color="success" class="btn-edit" @click="editModal">
            <CIcon name="cil-pencil"/> Editar Perfil
          </CButton>
        </div>
      </div>

      <CCardBody>
        <CRow>
          <CCol sm="12">
            <!-- LOADING -->
            <template v-if="loading">
              <CRow class="justify-content-center align-items-center" style="min-height: 220px;">
                <CCol sm="12" class="text-center">
                  <div class="mb-2 text-muted">Cargando información…</div>
                  <CSpinner color="info" size="lg"/>
                </CCol>
              </CRow>
            </template>

            <!-- CONTENT -->
            <template v-else>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Usuario</div>
                  <div class="info-value">{{ user.username || '—' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Nombre</div>
                  <div class="info-value">{{ user.name || '—' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Correo Electrónico</div>
                  <div class="info-value">{{ user.email || '—' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Teléfono</div>
                  <div class="info-value">{{ user.phone || '—' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Rol</div>
                  <div class="info-value">{{ user.role || '—' }}</div>
                </div>
              </div>
            </template>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- MODAL -->
    <CModal title="Modificar Datos" size="lg" :show.sync="flagModal">
      <CForm novalidate @submit.prevent="saveUser">
        <CCardBody>
          <CRow>
            <CCol md="6">
              <CInput
                :value.sync="user.username"
                :disabled="loadingModal"
                label="Usuario"
                placeholder="Ingresa un nombre de usuario…"
                required
                was-validated
              />
            </CCol>
            <CCol md="6">
              <CInput
                :value.sync="user.name"
                :disabled="loadingModal"
                label="Nombre"
                placeholder="Ingresa un nombre…"
                required
                was-validated
              />
            </CCol>

            <CCol md="6">
              <CInput
                :value.sync="user.email"
                :disabled="loadingModal"
                label="Email"
                placeholder="Ingresa un email…"
                required
                was-validated
                type="email"
              />
            </CCol>
            <CCol md="6">
              <CInput
                :value.sync="user.phone"
                :disabled="loadingModal"
                label="Teléfono"
                placeholder="Ingresa un teléfono…"
                required
                was-validated
              />
            </CCol>

            <CCol md="12">
              <div class="password-wrap">
                <CInput
                  :value.sync="user.password"
                  :disabled="loadingModal"
                  :type="showPassword ? 'text' : 'password'"
                  label="Contraseña"
                  placeholder="Ingresa una contraseña…"
                  was-validated
                />
                <button type="button" class="toggle-pass" @click="showPassword = !showPassword">
                  {{ showPassword ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
            </CCol>

            <!-- Si luego vuelves a habilitar roles, aquí quedaría tu CSelect -->
            <!-- <CSelect :value.sync="user.role_id" :disabled="loadingModal" :options="roles" @keyup.enter="saveUser()" label="Tipo de Usuario" description="Por favor seleccione un tipo de usuario." placeholder="Seleccione un tipo de usuario" required was-validated /> -->

          </CRow>
        </CCardBody>
      </CForm>

      <template #footer>
          <div v-if="!loadingModal"> 
            <CButton color="primary" @click="saveUser()" class="mr-1 mb-3">
              <CIcon name="cil-save"/> 
              <span v-text="textButton"></span>
            </CButton> 
          </div> 
          <div v-else> 
            <CCol xl="3" lg="4" md="6"> 
              <CCardBody> 
                <div class="sk-chase"> 
                  <div class="sk-chase-dot"></div> 
                  <div class="sk-chase-dot"></div> 
                  <div class="sk-chase-dot"></div> 
                  <div class="sk-chase-dot"></div> 
                  <div class="sk-chase-dot"></div> 
                  <div class="sk-chase-dot"></div> 
                </div> 
              </CCardBody> 
            </CCol> 
          </div>
        </template>

    </CModal>
  </div>
</template>

<script>
import Swal from "sweetalert2"
import { save, show } from '../../assets/js/methods/functions.js'

export default {
  name: 'Perfil',
  data () {
    return {
      prefix: "user",
      user: {
        id: "", username: "", name: "",
        email: "", phone: "", password: "",
        role: "", role_id: "",
      },
      textButton: " Guardar",
      loading: true,
      loadingModal: false,
      flagModal: false,
      showPassword: false
    }
  },
  mounted() {
    this.getUser();
  },
  computed: {
    initials () {
      const n = (this.user.name || this.user.username || '').trim();
      if (!n) return 'U';
      const parts = n.split(' ').filter(Boolean).slice(0,2);
      return parts.map(p => p[0]).join('').toUpperCase();
    }
  },
  methods: {
    async getUser(){
      let id = sessionStorage.getItem('id');

      if(id){
        const url = this.$store.state.url;
        const response = await show(url + this.prefix + `/${id}`);
        if (response.status === 200) {
          const data = response?.data?.data || {};
          this.user.id       = data?.id || "";
          this.user.username = data?.username || "";
          this.user.name     = data?.name || "";
          this.user.email    = data?.email || "";
          this.user.phone    = data?.phone || "";
          this.user.password = data?.password || "";
          this.user.role     = data?.role || "";
          this.user.role_id  = data?.role_id || "";
        }
      } else {
        if (this.$route.name !== 'Login') this.$router.push({ name: 'Login' });
      }
      this.loading = false;
    },

    async saveUser(){
      this.loadingModal = true;
      try {
        const url = this.$store.state.url;
        const data = this.getSetData(this.user);
        const response = await save(url + this.prefix, data, this.user.id);

        if (response.status === 200) {
          sessionStorage.setItem('username', this.user?.username || '');
          sessionStorage.setItem('name', this.user?.name || '');
          sessionStorage.setItem('email', this.user?.email || '');
          sessionStorage.setItem('phone', this.user?.phone || '');
          Swal.fire("Alerta", response.data.message, "success");
          this.flagModal = false;
        }
      } catch (errors) {
        if (errors && errors.length > 0) {
          Swal.fire("Alerta", errors[0], "warning");
        } else {
          Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
        }
      } finally {
        this.loadingModal = false;
      }
    },

    getSetData(data){
      const formData = new FormData();
      formData.append('username', data.username || '');
      formData.append('name', data.name || '');
      formData.append('email', data.email || '');
      formData.append('phone', data.phone || '');
      formData.append('password', data.password || '');
      formData.append('role_id', data.role_id || '');
      return formData;
    },

    editModal(){
      this.flagModal  = true;
      this.textButton = " Modificar";
    },
  },
}
</script>

<style src="spinkit/spinkit.min.css"></style>
<style scoped>

:root {
  --brand-700: #1B5E20;
  --brand-600: #2E7D32;
  --brand-500: #43A047;
  --brand-50:  #E8F5E9;
  --ink-900:   #263238;
  --ink-600:   #546E7A;
  --ink-400:   #90A4AE;
  --card:      #ffffff;
}

.profile-card {
  overflow: hidden;
  border: 0;
  border-radius: 14px;
}

.card-hero {
  background: linear-gradient(135deg, var(--brand-600), var(--brand-700));
  color: #fff;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-left { display: flex; gap: 14px; align-items: center; }

.avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  display: grid; place-items: center;
  font-weight: 700; letter-spacing: .5px;
}

.hero-title { font-size: 1.25rem; margin: 0; line-height: 1.1; }
.hero-subtitle { font-size: .9rem; opacity: .9; display: flex; align-items: center; gap: 8px; }
.hero-username { font-weight: 500; }
.hero-dot { opacity: .7; }

.role-badge {
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.28);
  padding: 2px 8px; border-radius: 999px; font-size: .8rem;
}

.btn-edit {
  /* background: #fff !important; */
  /* color: var(--brand-700) !important; */
  border: none !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 16px;
  padding: 12px 6px;
}

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
}

.info-item {
  background: var(--card);
  border: 1px solid #edf0f2;
  border-radius: 12px;
  padding: 14px 16px;
}

.info-label {
  font-size: .78rem;
  color: var(--ink-400);
  text-transform: uppercase;
  letter-spacing: .04em;
  margin-bottom: 4px;
}

.info-value {
  color: var(--ink-900);
  font-weight: 600;
}

.password-wrap {
  position: relative;
}

.toggle-pass {
  position: absolute;
  right: 10px; bottom: 8px;
  border: none; background: transparent;
  font-size: .85rem; color: var(--brand-600);
  cursor: pointer; padding: 6px 8px;
}
.toggle-pass:focus { outline: none; }

.text-muted { color: var(--ink-600) !important; }

</style>
