import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Camera, Check, X, Loader2, Clock, CheckCircle2, AlertTriangle, Scan } from 'lucide-react'
import { apiService } from '@/services/api'
import * as faceapi from 'face-api.js'

export function CheckInPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // State management
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<{ url: string; blob: Blob }[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'init' | 'loading-model' | 'capturing' | 'verifying' | 'success'>('init')
  const [checkInResult, setCheckInResult] = useState<{ status: string; pesan: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceConfidence, setFaceConfidence] = useState<number>(0)
  const [verificationStatus, setVerificationStatus] = useState<string>('Menunggu wajah...')
  const [modelLoaded, setModelLoaded] = useState(false)
  
  const detectionIntervalRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)

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
        console.log('🔄 Loading face detection model...')
        setCurrentStep('loading-model')
        
        // Load TinyFaceDetector model dari public/models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        
        setModelLoaded(true)
        console.log('✅ Face detection model loaded!')
        toast.success('Model deteksi wajah berhasil dimuat')
        setCurrentStep('init')
      } catch (error) {
        console.error('❌ Error loading models:', error)
        toast.error('Gagal memuat model deteksi wajah')
        setCameraError('Gagal memuat model deteksi wajah. Refresh halaman.')
      }
    }

    loadModels()
  }, [])

  // Start camera
  const startCamera = async () => {
    if (!modelLoaded) {
      toast.error('Model belum dimuat. Mohon tunggu...')
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

  // Connect stream to video element when both are ready
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err)
        toast.error('Gagal memutar video kamera')
      })
    }
  }, [stream])

  // Real-time face detection with face-api.js
  useEffect(() => {
    if (!stream || !videoRef.current || currentStep !== 'capturing' || !modelLoaded) return

    const video = videoRef.current
    const detectionCanvas = detectionCanvasRef.current

    // Wait for video to be ready
    const startDetection = () => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setTimeout(startDetection, 100)
        return
      }

      console.log('🎥 Starting face detection loop...')

      // Setup canvas untuk overlay
      if (detectionCanvas) {
        detectionCanvas.width = video.videoWidth
        detectionCanvas.height = video.videoHeight
      }

      // Detection loop setiap 300ms
      detectionIntervalRef.current = window.setInterval(async () => {
        if (isProcessingRef.current || capturedPhotos.length >= 3) return

        try {
          // Detect faces dengan TinyFaceDetector
          const detection = await faceapi.detectSingleFace(
            video, 
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.5
            })
          )

          if (detection) {
            const confidence = detection.score
            setFaceDetected(true)
            setFaceConfidence(confidence)
            setVerificationStatus(`✓ Wajah terdeteksi! (${Math.round(confidence * 100)}%)`)

            // Draw detection box
            if (detectionCanvas) {
              const ctx = detectionCanvas.getContext('2d')
              if (ctx) {
                ctx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height)
                
                // Draw bounding box
                const box = detection.box
                ctx.strokeStyle = '#10b981' // green-500
                ctx.lineWidth = 3
                ctx.strokeRect(box.x, box.y, box.width, box.height)
                
                // Draw confidence score
                ctx.fillStyle = '#10b981'
                ctx.font = '16px sans-serif'
                ctx.fillText(
                  `${Math.round(confidence * 100)}%`, 
                  box.x, 
                  box.y - 10
                )
              }
            }

            // Auto-capture jika confidence tinggi dan belum 3 foto
            if (confidence > 0.7 && capturedPhotos.length < 3 && !isCapturing) {
              console.log(`📸 High confidence (${Math.round(confidence * 100)}%), capturing photo ${capturedPhotos.length + 1}/3...`)
              await capturePhoto()
              
              // Delay sebentar sebelum capture foto berikutnya (biar user bisa gerak dikit)
              if (capturedPhotos.length < 2) {
                await new Promise(resolve => setTimeout(resolve, 1500))
              }
            }
          } else {
            setFaceDetected(false)
            setFaceConfidence(0)
            setVerificationStatus('❌ Tidak ada wajah terdeteksi')
            
            // Clear canvas
            if (detectionCanvas) {
              const ctx = detectionCanvas.getContext('2d')
              if (ctx) {
                ctx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height)
              }
            }
          }
        } catch (error) {
          console.error('Error detecting face:', error)
        }
      }, 300)
    }

    startDetection()

    // Cleanup
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [stream, currentStep, modelLoaded, capturedPhotos.length, isCapturing])

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
    }
  }

  // Capture photo from video stream
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || capturedPhotos.length >= 3 || isCapturing) {
      return
    }

    isProcessingRef.current = true
    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      toast.error('Gagal mengambil foto')
      setIsCapturing(false)
      isProcessingRef.current = false
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const photoUrl = URL.createObjectURL(blob)
          const newPhotos = [...capturedPhotos, { url: photoUrl, blob }]
          setCapturedPhotos(newPhotos)
          
          const photoNum = newPhotos.length
          console.log(`✅ Foto ${photoNum}/3 berhasil diambil!`)
          toast.success(`Foto ${photoNum}/3 berhasil diambil!`)
          
          // Jika sudah 3 foto, auto-submit
          if (newPhotos.length === 3) {
            console.log('✅ 3 Foto lengkap! Auto-submit...')
            setVerificationStatus('✓ 3 Foto lengkap! Sedang verifikasi...')
            stopCamera()
            setCurrentStep('verifying')
            // Auto-submit setelah 1 detik
            setTimeout(() => {
              autoSubmit(newPhotos)
            }, 1000)
          }
        } else {
          console.error('❌ Failed to create blob from canvas')
        }
        setIsCapturing(false)
        isProcessingRef.current = false
        resolve()
      }, 'image/jpeg', 0.9)
    })
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

      // Call API with 3 files
      const response = await apiService.checkIn(files)
      
      setCheckInResult(response)
      
      if (response.status === 'sukses') {
        toast.success(response.pesan || 'Absen berhasil! Wajah Anda cocok.')
        setCurrentStep('success')
      } else {
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
    setFaceConfidence(0)
    toast.info('Silakan coba absen lagi.')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      // Cleanup all blob URLs
      capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url))
    }
  }, [capturedPhotos])

  // Loading model view
  if (currentStep === 'loading-model') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Memuat Model Deteksi Wajah...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Mohon tunggu sebentar, sistem sedang mempersiapkan deteksi wajah otomatis
          </p>
        </div>
      </div>
    )
  }

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
            Sistem akan otomatis mendeteksi wajah Anda dan mengambil 3 foto untuk verifikasi. Pastikan wajah Anda terlihat jelas.
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
                  <span>Sistem otomatis mendeteksi wajah dengan AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>3 foto akan diambil otomatis saat wajah terdeteksi</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Verifikasi 2-dari-3 foto untuk keamanan</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pastikan pencahayaan cukup dan wajah jelas</span>
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
                  currentStep === 'init' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'init' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep !== 'init' ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Aktifkan Kamera</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Klik tombol di sebelah kanan</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  currentStep === 'capturing' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'capturing' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep === 'verifying' || currentStep === 'success' ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">AI Deteksi Wajah</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Sistem otomatis mendeteksi wajah Anda</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  currentStep === 'verifying' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    currentStep === 'verifying' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {currentStep === 'success' ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Verifikasi Otomatis</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">3 foto otomatis, lalu verifikasi ke server</p>
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
                  {currentStep === 'init' ? 'Mulai Kamera' : currentStep === 'verifying' ? 'Verifikasi Wajah' : 'Deteksi Wajah AI'}
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
                {currentStep === 'init' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Klik tombol di bawah untuk memulai</p>
                    <p className="text-sm opacity-75 mt-2">Sistem AI akan otomatis mendeteksi wajah Anda</p>
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
                    {/* Detection overlay canvas */}
                    <canvas
                      ref={detectionCanvasRef}
                      className="absolute inset-0 w-full h-full"
                    />
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
                            Wajah terdeteksi {faceConfidence > 0 ? `(${Math.round(faceConfidence * 100)}%)` : ''}
                          </>
                        ) : (
                          <>
                            <Scan className="w-4 h-4 text-yellow-400" />
                            Mencari wajah...
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

              {/* Camera Controls */}
              <div className="flex gap-3">
                {currentStep === 'init' ? (
                  <button
                    onClick={startCamera}
                    disabled={!modelLoaded}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="start-camera-btn"
                  >
                    <Camera className="w-5 h-5" />
                    {modelLoaded ? 'Mulai Absen Sekarang' : 'Memuat Model...'}
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
