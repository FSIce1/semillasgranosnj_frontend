<template>
  <div>
    <CModal title="Agregar Venta" size="lg" :show="isVisibleModalDetail">
      <CForm novalidate>
        <CCardBody>

          <CRow>
            <CCol md="6">
              <CInput
                v-model="product.name"
                label="Nombre del Producto"
                disabled
                was-validated
              />
            </CCol>
            <CCol md="6">
              <CInput
                label="Stock"
                v-model="product.stock"
                :disabled="loadingDetail"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el stock del producto."
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
            <CIcon name="cil-save" /> Agregar Stock
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

  import {save, request} from '@/utils/functions.js'
  import Swal from "sweetalert2";
  import { preventInvalidDecimal } from '@/utils/validators.js'

  export default {
    name: "ModalStock",
    props: {
      isVisibleModalDetail: {
        type: Boolean,
        required: true,
      },
      productStock: {
        type: Object,
      },
      details: {
          type: Array,
      },
    },
    data() {
        return {
          product: {
            id              : "",
            name            : "",
            equivalent      : "",
            stock           : "",
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
          this.setData(this.productStock);
        }
      },
    },
    methods: {

      //* Main Functions
      async saveDetail(){

        await this.request(async () => {

          if(this.product.stock == "" || this.product.stock == 0){
            Swal.fire("Alerta", "El Stock no puede estar vacío", "warning");
            return
          }

          const url = this.$store.state.url
          const data = this.getSetData(this.product);
          const resp = await save(url + "stock", data, null)

          if (resp.status === 200) {

            Swal.fire("Alerta", resp.data.message, "success");
            this.$emit("close-modal-stock");
            this.$emit("get-detail");

          }

        }, { loadingKey: "loadingDetail" })

      },

      //* Secondary Functions
        preventInvalidDecimal,
        request,
        setData(product){
          this.product.id         = product.id;
          this.product.name       = product.name;
          this.product.equivalent = product.equivalent;
        },
        getSetData(data){

          let formData = new FormData();

          formData.append('id', data.id);
          formData.append('name', data.name);
          formData.append('equivalent', data.equivalent);
          formData.append('stock', data.stock);

          return formData;

        },

        //? Modal
        closeModalDetail(){
          this.$emit("close-modal-stock");
        },
        cleanModal(){
          this.product = { id:"", name:"", equivalent:"", stock:"" }
        },

    },
  };

</script>