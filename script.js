// ================= GAME DATA STATE =================
let currentState = "opening_1";
let isTyping = false;
let typeTimeout;
let currentText = "";
let points = 0; // Mengukur pilihan rasional vs nekat untuk menentukan ending

// Ambil DOM Elemen
const gameContainer = document.getElementById("game-container");
const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const dialogBox = document.getElementById("dialog-box");
const dialogText = document.getElementById("dialog-text");
const charName = document.getElementById("char-name");
const choiceContainer = document.getElementById("choice-container");
const sceneBg = document.getElementById("scene-bg");
const charSprite = document.getElementById("char-sprite");
const enemySprite = document.getElementById("enemy-sprite");
const jumpscareOverlay = document.getElementById("jumpscare-overlay");
const continueBtn = document.getElementById("continue-btn");

// Ambil DOM Audio
const bgmCrickets = document.getElementById("bgm-crickets");
const bgmWind = document.getElementById("bgm-wind");
const bgmRain = document.getElementById("bgm-rain");
const sfxGlitch = document.getElementById("sfx-glitch");
const sfxJumpscare = document.getElementById("sfx-jumpscare");
const sfxWhisper = document.getElementById("sfx-whisper");
const sceneBgm = document.getElementById("scene-bgm");

// ================= DATABASE CERITA (STORY DATABASE) =================
// Struktur database visual novel sederhana berbasis objek
const storyData = {
    // ---- OPENING ----
    opening_1: {
        name: "RAKA",
        text: "(Hujan lebat mengguyur jendelaku. Tiba-tiba mesin mobil tuaku terbatuk lalu mati total... Tepat di depan sebuah gapura tua.)",
        bg: "mogok.png", // Placeholder warna biru/abu gelap untuk 'Gerbang Desa'
        char: "none",
        enemy: "none",
        audio: "Scene1.mp3",
        next: "opening_2"
    },
    opening_2: {
        name: "RAKA",
        text: "Sial... Mogok di tempat seperti ini. 'Desa Sunyi'... Benar-benar sesuai namanya. Sepi sekali.",
        bg: "sial.png",
        char: "none",
        enemy: "none", // Muncul jauh di kabut
        audio:"Scene2.mp3",
        next: "opening_3"
    },
    opening_3: {
        name: "RAKA",
        text: "(Saat turun memeriksa kap mobil, pandanganku tertuju ke arah jalanan berkabut di balik gapura... Ada bayangan seseorang berdiri diam.)",
        bg: "turun.png",
        char: "none",
        enemy: "none", // Muncul jauh di kabut
        audio:"Scene3.mp3",
        next: "opening_choices"
    },
    
    // ---- CHOICES BERIKUTNYA ----
    opening_choices: {
        name: "RAKA",
        text: "Halo? Permisi Pak/Bu... Bisa minta tolong?",
        bg: "permisi.png",
        char: "none",
        enemy: "none",
        audio:"Scene4.mp3",
        choices: [
            { text: "Berjalan mendekati bayangan tersebut", next: "pilihan_dekat", points: 2 },
            { text: "Tetap di dekat mobil dan panggil lagi", next: "pilihan_diam", points: 0 }
        ]
    },

    // ---- JALUR DEKAT ----
    pilihan_dekat: {
        name: "RAKA",
        text: "(Langkahku semakin berat melintasi kabut tebal desa. Bayangan itu tegak kaku... Bau busuk menyengat tiba-tiba menusuk hidung.)",
        bg: "jalan.png", 
        char: "none",
        enemy: "none",
        audio:"Scene5.mp3",
        next: "trigger_jumpscare_1"
    },
    trigger_jumpscare_1: {
        name: "???",
        text: "M U L A I... M E L I N T A S . . .",
        bg: "none", // Placeholder visual jumpscare mendadak
        char: "none",
        enemy: "pocong_jumpscare.png",
        jumpscare: true, // Menandakan scene ini memicu jumpscare acak/pasti

        next: "desa_center"
    },

    // ---- JALUR DIAM ----
    pilihan_diam: {
        name: "RAKA",
        text: "Tidak ada jawaban... Bayangan itu menghilang secara aneh di dalam kabut tebal. Sebaiknya aku berjalan masuk mencari pemukiman.",
        bg: "hilang.png",
        char: "none",
        enemy: "none",
        audio:"Scene7.mp3",
        next: "desa_center"
    },

    // ---- DESA CENTER (RUMAH KAYU TUA & KUBURAN) ----
    desa_center: {
        name: "RAKA",
        text: "Rumah-rumah kayu ini kosong... jendelanya hancur. Seperti sudah ditinggalkan sejak tahun 90-an. Kemana perginya semua orang?",
        bg: "rumah_kosong.png", // Placeholder 'Rumah Kayu'
        char: "none",
        enemy: "none",
        audio:"Scene8.mp3",
        next: "desa_choices"
    },
    desa_choices: {
        name: "RAKA",
        text: "Di sebelah kiri ada jalan menuju kuburan tua desa, di sebelah kanan ada hutan bambu yang gelap gulita. Mana yang harus kupilih?",
        bg: "dua_jalan.png",
        char: "none",
        audio:"Scene9.mp3",
        choices: [
            { text: "Periksa arah kuburan tua desa", next: "kuburan_scene", points: 1 },
            { text: "Masuk ke area hutan bambu", next: "hutan_scene", points: 3 }
        ]
    },

    // ---- RUTE KUBURAN (MENUJU GOOD ATAU TRUE ENDING) ----
    kuburan_scene: {
        name: "RAKA",
        text: "Banyak nisan tua tanpa nama. Tunggu... ada sebuah buku catatan usang tergeletak di depan sebuah makam yang tanahnya masih basah.",
        bg: "nisan.png", // Placeholder 'Kuburan'
        char: "none",
        enemy: "none",
        audio:"Scene10.mp3",
        next: "kuburan_choices"
    },
    kuburan_choices: {
        name: "RAKA",
        text: "Catatan ini berisi nama-nama warga dan ritual tumbal kepala desa! Apa yang harus kulakukan?",
        bg: "catatan.png",
        audio:"Scene11.mp3",
        char: "none",
        choices: [
            { text: "Ambil buku bukti dan segera lari keluar desa", next: "ending_good", points: 0 },
            { text: "Cari Mushola tua untuk bersembunyi & membaca lebih dalam", next: "ending_true", points: 5 }
        ]
    },

    // ---- RUTE HUTAN BAMBU (MENUJU BAD OR SECRET ENDING) ----
    hutan_scene: {
        name: "RAKA",
        text: "Suara bambu bergesekan terdengar seperti bisikan tajam di telingaku... Aku merasa berputar-putar di tempat yang sama.",
        bg: "berbisik.png", // Placeholder 'Hutan Bambu'
        char: "none",
        enemy: "none",
        audio:"Scene12.mp3",
        next: "hutan_choices"
    },
    hutan_choices: {
        name: "RAKA",
        text: "Tiba-tiba kabut menebal secara instan hingga aku tak bisa melihat tanganku sendiri! Seseorang berbisik tepat di belakang leherku...",
        bg: "hutan_bambu.png",
        char: "none",
        enemy: "none",
        audio:"Scene13.mp3",
        choices: [
            { text: "Menoleh ke belakang", next: "ending_bad", points: 10 },
            { text: "Terus berlari lurus tanpa menoleh", next: "ending_secret", points: -5 }
        ]
    },

    // ================= MULTIPLE ENDINGS SCENES =================
    ending_good: {
        name: "GOOD ENDING",
        text: "Raka berhasil melarikan diri dari kejaran Pocong pembawa kutukan. Berbekal buku catatan, polisi berhasil membongkar kasus hilangnya warga. Raka selamat, namun trauma membekas selamanya.",
        bg: "good_ending.png",
        char: "none",
        enemy: "none",
        audio:"GoodEnding.mp3",
        isEnding: true
    },
    ending_bad: {
        name: "BAD ENDING",
        text: "Saat menoleh, sesosok mayat membusuk berkain kafan kotor melompat tepat di depan wajah Raka! Esoknya, mobil Raka ditemukan kosong. Raka menjadi korban berikutnya dari Desa Sunyi.",
        bg: "bad_ending.png",
        char: "none",
        enemy: "none",
        jumpscare: true,
        audio:"BadEnding.mp3",
        isEnding: true
    },
    ending_true: {
        name: "TRUE ENDING",
        text: "Di dalam Mushola tua, Raka menyadari ritual terlarang desa dipimpin oleh Kepala Desa demi kekayaan abadi. Menggunakan jimat pelindung di Mushola, Raka berhasil membakar pusat ritual. Kutukan hancur.",
        bg: "true_ending.png", // Placeholder 'Mushola'
        char: "none",
        enemy: "none",
        audio:"TrueEnding.mp3",
        isEnding: true
    },
    ending_secret: {
        name: "SECRET ENDING",
        text: "Raka terus berlari hingga menembus kabut... dan berakhir di depan mobilnya yang mogok. Namun di dalam kemudi mobil, ia melihat jasadnya sendiri yang telah membiru. Raka telah mati sejak awal kecelakaan.",
        bg: "secret_ending.png",
        char: "none",
        enemy: "none",
        audio:"SecretEnding.mp3",
        isEnding: true
    }
};

