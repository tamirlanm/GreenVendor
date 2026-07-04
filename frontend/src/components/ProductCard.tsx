import React from 'react'
import { Link } from 'react-router-dom'

interface Product {
    id: string
    name: string
    price: number
    esgScore: number
}

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <article>
            <h3>{ product.name }</h3>
            <p>Price: ${ product.price }</p>
            <p>ESG Score: { product.esgScore }</p>
            <Link to={`/products/${product.id}`}>View details</Link>
        </article>
    )
}