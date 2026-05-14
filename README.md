# ENTER FOLDER

cd video-src

# HOW TO EXTRACT FRAMES FROM VIDEO

ffmpeg -i video.mp4 -vf "fps=12,scale=720:-1" frame_%03d.jpg

# HOW TO CONVERT VIDEOS TO WEBP IMAGES

mkdir webp_output
for f in *.jpg; do cwebp -q 50 -m 6 "$f" -o "webp_output/${f%.*}.webp"; done

# REMOVE OLD FRAMES

rm -rf ../public/frames/*
cp webp_output/* ../public/frames/ 


### DETAILS

Listed directory sema-nedir-bilir-misin
Viewed package.json:1-24
Listed directory src
Viewed index.html:1-132
Viewed App.vue:1-170
Viewed VideoFramePlayer.vue:1-210
Viewed Loading.vue:1-120
Viewed style.css:1-44
Viewed useScrollTimeline.js:1-192

Bu proje, **"Sema Nedir Bilir Misin? - Sema Mukabelesi Deneyimi"** için hazırlanmış, kullanıcının kaydırma (scroll) hareketine tam senkronize bir şekilde ilerleyen, yüksek performanslı ve etkileşimli bir **"Apple tarzı" açılış sayfasıdır (landing page).**

Teknoloji yığını olarak **Vue 3 (Composition API), Vite, Tailwind CSS v4 ve Anime.js** kullanılmıştır.

Aşağıda projenin nasıl çalıştığını, mimarisini ve barındırdığı ileri düzey teknik detayları modüller halinde inceledim:

### 1. Ana Mimari ve Sayfa Akışı (`App.vue` & `index.html`)
Proje, klasik bir web sayfası gibi aşağı doğru akmak yerine, sayfayı kaydırdıkça sabit bir ekranda (sticky layout) animasyonların ve görsellerin değiştiği bir yapıya sahiptir.

*   `App.vue` sayfanın ana orkestratörüdür.
*   **İki temel state vardır:** `loading` (ön yükleme) ve ana içerik.
*   `scenes` dizisi içinde her bir bölümün metinleri (header, paragraph) tutulur.
*   Mobil ve masaüstü ayrımı (`isMobile`) sayfa yüklenirken User-Agent ve ekran genişliği üzerinden yapılarak, scroll alanının yüksekliği (mobilde `500vh`, masaüstünde `1000vh`) ve Canvas boyutları baştan belirlenir.
*   Sayfanın `header` ve yan menü (hamburger menü) gibi dış kabuk unsurları doğrudan `index.html` içinde statik ve hafif vanilla JS ile çözülmüştür, bu da Vue'nun sadece kompleks interaktif alana odaklanmasını sağlar.

### 2. Scroll ve Animasyon Yöneticisi (`useScrollTimeline.js`)
Tarayıcının doğal scroll event'i genellikle atlamalı (stuttering) ve pürüzlü çalışır. Bu hook, pürüzsüz bir deneyim (smooth scroll) sağlamak için özel bir matematik kullanır.

*   **Smooth Interpolation (Lerp):** Kullanıcının scroll pozisyonu doğrudan yansıtılmaz. `requestAnimationFrame` (rAF) içinde çalışan bir döngü ile hedef scroll noktasına matematiksel olarak yavaşça yaklaşılır (`lerpFactor`). Bu sayede kaydırma bırakıldığında bile animasyon yağ gibi akarak durur.
*   **Snap (Mıknatıs) Efekti:** Kullanıcı iki sahne arasında bir yerde durursa (`snapThreshold` ve `snapForce` değişkenleriyle hesaplanır), sistem onu otomatik olarak en yakın sahnenin tam başına veya sonuna yumuşakça çeker.
*   **Anime.js ile Metin Parçalanması:** `splitText` kullanılarak metinler harf harf DOM elemanlarına bölünür. Scroll yapıldıkça, timeline'ın konumu (`timeline.seek`) scroll yüzdesine göre güncellenir. Metinlerin uzaya dağılması (x, y koordinatlarında random savrulmalar ve dönmeler) bu sayede scroll'a bağlanmış olur. Mobilde kasmaması için savrulma mesafeleri (`xRange`, `yRange`) daha düşük tutulmuştur.

### 3. Scroll'a Bağlı Video Oynatıcı (`VideoFramePlayer.vue`)
HTML5 `<video>` etiketleri, scroll pozisyonuna göre ileri-geri sarılmak (scrubbing) istendiğinde çok ciddi performans sorunları yaratır (keyframe decode süreleri nedeniyle atlamalar olur). Bu projede bu sorunu aşmak için endüstri standardı olan **Canvas Frame Sequence** (Kanvas Kare Dizilimi) tekniği kullanılmıştır.

*   **Çalışma Mantığı:** Ortada bir video yoktur. Bunun yerine 720 adet `.webp` formatında resim karesi vardır (`frame_001.webp` ...). Scroll yapıldıkça, 1 ile 720 arasındaki hangi resmin gösterilmesi gerektiği hesaplanır ve bu resim `<canvas>` üzerine çizilir (`drawImage`).
*   **Preload (Ön Yükleme) Stratejisi:** 720 karenin hepsi anında indirilmez. Sayfa açılırken önce kritik olan ilk 500 kare `Promise.all` ile indirilir. Kalan kareler ise `requestIdleCallback` veya `setTimeout` kullanılarak tarayıcı boşta (idle) iken arka planda yavaş yavaş indirilir.
*   **Off-Main-Thread Decoding:** İndirilen resimler doğrudan `new Image()` yapılmak yerine, tarayıcı destekliyorsa çok daha performanslı olan `createImageBitmap` API'si ile işlenir. Bu, resim çözme (decode) işleminin ana thread'i (UI'ı) tıkamasını engeller.
*   **Çizim Optimizasyonu:** `requestAnimationFrame` kullanılarak saniyede 60 kereden fazla çizim (paint) yapılması engellenir. Sadece frame indeksi değiştiğinde (`pendingFrame !== lastRenderedFrame`) Canvas temizlenip yeni kare basılır. Aspect ratio (en-boy oranı) hesaplamaları yapılarak "object-fit: cover" mantığı Canvas üzerinde manuel olarak uygulanır.

### 4. Ön Yükleme Ekranı (`Loading.vue`)
Uygulama arka planda yüzlerce WebP karesini indirirken (minimum 500 kare), kullanıcının sıkılmaması için zengin bir loading ekranı tasarlanmıştır.

*   Anime.js'in gelişmiş özelliklerinden `createSpring` (yaylanma), `stagger` (ardışık gecikme) ve `splitText` (metin parçalama) kullanılarak "sema nedir bilir misin?" yazısı çok şık bir şekilde ekrana gelir ve harfler sürekli bir dalgalanma efekti içindedir.
*   `VideoFramePlayer` 500. kareyi yüklediğinde `preload-completed` event'ini fırlatır. `App.vue` bu event'i yakalayıp Vue `<Transition>` ile Loading bileşenini yavaşça (3 saniye içinde `opacity: 0`) ekrandan siler ve altındaki ana içerik görünür. Ayrıca 6 saniyelik bir `setTimeout` güvenlik önlemi (fallback) konmuştur; internet çok yavaşsa bile 6 saniye sonra yükleme ekranı zorla kapatılır.

### 5. CSS ve Performans Odaklı İnce Ayarlar (`style.css` vb.)
*   **Overscroll Kontrolü:** `overscroll-behavior: none` ile iOS ve Android'deki sayfa sonu "zıplama" (bounce) efekti engellenerek scroll hissinin bozulması önlenmiştir.
*   **GPU Hızlandırma:** `.sticky { transform: translateZ(0); }` ve JS içindeki `will-change: transform, opacity` atamaları ile animasyonların cihazın grafik işlemcisi (GPU) tarafından render edilmesi sağlanmıştır.
*   **Render İzolasyonu:** CSS'teki `contain: layout style;` tanımı, metinler parçalanıp dağılırken tarayıcının tüm sayfanın mizanpajını (layout) baştan hesaplamasını (reflow) engelleyerek sadece o kutuyla sınırlı kalmasını sağlar.

**Özetle:** Çok yüksek sayıda görselin (720 frame), performans darboğazı yaratmadan mobil ve masaüstünde akıcı bir şekilde, kullanıcının başparmak hareketine milisaniyelik tepkilerle senkronize edildiği, teknik optimizasyon seviyesi oldukça yüksek butik bir web projesidir.

## TEKNİK ANALİZ ##

Viewed useScrollTimeline.js:85-115

Elbette, projeyi temel yapı taşlarına ayırarak ve doğrudan kaynak kodlarından örnekler vererek daha teknik bir seviyede inceleyelim.

### 1. Canvas Tabanlı Video Motoru (`VideoFramePlayer.vue`)

Projedeki en kritik nokta `<video>` etiketi kullanılmamış olmasıdır. HTML5 Video, kullanıcının scroll'una göre saniyede 60 defa geriye-ileriye sarılmak (scrubbing) istendiğinde çok kasar. Bunun yerine 720 adet WebP görseli `<canvas>` üzerine çizilir.

**A. Yüksek Performanslı Ön Yükleme (Preload)**
Resimlerin UI (arayüz) thread'ini dondurmadan arka planda çok hızlı çözümlenmesi (decode) için tarayıcının `createImageBitmap` API'si kullanılır. 

```javascript
// VideoFramePlayer.vue
let bitmapSupported = typeof createImageBitmap === "function";

async function preloadImage(index) {
    if (bitmaps[index]) return; // Zaten yüklüyse geç

    try {
        const res = await fetch(`/frames/frame_${String(index).padStart(3, "0")}.webp`);
        if (!res.ok) return;
        const blob = await res.blob();

        if (bitmapSupported) {
            try {
                // UI'ı bloklamadan arka planda resmi decode et (ÇOK HIZLI)
                bitmaps[index] = await createImageBitmap(blob);
                return;
            } catch {
                bitmapSupported = false; 
            }
        }

        // Eğer tarayıcı createImageBitmap desteklemiyorsa klasik Image objesine düş (Fallback)
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.src = url;
        // ... (img.onload bekleme mantığı)
        bitmaps[index] = img;
    } catch { }
}
```

**B. Arka Planda Kalan Kareleri Yükleme**
Sayfa açılırken ilk 500 kare hızlıca yüklenir, ardından kalan 220 kare kullanıcının sistemi boştayken (`requestIdleCallback`) aralara `setTimeout` gecikmeleri konularak çaktırmadan indirilir. Bu, cihazın CPU'sunun boğulmasını (ısınmayı) engeller.

```javascript
// VideoFramePlayer.vue
function preloadRemaining() {
    const startRemaining = async () => {
        // İlk yüklemeden sonraki kareler
        for (let i = INITIAL_PRELOAD + 1; i <= TOTAL_FRAMES; i++) {
            await preloadImage(i);
            // Her 10 karede bir cihaza nefes alma payı bırak (Mobil için 80ms)
            if (i % 10 === 0) {
                await new Promise((r) => setTimeout(r, REMAINING_DELAY));
            }
        }
    };

    if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => startRemaining(), { timeout: 2000 });
    } else {
        setTimeout(startRemaining, 500);
    }
}
```

### 2. Pürüzsüz Scroll ve Matematik Hesaplamaları (`useScrollTimeline.js`)

Tarayıcının kendi scroll'u kesik kesiktir. Bu projede, "Linear Interpolation" (Lerp) kullanılarak animasyonlara ipeksi bir akıcılık katılır.

**A. Lerp (Yumuşatma) Algoritması**
Kullanıcı fareyi çevirdiğinde sayfa anında o noktaya zıplamaz. Sistem hedefe her karede (frame) kalan mesafenin belli bir yüzdesi (`lerpFactor = 0.2`) kadar yaklaşır.

```javascript
// useScrollTimeline.js
const smoothUpdate = () => {
    // targetProgress: Gerçek scroll yüzdesi (0 ile 1 arası)
    // currentProgress: Animasyonun şu anki yüzdesi
    const delta = Math.abs(targetProgress - currentProgress.value);

    // Hedef değere %20 %20 (lerpFactor) yaklaş. Bu yumuşak bir yavaşlama (easing) sağlar.
    currentProgress.value += (targetProgress - currentProgress.value) * lerpFactor;

    // requestAnimationFrame ile bu hesaplamayı monitörün yenileme hızında (örn. 60Hz) sürekli tekrarla
    rafId = requestAnimationFrame(smoothUpdate);
};
```

**B. Mıknatıs (Snap) Mantığı**
Eğer kullanıcı iki sahne metni arasında scroll yapmayı bırakırsa, sistemin en yakın sahneye otomatik olarak "çekilmesi" sağlanır.

```javascript
// useScrollTimeline.js
const sceneStep = 1 / scenes.length; // 3 sahne varsa step: 0.33
let local = (currentProgress.value - currentIndex.value * sceneStep) / sceneStep;

// local değeri 0 ile 1 arasındadır. Eğer sahnenin %85'ini (1 - 0.15) geçmişse:
if (local > 1 - snapThreshold) {
    const snapTarget = (currentIndex.value + 1) * sceneStep;
    // Otomatik olarak bir sonraki sahneye çek (snapForce ile)
    currentProgress.value += (snapTarget - currentProgress.value) * snapForce;
} 
// Eğer sahnenin başındaysa (%15'in altı) önceki sahnenin başına çek
else if (local < snapThreshold) {
    const snapTarget = currentIndex.value * sceneStep;
    currentProgress.value += (snapTarget - currentProgress.value) * snapForce;
}
```

**C. Anime.js Zaman Çizelgesini Scroll'a Bağlamak**
Metinlerin (Sahnelerin) ekranda parçalanarak uzaya uçması normalde saniyeye dayalı bir animasyondur. Fakat burada `timeline.play()` denilmez. Animasyon dondurulur (`autoplay: false`) ve scroll yüzdesine (`local`) göre manuel olarak ileri-geri sarılır (`seek`).

```javascript
// useScrollTimeline.js
timeline = createTimeline({ autoplay: false }); // Animasyon durduruldu

// Anime.js ile metinlerin uzaya dağılma matematiği
timeline.add([headerSplitted.chars, paragraphSplitted.chars], {
    opacity: [1, 0], // Görünürden görünmeze
    x: () => utils.random(-3, 3) + "rem", // X ekseninde rastgele fırlat
    y: () => utils.random(-5, 5) + "rem", // Y ekseninde rastgele fırlat
    rotate: () => utils.random(-180, 180), // Kendi etrafında döndür
    duration: () => utils.random(200, 750)
}, stagger(5, { from: "random" }));

// smoothUpdate içindeki sihir: Scroll yapıldıkça animasyonu o saniyeye sar!
if (timeline) {
    // Örneğin animasyon 1000ms ise ve kullanıcı sahnenin %50'sindeyse (local = 0.5)
    // timeline'ı 500. milisaniyeye ayarla.
    timeline.seek(local * timeline.duration); 
}
```

### 3. Parçaları Birleştirme (`App.vue`)

Son olarak, bu yumuşatılmış scroll değeri (`currentProgress`) Vue'nun Reaktif mekanizması olan `watch` ile izlenir ve Kanvas motoruna (VideoFramePlayer) iletilir.

```javascript
// App.vue
const { currentProgress, currentIndex, currentHeader, currentParagraph } = useScrollTimeline(scenes);

watch(currentProgress, (val) => {
    // Scroll yapıldığı sürece Canvas içindeki updateFrame metodunu tetikle
    if (videoFramePlayer.value) {
        videoFramePlayer.value.updateFrame(val); // val: 0.00 ile 1.00 arası
    }
});
```

Ve `VideoFramePlayer` bu `0.00 - 1.00` değerini alır, toplam görsel sayısıyla çarparak hangi görselin çizileceğini bulur:

```javascript
// VideoFramePlayer.vue
function updateFrame(scrollPercent) {
    // Eğer scroll %50 (0.5) ise ve 720 kare varsa: 0.5 * 720 = 360. kareyi hesapla
    const frameIndex = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.floor(scrollPercent * TOTAL_FRAMES) + 1)
    );
    // 360. kareyi Canvas'a çiz
    scheduleDrawFrame(frameIndex);
}
```

### 4. Tarayıcı Render Optimizasyonu (`will-change` & `contain`)

Kayan parçacıkların tarayıcıyı kasmaması için JavaScript içinden ilgili elementlere **GPU Hızlandırma** ipuçları (hints) verilir:

```javascript
// useScrollTimeline.js
// Tarayıcıya "Bu objelerin sadece konumu ve opaklığı değişecek" diyerek
// hesaplama işlemlerini İşlemciden (CPU) Ekran Kartına (GPU) devrediyoruz.
headerEl.style.willChange = "transform, opacity";

// Tarayıcıya "Bu objenin içindeki değişiklikler sayfanın geri kalanını etkilemez"
// diyerek tüm sayfanın yeniden çizilmesini (reflow/repaint) engelliyoruz.
headerEl.style.contain = "layout style";
```

Tüm bu mimari, Safari, Chrome ve Mobil tarayıcılarda kullanıcının kaydırma hissiyatı ile saniyede 60 kare hızında (60FPS) değişen yüksek çözünürlüklü görsellerin kusursuz bir senkronizasyonla çalışabilmesini sağlar.

