# Backend IPgrade

Backend lokal untuk IPgrade memakai Node.js, Express, SQLite, bcrypt, JWT, dotenv, cors, dan nodemon.

## Menjalankan

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Server berjalan di:

```text
http://localhost:3000
```

Base API:

```text
http://localhost:3000/api
```

Health check:

```http
GET /api/health
```

Response:

```json
{ "status": "ok" }
```

## Endpoint

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Kelas:

- `GET /api/classes`
- `POST /api/classes`
- `PUT /api/classes/:id`
- `DELETE /api/classes/:id`
- `PATCH /api/classes/:id/extend-time`
- `PATCH /api/classes/:id/reset-time`
- `PUT /api/classes/sync` untuk sinkronisasi bertahap dari struktur frontend lama ke database SQLite.

Mahasiswa:

- `GET /api/students?class_id=`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

Semester:

- `GET /api/semesters?student_id=`
- `POST /api/semesters`
- `PUT /api/semesters/:id`
- `DELETE /api/semesters/:id`

Mata kuliah:

- `GET /api/courses?semester_id=`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

Hasil:

- `POST /api/results/calculate`
- `GET /api/results?student_id=`
- `GET /api/results/summary?student_id=`

## Catatan Data

- Password selalu disimpan sebagai `password_hash` bcrypt.
- JWT dikirim melalui header `Authorization: Bearer <token>`.
- Semua tabel akademik memiliki `user_id`, sehingga user hanya bisa mengakses datanya sendiri.
- File database lokal dibuat di `backend/database/ipgrade.sqlite`.
