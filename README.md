# Zephyr 

An online marketplace backend where vendors sell products to customers. The product schema is general, so any kind of product can be listed.

Built with Node.js, Express and MongoDB. Payments run through Paystack (test mode).

## How it works

1. A user registers as a **customer** or a **vendor**.
2. A new vendor starts as **unverified** and adds a business name and description to their profile.
3. An **admin** lists vendors, opens each one's details, and either verifies or rejects them.
4. **Verified vendors** can create, update and delete their own products.
5. Any logged-in user can browse products. Products with no stock are hidden from the product list.
6. Customers manage a cart: add items, deduct a quantity, remove an item, or delete the whole cart. A user has one cart at a time.
7. **Checkout** turns the cart into an order. A user can have many orders.
8. The customer pays through Paystack. Paystack then tells the server the payment succeeded, and the order is marked as paid.
9. Vendors pack their part of the order, an admin ships and delivers it, and the customer confirms receipt.

### Order lifecycle

```
pending_payment -> paid -> processing -> shipped -> delivered -> completed
                     \
                      cancelled (customer cancels before the order ships)
```

- Each order only moves forward through allowed statuses. Every status change checks the order's current status first, so an order can't skip steps or move twice.
- An order can contain items from several vendors. Each vendor has their own `packed` flag on the order. The order becomes `processing` when a vendor packs their part, and an admin can only ship it once every vendor has packed.
- Cancelling an order restores the stock of its items.

## Tech stack

- **Node.js** and **Express**
- **MongoDB** with **Mongoose**
- **Paystack** for payments (test mode), called with **Axios**
- **AWS S3** for product images
- **express-validator** for input validation
- **helmet**, **cors**, **morgan** and **express-rate-limit** for security and logging
- **ngrok** to receive Paystack webhooks while developing locally

## Getting started

```bash
git clone https://github.com/usmansalifu34-pixel/sustainability-marketplace.git
cd sustainability-marketplace
npm install
```

Create a `.env` file in the project root. The values are secret, so never commit this file.

```
mongo_uri=
jwt_secret=
jwt_lifetime=
PAYSTACK_TESTKEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Start the server:

```bash
npm start
```

The server listens on port 3000.

### Testing payments locally

Paystack has to reach your server to send the webhook, so expose it with ngrok:

```bash
ngrok http 3000
```

Copy the HTTPS URL ngrok gives you and set it as the webhook URL in your Paystack test-mode dashboard, ending in `/market/v1/payment/webhook`. Free ngrok URLs change every time you restart ngrok, so update the dashboard each time.

## API overview

All routes start with `/market/v1` and each group below is mounted under its own prefix. Every route except register, login and the Paystack webhook requires a bearer token.

### Auth (`/auth`)

| Route | Who | What it does |
|---|---|---|
| `POST /register` | anyone | Create an account as a customer or a vendor |
| `POST /login` | anyone | Sign in and receive a token |

### Vendor (`/vendor`)

| Route | What it does |
|---|---|
| `POST /profile` | Update business name and description |
| `GET /profile` | View your profile |
| `GET /orders` | List paid orders that include your products |
| `PATCH /orders/process/:orderId` | Mark your part of an order as packed |

### Products (`/products`)

| Route | Who | What it does |
|---|---|---|
| `GET /` | any logged-in user | Browse products (out-of-stock products are hidden), with search and filters |
| `POST /` | verified vendor | Create a product, with an image upload |
| `GET /:id` | any logged-in user | View one product |
| `PATCH /:id` | vendor | Update a product |
| `DELETE /:id` | vendor | Delete a product |

### Cart (`/cart`)

| Route | What it does |
|---|---|
| `POST /` | Add a product to the cart |
| `GET /` | View your cart |
| `DELETE /` | Delete the whole cart |
| `PATCH /:productId` | Deduct a quantity of a product |
| `DELETE /:productId` | Remove a product from the cart |
| `POST /checkout` | Turn the cart into an order (needs an idempotency key header) |

### Orders (`/orders`)

| Route | What it does |
|---|---|
| `GET /` | List your orders |
| `GET /:orderId` | View one order |
| `PATCH /:orderId/confirm` | Confirm receipt (`delivered` to `completed`) |
| `PATCH /:orderId/cancel` | Cancel an order before it ships |

### Payment (`/payment`)

| Route | What it does |
|---|---|
| `POST /initialize/:orderId` | Start a Paystack payment for an order |
| `PATCH /verify/:reference` | Check a payment's reference with Paystack |
| `POST /webhook` | Receives payment events from Paystack |

### Admin (`/admin`)

| Route | What it does |
|---|---|
| `GET /vendors` | List vendors |
| `GET /vendors/:vendorId` | View one vendor's details |
| `PATCH /vendors/verify/:vendorId` | Verify a vendor |
| `PATCH /orders/ship/:orderId` | Ship an order (every vendor must have packed) |
| `PATCH /orders/delivered/:orderId` | Mark an order as delivered |

## Payments

1. **Initialize.** The server calls Paystack's API with Axios, and Paystack returns a reference and a payment URL. Both are saved on the order. If the order is already waiting for payment and has a link, the same link is returned, so no duplicate payments are started. An order that isn't `pending_payment` is refused.
2. **Webhook.** Paystack sends a request to `/payment/webhook` when a payment succeeds. The server checks the request's signature against a hash of the body using the secret key, so only real Paystack requests are accepted. Because the hash is computed over the exact raw bytes, this route reads the raw body and is registered before `express.json()`.
3. **Marking as paid.** On a `charge.success` event, the order with that reference becomes `paid`, but only if it is currently `pending_payment`. A repeated event for an order already handled gets a 200 response and changes nothing.

## Design decisions

- **Checkout is a database transaction.** Stock deduction, order creation and clearing the cart all succeed or all fail together.
- **Stock is deducted atomically.** Each product's stock is checked and reduced in a single query, so two checkouts can't both take the last item.
- **Idempotency key.** Checkout expects an `idempotencykey` header, so a retried request can't create a duplicate order.
- **Status transitions are guarded in the query.** The allowed starting status is part of each update's filter, so a wrong-status request changes nothing.
- **Cancelled orders are kept, not deleted.** The status is the record that the order existed.

## Known limitations

- The stock check when adding to the cart is only a warning. Stock is actually reserved at checkout.
- If a vendor deletes a product that is sitting in someone's cart, checkout for that cart fails.
- Vendor payouts and refunds are not implemented. A customer who pays for an order after cancelling it would need a manual refund.
- Cancelling restores stock, but the cancel and the stock restore are not wrapped in a single transaction.
- Customers can cancel an order only before it ships (`pending_payment`, `payment_failed`, `paid` or `processing`). Once a vendor has packed their part, the cancel still goes through.
- Routes were tested manually with Postman, and there is no automated test suite yet.
- No email notifications and no frontend.