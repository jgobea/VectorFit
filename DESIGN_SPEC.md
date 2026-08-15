# Detailed Mobile App Design Prompt: AI-Powered Workout Routine App

## 1. App Overview & Core Concept

**Name:** VectorFit

**Purpose:** A mobile fitness app that combines personalized workout routine management with an AI personal trainer that provides real-time form feedback and live exercise coaching.

**Primary Users:** Fitness enthusiasts (beginner to intermediate level), people seeking personalized training guidance without hiring a real trainer.

**Key Value Propositions:**
- AI-powered personalized workout recommendations
- Real-time form correction via live video analysis
- Chat-based AI trainer for exercise guidance and routine customization
- Progress tracking and performance analytics

---

## 2. Page Specifications

### **A. LOGIN PAGE**

**Visual Hierarchy:**
- Large, welcoming hero area with app logo/branding
- Clear call-to-action (CTA) for login
- Secondary CTA for signup
- Password recovery link (subtle)

**Elements & Components:**
- Email/Username input field (with validation)
- Password input field (show/hide toggle)
- "Remember Me" checkbox
- Primary button: "Login" (full-width, high contrast color)
- Secondary button: "Sign Up" (outlined style or different color)
- "Forgot Password?" link (small text, lower section)
- Optional: Social login buttons (Apple ID, Google) for quick access
- Disclaimer/Terms link at bottom

**Interactions:**
- Real-time input validation (email format, password strength)
- Loading state on login button during authentication
- Error messages displayed inline with input fields
- Keyboard auto-advancement to next field
- Haptic feedback on successful login

**Design Considerations:**
- Clean, minimal design—no distractions from core login flow
- Dark theme only (`#1C1C1E` background) — the app does not have a light mode
- Input fields use `#2A2A2E` surface color with `#3A3A3E` border, white text
- Primary "Login" button uses the green-to-cyan gradient (`#39FF14` → `#00E5FF`)
- Accessible button sizing (minimum 48x48 px touch target)
- Form fields should be optimized for mobile keyboards

---

### **B. DASHBOARD PAGE**

**Purpose:** The home hub—first page users see after login. Shows overview of fitness progress and quick access to all features.

**Layout Structure (Vertical Scroll):**

1. **Header Section (Sticky/Fixed)**
   - User greeting: "Good Morning, [Name]!" (time-based)
   - Quick profile icon (navigation to User Info page)
   - Notification bell icon

2. **Stats Summary Cards (Horizontal Scroll)**
   - Workouts This Week (count)
   - Calories Burned (total)
   - Streak (consecutive days)
   - Personal Best (latest achievement)
   - Swipeable/scrollable row of 4-6 metric cards

3. **Today's Workout Section**
   - Display today's scheduled workout(s)
   - Exercise preview cards showing:
     - Exercise name & image
     - Sets/Reps/Duration
     - Difficulty indicator
   - Large "Start Workout" button
   - Estimated duration

4. **Upcoming Workouts (This Week)**
   - Vertical list of workouts for next 3-7 days
   - Date labels
   - Quick preview of each day's routine
   - Collapsed/expandable details

5. **Quick Access Buttons (Grid or Bottom Navigation)**
   - "Chat with Trainer" (text icon + label)
   - "Live Review Session" (camera icon + label)
   - "View Progress" (chart icon + label)
   - "Edit Routine" (settings icon + label)

6. **Achievement/Motivational Section**
   - Badges earned
   - Weekly progress bar
   - Motivational quote or message

**Visual Hierarchy:**
- Large typography for key metrics
- Contrasting colors for CTAs (Start Workout, Chat with Trainer)
- Subtle cards/sections with light shadows or borders
- Icons + text labels for quick navigation

**Interactions:**
- Tap any workout card to see details
- Swipe stats cards horizontally
- Pull-to-refresh for updated data
- Tap "Chat with Trainer" → navigates to Chat page
- Tap "Live Review" → navigates to Live Review page

---

### **C. TRAINER AI AGENT CHAT PAGE**

**Purpose:** Conversational interface where users ask the AI trainer questions about exercises, form, routines, nutrition, recovery, etc.

**Layout Structure:**

1. **Header**
   - Title: "AI Trainer Chat"
   - Status indicator: "AI Trainer is online" (always available)
   - Header actions: Info icon (for trainer profile/capabilities)

