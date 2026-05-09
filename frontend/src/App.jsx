import axios from 'axios'
import {
  ClipboardList,
  Eye,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Printer,
  Save,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import ecoleLogo from './assets/ecole.png'
import evalgenLogo from './assets/evalgen-logo.png'
import ministreLogo from './assets/ministre.png'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

const emptyFiliere = { id_filiere: '', nom: '' }
const emptyModule = { id_module: '', nom: '', filiere: '' }
const emptyCours = { id_cours: '', nom: '', module: '' }
const emptyGroupe = { id_groupe: '', nom: '', filiere: '' }
const emptyEleve = {
  id_national: '',
  id_eleve: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  date_naissance: '',
  eleve_statut: 'A',
  groupe: '',
}
const emptyEnseignant = {
  id_enseignant: '',
  nom: '',
  prenom: '',
  email: '',
  enseignant_statut: 'A',
}
const emptyEvaluation = {
  titre: '',
  type_evaluation: 'C',
  date_evaluation: '',
  filiere: '',
  module: '',
  cours: '',
  groupe: '',
  enseignant: '',
}

const typeEvaluations = [
  ['C', 'Contrôle'],
  ['E', 'Examen'],
  ['SG', 'Stage'],
  ['P', 'Présentation'],
  ['ST', 'Soutenance'],
]

const statutsEleve = [
  ['A', 'Actif'],
  ['I', 'Inactif'],
  ['G', 'Diplômé'],
]

const statutsEnseignant = [
  ['A', 'Actif'],
  ['I', 'Inactif'],
]

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/filieres', label: 'Filières', icon: GraduationCap },
  { to: '/groupes', label: 'Groupes', icon: Users },
  { to: '/enseignants', label: 'Enseignants', icon: UserRound },
  { to: '/evaluations', label: 'Évaluations', icon: ClipboardList },
  { to: '/fiches', label: "Fiches d'évaluation", icon: FileText },
]

function formatError(error) {
  const data = error?.response?.data
  if (!data) return "Une erreur est survenue."
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([key, value]) => {
      const message = Array.isArray(value) ? value.join(', ') : String(value)
      return `${key}: ${message}`
    })
    .join(' ')
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

function useToken() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const saveToken = (nextToken) => {
    localStorage.setItem('token', nextToken)
    setToken(nextToken)
  }

  const clearToken = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return { token, saveToken, clearToken }
}

