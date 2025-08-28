
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisible">

      <slot name="header">
        <CIcon name="cil-grid"/> Listado de Conversiones 
      </slot>

      <template>
        <CCardBody>

          <!-- FILTROS -->
          <CRow class="align-items-end">
            <CCol md="4">
              <CSelect
                :value.sync="filters.unitMeasure"
                :disabled="loadingUnitMeasure"
                :options=units_measure
                @keyup.enter="saveConvertion()"
                label="Unidad de Medida"
                placeholder="Seleccione una unidad de medida"
                required
              />
            </CCol>
            <CCol md="4">
              <CInput
                :value.sync="filters.amount"
                @keyup.enter="saveConvertion()"
                @keydown="preventInvalidDecimal($event)"
                label="Factor de conversión"
                placeholder="Ingresa una cantidad"
              />
            </CCol>
            <CCol md="4">
              <CSelect
                :value.sync="filters.unitMeasureConvert"
                :disabled="loadingUnitMeasure"
                :options=units_measure
                @keyup.enter="saveConvertion()"
                label="Unidad de Medida 2"
                placeholder="Seleccione una unidad de medida"
                required
              />
            </CCol>
            <CCol md="4">
              <CButton color="primary" @click="saveConvertion()" class="mr-1 mb-3"><CIcon name="cil-save"/> Guardar</CButton>
            </CCol>
          </CRow>

          <!-- LISTADO -->
          <TableCustom :items="tableItems" :fields="fields" :loading="loading">

            <!-- BUTTON DELETE -->
            <template #buttonDelete="{item}">
              <BaseButton :modo="'eliminar'" @click="deleteConvertion(item.id)"></BaseButton>
            </template>

          </TableCustom>

        </CCardBody>
      </template>

      <template #header>
        <CButtonClose @click="closeModal" class="text-black"/>
      </template>
      <template #footer>
        <CButton @click="closeModal" color="danger">Cerrar</CButton>
      </template>

    </CModal>

  </div>
</template>

<script>

  import Swal from "sweetalert2"
  import {save, destroy, list, request} from '@/utils/functions.js'
  import { preventInvalidDecimal } from '@/utils/validators.js'

  export default {
    name: 'ModalConversions',
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
      unitMeasure: {
        type: Object,
        required: false,
        default: null
      },
      fields: {
        type: Array,
        default() {
          return [
              { key: "index",         label: "#",                     _classes: 'text-center' },
              { key: "text1",         label: "Unidad",                _classes: 'text-center' },
              { key: "amount",        label: "Factor de conversión",  _classes: 'text-center' },
              { key: "text2",         label: "Unidad 2",              _classes: 'text-center' },
              { key: 'buttonDelete',  label: 'Eliminar',              _classes: 'text-center', _style:'min-width:20%;' },
          ];
        },
      },
    },
    data() {
      return {
        prefix: "convertion",
        prefix_list: "convertions",
        prefix_units_measure: "units_measure",
        sale: null,
        units_measure: [],
        convertions: [],
        filters: {
          unitMeasure: 0,
          unitMeasureConvert: 0,
          amount: 0,
        },
        loading: false,
        loadingUnitMeasure: false,
        flagModalDepositsSale: false,
      };
    },
    async mounted() {
      await this.getConvertionsByUnit();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.convertions }
    },
    watch: {
      async isVisible(newValue) {
        if (newValue) {
          await this.getUnitsMeasure();
          await this.getConvertionsByUnit();
        }
      },
    },
    methods: {

      //* Main Functions 
        async getUnitsMeasure () {

          await this.request(async () => {
            const url  = this.$store.state.url
            const resp = await list(url + this.prefix_units_measure)
            this.units_measure = resp?.status === 200
              ? (resp.data?.data || []).map(r => ({ value: r.id, label: r.name }))
              : []
          }, { loadingKey: "loadingUnitMeasure" })

        },
        async getConvertionsByUnit(){

          await this.request(async () => {
            const url  = this.$store.state.url
            const resp = await list(url + this.prefix_list)
            if (resp.status === 200) this.convertions = resp.data.data || []
          }, { loadingKey: "loading" })

        },
        async saveConvertion() {

          await this.request(async () => {

            if (this.filters.amount == 0) {
              Swal.fire("Alerta", "El factor de conversión no puede ser 0", "warning")
              return
            }

            if (!this.filters.unitMeasure || this.filters.unitMeasure == 0) {
              Swal.fire("Alerta", "La Unidad de Medida es obligatoria", "warning")
              return
            }

            if (!this.filters.unitMeasureConvert || this.filters.unitMeasureConvert == 0) {
              Swal.fire("Alerta", "La Unidad de Medida 2 es obligatoria", "warning")
              return
            }

            if (this.filters.unitMeasure == this.filters.unitMeasureConvert) {
              Swal.fire("Alerta", "Las unidades de medida no pueden ser iguales", "warning")
              return
            }

            const url = this.$store.state.url
            const data = this.getSetData(this.filters)
            const resp = await save(url + this.prefix, data)

            if (resp?.status === 200) {
              this.filters.amount = 0
              await this.getConvertionsByUnit()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false
            } else {
              Swal.fire("Alerta", resp?.data?.message || "Ocurrió un error", "warning")
              this.flagModal = false
            }
          }, { loadingKey: "loading" })

        },
        async deleteConvertion(id){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: "Se eliminará la conversión",
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
              await this.getConvertionsByUnit()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          })

        },

      //* Secondary Functions
        preventInvalidDecimal,
        request,
        getSetData(data){

          let formData = new FormData();

          formData.append('id_unit_measure', data.unitMeasure);
          formData.append('amount', data.amount);
          formData.append('id_unit_measure_convert', data.unitMeasureConvert);

          return formData;

        },

        //? Modal
        closeModal(){
          this.$emit("close-modal-conversions");
        },
        openModalDepositsSale(item) {      
          this.sale = item;
          this.flagModalDepositsSale = true;
        },
        closeModalDepositsSale() {
          this.flagModalDepositsSale = false;
        },

    },
  };

</script>