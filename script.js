<script>
/* === Anti-DevTools léger — dissuasif, pas sécurisé === */

/* Empêche F12 et plusieurs raccourcis DevTools */
document.addEventListener('keydown', function(e) {
  // touches courantes à bloquer : F12, Ctrl/Cmd+Shift+I/J/C/U, Ctrl+U
  if (e.key === 'F12') {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  // Windows / Linux
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
    e.preventDefault(); e.stopPropagation(); return false;
  }
  if (e.ctrlKey && (e.key === 'U')) {
    e.preventDefault(); e.stopPropagation(); return false;
  }
  // Mac (Cmd)
  if (e.metaKey && e.altKey && e.key === 'I') {
    e.preventDefault(); e.stopPropagation(); return false;
  }
});

/* Bloque le menu contextuel (clic droit) */
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

/* Optionnel : détecte (approximativement) si les devtools sont ouverts
   et affiche une overlay dissuasive. Cette détection n'est pas fiable à 100%. */
(function detectDevTools() {
  let devtoolsOpen = false;
  const threshold = 160; // pixels approximatifs
  function check() {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const open = widthThreshold || heightThreshold;
    if (open !== devtoolsOpen) {
      devtoolsOpen = open;
      if (devtoolsOpen) showOverlay();
      else hideOverlay();
    }
  }

  // overlay UI
  const overlay = document.createElement('div');
  overlay.id = 'devtools-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.color = '#fff';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.fontFamily = 'Inter, system-ui, sans-serif';
  overlay.style.fontSize = '18px';
  overlay.innerHTML = '<div style="max-width:800px;padding:24px;text-align:center;"><strong>Accès développeur désactivé</strong><p style="opacity:0.9">Pour protéger ce site, l’accès aux outils de développement est bloqué. Si tu penses qu’il s’agit d’une erreur, contacte l’administrateur.</p></div>';
  overlay.style.display = 'none';
  document.documentElement.appendChild(overlay);

  function showOverlay() {
    overlay.style.display = 'flex';
  }
  function hideOverlay() {
    overlay.style.display = 'none';
  }

  // check toutes les 500ms
  setInterval(check, 500);
})();
</script>
