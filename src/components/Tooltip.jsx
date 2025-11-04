import React, { useRef, useState, useEffect } from 'react';
 
/**
 * Reusable Tooltip component that displays on hover
 * @param {string} text - The tooltip text to display
 * @param {ReactNode} children - The element that triggers the tooltip
 * @param {string} align - Alignment: 'left', 'center', or 'right' (default: 'center')
 * @param {boolean} anchorToParentRight - If true, positions tooltip relative to parent container's right edge
 */
export default function Tooltip({ text, children, align = 'center', anchorToParentRight = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({
    top: 'auto',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    arrowDirection: 'bottom',
    isFixed: false,
    arrowLeft: '50%'
  });
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);
 
  useEffect(() => {
    if (isVisible && tooltipRef.current && wrapperRef.current) {
      // Use requestAnimationFrame to ensure tooltip is rendered before calculating
      requestAnimationFrame(() => {
        if (!tooltipRef.current || !wrapperRef.current) return;
       
        const tooltip = tooltipRef.current;
        const wrapper = wrapperRef.current;
        const wrapperRect = wrapper.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
       
        const tooltipWidth = tooltipRect.width || 200; // fallback to min-width
        const tooltipHeight = tooltipRect.height || 60; // fallback estimate
        const padding = 12; // padding from viewport edges
       
        // Calculate vertical position
        const spaceAbove = wrapperRect.top;
        const spaceBelow = window.innerHeight - wrapperRect.bottom;
        let top = 0;
        let arrowDirection = 'bottom';
       
        if (spaceAbove >= tooltipHeight + padding) {
          // Show above
          top = wrapperRect.top - tooltipHeight - 8;
          arrowDirection = 'bottom';
        } else if (spaceBelow >= tooltipHeight + padding) {
          // Show below
          top = wrapperRect.bottom + 8;
          arrowDirection = 'top';
        } else {
          // Default to below if no space
          top = wrapperRect.bottom + 8;
          arrowDirection = 'top';
        }
       
        // Calculate horizontal position based on alignment
        let left = 0;
        let arrowLeft = '50%';
        const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
        const wrapperLeft = wrapperRect.left;
        const wrapperRight = wrapperRect.right;
       
        // If anchorToParentRight, find parent container (DetailRow) and use its right edge
        if (anchorToParentRight && wrapper.parentElement) {
          // Traverse up to find DetailRow container (parent of label container)
          const labelContainer = wrapper.parentElement;
          const detailRowContainer = labelContainer.parentElement;
         
          if (detailRowContainer) {
            const parentRect = detailRowContainer.getBoundingClientRect();
            const parentRight = parentRect.right;
           
            // Position tooltip to end at parent's right edge (near the answer values)
            left = parentRight - tooltipWidth;
            arrowLeft = 'calc(100% - 8px)'; // Arrow near right edge
          }
        } else if (align === 'left') {
          // Align tooltip to start from left edge of wrapper
          left = wrapperLeft;
        } else if (align === 'right') {
          // Align tooltip to end at right edge of wrapper (extends right towards answer/value side)
          left = wrapperRight - tooltipWidth;
        } else {
          // Center alignment (default)
          left = wrapperCenterX - tooltipWidth / 2;
        }
       
        // Adjust arrow position based on alignment
        if (anchorToParentRight) {
          arrowLeft = 'calc(100% - 8px)'; // Arrow near right edge
        } else if (align === 'left') {
          arrowLeft = '8px'; // Arrow near left edge
        } else if (align === 'right') {
          arrowLeft = 'calc(100% - 8px)'; // Arrow near right edge
        } else {
          arrowLeft = '50%'; // Center arrow
        }
       
        // Ensure tooltip doesn't go off left edge
        if (left < padding) {
          const originalLeft = left;
          left = padding;
          // Adjust arrow position if tooltip was shifted
          if (anchorToParentRight) {
            // Keep arrow near right edge even if shifted
            arrowLeft = 'calc(100% - 8px)';
          } else if (align === 'left') {
            const shift = left - originalLeft;
            arrowLeft = `${8 + (shift / tooltipWidth) * 100}px`;
          } else if (align === 'center') {
            const arrowOffset = wrapperCenterX - left;
            arrowLeft = `${(arrowOffset / tooltipWidth) * 100}%`;
          }
        }
       
        // Ensure tooltip doesn't go off right edge
        const maxLeft = window.innerWidth - tooltipWidth - padding;
        if (left > maxLeft) {
          const originalLeft = left;
          left = maxLeft;
          // Adjust arrow position if tooltip was shifted
          if (anchorToParentRight) {
            // Calculate arrow position based on parent right edge
            const labelContainer = wrapper.parentElement;
            const detailRowContainer = labelContainer?.parentElement;
            if (detailRowContainer) {
              const parentRect = detailRowContainer.getBoundingClientRect();
              const parentRight = parentRect.right;
              const arrowOffset = parentRight - left;
              arrowLeft = `${(arrowOffset / tooltipWidth) * 100}%`;
            }
          } else if (align === 'right') {
            const shift = left - originalLeft;
            arrowLeft = `calc(100% - 8px + ${shift}px)`;
          } else if (align === 'center') {
            const arrowOffset = wrapperCenterX - left;
            arrowLeft = `${(arrowOffset / tooltipWidth) * 100}%`;
          }
        }
       
        // Ensure left is at least padding
        if (left < padding) {
          left = padding;
        }
       
        setPosition({
          top: `${top}px`,
          left: `${left}px`,
          bottom: 'auto',
          transform: 'none',
          arrowDirection,
          isFixed: true,
          arrowLeft,
          align
        });
      });
    }
  }, [isVisible, align, anchorToParentRight]);
 
  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${position.isFixed ? 'fixed' : 'absolute'} z-[9999] pointer-events-none transition-opacity duration-200`}
          style={{
            ...position,
            opacity: 1,
            minWidth: '200px',
            maxWidth: '320px',
          }}
        >
          <div
            className="bg-gray-900 text-white text-sm rounded-lg shadow-2xl border border-gray-700 relative"
            style={{
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(30, 30, 30, 0.5), 0 8px 10px -6px rgba(30, 29, 29, 0.5)',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: '1.5',
              fontSize: '14px',
            }}
          >
            {text}
            {/* Tooltip arrow */}
            <div
              className="absolute"
              style={{
                left: position.arrowLeft || '50%',
                transform: 'translateX(-50%)',
                ...(position.arrowDirection === 'top'
                  ? { bottom: '-6px' }
                  : { top: '-6px' }
                ),
              }}
            >
              <div
                className="w-0 h-0 border-4 border-transparent"
                style={{
                  ...(position.arrowDirection === 'top'
                    ? { borderTopColor: '#1f2937' }
                    : { borderBottomColor: '#1f2937' }
                  ),
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
 
 