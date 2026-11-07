"""Builds the PRIME FLOW site: /index.html (RU) and /en/index.html (EN)."""
import os, html

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "dist")
EMAIL = "info@primeflow.uz"

CSS = r"""
:root{
  --canvas:#05060f; --steel:#2f343e; --ice:#d8ecf8; --frost:#d1e4fa; --moon:#c7d3ea; --fog:#9da7ba;
  --violet:#0078d0; --blueprint:#5cc8f7;
  --edge:rgba(186,215,247,.12); --edge-strong:rgba(186,215,247,.24);
  --glass:rgba(186,214,247,.03); --glass-2:rgba(186,214,247,.06);
  --display:'Space Grotesk',system-ui,sans-serif; --mark:'Montserrat','Space Grotesk',sans-serif; --body:'Inter',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--canvas);color:var(--frost);font:400 16px/1.5 var(--body);letter-spacing:-.01em;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--blueprint);outline-offset:3px;border-radius:6px}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}

/* blueprint grid */
.grid-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;
  background-image:linear-gradient(rgba(186,215,247,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(186,215,247,.055) 1px,transparent 1px);
  background-size:88px 88px;mask-image:radial-gradient(ellipse 80% 70% at 50% 20%,#000 30%,transparent 85%)}

/* header */
header{position:sticky;top:0;z-index:20;background:rgba(5,6,15,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--edge)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{display:flex;align-items:center;gap:10px;font:600 15px var(--mark);letter-spacing:.06em;color:#fff}
.brand svg{flex:none}
nav.main{display:flex;gap:4px;align-items:center}
nav.main a{padding:8px 12px;font-size:14px;color:var(--moon);border-radius:999px}
nav.main a:hover{color:var(--ice);background:var(--glass-2)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font:500 14px var(--body);padding:8px 16px;border:0;cursor:pointer;white-space:nowrap}
.btn-ghost{background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px var(--edge);color:#fff}
.btn-ghost:hover{background:rgba(186,214,247,.12)}
.btn-violet{background:var(--violet);color:#fff;padding:12px 24px;font-size:15px;box-shadow:0 0 0 1px rgba(255,255,255,.1) inset,0 8px 32px rgba(0,120,208,.45)}
.btn-violet:hover{background:#0a88e6}
.btn-lg{padding:12px 24px;font-size:15px}
.lang{font:400 13px var(--mono);color:var(--fog);padding:8px 10px}
.lang:hover{color:var(--ice)}

/* hero */
.hero{position:relative;text-align:center;padding:96px 0 40px;overflow:hidden}
.halo{position:absolute;left:50%;top:-140px;width:900px;height:620px;transform:translateX(-50%);z-index:-1;
  background:conic-gradient(from 180deg at 50% 0%,transparent 0deg,rgba(0,120,208,.45) 160deg,rgba(92,200,247,.5) 180deg,rgba(0,120,208,.45) 200deg,transparent 360deg);
  filter:blur(60px);opacity:.55;mask-image:radial-gradient(ellipse at top,#000 20%,transparent 70%)}
.eyebrow{display:flex;align-items:center;justify-content:center;gap:16px;font:400 14px var(--mono);letter-spacing:.06em;color:var(--moon);margin:0 0 24px}
.eyebrow::before,.eyebrow::after{content:"";height:1px;width:56px;background:linear-gradient(90deg,transparent,rgba(186,215,247,.3))}
.eyebrow::after{transform:scaleX(-1)}
.wordmark{margin:0;font:600 clamp(52px,11vw,148px)/1 var(--mark);letter-spacing:.01em;
  background:linear-gradient(180deg,#eef8ff 10%,#5cc8f7 95%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 6px rgba(92,200,247,.35)) drop-shadow(0 0 28px rgba(0,120,208,.35))}
.lead{max-width:640px;margin:28px auto 0;font-size:19px;line-height:1.55;color:var(--moon)}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:36px}

/* fanned glass documents */
.stage{position:relative;height:400px;margin:72px auto 0;max-width:1040px;perspective:1600px}
.doc{position:absolute;top:0;width:320px;border-radius:16px;padding:24px;text-align:left;
  background:linear-gradient(180deg,rgba(18,22,38,.92),rgba(7,8,18,.96));
  box-shadow:inset 0 1px 0 rgba(216,236,248,.2),inset 0 24px 48px rgba(168,216,245,.06),0 16px 32px rgba(0,0,0,.45),0 0 0 1px var(--edge)}
.doc.l{left:0;transform:rotate(-7deg) translateY(46px);opacity:.82}
.doc.r{right:0;transform:rotate(7deg) translateY(46px);opacity:.82}
.doc.c{left:50%;width:380px;transform:translateX(-50%);z-index:2}
.doc h4{margin:0 0 4px;font:500 17px var(--display);color:var(--ice);letter-spacing:-.01em}
.doc .sub{font:400 12px var(--mono);color:var(--fog);margin-bottom:18px}
.row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid rgba(186,215,247,.07);font-size:13.5px;color:var(--moon)}
.row b{font-weight:500;color:var(--frost)}
.badge{display:inline-block;margin-top:16px;padding:4px 8px;border-radius:6px;background:rgba(199,211,234,.12);color:var(--frost);font:500 12px var(--body)}
.badge.ok{background:rgba(38,150,132,.18);color:#9fe3d4}
.track{list-style:none;margin:0;padding:0}
.track li{position:relative;padding:0 0 14px 26px;font-size:13.5px;color:var(--fog)}
.track li::before{content:"";position:absolute;left:4px;top:5px;width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--fog)}
.track li::after{content:"";position:absolute;left:8px;top:16px;bottom:-2px;width:1px;background:rgba(186,215,247,.14)}
.track li:last-child::after{display:none}
.track li.done{color:var(--frost)}
.track li.done::before{background:var(--blueprint);box-shadow:none}
.track li.now{color:#fff}
.track li.now::before{background:var(--violet);box-shadow:0 0 0 4px rgba(0,120,208,.3)}
.track small{display:block;font:400 11.5px var(--mono);color:var(--fog);margin-top:2px}
.check{list-style:none;margin:0;padding:0}
.check li{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid rgba(186,215,247,.07);font-size:13.5px;color:var(--moon)}
.tick{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:rgba(92,200,247,.16)}
.tick.wait{background:transparent;box-shadow:inset 0 0 0 1px var(--edge-strong)}

/* sections */
section.block{padding:120px 0 0}
.head{text-align:center;max-width:720px;margin:0 auto 56px}
.head h2{margin:0;font:500 clamp(32px,4.4vw,48px)/1.14 var(--display);letter-spacing:-.025em;
  background:linear-gradient(180deg,#d8ecf8,#a9c9ef);-webkit-background-clip:text;background-clip:text;color:transparent}
.head p{margin:18px auto 0;max-width:620px;color:var(--fog);font-size:17px}

.lines{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.card{border-radius:16px;padding:28px 24px;background:var(--glass);
  box-shadow:inset 0 1px 0 rgba(199,211,234,.12),inset 0 24px 48px rgba(199,211,234,.05),0 24px 32px rgba(6,6,14,.7),0 0 0 1px rgba(186,215,247,.06)}
.card h3{margin:20px 0 8px;font:500 20px/1.25 var(--display);color:var(--ice);letter-spacing:-.01em}
.card p{margin:0;color:var(--fog);font-size:15px}
.ico{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px var(--edge)}
.ico svg{width:26px;height:26px;stroke:var(--blueprint);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}

/* process */
.steps{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;list-style:none;margin:0;padding:0;counter-reset:s}
.steps::before{content:"";position:absolute;top:32px;left:8%;right:8%;height:1px;background:linear-gradient(90deg,transparent,rgba(186,215,247,.28) 12%,rgba(186,215,247,.28) 88%,transparent)}
.steps li{position:relative;text-align:center;counter-increment:s}
.steps .ico{width:64px;height:64px;margin:0 auto;background:#0a0d1c}
.steps .n{display:block;margin-top:18px;font:400 12px var(--mono);color:var(--fog)}
.steps .n::before{content:counter(s,decimal-leading-zero)}
.steps h3{margin:6px 0 6px;font:500 17px var(--display);color:var(--ice)}
.steps p{margin:0 auto;max-width:170px;font-size:14px;color:var(--fog)}

/* principles */
.princ{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-radius:16px;box-shadow:0 0 0 1px var(--edge);overflow:hidden}
.princ div{padding:36px 32px;background:var(--glass)}
.princ div+div{box-shadow:-1px 0 0 var(--edge)}
.princ h3{margin:0 0 10px;font:500 21px/1.25 var(--display);color:var(--ice)}
.princ p{margin:0;color:var(--fog);font-size:15px}

/* system */
.sys{display:grid;grid-template-columns:1.05fr 1fr;gap:48px;align-items:center}
.sys .copy h2{margin:0 0 18px;font:500 clamp(30px,3.8vw,44px)/1.14 var(--display);letter-spacing:-.025em;color:var(--ice)}
.sys .copy p{color:var(--fog);font-size:17px;margin:0 0 16px}
.sys ul{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:12px}
.sys li{display:flex;gap:12px;color:var(--moon);font-size:15.5px}
.sys li::before{content:"";flex:none;width:6px;height:6px;margin-top:9px;border-radius:50%;background:var(--blueprint);box-shadow:0 0 10px var(--blueprint)}
.frame{border-radius:16px;overflow:hidden;background:#080a16;box-shadow:inset 0 1px 0 rgba(216,236,248,.16),0 0 0 1px var(--edge),0 32px 64px rgba(0,0,0,.5)}
.frame .top{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid var(--edge)}
.frame .top i{width:9px;height:9px;border-radius:50%;background:var(--steel)}
.feed{padding:20px;display:grid;gap:12px}
.msg{border-radius:12px;padding:14px 16px;background:rgba(186,214,247,.045);box-shadow:inset 0 0 0 1px rgba(186,215,247,.08);font-size:14px;color:var(--moon)}
.msg .who{font:400 12px var(--mono);color:var(--fog);margin-bottom:6px}
.msg .ai{margin-top:10px;padding-top:10px;border-top:1px dashed rgba(186,215,247,.14);color:var(--frost)}
.msg .ai span{color:var(--blueprint)}

/* contact */
.contact{display:grid;grid-template-columns:1fr 440px;gap:56px;align-items:start}
.contact h2{margin:0 0 16px;font:500 clamp(32px,4.4vw,48px)/1.12 var(--display);letter-spacing:-.025em;
  background:linear-gradient(180deg,#eef8ff,#5cc8f7);-webkit-background-clip:text;background-clip:text;color:transparent}
.contact .intro{color:var(--fog);font-size:17px;max-width:460px;margin:0 0 36px}
dl.req{margin:0;display:grid;grid-template-columns:auto 1fr;gap:10px 24px;font-size:14.5px}
dl.req dt{color:var(--fog)}
dl.req dd{margin:0;color:var(--frost)}
.form{border-radius:16px;padding:32px;background:rgba(5,6,15,.97);
  box-shadow:inset 0 1px 0 rgba(216,236,248,.2),inset 0 24px 48px rgba(168,216,245,.06),0 16px 32px rgba(0,0,0,.3),0 0 0 1px var(--edge)}
.form h3{margin:0 0 4px;font:500 22px var(--display);color:var(--ice)}
.form .note{margin:0 0 22px;color:var(--fog);font-size:14px}
.form label{display:block;font-size:13px;font-weight:500;color:var(--moon);margin:14px 0 6px}
.form input,.form textarea{width:100%;font:400 15px var(--body);color:#fff;background:rgba(199,211,234,.06);border:0;border-radius:6px;padding:11px 12px;box-shadow:inset 0 0 0 1px var(--edge);outline:none}
.form input:focus,.form textarea:focus{box-shadow:inset 0 0 0 1px var(--edge-strong),0 0 0 3px rgba(0,120,208,.3)}
.form textarea{resize:vertical;min-height:96px}
.form ::placeholder{color:rgba(199,211,234,.55)}
.form .btn-violet{width:100%;margin-top:22px;border-radius:999px}

footer{margin-top:120px;border-top:1px solid var(--edge)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding-top:32px;padding-bottom:40px;color:var(--fog);font-size:13.5px}

/* load moment: documents settle into the fan */
@media (prefers-reduced-motion:no-preference){
  .doc{animation:settle 1.1s cubic-bezier(.2,.8,.2,1) both}
  .doc.c{animation-name:settle-c;animation-delay:.05s}
  .doc.l{animation-delay:.18s}.doc.r{animation-delay:.26s}
  @keyframes settle{from{opacity:0;transform:rotate(0) translateY(90px)}}
  @keyframes settle-c{from{opacity:0;transform:translateX(-50%) translateY(70px)}}
}

@media (max-width:960px){
  nav.main a:not(.keep){display:none}
  .lines{grid-template-columns:1fr 1fr}
  .steps{grid-template-columns:repeat(3,1fr);row-gap:40px}
  .steps::before{display:none}
  .princ{grid-template-columns:1fr}
  .princ div+div{box-shadow:0 -1px 0 var(--edge)}
  .sys,.contact{grid-template-columns:1fr}
  .stage{height:auto;display:flex;flex-direction:column;gap:16px;align-items:center}
  .doc,.doc.c,.doc.l,.doc.r{position:relative;left:auto;right:auto;transform:none;opacity:1;width:100%;max-width:420px;animation:none}
  .doc.l,.doc.r{display:none}
}
@media (max-width:600px){
  .wrap{padding:0 16px}
  .hero{padding-top:64px}
  .lines{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr 1fr}
  .form{padding:24px}
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
}
def ico(name): return f'<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg></span>'
TICK = '<span class="tick"><svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" stroke="#5cc8f7" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
WAIT = '<span class="tick wait"></span>'
LOGO = '<svg width="18" height="32" viewBox="180 110 890 1780" aria-hidden="true"><path fill="#0078d0" d="M200 128 1048 612V812L370 1200V1475L200 1575V1105L870 713 370 422V610L530 713 200 905Z"/><path fill="#0078d0" d="M540 1300 1048 1012V1205L710 1400V1775L540 1872Z"/></svg>'

T = {
"ru": dict(
  lang="ru", path="/", alt_path="/en/", alt_label="EN",
  title="PRIME FLOW — поставки оборудования и материалов для промышленности Узбекистана",
  desc="ООО «PRIME FLOW»: поставки электротехники, железнодорожной автоматики, КИПиА, оборудования, запчастей и MRO для энергетики, нефтегаза и железной дороги — по тендерам и прямым договорам.",
  nav=[("#lines","Что поставляем"),("#process","Как работаем"),("#system","Наша система"),("#contact","Контакты")],
  nav_cta="Отправить заявку",
  eyebrow="Поставщик промышленных товаров, Ташкент",
  lead="Поставляем оборудование, запчасти и материалы для энергетики, нефтегаза и железной дороги — по тендерам и прямым договорам, с полным пакетом документов.",
  cta1="Отправить заявку", cta2="Что мы поставляем",
  kp=dict(h="Коммерческое предложение", sub="Лот · поставка товаров", rows=[("Позиций","24"),("Срок поставки","45 дней"),("Условия","DAP Ташкент"),("Оплата","по договору")], badge="Готово к подаче"),
  tr=dict(h="Поставка по договору", sub="Отслеживание этапов", steps=[("done","Заказ размещён у производителя",""),("done","Производство и приёмка",""),("now","В пути","таможенное оформление на следующем шаге"),("","Таможня",""),("","Доставка на склад заказчика","")]),
  qd=dict(h="Документы качества", sub="Сверка с техническим заданием", items=[(1,"Сертификат соответствия"),(1,"Паспорт изделия"),(1,"Сертификат происхождения"),(1,"Упаковочный лист"),(0,"Акт приёма-передачи")]),
  lines_h="Что мы поставляем", lines_p="Товары по спецификации заказчика: оригинальные позиции или равноценные аналоги — с документами, которые пройдут приёмку.",
  lines=[("bolt","Электротехника и энергетика","Кабельная продукция, коммутационная аппаратура, щитовое оборудование и комплектующие для подстанций."),
         ("rail","Железнодорожная автоматика","Реле, оборудование СЦБ и комплектующие для систем сигнализации, централизации и блокировки."),
         ("gauge","КИПиА и приборы","Датчики, манометры, расходомеры, анализаторы и измерительные инструменты."),
         ("gear","Оборудование и запчасти","Насосы, компрессоры, редукторы и запасные части по каталожному номеру производителя."),
         ("valve","Трубопроводная арматура","Задвижки, краны, клапаны, фитинги и уплотнения для нефтегаза и промышленности."),
         ("tool","Инструменты, СИЗ и MRO","Инструмент, средства защиты, смазочные материалы и расходники для ежедневной работы объекта.")],
  proc_h="От заявки до склада", proc_p="Шесть шагов, на каждом — документ и ответственный. Вы всегда знаете, где сейчас ваш заказ.",
  steps=[("inbox","Заявка","Получаем ТЗ, объёмы и условия поставки."),("search","Подбор","Ищем производителей и сверяем спецификации."),("doc","Предложение","Одна цена, срок, Incoterms и документы."),("pen","Договор","Подписываем договор и размещаем заказ."),("truck","Логистика","Доставка, таможня и контроль сроков."),("box","Поставка","Передаём товар с полным пакетом документов.")],
  pr_h="Как мы работаем с аналогами и ценой", pr_p="Правила, которые мы не меняем от лота к лоту.",
  princ=[("Оригинал там, где это критично","Для технологически сложного, проектного и влияющего на безопасность оборудования поставляем только оригинал."),
         ("Аналог — только равного уровня","Для простых позиций предлагаем равноценный аналог от проверенного производителя, чтобы снизить стоимость, а не качество."),
         ("Одно предложение — одна цена","Подаём одно предложение с окончательной ценой. После подачи цена не меняется.")],
  sys_h="Каждый лот проходит через нашу систему", sys_p1="Мы перевели работу с тендерами и договорами в единую цифровую систему: реестры лотов и договоров, генераторы документов, контроль сроков и уведомления.",
  sys_p2="Рутину берут на себя ИИ-агенты, решения остаются за специалистами.",
  sys_li=["Разбор технического задания и сверка документов качества","Коммерческие предложения, накладные и акты — из одних данных, без ручного копирования","Напоминания о сроках поставки и ответах заказчику","Краткая выжимка каждого входящего письма"],
  feed=[("Письмо заказчика · 09:42","Просим подтвердить срок поставки партии и приложить доверенность на получателя.","Заказчик просит подтвердить срок поставки и прислать доверенность."),
        ("Напоминание · 10:00","Договор: до планового срока поставки осталось 5 дней.","Статус: товар в пути, таможенное оформление запланировано.")],
  ai_mark="ИИ-выжимка:",
  ct_h="Расскажите, что нужно поставить", ct_p="Пришлите спецификацию или перечень позиций — ответим коммерческим предложением.",
  req=[("Компания","ООО «PRIME FLOW»"),("ИНН","312556227"),("Банк","«ASIA ALLIANCE BANK» АТ, г. Ташкент"),("МФО","01095"),("Директор","Хамиджанов Эльбек Улугбекович"),("Почта",None),("Телефон","+998 90 995 05 99, +998 77 265 51 44"),("Адрес","Ташкент, Мирзо-Улугбекский р-н, МФЙ Алишеробод, ул. Жасорат, 174")],
  f_h="Заявка на поставку", f_note="Откроется письмо с заполненными полями — останется нажать «Отправить».",
  f_fields=[("name","Имя","text","Как к вам обращаться"),("company","Компания","text","Название организации"),("email","Почта","email","name@company.uz")],
  f_need="Что нужно поставить", f_need_ph="Позиции, количество, сроки — или приложите ТЗ к письму", f_btn="Отправить заявку",
  f_subject="Заявка на поставку — сайт primeflow.uz", f_labels=["Имя","Компания","Почта"],
  foot="© 2026 ООО «PRIME FLOW». Ташкент, Узбекистан.",
),
"en": dict(
  lang="en", path="/en/", alt_path="/", alt_label="RU",
  title="PRIME FLOW — industrial equipment and materials supply in Uzbekistan",
  desc="PRIME FLOW LLC supplies electrical equipment, railway signalling, instrumentation, machinery, spare parts and MRO to energy, oil & gas and railway companies in Uzbekistan — through tenders and direct contracts.",
  nav=[("#lines","What we supply"),("#process","How we work"),("#system","Our system"),("#contact","Contact")],
  nav_cta="Send a request",
  eyebrow="Industrial supplier, Tashkent",
  lead="We supply equipment, spare parts and materials to energy, oil & gas and railway companies — through tenders and direct contracts, with a complete set of documents.",
  cta1="Send a request", cta2="What we supply",
  kp=dict(h="Commercial offer", sub="Tender lot · goods supply", rows=[("Items","24"),("Lead time","45 days"),("Terms","DAP Tashkent"),("Payment","per contract")], badge="Ready to submit"),
  tr=dict(h="Contract delivery", sub="Stage tracking", steps=[("done","Order placed with manufacturer",""),("done","Production and inspection",""),("now","In transit","customs clearance is next"),("","Customs",""),("","Delivery to customer warehouse","")]),
  qd=dict(h="Quality documents", sub="Checked against the specification", items=[(1,"Certificate of conformity"),(1,"Product passport"),(1,"Certificate of origin"),(1,"Packing list"),(0,"Acceptance certificate")]),
  lines_h="What we supply", lines_p="Goods to the customer's specification: original items or equivalent alternatives — with documents that pass acceptance.",
  lines=[("bolt","Electrical & power","Cables, switchgear, panel equipment and components for substations."),
         ("rail","Railway signalling","Relays, signalling and interlocking equipment and components."),
         ("gauge","Instrumentation","Sensors, pressure gauges, flow meters, analysers and measuring tools."),
         ("gear","Machinery & spare parts","Pumps, compressors, gearboxes and spare parts by manufacturer part number."),
         ("valve","Valves & fittings","Gate valves, ball valves, fittings and seals for oil & gas and industry."),
         ("tool","Tools, PPE & MRO","Tools, protective equipment, lubricants and consumables a site runs on every day.")],
  proc_h="From request to warehouse", proc_p="Six steps, each with a document and an owner. You always know where your order is.",
  steps=[("inbox","Request","We receive the specification, volumes and terms."),("search","Sourcing","We find manufacturers and check specifications."),("doc","Offer","One price, lead time, Incoterms and documents."),("pen","Contract","We sign the contract and place the order."),("truck","Logistics","Shipping, customs and deadline control."),("box","Delivery","Goods handed over with full documentation.")],
  pr_h="How we handle alternatives and price", pr_p="Rules that stay the same from lot to lot.",
  princ=[("Original where it matters","For technologically complex, project-specific and safety-critical equipment we supply the original only."),
         ("Alternatives of equal grade only","For simple items we offer an equivalent from a proven manufacturer — to cut cost, not quality."),
         ("One offer, one price","We submit one offer with a final price. It does not change after submission.")],
  sys_h="Every lot runs through our own system", sys_p1="We moved tenders and contracts into one digital system: lot and contract registries, document generators, deadline control and notifications.",
  sys_p2="AI agents take the routine; specialists keep the decisions.",
  sys_li=["Specification analysis and quality-document checks","Offers, waybills and acceptance acts generated from one data source","Reminders for delivery deadlines and customer replies","A short summary of every incoming customer email"],
  feed=[("Customer email · 09:42","Please confirm the delivery date for the batch and attach a power of attorney for the consignee.","The customer asks to confirm the delivery date and send a power of attorney."),
        ("Reminder · 10:00","Contract: 5 days left until the planned delivery date.","Status: goods in transit, customs clearance scheduled.")],
  ai_mark="AI summary:",
  ct_h="Tell us what you need supplied", ct_p="Send a specification or item list — we reply with a commercial offer.",
  req=[("Company","PRIME FLOW LLC"),("Tax ID (INN)","312556227"),("Bank","ASIA ALLIANCE BANK JSC, Tashkent"),("Bank code (MFO)","01095"),("Director","Elbek Khamidjonov"),("Email",None),("Phone","+998 90 995 05 99, +998 77 265 51 44"),("Address","174 Jasorat St, Alisherobod MFY, Mirzo Ulugbek district, Tashkent")],
  f_h="Supply request", f_note="An email opens with your details filled in — just press Send.",
  f_fields=[("name","Name","text","Your name"),("company","Company","text","Organisation"),("email","Email","email","name@company.com")],
  f_need="What do you need", f_need_ph="Items, quantities, deadlines — or attach the specification to the email", f_btn="Send a request",
  f_subject="Supply request — primeflow.uz", f_labels=["Name","Company","Email"],
  foot="© 2026 PRIME FLOW LLC. Tashkent, Uzbekistan.",
)}

e = html.escape
def page(t):
    nav = "".join(f'<a href="{h}">{e(l)}</a>' for h, l in t["nav"])
    kp = t["kp"]; tr = t["tr"]; qd = t["qd"]
    kp_rows = "".join(f'<div class="row"><span>{e(a)}</span><b>{e(b)}</b></div>' for a, b in kp["rows"])
    tr_li = "".join(f'<li class="{c}">{e(a)}{f"<small>{e(s)}</small>" if s else ""}</li>' for c, a, s in tr["steps"])
    qd_li = "".join(f'<li>{TICK if ok else WAIT}{e(x)}</li>' for ok, x in qd["items"])
    lines = "".join(f'<article class="card">{ico(i)}<h3>{e(h)}</h3><p>{e(p)}</p></article>' for i, h, p in t["lines"])
    steps = "".join(f'<li>{ico(i)}<span class="n"></span><h3>{e(h)}</h3><p>{e(p)}</p></li>' for i, h, p in t["steps"])
    princ = "".join(f'<div><h3>{e(h)}</h3><p>{e(p)}</p></div>' for h, p in t["princ"])
    sys_li = "".join(f"<li>{e(x)}</li>" for x in t["sys_li"])
    feed = "".join(f'<div class="msg"><div class="who">{e(w)}</div>{e(m)}<div class="ai"><span>{e(t["ai_mark"])}</span> {e(a)}</div></div>' for w, m, a in t["feed"])
    req = "".join(f'<dt>{e(k)}</dt><dd>{f"<a href=\"mailto:{EMAIL}\">{EMAIL}</a>" if v is None else e(v)}</dd>' for k, v in t["req"])
    fields = "".join(f'<label for="f-{n}">{e(l)}</label><input id="f-{n}" name="{n}" type="{ty}" placeholder="{e(ph)}"{" required" if n=="email" else ""}>' for n, l, ty, ph in t["f_fields"])
    labels = t["f_labels"]
    return f"""<!doctype html>
