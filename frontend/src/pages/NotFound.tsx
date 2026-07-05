import React from 'react'
import { Link } from 'react-router-dom'


export default function NotFound() {
    return (
        <section>
            <h1>404</h1>
            <p>Page Not Found</p>
            <p><Link to="/">Go Back Home</Link></p>
        </section>
    )
}
