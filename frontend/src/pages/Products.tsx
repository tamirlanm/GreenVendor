import React from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

export default function Products() {
    const sample = [
        { id: 'p1', name: 'Eco Soap', price: 4.99, esgScore: 91 },
        { id: 'p2', name: 'Reusable Bag', price: 2.49, esgScore: 88 }
    ]

    return (
        <section>
            <h1>Products</h1>
            <ul>
                {sample.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </ul>
        </section>
    )
}