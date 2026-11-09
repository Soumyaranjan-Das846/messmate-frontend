
import { useEffect, useState } from 'react'
import Login from './login'
import Students from './Students'
import Menu from './Menu'
import Meals from './Meals'
import Expenses from './Expenses'
import Payments from './Payments'
import Feedback from './Feedback'
import Reports from './Reports'
import StudentPortal from './StudentPortal'

import {
  getStudentCount,
  getWeeklyMenu,
  getMonthlyMealCount,
  getExpenses,
  getLoggedInUser,
  logoutUser,
} from './services/api'

import './App.css'

const mealTypes = [
  { name: 'Breakfast', key: 'breakfast', symbol: '☀' },
  { name: 'Lunch', key: 'lunch', symbol: '◉' },
  { name: 'Snacks', key: 'snacks', symbol: '☕' },
  { name: 'Dinner', key: 'dinner', symbol: '☾' },
]

const navigation = [
  { name: 'Dashboard', icon: '▦' },
  { name: 'Mess Menu', icon: '◫' },
  { name: 'Students', icon: '♙' },
  { name: 'Meals', icon: '◷' },
  { name: 'Expenses', icon: '▤' },
  { name: 'Payments', icon: '₹' },
  { name: 'Feedback', icon: '✉' },
  { name: 'Reports', icon: '▥' },
]

