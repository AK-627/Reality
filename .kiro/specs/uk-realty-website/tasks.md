# Implementation Plan: UK Realty Website

## Overview

Incremental implementation of the UK Realty Next.js 14 application. Each task builds on the previous, starting with project scaffolding and ending with all 20 features wired together. The stack is Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma + PostgreSQL, NextAuth.js, Twilio, and fast-check for property-based tests.

## Tasks

- [x] 1. Project scaffolding and design system
  - Bootstrap a Next.js 14 App Router project with TypeScript and Tailwind CSS
  - Configure `tailwind.config.ts` with a monochrome design token set: black, white, and grey shades only, with a single `accent` token (dark charcoal) for interactive elements
  - Define a typography scale (font sizes, weights, line heights) and spacing system as Tailwind theme extensions
  - Create `src/lib/types.ts` exporting all shared TypeScript interfaces: `Listing`, `Builder`, `FloorPlan`, `FilterState`, `User`, `ApiError`
  - Add `src/lib/utils.ts` with `applyPhoneDiscount(price: number): number` and `formatINR(amount: number): string` helpers
  - Set up Vitest and React Testing Library; configure `vitest.config.ts`
  - Install fast-check; create `src/lib/__tests__/utils.test.ts` as the entry point for property tests
  - _Requirements: 5.1, 5.2_

  - [ ]* 1.1 Write property test for phone discount calculation
    - **Property 27: Phone discount is calculated as price × 0.99 rounded to nearest integer**
    - **Validates: Requirements 10.9, 10.11**

- [x] 2. Database schema and Prisma setup
  - Install Prisma and `@prisma/client`; initialise with a PostgreSQL provider
  - Define the full Prisma schema: `User`, `OtpRecord`, `PasswordReset`, `Builder`, `Listing`, `FloorPlan`, `SavedListing`, `PropertyType` enum
  - Extend `Listing` with `limitedOffer Boolean @default(false)`, `offerExpiresAt DateTime?`, `underrated Boolean @default(false)`, `yearBuilt Int?`, `possessionDate String?` (month-year string)
  - Add `recentlyViewed` JSON field to `User` for persisted recently-viewed list (up to 20 IDs)
  - Create `prisma/seed.ts` with sample builders and listings covering all property types
  - Run `prisma migrate dev` and `prisma db seed`
  - _Requirements: 1.1, 8.1, 9.4, 10.4, 11.3, 12.3, 13.1, 14.1, 19.1_

- [x] 3. Layout, header, footer, and hamburger menu
  - Create `src/app/layout.tsx` as the root layout wrapping all pages with `<Header>` and `<Footer>`
  - Implement `<Header>` with UK Realty logo, desktop nav links (Home, Listings, Builders, Contact, Saved), `<AuthControls>`, and a "Contact Us" CTA button — all using the monochrome design system
  - Implement `<HamburgerMenu>` and `<MobileNavDrawer>`: the icon renders only below 768 px; the drawer slides in on tap, closes on link tap or outside tap
  - Implement `<Footer>` with agency contact details, quick links, and social media links
  - Ensure all touch targets are ≥ 44 × 44 CSS px on mobile
  - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12_

  - [ ]* 3.1 Write unit tests for HamburgerMenu open/close behaviour
    - Test: icon hidden ≥ 768 px, visible < 768 px; drawer opens on tap; closes on outside tap and link tap
    - _Requirements: 5.8, 5.9, 5.10, 5.11_

- [x] 4. Listings API and core listing card component
  - Implement `GET /api/listings` route: accepts query params `q`, `type`, `minPrice`, `maxPrice`, `beds`, `baths`, `location`, `builder`, `sort`, `constructionStatus`, `page`; applies all filters then sort; returns paginated `ListingListResponse`
  - Implement `GET /api/listings/:id` route returning full `ListingDetailResponse` with `discountedPrice` populated when the requesting user has `phoneVerified = true`
  - Create `<ListingCard>` component rendering image, title, price (+ discounted price badge if eligible), location, beds, baths, property type, construction status badge, save icon, and compare checkbox
  - Add skeleton loading placeholder variant of `<ListingCard>`
  - _Requirements: 1.1, 1.2, 5.4, 10.8, 10.11, 19.4, 19.5_

  - [ ]* 4.1 Write property test for filter correctness
    - **Property 3: All results satisfy active filters**
    - **Validates: Requirements 2.2, 3.5, 8.4**

  - [ ]* 4.2 Write property test for filter clear round-trip
    - **Property 4: Clearing all filters restores the full listing set**
    - **Validates: Requirements 2.3**

  - [ ]* 4.3 Write property test for listing card required fields
    - **Property 1: Listing cards contain all required fields**
    - **Validates: Requirements 1.2**

