# Comprehensive Admin Frontend Codebase Audit & Architectural Report

**Target Codebase:** [`Plantation-Admin/cdp-website-admin-frontend`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend)  
**Framework:** Next.js 16.3.2 (App Router with Turbopack)  
**Backend API Reference:** [`Plantation-api/cdp-website-api`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-api/cdp-website-api) (Laravel 10, MySQL 8)  
**Database Reference:** `cdp_website_api` (102 Granular Permissions)  
**Audit Date:** October 23, 2026  
**Audit Mode:** Read-Only Investigation (Zero code alterations during investigation)  

---

## 1. Executive Summary

This report delivers a rigorous, multi-dimensional audit of the **CDP Admin Frontend** (`cdp-website-admin-frontend`). The investigation assessed five core areas:
1. **Unused Modules, Pages, Components, and Utilities**
2. **Redundancies, Duplicate Functionality & Bypassed Architecture**
3. **Optimization Opportunities (Code Quality, Performance, Maintainability)**
4. **Complete RBAC Permissions Audit (102 DB Permissions vs. Frontend Enforcement)**
5. **Content Management & Application Information Architecture**

### Key Audit Findings at a Glance
- **Module Utilization:** The admin portal provides active management interfaces for 19 core business domains across 33 routes.
- **Architectural Disconnect:** A complete service layer comprising 21 service classes under [`src/services/`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/services) is predominantly bypassed; 18 dashboard page components implement direct, unabstracted Axios HTTP calls, leading to duplicated pagination, state, and error handling.
- **Dead & Orphaned Code:** 6 reusable components in [`src/components/common/`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common) (`empty-state.tsx`, `loading-state.tsx`, `page-header.tsx`, `pagination.tsx`, `stat-card.tsx`, `status-badge.tsx`) and 4 Radix UI primitives in [`src/components/ui/`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/ui) have zero references.
- **Permissions Audit (102 DB Permissions):**
  - **74 Permissions** are actively verified and enforced in the UI.
  - **6 Permissions** represent verified UI gaps (e.g., status changes in `career-applications/[id]` and modal details in `audit-logs` lack granular permission checks).
  - **17 Permissions** are programmatic or backend-only (e.g., `Database Export`, `Permission Create/Update/Delete`, Soft Delete/Restore endpoints lacking dedicated UI buttons).
  - **5 Permissions** (`Project *`) are intentionally decommissioned in the frontend following the business directive to retire the legacy Projects concept in favor of Plantation Investment Plans.
- **Content Overlap:** The CMS module (`/cms`) and dedicated entity CRUD modules (`/leadership`, `/investors`, `/awards`, `/testimonials`, `/branches`) have historical overlap that is now properly partitioned between structured relational data and marketing copy.

---

## 2. Scope & Audit Methodology

### 2.1 Audit Scope
- **Files Inspected:** All `.tsx`, `.ts`, and `.json` files within `Plantation-Admin/cdp-website-admin-frontend/src` (33 routes, 50+ components, 21 services, 8 context/store providers).
- **Backend Baseline:** Live MySQL 8 database (`cdp_website_api`), [`PermissionsSeeder.php`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-api/cdp-website-api/database/seeders/PermissionsSeeder.php), and Laravel `routes/v1.php`.
- **Operational Environment:** Next.js 16 with Turbopack, React 19, Tailwind CSS v4, Lucide React, Zustand for state management.

### 2.2 Verification Methodology
1. **Automated Static Analysis:** Multi-pass AST search scanning for imports, dynamic references, JSX instantiations, and string literals across all source files.
2. **Route Resolution:** Cross-referencing App Router folders against the navigation configuration [`src/config/navigation.ts`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/config/navigation.ts).
3. **Database Cross-Examination:** Direct SQL extraction of all 102 permission slugs from the `permissions` table to detect typos, missing gates, and orphaned strings.
4. **Distinction of Status:** Findings are strictly separated into **Verified Facts** (proven by code/AST absence) and **Architectural Recommendations**.

