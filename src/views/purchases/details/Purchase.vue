<template>
  <CCard>
    <CCardHeader>
      Compra <strong># {{ this.purchase.consecutive }}</strong>
      <div class="float-right">
        <a 
          href="#" 
          class="btn btn-sm btn-youtube ml-1" 
          @click="downloadReport('purchase_pdf', 'ticket', '.pdf')"
        >
          <CIcon name="cil-spreadsheet" class="mr-1"/> Imprimir ticket
        </a>
        <a 
          href="#" 
          class="btn btn-sm btn-success ml-1"
          @click="downloadReport('purchase_excel', 'excel', '.xlsx')"
        >
          <CIcon name="cil-spreadsheet" class="mr-1"/> Generar excel
        </a>
      </div>
    </CCardHeader>
    <CCardBody>
      <CRow class="mb-4">
        <CCol sm="4">
          <span class="mb-3"><b>Proveedor:</b> {{ purchase.provider ? purchase.provider.name : 'Sin proveedor' }}</span>
        </CCol>
        <CCol sm="4">
          <span class="mb-3"><b>Tipo de Compra:</b> {{ purchase.type }}</span>
        </CCol>
        <CCol sm="4">
          <span class="mb-3"><b> {{ purchase.boleta_factura == "boleta" ? "Boleta de Compra" : "Factura" }}</b></span>
        </CCol>
      </CRow>
      <div class="table-responsive-sm">
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="center">#</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th class="center">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in this.purchase.details" :key="index">
              <td class="center">{{ index+1 }}</td>
              <td class="left">{{ item.product.name }}</td>
              <td class="center">{{ item.amount }}</td>
              <td class="right">S/. {{ item.price }}</td>
              <td class="right">S/. {{ item.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CRow>
        <CCol lg="4" sm="5">
        </CCol>
        <CCol lg="4" sm="5" class="ml-auto">
          <table class="table table-clear">
            <tbody>
              <tr>
                <td class="left"><strong>Subtotal</strong></td>
                <td class="right">S/. {{ this.purchase.subtotal }}</td>
              </tr>
              <tr v-if="purchase.type == 'credito'">
                <td class="left"><strong>Depositó</strong></td>
                <td class="right">S/. {{ this.purchase.deposit }}</td>
              </tr>
              <!-- <tr>
                <td class="left"><strong>Consumo</strong></td>
                <td class="right">S/. {{ this.purchase.consumption }}</td>
              </tr> -->
              <tr>
                <td class="left"><strong>Total</strong></td>
                <td class="right"><strong>S/. {{ this.purchase.total }}</strong></td>
              </tr>
            </tbody>
          </table>
        </CCol>
      </CRow>
      <!-- Indicador de carga -->
      <div v-if="loading" class="text-center mt-3">
        <CSpinner color="primary" /> Generando archivo...
      </div>
    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {report, ticket} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'Purchase',
    data() {
      return {
        loading: false,
        data: {},
        purchase: {
          id: "",
          consecutive: "",
          date: "",
          client: "",
          description: "",
          subtotal: 0,
          deposit: 0,
          consumption: 0,
          type: "",
          boleta_factura: "",
          ruc: "",
          total: 0,
          details: []
        },
      };
    },
    async mounted() {
      await this.getPurchase();
    },
    methods: {
      async getPurchase(){

        const data = this.$route.query.data;

        if (data && typeof data === 'string' && data.trim() !== '') {

          const item = JSON.parse(data);

          this.purchase.id          = item.id;
          this.purchase.consecutive = item.consecutive;
          this.purchase.date        = item.date;
          this.purchase.provider    = item.provider;
          this.purchase.description = item.description;
          this.purchase.subtotal    = item.subtotal;
          this.purchase.deposit     = item.deposit;
          this.purchase.consumption = item.consumption;
          this.purchase.type        = item.type;
          this.purchase.boleta_factura  = item.boleta_factura;
          this.purchase.ruc         = item.ruc;
          this.purchase.total       = item.total;
          this.purchase.details     = item.details;

        }

      },
      async downloadReport(method, type, extention) {

        this.loading = true;

        try {

          const url = this.$store.state.url;

          if(type == "excel"){
            await report(url+method, this.purchase, "reporte N°"+this.purchase.consecutive+extention);
          } else {
            await ticket(url+method, this.purchase, "reporte N°"+this.purchase.consecutive+extention);
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
    }
  }

</script>