- [x] 5. Filter panel, sort control, and URL state
  - Create Zustand `useFilterStore` holding `FilterState`; serialise/deserialise to URL query params on every change
  - Implement `<FilterPanel>` with controls for property type (multi-select), min price input, max price input, bedrooms, bathrooms, location text input, builder select, and construction status toggle (Req 19.6)
  - Implement `<ActiveFilterIndicators>` rendering a badge per active filter dimension with a clear button
  - Implement `<SortControl>` dropdown with options: Newest First, Price: Low to High, Price: High to Low, Limited Offers, Underrated; serialise selection to `?sort=` URL param
  - Wire filter + sort state to `GET /api/listings` so the listings page re-fetches within 500 ms of any change
  - On mobile, render `<FilterPanel>` as a bottom sheet accessible via a dedicated filter button
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.13, 14.1–14.11, 19.6, 19.7_

  - [ ]* 5.1 Write property test for active filter indicators
    - **Property 5: Non-empty filter state renders at least one indicator badge per active dimension**
    - **Validates: Requirements 2.4**

  - [ ]* 5.2 Write property test for filter state URL serialisation round-trip
    - **Property 6: Filter state serialises to URL and parses back to equivalent state**
    - **Validates: Requirements 2.5, 8.5**

  - [ ]* 5.3 Write property test for sort correctness
    - Verify price_asc produces ascending order, price_desc descending, limited_offers only shows limitedOffer=true listings, underrated only shows underrated=true listings
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

- [x] 6. Listings page
  - Create `src/app/listings/page.tsx` as a server component that reads URL params, fetches initial listings server-side, and renders `<FilterPanel>`, `<SortControl>`, `<ActiveFilterIndicators>`, `<ViewToggle>`, `<ListingGrid>`, and `<RecentlyViewedSection>`
  - Implement `<ViewToggle>` switching between Grid, List, and Map views
  - Implement `<ListingGrid>` and `<ListingList>` rendering `<ListingCard>` arrays with pagination controls
  - Display "No properties found" message with clear-filters prompt when result set is empty
  - _Requirements: 1.1, 1.3, 1.5, 2.1–2.5, 14.1–14.11_

- [x] 7. Map integration (Leaflet.js)
  - Install `leaflet` and `react-leaflet`; create a dynamic import wrapper to avoid SSR issues
  - Implement `<MapView>` rendering pin markers for each listing that has `lat` and `lng`; listings without coordinates are excluded from map view
  - Implement `<PropertyPopupCard>` shown on pin click: property image, title, price, link to detail page
  - Support zoom, pan, and standard map gestures
  - When filters change, update pin markers to reflect only filtered listings
  - Embed a single-property `<MapEmbed>` on the Property Detail Page
  - Handle map provider load failure by falling back to grid view with an informational message
  - _Requirements: 3.1–3.6_

  - [ ]* 7.1 Write property test for map pins matching visible listings
    - **Property 7: Number of map pins equals number of listings in current result set**
    - **Validates: Requirements 3.2**

- [x] 8. Homepage
  - Create `src/app/page.tsx` with `<HeroSection>`, `<FeaturedListings>`, `<BuilderSection>`, `<ServicesSection>`, `<TestimonialsSection>`, and `<RecentlyViewedSection>`
  - `<HeroSection>`: full-width, headline, subheadline, inline `<SearchBar>` with autocomplete; on submit navigate to `/listings?q=<term>`
  - `<FeaturedListings>`: fetch listings where `featured = true`; render as `<ListingCard>` grid
  - `<BuilderSection>`: fetch all builders; render `<BuilderCard>` (logo or name); on click navigate to `/listings?builder=<slug>`
  - `<RecentlyViewedSection>`: read from localStorage (guest) or user account (auth); render as `<ListingCard>` row; hide when empty
  - _Requirements: 6.1–6.7, 8.2, 8.3, 17.2, 17.5_

  - [ ]* 8.1 Write property test for hero search navigation
    - **Property 12: Any non-empty hero search navigates to /listings?q=<term>**
    - **Validates: Requirements 6.2**

  - [ ]* 8.2 Write property test for builder click navigation
    - **Property 13: Clicking a builder navigates to /listings?builder=<slug>**
    - **Validates: Requirements 6.7, 8.3**

