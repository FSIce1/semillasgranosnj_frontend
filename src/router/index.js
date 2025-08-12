import Vue from 'vue'
import Router from 'vue-router'

// Ventas
const Sales = () => import('@/views/sales/list/Sales')
const Sale = () => import('@/views/sales/details/Sale')
const AddSale = () => import('@/views/sales/add/AddSale')
const Caja = () => import('@/views/caja/Details')

// Compras
const Purchases = () => import('@/views/purchases/list/Purchases')
const Purchase = () => import('@/views/purchases/details/Purchase')
const AddPurchase = () => import('@/views/purchases/add/AddPurchase')

// Fórmulas
const ListFormula = () => import('@/views/formulas/list/Formulas')
const AddFormula = () => import('@/views/formulas/add/AddFormula')

// Maestras
const Presentations = () => import('@/views/maestras/presentations/Presentations')
const Processes = () => import('@/views/maestras/process/Processes')
const Machines = () => import('@/views/maestras/machines/Machines')
const Shifts = () => import('@/views/maestras/shifts/Shifts')
const UnitsMeasure = () => import('@/views/maestras/units_measure/UnitsMeasure')

// Administrable
const Users = () => import('@/views/administrable/users/Users')
const Clients = () => import('@/views/administrable/clients/Clients')
const Providers = () => import('@/views/administrable/providers/Providers')
const RolesProfiles = () => import('@/views/administrable/roles/RolesProfiles')

// Producciones
const Productions = () => import('@/views/productions/Productions')
const PreparadasClient = () => import('@/views/preparadas/Preparadas')

// Productos
const Products = () => import('@/views/products/Products')


// Containers
const TheContainer = () => import('@/containers/TheContainer')

// Views
const Perfil = () => import('@/views/perfil/Perfil')

// Estadísticas y Reportes
const Statistics = () => import('@/views/statistics/Statistics')

// Views - Pages
const Page404 = () => import('@/views/pages/Page404')
const Login = () => import('@/views/pages/Login')

Vue.use(Router)

export default new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/inicio',
      name: 'Inicio',
      component: TheContainer,
      children: [
        
        // Menú
        {
          path: 'inicio',
          name: 'Perfil',
          component: Perfil
        },

        // Compras
        {
          path: 'compras',
          redirect: '/compras/listado',
          name: 'Compras',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Listado compras',
              component: Purchases
            },
            {
              path: 'add-compra',
              name: 'Agregar compra',
              component: AddPurchase
            },
            {
              path: 'details-compra',
              name: 'Detalle compra',
              component: Purchase
            }
          ]
        },

        // Ventas
        {
          path: 'ventas',
          redirect: '/ventas/listado',
          name: 'Ventas',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Listado ventas',
              component: Sales
            },
            {
              path: 'add-venta',
              name: 'Agregar venta',
              component: AddSale
            },
            {
              path: 'details-venta',
              name: 'Detalle venta',
              component: Sale
            }
          ]
        },

        // Producción
        {
          path: 'produccion',
          redirect: '/produccion/listado',
          name: 'Produccion',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Listado producciones',
              component: Productions
            }
          ]
        },

        // Producción
        {
          path: 'preparadas',
          redirect: '/preparadas/listado',
          name: 'Preparadas',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Preparadas del Cliente',
              component: PreparadasClient
            }
          ]
        },

        // Caja
        {
          path: 'caja',
          redirect: '/caja/listado',
          name: 'Caja',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Caja',
              component: Caja
            }
          ]
        },

        // Productos
        {
          path: 'productos',
          redirect: '/productos/listado',
          name: 'Productos',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Listado Productos',
              component: Products
            }
          ]
        },

        // Fórmulas
        {
          path: 'formulas',
          redirect: '/formulas/listado',
          name: 'Formulas',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'listado',
              name: 'Listado Fórmulas',
              component: ListFormula
            },
            {
              path: 'add-formula',
              name: 'Agregar Fórmula',
              component: AddFormula
            },
          ]
        },

        // Maestras
        {
          path: 'maestras',
          redirect: '/maestras/presentaciones',
          name: 'Maestras',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'presentaciones',
              name: 'Listado Presentaciones',
              component: Presentations
            },
            {
              path: 'procesos',
              name: 'Listado Procesos',
              component: Processes
            },
            {
              path: 'turnos',
              name: 'Listado Turnos',
              component: Shifts
            },
            {
              path: 'maquinas',
              name: 'Listado Máquinas',
              component: Machines
            },
            {
              path: 'unidades',
              name: 'Listado Unidades de Medida',
              component: UnitsMeasure
            },
          ]
        },

        // Administrable
        {
          path: 'administrable',
          redirect: '/administrable/usuarios',
          name: 'Administrable',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'usuarios',
              name: 'Listado Usuarios',
              component: Users
            },
            {
              path: 'clientes',
              name: 'Cuenta Clientes',
              component: Clients
            },
            {
              path: 'proveedores',
              name: 'Cuenta Proveedores',
              component: Providers
            },
            {
              path: 'roles',
              name: 'Roles y Perfiles',
              component: RolesProfiles
            },
          ]
        },

        // Estadísticas y Reportes
        {
          path: 'statistics',
          name: 'Estadísticas',
          component: Statistics
        },

      ]
    },
    {
      path: '/pages',
      redirect: '/pages/404',
      name: 'Pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: '404',
          name: 'Page404',
          component: Page404
        },
        {
          path: 'login',
          name: 'Login',
          component: Login
        },
      ]
    },
    { path: '*', component: Page404 }
  ]
})
