<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <CIcon name="cil-grid"/> Listado de clientes
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
                    :value.sync="client.name"
                    :disabled="loadingModal"
                    @keyup.enter="saveClient()"
                    description="Por favor ingresa un nombre."
                    label="Nombre"
                    placeholder="Ingresa un nombre..."
                    required
                    was-validated
                  />

                  <CInput
                    :value.sync="client.document"
                    :disabled="loadingModal"
                    @keydown="validateNumber"
                    @keyup.enter="saveClient()"
                    description="Por favor ingresa el dni/ruc."
                    label="DNI/RUC"
                    maxlength="11"
                    placeholder="Ingresa el dni/ruc..."
                  />

                  <CInput
                      :value.sync="client.phone"
                      :disabled="loadingModal"
                      @keydown="validateNumber"
                      @keyup.enter="saveUser()"
                      description="Por favor ingresa un teléfono."
                      label="Teléfono"
                      placeholder="Ingresa un teléfono..."
                    />

                  <CInput
                    :value.sync="client.address"
                    :disabled="loadingModal"
                    @keyup.enter="saveClient()"
                    description="Por favor ingresa una dirección."
                    label="Dirección"
                    placeholder="Ingresa una dirección..."
                    required
                    was-validated
                  />

                  <CInput
                    :value.sync="client.description"
                    :disabled="loadingModal"
                    @keyup.enter="saveClient()"
                    description="Por favor ingresa una descripción."
                    label="Descripción"
                    placeholder="Ingresa una descripción..."
                    was-validated
                  />

                </CCardBody>
              </CForm>

              <template #footer>

                <div v-if="!loadingModal">
                  <CButton color="primary" @click="saveClient()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

            <!-- MODAL: LISTADO DE VENTAS POR CLIENTE -->
            <CModalSalesByClient
              :isVisible="flagModalClientBySales"
              :client="clientData"
              @close-modal-sales-by-client="closeModalSalesByClient"
              @get-clients="getClients"
            />

            <!-- FILTROS -->
            <CRow>
              <CCol md="3">
                <CInput type="text" label="DNI" v-model="filters.document" />
              </CCol>
              <CCol md="3">
                <CInput type="text" label="Nombre" v-model="filters.name" />
              </CCol>
              <CCol md="3">
                <CSelect
                  :value.sync="filters.type"
                  :options=types
                  label="Tipo Venta"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="d-flex align-items-center">
                <CButton color="primary" @click="getClients" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>
                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>
                <CButton color="success" @click="downloadExcelClients" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <!-- LISTADO -->
            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <!-- BUTTON VIEW -->
              <template #buttonView="{item}">
                <BaseButton :modo="'ver'" @click="openModalSalesByClient(item)" />
              </template>

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="editModal(item.id)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteClient(item.id, item.name)"></BaseButton>
              </template>

            </TableCustom>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import * as XLSX from 'xlsx';
  import Swal from "sweetalert2"
  import CModalSalesByClient from "./ModalSalesByClient.vue";
  import { validateNumber } from '@/utils/validators.js'
  import {list, save, show, destroy, request} from '@/utils/functions.js'

  export default {
    name: 'Clients',
    components: {
      CModalSalesByClient,
    },
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',           label: '#' },
            { key: 'document',        label: 'DNI' },
            { key: 'name',            label: 'Nombre' },
            { key: 'phone',           label: 'Teléfono' },
            { key: 'address',         label: 'Dirección' },
            { key: 'description',     label: 'Descripción' },

            // Botones de acción
            { key: 'buttonView',      label: 'Ver',      _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonEdit',      label: 'Editar',   _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',    label: 'Eliminar', _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    mounted() {
      this.getClients();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.clients }
    },
    data () {
      return {
        prefix_list: "clients",
        prefix: "client",
        clients: [],
        clientData: null,

        loading: true,
        loadingModal: false,
        loadingButtonEdit: {},

        types: ['ambas', 'contado', 'credito'],

        client: {
          id          : "",
          document    : "",
          name        : "",
          phone       : "",
          address     : "",
          description : "",
        },
        filters: {
          document  : "",
          name      : "",
          type      : "",
        },

        //? Modal
        titleModal: "Nuevo Cliente",
        textButton: "Guardar",
        flagModal: false,
        flagModalClientBySales: false,
      }
    },
    methods: {

      //* Main Functions 
        async getClients(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.clients = resp.data.data || []
            else this.clients = []
          }, { loadingKey: "loading" })

        },
        async saveClient(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.client)
            const resp = await save(url + this.prefix, data, this.client.id)

            if (resp.status === 200) {
              await this.getClients()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false
            }

          }, { loadingKey: "loadingModal" })

        },
        async editModal(id){

          this.flagModal = true
          this.titleModal = "Modificar Cliente"
          this.textButton = "Modificar"
          this.loadingModal = true

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.client = {
                id: d.id || "",
                document: d.document || "",
                name: d.name || "",
                phone: d.phone || "",
                address: d.address || "",
                description: d.description || "",
              }
              this.$set(this.loadingButtonEdit, id, false)
            }
          } catch (e) {
            // ya maneja Swal arriba
          } finally {
            this.loadingModal = false
          }

        },
        async deleteClient(id, name){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el cliente '<b>${name}</b>'.`,
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
              await this.getClients()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          }, { loadingKey: "loadingModal" })

        },
        downloadExcelClients() {

          const data = (this.clients || []).map(c => ({
            'DNI'        : c.document || '',
            'Nombre'     : c.name || '',
            'Teléfono'   : c.phone || '',
            'Dirección'  : c.address || '',
            'Descripción': c.description || '',
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
          XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
          XLSX.writeFile(wb, 'reporte_clientes.xlsx')

        },

      //* Secondary Functions
        validateNumber,
        request,
        getSetData(data){

          let formData = new FormData();

          formData.append('document', data.document);
          formData.append('name', data.name);
          formData.append('phone', data.phone);
          formData.append('address', data.address);
          formData.append('description', data.description);

          return formData;

        },
        cleanFilters() {
          this.filters = { document:"", name:"", type:"" }
          this.getClients()
        },

        //? Modal
        openModal(){ this.cleanModal(); this.flagModal = true },
        cleanModal(){
          this.client     = { id:"", document:"", name:"", phone:"", address:"", description:"" }
          this.titleModal = "Nuevo Cliente"
          this.textButton = "Guardar"
        },
        async openModalSalesByClient(item){
          this.clientData = item;
          this.flagModalClientBySales = true;
        },
        closeModalSalesByClient() {
          this.getClients();        
          this.flagModalClientBySales = false;
        },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>