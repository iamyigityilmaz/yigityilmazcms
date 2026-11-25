/* Yiğit Yılmaz — kişisel site
   Tek dosya, bağımlılık yok. Her bölüm kendi öğesi sayfada varsa çalışır. */

/* İLETİŞİM FORMU AYARI
   Boş bırakılırsa form, ziyaretçinin e-posta uygulamasını açar (her sunucuda çalışır).
   Formspree gibi bir form servisi kullanacaksan adresini buraya yaz:
   örnek: "https://formspree.io/f/abcdwxyz" */
const FORM_ADRESI = "";

(function () {
  "use strict";

  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Menü (telefon ve tablet) ---- */
  const dugme = document.querySelector(".menu-dugme");
  const menu = document.getElementById("menu");
  if (dugme && menu) {
    dugme.addEventListener("click", function () {
      const acik = menu.classList.toggle("acik");
      dugme.setAttribute("aria-expanded", String(acik));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("acik")) {
        menu.classList.remove("acik");
        dugme.setAttribute("aria-expanded", "false");
        dugme.focus();
      }
    });
  }

  /* ---- Anasayfa: akış tuvali ---- */
  const veri = document.getElementById("akis-veri");
  const tuval = document.querySelector(".tuval");
  if (veri && tuval) {
    const senaryolar = JSON.parse(veri.textContent);
    const dugumler = Array.from(tuval.querySelectorAll(".dugum"));
    const alan = {
      mesaj: tuval.querySelector("[data-alan=mesaj]"),
      dil: tuval.querySelector("[data-alan=dil]"),
      kategori: tuval.querySelector("[data-alan=kategori]"),
      kural: tuval.querySelector("[data-alan=kural]"),
      sonuc: tuval.querySelector("[data-alan=sonuc]"),
      rozetler: tuval.querySelector("[data-alan=rozetler]"),
    };
    const secenekler = Array.from(tuval.querySelectorAll(".secenek"));
    let zamanlayicilar = [];

    function yaz(s) {
      alan.mesaj.textContent = s.mesaj;
      alan.dil.textContent = s.dil;
      alan.kategori.textContent = s.kategori;
      alan.kural.textContent = s.kural;
      alan.sonuc.textContent = s.sonuc;
      alan.rozetler.replaceChildren(
        ...s.rozetler.map(function (r) {
          const li = document.createElement("li");
          li.textContent = r;
          return li;
        })
      );
    }

    function sec(i, canlandir) {
      const s = senaryolar[i];
      secenekler.forEach(function (b, j) {
        b.setAttribute("aria-pressed", String(i === j));
      });
      zamanlayicilar.forEach(clearTimeout);
      zamanlayicilar = [];
      yaz(s);
      if (!canlandir || azHareket) {
        dugumler.forEach(function (d) { d.classList.add("etkin"); });
        return;
      }
      dugumler.forEach(function (d) { d.classList.remove("etkin"); });
      dugumler.forEach(function (d, k) {
        zamanlayicilar.push(setTimeout(function () { d.classList.add("etkin"); }, 120 + k * 260));
      });
    }

    secenekler.forEach(function (b, i) {
      b.addEventListener("click", function () { sec(i, true); });
    });
    sec(0, false);
  }

  /* ---- Galeri: fotoğraf görüntüleyici ----
     Tıkla: büyük aç. Oklar, klavye okları ya da kaydırma: önceki/sonraki.
     Fotoğrafa tıkla ya da "Yakınlaştır": 2 kat büyüt, sürükleyerek gez. */
  const isik = document.querySelector(".isik");
  if (isik && typeof isik.showModal === "function") {
    const baglar = Array.from(document.querySelectorAll(".duvar a"));
    const yuva = isik.querySelector(".isik__resim");
    const baslik = isik.querySelector(".isik__yazi b");
    const metin = isik.querySelector(".isik__yazi span");
    const sayac = isik.querySelector(".isik__sayac");
    const zumDugme = isik.querySelector(".isik__zum");
    let sira = 0;
    let resim = null;
    let yakin = false;
    let suruklendi = false;

    function zum(ac, x, y) {
      if (!resim) return;
      if (ac && !yakin) {
        const k = resim.getBoundingClientRect();
        const ox = x == null ? 0.5 : (x - k.left) / k.width;
        const oy = y == null ? 0.5 : (y - k.top) / k.height;
        resim.style.width = Math.round(k.width * 2) + "px";
        yuva.classList.add("yakin");
        yuva.scrollLeft = ox * k.width * 2 - yuva.clientWidth / 2;
        yuva.scrollTop = oy * k.height * 2 - yuva.clientHeight / 2;
      } else if (!ac) {
        resim.style.width = "";
        yuva.classList.remove("yakin");
      }
      yakin = ac;
      zumDugme.textContent = ac ? isik.dataset.uzak : isik.dataset.yakin;
      zumDugme.setAttribute("aria-pressed", String(ac));
    }

    function goster(i) {
      sira = (i + baglar.length) % baglar.length;
      const a = baglar[sira];
      const kucuk = a.querySelector("img");
      resim = new Image();
      resim.src = a.href;
      resim.alt = kucuk ? kucuk.alt : "";
      resim.draggable = false;
      yuva.replaceChildren(resim);
      yakin = true;
      zum(false);
      baslik.textContent = a.dataset.baslik || "";
      metin.textContent = a.dataset.metin || "";
      sayac.textContent = sira + 1 + " / " + baglar.length;
    }

    baglar.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        goster(i);
        isik.showModal();
      });
    });

    isik.querySelector(".isik__ok--once").addEventListener("click", function () { goster(sira - 1); });
    isik.querySelector(".isik__ok--sonra").addEventListener("click", function () { goster(sira + 1); });
    zumDugme.addEventListener("click", function () { zum(!yakin); });

    isik.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goster(sira - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goster(sira + 1); }
    });
    isik.addEventListener("close", function () { zum(false); });

    /* Tıklama: fotoğrafta yakınlaştır/uzaklaştır, boşlukta kapat */
    yuva.addEventListener("click", function (e) {
      if (suruklendi) { suruklendi = false; return; }
      if (e.target === resim) zum(!yakin, e.clientX, e.clientY);
      else if (!yakin) isik.close();
    });

    /* Fareyle sürükleyerek gezme (dokunmatikte tarayıcının kendi kaydırması çalışır) */
    let tut = null;
    yuva.addEventListener("pointerdown", function (e) {
      if (!yakin || e.pointerType !== "mouse") return;
      tut = { x: e.clientX, y: e.clientY, sol: yuva.scrollLeft, ust: yuva.scrollTop };
      suruklendi = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (!tut) return;
      const dx = e.clientX - tut.x;
      const dy = e.clientY - tut.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) { suruklendi = true; yuva.classList.add("tutuldu"); }
      yuva.scrollLeft = tut.sol - dx;
      yuva.scrollTop = tut.ust - dy;
    });
    window.addEventListener("pointerup", function () {
      tut = null;
      yuva.classList.remove("tutuldu");
    });

    /* Telefonda sağa/sola kaydırarak geçiş */
    let dokun = null;
    yuva.addEventListener("touchstart", function (e) {
      dokun = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    yuva.addEventListener("touchend", function (e) {
      if (!dokun || yakin) return;
      const dx = e.changedTouches[0].clientX - dokun.x;
      const dy = e.changedTouches[0].clientY - dokun.y;
      dokun = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goster(sira + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---- Blog: kategori ve etiket süzgeci ---- */
  const suzgec = document.querySelector(".suzgec");
  if (suzgec) {
    const yazilar = Array.from(document.querySelectorAll(".yazi"));
    const dugmeler = Array.from(suzgec.querySelectorAll("button"));
    const durum = suzgec.querySelector(".suzgec__durum");

    function uygula(tur, deger) {
      let sayi = 0;
      yazilar.forEach(function (y) {
        const liste = (tur === "etiket" ? y.dataset.etiketler : y.dataset.kategoriler) || "";
        const uyuyor = !deger || liste.split("|").indexOf(deger) !== -1;
        y.hidden = !uyuyor;
        if (uyuyor) sayi += 1;
      });
      dugmeler.forEach(function (b) {
        const secili = tur === "kategori" ? b.dataset.deger === (deger || "") : (!deger && b.dataset.deger === "");
        b.setAttribute("aria-pressed", String(secili));
      });
      if (!deger) {
        durum.textContent = "";
      } else {
        const kalip = tur === "etiket" ? suzgec.dataset.etiketMetni : suzgec.dataset.kategoriMetni;
        durum.textContent = kalip.replace("{x}", deger).replace("{n}", String(sayi));
      }
    }

    function adrestenOku() {
      const h = decodeURIComponent(location.hash.replace(/^#/, ""));
      const p = h.split("=");
      if (p.length === 2 && (p[0] === "etiket" || p[0] === "kategori")) {
        uygula(p[0], p[1]);
      } else {
        uygula("kategori", "");
      }
    }

    dugmeler.forEach(function (b) {
      b.addEventListener("click", function () {
        const d = b.dataset.deger;
        if (d) {
          history.replaceState(null, "", "#kategori=" + encodeURIComponent(d));
        } else {
          history.replaceState(null, "", location.pathname + location.search);
        }
        uygula("kategori", d);
      });
    });
    window.addEventListener("hashchange", adrestenOku);
    adrestenOku();
  }

  /* ---- İletişim formu ---- */
  const form = document.querySelector(".form");
  if (form) {
    const durum = form.querySelector(".form__durum");
    const m = form.dataset;

    function hataGoster(alan, metin) {
      const p = form.querySelector('[data-hata="' + alan.name + '"]');
      if (p) p.textContent = metin;
      alan.setAttribute("aria-invalid", metin ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let ilkHata = null;
      Array.from(form.elements).forEach(function (el) {
        if (!el.name || el.type === "submit") return;
        let metin = "";
        if (el.required && !el.value.trim()) metin = m.bos;
        else if (el.type === "email" && el.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)) metin = m.eposta;
        hataGoster(el, metin);
        if (metin && !ilkHata) ilkHata = el;
      });
      if (ilkHata) {
        durum.dataset.tur = "hata";
        durum.textContent = m.duzelt;
        ilkHata.focus();
        return;
      }

      const v = new FormData(form);
      if (FORM_ADRESI) {
        durum.dataset.tur = "";
        durum.textContent = m.gonderiliyor;
        fetch(FORM_ADRESI, { method: "POST", body: v, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error(String(r.status));
            form.reset();
            durum.dataset.tur = "tamam";
            durum.textContent = m.gonderildi;
          })
          .catch(function () {
            durum.dataset.tur = "hata";
            durum.textContent = m.gonderilemedi;
          });
        return;
      }

      const govde = v.get("mesaj") + "\n\n" + v.get("ad") + "\n" + v.get("eposta");
      location.href =
        "mailto:" + m.alici +
        "?subject=" + encodeURIComponent(v.get("konu") || m.konu) +
        "&body=" + encodeURIComponent(govde);
      durum.dataset.tur = "tamam";
      durum.textContent = m.posta;
    });
  }
})();
