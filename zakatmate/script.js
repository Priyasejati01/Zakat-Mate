function el(id) { return document.getElementById(id); }
function num(id) { return Number(el(id).value) || 0; }

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

if (el("listPengertian")) {
    const data = getData();
    const warna = ["pink", "green", "purple"];

    el("listPengertian").innerHTML = data.pengertian.map(function (p) {
        return '<div class="content-card">' +
            '<div class="big-icon">🕌</div>' +
            '<div><h2>' + esc(p.judul) + '</h2><p>' + esc(p.isi) + '</p></div>' +
            '</div>';
    }).join("") || '<p class="empty">Belum ada data.</p>';

    el("listJenis").innerHTML = data.jenis.map(function (j, i) {
        return '<div class="info-card ' + warna[i % 3] + '">' +
            '<div class="icon">' + esc(j.ikon || "💰") + '</div>' +
            '<h3>' + esc(j.judul) + '</h3>' +
            '<p>' + esc(j.deskripsi) + '</p>' +
            '</div>';
    }).join("") || '<p class="empty">Belum ada data.</p>';

    el("listGolongan").innerHTML = data.golongan.map(function (g, i) {
        const no = String(i + 1).padStart(2, "0");
        return '<div class="asnaf-card">' +
            '<span>' + no + '</span>' +
            '<div class="asnaf-icon">' + esc(g.ikon || "🤲") + '</div>' +
            '<h3>' + esc(g.nama) + '</h3>' +
            '<p>' + esc(g.deskripsi) + '</p>' +
            '</div>';
    }).join("") || '<p class="empty">Belum ada data.</p>';
}

