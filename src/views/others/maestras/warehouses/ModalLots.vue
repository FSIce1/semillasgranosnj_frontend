
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisibleModalLots && !!warehouse">

      <slot name="header">
        <CIcon name="cil-grid"/> Listado de lotes del almacén {{name}}
      </slot>

      <template>
        <CCardBody>
          <TableCustom :items="tableItems" :fields="fields" :loading="loading" :items-per-page="5"></TableCustom>
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

import {list, request} from '@/utils/functions.js'

export default {
  name: 'ModalStockHistory',
  props: {
    isVisibleModalLots: {
      type: Boolean,
      required: true,
    },
    warehouse: {
      type: Object,
      required: false,
      default: null
    },
    fields: {
      type: Array,
      default() {
        return [
            { key: "index", label: "#",       _classes: 'text-center' },
            { key: "code",  label: "Código",  _classes: 'text-center' },
            { key: 'name',  label: 'Nombre',  _classes: 'text-center' },
        ];
      },
    },
  },
  data() {
    return {
      prefix: "warehouses_lot",
      lots: [],
      name: "",
      filters: {
        product_id: 0,
      },
      loading: false,
    };
  },
  async mounted() {
    await this.getLots();
  },
  computed: {
    tableItems () {
      return this.loading ? [] : this.lots
    }
  },
  watch: {
    async isVisibleModalLots(newValue) {
      if (newValue) {
        this.name = this.warehouse.name;
        await this.getLots();
      }
    },
  },
  methods: {
    request,
    async getLots(){

      if (!this.warehouse || !this.warehouse.id) return

      await this.request(async () => {

        const url = this.$store.state.url
        const resp = await list(url + this.prefix, { warehouse_id: this.warehouse.id })
        if (resp.status === 200) this.lots = resp.data.data || []
        else this.lots = []

      }, { loadingKey: "loading" })

    },
    closeModal(){
      this.$emit("close-modal-lots");
    },
  },
};
</script>