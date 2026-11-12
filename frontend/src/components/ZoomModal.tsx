import React, { useState, useEffect, useRef } from 'react'
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, X, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ZoomModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  caption?: string
}

export function ZoomModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  caption,
}: ZoomModalProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  // Reset zoom & pan when opening
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1)
      setPosition({ x: 0, y: 0 })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((z) => Math.min(z + 0.25, 3))
      } else if (e.key === '-') {
        setZoomLevel((z) => Math.max(z - 0.25, 0.5))
      } else if (e.key === '0') {
        setZoomLevel(1)
        setPosition({ x: 0, y: 0 })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl animate-fade-in ${
        isLight ? 'bg-[#142E27]/40' : 'bg-black/80'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative w-full max-w-7xl max-h-[94vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden zoom-modal-dialog transition-colors ${
          isLight
            ? 'bg-[#FAF8F5] border border-[#142E27]/20 text-[#142E27]'
            : 'bg-[#0F1623]/95 border border-white/15 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimalist Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-b transition-colors ${
            isLight
              ? 'border-[#142E27]/12 bg-[#142E27]/03'
              : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate mr-4">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isLight ? 'bg-[#1E6554]' : 'bg-[#3E8E7E]'
              }`}
              aria-hidden="true"
            />
            <h2
              className={`text-sm sm:text-base font-serif font-medium tracking-wide truncate ${
                isLight ? 'text-[#142E27]' : 'text-white'
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <span
                className={`text-xs hidden sm:inline font-sans truncate ${
                  isLight ? 'text-[#4A6B62]' : 'text-slate-400'
                }`}
              >
                · {subtitle}
              </span>
            )}
          </div>

          {/* Controls: Zoom In, Zoom Out, Reset, Close */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center rounded-xl p-1 gap-1 border transition-colors ${
                isLight
                  ? 'bg-[#142E27]/06 border-[#142E27]/15'
                  : 'bg-white/[0.05] border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'text-[#23493E] hover:text-[#142E27] hover:bg-[#142E27]/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span
                className={`text-[11px] font-sans font-semibold tabular-nums px-1.5 min-w-12 text-center ${
                  isLight ? 'text-[#142E27]' : 'text-slate-300'
                }`}
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'text-[#23493E] hover:text-[#142E27] hover:bg-[#142E27]/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomLevel(1)
                  setPosition({ x: 0, y: 0 })
                }}
                className={`p-1.5 rounded-lg transition-colors ml-1 border-l ${
                  isLight
                    ? 'text-[#4A6B62] hover:text-[#142E27] hover:bg-[#142E27]/10 border-[#142E27]/15'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border-white/10'
                }`}
                title="Reset Zoom (0)"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-[#142E27]/06 hover:bg-[#142E27]/12 text-[#142E27] border-[#142E27]/15'
                  : 'bg-white/[0.06] hover:bg-white/15 text-slate-300 hover:text-white border-white/10'
              }`}
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Large Zoomable Canvas */}
        <div
          ref={contentRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 overflow-auto p-2 sm:p-6 flex items-center justify-center min-h-[60vh] ${
            zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          style={{ userSelect: 'none' }}
        >
          <div
            className="w-full flex items-center justify-center transition-transform duration-150 ease-out origin-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            }}
          >
            <div className="w-full max-w-6xl">{children}</div>
          </div>
        </div>

        {/* Minimalist 1-Line Caption Footer */}
        {caption && (
          <div
            className={`px-6 py-2.5 border-t flex items-center justify-center gap-2 text-xs font-sans text-center transition-colors ${
              isLight
                ? 'border-[#142E27]/12 bg-[#142E27]/03 text-[#23493E]'
                : 'border-white/10 bg-white/[0.02] text-slate-300'
            }`}
          >
            <Info
              className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#1E6554]' : 'text-[#6bb3a7]'}`}
              aria-hidden="true"
            />
            <span className="truncate">{caption}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface ZoomableWrapperProps {
  title: string
  subtitle?: string
  caption?: string
  children: React.ReactNode
  className?: string
}

export function ZoomableGraphic({
  title,
  subtitle,
  caption,
  children,
  className = '',
}: ZoomableWrapperProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className={`group relative cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        aria-label={`Click to expand and view ${title}`}
      >
        {children}

        {/* Subtle hover pill indicating clickability (Theme-Aware, Never Harsh Black in Light Mode) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold backdrop-blur-md shadow-lg transition-colors ${
              isLight
                ? 'bg-white/95 text-[#14463C] border border-[#142E27]/25 shadow-md ring-1 ring-[#142E27]/05'
                : 'bg-[#0b0f17]/90 text-[#B2DDD6] border border-white/20'
            }`}
          >
            <Maximize2 className={`w-3 h-3 ${isLight ? 'text-[#1E6554]' : 'text-[#6bb3a7]'}`} />
            <span>Click to expand</span>
          </span>
        </div>
      </div>

      <ZoomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        subtitle={subtitle}
        caption={caption}
      >
        {children}
      </ZoomModal>
    </>
  )
}
