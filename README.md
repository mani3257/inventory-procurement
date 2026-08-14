****Chunk 1 — Title, links, overview, features*****
    # Inventory & Procurement Management System

A business operations platform for tracking stock across multiple warehouses, managing suppliers, and running a full purchase approval workflow — from low-stock detection through to goods received, with a permanent audit ledger for every stock movement.

**Live demo:** https://inventory-procurement-oxgviwrkg.vercel.app
**Backend API:** https://inventory-procurement.onrender.com
**Source code:** https://github.com/mani3257/inventory-procurement

> Note: the backend is on Render's free tier, which spins down after inactivity. The first request after idle may take 30–60 seconds to respond.

## Why this project

This is the second in a pair of MERN projects built to demonstrate real business-logic engineering, not CRUD scaffolding. Where Project 1 (IT Helpdesk) focused on support-desk workflow and SLA automation, this one focuses on inventory and procurement — a different domain with its own hard problems:

- **Multi-warehouse stock tracking**, where the same product independently exists at multiple locations
- **A full approval-gated procurement workflow**: low stock → request → approval → order → goods received → stock updated
- **An immutable stock ledger** — every unit movement is permanently logged and traceable
- **A separate, approval-gated external portal** for suppliers, with its own authentication scope distinct from internal staff

## Features

**Inventory**
- Products tracked per-warehouse (same SKU can exist independently across locations)
- Automatic low-stock detection using a database-level field comparison (`$expr`)
- Multi-warehouse stock transfers — moving stock between locations updates both sides and logs both as separate ledger entries
- Full stock movement ledger per product (purchases, transfers, returns, damage)
- Create and edit products, with minimum-stock threshold and category management

**Procurement workflow**
- Purchase requests raised by warehouse staff
- Approval gate — requests must be approved before an order can be created
- Purchase orders tied to a specific approved request and supplier
- Receiving an order atomically updates stock and logs the movement
- Status filtering (Pending/Approved/Rejected, Ordered/Received) with live counts

**Supplier Portal**
- Suppliers self-register, but access is gated behind admin approval — prevents anyone claiming to be a real vendor without verification
- Separate JWT auth scope (`type: 'supplier'`) entirely distinct from staff authentication
- Read-only dashboard showing only that supplier's own purchase orders
- Dedicated admin screen to review and approve pending supplier accounts

**Access control & user management**
- Three internal roles: Admin, Warehouse Manager, Procurement Manager — each with distinct permissions enforced on the backend
- Admin-only Team page listing all staff
- Every user has a profile page to update their own name/password
- Editable master data (products, warehouses, suppliers) — but transactional records (orders, requests, ledger entries) are intentionally immutable once created, corrected only via new entries, never edited in place

*********Chunk 2 — Tech stack + architecture decisions*********
## Tech stack

**Frontend:** React (Vite), React Router, Tailwind CSS v4, Axios
**Backend:** Node.js, Express, MongoDB (Atlas) with Mongoose
**Auth:** JWT (two separate scopes — staff and supplier), bcrypt
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Architecture decisions

**Why is Supplier a separate collection with its own auth, instead of a `role` on `User`?**
A `User` represents internal staff who need fields like `department`; a `Supplier` is an external vendor record needing `address` and `contactPhone`. Merging them would force every schema and query to account for "unless this user is actually a supplier." Keeping them separate collections — with a distinct JWT `type` field distinguishing supplier tokens from staff tokens — keeps both concerns clean and makes the trust boundary between "internal staff" and "external vendor" explicit at the authentication layer, not just in application logic.

**Why does supplier self-registration require admin approval before login works?**
Allowing instant self-registration would let anyone claim to be an existing vendor (e.g., register as "Dell Distributors" with no verification) and potentially see purchase order data tied to a relationship they have nothing to do with. The fix isn't blocking self-registration — it's gating *access* behind human verification, the same pattern real B2B vendor portals use.

**Why is the product uniqueness constraint `{sku, warehouse}` instead of `sku` alone?**
The business requirement is that the same product can be tracked independently at multiple locations (Hyderabad and Chennai can each stock "KB-1021" with separate counts). A naive unique-SKU constraint breaks this; the compound index enforces uniqueness at the correct granularity, at the database level rather than relying solely on application logic to prevent duplicates.

