/* =========================================================
   CONFIGURACIÓN DEL REGALO
   Editá solo este archivo para cambiar nombres y links.
   ========================================================= */
window.REGALO_CONFIG = {
  nombre: "Nico",

  // Links de "+ info" y descarga de la app
  links: {
    dac:  "https://moondroplab.com/en/products/dawn-pro-2",
    iem:  "https://kz-audio.com/kz-castor-pro.html",
    aimp: "https://www.aimp.ru/?do=download"
  },

  // Supabase (para que los discos cargados desde /admin se vean en todos lados).
  // Si lo dejás vacío, la web lee los discos desde el archivo discos.json.
  supabase: {
    url: "https://etrbxspegndkqsajywsb.supabase.co",      // ej: "https://abcdxyz.supabase.co"
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cmJ4c3BlZ25ka3FzYWp5d3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MjQ5NTUsImV4cCI6MjEwODEwMDk1NX0._mbNd0UtFmCMGQnuVEkw5Zj1vVE6GfF5KHoaHvkcmDg"   // la "anon public key" de Project Settings → API
  }
};
