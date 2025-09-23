<template>
  <div>
    <CModal title="Agregar Detalle" size="lg" :show="isVisibleModalDetail">
      <CForm novalidate>
        <CCardBody>

          <CRow>

            <!-- LOTES -->
            <CCol md="4" class="compact-field">
              <label class="form-label mb-1">Lotes</label>
              <div v-if="loadingLots">
                <div class="spinner-border spinner-border-sm mr-2"></div>
                <span>Cargando lotes…</span>
              </div>
              <template v-else>
                <CSelect
                  :value.sync="detail.lot_id"
                  :options=lots
                  placeholder="Seleccione un lote"
                  :disabled="lots.length === 0"
                  required
                />
                <small v-if="!loadingLots && lots.length === 0" class="empty-hint tight">
                  <CIcon name="cil-inbox" class="mr-1" />
                  No hay lotes disponibles.
                </small>
              </template>
            </CCol>

            <!-- CANTIDAD -->
            <CCol md="4">
              <label class="form-label mb-1">Cantidad</label>
              <CInput
                v-model="detail.quantity_in"
                @keydown="preventInvalidDecimal($event)"
                required
                was-validated
              />
            </CCol>

            <!-- UNIDADES DE MEDIDA -->
            <CCol md="4" class="compact-field">
              <label class="form-label mb-1">Unidades de medida</label>
              <div v-if="loadingUnitsMeasure">
                <div class="spinner-border spinner-border-sm mr-2"></div>
                <span>Cargando unidades de medida…</span>
              </div>
              <template v-else>
                <CSelect
                  :value.sync="detail.unit_measure_id"
                  :options=units_measure
                  placeholder="Seleccione una unidad de medida"
                  :disabled="units_measure.length === 0"
                  required
                />
              </template>
              <small v-if="!loadingUnitsMeasure && units_measure.length === 0" class="empty-hint tight">
                <CIcon name="cil-inbox" class="mr-1" />
                No hay unidades de medida disponibles.
              </small>
            </CCol>

          </CRow>

          <CRow class="mt-2">
            <CCol md="12">
              <label class="form-label mb-1">Producto</label>
              <CTextarea
                :value.sync="detail.description"
                placeholder="Describa el producto..."
                vertical
                required
                rows="3"
              />
            </CCol>
          </CRow>

        </CCardBody>
      </CForm>

      <template #footer>
        <div v-if="!loadingDetail">
          <CButton  class="mr-1 mb-3" color="primary" :disabled="isSavingDisabled" @click="saveDetail">
            <CIcon name="cil-save" /> Agregar Detalle
          </CButton>
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

      <template #header>
        <CButtonClose @click="closeModalDetail" class="text-black"/>
      </template>

    </CModal>

  </div>
</template>
  
<script>

  import Swal from "sweetalert2";
  import {list, request} from '@/utils/functions.js'
  import { preventInvalidDecimal } from '@/utils/validators.js'

  export default {
    name: "ModalDetail",
    props: {
      isVisibleModalDetail: { type: Boolean, required: true },
      warehouse: { type: Object, required: false },
      details: { type: Array },
    },
    data() {
      return {
        prefix_units_measure: "units_measure",
        prefix_lots: "lots_warehouse",
        detail: {
          id: "",
          lot_id: "",
          quantity_in: "",
          unit_measure_id: "",
          description: "",
        },
        units_measure: [],
        lots: [],
        loadingUnitsMeasure: false,
        loadingLots: false,
        loadingDetail: false,
      };
    },
    watch: {
      async isVisibleModalDetail(newValue) {
        if (newValue) {
          this.cleanModal();
          if(this.warehouse != null || this.warehouse != ""){
            await Promise.all([this.getUnitsMeasure(), this.getLots(this.warehouse)]);
          }
        }
      },
    },
    computed: {
      isSavingDisabled() {
        if (this.loadingDetail || this.loadingLots || this.loadingUnitsMeasure) return true;
        const { ok } = this.validateDetail();
        return !ok;
      },
    },
    methods: {

      //* Main Functions
        async getUnitsMeasure(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_units_measure)
            if (resp.status === 200) {
              let setUnitsMeasure = (resp.data.data).map(unitMeasure => ({
                value: unitMeasure.id, 
                label: unitMeasure.name
              }));

              this.units_measure = setUnitsMeasure;
            } else {
              this.units_measure = [];
            }
            if (this.units_measure.length === 0) this.detail.unit_measure_id = "";
          }, { loadingKey: "loadingUnitsMeasure" })

        },
        async getLots(warehouse_id){

          await this.request(async () => {

            const url = this.$store.state.url
            const resp = await list(url + this.prefix_lots, {warehouse_id: warehouse_id})
            if (resp.status === 200) {
              let setLots = (resp.data.data).map(lot => ({
                value: lot.id, 
                label: lot.name
              }));

              this.lots = setLots;
            } else {
              this.lots = [];
            }
            if (this.lots.length === 0) this.detail.lot_id = "";
          }, { loadingKey: "loadingLots" })

        },
        saveDetail(){

          const { ok, msg } = this.validateDetail();
          if (!ok) {
            Swal.fire("Alerta", msg, "warning");
            return;
          }

          this.loadingDetail = true;

          try {

            const qty = parseFloat(this.detail.quantity_in);
            const lotOpt = this.lots.find(o => String(o.value) === String(this.detail.lot_id));
            const umOpt  = this.units_measure.find(o => String(o.value) === String(this.detail.unit_measure_id));

            const payload = {
              ...this.detail,
              quantity_in: isNaN(qty) ? 0 : qty,
              lot_name: lotOpt ? lotOpt.label : "",
              unit_measure_name: umOpt ? umOpt.label : ""
            };

            Swal.fire("Alerta", "Agregado Correctamente", "success");
            this.$emit("close-modal-detail");
            this.$emit("get-detail", payload);

            this.loadingDetail = false;

          } finally {

            this.loadingDetail = false;

          }

        },

      //* Secondary Functions
        request,
        preventInvalidDecimal,
        validateDetail() {
          const lotOk = !!this.detail.lot_id;
          const qty = parseFloat(this.detail.quantity_in);
          const qtyOk = Number.isFinite(qty) && qty > 0;
          const umOk = !!this.detail.unit_measure_id;
          const descriptionOk = !!this.detail.description;

          if (!lotOk) return { ok: false, msg: "Debe seleccionar el lote" };
          if (!qtyOk) return { ok: false, msg: "La cantidad debe ser mayor a 0" };
          if (!umOk) return { ok: false, msg: "Debe seleccionar la unidad de medida" };
          if (!descriptionOk) return { ok: false, msg: "Debe ingresar el producto" };
          return { ok: true };
        },

        //? Modal
        closeModalDetail(){
          this.$emit("close-modal-detail");
        },
        cleanModal(){
          this.detail = {
            id: "",
            lot_id: "",
            quantity_in: "",
            unit_measure_id: "",
            description: "",
          };
        },

    },
  };

</script>