import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Button from "./Button"
import Modal from "./Modal"

function SessionTimeoutModal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 120 seconds countdown
  
  const warningTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)
  
  // 13 minutes in milliseconds (780,000 ms)
  const INACTIVITY_TIMEOUT = 13 * 60 * 1000 
  
  const resetInactivityTimer = () => {
    if (showWarning) return // Do not reset inactivity if warning is already showing
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setTimeLeft(120) // Reset countdown timer to 120 seconds
    }, INACTIVITY_TIMEOUT)
  }
  
  // Track user activity to reset inactivity timer
  useEffect(() => {
    if (!user) return
    
    const activityEvents = ["mousemove", "keydown", "click", "scroll"]
    
    // Initialize timer
    resetInactivityTimer()
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer)
    })
    
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer)
      })
    }
  }, [user, showWarning])
  
  // Countdown timer inside the modal warning
  useEffect(() => {
    if (!showWarning) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
      return
    }
    
    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current)
          handleSessionExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [showWarning])
  
  const handleExtendSession = () => {
    setShowWarning(false)
    resetInactivityTimer()
  }
  
  const handleSessionExpired = async () => {
    setShowWarning(false)
    await logout()
    navigate("/")
  }
  
  if (!showWarning) return null
  
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  return (
    <Modal title="Session Expiring" onClose={handleExtendSession}>
      <div className="text-center sm:text-left">
        <p className="font-body text-sm text-slate">
          Your session has been inactive for a while. For security reasons, you will be logged out in:
        </p>
        <div className="my-6 text-center font-display text-3xl font-bold text-signal-amber">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <p className="font-body text-xs text-slate/60 mb-6">
          Would you like to keep working and extend your session?
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" size="sm" onClick={handleSessionExpired}>
            Log Out Now
          </Button>
          <Button variant="primary" size="sm" onClick={handleExtendSession}>
            Extend Session
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SessionTimeoutModal