function App() {
  const [currentUser, setCurrentUser] = useState(
    () => getLoggedInUser()
  )

  const isLoggedIn = Boolean(currentUser)

  const [page, setPage] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [studentCount, setStudentCount] = useState(null)
  const [studentCountError, setStudentCountError] = useState(false)

  const [monthlyMealCount, setMonthlyMealCount] = useState(null)
  const [mealCountError, setMealCountError] = useState(false)

  const [monthlyExpense, setMonthlyExpense] = useState(null)
  const [expenseError, setExpenseError] = useState(false)

  const [todayMenu, setTodayMenu] = useState(null)
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')

  const today = new Date()

  const todayName = today.toLocaleDateString('en-IN', {
    weekday: 'long',
  })

  const dateLabel = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleLogout = () => {
    logoutUser()
    setCurrentUser(null)
    setPage('Dashboard')
    setSidebarOpen(false)
  }

  const handleLogin = () => {
    const user = getLoggedInUser()

    if (!user || !['admin', 'user'].includes(user.role)) {
      logoutUser()
      setCurrentUser(null)
      return
    }

    setCurrentUser(user)
    setPage('Dashboard')
  }

  useEffect(() => {
    if (
      !isLoggedIn ||
      currentUser?.role !== 'admin' ||
      page !== 'Dashboard'
    ) {
      return
    }

    let active = true

    async function loadDashboard() {
      setStudentCount(null)
      setStudentCountError(false)

      setMonthlyMealCount(null)
      setMealCountError(false)

      setMonthlyExpense(null)
      setExpenseError(false)

      setTodayMenu(null)
      setMenuLoading(true)
      setMenuError('')

      const [
        studentsResult,
        menuResult,
        mealsResult,
        expensesResult,
      ] = await Promise.allSettled([
        getStudentCount(),
        getWeeklyMenu(),
        getMonthlyMealCount(),
        getExpenses(),
      ])

      if (!active) return

      if (studentsResult.status === 'fulfilled') {
        setStudentCount(studentsResult.value)
      } else {
        setStudentCountError(true)
        console.error(
          'Failed to load student count:',
          studentsResult.reason
        )
      }

      if (menuResult.status === 'fulfilled') {
        const weeklyMenu = Array.isArray(menuResult.value)
          ? menuResult.value
          : []

        const currentDayMenu = weeklyMenu.find(
          (item) => item.day === todayName
        )

        setTodayMenu(currentDayMenu || null)
      } else {
        setMenuError('Unable to load today’s menu')
        console.error(
          'Failed to load weekly menu:',
          menuResult.reason
        )
      }

      if (mealsResult.status === 'fulfilled') {
        setMonthlyMealCount(mealsResult.value)
      } else {
        setMealCountError(true)
        console.error(
          'Failed to load monthly meal count:',
          mealsResult.reason
        )
      }

      if (expensesResult.status === 'fulfilled') {
        setMonthlyExpense(expensesResult.value.total)
      } else {
        setExpenseError(true)
        console.error(
          'Failed to load monthly expenses:',
          expensesResult.reason
        )
      }

      setMenuLoading(false)
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [isLoggedIn, currentUser?.role, page, todayName])

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  if (currentUser.role === 'user') {
    return (
      <StudentPortal
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    )
  }

  if (currentUser.role !== 'admin') {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div
            className="brand-mark"
            style={{
              width: 54,
              height: 54,
              minWidth: 54,
              padding: 4,
              borderRadius: 12,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <img
              src="/iiit-bhubaneswar-logo.png"
              alt="IIIT Bhubaneswar Logo"
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

        <div className="nav-caption">WORKSPACE</div>

        <nav className="nav-menu">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-link ${page === item.name ? 'active' : ''}`}
              onClick={() => {
                setPage(item.name)
                setSidebarOpen(false)
              }}
            >
              <span className="nav-symbol">{item.icon}</span>

              {item.name}

              {page === item.name && (
                <span className="active-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Good food, good mood.</strong>

            <p>
              Making campus dining a little better, every day.
            </p>
          </div>

          <div className="sidebar-user">
            <div className="avatar">AD</div>

            <div>
              <strong>Mess Administrator</strong>
              <small>Admin Account</small>
            </div>

            <span>⌄</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '12px',
              background: '#fff0ee',
              color: '#b42318',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <span className="breadcrumb">Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{page}</span>
          </div>

          <div className="topbar-right">
            <span className="date-display">
              ◷ &nbsp; {dateLabel}
            </span>

            <span className="top-avatar">AD</span>
          </div>
        </header>

        <div className="content-wrap">

          {/* DASHBOARD */}

          {page === 'Dashboard' && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    CAMPUS DINING, SIMPLIFIED
                  </span>

                  <h1>
                    Good morning, Admin <span>✳</span>
                  </h1>

                  <p>
                    Here's what's happening at your mess today.
                  </p>
                </div>

                <span className="status-pill">
                  <span /> System Online
                </span>
              </div>

              {/* WELCOME BANNER */}

              <div className="welcome-banner">
                <div className="banner-copy">
                  <span className="banner-tag">
                    IIIT BHUBANESWAR MESS
                  </span>

                  <h2>
                    A better way to manage
                    <br />
                    campus meals.
                  </h2>

                  <p>
                    Everything you need to keep your mess running
                    smoothly, all in one place.
                  </p>

                  <button onClick={() => setPage('Mess Menu')}>
                    Explore Mess Menu <span>↗</span>
                  </button>
                </div>

                <div className="banner-art" aria-hidden="true">
                  <div className="plate">
                    <div className="plate-inner">
                      <span>🥗</span>
                    </div>
                  </div>

                  <span className="spark spark-one">✳</span>
                  <span className="spark spark-two">✦</span>
                </div>
              </div>

              {/* DASHBOARD STATS */}

              <div className="section-title">
                <div>
                  <h3>At a glance</h3>
                  <p>Your mess overview</p>
                </div>

                <span className="section-note">Overview</span>
              </div>

              <div className="stats-grid">
                {[
                  {
                    label: 'Registered Students',
                    value:
                      studentCount === null
                        ? '—'
                        : String(studentCount).padStart(2, '0'),
                    icon: '♙',
                    change: studentCountError
                      ? 'Unable to load student count'
                      : 'Live registered accounts',
                    color: 'green',
                  },
                  {
                    label: 'Meals Served',
                    value:
                      monthlyMealCount === null
                        ? '—'
                        : String(monthlyMealCount).padStart(2, '0'),
                    icon: '◫',
                    change: mealCountError
                      ? 'Unable to load meal count'
                      : 'This month · Live records',
                    color: 'orange',
                  },
                  {
                    label: 'Monthly Expenses',
                    value:
                      monthlyExpense === null
                        ? '—'
                        : `₹${Number(monthlyExpense).toLocaleString('en-IN')}`,
                    icon: '₹',
                    change: expenseError
                      ? 'Unable to load expenses'
                      : 'This month · Live expenses',
                    color: 'purple',
                  },
                  {
                    label: 'Active Mess',
                    value: '01',
                    icon: '⌂',
                    change: 'Campus mess',
                    color: 'blue',
                  },
                ].map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <div className={`stat-icon ${stat.color}`}>
                      {stat.icon}
                    </div>

                    <span className="stat-label">
                      {stat.label}
                    </span>

                    <strong className="stat-value">
                      {stat.value}
                    </strong>

                    <span className="stat-change">
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* DASHBOARD PANELS */}

              <div className="dashboard-grid">

                {/* TODAY'S MENU */}

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Today's Menu</h3>

                      <p>
                        {todayName} · Live from MongoDB
                      </p>
                    </div>

                    <button
                      className="text-action"
                      onClick={() => setPage('Mess Menu')}
                    >
                      Full menu ↗
                    </button>
                  </div>

                  <div className="meal-list">
                    {mealTypes.map((meal) => {
                      const dishes = todayMenu?.[meal.key]

                      let description = 'Not published yet'

                      if (menuLoading) {
                        description = 'Loading menu...'
                      } else if (menuError) {
                        description = menuError
                      } else if (
                        Array.isArray(dishes) &&
                        dishes.length > 0
                      ) {
                        description = dishes.join(', ')
                      } else if (todayMenu) {
                        description = 'No dishes added'
                      }

                      return (
                        <div className="meal-row" key={meal.key}>
                          <div className="meal-symbol">
                            {meal.symbol}
                          </div>

                          <div className="meal-details">
                            <strong>{meal.name}</strong>
                            <span>{description}</span>
                          </div>

                          <span className="meal-arrow">↗</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* QUICK ACCESS */}

                <div className="panel quick-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Quick Access</h3>
                      <p>Get things done faster</p>
                    </div>
                  </div>

                  <div className="quick-links">
                    {[
                      {
                        title: 'Manage Students',
                        desc: 'View student records',
                        icon: '♙',
                        target: 'Students',
                      },
                      {
                        title: 'Weekly Menu',
                        desc: 'Browse meal schedule',
                        icon: '◫',
                        target: 'Mess Menu',
                      },
                      {
                        title: 'Meal Records',
                        desc: 'Track daily meals',
                        icon: '◷',
                        target: 'Meals',
                      },
                      {
                        title: 'Mess Expenses',
                        desc: 'Manage spending',
                        icon: '▤',
                        target: 'Expenses',
                      },
                      {
                        title: 'Student Payments',
                        desc: 'Manage mess collections',
                        icon: '₹',
                        target: 'Payments',
                      },
                      {
                        title: 'Feedback & Complaints',
                        desc: 'Manage student concerns',
                        icon: '✉',
                        target: 'Feedback',
                      },
                      {
                        title: 'Reports & Analytics',
                        desc: 'View mess performance',
                        icon: '▥',
                        target: 'Reports',
                      },
                    ].map((link) => (
                      <button
                        className="quick-link"
                        key={link.title}
                        onClick={() => setPage(link.target)}
                      >
                        <span className="quick-icon">
                          {link.icon}
                        </span>

                        <span>
                          <strong>{link.title}</strong>
                          <small>{link.desc}</small>
                        </span>

                        <span className="quick-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MESS MENU */}
          {page === 'Mess Menu' && <Menu />}

          {/* STUDENTS */}
          {page === 'Students' && <Students />}

          {/* MEALS */}
          {page === 'Meals' && <Meals />}

          {/* EXPENSES */}
          {page === 'Expenses' && <Expenses />}

          {/* PAYMENTS */}
          {page === 'Payments' && <Payments />}

          {/* FEEDBACK & COMPLAINTS */}
          {page === 'Feedback' && <Feedback />}

          {/* REPORTS & ANALYTICS */}
          {page === 'Reports' && <Reports />}

          {/* FOOTER */}

          <footer className="app-footer">
            <span>
              © {today.getFullYear()} MessMate · IIIT Bhubaneswar
            </span>

            <span>
              Made for better campus dining ✳
            </span>
          </footer>

        </div>
      </main>
    </div>
  )
}

export default App
