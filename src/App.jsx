import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

const todayString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDueDate = (dueDate) => {
  if (!dueDate) return null
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

const isOverdue = (todo) => Boolean(todo.dueDate) && !todo.done && todo.dueDate < todayString()

// Web Audio API 音效
const audioCtx = () => new (window.AudioContext || window.webkitAudioContext)()

function playAdd() {
  const ctx = audioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(520, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12)
  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.25)
}

function playDone() {
  const ctx = audioCtx()
  const notes = [523, 659, 784]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    const t = ctx.currentTime + i * 0.1
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.start(t)
    osc.stop(t + 0.2)
  })
}

function playDelete() {
  const ctx = audioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(320, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.18)
}

function TodoItem({ todo, isLast, onToggle, onDelete }) {
  const overdue = isOverdue(todo)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        isLast ? '' : 'border-b border-white/10'
      } ${isDragging ? 'bg-white/15 shadow-lg' : 'hover:bg-white/5'}`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none text-white/30 hover:text-white/60 transition-colors select-none text-lg"
        aria-label="拖拽排序"
        {...attributes}
        {...listeners}
      >
        ≡
      </button>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 accent-yellow-400 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className={`truncate ${
          todo.done
            ? 'line-through text-white/40'
            : overdue
              ? 'text-red-200 font-semibold'
              : todo.priority === 'high'
                ? 'text-yellow-200 font-semibold'
                : 'text-white'
        }`}>
          {todo.text}
        </div>
        {todo.dueDate && (
          <div className={`mt-0.5 text-xs ${overdue ? 'text-red-300' : 'text-white/50'}`}>
            {overdue ? '⚠ 已过期' : '截止'}: {formatDueDate(todo.dueDate)}
          </div>
        )}
      </div>
      {todo.priority === 'high' && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 shrink-0">
          高
        </span>
      )}
      <button
        onClick={() => { playDelete(); onDelete(todo.id) }}
        className="text-white/25 hover:text-red-400 transition-colors text-xl leading-none shrink-0"
      >
        ×
      </button>
    </li>
  )
}

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos')
    return saved
      ? JSON.parse(saved).map(todo => ({
          ...todo,
          priority: todo.priority ?? 'low',
          dueDate: todo.dueDate ?? '',
        }))
      : []
  })
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('low')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('全部')
  const [bgIndex, setBgIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [encouragement, setEncouragement] = useState(null)
  const [btnPressed, setBtnPressed] = useState(false)
  const encouragementTimer = useRef(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setBgIndex(i => (i + 1) % F1_IMAGES.length)
        setFadeIn(true)
      }, 600)
    }, 3000)
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
    playAdd()
    setBtnPressed(true)
    setTimeout(() => setBtnPressed(false), 150)
    setTodos([...todos, { id: Date.now(), text, done: false, priority, dueDate }])
    setInput('')
    setPriority('low')
    setDueDate('')
  }

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo.done) { playDone(); showEncouragement() }
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    playDelete()
    setTodos(todos.filter(t => !t.done))
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const visibleTodos = todos.filter(t => {
      if (filter === '待完成') return !t.done
      if (filter === '已完成') return t.done
      return true
    })
    const oldIndex = visibleTodos.findIndex(t => t.id === active.id)
    const newIndex = visibleTodos.findIndex(t => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reorderedVisible = arrayMove(visibleTodos, oldIndex, newIndex)
    const visibleIds = new Set(visibleTodos.map(t => t.id))
    let vi = 0
    setTodos(todos.map(todo => visibleIds.has(todo.id) ? reorderedVisible[vi++] : todo))
  }

  const filtered = todos.filter(t => {
    if (filter === '待完成') return !t.done
    if (filter === '已完成') return t.done
    return true
  })

  const remaining = todos.filter(t => !t.done).length

  return (
    <div className="min-h-screen relative flex items-start justify-center pt-12 px-4 overflow-hidden">
      {/* F1 背景图 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-600"
        style={{ backgroundImage: `url(${F1_IMAGES[bgIndex]})`, opacity: fadeIn ? 1 : 0 }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-1 tracking-tight drop-shadow-lg">
          🏎️ 待办事项
        </h1>
        <p className="text-center text-white/50 text-sm mb-6">F1 赛场上的每一圈，都值得全力以赴</p>

        {/* 鼓励语 */}
        <div className="mb-4 text-center" style={{ minHeight: '2.25rem' }}>
          {encouragement && (
            <span className="inline-block bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
              {encouragement}
            </span>
          )}
        </div>

        {/* 输入区 — 重新布局 */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-5 shadow-xl">
          {/* 第一行：任务输入框 */}
          <input
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base mb-3"
            placeholder="输入新任务..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          {/* 第二行：优先级 + 截止日期 */}
          <div className="flex gap-2 mb-4">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="low" className="text-gray-900">普通优先级</option>
              <option value="high" className="text-gray-900">⚡ 高优先级</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          {/* 居中添加按钮 */}
          <div className="flex justify-center">
            <button
              onClick={addTodo}
              style={{
                transform: btnPressed ? 'scale(0.94)' : 'scale(1)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                boxShadow: btnPressed
                  ? '0 2px 8px rgba(250,204,21,0.3)'
                  : '0 6px 24px rgba(250,204,21,0.45), 0 2px 8px rgba(0,0,0,0.3)',
              }}
              className="px-12 py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-gray-900 rounded-2xl font-bold text-base tracking-wide"
            >
              + 添加任务
            </button>
          </div>
        </div>

        {/* 过滤器 */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-yellow-400 text-gray-900 shadow-lg font-bold scale-105'
                  : 'bg-white/10 backdrop-blur text-white/70 hover:bg-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl overflow-hidden mb-4 shadow-xl">
          {filtered.length === 0 ? (
            <p className="text-center text-white/40 py-10 text-sm">暂无任务，出发吧 🏁</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <ul>
                  {filtered.map((todo, i) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isLast={i === filtered.length - 1}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* 底部状态栏 */}
        {todos.length > 0 && (
          <div className="flex justify-between items-center text-sm text-white/50 px-1 pb-8">
            <span>{remaining} 项待完成</span>
            <button onClick={clearCompleted} className="hover:text-red-400 transition-colors">
              清除已完成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
