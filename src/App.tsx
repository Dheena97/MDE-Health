import { useMemo, useState, type ChangeEvent } from 'react';
import Papa from 'papaparse';

type Report = { file: string; rows: number; devices: Set<string> };
const norm = (v: unknown) => String(v ?? '').trim().toLowerCase().split('.')[0];

function readCsv(file: File, label: string, progress: (n: number) => void): Promise<Report> {
  return new Promise((resolve, reject) => {
    let rows = 0; let column = ''; const devices = new Set<string>();
    Papa.parse<Record<string, string>>(file, {
      header: true, skipEmptyLines: 'greedy', chunkSize: 512 * 1024,
      chunk: (result) => {
        if (!column) column = (result.meta.fields ?? []).find(h => ['device name','computer name','hostname'].includes(h.trim().toLowerCase())) ?? '';
        result.data.forEach(row => { rows++; const name = norm(row[column]); if (name) devices.add(name); });
        progress(Math.min(99, Math.round(result.meta.cursor * 100 / file.size)));
      },
      complete: () => { progress(100); resolve({ file: file.name, rows, devices }); },
      error: e => reject(new Error(e.message)),
    });
  });
}

export default function App() {
  const [intune, setIntune] = useState<Report | null>(null);
  const [mde, setMde] = useState<Report | null>(null);
  const [busy, setBusy] = useState(''); const [percent, setPercent] = useState(0); const [error, setError] = useState('');
  const summary = useMemo(() => { if (!intune || !mde) return null; let matched = 0; intune.devices.forEach(d => { if (mde.devices.has(d)) matched++; }); return { matched, missing: intune.devices.size - matched, rate: intune.devices.size ? Math.round(matched * 100 / intune.devices.size) : 0 }; }, [intune, mde]);
  const upload = async (event: ChangeEvent<HTMLInputElement>, type: 'intune' | 'mde') => {
    const file = event.target.files?.[0]; if (!file) return; setError(''); setBusy(type === 'intune' ? 'Reading Intune export' : 'Reading MDE health report'); setPercent(0);
    try { const report = await readCsv(file, busy, setPercent); if (type === 'intune') setIntune(report); else setMde(report); } catch (e) { setError(e instanceof Error ? e.message : 'Could not read this CSV.'); } finally { setBusy(''); event.target.value = ''; }
  };
  return <main style={{ minHeight:'100vh', background:'#f4f7fb', color:'#172033', fontFamily:'Arial,sans-serif', padding:'48px max(24px,8vw)' }}>
    <p style={{ color:'#2563eb', fontWeight:800, letterSpacing:2 }}>MDE HEALTH</p><h1 style={{ fontSize:48, margin:'8px 0' }}>Large CSV health assessment</h1><p style={{ color:'#61708a', maxWidth:700 }}>Files are read in 512 KB chunks with live progress. Nothing is uploaded; data stays in this browser.</p>
    <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:18, marginTop:30 }}>
      <Upload title="1. Intune device export" report={intune} onChange={e => upload(e,'intune')} />
      <Upload title="2. MDE health report" report={mde} onChange={e => upload(e,'mde')} />
    </section>
    {busy && <section style={{ background:'#fff', padding:18, borderRadius:14, marginTop:22 }}><b>{busy}</b><div style={{ height:10, background:'#e5ebf6', borderRadius:9, marginTop:12 }}><div style={{ height:10, width:percent + '%', background:'#2563eb', borderRadius:9 }} /></div><p>{percent}%</p></section>}
    {error && <p style={{ color:'#b42318', fontWeight:700 }}>{error}</p>}
    <section style={{ background:'#fff', padding:26, borderRadius:16, marginTop:22 }}><h2>Assessment</h2>{summary ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}><Metric label="Matched devices" value={String(summary.matched)} color="#16805c" /><Metric label="Missing from MDE" value={String(summary.missing)} color="#c2413b" /><Metric label="Match rate" value={String(summary.rate) + '%'} color="#2563eb" /></div> : <p style={{ color:'#61708a' }}>Upload both reports to calculate coverage. Device names are matched without case or domain suffix.</p>}</section>
  </main>;
}
function Upload({ title, report, onChange }: { title:string; report:Report|null; onChange:(e:ChangeEvent<HTMLInputElement>)=>void }) { return <label style={{ background:'#fff', padding:24, borderRadius:16, border:'1px solid #dce5f3', display:'grid', gap:10, cursor:'pointer' }}><b>{title}</b><span style={{ color:'#61708a' }}>{report ? report.rows.toLocaleString() + ' rows · ' + report.devices.size.toLocaleString() + ' devices' : 'Choose a CSV file'}</span><input style={{ display:'none' }} type="file" accept=".csv,text/csv" onChange={onChange}/><span style={{ background:'#2563eb', color:'#fff', padding:'10px 14px', borderRadius:8, width:'fit-content', fontWeight:700 }}>Choose CSV</span></label>; }
function Metric({ label, value, color }: { label:string; value:string; color:string }) { return <article style={{ background:'#f8faff', padding:18, borderRadius:12 }}><span style={{ color:'#61708a' }}>{label}</span><strong style={{ display:'block', color, fontSize:32, marginTop:8 }}>{value}</strong></article>; }
