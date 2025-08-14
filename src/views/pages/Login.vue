<template>
  <div 
    class="c-app"
    style="height: 100vh; display: flex; align-items: center; justify-content: center; position: relative;"
  >

    <!-- Capa Negra Opaca -->
    <div 
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.6); z-index: 2;"
    ></div>

    <!-- Fondo de Imagen -->
    <div 
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('img/nj.jpg'); background-size: cover; background-position: center center; z-index: 1;"
    ></div>

    <CContainer>
      <CRow class="justify-content-center">
        <CCol lg="10" xl="8">
          <CCardGroup>

            <CCard class="p-4 shadow w-100" style="position: relative; z-index: 3;">
              <CCardBody style = "
                display: flex;
                justify-content: center;
                align-items: center;
              ">
                <CForm style="width: 100%;">
                  <h1 class="text-center">Login</h1>
                  <p class="text-muted text-center mb-4">Inicia sesión con tu cuenta</p>
                  <CInput
                    v-model="data.username"
                    :disabled="loading"
                    placeholder="Username"
                    autocomplete="username email"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-user" />
                    </template>
                  </CInput>
                  <CInput
                    v-model="data.password"
                    :disabled="loading"
                    placeholder="Password"
                    type="password"
                    autocomplete="current-password"
                    class="mt-3"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-lock-locked" />
                    </template>
                  </CInput>
                  <CRow class="mt-4">
                    <CCol col="6">
                      <template v-if="loading">
                        <div class="sk-chase">
                          <div class="sk-chase-dot"></div>
                          <div class="sk-chase-dot"></div>
                          <div class="sk-chase-dot"></div>
                          <div class="sk-chase-dot"></div>
                          <div class="sk-chase-dot"></div>
                          <div class="sk-chase-dot"></div>
                        </div>
                      </template>
                      <template v-else>
                        <CButton class="px-4 text-white login-color" @click="signIn()">Login</CButton>
                      </template>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>

            <CCard
              text-color="white"
              class="text-center py-5 d-md-down-none shadow login-color"
              style="position: relative; z-index: 4;"
              body-wrapper
            >
              <CCardBody>
                <h2 class="mt-4">Granos & Semillas NJ</h2>
                <p>Bienvenido al sistema.</p>
              </CCardBody>
            </CCard>

          </CCardGroup>
        </CCol>

      </CRow>
    </CContainer>
  </div>
</template>

<script>

  import Swal from "sweetalert2"
  import {signIn} from '../../assets/js/methods/functions.js'

  export default {
    name: 'Login',
    data () {
      return {
        prefix: "login",
        data: {
          username: "",
          password: "",
        },
        loading: false,
      }
    },
    methods: {
      async signIn(){
        
        this.loading = true;
        
        try {
        
          const url = this.$store.state.url;
          const response = await signIn(url + this.prefix, this.data);
                              
          if (response.status === 200) {
                        
            let data = response?.data;

            if(data.flag){
              
              sessionStorage.setItem('id', data.data?.id);
              sessionStorage.setItem('username', data.data?.username);
              sessionStorage.setItem('name', data.data?.name);
              sessionStorage.setItem('email', data.data?.email);
              sessionStorage.setItem('role_id', data.data?.role_id);
              sessionStorage.setItem('slug_role', data.data?.role?.slug);
              sessionStorage.setItem('role', data.data?.role?.name);
              sessionStorage.setItem('phone', data.data?.phone);

              this.$router.push({ 
                name: 'Perfil', 
              });

            } else {
              
              Swal.fire("Alerta", data.message, "warning");

            }

          }

        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loading = false;
        
        }

      },
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
