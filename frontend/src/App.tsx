import React from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Products from './pages/Products'
import Footer from './components/Footer'
import ProductDetail from './pages/ProductDetail'

export default function App() {
  return (
    <>
      <header>
        <nav className="site-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Products</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='*' element={<NotFound />} />
          <Route path='/products/:id' element={<ProductDetail />} />
        </Routes>
      </main>

      <Footer companyName='GreenVendor' />

    </>
  )
}