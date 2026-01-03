'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  url: string
  title: string
}

export default function QRCodeDisplay({ url, title }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#7c3aed', // Purple color
          light: '#ffffff',
        },
      })
    }
  }, [url])

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
      link.click()
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600')
    if (printWindow && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${title}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
              }
              img {
                width: 400px;
                height: 400px;
              }
              p {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <img src="${dataUrl}" alt="QR Code" />
            <p>Scan to RSVP and view party details</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
      >
        <span>📱</span>
        <span>QR Code</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Party QR Code</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center">
              <canvas ref={canvasRef} className="mb-6" />

              <p className="text-sm text-gray-600 text-center mb-6">
                Scan this QR code to quickly access the party invite and RSVP
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={handleDownload}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>💾</span>
                  <span>Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg w-full">
                <p className="text-sm text-purple-800">
                  <strong>💡 Pro Tip:</strong> Print this QR code on invitations or display it at the entrance for easy check-in!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
