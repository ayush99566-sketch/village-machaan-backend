// Reservation Form Component - Multi-step booking system
// This component handles the complete reservation flow

import { $w } from '@wix/sdk';
import wixFetch from 'wix-fetch';

export class ReservationForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.bookingData = {
            cottageId: '',
            checkInDate: null,
            checkOutDate: null,
            adults: 1,
            children: 0,
            packageId: '',
            safariData: [],
            customerInfo: {}
        };
        
        this.cottages = [];
        this.packages = [];
        this.availabilityResult = null;
        this.costBreakdown = null;
        
        this.init();
    }

    async init() {
        try {
            // Load initial data
            await this.loadCottages();
            await this.loadPackages();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Show first step
            this.showStep(1);
            
        } catch (error) {
            console.error('Error initializing reservation form:', error);
            this.showError('Failed to initialize reservation form');
        }
    }

    // ===== DATA LOADING =====
    
    async loadCottages() {
        try {
            const response = await wixFetch.fetch('/_functions/getAllCottages', {
                method: 'GET'
            });
            
            const result = await response.json();
            if (result.success) {
                this.cottages = result.data;
                this.populateCottageSelection();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error loading cottages:', error);
            this.showError('Failed to load cottages');
        }
    }

    async loadPackages() {
        try {
            const response = await wixFetch.fetch('/_functions/getAvailablePackages', {
                method: 'GET'
            });
            
            const result = await response.json();
            if (result.success) {
                this.packages = result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error loading packages:', error);
            this.showError('Failed to load packages');
        }
    }

    // ===== UI SETUP =====
    
    setupEventListeners() {
        // Cottage selection
        $w('#cottageSelection').onChange(() => {
            this.bookingData.cottageId = $w('#cottageSelection').value;
            this.updateCottageInfo();
        });

        // Date inputs
        $w('#checkInDate').onChange(() => {
            this.bookingData.checkInDate = $w('#checkInDate').value;
            this.validateDates();
        });

        $w('#checkOutDate').onChange(() => {
            this.bookingData.checkOutDate = $w('#checkOutDate').value;
            this.validateDates();
        });

        // Guest count inputs
        $w('#adultsCount').onChange(() => {
            this.bookingData.adults = parseInt($w('#adultsCount').value) || 1;
            this.validateGuestCount();
        });

        $w('#childrenCount').onChange(() => {
            this.bookingData.children = parseInt($w('#childrenCount').value) || 0;
        });

        // Check availability button
        $w('#checkAvailabilityBtn').onClick(() => {
            this.checkAvailability();
        });

        // Package selection
        $w('#packageSelection').onChange(() => {
            this.bookingData.packageId = $w('#packageSelection').value;
            this.updatePackageInfo();
        });

        // Safari date/time inputs (if applicable)
        $w('#safariDate').onChange(() => {
            this.updateSafariData();
        });

        $w('#safariTime').onChange(() => {
            this.updateSafariData();
        });

        // Navigation buttons
        $w('#nextBtn').onClick(() => {
            this.nextStep();
        });

        $w('#prevBtn').onClick(() => {
            this.previousStep();
        });

        $w('#proceedToPaymentBtn').onClick(() => {
            this.proceedToPayment();
        });
    }

    // ===== STEP MANAGEMENT =====
    
    showStep(stepNumber) {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            $w(`#step${i}`).hide();
        }
        
        // Show current step
        $w(`#step${stepNumber}`).show();
        
        // Update progress indicator
        this.updateProgressIndicator(stepNumber);
        
        // Update navigation buttons
        this.updateNavigationButtons(stepNumber);
        
        this.currentStep = stepNumber;
    }

    updateProgressIndicator(stepNumber) {
        const progressBar = $w('#progressBar');
        const progressPercentage = (stepNumber / this.totalSteps) * 100;
        progressBar.width = `${progressPercentage}%`;
        
        // Update step indicators
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepIndicator = $w(`#stepIndicator${i}`);
            if (i <= stepNumber) {
                stepIndicator.style.backgroundColor = '#4CAF50'; // Active color
            } else {
                stepIndicator.style.backgroundColor = '#E0E0E0'; // Inactive color
            }
        }
    }

    updateNavigationButtons(stepNumber) {
        const prevBtn = $w('#prevBtn');
        const nextBtn = $w('#nextBtn');
        
        prevBtn.show();
        nextBtn.show();
        
        if (stepNumber === 1) {
            prevBtn.hide();
        }
        
        if (stepNumber === this.totalSteps) {
            nextBtn.hide();
        }
    }

    // ===== STEP 1: COTTAGE & DATE SELECTION =====
    
    populateCottageSelection() {
        const cottageSelect = $w('#cottageSelection');
        cottageSelect.options = this.cottages.map(cottage => ({
            label: cottage.name,
            value: cottage._id
        }));
    }

    updateCottageInfo() {
        if (!this.bookingData.cottageId) return;
        
        const cottage = this.cottages.find(c => c._id === this.bookingData.cottageId);
        if (cottage) {
            $w('#cottageDescription').text = cottage.description;
            $w('#cottageMaxAdults').text = `Maximum ${cottage.maxAdults} adults`;
            $w('#cottageMaxChildren').text = `Maximum ${cottage.maxChildren} children`;
            $w('#cottagePricePerNight').text = `$${cottage.basePricePerNight} per night`;
        }
    }

    validateDates() {
        const checkIn = new Date(this.bookingData.checkInDate);
        const checkOut = new Date(this.bookingData.checkOutDate);
        const today = new Date();
        
        // Reset date validation messages
        $w('#dateValidationMessage').hide();
        
        let isValid = true;
        let message = '';
        
        // Check if check-in is in the future
        if (checkIn <= today) {
            message = 'Check-in date must be in the future';
            isValid = false;
        }
        
        // Check if check-out is after check-in
        if (checkOut <= checkIn) {
            message = 'Check-out date must be after check-in date';
            isValid = false;
        }
        
        // Check minimum stay (e.g., 1 night)
        const nights = this.calculateNights(checkIn, checkOut);
        if (nights < 1) {
            message = 'Minimum stay is 1 night';
            isValid = false;
        }
        
        if (!isValid) {
            $w('#dateValidationMessage').text = message;
            $w('#dateValidationMessage').show();
            $w('#checkAvailabilityBtn').disable();
        } else {
            $w('#checkAvailabilityBtn').enable();
        }
        
        return isValid;
    }

    validateGuestCount() {
        if (!this.bookingData.cottageId) return true;
        
        const cottage = this.cottages.find(c => c._id === this.bookingData.cottageId);
        if (!cottage) return true;
        
        const isValid = this.bookingData.adults <= cottage.maxAdults;
        
        if (!isValid) {
            $w('#guestValidationMessage').text = 
                `Maximum ${cottage.maxAdults} adults allowed per cottage. Additional adults require a new room.`;
            $w('#guestValidationMessage').show();
        } else {
            $w('#guestValidationMessage').hide();
        }
        
        return isValid;
    }

    async checkAvailability() {
        if (!this.validateDates() || !this.validateGuestCount()) {
            return;
        }
        
        try {
            $w('#checkAvailabilityBtn').label = 'Checking...';
            $w('#checkAvailabilityBtn').disable();
            
            const response = await wixFetch.fetch('/_functions/checkCottageAvailability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cottageId: this.bookingData.cottageId,
                    checkInDate: this.bookingData.checkInDate,
                    checkOutDate: this.bookingData.checkOutDate
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data.isAvailable) {
                this.availabilityResult = result.data;
                this.showAvailabilitySuccess();
                $w('#nextBtn').enable();
            } else {
                this.showAvailabilityError(result.error || 'Cottage not available for selected dates');
                $w('#nextBtn').disable();
            }
            
        } catch (error) {
            console.error('Error checking availability:', error);
            this.showAvailabilityError('Failed to check availability');
            $w('#nextBtn').disable();
        } finally {
            $w('#checkAvailabilityBtn').label = 'Check Availability';
            $w('#checkAvailabilityBtn').enable();
        }
    }

    showAvailabilitySuccess() {
        $w('#availabilityMessage').text = 'Great! Your selected cottage is available for the chosen dates.';
        $w('#availabilityMessage').style.color = '#4CAF50';
        $w('#availabilityMessage').show();
    }

    showAvailabilityError(message) {
        $w('#availabilityMessage').text = message;
        $w('#availabilityMessage').style.color = '#F44336';
        $w('#availabilityMessage').show();
    }

    // ===== STEP 2: PACKAGE SELECTION =====
    
    populatePackageSelection() {
        const packageSelect = $w('#packageSelection');
        packageSelect.options = this.packages.map(pkg => ({
            label: `${pkg.name} - $${pkg.price}`,
            value: pkg._id
        }));
    }

    updatePackageInfo() {
        if (!this.bookingData.packageId) return;
        
        const packageData = this.packages.find(p => p._id === this.bookingData.packageId);
        if (packageData) {
            $w('#packageDescription').text = packageData.description;
            $w('#packagePrice').text = `$${packageData.price}`;
            $w('#packageFeatures').text = packageData.features.join(', ');
            
            // Show/hide safari section based on package
            if (packageData.includesSafari) {
                $w('#safariSection').show();
                this.setupSafariSelection(packageData.safariCount);
            } else {
                $w('#safariSection').hide();
            }
        }
    }

    // ===== STEP 3: SAFARI DETAILS =====
    
    setupSafariSelection(safariCount) {
        const nights = this.calculateNights(this.bookingData.checkInDate, this.bookingData.checkOutDate);
        const availableSafaris = Math.min(safariCount, nights);
        
        $w('#safariCount').text = `You can book up to ${availableSafaris} safaris during your stay.`;
        
        // Generate safari date/time options
        this.generateSafariOptions(availableSafaris);
    }

    generateSafariOptions(maxSafaris) {
        // This would generate date/time options for safari selection
        // Implementation depends on your specific safari scheduling logic
        console.log(`Generating ${maxSafaris} safari options`);
    }

    updateSafariData() {
        // Update safari booking data when user makes selections
        const safariDate = $w('#safariDate').value;
        const safariTime = $w('#safariTime').value;
        
        if (safariDate && safariTime) {
            this.bookingData.safariData.push({
                date: safariDate,
                time: safariTime,
                type: 'Standard'
            });
        }
    }

    // ===== STEP 4: SUMMARY & PAYMENT =====
    
    async generateSummary() {
        try {
            // Calculate costs
            const response = await wixFetch.fetch('/_functions/calculateBookingCost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cottageId: this.bookingData.cottageId,
                    packageId: this.bookingData.packageId,
                    checkInDate: this.bookingData.checkInDate,
                    checkOutDate: this.bookingData.checkOutDate
                })
            });
            
            const result = await response.json();
            if (result.success) {
                this.costBreakdown = result.data;
                this.displaySummary();
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            this.showError('Failed to generate booking summary');
        }
    }

    displaySummary() {
        const cottage = this.cottages.find(c => c._id === this.bookingData.cottageId);
        const packageData = this.packages.find(p => p._id === this.bookingData.packageId);
        
        // Display booking summary
        $w('#summaryCottage').text = cottage.name;
        $w('#summaryDates').text = `${this.formatDate(this.bookingData.checkInDate)} - ${this.formatDate(this.bookingData.checkOutDate)}`;
        $w('#summaryGuests').text = `${this.bookingData.adults} adults, ${this.bookingData.children} children`;
        $w('#summaryPackage').text = packageData.name;
        
        // Display cost breakdown
        $w('#summaryRoomCost').text = `$${this.costBreakdown.roomCost}`;
        $w('#summaryPackageCost').text = `$${this.costBreakdown.packageCost}`;
        $w('#summaryTotal').text = `$${this.costBreakdown.totalCost}`;
        
        // Display safari information if applicable
        if (this.bookingData.safariData.length > 0) {
            $w('#summarySafaris').text = `${this.bookingData.safariData.length} safaris included`;
            $w('#safariNote').show();
        } else {
            $w('#summarySafaris').text = 'No safaris included';
            $w('#safariNote').hide();
        }
    }

    // ===== NAVIGATION =====
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step before proceeding
            if (this.validateCurrentStep()) {
                this.showStep(this.currentStep + 1);
                
                // Load data for next step
                if (this.currentStep === 2) {
                    this.populatePackageSelection();
                } else if (this.currentStep === 4) {
                    this.generateSummary();
                }
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            default:
                return true;
        }
    }

    validateStep1() {
        if (!this.bookingData.cottageId) {
            this.showError('Please select a cottage');
            return false;
        }
        
        if (!this.bookingData.checkInDate || !this.bookingData.checkOutDate) {
            this.showError('Please select check-in and check-out dates');
            return false;
        }
        
        if (!this.availabilityResult || !this.availabilityResult.isAvailable) {
            this.showError('Please check availability before proceeding');
            return false;
        }
        
        return true;
    }

    validateStep2() {
        if (!this.bookingData.packageId) {
            this.showError('Please select a package');
            return false;
        }
        return true;
    }

    validateStep3() {
        // Safari validation is optional - only if package includes safaris
        const packageData = this.packages.find(p => p._id === this.bookingData.packageId);
        if (packageData && packageData.includesSafari) {
            // Add safari validation logic here if needed
        }
        return true;
    }

    // ===== PAYMENT PROCESSING =====
    
    async proceedToPayment() {
        try {
            // Create the booking first
            const response = await wixFetch.fetch('/_functions/createBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...this.bookingData,
                    customerInfo: this.getCustomerInfo()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Create safari bookings if applicable
                if (this.bookingData.safariData.length > 0) {
                    await this.createSafariBookings(result.data._id);
                }
                
                // Redirect to payment or show success message
                this.showPaymentSuccess(result.data);
            } else {
                this.showError(result.error || 'Failed to create booking');
            }
            
        } catch (error) {
            console.error('Error proceeding to payment:', error);
            this.showError('Failed to process payment');
        }
    }

    async createSafariBookings(bookingId) {
        try {
            const response = await wixFetch.fetch('/_functions/createSafariBookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookingId: bookingId,
                    safariData: this.bookingData.safariData
                })
            });
            
            const result = await response.json();
            if (!result.success) {
                console.error('Failed to create safari bookings:', result.error);
            }
        } catch (error) {
            console.error('Error creating safari bookings:', error);
        }
    }

    getCustomerInfo() {
        // This would collect customer information from form inputs
        // Implementation depends on your form structure
        return {
            name: $w('#customerName').value || '',
            email: $w('#customerEmail').value || '',
            phone: $w('#customerPhone').value || ''
        };
    }

    // ===== UTILITY FUNCTIONS =====
    
    calculateNights(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showError(message) {
        $w('#errorMessage').text = message;
        $w('#errorMessage').show();
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            $w('#errorMessage').hide();
        }, 5000);
    }

    showPaymentSuccess(booking) {
        // Hide the form and show success message
        $w('#reservationForm').hide();
        $w('#successMessage').show();
        
        $w('#bookingId').text = booking._id;
        $w('#successMessage').text = 'Your booking has been created successfully! You will receive a confirmation email shortly.';
    }
}

// Initialize the reservation form when the page loads
$w.onReady(function () {
    new ReservationForm();
});