<html lang="{t['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(t['title'])}</title>
<meta name="description" content="{e(t['desc'])}">
<meta name="theme-color" content="#05060f">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" hreflang="ru" href="https://primeflow.uz/">
<link rel="alternate" hreflang="en" href="https://primeflow.uz/en/">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@400;500&family=Montserrat:wght@600&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<div class="grid-bg" aria-hidden="true"></div>
<header><div class="wrap bar">
  <a class="brand" href="#top" aria-label="PRIME FLOW">{LOGO}<span>PRIME FLOW</span></a>
  <nav class="main" aria-label="Main">{nav}<a class="lang keep" href="{t['alt_path']}" hreflang="{t['alt_label'].lower()}">{t['alt_label']}</a></nav>
  <a class="btn btn-ghost" href="#contact">{e(t['nav_cta'])}</a>
</div></header>

<main id="top">
<section class="hero"><div class="halo" aria-hidden="true"></div><div class="wrap">
  <p class="eyebrow">{e(t['eyebrow'])}</p>
  <h1 class="wordmark">PRIME FLOW</h1>
  <p class="lead">{e(t['lead'])}</p>
  <div class="cta-row"><a class="btn btn-violet" href="#contact">{e(t['cta1'])}</a><a class="btn btn-ghost btn-lg" href="#lines">{e(t['cta2'])}</a></div>
  <div class="stage" aria-hidden="true">
    <div class="doc l"><h4>{e(kp['h'])}</h4><div class="sub">{e(kp['sub'])}</div>{kp_rows}<span class="badge ok">{e(kp['badge'])}</span></div>
    <div class="doc c"><h4>{e(tr['h'])}</h4><div class="sub">{e(tr['sub'])}</div><ul class="track">{tr_li}</ul></div>
    <div class="doc r"><h4>{e(qd['h'])}</h4><div class="sub">{e(qd['sub'])}</div><ul class="check">{qd_li}</ul></div>
  </div>
