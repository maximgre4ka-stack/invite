// Countdown (Moscow time)
const MSK_OFFSET_MINUTES = 180;
function moscowTimestamp(year, monthIndex, day, hours = 0, minutes = 0, seconds = 0) {
  return Date.UTC(year, monthIndex, day, hours - MSK_OFFSET_MINUTES / 60, minutes, seconds);
}

const weddingTimestamp = moscowTimestamp(2026, 3, 24, 14, 0, 0);
const d=document.getElementById("d"),
      h=document.getElementById("h"),
      m=document.getElementById("m"),
      s=document.getElementById("s");
const heroProgressBar=document.getElementById("heroProgressBar");
const heroProgress=document.querySelector(".hero-progress");
const progressStartTs = moscowTimestamp(2025, 3, 24, 14, 0, 0);

function tick(){
  const now=Date.now();
  let diff=weddingTimestamp-now;
  if(diff<0) diff=0;

  const sec=Math.floor(diff/1000);
  d.textContent=Math.floor(sec/86400);
  h.textContent=String(Math.floor(sec%86400/3600)).padStart(2,"0");
  m.textContent=String(Math.floor(sec%3600/60)).padStart(2,"0");
  s.textContent=String(sec%60).padStart(2,"0");

  if(heroProgressBar && heroProgress){
    const total=weddingTimestamp-progressStartTs;
    const elapsed=now-progressStartTs;
    const ratio=Math.max(0,Math.min(1,elapsed/total));
    const percent=Math.round(ratio*100);
    heroProgressBar.style.width=`${percent}%`;
    heroProgress.setAttribute("aria-valuenow",String(percent));
  }
}
tick(); setInterval(tick,1000);

// Scroll to RSVP
document.getElementById("to-rsvp").onclick=()=>{
  document.querySelector("#rsvp")?.scrollIntoView({behavior:"smooth"});
};

// Section reveal
const io=new IntersectionObserver(e=>{
  e.forEach(x=>x.isIntersecting&&x.target.classList.add("is-visible"));
},{threshold:.12});
document.querySelectorAll(".section").forEach(s=>io.observe(s));

