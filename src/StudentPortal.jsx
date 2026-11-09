
import { useEffect, useState } from 'react'

import {
  getStudentDashboard,
  getMyMeals,
  getMyPayments,
  getMyComplaints,
  getWeeklyMenu,
  addFeedback,
} from './services/api'

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
]

const SECTIONS = [
  { name: 'Dashboard', icon: '▦' },
  { name: 'Mess Menu', icon: '◫' },
  { name: 'My Meals', icon: '◷' },
  { name: 'My Payments', icon: '₹' },
  { name: 'Feedback', icon: '✉' },
  { name: 'Contact Admins', icon: '☎' },
  { name: 'My Profile', icon: '♙' },
]

const card = {
  background: '#fff',
  borderRadius: 18,
  padding: 24,
  border: '1px solid #e5eee7',
  color: '#193c2c',
}

const button = {
  padding: '11px 17px',
  border: 'none',
  borderRadius: 10,
  background: '#195b46',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}

const inputStyle = {
  width: '100%',
  padding: 12,
  border: '1px solid #dce7de',
  borderRadius: 10,
  font: 'inherit',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#193c2c',
}

const muted = {
  color: '#819489',
  fontSize: 13,
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function dateText(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN')
}

function StudentPortal({ currentUser, onLogout }) {
  const [page, setPage] = useState('Dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [meals, setMeals] = useState([])
  const [payments, setPayments] = useState([])
  const [complaints, setComplaints] = useState([])
  const [weeklyMenu, setWeeklyMenu] = useState([])

  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [adminsError, setAdminsError] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    type: 'Complaint',
    category: 'Food Quality',
    subject: '',
    description: '',
    rating: '',
  })

  async function loadData() {
    setLoading(true)
    setError('')

    const results = await Promise.allSettled([
      getStudentDashboard(),
      getMyMeals(),
      getMyPayments(),
      getMyComplaints(),
      getWeeklyMenu(),
    ])

    const [
      dashboardResult,
      mealsResult,
      paymentsResult,
      complaintsResult,
      menuResult,
    ] = results

    if (dashboardResult.status === 'fulfilled') {
      setDashboard(dashboardResult.value)
    }

    if (mealsResult.status === 'fulfilled') {
      setMeals(
        Array.isArray(mealsResult.value)
          ? mealsResult.value : []
      )
    }

    if (paymentsResult.status === 'fulfilled') {
      setPayments(
        Array.isArray(paymentsResult.value)
          ? paymentsResult.value : []
      )
    }

    if (complaintsResult.status === 'fulfilled') {
      setComplaints(
        Array.isArray(complaintsResult.value)
          ? complaintsResult.value : []
      )
    }

    if (menuResult.status === 'fulfilled') {
      setWeeklyMenu(
        Array.isArray(menuResult.value)
          ? menuResult.value : []
      )
    }

    const failed = results
      .map((result, index) =>
        result.status === 'rejected'
          ? ['Dashboard', 'Meals', 'Payments', 'Feedback', 'Menu'][index]
          : null
      )
      .filter(Boolean)

    if (failed.length) {
      setError(
        `Could not load: ${failed.join(', ')}. Please check backend routes.`
      )
    }

    setLoading(false)
  }

  // Load real admins from the backend.
  async function loadAdmins() {
    setAdminsLoading(true)
    setAdminsError('')

    try {
      const token = sessionStorage.getItem('messmate_token')

      if (!token) {
        throw new Error('Please sign in first.')
      }

      const baseUrl = (
        import.meta.env.VITE_API_URL || '/api'
      ).replace(/\/$/, '')

      const response = await fetch(
        `${baseUrl}/v1/student/admins`,
        {
          headers: {
            'x-auth-token': token,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load administrators.'
        )
      }

      setAdmins(
        Array.isArray(result.data) ? result.data : []
      )
    } catch (err) {
      setAdmins([])
      setAdminsError(
        err.message || 'Unable to load administrators.'
      )
    } finally {
      setAdminsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (page === 'Contact Admins') {
      loadAdmins()
    }
  }, [page])

  async function submitFeedback(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')

    try {
      await addFeedback({
        type: form.type,
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        rating: form.rating
          ? Number(form.rating)
          : null,
      })

      setForm({
        type: 'Complaint',
        category: 'Food Quality',
        subject: '',
        description: '',
        rating: '',
      })

      await loadData()
      setNotice('Your submission has been sent successfully.')
    } catch (err) {
      setError(err.message || 'Unable to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const student = dashboard?.student || currentUser

  const totalMeals = meals.reduce(
    (sum, item) => sum + Number(item.numberOfMeal || 0),
    0
  )

  const totalPayments = payments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  const pendingComplaints = complaints.filter(
    (item) =>
      item.type === 'Complaint' &&
      item.status !== 'Resolved'
  ).length

  const todayName = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
  })

  const todayMenu = weeklyMenu.find(
    (item) => item.day === todayName
  )

  const headingStyle = {
    fontSize: 32,
    margin: '8px 0 10px',
    color: '#f4f9f3',
    letterSpacing: '-1px',
  }

  const tableCell = {
    padding: 15,
    textAlign: 'left',
    borderBottom: '1px solid #edf1ed',
  }

  const actionLink = {
    ...button,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    textDecoration: 'none',
    fontSize: 13,
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div
            className="brand-mark"
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 4,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <img
              src="/iiit-bhubaneswar-logo.png"
              alt="IIIT Bhubaneswar logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          <div>
            <strong>MessMate</strong>
            <small>IIIT BHUBANESWAR</small>
          </div>
        </div>

        <div className="nav-caption">
          STUDENT WORKSPACE
        </div>

        <nav className="nav-menu">
          {SECTIONS.map((section) => (
            <button
              key={section.name}
              className={`nav-link ${
                page === section.name ? 'active' : ''
              }`}
              onClick={() => {
                setPage(section.name)
                setError('')
                setNotice('')
              }}
            >
              <span className="nav-symbol">
                {section.icon}
              </span>

              {section.name}

              {page === section.name && (
                <span className="active-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Good food, good mood.</strong>
            <p>Your campus dining, made simple.</p>
          </div>

          <div className="sidebar-user">
            <div className="avatar">ST</div>
            <div>
              <strong>
                {student?.username || 'Student'}
              </strong>
              <small>Student Account</small>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              ...button,
              width: '100%',
              marginTop: 14,
              background: '#fff0ee',
              color: '#b42318',
            }}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <span className="breadcrumb">
              Student Portal
            </span>
            <span className="breadcrumb-separator">
              /
            </span>
            <span className="breadcrumb-current">
              {page}
            </span>
          </div>

          <div className="topbar-right">
            <span className="date-display">
              {todayName}
            </span>
            <span className="top-avatar">ST</span>
          </div>
        </header>

        <div className="content-wrap">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 15,
              marginBottom: 25,
            }}
          >
            <div>
              <span
                style={{
                  color: '#caff70',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                }}
              >
                STUDENT EXPERIENCE
              </span>

              <h1 style={headingStyle}>
                {page} ✳
              </h1>

              <p style={{ color: '#9bb1a6', margin: 0 }}>
                Welcome, {student?.username || 'Student'}.
              </p>
            </div>

            <button
              onClick={
                page === 'Contact Admins'
                  ? loadAdmins
                  : loadData
              }
              disabled={
                page === 'Contact Admins'
                  ? adminsLoading
                  : loading
              }
              style={button}
            >
              ↻ Refresh
            </button>
          </div>

          {error && (
            <div
              style={{
                background: '#fff0ee',
                color: '#b42318',
                padding: 14,
                borderRadius: 10,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              style={{
                background: '#e8f8ed',
                color: '#17633c',
                padding: 14,
                borderRadius: 10,
                marginBottom: 18,
              }}
            >
              {notice}
            </div>
          )}

          {loading && page !== 'Contact Admins' && (
            <p style={{ color: '#b3c7ba' }}>
              Loading your mess records...
            </p>
          )}

          {/* DASHBOARD */}
          {page === 'Dashboard' && (
            <>
              <div
                style={{
                  ...card,
                  background:
                    'linear-gradient(120deg,#e7f5e9,#f8faee)',
                  marginBottom: 22,
                }}
              >
                <span style={{ ...muted, color: '#34784d' }}>
                  YOUR CAMPUS. YOUR MESS.
                </span>

                <h2 style={{ fontSize: 28, margin: '12px 0' }}>
                  Good food. Better campus life.
                </h2>

                <p style={muted}>
                  Track your meals, payments and feedback
                  in one place.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(190px,1fr))',
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                {[
                  {
                    label: 'Total Meals',
                    value: totalMeals,
                    icon: '◷',
                  },
                  {
                    label: 'My Payments',
                    value: money(totalPayments),
                    icon: '₹',
                  },
                  {
                    label: 'Pending Complaints',
                    value: pendingComplaints,
                    icon: '✉',
                  },
                  {
                    label: 'Published Menu Days',
                    value: `${weeklyMenu.length}/7`,
                    icon: '◫',
                  },
                ].map((stat) => (
                  <div style={card} key={stat.label}>
                    <span style={{ fontSize: 24 }}>
                      {stat.icon}
                    </span>
                    <p style={muted}>{stat.label}</p>
                    <strong style={{ fontSize: 29 }}>
                      {stat.value}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={card}>
                <h2>Today's Menu · {todayName}</h2>

                {todayMenu ? (
                  ['breakfast', 'lunch', 'snacks', 'dinner'].map(
                    (meal) => (
                      <p key={meal}>
                        <strong
                          style={{ textTransform: 'capitalize' }}
                        >
                          {meal}:
                        </strong>{' '}
                        {Array.isArray(todayMenu[meal])
                          ? todayMenu[meal].join(', ') || 'Not added'
                          : todayMenu[meal] || 'Not added'}
                      </p>
                    )
                  )
                ) : (
                  <p style={muted}>
                    Today's menu has not been published.
                  </p>
                )}
              </div>
            </>
          )}

          {/* MESS MENU */}
          {page === 'Mess Menu' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(270px,1fr))',
                gap: 18,
              }}
            >
              {DAYS.map((day) => {
                const menu = weeklyMenu.find(
                  (item) => item.day === day
                )

                return (
                  <div style={card} key={day}>
                    <h2>{day}</h2>

                    {menu ? (
                      <>
                        {[
                          'breakfast',
                          'lunch',
                          'snacks',
                          'dinner',
                        ].map((meal) => (
                          <div
                            key={meal}
                            style={{
                              borderTop: '1px solid #edf1ed',
                              padding: '13px 0',
                            }}
                          >
                            <strong
                              style={{
                                textTransform: 'capitalize',
                              }}
                            >
                              {meal}
                            </strong>

                            <p style={muted}>
                              {Array.isArray(menu[meal])
                                ? menu[meal].join(', ') || 'Not added'
                                : menu[meal] || 'Not added'}
                            </p>
                          </div>
                        ))}

                        {menu.specialNote && (
                          <p style={{ color: '#a67a20' }}>
                            ✦ {menu.specialNote}
                          </p>
                        )}
                      </>
                    ) : (
                      <p style={muted}>
                        No menu published for this day.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* MY MEALS */}
          {page === 'My Meals' && (
            <div style={card}>
              <h2>My Meal History</h2>
              <p style={muted}>
                Total recorded meals: {totalMeals}
              </p>

              {meals.length === 0 ? (
                <p style={muted}>No meal records found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={tableCell}>Date</th>
                        <th style={tableCell}>Meals</th>
                      </tr>
                    </thead>

                    <tbody>
                      {meals.map((meal) => (
                        <tr key={meal._id}>
                          <td style={tableCell}>
                            {dateText(meal.date)}
                          </td>
                          <td style={tableCell}>
                            {meal.numberOfMeal || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MY PAYMENTS */}
          {page === 'My Payments' && (
            <div style={card}>
              <h2>My Payment History</h2>
              <p style={muted}>
                Total payments recorded: {money(totalPayments)}
              </p>

              {payments.length === 0 ? (
                <p style={muted}>
                  No payment records found.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={tableCell}>Date</th>
                        <th style={tableCell}>Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id}>
                          <td style={tableCell}>
                            {dateText(payment.date)}
                          </td>
                          <td style={tableCell}>
                            <strong>
                              {money(payment.amount)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK */}
          {page === 'Feedback' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(300px,1fr))',
                gap: 20,
              }}
            >
              <div style={card}>
                <h2>Submit Feedback / Complaint</h2>

                <form
                  onSubmit={submitFeedback}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    marginTop: 20,
                  }}
                >
                  <label>
                    Type
                    <select
                      style={inputStyle}
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value,
                        })
                      }
                    >
                      <option>Complaint</option>
                      <option>Feedback</option>
                    </select>
                  </label>

                  <label>
                    Category
                    <select
                      style={inputStyle}
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                        })
                      }
                    >
                      {[
                        'Food Quality',
                        'Hygiene',
                        'Taste',
                        'Quantity',
                        'Service',
                        'Other',
                      ].map((category) => (
                        <option key={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Subject
                    <input
                      style={inputStyle}
                      value={form.subject}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subject: e.target.value,
                        })
                      }
                      required
                      maxLength={150}
                      placeholder="Enter subject"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      style={{
                        ...inputStyle,
                        minHeight: 110,
                        resize: 'vertical',
                      }}
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      required
                      placeholder="Describe your concern"
                    />
                  </label>

                  <label>
                    Rating (optional)
                    <select
                      style={inputStyle}
                      value={form.rating}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rating: e.target.value,
                        })
                      }
                    >
                      <option value="">No rating</option>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} Star
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={button}
                  >
                    {submitting
                      ? 'Submitting...'
                      : 'Submit Feedback ↗'}
                  </button>
                </form>
              </div>

              <div style={card}>
                <h2>My Submissions</h2>

                {complaints.length === 0 ? (
                  <p style={muted}>
                    No feedback or complaints submitted yet.
                  </p>
                ) : (
                  complaints.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: '17px 0',
                        borderBottom: '1px solid #edf1ed',
                      }}
                    >
                      <strong>{item.subject}</strong>

                      <p style={muted}>
                        {item.type} · {item.category}
                      </p>

                      <p style={{ fontSize: 13 }}>
                        {item.description}
                      </p>

                      <span
                        style={{
                          color:
                            item.status === 'Resolved'
                              ? '#23814e'
                              : '#b47c25',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {item.status}
                      </span>

                      {item.adminResponse && (
                        <p
                          style={{
                            background: '#edf7ef',
                            padding: 12,
                            borderRadius: 10,
                            fontSize: 13,
                          }}
                        >
                          <strong>Admin Response:</strong>{' '}
                          {item.adminResponse}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* NEW: CONTACT ADMINS */}
          {page === 'Contact Admins' && (
            <div>
              <div
                style={{
                  ...card,
                  marginBottom: 20,
                  background:
                    'linear-gradient(120deg,#e7f5e9,#f8faee)',
                }}
              >
                <span
                  style={{
                    color: '#34784d',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 2,
                  }}
                >
                  CAMPUS SUPPORT
                </span>

                <h2 style={{ margin: '10px 0' }}>
                  We're here to help.
                </h2>

                <p style={muted}>
                  Contact your mess administrators for
                  assistance with meals, payments or
                  other dining-related queries.
                </p>
              </div>

              {adminsLoading && (
                <p style={{ color: '#b3c7ba' }}>
                  Loading administrators...
                </p>
              )}

              {adminsError && (
                <div
                  style={{
                    ...card,
                    color: '#b42318',
                    marginBottom: 20,
                  }}
                >
                  {adminsError}
                </div>
              )}

              {!adminsLoading &&
                !adminsError &&
                admins.length === 0 && (
                  <div style={card}>
                    <h3>No administrators found</h3>
                    <p style={muted}>
                      No administrator contact details
                      are available for your mess yet.
                    </p>
                  </div>
                )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(260px,1fr))',
                  gap: 18,
                }}
              >
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    style={{
                      ...card,
                      padding: 22,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 13,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: '#e7f5e9',
                          color: '#195b46',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 20,
                          fontWeight: 800,
                        }}
                      >
                        {(admin.username || 'A')
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3
                          style={{
                            margin: '0 0 5px',
                            fontSize: 17,
                          }}
                        >
                          {admin.username || 'Administrator'}
                        </h3>

                        <span
                          style={{
                            color: '#23814e',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ● Mess Administrator
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid #edf1ed',
                        paddingTop: 15,
                      }}
                    >
                      <p style={muted}>
                        <strong>☎ Phone:</strong>{' '}
                        {admin.phone || 'Not provided'}
                      </p>

                      <p
                        style={{
                          ...muted,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <strong>✉ Email:</strong>{' '}
                        {admin.email || 'Not provided'}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 20,
                      }}
                    >
                      {admin.phone && (
                        <a
                          href={`tel:${String(admin.phone)
                            .replace(/[^\d+]/g, '')}`}
                          style={actionLink}
                        >
                          ☎ Call
                        </a>
                      )}

                      {admin.email && (
                        <a
                          href={`mailto:${admin.email}`}
                          style={{
                            ...actionLink,
                            background: '#e7f5e9',
                            color: '#195b46',
                          }}
                        >
                          ✉ Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY PROFILE */}
          {page === 'My Profile' && (
            <div style={{ ...card, maxWidth: 650 }}>
              <h2>Student Profile</h2>

              {[
                ['Name', student?.username],
                ['Email', student?.email],
                ['Role', 'Student'],
                ['Mess', currentUser?.messusername],
                ['Roll Number', student?.rollNumber],
                ['Department', student?.department],
                ['Hostel', student?.hostel],
                ['Room', student?.roomNumber],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 15,
                    padding: '16px 0',
                    borderBottom: '1px solid #edf1ed',
                  }}
                >
                  <span style={muted}>{label}</span>
                  <strong>{value || '—'}</strong>
                </div>
              ))}
            </div>
          )}

          <footer
            className="app-footer"
            style={{ marginTop: 35 }}
          >
            <span>
              © {new Date().getFullYear()} MessMate ·
              IIIT Bhubaneswar
            </span>
            <span>Made for better campus dining ✳</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default StudentPortal
