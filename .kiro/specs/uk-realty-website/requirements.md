# Requirements Document

## Introduction

UK Realty is a modern real estate website based in Bangalore, India. The platform enables prospective buyers, renters, and investors to browse property listings, filter results by various criteria, view properties on an interactive map, and contact the agency. The site prioritizes a clean, sleek UI that builds trust and drives lead generation.

## Glossary

- **Website**: The UK Realty web application accessible via browser
- **User**: Any visitor browsing the website
- **Listing**: A single property entry containing details, images, price, and location
- **Filter**: A UI control that narrows down displayed listings based on selected criteria
- **Map_View**: An interactive map component showing property pin locations
- **Contact_Form**: A form allowing users to submit enquiries to the agency
- **Agent**: A UK Realty staff member who manages listings and responds to enquiries
- **Builder**: A property developer or construction company (e.g., Prestige, Sobha) associated with one or more listings
- **Builder_Section**: The homepage UI section displaying a curated list of builders for browsing
- **User_Account**: A registered account associated with a unique email address, storing the user's name, hashed password, phone number, and verification status
- **Authenticated_User**: A user who has successfully logged in with valid credentials
- **Guest_User**: A visitor browsing the website without a logged-in session
- **Auth_Service**: The system component responsible for registration, login, session management, and credential validation
- **User_Store**: The structured persistent storage (database) holding all User_Account records
- **Phone_Discount**: A 1% reduction applied to a property's listed price, available exclusively to Authenticated_Users with a verified phone number
- **Verified_Phone**: A phone number that has been confirmed as belonging to the User_Account holder via OTP verification
- **OTP**: A one-time passcode, a short-lived numeric code sent via SMS to a phone number for the purpose of verifying ownership
- **OTP_Service**: The system component responsible for generating, sending, and validating OTPs
- **Password_Reset_Token**: A cryptographically random, single-use token embedded in a password reset link, valid for a limited time window
- **Password_Reset_Service**: The system component responsible for issuing and validating Password_Reset_Tokens and updating credentials
- **Hamburger_Menu**: The mobile navigation control consisting of a three-line icon that toggles a mobile nav drawer
- **Saved_Property**: A Listing that a user has bookmarked for later viewing, associated with either a User_Account (for Authenticated_Users) or a Save_Session (for Guest_Users)
- **Saved_Properties_Page**: A dedicated page accessible from the navigation or user profile that displays all of a user's Saved_Properties in listing card format
- **Save_Session**: A temporary, browser-session-scoped store that holds Saved_Properties for Guest_Users, cleared when the session ends unless the user logs in and the saves are persisted to their User_Account
- **Floor_Plan**: One or more images depicting the architectural layout or blueprint of a property, uploaded per Listing and displayed in a dedicated section on the Property_Detail_Page
- **WhatsApp_CTA**: A call-to-action button that opens a WhatsApp chat session with the agent's phone number pre-filled with a message referencing the specific property
- **Limited_Offer**: A boolean flag on a Listing indicating that the property has a limited-time promotion or offer, accompanied by an optional offer expiry date set by an Agent
- **Underrated**: A boolean flag on a Listing set by an Agent or Admin indicating that the property is considered a good-value pick — typically a listing that has been available for a notable period with relatively low views or saves
- **Sort_Control**: A UI dropdown or segmented control on the listings page that allows users to order the displayed listings by a selected sort option
- **Sort_State**: The currently active sort option, serialised as a URL query parameter (e.g. `?sort=price_asc`) so that the sort selection persists across navigation
- **Comparison_Bar**: A sticky UI bar fixed to the bottom of the viewport that appears when one or more properties have been selected for comparison, showing property thumbnails and a "Compare" button
- **Comparison_Page**: A page or modal that displays two or three selected properties side by side in a structured table of attributes for direct comparison
- **Comparison_Selection**: The set of listings currently selected by the user for comparison, stored in session storage and capped at three properties
- **POI**: Point of Interest — a nearby location of relevance to a property, such as a school, hospital, metro station, supermarket, or restaurant, sourced from an external places API
- **Neighbourhood_Section**: The section on a Property_Detail_Page that displays POIs near the property, shown only when the listing has valid latitude and longitude coordinates
- **Recently_Viewed**: The ordered list of the last properties a user has viewed in the current browser session, stored in localStorage for Guest_Users and persisted to the User_Account for Authenticated_Users
- **Recently_Viewed_Section**: A UI section on the homepage and listings page that displays the user's Recently_Viewed properties as listing cards
- **EMI_Calculator**: A widget on the Property_Detail_Page that computes an estimated monthly loan repayment amount based on user-supplied inputs using the standard reducing balance formula
- **EMI**: Equated Monthly Instalment — the fixed monthly payment amount a borrower pays to repay a loan over a specified tenure, calculated using the reducing balance formula
- **Possession_Date**: The expected date by which an under-construction property will be ready for handover to the buyer, stored as a month and year value on a Listing
- **Year_Built**: The calendar year in which a ready-to-move property was constructed, stored as an optional field on a Listing
- **Construction_Status**: A derived attribute of a Listing indicating whether the property is "Ready to Move" or "Under Construction", determined by the presence of Year_Built or Possession_Date respectively
- **Share_Panel**: A UI overlay on the Property_Detail_Page that presents options for sharing the property URL via clipboard copy, WhatsApp, or email

