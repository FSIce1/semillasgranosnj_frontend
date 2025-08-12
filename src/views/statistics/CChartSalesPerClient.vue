<template>
  <CChartPie
    :datasets="defaultDatasets"
    :labels="sales_per_client.names"
  />
</template>

<script>
import { CChartPie } from '@coreui/vue-chartjs'

export default {
  name: 'CChartSalesPerClient',
  props: {
    sales_per_client: Object,
  },
  components: { CChartPie },
  computed: {
    defaultDatasets () {
      return [
        {
          backgroundColor: [
            '#41B883',
            '#E46651',
            '#00D8FF',
            '#DD1B16'
          ],
          data: this.sales_per_client.counts
        }
      ]
    }
  }
}
</script>
