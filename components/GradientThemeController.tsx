'use client';

import { useEffect } from 'react';

const THEMES = ['theme-a', 'theme-b', 'theme-c', 'theme-d'];

function updateTheme() {
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
  const nextTheme = THEMES[bucket % THEMES.length];

  document.body.classList.remove(...THEMES);
  document.body.classList.add(nextTheme);
}

export default function GradientThemeController() {
  useEffect(() => {
    updateTheme();
    const id = window.setInterval(updateTheme, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
