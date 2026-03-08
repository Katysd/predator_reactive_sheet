import { useState, useRef, useCallback } from "react";

const GRADES = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
const gradeToVal = g => GRADES.indexOf(g) + 1;
const valToGrade = v => GRADES[Math.max(0, Math.min(6, v - 1))];

const BEHAVIOR_AXES = [
  'Attention', 'Willingness', 'Severity', 'Confidence',
  'Morality', 'Experience', 'Pleasure', 'Danger'
];
const CAPABILITY_AXES = [
  'Max Capacity', 'Digestive Control', 'Stomach Resilience', 'Acid Power',
  'Digestion Speed', 'Metabolism Efficiency', 'Appetite', 'Comfort'
];
const TONGUE_AXES = [
  'Length', 'Thickness', 'Viscosity', 'Dexterity',
  'Reach', 'Grip Strength', 'Sensitivity', 'Escape Diff'
];

const initGrades = axes => Object.fromEntries(axes.map(a => [a, 'F']));

function RadarChart({ axes, values, onChange, accentColor, bgColor }) {
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [hoveredGrade, setHoveredGrade] = useState(null);
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 55;
  const n = axes.length;
  const LEVELS = 7;

  const angleFor = i => (i / n) * 2 * Math.PI - Math.PI / 2;

  const ptFor = (i, val) => {
    const r = (val / LEVELS) * maxR;
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const labelOffset = i => {
    const a = angleFor(i);
    const base = maxR + 28;
    return [cx + base * Math.cos(a), cy + base * Math.sin(a)];
  };

  const dataPolyPoints = axes.map((ax, i) => ptFor(i, gradeToVal(values[ax])).join(',')).join(' ');
  const gridLevels = GRADES.length;

  const handleTickClick = (axisIdx, gradeIdx) => {
    onChange(axes[axisIdx], GRADES[gradeIdx]);
  };

  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {/* Dark circle BG */}
      <circle cx={cx} cy={cy} r={maxR + 12} fill="#111827" stroke="#374151" strokeWidth={2} />

      {/* Grid rings */}
      {GRADES.map((g, l) => {
        const pts = axes.map((_, i) => ptFor(i, l + 1).join(',')).join(' ');
        const isS = g === 'S';
        return (
          <polygon key={g} points={pts} fill="none"
            stroke={isS ? accentColor + '80' : '#2d3748'}
            strokeWidth={isS ? 1.5 : 0.8}
          />
        );
      })}

      {/* Axes */}
      {axes.map((_, i) => {
        const [ex, ey] = ptFor(i, LEVELS);
        return (
          <line key={i} x1={cx} y1={cy} x2={ex} y2={ey}
            stroke="#374151" strokeWidth={1} />
        );
      })}

      {/* Tick marks (clickable) */}
      {axes.map((_, i) =>
        GRADES.map((g, l) => {
          const [px, py] = ptFor(i, l + 1);
          const a = angleFor(i);
          const perp = 5;
          const px2 = Math.sin(a) * perp;
          const py2 = -Math.cos(a) * perp;
          const isHovered = hoveredAxis === i && hoveredGrade === l;
          const isCurrent = gradeToVal(values[axes[i]]) === l + 1;
          return (
            <g key={`${i}-${l}`}
              onClick={() => handleTickClick(i, l)}
              onMouseEnter={() => { setHoveredAxis(i); setHoveredGrade(l); }}
              onMouseLeave={() => { setHoveredAxis(null); setHoveredGrade(null); }}
              style={{ cursor: 'pointer' }}>
              {/* Bigger invisible hit target */}
              <circle cx={px} cy={py} r={8} fill="transparent" />
              <line
                x1={px - px2} y1={py - py2}
                x2={px + px2} y2={py + py2}
                stroke={isHovered ? accentColor : isCurrent ? '#aaa' : '#4a5568'}
                strokeWidth={isHovered || isCurrent ? 2.5 : 1.5}
              />
            </g>
          );
        })
      )}

      {/* Grade labels on vertical axis (top, axis 0) */}
      {GRADES.map((g, l) => {
        const [px, py] = ptFor(0, l + 1);
        return (
          <text key={g} x={px + 6} y={py + 4}
            fill={g === 'S' ? accentColor : '#6b7280'}
            fontSize={9} fontFamily="'Black Ops One', monospace" fontWeight="bold">
            {g}
          </text>
        );
      })}

      {/* Data polygon */}
      <polygon points={dataPolyPoints}
        fill={accentColor + '33'}
        stroke={accentColor}
        strokeWidth={2.5}
      />

      {/* Data dots */}
      {axes.map((ax, i) => {
        const [px, py] = ptFor(i, gradeToVal(values[ax]));
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={6} fill={accentColor} stroke="white" strokeWidth={1.5} />
            <text x={px} y={py + 4} textAnchor="middle" fill="white" fontSize={7}
              fontFamily="monospace" fontWeight="bold">
              {values[ax]}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      {axes.map((ax, i) => {
        const [lx, ly] = labelOffset(i);
        const words = ax.split(' ');
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle"
            fill="white" fontSize={9.5} fontFamily="'Black Ops One', monospace"
            dominantBaseline="middle">
            {words.length === 1
              ? <tspan>{words[0]}</tspan>
              : words.map((w, wi) => (
                <tspan key={wi} x={lx} dy={wi === 0 ? `-${(words.length - 1) * 6}` : '13'}>
                  {w}
                </tspan>
              ))
            }
          </text>
        );
      })}

      {/* Hover tooltip */}
      {hoveredAxis !== null && hoveredGrade !== null && (
        <g>
          <rect x={cx - 35} y={cy - 14} width={70} height={22} rx={4}
            fill="#000000cc" stroke={accentColor} strokeWidth={1} />
          <text x={cx} y={cy + 2} textAnchor="middle"
            fill={accentColor} fontSize={11} fontFamily="'Black Ops One', monospace">
            {axes[hoveredAxis]}: {GRADES[hoveredGrade]}
          </text>
        </g>
      )}
    </svg>
  );
}

function GradeRow({ label, value, onChange, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#9ca3af', fontSize: 9, fontFamily: "'Black Ops One', monospace", marginBottom: 3, letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {GRADES.map(g => (
          <button key={g} onClick={() => onChange(label, g)}
            style={{
              flex: 1, height: 22, cursor: 'pointer', border: 'none',
              borderRadius: 3,
              background: value === g ? color : '#1f2937',
              color: value === g ? '#000' : '#6b7280',
              fontSize: 10, fontWeight: 'bold',
              fontFamily: "'Black Ops One', monospace",
              transition: 'all 0.15s',
              outline: value === g ? `1px solid ${color}` : '1px solid #374151',
            }}>
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "'Black Ops One', monospace",
        fontSize: 11, color: '#ef4444',
        letterSpacing: 1, marginBottom: 6,
        textShadow: '0 0 8px #ef444466',
        textTransform: 'uppercase'
      }}>
        {label}:
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: '#0f0f0f88',
          border: '1px solid #3f1010',
          borderRadius: 4, color: '#e5e7eb',
          fontFamily: "'Crimson Text', Georgia, serif",
          fontSize: 13, padding: '8px 10px',
          resize: 'vertical', outline: 'none',
          lineHeight: 1.5,
        }}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}

