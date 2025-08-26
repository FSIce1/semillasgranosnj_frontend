import Vue from 'vue'
import Router from 'vue-router'

// Ventas
const Sales = () => import('@/views/sales/list/Sales')
const Sale = () => import('@/views/sales/details/Sale')
const AddSale = () => import('@/views/sales/add/AddSale')

// Compras
const Purchases = () => import('@/views/purchases/list/Purchases')
const Purchase = () => import('@/views/purchases/details/Purchase')
const AddPurchase = () => import('@/views/purchases/add/AddPurchase')

// Maestras
const UnitsMeasure = () => import('@/views/others/maestras/units_measure/UnitsMeasure')
const WareHouses = () => import('@/views/others/maestras/warehouses/WareHouses')

// Administrable
const Users = () => import('@/views/others/administrable/users/Users')
const Clients = () => import('@/views/others/administrable/clients/Clients')
const Providers = () => import('@/views/others/administrable/providers/Providers')
const RolesProfiles = () => import('@/views/others/administrable/roles/RolesProfiles')

// Caja
const Caja = () => import('@/views/others/caja/Details')

// Productos
const Products = () => import('@/views/others/products/Products')

// Estadísticas y Reportes
const Statistics = () => import('@/views/others/statistics/Statistics')

// Containers
const TheContainer = () => import('@/containers/TheContainer')

// Views
const Perfil = () => import('@/views/perfil/Perfil')

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
              path: 'agregar-compra',
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
              path: 'agregar-venta',
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

        //* Others

        // Maestras
        {
          path: 'maestras',
          redirect: '/maestras/unidades',
          name: 'Maestras',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'unidades',
              name: 'Unidades de Medida',
              component: UnitsMeasure
            },
            {
              path: 'almacenes',
              name: 'Almacenes',
              component: WareHouses
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
