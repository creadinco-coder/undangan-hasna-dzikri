/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonInfo {
  fullName: string;
  shortName: string;
  role: 'Groom' | 'Bride';
  parentInfo: string;
  bio?: string;
  instagram?: string;
  photoUrl: string;
  photoAlt: string;
  photoObjectPosition?: string;
  accentBg: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  badge?: string;
  day: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  startDateIso: string;
  endDateIso: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'wide';
  description: string;
  objectPosition?: string;
}

export interface MilestoneItem {
  id: string;
  period: string;
  title: string;
  story: string;
  tag: string;
  photoUrl: string;
  photoAlt: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoType: string;
  logoUrl?: string;
}

export interface PhotoAsset {
  src: string;
  alt: string;
  objectPosition?: string;
}

export interface WeddingInvitationData {
  groom: PersonInfo;
  bride: PersonInfo;
  heroTagline: string;
  weddingDateDisplay: string;
  heroCover: PhotoAsset;
  eventBackdrop: PhotoAsset;
  giftBackdrop: PhotoAsset;
  closingPhoto: PhotoAsset;
  quranVerse: {
    arabic: string;
    translation: string;
    source: string;
  };
  events: WeddingEvent[];
  gallery: GalleryItem[];
  milestones: MilestoneItem[];
  giftAccounts: BankAccount[];
  physicalGiftAddress: {
    recipient: string;
    phone: string;
    address: string;
  };
  closingMessage: {
    greeting: string;
    paragraph: string;
    signature: string;
  };
}

