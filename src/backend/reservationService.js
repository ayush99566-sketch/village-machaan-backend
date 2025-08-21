// Reservation Service - Core backend logic for the reservation system
import wixData from 'wix-data';
import { COLLECTIONS, BOOKING_STATUS, SAFARI_STATUS } from 'backend/collections';

export class ReservationService {
    constructor() {
        this.collections = COLLECTIONS;
    }

    // ===== AVAILABILITY CHECKING =====
    
    /**
     * Check if a cottage is available for the selected dates
     * @param {string} cottageId - The cottage ID to check
     * @param {Date} checkInDate - Check-in date
     * @param {Date} checkOutDate - Check-out date
     * @returns {Promise<Object>} Availability status and details
     */
    async checkAvailability(cottageId, checkInDate, checkOutDate) {
        try {
            // Convert dates to start of day for accurate comparison
            const startDate = new Date(checkInDate);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(checkOutDate);
            endDate.setHours(0, 0, 0, 0);

            // Check if any dates in the range are already booked
            const availabilityQuery = wixData.query(COLLECTIONS.AVAILABILITY)
                .eq('cottageId', cottageId)
                .gte('date', startDate)
                .lt('date', endDate)
                .eq('isAvailable', false);

            const conflictingBookings = await availabilityQuery.find();

            if (conflictingBookings.items.length > 0) {
                return {
                    isAvailable: false,
                    conflictingDates: conflictingBookings.items.map(item => item.date),
                    message: 'Selected dates are not available for this cottage.'
                };
            }

            // Check if cottage exists and is active
            const cottage = await wixData.get(COLLECTIONS.COTTAGES, cottageId);
            if (!cottage || !cottage.isActive) {
                return {
                    isAvailable: false,
                    message: 'Cottage not found or inactive.'
                };
            }

            return {
                isAvailable: true,
                cottage: cottage,
                message: 'Cottage is available for selected dates.'
            };

        } catch (error) {
            console.error('Error checking availability:', error);
            throw new Error('Failed to check availability');
        }
    }

    // ===== PACKAGE MANAGEMENT =====
    
    /**
     * Get all available packages
     * @returns {Promise<Array>} List of active packages
     */
    async getAvailablePackages() {
        try {
            const packages = await wixData.query(COLLECTIONS.PACKAGES)
                .eq('isActive', true)
                .find();
            
            return packages.items;
        } catch (error) {
            console.error('Error fetching packages:', error);
            throw new Error('Failed to fetch packages');
        }
    }

    /**
     * Get package by ID
     * @param {string} packageId - Package ID
     * @returns {Promise<Object>} Package details
     */
    async getPackageById(packageId) {
        try {
            const packageData = await wixData.get(COLLECTIONS.PACKAGES, packageId);
            return packageData;
        } catch (error) {
            console.error('Error fetching package:', error);
            throw new Error('Package not found');
        }
    }

