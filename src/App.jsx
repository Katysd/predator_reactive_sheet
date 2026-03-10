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

const TRANSLATIONS = {
  en: {
    title: 'PREDATOR STATS SHEET 1.04',
    charName: 'CHARACTER NAME',
    uploadImage: 'CLICK TO UPLOAD IMAGE',
    clickToChange: 'CLICK TO CHANGE',
    physDesc: 'Physical Description',
    mainInfo: 'Main Information',
    predHistory: 'Predator History',
    predAlignment: 'Predator Alignment',
    bellyType: 'Belly Type',
    ratio: 'Prey/Pred Ratio',
    fatality: 'Fatality %',
    preyPref: 'Prey Preferences',
    preySize: 'Preferred Prey Size',
    consStyle: 'Consumption Style',
    swallowMethod: 'Swallow Method',
    postMeal: 'Post-Meal Behavior',
    behaviorTitle: 'PREDATOR BEHAVIOR',
    capabilityTitle: 'PREDATOR CAPABILITY',
    tongueTitle: '👅 TONGUE PROFILE',
    tongueType: 'Tongue Type',
    tongueTypePH: 'e.g. long, forked, thick...',
    specialTraits: 'Special Traits',
    specialTraitsPH: 'e.g. prehensile, glowing...',
    exportBtn: '⬇ Export as PNG',
    physDescPH: 'Enter physical description...',
    mainInfoPH: 'Enter main information...',
    predHistoryPH: 'Enter predator history...',
    behaviorAxes: ['Attention', 'Willingness', 'Severity', 'Confidence', 'Morality', 'Experience', 'Pleasure', 'Danger'],
    capabilityAxes: ['Max Capacity', 'Digestive Control', 'Stomach Resilience', 'Acid Power', 'Digestion Speed', 'Metabolism Efficiency', 'Appetite', 'Comfort'],
    tongueAxes: ['Length', 'Thickness', 'Viscosity', 'Dexterity', 'Reach', 'Grip Strength', 'Sensitivity', 'Escape Diff'],
  },
  es: {
    title: 'FICHA DE ESTADÍSTICAS 1.04',
    charName: 'NOMBRE DEL PERSONAJE',
    uploadImage: 'CLICK PARA SUBIR IMAGEN',
    clickToChange: 'CLICK PARA CAMBIAR',
    physDesc: 'Descripción Física',
    mainInfo: 'Información Principal',
    predHistory: 'Historia del Predador',
    predAlignment: 'Alineamiento',
    bellyType: 'Tipo de Barriga',
    ratio: 'Ratio Presa/Pred',
    fatality: '% Fatalidad',
    preyPref: 'Preferencias de Presa',
    preySize: 'Tamaño de Presa Preferido',
    consStyle: 'Estilo de Consumo',
    swallowMethod: 'Método de Trago',
    postMeal: 'Comportamiento Post-Comida',
    behaviorTitle: 'COMPORTAMIENTO',
    capabilityTitle: 'CAPACIDADES',
    tongueTitle: '👅 PERFIL DE LENGUA',
    tongueType: 'Tipo de Lengua',
    tongueTypePH: 'ej. larga, bífida, gruesa...',
    specialTraits: 'Rasgos Especiales',
    specialTraitsPH: 'ej. prensil, brillante...',
    exportBtn: '⬇ Exportar como PNG',
    physDescPH: 'Escribe la descripción física...',
    mainInfoPH: 'Escribe la información principal...',
    predHistoryPH: 'Escribe la historia del predador...',
    behaviorAxes: ['Atención', 'Disposición', 'Severidad', 'Confianza', 'Moralidad', 'Experiencia', 'Placer', 'Peligro'],
    capabilityAxes: ['Cap. Máxima', 'Control Digestivo', 'Resist. Estomacal', 'Poder Ácido', 'Vel. Digestión', 'Efic. Metabólica', 'Apetito', 'Comodidad'],
    tongueAxes: ['Longitud', 'Grosor', 'Viscosidad', 'Destreza', 'Alcance', 'Fuerza de Agarre', 'Sensibilidad', 'Dif. de Escape'],
  }
};

const initGrades = axes => Object.fromEntries(axes.map(a => [a, 'F']));


function RadarChart({ axes, displayAxes, values, onChange, accentColor }) {
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
        const words = (displayAxes ? displayAxes[i] : ax).split(' ');
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
            {displayAxes ? displayAxes[hoveredAxis] : axes[hoveredAxis]}: {GRADES[hoveredGrade]}
          </text>
        </g>
      )}
    </svg>
  );
}

