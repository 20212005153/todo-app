import { useState, useEffect, useRef } from 'react'

const FILTERS = ['全部', '待完成', '已完成']

const F1_IMAGES = [
  'https://loremflickr.com/1920/1080/formula1?lock=1',
  'https://loremflickr.com/1920/1080/formula1?lock=2',
  'https://loremflickr.com/1920/1080/formula1?lock=3',
  'https://loremflickr.com/1920/1080/formula1?lock=4',
  'https://loremflickr.com/1920/1080/formula1?lock=5',
  'https://loremflickr.com/1920/1080/formula1?lock=6',
]

const ENCOURAGEMENTS = [
  '🏎️ 全力冲刺，就像维斯塔潘进弯！',
  '🏁 完赛比完美更重要，继续前进！',
  '🔧 每一个小任务都是调校赛车的一步！',
  '🥇 冠军也是一圈一圈跑出来的！',
  '⚡ 进站换胎只是为了跑得更快！',
  '🎯 保持专注，终点就在前方！',
  '💪 车手不怕压力，你也不怕！',
  '🚀 DRS 已开启，全速前进！',
]

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('全部')
  const [bgIndex, setBgIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [encouragement, setEncouragement] = useState(null)
  const encouragementTimer = useRef(null)

  // 背景图轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setBgIndex(i => (i + 1) % F1_IMAGES.length)
        setFadeIn(true)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const showEncouragement = () => {
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    setEncouragement(msg)
    clearTimeout(encouragementTimer.current)
    encouragementTimer.current = setTimeout(() => setEncouragement(null), 3000)
  }

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false }])
    setInput('')
  }

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo.done) showEncouragement()
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
    <div className="min-h-screen relative flex items-start justify-center pt-16 px-4 overflow-hidden">
      {/* F1 背景图 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-600"
        style={{
          backgroundImage: `url(${F1_IMAGES[bgIndex]})`,
          opacity: fadeIn ? 1 : 0,
        }}
      />
      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-black/55" />

      {/* 主内容 */}
      <div className="relative w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-2 tracking-tight drop-shadow-lg">
          🏎️ 待办事项
        </h1>
        <p className="text-center text-white/60 text-sm mb-6">F1 赛场上的每一圈，都值得全力以赴</p>

        {/* 鼓励语弹出 */}
        <div
          className="mb-4 text-center transition-all duration-500"
          style={{ minHeight: '2rem' }}
        >
          {encouragement && (
            <span className="inline-block bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
              {encouragement}
            </span>
          )}
        </div>

        {/* 输入框 */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/15 backdrop-blur text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="添加新任务..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          <button
            onClick={addTodo}
            className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl font-bold shadow transition-colors"
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
                  ? 'bg-yellow-400 text-gray-900 shadow font-bold'
                  : 'bg-white/15 backdrop-blur text-white/80 hover:bg-white/25'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl overflow-hidden mb-4">
          {filtered.length === 0 ? (
            <p className="text-center text-white/50 py-10">暂无任务</p>
          ) : (
            <ul>
              {filtered.map((todo, i) => (
                <li
                  key={todo.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i !== filtered.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 accent-yellow-400 cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      todo.done ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-white/30 hover:text-red-400 transition-colors text-lg leading-none"
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
          <div className="flex justify-between items-center text-sm text-white/60 px-1">
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
