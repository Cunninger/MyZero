import React, { useState, useRef, useCallback, useEffect } from 'react';

const RangeSlider = ({ min, max, step, value, onChange, labels, className = '' }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateValue = useCallback(
    (clientX) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const raw = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0, Math.min(1, raw));
      const newValue = min + clamped * (max - min);
      const stepped = Math.round(newValue / step) * step;
      onChange(Math.max(min, Math.min(max, stepped)));
    },
    [min, max, step, onChange]
  );

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setShowTooltip(true);
    updateValue(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setShowTooltip(true);
    updateValue(e.touches[0].clientX);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isDragging) {
        updateValue(e.touches[0].clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setShowTooltip(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full h-6 flex items-center">
        {/* Track */}
        <div
          ref={trackRef}
          className="relative w-full h-2 rounded-full cursor-pointer bg-slate-200 dark:bg-slate-700 transition-colors"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-teal-500 shadow-md cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out hover:scale-125 active:scale-110"
          style={{ left: `calc(${percentage}% - 10px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => !isDragging && setShowTooltip(false)}
        >
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 dark:bg-slate-600 text-white text-xs rounded-md whitespace-nowrap shadow-lg animate-fade-in pointer-events-none">
              {value}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-600" />
            </div>
          )}
        </div>
      </div>
      {labels && (
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RangeSlider;
