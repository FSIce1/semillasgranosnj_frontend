
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisible">

      <slot name="header">
        <CIcon name="cil-grid"/> Historial de pagos de la venta # {{ saleData.consecutive }} 
      </slot>

      <template>
        <CCardBody>

          <!-- FORMULARIO DE PAGOS -->
          <CRow class="align-items-end">
            <CCol md="3">
              <CInput 
                label="Cantidad"
                v-model="deposit.amount" 
                @keydown="preventInvalidDecimal($event)"
              />
            </CCol>
            <CCol md="3">
              <CInput 
                label="Total" 
                :value.sync="saleData.total"
                disabled 
                @keydown="preventInvalidDecimal($event)"
              />
            </CCol>
            <CCol md="3">
              <CInput 
                label="Depositó" 
                :value.sync="saleData.deposit"
                disabled 
                @keydown="preventInvalidDecimal($event)"
              />
            </CCol>
            <CCol md="3">
              <CInput 
                label="Pendiente" 
                :value.sync="saleData.pending"
                disabled 
                @keydown="preventInvalidDecimal($event)"
              />
            </CCol>
            <CCol md="3">
              <CSpinner v-if="loading" size="sm" color="light" />
              <CButton v-if="!loading" color="primary" @click="saveDeposit" class="mr-1 mb-3">
                <CIcon name="cil-save" /> Realizar Pago
              </CButton>
            </CCol>
          </CRow>

          <!-- LISTADO -->
          <TableCustom :items="tableItems" :fields="fields" :loading="loading" :items-per-page="5">

            <template #amount="{ item }">
              <td>S/. {{ item.amount }}</td>
            </template>

            <!-- BUTTON DELETE -->
            <template #buttonDelete="{item}">
              <BaseButton :modo="'eliminar'" @click="deleteDeposit(item.id)"></BaseButton>
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
  import {list, save, destroy} from '@/utils/functions.js'
  import { preventInvalidDecimal } from '@/utils/validators.js'

  export default {
    name: 'ModalClientBySales',
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
      sale: {
        type: Object,
        required: false,
        default: null
      },
      fields: {
        type: Array,
        default() {
          return [
            { key: "index",         label: "#",                           _classes: 'text-center' },
            { key: "user",          label: "Usuario",                     _classes: 'text-center' },
            { key: "date",          label: "Día que se realizó el pago",  _classes: 'text-center' },
            { key: "amount",        label: "Depositó",                    _classes: 'text-center' },
            { key: 'buttonDelete',  label: 'Eliminar',                    _classes: 'text-center', _style:'min-width:20%;' },
          ];
        },
      },
    },
    data() {
      return {
        prefix_save: "sale_deposit",
        prefix_list: "sales_deposits_history",
        history: [],
        saleData: {
          consecutive: "",
          total: 0,
          deposit: 0,
          pending: 0,
        },
        filters: {
          date: "",
          sale: 0,
        },
        deposit: {
          amount: "",
          sale_id: 0,
          client_id: 0,
        },
        loading: false,
      };
    },
    async mounted() {
      await this.getDepositsHistory();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.history }
    },
    watch: {
      async isVisible(newValue) {
        if (newValue) {
          await this.getDepositsHistory();
        }
      },
    },
    methods: {
      preventInvalidDecimal,
      async getDepositsHistory(){

        this.loading = true;

        try {

          this.saleData.consecutive = this.sale.consecutive;
          this.saleData.total = this.sale.subtotal;
          this.saleData.deposit = this.sale.deposit;
          this.saleData.pending = (this.sale.subtotal - this.sale.deposit).toFixed(4);

          this.filters.sale = this.sale.id;

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {
            this.history = response.data.data;
          }

        } catch (errors) {

          this.history = [];

        } finally {

          this.loading = false;

        }

      },
      async saveDeposit(){

        this.loading = true;

        try {

          if(parseFloat(this.deposit.amount) <= 0) {
            Swal.fire("Alerta", "El depósito debe ser mayor que 0", "warning");
            this.loading = false;
            return
          }

          if(parseFloat(this.deposit.amount) > parseFloat(this.saleData.pending)){
            Swal.fire("Alerta", "El depósito no puede ser mayor a S/." + this.saleData.pending, "warning");
            this.loading = false;
            return
          }

          this.deposit.sale_id = this.sale.id;
          this.deposit.client_id = this.sale.client.id;
          const url = this.$store.state.url;
          const data = this.getSetData(this.deposit);
          const response = await save(url + this.prefix_save, data);

          if (response.status === 200) {

            if(response.data.flag){

              await this.getDepositsHistory();

              this.$emit("set-amount", parseFloat(this.deposit.amount).toFixed(4));
              this.cleanData();
              this.$emit("close-modal-deposits-sale");
              this.$emit("get-sales-by-client");

              Swal.fire("Alerta", response.data.message, "success");

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
          this.loading = false;

        }

      },
      cleanData(){
        this.deposit.amount = 0;
        this.deposit.sale_id = 0;
      },
      async deleteDeposit(id){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: "Desea eliminar el pago, se realizará el desembolso a la venta",
          icon: "warning",
          confirmButtonText: "Sí, eliminar",
          closeOnConfirm: false,
          showCancelButton: true,
          cancelButtonText: "Cancelar"
        })
        .then(async function(result) {

          if(result.value) {

            try {

              const url = el.$store.state.url;
              const response = await destroy(url+el.prefix_save+`/${id}`);

              if (response.status === 200) {

                el.getDepositsHistory();
                el.$emit("close-modal-deposits-sale");
                el.$emit("get-sales-by-client");
                Swal.fire("Alerta", response.data.message, "success");

              }

            } catch (errors) {
              
              if (errors.length > 0) {
                Swal.fire("Alerta", errors[0], "warning");
              } else {
                Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
              }

            }

          }

        });

      },
      getSetData(data){

        let formData = new FormData();
        let idUser = sessionStorage.getItem('id');

        if(idUser == undefined || idUser == null || idUser == ""){
            if (this.$route.name !== 'Login') {
                Swal.fire("Alerta", "Sesión Expirada", "warning");
                this.$router.push({ name: 'Login' });
            }
        }

        formData.append('user_id', idUser);
        formData.append('sale_id', data.sale_id);
        formData.append('client_id', data.client_id);
        formData.append('amount', data.amount);

        return formData;

      },
      closeModal(){
        this.$emit("close-modal-deposits-sale");
      }
    },
  };

</script>