'use client';

import React, { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Label maps                                                         */
/* ------------------------------------------------------------------ */

const LABELS_EN: Record<string, string> = {
  front_bumper: 'Front Bumper',
  hood: 'Hood',
  windshield: 'Windshield',
  roof: 'Roof',
  rear_window: 'Rear Window',
  trunk: 'Trunk',
  rear_bumper: 'Rear Bumper',
  left_front_fender: 'Left Front Fender',
  left_front_door: 'Left Front Door',
  left_rear_door: 'Left Rear Door',
  left_rear_fender: 'Left Rear Fender',
  right_front_fender: 'Right Front Fender',
  right_front_door: 'Right Front Door',
  right_rear_door: 'Right Rear Door',
  right_rear_fender: 'Right Rear Fender',
};

const LABELS_ES: Record<string, string> = {
  front_bumper: 'Parachoques Delantero',
  hood: 'Capó',
  windshield: 'Parabrisas',
  roof: 'Techo',
  rear_window: 'Ventana Trasera',
  trunk: 'Maletero',
  rear_bumper: 'Parachoques Trasero',
  left_front_fender: 'Guardabarros Del. Izq.',
  left_front_door: 'Puerta Del. Izq.',
  left_rear_door: 'Puerta Tras. Izq.',
  left_rear_fender: 'Guardabarros Tras. Izq.',
  right_front_fender: 'Guardabarros Del. Der.',
  right_front_door: 'Puerta Del. Der.',
  right_rear_door: 'Puerta Tras. Der.',
  right_rear_fender: 'Guardabarros Tras. Der.',
};

/* ------------------------------------------------------------------ */
/*  Zone path definitions (top-down, nose pointing UP)                 */
/*  viewBox: 0 0 300 500                                               */
/* ------------------------------------------------------------------ */

interface ZoneDef {
  id: string;
  path: string;
}

// The car body spans roughly x:60–240, y:20–480
// Wheels at the four corners outside the main body
const ZONES: ZoneDef[] = [
  // --- Center column (top to bottom) ---
  {
    id: 'front_bumper',
    // Rounded front cap
    path: 'M 100,30 Q 100,12 150,10 Q 200,12 200,30 L 200,55 L 100,55 Z',
  },
  {
    id: 'hood',
    path: 'M 100,55 L 200,55 L 200,130 L 100,130 Z',
  },
  {
    id: 'windshield',
    // Tapers inward slightly for windshield shape
    path: 'M 100,130 L 200,130 L 192,175 L 108,175 Z',
  },
  {
    id: 'roof',
    path: 'M 108,175 L 192,175 L 192,315 L 108,315 Z',
  },
  {
    id: 'rear_window',
    // Tapers back outward
    path: 'M 108,315 L 192,315 L 200,360 L 100,360 Z',
  },
  {
    id: 'trunk',
    path: 'M 100,360 L 200,360 L 200,435 L 100,435 Z',
  },
  {
    id: 'rear_bumper',
    // Rounded rear cap
    path: 'M 100,435 L 200,435 L 200,460 Q 200,480 150,482 Q 100,480 100,460 Z',
  },

  // --- Left side (viewer's left = car's left) ---
  {
    id: 'left_front_fender',
    path: 'M 60,40 Q 60,25 80,22 L 100,30 L 100,110 L 60,110 Z',
  },
  {
    id: 'left_front_door',
    path: 'M 60,110 L 100,110 L 100,230 L 60,230 Z',
  },
  {
    id: 'left_rear_door',
    path: 'M 60,230 L 100,230 L 100,340 L 60,340 Z',
  },
  {
    id: 'left_rear_fender',
    path: 'M 60,340 L 100,340 L 100,460 L 80,470 Q 60,468 60,450 Z',
  },

  // --- Right side ---
  {
    id: 'right_front_fender',
    path: 'M 240,40 Q 240,25 220,22 L 200,30 L 200,110 L 240,110 Z',
  },
  {
    id: 'right_front_door',
    path: 'M 240,110 L 200,110 L 200,230 L 240,230 Z',
  },
  {
    id: 'right_rear_door',
    path: 'M 240,230 L 200,230 L 200,340 L 240,340 Z',
  },
  {
    id: 'right_rear_fender',
    path: 'M 240,340 L 200,340 L 200,460 L 220,470 Q 240,468 240,450 Z',
  },
];

/* ------------------------------------------------------------------ */
/*  Wheel definitions                                                  */
/* ------------------------------------------------------------------ */

interface WheelDef {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const WHEELS: WheelDef[] = [
  { cx: 52, cy: 90, rx: 14, ry: 22 },   // left front
  { cx: 248, cy: 90, rx: 14, ry: 22 },   // right front
  { cx: 52, cy: 400, rx: 14, ry: 22 },   // left rear
  { cx: 248, cy: 400, rx: 14, ry: 22 },  // right rear
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CarDiagramProps {
  selectedZones: string[];
  onToggleZone: (zone: string) => void;
  label?: string;
  readonly?: boolean;
  language?: 'en' | 'es';
}

export default function CarDiagram({
  selectedZones,
  onToggleZone,
  label,
  readonly = false,
  language = 'en',
}: CarDiagramProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const labels = language === 'es' ? LABELS_ES : LABELS_EN;

  const handleClick = useCallback(
    (zone: string) => {
      if (!readonly) {
        onToggleZone(zone);
      }
    },
    [readonly, onToggleZone],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGPathElement>, zone: string) => {
      setHoveredZone(zone);
      const svg = (e.target as SVGPathElement).closest('svg');
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setTooltipPos({ x, y });
      }
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGPathElement>) => {
      const svg = (e.target as SVGPathElement).closest('svg');
      if (svg) {
        const rect = svg.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredZone(null);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Label */}
      {label && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#9d9dba',
          }}
        >
          {label}
        </div>
      )}

      {/* SVG container */}
      <div style={{ position: 'relative', width: 300, height: 500 }}>
        <svg
          viewBox="0 0 300 500"
          width={300}
          height={500}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          {/* Car body outline (background shape for context) */}
          <path
            d={`
              M 80,22 Q 60,25 60,40
              L 60,450 Q 60,468 80,470
              L 100,460 L 100,435 L 100,460
              Q 130,482 150,482 Q 170,482 200,460
              L 200,435 L 200,460
              L 220,470 Q 240,468 240,450
              L 240,40 Q 240,25 220,22
              L 200,30
              Q 170,10 150,10 Q 130,10 100,30
              Z
            `}
            fill="#1A1A2E"
            stroke="#4a4a6a"
            strokeWidth={2}
          />

          {/* Wheels */}
          {WHEELS.map((w, i) => (
            <ellipse
              key={`wheel-${i}`}
              cx={w.cx}
              cy={w.cy}
              rx={w.rx}
              ry={w.ry}
              fill="#0a0a18"
              stroke="#3a3a55"
              strokeWidth={1.5}
            />
          ))}

          {/* Clickable zones */}
          {ZONES.map((zone) => {
            const isSelected = selectedZones.includes(zone.id);
            const isHovered = hoveredZone === zone.id;

            let fill = 'transparent';
            let stroke = 'transparent';
            let strokeWidth = 1;

            if (isSelected) {
              fill = 'rgba(216, 90, 48, 0.5)';
              stroke = '#D85A30';
              strokeWidth = 2;
            } else if (isHovered && !readonly) {
              fill = 'rgba(59, 130, 246, 0.2)';
              stroke = 'rgba(59, 130, 246, 0.4)';
              strokeWidth = 1.5;
            }

            return (
              <path
                key={zone.id}
                d={zone.path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                style={{
                  cursor: readonly ? 'default' : 'pointer',
                  transition: 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.15s ease',
                }}
                onClick={() => handleClick(zone.id)}
                onMouseEnter={(e) => handleMouseEnter(e, zone.id)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* Zone boundary lines for clarity */}
          <g stroke="#4a4a6a" strokeWidth={0.5} opacity={0.4}>
            {/* Horizontal separators on center column */}
            <line x1={100} y1={55} x2={200} y2={55} />
            <line x1={100} y1={130} x2={200} y2={130} />
            <line x1={108} y1={175} x2={192} y2={175} />
            <line x1={108} y1={315} x2={192} y2={315} />
            <line x1={100} y1={360} x2={200} y2={360} />
            <line x1={100} y1={435} x2={200} y2={435} />
            {/* Horizontal separators on left side */}
            <line x1={60} y1={110} x2={100} y2={110} />
            <line x1={60} y1={230} x2={100} y2={230} />
            <line x1={60} y1={340} x2={100} y2={340} />
            {/* Horizontal separators on right side */}
            <line x1={200} y1={110} x2={240} y2={110} />
            <line x1={200} y1={230} x2={240} y2={230} />
            <line x1={200} y1={340} x2={240} y2={340} />
            {/* Vertical body edges */}
            <line x1={100} y1={30} x2={100} y2={460} />
            <line x1={200} y1={30} x2={200} y2={460} />
          </g>

          {/* Side mirror accents */}
          <ellipse cx={50} cy={165} rx={8} ry={5} fill="#1A1A2E" stroke="#4a4a6a" strokeWidth={1} />
          <ellipse cx={250} cy={165} rx={8} ry={5} fill="#1A1A2E" stroke="#4a4a6a" strokeWidth={1} />

          {/* Headlight accents */}
          <ellipse cx={85} cy={38} rx={10} ry={5} fill="none" stroke="#5a5a7a" strokeWidth={0.8} opacity={0.5} />
          <ellipse cx={215} cy={38} rx={10} ry={5} fill="none" stroke="#5a5a7a" strokeWidth={0.8} opacity={0.5} />

          {/* Taillight accents */}
          <ellipse cx={85} cy={455} rx={10} ry={5} fill="none" stroke="#5a5a7a" strokeWidth={0.8} opacity={0.5} />
          <ellipse cx={215} cy={455} rx={10} ry={5} fill="none" stroke="#5a5a7a" strokeWidth={0.8} opacity={0.5} />
        </svg>

        {/* Tooltip */}
        {hoveredZone && (
          <div
            style={{
              position: 'absolute',
              left: tooltipPos.x,
              top: tooltipPos.y - 36,
              transform: 'translateX(-50%)',
              background: '#2a2a44',
              color: '#e0e0f0',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              border: '1px solid #3a3a5a',
              zIndex: 10,
            }}
          >
            {labels[hoveredZone] ?? hoveredZone}
          </div>
        )}
      </div>

      {/* Selected zone chips */}
      {selectedZones.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            maxWidth: 320,
          }}
        >
          {selectedZones.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => handleClick(zone)}
              disabled={readonly}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: '#f0c8b8',
                background: 'rgba(216, 90, 48, 0.18)',
                border: '1px solid rgba(216, 90, 48, 0.4)',
                borderRadius: 999,
                cursor: readonly ? 'default' : 'pointer',
                transition: 'background 0.2s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!readonly) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(216, 90, 48, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(216, 90, 48, 0.18)';
              }}
            >
              {labels[zone] ?? zone}
              {!readonly && (
                <span style={{ fontSize: 14, lineHeight: 1, opacity: 0.7 }}>&times;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