## Requirements

### Requirement 1: Property Listings Display

**User Story:** As a user, I want to browse available properties, so that I can find homes or investments that match my needs.

#### Acceptance Criteria

1. THE Website SHALL display a paginated list of property listings on the listings page
2. WHEN a listing is displayed, THE Website SHALL show the property image, title, price, location, number of bedrooms, number of bathrooms, and property type
3. WHEN a user clicks on a listing card, THE Website SHALL navigate to a dedicated property detail page
4. THE Property_Detail_Page SHALL display a full image gallery, complete description, price, address, amenities, and agent contact details
5. WHEN no listings match the current filters, THE Website SHALL display a "No properties found" message with a prompt to clear filters

### Requirement 2: Property Filters

**User Story:** As a user, I want to filter properties by various criteria, so that I can quickly narrow down listings relevant to my requirements.

#### Acceptance Criteria

1. THE Website SHALL provide filter controls for property type (apartment, villa, plot, commercial), a minimum price input and a maximum price input (two separate numeric inputs, not a slider), number of bedrooms, number of bathrooms, location/area, and builder/developer
2. WHEN a user applies one or more filters, THE Website SHALL update the listings display to show only matching properties within 500ms
3. WHEN a user clears all filters, THE Website SHALL restore the full unfiltered listings list
4. WHILE filters are active, THE Website SHALL display a visible indicator showing which filters are currently applied
5. THE Website SHALL persist applied filters when a user navigates between the listings page and a property detail page using the browser back button

### Requirement 3: Map Integration

**User Story:** As a user, I want to view properties on an interactive map, so that I can understand the location and proximity to landmarks.

#### Acceptance Criteria

1. THE Website SHALL provide a map view toggle on the listings page that switches between grid/list view and map view
2. WHEN map view is active, THE Map_View SHALL render an interactive map with pin markers for each visible listing
3. WHEN a user clicks a map pin, THE Map_View SHALL display a popup card showing the property image, title, price, and a link to the detail page
4. THE Map_View SHALL support zoom, pan, and standard map navigation gestures
5. WHEN filters are applied, THE Map_View SHALL update pin markers to reflect only the filtered listings
6. THE Property_Detail_Page SHALL embed a map showing the exact or approximate location of that property

### Requirement 4: Contact Information and Enquiry

**User Story:** As a user, I want to contact UK Realty easily, so that I can enquire about properties or schedule a visit.