export default function PredatorStatsSheet() {
  const [behaviorVals, setBehaviorVals] = useState(initGrades(BEHAVIOR_AXES));
  const [capabilityVals, setCapabilityVals] = useState(initGrades(CAPABILITY_AXES));
  const [physDesc, setPhysDesc] = useState('');
  const [mainInfo, setMainInfo] = useState('');
  const [history, setHistory] = useState('');
  const [alignment, setAlignment] = useState('');
  const [bellyType, setBellyType] = useState('');
  const [ratio, setRatio] = useState('');
  const [fatality, setFatality] = useState('');
  const [preyPref, setPreyPref] = useState('');
  const [style, setStyle] = useState('');
  const [tongueType, setTongueType] = useState('');
  const [tongueTraits, setTongueTraits] = useState('');
  const [postMeal, setPostMeal] = useState('');
  const [tongueVals, setTongueVals] = useState(initGrades(TONGUE_AXES));
  const [swallowMethod, setSwallowMethod] = useState('');
  const [preySize, setPreySize] = useState('');
  const [image, setImage] = useState(null);
  const [charName, setCharName] = useState('');
  const updateTongue = useCallback((ax, g) => setTongueVals(v => ({ ...v, [ax]: g })), []);
  const fileRef = useRef();

  const updateBehavior = useCallback((ax, g) => setBehaviorVals(v => ({ ...v, [ax]: g })), []);
  const updateCapability = useCallback((ax, g) => setCapabilityVals(v => ({ ...v, [ax]: g })), []);

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const inputStyle = {
    background: '#0f0f0f88',
    border: '1px solid #3f1010',
    borderRadius: 3, color: '#e5e7eb',
    fontFamily: "'Crimson Text', Georgia, serif",
    fontSize: 12, padding: '4px 8px',
    outline: 'none', width: '100%', boxSizing: 'border-box'
  };

  const panelLabel = {
    fontFamily: "'Black Ops One', monospace",
    fontSize: 10, color: '#ef4444',
    letterSpacing: 1, marginBottom: 3,
    textTransform: 'uppercase',
    textShadow: '0 0 8px #ef444466',
  };

  const sheetRef = useRef();

  const downloadPNG = () => {
    const doExport = () => {
      const el = sheetRef.current;
      window.scrollTo(0, 0);
      window.htmlToImage.toPng(el, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      }).then(dataUrl => {
        const link = document.createElement('a');
        link.download = `${charName || 'predator'}-stats.png`;
        link.href = dataUrl;
        link.click();
      });
    };

    if (window.htmlToImage) {
      doExport();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
      script.onload = doExport;
      document.head.appendChild(script);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px',
      fontFamily: "'Black Ops One', monospace",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      <div ref={sheetRef} style={{ display: 'flex', gap: 8, maxWidth: 1100, width: '100%' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 320, flexShrink: 0,
          background: 'linear-gradient(160deg, #2a0606 0%, #1a0303 40%, #2a0808 100%)',
          border: '3px solid #7f1d1d',
          borderRadius: 6, padding: 14,
          boxShadow: 'inset 0 0 60px #00000066, 0 0 20px #7f1d1d44',
          position: 'relative',
          backgroundImage: `
            linear-gradient(160deg, #2a0606 0%, #1a0303 40%, #2a0808 100%),
            repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff04 10px, #ffffff04 11px)
          `,
          backgroundBlendMode: 'normal',
        }}>
          {/* Title */}
          <div style={{
            textAlign: 'center', fontSize: 18, color: 'white',
            fontFamily: "'Black Ops One', monospace",
            textShadow: '2px 2px 0 #7f1d1d, 0 0 20px #ef444488',
            marginBottom: 12, letterSpacing: 2,
          }}>
            PREDATOR STATS SHEET
          </div>

          {/* Character name */}
          <div style={{ marginBottom: 10 }}>
            <input value={charName} onChange={e => setCharName(e.target.value)}
              placeholder="CHARACTER NAME"
              style={{
                ...inputStyle, textAlign: 'center',
                fontFamily: "'Black Ops One', monospace",
                fontSize: 13, letterSpacing: 1,
                border: '1px solid #7f1d1d',
              }} />
          </div>

          {/* Image upload */}
          <div onClick={() => fileRef.current?.click()}
            style={{
              width: '100%', aspectRatio: '3/4',
              background: image ? 'transparent' : '#0a0a0a',
              border: `2px dashed ${image ? '#7f1d1d' : '#3f1010'}`,
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', marginBottom: 12,
              position: 'relative',
              transition: 'border-color 0.2s',
            }}>
            {image
              ? <img src={image} alt="character"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center', color: '#4b1010' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>⬆</div>
                <div style={{ fontSize: 10, fontFamily: "'Black Ops One', monospace", letterSpacing: 1 }}>
                  CLICK TO UPLOAD IMAGE
                </div>
              </div>
            }
            {image && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#00000099', textAlign: 'center',
                padding: '4px', fontSize: 9, color: '#ef4444',
                fontFamily: "'Black Ops One', monospace",
              }}>
                CLICK TO CHANGE
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage}
            style={{ display: 'none' }} />

          <EditableField label="Physical Description" value={physDesc} onChange={setPhysDesc} rows={3} />
          <EditableField label="Main Information" value={mainInfo} onChange={setMainInfo} rows={3} />
          <EditableField label="Predator History" value={history} onChange={setHistory} rows={3} />

          {/* Bottom stats grid */}
          <div style={{
            borderTop: '1px solid #3f1010',
            paddingTop: 10, marginTop: 6,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px'
          }}>
            {[
              ['Predator Alignment', alignment, setAlignment],
              ['Belly Type', bellyType, setBellyType],
              ['Prey/Pred Ratio', ratio, setRatio],
              ['Fatality %', fatality, setFatality],
              ['Prey Preferences', preyPref, setPreyPref],
              ['Preferred Prey Size', preySize, setPreySize],
              ['Consumption Style', style, setStyle],
              ['Swallow Method', swallowMethod, setSwallowMethod],
              ['Post-Meal Behavior', postMeal, setPostMeal],
            ].map(([lbl, val, set]) => (
              <div key={lbl}>
                <div style={panelLabel}>{lbl}</div>
                <input value={val} onChange={e => set(e.target.value)}
                  style={{ ...inputStyle, fontSize: 11 }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* BEHAVIOR */}
          <div style={{
            background: 'linear-gradient(135deg, #0d2235 0%, #0a1929 50%, #0d2235 100%)',
            border: '3px solid #1e40af',
            borderRadius: 6, padding: '12px 14px',
            boxShadow: '0 0 20px #1e40af44, inset 0 0 40px #00000055',
          }}>
            <div style={{
              fontFamily: "'Black Ops One', monospace",
              fontSize: 16, color: 'white',
              textShadow: '2px 2px 0 #1e40af, 0 0 15px #3b82f688',
              marginBottom: 8, letterSpacing: 2,
            }}>
              PREDATOR BEHAVIOR
            </div>
            <RadarChart axes={BEHAVIOR_AXES} values={behaviorVals}
              onChange={updateBehavior} accentColor="#60a5fa" bgColor="#1e3a5f" />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {BEHAVIOR_AXES.map(ax => (
                <GradeRow key={ax} label={ax} value={behaviorVals[ax]}
                  onChange={updateBehavior} color="#60a5fa" />
              ))}
            </div>
          </div>

          {/* CAPABILITY */}
          <div style={{
            background: 'linear-gradient(135deg, #0d2010 0%, #0a1a09 50%, #0d2010 100%)',
            border: '3px solid #16a34a',
            borderRadius: 6, padding: '12px 14px',
            boxShadow: '0 0 20px #16a34a44, inset 0 0 40px #00000055',
          }}>
            <div style={{
              fontFamily: "'Black Ops One', monospace",
              fontSize: 16, color: 'white',
              textShadow: '2px 2px 0 #166534, 0 0 15px #4ade8088',
              marginBottom: 8, letterSpacing: 2,
            }}>
              PREDATOR CAPABILITY
            </div>
            <RadarChart axes={CAPABILITY_AXES} values={capabilityVals}
              onChange={updateCapability} accentColor="#4ade80" bgColor="#14532d" />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {CAPABILITY_AXES.map(ax => (
                <GradeRow key={ax} label={ax} value={capabilityVals[ax]}
                  onChange={updateCapability} color="#4ade80" />
              ))}
            </div>
          </div>

          {/* TONGUE */}
          <div style={{
            background: 'linear-gradient(135deg, #2a0a1a 0%, #1a0612 50%, #2a0a1a 100%)',
            border: '3px solid #db2777',
            borderRadius: 6, padding: '12px 14px',
            boxShadow: '0 0 20px #db277744, inset 0 0 40px #00000055',
          }}>
            <div style={{
              fontFamily: "'Black Ops One', monospace",
              fontSize: 16, color: 'white',
              textShadow: '2px 2px 0 #9d174d, 0 0 15px #f472b688',
              marginBottom: 8, letterSpacing: 2,
            }}>
              TONGUE PROFILE
            </div>
            <RadarChart axes={TONGUE_AXES} values={tongueVals}
              onChange={updateTongue} accentColor="#f472b6" bgColor="#831843" />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 12 }}>
              {TONGUE_AXES.map(ax => (
                <GradeRow key={ax} label={ax} value={tongueVals[ax]}
                  onChange={updateTongue} color="#f472b6" />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 16px' }}>
              {[
                ['Tongue Type', tongueType, setTongueType, 'e.g. long, forked, thick...'],
                ['Special Traits', tongueTraits, setTongueTraits, 'e.g. prehensile, glowing...'],
                ['Swallow Method', swallowMethod, setSwallowMethod, 'e.g. gulp, coil, drag...'],
              ].map(([lbl, val, set, ph]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: "'Black Ops One', monospace", fontSize: 9, color: '#f472b6', letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' }}>
                    {lbl}
                  </div>
                  <input value={val} onChange={e => set(e.target.value)}
                    placeholder={ph}
                    style={{
                      background: '#0f0f1888', border: '1px solid #831843',
                      borderRadius: 3, color: '#e5e7eb',
                      fontFamily: "'Crimson Text', Georgia, serif",
                      fontSize: 12, padding: '4px 8px',
                      outline: 'none', width: '100%', boxSizing: 'border-box'
                    }} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Download button */}
      <button onClick={downloadPNG} style={{
        marginTop: 20,
        padding: '12px 40px',
        fontFamily: "'Black Ops One', monospace",
        fontSize: 14, letterSpacing: 2,
        color: '#0a0a0a',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        border: '2px solid #7f1d1d',
        borderRadius: 6,
        cursor: 'pointer',
        boxShadow: '0 0 20px #ef444466, 0 4px 12px #00000088',
        textTransform: 'uppercase',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.target.style.boxShadow = '0 0 35px #ef4444aa, 0 4px 16px #00000088'}
        onMouseLeave={e => e.target.style.boxShadow = '0 0 20px #ef444466, 0 4px 12px #00000088'}
      >
        ⬇ Export as PNG
      </button>
    </div>
  );
}