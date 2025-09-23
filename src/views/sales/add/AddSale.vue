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
                <template v-if="loadingClients">
                  <div class="spinner-border m-4" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                </template>
                <template v-else>
                  <div>
                    <label>Cliente</label>
                    <multiselect
                      v-model="sale.client"
                      :disabled="loadingButtonsActions"
                      :options=clients
                      placeholder="Selecciona el cliente"
                      label="name"
                      track-by="id"
                      select-label="Presiona para seleccionar"
                      selected-label="Seleccionado"
                      deselect-label="Presiona para quitar"
                    >
                      <!-- Lista vacía (sin opciones) -->
                      <template #noOptions>
                        <span class="text-muted">No hay clientes disponibles</span>
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
                  :value="sale.date"
                  disabled
                  autocomplete="off"
                />
              </CCol>
              <CCol md="4">
                <CInput
                  label="Número de Venta"
                  :lazy="false"
                  :value="sale.consecutive"
                  disabled
                  autocomplete="off"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="4">
                <CSelect
                  label="Tipo de Venta"
                  :disabled="loadingButtonsActions"
                  :value.sync="sale.type"
                  :options=types
                  placeholder="Seleccione un tipo"
                />
              </CCol>
              <CCol md="4">
                <CSelect
                  label="Boleta/Factura"
                  :disabled="loadingButtonsActions"
                  :value.sync="sale.boleta_factura"
                  :options=types_sales
                  placeholder="Seleccione un tipo"
                />
              </CCol>
              <CCol v-if="sale.boleta_factura == 'factura'" md="4">
                <CInput
                  label="RUC"
                  :disabled="loadingButtonsActions"
                  :value.sync="sale.ruc"
                  @keydown="validateNumber"
                  maxlength="11"
                  placeholder="Ingresa el ruc..."
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="12">
                <CTextarea
                  label="Descripción"
                  :disabled="loadingButtonsActions"
                  :value.sync="sale.description"
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
              :details="sale.details"
              @get-detail="getDetail"
              @close-modal-detail="closeModalDetail"
            />

            <!-- LISTA DE PRODUCTOS SELECCIONADOS -->
            <CTableProductsSelected :disabled="loadingButtonsActions" :items="sale.details" @get-total-general="getTotalGeneral" :loading="loadingProducts">
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
                  v-model="sale.subtotal"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6">
              </CCol>
              <CCol v-if="sale.type == 'credito'" md="6">
                <CInput
                  horizontal
                  label="Depositó (S/.)"
                  :disabled="loadingButtonsActions"
                  @input="getTotalGeneral()"
                  @keydown="preventInvalidDecimal($event)"
                  v-model="sale.deposit"
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
                  :value.sync="sale.total"
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
                  <CButton color="primary" @click="saveSale()" class="mr-1 mb-3">
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
  import CTableProductsSelected from '../add/TableListProductsSelected.vue'

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    name: 'AddSale',
    data() {
      return {
        prefix: "sale",
        prefix_clients: "clients",
        clients: [],
        title: "Nueva Venta",
        btnSave: "Guardar",
        disabledGeneral: false,
        types: ['contado', 'credito'],
        types_sales: ['boleta', 'factura'],
        sale: {
          id: "",
          consecutive: "",
          date: this.getCurrentDate(),
          client: "",
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
        loadingClients: false,
        loadingProducts: false, 
        loadingButtonsActions: false,
      }
    },
    async mounted() {
      await this.getClients();
      await this.getSale();
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
        async getClients(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_clients)
            if (resp.status === 200){
              let setClients = (resp.data.data).map(role => ({
                id: role.id,
                name: role.name
              }));

              this.clients = setClients;
            }
          }, { loadingKey: "loadingClients" })

        },
        async saveSale(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.sale);
            const resp = await save(url + this.prefix, data, this.sale.id)

            if (resp.status === 200) {
              if(resp.data.flag){

                this.sale.id = resp?.data?.data?.id;
                this.sale.consecutive = resp?.data?.data?.consecutive;

                //? Imprime el ticket
                await this.downloadReport('sale_pdf', '.pdf', resp.data.message);

                this.$router.push({ 
                  name: 'Listado ventas'
                });

                } else {

                Swal.fire("Alerta", resp.data.message, "warning");

              }
            }

          }, { loadingKey: "loadingButtonsActions" })

        },
        async getSale(){

          const data = this.$route.query.data;

          if (data && typeof data === 'string' && data.trim() !== '') {

            const item = JSON.parse(data);

            this.sale.id              = item.id;
            this.sale.consecutive     = item.consecutive;
            this.sale.date            = item.date;
            this.sale.client          = item.client;
            this.sale.description     = item.description;
            this.sale.subtotal        = item.subtotal;
            this.sale.deposit         = item.deposit;
            this.sale.consumption     = item.consumption;
            this.sale.boleta_factura  = item.boleta_factura;
            this.sale.ruc             = item.ruc;
            this.sale.total           = item.total;
            this.sale.details         = item.details;

            this.disabledGeneral  = true;
            this.btnSave          = "Modificar";
            this.title            = "Modificar Venta";

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
            await ticket(url+method, this.sale, "reporte #" + this.sale.consecutive+extention);

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
            amount: data.amount,
            name_unit_measure: data.um_name,
            price: data.price,
            total: total,
          };

          this.sale.details.push(newDetail);
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
          formData.append('client_id', data.client.id);
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
            // formData.append(`details[${index}][um]`, detail.product.id_unit_measure);
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
          let deposit = (this.sale.deposit == "" || this.sale.type == "contado") ? 0 : this.sale.deposit;

          for (let index = 0; index < this.sale.details.length; index++) {
            total += parseFloat(this.sale.details[index].price) * parseFloat(this.sale.details[index].amount);
          }

          this.sale.total = parseFloat(total);

          if(deposit > total){

            this.sale.deposit  = 0;
            this.sale.subtotal = parseFloat(total);
            this.sale.total    = parseFloat(total);

            Swal.fire("Alerta", "El depósito no puede ser mayor que el total", "warning");

          } else {

            this.sale.subtotal = parseFloat(total);
            this.sale.total     = parseFloat(this.sale.subtotal) - parseFloat(deposit);

          }

          return total;

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