#### Acceptance Criteria

1. THE Website SHALL display a dedicated Contact page with the agency's address in Bangalore, phone number, email address, and business hours
2. THE Contact_Form SHALL include fields for the user's name, email address, phone number, subject, and message
3. WHEN a user submits the Contact_Form with all required fields filled, THE Website SHALL send the enquiry and display a confirmation message to the user
4. IF a user submits the Contact_Form with one or more required fields empty, THEN THE Website SHALL highlight the missing fields and display inline validation messages without submitting the form
5. IF a user submits the Contact_Form with an invalid email format, THEN THE Website SHALL display an inline error on the email field without submitting the form
6. THE Property_Detail_Page SHALL include a property-specific enquiry form pre-filled with the listing title so the agent receives context
7. THE Property_Detail_Page SHALL display a WhatsApp_CTA button and a "Call Now" button, each showing the agent's contact details for that listing
8. WHEN a user clicks the WhatsApp_CTA button, THE Website SHALL open a wa.me link with the agent's WhatsApp number and a pre-filled message referencing the property title and URL
9. WHEN a user clicks the "Call Now" button, THE Website SHALL trigger a tel: link to the agent's phone number
10. THE Contact page SHALL display a WhatsApp_CTA button and a "Call Now" button linking to the agency's primary WhatsApp number and phone number respectively
11. WHILE the viewport width is below 768px and a user is viewing the Property_Detail_Page, THE Website SHALL render the WhatsApp_CTA button and the "Call Now" button as a sticky bar fixed to the bottom of the viewport

### Requirement 5: Modern and Clean UI Design

**User Story:** As a user, I want a visually appealing and intuitive interface, so that I can navigate the site comfortably and trust the brand.

#### Acceptance Criteria

1. THE Website SHALL use a consistent design system with a monochrome color palette consisting of black, shades of grey, and white as the primary colors, with at most one subtle accent color (such as a dark charcoal or off-white) reserved for interactive elements such as buttons and links, applied alongside a defined typography scale and spacing system across all pages
2. THE Website SHALL NOT use bright, saturated, or multi-color palettes — all UI elements SHALL conform to the monochrome design system
3. THE Website SHALL be fully responsive and render correctly on viewport widths from 320px to 2560px
4. WHEN a page is loading, THE Website SHALL display skeleton loading placeholders in place of listing cards to prevent layout shift
5. THE Website SHALL achieve a Lighthouse performance score of 80 or above on desktop
6. THE Website SHALL include a navigation header with the UK Realty logo, primary navigation links, and a prominent "Contact Us" call-to-action button
7. THE Website SHALL include a footer with agency contact details, quick links, and social media links
8. WHILE the viewport width is below 768px, THE Website SHALL collapse the navigation header and display a Hamburger_Menu icon in place of the full navigation links; WHILE the viewport width is 768px or above, THE Website SHALL display the full navigation links and SHALL NOT render the Hamburger_Menu icon
9. WHEN a user taps the Hamburger_Menu icon, THE Website SHALL display a slide-in or dropdown mobile menu containing all primary navigation links
10. WHEN a user taps a link in the mobile menu, THE Website SHALL close the mobile menu and navigate to the selected page
11. WHEN a user taps outside the open mobile menu, THE Website SHALL close the mobile menu
12. WHILE the viewport width is below 768px, THE Website SHALL render all interactive touch targets including buttons, links, and form inputs at a minimum size of 44x44 CSS pixels
13. WHILE the viewport width is below 768px, THE Website SHALL present the listings page filter panel as a bottom sheet or modal drawer accessible via a dedicated filter button

### Requirement 6: Homepage and Hero Section

**User Story:** As a user, I want an engaging homepage, so that I can immediately understand what UK Realty offers and start searching.

#### Acceptance Criteria

