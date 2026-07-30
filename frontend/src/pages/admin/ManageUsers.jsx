import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Ban, Loader2, Users, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  BANNED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-slate-100 text-slate-600',
}

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve')
    try {
      await api.put(`/admin/users/${id}/approve`)
      toast.success('User approved! Approval email sent.')
      loadUsers()
    } catch (err) {
      toast.error('Failed to approve user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id + '_reject')
    try {
      await api.put(`/admin/users/${id}/reject`)
      toast.success('User rejected!')
      loadUsers()
    } catch (err) {
      toast.error('Failed to reject user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBan = async (id) => {
    setActionLoading(id + '_ban')
    try {
      await api.put(`/admin/users/${id}/ban`)
      toast.success('User banned!')
      loadUsers()
    } catch (err) {
      toast.error('Failed to ban user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnban = async (id) => {
    setActionLoading(id + '_unban')
    try {
      await api.put(`/admin/users/${id}/approve`)
      toast.success('User unbanned!')
      loadUsers()
    } catch (err) {
      toast.error('Failed to unban user')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(u => {
    if (filter === 'ALL') return u.role === 'USER'
  })

  const pendingCount = users.filter(u => u.status === 'PENDING_APPROVAL').length

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
            {pendingCount > 0 && (
              <p className="text-sm text-amber-600 font-medium mt-1">
                ⚠️ {pendingCount} user{pendingCount > 1 ? 's' : ''} pending approval
              </p>
            )}
          </div>
          <button onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'ALL', label: 'All Users' },
            { key: 'PENDING_APPROVAL', label: '⏳ Pending' },
            { key: 'APPROVED', label: '✅ Approved' },
            { key: 'REJECTED', label: '❌ Rejected' },
            { key: 'BANNED', label: '🚫 Banned' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
              }`}>
              {label}
              {key === 'PENDING_APPROVAL' && pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Name', 'Email', 'Mobile', 'GST', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-xs flex-shrink-0">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-slate-600">{user.mobile || '-'}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{user.gstNumber || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[user.status]}`}>
                          {user.status === 'PENDING_APPROVAL' ? 'PENDING' : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          {/* Pending users */}
                          {user.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                disabled={actionLoading === user.id + '_approve'}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-60">
                                {actionLoading === user.id + '_approve'
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <CheckCircle className="w-3 h-3" />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                disabled={actionLoading === user.id + '_reject'}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-60">
                                {actionLoading === user.id + '_reject'
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <XCircle className="w-3 h-3" />}
                                Reject
                              </button>
                            </>
                          )}

                          {/* Approved users */}
                          {user.status === 'APPROVED' && (
                            <button
                              onClick={() => handleBan(user.id)}
                              disabled={actionLoading === user.id + '_ban'}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-60">
                              {actionLoading === user.id + '_ban'
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Ban className="w-3 h-3" />}
                              Ban
                            </button>
                          )}

                          {/* Banned users */}
                          {user.status === 'BANNED' && (
                            <button
                              onClick={() => handleUnban(user.id)}
                              disabled={actionLoading === user.id + '_unban'}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-60">
                              {actionLoading === user.id + '_unban'
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCircle className="w-3 h-3" />}
                              Unban
                            </button>
                          )}

                          {/* Rejected users */}
                          {user.status === 'REJECTED' && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={actionLoading === user.id + '_approve'}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-60">
                              {actionLoading === user.id + '_approve'
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageUsers
