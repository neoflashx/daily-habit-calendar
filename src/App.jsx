import React, { useState, useEffect } from 'react'
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  isBefore, 
  startOfYear, 
  endOfYear,
  getWeek,
  subDays
} from 'date-fns'
import { FaCheck, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const loadHabits = () => {
  try {
    const savedHabits = localStorage.getItem('habits')
    return savedHabits ? JSON.parse(savedHabits) : []
  } catch (error) {
    console.error('Error loading habits:', error)
    return []
  }
}

const saveHabits = (habits) => {
  try {
    localStorage.setItem('habits', JSON.stringify(habits))
  } catch (error) {
    console.error('Error saving habits:', error)
  }
}

const App = () => {
  const [habits, setHabits] = useState(loadHabits())
  const [newHabit, setNewHabit] = useState('')
  const [view, setView] = useState('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showHabitList, setShowHabitList] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  const addHabit = () => {
    if (newHabit.trim()) {
      const newHabitObj = {
        id: Date.now(),
        name: newHabit,
        created: new Date().toISOString(),
        completedDays: []
      }
      setHabits(prevHabits => {
        const updatedHabits = [...prevHabits, newHabitObj]
        saveHabits(updatedHabits)
        return updatedHabits
      })
      setNewHabit('')
    }
  }

  const deleteHabit = (habitId) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.filter(habit => habit.id !== habitId)
      saveHabits(updatedHabits)
      return updatedHabits
    })
  }

  const toggleHabit = (habitId, date) => {
    if (date.getFullYear() !== currentYear) return
    
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(habit => {
        if (habit.id === habitId) {
          const completedDays = habit.completedDays.includes(date.toISOString())
            ? habit.completedDays.filter(d => d !== date.toISOString())
            : [...habit.completedDays, date.toISOString()]
          return { ...habit, completedDays }
        }
        return habit
      })
      saveHabits(updatedHabits)
      return updatedHabits
    })
  }

  const getCompletionStatus = (date) => {
    const activeHabits = habits.filter(habit => 
      isBefore(new Date(habit.created), date) || 
      isSameDay(new Date(habit.created), date)
    )
    
    if (activeHabits.length === 0) return false
    
    return activeHabits.every(habit => 
      habit.completedDays.includes(date.toISOString())
    )
  }

  const isDateInCurrentYear = (date) => {
    return date.getFullYear() === currentYear
  }

  const handleDateClick = (date) => {
    if (isDateInCurrentYear(date)) {
      setCurrentDate(date)
      setView('day')
    }
  }

  const renderDayView = () => {
    const isCurrentYear = isDateInCurrentYear(currentDate)
    
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(prev => subDays(prev, 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-bold">
            Daily View - {format(currentDate, 'MMMM d, yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(prev => addDays(prev, 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaArrowRight />
          </button>
        </div>
        {habits.map(habit => {
          const isHabitActive = isBefore(new Date(habit.created), currentDate) || 
            isSameDay(new Date(habit.created), currentDate)
          
          if (!isHabitActive || !isCurrentYear) return null
          
          return (
            <div key={habit.id} className="flex items-center mb-2">
              <button
                onClick={() => toggleHabit(habit.id, currentDate)}
                className={`w-6 h-6 mr-2 flex items-center justify-center border rounded ${
                  habit.completedDays.includes(currentDate.toISOString())
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                {habit.completedDays.includes(currentDate.toISOString()) && <FaCheck className="text-white" />}
              </button>
              <span>{habit.name}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate)
    const weekNumber = getWeek(currentDate)
    
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(prev => subWeeks(prev, 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-bold">
            Weekly View - Week {weekNumber} ({format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d')})
          </h2>
          <button
            onClick={() => setCurrentDate(prev => addWeeks(prev, 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, index) => {
            const day = addDays(startDate, index)
            const isCompleted = getCompletionStatus(day)
            const isCurrentYear = isDateInCurrentYear(day)
            
            return (
              <div 
                key={index} 
                className={`text-center p-2 rounded cursor-pointer ${
                  !isCurrentYear ? 'bg-gray-100 text-gray-400' :
                  isCompleted ? 'bg-green-100' : 'bg-white'
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="font-bold">{format(day, 'EEE')}</div>
                <div className="text-sm">{format(day, 'd')}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    const startDay = start.getDay()
    
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-bold">
            Monthly View - {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-bold text-center">{day}</div>
          ))}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}
          {days.map(day => {
            const isCompleted = getCompletionStatus(day)
            const isCurrentYear = isDateInCurrentYear(day)
            
            return (
              <div
                key={day.toISOString()}
                className={`p-2 text-center rounded cursor-pointer ${
                  !isCurrentYear ? 'bg-gray-100 text-gray-400' :
                  isCompleted ? 'bg-green-100' : 'bg-white'
                }`}
                onClick={() => handleDateClick(day)}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderHabitList = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Habit List</h2>
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center justify-between mb-2">
            <div>
              <span>{habit.name}</span>
              <span className="ml-2 text-gray-500">({habit.completedDays.length} times)</span>
            </div>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setView('day')}
              className={`p-2 rounded ${view === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaCalendarDay />
            </button>
            <button
              onClick={() => setView('week')}
              className={`p-2 rounded ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaCalendarWeek />
            </button>
            <button
              onClick={() => setView('month')}
              className={`p-2 rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaCalendarAlt />
            </button>
            <button
              onClick={() => setShowHabitList(!showHabitList)}
              className={`p-2 rounded ${showHabitList ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Habits
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="New habit"
              className="border p-2 rounded"
            />
            <button onClick={addHabit} className="bg-blue-500 text-white px-4 py-2 rounded">
              Add
            </button>
          </div>
        </div>
        {showHabitList ? renderHabitList() : (
          <>
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </>
        )}
      </div>
    </div>
  )
}

export default App