    // ===== BOOKING MANAGEMENT =====
    
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking information
     * @returns {Promise<Object>} Created booking
     */
    async createBooking(bookingData) {
        try {
            // Validate guest count
            const cottage = await wixData.get(COLLECTIONS.COTTAGES, bookingData.cottageId);
            if (bookingData.adults > cottage.maxAdults) {
                throw new Error(`Maximum ${cottage.maxAdults} adults allowed per cottage`);
            }

            // Calculate total cost
            const packageData = await this.getPackageById(bookingData.packageId);
            const nights = this.calculateNights(bookingData.checkInDate, bookingData.checkOutDate);
            const roomCost = cottage.basePricePerNight * nights;
            const packageCost = packageData.price;
            const totalCost = roomCost + packageCost;

            // Create booking object
            const booking = {
                ...bookingData,
                totalCost: totalCost,
                status: BOOKING_STATUS.PENDING,
                paymentStatus: 'Pending',
                createdDate: new Date(),
                updatedDate: new Date()
            };

            // Insert booking
            const createdBooking = await wixData.insert(COLLECTIONS.BOOKINGS, booking);

            // Update availability for all dates in the range
            await this.updateAvailability(bookingData.cottageId, bookingData.checkInDate, 
                                       bookingData.checkOutDate, createdBooking._id, false);

            return createdBooking;

        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    /**
     * Update booking status
     * @param {string} bookingId - Booking ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated booking
     */
    async updateBookingStatus(bookingId, status) {
        try {
            const updateData = {
                status: status,
                updatedDate: new Date()
            };

            const updatedBooking = await wixData.update(COLLECTIONS.BOOKINGS, 
                                                      { _id: bookingId, ...updateData });
            
            return updatedBooking;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw new Error('Failed to update booking status');
        }
    }

    // ===== SAFARI BOOKING MANAGEMENT =====
    
    /**
     * Create safari bookings for a reservation
     * @param {string} bookingId - Associated booking ID
     * @param {Array} safariData - Array of safari booking details
     * @returns {Promise<Array>} Created safari bookings
     */
    async createSafariBookings(bookingId, safariData) {
        try {
            const safariBookings = safariData.map(safari => ({
                bookingId: bookingId,
                safariDate: new Date(safari.date),
                safariTime: safari.time,
                status: SAFARI_STATUS.PENDING,
                safariType: safari.type || 'Standard',
                createdDate: new Date(),
                updatedDate: new Date()
            }));

            const createdSafaris = await wixData.bulkInsert(COLLECTIONS.SAFARI_BOOKINGS, safariBookings);
            return createdSafaris;
        } catch (error) {
            console.error('Error creating safari bookings:', error);
            throw new Error('Failed to create safari bookings');
        }
    }

    /**
     * Update safari booking status
     * @param {string} safariId - Safari booking ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated safari booking
     */
    async updateSafariStatus(safariId, status) {
        try {
            const updateData = {
                status: status,
                updatedDate: new Date()
            };

            const updatedSafari = await wixData.update(COLLECTIONS.SAFARI_BOOKINGS, 
                                                     { _id: safariId, ...updateData });
            
            return updatedSafari;
        } catch (error) {
            console.error('Error updating safari status:', error);
            throw new Error('Failed to update safari status');
        }
    }

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Calculate number of nights between two dates
     * @param {Date} checkIn - Check-in date
     * @param {Date} checkOut - Check-out date
     * @returns {number} Number of nights
     */
    calculateNights(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return nights;
    }

    /**
     * Update availability for a date range
     * @param {string} cottageId - Cottage ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {string} bookingId - Associated booking ID
     * @param {boolean} isAvailable - Availability status
     */
    async updateAvailability(cottageId, startDate, endDate, bookingId, isAvailable) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Create availability records for each date in the range
            const availabilityRecords = [];
            for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
                availabilityRecords.push({
                    cottageId: cottageId,
                    date: new Date(date),
                    isAvailable: isAvailable,
                    bookingId: isAvailable ? null : bookingId,
                    createdDate: new Date(),
                    updatedDate: new Date()
                });
            }

            // Bulk insert availability records
            await wixData.bulkInsert(COLLECTIONS.AVAILABILITY, availabilityRecords);

        } catch (error) {
            console.error('Error updating availability:', error);
            throw new Error('Failed to update availability');
        }
    }

    /**
     * Get booking by ID with all related data
     * @param {string} bookingId - Booking ID
     * @returns {Promise<Object>} Complete booking information
     */
    async getBookingDetails(bookingId) {
        try {
            const booking = await wixData.get(COLLECTIONS.BOOKINGS, bookingId);
            
            // Get related data
            const cottage = await wixData.get(COLLECTIONS.COTTAGES, booking.cottageId);
            const packageData = await wixData.get(COLLECTIONS.PACKAGES, booking.packageId);
            
            // Get safari bookings if they exist
            const safariBookings = await wixData.query(COLLECTIONS.SAFARI_BOOKINGS)
                .eq('bookingId', bookingId)
                .find();

            return {
                ...booking,
                cottage: cottage,
                package: packageData,
                safariBookings: safariBookings.items
            };

        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw new Error('Failed to fetch booking details');
        }
    }
}

// Export singleton instance
export const reservationService = new ReservationService();
export default reservationService;
