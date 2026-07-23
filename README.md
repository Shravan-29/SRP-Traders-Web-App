# SRP Traders -> E-Commerce Web Application (Build Based on User Specified Requirements)

Hardware & industrial tools platform serving professionals across Mumbai.
Built as a full-stack web application with a focus on real business workflows — from order management to delivery verification.

---

## What this project does

SRP Traders is an internal + customer-facing platform for a hardware shop in Chembur, Mumbai. It handles everything from product browsing and checkout to delivery staff coordination and invoice generation.

A few things that make it more than a typical CRUD app:

- **Admin approval flow** — new user registrations go through manual admin review before access is granted
- **Delivery portal** — delivery staff get a separate mobile-friendly interface; customers verify delivery with a 6-digit OTP
- **Digital invoices** — generated server-side and printable directly from the browser
- **Role-based access** — three distinct roles (Admin, Customer, Delivery Staff) with separate flows and permissions
- **Password reset via OTP** — email-based OTP flow, not just a link

---

## Tech

**Frontend** — React + Vite, Tailwind CSS, Redux Toolkit, React Router, Axios

**Backend** — Java 21, Spring Boot 3, Spring Security, JWT, Spring Data JPA

**Database** — PostgreSQL

**Payments** — Razorpay (test mode)

**Email** — JavaMail via Gmail SMTP

**Deployment** — Vercel (frontend), Railway (backend + database)

---

## Running locally

**Prerequisites:** Node.js 18+, Java 21, PostgreSQL

```bash
# Clone
git clone https://github.com/Shravan-29/SRP-Traders-Web-App.git
cd SRP-Traders-Web-App
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:5173
```

**Backend**

Create `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/srp_traders
spring.datasource.username=postgres
spring.datasource.password=your_password

app.jwt.secret=your_secret_key_min_32_chars
app.jwt.expiration=86400000

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.cors.allowed-origins=http://localhost:5173
```

```bash
cd backend
./mvnw spring-boot:run
# runs on http://localhost:8080
```

**Seed the database**

Run these in pgAdmin or any PostgreSQL client:

```sql
-- Admin user (password: your_chosen_password)
INSERT INTO users (full_name, email, password, mobile, address, role, status, created_at, updated_at)
VALUES ('Admin', 'admin@srptraders.in', '<bcrypt_hash>', '9876543210', 'Chembur, Mumbai', 'ADMIN', 'APPROVED', NOW(), NOW());

-- Categories
INSERT INTO categories (name, description, icon) VALUES
('Power Tools', 'Electric and battery powered tools', '⚡'),
('Hand Tools', 'Manual tools for all purposes', '🔧'),
('Safety Equipment', 'Personal protective equipment', '🦺'),
('Welding & Cutting', 'Welding machines and cutting tools', '🔥'),
('Plumbing', 'Pipes, fittings and plumbing tools', '🚿'),
('Electrical', 'Electrical tools and accessories', '💡');
```

---

## Project structure

Srp-traders/
├── frontend/ # React app
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ │ └── admin/
│ │ ├── redux/
│ │ └── services/
│ └── public/
└── backend/ # Spring Boot app
└── src/main/java/com/srptraders/backend/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── security/
├── config/
└── exception/

---

## Live

Frontend: https://srp-traders.vercel.app  
API: https://srp-traders-backend.railway.app