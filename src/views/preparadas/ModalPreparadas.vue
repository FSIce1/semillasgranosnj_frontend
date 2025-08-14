<template>
  <div>
    <CModal :title="titleModal" size="lg" :show="isVisibleProduction">
      <CForm novalidate>
        <CCardBody>

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
                    v-model="production.client"
                    :options=clients
                    placeholder="Selecciona el cliente"
                    label="name"
                    track-by="id"
                    select-label="Presiona para seleccionar"
                    selected-label="Seleccionado"
                    deselect-label="Presiona para quitar"
                  />
                  <br>
                </div>
              </template>
            </CCol>

            <CCol md="4">
              <CSelect
                :value.sync="production.shift"
                :disabled="loadingModal"
                :options=shifts
                @keyup.enter="saveProduction"
                label="Turno"
                description="Por favor seleccione un turno."
                placeholder="Seleccione un turno"
                required
                was-validated
              />
            </CCol>

            <CCol md="4">
              <CSelect
                :value.sync="production.machine"
                :disabled="loadingModal"
                :options=machines
                @keyup.enter="saveProduction"
                label="Máquina"
                description="Por favor seleccione una máquina."
                placeholder="Seleccione una máquina"
                required
                was-validated
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="12">
              <CInput
                :value.sync="production.tons_produced"
                :disabled="loadingModal"
                @keydown="preventInvalidDecimal($event)"
                @keyup.enter="saveProduction"
                label="TN"
                description="Por favor ingrese las toneladas producidas."
                placeholder="Ingrese las toneladas producidas"
                required
                was-validated
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md="12">
              <div>
                <label>Fórmulas</label>
                <multiselect
                  v-model="production.formula"
                  :options=formulas
                  placeholder="Por favor seleccione una formula."
                  label="name"
                  @input="selectFormula"
                  track-by="id"
                  select-label="Presiona para seleccionar"
                  selected-label="Seleccionado"
                  deselect-label="Presiona para quitar"
                />
                <br>
              </div>
              <!-- <CSelect
                :value.sync="production.formula"
                :disabled="loadingModal"
                :options=formulas
                @keyup.enter="saveProduction"
                @change="selectFormula"
                label="Fórmula"
                description="Por favor seleccione una formula."
                placeholder="Seleccione una fórmula"
                required
                was-validated
              /> -->
            </CCol>
          </CRow>

          <CDataTable
            v-if="production.productsFormula.length != 0"
            :items="production.productsFormula"
            :fields="fieldsFormulas"
            :items-per-page="5"
            :no-items-view="{
              noItems: 'No hay registros',
              noResults: 'No se encontraron resultados'
            }"
            hover
          >

            <template #index="{ index }">
              <td>{{ index + 1 }}</td>
            </template>

            <template #code="{ item }">
              <td>{{ item.product ? item.product.cod_product : '' }}</td>
            </template>

            <template #product="{ item }">
              <td>{{ item.product ? item.product.name : '' }}</td>
            </template>

            <template #amount="{ item }">
              <td>{{ item.amount }}</td>
            </template>

          </CDataTable>

          <h4 v-if="production.productsNucleo.length != 0" style="text-align: center; text-decoration: underline;">Núcleo</h4>

          <CDataTable
            v-if="production.productsNucleo.length != 0"
            :items="production.productsNucleo"
            :fields="fieldsFormulas"
            :items-per-page="5"
            :no-items-view="{
              noItems: 'No hay registros',
              noResults: 'No se encontraron resultados'
            }"
            hover
          >

            <template #index="{ index }">
              <td>{{ index + 1 }}</td>
            </template>

            <template #code="{ item }">
              <td>{{ item.product ? item.product.cod_product : '' }}</td>
            </template>

            <template #product="{ item }">
              <td>{{ item.product ? item.product.name : '' }}</td>
            </template>

            <template #amount="{ item }">
              <td>{{ item.amount }}</td>
            </template>

          </CDataTable>

          <CRow>
            <!-- <CCol md="6">
              <CInput
                v-if="production.formula != ''"
                :value.sync="production.cost_total"
                @keyup.enter="saveProduction"
                label="Precio de la Fórmula"
                disabled
              />
            </CCol> -->
            <CCol md="12">
              <CInput
                v-if="production.formula != ''"
                :value.sync="production.total"
                @keyup.enter="saveProduction"
                label="Total de la Fórmula"
                disabled
              />
            </CCol>
          </CRow>

          <CRow v-if="production.formula != ''">
            <CCol md="6">
              <CInput
                :value.sync="production.packing"
                :disabled="loadingModal"
                @keydown="preventInvalidDecimal($event)"
                @keyup.enter="saveProduction"
                label="Empaque"
                description="Por favor ingrese el empaque."
                placeholder="Ingrese el empaque"
                required
                was-validated
              />
            </CCol>
            <CCol md="6">
              <CInput
                :value.sync="production.amount"
                disabled
                label="Cantidad"
              />
            </CCol>
          </CRow>

          <CTextarea
            :value.sync="production.observations"
            :disabled="loadingModal"
            @keyup.enter="saveProduction"
            label="Observaciones"
            placeholder="Ingrese las observaciones..."
            vertical
            rows="3"
          />
        </CCardBody>
      </CForm>

      <template #footer>
        <div v-if="!loadingModal">
          <CButton color="primary" @click="saveProduction" class="mr-1 mb-3">
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
          <CButtonClose @click="closeModalProduction" class="text-black"/>
      </template>
      
    </CModal>

    <!-- MODAL: LISTADO DE PRODUCTOS -->
    <CTableProducts
      :isVisible="flagModalProducts"
      @select-product="selectProduct"
      @close-modal-products="closeModalProducts"
    />

  </div>