// ================= CORE FUNCTIONS =================

// Mulai Game Baru
function startGame() {
    currentState = "opening_1";
    points = 0;
    mainMenu.classList.remove("active");
    gameScreen.classList.add("active");
    
    // Play Ambience Audio
    playAmbience();
    
    updateScene();
}

// Mengatur Suara Latar
function playAmbience() {
    bgmCrickets.currentTime = 0;
    bgmRain.currentTime = 0;
    
    // Metode play modern (mencegah error autoplay block browser)
    bgmCrickets.play().catch(e => console.log("Audio di-block browser, perlu interaksi klik"));
    bgmRain.play().catch(e => console.log("Audio di-block browser"));
    
    bgmCrickets.volume = 0.2;
    bgmRain.volume = 0.2;
    
}

// Update Tampilan Berdasarkan Database State
function updateScene() {
    choiceContainer.innerHTML = ""; // Menghapus semua tombol lama
    choiceContainer.classList.add("hidden"); // Menyembunyikan kontainer pilihan
    const scene = storyData[currentState];
    if (!scene) return;

    // Simpan Progress Otomatis (Save System)
    if (!scene.isEnding) {
        localStorage.setItem("desa_sunyi_save", currentState);
        continueBtn.disabled = false;
    }

    // ================= AUDIO PER SCENE =================
if (scene.audio) {

    const newAudio = `assets/sound/${scene.audio}`;

    // Ganti audio hanya jika berbeda
    if (!sceneBgm.src.includes(scene.audio)) {

        sceneBgm.pause();

        sceneBgm.src = newAudio;

        sceneBgm.currentTime = 0;

        sceneBgm.volume = 1;

        sceneBgm.play().catch(e => {
            console.log("Audio diblok browser");
        });
    }
}

    // Set Nama & Background
charName.innerText = scene.name;

// Background image
sceneBg.style.backgroundImage = `url('assets/bg/${scene.bg}')`;
sceneBg.style.backgroundSize = "cover";
sceneBg.style.backgroundPosition = "center";
sceneBg.style.backgroundRepeat = "no-repeat";
    // Jika Anda punya file gambar asli, unkomentari baris di bawah:
    // sceneBg.style.backgroundImage = `url('assets/bg/${scene.bg_file}.png')`;

    // Reset Jumpscare Overlay dari frame sebelumnya
    jumpscareOverlay.style.display = "none";
    gameContainer.classList.remove("shake", "glitch-red");

    // Efek Jumpscare Sistem
    if (scene.jumpscare) {
        triggerJumpscareEffect();
    }

    // Enemy Sprite
if (scene.enemy !== "none") {
    enemySprite.style.display = "block";
    enemySprite.style.backgroundImage = `url('assets/enemy/${scene.enemy}')`;
    enemySprite.style.backgroundSize = "contain";
    enemySprite.style.backgroundRepeat = "no-repeat";
    enemySprite.style.backgroundPosition = "center";
} else {
    enemySprite.style.display = "none";
}

    // Character Sprite
if (scene.char !== "none") {
    charSprite.style.display = "block";
    charSprite.style.backgroundImage = `url('assets/character/${scene.char}')`;
    charSprite.style.backgroundSize = "contain";
    charSprite.style.backgroundRepeat = "no-repeat";
    charSprite.style.backgroundPosition = "center";
} else {
    charSprite.style.display = "none";
}

    // Jalankan Efek Mengetik Teks (Typewriter)
    displayTextWithTyping(scene.text, () => {
    // KODE INI HANYA AKAN JALAN SETELAH TEKS SELESAI DIKETIK
    if (scene.choices) {
        dialogBox.style.pointerEvents = "none";
        displayChoices(scene.choices);
    } else {
        dialogBox.style.pointerEvents = "auto";
    }
});
}

