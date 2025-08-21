// Database Collections Structure for Reservation System
// This file defines the schema and structure for all collections needed

import wixData from 'wix-data';

// Collection names
export const COLLECTIONS = {
    COTTAGES: 'Cottages',
    PACKAGES: 'Packages',
    BOOKINGS: 'Bookings',
    AVAILABILITY: 'Availability',
    SAFARI_BOOKINGS: 'SafariBookings',
    SAFARI_INQUIRIES: 'SafariInquiries'
};

// Cottage types
export const COTTAGE_TYPES = {
    HORNBILL: 'Hornbill',
    KINGFISHER: 'Kingfisher',
    GLASS_COTTAGE: 'Glass Cottage'
};

// Package types
export const PACKAGE_TYPES = {
    HONEYMOON: 'Honeymoon',
    ELDERLY: 'Elderly',
    FAMILY_FUN: 'Family Fun',
    BASIC: 'Basic'
};

// Booking statuses
export const BOOKING_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
};

// Safari booking statuses
export const SAFARI_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled'
};

// Collection schemas
export const COLLECTION_SCHEMAS = {
    [COLLECTIONS.COTTAGES]: {
        _id: 'string',
        name: 'string', // Hornbill, Kingfisher, Glass Cottage
        description: 'string',
        maxAdults: 'number', // Maximum 2 adults per room
        maxChildren: 'number',
        basePricePerNight: 'number',
        images: 'array',
        amenities: 'array',
        isActive: 'boolean',
        createdDate: 'date',
        updatedDate: 'date'
    },
    
    [COLLECTIONS.PACKAGES]: {
        _id: 'string',
        name: 'string', // Honeymoon, Elderly, Family Fun, etc.
        description: 'string',
        price: 'number',
        includesSafari: 'boolean',
        safariCount: 'number', // Number of safaris included
        features: 'array',
        isActive: 'boolean',
        seasonalPricing: 'object', // Different prices for different seasons
        createdDate: 'date',
        updatedDate: 'date'
    },
    
    [COLLECTIONS.BOOKINGS]: {
        _id: 'string',
        cottageId: 'string', // Reference to Cottages collection
        packageId: 'string', // Reference to Packages collection
        checkInDate: 'date',
        checkOutDate: 'date',
        adults: 'number',
        children: 'number',
        totalCost: 'number',
        status: 'string', // Pending, Confirmed, Cancelled, Completed
        customerInfo: 'object', // Name, email, phone, etc.
        paymentStatus: 'string',
        paymentId: 'string',
        specialRequests: 'string',
        createdDate: 'date',
        updatedDate: 'date'
    },
    
    [COLLECTIONS.AVAILABILITY]: {
        _id: 'string',
        cottageId: 'string', // Reference to Cottages collection
        date: 'date',
        isAvailable: 'boolean',
        bookingId: 'string', // Reference to Bookings collection if not available
        createdDate: 'date',
        updatedDate: 'date'
    },
    
    [COLLECTIONS.SAFARI_BOOKINGS]: {
        _id: 'string',
        bookingId: 'string', // Reference to Bookings collection
        safariDate: 'date',
        safariTime: 'string',
        status: 'string', // Pending, Confirmed, Cancelled
        safariType: 'string', // Morning, Evening, etc.
        createdDate: 'date',
        updatedDate: 'date'
    },

    // New collection: Safari inquiries separate from bookings
    [COLLECTIONS.SAFARI_INQUIRIES]: {
        _id: 'string',
        customerName: 'string',
        customerEmail: 'string',
        customerPhone: 'string',
        preferredDate: 'date',
        preferredTime: 'string', // e.g., Morning, Afternoon, Evening or timeslot
        numAdults: 'number',
        numChildren: 'number',
        notes: 'string',
        status: 'string', // New, Contacted, Closed
        source: 'string', // Website form, Phone, Email
        createdDate: 'date',
        updatedDate: 'date'
    }
};

// Helper function to initialize collections if they don't exist
export async function initializeCollections() {
    try {
        // This function will be called during setup to ensure collections exist
        console.log('Collections structure defined. Use Wix Studio to create these collections manually.');
        return true;
    } catch (error) {
        console.error('Error initializing collections:', error);
        return false;
    }
}

// Export all constants and schemas
export default {
    COLLECTIONS,
    COTTAGE_TYPES,
    PACKAGE_TYPES,
    BOOKING_STATUS,
    SAFARI_STATUS,
    COLLECTION_SCHEMAS,
    initializeCollections
};