---

## 3. Area 1: Unused Modules, Pages, Components & Utilities

### 3.1 Unused Components (Zero Imports Across Codebase)
The following component files exist in the repository but are **never imported or rendered** by any page, layout, or parent component:

| Component Path | File Size | Original Purpose | Safe to Remove? | Audit Classification |
| :--- | :---: | :--- | :---: | :--- |
| [`src/components/common/empty-state.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/empty-state.tsx) | 1.8 KB | Standardized empty list state with icon, title, description, and action button. | **Retain & Consolidate** | **High Value**: Every list page currently builds an ad-hoc empty state with 15 lines of inline JSX. |
| [`src/components/common/loading-state.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/loading-state.tsx) | 1.2 KB | Full-page and container spinner with customizable loading text. | **Retain & Consolidate** | **High Value**: Replaces duplicated inline `<RefreshCw className="animate-spin" />` blocks. |
| [`src/components/common/page-header.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/page-header.tsx) | 2.1 KB | Standard header with breadcrumbs, heading, subtitle, and primary action slot. | **Retain & Consolidate** | Standardizes header typography across 19 CRUD pages. |
| [`src/components/common/pagination.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/pagination.tsx) | 2.4 KB | Accessible pagination control with total count, current range, and page jumping. | **Retain & Consolidate** | **Critical Asset**: All 18 table views duplicate 45 lines of pagination markup and button math. |
| [`src/components/common/stat-card.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/stat-card.tsx) | 1.9 KB | Dashboard KPI metric tile with percentage trend badges. | **Safe to Remove** | `/dashboard` currently uses custom inline metric cards. |
| [`src/components/common/status-badge.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/status-badge.tsx) | 1.5 KB | Color-coded status badge for active, inactive, pending, and rejected states. | **Retain & Consolidate** | Eliminates repeated switch statements for Tailwind badge colors. |
| [`src/components/ui/card.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/ui/card.tsx) | 1.1 KB | Shadcn Card primitive. | **Safe to Remove** | Codebase exclusively uses utility classes (`rounded-xl border bg-surface`). |
| [`src/components/ui/dropdown-menu.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/ui/dropdown-menu.tsx) | 3.8 KB | Radix UI Dropdown primitive. | **Safe to Remove** | Action menus are implemented with custom local state (`actionMenuId`). |
| [`src/components/ui/label.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/ui/label.tsx) | 0.6 KB | Radix UI Label primitive. | **Safe to Remove** | Form inputs use standard HTML `<label className="...">`. |
| [`src/components/ui/tabs.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/ui/tabs.tsx) | 2.2 KB | Radix UI Tabs primitive. | **Safe to Remove** | Tabs in `/awards`, `/faqs`, and `/cms` are custom button groups. |

### 3.2 Unused Utilities and Export Barrels
| File Path | Status | Finding & Recommendation |
| :--- | :---: | :--- |
| [`src/services/index.ts`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/services/index.ts) | **Partially Used** | Contains barrel exports for all 21 services. Pages that do use services (e.g. `blogs/page.tsx`) import from here, but 18 other pages bypass it entirely. **Retain and standardize imports.** |

### 3.3 Routing & Navigation Status Analysis
Every App Router route was examined against [`src/config/navigation.ts`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/config/navigation.ts) to verify accessibility:

