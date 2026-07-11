import React, { createContext, useContext, useState, useEffect } from 'react'
import "./index.css";

// ── API Context ────────────────────────────────────────────────────────────
const ApiContext = createContext()

const ApiProvider = ({ children }) => {
  const API_BASE = 'http://localhost:8080/api'

  const api = {
    // Appointments
    getAppointments: async (date) => {
      const res = await fetch(`${API_BASE}/appointments?date=${date}`)
      return res.json()
    },
    createAppointment: async (data) => {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    updateAppointment: async (id, data) => {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    cancelAppointment: async (id) => {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
      })
      return res.json()
    },

    // Shifts
    getShifts: async (week) => {
      const res = await fetch(`${API_BASE}/shifts?week=${week}`)
      return res.json()
    },
    createShift: async (data) => {
      const res = await fetch(`${API_BASE}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    deleteShift: async (id) => {
      const res = await fetch(`${API_BASE}/shifts/${id}`, {
        method: 'DELETE',
      })
      return res.json()
    },

    // Inventory
    getInventory: async () => {
      const res = await fetch(`${API_BASE}/inventory`)
      return res.json()
    },
    createInventoryItem: async (data) => {
      const res = await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    updateInventoryItem: async (id, data) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    deleteInventoryItem: async (id) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'DELETE',
      })
      return res.json()
    },

    // Feedback
    getFeedback: async (staffId = null) => {
      const res = await fetch(
        `${API_BASE}/feedback${staffId ? `?staff_id=${staffId}` : ''}`
      )
      return res.json()
    },
    getFeedbackStats: async () => {
      const res = await fetch(`${API_BASE}/feedback/stats`)
      return res.json()
    },
    createFeedback: async (data) => {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },

    // Staff
    getStaff: async () => {
      const res = await fetch(`${API_BASE}/staff`)
      return res.json()
    },
    createStaff: async (data) => {
      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    updateStaff: async (id, data) => {
      const res = await fetch(`${API_BASE}/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },

    // Services
    getServices: async () => {
      const res = await fetch(`${API_BASE}/staff/services`)
      return res.json()
    },
    createService: async (data) => {
      const res = await fetch(`${API_BASE}/staff/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
  }

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

const useApi = () => useContext(ApiContext)

// ── App State Context ──────────────────────────────────────────────────────
const AppStateContext = createContext()

const AppStateProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentPage,
        setCurrentPage,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

const useAppState = () => useContext(AppStateContext)

// ── Dashboard Component ────────────────────────────────────────────────────
const Dashboard = () => {
  const api = useApi()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    staffCount: 0,
    avgRating: 0,
    lowInventory: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const appts = await api.getAppointments(today)
        const staff = await api.getStaff()
        const feedback = await api.getFeedbackStats()
        const inventory = await api.getInventory()

        const lowInv = inventory.filter((item) => item.status !== 'ok').length
        const avgRating =
          feedback.length > 0
            ? (
                feedback.reduce((sum, f) => sum + parseFloat(f.avg_rating), 0) /
                feedback.length
              ).toFixed(1)
            : 0

        setStats({
          todayAppointments: appts.length,
          staffCount: staff.length,
          avgRating,
          lowInventory: lowInv,
        })
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      }
    }

    loadStats()
  }, [api])

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Appointments</div>
          <div className="stat-value">{stats.todayAppointments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Staff Members</div>
          <div className="stat-value">{stats.staffCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">
            {stats.avgRating}
            <span className="stat-unit">/5</span>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-label">Low Inventory</div>
          <div className="stat-value">{stats.lowInventory}</div>
        </div>
      </div>
    </div>
  )
}

// ── Appointments Component ─────────────────────────────────────────────────
const Appointments = () => {
  const api = useApi()
  const { setLoading, setError } = useAppState()
  const [appointments, setAppointments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    service_id: '',
    staff_id: '',
    appt_date: '',
    appt_time: '',
    notes: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const today = new Date().toISOString().slice(0, 10)
        const [appts, staffList, servicesList] = await Promise.all([
          api.getAppointments(today),
          api.getStaff(),
          api.getServices(),
        ])
        setAppointments(appts)
        setStaff(staffList)
        setServices(servicesList)
      } catch (err) {
        setError('Failed to load appointments')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [api, setLoading, setError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.createAppointment(formData)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        service_id: '',
        staff_id: '',
        appt_date: '',
        appt_time: '',
        notes: '',
      })
      setShowForm(false)
      const today = new Date().toISOString().slice(0, 10)
      const updated = await api.getAppointments(today)
      setAppointments(updated)
    } catch (err) {
      setError('Failed to create appointment')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await api.cancelAppointment(id)
      const today = new Date().toISOString().slice(0, 10)
      const updated = await api.getAppointments(today)
      setAppointments(updated)
    } catch (err) {
      setError('Failed to cancel appointment')
    }
  }

  return (
    <div className="appointments">
      <div className="section-header">
        <h1>Appointments</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Appointment'}
        </button>
      </div>

      {showForm && (
        <form className="appointment-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Client Information</legend>
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </fieldset>

          <fieldset>
            <legend>Appointment Details</legend>
            <select
              value={formData.service_id}
              onChange={(e) =>
                setFormData({ ...formData, service_id: e.target.value })
              }
              required
            >
              <option value="">Select Service</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} ({svc.duration} min - ${svc.price})
                </option>
              ))}
            </select>

            <select
              value={formData.staff_id}
              onChange={(e) =>
                setFormData({ ...formData, staff_id: e.target.value })
              }
              required
            >
              <option value="">Select Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.appt_date}
              onChange={(e) =>
                setFormData({ ...formData, appt_date: e.target.value })
              }
              required
            />

            <input
              type="time"
              value={formData.appt_time}
              onChange={(e) =>
                setFormData({ ...formData, appt_time: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </fieldset>

          <button type="submit" className="btn btn-primary">
            Create Appointment
          </button>
        </form>
      )}

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <p className="empty-state">No appointments scheduled for today</p>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className={`appointment-card status-${appt.status}`}>
              <div className="appointment-header">
                <div>
                  <h3>
                    {appt.client} • {appt.service}
                  </h3>
                  <p className="text-secondary">
                    {appt.staff} • {appt.appt_time} ({appt.duration_min} min)
                  </p>
                </div>
                <span className={`status-badge status-${appt.status}`}>
                  {appt.status}
                </span>
              </div>
              {appt.notes && <p className="appointment-notes">{appt.notes}</p>}
              <div className="appointment-actions">
                {appt.status !== 'cancelled' && (
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleCancel(appt.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Inventory Component ────────────────────────────────────────────────────
const Inventory = () => {
  const api = useApi()
  const { setLoading, setError } = useAppState()
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    unit: '',
    reorder_level: 5,
  })

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true)
        const inventory = await api.getInventory()
        setItems(inventory)
      } catch (err) {
        setError('Failed to load inventory')
      } finally {
        setLoading(false)
      }
    }

    loadInventory()
  }, [api, setLoading, setError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createInventoryItem(formData)
      setFormData({
        name: '',
        category: '',
        stock: 0,
        unit: '',
        reorder_level: 5,
      })
      setShowForm(false)
      const updated = await api.getInventory()
      setItems(updated)
    } catch (err) {
      setError('Failed to create item')
    }
  }

  const handleUpdateStock = async (id, newStock) => {
    try {
      await api.updateInventoryItem(id, { stock: newStock })
      const updated = await api.getInventory()
      setItems(updated)
    } catch (err) {
      setError('Failed to update stock')
    }
  }

  const categoryGroups = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="inventory">
      <div className="section-header">
        <h1>Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form className="form-compact" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: parseInt(e.target.value) })
            }
          />
          <input
            type="text"
            placeholder="Unit (e.g., ml, oz, count)"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Reorder Level"
            value={formData.reorder_level}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorder_level: parseInt(e.target.value),
              })
            }
          />
          <button type="submit" className="btn btn-primary">
            Add Item
          </button>
        </form>
      )}

      <div className="inventory-grid">
        {Object.entries(categoryGroups).map(([category, categoryItems]) => (
          <div key={category} className="category-section">
            <h2>{category}</h2>
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`inventory-item status-${item.status}`}
              >
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>
                    Stock: {item.stock} {item.unit} | Reorder at: {item.reorder_level}
                  </p>
                </div>
                <div className="item-controls">
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) =>
                      handleUpdateStock(item.id, parseInt(e.target.value))
                    }
                    style={{ width: '60px' }}
                  />
                  <span className={`status-badge status-${item.status}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Staff Component ────────────────────────────────────────────────────────
const Staff = () => {
  const api = useApi()
  const { setLoading, setError } = useAppState()
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [staffData, setStaffData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
  })
  const [serviceData, setServiceData] = useState({
    name: '',
    duration: 60,
    price: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [staffList, servicesList] = await Promise.all([
          api.getStaff(),
          api.getServices(),
        ])
        setStaff(staffList)
        setServices(servicesList)
      } catch (err) {
        setError('Failed to load staff')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [api, setLoading, setError])

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    try {
      await api.createStaff(staffData)
      setStaffData({ name: '', role: '', email: '', phone: '' })
      setShowStaffForm(false)
      const updated = await api.getStaff()
      setStaff(updated)
    } catch (err) {
      setError('Failed to create staff member')
    }
  }

  const handleCreateService = async (e) => {
    e.preventDefault()
    try {
      await api.createService(serviceData)
      setServiceData({ name: '', duration: 60, price: 0 })
      setShowServiceForm(false)
      const updated = await api.getServices()
      setServices(updated)
    } catch (err) {
      setError('Failed to create service')
    }
  }

  return (
    <div className="staff-page">
      <div className="two-column">
        <div className="column">
          <div className="section-header">
            <h1>Staff</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowStaffForm(!showStaffForm)}
            >
              {showStaffForm ? 'Cancel' : '+ Add Staff'}
            </button>
          </div>

          {showStaffForm && (
            <form className="form-compact" onSubmit={handleCreateStaff}>
              <input
                type="text"
                placeholder="Name"
                value={staffData.name}
                onChange={(e) =>
                  setStaffData({ ...staffData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={staffData.role}
                onChange={(e) =>
                  setStaffData({ ...staffData, role: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={staffData.email}
                onChange={(e) =>
                  setStaffData({ ...staffData, email: e.target.value })
                }
              />
              <input
                type="tel"
                placeholder="Phone"
                value={staffData.phone}
                onChange={(e) =>
                  setStaffData({ ...staffData, phone: e.target.value })
                }
              />
              <button type="submit" className="btn btn-primary">
                Add Staff
              </button>
            </form>
          )}

          <div className="list">
            {staff.map((s) => (
              <div key={s.id} className="list-item">
                <div>
                  <h3>{s.name}</h3>
                  <p className="text-secondary">{s.role}</p>
                  {s.email && <p className="text-secondary">{s.email}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="column">
          <div className="section-header">
            <h1>Services</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowServiceForm(!showServiceForm)}
            >
              {showServiceForm ? 'Cancel' : '+ Add Service'}
            </button>
          </div>

          {showServiceForm && (
            <form className="form-compact" onSubmit={handleCreateService}>
              <input
                type="text"
                placeholder="Service Name"
                value={serviceData.name}
                onChange={(e) =>
                  setServiceData({ ...serviceData, name: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={serviceData.duration}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    duration: parseInt(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={serviceData.price}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    price: parseFloat(e.target.value),
                  })
                }
              />
              <button type="submit" className="btn btn-primary">
                Add Service
              </button>
            </form>
          )}

          <div className="list">
            {services.map((svc) => (
              <div key={svc.id} className="list-item">
                <div>
                  <h3>{svc.name}</h3>
                  <p className="text-secondary">
                    {svc.duration} min • ${parseFloat(svc.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Feedback Component ────────────────────────────────────────────────────
const Feedback = () => {
  const api = useApi()
  const { setLoading, setError } = useAppState()
  const [feedback, setFeedback] = useState([])
  const [stats, setStats] = useState([])

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true)
        const [feedbackList, statsData] = await Promise.all([
          api.getFeedback(),
          api.getFeedbackStats(),
        ])
        setFeedback(feedbackList)
        setStats(statsData)
      } catch (err) {
        setError('Failed to load feedback')
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [api, setLoading, setError])

  return (
    <div className="feedback">
      <h1>Customer Feedback</h1>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.staff_id} className="feedback-stat">
            <div className="stat-header">
              <h3>{stat.staff}</h3>
              <span className="rating">
                {'★'.repeat(Math.round(parseFloat(stat.avg_rating)))}
                {'☆'.repeat(5 - Math.round(parseFloat(stat.avg_rating)))}
              </span>
            </div>
            <p>{parseFloat(stat.avg_rating).toFixed(1)}/5 avg rating</p>
            <p className="text-secondary">
              {stat.total} reviews • {stat.five_star} 5-star
            </p>
          </div>
        ))}
      </div>

      <div className="feedback-list">
        <h2>Recent Reviews</h2>
        {feedback.length === 0 ? (
          <p className="empty-state">No feedback yet</p>
        ) : (
          feedback.map((review) => (
            <div key={review.id} className="feedback-item">
              <div className="feedback-header">
                <div>
                  <h3>{review.client}</h3>
                  <p className="text-secondary">
                    {review.staff} • {review.service}
                  </p>
                </div>
                <span className="rating">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              {review.comment && <p className="feedback-comment">{review.comment}</p>}
              <p className="text-tertiary">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Main App Component ────────────────────────────────────────────────────
const ScapeOS = () => {
  const { currentPage, setCurrentPage, error } = useAppState()

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'appointments':
        return <Appointments />
      case 'inventory':
        return <Inventory />
      case 'staff':
        return <Staff />
      case 'feedback':
        return <Feedback />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">
          <h1>ScapeOS</h1>
          <p>Hospitality Ops</p>
        </div>
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'appointments' ? 'active' : ''}`}
              onClick={() => setCurrentPage('appointments')}
            >
              Appointments
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'staff' ? 'active' : ''}`}
              onClick={() => setCurrentPage('staff')}
            >
              Staff & Services
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'inventory' ? 'active' : ''}`}
              onClick={() => setCurrentPage('inventory')}
            >
              Inventory
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'feedback' ? 'active' : ''}`}
              onClick={() => setCurrentPage('feedback')}
            >
              Feedback
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}
        {renderPage()}
      </main>
    </div>
  )
}

// ── Root Render ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ApiProvider>
      <AppStateProvider>
        <ScapeOS />
      </AppStateProvider>
    </ApiProvider>
  )
}
