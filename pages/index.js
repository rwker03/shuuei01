import { useState, useEffect } from 'react'
import Head from 'next/head'
// import '../styles/globals.css' // We've moved global styles to _app.js

const generateTimeOptions = (start, end, interval) => {
  const options = []
  for (let i = start; i <= end; i += interval) {
    const hours = Math.floor(i / 60).toString().padStart(2, '0')
    const minutes = (i % 60).toString().padStart(2, '0')
    options.push(`${hours}:${minutes}`)
  }
  return options
}

const startTimeOptions = generateTimeOptions(20 * 60, 23 * 60, 15)
const endTimeOptions = generateTimeOptions(4 * 60 + 30, 7 * 60, 15)

export default function Home() {
  const [workers, setWorkers] = useState([])
  const [workerType, setWorkerType] = useState('社員') // Changed to "社員"
  const [startTime, setStartTime] = useState('20:00')
  const [endTime, setEndTime] = useState('05:00')
  const [workerCount, setWorkerCount] = useState(1)
  const [dailyRecords, setDailyRecords] = useState([])

  useEffect(() => {
    const storedRecords = localStorage.getItem('dailyRecords')
    if (storedRecords) {
      setDailyRecords(JSON.parse(storedRecords))
    }
  }, [])

  const addWorkers = () => {
    const newWorker = { 
      type: workerType, 
      startTime, 
      endTime, 
      count: workerCount 
    }
    setWorkers([...workers, newWorker])
    resetForm()
  }

  const resetForm = () => {
    setWorkerType('社員') // Changed to "社員"
    setStartTime('20:00')
    setEndTime('05:00')
    setWorkerCount(1)
  }

  const resetCurrentDay = () => {
    setWorkers([])
  }

  const calculateHours = (worker) => {
    const start = new Date(`2000-01-01T${worker.startTime}:00`)
    let end = new Date(`2000-01-01T${worker.endTime}:00`)
    if (end <= start) end.setDate(end.getDate() + 1)

    let diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60 - 1 // Subtract 1 hour for break
    return Math.max(0, diff)
  }

  const calculateOvertime = (worker) => {
    const hours = calculateHours(worker)
    return Math.max(0, hours - 8)
  }

  const totalWorkers = workers.reduce((sum, worker) => sum + worker.count, 0)
  const totalHours = workers.reduce((sum, worker) => sum + calculateHours(worker) * worker.count, 0)
  const hours = Math.floor(totalHours)
  const minutes = Math.round((totalHours - hours) * 60)

  const 社員Overtime = workers
    .filter(w => w.type === '社員')
    .map(worker => ({
      count: worker.count,
      minutes: Math.round(calculateOvertime(worker) * 60)
    }))
    .filter(ot => ot.minutes > 0)

  const バイトOvertime = workers
    .filter(w => w.type === 'バイト')
    .reduce((sum, worker) => sum + calculateOvertime(worker) * worker.count, 0)

  const saveDailyRecord = () => {
    const today = new Date()
    const dateString = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`

    const newRecord = {
      date: dateString,
      totalWorkers,
      totalHours,
      社員Overtime,
      バイトOvertime
    }

    const updatedRecords = [newRecord, ...dailyRecords.slice(0, 6)]
    setDailyRecords(updatedRecords)
    localStorage.setItem('dailyRecords', JSON.stringify(updatedRecords))
    setWorkers([])
  }

  const formatTime = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h${m.toString().padStart(2, '0')}min`
  }

  const formatOvertimeInfo = (overtimeInfo) => {
    if (Array.isArray(overtimeInfo)) {
      return overtimeInfo.map(ot => `${ot.count}人 ${ot.minutes}min`).join(', ') || 'なし'
    } else {
      return formatTime(overtimeInfo)
    }
  }

  return (
    <div className="min-h-screen p-4 border rounded-lg"> 
      <Head>
        <title>秀英　夜勤作業時間</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">秀英　夜勤作業時間</h1>

        <form onSubmit={(e) => { e.preventDefault(); addWorkers(); }} className="space-y-4">
          <div className="space-y-2">
            <label className="block">Worker Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['社員', 'バイト'].map((type) => ( 
                <button
                  key={type}
                  type="button"
                  className={`w-full py-2 rounded ${
                    workerType === type
                      ? 'bg-blue-600 text-white border-white'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                  onClick={() => setWorkerType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4"> 
            <div className="space-y-2">
              <label htmlFor="startTime" className="block">Start Time</label>
              <select
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-800 text-white border-gray-700 rounded p-2"
              >
                {startTimeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="block">End Time</label>
              <select
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-800 text-white border-gray-700 rounded p-2"
              >
                {endTimeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block">Number of Workers</label>
            <div className="grid grid-cols-5 gap-2"> 
              <div className="grid grid-rows-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={`w-full py-2 rounded ${
                      workerCount === i + 1
                        ? 'bg-blue-600 text-white border-white'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setWorkerCount(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="grid grid-rows-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i + 6}
                    type="button"
                    className={`w-full py-2 rounded ${
                      workerCount === i + 6
                        ? 'bg-blue-600 text-white border-white'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setWorkerCount(i + 6)}
                  >
                    {i + 6}
                  </button>
                ))}
              </div>
              <div className="grid grid-rows-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i + 11}
                    type="button"
                    className={`w-full py-2 rounded ${
                      workerCount === i + 11
                        ? 'bg-blue-600 text-white border-white'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setWorkerCount(i + 11)}
                  >
                    {i + 11}
                  </button>
                ))}
              </div>
              <div className="grid grid-rows-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i + 16}
                    type="button"
                    className={`w-full py-2 rounded ${
                      workerCount === i + 16
                        ? 'bg-blue-600 text-white border-white'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setWorkerCount(i + 16)}
                  >
                    {i + 16}
                  </button>
                ))}
              </div>
              <div className="grid grid-rows-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i + 21}
                    type="button"
                    className={`w-full py-2 rounded ${
                      workerCount === i + 21
                        ? 'bg-blue-600 text-white border-white'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    onClick={() => setWorkerCount(i + 21)}
                  >
                    {i + 21}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">
            Add Workers
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Added Workers:</h3>
          <ul className="space-y-2">
            {workers.map((worker, index) => (
              <li key={index} className="text-sm">
                {worker.count}人 {worker.type}: {worker.startTime} - {worker.endTime}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 space-y-2">
          <p>Total Workers: {totalWorkers}人</p>
          <p>Total Hours: {formatTime(totalHours)}</p>
          <p>社員 Overtime: {formatOvertimeInfo(社員Overtime)}</p>
          <p>バイト Overtime: {formatTime(バイトOvertime)}</p>
          <div className="flex space-x-2 mt-4">
            <button onClick={resetCurrentDay} className="bg-gray-800 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded">
              Reset Current Day
            </button>
            <button onClick={saveDailyRecord} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">
              Save Daily Record
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Last 7 Days Records:</h3>
          <ul className="space-y-2">
            {dailyRecords.map((record, index) => (
              <li key={index} className="text-sm">
                {record.date}: {record.totalWorkers}人, {formatTime(record.totalHours)}, 
                社員 OT: {formatOvertimeInfo(record.社員Overtime)}, 
                バイト OT: {formatTime(record.バイトOvertime)}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}