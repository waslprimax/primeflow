"""PRIME FLOW site (daylight). Builds dist/index.html (RU) and dist/en/index.html (EN).
Sections are ordered along the cargo route: truck (hero, supply, process) → plane (AI story)
→ ship (contact, port)."""
import os, html, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "dist")
EMAIL = "info@primeflow.uz"
e = html.escape

CSS = r"""
:root{
  --canvas:#eef3f8; --ink:#0b2545; --text:#22374f; --muted:#4d6279; --soft:#6b7f95;
  --blue:#0078d0; --blue-2:#0a88e6; --sky:#5cc8f7;
  --line:rgba(11,37,69,.12); --line-2:rgba(11,37,69,.2);
  --card:rgba(255,255,255,.82); --card-2:rgba(255,255,255,.94);
  --display:'Space Grotesk',system-ui,sans-serif; --mark:'Montserrat','Space Grotesk',sans-serif; --body:'Inter',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--canvas);color:var(--text);font:400 16px/1.55 var(--body);letter-spacing:-.005em;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--blue);outline-offset:3px;border-radius:6px}
.wrap{max-width:1000px;margin:0 auto;padding:0 24px}

#flow{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;transition:opacity 1.2s ease}
#flow.ready{opacity:1}
.veil{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0;
  background:linear-gradient(90deg,rgba(238,243,248,0) calc(50% - 560px),rgba(238,243,248,.9) calc(50% - 470px),rgba(238,243,248,.93) 50%,rgba(238,243,248,.9) calc(50% + 470px),rgba(238,243,248,0) calc(50% + 560px))}
@media (max-width:1180px){.veil{background:linear-gradient(90deg,rgba(238,243,248,.35),rgba(238,243,248,.9) 18%,rgba(238,243,248,.93) 50%,rgba(238,243,248,.9) 82%,rgba(238,243,248,.35))}}
main,footer{position:relative;z-index:1}

header{position:sticky;top:0;z-index:20;background:rgba(238,243,248,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{display:flex;align-items:center;gap:10px;font:600 15px var(--mark);letter-spacing:.06em;color:var(--ink)}
nav.main{display:flex;gap:2px;align-items:center}
nav.main a{padding:8px 12px;font-size:14px;color:var(--muted);border-radius:999px}
nav.main a:hover{color:var(--ink);background:rgba(11,37,69,.06)}
.lang{font:400 13px var(--mono);color:var(--soft)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font:500 14px var(--body);padding:9px 18px;border:0;cursor:pointer;white-space:nowrap}
.btn-ghost{background:rgba(255,255,255,.7);box-shadow:inset 0 0 0 1px var(--line-2);color:var(--ink)}
.btn-ghost:hover{background:#fff}
.btn-blue{background:var(--blue);color:#fff;padding:13px 26px;font-size:15px;box-shadow:0 10px 28px rgba(0,120,208,.32)}
.btn-blue:hover{background:var(--blue-2)}
.btn-lg{padding:13px 26px;font-size:15px}

.hero{position:relative;padding:0;min-height:calc(100vh - 64px);display:flex;align-items:center}
.hero::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;-webkit-mask-image:linear-gradient(#000 75%,transparent);mask-image:linear-gradient(#000 75%,transparent);
  background:linear-gradient(90deg,rgba(238,243,248,.98) 0,rgba(238,243,248,.94) calc(50% - 40px),rgba(238,243,248,0) calc(50% + 160px))}
.hero .wrap{width:100%}
.hero-copy{max-width:540px;padding:40px 0}
.hero .eyebrow{justify-content:flex-start}
.hero .eyebrow::before{display:none}
.hero .wordmark{font-size:clamp(46px,7.4vw,96px)}
.hero .lead{margin:24px 0 0;font-size:18px}
.hero .cta-row{justify-content:flex-start}
.cue{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;font:400 12px var(--mono);letter-spacing:.06em;color:var(--soft)}
.cue i{width:1px;height:34px;background:linear-gradient(var(--blue),transparent);animation:cue 1.8s ease-in-out infinite}
@keyframes cue{0%{transform:scaleY(.2);transform-origin:top}60%{transform:scaleY(1);transform-origin:top}100%{transform:scaleY(1);opacity:0}}
.win{display:none}
.eyebrow{display:flex;align-items:center;justify-content:center;gap:14px;font:400 14px var(--mono);letter-spacing:.04em;color:var(--muted);margin:0 0 22px}
.eyebrow::before,.eyebrow::after{content:"";height:1px;width:48px;background:linear-gradient(90deg,transparent,var(--line-2))}
.eyebrow::after{transform:scaleX(-1)}
.wordmark{margin:0;font:600 clamp(48px,10vw,124px)/1 var(--mark);letter-spacing:.01em;
  background:linear-gradient(180deg,#0b2545 15%,#0078d0 95%);-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{max-width:660px;margin:28px auto 0;font-size:19px;line-height:1.6;color:var(--text)}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:36px}

section.block{padding:120px 0 0}
.head{text-align:center;max-width:760px;margin:0 auto 52px}
.head h2,.h2{margin:0;font:500 clamp(32px,4.4vw,48px)/1.14 var(--display);letter-spacing:-.025em;color:var(--ink)}
.head p{margin:18px auto 0;max-width:640px;color:var(--muted);font-size:17px}
.kicker{display:inline-block;margin:0 0 14px;font:500 13px var(--mono);color:var(--blue);letter-spacing:.03em}

.card{border-radius:18px;padding:26px 24px;background:var(--card);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 0 0 1px var(--line),0 18px 40px rgba(11,37,69,.08)}
.card h3{margin:18px 0 8px;font:500 20px/1.25 var(--display);color:var(--ink);letter-spacing:-.01em}
.card p{margin:0;color:var(--muted);font-size:15px}
.ico{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:rgba(0,120,208,.08);box-shadow:inset 0 0 0 1px rgba(0,120,208,.18);flex:none}
.ico svg{width:24px;height:24px;stroke:var(--blue);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}

.steps{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;list-style:none;margin:0;padding:0;counter-reset:s}
.steps::before{content:"";position:absolute;top:30px;left:8%;right:8%;height:1px;background:var(--line-2)}
.steps li{position:relative;text-align:center;counter-increment:s}
.steps .ico{width:60px;height:60px;margin:0 auto;background:#fff}
.steps .n{display:block;margin-top:16px;font:400 12px var(--mono);color:var(--soft)}
.steps .n::before{content:counter(s,decimal-leading-zero)}
.steps h3{margin:6px 0;font:500 17px var(--display);color:var(--ink)}
.steps p{margin:0 auto;max-width:170px;font-size:14px;color:var(--muted)}

/* AI story */
.story{display:grid;gap:96px}
.chapter{display:grid;grid-template-columns:300px 1fr;gap:40px;align-items:start}
.chapter .label .num{font:500 13px var(--mono);color:var(--blue)}
.chapter .label h3{margin:8px 0 10px;font:500 30px/1.15 var(--display);color:var(--ink);letter-spacing:-.02em}
.chapter .label p{margin:0;color:var(--muted)}
.pain{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pain .card h4,.cost h4{margin:0 0 6px;font:500 18px/1.3 var(--display);color:var(--ink)}
.pain .card p,.cost p{margin:0;color:var(--muted);font-size:15px}
.cost{display:grid;grid-template-columns:1fr 1fr;border-radius:18px;overflow:hidden;box-shadow:0 0 0 1px var(--line);background:var(--card);backdrop-filter:blur(10px)}
.cost div{padding:24px 26px;border-top:1px solid var(--line)}
.cost div:nth-child(-n+2){border-top:0}
.cost div:nth-child(2n){border-left:1px solid var(--line)}
.cost h4{color:#b4432a}
.agents{display:grid;gap:10px}
details.agent{border-radius:16px;background:var(--card-2);box-shadow:0 0 0 1px var(--line),0 10px 26px rgba(11,37,69,.06);overflow:hidden}
details.agent summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:16px;padding:16px 20px}
details.agent summary::-webkit-details-marker{display:none}
details.agent summary .t{flex:1;min-width:0}
details.agent summary b{display:block;font:500 18px var(--display);color:var(--ink)}
details.agent summary span.s{display:block;color:var(--muted);font-size:14.5px}
details.agent summary .chev{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px var(--line-2);transition:transform .25s}
details.agent[open] summary .chev{transform:rotate(180deg)}
details.agent .body{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:4px 20px 20px 88px}
details.agent .body h5{margin:0 0 4px;font:500 12px var(--mono);color:var(--blue)}
details.agent .body p{margin:0;font-size:14.5px;color:var(--text)}
.st{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;font:500 12px var(--body);white-space:nowrap}
.st::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.st.live{background:rgba(22,150,110,.12);color:#11795a}
.st.pilot{background:rgba(0,120,208,.12);color:#0a63ad}
.st.dev{background:rgba(11,37,69,.07);color:var(--soft)}
.value{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.value .card h4{margin:14px 0 6px;font:500 18px var(--display);color:var(--ink)}
.value .card p{margin:0;font-size:14.5px;color:var(--muted)}
.how{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,1fr);gap:14px;counter-reset:h}
.how li{counter-increment:h;padding:18px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.how li::before{content:counter(h);display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--blue);color:#fff;font:600 13px var(--body);margin-bottom:10px}
.how li p{margin:0;font-size:14.5px;color:var(--text)}
.pilot{margin-top:56px;display:grid;grid-template-columns:1.1fr 1fr;gap:28px;align-items:center;border-radius:20px;padding:28px;background:linear-gradient(135deg,#0b2545,#0a4d8c);color:#e8f2fc;box-shadow:0 24px 50px rgba(11,37,69,.25)}
.pilot h4{margin:0 0 10px;font:500 26px/1.2 var(--display);color:#fff}
.pilot p{margin:0 0 18px;color:#c3d6ea}
.pilot .btn-blue{background:#fff;color:var(--ink);box-shadow:none}
.feed{display:grid;gap:10px}
.msg{border-radius:12px;padding:14px 16px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-size:14px;color:#dbe8f5}
.msg .who{font:400 12px var(--mono);color:#9fb7d1;margin-bottom:6px}
.msg .ai{margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,.2);color:#fff}
.msg .ai span{color:var(--sky)}

#contact{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px}
#contact .contact{width:100%}
.contact{display:grid;grid-template-columns:1fr 440px;gap:56px;align-items:start}
.contact .intro{color:var(--muted);font-size:17px;max-width:460px;margin:16px 0 32px}
dl.req{margin:0;display:grid;grid-template-columns:auto 1fr;gap:10px 24px;font-size:14.5px}
dl.req dt{color:var(--soft)}
dl.req dd{margin:0;color:var(--ink)}
.form{border-radius:20px;padding:30px;background:#fff;box-shadow:0 0 0 1px var(--line),0 24px 50px rgba(11,37,69,.12)}
.form h3{margin:0 0 4px;font:500 22px var(--display);color:var(--ink)}
.form .note{margin:0 0 20px;color:var(--muted);font-size:14px}
.form label{display:block;font-size:13px;font-weight:500;color:var(--text);margin:14px 0 6px}
.form input,.form textarea{width:100%;font:400 15px var(--body);color:var(--ink);background:#f5f8fb;border:0;border-radius:8px;padding:11px 12px;box-shadow:inset 0 0 0 1px var(--line-2);outline:none}
.form input:focus,.form textarea:focus{box-shadow:inset 0 0 0 1px var(--blue),0 0 0 3px rgba(0,120,208,.18)}
.form textarea{resize:vertical;min-height:96px}
.form .btn-blue{width:100%;margin-top:22px}

.port{min-height:95vh;display:flex;align-items:center;justify-content:center;text-align:center;padding-top:120px}
.port p{color:var(--muted);max-width:520px;margin:14px auto 0;font-size:17px}
footer{border-top:1px solid var(--line);background:rgba(238,243,248,.85);backdrop-filter:blur(10px)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding-top:28px;padding-bottom:32px;color:var(--soft);font-size:13.5px}

@media (max-width:1000px){
  nav.main a:not(.keep){display:none}
  .grid3{grid-template-columns:1fr 1fr}
  .steps{grid-template-columns:repeat(3,1fr);row-gap:36px}
  .steps::before{display:none}
  .chapter{grid-template-columns:1fr;gap:20px}
  .value,.how{grid-template-columns:1fr 1fr}
  .pilot,.contact{grid-template-columns:1fr}
  details.agent .body{grid-template-columns:1fr;padding-left:20px}
}
@media (max-width:640px){
  .wrap{padding:0 16px}
  .veil{display:none}
  /* phones: the journey shows through windows between solid sections */
  section.block,footer{background:rgba(238,243,248,.96)}
  section.block{padding-top:72px;padding-bottom:56px}
  #ai{background:none;padding-top:0}
  #ai .head,#ai .chapter,#ai .pilot{background:rgba(238,243,248,.96);margin-left:-16px;margin-right:-16px;padding:28px 16px}
  #ai .head{margin-bottom:0;padding-top:64px}
  #ai .story{gap:62vh}
  #ai .pilot{margin-top:0;background:linear-gradient(135deg,#0b2545,#0a4d8c);border-radius:0}
  #contact{min-height:0;padding:72px 0 56px}
  .win{display:block;height:64vh}
  .win-end{height:88vh}
  .hero{min-height:100svh;align-items:flex-end}
  .hero::before{-webkit-mask-image:none;mask-image:none;background:linear-gradient(0deg,rgba(238,243,248,1) 0,rgba(238,243,248,.97) 50%,rgba(238,243,248,0) 66%)}
  .hero-copy{padding:0 0 64px}
  .hero .wordmark{font-size:44px}
  .hero .lead{font-size:16px;margin-top:16px}
  .hero .cta-row{margin-top:24px}
  .cue{bottom:14px}
  .grid3,.pain,.value,.how{grid-template-columns:1fr}
  .cost{grid-template-columns:1fr}
  .cost div:nth-child(2n){border-left:0}
  .cost div:nth-child(2){border-top:1px solid var(--line)}
  .steps{grid-template-columns:1fr 1fr}
  details.agent summary .st{display:none}
  .form{padding:22px}
  dl.req{grid-template-columns:1fr;gap:2px}
  dl.req dd{margin-bottom:10px}
  .bar .btn-ghost{display:none}
}
"""

