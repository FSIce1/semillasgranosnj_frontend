<template>
  <div>
    <CRow>
      <CCol lg="12">
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
              @keydown="validateNumber"
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
          <CInput type="text" label="Tipo de Usuario" v-model="filters.role" />
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

      <!-- LISTADO -->
      <TableCustom :items="tableItems" :fields="fields" :loading="loading">

        <!-- BUTTON EDIT -->
        <template #buttonEdit="{item}">
          <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click.stop.prevent="editModal(item.id)"></BaseButton>
        </template>

        <!-- BUTTON DELETE -->
        <template #buttonDelete="{item}">
          <BaseButton :modo="'eliminar'" @click="deleteUser(item.id, item.name)"></BaseButton>
        </template>

      </TableCustom>

    </CCardBody>
  </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import Swal from "sweetalert2"
  import * as XLSX from 'xlsx';
  import { validateNumber } from '@/utils/validators.js'
  import {list, save, show, destroy, request} from '@/utils/functions.js'

  export default {
    name: 'Users',
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
    },
    async mounted() {
      await this.getRoles();
      await this.getUsers();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.users }
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
        loadingModal: false,

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

        //? Modal
        titleModal: "Nuevo Usuario",
        textButton: "Guardar",
        flagModal: false,
        loadingButtonEdit: {},
      }
    },
    methods: {

      //* Main Functions 
        async getUsers(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.users = resp.data.data || []
            else this.users = []
          }, { loadingKey: "loading" })

        },
        async getRoles () {

          await this.request(async () => {

            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list_roles)

            if (resp.status === 200) {
              this.roles = (resp.data?.data || []).map(role => ({
                value: String(role.id),
                label: role.name
              }))
            } else {
              this.roles = []
            }

          }, { loadingKey: "loading" })

        },
        async saveUser(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.user)
            const resp = await save(url + this.prefix, data, this.user.id)

            if (resp.status === 200) {
              await this.getUsers()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false
            }

          }, { loadingKey: "loadingModal" })

        },
        async editModal(id){

          if (this.loadingModal || this.loadingButtonEdit?.[id]) return;

          this.flagModal = true
          this.titleModal = "Modificar Usuario"
          this.textButton = "Modificar"
          this.loadingModal = true

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.user = {
                id: d.id || "",
                username: d.username || "",
                name: d.name || "",
                email: d.email || "",
                phone: d.phone || "",
                password: d.password || "",
                role_id: String(d.role_id) || "",
              }
              this.$set(this.loadingButtonEdit, id, false)
            }
          } finally {
            this.$set(this.loadingButtonEdit, id, false);
            this.loadingModal = false
          }

        },
        async deleteUser(id, name){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el usuario '<b>${name}</b>'.`,
            icon: "warning",
            confirmButtonText: "Sí, eliminar",
            showCancelButton: true,
            cancelButtonText: "Cancelar"
          })

          if (!res.value) return

          await this.request(async () => {

            const url = this.$store.state.url
            const resp = await destroy(url + this.prefix + `/${id}`)

            if (resp.status === 200) {
              await this.getUsers()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          }, { loadingKey: "loadingModal" })

        },
        downloadExcelUsers() {

          const data = (this.users || []).map(c => ({            
            'Usuario'         : c.username || '',
            'Nombre'          : c.name || '',
            'Email'           : c.email || '',
            'Teléfono'        : c.phone || '',
            'Tipo de Usuario' : c.role || '',
          }))

          const ws = XLSX.utils.json_to_sheet(data)
          const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')

          for (let c = range.s.c; c <= range.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r: 0, c })
            if (ws[addr]) {
              ws[addr].s = {
                font: { bold: true },
                alignment: { horizontal: "center" }
              }
            }
          }

          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
          XLSX.writeFile(wb, 'reporte_usuarios.xlsx')

        },

      //* Secondary Functions
        validateNumber,
        request,
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
        cleanFilters() {
          this.filters = { username:"", name:"", email:"", roles:"" }
          this.getUsers()
        },

        //? Modal
        openModal(){ this.cleanModal(); this.flagModal = true },
        cleanModal(){
          this.user       = { id:"", username:"", name:"", email:"", phone:"", password:"", role_id:"" }
          this.titleModal = "Nuevo Usuario";
          this.textButton = "Guardar";
        },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
