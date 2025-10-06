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
                <CSelect
                  label="Boleta/Factura"
                  :disabled="loadingButtonsActions"
                  :value.sync="purchase.boleta_factura"
                  :options=types_purchases
                  @change="selectBoletaFactura"
                  placeholder="Seleccione un tipo"
                />
              </CCol>
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
                      :disabled="providers.length === 0 || loadingButtonsActions"
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
                    <small v-if="!loadingProviders && providers.length === 0" class="empty-hint-2 tight">
                      <CIcon name="cil-inbox" class="mr-1" />
                      No hay proveedores disponibles.
                    </small>
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
            </CRow>

            <CRow class="mt-3">
              <CCol md="4">
                <CSelect
                  label="Tipo de Compra"
                  :disabled="loadingButtonsActions"
                  :value.sync="purchase.type"
                  :options=types
                  placeholder="Seleccione un tipo"
                />
              </CCol>
              <CCol md="4">
                <CInput
                  label="Número de Compra"
                  :lazy="false"
                  :value="purchase.consecutive"
                  v-show="purchase.consecutive != ''"
                  disabled
                  autocomplete="off"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="12">
                <CTextarea
                  label="Descripción"
                  :disabled="loadingButtonsActions"
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
                <CButton color="success" :disabled="loadingButtonsActions" @click="openModalDetail()" class="mr-1 mb-3">
                  Agregar
                </CButton>
              </CCol>
            </CRow>

            <ModalDetail
              :isVisibleModalDetail="flagModalDetail"
              :details="purchase.details"
              @get-detail="getDetail"
              @close-modal-detail="closeModalDetail"
            />

            <!-- LISTA DE PRODUCTOS SELECCIONADOS -->
            <CTableProductsSelected :disabled="loadingButtonsActions" :items.sync="purchase.details" @get-total-general="getTotalGeneral" :loading.sync="loadingProducts">
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
                  :disabled="loadingButtonsActions"
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
                <template v-if="loadingButtonsActions">
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
                    <span v-text="btnSave"></span>
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

  import Swal from "sweetalert2"
  import ModalDetail from './ModalDetail.vue';
  import Multiselect from 'vue-multiselect'
  import {list, save, ticket, request} from '@/utils/functions.js'
  import {validateNumber, preventInvalidDecimal} from '@/utils/validators.js'
  import CTableProductsSelected from './TableListProductsSelected.vue'

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
        btnSave: "Guardar",
        disabledGeneral: false,
        types: ['contado', 'credito'],
        types_purchases: ['boleta', 'factura'],
        purchase: {
          id: "",
          consecutive: "",
          date: this.getCurrentDate(),
          provider: "",
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
        loadingProducts: false, 
        loadingButtonsActions: false,
      }
    },
    async mounted() {
      await this.getProviders(null);
      await this.getPurchase();
      this.getTotalGeneral();
      this.loadingProducts = false;
    },
    components: {
      ModalDetail,
      Multiselect,
      CTableProductsSelected
    },
    methods: {

      //* Main Functions
        async getProviders(filters){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_providers, filters)
            if (resp.status === 200){
              let setProviders = (resp.data.data).map(role => ({
                id: role.id,
                name: role.name
              }));

              this.providers = setProviders;
            }
          }, { loadingKey: "loadingProviders" })

        },
        async savePurchase(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.purchase);
            const resp = await save(url + this.prefix, data, this.purchase.id)

            if (resp.status === 200) {
              if(resp.data.flag){

                this.purchase.id = resp?.data?.data?.id;
                this.purchase.consecutive = resp?.data?.data?.consecutive;

                //? Imprime el ticket
                await this.downloadReport('purchase_pdf', '.pdf', resp.data.message);

                this.$router.push({ 
                  name: 'Listado compras'
                });

                } else {

                Swal.fire("Alerta", resp.data.message, "warning");

              }
            }

          }, { loadingKey: "loadingButtonsActions" })

        },
        async getPurchase(){

          const data = this.$route.query.data;

          if (data && typeof data === 'string' && data.trim() !== '') {

            const item = JSON.parse(data);

            this.purchase.id              = item.id;
            this.purchase.consecutive     = item.consecutive;
            this.purchase.type            = item.type;
            this.purchase.date            = item.date;
            this.purchase.provider        = item.provider;
            this.purchase.description     = item.description;
            this.purchase.subtotal        = item.subtotal;
            this.purchase.deposit         = item.deposit;
            this.purchase.consumption     = item.consumption;
            this.purchase.boleta_factura  = item.boleta_factura;
            this.purchase.total           = item.total;
            this.purchase.details         = item.details;

            this.disabledGeneral  = true;
            this.btnSave          = "Modificar";
            this.title            = "Modificar Compra";

          }

        },
        async downloadReport(method, extention, message) {

          const res = await Swal.fire({
            title: "Ticket",
            html: "¿Desea imprimir el ticket?",
            icon: "warning",
            confirmButtonText: "Sí",
            closeOnConfirm: false,
            showCancelButton: true,
            cancelButtonText: "No"
          })

          if (!res.value) return

          await this.request(async () => {

            const url = this.$store.state.url
            await ticket(url+method, this.purchase, "reporte #" + this.purchase.consecutive+extention);

            Swal.fire("Alerta", message, "success");

          })

        },

      //* Secondary Functions
        request,
        validateNumber,
        preventInvalidDecimal,
        getCurrentDate() {

          const today = new Date();

          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();

          return `${day}/${month}/${year}`;

        },
        getDetail(data){

          let total = (data.amount * data.price).toFixed(4);

          const newDetail = {
            "product": {
              "id": data.product.id,
              "name": data.product.name,
              "um": data.um,
            },
            um: data.um,
            amount: data.amount,
            name_unit_measure: data.um_name,
            price: data.price,
            total: total,
          };

          this.purchase.details = [...this.purchase.details, newDetail];
          this.loadingProducts = false;

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
              formData.append(`details[${index}][um]`, detail.um);
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

          for (let index = 0; index < this.purchase.details.length; index++) {
            total += parseFloat(this.purchase.details[index].price) * parseFloat(this.purchase.details[index].amount);
          }

          this.purchase.total = parseFloat(total);

          if(deposit > total){

            this.purchase.deposit  = 0;
            this.purchase.subtotal = parseFloat(total);
            this.purchase.total    = parseFloat(total);

            Swal.fire("Alerta", "El depósito no puede ser mayor que el total", "warning");

          } else {

            this.purchase.subtotal = parseFloat(total);
            this.purchase.total     = parseFloat(this.purchase.subtotal) - parseFloat(deposit);

          }

          return total;

        },
        async selectBoletaFactura(){
          if(this.purchase.boleta_factura == "factura"){
            await this.getProviders({type_document: 'ruc'});
          } else {
            await this.getProviders(null);
          }
          this.purchase.client = "";
          this.getTotalGeneral();
        },

        //? Modal
        openModalDetail(){
          this.flagModalDetail = true;
        },
        closeModalDetail(){
          this.flagModalDetail = false;
        },

    }
  }

</script>