ICONS = {
 "bolt": '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
 "rail": '<path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10"/>',
 "gauge": '<path d="M12 14l4-4"/><path d="M3.5 16a9 9 0 1 1 17 0"/><circle cx="12" cy="14" r="1.2"/>',
 "gear": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
 "valve": '<path d="M3 9v6M21 9v6M3 12h6M15 12h6M9 8l6 8M15 8l-6 8M12 4v4M9 4h6"/>',
 "tool": '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
 "inbox": '<path d="M4 4h16v12H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
 "search": '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
 "doc": '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
 "pen": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
 "truck": '<path d="M2 7h11v9H2zM13 10h4l4 3v3h-8"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
 "box": '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 "mail": '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
 "bell": '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 "radar": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/><circle cx="12" cy="12" r="1"/>',
 "check": '<path d="M6 3h9l4 4v14H6z"/><path d="M9 14l2 2 4-4"/>',
 "log": '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 "speed": '<path d="M12 13l4-5"/><path d="M4 18a9 9 0 1 1 16 0"/>',
 "target": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
 "eye": '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 "brain": '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z"/>',
}
def ico(n): return f'<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[n]}</svg></span>'
CHEV = '<span class="chev"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="#0b2545" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
LOGO = '<svg width="18" height="32" viewBox="180 110 890 1780" aria-hidden="true"><path fill="#0078d0" d="M200 128 1048 612V812L370 1200V1475L200 1575V1105L870 713 370 422V610L530 713 200 905Z"/><path fill="#0078d0" d="M540 1300 1048 1012V1205L710 1400V1775L540 1872Z"/></svg>'

