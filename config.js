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
    url: "",      // ej: "https://abcdxyz.supabase.co"
    anonKey: ""   // la "anon public key" de Project Settings → API
  }
};
