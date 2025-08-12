<template>
  <div>
    <CModal title="Agregar Venta" size="lg" :show="isVisibleModalDetail">
      <CForm novalidate>
        <CCardBody>
          <CRow>
            <CCol md="12">
              <CInput
                label="Producto"
                v-model="detail.product.name"
                disabled
                required
                was-validated
              >
                <template #append>
                  <CButton @click="openModalDetail" color="primary">Seleccionar</CButton>
                </template>
              </CInput>
              <CInput type="hidden" :value.sync="detail.product.id" />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="4">
              <CInput
                v-model="detail.product.stock"
                disabled
                label="Stock"
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CInput
                v-model="detail.product.um"
                disabled
                label="Unidad de Medida"
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CSelect
                :value.sync="detail.um"
                :disabled="detail.product.id == ''"
                :options=units_measure
                label="Unidad de Medida a convertir"
                placeholder="Seleccione una unidad de medida"
                required
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="6">
              <CInput
                v-model="detail.price"
                @keydown="preventInvalidDecimal($event)"
                label="Precio de venta"
                required
                was-validated
              />
            </CCol>
            <CCol md="6">
              <CInput
                v-model="detail.amount"
                @keydown="preventInvalidDecimal($event)"
                label="Cantidad"
              />
            </CCol>
          </CRow>

        </CCardBody>
      </CForm>

      <template #footer>
        <div v-if="!loadingDetail">
          <CButton color="primary" @click="saveDetail" class="mr-1 mb-3">
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

    <!-- MODAL: LISTADO DE PRODUCTOS -->
    <CTableProducts
        :details="details"
        :isVisible="flagModalProducts"
        @select-product="selectProduct"
        @close-modal-products="closeModalProducts"
    />

  </div>
</template>
  
