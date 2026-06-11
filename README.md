# MediSecure Cloud

**MediSecure Cloud** adalah website monitoring kesehatan berbasis Artificial Intelligence yang dikembangkan dengan pendekatan cloud computing, secure multi-cloud architecture, containerization, CI/CD, CDN, object storage, dan monitoring sistem.

Aplikasi ini memungkinkan pengguna untuk melakukan pencatatan data kesehatan, mengunggah dokumen medis, melihat dashboard kesehatan, serta mendapatkan analisis awal berbasis AI.

Projek ini dibuat oleh :
1. Ikrima Nurul Hikmah : 152023144
2. Rida Rahmaniah El Sya'Bani : 152023176
3. Sondang Anjelina Nadeak : 152023182

---

## 1. Deskripsi Project

MediSecure Cloud dibuat sebagai project tugas besar mata kuliah **IFB452 Komputasi Awan**. Sistem ini dirancang untuk menerapkan konsep cloud computing pada studi kasus website kesehatan.

Project ini menggunakan **AWS EC2** sebagai layanan compute utama, **Docker Compose** untuk menjalankan service aplikasi, **Supabase Storage** sebagai object storage, **Cloudflare** sebagai DNS/CDN, **GitHub Actions** untuk CI/CD, dan **AWS EC2 Monitoring/CloudWatch** untuk monitoring resource server.

---

## 2. Fitur Utama

Fitur utama pada MediSecure Cloud meliputi:

* Registrasi dan login pengguna
* Autentikasi menggunakan token
* Dashboard pasien
* Input data kesehatan
* Riwayat data kesehatan
* Upload dokumen medis
* Penyimpanan dokumen ke Supabase Storage
* Integrasi AI menggunakan Gemini API
* Metadata dokumen tersimpan pada database
* Deployment menggunakan Docker Compose
* CI/CD menggunakan GitHub Actions
* CDN menggunakan Cloudflare
* Monitoring menggunakan AWS EC2 Monitoring / CloudWatch

---

## 3. Teknologi yang Digunakan

### Frontend

* React / Vite
* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer untuk upload file
* Bcrypt untuk hashing password
* Dotenv untuk environment variable

### Database

* MySQL
* Laragon MySQL untuk development lokal
* MySQL container untuk deployment Docker

### Cloud dan Infrastruktur

* AWS EC2
* Docker
* Docker Compose
* Cloudflare DNS dan CDN
* Supabase Storage
* GitHub Actions
* AWS EC2 Monitoring / CloudWatch

### AI Service

* Gemini API

---

## 4. Arsitektur Sistem

Arsitektur MediSecure Cloud terdiri dari beberapa komponen utama:

1. Pengguna mengakses aplikasi melalui browser.
2. Request pengguna melewati Cloudflare sebagai DNS, HTTPS proxy, dan CDN.
3. Cloudflare meneruskan request ke AWS EC2 sebagai compute utama.
4. AWS EC2 menjalankan aplikasi menggunakan Docker Compose.
5. Docker Compose menjalankan tiga service utama:

   * Frontend
   * Backend API
   * MySQL Database
6. Backend terhubung dengan Supabase Storage untuk menyimpan dokumen medis.
7. Backend terhubung dengan Gemini API untuk fitur analisis AI.
8. GitHub Actions digunakan untuk proses deployment otomatis.
9. AWS EC2 Monitoring digunakan untuk memantau resource server.

Alur utama sistem:

```text
Pengguna
   ↓
Cloudflare DNS / CDN / Proxy
   ↓
AWS EC2
   ↓
Docker Compose
   ├── Frontend
   ├── Backend API
   └── MySQL Database
   ↓
Supabase Storage dan Gemini API
```

---

## 5. Struktur Project

Struktur repository MediSecure Cloud:

```text
medisecure-cloud/
├── frontend/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── server.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Konfigurasi Environment

Project ini menggunakan file `.env` untuk menyimpan konfigurasi environment.

Contoh variabel yang digunakan:

```env
APP_PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=medisecure_db

JWT_SECRET=your_jwt_secret

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=medical-documents

