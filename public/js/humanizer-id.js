/**
 * humanizer-id.js
 * Module ini mengubah teks formal Bahasa Indonesia menjadi tone yang natural,
 * hangat, dan conversational — tanpa mengubah proper noun, nama, atau singkatan.
 *
 * Proper noun yang dilindungi: IEEE, RND, UPI, SB, GSAP, WebGL, React, Vite,
 * Tailwind, Lenis, shadcn, HTML, CSS, JS, TS, URL, API, DOM, UI, UX, GitHub,
 * Google Drive, Instagram, LinkedIn, Email, She & Him, dan semua kata dengan
 * huruf kapital semua atau diawali huruf kapital dalam konteks nama.
 */

(function (global) {
  'use strict';

  // Dictionary formal → kasual (minimal 40 pasangan)
  const DICTIONARY = {
    // pronouns & address
    'kami': 'kita',
    'anda': 'kamu',
    'kalian': 'kalian',
    'mereka': 'mereka',
    'kamu semua': 'kalian',

    // common verbs
    'memberikan': 'kasih',
    'mengadakan': 'ngadain',
    'melaksanakan': 'ngadain',
    'melakukan': 'lakuin',
    'menyelesaikan': 'nyelesain',
    'mengerjakan': 'ngerjain',
    'membuat': 'bikin',
    'menciptakan': 'nge-create',
    'mengembangkan': 'ngembangin',
    'membangun': 'bangun',
    'merancang': 'desain',
    'merencanakan': 'ngerencanain',
    'menyusun': 'nyusun',
    'mengorganisir': 'ngatur',
    'mengkoordinasikan': 'ngatur',
    'menyampaikan': 'ngasih tau',
    'menginformasikan': 'nginfo',
    'memberitahukan': 'ngasih tau',
    'mengumumkan': 'nge-announce',
    'melanjutkan': 'lanjut',
    'mengakhiri': 'selesai',
    'memulai': 'mulai',
    'menunggu': 'nunggu',
    'menanti': 'nungguin',
    'berpartisipasi': 'ikutan',
    'menghadiri': 'dateng',
    'hadir': 'ada',
    'tidak hadir': 'gak dateng',
    'dilaksanakan': 'diadain',
    'terlaksana': 'jadi',
    'berhasil': 'beres',
    'gagal': 'gak jadi',
    'berlangsung': 'berjalan',

    // nouns
    'kegiatan': 'acara',
    'mahasiswa': 'anak-anak kampus',
    'pertemuan': 'kopdar',
    'rapat': 'meeting',
    'diskusi': 'obrolan',
    'penelitian': 'riset',
    'pengembangan': 'dev',
    'divisi': 'tim',
    'anggota': 'teman-teman',
    'koordinator': 'PIC',
    'kepala': 'ketua',
    'kenangan': 'memori',
    'momen': 'momen',
    'memori': 'memori',
    'dokumentasi': 'dokumentasi',
    'foto': 'foto',
    'gambar': 'gambar',
    'video': 'video',

    // adjectives / adverbs
    'bersama': 'bareng',
    'bersama-sama': 'rame-rame',
    'berkumpul': 'kumpul',
    'semua': 'semua',
    'setiap': 'tiap',
    'sedikit': 'dikit',
    'sangat': 'banget',
    'terlalu': 'kelewat',
    'cukup': 'lumayan',
    'baik': 'oke',
    'bagus': 'keren',
    'indah': 'cakep',
    'menyenangkan': 'seru',
    'gembira': 'happy',
    'sedih': 'sedih',
    'bertemu': 'ketemu',
    'berjumpa': 'ketemu',
    'berpisah': 'pisah',
    'tertawa': 'ketawa',
    'bercanda': 'becanda',
    'malam': 'malem',
    'sekarang': 'skrg',
    'kemarin': 'kemaren',
    'nanti': 'nanti',
    'besok': 'besok',
    'lusa': 'lusa',

    // site-specific contextual replacements (applied via whole-word matching)
    'where ideas become impact': 'dari ide jadi dampak nyata',
    'curious minds converge': 'otak penasaran berkumpul',
    'building projects': 'bangun project',
    'sharing knowledge': 'bagi-bagi ilmu',
    'creating memories': 'bikin kenangan',
    'last beyond graduation': 'tetap ada walau udah lulus',
    'empowering students': 'kasih kekuatan ke anak-anak kampus',
    'to innovate': 'buat inovasi',
    'collaborate': 'kolaborasi',
    'create impact': 'kasih dampak',
    'captured moments': 'momen yang tertangkap',
    'every photo holds a story we lived together': 'tiap foto nyimpen cerita yang kita lalui bareng',
    'featured memory': 'memori pilihan',
    'soundtrack': 'backsound',
    'scroll': 'scroll',
    'members': 'teman-teman',
    'projects': 'project',
    'years': 'tahun',
    'about rnd': 'tentang RND',
    'rnd division': 'tim RND',
    'ieee upi sb': 'IEEE UPI SB',
    'all rights reserved': 'hak cipta dilindungi',
    'click to begin the memory': 'klik buat mulai kenangannya',
    'play': 'mainkan',
    'pause': 'jeda',
    'resume': 'lanjut',
    'exit': 'keluar',
    'start the story': 'mulai cerita',
    'tap anywhere to turn on music': 'tap di mana aja buat nyalain musik',
    'skip intro': 'lewati intro',
  };

  // Compile regexes — longer phrases first to avoid partial replacement
  const entries = Object.entries(DICTIONARY).sort((a, b) => b[0].length - a[0].length);

  // Protected proper noun pattern: uppercase acronyms, capitalized words in sequence, names with &
  const PROPER_NOUN_RE = /\b([A-Z]{2,}(?:\s+[A-Z]+)*)\b|\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b|\b([A-Z][a-z]*\s*&\s*[A-Z][a-z]*)\b/g;

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function humanizerID(text) {
    if (typeof text !== 'string') return text;

    // Preserve proper nouns by replacing them with placeholders
    const placeholders = [];
    let protectedText = text.replace(PROPER_NOUN_RE, function (match) {
      const key = `__PROPER_${placeholders.length}__`;
      placeholders.push(match);
      return key;
    });

    // Apply dictionary replacements (case-insensitive, whole word where possible)
    for (const [formal, casual] of entries) {
      const re = new RegExp('\\b' + escapeRegExp(formal) + '\\b', 'gi');
      protectedText = protectedText.replace(re, casual);
    }

    // Also try sentence-case variants if the original had capitals
    for (const [formal, casual] of entries) {
      const capFormal = formal.charAt(0).toUpperCase() + formal.slice(1);
      const re = new RegExp('\\b' + escapeRegExp(capFormal) + '\\b', 'g');
      protectedText = protectedText.replace(re, casual.charAt(0).toUpperCase() + casual.slice(1));
    }

    // Restore proper nouns
    placeholders.forEach((val, idx) => {
      protectedText = protectedText.replace(`__PROPER_${idx}__`, val);
    });

    return protectedText;
  }

  // Attach to global scope
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { humanizerID };
  }
  if (typeof global !== 'undefined') {
    global.humanizerID = humanizerID;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
