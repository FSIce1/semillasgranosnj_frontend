<template>
  <CCard>
    <CCardHeader>
      <CIcon name="cil-notes"/> {{title}}
    </CCardHeader>
    <CCardBody>
      <CRow>
        <CCol lg="12">
          <CForm>

            <CRow>
              <CCol md="4">
                <template v-if="loadingProviders">
                  <div class="spinner-border m-4" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                </template>
                <template v-else>
                  <div>
                    <label>Proveedor</label>
                    <multiselect
                      v-model="purchase.provider"
                      :options=providers
                      placeholder="Selecciona el proveedor"
                      label="name"
                      track-by="id"
                      select-label="Presiona para seleccionar"
                      selected-label="Seleccionado"
                      deselect-label="Presiona para quitar"
                    >
                      <!-- Lista vacía (sin opciones) -->
                      <template #noOptions>
                        <span class="text-muted">No hay proveedores disponibles</span>
                      </template>

                      <!-- Sin resultados al buscar -->
                      <template #noResult>
                        <span class="text-muted">No se encontraron resultados</span>
                      </template>
                    </multiselect>
                    <br>
                  </div>
                </template>
              </CCol>
              <CCol md="4">
                <CInput
                  label="Fecha Actual"
                  :lazy="false"
                  :value="purchase.date"
                  disabled
                  autocomplete="off"
                />
              </CCol>
              <CCol md="4">
                <CInput
                  label="Número de Venta"
                  :lazy="false"
                  :value="purchase.consecutive"
                  disabled
                  autocomplete="off"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="4">
                <CSelect
                  :value.sync="purchase.type"
                  :options=types
                  label="Tipo de Compra"
                  placeholder="Seleccione un tipo"
                />
              </CCol>
              <CCol md="4">
                <CSelect
                  :value.sync="purchase.boleta_factura"
                  :options=types_purchases
                  label="Boleta/Factura"
                  placeholder="Seleccione un tipo"
                />
              </CCol>
              <CCol v-if="purchase.boleta_factura == 'factura'" md="4">
                <CInput
                  :value.sync="purchase.ruc"
                  @keydown="validateNumber"
                  label="RUC"
                  maxlength="11"
                  placeholder="Ingresa el ruc..."
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="12">
                <CTextarea
                  label="Descripción"
                  :value.sync="purchase.description"
                  placeholder="Ingrese una descripción..."
                  vertical
                  rows="3"
                />
              </CCol>
            </CRow>

            <!-- AGREGAR DETALLE -->
            <CRow>
              <CCol md="4">
                <CButton color="success" @click="openModalDetail()" class="mr-1 mb-3">
                  Agregar
                </CButton>
              </CCol>
            </CRow>

            <ModalDetail
              :details="purchase.details"
              :isVisibleModalDetail="flagModalDetail"
              @get-detail="getDetail"
              @close-modal-detail="closeModalDetail"
            />

            <!-- LISTA DE PRODUCTOS SELECCIONADOS -->
            <CTableProductsSelected :items="purchase.details" @get-total-general="getTotalGeneral">
              <template #header>
                <CIcon name="cil-grid"/> Listado de Productos seleccionados
              </template>
            </CTableProductsSelected>

            <CRow>
              <CCol md="6">
              </CCol>
              <CCol md="6">
                <CInput
                  horizontal
                  label="Subtotal (S/.)"
                  disabled
                  @input="getTotalGeneral()"
                  @keydown="preventInvalidDecimal($event)"
                  v-model="purchase.subtotal"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6">
              </CCol>
              <CCol v-if="purchase.type == 'credito'" md="6">
                <CInput
                  horizontal
                  label="Depositó (S/.)"
                  @input="getTotalGeneral()"
                  @keydown="preventInvalidDecimal($event)"
                  v-model="purchase.deposit"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6">
              </CCol>
              <CCol md="6">
                <CInput
                  horizontal
                  disabled
                  label="Total (S/.)"
                  :value.sync="purchase.total"
                />
              </CCol>
            </CRow>

            <!-- ACCIONES -->
            <CRow>
              <CCol md="4">
                <template v-if="!loadingButtonsActions">
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
                </template>
                <template v-else>
                  <CButton color="primary" @click="savePurchase()" class="mr-1 mb-3">
                    <CIcon name="cil-save" class="mr-1"/>
                    <span v-text="btnSaveSale"></span>
                  </CButton>
                </template>
              </CCol>
            </CRow>
            
          </CForm>
          <br/>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>

  import CTableProductsSelected from './TableListProductsSelected.vue'
  import ModalDetail from './ModalDetail.vue';
  import Multiselect from 'vue-multiselect'
  import Swal from "sweetalert2"
  import {list, save, ticket} from '../../../assets/js/methods/functions.js'

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    name: 'AddPurchase',
    data() {
      return {
        prefix: "purchase",
        prefix_providers: "providers",
        providers: [],
        title: "Nueva Compra",
        btnSaveSale: "Guardar",
        disabledGeneral: false,
        types: ['contado', 'credito'],
        types_purchases: ['boleta', 'factura'],
        purchase: {
          id: "",
          consecutive: "",
          date: this.getCurrentDate(),
          provider: "",
          ruc: "",
          description: "",
          subtotal: 0,
          deposit: 0,
          consumption: 0,
          total: 0,
          type: "contado",
          boleta_factura: "boleta",
          details: []
        },
        flagModalDetail: false,
        loadingProviders: false,
        loadingButtonsActions: true,
      }
    },
    async mounted() {
      await this.getProviders();
      await this.getPurchase();
      this.getTotalGeneral();
    },
    components: {
      ModalDetail,
      Multiselect,
      CTableProductsSelected
    },
    methods: {
      async getProviders(){

        this.loadingProviders = true;

        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_providers);

          if (response.status === 200) {

            let setProviders = (response.data.data).map(role => ({
              id: role.id,
              name: role.name
            }));

            this.providers = setProviders;

          }
        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loadingProviders = false;

        }

      },
      async savePurchase(){

        this.loadingButtonsActions = false;

        try {

          const url = this.$store.state.url;
          const data = this.getSetData(this.purchase);
          const response = await save(url + this.prefix, data, this.purchase.id);

          if (response.status === 200) {

            if(response.data.flag){

              // Swal.fire("Alerta", response.data.message, "success");

              this.title = "Modificar Compra";
              this.btnSaveSale = "Modificar";
              this.purchase.id = response?.data?.data?.id;
              this.purchase.consecutive = response?.data?.data?.consecutive;

              //? Imprime el ticket
              await this.downloadReport('purchase_pdf', '.pdf', response.data.message);

              this.$router.push({ 
                name: 'Listado compras'
              });

            } else {

              Swal.fire("Alerta", response.data.message, "warning");

            }

          }

        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loadingButtonsActions = true;

        }

      },
      async getPurchase(){

        const data = this.$route.query.data;

        if (data && typeof data === 'string' && data.trim() !== '') {

          const item = JSON.parse(data);

          this.purchase.id          = item.id;
          this.purchase.consecutive = item.consecutive;
          this.purchase.date        = item.date;
          this.purchase.provider    = item.provider;
          this.purchase.description = item.description;
          this.purchase.subtotal    = item.subtotal;
          this.purchase.deposit     = item.deposit;
          this.purchase.consumption = item.consumption;
          this.purchase.total       = item.total;
          this.purchase.details     = item.details;

          this.disabledGeneral  = true;
          this.title = "Modificar Compra";

        }

      },
      async downloadReport(method, extention, message) {

        let el = this;

        Swal.fire({
          title: "Ticket",
          html: "¿Desea imprimir el ticket?",
          icon: "warning",
          confirmButtonText: "Sí",
          closeOnConfirm: false,
          showCancelButton: true,
          cancelButtonText: "No"
        })
        .then(async function(result) {

          if(result.value) {

            try {

              const url = el.$store.state.url;

              await ticket(url+method, el.purchase, "reporte #"+el.purchase.consecutive+extention);

              Swal.fire("Alerta", message, "success");

            } catch (errors) {

              if (errors.length > 0) {
                Swal.fire("Alerta", errors[0], "warning");
              } else {
                Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
              }

            }

          } else {

            Swal.fire("Alerta", message, "success");

          }

        });

      },
      validateNumber(event) {

        const key = event.key;

        // Permite solo números, un solo punto decimal, y teclas útiles como Retroceso, Suprimir, etc.
        if (!/^[0-9]$/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
          event.preventDefault();
          return;
        }

        // Permitir borrar (Backspace, Delete) y escribir nuevamente en la parte entera
        if (['Backspace', 'Delete'].includes(key)) {
          return; // Permite borrar sin restricciones
        }

      },
      getCurrentDate() {

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();

        return `${day}/${month}/${year}`;

      },
      openModalDetail(){
        this.flagModalDetail = true;
      },
      closeModalDetail(){
        this.flagModalDetail = false;
      },
      getDetail(data){

        let total = (data.amount * data.price).toFixed(4);

        const newDetail = {
          "product": {
            "id": data.product.id,
            "name": data.product.name,
            "um": data.um,
            // "um": data.product.um,
          },
          amount: data.amount,
          // name_unit_measure: data.product.um,
          name_unit_measure: data.um_name,
          price: data.price,
          total: total,
        };

        this.purchase.details.push(newDetail);
        this.getTotalGeneral();

      },
      getSetData(data){

        let formData = new FormData();
        let id = -1;
        let idUser = sessionStorage.getItem('id');

        if(idUser == undefined || idUser == null || idUser == ""){
            if (this.$route.name !== 'Login') {
                Swal.fire("Alerta", "Sesión Expirada", "warning");
                this.$router.push({ name: 'Login' });
            }
        }

        formData.append('user_id', idUser);
        formData.append('provider_id', data.provider.id);
        formData.append('deposit', data.deposit);
        formData.append('consumption', data.consumption);
        formData.append('subtotal', data.subtotal);
        formData.append('total', data.total);
        formData.append('type', data.type);
        formData.append('boleta_factura', data.boleta_factura);
        formData.append('ruc', data.ruc);
        formData.append('description', data.description);

        (data.details).forEach(function(detail, index) {

            id = (detail.id != null && detail.id != undefined && detail.id != "") ? detail.id : -1;

            formData.append(`details[${index}][id]`, id);
            formData.append(`details[${index}][product_id]`, detail.product.id);
            formData.append(`details[${index}][um]`, detail.product.um);
            formData.append(`details[${index}][amount]`, detail.amount);
            formData.append(`details[${index}][name_unit_measure]`, detail.name_unit_measure);
            formData.append(`details[${index}][price]`, detail.price);
            formData.append(`details[${index}][total]`, detail.total);

        });

        return formData;

      },
      getTotalGeneral() {

        let total = 0;
        let deposit = (this.purchase.deposit == "" || this.purchase.type == "contado") ? 0 : this.purchase.deposit;
        // let consumption = (this.purchase.consumption == "") ? 0 : this.purchase.consumption;

        for (let index = 0; index < this.purchase.details.length; index++) {
          total += parseFloat(this.purchase.details[index].price) * parseFloat(this.purchase.details[index].amount);
        }

        // this.purchase.total = parseFloat(total) + parseFloat(consumption);
        this.purchase.total = parseFloat(total);

        if(deposit > total){

          this.purchase.deposit  = 0;
          this.purchase.subtotal = parseFloat(total);
          this.purchase.total    = parseFloat(total);
          // this.purchase.subtotal = parseFloat(total) + parseFloat(consumption);
          // this.purchase.total    = parseFloat(total) + parseFloat(consumption);

          Swal.fire("Alerta", "El depósito no puede ser mayor que el total", "warning");

        } else {

          this.purchase.subtotal = parseFloat(total);
          // this.purchase.subtotal = parseFloat(total) + parseFloat(consumption);
          this.purchase.total     = parseFloat(this.purchase.subtotal) - parseFloat(deposit);

        }

        return total;

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

        // Limitar la parte decimal a 2 dígitos
        if (decimalPart && decimalPart.length >= 2 && value.includes('.')) {
          event.preventDefault();
        }
      },
    }
  }

</script>
