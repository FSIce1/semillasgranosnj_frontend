<template>
    <CDataTable
        :items="items"
        :fields="fields"
        :items-per-page="pageSizeSync"
        :no-items-view="noItemsView"
        :hover="hover"
        :striped="striped"
        :border="border"
        :small="small"
        :fixed="fixed"
        :dark="dark"
        :loading="loading"
        :sorter="sorter"
        :column-filter="columnFilter"
        :pagination="pagination"
        :table-filter="false"
        v-bind="$attrs"
        v-on="$listeners"
    >

        <template #loading>
            <div class="text-center p-4">
                <CSpinner color="primary" />
                <p class="mb-0 mt-2 text-muted">Cargando...</p>
            </div>
        </template>

        <template #index="{ index }">
            <td>{{ index + 1 }}</td>
        </template>

        <!-- Empty -->
        <template #no-items>
            <div class="text-center text-muted py-4">
                <CIcon name="cil-folder-open" class="mb-2" />
                <div>{{ noItemsView.noItems }}</div>
            </div>
        </template>
        <template #no-results>
            <div class="text-center text-muted py-4">
                <CIcon name="cil-search" class="mb-2" />
                <div>{{ noItemsView.noResults }}</div>
            </div>
        </template>

        <!-- Sticky header (opcional) -->
        <template v-if="stickyHeader" #thead-top>
            <tr style="position: sticky; top: 0; z-index: 2; background: white">
                <th :colspan="fields.length"></th>
            </tr>
        </template>

        <!-- Proxy de TODOS los scoped slots que definas afuera (#campo, #cell(campo), etc.) -->
        <template
            v-for="(slotFn, slotName) in $scopedSlots"
            v-slot:[slotName]="slotProps"
        >
            <slot :name="slotName" v-bind="slotProps" />
        </template>

        <!-- Slot por defecto -->
        <slot />

    </CDataTable>
</template>

<script>
    export default {
        name: "CustomDataTable",
        inheritAttrs: false,
        props: {
            items: { type: Array, required: true },
            fields: { type: Array, required: true },

            // apariencia/tabla
            hover: Boolean,
            striped: Boolean,
            border: Boolean,
            small: Boolean,
            fixed: Boolean,
            dark: Boolean,
            loading: Boolean,
            sorter: { type: [Boolean, Object], default: false },
            columnFilter: { type: [Boolean, Object], default: false },
            pagination: { type: Boolean, default: true },

            // toolbar
            searchable: { type: Boolean, default: false }, //? Buscador
            searchPlaceholder: { type: String, default: "Buscar..." },
            filter: { type: String, default: "" },
            showPageSize: { type: Boolean, default: false },
            pageSize: { type: Number, default: 10 },
            pageSizeOptions: { type: Array, default: () => [5, 10, 20, 50] },

            // sticky header
            stickyHeader: { type: Boolean, default: false }, //? Línea en la cabecera
            maxHeight: { type: String, default: "60vh" },

            // footer
            footer: { type: Boolean, default: false },
            footerLeftText: { type: String, default: "" },

            // textos
            noItemsView: {
                type: Object,
                default: () => ({
                    noItems: "No hay registros",
                    noResults: "No se encontraron resultados",
                }),
            },
        },
        data() {
            return {
            innerFilter: this.filter,
            pageSizeSync: this.pageSize,
            };
        },
        watch: {
            filter(val) {
                this.innerFilter = val;
            },
            pageSize(val) {
                this.pageSizeSync = val;
            },
        },
        methods: {
            onChangePageSize(val) {
            this.pageSizeSync = Number(val);
            this.$emit("update:pageSize", this.pageSizeSync);
            },
        },
    };
</script>

<style scoped>
    .table-responsive thead th {
        background: #fff;
    }
</style>
