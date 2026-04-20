'use client';

import React, { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Label maps                                                         */
/* ------------------------------------------------------------------ */

const LABELS_EN: Record<string, string> = {
  head: 'Head',
  face: 'Face',
  neck: 'Neck',
  left_shoulder: 'Left Shoulder',
  right_shoulder: 'Right Shoulder',
  chest: 'Chest',
  left_upper_arm: 'Left Upper Arm',
  right_upper_arm: 'Right Upper Arm',
  left_forearm: 'Left Forearm',
  right_forearm: 'Right Forearm',
  left_hand: 'Left Hand',
  right_hand: 'Right Hand',
  abdomen: 'Abdomen',
  left_hip: 'Left Hip',
  right_hip: 'Right Hip',
  left_thigh: 'Left Thigh',
  right_thigh: 'Right Thigh',
  left_knee: 'Left Knee',
  right_knee: 'Right Knee',
  left_shin: 'Left Shin',
  right_shin: 'Right Shin',
  left_foot: 'Left Foot',
  right_foot: 'Right Foot',
  upper_back: 'Upper Back',
  mid_back: 'Mid Back',
  lower_back: 'Lower Back',
};

const LABELS_ES: Record<string, string> = {
  head: 'Cabeza',
  face: 'Cara',
  neck: 'Cuello',
  left_shoulder: 'Hombro Izquierdo',
  right_shoulder: 'Hombro Derecho',
  chest: 'Pecho',
  left_upper_arm: 'Brazo Superior Izquierdo',
  right_upper_arm: 'Brazo Superior Derecho',
  left_forearm: 'Antebrazo Izquierdo',
  right_forearm: 'Antebrazo Derecho',
  left_hand: 'Mano Izquierda',
  right_hand: 'Mano Derecha',
  abdomen: 'Abdomen',
  left_hip: 'Cadera Izquierda',
  right_hip: 'Cadera Derecha',
  left_thigh: 'Muslo Izquierdo',
  right_thigh: 'Muslo Derecho',
  left_knee: 'Rodilla Izquierda',
  right_knee: 'Rodilla Derecha',
  left_shin: 'Espinilla Izquierda',
  right_shin: 'Espinilla Derecha',
  left_foot: 'Pie Izquierdo',
  right_foot: 'Pie Derecho',
  upper_back: 'Espalda Superior',
  mid_back: 'Espalda Media',
  lower_back: 'Espalda Baja',
};

/* ------------------------------------------------------------------ */
/*  Zone shape definitions                                             */
/* ------------------------------------------------------------------ */

/*  Each zone is either an ellipse or a path. Coordinates are within a
    200 x 420 viewBox.  Anatomical proportions (8-head canon simplified):
      head center ~100, 38  |  shoulders ~60-140, 105
      torso 70-130          |  hips ~72-128, 210
      knees ~280            |  feet ~395                              */

interface ZoneEllipse {
  kind: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface ZonePath {
  kind: 'path';
  d: string;
}

interface ZoneRect {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}

type ZoneShape = ZoneEllipse | ZonePath | ZoneRect;

interface ZoneDef {
  id: string;
  shape: ZoneShape;
}

/* ---------- FRONT VIEW zones ---------- */

const FRONT_ZONES: ZoneDef[] = [
  // Head (top oval)
  { id: 'head', shape: { kind: 'ellipse', cx: 100, cy: 30, rx: 20, ry: 22 } },
  // Face (lower part of head)
  { id: 'face', shape: { kind: 'ellipse', cx: 100, cy: 42, rx: 16, ry: 12 } },
  // Neck
  { id: 'neck', shape: { kind: 'rect', x: 92, y: 52, width: 16, height: 18, rx: 4 } },
  // Shoulders
  { id: 'left_shoulder', shape: { kind: 'path', d: 'M 82 70 Q 60 68 52 82 L 60 90 Q 68 78 82 78 Z' } },
  { id: 'right_shoulder', shape: { kind: 'path', d: 'M 118 70 Q 140 68 148 82 L 140 90 Q 132 78 118 78 Z' } },
  // Chest
  { id: 'chest', shape: { kind: 'path', d: 'M 74 78 L 126 78 L 126 130 Q 100 135 74 130 Z' } },
  // Abdomen
  { id: 'abdomen', shape: { kind: 'path', d: 'M 74 130 Q 100 135 126 130 L 126 175 Q 100 180 74 175 Z' } },
  // Upper arms
  { id: 'left_upper_arm', shape: { kind: 'path', d: 'M 52 82 L 60 90 L 56 140 L 44 140 Q 42 110 52 82 Z' } },
  { id: 'right_upper_arm', shape: { kind: 'path', d: 'M 148 82 L 140 90 L 144 140 L 156 140 Q 158 110 148 82 Z' } },
  // Forearms
  { id: 'left_forearm', shape: { kind: 'path', d: 'M 44 140 L 56 140 L 52 200 L 40 200 Z' } },
  { id: 'right_forearm', shape: { kind: 'path', d: 'M 144 140 L 156 140 L 160 200 L 148 200 Z' } },
  // Hands
  { id: 'left_hand', shape: { kind: 'path', d: 'M 40 200 L 52 200 L 50 224 Q 46 230 38 224 Z' } },
  { id: 'right_hand', shape: { kind: 'path', d: 'M 148 200 L 160 200 L 162 224 Q 154 230 150 224 Z' } },
  // Hips
  { id: 'left_hip', shape: { kind: 'path', d: 'M 74 175 Q 100 180 100 180 L 100 200 L 74 200 Q 70 188 74 175 Z' } },
  { id: 'right_hip', shape: { kind: 'path', d: 'M 126 175 Q 100 180 100 180 L 100 200 L 126 200 Q 130 188 126 175 Z' } },
  // Thighs
  { id: 'left_thigh', shape: { kind: 'path', d: 'M 74 200 L 100 200 L 96 270 L 78 270 Q 72 235 74 200 Z' } },
  { id: 'right_thigh', shape: { kind: 'path', d: 'M 100 200 L 126 200 L 122 270 Q 128 235 126 200 Z' } },
  // Knees
  { id: 'left_knee', shape: { kind: 'ellipse', cx: 87, cy: 280, rx: 12, ry: 14 } },
  { id: 'right_knee', shape: { kind: 'ellipse', cx: 113, cy: 280, rx: 12, ry: 14 } },
  // Shins
  { id: 'left_shin', shape: { kind: 'path', d: 'M 78 294 L 96 294 L 94 360 L 80 360 Z' } },
  { id: 'right_shin', shape: { kind: 'path', d: 'M 104 294 L 122 294 L 120 360 L 106 360 Z' } },
  // Feet
  { id: 'left_foot', shape: { kind: 'path', d: 'M 80 360 L 94 360 L 96 385 Q 90 395 76 390 L 74 370 Z' } },
  { id: 'right_foot', shape: { kind: 'path', d: 'M 106 360 L 120 360 L 126 370 L 124 390 Q 110 395 104 385 Z' } },
];

/* ---------- BACK VIEW zones ---------- */

const BACK_ZONES: ZoneDef[] = [
  // Head
  { id: 'head', shape: { kind: 'ellipse', cx: 100, cy: 30, rx: 20, ry: 22 } },
  // Neck
  { id: 'neck', shape: { kind: 'rect', x: 92, y: 52, width: 16, height: 18, rx: 4 } },
  // Shoulders
  { id: 'left_shoulder', shape: { kind: 'path', d: 'M 82 70 Q 60 68 52 82 L 60 90 Q 68 78 82 78 Z' } },
  { id: 'right_shoulder', shape: { kind: 'path', d: 'M 118 70 Q 140 68 148 82 L 140 90 Q 132 78 118 78 Z' } },
  // Back zones (instead of chest/abdomen)
  { id: 'upper_back', shape: { kind: 'path', d: 'M 74 78 L 126 78 L 126 118 Q 100 122 74 118 Z' } },
  { id: 'mid_back', shape: { kind: 'path', d: 'M 74 118 Q 100 122 126 118 L 126 152 Q 100 156 74 152 Z' } },
  { id: 'lower_back', shape: { kind: 'path', d: 'M 74 152 Q 100 156 126 152 L 126 175 Q 100 180 74 175 Z' } },
  // Upper arms
  { id: 'left_upper_arm', shape: { kind: 'path', d: 'M 52 82 L 60 90 L 56 140 L 44 140 Q 42 110 52 82 Z' } },
  { id: 'right_upper_arm', shape: { kind: 'path', d: 'M 148 82 L 140 90 L 144 140 L 156 140 Q 158 110 148 82 Z' } },
  // Forearms
  { id: 'left_forearm', shape: { kind: 'path', d: 'M 44 140 L 56 140 L 52 200 L 40 200 Z' } },
  { id: 'right_forearm', shape: { kind: 'path', d: 'M 144 140 L 156 140 L 160 200 L 148 200 Z' } },
  // Hands
  { id: 'left_hand', shape: { kind: 'path', d: 'M 40 200 L 52 200 L 50 224 Q 46 230 38 224 Z' } },
  { id: 'right_hand', shape: { kind: 'path', d: 'M 148 200 L 160 200 L 162 224 Q 154 230 150 224 Z' } },
  // Hips
  { id: 'left_hip', shape: { kind: 'path', d: 'M 74 175 Q 100 180 100 180 L 100 200 L 74 200 Q 70 188 74 175 Z' } },
  { id: 'right_hip', shape: { kind: 'path', d: 'M 126 175 Q 100 180 100 180 L 100 200 L 126 200 Q 130 188 126 175 Z' } },
  // Thighs
  { id: 'left_thigh', shape: { kind: 'path', d: 'M 74 200 L 100 200 L 96 270 L 78 270 Q 72 235 74 200 Z' } },
  { id: 'right_thigh', shape: { kind: 'path', d: 'M 100 200 L 126 200 L 122 270 Q 128 235 126 200 Z' } },
  // Knees
  { id: 'left_knee', shape: { kind: 'ellipse', cx: 87, cy: 280, rx: 12, ry: 14 } },
  { id: 'right_knee', shape: { kind: 'ellipse', cx: 113, cy: 280, rx: 12, ry: 14 } },
  // Shins
  { id: 'left_shin', shape: { kind: 'path', d: 'M 78 294 L 96 294 L 94 360 L 80 360 Z' } },
  { id: 'right_shin', shape: { kind: 'path', d: 'M 104 294 L 122 294 L 120 360 L 106 360 Z' } },
  // Feet
  { id: 'left_foot', shape: { kind: 'path', d: 'M 80 360 L 94 360 L 96 385 Q 90 395 76 390 L 74 370 Z' } },
  { id: 'right_foot', shape: { kind: 'path', d: 'M 106 360 L 120 360 L 126 370 L 124 390 Q 110 395 104 385 Z' } },
];

/* ------------------------------------------------------------------ */
/*  Body outline (decorative, not interactive)                         */
/* ------------------------------------------------------------------ */

const BODY_OUTLINE_FRONT =
  'M 100 8 ' +
  'Q 122 8 122 30 Q 122 52 100 54 Q 78 52 78 30 Q 78 8 100 8 Z ' + // head
  'M 94 54 L 94 70 L 106 70 L 106 54 ' + // neck
  'M 82 70 Q 52 66 46 90 L 40 140 L 36 200 L 34 224 Q 34 234 46 232 L 54 204 L 60 140 L 66 90 ' + // left arm
  'M 118 70 Q 148 66 154 90 L 160 140 L 164 200 L 166 224 Q 166 234 154 232 L 146 204 L 140 140 L 134 90 ' + // right arm
  'M 66 90 L 66 175 Q 66 205 74 210 L 78 270 L 75 294 L 76 360 L 72 390 Q 72 398 96 398 L 96 360 L 96 294 ' + // left leg
  'L 100 210 ' +
  'L 104 294 L 104 360 L 104 398 Q 128 398 128 390 L 124 360 L 125 294 L 122 270 L 126 210 Q 134 205 134 175 L 134 90'; // right leg

const BODY_OUTLINE_BACK =
  'M 100 8 ' +
  'Q 122 8 122 30 Q 122 52 100 54 Q 78 52 78 30 Q 78 8 100 8 Z ' +
  'M 94 54 L 94 70 L 106 70 L 106 54 ' +
  'M 82 70 Q 52 66 46 90 L 40 140 L 36 200 L 34 224 Q 34 234 46 232 L 54 204 L 60 140 L 66 90 ' +
  'M 118 70 Q 148 66 154 90 L 160 140 L 164 200 L 166 224 Q 166 234 154 232 L 146 204 L 140 140 L 134 90 ' +
  'M 66 90 L 66 175 Q 66 205 74 210 L 78 270 L 75 294 L 76 360 L 72 390 Q 72 398 96 398 L 96 360 L 96 294 ' +
  'L 100 210 ' +
  'L 104 294 L 104 360 L 104 398 Q 128 398 128 390 L 124 360 L 125 294 L 122 270 L 126 210 Q 134 205 134 175 L 134 90';

/* ------------------------------------------------------------------ */
/*  Zone rendering                                                     */
/* ------------------------------------------------------------------ */

interface ZoneProps {
  zone: ZoneDef;
  isSelected: boolean;
  label: string;
  onClick: () => void;
  readonly: boolean;
}

function Zone({ zone, isSelected, label, onClick, readonly }: ZoneProps) {
  const [hovered, setHovered] = useState(false);

  const fill = isSelected
    ? 'rgba(216, 90, 48, 0.4)'
    : hovered && !readonly
    ? 'rgba(59, 130, 246, 0.15)'
    : 'transparent';

  const stroke = isSelected ? '#D85A30' : 'transparent';
  const strokeWidth = isSelected ? 1.5 : 0;

  const common: React.SVGAttributes<SVGElement> = {
    fill,
    stroke,
    strokeWidth,
    style: {
      cursor: readonly ? 'default' : 'pointer',
      transition: 'fill 0.2s ease, stroke 0.2s ease',
    },
    onClick: readonly ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  /* Compute center for tooltip positioning */
  let cx = 100;
  let cy = 100;
  const s = zone.shape;
  if (s.kind === 'ellipse') {
    cx = s.cx;
    cy = s.cy;
  } else if (s.kind === 'rect') {
    cx = s.x + s.width / 2;
    cy = s.y + s.height / 2;
  } else {
    // rough center from path – extract numbers and average
    const nums = s.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    if (xs.length) cx = xs.reduce((a, b) => a + b, 0) / xs.length;
    if (ys.length) cy = ys.reduce((a, b) => a + b, 0) / ys.length;
  }

  return (
    <g>
      {s.kind === 'ellipse' && <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...(common as React.SVGAttributes<SVGEllipseElement>)} />}
      {s.kind === 'path' && <path d={s.d} {...(common as React.SVGAttributes<SVGPathElement>)} />}
      {s.kind === 'rect' && <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx ?? 0} {...(common as React.SVGAttributes<SVGRectElement>)} />}

      {/* Tooltip on hover */}
      {hovered && (
        <g pointerEvents="none">
          <rect
            x={cx - label.length * 3.2 - 4}
            y={cy - 22}
            width={label.length * 6.4 + 8}
            height={16}
            rx={4}
            fill="rgba(15, 15, 26, 0.92)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth={0.5}
          />
          <text
            x={cx}
            y={cy - 11}
            textAnchor="middle"
            fill="#c5c3e0"
            fontSize={8}
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  BodyView (single front or back view)                               */
/* ------------------------------------------------------------------ */

interface BodyViewProps {
  zones: ZoneDef[];
  outline: string;
  title: string;
  labels: Record<string, string>;
  selectedParts: string[];
  onTogglePart: (part: string) => void;
  readonly: boolean;
}

function BodyView({ zones, outline, title, labels, selectedParts, onTogglePart, readonly }: BodyViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#7f77dd',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {title}
      </span>
      <svg
        viewBox="0 0 200 410"
        width={200}
        height={410}
        style={{ overflow: 'visible' }}
      >
        {/* Body outline */}
        <path
          d={outline}
          fill="none"
          stroke="#4a4a6a"
          strokeWidth={1.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Clickable zones */}
        {zones.map((z) => (
          <Zone
            key={z.id}
            zone={z}
            isSelected={selectedParts.includes(z.id)}
            label={labels[z.id] ?? z.id}
            onClick={() => onTogglePart(z.id)}
            readonly={readonly}
          />
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                            */
/* ------------------------------------------------------------------ */

interface BodyDiagramProps {
  selectedParts: string[];
  onTogglePart: (part: string) => void;
  readonly?: boolean;
  language?: 'en' | 'es';
}

export default function BodyDiagram({
  selectedParts,
  onTogglePart,
  readonly = false,
  language = 'en',
}: BodyDiagramProps) {
  const labels = language === 'es' ? LABELS_ES : LABELS_EN;

  const handleRemove = useCallback(
    (part: string) => {
      if (!readonly) onTogglePart(part);
    },
    [readonly, onTogglePart],
  );

  const frontTitle = language === 'es' ? 'FRENTE' : 'FRONT';
  const backTitle = language === 'es' ? 'ESPALDA' : 'BACK';
  const selectedLabel = language === 'es' ? 'Lesiones seleccionadas' : 'Selected injuries';
  const nonePlaceholder = language === 'es' ? 'Haga clic en el cuerpo para marcar lesiones' : 'Click on the body to mark injuries';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
      {/* Side-by-side views */}
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        <BodyView
          zones={FRONT_ZONES}
          outline={BODY_OUTLINE_FRONT}
          title={frontTitle}
          labels={labels}
          selectedParts={selectedParts}
          onTogglePart={onTogglePart}
          readonly={readonly}
        />
        <BodyView
          zones={BACK_ZONES}
          outline={BODY_OUTLINE_BACK}
          title={backTitle}
          labels={labels}
          selectedParts={selectedParts}
          onTogglePart={onTogglePart}
          readonly={readonly}
        />
      </div>

      {/* Selected injury chips */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#7f77dd',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {selectedLabel}
        </span>

        {selectedParts.length === 0 ? (
          <span
            style={{
              fontSize: 13,
              color: '#6a6a8a',
              fontStyle: 'italic',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {nonePlaceholder}
          </span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedParts.map((part) => (
              <button
                key={part}
                type="button"
                onClick={() => handleRemove(part)}
                disabled={readonly}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(216, 90, 48, 0.5)',
                  background: 'rgba(216, 90, 48, 0.12)',
                  color: '#e8a888',
                  fontSize: 12,
                  fontFamily: 'system-ui, sans-serif',
                  cursor: readonly ? 'default' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!readonly) (e.currentTarget.style.background = 'rgba(216, 90, 48, 0.25)');
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget.style.background = 'rgba(216, 90, 48, 0.12)');
                }}
              >
                {labels[part] ?? part}
                {!readonly && (
                  <span style={{ fontSize: 14, lineHeight: 1, marginLeft: 2, color: '#D85A30' }}>&times;</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