function Notice({ message, type = 'success', onClose }) {
  if (!message) return null
  return (
    <div className={`notice ${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="icon-btn" type="button" onClick={onClose} aria-label="Fermer">
          <X size={16} />
        </button>
      )}
    </div>
  )
}

function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

function Loading() {
  return (
    <div className="loading">
      <LoaderCircle size={18} className="spin" />
      Chargement...
    </div>
  )
}

function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>
}

function TextInput({ label, value, onChange, required = false, type = 'text' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={onChange} required={required} />
    </label>
  )
}

function SelectInput({ label, value, onChange, children, required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={onChange} required={required}>
        {children}
      </select>
    </label>
  )
}

function FormActions({ editing, onCancel }) {
  return (
    <div className="form-actions">
      <button className="primary-btn" type="submit">
        {editing ? <Save size={16} /> : <Plus size={16} />}
        {editing ? 'Enregistrer' : 'Ajouter'}
      </button>
      {editing && (
        <button className="secondary-btn" type="button" onClick={onCancel}>
          <X size={16} />
          Annuler
        </button>
      )}
    </div>
  )
}

function LoginPage({ saveToken }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('auth/login/', form)
      saveToken(response.data.token)
      navigate('/')
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div>
          <img className="app-logo login-logo" src={evalgenLogo} alt="EvalGen" />
          <h1>Connexion administrateur</h1>
        </div>
        <Notice message={error} type="error" onClose={() => setError('')} />
        <form className="stack-form" onSubmit={submit}>
          <TextInput
            label="Nom d'utilisateur"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            required
          />
          <TextInput
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <button className="primary-btn wide" type="submit" disabled={loading}>
            {loading && <LoaderCircle size={16} className="spin" />}
            Se connecter
          </button>
        </form>
      </section>
    </main>
  )
}

function AppLayout({ clearToken }) {
  const navigate = useNavigate()

  const logout = async () => {
    try {
      await api.post('auth/logout/')
    } catch {
      // La suppression locale suffit si le jeton a deja expire.
    }
    clearToken()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="app-logo sidebar-logo" src={evalgenLogo} alt="EvalGen" />
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <button className="logout-btn" type="button" onClick={logout}>
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/filieres" element={<FilieresPage />} />
          <Route path="/filieres/:id" element={<FiliereDetailPage />} />
          <Route path="/groupes" element={<GroupesPage />} />
          <Route path="/groupes/:id" element={<GroupeDetailPage />} />
          <Route path="/enseignants" element={<EnseignantsPage />} />
          <Route path="/evaluations" element={<EvaluationsPage />} />
          <Route path="/fiches" element={<FichesPage />} />
          <Route path="/fiches/impression" element={<FicheCollectionPage />} />
          <Route path="/fiches/:id" element={<FicheDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [filieres, groupes, enseignants, evaluations, fiches] = await Promise.all([
          api.get('filieres/'),
          api.get('groupes/'),
          api.get('enseignants/'),
          api.get('evaluations/'),
          api.get('fiches/'),
        ])
        if (active) {
          setData({
            filieres: filieres.data,
            groupes: groupes.data,
            enseignants: enseignants.data,
            evaluations: evaluations.data,
            fiches: fiches.data,
          })
        }
      } catch (err) {
        if (active) setError(formatError(err))
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!data && !error) return <Loading />

  const cards = [
    { label: 'Filières', value: data?.filieres.length || 0, icon: GraduationCap },
    { label: 'Groupes', value: data?.groupes.length || 0, icon: Users },
    { label: 'Enseignants', value: data?.enseignants.length || 0, icon: UserRound },
    { label: 'Évaluations', value: data?.evaluations.length || 0, icon: ClipboardList },
    { label: "Fiches d'évaluation", value: data?.fiches.length || 0, icon: FileText },
  ]

  return (
    <section>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des informations académiques et des fiches générées."
      />
      <Notice message={error} type="error" onClose={() => setError('')} />
      <div className="stats-grid">
        {cards.map((card) => {
          const StatIcon = card.icon
          return (
            <div className="stat-card" key={card.label}>
              <StatIcon size={22} />
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          )
        })}
      </div>
      <section className="panel">
        <div className="panel-title">
          <h2>Dernières évaluations</h2>
          <Link className="text-link" to="/evaluations">
            Voir tout
          </Link>
        </div>
        {!data?.evaluations.length ? (
          <EmptyState>Aucune évaluation pour le moment.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Groupe</th>
                  <th>Enseignant</th>
                </tr>
              </thead>
              <tbody>
                {data.evaluations.slice(0, 5).map((evaluation) => (
                  <tr key={evaluation.id}>
                    <td>{evaluation.titre}</td>
                    <td>{evaluation.type_evaluation_label}</td>
                    <td>{formatDate(evaluation.date_evaluation)}</td>
                    <td>{evaluation.groupe_nom}</td>
                    <td>{evaluation.enseignant_nom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function FilieresPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyFiliere)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get('filieres/')
      setItems(response.data)
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reset = () => {
    setForm(emptyFiliere)
    setEditingId(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await api.patch(`filieres/${editingId}/`, form)
        setNotice({ type: 'success', message: 'Filière modifiée.' })
      } else {
        await api.post('filieres/', form)
        setNotice({ type: 'success', message: 'Filière ajoutée.' })
      }
      reset()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette filière ?')) return
    try {
      await api.delete(`filieres/${id}/`)
      setNotice({ type: 'success', message: 'Filière supprimée.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  return (
    <section>
      <PageHeader title="Filières" description="Gestion des filières, modules et cours." />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>{editingId ? 'Modifier une filière' : 'Ajouter une filière'}</h2>
        <form className="grid-form" onSubmit={submit}>
          <TextInput
            label="Code filière"
            value={form.id_filiere}
            onChange={(event) => setForm({ ...form, id_filiere: event.target.value })}
            required
          />
          <TextInput
            label="Nom"
            value={form.nom}
            onChange={(event) => setForm({ ...form, nom: event.target.value })}
            required
          />
          <FormActions editing={Boolean(editingId)} onCancel={reset} />
        </form>
      </section>
      <section className="panel">
        <h2>Liste des filières</h2>
        {loading ? (
          <Loading />
        ) : !items.length ? (
          <EmptyState>Aucune filière enregistrée.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Modules</th>
                  <th>Groupes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id_filiere}</td>
                    <td>
                      <Link to={`/filieres/${item.id}`}>{item.nom}</Link>
                    </td>
                    <td>{item.modules_count}</td>
                    <td>{item.groupes_count}</td>
                    <td className="actions">
                      <Link className="icon-btn" to={`/filieres/${item.id}`} aria-label="Voir">
                        <Eye size={16} />
                      </Link>
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => {
                          setEditingId(item.id)
                          setForm({ id_filiere: item.id_filiere, nom: item.nom })
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function FiliereDetailPage() {
  const { id } = useParams()
  const [filiere, setFiliere] = useState(null)
  const [moduleForm, setModuleForm] = useState({ ...emptyModule, filiere: id })
  const [courseForm, setCourseForm] = useState(emptyCours)
  const [editingModuleId, setEditingModuleId] = useState(null)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(`filieres/${id}/`)
      setFiliere(response.data)
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const resetModule = () => {
    setModuleForm({ ...emptyModule, filiere: id })
    setEditingModuleId(null)
  }

  const resetCourse = () => {
    setCourseForm(emptyCours)
    setEditingCourseId(null)
  }

  const submitModule = async (event) => {
    event.preventDefault()
    try {
      if (editingModuleId) {
        await api.patch(`modules/${editingModuleId}/`, moduleForm)
        setNotice({ type: 'success', message: 'Module modifié.' })
      } else {
        await api.post('modules/', moduleForm)
        setNotice({ type: 'success', message: 'Module ajouté.' })
      }
      resetModule()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const submitCourse = async (event) => {
    event.preventDefault()
    try {
      if (editingCourseId) {
        await api.patch(`cours/${editingCourseId}/`, courseForm)
        setNotice({ type: 'success', message: 'Cours modifié.' })
      } else {
        await api.post('cours/', courseForm)
        setNotice({ type: 'success', message: 'Cours ajouté.' })
      }
      resetCourse()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const removeModule = async (moduleId) => {
    if (!window.confirm('Supprimer ce module ?')) return
    try {
      await api.delete(`modules/${moduleId}/`)
      setNotice({ type: 'success', message: 'Module supprimé.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const removeCourse = async (courseId) => {
    if (!window.confirm('Supprimer ce cours ?')) return
    try {
      await api.delete(`cours/${courseId}/`)
      setNotice({ type: 'success', message: 'Cours supprimé.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  if (loading) return <Loading />
  if (!filiere) return <EmptyState>Filière introuvable.</EmptyState>

  return (
    <section>
      <PageHeader
        title={filiere.nom}
        description={`Code filière: ${filiere.id_filiere}`}
        action={
          <Link className="secondary-btn" to="/filieres">
            Retour
          </Link>
        }
      />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>{editingModuleId ? 'Modifier un module' : 'Ajouter un module'}</h2>
        <form className="grid-form" onSubmit={submitModule}>
          <TextInput
            label="Code module"
            value={moduleForm.id_module}
            onChange={(event) => setModuleForm({ ...moduleForm, id_module: event.target.value })}
            required
          />
          <TextInput
            label="Nom"
            value={moduleForm.nom}
            onChange={(event) => setModuleForm({ ...moduleForm, nom: event.target.value })}
            required
          />
          <FormActions editing={Boolean(editingModuleId)} onCancel={resetModule} />
        </form>
      </section>
      <section className="module-list">
        {filiere.modules.length === 0 ? (
          <EmptyState>Aucun module dans cette filière.</EmptyState>
        ) : (
          filiere.modules.map((module) => (
            <article className="panel" key={module.id}>
              <div className="panel-title">
                <div>
                  <h2>{module.nom}</h2>
                  <p>{module.id_module}</p>
                </div>
                <div className="actions">
                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() => {
                      setEditingModuleId(module.id)
                      setModuleForm({
                        id_module: module.id_module,
                        nom: module.nom,
                        filiere: id,
                      })
                    }}
                    aria-label="Modifier le module"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn danger"
                    type="button"
                    onClick={() => removeModule(module.id)}
                    aria-label="Supprimer le module"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="subsection-title">
                <strong>Cours</strong>
                {module.cours.length < 2 && courseForm.module !== module.id && (
                  <button
                    className="small-btn"
                    type="button"
                    onClick={() => setCourseForm({ ...emptyCours, module: module.id })}
                  >
                    <Plus size={14} />
                    Ajouter un cours
                  </button>
                )}
              </div>
              {module.cours.length >= 2 && !editingCourseId && (
                <p className="hint">Limite atteinte: 2 cours maximum par module.</p>
              )}
              {String(courseForm.module) === String(module.id) && (
                <form className="grid-form nested-form" onSubmit={submitCourse}>
                  <TextInput
                    label="Code cours"
                    value={courseForm.id_cours}
                    onChange={(event) => setCourseForm({ ...courseForm, id_cours: event.target.value })}
                    required
                  />
                  <TextInput
                    label="Nom"
                    value={courseForm.nom}
                    onChange={(event) => setCourseForm({ ...courseForm, nom: event.target.value })}
                    required
                  />
                  <FormActions editing={Boolean(editingCourseId)} onCancel={resetCourse} />
                </form>
              )}
              {!module.cours.length ? (
                <EmptyState>Aucun cours dans ce module.</EmptyState>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Nom</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {module.cours.map((cours) => (
                        <tr key={cours.id}>
                          <td>{cours.id_cours}</td>
                          <td>{cours.nom}</td>
                          <td className="actions">
                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() => {
                                setEditingCourseId(cours.id)
                                setCourseForm({
                                  id_cours: cours.id_cours,
                                  nom: cours.nom,
                                  module: module.id,
                                })
                              }}
                              aria-label="Modifier le cours"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-btn danger"
                              type="button"
                              onClick={() => removeCourse(cours.id)}
                              aria-label="Supprimer le cours"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </section>
  )
}

function GroupesPage() {
  const [items, setItems] = useState([])
  const [filieres, setFilieres] = useState([])
  const [form, setForm] = useState(emptyGroupe)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [groupesResponse, filieresResponse] = await Promise.all([
        api.get('groupes/'),
        api.get('filieres/'),
      ])
      setItems(groupesResponse.data)
      setFilieres(filieresResponse.data)
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reset = () => {
    setForm(emptyGroupe)
    setEditingId(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await api.patch(`groupes/${editingId}/`, form)
        setNotice({ type: 'success', message: 'Groupe modifié.' })
      } else {
        await api.post('groupes/', form)
        setNotice({ type: 'success', message: 'Groupe ajouté.' })
      }
      reset()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce groupe et ses élèves ?')) return
    try {
      await api.delete(`groupes/${id}/`)
      setNotice({ type: 'success', message: 'Groupe supprimé.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  return (
    <section>
      <PageHeader title="Groupes" description="Gestion des groupes et des élèves." />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>{editingId ? 'Modifier un groupe' : 'Ajouter un groupe'}</h2>
        <form className="grid-form" onSubmit={submit}>
          <TextInput
            label="Code groupe"
            value={form.id_groupe}
            onChange={(event) => setForm({ ...form, id_groupe: event.target.value })}
            required
          />
          <TextInput
            label="Nom"
            value={form.nom}
            onChange={(event) => setForm({ ...form, nom: event.target.value })}
            required
          />
          <SelectInput
            label="Filière"
            value={form.filiere}
            onChange={(event) => setForm({ ...form, filiere: event.target.value })}
            required
          >
            <option value="">Sélectionner</option>
            {filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.nom}
              </option>
            ))}
          </SelectInput>
          <FormActions editing={Boolean(editingId)} onCancel={reset} />
        </form>
      </section>
      <section className="panel">
        <h2>Liste des groupes</h2>
        {loading ? (
          <Loading />
        ) : !items.length ? (
          <EmptyState>Aucun groupe enregistré.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Filière</th>
                  <th>Élèves</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id_groupe}</td>
                    <td>
                      <Link to={`/groupes/${item.id}`}>{item.nom}</Link>
                    </td>
                    <td>{item.filiere_nom}</td>
                    <td>{item.eleves_count}</td>
                    <td className="actions">
                      <Link className="icon-btn" to={`/groupes/${item.id}`} aria-label="Voir">
                        <Eye size={16} />
                      </Link>
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => {
                          setEditingId(item.id)
                          setForm({
                            id_groupe: item.id_groupe,
                            nom: item.nom,
                            filiere: item.filiere,
                          })
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function GroupeDetailPage() {
  const { id } = useParams()
  const [groupe, setGroupe] = useState(null)
  const [eleves, setEleves] = useState([])
  const [form, setForm] = useState({ ...emptyEleve, groupe: id })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [groupeResponse, elevesResponse] = await Promise.all([
        api.get(`groupes/${id}/`),
        api.get(`eleves/?groupe=${id}`),
      ])
      setGroupe(groupeResponse.data)
      setEleves(elevesResponse.data)
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const reset = () => {
    setForm({ ...emptyEleve, groupe: id })
    setEditingId(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await api.patch(`eleves/${editingId}/`, form)
        setNotice({ type: 'success', message: 'Élève modifié.' })
      } else {
        await api.post('eleves/', form)
        setNotice({ type: 'success', message: 'Élève ajouté.' })
      }
      reset()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const remove = async (eleveId) => {
    if (!window.confirm('Supprimer cet élève ?')) return
    try {
      await api.delete(`eleves/${eleveId}/`)
      setNotice({ type: 'success', message: 'Élève supprimé.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  if (loading) return <Loading />
  if (!groupe) return <EmptyState>Groupe introuvable.</EmptyState>

  return (
    <section>
      <PageHeader
        title={groupe.nom}
        description={`${groupe.id_groupe} - Filière ${groupe.filiere_nom}`}
        action={
          <Link className="secondary-btn" to="/groupes">
            Retour
          </Link>
        }
      />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>{editingId ? 'Modifier un élève' : 'Ajouter un élève'}</h2>
        <form className="grid-form large" onSubmit={submit}>
          <TextInput
            label="CNE"
            value={form.id_national}
            onChange={(event) => setForm({ ...form, id_national: event.target.value })}
            required
          />
          <TextInput
            label="Code élève"
            value={form.id_eleve}
            onChange={(event) => setForm({ ...form, id_eleve: event.target.value })}
            required
          />
          <TextInput
            label="Nom"
            value={form.nom}
            onChange={(event) => setForm({ ...form, nom: event.target.value })}
            required
          />
          <TextInput
            label="Prénom"
            value={form.prenom}
            onChange={(event) => setForm({ ...form, prenom: event.target.value })}
            required
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <TextInput
            label="Téléphone"
            value={form.telephone}
            onChange={(event) => setForm({ ...form, telephone: event.target.value })}
          />
          <TextInput
            label="Date de naissance"
            type="date"
            value={form.date_naissance}
            onChange={(event) => setForm({ ...form, date_naissance: event.target.value })}
            required
          />
          <SelectInput
            label="Statut"
            value={form.eleve_statut}
            onChange={(event) => setForm({ ...form, eleve_statut: event.target.value })}
          >
            {statutsEleve.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <FormActions editing={Boolean(editingId)} onCancel={reset} />
        </form>
      </section>
      <section className="panel">
        <div className="panel-title">
          <h2>Élèves du groupe</h2>
          <span className={eleves.length >= 2 ? 'badge success' : 'badge warning'}>
            {eleves.length} élève(s)
          </span>
        </div>
        {eleves.length < 2 && (
          <p className="hint">Au moins 2 élèves sont nécessaires avant de générer des fiches.</p>
        )}
        {!eleves.length ? (
          <EmptyState>Aucun élève dans ce groupe.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CNE</th>
                  <th>Code</th>
                  <th>Nom complet</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((eleve) => (
                  <tr key={eleve.id}>
                    <td>{eleve.id_national}</td>
                    <td>{eleve.id_eleve}</td>
                    <td>
                      {eleve.nom} {eleve.prenom}
                    </td>
                    <td>{eleve.email}</td>
                    <td>{eleve.statut_label}</td>
                    <td className="actions">
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => {
                          setEditingId(eleve.id)
                          setForm({
                            id_national: eleve.id_national,
                            id_eleve: eleve.id_eleve,
                            nom: eleve.nom,
                            prenom: eleve.prenom,
                            email: eleve.email,
                            telephone: eleve.telephone || '',
                            date_naissance: eleve.date_naissance,
                            eleve_statut: eleve.eleve_statut,
                            groupe: id,
                          })
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        type="button"
                        onClick={() => remove(eleve.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function EnseignantsPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyEnseignant)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get('enseignants/')
      setItems(response.data)
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reset = () => {
    setForm(emptyEnseignant)
    setEditingId(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await api.patch(`enseignants/${editingId}/`, form)
        setNotice({ type: 'success', message: 'Enseignant modifié.' })
      } else {
        await api.post('enseignants/', form)
        setNotice({ type: 'success', message: 'Enseignant ajouté.' })
      }
      reset()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer cet enseignant ?')) return
    try {
      await api.delete(`enseignants/${id}/`)
      setNotice({ type: 'success', message: 'Enseignant supprimé.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  return (
    <section>
      <PageHeader title="Enseignants" description="Gestion des enseignants." />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>{editingId ? 'Modifier un enseignant' : 'Ajouter un enseignant'}</h2>
        <form className="grid-form" onSubmit={submit}>
          <TextInput
            label="Code enseignant"
            value={form.id_enseignant}
            onChange={(event) => setForm({ ...form, id_enseignant: event.target.value })}
            required
          />
          <TextInput
            label="Nom"
            value={form.nom}
            onChange={(event) => setForm({ ...form, nom: event.target.value })}
            required
          />
          <TextInput
            label="Prénom"
            value={form.prenom}
            onChange={(event) => setForm({ ...form, prenom: event.target.value })}
            required
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <SelectInput
            label="Statut"
            value={form.enseignant_statut}
            onChange={(event) => setForm({ ...form, enseignant_statut: event.target.value })}
          >
            {statutsEnseignant.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <FormActions editing={Boolean(editingId)} onCancel={reset} />
        </form>
      </section>
      <section className="panel">
        <h2>Liste des enseignants</h2>
        {loading ? (
          <Loading />
        ) : !items.length ? (
          <EmptyState>Aucun enseignant enregistré.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom complet</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id_enseignant}</td>
                    <td>{item.nom_complet}</td>
                    <td>{item.email}</td>
                    <td>{item.statut_label}</td>
                    <td className="actions">
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => {
                          setEditingId(item.id)
                          setForm({
                            id_enseignant: item.id_enseignant,
                            nom: item.nom,
                            prenom: item.prenom,
                            email: item.email,
                            enseignant_statut: item.enseignant_statut,
                          })
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function EvaluationsPage() {
  const navigate = useNavigate()
  const [evaluations, setEvaluations] = useState([])
  const [catalog, setCatalog] = useState({
    filieres: [],
    modules: [],
    cours: [],
    groupes: [],
    enseignants: [],
  })
  const [form, setForm] = useState(emptyEvaluation)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [evaluationsResponse, filieres, modules, cours, groupes, enseignants] = await Promise.all([
        api.get('evaluations/'),
        api.get('filieres/'),
        api.get('modules/'),
        api.get('cours/'),
        api.get('groupes/'),
        api.get('enseignants/'),
      ])
      setEvaluations(evaluationsResponse.data)
      setCatalog({
        filieres: filieres.data,
        modules: modules.data,
        cours: cours.data,
        groupes: groupes.data,
        enseignants: enseignants.data,
      })
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredModules = useMemo(
    () => catalog.modules.filter((module) => String(module.filiere) === String(form.filiere)),
    [catalog.modules, form.filiere],
  )
  const filteredCours = useMemo(
    () => catalog.cours.filter((cours) => String(cours.module) === String(form.module)),
    [catalog.cours, form.module],
  )
  const filteredGroupes = useMemo(
    () => catalog.groupes.filter((groupe) => String(groupe.filiere) === String(form.filiere)),
    [catalog.groupes, form.filiere],
  )

  const reset = () => {
    setForm(emptyEvaluation)
    setEditingId(null)
  }

  const updateFiliere = (value) => {
    setForm({ ...form, filiere: value, module: '', cours: '', groupe: '' })
  }

  const updateModule = (value) => {
    setForm({ ...form, module: value, cours: '' })
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await api.patch(`evaluations/${editingId}/`, form)
        setNotice({ type: 'success', message: 'Évaluation modifiée.' })
      } else {
        await api.post('evaluations/', form)
        setNotice({ type: 'success', message: 'Évaluation ajoutée.' })
      }
      reset()
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette évaluation ?')) return
    try {
      await api.delete(`evaluations/${id}/`)
      setNotice({ type: 'success', message: 'Évaluation supprimée.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const generate = async (evaluation) => {
    try {
      const response = await api.post('fiches/generate/', {
        evaluation: evaluation.id,
        groupe: evaluation.groupe,
      })
      setNotice({
        type: 'success',
        message: `${response.data.created} fiche(s) créée(s), ${response.data.skipped} déjà existante(s).`,
      })
      const ficheIds = response.data.fiches.map((fiche) => fiche.id)
      if (ficheIds.length) {
        navigate(`/fiches/impression?ids=${ficheIds.join(',')}`)
      }
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  return (
    <section>
      <PageHeader title="Évaluations" description="Création des évaluations et lancement des fiches." />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>{editingId ? 'Modifier une évaluation' : 'Ajouter une évaluation'}</h2>
        <form className="grid-form large" onSubmit={submit}>
          <TextInput
            label="Titre"
            value={form.titre}
            onChange={(event) => setForm({ ...form, titre: event.target.value })}
            required
          />
          <SelectInput
            label="Type"
            value={form.type_evaluation}
            onChange={(event) => setForm({ ...form, type_evaluation: event.target.value })}
          >
            {typeEvaluations.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Date"
            type="date"
            value={form.date_evaluation}
            onChange={(event) => setForm({ ...form, date_evaluation: event.target.value })}
            required
          />
          <SelectInput
            label="Filière"
            value={form.filiere}
            onChange={(event) => updateFiliere(event.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            {catalog.filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.nom}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Module"
            value={form.module}
            onChange={(event) => updateModule(event.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            {filteredModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.nom}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Cours"
            value={form.cours}
            onChange={(event) => setForm({ ...form, cours: event.target.value })}
            required
          >
            <option value="">Sélectionner</option>
            {filteredCours.map((cours) => (
              <option key={cours.id} value={cours.id}>
                {cours.nom}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Groupe"
            value={form.groupe}
            onChange={(event) => setForm({ ...form, groupe: event.target.value })}
            required
          >
            <option value="">Sélectionner</option>
            {filteredGroupes.map((groupe) => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Enseignant"
            value={form.enseignant}
            onChange={(event) => setForm({ ...form, enseignant: event.target.value })}
            required
          >
            <option value="">Sélectionner</option>
            {catalog.enseignants.map((enseignant) => (
              <option key={enseignant.id} value={enseignant.id}>
                {enseignant.nom_complet}
              </option>
            ))}
          </SelectInput>
          <FormActions editing={Boolean(editingId)} onCancel={reset} />
        </form>
      </section>
      <section className="panel">
        <h2>Liste des évaluations</h2>
        {loading ? (
          <Loading />
        ) : !evaluations.length ? (
          <EmptyState>Aucune évaluation enregistrée.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Filière</th>
                  <th>Module</th>
                  <th>Cours</th>
                  <th>Groupe</th>
                  <th>Enseignant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.id}>
                    <td>{evaluation.titre}</td>
                    <td>{evaluation.type_evaluation_label}</td>
                    <td>{formatDate(evaluation.date_evaluation)}</td>
                    <td>{evaluation.filiere_nom}</td>
                    <td>{evaluation.module_nom}</td>
                    <td>{evaluation.cours_nom}</td>
                    <td>{evaluation.groupe_nom}</td>
                    <td>{evaluation.enseignant_nom}</td>
                    <td className="actions">
                      <button
                        className="small-btn"
                        type="button"
                        onClick={() => generate(evaluation)}
                      >
                        <FileText size={14} />
                        Générer
                      </button>
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => {
                          setEditingId(evaluation.id)
                          setForm({
                            titre: evaluation.titre,
                            type_evaluation: evaluation.type_evaluation,
                            date_evaluation: evaluation.date_evaluation,
                            filiere: evaluation.filiere,
                            module: evaluation.module,
                            cours: evaluation.cours,
                            groupe: evaluation.groupe,
                            enseignant: evaluation.enseignant,
                          })
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        type="button"
                        onClick={() => remove(evaluation.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function FichesPage() {
  const navigate = useNavigate()
  const [fiches, setFiches] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [groupes, setGroupes] = useState([])
  const [form, setForm] = useState({ evaluation: '', groupe: '' })
  const [eleves, setEleves] = useState([])
  const [selectedEleves, setSelectedEleves] = useState([])
  const [showEleves, setShowEleves] = useState(false)
  const [elevesLoading, setElevesLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ type: '', message: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [fichesResponse, evaluationsResponse, groupesResponse] = await Promise.all([
        api.get('fiches/'),
        api.get('evaluations/'),
        api.get('groupes/'),
      ])
      setFiches(fichesResponse.data)
      setEvaluations(evaluationsResponse.data)
      setGroupes(groupesResponse.data)
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selectedEvaluation = evaluations.find(
    (evaluation) => String(evaluation.id) === String(form.evaluation),
  )

  const availableGroupes = selectedEvaluation
    ? groupes.filter((groupe) => String(groupe.id) === String(selectedEvaluation.groupe))
    : groupes

  const updateEvaluation = (value) => {
    const evaluation = evaluations.find((item) => String(item.id) === String(value))
    setForm({ evaluation: value, groupe: evaluation ? evaluation.groupe : '' })
    setEleves([])
    setSelectedEleves([])
    setShowEleves(false)
  }

  const updateGroupe = (value) => {
    setForm({ ...form, groupe: value })
    setEleves([])
    setSelectedEleves([])
    setShowEleves(false)
  }

  const loadEleves = async () => {
    if (!form.groupe) {
      setNotice({ type: 'error', message: "Sélectionnez d'abord un groupe." })
      return
    }

    setShowEleves(true)
    setElevesLoading(true)
    try {
      const response = await api.get(`eleves/?groupe=${form.groupe}`)
      setEleves(response.data)
      setSelectedEleves(response.data.map((eleve) => eleve.id))
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    } finally {
      setElevesLoading(false)
    }
  }

  const toggleEleve = (id) => {
    setSelectedEleves((current) =>
      current.includes(id) ? current.filter((eleveId) => eleveId !== id) : [...current, id],
    )
  }

  const selectAllEleves = () => {
    setSelectedEleves(eleves.map((eleve) => eleve.id))
  }

  const unselectAllEleves = () => {
    setSelectedEleves([])
  }

  const generate = async (event) => {
    event.preventDefault()
    const payload = { ...form }
    if (showEleves) {
      if (selectedEleves.length === 0) {
        setNotice({
          type: 'error',
          message: 'Sélectionnez au moins un élève avant la génération.',
        })
        return
      }
      payload.eleves = selectedEleves
    }

    try {
      const response = await api.post('fiches/generate/', payload)
      setNotice({
        type: 'success',
        message: `${response.data.created} fiche(s) créée(s), ${response.data.skipped} déjà existante(s).`,
      })
      await load()
      const ficheIds = response.data.fiches.map((fiche) => fiche.id)
      if (ficheIds.length) {
        navigate(`/fiches/impression?ids=${ficheIds.join(',')}`)
      }
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette fiche d'évaluation ?")) return
    try {
      await api.delete(`fiches/${id}/`)
      setNotice({ type: 'success', message: 'Fiche supprimée.' })
      await load()
    } catch (err) {
      setNotice({ type: 'error', message: formatError(err) })
    }
  }

  return (
    <section>
      <PageHeader
        title="Fiches d'évaluation"
        description="Génération automatique et consultation des fiches individuelles."
      />
      <Notice
        message={notice.message}
        type={notice.type || 'success'}
        onClose={() => setNotice({ type: '', message: '' })}
      />
      <section className="panel">
        <h2>Générer des fiches</h2>
        <form className="grid-form" onSubmit={generate}>
          <SelectInput
            label="Évaluation"
            value={form.evaluation}
            onChange={(event) => updateEvaluation(event.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            {evaluations.map((evaluation) => (
              <option key={evaluation.id} value={evaluation.id}>
                {evaluation.titre} - {evaluation.groupe_nom}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Groupe"
            value={form.groupe}
            onChange={(event) => updateGroupe(event.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            {availableGroupes.map((groupe) => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom}
              </option>
            ))}
          </SelectInput>
          <div className="form-actions">
            <button className="secondary-btn" type="button" onClick={loadEleves}>
              <Users size={16} />
              Voir élèves
            </button>
            <button className="primary-btn" type="submit">
              <FileText size={16} />
              Générer
            </button>
          </div>
        </form>
        {showEleves && (
          <div className="student-selection">
            <div className="panel-title">
              <div>
                <h2>Élèves du groupe</h2>
                <p>
                  {selectedEleves.length} élève(s) sélectionné(s) sur {eleves.length}
                </p>
              </div>
              <div className="actions">
                <button className="small-btn" type="button" onClick={selectAllEleves}>
                  Tout sélectionner
                </button>
                <button className="small-btn" type="button" onClick={unselectAllEleves}>
                  Tout désélectionner
                </button>
              </div>
            </div>
            {elevesLoading ? (
              <Loading />
            ) : !eleves.length ? (
              <EmptyState>Aucun élève dans ce groupe.</EmptyState>
            ) : (
              <div className="student-grid">
                {eleves.map((eleve) => (
                  <label className="student-option" key={eleve.id}>
                    <input
                      type="checkbox"
                      checked={selectedEleves.includes(eleve.id)}
                      onChange={() => toggleEleve(eleve.id)}
                    />
                    <span>
                      <strong>
                        {eleve.nom} {eleve.prenom}
                      </strong>
                      <small>
                        {eleve.id_eleve} - {eleve.id_national}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <section className="panel">
        <h2>Fiches générées</h2>
        {loading ? (
          <Loading />
        ) : !fiches.length ? (
          <EmptyState>Aucune fiche générée.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Évaluation</th>
                  <th>Groupe</th>
                  <th>Cours</th>
                  <th>Générée le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fiches.map((fiche) => (
                  <tr key={fiche.id}>
                    <td>
                      {fiche.eleve_nom} {fiche.eleve_prenom}
                    </td>
                    <td>{fiche.evaluation_titre}</td>
                    <td>{fiche.groupe_nom}</td>
                    <td>{fiche.cours_nom}</td>
                    <td>{formatDate(fiche.date_generation)}</td>
                    <td className="actions">
                      <Link className="icon-btn" to={`/fiches/${fiche.id}`} aria-label="Voir">
                        <Eye size={16} />
                      </Link>
                      <button
                        className="icon-btn danger"
                        type="button"
                        onClick={() => remove(fiche.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function FichePaper({ fiche }) {
  return (
    <article className="fiche-paper">
      <header className="fiche-header">
        <div className="logo-box">
          <img src={ministreLogo} alt="Ministère" />
        </div>
        <div className="logo-box">
          <img src={ecoleLogo} alt="École" />
        </div>
      </header>
      <section className="fiche-title">
        <strong>{fiche.evaluation_titre}</strong>
      </section>
      <section className="fiche-session">Session: 2025/2026</section>
      <section className="fiche-grid">
        <div>
          <p>
            <strong>Filiere:</strong> {fiche.filiere_nom}
          </p>
          <p>
            <strong>Module:</strong> {fiche.module_nom}
          </p>
          <p>
            <strong>Cours:</strong> {fiche.cours_nom}
          </p>
        </div>
        <div>
          <p>
            <strong>Groupe:</strong> {fiche.groupe_nom}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(fiche.evaluation_date)}
          </p>
          <p>
            <strong>Type d'evaluation:</strong> {fiche.evaluation_type}
          </p>
        </div>
      </section>
      <section className="fiche-person">
        <p>
          <strong>Enseignant:</strong> {fiche.enseignant_nom}
        </p>
      </section>
      <section className="fiche-student">
        <p>
          <strong>Nom d'étudiant :</strong> {fiche.eleve_nom} {fiche.eleve_prenom}
        </p>
        <p>
          <strong>Code national de l'étudiant :</strong> {fiche.eleve_id_national}
        </p>
      </section>
      <footer className="fiche-footer">
        <p>
          <strong>Note :</strong> _________ / 20
        </p>
        <div className="signatures">
          <span>
            <strong>Signature Enseignant:</strong>
          </span>
          <span>
            <strong>Signature Élève:</strong>
          </span>
        </div>
        <div className="signatures lines">
          <span>____________________</span>
          <span>____________________</span>
        </div>
      </footer>
    </article>
  )
}

function FicheCollectionPage() {
  const [searchParams] = useSearchParams()
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const ids = useMemo(
    () =>
      (searchParams.get('ids') || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    [searchParams],
  )

  useEffect(() => {
    let active = true
    async function load() {
      if (!ids.length) {
        setError('Aucune fiche sélectionnée pour l’impression.')
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const responses = await Promise.all(ids.map((id) => api.get(`fiches/${id}/`)))
        if (active) setFiches(responses.map((response) => response.data))
      } catch (err) {
        if (active) setError(formatError(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [ids])

  if (loading) return <Loading />
  if (error) return <Notice message={error} type="error" />
  if (!fiches.length) return <EmptyState>Aucune fiche à imprimer.</EmptyState>

  return (
    <section>
      <PageHeader
        title="Fiches générées"
        description={`${fiches.length} fiche(s) dans ce document.`}
        action={
          <div className="actions">
            <button className="primary-btn" type="button" onClick={() => window.print()}>
              <Printer size={16} />
              Imprimer
            </button>
            <Link className="secondary-btn" to="/fiches">
              Retour
            </Link>
          </div>
        }
      />
      <div className="print-area collection-print-area">
        {fiches.map((fiche) => (
          <FichePaper key={fiche.id} fiche={fiche} />
        ))}
      </div>
    </section>
  )
}

function FicheDetailPage() {
  const { id } = useParams()
  const [fiche, setFiche] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        const response = await api.get(`fiches/${id}/`)
        if (active) setFiche(response.data)
      } catch (err) {
        if (active) setError(formatError(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loading />
  if (error) return <Notice message={error} type="error" />
  if (!fiche) return <EmptyState>Fiche introuvable.</EmptyState>

  return (
    <section>
      <PageHeader
        title="Détail de la fiche"
        description={`${fiche.eleve_nom} ${fiche.eleve_prenom} - ${fiche.evaluation_titre}`}
        action={
          <div className="actions">
            <button className="primary-btn" type="button" onClick={() => window.print()}>
              <Printer size={16} />
              Imprimer
            </button>
            <Link className="secondary-btn" to="/fiches">
              Retour
            </Link>
          </div>
        }
      />
      <div className="print-area">
        <FichePaper fiche={fiche} />
      </div>
    </section>
  )
}

function App() {
  const { token, saveToken, clearToken } = useToken()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage saveToken={saveToken} />}
        />
        <Route
          path="/*"
          element={token ? <AppLayout clearToken={clearToken} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