1. THE Homepage SHALL display a full-width hero section with a headline, subheadline, and an inline property search bar
2. WHEN a user submits a search query from the hero search bar, THE Website SHALL navigate to the listings page with the search term applied as a filter
3. THE Homepage SHALL display a curated section of featured listings
4. THE Homepage SHALL display a section highlighting key services or value propositions offered by UK Realty
5. THE Homepage SHALL display a testimonials or social proof section
6. THE Homepage SHALL display a Builder_Section showing a curated list of builders with their logo or name
7. WHEN a user clicks a builder in the Builder_Section, THE Website SHALL navigate to the listings page with that builder pre-selected as the builder filter

### Requirement 7: Search Functionality

**User Story:** As a user, I want to search for properties by keyword or location, so that I can find relevant listings quickly.

#### Acceptance Criteria

1. THE Website SHALL provide a search input accessible from the homepage hero and the listings page header
2. WHEN a user types in the search input, THE Website SHALL display autocomplete suggestions for matching locations or property names after 3 or more characters are entered
3. WHEN a user selects a search suggestion or submits a search, THE Website SHALL filter listings to show results matching the search term against property title, description, and location fields
4. IF no search results are found, THEN THE Website SHALL display a "No results found" message and suggest clearing the search term

### Requirement 8: Browse by Builder

**User Story:** As a user, I want to browse properties by builder or developer, so that I can find all listings from a specific developer I trust or am interested in.

#### Acceptance Criteria

1. THE Website SHALL maintain a list of builders, each with a name and an optional logo image
2. THE Builder_Section SHALL display at least four builders on the homepage with their logo or name
3. WHEN a user clicks a builder in the Builder_Section, THE Website SHALL navigate to the listings page with the builder filter pre-set to the selected builder
4. WHEN the builder filter is applied on the listings page, THE Website SHALL display only listings associated with that builder across all property types (rentals, flats, houses, commercial)
5. WHEN a user arrives on the listings page with a builder filter pre-set via URL parameter, THE Website SHALL apply that builder filter automatically and display a visible filter indicator showing the active builder
6. IF a selected builder has no associated listings, THEN THE Website SHALL display a "No properties found for this builder" message with a prompt to clear the builder filter

### Requirement 9: User Registration and Login

**User Story:** As a visitor, I want to create an account and log in, so that I can access personalised features and manage my interactions with UK Realty.

#### Acceptance Criteria

1. THE Website SHALL provide a dedicated authentication page containing both a registration form and a login form
2. THE Registration_Form SHALL include fields for full name, email address, password, password confirmation, and an optional phone number
3. WHEN a user submits the Registration_Form with all required fields valid, THE Auth_Service SHALL create a new User_Account, store the credentials securely in the User_Store, and log the user in automatically
4. THE Auth_Service SHALL store passwords as salted cryptographic hashes and SHALL NOT store plaintext passwords in the User_Store
5. IF a user submits the Registration_Form with an email address already associated with an existing User_Account, THEN THE Auth_Service SHALL display an inline error stating the email is already registered without creating a duplicate account
6. IF a user submits the Registration_Form with a password shorter than 8 characters, THEN THE Auth_Service SHALL display an inline validation error on the password field without creating the account
7. IF a user submits the Registration_Form with mismatched password and password confirmation values, THEN THE Auth_Service SHALL display an inline validation error without creating the account
8. WHEN a user submits the login form with a valid email and matching password, THE Auth_Service SHALL authenticate the user, create a session, and redirect the user to the page they were previously viewing or the homepage
9. IF a user submits the login form with an email address not found in the User_Store, THEN THE Auth_Service SHALL display a generic invalid credentials error without revealing whether the email exists
10. IF a user submits the login form with a correct email but incorrect password, THEN THE Auth_Service SHALL display a generic invalid credentials error
11. WHEN an Authenticated_User clicks the logout control, THE Auth_Service SHALL invalidate the current session and redirect the user to the homepage
12. WHILE a user is authenticated, THE Website SHALL display the user's name and a logout control in the navigation header in place of the login link

