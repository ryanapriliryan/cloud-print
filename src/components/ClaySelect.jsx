"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

function MarqueeText({ text, className = "" }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return;
      const diff = textRef.current.scrollWidth - containerRef.current.clientWidth;
      setOverflow(diff > 2 ? diff + 12 : 0);
    };

    measure();
    const rafId = requestAnimationFrame(measure);
    const timer = setTimeout(measure, 80);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  const duration = `${Math.max(4.5, Math.min(9, overflow / 28 + 3.5)).toFixed(1)}s`;

  return (
    <span
      ref={containerRef}
      title={text}
      className={`block overflow-hidden whitespace-nowrap ${className}`}
    >
      <span
        ref={textRef}
        style={
          overflow > 0
            ? {
                "--marquee-distance": `-${overflow}px`,
                "--marquee-duration": duration,
              }
            : undefined
        }
        className={
          overflow > 0 ? "animate-clay-marquee" : "inline-block whitespace-nowrap"
        }
      >
        {text}
      </span>
    </span>
  );
}

export default function ClaySelect({
  value,
  onChange,
  options = [],
  placeholder = "Pilih opsi...",
  disabled = false,
  className = "text-sm font-semibold",
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 200, openUp: false });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 240 && rect.top > 240;

    setCoords({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 190),
      openUp,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handleClickOutside(e) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    function handleScroll(e) {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`clay-input group w-full px-3.5 py-2.5 text-left text-slate-800 flex items-center justify-between gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          open ? "bg-white ring-4 ring-indigo-500/15 border-indigo-400" : ""
        } ${className}`}
      >
        <div className="flex-1 min-w-0">
          <MarqueeText
            text={selectedOption ? selectedOption.label : placeholder}
          />
        </div>
        <span className="w-6 h-6 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.openUp ? "auto" : `${coords.top}px`,
              bottom: coords.openUp ? `${window.innerHeight - coords.top}px` : "auto",
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className="clay-card p-2 max-h-64 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150"
          >
            {options.length === 0 ? (
              <div className="px-3.5 py-2.5 text-xs text-slate-500 text-center">
                Tidak ada pilihan
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`group w-full text-left px-3.5 py-2.5 rounded-[15px] text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "clay-btn-primary text-white"
                        : "text-slate-700 hover:bg-indigo-50/90 hover:text-indigo-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <MarqueeText
                        text={opt.label}
                        className={isSelected ? "text-white" : ""}
                      />
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </>
  );
}