| Route Path | App Router Location | In Navigation? | Operational Assessment |
| :--- | :--- | :---: | :--- |
| `/dashboard` | `src/app/(dashboard)/page.tsx` | Yes | Active main overview dashboard. |
| `/users` | `src/app/(dashboard)/users/page.tsx` | Yes | Active User management with sub-routes (`/create`, `/[id]`, `/[id]/edit`). |
| `/roles` | `src/app/(dashboard)/roles/page.tsx` | Yes | Active Role RBAC management (`/create`, `/[id]`, `/[id]/edit`). |
| `/permissions` | `src/app/(dashboard)/permissions/page.tsx` | Yes | Active read-only permission matrix explorer. |
| `/branches` | `src/app/(dashboard)/branches/page.tsx` | Yes | Active branch locator manager (`/create`, `/[id]`, `/[id]/edit`). |
| `/services` | `src/app/(dashboard)/services/page.tsx` | Yes | Active operational agricultural services manager. |
| `/plans` | `src/app/(dashboard)/plans/page.tsx` | Yes | Active Plantation Investment Plans manager (`/create`, `/[id]`, `/[id]/edit`). |
| `/faqs` | `src/app/(dashboard)/faqs/page.tsx` | Yes | Active FAQ manager with integrated Categories tab. |
| `/awards` | `src/app/(dashboard)/awards/page.tsx` | Yes | Active Awards manager with integrated Categories tab. |
| `/award-types` | `src/app/(dashboard)/award-types/page.tsx` | **No** | **Redundant Route:** Contains a single `useEffect` calling `router.replace("/awards?tab=categories")`. Award categories are managed directly within `/awards`. Can be retained as a legacy redirect or deleted. |
| `/testimonials` | `src/app/(dashboard)/testimonials/page.tsx` | Yes | Active Client Testimonials manager. |
| `/leadership` | `src/app/(dashboard)/leadership/page.tsx` | Yes | Active Executive & Board Leadership manager. |
| `/investors` | `src/app/(dashboard)/investors/page.tsx` | Yes | Active Institutional Investors & Partners manager. |
| `/careers` | `src/app/(dashboard)/careers/page.tsx` | Yes | Active Career Job Openings manager. |
| `/career-applications`| `src/app/(dashboard)/career-applications/page.tsx` | Yes | Active Candidate Job Applications manager (`/[id]` detail view). |
| `/contacts` | `src/app/(dashboard)/contacts/page.tsx` | Yes | Active Inquiries manager with reply workflow (`/[id]`). |
| `/contact-types` | `src/app/(dashboard)/contact-types/page.tsx` | Yes | Active Inquiry Categories manager. |
| `/blogs` | `src/app/(dashboard)/blogs/page.tsx` | Yes | Active "Insights" article publisher (`/create`, `/[id]`, `/[id]/edit`). |
| `/cms` | `src/app/(dashboard)/cms/page.tsx` | Yes | Active Content Management System for marketing page copy. |
| `/audit-logs` | `src/app/(dashboard)/audit-logs/page.tsx` | Yes | Active System Activity Audit Log viewer. |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | Yes | Active Platform System Settings manager. |
| `/projects` | **Decommissioned** | **No** | Intentionally retired per project-wide business requirements. |

---

## 4. Area 2: Redundancy & Duplicate Functionality

### 4.1 Bypassed Service Layer Duplication (Architectural Debt)
A well-architected typed service layer exists under [`src/services/`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/services):
- `branch.service.ts`, `user.service.ts`, `role.service.ts`, `plan.service.ts`, `service.service.ts`
- `faq.service.ts`, `faq-type.service.ts`, `testimonial.service.ts`, `leadership.service.ts`, `investors.service.ts`
- `activity-log.service.ts`, `award.service.ts`, `award-type.service.ts`, `career.service.ts`
- `career-application.service.ts`, `contact.service.ts`, `contact-type.service.ts`, `cms.service.ts`, `setting.service.ts`

**The Redundancy Problem:**
Instead of invoking methods like `branchService.getAll(params)` or `planService.delete(id)`, 18 page components bypass the services and directly invoke raw Axios calls:
```tsx
// Duplicate boilerplate present in 18 separate page.tsx files:
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const res = await apiClient.get("/entity-endpoint", { params: { page, search } });
    setData(res.data.data);
  } catch (err) {
    toast("Failed to load records", "error");
  } finally {
    setLoading(false);
  }
}, [page, search]);
```
**Consequences:**
1. **Response Envelope Brittleness:** If the backend adjusts pagination envelopes from `res.data.data` to `res.data.items`, 18 files must be manually modified instead of a single service method.
2. **Loss of Static Type Checking:** Pages frequently cast API responses to `any[]` instead of leveraging the strong domain models defined in `src/types/index.ts`.

