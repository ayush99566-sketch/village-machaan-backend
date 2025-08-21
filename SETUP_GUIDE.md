# 🏗️ **RESERVATION SYSTEM SETUP GUIDE**
## Complete Implementation Instructions for Wix Studio

This guide will walk you through implementing the robust reservation system step by step.

---

## 📋 **PREREQUISITES**

Before starting, ensure you have:
- ✅ Wix Studio account with Velo enabled
- ✅ Basic understanding of Wix Studio interface
- ✅ Access to create collections and web methods

---

## 🗄️ **STEP 1: CREATE DATABASE COLLECTIONS**

### 1.1 Cottages Collection
1. Go to **Content Manager** → **Collections**
2. Click **+ Add Collection**
3. Name: `Cottages`
4. Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| name | Text | Yes | Cottage name (Hornbill, Kingfisher, Glass Cottage) |
| description | Long Text | Yes | Detailed description |
| maxAdults | Number | Yes | Maximum adults (2) |
| maxChildren | Number | Yes | Maximum children allowed |
| basePricePerNight | Number | Yes | Price per night |
| images | Media | No | Array of cottage images |
| amenities | Text Array | No | List of amenities |
| isActive | Boolean | Yes | Whether cottage is available |
| createdDate | Date | Yes | Creation timestamp |
| updatedDate | Date | Yes | Last update timestamp |

### 1.2 Packages Collection
1. Create new collection named `Packages`
2. Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| name | Text | Yes | Package name (Honeymoon, Elderly, etc.) |
| description | Long Text | Yes | Package description |
| price | Number | Yes | Package price |
| includesSafari | Boolean | Yes | Whether package includes safaris |
| safariCount | Number | No | Number of safaris included |
| features | Text Array | No | List of package features |
| isActive | Boolean | Yes | Whether package is available |
| seasonalPricing | Object | No | Seasonal price variations |
| createdDate | Date | Yes | Creation timestamp |
| updatedDate | Date | Yes | Last update timestamp |

### 1.3 Bookings Collection
1. Create new collection named `Bookings`
2. Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| cottageId | Reference | Yes | Reference to Cottages collection |
| packageId | Reference | Yes | Reference to Packages collection |
| checkInDate | Date | Yes | Check-in date |
| checkOutDate | Date | Yes | Check-out date |
| adults | Number | Yes | Number of adults |
| children | Number | Yes | Number of children |
| totalCost | Number | Yes | Total booking cost |
| status | Text | Yes | Booking status (Pending, Confirmed, etc.) |
| customerInfo | Object | Yes | Customer details (name, email, phone) |
| paymentStatus | Text | Yes | Payment status |
| paymentId | Text | No | Payment gateway ID |
| specialRequests | Long Text | No | Special requests |
| createdDate | Date | Yes | Creation timestamp |
| updatedDate | Date | Yes | Last update timestamp |

### 1.4 Availability Collection
1. Create new collection named `Availability`
2. Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| cottageId | Reference | Yes | Reference to Cottages collection |
| date | Date | Yes | Specific date |
| isAvailable | Boolean | Yes | Whether date is available |
| bookingId | Reference | No | Reference to Bookings if not available |
| createdDate | Date | Yes | Creation timestamp |
| updatedDate | Date | Yes | Last update timestamp |

### 1.5 Safari Bookings Collection
1. Create new collection named `SafariBookings`
2. Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| bookingId | Reference | Yes | Reference to Bookings collection |
| safariDate | Date | Yes | Safari date |
| safariTime | Text | Yes | Safari time slot |
| status | Text | Yes | Safari status (Pending, Confirmed, etc.) |
| safariType | Text | Yes | Type of safari |
| createdDate | Date | Yes | Creation timestamp |
| updatedDate | Date | Yes | Last update timestamp |

---

### 1.6 Safari Inquiries Collection (New)
We now accept safari queries separately from room bookings. Create a new collection named `SafariInquiries` to capture inquiries only (no payment/confirmation here).

1. Create new collection named `SafariInquiries`
2. Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| customerName | Text | Yes | Full name of the inquirer |
| customerEmail | Text | Yes | Email address |
| customerPhone | Text | No | Phone number |
| preferredDate | Date | No | Preferred safari date |
| preferredTime | Text | No | Time slot (e.g., Morning, Afternoon) |
| numAdults | Number | No | Number of adults |
| numChildren | Number | No | Number of children |
| notes | Long Text | No | Additional notes or requests |
| status | Text | Yes | New, Contacted, Closed |
| source | Text | No | Website form, Phone, Email |
| createdDate | Date | Yes | Creation timestamp |
| updatedDate | Date | Yes | Last update timestamp |

Note: This collection is independent of `Bookings`. Use it to manage leads/queries for safaris that are handled separately via email/phone.

---

## 🔧 **STEP 2: SETUP BACKEND CODE**

### 2.1 Upload Backend Files
1. Go to **Developer Tools** → **Velo by Wix**
2. In the **Backend** section, create these files:
   - `collections.js` - Copy the content from our file
   - `reservationService.js` - Copy the content from our file
   - `webMethods.js` - Copy the content from our file

