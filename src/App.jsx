import { useState, useEffect } from 'react'

const FILTERS = ['全部', '待完成', '已完成']

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('全部')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false }])
    setInput('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.done))
  }

  const filtered = todos.filter(t => {
    if (filter === '待完成') return !t.done
    if (filter === '已完成') return t.done
    return true
  })

  const remaining = todos.filter(t => !t.done).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-blue-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-violet-700 mb-8 tracking-tight">
          待办事项
        </h1>

        {/* 输入框 */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 px-4 py-3 rounded-xl border border-violet-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-gray-700 placeholder-gray-400"
            placeholder="添加新任务..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          <button
            onClick={addTodo}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-sm transition-colors"
          >
            添加
          </button>
        </div>

        {/* 过滤器 */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-violet-600 text-white shadow'
                  : 'bg-white text-gray-500 hover:bg-violet-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10">暂无任务</p>
          ) : (
            <ul>
              {filtered.map((todo, i) => (
                <li
                  key={todo.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i !== filtered.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 accent-violet-600 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-gray-700 ${
                      todo.done ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 底部状态栏 */}
        {todos.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-500 px-1">
            <span>{remaining} 项待完成</span>
            <button
              onClick={clearCompleted}
              className="hover:text-red-400 transition-colors"
            >
              清除已完成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
