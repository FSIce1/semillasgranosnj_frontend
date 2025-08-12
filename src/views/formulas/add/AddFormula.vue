<template>
  <CCard>
    <CCardHeader>
      <CIcon name="cil-notes"/> {{title}}
    </CCardHeader>
    <CCardBody>
      <CRow>
        <CCol lg="12">
          <CForm>
            
      <!-- LIST -->
      <div v-if="loading" class="text-center">
        
        <CSpinner color="primary" />
        <p>Cargando...</p>
      
      </div>
      <div v-else>
        
            <CRow>
              
              <CCol md="6">
                <CInput
                  label="Nombre"
                  :value.sync="formula.name"
                  placeholder="Ingrese un nombre..."
                  autocomplete="off"
                />
              </CCol>
              
              <CCol md="6">
                <CInput
                  label="Unidad de Medida"
                  :value.sync="formula.unit_measure"
                  disabled
                  autocomplete="off"
                />
                <!-- <template v-if="loadingUnitsMeasure">
                  <div class="spinner-border m-4" role="status">
                    <span class="visually-hidden"></span>
                  </div>
                </template>
                <template v-else>
                    <CSelect
                      :value.sync="formula.unit_measure"
                      :options=units_measure
                      disabled
                      label="Unidad de Medida"
                      placeholder="Seleccione un unidad de medida"
                      autocomplete="off"
                    />
                </template> -->
              </CCol>

            </CRow>

            <!-- AGREGAR-->
            <CRow>
              <CCol md="8">
                <CButton color="success" @click="openModalDetail('insumo')" class="mr-2">
                  Agregar Insumo
                </CButton>
                <CButton color="info" @click="openModalDetail('nucleo')" class="mr-2">
                  Agregar Núcleo
                </CButton>
              </CCol>
            </CRow>

            <ModalFormula
              :details="formula.details_combinated"
              :isVisibleModalFormula="flagModalDetail"
              :isType="type"
              :dataDetail="detail"
              @get-detail="getDetail"
              @close-modal-detail="closeModalDetail"
            />

            <!-- LISTA DE PRODUCTOS SELECCIONADOS -->
            <CTableProductsSelected 
              :items="formula.details" 
              @get-total-general="getTotal"
              @get-edit-detail="getDataDetail"
            >
              <template #header>
                <CIcon name="cil-grid"/> Listado de Productos seleccionados
              </template>
            </CTableProductsSelected>

            <!-- DETALLES EXTRAS -->
            <CRow>
              <CCol md="6">
              </CCol>
              <CCol md="6">
                <CInput
                  horizontal
                  disabled
                  label="Costo Macros"
                  :value.sync="formula.cost_macros"
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
                  label="Total Macros"
                  :value.sync="formula.total_macros"
                />
              </CCol>
            </CRow>


            <!-- LISTA DE NUCLEOS SELECCIONADOS -->
            <CTableProductsNucleoSelected 
              :items="formula.details_nucleos" 
              @get-total-general="getTotal"
              @get-edit-detail="getDataDetail"
            >
              <template #header>
                <CIcon name="cil-grid"/> Listado de Productos seleccionados
              </template>
            </CTableProductsNucleoSelected>

            <!-- DETALLES EXTRAS -->
            <CRow>
              <CCol md="6">
              </CCol>
              <CCol md="6">
                <CInput
                  horizontal
                  disabled
                  label="Costo Núcleo"
                  :value.sync="formula.cost_nucleo"
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
                  label="Total Núcleo"
                  :value.sync="formula.total_nucleo"
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
                  label="Total"
                  :value.sync="formula.total"
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
                  label="Costo Total"
                  :value.sync="formula.cost_total"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="4">
                <CInput
                  label="Precio de venta(SACO/UND)"
                  v-model="formula.price"
                  @keyup.enter="saveFormula"
                  @keydown="preventInvalidDecimal($event)"
                  description="Por favor ingresa el precio del producto."
                  placeholder="Ingresa el precio del producto..."
                  required
                  was-validated
                />
              </CCol>
              <CCol md="4">
                <CInput
                  label="Precio de compra(SACO/UND)"
                  v-model="formula.price_purchase"
                  @keyup.enter="saveFormula"
                  @keydown="preventInvalidDecimal($event)"
                  description="Por favor ingresa el precio del producto."
                  placeholder="Ingresa el precio del producto..."
                  required
                  was-validated
                />
              </CCol>
              <CCol md="4">
                <CInput
                  label="Equivalente (Stock)"
                  v-model="formula.equivalent"
                  @keyup.enter="saveFormula"
                  @input="updateFromEquivalentStock"
                  @keydown="preventInvalidDecimal($event)"
                  description="Por favor ingresa el equivalente para la conversión."
                  placeholder="Ingresa el equivalente..."
                  required
                  was-validated
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6">
                <CInput
                  label="Stock (SACO/UND)"
                  v-model="formula.stock"
                  @keyup.enter="saveFormula"
                  @input="updateFromStockUM1"
                  @keydown="preventInvalidDecimal($event)"
                  description="Por favor ingresa el stock del producto."
                  required
                  was-validated
                />
              </CCol>
              <CCol md="6">
                <CInput
                  label="Stock (KG)"
                  v-model="formula.converted_stock"
                  disabled
                  @keyup.enter="saveFormula"
                  @keydown="preventInvalidDecimal($event)"
                  description="Por favor ingresa el stock del producto."
                  required
                  was-validated
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
                  <CButton color="success" @click="saveFormula()" class="mr-1 mb-3">
                    <span v-text="btnSaveFormula"></span>
                  </CButton>
                </template>
              </CCol>
            </CRow>
            
      </div>
          </CForm>
          <br/>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>

  import CTableProductsSelected from './TableListProductsSelected.vue'
  import CTableProductsNucleoSelected from './TableListProductsNucleoSelected.vue'
  import ModalFormula from './ModalFormula.vue';
  import Swal from "sweetalert2"
  import {list, save} from '../../../assets/js/methods/functions.js'

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'
  
  export default {
    name: 'AddFormula',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'process', label: 'Proceso' },
            { key: 'price', label: 'Precio' },
            { key: 'stock', label: 'Stock' },
            { key: 'buttonSelect', label: 'Seleccionar', _style:'min-width:20%;' },
          ]
        }
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean
    },
    data() {
      return {
        prefix: "formula",
        prefix_units_measure: "units_measure",
        units_measure: [],
        title: "Nueva Fórmula",
        btnSaveFormula: "Guardar",
        formula: {
          id                  : "",
          name                : "",
          unit_measure        : "Kg",
          total_macros        : 0,
          total_nucleo        : 0,
          total               : 0,
          cost_macros         : 0,
          cost_nucleo         : 0,
          cost_total          : 0,
          details             : [],
          details_nucleos     : [],
          details_combinated  : [],
          price               : "",
          price_purchase      : "",
          equivalent          : "",
          stock               : "",
          converted_stock     : "",
        },
        detail: null,
        type: "insumo",
        flagModalDetail: false,
        flagModalProducts: false,
        loading: true,
        loadingSaleDetails: false,
        loadingButtonsActions: true,
        loadingUnitsMeasure: true,
      }
    },
    async mounted() {

      this.loading = true;

      // await this.getUnitsMeasure();
      await this.getFormula();
      await this.getTotalGeneralMacros();
      await this.getTotalGeneralNucleos();
      await this.getTotalGeneral();

      this.loading = false;

    },
    components: {
      ModalFormula,
      CTableProductsSelected,
      CTableProductsNucleoSelected
    },
    methods: {
      async getFormula(){

        const data = this.$route.query.data;

        if (data && typeof data === 'string' && data.trim() !== '') {

          const item = JSON.parse(data);

          this.formula.id = item.id;
          this.formula.name = item.name;
          // this.formula.unit_measure = item.unit_measure_id;
          this.formula.total_macros = item.total_macros;
          this.formula.total_nucleo = item.total_nucleo;
          this.formula.total = item.total;
          this.formula.cost_macros = item.cost_macros;
          this.formula.cost_nucleo = item.cost_nucleo;
          this.formula.cost_total = item.cost_total;
          this.formula.details = item.details;
          this.formula.details_nucleos = item.details_nucleos;

          this.formula.price = item.product.price ?? "";
          this.formula.price_purchase = item.product.price_purchase ?? "";
          this.formula.equivalent = item.product.equivalent ?? "";
          this.formula.stock = item.product.stock ?? "";
          this.formula.converted_stock = item.product.converted_stock ?? "";

          this.title = "Modificar Fórmula";
          this.btnSaveFormula = "Modificar";

        }

      },
      async saveFormula(){

        this.loadingButtonsActions = false;

        try {
          
          const url = this.$store.state.url;
          const data = this.getSetData(this.formula);
          const response = await save(url + this.prefix, data, this.formula.id);
          
          if (response.status === 200) {
            
            if(response.data.flag){

              Swal.fire("Alerta", response.data.message, "success");
              
              this.$router.push({ 
                name: 'Listado Fórmulas', 
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
      async getUnitsMeasure(){

      this.loadingUnitsMeasure = true;

      try {

        const url = this.$store.state.url;
        const response = await list(url + this.prefix_units_measure);

        if (response.status === 200) {
          
          let setUnitsMeasure = (response.data.data).map(role => ({
            value: role.id, 
            label: role.name
          }));

          this.units_measure = setUnitsMeasure;

        }
      } catch (errors) {

        if (errors.length > 0) {
          Swal.fire("Alerta", errors[0], "warning");
        } else {
          Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
        }

      } finally {
        
        this.loadingUnitsMeasure = false;

      }

      },
      openModalDetail(type, modo = "NUEVO"){

        if(modo == "NUEVO"){
          this.detail = null;
        }

        this.flagModalDetail    = true;
        this.type               = type;
        this.formula.details_combinated =  [...this.formula.details, ...this.formula.details_nucleos];
      },
      closeModalDetail(){        
        this.flagModalDetail = false;
      },
      getDetail(data){

        console.log(data.index);
        const newDetail = {
          "id": data.id,
          "index": data.index,
          "product": {
            "id": data.product.id,
            "name": data.product.name,
            "stock": data.product.stock,
            "unit_measure": data.product.unit_measure
          },
          price: data.price,
          amount: data.amount,
          cost: data.cost,
          type: data.type
        };

        if(newDetail.type == "insumo"){

          if(newDetail.index == -1){
            this.formula.details.push(newDetail);
          } else {

            const indexToReplace = (this.formula.details).findIndex(detail => detail.index === newDetail.index);

            if (indexToReplace !== -1) {
              this.formula.details.splice(indexToReplace, 1, newDetail);
            }

          }

        } else {

          if(newDetail.index == -1){
            this.formula.details_nucleos.push(newDetail);
          } else {

            const indexToReplace = (this.formula.details_nucleos).findIndex(detail => detail.index === newDetail.index);

            if (indexToReplace !== -1) {
              this.formula.details_nucleos.splice(indexToReplace, 1, newDetail);
            }

          }

        }

        this.getTotalGeneralMacros();
        this.getTotalGeneralNucleos();
        this.getTotalGeneral();

      },
      async getTotal(){
        this.getTotalGeneralMacros();
        this.getTotalGeneralNucleos();
        this.getTotalGeneral();
      },
      async getDataDetail(item){
        this.detail = item;
        this.openModalDetail(item.type, "EDITAR");
      },
      async getTotalGeneralMacros() {

        let total = 0;
        let cost = 0;

        for (let index = 0; index < this.formula.details.length; index++) {
          total += parseFloat(this.formula.details[index].amount);
          cost += parseFloat(this.formula.details[index].cost);
        }

        this.formula.total_macros = total;
        this.formula.cost_macros = cost;

        return total;

      },
      async getTotalGeneralNucleos() {

        let total = 0;
        let cost = 0;

        for (let index = 0; index < this.formula.details_nucleos.length; index++) {
          total += parseFloat(this.formula.details_nucleos[index].amount);
          cost += parseFloat(this.formula.details_nucleos[index].cost);
        }

        this.formula.total_nucleo = total;
        this.formula.cost_nucleo = cost;

        return total;

      },
      async getTotalGeneral() {

        let total = 0;
        let cost = 0;

        total = this.formula.total_macros + this.formula.total_nucleo;
        cost = this.formula.cost_macros + this.formula.cost_nucleo;

        this.formula.total = total;
        this.formula.cost_total = cost;

        return total;

      },
      updateFromEquivalentStock() {

        const equivalent = parseFloat(this.formula.equivalent);
        const converted_stock = parseFloat(this.formula.converted_stock);

        if (!isNaN(equivalent) && equivalent > 0 && !isNaN(converted_stock) && converted_stock > 0) {
          this.formula.stock = converted_stock / equivalent;
        } else {
          this.formula.stock = 0;
        }

      },
      updateFromStockUM1() {

        const equivalent = parseFloat(this.formula.equivalent);
        const stock = parseFloat(this.formula.stock);

        if (!isNaN(equivalent) && equivalent > 0 && !isNaN(stock) && stock > 0) {
          this.formula.converted_stock = equivalent * stock;
        } else {
          this.formula.converted_stock = 0;
        }

      },
      getSetData(data){

        let formData = new FormData();
        let id = -1;

        formData.append('name', data.name);
        // formData.append('unit_measure_id', data.unit_measure);
        formData.append('total_macros', data.total_macros);
        formData.append('total_nucleo', data.total_nucleo);
        formData.append('total', data.total);
        formData.append('cost_macros', data.cost_macros);
        formData.append('cost_nucleo', data.cost_nucleo);
        formData.append('cost_total', data.cost_total);
        formData.append('price', data.price);
        formData.append('price_purchase', data.price_purchase);
        formData.append('equivalent', data.equivalent);
        formData.append('stock', data.stock);
        formData.append('converted_stock', data.converted_stock);

        (data.details).forEach(function(detail, index) {
            id = (detail.id != null && detail.id != undefined && detail.id != "") ? detail.id : -1;

            formData.append(`details[${index}][id]`, id);
            formData.append(`details[${index}][product_id]`, detail.product.id);
            formData.append(`details[${index}][price]`, detail.price);
            formData.append(`details[${index}][amount]`, detail.amount);
            formData.append(`details[${index}][cost]`, detail.cost);
        });

        (data.details_nucleos).forEach(function(detail, index) {
            id = (detail.id != null && detail.id != undefined && detail.id != "") ? detail.id : -1;

            formData.append(`details_nucleos[${index}][id]`, id);
            formData.append(`details_nucleos[${index}][product_id]`, detail.product.id);
            formData.append(`details_nucleos[${index}][price]`, detail.price);
            formData.append(`details_nucleos[${index}][amount]`, detail.amount);
            formData.append(`details_nucleos[${index}][cost]`, detail.cost);
        });

        return formData;

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
    }
  }

</script>