### Requirement 10: Phone Number Discount Incentive with OTP Verification

**User Story:** As a registered user, I want to verify my phone number via a one-time passcode so that I can unlock a 1% discount on property prices.

#### Acceptance Criteria

1. WHEN an Authenticated_User views their account profile, THE Website SHALL display a phone number field and a prompt explaining that verifying a phone number via OTP unlocks a 1% discount on all listed property prices
2. IF an Authenticated_User provides a phone number that does not match a valid international phone number format, THEN THE Auth_Service SHALL display an inline validation error without sending an OTP
3. WHEN an Authenticated_User submits a valid phone number, THE OTP_Service SHALL send a numeric OTP via SMS to that phone number and THE Website SHALL display an OTP entry field prompting the user to enter the code
4. WHEN an Authenticated_User submits the correct OTP within 10 minutes of it being issued, THE Auth_Service SHALL mark the phone number as Verified_Phone in the User_Store and unlock the Phone_Discount for that account
5. IF an Authenticated_User submits an incorrect OTP, THEN THE OTP_Service SHALL display an inline error stating the code is invalid without marking the phone as verified
6. IF an Authenticated_User submits an OTP more than 10 minutes after it was issued, THEN THE OTP_Service SHALL display an inline error stating the code has expired and SHALL prompt the user to request a new OTP
7. WHEN an Authenticated_User requests a new OTP, THE OTP_Service SHALL invalidate any previously issued OTP for that phone number before sending a new one
8. WHILE an Authenticated_User with a Verified_Phone views a property listing or Property_Detail_Page, THE Website SHALL display the Phone_Discount price alongside the original listed price, clearly labelled as a member discount
9. WHEN the Phone_Discount is displayed, THE Website SHALL calculate it as the listed price reduced by exactly 1% and round the result to the nearest whole currency unit
10. WHILE a Guest_User or an Authenticated_User without a Verified_Phone views a property listing, THE Website SHALL display the original listed price without any discount and SHALL display a prompt indicating that registering and verifying a phone number unlocks a member discount
11. THE Website SHALL display the Phone_Discount consistently on both the listings page cards and the Property_Detail_Page for eligible Authenticated_Users

### Requirement 11: Password Reset

**User Story:** As a registered user, I want to reset my password via email so that I can regain access to my account if I forget my credentials.

#### Acceptance Criteria

1. THE Website SHALL display a "Forgot Password?" link on the login form that navigates to a password reset request page
2. THE Password_Reset_Request_Page SHALL include a field for the user's registered email address and a submit button
3. WHEN a user submits a valid email address on the Password_Reset_Request_Page, THE Password_Reset_Service SHALL generate a cryptographically random Password_Reset_Token, store it against the User_Account with a 1-hour expiry, and send a reset link containing the token to the provided email address
4. WHEN a user submits an email address not associated with any User_Account on the Password_Reset_Request_Page, THE Website SHALL display the same confirmation message as a successful submission without revealing whether the email exists in the User_Store
5. WHEN a user follows a valid, unexpired reset link, THE Website SHALL display a password reset form with fields for a new password and password confirmation
6. WHEN a user submits the password reset form with a valid new password and matching confirmation, THE Password_Reset_Service SHALL update the User_Account with the new hashed password, invalidate the Password_Reset_Token, and redirect the user to the login page with a success message
7. IF a user submits the password reset form with a new password shorter than 8 characters, THEN THE Password_Reset_Service SHALL display an inline validation error without updating the password
8. IF a user submits the password reset form with mismatched password and confirmation values, THEN THE Password_Reset_Service SHALL display an inline validation error without updating the password
9. IF a user follows a reset link containing an expired or already-used Password_Reset_Token, THEN THE Website SHALL display an error message stating the link is invalid or expired and SHALL provide a link to request a new reset email
10. THE Password_Reset_Service SHALL store Password_Reset_Tokens as cryptographic hashes in the User_Store and SHALL NOT store plaintext tokens

