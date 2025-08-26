
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisible">

      <slot name="header">
        <CIcon name="cil-grid"/> Listado de Conversiones 
      </slot>

      <template>
        <CCardBody>

          <!-- FILTROS -->
          <CRow class="align-items-end">
            <CCol md="4">
              <CSelect
                :value.sync="filters.unitMeasure"
                :disabled="loadingUnitMeasure"
                :options=units_measure
                @keyup.enter="saveConvertion()"
                label="Unidad de Medida"
                placeholder="Seleccione una unidad de medida"
                required
              />
            </CCol>
            <CCol md="4">
              <CInput
                :value.sync="filters.amount"
                @keyup.enter="saveConvertion()"
                @keydown="preventInvalidDecimal($event)"
                label="Factor de conversión"
                placeholder="Ingresa una cantidad"
              />
            </CCol>
            <CCol md="4">
              <CSelect
                :value.sync="filters.unitMeasureConvert"
                :disabled="loadingUnitMeasure"
                :options=units_measure
                @keyup.enter="saveConvertion()"
                label="Unidad de Medida 2"
                placeholder="Seleccione una unidad de medida"
                required
              />
            </CCol>
            <CCol md="4">
              <CButton color="primary" @click="saveConvertion()" class="mr-1 mb-3"><CIcon name="cil-save"/> Guardar</CButton>
            </CCol>
          </CRow>

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

            <!-- BUTTON DELETE -->
            <template #buttonDelete="{item}">
              <td>
                <CButton
                  :name="item.id"
                  size="sm"
                  :key="item.id"
                  color="youtube"
                  @click="deleteConvertion(item.id)"
                >
                  <CIcon size="sm" name="cil-trash"/>
                </CButton>
              </td>
            </template>

          </CDataTable>

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
  import {save, destroy, list} from '../../../../assets/js/methods/functions.js'

  export default {
    name: 'ModalConversions',
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
      unitMeasure: {
        type: Object,
        required: false,
        default: null
      },
      fields: {
        type: Array,
        default() {
          return [
              { key: "index", label: "#" },
              { key: "text1", label: "Unidad" },
              { key: "amount", label: "Factor de conversión" },
              { key: "text2", label: "Unidad 2" },
              { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
          ];
        },
      },
    },
    data() {
      return {
        prefix: "convertion",
        prefix_list: "convertions",
        prefix_units_measure: "units_measure",
        sale: null,
        units_measure: [],
        convertions: [],
        filters: {
          unitMeasure: 0,
          unitMeasureConvert: 0,
          amount: 0,
        },
        loading: false,
        loadingUnitMeasure: false,
        flagModalDepositsSale: false,
      };
    },
    async mounted() {
      await this.getConvertionsByUnit();
    },
    computed: {
      tableItems () {
        return this.loading ? [] : this.convertions
      }
    },
    watch: {
      async isVisible(newValue) {
        if (newValue) {
          await this.getUnitsMeasure();
          await this.getConvertionsByUnit();
        }
      },
    },
    methods: {
      async getUnitsMeasure(){

        this.loading = true;
        this.loadingUnitMeasure = true;

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

          this.loadingUnitMeasure = false;

        }

      },
      async getConvertionsByUnit(){

        this.loading = true;

        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list);
          
          if (response.status === 200) {
            this.convertions = response.data.data;
          }

        } catch (errors) {

          this.convertions = [];

        } finally {

          this.loading = false;

        }

      },
      async saveConvertion(){

        this.loading = true;

        try {

          if(this.filters.amount == 0){
            Swal.fire("Alerta", "El factor de conversión no puede ser 0", "warning");
            this.loading = false;
            return
          }

          if(this.filters.unitMeasure == 0){
            Swal.fire("Alerta", "La Unidad de Medida es obligatoria", "warning");
            this.loading = false;
            return
          }

          if(this.filters.unitMeasureConvert == 0){
            Swal.fire("Alerta", "La Unidad de Medida 2 es obligatoria", "warning");
            this.loading = false;
            return
          }

          if(this.filters.unitMeasure == this.filters.unitMeasureConvert){
            Swal.fire("Alerta", "Las unidades de medida no pueden ser iguales", "warning");
            this.loading = false;
            return
          }

          const url = this.$store.state.url;
          const data = this.getSetData(this.filters);
          const response = await save(url + this.prefix, data);

          if (response.status === 200) {

            this.filters.amount = 0;
            this.getConvertionsByUnit();

            Swal.fire("Alerta", response.data.message, "success");
            this.flagModal = false;
            
          } else {

            Swal.fire("Alerta", response.data.message, "warning");
            this.flagModal = false;

          }

        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loading = false;

        }

      },
      async deleteConvertion(id){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: "Se eliminará la conversión",
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
              const response = await destroy(url+el.prefix+`/${id}`);

              if (response.status === 200) {

                el.getConvertionsByUnit();
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

        formData.append('id_unit_measure', data.unitMeasure);
        formData.append('amount', data.amount);
        formData.append('id_unit_measure_convert', data.unitMeasureConvert);

        return formData;

      },
      closeModal(){
        this.$emit("close-modal-conversions");
      },
      openModalDepositsSale(item) {      
        this.sale = item;
        this.flagModalDepositsSale = true;
      },
      closeModalDepositsSale() {
        this.flagModalDepositsSale = false;
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