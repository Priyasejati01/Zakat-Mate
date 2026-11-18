
const STORAGE_KEY = "zakatmate_data";

const DEFAULT_DATA = {
    pengertian: [
        { id: "p1", judul: "Apa Itu Zakat?", isi: "Zakat itu sebagian harta yang wajib dikeluarin seorang Muslim kalau hartanya udah memenuhi syarat tertentu." },
        { id: "p2", judul: "Zakat dalam Rukun Islam", isi: "Zakat itu salah satu dari lima rukun Islam. Selain jadi ibadah, zakat juga bantu orang-orang di sekitar kita yang lagi butuh." }
    ],
    jenis: [
        { id: "j1", judul: "Zakat Fitrah", ikon: "🌾", deskripsi: "Zakat yang dikeluarin setiap Muslim menjelang Idulfitri." },
        { id: "j2", judul: "Zakat Penghasilan", ikon: "💼", deskripsi: "Zakat dari gaji, honor, atau penghasilan lain yang udah nyampe batas wajib zakat (nisab)." },
        { id: "j3", judul: "Zakat Emas & Perak", ikon: "💎", deskripsi: "Zakat dari emas dan perak yang kamu simpen, kalau udah nyampe nisab dan genap setahun." },
        { id: "j4", judul: "Zakat Pertanian & Perkebunan", ikon: "🌱", deskripsi: "Zakat dari hasil sawah atau kebun, dikeluarin pas panen kalau jumlahnya nyampe nisab." },
        { id: "j5", judul: "Zakat Perdagangan", ikon: "🏪", deskripsi: "Zakat dari harta usaha dagang yang udah nyampe nisab dan jalan setahun." },
        { id: "j6", judul: "Zakat Tabungan", ikon: "🏦", deskripsi: "Zakat dari uang simpanan di bank yang sudah mencapai nisab dan mengendap selama satu tahun." },
        { id: "j7", judul: "Zakat Saham & Investasi", ikon: "📈", deskripsi: "Zakat atas surat berharga atau investasi yang nilainya sudah mencapai nisab dan dimiliki selama setahun." },
        { id: "j8", judul: "Zakat Peternakan", ikon: "🐄", deskripsi: "Zakat hewan ternak yang telah mencapai jumlah minimal (nisab) dan masa kepemilikan setahun." },
        { id: "j9", judul: "Zakat Rikaz", ikon: "🏺", deskripsi: "Zakat dari harta karun atau barang temuan, langsung dikeluarkan 20% saat ditemukan." },
        { id: "j10", judul: "Zakat Perusahaan", ikon: "🏢", deskripsi: "Zakat yang dihitung dari total aset lancar dikurangi utang jangka pendek suatu badan usaha." }
    ],
    golongan: [
        { id: "g1", nama: "Fakir", ikon: "🤲", deskripsi: "Orang yang hampir nggak punya harta dan susah banget memenuhi kebutuhan pokok." },
        { id: "g2", nama: "Miskin", ikon: "🏠", deskripsi: "Orang yang punya penghasilan, tapi masih kurang buat kebutuhan sehari-hari." },
        { id: "g3", nama: "Amil", ikon: "💼", deskripsi: "Orang yang dapat tugas buat ngurus dan bagiin zakat." },
        { id: "g4", nama: "Muallaf", ikon: "❤️", deskripsi: "Orang yang baru masuk Islam atau hatinya lagi perlu dikuatkan dalam Islam." },
        { id: "g5", nama: "Riqab", ikon: "🔓", deskripsi: "Orang yang terjerat perbudakan dan pengin dimerdekakan." },
        { id: "g6", nama: "Gharim", ikon: "💳", deskripsi: "Orang yang berutang buat kebutuhan yang dibenarkan dan nggak sanggup bayar." },
        { id: "g7", nama: "Fisabilillah", ikon: "🌙", deskripsi: "Orang atau kegiatan yang berjuang di jalan Allah sesuai ketentuan." },
        { id: "g8", nama: "Ibnu Sabil", ikon: "🧳", deskripsi: "Musafir yang kehabisan bekal di tengah jalan, dalam perjalanan yang dibenarkan." }
    ],
    
    pengaturan: {
        hargaEmas: 2500000,
        hargaPerak: 25000,
        hargaBeras: 15000,
        takaranFitrah: 2.5
    }
};

function cloneData(o) { return JSON.parse(JSON.stringify(o)); }

function getData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const d = JSON.parse(saved);
            const base = cloneData(DEFAULT_DATA);
            return {
                pengertian: d.pengertian || base.pengertian,
                jenis: d.jenis || base.jenis,
                golongan: d.golongan || base.golongan,
                pengaturan: Object.assign({}, base.pengaturan, d.pengaturan)
            };
        }
    } catch (e) { /* abaikan, pakai default */ }
    return cloneData(DEFAULT_DATA);
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetData() {
    localStorage.removeItem(STORAGE_KEY);
}

function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Mencegah HTML dari input admin dieksekusi
function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function rupiah(n) {
    return "Rp " + Math.round(n).toLocaleString("id-ID");
}
