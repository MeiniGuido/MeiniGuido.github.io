# MeiniGuido.github.io

Portfolio personal de Guido Meini con estilo de videojuego 8 bits. Sitio estático publicado con GitHub Pages.

## Estructura

```
index.html              Página única (debe quedar en la raíz para GitHub Pages)
css/style.css           Estilos
js/script.js            Sitio: router, sonido, puntaje, logros y visor de certificados
js/game.js              Easter egg: monedas y minijuego Bug Hunt
assets/
  audio/music/          Música de fondo
  audio/sfx/            Efectos de sonido
  docs/                 CV en PDF
  img/foto.jpg          Foto de perfil
  img/certificados/     Certificados como imagen (slug = data-cert en index.html)
```

## Agregar un certificado

1. Exportar el certificado como JPG a `assets/img/certificados/<slug>.jpg`.
2. Copiar una tarjeta `.ach` en `index.html` con `data-cert="<slug>"`.

Los PDF originales no se suben al repositorio: el visor muestra solo la imagen.