// Add to Calendar functionality
(()=>{
  const calendarCard=document.getElementById("calendarCard");
  if(!calendarCard) return;
  
  // Дата события: 24 апреля 2026, 16:00–22:00
  const eventStartDate=new Date(2026,3,24,16,0,0);
  const eventEndDate=new Date(2026,3,24,22,0,0);
  
  // Определение устройства Apple
  function isAppleDevice(){
    const userAgent=navigator.userAgent||navigator.vendor||window.opera;
    return /iPad|iPhone|iPod|Macintosh/.test(userAgent)&&!window.MSStream;
  }
  
  // Форматирование даты и времени для .ics файла (формат: YYYYMMDDTHHMMSS)
  function formatDateTimeForICS(date){
    const year=date.getFullYear();
    const month=String(date.getMonth()+1).padStart(2,"0");
    const day=String(date.getDate()).padStart(2,"0");
    const hours=String(date.getHours()).padStart(2,"0");
    const minutes=String(date.getMinutes()).padStart(2,"0");
    const seconds=String(date.getSeconds()).padStart(2,"0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }
  
  // Создание .ics файла
  function createICSFile(){
    const startDateICS=formatDateTimeForICS(eventStartDate);
    const endDateICS=formatDateTimeForICS(eventEndDate);
    const nowICS=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
    
    const title="Свадьба Максима и Яны";
    const description="Свадьба Максима и Яны\\n\\nг.Сочи ул.Прозрачная 35к1\\nРесторан \"Сад\"";
    const location="г.Сочи ул.Прозрачная 35к1, Ресторан \"Сад\"";
    
    // Генерация уникального ID для события
    const uid=`wedding-maxim-yana-2026-${Date.now()}@sublimenotes`;
    
    // Формирование содержимого .ics файла
    const icsContent=[
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sublime Notes//Wedding Event//RU",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowICS}`,
      `DTSTART:${startDateICS}`,
      `DTEND:${endDateICS}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    
    // Создание Blob и скачивание файла
    const blob=new Blob([icsContent],{type:"text/calendar;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="Свадьба_Максима_и_Яны_24.04.2026.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  function activateCalendar(){
    // Используем универсальный .ics файл для всех устройств
    // .ics формат работает с Apple Calendar, Google Calendar, Outlook, Yahoo и другими
    createICSFile();
  }

  calendarCard.addEventListener("click",(e)=>{
    e.preventDefault();
    activateCalendar();
  });

  calendarCard.addEventListener("keydown",(e)=>{
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      activateCalendar();
    }
  });
})();

// Location card map toggle
(()=>{
  const locationCard=document.getElementById("locationCard");
  const locationMap=document.getElementById("locationMap");
  if(!locationCard || !locationMap) return;
  let openScrollY=0;
  let ignoreScrollUntil=0;

  function setOpen(nextOpen){
    locationCard.classList.toggle("is-open",nextOpen);
    locationCard.setAttribute("aria-expanded",nextOpen?"true":"false");
    locationMap.setAttribute("aria-hidden",nextOpen?"false":"true");
    if(nextOpen){
      openScrollY=window.scrollY||window.pageYOffset;
      ignoreScrollUntil=Date.now()+500;
    }
  }

  function toggle(){
    setOpen(!locationCard.classList.contains("is-open"));
  }

  locationCard.addEventListener("click",(e)=>{
    e.preventDefault();
    toggle();
  });

  locationCard.addEventListener("keydown",(e)=>{
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      toggle();
    }
  });

  window.addEventListener("scroll",()=>{
    if(!locationCard.classList.contains("is-open")) return;
    if(Date.now()<ignoreScrollUntil) return;
    const currentScrollY=window.scrollY||window.pageYOffset;
    if(Math.abs(currentScrollY-openScrollY)>24){
      setOpen(false);
    }
  },{passive:true});
})();

// Section blur animation based on viewport position
(()=>{
  const sections=document.querySelectorAll(".section");
  if(sections.length===0) return;
  const body=document.body;

  function updateKeyboardState(){
    if(window.innerWidth>820){
      body.classList.remove("keyboard-open");
      return false;
    }
    if(!window.visualViewport){
      body.classList.remove("keyboard-open");
      return false;
    }
    const diff=window.innerHeight-window.visualViewport.height;
    const isOpen=diff>120;
    body.classList.toggle("keyboard-open",isOpen);
    return isOpen;
  }
  
  function updateSectionBlur(){
    const windowHeight=window.innerHeight;
    const viewportCenter=windowHeight*0.5;
    const keyboardOpen=updateKeyboardState();
    const isMobile=window.innerWidth<=820;
    
    sections.forEach(section=>{
      // Применяем размытие только к видимым секциям
      if(!section.classList.contains("is-visible")){
        // Для невидимых секций сбрасываем размытие
        section.style.setProperty("--blur-amount","0px");
        return;
      }

      if(isMobile && keyboardOpen){
        section.style.setProperty("--blur-amount","0px");
        return;
      }
      
      const rect=section.getBoundingClientRect();
      const sectionCenter=rect.top+(rect.height*0.5);
      const distanceFromCenter=Math.abs(sectionCenter-viewportCenter);
      
      // Максимальное размытие для секций на краях экрана
      const maxBlur=isMobile?2:6; // меньше размытие на мобильных, чтобы не перекрывать контент
      const blurStartDistance=windowHeight*0.4; // начинаем размывать с этого расстояния
      const blurMaxDistance=windowHeight*0.8; // максимальное размытие на этом расстоянии
      
      // Вычисляем размытие: чем дальше от центра, тем больше размытие
      let blurAmount=0;
      if(distanceFromCenter>blurStartDistance){
        const blurRange=blurMaxDistance-blurStartDistance;
        const blurProgress=Math.min(1,(distanceFromCenter-blurStartDistance)/blurRange);
        blurAmount=blurProgress*maxBlur;
      }
      
      // Используем CSS переменную для размытия, чтобы не конфликтовать с другими стилями
      section.style.setProperty("--blur-amount",`${blurAmount}px`);
    });
  }
  
  window.addEventListener("scroll",updateSectionBlur,{passive:true});
  window.addEventListener("resize",updateSectionBlur);
  if(window.visualViewport){
    window.visualViewport.addEventListener("resize",updateSectionBlur);
    window.visualViewport.addEventListener("scroll",updateSectionBlur);
  }
  updateSectionBlur();
})();

// Hero fade-out animation on scroll
(()=>{
  const heroWrap=document.querySelector(".hero-wrap");
  const hero=document.querySelector(".hero");
  const heroContent=document.querySelector(".hero__content");
  if(!hero || !heroWrap) return;
  
  // Убеждаемся, что hero изначально полностью виден
  hero.style.opacity="1";
  if(heroContent){
    heroContent.style.opacity="1";
    heroContent.style.transform="translateY(0)";
  }

  function update(){
    const wrapRect=heroWrap.getBoundingClientRect();
    const scrollY=window.scrollY || window.pageYOffset;
    const wrapTop=heroWrap.offsetTop;
    const wrapHeight=heroWrap.offsetHeight;
    const windowHeight=window.innerHeight;
    const isMobile=window.innerWidth<=820;
    
    // Вычисляем, сколько прокручено от начала hero-wrap
    const scrolledFromTop=scrollY-wrapTop;
    
    // Анимация начинается, когда прокручено 50% высоты hero блока
    const fadeStartPoint=wrapHeight*0.5; // 50% высоты hero-wrap
    const fadeEndPoint=wrapHeight; // когда hero-wrap полностью прокручен
    
    let progress=0;
    
    // Если еще не прокручено 50% - hero полностью виден
    if(scrolledFromTop<fadeStartPoint){
      progress=0;
    }
    // Если между 50% и 100% - вычисляем прогресс анимации
    else if(scrolledFromTop>=fadeStartPoint && scrolledFromTop<fadeEndPoint){
      progress=Math.min(1,Math.max(0,(scrolledFromTop-fadeStartPoint)/(fadeEndPoint-fadeStartPoint)));
    }
    // Если прокручено больше 100% - анимация завершена
    else if(scrolledFromTop>=fadeEndPoint){
      progress=1;
    }
    
    // Применяем fade-out и небольшой подъем контента
    // На мобиле делаем менее интенсивный эффект
    const opacityMultiplier=isMobile?0.7:0.85; // на мобиле менее интенсивный fade
    const translateMultiplier=isMobile?15:25; // на мобиле меньше подъем
    
    const opacity=Math.max(0.15,1-progress*opacityMultiplier); // opacity от 1 до 0.15 минимум
    const translateY=-progress*translateMultiplier; // поднимаем контент
    
    // Применяем стили только если hero-wrap еще виден
    if(wrapRect.bottom>0){
      hero.style.opacity=opacity;
      if(heroContent){
        heroContent.style.transform=`translateY(${translateY}px)`;
        heroContent.style.opacity=opacity;
      }
    } else {
      // Hero-wrap полностью скрыт - можно скрыть полностью
      hero.style.opacity=0;
      if(heroContent){
        heroContent.style.opacity=0;
      }
    }
  }
  
  window.addEventListener("scroll",update,{passive:true});
  window.addEventListener("resize",update);
  update();
})();

// RSVP Registration Deadline Timer (Moscow time)
const registrationDeadlineTs = moscowTimestamp(2026, 2, 15, 23, 59, 59); // 15.03.2026 23:59:59
const rsvpD = document.getElementById("rsvp-d");
const rsvpH = document.getElementById("rsvp-h");
const rsvpM = document.getElementById("rsvp-m");
const rsvpS = document.getElementById("rsvp-s");
const rsvpSubmitBtn = document.getElementById("rsvpSubmitBtn");
const rsvpForm = document.getElementById('rsvpForm');

function updateRSVPTimer() {
  const now = Date.now();
  let diff = registrationDeadlineTs - now;
  
  if (diff <= 0) {
    // Время истекло - отключаем форму
    if (rsvpD) rsvpD.textContent = "0";
    if (rsvpH) rsvpH.textContent = "00";
    if (rsvpM) rsvpM.textContent = "00";
    if (rsvpS) rsvpS.textContent = "00";
    
    // Отключаем кнопку и форму
    if (rsvpSubmitBtn) {
      rsvpSubmitBtn.disabled = true;
      rsvpSubmitBtn.textContent = "Регистрация закрыта";
    }
    if (rsvpForm) {
      // Делаем все поля формы неактивными
      const inputs = rsvpForm.querySelectorAll('input, button');
      inputs.forEach(input => {
        if (input !== rsvpSubmitBtn) {
          input.disabled = true;
        }
      });
    }
    return;
  }
  
  // Обновляем таймер
  const sec = Math.floor(diff / 1000);
  if (rsvpD) rsvpD.textContent = Math.floor(sec / 86400);
  if (rsvpH) rsvpH.textContent = String(Math.floor((sec % 86400) / 3600)).padStart(2, "0");
  if (rsvpM) rsvpM.textContent = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  if (rsvpS) rsvpS.textContent = String(sec % 60).padStart(2, "0");
}

// Запускаем таймер RSVP
updateRSVPTimer();
setInterval(updateRSVPTimer, 1000);

// RSVP submit -> Google Sheets (Apps Script Web App)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzm70oHFZLEipmttLxvqhaNhQhx4PgnryndkIvH6OY5JDq2VqHeVY2kfml4N8NGUzVV/exec";

const rsvpStatus = document.getElementById('rsvpStatus');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Проверяем, не истекло ли время регистрации
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
const alcohol = fd.getAll('alcohol').map(v => v.toString());

if (alcoholOtherCheck?.checked && alcoholOtherInput?.value.trim()) {
  alcohol.push(`Другое: ${alcoholOtherInput.value.trim()}`);
}

const payload = {
  name: (fd.get('name') || '').toString().trim(),
  attendance: (fd.get('attendance') || '').toString(),
  alcohol,
  submittedAtMsk
};


    try {
      // no-cors: запрос уйдёт, но ответ прочитать нельзя (это нормально)
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      rsvpForm.reset();
      if (rsvpStatus) rsvpStatus.textContent = "Спасибо! Мы получили ваш ответ 💛";
    } catch (err) {
      if (rsvpStatus) rsvpStatus.textContent = "Не получилось отправить. Попробуйте ещё раз.";
    }
  });
}
// Alcohol "Other" toggle
const alcoholOtherCheck = document.getElementById('alcoholOtherCheck');
const alcoholOtherInput = document.getElementById('alcoholOtherInput');

if (alcoholOtherCheck && alcoholOtherInput) {
  alcoholOtherCheck.addEventListener('change', () => {
    if (alcoholOtherCheck.checked) {
      alcoholOtherInput.classList.add('is-visible');
      alcoholOtherInput.focus();
    } else {
      alcoholOtherInput.classList.remove('is-visible');
      alcoholOtherInput.value = '';
    }
  });
}