### Requirement 12: Save Property

**User Story:** As a user, I want to save property listings to a personal collection, so that I can revisit and compare properties I am interested in without having to search again.

#### Acceptance Criteria

1. THE Website SHALL display a save icon on every listing card and on every Property_Detail_Page
2. WHEN a Saved_Property is displayed, THE Website SHALL render the save icon in a filled state; WHEN a listing is not saved, THE Website SHALL render the save icon in an outline state
3. WHEN an Authenticated_User clicks the save icon on an unsaved listing, THE Website SHALL add that listing to the user's Saved_Properties and persist the record in the User_Store
4. WHEN an Authenticated_User clicks the save icon on an already-saved listing, THE Website SHALL remove that listing from the user's Saved_Properties and update the User_Store accordingly
5. WHEN a Guest_User clicks the save icon on a listing, THE Website SHALL add that listing to the Save_Session and display a prompt informing the user that logging in will permanently save their selections to their account
6. WHEN a Guest_User logs in after saving one or more listings to a Save_Session, THE Auth_Service SHALL merge the Save_Session listings into the user's Saved_Properties in the User_Store and clear the Save_Session
7. THE Website SHALL provide a Saved_Properties_Page accessible from the navigation header and the user profile menu
8. WHEN an Authenticated_User views the Saved_Properties_Page, THE Website SHALL display all of their Saved_Properties using the same listing card format showing property image, title, price, location, number of bedrooms, number of bathrooms, and property type
9. WHEN a Guest_User views the Saved_Properties_Page, THE Website SHALL display the listings stored in the Save_Session using the same listing card format and SHALL display a prompt to log in to persist the saves permanently
10. WHEN a Saved_Property is no longer available or has been removed from the platform, THE Website SHALL display a "This property is no longer available" indicator on that saved listing card in place of the normal card content
11. IF an Authenticated_User has no Saved_Properties, THEN THE Saved_Properties_Page SHALL display an empty state message with a prompt to browse listings

### Requirement 13: Floor Plan / Blueprint Section

**User Story:** As a user, I want to view floor plans for a property, so that I can understand the layout and spatial arrangement before scheduling a visit.

#### Acceptance Criteria

1. THE Property_Detail_Page SHALL display a "Floor Plans" section when one or more Floor_Plan images are associated with the Listing
2. WHEN a Listing has no associated Floor_Plan images, THE Property_Detail_Page SHALL either hide the "Floor Plans" section entirely or display a "Floor plan coming soon" placeholder in its place
3. WHEN the "Floor Plans" section is visible, THE Property_Detail_Page SHALL render thumbnail previews of all Floor_Plan images associated with that Listing
4. WHEN a user clicks or taps a Floor_Plan thumbnail, THE Website SHALL open the image in a full-screen lightbox or modal overlay
5. WHEN the lightbox is open and the Listing has more than one Floor_Plan image, THE Website SHALL provide navigation controls allowing the user to move to the next or previous Floor_Plan image
6. WHEN a user clicks or taps outside the lightbox overlay or activates a close control, THE Website SHALL dismiss the lightbox and return focus to the Property_Detail_Page
7. THE Admin interface SHALL allow an Agent to upload one or more Floor_Plan images per Listing and to remove or replace existing Floor_Plan images

### Requirement 14: Listings Sort

**User Story:** As a user, I want to sort property listings by different criteria, so that I can surface the most relevant properties for my needs without manually scanning the full list.

#### Acceptance Criteria

