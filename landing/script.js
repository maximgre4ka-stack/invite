// ================= COUNTDOWN (Moscow time) =================
const MSK_OFFSET_MINUTES = 180;
function moscowTimestamp(year, monthIndex, day, hours = 0, minutes = 0, seconds = 0) {
  return Date.UTC(year, monthIndex, day, hours - MSK_OFFSET_MINUTES / 60, minutes, seconds);
}

const weddingTimestamp = moscowTimestamp(2026, 3, 24, 14, 0, 0);
const progressStartTs = moscowTimestamp(2025, 3, 24, 14, 0, 0);
const registrationDeadlineTs = moscowTimestamp(2026, 2, 15, 23, 59, 59);

const d = document.getElementById("d"),
      h = document.getElementById("h"),
      m = document.getElementById("m"),
      s = document.getElementById("s");
const heroProgressBar = document.getElementById("heroProgressBar");
const heroProgress = document.querySelector(".hero-progress");

const rsvpD = document.getElementById("rsvp-d");
const rsvpH = document.getElementById("rsvp-h");
const rsvpM = document.getElementById("rsvp-m");
const rsvpS = document.getElementById("rsvp-s");
const rsvpSubmitBtn = document.getElementById("rsvpSubmitBtn");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");

// Alcohol "Other" — объявляем до использования в submit handler
const alcoholOtherCheck = document.getElementById("alcoholOtherCheck");
const alcoholOtherInput = document.getElementById("alcoholOtherInput");

if (alcoholOtherCheck && alcoholOtherInput) {
  alcoholOtherCheck.addEventListener("change", () => {
    if (alcoholOtherCheck.checked) {
      alcoholOtherInput.classList.add("is-visible");
      alcoholOtherInput.focus();
    } else {
      alcoholOtherInput.classList.remove("is-visible");
      alcoholOtherInput.value = "";
    }
  });
}

// ================= SINGLE COMBINED TIMER =================
function tickAll() {
  const now = Date.now();

  // Wedding countdown
  let diff = Math.max(0, weddingTimestamp - now);
  const sec = Math.floor(diff / 1000);
  d.textContent = Math.floor(sec / 86400);
  h.textContent = String(Math.floor((sec % 86400) / 3600)).padStart(2, "0");
  m.textContent = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  s.textContent = String(sec % 60).padStart(2, "0");

  // Progress bar
  if (heroProgressBar && heroProgress) {
    const total = weddingTimestamp - progressStartTs;
    const elapsed = now - progressStartTs;
    const percent = Math.round(Math.max(0, Math.min(1, elapsed / total)) * 100);
    heroProgressBar.style.width = `${percent}%`;
    heroProgress.setAttribute("aria-valuenow", String(percent));
  }

  // RSVP deadline countdown
  let rsvpDiff = registrationDeadlineTs - now;
  if (rsvpDiff <= 0) {
    if (rsvpD) rsvpD.textContent = "0";
    if (rsvpH) rsvpH.textContent = "00";
    if (rsvpM) rsvpM.textContent = "00";
    if (rsvpS) rsvpS.textContent = "00";
    if (rsvpSubmitBtn) {
      rsvpSubmitBtn.disabled = true;
      rsvpSubmitBtn.textContent = "Регистрация закрыта";
    }
    if (rsvpForm) {
      rsvpForm.querySelectorAll("input, button").forEach(input => {
        input.disabled = true;
      });
    }
    return;
  }
  const rsvpSec = Math.floor(rsvpDiff / 1000);
  if (rsvpD) rsvpD.textContent = Math.floor(rsvpSec / 86400);
  if (rsvpH) rsvpH.textContent = String(Math.floor((rsvpSec % 86400) / 3600)).padStart(2, "0");
  if (rsvpM) rsvpM.textContent = String(Math.floor((rsvpSec % 3600) / 60)).padStart(2, "0");
  if (rsvpS) rsvpS.textContent = String(rsvpSec % 60).padStart(2, "0");
}
tickAll();
setInterval(tickAll, 1000);

// ================= SCROLL TO RSVP =================
document.getElementById("to-rsvp").onclick = () => {
  document.querySelector("#rsvp")?.scrollIntoView({ behavior: "smooth" });
};