</div></section>

<section class="block" id="lines"><div class="wrap">
  <div class="head"><h2>{e(t['lines_h'])}</h2><p>{e(t['lines_p'])}</p></div>
  <div class="lines">{lines}</div>
</div></section>

<section class="block" id="process"><div class="wrap">
  <div class="head"><h2>{e(t['proc_h'])}</h2><p>{e(t['proc_p'])}</p></div>
  <ol class="steps">{steps}</ol>
</div></section>

<section class="block"><div class="wrap">
  <div class="head"><h2>{e(t['pr_h'])}</h2><p>{e(t['pr_p'])}</p></div>
  <div class="princ">{princ}</div>
</div></section>

<section class="block" id="system"><div class="wrap sys">
  <div class="copy"><h2>{e(t['sys_h'])}</h2><p>{e(t['sys_p1'])}</p><p>{e(t['sys_p2'])}</p><ul>{sys_li}</ul></div>
  <div class="frame" aria-hidden="true"><div class="top"><i></i><i></i><i></i></div><div class="feed">{feed}</div></div>
</div></section>

<section class="block" id="contact"><div class="wrap contact">
  <div><h2>{e(t['ct_h'])}</h2><p class="intro">{e(t['ct_p'])}</p><dl class="req">{req}</dl></div>
  <form class="form" id="req-form">
    <h3>{e(t['f_h'])}</h3><p class="note">{e(t['f_note'])}</p>
    {fields}
    <label for="f-need">{e(t['f_need'])}</label><textarea id="f-need" name="need" placeholder="{e(t['f_need_ph'])}"></textarea>
    <button class="btn btn-violet" type="submit">{e(t['f_btn'])}</button>
  </form>
