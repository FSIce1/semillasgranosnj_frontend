<template>
  <div>
    <CModal
      :title="titleModal"
      size="lg"
      :show="isVisibleModalProduct"
    >

      <CForm novalidate>
        <CCardBody>

          <CRow>
            <CCol md="4">
              <CInput
                label="Código"
                :value.sync="product.cod_product"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                description="Por favor ingresa un código del producto."
              />
            </CCol>
            <CCol md="4">
              <CInput
                label="Nombre"
                :value.sync="product.name"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                description="Por favor ingresa el nombre del producto."
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CSelect
                label="Almacén"
                :value.sync="product.id_warehouse"
                :disabled="loadingModal"
                :options=warehouses
                @keyup.enter="saveProduct()"
                @update:value="onWarehouseChange"
                description="Por favor seleccione un almacén."
                placeholder="Seleccione un almacen"
                required
                was-validated
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="4">
              <CSelect
                label="Lotes"
                :value.sync="product.id_lot"
                :disabled="loadingModal || loadingLots || this.lots.length === 0"
                :options=lots
                @keyup.enter="saveProduct()"
                description="Por favor seleccione un lote."
                placeholder="Seleccione un lote"
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CSelect
                label="Unidad de Medida"
                :value.sync="product.id_unit_measure"
                :disabled="loadingModal"
                :options=units_measure
                @keyup.enter="saveProduct()"
                description="Por favor seleccione una unidad de medida."
                placeholder="Seleccione una unidad de medida"
                required
                was-validated
              />
            </CCol>
            <CCol v-if="permissionStock" md="4">
              <CInput
                label="Stock"
                v-model="product.stock"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el stock del producto."
                required
                was-validated
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="4">
              <CInput
                label="Precio de compra"
                v-model="product.price_purchase"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el precio de compra del producto."
                placeholder="Ingresa el precio de compra del producto..."
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CInput
                label="Precio de venta"
                v-model="product.price"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el precio de venta del producto."
                placeholder="Ingresa el precio de venta del producto..."
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CInput
                label="Cantidad mínima"
                :value.sync="product.minimum_quantity"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                placeholder="Ingresa la cantidad mínima..."
              />
            </CCol>
          </CRow>

        </CCardBody>
      </CForm>

      <template #footer>

        <div v-if="!loadingModal">
          <CButton color="primary" @click="saveProduct()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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
        <CButtonClose @click="closeModalProduct" class="text-black"/>
      </template>

    </CModal>
  </div>
</template>
  
<script>

  import {save, show, list, request} from '@/utils/functions.js'
  import Swal from "sweetalert2";
  import { preventInvalidDecimal } from '@/utils/validators.js'

  export default {
    name: "ModalProduct",
    props: {
      isVisibleModalProduct: {
        type: Boolean,
        required: true,
      },
      selectedProduct: {
        type: Object,
      },
    },
    computed: {
      permissionStock () {
        return sessionStorage.getItem("slug_role") === "admin"
      }
    },
    data() {
      return {
        prefix_list: "products",
        prefix_units_measure: "units_measure",
        prefix_warehouses: "warehouses",
        prefix: "product",
        product: {
          id                : "",
          cod_product       : "",
          name              : "",
          id_warehouse      : "",
          id_lot            : "",
          id_unit_measure   : "",
          price             : "",
          price_purchase    : "",
          stock             : "",
         equivalent        : "",
          minimum_quantity  : "",
        },
        warehouses: [],
        lots: [],
        units_measure: [],
        loadingLots: false,

        //? Modal
        titleModal: "Nuevo Producto",
        textButton: "Guardar",
        loadingModal: false,
      };
    },
    watch: {
      async isVisibleModalProduct(newValue) {
        if (newValue) {

          this.cleanModal();

          if (this.selectedProduct && this.selectedProduct.id) {
            await Promise.all([ this.getWarehouses(true), this.getUnitsMeasure(true), this.onWarehouseChange(this.selectedProduct.id_warehouse) ])
            this.titleModal = "Modificar Producto"
            this.textButton = "Modificar"
            await this.edit(this.selectedProduct.id)
          } else {
            await Promise.all([ this.getWarehouses(false), this.getUnitsMeasure(false) ])
            this.titleModal = "Nuevo Producto"
            this.textButton = "Guardar"
          }

        }
      },
    },
    methods: {

      //* Main Functions
        async saveProduct(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.product);
            const resp = await save(url + this.prefix, data, this.product.id)

            if (resp.status === 200) {
              this.$emit("get-products");
              this.$emit("close-modal-product");
              Swal.fire("Alerta", resp.data.message, "success")
            }

          }, { loadingKey: "loadingModal" })

        },

      //* Secondary Functions
        preventInvalidDecimal,
        request,
        async getWarehouses(load){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_warehouses)
            const setWarehouses = (resp.data.data).map(warehouse => ({ value: String(warehouse.id), label: warehouse.name }));
            if (resp.status === 200) this.warehouses = setWarehouses || []
            else this.warehouses = []
          }, { loadingKey: "loadingModal", load: load })

        },
        async getUnitsMeasure(load){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_units_measure)
            const setUnitsMeasure = (resp.data.data).map(unit_measure => ({ value: String(unit_measure.id), label: unit_measure.name }));
            if (resp.status === 200) this.units_measure = setUnitsMeasure || []
            else this.units_measure = []
          }, { loadingKey: "loadingModal", load: load })

        },
        async edit(id){

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.product = {
                id: d.id || "",
                cod_product: d.cod_product || "",
                name: d.name || "",
                id_warehouse: String(d.id_warehouse ?? ""),
                id_lot: String(d.id_lot) || "",
                id_unit_measure: String(d.id_unit_measure) || "",
                price: d.price || "",
                price_purchase: d.price_purchase || "",
                converted_price: d.converted_price || "",
                stock: d.stock || "",
                equivalent: d.equivalent || "",
                minimum_quantity: d.minimum_quantity || "",
              }
            }
          } finally {
            this.loadingModal = false
          }
        },
        async onWarehouseChange(val) {

          const id = Number(val)

          this.product.id_lot = ""
          this.lots = []

          if (!id || Number.isNaN(id)) return

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await show(url + "getLots" + `/${id}`)
            let setLots = (resp.data.data).map(lot => ({ value: String(lot.id), label: lot.name }));
            if (resp.status === 200) this.lots = setLots || []
            else this.lots = []
          }, { loadingKey: "loadingLots" })

        },
        getSetData(data){

          let formData = new FormData();

          formData.append('slug', sessionStorage.getItem("slug_role"));
          formData.append('cod_product', data.cod_product ?? "");
          formData.append('name', data.name);
          formData.append('id_warehouse', data.id_warehouse);
          formData.append('id_lot', data.id_lot);
          formData.append('id_unit_measure', data.id_unit_measure);
          formData.append('price', data.price);
          formData.append('price_purchase', data.price_purchase);
          formData.append('converted_price', data.converted_price ?? 0);
          formData.append('stock', data.stock);
          formData.append('equivalent', data.equivalent);
          formData.append('minimum_quantity', data.minimum_quantity ?? 0);

          return formData;

        },

        //? Modal
        closeModalProduct(){
          this.$emit("close-modal-product");
        },
        cleanModal(){
          this.product    = { id:"", cod_product:"", name:"", id_warehouse:"", id_lot:"", id_unit_measure:"", price:"", price_purchase:"", converted_price:"", stock:"", equivalent:"", minimum_quantity:"" }
          this.titleModal = "Nuevo Producto";
          this.textButton = "Guardar";
        },

    },
  };

</script>