- [x] 9. Search autocomplete
  - Implement `GET /api/listings/search` route: accepts `q` param; queries listing `title`, `description`, and `area` fields (case-insensitive); returns matching listings
  - Implement `<SearchBar>` component: shows autocomplete dropdown only when input length ≥ 3; on selection or submit, navigates to `/listings?q=<term>`; displays "No results found" when empty
  - _Requirements: 7.1–7.4_

  - [ ]* 9.1 Write property test for autocomplete threshold
    - **Property 14: Autocomplete triggers only at 3+ characters**
    - **Validates: Requirements 7.2**

  - [ ]* 9.2 Write property test for search result relevance
    - **Property 15: Every search result contains the search term in title, description, or area**
    - **Validates: Requirements 7.3**

- [x] 10. Property detail page
  - Create `src/app/listings/[id]/page.tsx` as a server component fetching full listing detail
  - Render `<ImageGallery>`, `<PropertyInfo>` (title, price, `<PhoneDiscountBadge>` if eligible, address, type, beds, baths, year built / possession date), `<Description>`, `<AmenitiesSection>`, `<FloorPlansSection>`, `<MapEmbed>`, `<EnquiryForm>`, `<AgentContactCard>` (WhatsApp CTA + Call Now), `<StickyContactBar>` (mobile only), `<NeighbourhoodSection>`, `<EMICalculator>`, `<ShareButton>`, `<CompareCheckbox>`, `<RecentlyViewedSection>`
  - Record the viewed listing in localStorage / user account on page load (recently viewed)
  - _Requirements: 1.3, 1.4, 4.6, 4.7, 10.8, 13.1–13.6, 16.1, 17.1, 17.3, 18.1, 19.2, 19.3, 20.1_

  - [ ]* 10.1 Write property test for detail page required fields
    - **Property 2: Property detail page contains all required fields**
    - **Validates: Requirements 1.4**

- [x] 11. Contact page and enquiry forms
  - Create `src/app/contact/page.tsx` with agency address, phone, email, business hours, `<ContactForm>`, WhatsApp CTA, and Call Now button
  - `<ContactForm>`: fields for name, email, phone, subject, message; inline validation (required fields, email format); on valid submit POST to `/api/contact` and show confirmation
  - Implement `POST /api/contact` and `POST /api/enquiry/:listingId` API routes
  - `<EnquiryForm>` on Property Detail Page: pre-fill subject/message with listing title
  - WhatsApp CTA: `wa.me/{agentWhatsApp}?text=<encoded message with title and URL>`; Call Now: `tel:{agentPhone}`
  - `<StickyContactBar>`: fixed bottom bar on mobile (< 768 px) with WhatsApp CTA and Call Now
  - _Requirements: 4.1–4.11_

  - [ ]* 11.1 Write property test for contact form rejects incomplete submissions
    - **Property 8: Any submission with one or more empty required fields is rejected with inline errors**
    - **Validates: Requirements 4.4**

  - [ ]* 11.2 Write property test for contact form email validation
    - **Property 9: Any invalid email format is rejected with an inline error**
    - **Validates: Requirements 4.5**

  - [ ]* 11.3 Write property test for enquiry form pre-fill
    - **Property 10: Enquiry form subject/message is pre-populated with the listing title**
    - **Validates: Requirements 4.6**

  - [ ]* 11.4 Write property test for contact link href formats
    - **Property 11: WhatsApp href is a valid wa.me URL; Call Now href is a valid tel: link**
    - **Validates: Requirements 4.8, 4.9**

