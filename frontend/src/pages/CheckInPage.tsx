import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Camera, Check, X, Loader2, Clock, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react'
import { apiService } from '@/services/api'

export function CheckInPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // State management
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<{ url: string; blob: Blob }[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'init' | 'capturing' | 'preview' | 'success'>('init')
  const [checkInResult, setCheckInResult] = useState<{ status: string; pesan: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Camera positions guide (3 photos)
  const photoGuides = [
    { id: 1, label: 'Wajah Depan', description: 'Lihat langsung ke kamera' },
    { id: 2, label: 'Sedikit Kanan', description: 'Putar kepala sedikit ke kanan' },
    { id: 3, label: 'Sedikit Kiri', description: 'Putar kepala sedikit ke kiri' },
  ]

  // Start camera
  const startCamera = async () => {
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
      toast.success('Kamera berhasil diaktifkan!')
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
      })
    }
  }, [stream])

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || capturedPhotos.length >= 3) {
      return
    }

    setIsCapturing(true)

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

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob)
        setCapturedPhotos(prev => [...prev, { url: photoUrl, blob }])
        toast.success(`Foto ${capturedPhotos.length + 1} berhasil diambil!`)
      }
      setIsCapturing(false)
    }, 'image/jpeg', 0.9)
  }

  // Delete a captured photo
  const deletePhoto = (index: number) => {
    const photoToDelete = capturedPhotos[index]
    if (photoToDelete) {
      URL.revokeObjectURL(photoToDelete.url)
    }
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index))
    toast.info('Foto dihapus')
  }

  // Submit photos to API
  const handleSubmit = async () => {
    if (capturedPhotos.length !== 3) {
      toast.error('Harap ambil 3 foto terlebih dahulu')
      return
    }

    setIsSubmitting(true)

    try {
      // Convert blobs to File objects
      const files = capturedPhotos.map((photo, index) => 
        new File([photo.blob], `foto_${index + 1}.jpg`, { type: 'image/jpeg' })
      )

      // Call API
      const response = await apiService.checkIn(files)
      
      setCheckInResult(response)
      
      if (response.status === 'sukses') {
        toast.success(response.pesan || 'Absen berhasil!')
        setCurrentStep('success')
      } else {
        toast.error(response.pesan || 'Wajah tidak cocok. Coba lagi.')
        // Reset untuk coba lagi
        setCapturedPhotos([])
        capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url))
      }
      
      // Stop camera
      stopCamera()
      
    } catch (error: any) {
      console.error('Error submitting check-in:', error)
      const errorMessage = error.response?.data?.detail || 'Gagal melakukan absen'
      toast.error(errorMessage)
      
      // Reset untuk coba lagi
      setCapturedPhotos([])
      capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url))
    } finally {
      setIsSubmitting(false)
    }
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
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Absen Hari Ini
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Lakukan absensi dengan pengenalan wajah. Ambil 3 foto wajah untuk verifikasi.
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
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>3 foto diperlukan untuk verifikasi (2 dari 3 harus cocok)</span>
                </li>
              </ul>
            </div>

            {/* Photo Guide */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Panduan Posisi Foto
              </h3>
              <div className="space-y-3">
                {photoGuides.map((guide, index) => (
                  <div
                    key={guide.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      capturedPhotos.length === index
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                        : capturedPhotos.length > index
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        capturedPhotos.length > index
                          ? 'bg-green-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {capturedPhotos.length > index ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{guide.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{guide.label}</p>
                      <p className="text-xs opacity-90">{guide.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Camera & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentStep === 'init' ? 'Mulai Kamera' : 'Kamera Aktif'}
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

              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                {currentStep === 'init' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Klik tombol di bawah untuk memulai kamera</p>
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
                    {/* Current Guide Overlay */}
                    {capturedPhotos.length < 3 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium">
                          {photoGuides[capturedPhotos.length].label}
                        </p>
                        <p className="text-xs opacity-90">
                          {photoGuides[capturedPhotos.length].description}
                        </p>
                      </div>
                    )}
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    data-testid="start-camera-btn"
                  >
                    <Camera className="w-5 h-5" />
                    Aktifkan Kamera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={capturePhoto}
                      disabled={isCapturing || capturedPhotos.length >= 3}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      data-testid="capture-photo-btn"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Mengambil Foto...
                        </>
                      ) : capturedPhotos.length >= 3 ? (
                        <>
                          <Check className="w-5 h-5" />
                          Semua Foto Lengkap
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          Ambil Foto ({capturedPhotos.length + 1}/3)
                        </>
                      )}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      data-testid="stop-camera-btn"
                    >
                      Hentikan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Photo Preview Grid */}
            {capturedPhotos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview Foto
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {capturedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        onClick={() => deletePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                        data-testid={`delete-photo-${index}-btn`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 3 - capturedPhotos.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={capturedPhotos.length !== 3 || isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="submit-checkin-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memverifikasi Wajah...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Lakukan Absen
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
