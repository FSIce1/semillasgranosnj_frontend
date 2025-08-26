<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <CIcon name="cil-grid"/> Listado de proveedores
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
                    :value.sync="provider.name"
                    :disabled="loadingModal"
                    @keyup.enter="saveProvider()"
                    description="Por favor ingresa un nombre."
                    label="Nombre"
                    placeholder="Ingresa un nombre..."
                    required
                    was-validated
                  />

                  <CInput
                    :value.sync="provider.document"
                    :disabled="loadingModal"
                    @keydown="validateNumber"
                    @keyup.enter="saveProvider()"
                    description="Por favor ingresa el ruc."
                    label="RUC"
                    maxlength="11"
                    placeholder="Ingresa el ruc..."
                  />

                  <CInput
                    :value.sync="provider.phone"
                    :disabled="loadingModal"
                    @keydown="validateNumber"
                    @keyup.enter="saveProvider()"
                    description="Por favor ingresa un teléfono."
                    label="Teléfono"
                    placeholder="Ingresa un teléfono..."
                    required
                    was-validated
                  />

                  <CInput
                    :value.sync="provider.address"
                    :disabled="loadingModal"
                    @keyup.enter="saveProvider()"
                    description="Por favor ingresa una dirección."
                    label="Dirección"
                    placeholder="Ingresa una dirección..."
                    required
                    was-validated
                  />

                  <CInput
                    :value.sync="provider.description"
                    :disabled="loadingModal"
                    @keyup.enter="saveProvider()"
                    description="Por favor ingresa una descripción."
                    label="Descripción"
                    placeholder="Ingresa una descripción..."
                    was-validated
                  />

                </CCardBody>
              </CForm>

              <template #footer>

                <div v-if="!loadingModal">
                  <CButton color="primary" @click="saveProvider()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

            <!-- MODAL: LISTADO DE COMPRAS POR PROVEEDOR -->
            <CModalPurchasesByProvider
              :isVisible="flagModalPurchasesByProvider"
              :provider="providerData"
              @close-modal-purchases-by-provider="closeModalPurchasesByProvider"
            />

            <!-- FILTROS -->
            <CRow>
              <CCol md="3">
                <CInput type="text" label="RUC" v-model="filters.document" />
              </CCol>
              <CCol md="3">
                <CInput type="text" label="Nombre" v-model="filters.name" />
              </CCol>
              <CCol md="3">
                <CSelect
                  :value.sync="filters.type"
                  :options=types
                  label="Tipo Compra"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="d-flex align-items-center">
                <CButton color="primary" @click="getProviders" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>
                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>
                <CButton color="success" @click="downloadExcelProviders" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <!-- BUTTON VIEW -->
              <template #buttonView="{item}">
                <BaseButton :modo="'ver'" @click="openModalPurchasesByProvider(item)" />
              </template>

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="editModal(item.id)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteProvider(item.id, item.name)"></BaseButton>
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
  import CModalPurchasesByProvider from "./ModalPurchasesByProvider.vue";
  import { validateNumber } from '@/utils/validators.js'
  import {list, save, show, destroy} from '@/utils/functions.js'

  export default {
    name: 'Providers',
    components: {
      CModalPurchasesByProvider,
    },
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',           label: '#' },
            { key: 'document',        label: 'RUC' },
            { key: 'name',            label: 'Nombre' },
            { key: 'phone',           label: 'Teléfono' },
            { key: 'address',         label: 'Dirección' },
            { key: 'description',     label: 'Descripción' },
            { key: 'buttonView',      label: 'Ver',      _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonEdit',      label: 'Editar',   _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',    label: 'Eliminar', _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    mounted() {
      this.getProviders();
    },
    data () {
      return {
        prefix_list: "providers",
        prefix: "provider",
        providers: [],
        providerData: null,

        loading: true,
        loadingModal: false,
        loadingButtonEdit: {},

        types: ['ambas', 'contado', 'credito'],

        provider: {
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
        titleModal: "Nuevo Proveedor",
        textButton: "Guardar",
        flagModal: false,
        flagModalPurchasesByProvider: false,
      }
    },
    computed: {
      tableItems () { return this.loading ? [] : this.providers }
    },
    methods: {

      //* Main Functions
        async getProviders(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.providers = resp.data.data || []
            else this.providers = []
          })

        },
        async saveProvider(){

          await this.request(async () => {

          const url = this.$store.state.url
          const data = this.getSetData(this.provider)
          const resp = await save(url + this.prefix, data, this.provider.id)

          if (resp.status === 200) {
            await this.getProviders()
            Swal.fire("Alerta", resp.data.message, "success")
            this.flagModal = false
          }

          }, { useModal: true })

        },
        async editModal(id){

          this.flagModal = true
          this.titleModal = "Modificar Proveedor"
          this.textButton = "Modificar"
          this.loadingModal = true

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.provider = {
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
        async deleteProvider(id, name){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el proveedor '<b>${name}</b>'.`,
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
              await this.getProviders()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          })

        },
        downloadExcelProviders() {

          const data = (this.providers || []).map(c => ({
            'RUC'        : c.document || '',
            'Nombre'     : c.name || '',
            'Teléfono'   : c.phone || '',
            'Dirección'  : c.address || '',
            'Descripción': c.description || '',
          }))

          const ws = XLSX.utils.json_to_sheet(data)
          // estilos cabecera (simple)
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
          XLSX.utils.book_append_sheet(wb, ws, 'Proveedores')
          XLSX.writeFile(wb, 'reporte_proveedores.xlsx')

        },

      //* Secondary Functions
        validateNumber,
        async request (fn, { useModal = false } = {}) {

          const setLoading = val => useModal ? (this.loadingModal = val) : (this.loading = val)

          try {

            setLoading(true)
            return await fn()

          } catch (errors) {

            const msg = Array.isArray(errors) && errors.length ? errors[0] : (errors?.message || "Ocurrió un error desconocido")
            Swal.fire("Alerta", msg, "error")
            throw errors

          } finally {
            setLoading(false)
          }

        },
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
          this.filters = { document:"", name:"", type:"",}
          this.getProviders()
        },

      //? Modal
      openModal(){ this.cleanModal(); this.flagModal = true },
      cleanModal(){
        this.provider = { id:"", document:"", name:"", phone:"", address:"", description:"" }
        this.titleModal = "Nuevo Proveedor";
        this.textButton = "Guardar";
      },
      async openModalPurchasesByProvider(item){
        this.providerData = item;
        this.flagModalPurchasesByProvider = true;
      },
      closeModalPurchasesByProvider() {
        this.getProviders();
        this.flagModalPurchasesByProvider = false;
      },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>