**Why are Purchase Orders and Purchase Requests not editable after creation?**
Once a transaction has happened (an order was placed, a request was approved), editing it after the fact would make the audit trail meaningless — anyone could quietly rewrite history. Real inventory and finance systems handle mistakes via new correcting entries (e.g., a `DAMAGE` stock movement), never by mutating the original record. Editable fields are limited to non-transactional master data: product names, warehouse locations, supplier contact info.

**Why is `isLowStock` computed on read instead of stored as a field?**
It's fully derivable from `currentStock` and `minimumStock` at any moment. Storing it risks staleness if stock changes without the flag being updated; computing it via MongoDB's `$expr` operator pushes the comparison to the database query itself rather than filtering in application code after fetching everything.

**Why is there a service layer (`src/services/`) on the frontend?**
Pages never call `axios` directly — they call functions like `productService.getProducts()`. This means the UI layer has no knowledge of HTTP, headers, or endpoints; if the API changes, only the service file changes, not every page that uses it. It also makes the codebase easier to reason about and test in isolation.

******Chunk 3 — Full project structure*******

## Project structure

```
inventory-procurement/
├── server/
│   ├── config/
│   │   └── db.js                        # MongoDB connection
│   ├── models/
│   │   ├── User.js                      # Staff accounts (admin, warehouse_manager, procurement_manager)
│   │   ├── Supplier.js                  # Vendor records + optional portal login credentials
│   │   ├── Warehouse.js
│   │   ├── Product.js                   # Per-warehouse stock record (compound unique index: sku + warehouse)
│   │   ├── PurchaseRequest.js
│   │   ├── PurchaseOrder.js
│   │   └── StockMovement.js             # Append-only ledger
│   ├── controllers/
│   │   ├── authController.js            # Staff register/login
│   │   ├── userController.js            # Profile, admin user list
│   │   ├── supplierController.js        # Supplier CRUD (admin/procurement)
│   │   ├── supplierAuthController.js    # Supplier self-register, login, admin approval
│   │   ├── supplierPortalController.js  # Supplier's own read-only data
│   │   ├── warehouseController.js
│   │   ├── productController.js         # CRUD + low-stock detection
│   │   ├── purchaseRequestController.js
│   │   ├── purchaseOrderController.js   # Includes receive-order stock update logic
│   │   └── stockController.js           # Transfers + ledger queries
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── supplierAuthRoutes.js
│   │   ├── warehouseRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseRequestRoutes.js
│   │   ├── purchaseOrderRoutes.js
│   │   └── stockRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js            # protect() — verifies staff JWT
│   │   ├── supplierAuthMiddleware.js    # protectSupplier() — verifies supplier JWT (separate scope)
│   │   ├── roleMiddleware.js            # authorize(...roles)
│   │   └── errorHandler.js              # Centralized error handling + 404
│   ├── utils/
│   │   └── asyncHandler.js              # Wraps controllers, forwards errors to errorHandler
│   └── server.js
│
└── client/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js                 # Staff-authenticated axios instance
    │   │   └── supplierAxios.js         # Supplier-authenticated axios instance (separate token)
    │   ├── services/                    # One file per resource, wraps all API calls
    │   │   ├── authService.js
    │   │   ├── userService.js
    │   │   ├── supplierService.js
    │   │   ├── supplierAuthService.js
    │   │   ├── warehouseService.js
    │   │   ├── productService.js
    │   │   ├── purchaseRequestService.js
    │   │   ├── purchaseOrderService.js
    │   │   └── stockService.js
    │   ├── context/
    │   │   └── AuthContext.jsx          # Staff auth state (global)
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── ui/                      # Reusable primitives
    │   │       ├── Button.jsx
    │   │       ├── Input.jsx
    │   │       ├── Card.jsx
    │   │       └── Badge.jsx
    │   ├── pages/
    │   │   ├── Login.jsx / Register.jsx           # Staff auth
    │   │   ├── SupplierLogin.jsx / SupplierRegister.jsx  # Supplier auth (separate flow)
    │   │   ├── SupplierDashboard.jsx               # Supplier's own portal
    │   │   ├── Dashboard.jsx                       # Staff app shell + nested routes
    │   │   ├── Products.jsx                        # Create/edit/transfer/ledger
    │   │   ├── Warehouses.jsx
    │   │   ├── Suppliers.jsx
    │   │   ├── PurchaseRequests.jsx
    │   │   ├── PurchaseOrders.jsx
    │   │   ├── SupplierApprovals.jsx               # Admin approves pending suppliers
    │   │   ├── Team.jsx                            # Admin views all staff
    │   │   └── Profile.jsx
    │   ├── App.jsx                                 # Routing, both staff and supplier trees
    │   └── main.jsx
    └── vite.config.js
```

