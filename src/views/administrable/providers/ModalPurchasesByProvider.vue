
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisible">

      <slot name="header">
        <CIcon name="cil-grid"/> Listado de Compras 
      </slot>

      <template>
        <CCardBody>

          <!-- FILTROS -->
          <CRow class="align-items-end">
            <CCol md="3">
              <CInput label="Compra" v-model="filters.consecutive" />
            </CCol>
            <CCol md="3">
              <CInput label="Proveedor" disabled v-model="filters.providerName" />
            </CCol>
            <CCol md="3">
              <CSelect
                :value.sync="filters.type"
                :options=types
                label="Tipo"
                placeholder="Seleccione un tipo"
              />
            </CCol>
            <CCol md="4">
              <CButton color="primary" @click="getProviderByPurchases" class="mr-1 mb-3">
                <CIcon name="cil-magnifying-glass" /> Buscar
              </CButton>
            </CCol>
          </CRow>

          <!-- LISTADO -->
          <CDataTable
            :items="tableItems"
            :fields="fields"
            :items-per-page="5"
            :no-items-view="{
              noItems: 'No hay registros',
              noResults: 'No se encontraron resultados'
            }"
            hover
            striped
            border
            small
            fixed
            pagination
            :loading="loading"
          >

            <template #loading>
              <div class="text-center p-4">
                <CSpinner color="primary" />
                <p>Cargando...</p>
              </div>
            </template>

            <template #index="{ index }">
              <td>{{ index + 1 }}</td>
            </template>

            <template #subtotal="{ item }">
              <td>S/. {{ item.subtotal }}</td>
            </template>

            <template #deposit="{ item }">
              <td>S/. {{ item.deposit }}</td>
            </template>

            <template #debt="{ item }">
              <td>S/. {{ (item.subtotal - item.deposit).toFixed(4) }}</td>
            </template>

            <!-- BUTTON VIEW -->
            <template #buttonView="{item}">
              <td class="text-center">
                <CButton
                  :name="item.id"
                  size="sm"
                  :key="item.id"
                  color="twitter"
                  @click="sendViewPurchase(item)"
                >
                  <CIcon size="sm" name="cil-magnifying-glass"/>
                </CButton>
              </td>
            </template>

            <!-- BUTTON SELECT -->
            <template #buttonSelect="{ item }">
              <td class="text-center">
                <CButton
                  :name="item.id"
                  size="sm"
                  :key="item.id"
                  color="facebook"
                  @click="openModalDepositsPurchase(item)"
                >
                  <CIcon size="sm" name="cil-magnifying-glass" />
                </CButton>
              </td>
            </template>

          </CDataTable>

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
    <CModalDepositsPurchase
      :isVisible="flagModalDepositsPurchase"
      :purchase="purchase"
      @get-purchases-by-provider="getProviderByPurchases"
      @close-modal-deposits-purchase="closeModalDepositsPurchase"
      @set-amount="updateAmount"
    />

  </div>
</template>

<script>

import CModalDepositsPurchase from "./ModalDepositsPurchase.vue";
import {list} from '../../../assets/js/methods/functions.js'

export default {
  name: 'ModalPurchasesByProvider',
  components: {
    CModalDepositsPurchase,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    provider: {
      type: Object,
      required: false,
      default: null
    },
    fields: {
      type: Array,
      default() {
        return [
            { key: "index", label: "#" },
            { key: "consecutive", label: "Compra" },
            { key: "date", label: "Día" },
            { key: "subtotal", label: "Total Compra" },
            { key: "deposit", label: "Depositó" },
            { key: "debt", label: "Deuda" },
            { key: "buttonSelect", label: "Pagar", _style: "min-width:20%;" },
            { key: "buttonView", label: "Ver", _style: "min-width:20%;" },
        ];
      },
    },
  },
  data() {
    return {
      prefix: "purchases_by_provider",
      purchase: null,
      purchases: [],
      types: ['ambos', 'pendientes', 'finalizadas'],
      filters: {
        consecutive: "",
        provider: 0,
        providerName: 0,
        type: "ambos",
      },
      lastDeposit: 0,
      loading: false,
      flagModalDepositsPurchase: false,
    };
  },
  computed: {
    grandTotal() {
      return this.formatFloat(this.purchases.reduce((sum, item) => sum + (parseFloat(item.subtotal) - parseFloat(item.deposit)) || 0, 0));
    },
    tableItems () {
      return this.loading ? [] : this.purchases
    }
  },
  async mounted() {
    await this.getProviderByPurchases();
    if (this.provider && this.provider.lastDepositProvider) {
      this.lastDeposit = this.provider.lastDepositProvider;
    }
  },
  watch: {
    async isVisible(newValue) {
      if (newValue) {
        this.lastDeposit = 0;
        await this.getProviderByPurchases();
        if (this.provider && this.provider.lastDepositProvider) {
          this.lastDeposit = this.provider.lastDepositProvider;
        }
      }
    },
  },
  methods: {
    async getProviderByPurchases(){

      this.loading = true;

      try {

        this.filters.provider = this.provider.id;
        this.filters.providerName = this.provider.name;

        const url = this.$store.state.url;
        const response = await list(url + this.prefix, this.filters);

        if (response.status === 200) {
          this.purchases = response.data.data;
        }

      } catch (errors) {

        this.purchases = [];

      } finally {

        this.loading = false;
        this.grandTotal;

      }

    },
    closeModal(){
      this.$emit("close-modal-purchases-by-provider");
    },
    openModalDepositsPurchase(item) {
      this.purchase = item;
      this.flagModalDepositsPurchase = true;
    },
    closeModalDepositsPurchase() {
      this.flagModalDepositsPurchase = false;
    },
    updateAmount(deposit) {
      this.lastDeposit = deposit;
    },
    sendViewPurchase(item) {

      const routeData = this.$router.resolve({ 
        name: 'Detalle compra', 
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