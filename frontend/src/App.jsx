import { useState } from 'react';
import { roastCode } from './utils/api';

const LANGUAGES = ['Auto-detect', 'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'CSS', 'HTML', 'SQL', 'Other'];

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoast = async () => {
    if (!code.trim()) { setError('Paste some code first!'); return; }
    setLoading(true); setError('');
    try {
      const data = await roastCode(code, language === 'Auto-detect' ? '' : language);
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const getHireClass = (v) => {
    if (!v) return 'maybe';
    if (v.includes('YES')) return 'yes';
    if (v.includes('MAYBE')) return 'maybe';
    return 'no';
  };

  if (loading) {
    return (
      <div className="app">
        <h1><span>Code Roast Battle</span></h1>
        <div className="loading">
          <div className="spinner"></div>
          <p>Chef CodeRamsay is reviewing your code...</p>
          <p style={{ color: '#8b949e', marginTop: '0.5rem', fontSize: '0.9rem' }}>"This code is so raw it's still MOOING!"</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="app">
        <h1><span>Code Roast Battle</span></h1>
        <div className="results">
          <div className="opening-roast">"{result.openingRoast}"</div>
          
          <div className="score-section">
            <div><div className="score-big">{result.overallScore}<span style={{fontSize:'1.5rem'}}>/100</span></div><div style={{textAlign:'center',color:'#8b949e'}}>Code Quality</div></div>
            <div style={{textAlign:'center'}}><div className={`hire-badge ${getHireClass(result.wouldHire)}`}>{result.wouldHire}</div><div style={{color:'#8b949e',fontSize:'0.8rem',marginTop:'0.3rem'}}>{result.roastLevel}</div></div>
          </div>

          {result.issues?.length > 0 && (
            <div className="roast-card">
              <div className="section-title">Issues Found</div>
              {result.issues.map((issue, i) => (
                <div key={i} className="issue-card">
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><code style={{color:'#8b949e'}}>{issue.line}</code><span className={`severity ${issue.severity}`}>{issue.severity}</span></div>
                  <div className="roast-text">"{issue.roast}"</div>
                  <div className="fix-text">Fix: {issue.fix}</div>
                </div>
              ))}
            </div>
          )}

          <div className="roast-card">
            <div className="section-title">Code Smells</div>
            {result.codeSmells?.map((s, i) => <span key={i} className="tag">{s}</span>)}
            {result.bestPracticeViolations?.length > 0 && (
              <>
                <div className="section-title" style={{marginTop:'1rem'}}>Best Practice Violations</div>
                {result.bestPracticeViolations.map((v, i) => <span key={i} className="tag">{v}</span>)}
              </>
            )}
          </div>

          {result.rewrittenCode && (
            <div className="roast-card">
              <div className="section-title">How It SHOULD Look</div>
              <pre className="rewritten-code">{result.rewrittenCode}</pre>
            </div>
          )}

          <div className="closing-roast">"{result.closingRoast}"</div>
          <button className="btn back-btn" onClick={() => setResult(null)}>Roast More Code</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1><span>Code Roast Battle</span></h1>
      <p className="subtitle">"This code is so bad, even the compiler is crying!" - Chef CodeRamsay</p>
      {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
      <div className="editor-section">
        <label>Language</label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
        </select>
        <label>Paste your code (if you dare)</label>
        <textarea className="code-input" placeholder="// Paste your code here..." value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart; setCode(code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd)); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0); }}} />
      </div>
      <button className="btn" onClick={handleRoast}>ROAST MY CODE</button>
    </div>
  );
}