1. THE Website SHALL display a Sort_Control on the listings page offering the following options: "Newest First", "Price: Low to High", "Price: High to Low", "Limited Offers", and "Underrated"
2. WHEN no sort option has been explicitly selected, THE Website SHALL default to "Newest First", ordering listings by their createdAt timestamp descending
3. WHEN a user selects "Price: Low to High", THE Website SHALL reorder the displayed listings by listed price ascending
4. WHEN a user selects "Price: High to Low", THE Website SHALL reorder the displayed listings by listed price descending
5. WHEN a user selects "Limited Offers", THE Website SHALL display only listings where the Limited_Offer flag is true, ordered by offer expiry date ascending so that the soonest-expiring offers appear first
6. WHEN a user selects "Underrated", THE Website SHALL display only listings where the Underrated flag is true, ordered by createdAt ascending so that the longest-listed properties appear first
7. WHILE a sort option other than the default is active, THE Sort_Control SHALL render the active option in a visually distinct state to indicate the current selection
8. WHEN a user selects a sort option, THE Website SHALL serialise the selection into the URL as a query parameter (e.g. `?sort=price_asc`, `?sort=price_desc`, `?sort=limited_offers`, `?sort=underrated`) so that the Sort_State is preserved on browser back navigation
9. WHEN a user arrives on the listings page with a recognised `sort` query parameter, THE Website SHALL apply the corresponding sort option automatically and reflect it in the Sort_Control
10. IF a user arrives on the listings page with an unrecognised `sort` query parameter value, THEN THE Website SHALL fall back to the default "Newest First" sort without displaying an error
11. WHEN both filters and a sort option are active simultaneously, THE Website SHALL apply the filters first to narrow the result set and then apply the sort order to the filtered results
12. THE Admin interface SHALL allow an Agent to set or clear the Limited_Offer flag on a Listing and to optionally specify an offer expiry date
13. THE Admin interface SHALL allow an Agent or Admin to set or clear the Underrated flag on a Listing

### Requirement 15: Property Comparison

**User Story:** As a user, I want to select multiple properties and compare them side by side, so that I can evaluate key attributes across listings before making a decision.

#### Acceptance Criteria

1. THE Website SHALL display a compare icon or checkbox on every listing card that allows a user to add that listing to the Comparison_Selection
2. WHEN a user adds one or more listings to the Comparison_Selection, THE Website SHALL display the Comparison_Bar fixed to the bottom of the viewport showing a thumbnail for each selected property and a "Compare" button
3. WHEN a user clicks the "Compare" button in the Comparison_Bar, THE Website SHALL navigate to or open the Comparison_Page displaying the selected properties side by side with rows for: price, property type, bedrooms, bathrooms, area/location, builder, amenities, and possession date
4. WHEN a user clicks the remove control on a property within the Comparison_Page, THE Website SHALL remove that property from the Comparison_Selection and update the Comparison_Page accordingly
5. IF a user attempts to add a fourth property to the Comparison_Selection, THEN THE Website SHALL display an error message stating that a maximum of three properties can be compared at once without adding the property
6. THE Website SHALL persist the Comparison_Selection in session storage so that it is retained during the current browser session
7. THE Comparison_Bar SHALL remain hidden WHEN the Comparison_Selection is empty

### Requirement 16: Neighbourhood / Locality Information

**User Story:** As a user, I want to see nearby points of interest for a property, so that I can assess the convenience and liveability of the location before enquiring.

#### Acceptance Criteria

1. THE Property_Detail_Page SHALL display a Neighbourhood_Section when the associated Listing has valid latitude and longitude coordinates
2. WHEN the Neighbourhood_Section is displayed, THE Website SHALL show nearby POIs including schools, hospitals, metro or bus stations, supermarkets, and restaurants sourced from the Google Places API or OpenStreetMap
3. WHEN a POI is displayed, THE Website SHALL show the POI name, a category icon, and the approximate distance from the property
4. IF the associated Listing does not have valid latitude and longitude coordinates, THEN THE Property_Detail_Page SHALL hide the Neighbourhood_Section entirely

### Requirement 17: Recently Viewed Properties

