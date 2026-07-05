import React from 'react'
import { useParams } from 'react-router-dom'

export default function ProductDetail() {

    const { id } = useParams<{ id: string }>()

    return (
        <section>
            <h1>Product Detail</h1>
            <p>You are viewing product with ID: {id}</p>
        </section>
    )
}