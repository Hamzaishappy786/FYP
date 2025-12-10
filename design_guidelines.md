# DoctorPath AI - Design Guidelines

## Design Approach
**Selected Approach**: Design System - Material Design adaptation for healthcare
**Rationale**: Medical applications require trust, clarity, and efficiency. Material Design provides excellent data visualization patterns, clear hierarchy, and accessibility features essential for healthcare professionals managing critical patient information.

**Core Design Principles**:
- Trust & Professionalism: Clean, consistent interfaces that inspire confidence
- Data Clarity: Clear typography and spacing for medical information
- Efficiency: Minimal clicks to access critical patient data
- Accessibility: WCAG 2.1 AA compliance for all interactive elements

---

## Typography System

**Font Family**: 
- Primary: Inter (via Google Fonts CDN)
- Monospace: 'Courier New' for patient IDs, test values

**Hierarchy**:
- Page Titles: text-2xl md:text-3xl, font-bold (32px desktop)
- Section Headers: text-xl font-semibold (24px)
- Card Titles: text-lg font-semibold (20px)
- Body Text: text-base (16px), leading-relaxed
- Metadata/Labels: text-sm font-medium (14px)
- Helper Text: text-xs (12px)
- Patient Data Values: text-lg md:text-xl font-bold (medical readings, test results)

**Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

---

## Layout System

**Spacing Units**: Consistent use of Tailwind spacing: 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 (standard cards), p-4 (compact cards)
- Section spacing: space-y-6 (primary), space-y-4 (compact)
- Grid gaps: gap-6 (desktop), gap-4 (mobile)
- Form field spacing: space-y-4

**Container Strategy**:
- Dashboard content: max-w-7xl mx-auto px-6
- Forms: max-w-2xl for single column, max-w-4xl for two-column
- Modal dialogs: max-w-lg to max-w-2xl depending on content

**Responsive Grid**:
- Stats cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Patient/Doctor lists: grid-cols-1 lg:grid-cols-2
- Form layouts: Single column mobile, grid-cols-2 gap-6 on md+

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header: h-16, shadow-sm, border-b
- Logo: h-10 w-auto, positioned left
- Nav links: Hidden mobile, flex gap-8 on md+
- User profile dropdown: Positioned right with avatar (h-10 w-10 rounded-full)
- Mobile menu: Hamburger icon, slide-out drawer overlay

**Sidebar Navigation** (Dashboard):
- w-64 fixed sidebar on lg+, hidden mobile
- Mobile: Full-width drawer overlay with backdrop
- Nav items: py-3 px-4, rounded-lg, with icons (h-5 w-5)
- Active state: font-semibold with subtle background
- Icon library: Heroicons (outline for inactive, solid for active)

### Cards & Containers
**Standard Card**:
- bg-white rounded-xl shadow-sm border
- p-6 padding
- Hover: subtle border transition (transition-colors)

**Stats Card**:
- Grid layout: flex justify-between items-center
- Icon container: w-12 h-12 rounded-lg, centered icon
- Number: text-3xl font-bold
- Label: text-sm text-gray-600

**Patient/Request Cards**:
- Border rounded-lg p-4
- Header: flex justify-between items-start
- Status badge: Absolute positioned top-right, px-2 py-1 rounded-full text-xs font-semibold
- Content: space-y-2 for metadata
- Actions: flex gap-2 flex-wrap mt-4

### Forms
**Input Fields**:
- w-full px-4 py-2 rounded-lg border
- Focus: ring-2 ring-offset-0, border-transparent
- Labels: block text-sm font-medium mb-2
- Helper text: text-xs mt-1
- Error state: border-red-500, text-red-600 for helper

**Select Dropdowns**: 
- Same styling as inputs
- Chevron icon positioned right

**Textarea**:
- Same base styling, rows attribute for height
- Used for clinical notes, treatment plans

**File Upload**:
- Dashed border (border-dashed border-2) rounded-lg
- p-6 click target area
- File preview: bg-gray-50 border rounded p-3, file icon + metadata
- Upload button: text link style, positioned top-right

**Form Buttons**:
- Primary: w-full py-3 rounded-lg font-semibold (submit actions)
- Secondary: px-4 py-2 rounded-lg (cancel, auxiliary)
- Icon buttons: p-2 rounded-lg, icon only for compact actions

