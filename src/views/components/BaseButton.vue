<template>
    <td class="text-center">
        <CButton
            :type="type"
            :size="size"
            :color="computedColor"
            :shape="disableShape ? null : shape"
            :variant="disableVariant ? null : variant"
            :disabled="disabled || loading"
            v-bind="$attrs"
            v-on="$listeners"
            @click="handleClick"
        >

            <CIcon size="sm" :name="computedIcon" />

            <template v-if="loading">
                <CSpinner size="sm" color="light" />
            </template>
            <template v-else>
                <slot />
            </template>

        </CButton>
    </td>
</template>

<script>
    import { CButton } from '@coreui/vue-pro'

    export default {
        name: 'BaseButton',
        components: { CButton },
        inheritAttrs: false,
        props: {
            // control de estilos globales
            disableShape:   { type: Boolean, default: false },
            disableVariant: { type: Boolean, default: false },

            // estado
            loading:  { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },

            // apariencia
            color:   { type: String,  default: 'primary' },
            size:    { type: String,  default: 'sm' },
            shape:   { type: String,  default: 'pill' },
            variant: { type: String,  default: 'outline' },
            type:    { type: String,  default: 'button' },
            modo:    { type: String, default: null } 
        },
        computed: {
            computedIcon() {
                switch (this.modo) {
                    case 'eliminar': return 'cil-trash'
                    case 'editar': return 'cil-pencil'
                    case 'ver': return 'cil-magnifying-glass'
                    default: return 'cil-circle'
                }
            },
            computedColor() {
                switch (this.modo) {
                    case 'eliminar': return 'danger'
                    case 'editar': return 'warning'
                    case 'ver': return 'info'
                    default: return this.$attrs.color || 'secondary'
                }
            }
        },
        methods: {
            handleClick (e) {
            // Bloquea clicks si está cargando o deshabilitado
            if (this.loading || this.disabled) {
                e.preventDefault()
                return
            }
            this.$emit('click', e)
            }
        }
    }
</script>