</template>

<script>

  import Swal from "sweetalert2"

  import CTableProducts from "../modals/ModalProducts.vue";
  import Multiselect from 'vue-multiselect'
  import {list, save, show} from '../../assets/js/methods/functions.js'

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  name: "ModalPreparadas",
  components: {
    CTableProducts,
    Multiselect,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    isVisibleProduction: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      prefix: "production_client",
      prefix_list_shifts: "shifts",
      prefix_list_machines: "machines",
      prefix_list_formulas: "formulas",
      prefix_clients: "clients",
      clients: [],
      shifts: [],
      machines: [],
      formulas: [],
      fieldsFormulas:[
        { key: 'index', label: '#' },
        // { key: 'code', label: 'Código' },
        { key: 'product', label: 'Producto' },
        { key: 'amount', label: 'Cantidad' },
      ],
      production: {
        id: "",
        user_id: "",
        product: {
          "id"            : "",
          "name"          : "",
          "cod_product"   : "",
          "process"       : "",
          "unit_measure"  : "",
        },
        cost_total: "",
        tons_produced: "",
        client: "",
        shift: "",
        machine: "",
        formula: "",
        productsFormula: [],
        productsNucleo: [],
        total: "",
        packing: "",
        amount: "",
        observations: "",
      },
      titleModal: "Nueva Producción",
      textButton: "Guardar",
      loadingModal: false,
      loadingClients: false,
      flagModalProducts: false,
    };
  },
  watch: {
    'production.packing'(newPacking) {
      if (newPacking > 0) {

        // this.production.amount = Math.floor(this.production.total / parseFloat(newPacking));
        this.production.amount = parseFloat((parseFloat(this.production.total) / parseFloat(newPacking)).toFixed(4));

      } else {
        this.production.amount = 0;
      }
    },
    async isVisibleProduction(newValue) {
        if (newValue) {

          this.loadingModal = true;

          if(this.id == 0) {
            
            await this.getClients();
            await this.newProduction();
            await this.getShifts();
            await this.getMachines();
            await this.getFormulas();
          
          } else {

            await this.getClients();
            await this.getShifts();
            await this.getMachines();
            await this.getFormulas();
            await this.editProduction(this.id);

          }

          this.loadingModal = false;

        }
    },
  },
  methods: {
    openModalProducts() {
      this.flagModalProducts = true;
    },
    closeModalProducts() {
      this.flagModalProducts = false;
    },
    selectProduct(product){       

      this.production.product.id            = product.id;
      this.production.product.name          = product.name;
      this.production.product.cod_product   = product.cod_product;
      this.production.product.process       = product.process;
      this.production.product.unit_measure  = product.unit_measure;

      this.flagModalProducts                = false;
    
    },
    closeModalProduction(){
      this.$emit("close-modal-production");
    },
    async newProduction(){
      this.titleModal                       = "Nueva Producción";
      this.textButton                       = "Guardar";
      this.production.id                    = "";
      this.production.tons_produced         = "";
      this.production.client                = "";
      this.production.shift                 = "";
      this.production.machine               = "";
      this.production.formula               = "";
      this.production.productsFormula       = [];
      this.production.productsNucleo        = [];
      this.production.total                 = "";
      this.production.packing               = "";
      this.production.amount                = "";
      this.production.observations          = "";
    },
    async getClients(){

      this.loadingClients = true;

      try {
      
        const url = this.$store.state.url;
        const response = await list(url + this.prefix_clients);

        if (response.status === 200) {
          
          let setClients = (response.data.data).map(role => ({
            id: role.id, 
            name: role.name
          }));

          this.clients = setClients;

        }
      } catch (errors) {

        if (errors.length > 0) {
          Swal.fire("Alerta", errors[0], "warning");
        } else {
          Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
        }

      } finally {
        
        this.loadingClients = false;
      
      }

    },
    async getShifts(){
        
      // this.loading = true;

      try {
        
        const url = this.$store.state.url;
        const response = await list(url + this.prefix_list_shifts);

        if (response.status === 200) {

          let setShifts = (response.data.data).map(shift => ({
            value: shift.id, 
            label: shift.name
          }));

          this.shifts = setShifts;
        }

      } catch (errors) {

        this.shifts = [];

      } finally {
        
        // this.loading = false;
      
      }

    },
    async getMachines(){
        
      // this.loading = true;

      try {
        
        const url = this.$store.state.url;
        const response = await list(url + this.prefix_list_machines);

        if (response.status === 200) {

          let setMachines = (response.data.data).map(machine => ({
            value: machine.id, 
            label: machine.name
          }));

          this.machines = setMachines;
        }

      } catch (errors) {

        this.machines = [];

      } finally {
        
        // this.loading = false;
      
      }

    },
    async getFormulas(){
        
      // this.loading = true;

      try {
        
        const url = this.$store.state.url;
        const response = await list(url + this.prefix_list_formulas);

        if (response.status === 200) {

          let setFormulas = (response.data.data).map(formula => ({
            id: formula.id,
            name: formula.name,
            // value: formula.id, 
            // label: formula.name,
            details: formula.details,
            details_nucleos: formula.details_nucleos,
            cost_total: formula.cost_total,
            total: formula.total,
          }));

          this.formulas = setFormulas;

        }

      } catch (errors) {

        this.formulas = [];

      } finally {
        
        // this.loading = false;
      
      }

    },
    selectFormula(){

      const selectedFormula = this.formulas.find(
        formula => formula.id == this.production.formula.id
      );

      this.production.productsFormula = selectedFormula.details;
      this.production.productsNucleo  = selectedFormula.details_nucleos;
      this.production.total           = selectedFormula.total;
      this.production.cost_total      = selectedFormula.cost_total;

    },
    async saveProduction(){

      this.loadingModal = true;

      try {

        const url = this.$store.state.url;
        const data = this.getSetData(this.production);
        const response = await save(url + this.prefix, data, this.production.id);

        if (response.status === 200) {

          Swal.fire("Alerta", response.data.message, "success");

          this.$emit("close-modal-production");
          this.$emit("get-productions");

        }

      } catch (errors) {

        if (errors.length > 0) {
          Swal.fire("Alerta", errors[0], "warning");
        } else {
          Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
        }

      } finally {

        this.loadingModal = false;

      }

    },
    async editProduction(id){

      try {

        this.loadingModal = true;

        const url = this.$store.state.url;
        const response = await show(url+ "production" +`/${id}`);

        if (response.status === 200) {

          let data = response?.data?.data;

          const selectedFormula = this.formulas.find(
            formula => formula.id == data?.formula_id
          );

          const details = (selectedFormula != undefined && selectedFormula != null && selectedFormula != "") ? selectedFormula.details : [];
          const details_nucleos = (selectedFormula != undefined && selectedFormula != null && selectedFormula != "") ? selectedFormula.details_nucleos : [];

          this.production.id                    = data?.id;
          this.production.tons_produced         = data?.tons_produced;
          this.production.client                = data?.clientData;
          this.production.shift                 = data?.shift_id;
          this.production.machine               = data?.machine_id;
          this.production.formula               = data?.formulaData;
          this.production.total                 = data?.formulaData?.total;
          this.production.packing               = data?.packing;
          this.production.amount                = data?.amount;
          this.production.productsFormula       = details;
          this.production.productsNucleo        = details_nucleos;
          this.production.observations          = data?.observations;
          this.titleModal                       = "Modificar Producción";
          this.textButton                       = "Modificar";

        }

      } catch (errors) {

        if (errors.length > 0) {
          Swal.fire("Alerta", errors[0], "warning");
        } else {
          Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
        }

      } finally {

        this.loadingModal = false;

      }

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
      formData.append('tons_produced', data.tons_produced);
      formData.append('client_id', data.client.id);
      formData.append('shift_id', data.shift);
      formData.append('machine_id', data.machine);
      formData.append('formula_id', data.formula.id);
      formData.append('packing', data.packing);
      formData.append('amount', data.amount);
      formData.append('observations', data.observations);

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

        // Limitar la parte decimal a 2 dígitos
        if (decimalPart && decimalPart.length >= 2 && value.includes('.')) {
          event.preventDefault();
        }
      },
  },
};
</script>
