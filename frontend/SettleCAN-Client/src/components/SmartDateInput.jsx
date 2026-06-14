// SmartDateInput — YYYY / MM / DD segmented input with auto-advance cursor
// value: "YYYY-MM-DD" string or ""
// onChange(value): called with "YYYY-MM-DD" when all three segments are complete, or "" otherwise
import { useState, useRef, useEffect } from "react";

function parse(v) {
  if (v && v.length === 10) {
    const [y, m, d] = v.split("-");
    return [y || "", m || "", d || ""];
  }
  return ["", "", ""];
}

export default function SmartDateInput({ value, onChange, id }) {
  const [init]   = useState(() => parse(value));
  const [y, setY] = useState(init[0]);
  const [m, setM] = useState(init[1]);
  const [d, setD] = useState(init[2]);

  const yearRef  = useRef(null);
  const monthRef = useRef(null);
  const dayRef   = useRef(null);
  // Track the last value we emitted so we can distinguish external updates
  const lastEmitted = useRef(value || "");

  // Sync when parent sets the value externally (e.g. auto-fill from arrivalDate)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value || "";
      const [py, pm, pd] = parse(value);
      setY(py); setM(pm); setD(pd);
    }
  }, [value]);

  function emit(ny, nm, nd) {
    let composed = "";
    if (ny.length === 4 && nm.length >= 1 && nd.length >= 1) {
      composed = `${ny}-${nm.padStart(2, "0")}-${nd.padStart(2, "0")}`;
    }
    lastEmitted.current = composed;
    onChange(composed);
  }

  // ── Year ──────────────────────────────────────────────────────────────────
  function handleY(e) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setY(v);
    emit(v, m, d);
    if (v.length === 4) setTimeout(() => { monthRef.current?.focus(); monthRef.current?.select(); }, 0);
  }

  // ── Month ─────────────────────────────────────────────────────────────────
  function handleM(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (raw.length === 1) {
      const n = parseInt(raw, 10);
      // Digits 2–9 can only be valid as "02"–"09" — auto-pad and advance
      if (n > 1) {
        const padded = "0" + raw;
        setM(padded);
        emit(y, padded, d);
        setTimeout(() => { dayRef.current?.focus(); dayRef.current?.select(); }, 0);
        return;
      }
    }
    // Reject invalid two-digit months
    if (raw.length === 2 && (parseInt(raw, 10) < 1 || parseInt(raw, 10) > 12)) return;
    setM(raw);
    emit(y, raw, d);
    if (raw.length === 2) setTimeout(() => { dayRef.current?.focus(); dayRef.current?.select(); }, 0);
  }

  function handleMKey(e) {
    if (e.key === "Backspace" && m === "") { yearRef.current?.focus(); yearRef.current?.select(); }
  }

  function blurM() {
    if (m.length === 1) { const p = m.padStart(2, "0"); setM(p); emit(y, p, d); }
  }

  // ── Day ───────────────────────────────────────────────────────────────────
  function handleD(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (raw.length === 1) {
      const n = parseInt(raw, 10);
      // Digits 4–9 can only be valid as "04"–"09" — auto-pad
      if (n > 3) {
        const padded = "0" + raw;
        setD(padded);
        emit(y, m, padded);
        return;
      }
    }
    // Reject invalid two-digit days
    if (raw.length === 2 && (parseInt(raw, 10) < 1 || parseInt(raw, 10) > 31)) return;
    setD(raw);
    emit(y, m, raw);
  }

  function handleDKey(e) {
    if (e.key === "Backspace" && d === "") { monthRef.current?.focus(); monthRef.current?.select(); }
  }

  function blurD() {
    if (d.length === 1) { const p = d.padStart(2, "0"); setD(p); emit(y, m, p); }
  }

  return (
    <div className="smart-date" id={id}>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        maxLength={4}
        value={y}
        onChange={handleY}
        className="smart-date__seg smart-date__seg--year"
        aria-label="Year"
      />
      <span className="smart-date__sep">/</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        value={m}
        onChange={handleM}
        onKeyDown={handleMKey}
        onBlur={blurM}
        className="smart-date__seg smart-date__seg--md"
        aria-label="Month"
      />
      <span className="smart-date__sep">/</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        maxLength={2}
        value={d}
        onChange={handleD}
        onKeyDown={handleDKey}
        onBlur={blurD}
        className="smart-date__seg smart-date__seg--md"
        aria-label="Day"
      />
    </div>
  );
}