### Data Display
**Tables** (Patient lists, test results):
- w-full border rounded-lg overflow-hidden
- Header: bg-gray-50 font-semibold text-sm
- Rows: border-b last:border-0, py-3 px-4
- Striped: alternate bg-gray-50 for readability
- Responsive: Horizontal scroll wrapper on mobile, card-based list on small screens

**Timeline** (Medical history):
- Vertical line connector (border-l-2)
- Timeline nodes: rounded-full w-3 h-3, absolute positioned
- Timeline items: pl-8 pb-6 relative
- Date: text-xs font-medium
- Event: text-sm, medical details in text-xs

**Badges/Pills**:
- Status indicators: px-2 py-1 rounded-full text-xs font-semibold
- Risk levels: Semantic colors (green=low, yellow=moderate, red=high)
- Multiple badges: flex gap-2 flex-wrap

### Diagnosis Tool
**Input Grid**: grid-cols-1 md:grid-cols-2 gap-4
**Result Display**:
- Large probability: text-5xl font-bold, centered
- Risk level badge: text-lg px-4 py-2 rounded-lg
- Recommendation box: bg-blue-50 border rounded-lg p-4, text-sm leading-relaxed
- Biomarker results: Grid display, label + value pairs

### Chat Interface
**Chat Window**:
- Fixed bottom-right: bottom-24 right-6
- w-96 h-[500px] (desktop), full screen on mobile
- Shadow-2xl with rounded-lg
- Header: p-4, online indicator (w-3 h-3 rounded-full)

**Messages**:
- User: justify-end, max-w-[80%], rounded-lg p-3
- Bot: justify-start, max-w-[80%], rounded-lg p-3 border
- Message spacing: space-y-4
- Timestamp: text-xs below message
- Typing indicator: 3 animated dots (w-2 h-2 rounded-full)

**Input Area**:
- Border-top, p-4
- Flex layout: input flex-1, send button px-6

### Modals & Overlays
**Modal Structure**:
- Fixed inset-0 z-50 overlay (bg-black/50)
- Centered container: max-w-lg to max-w-2xl
- Modal content: bg-white rounded-xl shadow-2xl p-6
- Header: text-xl font-bold mb-4
- Footer: flex gap-3 justify-end mt-6

**Loading States**:
- Spinner: Centered, h-64 container
- Skeleton: Animated pulse on card placeholders
- Disabled states: opacity-60 cursor-not-allowed

---

## Public Pages

**Landing Page**:
- Hero: min-h-screen grid lg:grid-cols-2, left content + right image
- Hero content: max-w-xl, large headline (text-4xl md:text-5xl font-bold), subheading (text-xl), CTA buttons (flex gap-4)
- Features: Grid 3 columns (lg), icon-title-description cards, p-6 each
- Trust section: Centered stats (grid-cols-3), large numbers with labels
- CTA section: Full-width bg treatment, centered content max-w-3xl, py-20

**Login/Signup Forms**:
- Centered card: max-w-md mx-auto, min-h-screen flex items-center
- Logo: Centered top, mb-8
- Form: space-y-4
- Submit button: Full width, py-3
- Link to alternate action: Text center, text-sm mt-4

---

## Images
**Hero Section**: 
- Large professional image of medical technology/doctor-patient interaction
- Position: Right side of hero on desktop (lg:block hidden mobile)
- Treatment: rounded-2xl shadow-xl, subtle overlay gradient if text overlaps

**Dashboard Headers**:
- Gradient background treatment (no image needed)

**Empty States**:
- Placeholder illustrations for "No appointments," "No test results"
- Centered, h-48 w-48, grayscale tone

**Profile Pictures**:
- Doctor/Patient avatars: rounded-full, w-10 h-10 (nav), w-24 h-24 (profile page)
- Default: Initials on solid background if no image

---

## Accessibility
- Form labels always present and associated with inputs
- Focus indicators: ring-2 visible on all interactive elements
- ARIA labels for icon-only buttons
- Semantic HTML: <nav>, <main>, <section>, <article>
- Color contrast: Minimum 4.5:1 for text, 3:1 for UI components
- Keyboard navigation: Tab order logical, Enter/Space for actions