// Logika Mengetik Teks Visual Novel
function displayTextWithTyping(text, onComplete) {
    clearInterval(typeTimeout);
    isTyping = true;
    currentText = text;
    dialogText.innerHTML = "";
    
    let index = 0;
    typeTimeout = setInterval(() => {
        if (index < text.length) {
            dialogText.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(typeTimeout);
            isTyping = false;
            // Panggil callback setelah teks selesai diketik
            if (onComplete) onComplete(); 
        }
    }, 70);
}

// Fungsi Klik untuk Melanjutkan Dialog
function nextDialog() {
    // Jika teks sedang berjalan mengetik, klik akan langsung memunculkan semua teks
    if (isTyping) {
        clearInterval(typeTimeout);
        dialogText.innerHTML = currentText;
        isTyping = false;

        const scene = storyData[currentState];
        if (scene.choices) {
            dialogBox.style.pointerEvents = "none";
            displayChoices(scene.choices);
        }
        
        return;
    }

    const scene = storyData[currentState];
    
    // Jika ini adalah scene ending, klik akan mengembalikan pemain ke main menu
    if (scene.isEnding) {
        backToMainMenu();
        return;
    }

    // Pindah ke state berikutnya
    if (scene.next) {
        currentState = scene.next;
        updateScene();
    }
}