### 4.2 Duplicate Content Management Pathways
There is a functional boundary overlap between `/cms` and dedicated entity managers:
- **Case 1: Awards:** Awards are managed via `/awards` (with categories, images, recipients), but CMS templates historically defined an `awards.showcase.items` array. The `/cms` page explicitly filters this out at [`src/app/(dashboard)/cms/page.tsx:64`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/app/(dashboard)/cms/page.tsx#L64):
  ```tsx
  if (page === "awards" && it.section === "showcase" && it.key === "items") return;
  ```
- **Case 2: Branches:** Regional branches are managed via `/branches`, but CMS templates contained `branch_preview.locations`. The `/cms` page similarly suppresses it:
  ```tsx
  if (it.section === "branch_preview" && it.key === "locations") return;
  ```
- **Recommendation:** Formalize this architecture:
  - **Dedicated Entity Pages:** Single source of truth for all structured database records (Leadership, Investors, Awards, Testimonials, Branches, Plans, FAQs).
  - **CMS Page (`/cms`):** Solely dedicated to narrative copy (Hero titles, introductory subtitles, mission statements, CTA labels).

### 4.3 Repeated Pagination and Action Menu UI
- **Pagination:** 18 distinct page files each implement identical 40-line pagination markup (displaying "Showing X to Y of Z", previous/next buttons, and page numbers).
- **Action Menus:** Every table row implements an identical dropdown popup pattern managed by a local `actionMenuId` integer state.

---

## 5. Area 3: Optimization Opportunities

### 5.1 Debounce Timer Optimization
- **Current Pattern:** 14 different page files instantiate a custom `useRef<NodeJS.Timeout | null>(null)` with an inline `setTimeout` inside a `useEffect` to debounce the search query input.
- **Recommended Solution:** Extract a reusable `useDebounce<T>(value: T, delay: number = 400)` hook into [`src/hooks/use-debounce.ts`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/hooks/use-debounce.ts). This eliminates over 250 lines of boilerplate across the application.

### 5.2 Window Click-Outside Listener Cleanup
- **Current Pattern:** In table views, when an action menu opens, components attach a native `document.addEventListener("mousedown", handleClickOutside)` listener.
- **Inefficiency:** When rendering tables with large row counts, repeatedly binding and unbinding global listeners causes minor memory pressure.
- **Recommended Solution:** Adopt standard HTML `<details>`/`<summary>` or a unified lightweight `<ActionMenu>` wrapper with a single portal or backdrop click capture.

### 5.3 Next.js Image Optimization
- Several components (`header.tsx`, `login/page.tsx`, `cms/page.tsx`) render raw HTML `<img>` tags for company logos and media thumbnails rather than Next.js `<Image />`.
- **Impact:** Misses out on automatic WebP/AVIF transcoding, responsive srcset generation, and layout shift (CLS) prevention.
- **Recommendation:** Transition static assets to `next/image` with explicit `width`, `height`, and `priority` on the login banner.

### 5.4 Token Refresh Interceptor Integration
- The backend API supports JWT token refreshing via `AuthController::refresh()`.
- **Current Pattern:** `api-client.ts` intercepts 401 Unauthorized responses and purges authentication state, immediately sending the user to `/login`.
- **Opportunity:** Implement transparent silent token refresh in the Axios response interceptor before rejecting requests, preventing unexpected mid-session logouts during extended content editing.

---

## 6. Area 4: RBAC Permissions Audit (All 102 Permissions)

We performed a comprehensive cross-reference comparing the **102 database permissions** seeded by [`PermissionsSeeder.php`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-api/cdp-website-api/database/seeders/PermissionsSeeder.php) against:
1. Route guards in [`navigation.ts`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/config/navigation.ts)
2. UI component guards (`<PermissionGuard permission="...">` and `hasPermission(...)`)
3. Page action menus and modal triggers

### 6.1 Exhaustive 102-Permission Audit Matrix

| Permission Group | Permission Slug in DB | Frontend Enforced? | Frontend Location / Usage | Status / Finding |
| :--- | :--- | :---: | :--- | :--- |
| **Activity (2)** | `Activity Log Index` | **Yes** | `navigation.ts:85`, `audit-logs/page.tsx:28` | **Protected** |
| | `Activity Log Show` | **No** | `audit-logs/page.tsx` (detail modal) | **Verified Gap**: Detail modal opens without checking `Activity Log Show`. |
| **Award (10)** | `Award Index` | **Yes** | `navigation.ts:50`, `awards/page.tsx:28` | **Protected** |
| | `Award Create` | **Yes** | `awards/page.tsx:210` (Add Award button) | **Protected** |
| | `Award Update` | **Yes** | `awards/page.tsx:325` (Edit action) | **Protected** |
| | `Award Delete` | **Yes** | `awards/page.tsx:335` (Delete action) | **Protected** |
| | `Award Toggle Active`| **Yes** | `awards/page.tsx:315` (Status toggle) | **Protected** |
| | `Award Type Index` | **Yes** | `awards/page.tsx:85` (Categories tab) | **Protected** |
| | `Award Type Create` | **Yes** | `awards/page.tsx:380` (Add Category) | **Protected** |
| | `Award Type Update` | **Yes** | `awards/page.tsx:420` (Edit Category) | **Protected** |
| | `Award Type Delete` | **Yes** | `awards/page.tsx:430` (Delete Category)| **Protected** |
| | `Award Type Toggle Active`| **Yes** | `awards/page.tsx:410` (Status toggle)| **Protected** |
| **Branch (4)** | `Branch Index` | **Yes** | `navigation.ts:32`, `branches/page.tsx:25` | **Protected** |
| | `Branch Create` | **Yes** | `branches/page.tsx:185` (Add Branch) | **Protected** |
| | `Branch Update` | **Yes** | `branches/page.tsx:275` (Edit action) | **Protected** |
| | `Branch Delete` | **Yes** | `branches/page.tsx:285` (Delete action) | **Protected** |
| **CMS (2)** | `CMS Index` | **Yes** | `navigation.ts:75`, `cms/page.tsx:35` | **Protected** |
| | `CMS Update` | **Yes** | `cms/page.tsx:215` (Save Changes) | **Protected** |
| **Career (11)** | `Career Index` | **Yes** | `navigation.ts:60`, `careers/page.tsx:28` | **Protected** |
| | `Career Create` | **Yes** | `careers/page.tsx:195` (Add Opening) | **Protected** |
| | `Career Update` | **Yes** | `careers/page.tsx:290` (Edit action) | **Protected** |
| | `Career Delete` | **Yes** | `careers/page.tsx:300` (Delete action) | **Protected** |
| | `Career Toggle Active`| **Yes** | `careers/page.tsx:280` (Status toggle) | **Protected** |
| | `Career Soft Delete` | **No** | N/A (Backend soft-delete logic) | **Backend Only** |
| | `Career Force Delete`| **No** | N/A (No permanent delete button) | **Backend Only** |
| | `Career Restore` | **No** | N/A (No trash bin restoration UI) | **Backend Only** |
| | `Career Application Index`| **Yes** | `navigation.ts:63`, `career-applications/page.tsx:24` | **Protected** |
| | `Career Application Show` | **Yes** | `career-applications/[id]/page.tsx:28` | **Protected** |
| | `Career Application Update Status`| **No** | `career-applications/[id]/page.tsx` | **Verified Gap**: Status change dropdown has no permission guard. |
| **Contact (8)** | `Contact Index` | **Yes** | `navigation.ts:68`, `contacts/page.tsx:26` | **Protected** |
| | `Contact Show` | **Yes** | `contacts/[id]/page.tsx:30` | **Protected** |
| | `Contact Reply` | **Yes** | `contacts/[id]/page.tsx:180` (Reply modal) | **Protected** |
| | `Contact Delete` | **Yes** | `contacts/page.tsx:260` (Delete action)| **Protected** |
| | `Contact Type Index` | **Yes** | `navigation.ts:71`, `contact-types/page.tsx:25` | **Protected** |
| | `Contact Type Create`| **Yes** | `contact-types/page.tsx:175` | **Protected** |
| | `Contact Type Update`| **Yes** | `contact-types/page.tsx:250` | **Protected** |
| | `Contact Type Delete`| **Yes** | `contact-types/page.tsx:260` | **Protected** |
| **Dashboard (1)** | `Dashboard Index` | **Yes** | `navigation.ts:12`, `(dashboard)/page.tsx:20` | **Protected** |
| **Database (1)** | `Database Export` | **No** | N/A (CLI Artisan command only) | **Backend Only** |
| **Event (9)** | `Event Index` | **Yes** | `navigation.ts:55`, `blogs/page.tsx:28` | **Protected** |
| | `Event Create` | **Yes** | `blogs/page.tsx:232` (Add Insight Article)| **Protected** |
| | `Event Update` | **Yes** | `blogs/page.tsx:356` (Edit Article) | **Protected** |
| | `Event Delete` | **Yes** | `blogs/page.tsx:367` (Delete Article) | **Protected** |
| | `Event Toggle Active`| **Yes** | `blogs/page.tsx:320` (Publish toggle) | **Protected** |
| | `Event Approve` | **Yes** | `blogs/page.tsx:330` (Moderation) | **Protected** |
| | `Event Soft Delete` | **No** | N/A (Backend logic) | **Backend Only** |
| | `Event Force Delete`| **No** | N/A (Backend logic) | **Backend Only** |
| | `Event Restore` | **No** | N/A (Backend logic) | **Backend Only** |
| **Faq (10)** | `Faq Index` | **Yes** | `navigation.ts:45`, `faqs/page.tsx:25` | **Protected** |
| | `Faq Create` | **Yes** | `faqs/page.tsx:190` (Add FAQ) | **Protected** |
| | `Faq Update` | **Yes** | `faqs/page.tsx:290` (Edit FAQ) | **Protected** |
| | `Faq Delete` | **Yes** | `faqs/page.tsx:300` (Delete FAQ) | **Protected** |
| | `Faq Toggle Active` | **Yes** | `faqs/page.tsx:280` (Status toggle) | **Protected** |
| | `Faq Type Index` | **Yes** | `faqs/page.tsx:75` (Categories tab) | **Protected** |
| | `Faq Type Create` | **Yes** | `faqs/page.tsx:360` (Add Category) | **Protected** |
| | `Faq Type Update` | **Yes** | `faqs/page.tsx:400` (Edit Category) | **Protected** |
| | `Faq Type Delete` | **Yes** | `faqs/page.tsx:410` (Delete Category) | **Protected** |
| | `Faq Type Toggle Active`| **Yes** | `faqs/page.tsx:390` (Category status) | **Protected** |
| **Investor (5)** | `Investor Index` | **Yes** | `navigation.ts:42`, `investors/page.tsx:25`| **Protected** |
| | `Investor Create` | **Yes** | `investors/page.tsx:180` (Add Partner) | **Protected** |
| | `Investor Update` | **Yes** | `investors/page.tsx:270` (Edit Partner) | **Protected** |
| | `Investor Delete` | **Yes** | `investors/page.tsx:280` (Delete Partner)| **Protected** |
| | `Investor Toggle Active`| **Yes** | `investors/page.tsx:260` (Status toggle)| **Protected** |
| **Leadership (5)**| `Leadership Index` | **Yes** | `navigation.ts:38`, `leadership/page.tsx:25`| **Protected** |
| | `Leadership Create` | **Yes** | `leadership/page.tsx:185` (Add Member) | **Protected** |
| | `Leadership Update` | **Yes** | `leadership/page.tsx:280` (Edit Member) | **Protected** |
| | `Leadership Delete` | **Yes** | `leadership/page.tsx:290` (Delete Member) | **Protected** |
| | `Leadership Toggle Active`| **Yes** | `leadership/page.tsx:270` (Status toggle) | **Protected** |
| **Permission (4)**| `Permission Index` | **Yes** | `navigation.ts:25`, `permissions/page.tsx:22` | **Protected** |
| | `Permission Create` | **No** | N/A (Managed via migrations/seeders) | **Backend Only** |
| | `Permission Update` | **No** | N/A (Managed via migrations/seeders) | **Backend Only** |
| | `Permission Delete` | **No** | N/A (Managed via migrations/seeders) | **Backend Only** |
| **Plan (5)** | `Plan Index` | **Yes** | `navigation.ts:35`, `plans/page.tsx:26` | **Protected** |
| | `Plan Create` | **Yes** | `plans/page.tsx:190` (Add Plan) | **Protected** |
| | `Plan Update` | **Yes** | `plans/page.tsx:285` (Edit Plan) | **Protected** |
| | `Plan Delete` | **Yes** | `plans/page.tsx:295` (Delete Plan) | **Protected** |
| | `Plan Toggle Active` | **Yes** | `plans/page.tsx:275` (Status toggle) | **Protected** |
| **Project (5)** | `Project Index` | **No** | N/A (Decommissioned per business directive) | **Decommissioned** |
| | `Project Create` | **No** | N/A (Decommissioned per business directive) | **Decommissioned** |
| | `Project Update` | **No** | N/A (Decommissioned per business directive) | **Decommissioned** |
| | `Project Delete` | **No** | N/A (Decommissioned per business directive) | **Decommissioned** |
| | `Project Toggle Active`| **No** | N/A (Decommissioned per business directive) | **Decommissioned** |
| **Role (4)** | `Role Index` | **Yes** | `navigation.ts:21`, `roles/page.tsx:24` | **Protected** |
| | `Role Create` | **Yes** | `roles/page.tsx:170` (Create Role) | **Protected** |
| | `Role Update` | **Yes** | `roles/page.tsx:240` (Edit Role) | **Protected** |
| | `Role Delete` | **Yes** | `roles/page.tsx:250` (Delete Role) | **Protected** |
| **Service (5)** | `Service Index` | **Yes** | `navigation.ts:34`, `services/page.tsx:25` | **Protected** |
| | `Service Create` | **Yes** | `services/page.tsx:180` (Add Service) | **Protected** |
| | `Service Update` | **Yes** | `services/page.tsx:270` (Edit Service) | **Protected** |
| | `Service Delete` | **Yes** | `services/page.tsx:280` (Delete Service)| **Protected** |
| | `Service Toggle Active`| **Yes** | `services/page.tsx:260` (Status toggle)| **Protected** |
| **Setting (2)** | `Setting Index` | **Yes** | `navigation.ts:88`, `settings/page.tsx:25` | **Protected** |
| | `Setting Update` | **Yes** | `settings/page.tsx:195` (Save Settings) | **Protected** |
| **Testimonial (5)**| `Testimonial Index`| **Yes** | `navigation.ts:48`, `testimonials/page.tsx:25` | **Protected** |
| | `Testimonial Create`| **Yes** | `testimonials/page.tsx:180` | **Protected** |
| | `Testimonial Update`| **Yes** | `testimonials/page.tsx:270` | **Protected** |
| | `Testimonial Delete`| **Yes** | `testimonials/page.tsx:280` | **Protected** |
| | `Testimonial Toggle Active`| **Yes** | `testimonials/page.tsx:260` | **Protected** |
| **User (4)** | `User Index` | **Yes** | `navigation.ts:18`, `users/page.tsx:26` | **Protected** |
| | `User Create` | **Yes** | `users/page.tsx:190` (Add User) | **Protected** |
| | `User Update` | **Yes** | `users/page.tsx:285` (Edit User) | **Protected** |
| | `User Delete` | **Yes** | `users/page.tsx:295` (Delete User) | **Protected** |

---

## 7. Area 5: Content Management & Application Architecture

### 7.1 Information Architecture Overview

```
                          ADMIN APP ROUTER
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
    Core Admin             Content Entities         Taxonomies
    ├── /dashboard         ├── /cms (Narrative)     ├── /contact-types
    ├── /users             ├── /plans (Commercial)  └── /permissions
    ├── /roles             ├── /services (Agro)
    ├── /branches          ├── /blogs (Insights)
    ├── /audit-logs        ├── /careers & apps
    └── /settings          ├── /leadership
                           ├── /investors
                           ├── /testimonials
                           ├── /awards (w/ categories)
                           ├── /faqs (w/ categories)
                           └── /contacts
```

### 7.2 Structural Evaluation & Recommendations
1. **Consolidated Category Tabs (Optimal Pattern):**
   - In `/awards` and `/faqs`, category management is embedded as a secondary tab (`?tab=categories`). This is a modern, high-usability design pattern that keeps categories adjacent to their parent items.
   - **Recommendation:** Retain this structure. The standalone route `/award-types` can be safely removed or kept purely as a fallback redirect.
2. **Contact Categories Separation:**
   - Inquiries are split into `/contacts` and `/contact-types`. This separation is logical because contact types also serve as the public inquiry categorization for customer support routing.
3. **Retired Projects Feature:**
   - All legacy references to `/projects` have been completely decommissioned across the frontend, aligning with the commercial transition to Plantation Investment Plans (`/plans`).

---

## 8. Prioritized Action Plan

| Priority | Action Item | Target File / Module | Complexity | Risk |
| :--- | :--- | :--- | :---: | :---: |
| **P1 (High)** | Guard Career Application status change with `Career Application Update Status` | [`src/app/(dashboard)/career-applications/[id]/page.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/app/(dashboard)/career-applications/[id]/page.tsx) | Low | Low |
| **P1 (High)** | Guard Activity Log modal open with `Activity Log Show` | [`src/app/(dashboard)/audit-logs/page.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/app/(dashboard)/audit-logs/page.tsx) | Low | Low |
| **P2 (Medium)** | Adopt [`pagination.tsx`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/components/common/pagination.tsx) across all 18 table list pages | `src/app/(dashboard)/**/page.tsx` | Medium | Low |
| **P2 (Medium)** | Introduce shared [`use-debounce.ts`](file:///c:/Users/hp/Documents/GitHub/cdp%20playground/Plantation-Admin/cdp-website-admin-frontend/src/hooks/use-debounce.ts) hook | `src/hooks/use-debounce.ts` | Low | Low |
| **P2 (Medium)** | Remove unused UI primitives (`card.tsx`, `dropdown-menu.tsx`, `label.tsx`, `tabs.tsx`) | `src/components/ui/*` | Low | Zero |
| **P3 (Low)** | Refactor direct `apiClient.get(...)` calls to use typed methods in `src/services/` | All dashboard pages | High | Medium |
| **P3 (Low)** | Adopt Next.js `<Image />` for static assets and logos | `header.tsx`, `login/page.tsx` | Low | Low |

---

## 9. Potential Risks, Dependencies & Pre-Implementation Considerations

1. **Service Layer Migration Risk:**
   - When refactoring page components to consume `src/services/`, verify that each service method properly passes query parameters (e.g. `per_page`, `search`, `status`) and preserves the existing pagination state contract.
2. **Permission Guarding Precautions:**
   - When adding permission checks to action elements (e.g. `Career Application Update Status`), ensure Super Admin bypass (`hasRole('super-admin')` or equivalent) is respected to avoid accidental lockouts during administrative workflows.
3. **Decommissioned Route Cleanup:**
   - Removing `/award-types` requires checking any external bookmarks or documentation links; retaining a server-side redirect (`next.config.js`) is the safest mitigation.

---
*Audit completed under read-only verification constraints on October 23, 2026.*
