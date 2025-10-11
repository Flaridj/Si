<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Synthwave Altitude — Plein écran</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    background-color: #050510;
    color: #fff;
    font-family: 'Inter', sans-serif;
  }

  #container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  iframe {
    border: none;
    width: 100%;
    height: 100%;
  }

  #fullscreen-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 9999;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 6px;
    padding: 10px 18px;
    color: #00ffe7;
    font-size: 15px;
    cursor: pointer;
    backdrop-filter: blur(6px);
    transition: all 0.2s ease;
  }

  #fullscreen-btn:hover {
    background: rgba(0, 255, 231, 0.2);
  }

  #fallback {
    display: none;
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, #1a0033, #000);
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 18px;
  }

  #fallback a {
    margin-top: 10px;
    padding: 10px 20px;
    background: #00ffe7;
    color: #000;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
  }

  #fallback a:hover {
    background: #00c4b7;
  }
</style>
</head>
<body>

<div id="container">
  <iframe id="gameFrame" src="https://synthwave-altitude.lovable.app" allowfullscreen></iframe>
  <button id="fullscreen-btn">⛶ Plein écran</button>
  <div id="fallback">
    <p>Ce site ne permet pas l’intégration en plein écran.</p>
    <a href="https://synthwave-altitude.lovable.app" target="_blank">Ouvrir dans un nouvel onglet</a>
  </div>
</div>

<script>
  const iframe = document.getElementById('gameFrame');
  const fallback = document.getElementById('fallback');
  const btn = document.getElementById('fullscreen-btn');

  // Vérifie si l’iframe charge correctement
  iframe.addEventListener('error', () => {
    iframe.style.display = 'none';
    fallback.style.display = 'flex';
  });

  // Bouton plein écran
  btn.addEventListener('click', () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen();
    }
  });
</script>

</body>
</html>
