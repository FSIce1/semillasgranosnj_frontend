<template>
  <div>
    <CRow>
      <CCol lg="12">
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
                    @change="getProfiles"
                  />
                </template>
              </CCol>
            </CRow>

            <!-- LISTADO -->
            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

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

            </TableCustom>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import Swal from "sweetalert2"
  import {list, save, request} from '@/utils/functions.js'

  export default {
    name: 'RolesPerfiles',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',         label: '#' },
            { key: 'name',          label: 'Nombre' },
            { key: 'description',   label: 'Descripción' },
            { key: 'buttonChange',  label: 'Acción',      _style:'min-width:20%;' },
          ]
        }
      },
    },
    async mounted() {
      await this.getRoles();
      await this.getProfiles();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.functions }
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
        loadingModal: false,

        role: {
          id: "",
          name: "",
        },

        //? Modal
        titleModal: "Nuevo Perfil",
        textButton: "Guardar",
        flagModal: false,
        loadingRoles: false,
      }
    },
    methods: {

      //* Main Functions
        async getProfiles () {

          await this.request(async () => {
            const url = this.$store.state.url
            const filters = { role_id: this.role_id }
            const resp = await list(url + this.prefix, filters)
            if (resp.status === 200) this.functions = resp.data.data || []
            else this.functions = []
          }, { loadingKey: "loading" })

        },
        async getRoles(){

          await this.request(async () => {
            const url  = this.$store.state.url
            const resp = await list(url + this.prefix_list_roles)
            this.roles = resp?.status === 200
              ? (resp.data?.data || []).map(r => ({ value: r.id, label: r.name }))
              : []
          }, { loadingKey: "loadingRoles" })

        },
        async saveRole(){

          await this.request(async () => {

            const url = this.$store.state.url
            const resp = await save(url + this.prefix_rol, this.role, this.role.id)

            if (resp.status === 200) {
              await this.getRoles()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false
            }

          }, { loadingKey: "loadingModal" })

        },
        async changePermission(item){

          await this.request(async () => {
            const url = this.$store.state.url
            let filters = { permission_id: item.id, role_id: this.role_id };
            const resp = await list(url + "change_function", filters)
            if (resp?.status === 200) {
              await this.getProfiles()
              Swal.fire('Alerta', resp.data.message, 'success')
            }
          }, { loadingKey: "loadingModal" })

        },

        //* Secondary Functions
          request,

          //? Modal
          openModal(){
            this.cleanModal();
            this.flagModal = true;
          },
          cleanModal(){
            this.role       = { id:"", name:"" }
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