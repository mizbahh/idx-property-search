import React from 'react';

function PropertyCard({ property }) {
    const {
        L_ListingID,
        L_Address,
        L_City,
        L_State,
        L_Zip,
        L_SystemPrice,
        L_Keyword2,
        LM_Dec_3,
        LM_Int2_3,
        L_Photos,
    } = property;

    // Safely parse photos
    let photos = [];
    try {
        if (L_Photos) {
            photos = JSON.parse(L_Photos);
        }
    } catch (e) {
        photos = [];
    }

    const firstPhoto = photos.length > 0 ? photos[0] : null;

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Price not listed';
        return '$' + Number(price).toLocaleString();
    };

    return (
        <div className="property-card">
            <div className="property-image">
                {firstPhoto ? (
                    <img src={firstPhoto} alt={L_Address} />
                ) : (
                    <div className="no-image">No Photo Available</div>
                )}
            </div>
            <div className="property-info">
                <div className="property-price">{formatPrice(L_SystemPrice)}</div>
                <div className="property-address">{L_Address}</div>
                <div className="property-location">{L_City}, {L_State} {L_Zip}</div>
                <div className="property-stats">
                    <span>{L_Keyword2 ?? '—'} beds</span>
                    <span>{LM_Dec_3 ?? '—'} baths</span>
                    <span>{LM_Int2_3 ? LM_Int2_3.toLocaleString() : '—'} sqft</span>
                </div>
            </div>
        </div>
    );
}

export default PropertyCard;