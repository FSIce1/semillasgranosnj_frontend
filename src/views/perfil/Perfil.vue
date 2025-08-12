<template>
  <div>
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4 id="traffic" class="card-title mb-0">Perfil</h4>
          </CCol>
          <CCol sm="7" class="text-right">
            <CButton v-if="!loading" color="primary" @click="editModal">
              Editar Perfil
            </CButton>
          </CCol>
        </CRow>
        <br />
        
        <!-- DATOS DEL PERFIL -->
        <CRow>
          <CCol sm="12">

            <template v-if="loading">
              <CRow class="justify-content-center align-items-center" style="min-height: 200px;">
                <CCol sm="12" class="text-center">
                  <div class="mb-2">Cargando información...</div>
                  <CSpinner color="info" size="lg"/>
                </CCol>
              </CRow>
            </template>
            <template v-else>
              <div class="form-group">
                <label for="username"><b>Usuario:</b></label>
                <p>{{ user.username }}</p>
              </div>
              
              <div class="form-group">
                <label for="name"><b>Nombre:</b></label>
                <p>{{ user.name }}</p>
              </div>
              
              <div class="form-group">
                <label for="email"><b>Correo Electrónico:</b></label>
                <p>{{ user.email }}</p>
              </div>
              
              <div class="form-group">
                <label for="phone"><b>Teléfono:</b></label>
                <p>{{ user.phone }}</p>
              </div>
              
              <div class="form-group">
                <label for="role"><b>Rol:</b></label>
                <p>{{ user.role }}</p>
              </div>
            </template>
            
          </CCol>
        </CRow>

        <!-- MODAL -->
        <CModal
          title="Modificar Datos"
          size="lg"
          :show.sync="flagModal"
        >

          <CForm novalidate>
            <CCardBody>

              <CInput
                :value.sync="user.username"
                :disabled="loadingModal"
                @keyup.enter="saveUser()"
                description="Por favor ingresa un nombre de usuario."
                label="Usuario"
                placeholder="Ingresa un nombre de usuario..."
                required
                was-validated
              />

              <CInput
                :value.sync="user.name"
                :disabled="loadingModal"
                @keyup.enter="saveUser()"
                description="Por favor ingresa un nombre."
                label="Nombre"
                placeholder="Ingresa un nombre..."
                required
                was-validated
              />

              <CInput
                :value.sync="user.email"
                :disabled="loadingModal"
                @keyup.enter="saveUser()"
                description="Por favor ingresa un email."
                label="Email"
                placeholder="Ingresa un email..."
                required
                was-validated
              />

              <CInput
                :value.sync="user.phone"
                :disabled="loadingModal"
                @keyup.enter="saveUser()"
                description="Por favor ingresa un teléfono."
                label="Teléfono"
                placeholder="Ingresa un teléfono..."
                required
                was-validated
              />
              
              <CInput
                :value.sync="user.password"
                :disabled="loadingModal"
                @keyup.enter="saveUser()"
                description="Por favor ingresa una contraseña."
                label="Contraseña"
                placeholder="Ingresa una contraseña..."
                required
                was-validated
                type="password"
              />

              <!-- <CSelect
                :value.sync="user.role_id"
                :disabled="loadingModal"
                :options="roles"
                @keyup.enter="saveUser()"
                label="Tipo de Usuario"
                description="Por favor seleccione un tipo de usuario."
                placeholder="Seleccione un tipo de usuario"
                required
                was-validated
              /> -->

            </CCardBody>
          </CForm>

          <template #footer>

            <div v-if="!loadingModal">
              <CButton color="primary" @click="saveUser()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

      </CCardBody>
    </CCard>
  </div>
</template>

<script>
  
  import Swal from "sweetalert2"
  import {save, show} from '../../assets/js/methods/functions.js'

  export default {
    name: 'Perfil',
    data () {
      return { 
        prefix: "user",
        user: {
          id        : "",
          username  : "",
          name      : "",
          email     : "",
          phone     : "",
          password  : "",
          role      : "",
          role_id   : "",
        },
        textButton: "Guardar",
        loading: true,
        loadingModal: false,
        flagModal: false,
      }
    },
    mounted() {
      this.getUser();
    },
    methods: {
      async getUser(){

        let id = sessionStorage.getItem('id');
        
        if(id!= undefined && id!=null && id!= ""){

          const url = this.$store.state.url;
          const response = await show(url+ this.prefix +`/${id}`);
            
          if (response.status === 200) {
                        
            let data = response?.data?.data;
                          
            this.user.id        = data?.id;
            this.user.username  = data?.username;
            this.user.name      = data?.name;
            this.user.email     = data?.email;
            this.user.phone     = data?.phone;
            this.user.password  = data?.password;
            this.user.role      = data?.role;
            this.user.role_id   = data?.role_id;
  
          }

        } else {
     
          if (this.$route.name !== 'Login') {
            this.$router.push({ name: 'Login' });
          }
     
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
                        
            sessionStorage.setItem('username', this.user?.username);
            sessionStorage.setItem('name', this.user?.name);
            sessionStorage.setItem('email', this.user?.email);
            sessionStorage.setItem('phone', this.user?.phone);
            
            Swal.fire("Alerta", response.data.message, "success");
            this.flagModal = false;

          }

        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {
 
          this.loadingModal = false;
        
        }

      },
      getSetData(data){

        let formData = new FormData();
        
        formData.append('username', data.username);
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('password', data.password);
        formData.append('role_id', data.role_id);
        
        return formData;

      },
      async editModal(){

        this.flagModal  = true;
        this.textButton = "Modificar";

      },
    },
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