T = {
"ru": dict(
  lang="ru", alt="/en/", alt_label="EN",
  title="PRIME FLOW — поставки для промышленности и ИИ-агенты для закупок",
  desc="ООО «PRIME FLOW»: поставки оборудования, запчастей и материалов для энергетики, нефтегаза и железной дороги. Собственные ИИ-агенты для закупок крупных организаций.",
  nav=[("#lines","Что поставляем"),("#process","Как работаем"),("#ai","ИИ для закупок"),("#contact","Контакты")],
  nav_cta="Отправить заявку",
  eyebrow="Поставщик с собственной ИИ-системой, Ташкент", cue="листайте",
  lead="Поставляем оборудование, запчасти и материалы для энергетики, нефтегаза и железной дороги — и строим ИИ-агентов, которые снимают рутину с закупок крупных организаций.",
  cta1="Отправить заявку", cta2="ИИ для закупок",
  lines_h="Что мы поставляем", lines_p="Товары по спецификации заказчика — с документами, которые проходят приёмку.",
  lines=[("bolt","Электротехника и энергетика","Кабельная продукция, коммутационная аппаратура, щитовое оборудование и комплектующие для подстанций."),
         ("rail","Железнодорожная автоматика","Реле, оборудование СЦБ и комплектующие для систем сигнализации, централизации и блокировки."),
         ("gauge","КИПиА и приборы","Датчики, манометры, расходомеры, анализаторы и измерительные инструменты."),
         ("gear","Оборудование и запчасти","Насосы, компрессоры, редукторы и запасные части по каталожному номеру производителя."),
         ("valve","Трубопроводная арматура","Задвижки, краны, клапаны, фитинги и уплотнения для нефтегаза и промышленности."),
         ("tool","Инструменты, СИЗ и MRO","Инструмент, средства защиты, смазочные материалы и расходники для ежедневной работы объекта.")],
  proc_h="От заявки до склада", proc_p="Шесть шагов, на каждом — документ и ответственный. Вы всегда знаете, где сейчас ваш заказ.",
  steps=[("inbox","Заявка","Получаем ТЗ, объёмы и условия поставки."),("search","Подбор","Ищем производителей и сверяем спецификации."),("doc","Предложение","Цена, срок, Incoterms и документы."),("pen","Договор","Подписываем договор и размещаем заказ."),("truck","Логистика","Доставка, таможня и контроль сроков."),("box","Поставка","Передаём товар с полным пакетом документов.")],
  ai_kicker="ИИ для закупок крупных организаций",
  ai_h="Закупки, в которых решают люди, а рутину делает ИИ",
  ai_p="Мы поставщик и каждый день проходим тендеры крупных компаний изнутри. Поэтому строим ИИ-агентов, которые забирают у закупочных команд то, что отнимает больше всего времени и нервов.",
  ch=["Боль","Цена вопроса","Решение","Ценность"],
  pain_h="Знакомая картина", pain_p="Так выглядит обычный день закупочного отдела.",
  pain=[("Техзадания на десятки страниц","Специалист вручную вычитывает требования, переносит позиции в таблицы и сверяет их с предложениями поставщиков."),
        ("Документы, которые проверяют глазами","Сертификаты, паспорта, реквизиты, сроки действия — сотни мелочей, где одна пропущенная строка превращается в претензию."),
        ("Сроки, которые держатся в головах","Поставки, оплаты и ответы контрагентам отслеживаются по почте, в таблицах и личных напоминаниях."),
        ("Решения, которые трудно проследить","Почему выбран этот поставщик, кто согласовал и на каком основании — при проверке это собирают по частям.")],
  cost_h="Во что это обходится", cost_p="Рутина не выглядит дорогой, пока не посчитать последствия.",
  cost=[("Сорванные сроки","Одна просроченная поставка останавливает ремонт или производство и тянет за собой неустойки."),
        ("Повторные закупки","Ошибка в ТЗ или документах — и процедуру приходится проводить заново, теряя недели."),
        ("Риски и проверки","Непрозрачные решения создают почву для злоупотреблений и тяжёлых разговоров с аудиторами."),
        ("Выгорание команды","Сильные специалисты тратят день на копирование, а не на переговоры и экономию бюджета.")],
  sol_h="ИИ-агенты внутри вашего процесса", sol_p="Каждый агент закрывает одну задачу и отдаёт результат человеку на проверку. Нажмите на агента, чтобы увидеть подробности.",
  k_does="Что делает", k_human="За человеком", k_result="Результат",
  st={"live":"Работает","pilot":"Пилот","dev":"В разработке"},
  agents=[
    ("search","Разбор техзадания","Требования, позиции и риски — из ТЗ любого объёма","dev",
     "Читает ТЗ и приложения, выделяет позиции, количества, технические требования, сроки и риски, собирает черновик спецификации.","Проверяет черновик и решает, участвовать или закупать.","Первичный разбор не ждёт свободного специалиста."),
    ("check","Сверка документов","Сертификаты и паспорта против требований","dev",
     "Сопоставляет сертификаты, паспорта и декларации с требованиями ТЗ, проверяет сроки действия и реквизиты.","Разбирает только отмеченные расхождения.","Меньше ошибок, которые всплывают на приёмке."),
    ("radar","Мониторинг тендеров","Подходящие лоты — без ручного поиска","pilot",
     "Просматривает площадки, отбирает лоты по профилю, сумме и требованиям, присылает сводку утром и днём.","Решает, какие лоты брать в работу.","Подходящий лот не теряется в потоке."),
    ("doc","Генерация документов","КП, письма, накладные и акты из одной базы","live",
     "Собирает коммерческие предложения, письма, накладные и акты из единых данных — без ручного копирования.","Проверяет, подписывает и отправляет.","Одинаковые цифры и реквизиты во всех документах."),
    ("bell","Контроль сроков","Поставки, оплаты и ответы — под присмотром","live",
     "Следит за сроками поставок, оплат и ответов контрагентам, напоминает ответственным в Telegram и эскалирует просрочки.","Действует по эскалации.","Сроки не держатся в головах."),
    ("mail","Выжимка писем","Суть каждого письма за секунды","live",
     "Каждое входящее письмо получает краткое содержание: кто пишет, что просит и к какому сроку.","Отвечает по существу.","Почта разбирается быстрее, важное не теряется."),
    ("log","Журнал решений","Полный след каждой закупки","dev",
     "Записывает каждое действие агентов и людей: кто, что и когда решил, на основании каких данных.","Руководство и аудит видят историю целиком.","Прозрачность без отдельной бюрократии."),
  ],
  val_h="Что получает организация", val_p="Те же люди — но их время уходит на решения, а не на перепечатку.",
  value=[("speed","Скорость","Рутинные этапы выполняются сразу, а не в очереди к специалисту."),
         ("target","Точность","Данные берутся из одной базы и сверяются автоматически."),
         ("eye","Прозрачность","Полный след каждой закупки для руководства и аудита."),
         ("brain","Знания остаются","Правила и опыт команды зашиты в агентов и не уходят вместе с людьми.")],
  how_h="Как мы внедряем",
  how=["Разбираем ваш процесс и выбираем участок с самой большой рутиной.","Запускаем пилот на реальных данных вашей закупки.","Сравниваем метрики до и после: время, ошибки, сроки.","Масштабируем на другие участки и подразделения."],
  pilot_h="Сначала — на себе", pilot_p="PRIME FLOW — первый пользователь системы: агенты работают на нашем реальном потоке тендеров и поставок. Мы предлагаем клиентам только то, что проверили сами.",
  pilot_cta="Обсудить пилот",
  feed=[("Письмо заказчика · 09:42","Просим подтвердить срок поставки партии и приложить доверенность на получателя.","Заказчик просит подтвердить срок поставки и прислать доверенность."),
        ("Напоминание · 10:00","Договор: до планового срока поставки осталось 5 дней.","Товар в пути, таможенное оформление запланировано.")],
  ai_mark="ИИ-выжимка:",
  ct_h="Расскажите, что нужно", ct_p="Пришлите спецификацию на поставку или расскажите о закупочном процессе, который хотите ускорить.",
  req=[("Компания","ООО «PRIME FLOW»"),("ИНН","312556227"),("Банк","«ASIA ALLIANCE BANK» АТ, г. Ташкент"),("МФО","01095"),("Директор","Хамиджанов Эльбек Улугбекович"),("Почта",None),("Телефон","+998 90 995 05 99, +998 77 265 51 44"),("Адрес","Ташкент, Мирзо-Улугбекский р-н, МФЙ Алишеробод, ул. Жасорат, 174")],
  f_h="Заявка", f_note="Откроется письмо с заполненными полями — останется нажать «Отправить».",
  f_fields=[("name","Имя","text","Как к вам обращаться"),("company","Компания","text","Название организации"),("email","Почта","email","name@company.uz")],
  f_need="Что нужно", f_need_ph="Позиции и сроки поставки — или процесс, который хотите автоматизировать", f_btn="Отправить заявку",
  f_subject="Заявка — сайт primeflow.uz", f_labels=["Имя","Компания","Почта"],
  port_h="Груз в порту назначения", port_p="Поставка завершена: товар выгружен, документы переданы. Дальше — ваш следующий заказ.",
  foot="© 2026 ООО «PRIME FLOW». Ташкент, Узбекистан.",
),
"en": dict(
  lang="en", alt="/", alt_label="RU",
  title="PRIME FLOW — industrial supply and AI agents for procurement",
  desc="PRIME FLOW LLC supplies equipment, spare parts and materials to energy, oil & gas and railway companies in Uzbekistan, and builds AI agents for the procurement teams of large organisations.",
  nav=[("#lines","What we supply"),("#process","How we work"),("#ai","AI for procurement"),("#contact","Contact")],
  nav_cta="Send a request",
  eyebrow="A supplier with its own AI system, Tashkent", cue="scroll",
  lead="We supply equipment, spare parts and materials to energy, oil & gas and railway companies — and build AI agents that take the routine off the procurement teams of large organisations.",
  cta1="Send a request", cta2="AI for procurement",
  lines_h="What we supply", lines_p="Goods to the customer's specification — with documents that pass acceptance.",
  lines=[("bolt","Electrical & power","Cables, switchgear, panel equipment and components for substations."),
         ("rail","Railway signalling","Relays, signalling and interlocking equipment and components."),
         ("gauge","Instrumentation","Sensors, pressure gauges, flow meters, analysers and measuring tools."),
         ("gear","Machinery & spare parts","Pumps, compressors, gearboxes and spare parts by manufacturer part number."),
         ("valve","Valves & fittings","Gate valves, ball valves, fittings and seals for oil & gas and industry."),
         ("tool","Tools, PPE & MRO","Tools, protective equipment, lubricants and consumables a site runs on every day.")],
  proc_h="From request to warehouse", proc_p="Six steps, each with a document and an owner. You always know where your order is.",
  steps=[("inbox","Request","We receive the specification, volumes and terms."),("search","Sourcing","We find manufacturers and check specifications."),("doc","Offer","Price, lead time, Incoterms and documents."),("pen","Contract","We sign the contract and place the order."),("truck","Logistics","Shipping, customs and deadline control."),("box","Delivery","Goods handed over with full documentation.")],
  ai_kicker="AI for the procurement of large organisations",
  ai_h="Procurement where people decide and AI does the routine",
  ai_p="We are a supplier and go through the tenders of large companies every day. That is why we build AI agents that take the most time-consuming work off procurement teams.",
  ch=["The pain","The cost","The solution","The value"],
  pain_h="A familiar picture", pain_p="An ordinary day in a procurement department.",
  pain=[("Specifications dozens of pages long","A specialist reads requirements by hand, copies items into spreadsheets and checks them against supplier offers."),
        ("Documents checked by eye","Certificates, passports, company details, validity dates — hundreds of details where one missed line becomes a claim."),
        ("Deadlines kept in people's heads","Deliveries, payments and replies are tracked through email, spreadsheets and personal reminders."),
        ("Decisions that are hard to trace","Why this supplier, who approved it and on what basis — during an audit it is pieced together.")],
  cost_h="What it costs", cost_p="Routine does not look expensive until you count the consequences.",
  cost=[("Missed deadlines","One late delivery stops a repair or production line and brings penalties."),
        ("Repeat procurements","An error in a specification or document means running the procedure again and losing weeks."),
        ("Risk and audits","Opaque decisions invite abuse and difficult conversations with auditors."),
        ("Team burnout","Strong specialists spend the day copying instead of negotiating and saving budget.")],
  sol_h="AI agents inside your process", sol_p="Each agent handles one task and hands the result to a person for review. Click an agent to see the details.",
  k_does="What it does", k_human="Stays with people", k_result="Result",
  st={"live":"Live","pilot":"Pilot","dev":"In development"},
  agents=[
    ("search","Specification analysis","Requirements, items and risks from any specification","dev",
     "Reads the specification and attachments, extracts items, quantities, technical requirements, deadlines and risks, and drafts the bill of materials.","Reviews the draft and decides whether to bid or buy.","First-pass analysis never waits for a free specialist."),
    ("check","Document checks","Certificates and passports against requirements","dev",
     "Matches certificates, passports and declarations against the specification, checks validity dates and company details.","Reviews only the flagged mismatches.","Fewer errors surfacing at acceptance."),
    ("radar","Tender monitoring","Relevant lots without manual searching","pilot",
     "Scans tender platforms, shortlists lots by profile, value and requirements, and sends a summary morning and afternoon.","Decides which lots to pursue.","No relevant lot gets lost in the flow."),
    ("doc","Document generation","Offers, letters, waybills and acts from one database","live",
     "Builds commercial offers, letters, waybills and acceptance acts from a single data source — no manual copying.","Reviews, signs and sends.","Identical figures and details in every document."),
    ("bell","Deadline control","Deliveries, payments and replies under watch","live",
     "Tracks delivery, payment and reply deadlines, reminds owners in Telegram and escalates overdue items.","Acts on escalations.","Deadlines no longer live in people's heads."),
    ("mail","Email summaries","The point of every email in seconds","live",
     "Every incoming email gets a short summary: who writes, what they ask for and by when.","Replies on substance.","Mail is handled faster, nothing important is lost."),
    ("log","Decision log","A full trail of every procurement","dev",
     "Records every action of agents and people: who decided what, when and based on which data.","Management and auditors see the whole history.","Transparency without extra bureaucracy."),
  ],
  val_h="What your organisation gets", val_p="The same people — but their time goes to decisions, not retyping.",
  value=[("speed","Speed","Routine steps run immediately instead of waiting for a specialist."),
         ("target","Accuracy","Data comes from one database and is checked automatically."),
         ("eye","Transparency","A full trail of every procurement for management and audit."),
         ("brain","Knowledge stays","Team rules and experience live in the agents and do not leave with people.")],
  how_h="How we implement",
  how=["We map your process and pick the area with the most routine.","We run a pilot on real data from your procurement.","We compare before-and-after metrics: time, errors, deadlines.","We scale to other areas and departments."],
  pilot_h="We use it ourselves first", pilot_p="PRIME FLOW is the system's first user: the agents run on our real flow of tenders and deliveries. We only offer clients what we have tested ourselves.",
  pilot_cta="Discuss a pilot",
  feed=[("Customer email · 09:42","Please confirm the delivery date for the batch and attach a power of attorney for the consignee.","The customer asks to confirm the delivery date and send a power of attorney."),
        ("Reminder · 10:00","Contract: 5 days left until the planned delivery date.","Goods in transit, customs clearance scheduled.")],
  ai_mark="AI summary:",
  ct_h="Tell us what you need", ct_p="Send a supply specification or tell us about the procurement process you want to speed up.",
  req=[("Company","PRIME FLOW LLC"),("Tax ID (INN)","312556227"),("Bank","ASIA ALLIANCE BANK JSC, Tashkent"),("Bank code (MFO)","01095"),("Director","Elbek Khamidjonov"),("Email",None),("Phone","+998 90 995 05 99, +998 77 265 51 44"),("Address","174 Jasorat St, Alisherobod MFY, Mirzo Ulugbek district, Tashkent")],
  f_h="Request", f_note="An email opens with your details filled in — just press Send.",
  f_fields=[("name","Name","text","Your name"),("company","Company","text","Organisation"),("email","Email","email","name@company.com")],
  f_need="What do you need", f_need_ph="Items and delivery dates — or a process you want to automate", f_btn="Send a request",
  f_subject="Request — primeflow.uz", f_labels=["Name","Company","Email"],
  port_h="Cargo at the port of destination", port_p="Delivery complete: goods unloaded, documents handed over. Next up — your next order.",
  foot="© 2026 PRIME FLOW LLC. Tashkent, Uzbekistan.",
)}

