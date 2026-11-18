
const SECTIONS = {
    pengertian: {
        nama: "Pengertian Zakat",
        fields: [
            { key: "judul", label: "Judul", type: "text" },
            { key: "isi", label: "Isi", type: "textarea" }
        ],
        kolom: ["judul", "isi"]
    },
    jenis: {
        nama: "Jenis Zakat",
        fields: [
            { key: "ikon", label: "Ikon (pakai emoji)", type: "text", opsional: true },
            { key: "judul", label: "Judul", type: "text" },
            { key: "deskripsi", label: "Deskripsi", type: "textarea" }
        ],
        kolom: ["ikon", "judul", "deskripsi"]
    },
    golongan: {
        nama: "Golongan Penerima",
        fields: [
            { key: "ikon", label: "Ikon (pakai emoji)", type: "text", opsional: true },
            { key: "nama", label: "Nama golongan", type: "text" },
            { key: "deskripsi", label: "Deskripsi", type: "textarea" }
        ],
        kolom: ["ikon", "nama", "deskripsi"]
    }
};

let data = getData();
let editing = { type: null, id: null };

function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2200);
}

function potong(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n) + "…" : s;
}


function render() {
    Object.keys(SECTIONS).forEach(function (type) {
        const cfg = SECTIONS[type];
        const rows = data[type].map(function (item, i) {
            const tds = cfg.kolom.map(function (k) {
                return "<td>" + esc(potong(item[k], 70)) + "</td>";
            }).join("");
            return "<tr><td>" + (i + 1) + "</td>" + tds +
                "<td><button class='edit-button' data-edit='" + type + "' data-id='" + item.id + "'>Edit</button>" +
                "<button class='delete-button' data-del='" + type + "' data-id='" + item.id + "'>Hapus</button></td></tr>";
        }).join("");
        document.getElementById("tbody-" + type).innerHTML =
            rows || "<tr><td colspan='" + (cfg.kolom.length + 2) + "'>Belum ada data.</td></tr>";
        document.getElementById("count-" + type).textContent = data[type].length;
    });

    const p = data.pengaturan;
    document.getElementById("setEmas").value = p.hargaEmas;
    document.getElementById("setPerak").value = p.hargaPerak;
    document.getElementById("setBeras").value = p.hargaBeras;
    document.getElementById("setTakaran").value = p.takaranFitrah;
}


function bukaModal(type, id) {
    const cfg = SECTIONS[type];
    const item = id ? data[type].find(function (x) { return x.id === id; }) : {};
    editing = { type: type, id: id || null };

    document.getElementById("modalTitle").textContent =
        (id ? "Edit " : "Tambah ") + cfg.nama;

    document.getElementById("modalFields").innerHTML = cfg.fields.map(function (f) {
        const val = esc(item[f.key] || "");
        const input = f.type === "textarea"
            ? '<textarea id="f-' + f.key + '" rows="4"' + (f.opsional ? "" : " required") + ">" + val + "</textarea>"
            : '<input type="text" id="f-' + f.key + '" value="' + val + '"' + (f.opsional ? "" : " required") + ">";
        return '<div class="form-group"><label for="f-' + f.key + '">' + f.label + "</label>" + input + "</div>";
    }).join("");

    document.getElementById("modal").classList.add("show");
}

function tutupModal() {
    document.getElementById("modal").classList.remove("show");
}

document.getElementById("modalCancel").addEventListener("click", tutupModal);
document.getElementById("modal").addEventListener("click", function (e) {
    if (e.target.id === "modal") tutupModal();
});

document.getElementById("modalForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const cfg = SECTIONS[editing.type];
    const baru = {};
    cfg.fields.forEach(function (f) {
        baru[f.key] = document.getElementById("f-" + f.key).value.trim();
    });

    if (editing.id) {
        const idx = data[editing.type].findIndex(function (x) { return x.id === editing.id; });
        data[editing.type][idx] = Object.assign({ id: editing.id }, baru);
        toast("Oke, perubahan udah kesimpen!");
    } else {
        baru.id = newId();
        data[editing.type].push(baru);
        toast("Mantap, data baru udah masuk!");
    }
    saveData(data);
    render();
    tutupModal();
});

// ---------- tombol tambah / edit / hapus ----------
document.addEventListener("click", function (e) {
    const t = e.target;
    if (t.dataset.add) bukaModal(t.dataset.add);
    if (t.dataset.edit) bukaModal(t.dataset.edit, t.dataset.id);
    if (t.dataset.del) {
        if (confirm("Yakin nih mau hapus data ini?")) {
            data[t.dataset.del] = data[t.dataset.del].filter(function (x) { return x.id !== t.dataset.id; });
            saveData(data);
            render();
            toast("Beres, data udah dihapus.");
        }
    }
});


document.getElementById("formPengaturan").addEventListener("submit", function (e) {
    e.preventDefault();
    data.pengaturan = {
        hargaEmas: Number(document.getElementById("setEmas").value),
        hargaPerak: Number(document.getElementById("setPerak").value),
        hargaBeras: Number(document.getElementById("setBeras").value),
        takaranFitrah: Number(document.getElementById("setTakaran").value)
    };
    saveData(data);
    toast("Pengaturan udah kesimpen!");
});

document.getElementById("resetData").addEventListener("click", function () {
    if (confirm("Semua data bakal balik kayak semula dan perubahanmu hilang. Lanjut?")) {
        resetData();
        data = getData();
        render();
        toast("Data udah balik kayak semula.");
    }
});

render();

(function proteksiAdmin() {
    const isLogin = sessionStorage.getItem("zakatmate_admin_login");
    
    if (isLogin !== "true") {
        const passwordInput = prompt("Masukkan Password Admin ZakatMate:");
        
        // Ganti 'admin123' dengan password acak milikmu
        if (passwordInput === "1234567890") {
            sessionStorage.setItem("zakatmate_admin_login", "true");
        } else {
            alert("Password salah! Mengembalikan ke Beranda...");
            window.location.href = "index.html";
        }
    }
})();