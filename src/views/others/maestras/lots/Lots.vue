<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <CIcon name="cil-grid"/> Listado de lotes
            </div>
            <div>
              <CButton color="twitter" @click="openModal()">
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
                    :value.sync="lot.name"
                    :disabled="loadingModal"
                    @keyup.enter="saveLot()"
                    description="Por favor ingresa un nombre."
                    label="Nombre"
                    placeholder="Ingresa un nombre..."
                    required
                    was-validated
                  />

                  <template v-if="loadingWarehouse">
                    <div class="spinner-border m-4" role="status">
                      <span class="visually-hidden"></span>
                    </div>
                  </template>
                  <template v-else>
                    <div>
                      <label>Almacenes</label>
                      <multiselect
                        v-model="lot.warehouse"
                        :disabled="loadingModal"
                        :options=warehouses
                        placeholder="Selecciona el almacén"
                        label="name"
                        track-by="id"
                        select-label="Presiona para seleccionar"
                        selected-label="Seleccionado"
                        deselect-label="Presiona para quitar"
                      >
                        <!-- Lista vacía (sin opciones) -->
                        <template #noOptions>
                          <span class="text-muted">No hay almacenes disponibles</span>
                        </template>

                        <!-- Sin resultados al buscar -->
                        <template #noResult>
                          <span class="text-muted">No se encontraron resultados</span>
                        </template>
                      </multiselect>
                      <br>
                    </div>
                  </template>

                </CCardBody>
              </CForm>

              <template #footer>

                <div v-if="!loadingModal">
                  <CButton color="primary" @click="saveLot()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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
                <CInput type="text" label="Código" v-model="filters.code" />
              </CCol>
              <CCol md="3">
                <CInput type="text" label="Nombre" v-model="filters.name" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="d-flex align-items-center">
                <CButton color="primary" @click="getLots" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>
                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>
                <CButton color="success" @click="downloadExcelLots" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <!-- LISTADO -->
            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <template #warehouse="{ item }">
                <td class="text-center">{{ item?.warehouse?.name }}</td>
              </template>

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="editModal(item.id)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteLot(item.id, item.name)"></BaseButton>
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
  import {list, save, show, destroy, request} from '@/utils/functions.js'

  import Multiselect from 'vue-multiselect'
  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    name: 'Lots',
    props: {
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',         label: '#',        _classes: 'text-center' },
            { key: 'code',          label: 'Código',   _classes: 'text-center' },
            { key: 'name',          label: 'Nombre',   _classes: 'text-center' },
            { key: 'warehouse',     label: 'Almacén',  _classes: 'text-center' },

            // Botones de acción
            { key: 'buttonEdit',    label: 'Editar',   _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',  label: 'Eliminar', _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    async mounted() {
      await this.getLots();
      await this.getWarehouses();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.lots }
    },
    data () {
      return {
        prefix_list: "lots",
        prefix: "lot",
        lots: [],
        warehouses: [],

        loading: true,
        loadingWarehouse: false,

        lot: {
          id        : "",
          warehouse : "",
          name      : "",
        },
        filters: {
          name  : "",
        },
        
        //? Modal
        loadingModal: false,
        titleModal: "Nuevo lote",
        textButton: "Guardar",
        flagModal: false,
        loadingButtonEdit: {},
      }
    },
    components: {
      Multiselect,
    },
    methods: {

      //* Main Functions
        async getLots(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.lots = resp.data.data || []
            else this.lots = []
          }, { loadingKey: "loading" })

        },
        async saveLot(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.lot);
            const resp = await save(url + this.prefix, data, this.lot.id)

            if (resp.status === 200) {
              await this.getLots()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false
            }

          }, { loadingKey: "loadingModal" })

        },
        async editModal(id){

          this.flagModal = true
          this.titleModal = "Modificar Lote"
          this.textButton = "Modificar"
          this.loadingModal = true

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.lot = {
                id: d.id || "",
                name: d.name || "",
                warehouse: d.warehouse || "",
              }
              this.$set(this.loadingButtonEdit, id, false)
            }
          } catch (e) {
            // ya maneja Swal arriba
          } finally {
            this.loadingModal = false
          }

        },
        async deleteLot(id, name){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el lote '${name}'.`,
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
              await this.getLots()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          })

        },
        downloadExcelLots() {

          const data = (this.lots || []).map(c => ({
            'Código': c.code || '',
            'Nombre': c.name || '',
            'Almacén': c.warehouse.name || '',
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
          XLSX.utils.book_append_sheet(wb, ws, 'Lotes')
          XLSX.writeFile(wb, 'reporte_lotes.xlsx')

        },

      //* Secondary Functions
        request,
        async getWarehouses(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + "warehouses")
            if (resp.status === 200) this.warehouses = resp.data.data || []
            else this.warehouses = []
          }, { loadingKey: "loadingWarehouse" })

        },
        getSetData(data){

          let formData = new FormData();

          formData.append('warehouse_id', data.warehouse.id);
          formData.append('name', data.name);

          return formData;

        },
        cleanFilters() {
          this.filters = { warehouse_id:"", name:"" }
          this.getLots()
        },

        //? Modal
        async openModal(){ this.cleanModal(); this.flagModal = true },
        cleanModal(){
          this.lot  = { id:"", warehouse_id:"", name:"" }
          this.titleModal = "Nuevo Lote";
          this.textButton = "Guardar";
        },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
