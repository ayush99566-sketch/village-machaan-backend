// Web Methods - API endpoints for the reservation system
// These functions can be called from the frontend using wixFetch

import { reservationService } from 'backend/reservationService';
import { COLLECTIONS } from 'backend/collections';
import wixData from 'wix-data';

// ===== AVAILABILITY ENDPOINTS =====

/**
 * Check cottage availability for selected dates
 * @param {Object} request - Request object containing cottageId, checkInDate, checkOutDate
 * @returns {Promise<Object>} Availability status and details
 */
export async function checkCottageAvailability(request) {
    try {
        const { cottageId, checkInDate, checkOutDate } = request;
        
        if (!cottageId || !checkInDate || !checkOutDate) {
            throw new Error('Missing required parameters: cottageId, checkInDate, checkOutDate');
        }

        const availability = await reservationService.checkAvailability(
            cottageId, 
            new Date(checkInDate), 
            new Date(checkOutDate)
        );

        return {
            success: true,
            data: availability
        };

    } catch (error) {
        console.error('Error in checkCottageAvailability:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== PACKAGE ENDPOINTS =====

/**
 * Get all available packages
 * @returns {Promise<Object>} List of available packages
 */
export async function getAvailablePackages() {
    try {
        const packages = await reservationService.getAvailablePackages();
        
        return {
            success: true,
            data: packages
        };

    } catch (error) {
        console.error('Error in getAvailablePackages:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get package details by ID
 * @param {Object} request - Request object containing packageId
 * @returns {Promise<Object>} Package details
 */
export async function getPackageById(request) {
    try {
        const { packageId } = request;
        
        if (!packageId) {
            throw new Error('Missing required parameter: packageId');
        }

        const packageData = await reservationService.getPackageById(packageId);
        
        return {
            success: true,
            data: packageData
        };

    } catch (error) {
        console.error('Error in getPackageById:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== BOOKING ENDPOINTS =====

/**
 * Create a new booking
 * @param {Object} request - Request object containing booking details
 * @returns {Promise<Object>} Created booking information
 */
export async function createBooking(request) {
    try {
        const {
            cottageId,
            packageId,
            checkInDate,
            checkOutDate,
            adults,
            children,
            customerInfo,
            specialRequests
        } = request;

        // Validate required fields
        if (!cottageId || !packageId || !checkInDate || !checkOutDate || !adults || !customerInfo) {
            throw new Error('Missing required booking parameters');
        }

        // Validate guest count
        if (adults < 1) {
            throw new Error('At least one adult is required');
        }

        // Check availability before creating booking
        const availability = await reservationService.checkAvailability(
            cottageId, 
            new Date(checkInDate), 
            new Date(checkOutDate)
        );

        if (!availability.isAvailable) {
            return {
                success: false,
                error: 'Selected dates are not available for this cottage'
            };
        }

        // Create booking data object
        const bookingData = {
            cottageId,
            packageId,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            adults: parseInt(adults),
            children: parseInt(children) || 0,
            customerInfo,
            specialRequests: specialRequests || ''
        };

        // Create the booking
        const createdBooking = await reservationService.createBooking(bookingData);

        return {
            success: true,
            data: createdBooking,
            message: 'Booking created successfully'
        };

    } catch (error) {
        console.error('Error in createBooking:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get booking details by ID
 * @param {Object} request - Request object containing bookingId
 * @returns {Promise<Object>} Complete booking information
 */
export async function getBookingDetails(request) {
    try {
        const { bookingId } = request;
        
        if (!bookingId) {
            throw new Error('Missing required parameter: bookingId');
        }

        const bookingDetails = await reservationService.getBookingDetails(bookingId);
        
        return {
            success: true,
            data: bookingDetails
        };

    } catch (error) {
        console.error('Error in getBookingDetails:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update booking status
 * @param {Object} request - Request object containing bookingId and status
 * @returns {Promise<Object>} Updated booking information
 */
export async function updateBookingStatus(request) {
    try {
        const { bookingId, status } = request;
        
        if (!bookingId || !status) {
            throw new Error('Missing required parameters: bookingId, status');
        }

        const updatedBooking = await reservationService.updateBookingStatus(bookingId, status);
        
        return {
            success: true,
            data: updatedBooking,
            message: 'Booking status updated successfully'
        };

    } catch (error) {
        console.error('Error in updateBookingStatus:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== SAFARI BOOKING ENDPOINTS =====

/**
 * Create safari bookings for a reservation
 * @param {Object} request - Request object containing bookingId and safariData
 * @returns {Promise<Object>} Created safari bookings
 */
export async function createSafariBookings(request) {
    try {
        const { bookingId, safariData } = request;
        
        if (!bookingId || !safariData || !Array.isArray(safariData)) {
            throw new Error('Missing required parameters: bookingId, safariData (array)');
        }

        const createdSafaris = await reservationService.createSafariBookings(bookingId, safariData);
        
        return {
            success: true,
            data: createdSafaris,
            message: 'Safari bookings created successfully'
        };

    } catch (error) {
        console.error('Error in createSafariBookings:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update safari booking status
 * @param {Object} request - Request object containing safariId and status
 * @returns {Promise<Object>} Updated safari booking
 */
export async function updateSafariStatus(request) {
    try {
        const { safariId, status } = request;
        
        if (!safariId || !status) {
            throw new Error('Missing required parameters: safariId, status');
        }

        const updatedSafari = await reservationService.updateSafariStatus(safariId, status);
        
        return {
            success: true,
            data: updatedSafari,
            message: 'Safari status updated successfully'
        };

    } catch (error) {
        console.error('Error in updateSafariStatus:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== UTILITY ENDPOINTS =====

/**
 * Get all cottages
 * @returns {Promise<Object>} List of all cottages
 */
export async function getAllCottages() {
    try {
        const cottages = await wixData.query(COLLECTIONS.COTTAGES)
            .eq('isActive', true)
            .find();
        
        return {
            success: true,
            data: cottages.items
        };

    } catch (error) {
        console.error('Error in getAllCottages:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Calculate booking cost without creating the booking
 * @param {Object} request - Request object containing cottageId, packageId, checkInDate, checkOutDate
 * @returns {Promise<Object>} Cost breakdown
 */
export async function calculateBookingCost(request) {
    try {
        const { cottageId, packageId, checkInDate, checkOutDate } = request;
        
        if (!cottageId || !packageId || !checkInDate || !checkOutDate) {
            throw new Error('Missing required parameters');
        }

        // Get cottage and package details
        const cottage = await wixData.get(COLLECTIONS.COTTAGES, cottageId);
        const packageData = await wixData.get(COLLECTIONS.PACKAGES, packageId);

        if (!cottage || !packageData) {
            throw new Error('Cottage or package not found');
        }

        // Calculate costs
        const nights = reservationService.calculateNights(new Date(checkInDate), new Date(checkOutDate));
        const roomCost = cottage.basePricePerNight * nights;
        const packageCost = packageData.price;
        const totalCost = roomCost + packageCost;

        return {
            success: true,
            data: {
                roomCost: roomCost,
                packageCost: packageCost,
                totalCost: totalCost,
                nights: nights,
                costPerNight: cottage.basePricePerNight
            }
        };

    } catch (error) {
        console.error('Error in calculateBookingCost:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export all web methods
export default {
    checkCottageAvailability,
    getAvailablePackages,
    getPackageById,
    createBooking,
    getBookingDetails,
    updateBookingStatus,
    createSafariBookings,
    updateSafariStatus,
    getAllCottages,
    calculateBookingCost
};
