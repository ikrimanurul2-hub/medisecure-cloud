import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api/api";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("medisecure_user"));
  } catch {
    return null;
  }
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("medisecure_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LandingPage() {
  return (
    <main className="landing">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h1>MediSecure Cloud</h1>
            <span>AI Health Monitoring Platform</span>
          </div>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="badge">Secure • Cloud-Native • AI Powered</div>
          <h2>Monitoring kesehatan berbasis AI dengan arsitektur cloud yang aman.</h2>
          <p>
            MediSecure Cloud membantu pengguna mencatat data kesehatan,
            mengunggah dokumen medis, mendapatkan analisis awal berbasis AI,
            dan menyediakan dashboard admin untuk audit log serta security alert.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">Mulai Sekarang</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Masuk Dashboard</Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="health-card-header">
            <span>AI Health Summary</span>
            <strong>Risk: Rendah</strong>
          </div>
          <div className="pulse-card">
            <div>
              <span>Blood Pressure</span>
              <strong>120/80</strong>
            </div>
            <div>
              <span>Temperature</span>
              <strong>37.2°C</strong>
            </div>
            <div>
              <span>Security</span>
              <strong>Protected</strong>
            </div>
          </div>
          <div className="mini-chart">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </section>

      <section className="features">
        <FeatureCard title="AI Health Assistant" text="Analisis awal data kesehatan menggunakan Gemini API." />
        <FeatureCard title="Secure by Design" text="JWT, password hashing, RBAC, validasi input, dan audit log." />
        <FeatureCard title="Cloud Ready" text="Siap untuk Docker, AWS EC2, GCP Storage, CDN, dan CI/CD." />
      </section>
    </main>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">●</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data.data;

      localStorage.setItem("medisecure_token", token);
      localStorage.setItem("medisecure_user", JSON.stringify(user));

      if (user.role_name === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login gagal.");
    }
  };

  return (
    <AuthLayout title="Masuk ke MediSecure Cloud" subtitle="Gunakan akun yang sudah terdaftar.">
      <form onSubmit={handleLogin} className="auth-form">
        {message && <div className="alert error">{message}</div>}

        <label>Email</label>
        <input
          type="email"
          placeholder="contoh@medisecure.local"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Masukkan password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button className="btn btn-primary full" type="submit">Login</button>

        <p className="auth-link">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 3,
  });
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Register gagal.");
    }
  };

  return (
    <AuthLayout title="Buat Akun Baru" subtitle="Daftar sebagai pasien untuk mulai monitoring kesehatan.">
      <form onSubmit={handleRegister} className="auth-form">
        {message && <div className="alert error">{message}</div>}

        <label>Nama Lengkap</label>
        <input
          placeholder="Nama pengguna"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="email@medisecure.local"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Minimal 8 karakter"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <label>No. Telepon</label>
        <input
          placeholder="081234567890"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <button className="btn btn-primary full" type="submit">Register</button>

        <p className="auth-link">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <Link to="/" className="back-home">← Kembali ke Home</Link>

      <section className="auth-card">
        <div className="auth-side">
          <div className="brand big">
            <div className="brand-icon">✚</div>
            <div>
              <h1>MediSecure</h1>
              <span>Secure Health Platform</span>
            </div>
          </div>
          <p>
            Sistem monitoring kesehatan dengan autentikasi aman, role-based access,
            audit log, dan integrasi AI.
          </p>
        </div>

        <div className="auth-content">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

function PatientDashboard() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser());
  const [records, setRecords] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    blood_pressure: "",
    blood_sugar: "",
    weight: "",
    height: "",
    body_temperature: "",
    symptoms: "",
    notes: "",
  });

  const logout = () => {
    localStorage.removeItem("medisecure_token");
    localStorage.removeItem("medisecure_user");
    navigate("/login");
  };

  const fetchRecords = async () => {
    const res = await api.get("/health-records/me");
    setRecords(res.data.data);
  };

  const fetchAiResults = async () => {
    const res = await api.get("/ai/results/me");
    setAiResults(res.data.data);
  };

  const fetchDocuments = async () => {
    const res = await api.get("/documents/me");
    setDocuments(res.data.data);
  };

  useEffect(() => {
    fetchRecords();
    fetchAiResults();
    fetchDocuments();
  }, []);

  const createRecord = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/health-records", {
        ...form,
        blood_sugar: Number(form.blood_sugar),
        weight: Number(form.weight),
        height: Number(form.height),
        body_temperature: Number(form.body_temperature),
      });

      setForm({
        blood_pressure: "",
        blood_sugar: "",
        weight: "",
        height: "",
        body_temperature: "",
        symptoms: "",
        notes: "",
      });

      await fetchRecords();
      setMessage("Data kesehatan berhasil disimpan.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Gagal menyimpan data kesehatan.");
    }
  };

  const analyzeRecord = async (recordId) => {
    setMessage("AI sedang menganalisis data kesehatan...");

    try {
      await api.post(`/ai/analyze/${recordId}`);
      await fetchAiResults();
      setMessage("Analisis AI berhasil dibuat.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Analisis AI gagal.");
    }
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedFile) {
      setMessage("Pilih file terlebih dahulu.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);
      await fetchDocuments();
      setMessage("Dokumen medis berhasil diunggah.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Gagal mengunggah dokumen.");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Patient Dashboard</span>
          <h2>Halo, {user?.name}</h2>
          <p>Kelola data kesehatan, dokumen medis, dan hasil analisis AI kamu.</p>
        </div>
      </div>

      {message && <div className="alert info">{message}</div>}

      <section className="stats-grid">
        <StatCard label="Total Health Records" value={records.length} />
        <StatCard label="AI Analysis Results" value={aiResults.length} />
        <StatCard label="Medical Documents" value={documents.length} />
      </section>

      <section className="content-grid">
        <div className="panel">
          <h3>Input Data Kesehatan</h3>

          <form onSubmit={createRecord} className="health-form">
            <div className="form-row">
              <input
                placeholder="Tekanan darah, contoh 120/80"
                value={form.blood_pressure}
                onChange={(e) => setForm({ ...form, blood_pressure: e.target.value })}
              />

              <input
                type="number"
                placeholder="Gula darah"
                value={form.blood_sugar}
                onChange={(e) => setForm({ ...form, blood_sugar: e.target.value })}
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                placeholder="Berat badan"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />

              <input
                type="number"
                placeholder="Tinggi badan"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>

            <input
              type="number"
              step="0.1"
              placeholder="Suhu tubuh"
              value={form.body_temperature}
              onChange={(e) => setForm({ ...form, body_temperature: e.target.value })}
            />

            <textarea
              placeholder="Gejala yang dirasakan"
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            ></textarea>

            <textarea
              placeholder="Catatan tambahan"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>

            <button className="btn btn-primary full" type="submit">
              Simpan Data Kesehatan
            </button>
          </form>
        </div>

        <div className="panel">
          <h3>Riwayat Data Kesehatan</h3>

          <div className="record-list">
            {records.length === 0 && (
              <p className="empty">Belum ada data kesehatan.</p>
            )}

            {records.map((record) => (
              <div className="record-item" key={record.id}>
                <div>
                  <strong>{record.blood_pressure || "-"}</strong>
                  <span>{record.symptoms || "Tidak ada gejala"}</span>
                </div>

                <button
                  className="btn btn-secondary small"
                  onClick={() => analyzeRecord(record.id)}
                >
                  Analisis AI
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>Upload Dokumen Medis</h3>
        <p className="empty">
          File yang diperbolehkan: PDF, PNG, JPG, dan JPEG. Maksimal ukuran file 5 MB.
        </p>

        <form onSubmit={uploadDocument} className="health-form">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          <button className="btn btn-primary full" type="submit">
            Upload Dokumen Medis
          </button>
        </form>

        <div className="record-list" style={{ marginTop: "16px" }}>
          {documents.length === 0 && (
            <p className="empty">Belum ada dokumen medis yang diunggah.</p>
          )}

          {documents.map((doc) => (
            <div className="record-item" key={doc.id}>
              <div>
                <strong>{doc.original_file_name}</strong>
                <span>
                  {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB • {doc.storage_provider}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Hasil Analisis AI</h3>

        <div className="ai-grid">
          {aiResults.length === 0 && (
            <p className="empty">Belum ada hasil analisis AI.</p>
          )}

          {aiResults.map((item) => (
            <div className="ai-card" key={item.id}>
              <span className={`risk ${item.risk_level?.toLowerCase()}`}>
                {item.risk_level}
              </span>

              <h4>Health Record #{item.health_record_id}</h4>
              <p>{item.analysis_result}</p>

              <div className="recommendation">
                <strong>Rekomendasi:</strong>
                <span>{item.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser());
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  const logout = () => {
    localStorage.removeItem("medisecure_token");
    localStorage.removeItem("medisecure_user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      const usersRes = await api.get("/admin/users");
      const logsRes = await api.get("/admin/logs");
      const alertsRes = await api.get("/admin/security-alerts");

      setUsers(usersRes.data.data);
      setLogs(logsRes.data.data);
      setAlerts(alertsRes.data.data);
    };

    fetchAdminData();
  }, []);

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h2>Security & User Monitoring</h2>
          <p>Monitoring pengguna, audit log, dan security alert.</p>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Activity Logs" value={logs.length} />
        <StatCard label="Security Alerts" value={alerts.length} />
      </section>

      <div className="tabs">
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
        <button className={activeTab === "logs" ? "active" : ""} onClick={() => setActiveTab("logs")}>Activity Logs</button>
        <button className={activeTab === "alerts" ? "active" : ""} onClick={() => setActiveTab("alerts")}>Security Alerts</button>
      </div>

      <section className="panel">
        {activeTab === "users" && (
          <DataTable
            columns={["Name", "Email", "Role", "Status"]}
            rows={users.map((u) => [u.name, u.email, u.role_name, u.status])}
          />
        )}

        {activeTab === "logs" && (
          <DataTable
            columns={["Activity", "Description", "Endpoint", "Status"]}
            rows={logs.map((l) => [l.activity, l.description, l.endpoint, l.status_code])}
          />
        )}

        {activeTab === "alerts" && (
          <DataTable
            columns={["Type", "Severity", "Endpoint", "Status"]}
            rows={alerts.map((a) => [a.alert_type, a.severity, a.endpoint, a.status])}
          />
        )}
      </section>
    </DashboardLayout>
  );
}

function DashboardLayout({ user, logout, children }) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h1>MediSecure</h1>
            <span>{user?.role_name || "user"}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Patient Dashboard</Link>
          {user?.role_name === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        </nav>

        <button className="btn btn-ghost full" onClick={logout}>Logout</button>
      </aside>

      <section className="main-content">
        {children}
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;