2. **Chat Conversation Area (Main Content)**
   - Message threads displayed chronologically (oldest → newest)
   - User messages: right-aligned, distinctive color/bubble style
   - AI trainer messages: left-aligned, different color/bubble style
   - Avatar icons for both parties
   - Timestamps visible on hover or grouped by time

3. **Quick Suggestion Pills (Below Last Message)**
   - Pre-populated questions:
     - "How do I improve my form?"
     - "Create a chest workout for me"
     - "What exercises help with [body part]?"
     - "How many rest days should I take?"
   - Tappable pills that auto-populate the input field or send as prompt

4. **Text Input Area (Sticky/Fixed at Bottom)**
   - Text input field: "Ask your trainer..."
   - Send button (paper plane icon, right side of input)
   - Attachment button (optional—for form video clips or photos)
   - Microphone icon (optional—for voice input)
   - Clear visual affordance for active input state

5. **Typing Indicators**
   - Show "AI Trainer is typing..." while awaiting response
   - Animated dots or similar indicator

**Visual Design:**
- Conversational, friendly tone in AI messages
- Clear visual distinction between user and AI:
  - User bubbles: `#39FF14` → `#00E5FF` gradient background, white text, right-aligned
  - AI trainer bubbles: `#2A2A2E` surface background, `#FFFFFF` text, left-aligned
- Consistent spacing and typography (Inter body font)
- Dark background `#1C1C1E` for the entire chat area — no light/white backgrounds
- Subtle fade-in animations when messages appear

**Interactions:**
- Tap quick suggestion pills to send message
- Long-press message to copy or delete
- Swipe message to reveal options (pin, flag, etc.)
- Message input grows as user types (up to ~3-4 lines)
- Keyboard dismisses after send
- Scroll to top to see conversation history

**Key Content Guidance:**
- AI responses should include:
  - Clear, actionable advice
  - Exercise breakdowns or form cues
  - Links to instructional videos (if applicable)
  - Personalization based on user fitness level

---

### **D. TRAINER AI AGENT LIVE REVIEW PAGE**

**Purpose:** Real-time AI feedback during live exercise performance. The AI analyzes form via the device camera and provides instant corrections.

**Layout Structure:**

1. **Full-Screen Video Feed (Majority)**
   - Live camera input from device (portrait or landscape optimized)
   - Overlay pose visualization (skeleton/joint detection on user)
   - Real-time form analysis graphics (angles, alignment indicators)

2. **Top Overlay (Semi-transparent Bar)**
   - "Live Review: [Exercise Name]" title
   - Close/back button (X)
   - Settings/camera toggle (if applicable)

3. **Bottom Overlay (Control & Feedback Area)**
   - **Form Score Display:** Large, prominent number (0-100) or visual gauge
   - **Real-Time Feedback Text:** 
     - Primary cue: Large text, high contrast (e.g., "Keep chest up")
     - Secondary tips: Smaller text, scrollable if multiple cues
   - **Rep Counter:** Current rep number + target (e.g., "Rep 5 / 10")
   - **Set Indicator:** Current set + total sets (e.g., "Set 2 / 3")

4. **Side Feedback Panels (Optional)**
   - Form accuracy indicators per body part:
     - Shoulders: ✓ Good
     - Back: ⚠ Adjust
     - Knees: ✓ Good
   - Collapsible/swipeable from sides

5. **Bottom Action Buttons (Above Feedback)**
   - "Pause" button (pause camera feed & feedback)
   - "Stop Session" button (end live review)
   - "Record" toggle (record session for later review)

6. **Post-Workout Summary Modal (Upon Completion)**
   - Total reps completed
   - Average form score
   - Best rep (highest form score)
   - Areas for improvement
   - Motivational message
   - "Save Session" button

**Visual Design:**
- Minimal, uncluttered interface (prioritize camera view)
- High contrast overlays for readability
- Color-coding for form feedback:
  - Green: Good form
  - Yellow: Caution/needs adjustment
  - Red: Form issue
- Smooth animations for transitions

**Interactions:**
- Tap to show/hide overlays (immersive mode toggle)
- Tap pause to pause feedback temporarily
- Swipe down from top to close session
- Camera stabilizes after 1-2 seconds
- Haptic feedback on rep completion
- Audio cues optional (beep on form error or rep complete)

