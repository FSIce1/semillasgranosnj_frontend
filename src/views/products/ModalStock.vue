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

  import {save} from '../../assets/js/methods/functions.js'
  import Swal from "sweetalert2";

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
            converted_stock : "",
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
      async saveDetail(){

        this.loadingDetail = true;

        try {

          if(this.product.stock == "" || this.product.stock == 0){
            Swal.fire("Alerta", "El Stock no puede estar vacío", "warning");
            return
          }

          const url = this.$store.state.url;
          const data = this.getSetData(this.product);
          const response = await save(url + "stock", data, null);

          if (response.status === 200) {

            Swal.fire("Alerta", response.data.message, "success");
            this.$emit("close-modal-stock");
            this.$emit("get-detail");

          }

        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loadingDetail = false;

        }

      },
      getSetData(data){

        let formData = new FormData();

        formData.append('id', data.id);
        formData.append('name', data.name);
        formData.append('equivalent', data.equivalent);
        formData.append('stock', data.stock);
        formData.append('converted_stock', data.converted_stock);

        return formData;

      },
      closeModalDetail(){
        this.$emit("close-modal-stock");
      },
      cleanModal(){
        this.product.id               = "";
        this.product.name             = "";
        this.product.equivalent       = "";
        this.product.stock            = "";
        this.product.converted_stock  = "";
      },
      setData(product){
        this.product.id               = product.id;
        this.product.name             = product.name;
        this.product.equivalent       = product.equivalent;
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