<template>
  <div>
    <CModal title="Agregar Venta" size="lg" :show="isVisibleModalDetail">
      <CForm novalidate>
        <CCardBody>

          <CRow>
            <CCol md="6">
              <CInput
                label="Producto 1"
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
            <CCol md="6">
              <CInput
                label="Producto 2"
                v-model="detail.product2.name"
                disabled
                required
                was-validated
              >
                <template #append>
                  <CButton @click="openModalDetail2" color="primary">Seleccionar</CButton>
                </template>
              </CInput>
              <CInput type="hidden" :value.sync="detail.product2.id" />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="5">
              <CInput
                v-model="detail.amount_saco"
                label="Cantidad de la transferencia (SACO/UND)"
                @keyup.enter="saveDetail()"
                @keydown="preventInvalidDecimal($event)"
                required
                was-validated
              />
            </CCol>
          </CRow>

        </CCardBody>
      </CForm>

      <template #footer>
        <div v-if="!loadingDetail">
          <CButton color="primary" @click="saveDetail" class="mr-1 mb-3">
            <CIcon name="cil-save" /> Realizar Tranferencia
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
        :isVisible="flagModalProducts"
        type="nutrivan"
        @select-product="selectProduct"
        @close-modal-products="closeModalProducts"
    />

    <CTableProducts
        :isVisible="flagModalProducts2"
        type="nutrivan"
        @select-product="selectProduct2"
        @close-modal-products="closeModalProducts2"
    />

  </div>
</template>
  
<script>

  import Swal from "sweetalert2";
  import {save, request} from '@/utils/functions.js'
  import { preventInvalidDecimal } from '@/utils/validators.js'
  import CTableProducts from "../../modals/ModalProducts.vue";

  export default {
    name: "ModalTransfer",
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
          detail: {
            id: "",
            product: {
              "id"      : "",
              "name"    : "",
              "stock"   : "",
            },
            product2: {
              "id"    : "",
              "name"  : "",
              "stock" : "",
            },
            amount_saco : "",
          },
          flagModalProducts: false,
          flagModalProducts2: false,
          loadingDetail: false,
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

      //* Main Functions
        async saveDetail(){

          if(this.detail.product.id == ""){
            Swal.fire("Alerta", "Seleccione el producto 1", "warning");
            return
          } else if(this.detail.product2.id == ""){
            Swal.fire("Alerta", "Seleccione el producto 2", "warning");
            return
          } else if(this.detail.product.id == this.detail.product2.id){
            Swal.fire("Alerta", "Los productos no pueden ser iguales", "warning");
            return
          } else if(this.detail.amount_saco == ""){
            Swal.fire("Alerta", "Ingrese una cantidad de la transferencia (SACO/UND)", "warning");
            return
          } else if(this.detail.amount_saco <= 0){
            Swal.fire("Alerta", "La cantidad de la transferencia (SACO/UND) debe ser mayor a 0", "warning");
            return
          } else if(this.detail.amount_saco > parseFloat(this.detail.product.stock)){
            Swal.fire("Alerta", "No hay stock sufiente el producto '"+this.detail.product.name+"' cuenta con una cantidad de "+this.detail.product.stock+" sacos", "warning");
            return
          }

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.detail);
            const resp = await save(url + "transfer", data, null)

            if (resp.status === 200) {
              Swal.fire("Alerta", resp.data.message, "success");
              this.$emit("close-modal-detail");
              this.$emit("get-detail");
            }

          }, { loadingKey: "loadingDetail" })

        },

      //* Secondary Functions
        preventInvalidDecimal,
        request,
        getSetData(data){

          let formData = new FormData();

          formData.append('product1', data.product.id);
          formData.append('product2', data.product2.id);
          formData.append('amount', data.amount_saco);

          return formData;

        },
        //? Modal
        openModalDetail() {
          this.flagModalProducts = true;
        },
        openModalDetail2() {
          this.flagModalProducts2 = true;
        },
        closeModalDetail(){
          this.$emit("close-modal-detail");
        },
        closeModalProducts() {
          this.flagModalProducts = false;
        },
        closeModalProducts2() {
          this.flagModalProducts2 = false;
        },
        async selectProduct(product){                  
          this.flagModalProducts     = false;
          this.detail.product.id     = product.id;
          this.detail.product.name   = product.name;
          this.detail.product.stock  = product.stock;
        },
        async selectProduct2(product){                    
          this.flagModalProducts2    = false;
          this.detail.product2.id    = product.id;
          this.detail.product2.name  = product.name;
          this.detail.product2.stock = product.stock;
        },
        cleanModal(){
          this.detail.product.id                = "";
          this.detail.product.name              = "";
          this.detail.product.stock             = "";
          this.detail.product2.id               = "";
          this.detail.product2.name             = "";
          this.detail.product2.stock            = "";
          this.detail.amount_kg                 = "";
        },

    },
  };

</script>