**Technical Considerations:**
- Camera permissions required at first launch
- Smooth performance with real-time pose detection
- Low-latency feedback (<500ms delay ideal)
- Graceful degradation if camera quality is poor
- Battery optimization for continuous video processing

---

### **E. USER INFO PAGE**

**Purpose:** Manage personal profile, fitness goals, preferences, and view workout history.

**Layout Structure (Vertical Scroll):**

1. **Profile Header**
   - Large profile picture (circular, tappable to change)
   - User name (editable)
   - Member since date
   - Edit profile button (pencil icon)

2. **Physical Stats Section (Editable Fields)**
   - Age (date picker or number input)
   - Height (dropdown with cm/ft conversion)
   - Weight (with history/progress graph preview)
   - Gender (radio or dropdown)
   - Body type (optional classification)
   - "Last updated: [date]" label

3. **Fitness Information Section**
   - Primary Goal: Dropdown (Muscle gain / Fat loss / General fitness / Strength)
   - Experience Level: Radio buttons (Beginner / Intermediate / Advanced)
   - Workout Frequency: (Days per week slider or buttons: 3/4/5/6/7)
   - Injuries/Limitations: Text input field

4. **Preferences Section**
   - Preferred workout types: Checkboxes (Strength / Cardio / Flexibility / HIIT)
   - Preferred training duration: Buttons (30min / 45min / 60min / 90min)
   - Training time preference: Time picker (e.g., "6:00 AM")
   - Rest day preference: Checkboxes (Mon / Tue / Wed, etc.)

5. **AI Trainer Settings**
   - Feedback intensity: Slider (Gentle / Moderate / Intense)
   - Voice feedback toggle (on/off with volume slider if on)
   - Language preference: Dropdown
   - AI coaching style: Radio buttons (Motivational / Technical / Balanced)

6. **Workout History/Stats**
   - Total workouts completed (counter)
   - Total hours trained (time)
   - Longest streak (days)
   - Personal records (expandable section with top lifts/achievements)

7. **Account & Logout**
   - Email address (display-only or editable)
   - Change password button
   - Privacy settings link
   - Logout button (full-width, different color)
   - Delete account link (small text, bottom)

**Visual Design:**
- Organized sections with clear dividers
- Edit mode vs. view mode states
- Consistent input field styling
- Progress indicators for data completion

**Interactions:**
- Tap profile picture to upload new photo (camera or photo library)
- Tap name to edit inline
- Tap save/done to confirm edits
- Sliders for numeric preferences (smooth, real-time feedback)
- Dropdown selections for categorized data
- Confirmation modal before logout/account deletion
- Success toast message after edits saved

**Validation:**
- Age: 13-120 range
- Height/Weight: Reasonable ranges with unit validation
- Email: Valid email format (if editable)
- Required fields marked with asterisk

---

## 3. Design System Guidelines

### **Color Palette**

> Derived from the VectorFit brand logo.

- **Background:** Deep near-black `#1C1C1E` — used as the base background for all screens, cards, and modals. The app is dark-theme first.
- **Primary Gradient:** Green → Cyan `#39FF14` → `#00E5FF` — used on CTAs (buttons, active states, highlighted metrics, progress bars, icons). Applied as a left-to-right or bottom-to-top linear gradient matching the logo's runner figure.
- **Primary Solid (Fallback):** Cyan `#00E5FF` — for single-color accents, active nav indicators, and links where a gradient isn't suitable.
- **Secondary Solid:** Neon Green `#39FF14` — used for success states, rep completion indicators, positive form feedback, and achievement badges.
- **Surface / Card Background:** Dark charcoal `#2A2A2E` — slightly lighter than the base background; used for cards, input fields, bottom sheets, and overlays so they lift off the background.
- **Text Primary:** Pure white `#FFFFFF` — headlines, button labels, metric numbers.
- **Text Secondary:** Medium gray `#A0A0A8` — subtitles, timestamps, placeholder text, secondary labels.
- **Warning Color:** Amber `#FFB800` — caution states (form needs adjustment, incomplete fields).
- **Error / Form Issue Color:** Red `#FF3B30` — error messages, bad form alerts, critical warnings.
- **Dividers / Borders:** Dark gray `#3A3A3E` — subtle separators between sections and inside cards.

