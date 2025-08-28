
<template>
  <div>

    <CModal title="Listado de Ventas" size="lg" :show="isVisible">

      <slot name="header">
        <CIcon name="cil-grid"/> Listado de Ventas 
      </slot>

      <template>
        <CCardBody>

          <!-- FILTROS -->
          <CRow class="align-items-end">
            <CCol md="3">
              <CInput label="Venta" v-model="filters.consecutive" />
            </CCol>
            <CCol md="3">
              <CInput label="Cliente" disabled v-model="filters.clientName" />
            </CCol>
            <CCol md="3">
              <CSelect
                :value.sync="filters.type"
                :options=types
                label="Tipo"
                placeholder="Seleccione un tipo"
              />
            </CCol>
            <CCol md="3">
              <CButton color="primary" @click="getClientBySales" class="mr-1 mb-3">
                <CIcon name="cil-magnifying-glass" /> Buscar
              </CButton>
            </CCol>
          </CRow>

          <!-- LISTADO -->
          <TableCustom :items="tableItems" :fields="fields" :loading="loading" :items-per-page="5">

            <template #subtotal="{ item }">
              <td>S/. {{ item.subtotal }}</td>
            </template>

            <template #deposit="{ item }">
              <td>S/. {{ item.deposit }}</td>
            </template>

            <template #debt="{ item }">
              <td>S/. {{ item.subtotal - item.deposit }}</td>
            </template>

            <!-- BUTTON PAY -->
            <template #buttonSelect="{item}">
              <BaseButton :modo="'pay'" @click="openModalDepositsSale(item)"></BaseButton>
            </template>

            <!-- BUTTON VIEW -->
            <template #buttonView="{item}">
              <BaseButton :modo="'ver'" @click="sendViewSale(item)" />
            </template>

          </TableCustom>

          <!-- Fila de sumas al final -->
          <div style="text-align: right; padding: 10px; font-weight: bold;">
            <span>Último Depósito: S/. {{ lastDeposit }}</span><br>
            <span>Deuda Total: S/. {{ grandTotal }}</span><br>
          </div>

        </CCardBody>
      </template>

      <template #header>
        <CButtonClose @click="closeModal" class="text-black"/>
      </template>
      <template #footer>
        <CButton @click="closeModal" color="danger">Cerrar</CButton>
      </template>

    </CModal>

    <!-- MODAL: LISTADO DE PAGOS -->
    <CModalDepositsSale
      :isVisible="flagModalDepositsSale"
      :sale="sale"
      @get-sales-by-client="getClientBySales"
      @close-modal-deposits-sale="closeModalDepositsSale"
      @set-amount="updateAmount"
    />

  </div>
</template>

<script>

import CModalDepositsSale from "./ModalDepositsSale.vue";
import {list} from '@/utils/functions.js'

export default {
  name: 'ModalClientBySales',
  components: {
    CModalDepositsSale,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    client: {
      type: Object,
      required: false,
      default: null
    },
    fields: {
      type: Array,
      default() {
        return [
            { key: "index",         label: "#" },
            { key: "consecutive",   label: "Venta",       _classes: 'text-center' },
            { key: "date",          label: "Día",         _classes: 'text-center' },
            { key: "subtotal",      label: "Total Venta", _classes: 'text-center' },
            { key: "deposit",       label: "Depositó",    _classes: 'text-center' },
            { key: "debt",          label: "Deuda",       _classes: 'text-center' },
            { key: "buttonSelect",  label: "Pagar",       _classes: 'text-center',  _style: "min-width:20%;" },
            { key: "buttonView",    label: "Ver",         _classes: 'text-center',  _style: "min-width:20%;" },
        ];
      },
    },
  },
  data() {
    return {
      prefix: "sales_by_client",
      sale: null,
      sales: [],
      types: ['ambos', 'pendientes', 'finalizadas'],
      filters: {
        consecutive: "",
        client: 0,
        clientName: 0,
        type: "ambos",
      },
      lastDeposit: 0,
      loading: false,
      flagModalDepositsSale: false,
    };
  },
  computed: {
    grandTotal() {
      return this.formatFloat(this.sales.reduce((sum, item) => sum + (parseFloat(item.subtotal) - parseFloat(item.deposit)) || 0, 0));
    },
    tableItems () { return this.loading ? [] : this.sales }
  },
  async mounted() {
    await this.getClientBySales();
    if (this.client && this.client.lastDeposit) {
      this.lastDeposit = this.client.lastDeposit;
    }
  },
  watch: {
    async isVisible(newValue) {
      if (newValue) {
        this.lastDeposit = 0;
        await this.getClientBySales();
        if (this.client && this.client.lastDeposit) {
          this.lastDeposit = this.client.lastDeposit;
        }
      }
    },
  },
  methods: {
    async getClientBySales(){

      this.loading = true;

      try {

        this.filters.client = this.client.id;
        this.filters.clientName = this.client.name;

        const url = this.$store.state.url;
        const response = await list(url + this.prefix, this.filters);

        if (response.status === 200) {
          this.sales = response.data.data;
        }

      } catch (errors) {

        this.sales = [];

      } finally {

        this.loading = false;
        this.grandTotal;

      }

    },
    closeModal(){
      this.$emit("close-modal-sales-by-client");
    },
    openModalDepositsSale(item) { 
      this.sale = item;
      this.flagModalDepositsSale = true;
    },
    closeModalDepositsSale() {
      this.flagModalDepositsSale = false;
    },
    updateAmount(deposit) {
      this.lastDeposit = deposit;
    },
    sendViewSale(item) {

      const routeData = this.$router.resolve({ 
        name: 'Detalle venta', 
        query: { data: JSON.stringify(item) }
      });

      window.open(routeData.href, '_blank');

    },
    formatFloat(value) {
      if (isNaN(value)) {
        return "0.00";
      }
      return value.toFixed(4);
    }
  },
};
</script>