- [x] 12. Checkpoint — core browsing complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Authentication (NextAuth.js, registration, login, logout)
  - Install and configure NextAuth.js with the Credentials provider and JWT strategy
  - Implement `POST /api/auth/register`: validate name, email (unique), password ≥ 8 chars, matching confirmation; hash password with bcrypt; create `User`; auto-login
  - Implement login via NextAuth Credentials: validate email + password hash; create session; redirect to previous page or homepage
  - Implement logout: invalidate session server-side; redirect to homepage
  - Update `<Header>` `<AuthControls>`: show user name + logout when authenticated; show login link when guest
  - Create `src/app/auth/page.tsx` with tabbed `<LoginForm>` and `<RegisterForm>`
  - _Requirements: 9.1–9.12_

  - [ ]* 13.1 Write property test for registration round-trip
    - **Property 16: Valid registration creates an account that can be logged into**
    - **Validates: Requirements 9.3, 9.8**

  - [ ]* 13.2 Write property test for password stored as hash
    - **Property 17: passwordHash field never equals the plaintext password**
    - **Validates: Requirements 9.4**

  - [ ]* 13.3 Write property test for duplicate email rejection
    - **Property 18: Registering with an existing email is rejected without creating a duplicate**
    - **Validates: Requirements 9.5**

  - [ ]* 13.4 Write property test for password validation
    - **Property 19: Passwords shorter than 8 chars or mismatched confirmation are rejected**
    - **Validates: Requirements 9.6, 9.7, 11.7, 11.8**

  - [ ]* 13.5 Write property test for generic login error (no email enumeration)
    - **Property 20: Unknown email and wrong password both return the same generic error**
    - **Validates: Requirements 9.9, 9.10**

  - [ ]* 13.6 Write property test for logout session invalidation
    - **Property 21: After logout, the session token is treated as unauthenticated**
    - **Validates: Requirements 9.11**

- [x] 14. Password reset flow
  - Create `src/app/auth/forgot-password/page.tsx` with email input form; POST to `POST /api/auth/forgot-password`
  - `POST /api/auth/forgot-password`: generate a cryptographically random token; hash it; store in `PasswordReset` with 1-hour expiry; send reset email via Resend; always return the same response regardless of whether the email exists
  - Create `src/app/auth/reset-password/page.tsx` reading `?token=` from URL; render new password + confirmation form; POST to `POST /api/auth/reset-password`
  - `POST /api/auth/reset-password`: validate token hash, expiry, and `used` flag; validate new password ≥ 8 chars and matching confirmation; update `passwordHash`; mark token as used; redirect to login with success message
  - _Requirements: 11.1–11.10_

  - [ ]* 14.1 Write property test for reset token stored as hash
    - **Property 29: Password_Reset_Token stored value never equals the plaintext token**
    - **Validates: Requirements 11.10**

  - [ ]* 14.2 Write property test for unknown email returns same response
    - **Property 30: Unknown and known emails return identical HTTP response**
    - **Validates: Requirements 11.4**

  - [ ]* 14.3 Write property test for password reset round-trip
    - **Property 31: Request reset → follow link → submit new password → login with new password succeeds**
    - **Validates: Requirements 11.6**

  - [ ]* 14.4 Write property test for expired/used token rejection
    - **Property 32: Expired or used reset token is rejected without updating the password**
    - **Validates: Requirements 11.9**

- [x] 15. OTP phone verification and 1% discount
  - Create `src/app/account/page.tsx` with `<PhoneVerificationSection>`: phone input, OTP input, explanatory prompt about the 1% discount
  - Implement `POST /api/otp/send`: validate E.164 phone format; invalidate any existing OTP for the user; generate a 6-digit OTP; hash it; store in `OtpRecord` with 10-minute expiry; send SMS via Twilio
  - Implement `POST /api/otp/verify`: look up the latest non-used, non-expired `OtpRecord` for the user; compare submitted OTP against hash; on match set `phoneVerified = true` and mark record as used; on mismatch return inline error; on expiry return expiry error
  - In `GET /api/listings` and `GET /api/listings/:id`, populate `discountedPrice = applyPhoneDiscount(price)` when the requesting user has `phoneVerified = true`
  - Display `<PhoneDiscountBadge>` on listing cards and detail page for verified users; display discount prompt for unverified users
  - _Requirements: 10.1–10.11_

  - [ ]* 15.1 Write property test for phone number format validation
    - **Property 22: Non-E.164 phone numbers are rejected without sending an SMS**
    - **Validates: Requirements 10.2**

  - [ ]* 15.2 Write property test for correct OTP verifies phone (round-trip)
    - **Property 23: Correct OTP within expiry sets phoneVerified = true**
    - **Validates: Requirements 10.4**

  - [ ]* 15.3 Write property test for incorrect OTP rejection
    - **Property 24: Incorrect OTP does not set phoneVerified = true**
    - **Validates: Requirements 10.5**

  - [ ]* 15.4 Write property test for expired OTP rejection
    - **Property 25: OTP past expiresAt is rejected without verifying the phone**
    - **Validates: Requirements 10.6**

  - [ ]* 15.5 Write property test for new OTP invalidates previous OTP
    - **Property 26: Requesting a new OTP marks the previous OTP as used**
    - **Validates: Requirements 10.7**

  - [ ]* 15.6 Write property test for unverified users see no discount
    - **Property 28: Guest or unverified user sees original price with no discount**
    - **Validates: Requirements 10.10**