**Usage Rules:**
- Never use a white or light background on any screen — the entire app is dark-themed.
- All text on dark surfaces must maintain WCAG AA contrast (4.5:1 minimum).
- The green-to-cyan gradient is reserved for the most important interactive elements (primary CTA buttons, active states, key metrics). Don't over-use it.
- Secondary actions use `#2A2A2E` surfaces with white text or a bordered/outlined style in cyan.

### **Typography**

> VectorFit's wordmark uses a heavy sans-serif for "vector" (bold weight) and a lighter-weight sans-serif for "fit", all in white. The type system mirrors this contrast between bold emphasis and clean readability.

- **Headline Font:** **Bebas Neue** or **Montserrat ExtraBold (900)** — for page titles, large metric numbers, workout names, and hero text. All-caps where appropriate.
  - H1: 32-36px — page titles, dashboard welcome
  - H2: 22-26px — section headers
  - H3: 18-20px — card titles, exercise names
- **Body Font:** **Inter** (Regular 400 / Medium 500) — for all body copy, labels, input text, descriptions, and chat messages.
  - Body: 15-16px
  - Small: 12-13px — timestamps, secondary metadata, footnotes
- **Accent / Label Font:** **Inter SemiBold (600)** — button labels, stat labels, tab bar items.
- **Font Color on Dark Backgrounds:**
  - Primary text: `#FFFFFF`
  - Secondary text: `#A0A0A8`
  - Gradient accent text (use sparingly): apply `#39FF14` → `#00E5FF` gradient clip on key metric values or featured numbers.
- Ensure sufficient contrast on all dark surfaces (WCAG AA minimum).

### **Spacing**
- Use 8px or 4px grid system for consistency
- Card padding: 16px
- Section spacing: 24px
- Button height: 48-56px (accessible touch target)

### **Icons**
- Consistent icon set (Material Design, Feather, or custom)
- Stroke-weight: 2px for clarity
- Size: 24px (most common), 16px (small), 32px (large)

### **Animations**
- Page transitions: Slide or fade (200-300ms)
- Button interactions: Scale feedback (50ms) + ripple effect
- Loading states: Subtle skeleton screens or spinners
- Micro-interactions: Smooth, not distracting

---

## 4. Mobile-Specific Considerations

- **Screen Sizes:** Optimize for 375px (iPhone SE) to 430px (larger phones)
- **Notch/Safe Areas:** Respect device safe areas for headers/footers
- **Orientation:** Support portrait primarily; landscape for video features
- **Gesture Support:** Swipe, tap, long-press, pinch (where applicable)
- **Performance:** Lightweight animations, optimized images, fast load times
- **Battery:** Minimize camera/video processing drain (especially live review)
- **Connectivity:** Graceful offline states where possible

---

## 5. Accessibility Requirements

- **Contrast:** Minimum WCAG AA (4.5:1 for text)
- **Touch Targets:** Minimum 48x48px
- **Alt Text:** All images have meaningful descriptions
- **Screen Reader Support:** Proper labels and semantic hierarchy
- **Text Sizing:** Respect user's system font size settings
- **Color Blind Friendly:** Don't rely solely on color to convey meaning (use icons/text)

---

## 6. User Flows (Key Journeys)

### **Flow 1: Morning Workout Start**
Login → Dashboard → Tap "Start Workout" → Exercise Detail View → Live Review Session (optional) → Session Complete

### **Flow 2: Ask AI Trainer Question**
Dashboard → Tap "Chat with Trainer" → Type question → Review AI response → Ask follow-up (optional)

### **Flow 3: Update Profile**
Dashboard → Tap Profile Icon → User Info Page → Edit Fields → Save Changes → Return to Dashboard

### **Flow 4: Live Form Feedback**
Dashboard → Tap "Live Review" → Select Exercise → Position device → Live AI feedback overlay → Stop session → View summary

---

## 7. Technical Requirements (For Development)

- **Real-Time Pose Detection:** ML model integration (TensorFlow.js or similar) for form analysis
- **Camera Access:** Seamless permissions handling
- **Backend:** User authentication, data storage, AI model inference
- **Push Notifications:** Workout reminders, AI suggestions
- **Offline Capability:** Limited offline access to cached data
- **Analytics:** Track user engagement, feature usage

---

## 8. Content Tone & Voice

- **Friendly & Motivational:** Encouraging without being overly casual
- **Clear & Technical:** Explain form/fitness concepts simply but accurately
- **Personalized:** Reference user's name, goals, progress
- **Supportive:** Celebrate wins, normalize struggles

---

