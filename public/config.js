const USERS = {
  admin: { name:'Admin', role:'admin', password:'admin123' },
  ayu: { name:'Ayu', role:'sa', password:'ayu123' },
  ajs: { name:'AJS', role:'sa', password:'ajs123' },
  wbn: { name:'WBN', role:'sa', password:'wbn123' },
  fik: { name:'Fik', role:'sa', password:'fik123' }
};

const QUESTIONS = [
  'Keluhan terselesaikan',
  'Janji penyerahan kendaraan',
  'Lamanya proses servis',
  'Penjelasan petugas servis',
  'Sopan dan ramah',
  'Mendengarkan kebutuhan pelanggan',
  'Fasilitas ruang tunggu',
  'Kebersihan kendaraan setelah servis'
];

const DEFAULT_WHATSAPP_TEMPLATE =
`Selamat pagi Bapak/Ibu {nama}.

Terima kasih telah mempercayakan servis kendaraan {model} ({plat}) di Agung Toyota Gianyar.

Mohon kesediaannya memberikan penilaian pelayanan kami dengan skala 1–10.

Keterangan Penilaian:
1–6 = Tidak Puas
7–8 = Cukup
9–10 = Puas

Q1. Keluhan terselesaikan: __/10

Q2. Janji penyerahan kendaraan: __/10

Q3. Lamanya proses servis: __/10

Saran / Masukan:
....................................

Terima kasih atas waktu dan masukannya.

Hormat kami,

{nama_sa}
Service Advisor
Agung Toyota Gianyar`;

const APP_CONFIG = {
  dealerName:'Agung Toyota Gianyar'
};