def page(t):
    nav = "".join(f'<a href="{h}">{e(l)}</a>' for h, l in t["nav"])
    lines = "".join(f'<article class="card">{ico(i)}<h3>{e(h)}</h3><p>{e(p)}</p></article>' for i, h, p in t["lines"])
    steps = "".join(f'<li>{ico(i)}<span class="n"></span><h3>{e(h)}</h3><p>{e(p)}</p></li>' for i, h, p in t["steps"])
    pain = "".join(f'<div class="card"><h4>{e(h)}</h4><p>{e(p)}</p></div>' for h, p in t["pain"])
    cost = "".join(f'<div><h4>{e(h)}</h4><p>{e(p)}</p></div>' for h, p in t["cost"])
    agents = "".join(
        f'<details class="agent"><summary>{ico(i)}<span class="t"><b>{e(h)}</b><span class="s">{e(s)}</span></span>'
        f'<span class="st {k}">{e(t["st"][k])}</span>{CHEV}</summary>'
        f'<div class="body"><div><h5>{e(t["k_does"])}</h5><p>{e(d)}</p></div><div><h5>{e(t["k_human"])}</h5><p>{e(hm)}</p></div><div><h5>{e(t["k_result"])}</h5><p>{e(r)}</p></div></div></details>'
        for i, h, s, k, d, hm, r in t["agents"])
    value = "".join(f'<div class="card">{ico(i)}<h4>{e(h)}</h4><p>{e(p)}</p></div>' for i, h, p in t["value"])
    how = "".join(f"<li><p>{e(x)}</p></li>" for x in t["how"])
    feed = "".join(f'<div class="msg"><div class="who">{e(w)}</div>{e(m)}<div class="ai"><span>{e(t["ai_mark"])}</span> {e(a)}</div></div>' for w, m, a in t["feed"])
    req = "".join(f'<dt>{e(k)}</dt><dd>{f"<a href=\"mailto:{EMAIL}\">{EMAIL}</a>" if v is None else e(v)}</dd>' for k, v in t["req"])
    fields = "".join(f'<label for="f-{n}">{e(l)}</label><input id="f-{n}" name="{n}" type="{ty}" placeholder="{e(ph)}"{" required" if n == "email" else ""}>' for n, l, ty, ph in t["f_fields"])
    ch = t["ch"]
    def chapter(num, title, sub, body):
        return f'<div class="chapter"><div class="label"><span class="num">{num:02d} · {e(ch[num-1])}</span><h3>{e(title)}</h3><p>{e(sub)}</p></div><div>{body}</div></div>'
    how_block = f'<div class="value">{value}</div><h3 class="h2" style="font-size:26px;margin-top:40px">{e(t["how_h"])}</h3><ol class="how">{how}</ol>'
    return f"""<!doctype html>
<html lang="{t['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(t['title'])}</title>
<meta name="description" content="{e(t['desc'])}">
<meta name="theme-color" content="#eef3f8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="modulepreload" href="/vendor/three.module.min.js">
<link rel="alternate" hreflang="ru" href="https://primeflow.uz/">
<link rel="alternate" hreflang="en" href="https://primeflow.uz/en/">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500&family=Montserrat:wght@600&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<canvas id="flow" aria-hidden="true"></canvas><div class="veil" aria-hidden="true"></div>
<header><div class="wrap bar">
  <a class="brand" href="#top" aria-label="PRIME FLOW">{LOGO}<span>PRIME FLOW</span></a>
  <nav class="main" aria-label="Main">{nav}<a class="lang keep" href="{t['alt']}" hreflang="{t['alt_label'].lower()}">{t['alt_label']}</a></nav>
  <a class="btn btn-ghost" href="#contact">{e(t['nav_cta'])}</a>
</div></header>

<main id="top">
<section class="hero" id="intro"><div class="wrap"><div class="hero-copy">
  <p class="eyebrow">{e(t['eyebrow'])}</p>
  <h1 class="wordmark">PRIME FLOW</h1>
  <p class="lead">{e(t['lead'])}</p>
  <div class="cta-row"><a class="btn btn-blue" href="#contact">{e(t['cta1'])}</a><a class="btn btn-ghost btn-lg" href="#ai">{e(t['cta2'])}</a></div>
</div></div><div class="cue" aria-hidden="true">{e(t['cue'])}<i></i></div></section>
<div class="win" aria-hidden="true"></div>

<section class="block" id="lines"><div class="wrap">
  <div class="head"><h2>{e(t['lines_h'])}</h2><p>{e(t['lines_p'])}</p></div>
  <div class="grid3">{lines}</div>
</div></section>

<div class="win" aria-hidden="true"></div>
<section class="block" id="process"><div class="wrap">
  <div class="head"><h2>{e(t['proc_h'])}</h2><p>{e(t['proc_p'])}</p></div>
  <ol class="steps">{steps}</ol>
</div></section>

<div class="win" aria-hidden="true"></div>
<section class="block" id="ai"><div class="wrap">
  <div class="head"><span class="kicker">{e(t['ai_kicker'])}</span><h2>{e(t['ai_h'])}</h2><p>{e(t['ai_p'])}</p></div>
  <div class="story">
    {chapter(1, t['pain_h'], t['pain_p'], f'<div class="pain">{pain}</div>')}
    {chapter(2, t['cost_h'], t['cost_p'], f'<div class="cost">{cost}</div>')}
    {chapter(3, t['sol_h'], t['sol_p'], f'<div class="agents">{agents}</div>')}
    {chapter(4, t['val_h'], t['val_p'], how_block)}
  </div>
  <div class="pilot"><div><h4>{e(t['pilot_h'])}</h4><p>{e(t['pilot_p'])}</p><a class="btn btn-blue" href="#contact">{e(t['pilot_cta'])}</a></div><div class="feed" aria-hidden="true">{feed}</div></div>
</div></section>

<div class="win" aria-hidden="true"></div>
<section class="block" id="contact"><div class="wrap contact">
  <div><h2 class="h2">{e(t['ct_h'])}</h2><p class="intro">{e(t['ct_p'])}</p><dl class="req">{req}</dl></div>
  <form class="form" id="req-form">
    <h3>{e(t['f_h'])}</h3><p class="note">{e(t['f_note'])}</p>
    {fields}
    <label for="f-need">{e(t['f_need'])}</label><textarea id="f-need" name="need" placeholder="{e(t['f_need_ph'])}"></textarea>
    <button class="btn btn-blue" type="submit">{e(t['f_btn'])}</button>
  </form>
</div></section>
<div class="win win-end" aria-hidden="true"></div>
</main>

<footer><div class="wrap"><span>{e(t['foot'])}</span><span><a href="tel:+998909950599">+998 90 995 05 99</a> &nbsp; <a href="tel:+998772655144">+998 77 265 51 44</a> &nbsp; <a href="mailto:{EMAIL}">{EMAIL}</a></span></div></footer>

<script>
document.getElementById('req-form').addEventListener('submit', function (ev) {{
  ev.preventDefault();
  var f = ev.target, L = {t['f_labels']!r};
  var body = L[0] + ': ' + f.name.value + '\\n' + L[1] + ': ' + f.company.value + '\\n' + L[2] + ': ' + f.email.value + '\\n\\n' + f.need.value;
  window.location.href = 'mailto:{EMAIL}?subject=' + encodeURIComponent({t['f_subject']!r}) + '&body=' + encodeURIComponent(body);
}});
</script>
<script type="module" src="/flow3d.js"></script>
</body>
</html>
"""

FAVICON = LOGO.replace('width="18" height="32" ', '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
if os.path.isdir(OUT): shutil.rmtree(OUT)
os.makedirs(os.path.join(OUT, "en"))
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page(T["ru"]))
open(os.path.join(OUT, "en", "index.html"), "w", encoding="utf-8").write(page(T["en"]))
open(os.path.join(OUT, "favicon.svg"), "w", encoding="utf-8").write(FAVICON)
shutil.copy(os.path.join(ROOT, "flow3d.js"), os.path.join(OUT, "flow3d.js"))
for d in ("vendor", "img"): shutil.copytree(os.path.join(ROOT, d), os.path.join(OUT, d))
print("built")