function GradeRow({ label, displayLabel, value, onChange, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#9ca3af', fontSize: 9, fontFamily: "'Black Ops One', monospace", marginBottom: 3, letterSpacing: 0.5 }}>
        {displayLabel || label}
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

function EditableField({ label, value, onChange, rows = 3, placeholder }) {
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
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
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
  const [lang, setLang] = useState('en');
  const T = TRANSLATIONS[lang];
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

  const [exporting, setExporting] = useState(false);

  const downloadPNG = () => {
    setExporting(true);
    const doExport = () => {
      const el = sheetRef.current;
      window.scrollTo(0, 0);

      // Force desktop layout temporarily
      const prevWidth = el.style.width;
      const prevMinWidth = el.style.minWidth;
      el.style.width = '1100px';
      el.style.minWidth = '1100px';

      setTimeout(() => {
        window.htmlToImage.toPng(el, {
          pixelRatio: 2,
          backgroundColor: '#0a0a0a',
          width: 1100,
        }).then(dataUrl => {
          el.style.width = prevWidth;
          el.style.minWidth = prevMinWidth;
          setExporting(false);

          // Try standard download first
          try {
            const link = document.createElement('a');
            link.download = `${charName || 'predator'}-stats.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch {
            // Fallback for iOS/mobile: open in new tab
            window.open(dataUrl, '_blank');
          }
        }).catch(err => {
          el.style.width = prevWidth;
          el.style.minWidth = prevMinWidth;
          setExporting(false);
          alert('Export failed: ' + err.message);
        });
      }, 150);
    };

    if (window.htmlToImage) {
      doExport();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
      script.onload = doExport;
      script.onerror = () => {
        setExporting(false);
        alert('Could not load export library. Check your internet connection.');
      };
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
          {/* Title + lang toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{
              fontSize: 18, color: 'white',
              fontFamily: "'Black Ops One', monospace",
              textShadow: '2px 2px 0 #7f1d1d, 0 0 20px #ef444488',
              letterSpacing: 2,
            }}>
              {T.title}
            </div>
            <button onClick={() => setLang(l => l === 'en' ? 'es' : 'en')} style={{
              fontFamily: "'Black Ops One', monospace",
              fontSize: 11, letterSpacing: 1,
              color: '#ef4444', background: 'transparent',
              border: '1px solid #7f1d1d', borderRadius: 4,
              padding: '3px 8px', cursor: 'pointer',
            }}>
              {lang === 'en' ? '🌐 ES' : '🌐 EN'}
            </button>
          </div>

          {/* Character name */}
          <div style={{ marginBottom: 10 }}>
            <input value={charName} onChange={e => setCharName(e.target.value)}
              placeholder={T.charName}
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
                  {T.uploadImage}
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
                {T.clickToChange}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage}
            style={{ display: 'none' }} />

          <EditableField label={T.physDesc} value={physDesc} onChange={setPhysDesc} rows={3} placeholder={T.physDescPH} />
          <EditableField label={T.mainInfo} value={mainInfo} onChange={setMainInfo} rows={3} placeholder={T.mainInfoPH} />
          <EditableField label={T.predHistory} value={history} onChange={setHistory} rows={3} placeholder={T.predHistoryPH} />

          {/* Bottom stats grid */}
          <div style={{
            borderTop: '1px solid #3f1010',
            paddingTop: 10, marginTop: 6,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px'
          }}>
            {[
              [T.predAlignment, alignment, setAlignment],
              [T.bellyType, bellyType, setBellyType],
              [T.ratio, ratio, setRatio],
              [T.fatality, fatality, setFatality],
              [T.preyPref, preyPref, setPreyPref],
              [T.preySize, preySize, setPreySize],
              [T.consStyle, style, setStyle],
              [T.swallowMethod, swallowMethod, setSwallowMethod],
              [T.postMeal, postMeal, setPostMeal],
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
              {T.behaviorTitle}
            </div>
            <RadarChart axes={BEHAVIOR_AXES} displayAxes={T.behaviorAxes} values={behaviorVals}
              onChange={updateBehavior} accentColor="#60a5fa" bgColor="#1e3a5f" />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {BEHAVIOR_AXES.map((ax, i) => (
                <GradeRow key={ax} label={ax} displayLabel={T.behaviorAxes[i]} value={behaviorVals[ax]}
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
              {T.capabilityTitle}
            </div>
            <RadarChart axes={CAPABILITY_AXES} displayAxes={T.capabilityAxes} values={capabilityVals}
              onChange={updateCapability} accentColor="#4ade80" bgColor="#14532d" />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {CAPABILITY_AXES.map((ax, i) => (
                <GradeRow key={ax} label={ax} displayLabel={T.capabilityAxes[i]} value={capabilityVals[ax]}
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
              {T.tongueTitle}
            </div>
            <RadarChart axes={TONGUE_AXES} displayAxes={T.tongueAxes} values={tongueVals}
              onChange={updateTongue} accentColor="#f472b6" bgColor="#831843" />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 12 }}>
              {TONGUE_AXES.map((ax, i) => (
                <GradeRow key={ax} label={ax} displayLabel={T.tongueAxes[i]} value={tongueVals[ax]}
                  onChange={updateTongue} color="#f472b6" />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {[
                [T.tongueType, tongueType, setTongueType, T.tongueTypePH],
                [T.specialTraits, tongueTraits, setTongueTraits, T.specialTraitsPH],
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
      <button onClick={downloadPNG} disabled={exporting} style={{
        marginTop: 20,
        padding: '12px 40px',
        fontFamily: "'Black Ops One', monospace",
        fontSize: 14, letterSpacing: 2,
        color: '#0a0a0a',
        background: exporting
          ? 'linear-gradient(135deg, #6b2222, #4a1515)'
          : 'linear-gradient(135deg, #ef4444, #dc2626)',
        border: '2px solid #7f1d1d',
        borderRadius: 6,
        cursor: exporting ? 'not-allowed' : 'pointer',
        boxShadow: '0 0 20px #ef444466, 0 4px 12px #00000088',
        textTransform: 'uppercase',
        transition: 'all 0.2s',
        opacity: exporting ? 0.7 : 1,
      }}
        onMouseEnter={e => { if (!exporting) e.target.style.boxShadow = '0 0 35px #ef4444aa, 0 4px 16px #00000088'; }}
        onMouseLeave={e => e.target.style.boxShadow = '0 0 20px #ef444466, 0 4px 12px #00000088'}
      >
        {exporting ? '⏳ Generating...' : T.exportBtn}
      </button>
    </div>
  );
}