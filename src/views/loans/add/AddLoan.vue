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

              <!-- CLIENTES -->
              <CCol md="4" class="compact-field">
                <label class="form-label mb-1">Clientes</label>
                <div v-if="loadingClients">
                  <div class="spinner-border spinner-border-sm mr-2"></div>
                  <span>Cargando clientes…</span>
                </div>
                <template v-else>
                  <div>
                    <multiselect
                      v-model="loan.client"
                      :options=clients
                      :disabled="clients.length === 0 || loadingButtonsActions"
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
                    <small v-if="!loadingClients && clients.length === 0" class="empty-hint tight">
                      <CIcon name="cil-inbox" class="mr-1" />
                      No hay clientes disponibles.
                    </small>
                    <br>
                  </div>
                </template>
              </CCol>

              <!-- ALMACENES -->
              <CCol md="4" class="compact-field">
                <label class="form-label mb-1">Almacenes</label>
                <div v-if="loadingWarehouses">
                  <div class="spinner-border spinner-border-sm mr-2"></div>
                  <span>Cargando almacenes…</span>
                </div>
                <template v-else>
                  <div>
                    <multiselect
                      v-model="loan.warehouse"
                      :disabled="warehouses.length === 0 || loadingButtonsActions"
                      :options=warehouses
                      placeholder="Selecciona el almacén"
                      label="name"
                      track-by="id"
                      select-label="Presiona para seleccionar"
                      selected-label="Seleccionado"
                      deselect-label="Presiona para quitar"
                    >
                      <!-- Lista vacía (sin opciones) -->
                      <template #noOptions>
                        <span class="text-muted">No hay almacenes disponibles</span>
                      </template>

                      <!-- Sin resultados al buscar -->
                      <template #noResult>
                        <span class="text-muted">No se encontraron resultados</span>
                      </template>
                    </multiselect>
                    <small v-if="!loadingWarehouses && warehouses.length === 0" class="empty-hint tight">
                      <CIcon name="cil-inbox" class="mr-1" />
                      No hay almacenes disponibles.
                    </small>
                    <br>
                  </div>
                </template>
              </CCol>

              <!-- FECHA ACTUAL -->
              <CCol md="4">
                <CInput
                  label="Fecha"
                  :lazy="false"
                  :value="loan.start_date"
                  disabled
                  autocomplete="off"
                />
              </CCol>

              <!-- FECHA DEVOLUCIÓN ESPERADA -->
              <CCol md="4">
                <CInput
                  label="Fecha devolución esperada"
                  :disabled="loadingButtonsActions"
                  :min="minStartDate"
                  type="date"
                  :lazy="false"
                  v-model="loan.expected_end_date"
                  autocomplete="off"
                />
              </CCol>

              <!-- NÚMERO DE PRÉSTAMO -->
              <CCol md="4">
                <CInput
                  label="Número de Préstamo"
                  disabled
                  :lazy="false"
                  :value="loan.consecutive"
                  autocomplete="off"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md="12">
                <CTextarea
                  label="Descripción"
                  :disabled="loadingButtonsActions"
                  :value.sync="loan.description"
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
              :warehouse="loan.warehouse"
              :details="loan.details"
              @get-detail="getDetail"
              @close-modal-detail="closeModalDetail"
            />

            <!-- LISTA DE PRODUCTOS SELECCIONADOS -->
            <CTableProductsSelected :disabled="loadingButtonsActions" :items="loan.details" :loading="loadingProducts">
              <template #header>
                <CIcon name="cil-grid"/> Listado de Productos seleccionados
              </template>
            </CTableProductsSelected>

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
                  <CButton color="primary" @click="saveLoan()" class="mr-1 mb-3">
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
  import {list, save, request} from '@/utils/functions.js'
  import {validateNumber, preventInvalidDecimal} from '@/utils/validators.js'
  import CTableProductsSelected from '../add/TableListProductsSelected.vue'

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    name: 'AddLoan',
    data() {
      return {
        prefix: "loan",
        prefix_clients: "clients",
        prefix_warehouses: "warehouses",
        clients: [],
        warehouses: [],
        title: "Nuevo Préstamo",
        btnSave: "Guardar",
        disabledGeneral: false,
        loan: {
          id: "",
          consecutive: "",
          client: "",
          warehouse: null,
          start_date: this.getCurrentDate(),
          expected_end_date: "",
          description: "",
          details: []
        },
        flagModalDetail: false,
        loadingClients: false,
        loadingWarehouses: false,
        loadingProducts: false, 
        loadingButtonsActions: false,
      }
    },
    async mounted() {
      await Promise.all([this.getClients(), this.getWarehouses()]);
      await this.getLoan();
      this.loadingProducts = false;
    },
    computed: {
      minStartDate() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
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
            } else {
              this.clients = [];
            }
            if (this.clients.length === 0) this.loan.client = "";
          }, { loadingKey: "loadingClients" })

        },
        async getWarehouses(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_warehouses)
            if (resp.status === 200){
              let setWarehouses = (resp.data.data).map(role => ({
                id: role.id,
                name: role.name
              }));

              this.warehouses = setWarehouses;
            } else {
              this.warehouses = [];
            }
            if (this.warehouses.length === 0) this.loan.warehouse = null;
          }, { loadingKey: "loadingWarehouses" })

        },
        async saveLoan(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.loan);

            const resp = await save(url + this.prefix, data, this.loan.id)

            if (resp.status === 200) {
              if(resp.data.flag){

                this.loan.id = resp?.data?.data?.id;
                this.loan.consecutive = resp?.data?.data?.consecutive;

                this.$router.push({ 
                  name: 'Listado préstamos'
                });

                Swal.fire("Alerta", resp.data.message, "success")

              } else {

                Swal.fire("Alerta", resp.data.message, "warning");

              }
            }

          }, { loadingKey: "loadingButtonsActions" })

        },
        async getLoan(){

          const data = this.$route.query.data;

          if (data && typeof data === 'string' && data.trim() !== '') {

            const item = JSON.parse(data);

            this.loan.id                = item.id;
            this.loan.consecutive       = item.consecutive;
            this.loan.start_date        = item.start_date;
            this.loan.expected_end_date = item.expected_end_date;
            this.loan.client            = item.client;
            this.loan.warehouse         = item.warehouse;
            this.loan.description       = item.description;
            this.loan.details           = item.details;

            this.disabledGeneral  = true;
            this.btnSave          = "Modificar";
            this.title            = "Modificar Préstamo";

          }

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

          const newDetail = {
            "lot": {
              "id": data.lot_id,
              "name": data.lot_name,
            },
            "unit_measure": {
              "id": data.unit_measure_id,
              "name": data.unit_measure_name,
            },
            quantity_in: data.quantity_in,
            description: data.description,
          };

          this.loan.details.push(newDetail);

          this.loadingProducts = false;

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

          formData.append('client_id', data?.client?.id);
          formData.append('user_id', idUser);
          formData.append('warehouse_id', data?.warehouse?.id);
          formData.append('expected_end_date', data.expected_end_date);
          formData.append('description', data.description);

          (data.details).forEach(function(detail, index) {

            id = (detail.id != null && detail.id != undefined && detail.id != "") ? detail.id : -1;

            formData.append(`details[${index}][id]`, id);
            formData.append(`details[${index}][lot_id]`, detail.lot.id);
            formData.append(`details[${index}][quantity_in]`, detail.quantity_in);
            formData.append(`details[${index}][unit_measure_id]`, detail.unit_measure.id);
            formData.append(`details[${index}][description]`, detail.description);

          });

          return formData;

        },

        //? Modal
        openModalDetail(){
          if(this.loan.warehouse == "" || this.loan.warehouse == null){
            Swal.fire("Alerta", "Seleccione un almacén", "warning");
            return
          }
          this.flagModalDetail = true;
        },
        closeModalDetail(){
          this.flagModalDetail = false;
        },

    }
  }

</script>
