// ===== Año en el footer =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Efecto de escritura en el hero =====
const roles = [
  "Analista en Sistemas",
  "Desarrollador PHP / Symfony",
  "Análisis funcional",
  "Testing y documentación"
];
const typedEl = document.getElementById("typed");
let roleIndex = 0, charIndex = 0, deleting = false;

function type() {
  const current = roles[roleIndex];
  typedEl.textContent = current.substring(0, charIndex);

  if (!deleting && charIndex < current.length) {
    charIndex++;
    setTimeout(type, 80);
  } else if (deleting && charIndex > 0) {
    charIndex--;
    setTimeout(type, 40);
  } else {
    deleting = !deleting;
    if (!deleting) roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(type, deleting ? 1800 : 300);
  }
}
type();

// ===== Nav: fondo al hacer scroll =====
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 30);
});

// ===== Menú móvil =====
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  toggle.classList.toggle("open");
  links.classList.toggle("open");
});
links.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    toggle.classList.remove("open");
    links.classList.remove("open");
  })
);

// ===== Animación al aparecer + barras de skills =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    entry.target.querySelectorAll(".bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.level + "%";
    });
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ===== Link activo según la sección visible =====
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});