GEMINI_API_KEY=your_gemini_api_key
```

> Catatan:
> File `.env` tidak boleh di-push ke GitHub karena berisi data sensitif seperti API key, database password, JWT secret, dan service role key.

---

## 7. Cara Menjalankan Project Secara Lokal

### 1. Clone Repository

```bash
git clone https://github.com/ikrimanurul2-hub/medisecure-cloud.git
cd medisecure-cloud
```

### 2. Siapkan File Environment

Buat file `.env` berdasarkan `.env.example`, lalu sesuaikan konfigurasi database, Supabase, dan Gemini API.

```bash
cp .env.example .env
```

### 3. Jalankan Database Lokal

Untuk development lokal, database dapat dijalankan menggunakan Laragon MySQL.

Langkah:

1. Jalankan Laragon.
2. Aktifkan MySQL.
3. Buat database dengan nama `medisecure_db`.
4. Jalankan file `database/schema.sql`.
5. Jalankan file `database/seed.sql`.

### 4. Jalankan Backend

```bash
cd backend
npm install
npm run dev
```

### 5. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 8. Menjalankan Project dengan Docker Compose

Project ini dapat dijalankan menggunakan Docker Compose.

```bash
docker compose up -d
```

Untuk melihat container yang berjalan:

```bash
docker ps
```

Service utama yang berjalan:

```text
medisecure-frontend
medisecure-backend
medisecure-mysql
```

Frontend berjalan pada port:

```text
80
```

Backend berjalan pada port:

```text
5000
```

---

## 9. Deployment Cloud

Deployment dilakukan pada **AWS EC2**.

Komponen deployment:

| Komponen       | Implementasi                    |
| -------------- | ------------------------------- |
| Compute utama  | AWS EC2                         |
| Container      | Docker Compose                  |
| Frontend       | Container frontend port 80      |
| Backend        | Container backend port 5000     |
| Database       | MySQL container                 |
| Object Storage | Supabase Storage                |
| CDN            | Cloudflare                      |
| CI/CD          | GitHub Actions                  |
| Monitoring     | AWS EC2 Monitoring / CloudWatch |

Aplikasi dapat diakses melalui domain:

```text
https://medisecure.sondang.my.id
```

---

## 10. Cloudflare CDN

Cloudflare digunakan sebagai:

* DNS manager
* HTTPS proxy
* CDN untuk file statis frontend
* Lapisan depan sebelum request diteruskan ke AWS EC2

Validasi CDN dilakukan menggunakan response header pada file statis frontend.

Contoh command:

```bash
curl -I https://medisecure.sondang.my.id/assets/index-Bba0dkE3.css
```

Hasil yang diharapkan:

```text
Server: cloudflare
CF-Cache-Status: HIT
```

Status `HIT` menunjukkan bahwa file statis frontend telah dilayani melalui cache Cloudflare.

---

## 11. Object Storage

Object storage menggunakan **Supabase Storage**.

Supabase Storage digunakan untuk menyimpan dokumen medis yang diunggah oleh pengguna. File tidak disimpan langsung di database. Database hanya menyimpan metadata dokumen seperti:

* Nama file
* Tipe file
* Ukuran file
* Storage path
* User pemilik dokumen
* Waktu upload

Bucket yang digunakan:

```text
medical-documents
```

---

## 12. CI/CD GitHub Actions

CI/CD diimplementasikan menggunakan **GitHub Actions**.

Workflow berjalan ketika terdapat perubahan pada branch:

```text
main
```

Tahapan workflow:

1. Checkout repository
2. Validasi file project
3. Koneksi ke AWS EC2 menggunakan SSH
4. Pull source code terbaru
5. Build / update container
6. Menjalankan container aplikasi
7. Menampilkan status deployment

Secret yang digunakan pada GitHub Actions:

```text
EC2_HOST
EC2_USER
EC2_SSH_KEY
EC2_PROJECT_PATH
```

> Catatan:
> Isi secret tidak boleh ditampilkan atau dipublikasikan.

---

## 13. Monitoring

Monitoring sistem dilakukan menggunakan **AWS EC2 Monitoring / CloudWatch**.

Monitoring digunakan untuk melihat:

* CPU utilization
* Network in/out
* Disk activity
* Status check instance
* Kondisi resource server

Prometheus dan Grafana sempat dicoba sebagai monitoring tambahan. Namun, karena resource instance EC2 terbatas, monitoring utama yang digunakan pada dokumentasi adalah AWS EC2 Monitoring agar aplikasi tetap stabil.

---

## 14. Keamanan Sistem

Beberapa mekanisme keamanan yang diterapkan pada MediSecure Cloud:

* Password hashing menggunakan bcrypt
* Autentikasi menggunakan JWT
* Validasi input pada backend
* Validasi tipe dan ukuran file upload
* Environment variable untuk menyimpan konfigurasi sensitif
* Database tidak dibuka langsung ke publik
* Cloudflare digunakan sebagai proxy dan CDN
* Security Group AWS untuk membatasi akses port
* File dokumen diakses melalui backend dan object storage

---

## 15. Kendala dan Solusi

Beberapa kendala yang ditemukan selama implementasi:

### 1. Konfigurasi Supabase Storage

Kendala:
Upload dokumen sempat gagal karena konfigurasi key Supabase belum sesuai.

Solusi:
Menggunakan service role key yang valid dan memastikan environment variable Supabase terbaca oleh backend.

### 2. Resource EC2 Terbatas

Kendala:
Instance EC2 sempat berat ketika mencoba menjalankan monitoring tambahan seperti Grafana dan Prometheus.

Solusi:
EBS volume diperbesar dari 8 GiB menjadi 35 GiB, lalu service utama aplikasi dijalankan kembali.

### 3. Monitoring Grafana

Kendala:
Grafana dan Prometheus membutuhkan resource lebih besar.

Solusi:
Monitoring utama menggunakan AWS EC2 Monitoring / CloudWatch agar aplikasi tetap stabil.

---

## 16. Tim Pengembang

Project ini dikembangkan oleh:

| Nama                       | NIM       | Peran                               |
| -------------------------- | --------- | ----------------------------------- |
| Ikrima Nurul Hikmah        | 152023144 | Cloud, DevOps, Security, Deployment |
| Rida Rahmaniah El Sya’Bani | 152023176 | Backend, Database, Integrasi AI     |
| Sondang Anjelina Nadeak    | 152023182 | Frontend, UI/UX, Dokumentasi        |

---

## 17. Status Project

Status implementasi:

| Komponen             | Status                        |
| -------------------- | ----------------------------- |
| Frontend             | Selesai                       |
| Backend API          | Selesai                       |
| Database MySQL       | Selesai                       |
| Supabase Storage     | Selesai                       |
| AWS EC2 Deployment   | Selesai                       |
| Docker Compose       | Selesai                       |
| Cloudflare CDN       | Selesai                       |
| GitHub Actions CI/CD | Selesai                       |
| AWS Monitoring       | Selesai                       |
| Gemini API           | Pengujian / evaluasi lanjutan |

---

## 18. Catatan

Aplikasi ini dibuat untuk kebutuhan pembelajaran dan tugas besar Cloud Computing. Fitur AI pada sistem ini hanya digunakan sebagai analisis awal dan tidak menggantikan diagnosis dokter atau tenaga medis profesional.
