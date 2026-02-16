import { useState } from 'react';
import { roastCode } from './utils/api';

const LANGUAGES = ['Auto-detect', 'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'CSS', 'HTML', 'SQL', 'Other'];

function ScoreBar({ label, value, max = 100 }) {
  const pct = Math.round((Number(value) / max) * 100);
  const barColor = pct >= 80 ? '#238636' : pct >= 50 ? '#9e6a03' : '#da3633';
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
        <span style={{ color: '#8b949e' }}>{label}</span>
        <span style={{ color: barColor, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ background: '#21262d', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', background: barColor, height: '100%', borderRadius: 6, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

function SeverityBadge({ level }) {
  const colors = {
    critical: '#da3633', high: '#da3633', nuclear: '#da3633',
    medium: '#9e6a03', warning: '#9e6a03', spicy: '#9e6a03',
    low: '#238636', info: '#388bfd', mild: '#238636'
  };
  const bg = colors[level] || '#30363d';
  return <span style={{ display: 'inline-block', padding: '0.1rem 0.5rem', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, background: bg, color: '#fff' }}>{level}</span>;
}

function GradeDisplay({ grade }) {
  const gradeColors = {
    'A+': '#238636', 'A': '#238636', 'A-': '#2ea043',
    'B+': '#56d364', 'B': '#9e6a03', 'B-': '#9e6a03',
    'C+': '#d29922', 'C': '#d29922', 'C-': '#e3b341',
    'D+': '#da3633', 'D': '#da3633', 'D-': '#da3633',
    'F': '#da3633'
  };
  const color = gradeColors[grade] || '#8b949e';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', fontWeight: 900, color, lineHeight: 1 }}>{grade}</div>
      <div style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '0.3rem' }}>Letter Grade</div>
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleRoast = async () => {
    if (!code.trim()) { setError('Paste some code first!'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await roastCode(code, language === 'Auto-detect' ? '' : language);
      setResult(data);
      setActiveTab('overview');
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
      <div className='app'>
        <h1><span>Code Roast Battle</span></h1>
        <div className='loading'>
          <div className='spinner'></div>
          <p>Chef CodeRamsay is performing deep analysis...</p>
          <p style={{ color: '#8b949e', marginTop: '0.5rem', fontSize: '0.9rem' }}>Security scan, performance review, clean code audit...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'security', label: 'Security' },
    { id: 'performance', label: 'Performance' },
    { id: 'cleancode', label: 'Clean Code' },
    { id: 'issues', label: 'Issues' },
    { id: 'tests', label: 'Tests' },
    { id: 'rewrite', label: 'Rewrite' },
  ];

  if (result) {
    return (
      <div className='app'>
        <h1><span>Code Roast Battle</span></h1>
        <div className='results'>
          <div className='opening-roast'>“{result.openingRoast}”</div>

          {/* Tab Navigation */}
          <div className='tab-nav'>
            {tabs.map(t => (
              <button key={t.id} className={'tab-btn' + (activeTab === t.id ? ' active' : '')} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <div className='score-grid'>
                <div className='score-card'>
                  <div className='score-big'>{result.overallScore}<span style={{fontSize:'1.2rem'}}>/100</span></div>
                  <div style={{textAlign:'center',color:'#8b949e',fontSize:'0.85rem'}}>Overall Score</div>
                </div>
                {result.letterGrade && <div className='score-card'><GradeDisplay grade={result.letterGrade} /></div>}
                <div className='score-card'>
                  <div className={'hire-badge ' + getHireClass(result.wouldHire)}>{result.wouldHire}</div>
                  <div style={{color:'#8b949e',fontSize:'0.8rem',marginTop:'0.5rem'}}>{result.roastLevel}</div>
                </div>
              </div>

              {/* Score Overview Bars */}
              <div className='roast-card'>
                <div className='section-title'>Score Breakdown</div>
                {result.securityAnalysis && <ScoreBar label='Security' value={result.securityAnalysis.score} />}
                {result.performanceAnalysis && <ScoreBar label='Performance' value={result.performanceAnalysis.score} />}
                {result.bestPractices && <ScoreBar label='Best Practices' value={result.bestPractices.score} />}
                {result.cleanCodeScore != null && <ScoreBar label='Clean Code' value={result.cleanCodeScore} />}
                {result.maintainabilityIndex != null && <ScoreBar label='Maintainability' value={result.maintainabilityIndex} />}
              </div>

              {/* Dependency Analysis */}
              {result.dependencyAnalysis && (
                <div className='roast-card'>
                  <div className='section-title'>Dependency / Import Analysis</div>
                  {result.dependencyAnalysis.unusedImports?.length > 0 && (
                    <div style={{marginBottom:'0.8rem'}}>
                      <div style={{color:'#d29922',fontSize:'0.9rem',marginBottom:'0.3rem'}}>Unused Imports</div>
                      {result.dependencyAnalysis.unusedImports.map((u, i) => <span key={i} className='tag tag-warn'>{u}</span>)}
                    </div>
                  )}
                  {result.dependencyAnalysis.missingImports?.length > 0 && (
                    <div style={{marginBottom:'0.8rem'}}>
                      <div style={{color:'#da3633',fontSize:'0.9rem',marginBottom:'0.3rem'}}>Missing Imports</div>
                      {result.dependencyAnalysis.missingImports.map((m, i) => <span key={i} className='tag tag-error'>{m}</span>)}
                    </div>
                  )}
                  {result.dependencyAnalysis.suggestions?.length > 0 && (
                    <div>
                      <div style={{color:'#388bfd',fontSize:'0.9rem',marginBottom:'0.3rem'}}>Suggestions</div>
                      {result.dependencyAnalysis.suggestions.map((s, i) => <div key={i} style={{color:'#8b949e',fontSize:'0.85rem',marginBottom:'0.3rem'}}>- {s}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && result.securityAnalysis && (
            <div>
              <div className='roast-card'>
                <div className='section-title'>Security Analysis</div>
                <ScoreBar label='Security Score' value={result.securityAnalysis.score} />
                <p style={{color:'#8b949e',fontSize:'0.9rem',marginTop:'0.5rem',marginBottom:'1rem'}}>{result.securityAnalysis.summary}</p>
                {result.securityAnalysis.vulnerabilities?.map((v, i) => (
                  <div key={i} className='vuln-card'>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                      <span style={{color:'#f97316',fontWeight:700}}>{v.type}</span>
                      <SeverityBadge level={v.severity} />
                    </div>
                    <div style={{color:'#c9d1d9',fontSize:'0.9rem',marginBottom:'0.3rem'}}>{v.description}</div>
                    {v.location && <div style={{color:'#8b949e',fontSize:'0.8rem',marginBottom:'0.3rem'}}>Location: <code>{v.location}</code></div>}
                    <div style={{color:'#7ee787',fontSize:'0.85rem',marginBottom:'0.3rem'}}>Fix: {v.fix}</div>
                    {v.roast && <div style={{color:'#f97316',fontStyle:'italic',fontSize:'0.85rem'}}>{v.roast}</div>}
                  </div>
                ))}
                {(!result.securityAnalysis.vulnerabilities || result.securityAnalysis.vulnerabilities.length === 0) && (
                  <div style={{color:'#238636',textAlign:'center',padding:'1rem'}}>No security vulnerabilities detected. Chef is impressed... for once.</div>
                )}
              </div>
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && result.performanceAnalysis && (
            <div>
              <div className='roast-card'>
                <div className='section-title'>Performance Analysis</div>
                <ScoreBar label='Performance Score' value={result.performanceAnalysis.score} />
                <div style={{display:'flex',gap:'1.5rem',margin:'1rem 0',flexWrap:'wrap'}}>
                  {result.performanceAnalysis.timeComplexity && (
                    <div className='complexity-badge'>
                      <div style={{color:'#8b949e',fontSize:'0.75rem'}}>Time</div>
                      <div style={{color:'#f97316',fontWeight:700,fontSize:'1.1rem'}}>{result.performanceAnalysis.timeComplexity}</div>
                    </div>
                  )}
                  {result.performanceAnalysis.spaceComplexity && (
                    <div className='complexity-badge'>
                      <div style={{color:'#8b949e',fontSize:'0.75rem'}}>Space</div>
                      <div style={{color:'#388bfd',fontWeight:700,fontSize:'1.1rem'}}>{result.performanceAnalysis.spaceComplexity}</div>
                    </div>
                  )}
                </div>
                <p style={{color:'#8b949e',fontSize:'0.9rem',marginBottom:'1rem'}}>{result.performanceAnalysis.summary}</p>
                {result.performanceAnalysis.issues?.map((issue, i) => (
                  <div key={i} className='issue-card'>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                      <span style={{color:'#c9d1d9',fontWeight:600}}>{issue.issue}</span>
                      <SeverityBadge level={issue.impact} />
                    </div>
                    <div style={{color:'#7ee787',fontSize:'0.85rem'}}>Suggestion: {issue.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLEAN CODE TAB */}
          {activeTab === 'cleancode' && (
            <div>
              {result.cleanCodeBreakdown && (
                <div className='roast-card'>
                  <div className='section-title'>Clean Code Breakdown (Robert C. Martin)</div>
                  <ScoreBar label='Overall Clean Code Score' value={result.cleanCodeScore} />
                  <div style={{marginTop:'1rem'}}>
                    <ScoreBar label='Meaningful Names' value={result.cleanCodeBreakdown.meaningfulNames} max={10} />
                    <ScoreBar label='Small Functions' value={result.cleanCodeBreakdown.smallFunctions} max={10} />
                    <ScoreBar label='Single Responsibility' value={result.cleanCodeBreakdown.singleResponsibility} max={10} />
                    <ScoreBar label='DRY Principle' value={result.cleanCodeBreakdown.dryPrinciple} max={10} />
                    <ScoreBar label='Error Handling' value={result.cleanCodeBreakdown.errorHandling} max={10} />
                    <ScoreBar label='Readability' value={result.cleanCodeBreakdown.readability} max={10} />
                    <ScoreBar label='Formatting' value={result.cleanCodeBreakdown.formatting} max={10} />
                    <ScoreBar label='Comments' value={result.cleanCodeBreakdown.comments} max={10} />
                    <ScoreBar label='No Side Effects' value={result.cleanCodeBreakdown.noSideEffects} max={10} />
                    <ScoreBar label='Testability' value={result.cleanCodeBreakdown.testability} max={10} />
                  </div>
                </div>
              )}

              {result.maintainabilityIndex != null && (
                <div className='roast-card'>
                  <div className='section-title'>Maintainability Index</div>
                  <ScoreBar label='Maintainability' value={result.maintainabilityIndex} />
                </div>
              )}

              {/* Best Practices */}
              {result.bestPractices?.violations?.length > 0 && (
                <div className='roast-card'>
                  <div className='section-title'>Best Practice Violations</div>
                  {result.bestPractices.violations.map((v, i) => (
                    <div key={i} className='issue-card'>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                        <span style={{color:'#c9d1d9',fontWeight:600}}>{v.practice}</span>
                        <SeverityBadge level={v.severity} />
                      </div>
                      <div style={{color:'#8b949e',fontSize:'0.85rem',marginBottom:'0.3rem'}}>{v.description}</div>
                      <div style={{color:'#7ee787',fontSize:'0.85rem'}}>Fix: {v.fix}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Smells */}
              {result.codeSmells?.length > 0 && (
                <div className='roast-card'>
                  <div className='section-title'>Code Smells</div>
                  {result.codeSmells.map((s, i) => (
                    <div key={i} className='issue-card'>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                        <span style={{color:'#f97316',fontWeight:600}}>{typeof s === 'string' ? s : s.smell}</span>
                        {s.severity && <SeverityBadge level={s.severity} />}
                      </div>
                      {s.location && <div style={{color:'#8b949e',fontSize:'0.8rem'}}>Location: {s.location}</div>}
                      {s.description && <div style={{color:'#8b949e',fontSize:'0.85rem',marginTop:'0.2rem'}}>{s.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ISSUES TAB */}
          {activeTab === "issues" && (
            <div>
              {result.issues?.length > 0 && (
                <div className="roast-card">
                  <div className="section-title">Issues Found</div>
                  {result.issues.map((issue, i) => (
                    <div key={i} className="issue-card">
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                        <code style={{color:"#8b949e"}}>{issue.line}</code>
                        <SeverityBadge level={issue.severity} />
                      </div>
                      <div className="roast-text">“{issue.roast}“</div>
                      <div className="fix-text">Fix: {issue.fix}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TESTS TAB */}
          {activeTab === "tests" && (
            <div>
              {result.testSuggestions?.length > 0 && (
                <div className="roast-card">
                  <div className="section-title">Suggested Tests</div>
                  {result.testSuggestions.map((t, i) => (
                    <div key={i} className="test-card">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
                        <span className={"test-type test-" + t.type}>{t.type}</span>
                        <SeverityBadge level={t.priority} />
                      </div>
                      <div style={{color:"#c9d1d9",fontSize:"0.9rem"}}>{t.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REWRITE TAB */}
          {activeTab === "rewrite" && (
            <div>
              {result.rewrittenCode && (
                <div className="roast-card">
                  <div className="section-title">How It SHOULD Look</div>
                  <pre className="rewritten-code">{result.rewrittenCode}</pre>
                </div>
              )}
            </div>
          )}

          <div className="closing-roast">“{result.closingRoast}“</div>
          <button className="btn back-btn" onClick={() => setResult(null)}>Roast More Code</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1><span>Code Roast Battle</span></h1>
      <p className="subtitle">“This code is so bad, even the compiler is crying!“ - Chef CodeRamsay</p>
      {error && <p style={{ color: "#ef4444", textAlign: "center", marginBottom: "1rem" }}>{error}</p>}
      <div className="editor-section">
        <label>Language</label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
        </select>
        <label>Paste your code (if you dare)</label>
        <textarea className="code-input" placeholder="// Paste your code here..." value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); const s = e.target.selectionStart; setCode(code.substring(0, s) + "  " + code.substring(e.target.selectionEnd)); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0); }}} />
      </div>
      <button className="btn" onClick={handleRoast}>ROAST MY CODE</button>
    </div>
  );
}