*****Chunk 4 — Full API reference*****

## API Reference

Base URL (local): `http://localhost:5001/api`
Base URL (production): `https://inventory-procurement.onrender.com/api`

All protected routes require `Authorization: Bearer <token>`.

### Staff Auth — `/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as Warehouse Manager or Procurement Manager |
| POST | `/auth/login` | Public | Staff login, returns JWT |

### Users — `/users`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all staff users |
| GET | `/users/me` | Any authenticated staff | Get own profile |
| PATCH | `/users/me` | Any authenticated staff | Update own name/password |

### Warehouses — `/warehouses`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/warehouses` | Admin | Create a warehouse |
| GET | `/warehouses` | Any authenticated staff | List all warehouses |
| PATCH | `/warehouses/:id` | Admin | Edit name/location |

### Suppliers (internal management) — `/suppliers`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/suppliers` | Admin, Procurement Manager | Create a supplier record |
| GET | `/suppliers` | Any authenticated staff | List all suppliers |
| PATCH | `/suppliers/:id` | Admin, Procurement Manager | Edit contact info |

### Supplier Auth & Portal — `/supplier-auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/supplier-auth/register` | Public | Supplier self-registers (starts unapproved) |
| POST | `/supplier-auth/login` | Public | Supplier login — blocked until approved |
| GET | `/supplier-auth/pending` | Admin (staff token) | List suppliers awaiting approval |
| PATCH | `/supplier-auth/:id/approve` | Admin (staff token) | Approve a supplier's portal access |
| GET | `/supplier-auth/me` | Supplier (supplier token) | Get own supplier profile |
| GET | `/supplier-auth/my-orders` | Supplier (supplier token) | List own purchase orders, read-only |

### Products — `/products`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/products` | Admin | Create a product at a warehouse |
| GET | `/products` | Any authenticated staff | List all products, each with computed `isLowStock` |
| GET | `/products/low-stock` | Any authenticated staff | List only products below minimum stock |
| GET | `/products/:id` | Any authenticated staff | Get one product |
| PATCH | `/products/:id` | Admin | Edit name, category, minimum stock |

### Purchase Requests — `/purchase-requests`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/purchase-requests` | Admin, Warehouse Manager | Raise a request for a product |
| GET | `/purchase-requests` | Any authenticated staff | List all requests |
| PATCH | `/purchase-requests/:id/review` | Admin, Procurement Manager | Approve or reject a pending request |

### Purchase Orders — `/purchase-orders`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/purchase-orders` | Admin, Procurement Manager | Create an order from an approved request |
| GET | `/purchase-orders` | Any authenticated staff | List all orders |
| PATCH | `/purchase-orders/:id/receive` | Admin, Warehouse Manager | Mark received — updates stock, logs a PURCHASE movement |

### Stock — `/stock`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/stock/transfer` | Admin, Warehouse Manager | Transfer stock between warehouses (creates destination product record if needed) |
| GET | `/stock/ledger/:productId` | Any authenticated staff | Full movement history for a product |

 *****Chunk 5 — Roles, local setup, future work, screenshots placeholder*****
 ## Roles

| Role | Can do |
|---|---|
| Warehouse Manager | Create products, raise purchase requests, transfer stock, receive orders, view own tickets |
| Procurement Manager | Manage suppliers, approve/reject purchase requests, create purchase orders |
| Admin | Full access — everything above, plus user management and supplier approval |
| Supplier (external) | Read-only view of their own purchase orders, via a separate portal — no write access anywhere |

## Running locally

**Backend:**
```bash
cd server
npm install
# create a .env file:
# MONGO_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_secret
# PORT=5001
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:5001` automatically — no extra config needed for local development.

## Planned hardening (future work)

This project currently prioritizes demonstrating clean architecture and correct business logic over production-scale concerns. Known gaps to close before this would be genuinely production-ready:

- Automated tests (unit + integration)
- Pagination on list endpoints
- MongoDB transactions for multi-step writes (e.g., receiving an order currently updates two documents non-atomically)
- Rate limiting and stricter input sanitization
- Real notifications (email) instead of in-app messages only
- Structured logging and monitoring
- CI/CD pipeline

## Screenshots

*(Add screenshots here: login, products dashboard with low-stock badges, purchase request approval flow, supplier portal dashboard)*