export const INVITATION_DATA: WeddingInvitationData = {
  heroCover: {
    src: '/photo/cover.webp',
    alt: 'Potret Cover Pernikahan Hasna Najwa Sabrina & Dzikri Amrulloh',
    objectPosition: 'center center',
  },
  eventBackdrop: {
    src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Grand Ballroom & Suasana Resepsi Pernikahan',
    objectPosition: 'center 40%',
  },
  giftBackdrop: {
    src: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    alt: 'Dekorasi Meja & Tanda Kasih Pernikahan',
    objectPosition: 'center 50%',
  },
  closingPhoto: {
    src: '/gallery/gallery08.webp',
    alt: 'Potret Bersama Hasna & Dzikri di Hari Bahagia',
    objectPosition: 'center 30%',
  },
  groom: {
    fullName: 'Dzikri Amrulloh, S.H., CDMP., CDA.',
    shortName: 'Dzikri',
    role: 'Groom',
    parentInfo: 'Putra Kedua dari Alm. Bapak Dede Ruhiat & Ibu Imas Andrayani',
    instagram: '@dzikriamrulloh',
    photoUrl: '/groom_bride/dzikri.webp',
    photoAlt: 'Potret Mempelai Pria - Dzikri Amrulloh, S.H., CDMP., CDA.',
    photoObjectPosition: 'center 20%',
    accentBg: '#e8ece9',
  },
  bride: {
    fullName: 'Hasna Najwa Sabrina, S.M.',
    shortName: 'Hasna',
    role: 'Bride',
    parentInfo: 'Putri pertama dari Bpk. Ujang Suryana & Ibu Farida',
    instagram: '@hasnanajwas',
    photoUrl: '/groom_bride/hasna.webp',
    photoAlt: 'Potret Mempelai Wanita - Hasna Najwa Sabrina, S.M.',
    photoObjectPosition: 'center 20%',
    accentBg: '#f2eae2',
  },
  heroTagline: 'THE WEDDING OF',
  weddingDateDisplay: 'Sabtu, 14 November 2026',
  quranVerse: {
    arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً',
    translation: '“Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.”',
    source: 'QS. Ar-Rum: 21',
  },
  events: [
    {
      id: 'akad',
      name: 'Akad Nikah',
      day: 'Sabtu',
      date: '14 November 2026',
      time: '08:00 – 10:30 WIB',
      venue: 'Kediaman Mempelai Wanita',
      address: 'Kp. Toblong RT02/03 Desa Sukamukti, Kecamatan Majalaya',
      mapsUrl: 'https://goo.gl/maps/9qGMVwM1YS2i8d387?g_st=aw',
      startDateIso: '2026-11-14T08:00:00+07:00',
      endDateIso: '2026-11-14T10:30:00+07:00',
    },
    {
      id: 'resepsi',
      name: 'Resepsi Pernikahan',
      day: 'Sabtu',
      date: '14 November 2026',
      time: '11:00 – 15:00 WIB',
      venue: 'Kediaman Mempelai Wanita',
      address: 'Kp. Toblong RT02/03 Desa Sukamukti, Kecamatan Majalaya',
      mapsUrl: 'https://goo.gl/maps/9qGMVwM1YS2i8d387?g_st=aw',
      startDateIso: '2026-11-14T11:00:00+07:00',
      endDateIso: '2026-11-14T15:00:00+07:00',
    },
  ],
  gallery: [
    {
      id: 'gal-1',
      title: 'Langkah Awal Bersama',
      category: 'Prewedding',
      src: '/gallery/gallery01.webp',
      alt: 'Hasna dan Dzikri melangkah bersama menyongsong hari bahagia',
      aspectRatio: 'landscape',
      description: 'Setiap langkah yang kami tapaki membimbing hati menuju sebuah janji suci.',
      objectPosition: 'center 40%',
    },
    {
      id: 'gal-2',
      title: 'Senyuman yang Menentramkan',
      category: 'Momen Manis',
      src: '/gallery/gallery02.webp',
      alt: 'Momen senyum bahagia Hasna dan Dzikri',
      aspectRatio: 'landscape',
      description: 'Di balik senyum tulus, tersimpan rasa syukur atas takdir yang mempertemukan kami.',
      objectPosition: 'center center',
    },
    {
      id: 'gal-3',
      title: 'Harmoni Dua Jiwa',
      category: 'Prewedding',
      src: '/gallery/gallery03.webp',
      alt: 'Potret kebersamaan penuh kehangatan Hasna dan Dzikri',
      aspectRatio: 'landscape',
      description: 'Dua kepribadian yang berbeda, disatukan dalam kasih sayang dan saling mengerti.',
      objectPosition: 'center center',
    },
    {
      id: 'gal-4',
      title: 'Janji Sepanjang Waktu',
      category: 'Ikatan Kasih',
      src: '/gallery/gallery04.webp',
      alt: 'Hasna dan Dzikri saling bertatapan penuh makna',
      aspectRatio: 'landscape',
      description: 'Menjaga asa dan cinta agar tetap mekar dalam setiap hembusan waktu.',
      objectPosition: 'center center',
    },
    {
      id: 'gal-5',
      title: 'Satu Tujuan Bahagia',
      category: 'Kebersamaan',
      src: '/gallery/gallery05.webp',
      alt: 'Hasna dan Dzikri berdampingan dengan senyum hangat',
      aspectRatio: 'landscape',
      description: 'Menatap horizon masa depan dengan penuh keyakinan dan doa restu.',
      objectPosition: 'center 35%',
    },
    {
      id: 'gal-6',
      title: 'Pesona Keanggunan',
      category: 'Portrait',
      src: '/gallery/gallery06.webp',
      alt: 'Potret portrait anggun dalam busana prewedding',
      aspectRatio: 'portrait',
      description: 'Keanggunan yang bersahaja dalam balutan busana penuh makna.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-7',
      title: 'Tatapan Penuh Makna',
      category: 'Portrait',
      src: '/gallery/gallery07.webp',
      alt: 'Potret tatapan mata teduh dan penuh kasih',
      aspectRatio: 'portrait',
      description: 'Tanpa banyak kata, pandangan mata telah merangkum segala ketulusan rasa.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-8',
      title: 'Dua Hati Bersanding',
      category: 'Romansa',
      src: '/gallery/gallery08.webp',
      alt: 'Hasna dan Dzikri berpose serasi dan hangat',
      aspectRatio: 'portrait',
      description: 'Keselarasan rasa yang tumbuh menjadi pilar kokoh dalam perjalanan cinta.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-9',
      title: 'Cahaya Hari Bahagia',
      category: 'Cahaya Kasih',
      src: '/gallery/gallery09.webp',
      alt: 'Momen pencahayaan dramatis dan elegan',
      aspectRatio: 'portrait',
      description: 'Pendar cahaya yang menyinari lembaran baru kehidupan berumah tangga.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-10',
      title: 'Kehangatan Rangkulan',
      category: 'Romansa',
      src: '/gallery/gallery10.webp',
      alt: 'Momen kedekatan yang meneduhkan hati',
      aspectRatio: 'portrait',
      description: 'Tempat pulang terbaik adalah ketika dua hati saling melindungi.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-11',
      title: 'Binar Kebahagiaan',
      category: 'Momen Spesial',
      src: '/gallery/gallery11.webp',
      alt: 'Binar senyum tawa bahagia Hasna dan Dzikri',
      aspectRatio: 'portrait',
      description: 'Setiap tawa kecil menjadi melodi indah dalam lembaran kisah kami.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-12',
      title: 'Lanskap Kasih Sayang',
      category: 'Panorama',
      src: '/gallery/gallery12.webp',
      alt: 'Komposisi panorama indah momen prewedding',
      aspectRatio: 'landscape',
      description: 'Alam menjadi saksi bisu kemurnian cinta yang kami bina bersama.',
      objectPosition: 'center 40%',
    },
    {
      id: 'gal-13',
      title: 'Sentuhan Penuh Doa',
      category: 'Detail Momen',
      src: '/gallery/gallery13.webp',
      alt: 'Detail kebersamaan dan genggaman tangan',
      aspectRatio: 'portrait',
      description: 'Genggaman tangan yang meneguhkan komitmen untuk saling melengkapi.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-14',
      title: 'Kala Senja Menyapa',
      category: 'Prewedding',
      src: '/gallery/gallery14.webp',
      alt: 'Suasana hangat dan romantis momen prewedding',
      aspectRatio: 'portrait',
      description: 'Kehangatan senja yang mengingatkan kami akan indahnya kesabaran.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-15',
      title: 'Detik-Detik Menuju Ikrar',
      category: 'Menuju Halal',
      src: '/gallery/gallery15.webp',
      alt: 'Pose anggun penuh pengharapan dan kesiapan',
      aspectRatio: 'portrait',
      description: 'Menghitung hari menuju lembaran ibadah terpanjang seumur hidup.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-16',
      title: 'Satu Hati Satu Jiwa',
      category: 'Romansa',
      src: '/gallery/gallery16.webp',
      alt: 'Potret keselarasan dan keintiman emosional',
      aspectRatio: 'portrait',
      description: 'Bukan tentang kesempurnaan, melainkan tentang saling menyempurnakan.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-17',
      title: 'Abadi Dalam Doa',
      category: 'Ikatan Suci',
      src: '/gallery/gallery17.webp',
      alt: 'Potret penutup galeri penuh ketulusan cinta',
      aspectRatio: 'portrait',
      description: 'Semoga cinta ini senantiasa bertumbuh hingga ke jannah-Nya.',
      objectPosition: 'center 30%',
    },
  ],
  milestones: [
    {
      id: 'ms-1',
      period: '2022',
      title: 'Awal Rasa di Balik Layar',
      story: 'Kisah ini bermula dari layar kecil Instagram. Sebuah potret sederhana berhasil mencuri perhatian, menumbuhkan rasa penasaran yang berujung pada saling mengikuti di dunia maya. Saat itu, segalanya terasa biasa, tanpa tahu bahwa takdir sedang mulai merajut cerita.',
      tag: 'Awal Rasa',
      photoUrl: '',
      photoAlt: '',
      aspectRatio: 'landscape',
    },
    {
      id: 'ms-2',
      period: '2023',
      title: 'Jarak dan Kesempatan yang Tertunda',
      story: 'Niat untuk menyapa dan mengenal lebih dekat sempat menemui jalan buntu. Akun yang tiba-tiba diblokir membuat kesempatan terasa hilang begitu saja. Komunikasi terputus sebelum sempat dimulai, meninggalkan rasa penasaran yang terpaksa disimpan rapi.',
      tag: 'Jeda Takdir',
      photoUrl: '',
      photoAlt: '',
      aspectRatio: 'landscape',
    },
    {
      id: 'ms-3',
      period: '2024',
      title: 'Jalan Pulang Lewat Teman',
      story: 'Jika memang ditakdirkan bersama, semesta selalu punya cara untuk mempertemukan. Di saat kami berdua sama-sama sendiri, seorang teman menjadi jembatan yang membuka kembali pintu interaksi. Percakapan mengalir begitu hangat dan alami, hingga akhirnya kami sepakat untuk berjalan bersama dalam sebuah komitmen.',
      tag: 'Pertemuan',
      photoUrl: '',
      photoAlt: '',
      aspectRatio: 'landscape',
    },
    {
      id: 'ms-4',
      period: 'Juli 2026',
      title: 'Langkah Menuju Masa Depan',
      story: 'Dua tahun saling belajar, memahami, dan membersamai meyakinkan hati kami. Di bulan Juli 2026, kami memantapkan niat untuk membawa perjalanan cinta ini ke arah yang lebih bermakna, melangkah menuju ikatan yang suci dan penuh tanggung jawab.',
      tag: 'Komitmen',
      photoUrl: '',
      photoAlt: '',
      aspectRatio: 'landscape',
    },
    {
      id: 'ms-5',
      period: '14 November 2026',
      title: 'Hari Bahagia Kami',
      story: 'Setelah melewati jeda, tawa, dan doa yang panjang, kini tiba saatnya kami mengikat janji suci. Di hadapan Allah SWT, keluarga, dan orang-orang terkasih, kami memulai babak baru sebagai teman seumur hidup.',
      tag: 'Hari Bahagia',
      photoUrl: '',
      photoAlt: '',
      aspectRatio: 'landscape',
    },
  ],
  giftAccounts: [
    {
      id: 'bca',
      bankName: 'BCA',
      accountNumber: '3761428304',
      accountHolder: 'Dzikri Amrulloh',
      logoType: 'bca',
      logoUrl: '/bank/bca.png',
    },
    {
      id: 'seabank',
      bankName: 'SeaBank',
      accountNumber: '901759307691',
      accountHolder: 'Hasna Najwa Sabrina',
      logoType: 'seabank',
      logoUrl: '/bank/seabank.png',
    },
  ],
  physicalGiftAddress: {
    recipient: 'Hasna Najwa Sabrina & Dzikri Amrulloh',
    phone: '+62 897-9659-188',
    address: 'Kediaman Mempelai Wanita (Kp. Toblong RT02/03 Desa Sukamukti, Kecamatan Majalaya)',
  },
  closingMessage: {
    greeting: 'Wassalamu’alaikum Warahmatullahi Wabarakatuh',
    paragraph: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami kedua mempelai. Atas kehadiran serta doa restu yang diberikan, kami haturkan terima kasih yang sebesar-besarnya.',
    signature: 'Hasna & Dzikri',
  },
};
