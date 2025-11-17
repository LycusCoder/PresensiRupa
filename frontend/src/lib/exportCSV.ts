/**
 * Utility functions untuk export data ke CSV
 */

import { KaryawanItem, LogAbsensiItem, LogKehadiranDetail } from '@/types'

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const csvRows = []
  
  // Add header row
  csvRows.push(headers.join(','))
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + value).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Format date untuk filename
 */
function getFormattedDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Export daftar karyawan ke CSV
 */
export function exportKaryawanToCSV(karyawan: KaryawanItem[]) {
  const data = karyawan.map(k => ({
    id_pengguna: k.id_pengguna,
    id_karyawan: k.id_karyawan,
    nama_lengkap: `${k.nama_depan} ${k.nama_belakang}`,
    jabatan: k.jabatan,
    alamat_surel: k.alamat_surel,
    status_wajah: k.sudah_daftar_wajah ? 'Terdaftar' : 'Belum',
    status_kehadiran: k.status_kehadiran,
    tanggal_masuk: new Date(k.tanggal_masuk).toLocaleDateString('id-ID'),
    catatan_admin: k.catatan_admin || ''
  }))
  
  const headers = [
    'id_pengguna',
    'id_karyawan',
    'nama_lengkap',
    'jabatan',
    'alamat_surel',
    'status_wajah',
    'status_kehadiran',
    'tanggal_masuk',
    'catatan_admin'
  ]
  
  const csv = arrayToCSV(data, headers)
  const filename = `karyawan_${getFormattedDate()}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export riwayat absensi karyawan ke CSV
 */
export function exportRiwayatToCSV(riwayat: LogAbsensiItem[], namaKaryawan: string) {
  const data = riwayat.map(log => ({
    id_log: log.id_log,
    tanggal: new Date(log.waktu).toLocaleDateString('id-ID'),
    waktu: new Date(log.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    status: log.status,
    tipe_kehadiran: log.tipe_kehadiran,
    jumlah_cocok: log.jumlah_cocok !== null ? log.jumlah_cocok : ''
  }))
  
  const headers = [
    'id_log',
    'tanggal',
    'waktu',
    'status',
    'tipe_kehadiran',
    'jumlah_cocok'
  ]
  
  const csv = arrayToCSV(data, headers)
  const safeNama = namaKaryawan.replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `riwayat_${safeNama}_${getFormattedDate()}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export daftar kehadiran ke CSV
 */
export function exportKehadiranToCSV(kehadiran: LogKehadiranDetail[], tanggal?: string) {
  const data = kehadiran.map(log => ({
    id_log: log.id_log,
    tanggal: new Date(log.waktu).toLocaleDateString('id-ID'),
    waktu: new Date(log.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    id_karyawan: log.id_karyawan,
    nama_lengkap: log.nama_lengkap,
    jabatan: log.jabatan,
    status: log.status,
    tipe_kehadiran: log.tipe_kehadiran,
    jumlah_cocok: log.jumlah_cocok !== null ? log.jumlah_cocok : ''
  }))
  
  const headers = [
    'id_log',
    'tanggal',
    'waktu',
    'id_karyawan',
    'nama_lengkap',
    'jabatan',
    'status',
    'tipe_kehadiran',
    'jumlah_cocok'
  ]
  
  const csv = arrayToCSV(data, headers)
  const dateStr = tanggal || getFormattedDate()
  const filename = `kehadiran_${dateStr.replace(/-/g, '')}.csv`
  downloadCSV(csv, filename)
}