### 2.2 Create Web Methods
1. In **Backend** → **Web Methods**, create these functions:
   - `checkCottageAvailability`
   - `getAvailablePackages`
   - `getPackageById`
   - `createBooking`
   - `getBookingDetails`
   - `updateBookingStatus`
   - `createSafariBookings`
   - `updateSafariStatus`
   - `getAllCottages`
   - `calculateBookingCost`

2. Copy the function content from `webMethods.js` for each method

### 2.3 Set Permissions
1. Go to **Backend** → **Permissions**
2. Ensure all web methods are accessible to:
   - Site Owner: ✅
   - Site Members: ✅
   - Anonymous: ✅

---

## 🎨 **STEP 3: CREATE FRONTEND PAGE**

### 3.1 Create New Page
1. In **Pages**, click **+ Add Page**
2. Name: `Reservations` or `Book Now`
3. Choose **Blank Page** template

### 3.2 Add Page Elements
Add these elements to your page (use the IDs exactly as shown):

#### Progress Indicator Section
- **Container** (ID: `progressContainer`)
  - **Text** (ID: `stepIndicator1`) - Text: "1"
  - **Text** (ID: `stepLabel1`) - Text: "Cottage & Dates"
  - **Progress Bar** (ID: `progressBarContainer`)
    - **Progress Bar** (ID: `progressBar`)
  - **Text** (ID: `stepIndicator2`) - Text: "2"
  - **Text** (ID: `stepLabel2`) - Text: "Package"
  - **Text** (ID: `stepIndicator3`) - Text: "3"
  - **Text** (ID: `stepLabel3`) - Text: "Safari"
  - **Text** (ID: `stepIndicator4`) - Text: "4"
  - **Text** (ID: `stepLabel4`) - Text: "Summary"

#### Step 1: Cottage & Date Selection
- **Container** (ID: `step1`)
  - **Text** (ID: `step1Title`) - Text: "Choose Your Cottage & Dates"
  - **Text** (ID: `step1Subtitle`) - Text: "Select your preferred accommodation and stay dates"
  
  - **Dropdown** (ID: `cottageSelection`) - Label: "Cottage Type"
  - **Text** (ID: `cottageDescription`) - Cottage description
  - **Text** (ID: `cottageMaxAdults`) - Max adults info
  - **Text** (ID: `cottageMaxChildren`) - Max children info
  - **Text** (ID: `cottagePricePerNight`) - Price per night
  
  - **Date Picker** (ID: `checkInDate`) - Label: "Check-in Date"
  - **Date Picker** (ID: `checkOutDate`) - Label: "Check-out Date"
  - **Text** (ID: `dateValidationMessage`) - Validation message
  
  - **Number Input** (ID: `adultsCount`) - Label: "Adults", Default: 1
  - **Number Input** (ID: `childrenCount`) - Label: "Children", Default: 0
  - **Text** (ID: `guestValidationMessage`) - Guest validation message
  
  - **Button** (ID: `checkAvailabilityBtn`) - Text: "Check Availability"
  - **Text** (ID: `availabilityMessage`) - Availability status message

#### Step 2: Package Selection
- **Container** (ID: `step2`)
  - **Text** (ID: `step2Title`) - Text: "Select Your Package"
  - **Text** (ID: `step2Subtitle`) - Text: "Choose from our curated packages"
  
  - **Dropdown** (ID: `packageSelection`) - Label: "Package"
  - **Text** (ID: `packageDescription`) - Package description
  - **Text** (ID: `packagePrice`) - Package price
  - **Text** (ID: `packageFeatures`) - Package features

#### Step 3: Safari Details
- **Container** (ID: `step3`)
  - **Text** (ID: `step3Title`) - Text: "Safari Details"
  - **Text** (ID: `step3Subtitle`) - Text: "Select your safari preferences"
  
  - **Container** (ID: `safariSection`)
    - **Text** (ID: `safariTitle`) - Text: "Safari Bookings"
    - **Text** (ID: `safariCount`) - Available safaris count
    - **Date Picker** (ID: `safariDate`) - Label: "Safari Date"
    - **Dropdown** (ID: `safariTime`) - Label: "Safari Time"
    - **Text** (ID: `safariNote`) - Safari confirmation note

#### Step 4: Summary & Payment
- **Container** (ID: `step4`)
  - **Text** (ID: `step4Title`) - Text: "Booking Summary & Payment"
  - **Text** (ID: `step4Subtitle`) - Text: "Review your booking and proceed to payment"
  
  - **Container** (ID: `summaryContainer`)
    - **Text** (ID: `summaryTitle`) - Text: "Booking Summary"
    - **Text** (ID: `summaryCottage`) - Cottage name
    - **Text** (ID: `summaryDates`) - Check-in/out dates
    - **Text** (ID: `summaryGuests`) - Guest count
    - **Text** (ID: `summaryPackage`) - Package name
    - **Text** (ID: `summarySafaris`) - Safari count
    - **Text** (ID: `summaryRoomCost`) - Room cost
    - **Text** (ID: `summaryPackageCost`) - Package cost
    - **Text** (ID: `summaryTotal`) - Total cost
  
  - **Button** (ID: `proceedToPaymentBtn`) - Text: "Proceed to Payment"

