<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <CIcon name="cil-grid"/> Listado de unidades de medidas
            </div>
            <div>
              <CButton class="mr-2" color="primary" @click="openModalConversions()">
                Agregar Conversión
              </CButton>
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
                    :value.sync="unit_measure.name"
                    :disabled="loadingModal"
                    @keyup.enter="saveUnitMeasurement()"
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
                  <CButton color="primary" @click="saveUnitMeasurement()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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
            <CModalConvertions
              :isVisible="flagModalConversions"
              :unitMeasure="unitMeasure"
              @close-modal-conversions="closeModalConversions"
            />

            <!-- FILTROS -->
            <CRow>
              <CCol md="3">
                <CInput type="text" label="Nombre" v-model="filters.name" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="d-flex align-items-center">
                <CButton color="primary" @click="getUnitsMeasure" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>
                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>
                <CButton color="success" @click="downloadExcelUnitsMeasure" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <!-- LISTADO -->
            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <!-- BUTTON VIEW -->
              <template #buttonView="{item}">
                <BaseButton :modo="'ver'" @click="openModalConversions(item)" />
              </template>

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="editModal(item.id)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteUnitMeasurement(item.id, item.name)"></BaseButton>
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
  import CModalConvertions from "./ModalConversions.vue";

  export default {
    name: 'UnitsMeasure',
    components: {
      CModalConvertions,
    },
    props: {
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',         label: '#',        _classes: 'text-center' },
            { key: 'name',          label: 'Nombre',   _classes: 'text-center' },

            // Botones de acción
            // { key: 'buttonView',    label: 'Ver',      _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonEdit',    label: 'Editar',   _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',  label: 'Eliminar', _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    mounted() {
      this.getUnitsMeasure();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.units_measure }
    },
    data () {
      return {
        prefix_list: "units_measure",
        prefix: "unit_measure",
        units_measure: [],
        unitMeasure: null,

        loading: true,
        loadingModal: false,

        unit_measure: {
          id: "",
          name: "",
        },
        filters: {
          name  : "",
        },

        // Modal
        titleModal: "Nueva Unidad de medida",
        textButton: "Guardar",
        flagModal: false,
        flagModalConversions: false,
        loadingButtonEdit: {},
      }
    },
    methods: {

      //* Main Functions 
        async getUnitsMeasure(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.units_measure = resp.data.data || []
            else this.units_measure = []
          }, { loadingKey: "loading" })

        },
        async saveUnitMeasurement(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.unit_measure)
            const resp = await save(url + this.prefix, data, this.unit_measure.id)

            if (resp.status === 200) {
              await this.getUnitsMeasure()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false;
            }

          }, { loadingKey: "loadingModal" })

        },
        async editModal(id){

          this.flagModal = true
          this.titleModal = "Modificar Unidad de Medida"
          this.textButton = "Modificar"
          this.loadingModal = true

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.unit_measure = {
                id: d.id || "",
                name: d.name || "",
              }
              this.$set(this.loadingButtonEdit, id, false)
            }
          } catch (e) {
            // ya maneja Swal arriba
          } finally {
            this.loadingModal = false
          }

        },
        async deleteUnitMeasurement(id, name){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará la unidad de medida '<b>${name}</b>'.`,
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
              await this.getUnitsMeasure()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          }, { loadingKey: "loading" })

        },
        downloadExcelUnitsMeasure() {

          const data = (this.units_measure || []).map(c => ({
            'Nombre': c.name || '',
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
          XLSX.utils.book_append_sheet(wb, ws, 'Unidades de Medida')
          XLSX.writeFile(wb, 'reporte_unidades_medida.xlsx')

        },

      //* Secondary Functions
        request,
        getSetData(data){

          let formData = new FormData();

          formData.append('name', data.name);

          return formData;

        },
        cleanFilters() {
          this.filters = { name:"" }
        },

        //? Modal
        openModal(){
          this.cleanModal();
          this.flagModal = true;
        },
        cleanModal(){
          this.unit_measure.id    = "";
          this.unit_measure.name  = "";
          this.titleModal         = "Nueva Unidad de medida";
          this.textButton         = "Guardar";
        },
        async openModalConversions(item){
          this.flagModalConversions = true;
          this.unitMeasure = item;
        },
        closeModalConversions() {
          this.flagModalConversions = false;
        },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
