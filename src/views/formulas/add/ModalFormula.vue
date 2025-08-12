<template>
  <div>
    <CModal title="Agregar Fórmula" size="lg" :show="isVisibleModalFormula">
        <CForm novalidate>
            <CCardBody>
                <CRow>
                    <CCol md="6">
                        <CInput
                            label="Insumo"
                            :value.sync="detail.product.name"
                            disabled
                            required
                            was-validated
                        >
                            <template #append>
                                <CButton @click="openModalProducts" color="primary" >Seleccionar</CButton>
                            </template>
                        </CInput>
                        <CInput type="hidden" :value.sync="detail.product.id" />
                    </CCol>
                    <CCol md="6">
                        <CInput
                            :value.sync="detail.product.stock"
                            label="Stock (Kg)"
                            disabled
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol md="6">
                        <CInput
                            :value.sync="detail.price"
                            label="Precio de compra (Kg)"
                            disabled
                        />
                    </CCol>
                    <CCol md="6">
                        <CInput
                            :value.sync="detail.amount"
                            @keydown="preventInvalidDecimal($event)"
                            label="Cantidad"
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
                    <CIcon name="cil-save" /> <span v-text="textButton"></span>
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

    <!-- MODAL: LISTADO DE PRODUCTOS -->
    <CTableProducts
        :details="details"
        :type="type"
        :isVisible="flagModalProducts"
        @select-product="selectProduct"
        @close-modal-products="closeModalProducts"
    />

</div>
</template>

<script>

import CTableProducts from "../../modals/ModalProducts.vue";
import Swal from "sweetalert2";

export default {
    name: "ModalFormula",
    components: {
        CTableProducts,
    },
    props: {
        isVisibleModalFormula: {
            type: Boolean,
            required: true,
        },
        isType: {
            type: String,
            required: true,
        },
        details: {
            type: Array,
        },
        dataDetail: {
            type: Object,
        },
    },
    data() {
        return {
            detail: {
                id: "",
                index: -1,
                product: {
                    id              : "",
                    name            : "",
                    stock           : "",
                    unit_measure    : "",
                },
                stock : "",
                price : "",
                amount: "",
                cost : "",
                type: "",
            },
            textButton: "Guardar",
            type: "insumo",
            loadingDetail: false,
            flagModalProducts: false,
            loadingButtonsActions: true,
        };
    },
    watch: {
        isVisibleModalFormula(newValue) {
            if (newValue) {
                this.cleanModal();

                if(this.dataDetail != null){
                    this.getDetail(this.dataDetail);
                }

            }
        },
    },
    methods: {
        openModalProducts() {
            this.flagModalProducts = true;
        },
        saveDetail() {

            this.detail.type = this.isType;
            if(this.detail.product.id == ""){
                Swal.fire("Alerta", "Seleccione un producto", "warning");
                return
            } else if(this.detail.amount == ""){
                Swal.fire("Alerta", "Ingrese una cantidad", "warning");
                return
            } else if(this.detail.amount <= 0){
                Swal.fire("Alerta", "La cantidad debe ser mayor a 0", "warning");
                return
            }

            this.detail.cost = parseFloat(this.detail.price) * parseFloat(this.detail.amount);

            Swal.fire("Alerta", "Agregado Correctamente", "success");
            this.$emit("close-modal-detail");
            this.$emit("get-detail", this.detail);

            this.loadingDetail = false;

        },
        getDetail(detail) {

            this.detail = {
                id: detail.id,
                index: detail.index,
                product: {
                    id              : detail.product.id,
                    name            : detail.product.name,
                    stock           : detail.product.stock,
                    unit_measure    : detail.product.unit_measure,
                },
                stock : detail.stock,
                price : detail.price,
                amount: detail.amount,
                cost : detail.cost,
                type: detail.type,
            };

            this.isType = detail.type;
            this.textButton = "Modificar";

        },
        closeModalDetail(){
            this.$emit("close-modal-detail");
        },
        closeModalProducts() {
            this.flagModalProducts = false;
        },
        selectProduct(product){
            let slug = product.unit_measure_data.slug;
            let stock = (slug == "kg") ? product.stock : product.converted_stock;  
            let price = (slug == "kg") ? product.price_purchase : product.converted_price_purchase;  

            this.flagModalProducts           = false;
            this.detail.product.id           = product.id;
            this.detail.product.name         = product.name;
            this.detail.product.stock        = stock;
            this.detail.product.unit_measure = product.unit_measure;
            this.detail.price                = price;
        },
        cleanModal(){
            this.detail.id                   = "";
            this.detail.index                = -1;
            this.detail.product.id           = "";
            this.detail.product.name         = "";
            this.detail.product.stock        = "";
            this.detail.product.unit_measure = "";
            this.detail.price                = "";
            this.detail.amount               = "";
            this.detail.cost                 = "";
            this.textButton                  = "Guardar";
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
