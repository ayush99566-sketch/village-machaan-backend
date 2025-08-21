// HTTP Functions - Expose reservation APIs at /_functions/*
// Note: HTTP functions must export get/post/put/delete handlers named after the endpoint
// e.g., export function get_getAllCottages(request) { ... }

import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';
import { reservationService } from 'backend/reservationService';
import { COLLECTIONS } from 'backend/collections';

function jsonResponse(statusCode, body) {
    return {
        status: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}

// GET /_functions/getAllCottages
export function get_getAllCottages(_request) {
    return wixData.query(COLLECTIONS.COTTAGES)
        .eq('isActive', true)
        .find()
        .then(result => jsonResponse(200, { success: true, data: result.items }))
        .catch(error => jsonResponse(500, { success: false, error: error.message }));
}

// GET /_functions/getAvailablePackages
export function get_getAvailablePackages(_request) {
    return reservationService.getAvailablePackages()
        .then(packages => jsonResponse(200, { success: true, data: packages }))
        .catch(error => jsonResponse(500, { success: false, error: error.message }));
}

async function parseJsonRequest(request) {
    try {
        const body = await request.body.text();
        return JSON.parse(body || '{}');
    } catch (_e) {
        return null;
    }
}

// POST /_functions/checkCottageAvailability
export async function post_checkCottageAvailability(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.cottageId || !payload.checkInDate || !payload.checkOutDate) {
        return jsonResponse(400, { success: false, error: 'Missing required parameters' });
    }
    try {
        const data = await reservationService.checkAvailability(
            payload.cottageId,
            new Date(payload.checkInDate),
            new Date(payload.checkOutDate)
        );
        return jsonResponse(200, { success: true, data });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}

// POST /_functions/getPackageById
export async function post_getPackageById(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.packageId) {
        return jsonResponse(400, { success: false, error: 'Missing required parameter: packageId' });
    }
    try {
        const data = await reservationService.getPackageById(payload.packageId);
        return jsonResponse(200, { success: true, data });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}

// POST /_functions/createBooking
export async function post_createBooking(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.cottageId || !payload.packageId || !payload.checkInDate || !payload.checkOutDate || !payload.adults) {
        return jsonResponse(400, { success: false, error: 'Missing required booking parameters' });
    }
    try {
        const availability = await reservationService.checkAvailability(
            payload.cottageId,
            new Date(payload.checkInDate),
            new Date(payload.checkOutDate)
        );
        if (!availability.isAvailable) {
            return jsonResponse(200, { success: false, error: 'Selected dates are not available for this cottage' });
        }
        const bookingData = {
            cottageId: payload.cottageId,
            packageId: payload.packageId,
            checkInDate: new Date(payload.checkInDate),
            checkOutDate: new Date(payload.checkOutDate),
            adults: parseInt(payload.adults),
            children: parseInt(payload.children) || 0,
            customerInfo: payload.customerInfo || {},
            specialRequests: payload.specialRequests || ''
        };
        const created = await reservationService.createBooking(bookingData);
        return jsonResponse(200, { success: true, data: created, message: 'Booking created successfully' });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}

// POST /_functions/getBookingDetails
export async function post_getBookingDetails(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.bookingId) {
        return jsonResponse(400, { success: false, error: 'Missing required parameter: bookingId' });
    }
    try {
        const data = await reservationService.getBookingDetails(payload.bookingId);
        return jsonResponse(200, { success: true, data });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}

// POST /_functions/updateBookingStatus
export async function post_updateBookingStatus(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.bookingId || !payload.status) {
        return jsonResponse(400, { success: false, error: 'Missing required parameters: bookingId, status' });
    }
    try {
        const data = await reservationService.updateBookingStatus(payload.bookingId, payload.status);
        return jsonResponse(200, { success: true, data, message: 'Booking status updated successfully' });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}

// POST /_functions/createSafariBookings
export async function post_createSafariBookings(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.bookingId || !Array.isArray(payload.safariData)) {
        return jsonResponse(400, { success: false, error: 'Missing required parameters: bookingId, safariData (array)' });
    }
    try {
        const data = await reservationService.createSafariBookings(payload.bookingId, payload.safariData);
        return jsonResponse(200, { success: true, data, message: 'Safari bookings created successfully' });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}

// POST /_functions/calculateBookingCost
export async function post_calculateBookingCost(request) {
    const payload = await parseJsonRequest(request);
    if (!payload || !payload.cottageId || !payload.packageId || !payload.checkInDate || !payload.checkOutDate) {
        return jsonResponse(400, { success: false, error: 'Missing required parameters' });
    }
    try {
        const cottage = await wixData.get(COLLECTIONS.COTTAGES, payload.cottageId);
        const packageData = await wixData.get(COLLECTIONS.PACKAGES, payload.packageId);
        if (!cottage || !packageData) {
            return jsonResponse(404, { success: false, error: 'Cottage or package not found' });
        }
        const nights = reservationService.calculateNights(new Date(payload.checkInDate), new Date(payload.checkOutDate));
        const roomCost = cottage.basePricePerNight * nights;
        const packageCost = packageData.price;
        const totalCost = roomCost + packageCost;
        return jsonResponse(200, { success: true, data: { roomCost, packageCost, totalCost, nights, costPerNight: cottage.basePricePerNight } });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message });
    }
}


