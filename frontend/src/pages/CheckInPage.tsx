import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Camera, Check, X, Loader2, Clock, CheckCircle2, AlertTriangle, Scan } from 'lucide-react'
import { apiService } from '@/services/api'
import * as faceapi from 'face-api.js'

export function CheckInPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<number | null>(null)
  
  // State management
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<{ url: string; blob: Blob }[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'init' | 'loading-models' | 'capturing' | 'verifying' | 'success'>('init')
  const [checkInResult, setCheckInResult] = useState<{ status: string; pesan: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceDetectionScore, setFaceDetectionScore] = useState<number>(0)
  const [verificationStatus, setVerificationStatus] = useState<string>('Menunggu wajah...')
  const [modelsLoaded, setModelsLoaded] = useState(false)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Loading face detection models...')
        setCurrentStep('loading-models')
        setVerificationStatus('Memuat model deteksi wajah...')
        
        // Load TinyFaceDetector model from CDN (lightweight!)
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        
        console.log('✅ Face detection models loaded!')
        setModelsLoaded(true)
        setCurrentStep('init')
        setVerificationStatus('Model siap! Klik tombol untuk mulai absen.')
        toast.success('Model deteksi wajah berhasil dimuat!')
      } catch (error) {
        console.error('❌ Error loading face detection models:', error)
        toast.error('Gagal memuat model deteksi wajah. Refresh halaman.')
        setCameraError('Gagal memuat model AI. Silakan refresh halaman.')
      }
    }
    
    loadModels()
  }, [])

  // Start camera
  const startCamera = async () => {
    if (!modelsLoaded) {
      toast.error('Model AI belum siap. Tunggu sebentar...')
      return
    }

    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      })
      
      setStream(mediaStream)
      setCurrentStep('capturing')
      toast.success('Kamera aktif! Posisikan wajah Anda...')
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraError('Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.')
      toast.error('Gagal mengakses kamera')
    }
  }

  // Connect stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err)
        toast.error('Gagal memutar video kamera')
      })
    }
  }, [stream])

  // Real-time SMART face detection with face-api.js
  useEffect(() => {
    if (!stream || !videoRef.current || currentStep !== 'capturing' || !modelsLoaded) {
      return
    }

    const video = videoRef.current
    
    // Wait for video to be ready
    const checkVideoReady = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        startFaceDetection()
      } else {
        setTimeout(checkVideoReady, 100)
      }
    }
    
    const startFaceDetection = () => {
      console.log('🎯 Starting SMART face detection...')
      setVerificationStatus('Mendeteksi wajah...')
      
      // Run detection every 300ms (smooth but not too heavy)
      detectionIntervalRef.current = window.setInterval(async () => {
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || isCapturing || capturedPhotos.length >= 3) {
          return
        }

        try {
          // Detect face dengan TinyFaceDetector (fast & lightweight)
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416, // Balance antara speed & accuracy
              scoreThreshold: 0.5 // Minimum confidence 50%
            })
          )

          if (detections && detections.length > 0) {
            const detection = detections[0]
            const score = detection.score
            
            setFaceDetected(true)
            setFaceDetectionScore(score)
            setVerificationStatus(`✓ Wajah terdeteksi! (${Math.round(score * 100)}% confidence)`)
            
            // SMART CAPTURE: Hanya capture jika confidence tinggi (> 70%)
            if (score > 0.7 && capturedPhotos.length < 3 && !isCapturing) {
              console.log(`🎯 High confidence face detected (${Math.round(score * 100)}%)! Capturing...`)
              await smartCapture(detection)
            }
          } else {
            setFaceDetected(false)
            setFaceDetectionScore(0)
            setVerificationStatus('⚠️ Wajah tidak terdeteksi. Posisikan wajah di tengah.')
          }
        } catch (error) {
          console.error('Error during face detection:', error)
        }
      }, 300) // Check every 300ms
    }
    
    checkVideoReady()

    // Cleanup
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }
  }, [stream, currentStep, modelsLoaded, capturedPhotos.length, isCapturing])

  // SMART CAPTURE - Only when face is detected with high confidence
  const smartCapture = async (detection: faceapi.FaceDetection) => {
    if (!videoRef.current || !canvasRef.current || capturedPhotos.length >= 3 || isCapturing) {
      return
    }

    setIsCapturing(true)
    console.log(`📸 Smart capturing photo ${capturedPhotos.length + 1}/3...`)

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      toast.error('Gagal mengambil foto')
      setIsCapturing(false)
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Optional: Draw detection box (for debugging)
    // const box = detection.box
    // context.strokeStyle = '#00ff00'
    // context.lineWidth = 3
    // context.strokeRect(box.x, box.y, box.width, box.height)

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob)
        const newPhotos = [...capturedPhotos, { url: photoUrl, blob }]
        setCapturedPhotos(newPhotos)
        
        const photoNum = newPhotos.length
        console.log(`✅ Foto ${photoNum}/3 berhasil diambil!`)
        toast.success(`Foto ${photoNum}/3 berhasil diambil!`, {
          autoClose: 1000
        })
        
        // Jika sudah 3 foto, stop detection & auto-submit
        if (newPhotos.length === 3) {
          console.log('✅ 3 Foto lengkap! Stopping detection...')
          setVerificationStatus('✓ 3 Foto lengkap! Memverifikasi...')
          
          // Stop detection interval
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current)
            detectionIntervalRef.current = null
          }
          
          stopCamera()
          setCurrentStep('verifying')
          
          // Auto-submit after 500ms
          setTimeout(() => {
            autoSubmit(newPhotos)
          }, 500)
        } else {
          // Jeda 800ms sebelum capture foto berikutnya (beri waktu user gerak sedikit)
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      } else {
        console.error('❌ Failed to create blob from canvas')
      }
      setIsCapturing(false)
    }, 'image/jpeg', 0.9)
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }

  // Auto-submit 3 photos to backend
  const autoSubmit = async (photos: { url: string; blob: Blob }[]) => {
    setIsSubmitting(true)
    setVerificationStatus('Memverifikasi wajah dengan sistem...')

    try {
      // Convert blobs to File objects
      const files = photos.map((photo, index) => 
        new File([photo.blob], `foto_${index + 1}.jpg`, { type: 'image/jpeg' })
      )

      console.log('📤 Sending 3 photos to backend for verification...')
      
      // Call API with 3 files (backend logic: 2-dari-3 harus match)
      const response = await apiService.checkIn(files)
      
      setCheckInResult(response)
      
      if (response.status === 'sukses') {
        console.log('✅ Check-in SUCCESS!')
        toast.success(response.pesan || 'Absen berhasil! Wajah Anda cocok.')
        setCurrentStep('success')
      } else {
        console.log('❌ Check-in FAILED:', response.pesan)
        toast.error(response.pesan || 'Wajah tidak cocok dengan data yang terdaftar. Coba lagi.')
        // Reset untuk coba lagi
        resetAndRetry()
      }
      
    } catch (error: any) {
      console.error('Error submitting check-in:', error)
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Gagal melakukan absen. Silakan coba lagi.'
      toast.error(errorMessage)
      
      // Reset untuk coba lagi
      resetAndRetry()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset and retry
  const resetAndRetry = () => {
    // Cleanup blob URLs
    capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url))
    setCapturedPhotos([])
    setCurrentStep('init')
    setCheckInResult(null)
    setFaceDetected(false)
    setFaceDetectionScore(0)
    setVerificationStatus('Silakan coba absen lagi.')
    toast.info('Silakan coba absen lagi.')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      // Cleanup all blob URLs
      capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url))
    }
  }, [])

  // Success view
  if (currentStep === 'success' && checkInResult?.status === 'sukses') {
    const now = new Date()
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Absen Berhasil! ✨
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {checkInResult.pesan}
            </p>

            {/* Check-in Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Waktu Check-In</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Tanggal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isLate 
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {isLate ? '⏰ Terlambat' : '✅ Tepat Waktu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentStep('init')
                  setCheckInResult(null)
                  setCapturedPhotos([])
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Absen Hari Ini
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sistem absensi dengan <strong>deteksi wajah otomatis AI</strong>. Posisikan wajah Anda di depan kamera, sistem akan otomatis mendeteksi dan mengambil 3 foto untuk verifikasi.
          </p>
          
          {/* Current Time Display */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info & Instructions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                Informasi Penting
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Jam masuk: <strong className="text-gray-900 dark:text-white">09:00 WIB</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Absensi setelah jam 09:00 dihitung terlambat</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pastikan wajah terlihat jelas dan tidak tertutup</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gunakan pencahayaan yang cukup</span>
                </li>
                <li className="flex items-start gap-2">
                  <Scan className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-blue-600">AI akan otomatis mendeteksi</strong> wajah Anda dan mengambil 3 foto terbaik</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sistem verifikasi <strong>2 dari 3 foto</strong> harus cocok untuk absen berhasil</span>
                </li>
              </ul>
            </div>

            {/* Guide Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cara Menggunakan
              </h3>
              <div className="space-y-3">
                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  currentStep === 'loading-models' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 animate-pulse'
                    : currentStep === 'init' || currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'loading-models'
                      ? 'bg-blue-600 text-white'
                      : currentStep === 'init' || currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep === 'loading-models' ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === 'init' || currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success' ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {currentStep === 'loading-models' ? '🔄 Memuat Model AI...' : currentStep === 'init' || currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success' ? '✅ Model AI Siap' : 'Muat Model AI'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {currentStep === 'loading-models' ? 'Mohon tunggu, sedang memuat model deteksi wajah...' : 'Model AI untuk deteksi wajah otomatis'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : currentStep === 'init'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success'
                      ? 'bg-green-600 text-white'
                      : currentStep === 'init'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success' ? '✓' : currentStep === 'init' ? '👉' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {currentStep === 'capturing' || currentStep === 'verifying' || currentStep === 'success' ? '✅ Kamera Aktif' : currentStep === 'init' ? '👉 Aktifkan Kamera' : 'Aktifkan Kamera'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Klik tombol "Mulai Absen Sekarang"
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  currentStep === 'capturing' && capturedPhotos.length > 0
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 animate-pulse'
                    : currentStep === 'verifying' || currentStep === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'capturing' && capturedPhotos.length > 0
                      ? 'bg-blue-600 text-white'
                      : currentStep === 'verifying' || currentStep === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep === 'capturing' && capturedPhotos.length > 0 ? capturedPhotos.length : currentStep === 'verifying' || currentStep === 'success' ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {currentStep === 'capturing' && capturedPhotos.length > 0 
                        ? `🎯 Foto ${capturedPhotos.length}/3 Terdeteksi`
                        : currentStep === 'verifying' || currentStep === 'success'
                        ? '✅ 3 Foto Lengkap'
                        : 'Deteksi Wajah Otomatis'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      AI akan otomatis ambil 3 foto terbaik
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  currentStep === 'verifying'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 animate-pulse'
                    : currentStep === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'verifying'
                      ? 'bg-blue-600 text-white'
                      : currentStep === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === 'success' ? '✓' : '4'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {currentStep === 'verifying' ? '🔄 Memverifikasi Wajah...' : currentStep === 'success' ? '✅ Absen Berhasil!' : 'Verifikasi Otomatis'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Sistem akan verifikasi dan absen otomatis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Camera & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {currentStep === 'loading-models' && (
                    <>
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm font-medium text-blue-600">Memuat Model AI...</span>
                    </>
                  )}
                  {currentStep === 'init' && <Camera className="w-5 h-5 text-blue-600" />}
                  {currentStep === 'capturing' && (
                    <>
                      <Scan className={`w-5 h-5 ${faceDetected ? 'text-green-600' : 'text-yellow-600'}`} />
                      <span className={`text-sm font-medium ${faceDetected ? 'text-green-600' : 'text-yellow-600'}`}>
                        {verificationStatus}
                      </span>
                    </>
                  )}
                  {currentStep === 'verifying' && (
                    <>
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm font-medium text-blue-600">
                        Memverifikasi wajah...
                      </span>
                    </>
                  )}
                  {currentStep === 'loading-models' ? 'Persiapan AI' : currentStep === 'init' ? 'Mulai Kamera' : currentStep === 'verifying' ? 'Verifikasi Wajah' : 'Deteksi Wajah AI'}
                </h3>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Foto: {capturedPhotos.length}/3
                </div>
              </div>

              {/* Camera Error */}
              {cameraError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{cameraError}</p>
                </div>
              )}

              {/* Video/Photo Preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                {currentStep === 'loading-models' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Memuat Model AI...</p>
                    <p className="text-sm opacity-75 mt-2">Mohon tunggu sebentar</p>
                  </div>
                ) : currentStep === 'init' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Klik tombol di bawah untuk memulai</p>
                    <p className="text-sm opacity-75 mt-2">AI akan otomatis mendeteksi wajah Anda</p>
                  </div>
                ) : currentStep === 'verifying' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-blue-900/90 to-blue-800/90">
                    <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Memverifikasi Wajah...</p>
                    <p className="text-sm opacity-75 mt-2">Mohon tunggu sebentar</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Face Detection Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Face guide circle */}
                      <div className={`w-64 h-64 rounded-full border-4 transition-colors ${
                        faceDetected 
                          ? 'border-green-500 shadow-lg shadow-green-500/50' 
                          : 'border-yellow-500 shadow-lg shadow-yellow-500/50'
                      }`}>
                        {faceDetected && (
                          <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping" />
                        )}
                      </div>
                    </div>
                    {/* Status Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {isCapturing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengambil foto {capturedPhotos.length + 1}/3...
                          </>
                        ) : faceDetected ? (
                          <>
                            <Scan className="w-4 h-4 text-green-400" />
                            {verificationStatus} {faceDetectionScore > 0 && `(${Math.round(faceDetectionScore * 100)}%)`}
                          </>
                        ) : (
                          <>
                            <Scan className="w-4 h-4 text-yellow-400" />
                            Posisikan wajah Anda di lingkaran
                          </>
                        )}
                      </p>
                    </div>
                    {/* Photo Counter */}
                    <div className="absolute top-4 right-4 bg-black/75 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                      <p className="text-sm font-bold">
                        {capturedPhotos.length}/3 Foto
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
              <canvas ref={detectionCanvasRef} className="hidden" />

              {/* Camera Controls */}
              <div className="flex gap-3">
                {currentStep === 'loading-models' ? (
                  <button
                    disabled
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memuat Model AI...
                  </button>
                ) : currentStep === 'init' ? (
                  <button
                    onClick={startCamera}
                    disabled={!modelsLoaded}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="start-camera-btn"
                  >
                    <Camera className="w-5 h-5" />
                    Mulai Absen Sekarang
                  </button>
                ) : currentStep === 'capturing' ? (
                  <button
                    onClick={() => {
                      stopCamera()
                      resetAndRetry()
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                    data-testid="cancel-btn"
                  >
                    <X className="w-5 h-5" />
                    Batalkan
                  </button>
                ) : currentStep === 'verifying' ? (
                  <button
                    disabled
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sedang Memverifikasi...
                  </button>
                ) : null}
              </div>
            </div>

            {/* Progress Info */}
            {(currentStep === 'capturing' || currentStep === 'verifying') && capturedPhotos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Foto yang Diambil ({capturedPhotos.length}/3)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {capturedPhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                        ✓ #{index + 1}
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 3 - capturedPhotos.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                {currentStep === 'verifying' && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 text-center font-medium">
                      Sedang memverifikasi wajah dengan sistem... Mohon tunggu
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