if (el("tabFitrah")) {

    const NISAB_EMAS = 85;    
    const NISAB_PERAK = 595;  

    // Ambil data default/lokal dulu dari localStorage (sebagai fallback)
    const set = getData().pengaturan;
    el("hargaEmas").value = set.hargaEmas;
    el("hargaPerak").value = set.hargaPerak;
    el("hargaBeras").value = set.hargaBeras;
    el("takaranFitrah").value = set.takaranFitrah;

    function updateInfoNisab() {
        const n = NISAB_EMAS * num("hargaEmas");
        el("infoNisab").innerHTML =
            "Dengan harga emas segini, batas wajib zakat (nisab) sekitar <strong>" + formatRupiah(n) + "</strong>" +
            " per tahun, atau <strong>" + formatRupiah(n / 12) + "</strong> per bulan.";
    }
    updateInfoNisab();
    el("hargaEmas").addEventListener("input", updateInfoNisab);

    // =========================================================
    // FUNGSI AJAX: MENGAMBIL HARGA TERBARU DARI api-harga.json
    // =========================================================
    async function ambilHargaTerbaru() {
        try {
            const response = await fetch('api-harga.json');
            if (!response.ok) throw new Error(`Status HTTP: ${response.status}`);
            
            const result = await response.json();
            const pengaturan = result.data;
            
            // Timpa harga lokal dengan harga dari server/API
            el("hargaEmas").value = pengaturan.hargaEmas;
            el("hargaPerak").value = pengaturan.hargaPerak;
            el("hargaBeras").value = pengaturan.hargaBeras;
            if(pengaturan.takaranFitrah) el("takaranFitrah").value = pengaturan.takaranFitrah;
            
            updateInfoNisab(); // Update teks info nisab dengan harga baru
            console.log("AJAX Sukses: Harga acuan berhasil di-update dari server.");
        } catch (error) {
            console.warn("Info AJAX: Menggunakan harga pengaturan admin/lokal karena file JSON belum ada atau error.", error.message);
        }
    }

    // Eksekusi AJAX
    ambilHargaTerbaru();
    // =========================================================

    // Sistem Navigasi Tab Kalkulator
    document.querySelectorAll(".tab-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const g = btn.dataset.group;
            document.querySelectorAll('.tab-btn[data-group="' + g + '"]')
                .forEach(function (b) { b.classList.remove("active"); });
            document.querySelectorAll('.tab-panel[data-group="' + g + '"]')
                .forEach(function (p) { p.classList.remove("show"); });
            btn.classList.add("active");
            el(btn.dataset.target).classList.add("show");
        });
    });

    // Fungsi untuk menampilkan UI hasil kalkulator seragam
    function tampil(id, ok, judul, baris, total, catatan) {
        const box = el(id);
        box.className = "result-box show " + (ok ? "result-ok" : "result-no");
        let html = "<h4>" + judul + "</h4><ul>" +
            baris.map(function (b) {
                return "<li><span>" + b[0] + "</span><strong>" + b[1] + "</strong></li>";
            }).join("") + "</ul>";
        if (total) {
            html += '<div class="result-total"><small>Zakat yang harus kamu keluarin</small>' + total + "</div>";
        }
        if (catatan) html += '<p class="result-note">' + catatan + "</p>";
        box.innerHTML = html;
    }

    function wajibIsiAngka(id, nilai, pesan) {
        if (nilai <= 0) {
            tampil(id, false, "Eits, belum lengkap nih", [], "", pesan);
            return false;
        }
        return true;
    }
    
    el("hitungFitrah").addEventListener("click", function () {
        const jiwa = num("jumlahJiwa"), takaran = num("takaranFitrah"), harga = num("hargaBeras");
        if (!wajibIsiAngka("hasilFitrah", jiwa * takaran * harga, "Isi dulu dong jumlah orang, takaran beras, sama harga berasnya.")) return;
        const kg = jiwa * takaran;
        tampil("hasilFitrah", true, "Zakat Fitrah",
            [["Jumlah orang", jiwa + " orang"],
             ["Beras per orang", takaran + " kg"],
             ["Total beras", kg.toLocaleString("id-ID") + " kg"],
             ["Harga beras per kg", formatRupiah(harga)]],
            "<strong>" + formatRupiah(kg * harga) + "</strong>",
            "Zakat fitrah bisa dibayar pakai beras atau uang seharga beras, sebelum salat Idulfitri ya.");
    });

    el("hitungPenghasilan").addEventListener("click", function () {
        const gaji = num("gaji"), lain = num("gajiLain"), cicilan = num("cicilan");
        const bersih = Math.max(gaji + lain - cicilan, 0);
        if (!wajibIsiAngka("hasilPenghasilan", gaji + lain, "Isi dulu dong gaji atau penghasilanmu per bulan.")) return;
        const nisabBulan = NISAB_EMAS * num("hargaEmas") / 12;
        const baris = [["Penghasilan yang dihitung", formatRupiah(bersih)],
                       ["Batas wajib zakat per bulan", formatRupiah(nisabBulan)]];
        if (bersih >= nisabBulan) {
            tampil("hasilPenghasilan", true, "Kamu udah wajib zakat nih", baris,
                "<strong>" + formatRupiah(bersih * 0.025) + "</strong>",
                "Besarnya 2,5% dari penghasilan per bulan.");
        } else {
            tampil("hasilPenghasilan", false, "Belum wajib zakat", baris, "",
                "Penghasilanmu belum nyampe batas wajib zakat, jadi bulan ini belum perlu zakat. Santai aja.");
        }
    });

    el("hitungEmas").addEventListener("click", function () {
        const emas = el("jenisLogam").value === "emas";
        const gram = num("gramLogam");
        const harga = emas ? num("hargaEmas") : num("hargaPerak");
        const nisab = emas ? NISAB_EMAS : NISAB_PERAK;
        if (!wajibIsiAngka("hasilEmas", gram * harga, "Isi dulu beratnya, terus cek harga per gram di atas udah keisi ya.")) return;
        const nilai = gram * harga;
        const baris = [["Berat yang kamu punya", gram + " gram"],
                       ["Batas wajib zakat", nisab + " gram"],
                       ["Nilai harta", formatRupiah(nilai)]];
        if (gram < nisab) {
            tampil("hasilEmas", false, "Belum wajib zakat", baris, "", "Beratnya belum nyampe batas wajib zakat.");
        } else if (el("haulLogam").value !== "ya") {
            tampil("hasilEmas", false, "Belum wajib zakat", baris, "", "Beratnya udah cukup, tapi belum genap setahun disimpan. Hitung lagi pas udah setahun ya.");
        } else {
            tampil("hasilEmas", true, "Kamu udah wajib zakat nih", baris,
                "<strong>" + formatRupiah(nilai * 0.025) + "</strong>",
                "Besarnya 2,5% dari nilai hartamu.");
        }
    });
    
    el("hitungPertanian").addEventListener("click", function () {
        const panen = num("hasilPanen"), nisab = Number(el("jenisPanen").value);
        const persen = Number(el("pengairan").value), harga = num("hargaPanen");
        if (!wajibIsiAngka("hasilPertanian", panen, "Isi dulu dong hasil panennya dalam kg.")) return;
        const baris = [["Hasil panen", panen.toLocaleString("id-ID") + " kg"],
                       ["Batas wajib zakat", nisab + " kg"],
                       ["Kadar zakat", (persen * 100) + "%"]];
        if (panen < nisab) {
            tampil("hasilPertanian", false, "Belum wajib zakat", baris, "", "Hasil panennya belum nyampe batas wajib zakat.");
        } else {
            const kg = panen * persen;
            let total = "<strong>" + kg.toLocaleString("id-ID") + " kg</strong>";
            
            // =====================================================
            // PERBAIKAN TAMPILAN: Kata "atau" turun ke baris baru dan tengah
            // =====================================================
            if (harga > 0) total += "<span style='display:block; margin: 8px 0; font-size: 16px; font-weight: normal;'>atau</span><strong>" + formatRupiah(kg * harga) + "</strong>";
            
            tampil("hasilPertanian", true, "Kamu udah wajib zakat nih", baris, total, "Zakat pertanian dikeluarin pas panen, nggak perlu nunggu setahun.");
        }
    });

    el("hitungDagang").addEventListener("click", function () {
        const total = num("modalDagang") + num("untungDagang") + num("piutangDagang") - num("utangDagang");
        if (!wajibIsiAngka("hasilDagang", total, "Isi dulu modal, untung, atau piutangnya. Total setelah dikurangi utang harus lebih dari nol ya.")) return;
        const nisab = NISAB_EMAS * num("hargaEmas");
        const baris = [["Harta dagang bersih", formatRupiah(total)],
                       ["Batas wajib zakat", formatRupiah(nisab)]];
        if (total < nisab) {
            tampil("hasilDagang", false, "Belum wajib zakat", baris, "", "Harta dagangmu belum nyampe batas wajib zakat.");
        } else if (el("haulDagang").value !== "ya") {
            tampil("hasilDagang", false, "Belum wajib zakat", baris, "", "Hartanya udah cukup, tapi usahanya belum genap setahun.");
        } else {
            tampil("hasilDagang", true, "Kamu udah wajib zakat nih", baris,
                "<strong>" + formatRupiah(total * 0.025) + "</strong>", "Besarnya 2,5% dari harta dagang setelah dikurangi utang.");
        }
    });

    el("hitungTabungan")?.addEventListener("click", function () {
        const saldo = num("saldoTabungan");
        const bunga = num("bungaTabungan");
        const haul = el("haulTabungan").value;
        const hargaEmas = num("hargaEmas");
        
        if (!wajibIsiAngka("hasilTabungan", saldo, "Isi dulu saldo tabungan kamu.")) return;
        if (hargaEmas === 0) return tampil("hasilTabungan", false, "Harga acuan kosong", [], "", "Tolong isi harga emas per gram di bagian atas halaman dulu.");

        const nisabEmas = NISAB_EMAS * hargaEmas;
        const hartaBersih = saldo - bunga;
        
        const baris = [["Saldo Bersih", formatRupiah(hartaBersih)],
                       ["Batas wajib zakat (Nisab)", formatRupiah(nisabEmas)]];

        if (haul === 'tidak') {
            tampil("hasilTabungan", false, "Belum wajib zakat", baris, "", "Saldo kamu belum mengendap genap 1 tahun (haul).");
        } else if (hartaBersih < nisabEmas) {
            tampil("hasilTabungan", false, "Belum wajib zakat", baris, "", "Saldo bersihmu masih di bawah nisab.");
        } else {
            tampil("hasilTabungan", true, "Kamu udah wajib zakat nih", baris,
                "<strong>" + formatRupiah(hartaBersih * 0.025) + "</strong>", "Besarnya 2,5% dari saldo bersih (tanpa bunga).");
        }
    });
    
    el("hitungSaham")?.addEventListener("click", function () {
        const nilaiSaham = num("nilaiSaham");
        const dividen = num("dividenSaham");
        const haul = el("haulSaham").value;
        const hargaEmas = num("hargaEmas");
        
        if (!wajibIsiAngka("hasilSaham", nilaiSaham + dividen, "Isi dulu nilai saham atau dividen kamu.")) return;
        if (hargaEmas === 0) return tampil("hasilSaham", false, "Harga acuan kosong", [], "", "Tolong isi harga emas per gram di bagian atas halaman dulu.");

        const nisabEmas = NISAB_EMAS * hargaEmas;
        const totalAset = nilaiSaham + dividen;
        
        const baris = [["Total Saham & Dividen", formatRupiah(totalAset)],
                       ["Batas wajib zakat (Nisab)", formatRupiah(nisabEmas)]];

        if (haul === 'tidak') {
            tampil("hasilSaham", false, "Belum wajib zakat", baris, "", "Saham kamu belum dimiliki genap 1 tahun (haul).");
        } else if (totalAset < nisabEmas) {
            tampil("hasilSaham", false, "Belum wajib zakat", baris, "", "Total aset sahammu masih di bawah nisab.");
        } else {
            tampil("hasilSaham", true, "Kamu udah wajib zakat nih", baris,
                "<strong>" + formatRupiah(totalAset * 0.025) + "</strong>", "Zakatnya 2,5% dari total nilai aset dan dividen.");
        }
    });
   
    el("hitungRikaz")?.addEventListener("click", function () {
        const nilaiRikaz = num("nilaiRikaz");
        
        if (!wajibIsiAngka("hasilRikaz", nilaiRikaz, "Isi dulu nilai barang temuannya.")) return;

        const zakat = nilaiRikaz * 0.20;
        const baris = [["Nilai Barang Temuan", formatRupiah(nilaiRikaz)]];
        
        tampil("hasilRikaz", true, "Wajib Zakat Rikaz (20%)", baris,
            "<strong>" + formatRupiah(zakat) + "</strong>", "Harta temuan langsung dikeluarkan zakatnya 20% tanpa syarat haul atau nisab.");
    });
    
    el("hitungPerusahaan")?.addEventListener("click", function () {
        const asetLancar = num("asetLancar");
        const utang = num("utangPerusahaan");
        const haul = el("haulPerusahaan").value;
        const hargaEmas = num("hargaEmas");
        
        if (!wajibIsiAngka("hasilPerusahaan", asetLancar, "Isi dulu total aset lancar perusahaannya.")) return;
        if (hargaEmas === 0) return tampil("hasilPerusahaan", false, "Harga acuan kosong", [], "", "Tolong isi harga emas per gram di bagian atas halaman dulu.");

        const nisabEmas = NISAB_EMAS * hargaEmas;
        const kekayaanPerusahaan = asetLancar - utang;
        
        const baris = [["Harta Bersih Perusahaan", formatRupiah(kekayaanPerusahaan)],
                       ["Batas wajib zakat (Nisab)", formatRupiah(nisabEmas)]];

        if (haul === 'tidak') {
            tampil("hasilPerusahaan", false, "Belum wajib zakat", baris, "", "Perusahaan belum berjalan genap 1 tahun (haul).");
        } else if (kekayaanPerusahaan < nisabEmas) {
            tampil("hasilPerusahaan", false, "Belum wajib zakat", baris, "", "Harta bersih perusahaan masih di bawah nisab.");
        } else {
            tampil("hasilPerusahaan", true, "Perusahaan wajib zakat", baris,
                "<strong>" + formatRupiah(kekayaanPerusahaan * 0.025) + "</strong>", "Zakatnya 2,5% dari kekayaan bersih perusahaan.");
        }
    });

    el("hitungPeternakan")?.addEventListener("click", function () {
        const jenis = el("jenisTernak").value;
        const jumlah = num("jumlahTernak");
        const haul = el("haulTernak").value;
        
        if (!wajibIsiAngka("hasilPeternakan", jumlah, "Isi dulu dong jumlah ekor hewan ternaknya.")) return;

        const baris = [["Jenis Hewan", jenis === 'kambing' ? 'Kambing / Domba' : 'Sapi / Kerbau'],
                       ["Jumlah Ternak", jumlah + " ekor"]];

        if (haul === 'tidak') {
            return tampil("hasilPeternakan", false, "Belum wajib zakat", baris, "", "Ternak belum dimiliki selama 1 tahun (haul).");
        }

        let hasilZakat = "";
        let wajib = false;

        if (jenis === 'kambing') {
            if (jumlah < 40) {
                hasilZakat = "Belum wajib zakat (Nisab minimal 40 ekor).";
            } else if (jumlah <= 120) {
                hasilZakat = "1 ekor kambing/domba"; wajib = true;
            } else if (jumlah <= 200) {
                hasilZakat = "2 ekor kambing/domba"; wajib = true;
            } else if (jumlah <= 399) {
                hasilZakat = "3 ekor kambing/domba"; wajib = true;
            } else {
                const kelipatan = Math.floor(jumlah / 100);
                hasilZakat = kelipatan + " ekor kambing/domba (1 ekor tiap kelipatan 100)"; 
                wajib = true;
            }
        } else if (jenis === 'sapi') {
            if (jumlah < 30) {
                hasilZakat = "Belum wajib zakat (Nisab minimal 30 ekor).";
            } else if (jumlah <= 39) {
                hasilZakat = "1 ekor sapi umur 1 tahun (Tabi')"; wajib = true;
            } else if (jumlah <= 59) {
                hasilZakat = "1 ekor sapi umur 2 tahun (Musinnah)"; wajib = true;
            } else if (jumlah <= 69) {
                hasilZakat = "2 ekor sapi umur 1 tahun (Tabi')"; wajib = true;
            } else if (jumlah <= 79) {
                hasilZakat = "1 ekor sapi umur 1 thn & 1 ekor umur 2 thn"; wajib = true;
            } else {
                hasilZakat = "Konsultasikan dengan Amil Zakat untuk rumus kelipatannya."; wajib = true;
            }
        }

        if (wajib) {
            tampil("hasilPeternakan", true, "Wajib Zakat Peternakan", baris, "<strong>" + hasilZakat + "</strong>", "");
        } else {
            tampil("hasilPeternakan", false, "Belum wajib zakat", baris, "", hasilZakat);
        }
    });

}