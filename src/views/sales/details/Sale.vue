<template>
  <CCard>
    <CCardHeader>
      Venta <strong># {{ this.sale.consecutive }}</strong>
      <div class="float-right">
        <a 
          href="#" 
          class="btn btn-sm btn-youtube ml-1" 
          @click="downloadReport('sale_pdf', 'ticket', '.pdf')"
        >
          <CIcon name="cil-spreadsheet" class="mr-1"/> Imprimir ticket
        </a>
        <a 
          href="#" 
          class="btn btn-sm btn-success ml-1"
          @click="downloadReport('sale_excel', 'excel', '.xlsx')"
        >
          <CIcon name="cil-spreadsheet" class="mr-1"/> Generar excel
        </a>
      </div>
    </CCardHeader>
    <CCardBody>
      <CRow class="mb-4">
        <CCol sm="4">
          <span class="mb-3"><b>Cliente:</b> {{ sale.client ? sale.client.name : 'Sin Cliente' }}</span>
        </CCol>
        <CCol sm="4">
          <span class="mb-3"><b>Tipo de Venta:</b> {{ sale.type }}</span>
        </CCol>
        <CCol sm="4">
          <span class="mb-3"><b> {{ sale.boleta_factura == "boleta" ? "Boleta de Venta" : "Factura" }}</b></span>
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
            <tr v-for="(item, index) in this.sale.details" :key="index">
              <td class="center">{{ index + 1 }}</td>
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
                <td class="right">S/. {{ this.sale.subtotal }}</td>
              </tr>
              <tr v-if="sale.type == 'credito'">
                <td class="left"><strong>Depositó</strong></td>
                <td class="right">S/. {{ this.sale.deposit }}</td>
              </tr>
              <tr>
                <td class="left"><strong>Total</strong></td>
                <td class="right"><strong>S/. {{ this.sale.total }}</strong></td>
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

  import {report, ticket, request} from '@/utils/functions.js'

  export default {
    name: 'Sale',
    data() {
      return {
        loading: false,
        data: {},
        sale: {
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
          total: 0,
          details: []
        },
      };
    },
    async mounted() {
      await this.getSale();
    },
    methods: {

      //* Main Functions
        async getSale() {

          const data = this.$route.query.data;

          if (data && typeof data === 'string' && data.trim() !== '') {

            const item = JSON.parse(data);

            this.sale.id              = item.id;
            this.sale.consecutive     = item.consecutive;
            this.sale.date            = item.date;
            this.sale.client          = item.client;
            this.sale.description     = item.description;
            this.sale.subtotal        = item.subtotal;
            this.sale.deposit         = item.deposit;
            this.sale.consumption     = item.consumption;
            this.sale.type            = item.type;
            this.sale.boleta_factura  = item.boleta_factura;
            this.sale.total           = item.total;
            this.sale.details         = item.details;

          }

        },
        async downloadReport(method, type, extention) {

          await this.request(async () => {

            const url = this.$store.state.url

            if(type == "excel"){
              await report(url+method, this.sale, "reporte N°"+this.sale.consecutive+extention);
            } else {
              await ticket(url+method, this.sale, "reporte N°"+this.sale.consecutive+extention);
            }

          }, { loadingKey: "loading" })

        },

        //* Secondary Functions
        request,

    }
  }

</script>