#### Navigation & Messages
- **Button** (ID: `prevBtn`) - Text: "Previous", Style: Secondary
- **Button** (ID: `nextBtn`) - Text: "Next", Style: Primary
- **Text** (ID: `errorMessage`) - Error messages
- **Text** (ID: `successMessage`) - Success messages
- **Text** (ID: `bookingId`) - Booking ID display

### 3.3 Add Customer Information Fields
Add these fields to Step 4 or create a separate step:
- **Text Input** (ID: `customerName`) - Label: "Full Name"
- **Text Input** (ID: `customerEmail`) - Label: "Email Address"
- **Text Input** (ID: `customerPhone`) - Label: "Phone Number"

---

## 📱 **STEP 4: ADD FRONTEND CODE**

### 4.1 Upload Frontend Files
1. In **Frontend** → **Page Code**, upload:
   - `ReservationForm.js` - Main reservation logic
   - `reservationForm.css` - Styling

### 4.2 Link CSS
1. In **Page Settings** → **Custom Code**
2. Add: `<link rel="stylesheet" href="reservationForm.css">`

---

## 🗃️ **STEP 5: POPULATE INITIAL DATA**

### 5.1 Add Sample Cottages
In **Content Manager** → **Cottages**, add:

**Hornbill Cottage**
- Name: Hornbill
- Description: Cozy 2-bedroom cottage with mountain views
- Max Adults: 2
- Max Children: 2
- Base Price: $150
- Amenities: ["WiFi", "Kitchen", "Mountain View", "Parking"]

**Kingfisher Cottage**
- Name: Kingfisher
- Description: Luxury 1-bedroom cottage with river views
- Max Adults: 2
- Max Children: 1
- Base Price: $200
- Amenities: ["WiFi", "Kitchen", "River View", "Balcony"]

**Glass Cottage**
- Name: Glass Cottage
- Description: Modern glass-walled cottage with panoramic views
- Max Adults: 2
- Max Children: 2
- Base Price: $250
- Amenities: ["WiFi", "Kitchen", "Panoramic View", "Glass Walls"]

### 5.2 Add Sample Packages
In **Content Manager** → **Packages**, add:

**Honeymoon Package**
- Name: Honeymoon
- Description: Romantic getaway with special amenities
- Price: $100
- Includes Safari: true
- Safari Count: 2
- Features: ["Candlelit Dinner", "Spa Session", "Flowers", "Champagne"]

**Elderly Package**
- Name: Elderly
- Description: Comfort-focused package for senior guests
- Price: $75
- Includes Safari: false
- Features: ["Ground Floor Access", "Medical Assistance", "Comfortable Bedding", "Easy Access"]

**Family Fun Package**
- Name: Family Fun
- Description: Adventure package for families
- Price: $125
- Includes Safari: true
- Safari Count: 3
- Features: ["Kids Activities", "Family Safari", "Picnic Basket", "Adventure Guide"]

---

## 🧪 **STEP 6: TESTING**

### 6.1 Test Availability Checking
1. Select a cottage and dates
2. Click "Check Availability"
3. Verify success/error messages

### 6.2 Test Package Selection
1. Complete Step 1
2. Verify packages load correctly
3. Test safari inclusion logic

### 6.3 Test Safari Selection
1. Select package with safaris
2. Verify safari section appears
3. Test date/time selection

### 6.4 Test Booking Creation
1. Complete all steps
2. Verify booking creation
3. Check database records

---

## 🚀 **STEP 7: DEPLOYMENT**

### 7.1 Publish Site
1. Click **Publish** in Wix Studio
2. Test on live site

### 7.2 Monitor Performance
1. Check **Analytics** for form usage
2. Monitor **Error Logs** for issues
3. Test on different devices/browsers

---

## 🔧 **TROUBLESHOOTING**

### Common Issues:

**"Function not found" errors**
- Ensure web methods are created correctly
- Check function names match exactly
- Verify permissions are set

**Collections not loading**
- Check collection names match exactly
- Verify field names in code match collection fields
- Ensure collections have data

**Form not working**
- Check browser console for JavaScript errors
- Verify all element IDs match exactly
- Ensure CSS is properly linked

**Payment issues**
- Verify payment gateway setup
- Check booking creation in database
- Monitor error logs

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check browser console for errors
2. Verify all steps completed correctly
3. Test with sample data first
4. Check Wix Velo documentation

---

## 🎯 **NEXT STEPS**

After successful implementation:
1. **Customize styling** to match your brand
2. **Add email notifications** for bookings
3. **Integrate payment gateway** (Stripe, PayPal, etc.)
4. **Add admin dashboard** for managing bookings
5. **Implement calendar view** for availability
6. **Add customer portal** for booking management

---

**🎉 Congratulations! You now have a fully functional reservation system!**
 