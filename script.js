document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. HELPER FORMAT RUPIAH & PARSING ANGKA
    // ==========================================
    const formatRupiah = (angka) => {
        const nilai = Math.round(Number(angka) || 0);
        return "Rp " + nilai.toLocaleString("id-ID");
    };

    const parseRupiah = (str) => {
        if (!str) return 0;
        const bersih = String(str).replace(/[^0-9]/g, "");
        return parseInt(bersih, 10) || 0;
    };

    const pasangFormatRupiah = (input) => {
        input.addEventListener("input", () => {
            const angka = parseRupiah(input.value);
            input.value = angka > 0 ? angka.toLocaleString("id-ID") : "";
            if (input.id === "hargaEmas" || input.id === "hargaPerak") {
                updateInfoNisab();
            }
        });
    };

    document.querySelectorAll(".rupiah-input").forEach(pasangFormatRupiah);

    // ==========================================
    // 2. ACUAN NISAB REAL-TIME (STANDAR BAZNAS)
    // ==========================================
    const inputHargaEmas = document.getElementById("hargaEmas");
    const inputHargaPerak = document.getElementById("hargaPerak");

    // Sinkronisasi jika data.js menyediakan nilai default
    if (window.DATA_ZAKAT?.hargaEmas) {
        inputHargaEmas.value = Number(window.DATA_ZAKAT.hargaEmas).toLocaleString("id-ID");
    }
    if (window.DATA_ZAKAT?.hargaPerak) {
        inputHargaPerak.value = Number(window.DATA_ZAKAT.hargaPerak).toLocaleString("id-ID");
    }

    const getNisab = () => {
        const hargaEmas = parseRupiah(inputHargaEmas.value) || 1400000;
        const hargaPerak = parseRupiah(inputHargaPerak.value) || 18000;
        const nisabTahun = 85 * hargaEmas;
        const nisabBulan = nisabTahun / 12;
        const nisabPerak = 595 * hargaPerak;
        return { hargaEmas, hargaPerak, nisabTahun, nisabBulan, nisabPerak };
    };

    const updateInfoNisab = () => {
        const { nisabTahun, nisabBulan, nisabPerak } = getNisab();
        document.getElementById("displayNisabTahun").textContent = formatRupiah(nisabTahun);
        document.getElementById("displayNisabBulan").textContent = formatRupiah(nisabBulan);
        document.getElementById("displayNisabPerak").textContent = formatRupiah(nisabPerak);
    };

    updateInfoNisab();

    // ==========================================
    // 3. NAVIGASI TAB UTAMA & SUB-TAB
    // ==========================================
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const group = btn.dataset.group;
            const targetId = btn.dataset.target;

            document.querySelectorAll(`.tab-btn[data-group="${group}"]`).forEach((b) => {
                b.classList.remove("active");
            });
            document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach((p) => {
                p.classList.remove("show");
            });

            btn.classList.add("active");
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add("show");
        });
    });

    // ==========================================
    // 4. INTERAKSI DINAMIS FORM BAZNAS
    // ==========================================
    // Ubah label Penghasilan (Per Bulan vs Per Tahun)
    const periodePenghasilan = document.getElementById("periodePenghasilan");
    periodePenghasilan.addEventListener("change", () => {
        const teks = periodePenghasilan.value === "bulan" ? "per Bulan" : "per Tahun";
        document.getElementById("labelGaji").textContent = `Penghasilan / Gaji ${teks} (Rp)`;
        document.getElementById("labelGajiLain").textContent = `Penghasilan Lain / Bonus ${teks} (Rp)`;
        document.getElementById("labelCicilan").textContent = `Utang / Cicilan Kebutuhan Pokok ${teks} (Rp)`;
    });

    // Ubah input Perusahaan (Jasa vs Dagang/Industri)
    const jenisPerusahaan = document.getElementById("jenisPerusahaan");
    jenisPerusahaan.addEventListener("change", () => {
        const isJasa = jenisPerusahaan.value === "jasa";
        document.getElementById("groupLabaJasa").style.display = isJasa ? "block" : "none";
        document.getElementById("groupAktiva").style.display = isJasa ? "none" : "block";
        document.getElementById("groupPasiva").style.display = isJasa ? "none" : "block";
    });

    // Tombol Reset per Panel
    document.querySelectorAll(".btn-reset").forEach((btn) => {
        btn.addEventListener("click", () => {
            const panel = document.getElementById(btn.dataset.reset);
            if (!panel) return;
            panel.querySelectorAll("input").forEach((inp) => {
                if (inp.id === "jumlahJiwa") inp.value = "1";
                else if (inp.id === "takaranFitrah") inp.value = "2.5";
                else if (inp.id === "hargaBeras") inp.value = "15.000";
                else inp.value = "";
            });
            panel.querySelectorAll("select").forEach((sel) => {
                sel.selectedIndex = 0;
                sel.dispatchEvent(new Event("change"));
            });
            const res = panel.querySelector(".result-box");
            if (res) {
                res.className = "result-box";
                res.innerHTML = "";
            }
        });
    });

    // ==========================================
    // 5. RENDER HASIL STANDAR BAZNAS
    // ==========================================
    const tampilkanHasil = (elementId, { wajib, barisDetail, nilaiUtama, catatanTambahan, jenisZakat }) => {
        const box = document.getElementById(elementId);
        const rowsHtml = barisDetail
            .map(([label, val]) => `<tr><td>${label}</td><td>${val}</td></tr>`)
            .join("");

        const statusBadge = wajib
            ? `<span class="status-badge wajib">✅ WAJIB ZAKAT</span>`
            : `<span class="status-badge belum">ℹ️ BELUM WAJIB ZAKAT</span>`;

        const pesanBawah = wajib
            ? `<div class="result-total">Zakat yang Harus Ditunaikan: ${nilaiUtama}</div>
               <a href="penyaluran.html" class="btn-salur">Tunaikan Zakat Sekarang →</a>`
            : `<p style="margin-top:10px; font-size:0.92rem; color:#92400e;">${catatanTambahan}</p>
               <a href="penyaluran.html" class="btn-salur" style="background:#d97706;">Salurkan Infak / Sedekah →</a>`;

        box.className = `result-box show ${wajib ? "wajib" : "belum-wajib"}`;
        box.innerHTML = `
            ${statusBadge}
            <table class="result-detail">${rowsHtml}</table>
            ${pesanBawah}
        `;

        // Simpan riwayat terakhir untuk integrasi dashboard/penyaluran
        localStorage.setItem("zakatmate_last_calc", JSON.stringify({
            jenis: jenisZakat,
            wajib,
            nominal: nilaiUtama,
            waktu: new Date().toISOString()
        }));
    };

    // ==========================================
    // 6. RUMUS PERHITUNGAN TIAP JENIS ZAKAT
    // ==========================================

    // A. ZAKAT PENGHASILAN
    document.getElementById("hitungPenghasilan").addEventListener("click", () => {
        const periode = periodePenghasilan.value;
        const gaji = parseRupiah(document.getElementById("gaji").value);
        const gajiLain = parseRupiah(document.getElementById("gajiLain").value);
        const cicilan = parseRupiah(document.getElementById("cicilan").value);

        const totalBersih = Math.max(0, gaji + gajiLain - cicilan);
        const { nisabTahun, nisabBulan } = getNisab();
        const nisabBerlaku = periode === "bulan" ? nisabBulan : nisabTahun;
        const wajib = totalBersih >= nisabBerlaku && totalBersih > 0;
        const zakat = wajib ? totalBersih * 0.025 : 0;

        tampilkanHasil("hasilPenghasilan", {
            jenisZakat: "Zakat Penghasilan",
            wajib,
            barisDetail: [
                ["Periode Hitung", periode === "bulan" ? "Bulanan" : "Tahunan"],
                ["Total Penghasilan Bersih", formatRupiah(totalBersih)],
                [`Nisab (${periode === "bulan" ? "85 gr Emas ÷ 12" : "85 gr Emas"})`, formatRupiah(nisabBerlaku)],
                ["Kadar Zakat", "2,5%"]
            ],
            nilaiUtama: formatRupiah(zakat),
            catatanTambahan: "Penghasilan bersih Anda belum mencapai batas nisab. Anda tetap dapat berinfak atau bersedekah."
        });
    });

    // B. ZAKAT PERUSAHAAN
    document.getElementById("hitungPerusahaan").addEventListener("click", () => {
        const jenis = jenisPerusahaan.value;
        const haul = document.getElementById("haulPerusahaan").value === "ya";
        const { nisabTahun } = getNisab();

        let objekZakat = 0;
        let detailKhusus = [];

        if (jenis === "jasa") {
            objekZakat = parseRupiah(document.getElementById("labaJasa").value);
            detailKhusus.push(["Jenis Perusahaan", "Perusahaan Jasa"]);
            detailKhusus.push(["Laba Bersih / Pendapatan", formatRupiah(objekZakat)]);
        } else {
            const aktiva = parseRupiah(document.getElementById("aktivaLancar").value);
            const pasiva = parseRupiah(document.getElementById("pasivaLancar").value);
            objekZakat = Math.max(0, aktiva - pasiva);
            detailKhusus.push(["Jenis Perusahaan", "Dagang / Industri"]);
            detailKhusus.push(["Aktiva Lancar − Pasiva Lancar", formatRupiah(objekZakat)]);
        }

        const wajib = haul && objekZakat >= nisabTahun && objekZakat > 0;
        const zakat = wajib ? objekZakat * 0.025 : 0;

        tampilkanHasil("hasilPerusahaan", {
            jenisZakat: "Zakat Perusahaan",
            wajib,
            barisDetail: [
                ...detailKhusus,
                ["Nisab (85 gr Emas)", formatRupiah(nisabTahun)],
                ["Status Haul (1 Tahun)", haul ? "Terpenuhi" : "Belum Terpenuhi"]
            ],
            nilaiUtama: formatRupiah(zakat),
            catatanTambahan: !haul
                ? "Perusahaan belum mencapai haul 1 tahun."
                : "Aset/laba kena zakat perusahaan belum mencapai nisab 85 gram emas."
        });
    });

    // C. ZAKAT PERDAGANGAN
    document.getElementById("hitungDagang").addEventListener("click", () => {
        const modal = parseRupiah(document.getElementById("modalDagang").value);
        const untung = parseRupiah(document.getElementById("untungDagang").value);
        const piutang = parseRupiah(document.getElementById("piutangDagang").value);
        const utang = parseRupiah(document.getElementById("utangDagang").value);
        const rugi = parseRupiah(document.getElementById("rugiDagang").value);
        const haul = document.getElementById("haulDagang").value === "ya";

        const hartaBersih = Math.max(0, (modal + untung + piutang) - (utang + rugi));
        const { nisabTahun } = getNisab();
        const wajib = haul && hartaBersih >= nisabTahun && hartaBersih > 0;
        const zakat = wajib ? hartaBersih * 0.025 : 0;

        tampilkanHasil("hasilDagang", {
            jenisZakat: "Zakat Perdagangan",
            wajib,
            barisDetail: [
                ["Harta Perdagangan Bersih", formatRupiah(hartaBersih)],
                ["Nisab (85 gr Emas)", formatRupiah(nisabTahun)],
                ["Status Haul (1 Tahun)", haul ? "Terpenuhi" : "Belum Terpenuhi"]
            ],
            nilaiUtama: formatRupiah(zakat),
            catatanTambahan: !haul
                ? "Usaha perdagangan belum mencapai haul 1 tahun."
                : "Harta perdagangan bersih belum mencapai nisab 85 gram emas."
        });
    });

    // D. ZAKAT EMAS & PERAK
    document.getElementById("hitungEmas").addEventListener("click", () => {
        const jenis = document.getElementById("jenisLogam").value;
        const totalGram = parseFloat(document.getElementById("gramLogam").value) || 0;
        const dipakaiGram = parseFloat(document.getElementById("gramDipakai").value) || 0;
        const haul = document.getElementById("haulLogam").value === "ya";

        const gramBersih = Math.max(0, totalGram - dipakaiGram);
        const nisabGram = jenis === "emas" ? 85 : 595;
        const { hargaEmas, hargaPerak } = getNisab();
        const hargaPerGram = jenis === "emas" ? hargaEmas : hargaPerak;

        const wajib = haul && gramBersih >= nisabGram;
        const zakatGram = wajib ? gramBersih * 0.025 : 0;
        const zakatRupiah = zakatGram * hargaPerGram;

        tampilkanHasil("hasilEmas", {
            jenisZakat: `Zakat ${jenis === "emas" ? "Emas" : "Perak"}`,
            wajib,
            barisDetail: [
                ["Berat Wajib Zakat (Total − Dipakai)", `${gramBersih.toLocaleString("id-ID")} gram`],
                ["Batas Nisab", `${nisabGram} gram`],
                ["Taksiran Nilai Rupiah", formatRupiah(gramBersih * hargaPerGram)],
                ["Status Haul (1 Tahun)", haul ? "Terpenuhi" : "Belum Terpenuhi"]
            ],
            nilaiUtama: `${formatRupiah(zakatRupiah)} (${zakatGram.toFixed(2)} gr)`,
            catatanTambahan: !haul
                ? "Kepemilikan logam mulia belum mencapai haul 1 tahun."
                : `Berat bersih belum mencapai nisab ${nisabGram} gram.`
        });
    });

    // E. ZAKAT TABUNGAN
    document.getElementById("hitungTabungan").addEventListener("click", () => {
        const saldo = parseRupiah(document.getElementById("saldoTabungan").value);
        const bunga = parseRupiah(document.getElementById("bungaTabungan").value);
        const haul = document.getElementById("haulTabungan").value === "ya";

        const saldoBersih = Math.max(0, saldo - bunga);
        const { nisabTahun } = getNisab();
        const wajib = haul && saldoBersih >= nisabTahun && saldoBersih > 0;
        const zakat = wajib ? saldoBersih * 0.025 : 0;

        tampilkanHasil("hasilTabungan", {
            jenisZakat: "Zakat Tabungan",
            wajib,
            barisDetail: [
                ["Saldo Tabungan Bersih", formatRupiah(saldoBersih)],
                ["Nisab (85 gr Emas)", formatRupiah(nisabTahun)],
                ["Status Haul (1 Tahun)", haul ? "Terpenuhi" : "Belum Terpenuhi"]
            ],
            nilaiUtama: formatRupiah(zakat),
            catatanTambahan: !haul
                ? "Saldo tabungan belum mengendap selama 1 tahun (haul)."
                : "Saldo tabungan belum mencapai nisab 85 gram emas."
        });
    });

    // F. ZAKAT SAHAM
    document.getElementById("hitungSaham").addEventListener("click", () => {
        const nilai = parseRupiah(document.getElementById("nilaiSaham").value);
        const dividen = parseRupiah(document.getElementById("dividenSaham").value);
        const haul = document.getElementById("haulSaham").value === "ya";

        const totalAset = nilai + dividen;
        const { nisabTahun } = getNisab();
        const wajib = haul && totalAset >= nisabTahun && totalAset > 0;
        const zakat = wajib ? totalAset * 0.025 : 0;

        tampilkanHasil("hasilSaham", {
            jenisZakat: "Zakat Saham",
            wajib,
            barisDetail: [
                ["Total Nilai Saham + Dividen", formatRupiah(totalAset)],
                ["Nisab (85 gr Emas)", formatRupiah(nisabTahun)],
                ["Status Haul (1 Tahun)", haul ? "Terpenuhi" : "Belum Terpenuhi"]
            ],
            nilaiUtama: formatRupiah(zakat),
            catatanTambahan: !haul
                ? "Kepemilikan investasi belum mencapai haul 1 tahun."
                : "Total nilai investasi belum mencapai nisab 85 gram emas."
        });
    });

    // G. ZAKAT PERTANIAN
    document.getElementById("hitungPertanian").addEventListener("click", () => {
        const nisabKg = parseFloat(document.getElementById("jenisPanen").value);
        const hasilKg = parseFloat(document.getElementById("hasilPanen").value) || 0;
        const tarif = parseFloat(document.getElementById("pengairan").value);
        const hargaKg = parseRupiah(document.getElementById("hargaPanen").value);

        const wajib = hasilKg >= nisabKg && hasilKg > 0;
        const zakatKg = wajib ? hasilKg * tarif : 0;
        const zakatRp = zakatKg * hargaKg;

        const teksZakat = hargaKg > 0
            ? `${zakatKg.toLocaleString("id-ID")} kg (${formatRupiah(zakatRp)})`
            : `${zakatKg.toLocaleString("id-ID")} kg`;

        tampilkanHasil("hasilPertanian", {
            jenisZakat: "Zakat Pertanian",
            wajib,
            barisDetail: [
                ["Total Hasil Panen", `${hasilKg.toLocaleString("id-ID")} kg`],
                ["Batas Nisab", `${nisabKg} kg`],
                ["Kadar Zakat", `${tarif * 100}%`]
            ],
            nilaiUtama: teksZakat,
            catatanTambahan: `Hasil panen belum mencapai batas nisab ${nisabKg} kg.`
        });
    });

    // H. ZAKAT PETERNAKAN
    document.getElementById("hitungPeternakan").addEventListener("click", () => {
        const jenis = document.getElementById("jenisTernak").value;
        const jumlah = parseInt(document.getElementById("jumlahTernak").value, 10) || 0;
        const haul = document.getElementById("haulTernak").value === "ya";

        const nisabEkor = jenis === "kambing" ? 40 : 30;
        const wajib = haul && jumlah >= nisabEkor;
        let kadarTeks = "0 ekor";

        if (wajib) {
            if (jenis === "kambing") {
                if (jumlah <= 120) kadarTeks = "1 ekor kambing/domba";
                else if (jumlah <= 200) kadarTeks = "2 ekor kambing/domba";
                else if (jumlah <= 399) kadarTeks = "3 ekor kambing/domba";
                else kadarTeks = `${Math.floor(jumlah / 100)} ekor kambing/domba`;
            } else {
                if (jumlah <= 39) kadarTeks = "1 ekor sapi umur 1 tahun (tabi')";
                else if (jumlah <= 59) kadarTeks = "1 ekor sapi umur 2 tahun (musinnah)";
                else if (jumlah <= 69) kadarTeks = "2 ekor sapi umur 1 tahun";
                else {
                    // Kombinasi kelipatan 30 (tabi') dan 40 (musinnah)
                    let sisa = jumlah;
                    let musinnah = Math.floor(sisa / 40);
                    let tabi = 0;
                    while (musinnah >= 0) {
                        const rem = jumlah - musinnah * 40;
                        if (rem % 30 === 0) {
                            tabi = rem / 30;
                            break;
                        }
                        musinnah--;
                    }
                    if (musinnah < 0) {
                        tabi = Math.floor(jumlah / 30);
                        musinnah = 0;
                    }
                    const bagian = [];
                    if (tabi > 0) bagian.push(`${tabi} ekor sapi umur 1 thn`);
                    if (musinnah > 0) bagian.push(`${musinnah} ekor sapi umur 2 thn`);
                    kadarTeks = bagian.join(" + ");
                }
            }
        }

        tampilkanHasil("hasilPeternakan", {
            jenisZakat: "Zakat Peternakan",
            wajib,
            barisDetail: [
                ["Jumlah Ternak", `${jumlah} ekor`],
                ["Batas Nisab", `${nisabEkor} ekor`],
                ["Status Haul (1 Tahun)", haul ? "Terpenuhi" : "Belum Terpenuhi"]
            ],
            nilaiUtama: kadarTeks,
            catatanTambahan: !haul
                ? "Hewan ternak belum dipelihara selama 1 tahun (haul)."
                : `Jumlah ternak belum mencapai nisab ${nisabEkor} ekor.`
        });
    });

    // I. ZAKAT RIKAZ
    document.getElementById("hitungRikaz").addEventListener("click", () => {
        const nilai = parseRupiah(document.getElementById("nilaiRikaz").value);
        const wajib = nilai > 0;
        const zakat = nilai * 0.2;

        tampilkanHasil("hasilRikaz", {
            jenisZakat: "Zakat Rikaz",
            wajib,
            barisDetail: [
                ["Nilai Barang Temuan", formatRupiah(nilai)],
                ["Syarat Nisab & Haul", "Tidak ada (langsung ditunaikan)"],
                ["Kadar Zakat", "20%"]
            ],
            nilaiUtama: formatRupiah(zakat),
            catatanTambahan: "Masukkan nilai barang temuan untuk menghitung zakat rikaz."
        });
    });

    // J. ZAKAT FITRAH
    document.getElementById("hitungFitrah").addEventListener("click", () => {
        const jiwa = Math.max(1, parseInt(document.getElementById("jumlahJiwa").value, 10) || 1);
        const takaran = parseFloat(document.getElementById("takaranFitrah").value) || 2.5;
        const hargaBeras = parseRupiah(document.getElementById("hargaBeras").value);

        const totalBeras = jiwa * takaran;
        const totalUang = totalBeras * hargaBeras;

        tampilkanHasil("hasilFitrah", {
            jenisZakat: "Zakat Fitrah",
            wajib: true,
            barisDetail: [
                ["Jumlah Jiwa", `${jiwa} orang`],
                ["Total Beras", `${totalBeras.toLocaleString("id-ID")} kg (${(jiwa * 3.5).toLocaleString("id-ID")} liter)`],
                ["Harga Beras Acuan", `${formatRupiah(hargaBeras)} / kg`]
            ],
            nilaiUtama: hargaBeras > 0
                ? `${formatRupiah(totalUang)} atau ${totalBeras.toLocaleString("id-ID")} kg beras`
                : `${totalBeras.toLocaleString("id-ID")} kg beras`,
            catatanTambahan: ""
        });
    });
});