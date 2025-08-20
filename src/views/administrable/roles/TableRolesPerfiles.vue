<template>
  <CCard>
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CIcon name="cil-grid"/> Listado de roles y perfiles
      </div>
      <div>
        <CButton color="primary" @click="openModal()">
          Nuevo
        </CButton>
      </div>
    </CCardHeader>
    <CCardBody>

      <!-- MODAL -->
      <CModal
        :title="titleModal"
        size="lg"
        :show.sync="flagModal"
      >

        <CForm novalidate>
          <CCardBody>

            <CInput
              :value.sync="role.name"
              :disabled="loadingModal"
              @keyup.enter="saveRole()"
              description="Por favor ingresa un nombre."
              label="Nombre"
              placeholder="Ingresa un nombre..."
              required
              was-validated
            />

          </CCardBody>
        </CForm>

        <template #footer>

          <div v-if="!loadingModal">
            <CButton color="primary" @click="saveRole()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

      <!-- FILTROS -->
      <CRow>
        <CCol md="3">
          <template v-if="loadingRoles">
            <div class="spinner-border m-4" role="status">
              <span class="visually-hidden"></span>
            </div>
          </template>
          <template v-else>
            <CSelect
              :value.sync="role_id"
              :options="roles"
              label="Perfiles"
              @change="getFunctions"
            />
          </template>
        </CCol>
      </CRow>

      <!-- LIST -->
      <CDataTable
        :items="tableItems"
        :fields="fields"
        :items-per-page="10"
        :no-items-view="{
          noItems: 'No hay registros',
          noResults: 'No se encontraron resultados'
        }"
        :hover="hover"
        :striped="striped"
        :border="border"
        :small="small"
        :fixed="fixed"
        :dark="dark"
        pagination
        :loading="loading"
      >

        <template #loading>
          <div class="text-center p-4">
            <CSpinner color="primary" />
            <p>Cargando...</p>
          </div>
        </template>

        <template #index="{ index }">
          <td>{{ index + 1 }}</td>
        </template>

        <template #buttonChange="{item}">
          <td>
            <label class="custom-checkbox">
              <input
                type="checkbox"
                v-model="item.checked"
                @change="changePermission(item)"
              />
              <span class="checkmark"></span>
            </label>
          </td>
        </template>

      </CDataTable>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {list, save} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'TableRolesPerfiles',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'name', label: 'Nombre' },
            { key: 'description', label: 'Descripción' },
            { key: 'buttonChange', label: 'Acción', _style:'min-width:20%;' },
          ]
        }
      },
      caption: {
        type: String,
        default: 'Table'
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean
    },
    async mounted() {
      await this.getRoles();
      await this.getFunctions();
    },
    data () {
      return {
        prefix: "functions",
        prefix_rol: "rol",
        prefix_list_roles: "roles",
        role_id: 1,
        roles: [],
        functions: [],
        loading: true,
        role: {
          id: "",
          name: "",
        },
        // Modal
        titleModal: "Nuevo Perfil",
        textButton: "Guardar",
        flagModal: false,
        loadingModal: false,
        loadingRoles: false,
      }
    },
    computed: {
      tableItems () {
        return this.loading ? [] : this.functions
      }
    },
    methods: {
      async saveRole(){

        this.loadingModal = true;

        try {

          const url = this.$store.state.url;
          const response = await save(url + this.prefix_rol, this.role);

          if (response.status === 200) {

            this.getRoles();

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
      async changePermission(item){

        this.loading = true;

        try {
          
          let filters = {
            permission_id : item.id,
            role_id       : this.role_id,
          };

          const url = this.$store.state.url;
          const response = await list(url + "change_function", filters);

          if (response.status === 200) {
            this.getFunctions();
            Swal.fire("Alerta", response.data.message, "warning");
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
      async getFunctions(){
        
        this.loading = true;

        try {
          
          let filters = {
            role_id: this.role_id,
          };

          const url = this.$store.state.url;
          const response = await list(url + this.prefix, filters);

          if (response.status === 200) {
            this.functions = response.data.data;
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
      async getRoles(){
        
        this.loadingRoles = true;
        
        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list_roles);

          if (response.status === 200) {
            
            let setRoles = (response.data.data).map(role => ({
              value: role.id, 
              label: role.name
            }));
            
            this.roles = setRoles;

          }

        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {
          
          this.loadingRoles = false;
        
        }

      },
      openModal(){
        this.cleanModal();
        this.flagModal = true;
      },
      cleanModal(){
        this.role.id   = "";
        this.role.name = "";
        this.titleModal = "Nuevo Perfil";
        this.textButton = "Guardar";
      },
    }
  }

</script>

<style scoped>
  .custom-checkbox {
    display: inline-block;
    position: relative;
    cursor: pointer;
    user-select: none;
  }

  .custom-checkbox input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    background-color: #eee;
    border-radius: 5px;
    border: 2px solid #007bff;
  }

  .custom-checkbox input:checked + .checkmark {
    background-color: #007bff;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .custom-checkbox input:checked + .checkmark:after {
    display: block;
  }

  .custom-checkbox .checkmark:after {
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
</style>

<style src="spinkit/spinkit.min.css"></style>
