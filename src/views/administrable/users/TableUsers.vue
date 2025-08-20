<template>
  <CCard>
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CIcon name="cil-grid"/> Listado de usuarios
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

            <CSelect
              :value.sync="user.role_id"
              :disabled="loadingModal"
              :options="roles"
              @keyup.enter="saveUser()"
              label="Tipo de Usuario"
              description="Por favor seleccione un tipo de usuario."
              placeholder="Seleccione un tipo de usuario"
              required
              was-validated
            />

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

      <!-- FILTROS -->
      <CRow>
        <CCol md="3">
          <CInput type="text" label="Usuario" v-model="filters.username" />
        </CCol>
        <CCol md="3">
          <CInput type="text" label="Nombre" v-model="filters.name" />
        </CCol>
        <CCol md="3">
          <CInput type="text" label="Email" v-model="filters.email" />
        </CCol>
        <CCol md="3">
          <CInput type="text" label="Rol" v-model="filters.role" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="d-flex align-items-center">
          <CButton color="primary" @click="getUsers" class="mr-2" style="width: auto;">
            <CIcon name="cil-magnifying-glass" /> Buscar
          </CButton>
          <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
            <CIcon name="cil-share" /> Limpiar filtros
          </CButton>
          <CButton color="success" @click="downloadExcelUsers" style="width: auto;">
            <CIcon name="cil-spreadsheet" /> Generar Excel
          </CButton>
        </CCol>
      </CRow>
      <br />

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

        <!-- BUTTON EDIT -->
        <template #buttonEdit="{item}">
          <td class="text-center">
            <template v-if="!loadingButtonEdit">
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
            </template>
            <template v-else>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="facebook"
                @click="editModal(item.id)"
              >
                <CIcon size="sm" name="cil-pencil"/>
              </CButton>
            </template>

          </td>
        </template>

        <!-- BUTTON DELETE -->
        <template #buttonDelete="{item}">
          <td class="text-center">
            <CButton
              :name="item.id"
              size="sm"
              :key="item.id"
              color="youtube"
              @click="deleteUser(item.id, item.name)"
            >
              <CIcon size="sm" name="cil-trash"/>
            </CButton>
          </td>
        </template>

      </CDataTable>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import * as XLSX from 'xlsx';
  import {list, save, show, destroy} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'TableUsers',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',         label: '#' },
            { key: 'username',      label: 'Usuario',         _classes: 'text-center' },
            { key: 'name',          label: 'Nombre',          _classes: 'text-center' },
            { key: 'email',         label: 'Email',           _classes: 'text-center' },
            { key: 'phone',         label: 'Teléfono',        _classes: 'text-center' },
            { key: 'role',          label: 'Tipo de Usuario', _classes: 'text-center' },
            { key: 'buttonEdit',    label: 'Editar',          _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',  label: 'Eliminar',        _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
      caption: {
        type: String,
        default: 'TableUsers'
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean,
    },
    async mounted() {
      await this.getRoles();
      await this.getUsers();
    },
    computed: {
      tableItems () {
        return this.loading ? [] : this.users
      }
    },
    data () {
      return {
        prefix_list: "users",
        prefix_list_roles: "roles",
        prefix: "user",
        users: [],
        roles: [],
        rolesSearch: [],
        loading: true,
        user: {
          id        : "",
          username  : "",
          name      : "",
          email     : "",
          phone     : "",
          password  : "",
          role_id   : "",
        },
        filters: {
          username  : "",
          name      : "",
          email     : "",
          role      : "",
        },

        // Modal
        titleModal: "Nuevo Usuario",
        textButton: "Guardar",
        flagModal: false,
        loadingModal: false,
        loadingButtonEdit: true,
      }
    },
    methods: {
      async getUsers(){

        this.loading = true;

        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {
            this.users = response.data.data;
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
        
        this.loading = true;

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
          
          this.loading = false;
        
        }

      },
      async saveUser(){

        this.loadingModal = true;
        
        try {
          
          const url = this.$store.state.url;
          const data = this.getSetData(this.user);
          const response = await save(url + this.prefix, data, this.user.id);
                    
          if (response.status === 200) {
            
            this.getUsers();
            
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
      async editModal(id){

        try {

          this.flagModal = true;
          this.loadingModal = true;

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
            this.user.role_id   = data?.role_id;
            this.titleModal     = "Modificar Usuario";
            this.textButton     = "Modificar";

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
      async deleteUser(id, name){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará el usuario '${name}'.`,
          icon: "warning",
          confirmButtonText: "Sí, eliminar",
          closeOnConfirm: false,
          showCancelButton: true,
          cancelButtonText: "Cancelar"
        })
        .then(async function(result) {

          if(result.value) {

            try {

              const url = el.$store.state.url;
              const response = await destroy(url+el.prefix+`/${id}`);
              
              if (response.status === 200) {

                el.getUsers();
                Swal.fire("Alerta", response.data.message, "success");
                
              }

            } catch (errors) {
              
              if (errors.length > 0) {
                Swal.fire("Alerta", errors[0], "warning");
              } else {
                Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
              }

            }

          }

        });

      },
      downloadExcelUsers() {

        let data = [];
        let users = this.users;
        
        users.forEach(user => {
            data.push({
                'Usuario'         : user.username,
                'Nombre'          : user.name,
                'Email'           : user.email,
                'Teléfono'        : user.phone,
                'Tipo de Usuario' : user?.role,
            });
        });

        // Convertir los datos a una hoja de trabajo de Excel
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Obtener las cabeceras (letras de las columnas) y aplicar estilos
        const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;

            worksheet[cellAddress].s = {
                fill: {
                    fgColor: { rgb: "FFFF00" } // Fondo amarillo (RGB hex)
                },
                font: {
                    bold: true,
                    color: { rgb: "000000" } // Texto negro
                },
                alignment: {
                    horizontal: "center"
                }
            };
        }

        // Crear un nuevo libro y agregar la hoja de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Generar el archivo de Excel
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true
        });

        // Crear un blob y desencadenar la descarga
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_usuarios.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      openModal(){
        this.cleanModal();
        this.flagModal = true;
      },
      cleanModal(){
        this.user.id        = "";
        this.user.username  = "";
        this.user.name      = "";
        this.user.email     = "";
        this.user.phone     = "";
        this.user.password  = "";
        this.user.role_id   = "";
        this.titleModal     = "Nuevo Usuario";
        this.textButton     = "Guardar";
      },
      cleanFilters() {
        this.filters = {
          username  : "",
          name      : "",
          email     : "",
          role      : "",
        };
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
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