<script>

  import CTableProducts from "../../modals/ModalProducts.vue";
  import Swal from "sweetalert2";
  import {list} from '../../../assets/js/methods/functions.js'

  export default {
    name: "ModalDetail",
    components: {
        CTableProducts,
    },
    props: {
      isVisibleModalDetail: {
        type: Boolean,
        required: true,
      },
      details: {
          type: Array,
      },
    },
    data() {
        return {
          prefix_units_measure: "units_measure_convert",
          detail: {
            id: "",
            product: {
              "id"               : "",
              "name"             : "",
              "code"              : "",
              "id_unit_measure"   : 0,
              "slug"              : "",
              "um"                : "",
              "stock"             : "",
              "minimum_quantity"  : "",
              "equivalent"        : "",
            },
            um: 0,
            um_name: 0,
            equivalent: "",
            amount: "",
            price : "",
            total: 0,
          },
          units_measure: [],
          loadingUnitMeasure: false,
          loadingDetail: false,
          flagModalProducts: false,
          loadingButtonsActions: true,
          loadingUnitsMeasure: false,
          loadingAmount: false,
        };
    },
    watch: {
      isVisibleModalDetail(newValue) {
        if (newValue) {
          this.cleanModal();
        }
      },
    },
    methods: {
      async getUnitsMeasure(id_unit_measure){

        this.loading = true;
        this.loadingUnitMeasure = true;

        try {

          let filters = {
            id_unit_measure : id_unit_measure,
          };

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_units_measure, filters);

          if (response.status === 200) {

            let setUnitsMeasure = (response.data.data).map(unitMeasure => ({
              value: unitMeasure.id, 
              label: unitMeasure.name
            }));

            this.units_measure = setUnitsMeasure;

          }

        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loadingUnitMeasure = false;

        }

      },
      openModalDetail() {
        this.flagModalProducts = true;
      },
      saveDetail(){

        if(this.detail.product.id == ""){
          Swal.fire("Alerta", "Seleccione un producto", "warning");
          return
        } else if(this.detail.price == ""){
          Swal.fire("Alerta", "Ingrese un precio", "warning");
          return
        } else if(this.detail.price <= 0){
          Swal.fire("Alerta", "El precio debe ser mayor a 0", "warning");
          return
        } else if(this.detail.um == 0 || this.detail.um == "" || this.detail.um == undefined){
          Swal.fire("Alerta", "Debe seleccionar la unidad de medida a convertir", "warning");
          return
        }

        if(this.detail.amount == ""){
          Swal.fire("Alerta", "Ingrese una cantidad", "warning");
          return
        } else if(this.detail.amount <= 0){
          Swal.fire("Alerta", "La cantidad debe ser mayor a 0", "warning");
          return
        }

        (this.units_measure).forEach(element => {
          if(element.value == this.detail.um){
            console.log(element);
            this.detail.um_name = element.label;
          }
        });

        Swal.fire("Alerta", "Agregado Correctamente", "success");
        this.$emit("close-modal-detail");
        this.$emit("get-detail", this.detail);

        this.loadingDetail = false;

      },
      closeModalDetail(){
        this.$emit("close-modal-detail");
      },
      closeModalProducts() {
        this.flagModalProducts = false;
      },
      async selectProduct(product){  

        await this.getUnitsMeasure(product.id_unit_measure);

        this.flagModalProducts                = false;
        this.detail.product.id                = product.id;
        this.detail.product.name              = product.name;
        this.detail.product.code              = product.cod_product;
        this.detail.product.id_unit_measure   = product.id_unit_measure;
        this.detail.product.um                = product.unit_measure;
        this.detail.product.slug              = product.unit_measure_data.slug ?? "kg";
        this.detail.product.stock             = product.stock;
        this.detail.product.minimum_quantity  = product.minimum_quantity;
        this.detail.equivalent                = product.equivalent;
        this.detail.price                     = product.price_purchase;
      },
      cleanModal(){
        this.detail.product.id                = "";
        this.detail.product.name              = "";
        this.detail.product.code              = "";
        this.detail.product.id_unit_measure   = 0;
        this.detail.product.slug              = "";
        this.detail.product.um                = "";
        this.detail.product.stock             = "";
        this.detail.product.minimum_quantity  = "";
        this.detail.product.equivalent        = "";
        this.detail.um                        = 0;
        this.detail.um_name                   = "";
        this.detail.price                     = "";
        this.detail.equivalent                = "";
        this.detail.amount                    = "";
      },
      preventInvalidDecimal(event) {
        const key = event.key;
        const value = event.target.value;
        const selectionStart = event.target.selectionStart;
        const selectionEnd = event.target.selectionEnd;

        // Permitir sobrescribir el contenido seleccionado sin bloquear por largo de la cadena
        const isReplacing = selectionStart !== selectionEnd;

        // Permite solo números, un solo punto decimal, y teclas útiles como Retroceso, Suprimir, etc.
        if (!/^[0-9]$/.test(key) && key !== '.' && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
          event.preventDefault();
          return;
        }

        // Permitir borrar (Backspace, Delete) y escribir nuevamente en la parte entera
        if (['Backspace', 'Delete'].includes(key)) {
          return; // Permite borrar sin restricciones
        }

        // Asegura que solo se permita un punto decimal
        if (key === '.' && value.includes('.')) {
          event.preventDefault();
          return;
        }

        // Si estamos reemplazando texto, permite que se complete la sobrescritura
        if (isReplacing) {
          return;
        }

        // Limitar la parte entera a 8 dígitos si ya hay un punto decimal
        const [integerPart, decimalPart] = value.split('.');

        // Si no hay parte entera, permite seguir escribiendo (por si se borró todo)
        if (!integerPart && key !== '.') {
          return;
        }

        // Limitar la parte entera a 8 dígitos si ya hay un punto decimal o aún no se ha ingresado
        if (integerPart && integerPart.length >= 8 && key !== '.' && !value.includes('.')) {
          event.preventDefault();
          return;
        }

        // Limitar la parte decimal a 4 dígitos
        if (decimalPart && decimalPart.length >= 4 && value.includes('.')) {
          event.preventDefault();
        }
      },
    },
  };

</script>