// ================= SECTION REVEAL =================
const io = new IntersectionObserver(e => {
  e.forEach(x => x.isIntersecting && x.target.classList.add("is-visible"));
}, { threshold: .12 });
document.querySelectorAll(".section").forEach(s => io.observe(s));

// ================= CALENDAR (.ics) =================
(() => {
  const calendarCard = document.getElementById("calendarCard");
  if (!calendarCard) return;

  const eventStartDate = new Date(2026, 3, 24, 16, 0, 0);
  const eventEndDate = new Date(2026, 3, 24, 22, 0, 0);

  function formatDateTimeForICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  function createICSFile() {
    const startDateICS = formatDateTimeForICS(eventStartDate);
    const endDateICS = formatDateTimeForICS(eventEndDate);
    const nowICS = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    const title = "Свадьба Максима и Яны";
    const description = "Свадьба Максима и Яны\\n\\nг.Сочи ул.Прозрачная 35к1\\nРесторан \"Сад\"";
    const location = "г.Сочи ул.Прозрачная 35к1, Ресторан \"Сад\"";
    const uid = `wedding-maxim-yana-2026-${Date.now()}@sublimenotes`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sublime Notes//Wedding Event//RU",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowICS}`,
      `DTSTART;TZID=Europe/Moscow:${startDateICS}`,
      `DTEND;TZID=Europe/Moscow:${endDateICS}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Свадьба_Максима_и_Яны_24.04.2026.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  calendarCard.addEventListener("click", (e) => {
    e.preventDefault();
    createICSFile();
  });

  calendarCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      createICSFile();
    }
  });
})();

// ================= LOCATION CARD (lazy-load map) =================
(() => {
  const locationCard = document.getElementById("locationCard");
  const locationMap = document.getElementById("locationMap");
  if (!locationCard || !locationMap) return;

  const mapIframe = locationMap.querySelector("iframe");
  const MAP_SRC = "https://yandex.ru/map-widget/v1/org/sad/171732165352/?ll=39.685269%2C43.645387&z=17";
  let mapLoaded = false;
  let openScrollY = 0;
  let ignoreScrollUntil = 0;

  function setOpen(nextOpen) {
    locationCard.classList.toggle("is-open", nextOpen);
    locationCard.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    locationMap.setAttribute("aria-hidden", nextOpen ? "false" : "true");
    if (nextOpen) {
      // Lazy-load: вставляем src только при первом открытии
      if (!mapLoaded && mapIframe) {
        mapIframe.src = MAP_SRC;
        mapLoaded = true;
      }
      openScrollY = window.scrollY || window.pageYOffset;
      ignoreScrollUntil = Date.now() + 500;
    }
  }

  function toggle() {
    setOpen(!locationCard.classList.contains("is-open"));
  }

  locationCard.addEventListener("click", (e) => {
    e.preventDefault();
    toggle();
  });

  locationCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });

  window.addEventListener("scroll", () => {
    if (!locationCard.classList.contains("is-open")) return;
    if (Date.now() < ignoreScrollUntil) return;
    const currentScrollY = window.scrollY || window.pageYOffset;
    if (Math.abs(currentScrollY - openScrollY) > 24) {
      setOpen(false);
    }
  }, { passive: true });
})();

// ================= SCROLL EFFECTS (combined, rAF-throttled) =================
(() => {
  const sections = document.querySelectorAll(".section");
  const heroWrap = document.querySelector(".hero-wrap");
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero__content");
  const body = document.body;

  if (hero) {
    hero.style.opacity = "1";
  }
  if (heroContent) {
    heroContent.style.opacity = "1";
    heroContent.style.transform = "translateY(0)";
  }

  let rafId = 0;

  function updateKeyboardState() {
    if (window.innerWidth > 820) {
      body.classList.remove("keyboard-open");
      return false;
    }
    if (!window.visualViewport) {
      body.classList.remove("keyboard-open");
      return false;
    }
    const diff = window.innerHeight - window.visualViewport.height;
    const isOpen = diff > 120;
    body.classList.toggle("keyboard-open", isOpen);
    return isOpen;
  }

  function onScrollFrame() {
    rafId = 0;
    const windowHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 820;

    // --- Section blur ---
    if (sections.length > 0) {
      const viewportCenter = windowHeight * 0.5;
      const keyboardOpen = updateKeyboardState();

      sections.forEach(section => {
        if (!section.classList.contains("is-visible")) {
          section.style.setProperty("--blur-amount", "0px");
          return;
        }
        if (isMobile && keyboardOpen) {
          section.style.setProperty("--blur-amount", "0px");
          return;
        }

        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height * 0.5;
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);

        const maxBlur = isMobile ? 2 : 6;
        const blurStartDistance = windowHeight * 0.4;
        const blurMaxDistance = windowHeight * 0.8;

        let blurAmount = 0;
        if (distanceFromCenter > blurStartDistance) {
          const blurRange = blurMaxDistance - blurStartDistance;
          const blurProgress = Math.min(1, (distanceFromCenter - blurStartDistance) / blurRange);
          blurAmount = blurProgress * maxBlur;
        }
        section.style.setProperty("--blur-amount", `${blurAmount}px`);
      });
    }

    // --- Hero fade-out ---
    if (hero && heroWrap) {
      const wrapRect = heroWrap.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const wrapTop = heroWrap.offsetTop;
      const wrapHeight = heroWrap.offsetHeight;

      const scrolledFromTop = scrollY - wrapTop;
      const fadeStartPoint = wrapHeight * 0.5;
      const fadeEndPoint = wrapHeight;

      let progress = 0;
      if (scrolledFromTop >= fadeStartPoint && scrolledFromTop < fadeEndPoint) {
        progress = Math.min(1, Math.max(0, (scrolledFromTop - fadeStartPoint) / (fadeEndPoint - fadeStartPoint)));
      } else if (scrolledFromTop >= fadeEndPoint) {
        progress = 1;
      }

      const opacityMultiplier = isMobile ? 0.7 : 0.85;
      const translateMultiplier = isMobile ? 15 : 25;
      const opacity = Math.max(0.15, 1 - progress * opacityMultiplier);
      const translateY = -progress * translateMultiplier;

      if (wrapRect.bottom > 0) {
        hero.style.opacity = opacity;
        if (heroContent) {
          heroContent.style.transform = `translateY(${translateY}px)`;
          heroContent.style.opacity = opacity;
        }
      } else {
        hero.style.opacity = 0;
        if (heroContent) {
          heroContent.style.opacity = 0;
        }
      }
    }
  }

  function scheduleUpdate() {
    if (!rafId) {
      rafId = requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleUpdate);
    window.visualViewport.addEventListener("scroll", scheduleUpdate);
  }
  onScrollFrame();
})();

// ================= RSVP FORM SUBMIT =================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzm70oHFZLEipmttLxvqhaNhQhx4PgnryndkIvH6OY5JDq2VqHeVY2kfml4N8NGUzVV/exec";

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now >= registrationDeadlineTs) {
      if (rsvpStatus) rsvpStatus.textContent = "Регистрация закрыта. Время истекло.";
      return;
    }

    if (rsvpStatus) rsvpStatus.textContent = "Отправляем…";

    const fd = new FormData(rsvpForm);
    const submittedAtMsk = new Date(now).toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const alcohol = fd.getAll("alcohol").map(v => v.toString());
    if (alcoholOtherCheck?.checked && alcoholOtherInput?.value.trim()) {
      alcohol.push(`Другое: ${alcoholOtherInput.value.trim()}`);
    }

    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      attendance: (fd.get("attendance") || "").toString(),
      alcohol,
      submittedAtMsk
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      rsvpForm.reset();
      if (alcoholOtherInput) alcoholOtherInput.classList.remove("is-visible");
      if (rsvpStatus) rsvpStatus.textContent = "Спасибо! Мы получили ваш ответ 💛";
      if (rsvpSubmitBtn) {
        rsvpSubmitBtn.disabled = true;
        rsvpSubmitBtn.textContent = "Ответ отправлен";
      }
    } catch (err) {
      if (rsvpStatus) rsvpStatus.textContent = "Не получилось отправить. Попробуйте ещё раз.";
    }
  });
}
