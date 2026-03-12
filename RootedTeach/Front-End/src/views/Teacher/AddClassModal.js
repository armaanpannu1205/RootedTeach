import React, { useState, useEffect } from 'react';
import './AddClassModal.css';

// MUI Icons
import SchoolIcon        from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaletteIcon       from '@mui/icons-material/Palette';
import MenuBookIcon      from '@mui/icons-material/MenuBook';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import RoomIcon          from '@mui/icons-material/Room';
import EmailIcon         from '@mui/icons-material/Email';
import StarIcon          from '@mui/icons-material/Star';
import GradeIcon         from '@mui/icons-material/Grade';
import ViewWeekIcon      from '@mui/icons-material/ViewWeek';
import AddIcon           from '@mui/icons-material/Add';
import DeleteIcon        from '@mui/icons-material/Delete';
import ArrowForwardIcon  from '@mui/icons-material/ArrowForward';
import ArrowBackIcon     from '@mui/icons-material/ArrowBack';
import CheckIcon         from '@mui/icons-material/Check';

const COLORS = ['#7C6FE0','#E06F6F','#4FBDBA','#E8A040','#4299e1','#38a169','#9F7AEA','#ED8936'];
const SEASONS = ['Fall','Winter','Spring','Summer'];
const DEFAULT_WEEKS = Array.from({ length: 10 }, (_, i) => ({ week: `Week ${i + 1}`, topic: '' }));
const DEFAULT_GRADING = [
  { category: 'Assignments',  weight: '' },
  { category: 'Midterm',      weight: '' },
  { category: 'Final',        weight: '' },
  { category: 'Participation',weight: '' },
];

const AddClassModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [step, setStep]             = useState(1);
  // Step 1 — basics
  const [title, setTitle]           = useState('');
  const [courseName, setCourseName] = useState('');
  const [season, setSeason]         = useState('Winter');
  const [year, setYear]             = useState('');
  const [color, setColor]           = useState('#7C6FE0');
  // Step 2 — syllabus info
  const [lectureTime, setLectureTime]   = useState('');
  const [location, setLocation]         = useState('');
  const [officeHours, setOfficeHours]   = useState('');
  const [units, setUnits]               = useState('4');
  const [email, setEmail]               = useState('');
  const [description, setDescription]   = useState('');
  // Step 3 — schedule + grading
  const [weeks, setWeeks]     = useState(DEFAULT_WEEKS);
  const [grading, setGrading] = useState(DEFAULT_GRADING);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setYear(String(currentYear));
    if (initialData) {
      setTitle(initialData.title || initialData.className || '');
      setCourseName(initialData.courseName || '');
      setColor(initialData.color || '#7C6FE0');
      const parts = (initialData.quarter || `Winter ${currentYear}`).split(' ');
      setSeason(parts[0] || 'Winter');
      setYear(parts[1] || String(currentYear));
      const s = initialData.syllabus || {};
      setLectureTime(s.lectureTime || '');
      setLocation(s.location || '');
      setOfficeHours(s.officeHours || '');
      setUnits(s.units || '4');
      setEmail(s.email || '');
      setDescription(s.description || '');
      setWeeks(s.weeks?.length ? s.weeks : DEFAULT_WEEKS.map(w => ({ ...w })));
      setGrading(s.grading?.length ? s.grading : DEFAULT_GRADING.map(g => ({ ...g })));
    } else {
      setTitle(''); setCourseName(''); setSeason('Winter'); setColor('#7C6FE0');
      setLectureTime(''); setLocation(''); setOfficeHours(''); setUnits('4');
      setEmail(''); setDescription('');
      setWeeks(DEFAULT_WEEKS.map(w => ({ ...w })));
      setGrading(DEFAULT_GRADING.map(g => ({ ...g })));
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const updateWeek    = (i, val)        => setWeeks(w => w.map((x, idx) => idx === i ? { ...x, topic: val } : x));
  const updateGrading = (i, field, val) => setGrading(g => g.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title, courseName,
      quarter: `${season} ${year}`,
      color,
      syllabus: { lectureTime, location, officeHours, units, email, description, weeks, grading },
    });
    onClose();
  };

  // Step indicator
  const STEPS = [
    { n: 1, label: 'Basics',   icon: <SchoolIcon style={{ fontSize: 16 }}/> },
    { n: 2, label: 'Details',  icon: <MenuBookIcon style={{ fontSize: 16 }}/> },
    { n: 3, label: 'Schedule', icon: <ViewWeekIcon style={{ fontSize: 16 }}/> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--wide" onClick={e => e.stopPropagation()}>

        {/* Step indicator */}
        <div className="modal-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div
                className={`modal-step ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}
                style={{ '--step-color': color }}
                onClick={() => step > s.n && setStep(s.n)}
              >
                <div className="modal-step-dot">
                  {step > s.n ? <CheckIcon style={{ fontSize: 14 }}/> : s.icon}
                </div>
                <span className="modal-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="modal-step-line" style={{ background: step > s.n ? color : '#e8eaf0' }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        <h2 className="modal-title">{initialData ? 'Edit Class' : 'Create New Class'}</h2>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <>
              <div className="modal-field">
                <div className="modal-form-label-text"><SchoolIcon style={{ fontSize: 15 }}/> Class Code *</div>
                <input className="modal-input" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. CS 35L" required autoFocus/>
              </div>
              <div className="modal-field">
                <div className="modal-form-label-text"><MenuBookIcon style={{ fontSize: 15 }}/> Course Name</div>
                <input className="modal-input" value={courseName} onChange={e => setCourseName(e.target.value)}
                  placeholder="e.g. Software Construction"/>
              </div>
              <div className="modal-field">
                <div className="modal-form-label-text"><CalendarMonthIcon style={{ fontSize: 15 }}/> Quarter</div>
                <div className="modal-quarter-row">
                  <select value={season} onChange={e => setSeason(e.target.value)} className="modal-select">
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={year} onChange={e => setYear(e.target.value)} className="modal-select">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <div className="modal-form-label-text"><PaletteIcon style={{ fontSize: 15 }}/> Theme Color</div>
                <div className="modal-color-swatches">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`modal-swatch ${color === c ? 'selected' : ''}`}
                      style={{ background: c }}/>
                  ))}
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    className="modal-color-custom" title="Custom color"/>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={onClose} className="modal-button-cancel">Cancel</button>
                <button type="button" className="modal-button-save"
                  onClick={() => { if (!title.trim()) return; setStep(2); }}
                  style={{ background: color }}>
                  Next <ArrowForwardIcon style={{ fontSize: 17 }}/>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Syllabus Details ── */}
          {step === 2 && (
            <>
              <div className="modal-grid-2">
                <div className="modal-field">
                  <div className="modal-form-label-text"><AccessTimeIcon style={{ fontSize: 15 }}/> Lecture Time</div>
                  <input className="modal-input" value={lectureTime} onChange={e => setLectureTime(e.target.value)}
                    placeholder="e.g. MWF 10:00–11:00 AM"/>
                </div>
                <div className="modal-field">
                  <div className="modal-form-label-text"><RoomIcon style={{ fontSize: 15 }}/> Location / Room</div>
                  <input className="modal-input" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Boelter 3400"/>
                </div>
                <div className="modal-field">
                  <div className="modal-form-label-text"><AccessTimeIcon style={{ fontSize: 15 }}/> Office Hours</div>
                  <input className="modal-input" value={officeHours} onChange={e => setOfficeHours(e.target.value)}
                    placeholder="e.g. Mon 2–4 PM, Thu 3–5 PM"/>
                </div>
                <div className="modal-field">
                  <div className="modal-form-label-text"><StarIcon style={{ fontSize: 15 }}/> Units</div>
                  <input className="modal-input" value={units} onChange={e => setUnits(e.target.value)}
                    placeholder="e.g. 4"/>
                </div>
                <div className="modal-field modal-field--full">
                  <div className="modal-form-label-text"><EmailIcon style={{ fontSize: 15 }}/> Contact Email</div>
                  <input type="email" className="modal-input" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. professor@ucla.edu"/>
                </div>
                <div className="modal-field modal-field--full">
                  <div className="modal-form-label-text"><MenuBookIcon style={{ fontSize: 15 }}/> Course Description</div>
                  <textarea className="modal-input modal-textarea" rows={3} value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief overview of what students will learn…"/>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setStep(1)} className="modal-button-cancel">
                  <ArrowBackIcon style={{ fontSize: 17 }}/> Back
                </button>
                <button type="button" className="modal-button-save" onClick={() => setStep(3)}
                  style={{ background: color }}>
                  Next <ArrowForwardIcon style={{ fontSize: 17 }}/>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Schedule + Grading ── */}
          {step === 3 && (
            <>
              {/* Weekly schedule */}
              <div className="modal-field">
                <div className="modal-form-label-text"><ViewWeekIcon style={{ fontSize: 15 }}/> Weekly Schedule</div>
                <div className="modal-week-list">
                  {weeks.map((w, i) => (
                    <div key={i} className="modal-week-row">
                      <span className="modal-week-label" style={{ color }}>{w.week}</span>
                      <input className="modal-input modal-week-input" value={w.topic}
                        onChange={e => updateWeek(i, e.target.value)}
                        placeholder={`Topic for ${w.week}…`}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grading breakdown */}
              <div className="modal-field">
                <div className="modal-grading-header">
                  <div className="modal-form-label-text"><GradeIcon style={{ fontSize: 15 }}/> Grading Breakdown</div>
                  <button type="button" className="modal-add-row-btn" style={{ color, borderColor: color }}
                    onClick={() => setGrading(g => [...g, { category: '', weight: '' }])}>
                    <AddIcon style={{ fontSize: 15 }}/> Add Row
                  </button>
                </div>
                <div className="modal-grading-table">
                  <div className="modal-grading-header-row">
                    <span>Category</span>
                    <span>Weight</span>
                    <span/>
                  </div>
                  {grading.map((g, i) => (
                    <div key={i} className="modal-grading-row">
                      <input className="modal-input" style={{ margin: 0 }} value={g.category}
                        onChange={e => updateGrading(i, 'category', e.target.value)}
                        placeholder="e.g. Assignments"/>
                      <input className="modal-input" style={{ margin: 0 }} value={g.weight}
                        onChange={e => updateGrading(i, 'weight', e.target.value)}
                        placeholder="e.g. 30%"/>
                      <button type="button" onClick={() => setGrading(g => g.filter((_, idx) => idx !== i))}
                        className="modal-delete-row-btn">
                        <DeleteIcon style={{ fontSize: 16 }}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setStep(2)} className="modal-button-cancel">
                  <ArrowBackIcon style={{ fontSize: 17 }}/> Back
                </button>
                <button type="submit" className="modal-button-save" style={{ background: color }}>
                  <CheckIcon style={{ fontSize: 17 }}/> {initialData ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default AddClassModal;