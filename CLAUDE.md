# APS PD Logging Tool — Admin Interface Prototype

This file is the build context for the APS PD Logging Tool admin interface prototype. Read this before every session. The member-facing screens already exist in Figma and are NOT part of this build.

---

## 1. What we are building

The **admin interface only** — 11 screens that do not yet exist in Figma. These cover three functional blocks: CPD Configuration, Internal CPD Management, and Internal Registrar Management.

This is a **demonstration prototype**. Single React app, mock data, no real authentication.

**Tech stack:** React · Tailwind CSS · React Router  
**Port:** 3000

---

## 2. The two user types in scope

### IT Administrator
Full access. Sees CPD Configuration, Registrar Program Configuration, and all internal management screens.

### Internal User
Covers Member Services and PD Team. For this prototype, treat them as one role. They see the internal member management screens only. **Journal Entry Notes must always be hidden on Internal User screens.**

> Note: A Member-facing interface already exists in Figma and is out of scope for this build.

---

## 3. Navigation

**IT Administrator side nav:**
- CPD Configuration → CPD Cycles, Schedule Manager
- Registrar Configuration → AoPE Compliance, Registrar Programs, Supervisors, Practice Locations, Log CPD Hours
- Member CPD Profiles
- Member Registrar Profiles
- Reports

**Internal User side nav:**
- Member CPD Profiles
- Member Registrar Profiles
- Reports

---

## 4. Routes

```
/login

/admin/cpd/cycles                    CPD Cycle List
/admin/cpd/cycles/new                Create CPD Cycle
/admin/cpd/cycles/:id/edit           Edit CPD Cycle
/admin/cpd/schedules                 Schedule Process Manager
/admin/registrar/programs            Registrar Program List
/admin/registrar/programs/new        Create Registrar Program
/admin/registrar/programs/:id/edit   Edit Registrar Program
/admin/registrar/supervisors            Supervisors — list
/admin/registrar/supervisors/new        Add Supervisor
/admin/registrar/supervisors/:id        View/Edit Supervisor + assign to programs + log sessions
/admin/registrar/practice-locations         Practice Locations — list
/admin/registrar/practice-locations/new     Add Practice Location
/admin/registrar/practice-locations/:id     View/Edit Practice Location + assign to programs + log hours
/admin/registrar/log-cpd                Log CPD Hours

/internal/cpd/profiles               Member CPD Profiles List
/internal/cpd/profiles/:id           Member CPD Profile Detail
/internal/cpd/activities             All CPD Activities List
/internal/registrar/profiles         Member Registrar Profiles List
/internal/registrar/profiles/:id     Member Registrar Profile Detail
/internal/registrar/activities       All Registrar Activities List
```

Login redirects:
- IT Admin → `/admin/cpd/cycles`
- Internal User → `/internal/cpd/profiles`

---

## 5. Shared components

Build these first — everything else uses them.

| Component | Notes |
|---|---|
| `GlobalNav` | APS top bar, role pill, "Switch role" link |
| `SideNavigation` | Two variants: IT Admin, Internal User |
| `Footer` | APS footer |
| `PageShell` | GlobalNav + SideNav + content area + Footer |
| `StatusBadge` | Pending (grey) · Open (green) · Closed (muted red) |
| `DataTable` | Sortable, paginated, filter bar, Export CSV button, clickable rows |
| `ConfirmDialog` | Modal before any destructive action |
| `EmptyState` | When a table has no records |

---

## 6. Screen specifications

### Block A — CPD Configuration (IT Admin only)

**CPD Cycle List** `/admin/cpd/cycles`  
Table columns: Name · Start Date · End Date · Min Required Hours · Min Peer Hours · Status · Actions  
Actions per row: Edit · Open Cycle (Pending) · Close Cycle (Open) · Reopen Cycle (Closed)
Closed rows: Edit + Reopen Cycle available — Closed is no longer terminal
Top-right: "Create new cycle" button  
Empty state when no cycles exist

**CPD Cycle Create/Edit** `/admin/cpd/cycles/new` and `/:id/edit`  
Fields (all mandatory): Name (text) · Start Date (date picker) · End Date (date picker) · Min Required Hours (number) · Min Peer Hours (number)  
Status field: read-only, labelled "System managed", always shows Pending/Open/Closed  
Validation: date range must not overlap any existing cycle — show inline error, block save  
On save: return to Cycle List

**Schedule Process Manager** `/admin/cpd/schedules`  
Two sections on one page:  
Section 1 — Scheduled Processes table: Process Type · Target Cycle · Execution Date/Time · Status (Active/Inactive) · Actions (Activate, Deactivate, Edit) · "Add schedule" button  
Section 2 — Execution History table (read-only): Process · Cycle · Executed At · Triggered By · Status · Error Details (expandable on Failure)  
Status badges: Success (green) · Partial (amber) · Failure (red)

---