- [x] 16. Save / wishlist properties
  - Implement `GET /api/saved`, `POST /api/saved/:listingId`, `DELETE /api/saved/:listingId`, and `POST /api/saved/merge` API routes
  - Add save icon (outline / filled) to `<ListingCard>` and `<PropertyDetailPage>`; toggle on click; for guests store in `sessionStorage` key `uk_realty_saved`; for auth users call the API
  - On guest login, call `POST /api/saved/merge` with session IDs; clear `sessionStorage`
  - Create `src/app/saved/page.tsx`: for auth users fetch from API; for guests read from `sessionStorage`; render `<ListingCard>` grid; show "no longer available" indicator for unavailable listings; show empty state when list is empty
  - _Requirements: 12.1–12.11_

  - [ ]* 16.1 Write property test for save icon state reflects saved status
    - **Property 33: Save icon is filled iff listing is in the user's saved set**
    - **Validates: Requirements 12.1, 12.2**

  - [ ]* 16.2 Write property test for save round-trip (authenticated)
    - **Property 34: Saving a listing adds it to Saved_Properties_Page results**
    - **Validates: Requirements 12.3, 12.8**

  - [ ]* 16.3 Write property test for unsave removes the listing
    - **Property 35: Unsaving a listing removes it from Saved_Properties_Page results**
    - **Validates: Requirements 12.4**

  - [ ]* 16.4 Write property test for guest save merge on login
    - **Property 36: Guest saves are merged into User_Store on login and session is cleared**
    - **Validates: Requirements 12.5, 12.6, 12.9**

  - [ ]* 16.5 Write property test for unavailable saved listing indicator
    - **Property 37: Saved listing with available=false shows the unavailable indicator**
    - **Validates: Requirements 12.10**

- [x] 17. Floor plans section and lightbox
  - Add `<FloorPlansSection>` to `<PropertyDetailPage>`: hidden when no floor plans; shows thumbnails when plans exist; shows "Floor plan coming soon" placeholder when explicitly configured
  - Implement `<LightboxModal>`: opens on thumbnail click; shows full-size image; renders next/previous controls only when listing has > 1 floor plan; closes on outside click or close button
  - Implement admin API routes: `POST /api/admin/listings/:id/floor-plans` (upload), `DELETE /api/admin/listings/:id/floor-plans/:planId` (remove)
  - _Requirements: 13.1–13.7_

  - [ ]* 17.1 Write property test for floor plan section visibility
    - **Property 38: Floor Plans section visible iff listing has ≥ 1 FloorPlan; thumbnail count equals FloorPlan count**
    - **Validates: Requirements 13.1, 13.2, 13.3**

  - [ ]* 17.2 Write property test for lightbox navigation controls
    - **Property 39: Lightbox shows next/prev controls iff listing has > 1 floor plan**
    - **Validates: Requirements 13.5**

  - [ ]* 17.3 Write property test for floor plan admin CRUD round-trip
    - **Property 40: Uploaded floor plans are retrievable; removed floor plans no longer appear**
    - **Validates: Requirements 13.7**

- [x] 18. Checkpoint — auth, saves, and floor plans complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Property comparison
  - Create Zustand `useComparisonStore` backed by `sessionStorage`; cap at 3 selections; expose `add`, `remove`, `clear`
  - Add compare checkbox to `<ListingCard>`; show error toast when user attempts to add a 4th property
  - Implement `<ComparisonBar>`: sticky bottom bar; hidden when selection is empty; shows thumbnails + "Compare" button
  - Create `src/app/compare/page.tsx` (or modal): side-by-side table of price, property type, bedrooms, bathrooms, area/location, builder, amenities, possession date; remove control per property
  - _Requirements: 15.1–15.7_

- [x] 20. Neighbourhood / locality POIs
  - Implement `GET /api/listings/:id/pois` route: if listing has `lat` and `lng`, query OpenStreetMap Overpass API (or Google Places API) for nearby schools, hospitals, metro/bus stations, supermarkets, and restaurants within a configurable radius; return POI name, category, and distance
  - Add `<NeighbourhoodSection>` to `<PropertyDetailPage>`: hidden when listing has no coordinates; renders POI list with category icon, name, and distance
  - _Requirements: 16.1–16.4_

