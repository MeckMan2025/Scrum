import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, X, Plus, Trash2 } from 'lucide-react'

const DEFAULT_ORG = [
  {
    id: 'team-lead',
    name: '',
    role: 'Team Lead',
    reports_to: null,
    current_tasks: [],
    children: [
      {
        id: 'tech-lead',
        name: '',
        role: 'Technical Lead',
        reports_to: 'Team Lead',
        current_tasks: [],
        children: [
          { id: 'programming', name: '', role: 'Programming', reports_to: 'Technical Lead', current_tasks: [], children: [] },
          { id: 'cad', name: '', role: 'CAD', reports_to: 'Technical Lead', current_tasks: [], children: [] },
          { id: 'build', name: '', role: 'Build', reports_to: 'Technical Lead', current_tasks: [], children: [] },
          { id: 'website-tech', name: '', role: 'Website (Technical)', reports_to: 'Technical Lead', current_tasks: [], children: [] },
        ],
      },
      {
        id: 'biz-lead',
        name: '',
        role: 'Business Lead',
        reports_to: 'Team Lead',
        current_tasks: [],
        children: [
          { id: 'outreach', name: '', role: 'Outreach', reports_to: 'Business Lead', current_tasks: [], children: [] },
          { id: 'communications', name: '', role: 'Communications', reports_to: 'Business Lead', current_tasks: [], children: [] },
          { id: 'scouting-role', name: '', role: 'Scouting', reports_to: 'Business Lead', current_tasks: [], children: [] },
          { id: 'website-biz', name: '', role: 'Website (Non-Technical)', reports_to: 'Business Lead', current_tasks: [], children: [] },
        ],
      },
    ],
  },
]

function OrgChart() {
  const [org, setOrg] = useState(() => {
    const saved = localStorage.getItem('org-chart-data')
    return saved ? JSON.parse(saved) : DEFAULT_ORG
  })
  const [selectedNode, setSelectedNode] = useState(null)
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('org-chart-expanded')
    return saved ? JSON.parse(saved) : ['team-lead', 'tech-lead', 'biz-lead']
  })

  useEffect(() => {
    localStorage.setItem('org-chart-data', JSON.stringify(org))
  }, [org])

  useEffect(() => {
    localStorage.setItem('org-chart-expanded', JSON.stringify(expanded))
  }, [expanded])

  const toggleExpand = (id) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  // Deep update a node in the tree
  const updateNode = (nodes, id, updates) => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, ...updates }
      if (node.children.length > 0) {
        return { ...node, children: updateNode(node.children, id, updates) }
      }
      return node
    })
  }

  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children.length > 0) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const handleUpdateName = (name) => {
    setOrg(prev => updateNode(prev, selectedNode.id, { name }))
    setSelectedNode(prev => ({ ...prev, name }))
  }

  const handleAddTask = () => {
    const newTask = { task_name: '', percent_complete: 0 }
    const updated = [...selectedNode.current_tasks, newTask]
    setOrg(prev => updateNode(prev, selectedNode.id, { current_tasks: updated }))
    setSelectedNode(prev => ({ ...prev, current_tasks: updated }))
  }

  const handleUpdateTask = (index, field, value) => {
    const updated = selectedNode.current_tasks.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    )
    setOrg(prev => updateNode(prev, selectedNode.id, { current_tasks: updated }))
    setSelectedNode(prev => ({ ...prev, current_tasks: updated }))
  }

  const handleDeleteTask = (index) => {
    const updated = selectedNode.current_tasks.filter((_, i) => i !== index)
    setOrg(prev => updateNode(prev, selectedNode.id, { current_tasks: updated }))
    setSelectedNode(prev => ({ ...prev, current_tasks: updated }))
  }

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children.length > 0
    const isExpanded = expanded.includes(node.id)
    const displayName = node.name || '(No name set)'

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-pastel-blue/30 ${
            selectedNode?.id === node.id ? 'bg-pastel-pink/40' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => setSelectedNode({ ...node })}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(node.id)
              }}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-800 block truncate">{displayName}</span>
            <span className="text-xs text-gray-400">{node.role}</span>
          </div>
          {node.current_tasks.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-pastel-orange/50 text-gray-600 rounded-full shrink-0">
              {node.current_tasks.length} task{node.current_tasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 pl-14">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pastel-blue-dark via-pastel-pink-dark to-pastel-orange-dark bg-clip-text text-transparent">
            Org Chart
          </h1>
          <p className="text-sm text-gray-500">Click a member to view or edit their profile</p>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Tree */}
          <div className="bg-white/70 rounded-xl shadow-sm p-2">
            {org.map(node => renderNode(node))}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {selectedNode && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSelectedNode(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md pointer-events-auto relative max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>

              {/* Role */}
              <span className="text-xs font-semibold uppercase tracking-wide text-pastel-pink-dark">{selectedNode.role}</span>

              {/* Name */}
              <div className="mt-2 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => handleUpdateName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pastel-blue focus:border-transparent"
                />
              </div>

              {/* Reports To */}
              {selectedNode.reports_to && (
                <p className="text-sm text-gray-500 mb-4">
                  Reports to: <span className="font-medium text-gray-700">{selectedNode.reports_to}</span>
                </p>
              )}

              {/* Tasks */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Current Tasks</h3>
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-pastel-blue/40 hover:bg-pastel-blue/60 rounded-lg transition-colors text-gray-600"
                  >
                    <Plus size={12} />
                    Add Task
                  </button>
                </div>

                {selectedNode.current_tasks.length === 0 ? (
                  <p className="text-sm text-gray-400">No tasks assigned</p>
                ) : (
                  <div className="space-y-3">
                    {selectedNode.current_tasks.map((task, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="text"
                            value={task.task_name}
                            onChange={(e) => handleUpdateTask(i, 'task_name', e.target.value)}
                            placeholder="Task name"
                            className="flex-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-pastel-blue focus:border-transparent"
                          />
                          <button
                            onClick={() => handleDeleteTask(i)}
                            className="p-1 hover:text-red-400 text-gray-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.percent_complete}
                            onChange={(e) => handleUpdateTask(i, 'percent_complete', Number(e.target.value))}
                            className="flex-1 accent-pastel-pink-dark"
                          />
                          <span className="text-xs font-medium text-gray-600 w-10 text-right">{task.percent_complete}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OrgChart
