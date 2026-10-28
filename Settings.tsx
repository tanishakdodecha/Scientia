"use client";

import { useEffect, useState } from "react";

type Theme = "paper" | "sepia" | "night";
type Size = "s" | "m" | "l" | "xl";
type Font = "serif" | "sans";
type Width = "narrow" | "comfortable" | "wide";

type Prefs = { theme: Theme; size: Size; font: Font; width: Width };

const KEYS = {
  theme: "scientia:theme",
  size: "scientia:size",
  font: "scientia:font",
  width: "scientia:width",
};

const DEFAULTS: Prefs = { theme: "paper", size: "m", font: "serif", width: "comfortable" };

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  return {
    theme: (localStorage.getItem(KEYS.theme) as Theme) ?? DEFAULTS.theme,
    size: (localStorage.getItem(KEYS.size) as Size) ?? DEFAULTS.size,
    font: (localStorage.getItem(KEYS.font) as Font) ?? DEFAULTS.font,
    width: (localStorage.getItem(KEYS.width) as Width) ?? DEFAULTS.width,
  };
}

function applyPrefs(p: Prefs): void {
  const d = document.documentElement;
  d.dataset.theme = p.theme;
  d.dataset.size = p.size;
  d.dataset.font = p.font;
  d.dataset.width = p.width;
  localStorage.setItem(KEYS.theme, p.theme);
  localStorage.setItem(KEYS.size, p.size);
  localStorage.setItem(KEYS.font, p.font);
  localStorage.setItem(KEYS.width, p.width);
}

function Seg<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <div className="seg">
        {options.map((o) => (
          <button key={o.value} type="button" className={o.value === value ? "on" : ""} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => setPrefs(readPrefs()), []);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      return next;
    });
  };

  return (
    <div className="settings">
      <button type="button" className="settings-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Aa
      </button>

      {open ? (
        <div className="settings-panel" role="dialog" aria-label="Reading settings">
          <div className="settings-title">Reading</div>

          <Seg
            label="Theme"
            value={prefs.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { value: "paper", label: "Paper" },
              { value: "sepia", label: "Sepia" },
              { value: "night", label: "Night" },
            ]}
          />
          <Seg
            label="Text size"
            value={prefs.size}
            onChange={(size) => update({ size })}
            options={[
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
            ]}
          />
          <Seg
            label="Font"
            value={prefs.font}
            onChange={(font) => update({ font })}
            options={[
              { value: "serif", label: "Serif" },
              { value: "sans", label: "Sans" },
            ]}
          />
          <Seg
            label="Width"
            value={prefs.width}
            onChange={(width) => update({ width })}
            options={[
              { value: "narrow", label: "Narrow" },
              { value: "comfortable", label: "Mid" },
              { value: "wide", label: "Wide" },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