- [x] 21. Recently viewed properties
  - Create `src/lib/recentlyViewed.ts`: `recordView(listingId)` writes to `localStorage` (guest, max 10) or calls `PATCH /api/account/recently-viewed` (auth, max 20); `getRecentlyViewed()` reads from localStorage or user account
  - Implement `PATCH /api/account/recently-viewed` route: prepend listing ID to user's `recentlyViewed` JSON array; trim to 20 entries
  - Add `<RecentlyViewedSection>` component: fetches listing details for stored IDs; renders as `<ListingCard>` row; hidden when list is empty; includes a "Clear" control
  - Wire `<RecentlyViewedSection>` into homepage and listings page
  - Call `recordView` on `<PropertyDetailPage>` mount
  - _Requirements: 17.1–17.5_

- [x] 22. EMI calculator
  - Implement `<EMICalculator>` widget: inputs for property price (pre-filled), down payment, tenure (years), annual interest rate; compute EMI in real time on any input change using the reducing balance formula; display result in INR; show disclaimer
  - Add `<EMICalculator>` to `<PropertyDetailPage>`
  - _Requirements: 18.1–18.5_

  - [ ]* 22.1 Write property test for EMI formula correctness
    - For any valid (principal > 0, rate > 0, tenure > 0), verify `EMI = P × r × (1+r)^n / ((1+r)^n − 1)` where `P = price − downPayment`, `r = annualRate / 12 / 100`, `n = tenure × 12`
    - _Requirements: 18.4_

- [x] 23. Property age, possession date, and construction status badges
  - Extend `Listing` Prisma model with `yearBuilt Int?` and `possessionDate String?` (already added in task 2); expose both fields in API responses
  - Render "Built in [year]" or "Possession by [month year]" in `<PropertyInfo>` on the detail page
  - Render "Ready to Move" or "Under Construction" badge on `<ListingCard>` and `<PropertyDetailPage>`
  - Add construction status toggle to `<FilterPanel>` and wire to `GET /api/listings` filter logic
  - _Requirements: 19.1–19.7_

- [x] 24. Share property panel
  - Implement `<SharePanel>` overlay: Copy Link (writes `window.location.href` to clipboard, shows "Copied!" toast), Share via WhatsApp (`wa.me` link with title + URL), Share via Email (`mailto:` link with title in subject and body); closes on outside click or Escape key
  - Add `<ShareButton>` to `<PropertyDetailPage>` that toggles `<SharePanel>`
  - _Requirements: 20.1–20.6_

  - [ ]* 24.1 Write property test for share link formats
    - For any listing, verify WhatsApp share href is a valid `wa.me` URL containing the encoded title and URL; verify email share href is a valid `mailto:` link with title in subject
    - _Requirements: 20.4, 20.5_

- [x] 25. Browse by builder — builder page
  - Create `src/app/builders/[slug]/page.tsx`: fetch builder by slug; fetch all listings for that builder; render `<ListingGrid>` with active builder filter indicator; show "No properties found for this builder" when empty
  - Ensure `GET /api/listings?builder=<slug>` returns only listings for that builder across all property types
  - _Requirements: 8.1–8.6_

- [x] 26. Final wiring and integration
  - Verify all URL query param flows: filters, sort, builder, search term persist across navigation and browser back
  - Verify `<RecentlyViewedSection>` appears on homepage and listings page
  - Verify `<ComparisonBar>` is globally mounted in root layout and reads from `useComparisonStore`
  - Verify `<StickyContactBar>` renders only on `<PropertyDetailPage>` at < 768 px
  - Verify `<PhoneDiscountBadge>` appears consistently on listing cards and detail page for verified users
  - Verify skeleton placeholders appear during all listing fetch loading states
  - Verify 404 page has custom design with link back to homepage
  - _Requirements: 1.5, 2.5, 5.3, 5.4, 10.11, 14.8, 14.9, 17.2_

- [x] 27. Final checkpoint — all features integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations (`{ numRuns: 100 }`)
- Each property test must include the comment tag: `// Feature: uk-realty-website, Property {N}: {property_text}`
- All 40 correctness properties defined in the design document are covered by property sub-tasks above
- The monochrome design system (black, greys, white + single charcoal accent) must be enforced across every component