// Membuat Tombol Pilihan Bercabang (Choice System)
function displayChoices(choices) {
    choiceContainer.innerHTML = "";
    choiceContainer.classList.remove("hidden");

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.innerText = choice.text;
        button.onclick = () => {
            points += choice.points; // Tambahkan poin kalkulasi ending
            currentState = choice.next;
            updateScene();
        };
        choiceContainer.appendChild(button);
    });
}

// Logika Pemicu Jumpscare
function triggerJumpscareEffect() {
    sfxGlitch.play();
    sfxJumpscare.play();
    
    // Aktifkan efek visual getar dan glitch merah lewat class CSS
    gameContainer.classList.add("shake", "glitch-red");
    jumpscareOverlay.style.display = "block";
    jumpscareOverlay.style.backgroundColor = "rgba(150, 0, 0, 0.6)"; // Placeholder visual merah darah mendadak
    
    // Matikan efek getar setelah 1.5 detik
    setTimeout(() => {
        gameContainer.classList.remove("shake", "glitch-red");
        jumpscareOverlay.style.display = "none";
    }, 1500);
}

// Fitur Muat Game (Continue)
function loadGame() {
    const savedState = localStorage.getItem("desa_sunyi_save");
    if (savedState && storyData[savedState]) {
        currentState = savedState;
        mainMenu.classList.remove("active");
        gameScreen.classList.add("active");
        playAmbience();
        updateScene();
    }
}

// Cek Apakah Ada Save Data Saat Pertama Dibuka
window.onload = function() {
    const savedState = localStorage.getItem("desa_sunyi_save");
    if (savedState) {
        continueBtn.disabled = false;
    }
};

// Kembali ke Menu Utama
function backToMainMenu() {
    gameScreen.classList.remove("active");
    mainMenu.classList.add("active");
    bgmCrickets.pause();
    bgmRain.pause();
    sceneBgm.pause();
    sceneBgm.currentTime = 0;
}

// Tombol Keluar (Simulasi)
function exitGame() {
    alert("Terima kasih telah bermain Desa Sunyi. Silakan tutup tab browser Anda.");
}

// Dukungan Keyboard (Tombol Space / Enter untuk melanjutkan dialog)
document.addEventListener("keydown", (e) => {
    if (gameScreen.classList.contains("active")) {
        const scene = storyData[currentState];
        // Pastikan tidak menekan tombol saat sistem pilihan bercabang sedang aktif
        if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            if (!scene.choices) {
                nextDialog();
            }
        }
    }
});