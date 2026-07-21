import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';

function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProperties() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchProperties({ limit: 20, offset: 0 });
                setProperties(data.results);
                setTotal(data.total);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProperties();
    }, []);

    if (loading) return <div className="status">Loading properties...</div>;
    if (error) return <div className="status error">Error: {error}</div>;

    return (
        <div className="listings-page">
            <h1>Property Listings</h1>
            <p className="count">Showing {properties.length} of {total} properties</p>
            <div className="property-grid">
                {properties.map((property) => (
                    <PropertyCard key={property.L_ListingID} property={property} />
                ))}
            </div>
        </div>
    );
}

export default ListingsPage;