**User Story:** As a user, I want to see properties I have recently viewed, so that I can quickly return to listings I was interested in without searching again.

#### Acceptance Criteria

1. THE Website SHALL record each Property_Detail_Page a user visits and maintain a Recently_Viewed list of the last 10 properties viewed, stored in localStorage for the current browser session
2. THE Website SHALL display a Recently_Viewed_Section on the homepage and on the listings page showing the user's recently viewed properties as listing cards
3. WHEN an Authenticated_User views a property, THE Website SHALL persist the Recently_Viewed list to their User_Account, retaining up to the last 20 properties viewed
4. WHEN a user activates the clear recently viewed control, THE Website SHALL remove all entries from the Recently_Viewed list and update the Recently_Viewed_Section accordingly
5. IF the Recently_Viewed list is empty, THEN THE Website SHALL hide the Recently_Viewed_Section

### Requirement 18: EMI Calculator

**User Story:** As a user, I want to estimate my monthly loan repayment for a property, so that I can assess affordability before contacting the agent.

#### Acceptance Criteria

1. THE Property_Detail_Page SHALL display an EMI_Calculator widget
2. THE EMI_Calculator SHALL provide editable input fields for: property price (pre-filled with the listing's listed price), down payment amount, loan tenure in years, and annual interest rate as a percentage
3. WHEN any input value in the EMI_Calculator changes, THE EMI_Calculator SHALL recalculate and display the estimated monthly EMI in INR in real time without requiring a form submission
4. THE EMI_Calculator SHALL compute the monthly EMI using the standard reducing balance formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal (property price minus down payment), r is the monthly interest rate (annual rate divided by 12 and divided by 100), and n is the total number of monthly instalments (tenure in years multiplied by 12)
5. THE EMI_Calculator SHALL display a disclaimer stating that the calculated figure is an estimate only and does not constitute a financial commitment or offer

### Requirement 19: Property Age and Possession Date

**User Story:** As a user, I want to know whether a property is ready to move in or still under construction, so that I can plan my purchase timeline accordingly.

#### Acceptance Criteria

1. THE Website SHALL support two optional fields per Listing: Year_Built for ready-to-move properties and Possession_Date for under-construction properties
2. WHEN a Listing has a Year_Built value, THE Property_Detail_Page SHALL display "Built in [year]" in the property details section
3. WHEN a Listing has a Possession_Date value, THE Property_Detail_Page SHALL display "Possession by [month year]" in the property details section
4. WHEN a Listing has a Possession_Date value, THE Website SHALL display an "Under Construction" badge on the listing card and on the Property_Detail_Page
5. WHEN a Listing has a Year_Built value, THE Website SHALL display a "Ready to Move" badge on the listing card and on the Property_Detail_Page
6. THE Website SHALL include a Construction_Status toggle in the filter panel allowing users to filter listings by "Ready to Move", "Under Construction", or both
7. WHEN the Construction_Status filter is applied, THE Website SHALL display only listings matching the selected Construction_Status

### Requirement 20: Share Property

**User Story:** As a user, I want to share a property listing with others, so that I can send relevant properties to friends, family, or colleagues through my preferred channel.

#### Acceptance Criteria

1. THE Property_Detail_Page SHALL display a Share button
2. WHEN a user clicks the Share button, THE Website SHALL open a Share_Panel presenting the following options: Copy Link, Share via WhatsApp, and Share via Email
3. WHEN a user selects Copy Link, THE Website SHALL copy the property page URL to the clipboard and display a "Copied!" confirmation toast notification
4. WHEN a user selects Share via WhatsApp, THE Website SHALL open a wa.me link with the property title and URL pre-filled in the message body
5. WHEN a user selects Share via Email, THE Website SHALL open a mailto: link with the property title in the subject line and the property title and URL in the email body
6. WHEN a user clicks outside the Share_Panel or presses the Escape key, THE Website SHALL dismiss the Share_Panel