</div></section>
</main>

<footer><div class="wrap"><span>{e(t['foot'])}</span><span><a href="tel:+998909950599">+998 90 995 05 99</a> &nbsp; <a href="tel:+998772655144">+998 77 265 51 44</a> &nbsp; <a href="mailto:{EMAIL}">{EMAIL}</a></span></div></footer>

<script>
document.getElementById('req-form').addEventListener('submit', function (ev) {{
  ev.preventDefault();
  var f = ev.target, L = {labels!r};
  var body = L[0] + ': ' + f.name.value + '\\n' + L[1] + ': ' + f.company.value + '\\n' + L[2] + ': ' + f.email.value + '\\n\\n' + f.need.value;
  window.location.href = 'mailto:{EMAIL}?subject=' + encodeURIComponent({t['f_subject']!r}) + '&body=' + encodeURIComponent(body);
}});
</script>
</body>
</html>
"""

FAVICON = LOGO.replace('width="18" height="32" ', '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')

os.makedirs(os.path.join(OUT, "en"), exist_ok=True)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page(T["ru"]))
open(os.path.join(OUT, "en", "index.html"), "w", encoding="utf-8").write(page(T["en"]))
open(os.path.join(OUT, "favicon.svg"), "w", encoding="utf-8").write(FAVICON)
print("built")