### Block B — Registrar Configuration (IT Admin only)

**Registrar Program List** `/admin/registrar/programs`  
Table columns: Name · AoPE · Total Required Hours · Supervision Hours · Practice Hours · CPD Hours · Edit action  
Top-right: "Create new program" button

**Registrar Program Create/Edit** `/admin/registrar/programs/new` and `/:id/edit`
Three grouped sections:
Section 1 — Program Details: Name (text) · AoPE (dropdown, static list)
Section 2 — Supervision Requirements: Total Required Hours · Required Supervision Hours · Min Primary Hours · Max Secondary Hours · Max Secondary Non-AoPE · Max Group Hours · Direct Client Contact Hours
Section 3 — Practice Requirements: Required Practice Hours · Required CPD Hours
All fields mandatory. Save disabled until complete. On save: return to list.

**Supervisors** `/admin/registrar/supervisors`
Flow: Supervisors → Listing → View/Edit → Assign to Existing Program → Log Session.
A global catalogue of supervisors that exists independently of programs. A supervisor can be assigned to zero or more Open registrar programs, with a per-assignment Supervision Type (Primary or Secondary). Logging supervision sessions is done from the supervisor's own page (or per-row from the program detail page) — there is no separate Log Supervision screen.
List: filter bar (search · AoPE · assigned/unassigned) · table columns Name · AHPRA · AoPE · Assigned Programs (chips) · Actions. Top-right: "Add supervisor" button.
View/Edit `/admin/registrar/supervisors/:id`: editable fields (Title · First name · Last name · AHPRA · Supervisor AoPE · Email · Phone). Section "Assigned Programs" listing current attachments with an Unassign action per row. "Assign to Program" button opens a modal (Program dropdown restricted to Open programs + Supervision Type toggle). "Log session" button opens a modal (Program dropdown restricted to this supervisor's assigned Open programs · Date · Hours/Minutes · Individual/Group). Section "Recent Sessions" lists every supervision activity logged by this supervisor across all programs, with a Remove action per row. Editing core fields propagates to every program's nested supervisor copy.
Add `/admin/registrar/supervisors/new`: same form without the Assigned Programs / Recent Sessions sections — after save, redirects to View/Edit so the user can start assigning.

**Practice Locations** `/admin/registrar/practice-locations`
Flow: Practice Locations → Listing → View/Edit → Assign to Existing Program → Log Hours.
A global catalogue of practice locations (employer + address) that exists independently of programs. A location can be assigned to zero or more Open registrar programs. Logging practice hours is done from the location's own page (or per-row from the program detail page) — there is no separate Log Practice Hours screen.
List: filter bar (search · state · assigned/unassigned) · table columns Employer · Position · Location (suburb, state) · Assigned Programs · Actions. Top-right: "Add location" button.
View/Edit `/admin/registrar/practice-locations/:id`: editable fields (Employer · Position · Phone · Email · Address line 1 · Address line 2 · Suburb · Postcode · State). Section "Assigned Programs" listing current attachments with an Unassign action per row. "Assign to Program" button opens a modal (Program dropdown restricted to Open programs). "Log hours" button opens a modal (Program dropdown restricted to this location's assigned Open programs · Date · Total Duration hours/minutes · Direct Client Contact hours/minutes). Section "Recent Hours" lists every practice activity logged at this location across all programs, with a Remove action per row. Editing the location propagates to every program's nested place of practice copy.
Add `/admin/registrar/practice-locations/new`: same form without the Assigned Programs / Recent Hours sections — after save, redirects to View/Edit.

---

### Block C — Internal CPD Management (Internal User + IT Admin)

**Member CPD Profiles List** `/internal/cpd/profiles`  
Filter bar: Member Name · Member Number · Grade · CPD Cycle · Board Registration · CPD Exemption · Learning Plan Method · Requirements Met  
Table columns: Member Name · Number · Grade · CPD Cycle · Board Registration · Reg Date · CPD Exemption · Learning Plan Method · Requirements Met  
CPD Exemption and Requirements Met shown as Yes/No badges  
Export CSV button · clickable rows → Profile Detail

**Member CPD Profile Detail** `/internal/cpd/profiles/:id`  
Section A — Profile: Name · Number · Grade · CPD Cycle · Board Registration · Reg Date · CPD Exemption · Terms of Use · Requirements Met · Edit button (IT Admin only)  
Section B — Learning Plan: Documentation Method · Learning Needs table (clickable rows)  
Section C — CPD Activities: Activity Type · Peer Hrs · Action Hrs · CPD Hrs · Completed Date · Logged Date · clickable rows  
Journal Entry Notes: **always hidden** on this screen  
Breadcrumb back to list

**All CPD Activities List** `/internal/cpd/activities`  
Filter bar: Member Name · Number · Grade · Activity Type · Peer Hours · Action Hours · CPD Hours · Completed Date · Logged Date  
Table + Export CSV · clickable rows  
Journal Entry Notes: **always hidden**

---

### Block D — Internal Registrar Management (Internal User + IT Admin)

**Member Registrar Profiles List** `/internal/registrar/profiles`  
Filter bar: Member Name · Number · Grade · Registrar Program · Commencement Date · Qualification  
Table columns: Member Name · Number · Grade · Registrar Program · Commencement Date · Qualification  
Export CSV · clickable rows → Profile Detail

**Member Registrar Profile Detail** `/internal/registrar/profiles/:id`  
Section A — Profile: Name · Number · Grade · Program · Commencement Date · Qualification · Edit button (IT Admin only)  
Section B — Supervisors: table with drill-down  
Section C — Places of Practice: table with drill-down  
Section D — Activities: table with drill-down  
**If Program status is not Open: entire screen is read-only, no edit buttons shown**  
Breadcrumb back to list

**All Registrar Activities List** `/internal/registrar/activities`  
Filter bar: Member Name · Number · Grade · Program · Activity Type · Supervision Type · Completion Date  
Table + Export CSV · clickable rows  
**Conditional columns:**  
- Supervisor/Practice → shows Supervisor name if type=Supervision, employer name if type=Practice, blank otherwise  
- Supervision Type → only shows a value if type=Supervision, blank otherwise

---

## 7. Business rules

- CPD Cycle status is always system-managed — read-only, labelled "System managed", never editable by user
- Date overlap on CPD Cycle form → inline error under date fields, save blocked
- Closed cycles support Edit and Reopen Cycle actions; Reopen returns the cycle to Open status
- Open Cycle, Close Cycle, and Reopen Cycle always require a ConfirmDialog before running
- A cycle can hold multiple queued open/close schedule entries (regardless of current status). Each schedule entry has an action (Open/Close), date/time, and status (Pending/Executed/Cancelled). Schedules are managed from the cycle detail page.
- Journal Entry Notes are hidden on all Internal User screens (both CPD and Registrar)
- Registrar Profile Detail is fully read-only when Program status ≠ Open
- Registrar Activities conditional columns — see Section D above
- Supervisors and Practice Locations are top-level catalogue entities; each can be assigned to zero or more Open programs. Assigning from the catalogue page pushes a copy into the target program's nested `supervisors` / `placesOfPractice` array. Editing a catalogue entry propagates core-field updates to every program that references it.
- Logging supervision sessions and practice hours is **merged into the catalogue pages**: each Supervisor / Practice Location detail page has Log session / Log hours buttons that open a modal scoped to that entity. The Registrar Program detail page also exposes per-row Log session / Log hours buttons inside its Supervisors and Places of Practice sections — when launched from there, the modal locks the program selection to the current program. There are no standalone `/log-supervision` or `/log-practice` routes.
- Unassigning a supervisor or location from a program removes it from the program's nested array but does NOT delete already-logged supervision or practice activities.
- Assign to Program dropdowns only list programs whose status is Open (Closed programs are not valid assignment targets). The Log session / Log hours modals further restrict the program list to programs already assigned to that supervisor / location.

---

## 8. Mock data

- 3–4 CPD cycles: one Pending, one Open, one Closed
- 2–3 Registrar Programs with different AoPEs
- 2–3 scheduled processes + 4–5 execution history entries (mix of Success, Partial, Failure)
- 8–10 member CPD profiles with activities
- 6–8 registrar candidates with supervisors, places of practice, and logged activities

---

## 9. Prototype conventions

- Login screen: two large role cards (IT Administrator, Internal User). Click to log in.
- GlobalNav: role pill showing current role + "Switch role" link back to /login
- Banner on login: "Prototype — for demonstration purposes only"
- All saves update local React state only — no API calls
- CSV export can be a no-op or generate a dummy file

---

## 10. Build order

1. Shared components (PageShell, SideNav x2, DataTable, StatusBadge, ConfirmDialog)
2. Login screen + role routing
3. Admin: CPD Cycle List + Create/Edit
4. Admin: Registrar Program List + Create/Edit
5. Admin: Schedule Process Manager
6. Internal: CPD Profiles List + Detail
7. Internal: All CPD Activities List
8. Internal: Registrar Profiles List + Detail
9. Internal: All Registrar Activities List
10. Final pass — nav links, dialogs, validations, read-only states, responsive layout

---

## 11. Visual design reference

No Figma exists for these screens. Build them to match the APS design system observed in the existing member Figma file: https://www.figma.com/design/kctljtUDqVZkv4Eadyx4us/CPD

Key values:
- APS brand blue: #185FA5
- Desktop content width: 856px centred
- Mobile width: 393px
- Panel padding: 24px
- Section gap: 24px
- TextField height: 56px
- Status: Pending = grey, Open = green, Closed = muted red
- No purple gradients, no neon. Clean, generous whitespace.
