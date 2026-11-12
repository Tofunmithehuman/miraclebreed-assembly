"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Music2,
  HandHeart,
  Users,
  HeartHandshake,
  Smartphone,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ---- Content: edit freely ---- */
const times = [
  ["Sunday worship", "8:00 AM"],
  ["Bible study", "Wed 5:30 PM"],
  ["Prayer night", "Fri 6:00 PM"],
];
const links = [
  ["About", "about"],
  ["Ministries", "ministries"],
  ["Visit", "visit"],
];
const cards = [
  {
    tag: "Who we are",
    title: "A welcoming home for every family",
    img: "about",
  },
  {
    tag: "This Sunday",
    title: "Come as you are and worship with us at 8:00 AM",
    img: "worship",
    hot: true,
  },
  { tag: "Latest message", title: "Walking in Divine Favour", img: "sermon" },
];
const ministries = [
  {
    Icon: Music2,
    name: "Worship & choir",
    text: "Lifting the name of Jesus in song.",
    img: "choir",
  },
  {
    Icon: HandHeart,
    name: "Prayer",
    text: "Standing in the gap for one another.",
    img: "prayer",
  },
  {
    Icon: Users,
    name: "Youth & children",
    text: "Raising the next generation in faith.",
    img: "youth",
  },
  {
    Icon: HeartHandshake,
    name: "Outreach",
    text: "Serving our community with love.",
    img: "outreach",
  },
];

/* Splits text into per-character spans for the mask reveal */
const Split = ({ t, className = "" }: { t: string; className?: string }) => (
  <span className={className} aria-label={t}>
    {t.split(" ").map((w, i) => (
      <span
        key={i}
        aria-hidden
        className="inline-block overflow-hidden pb-[.12em] align-bottom"
      >
        {[...w].map((c, j) => (
          <span key={j} className="ch inline-block">
            {c}
          </span>
        ))}
        &nbsp;
      </span>
    ))}
  </span>
);

/* Phone gyroscope on mobile, pointer parallax on desktop */
type DOE = { requestPermission?: () => Promise<string> };
function useTilt(ref: React.RefObject<HTMLElement | null>) {
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6 });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6 });
    const c = gsap.utils.clamp(-10, 10);
    const gyro = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      ry(c(e.gamma / 3));
      rx(c((45 - e.beta) / 3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      ry((e.clientX / innerWidth - 0.5) * 14);
      rx(-(e.clientY / innerHeight - 0.5) * 14);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("deviceorientation", gyro);
    setAsk(
      typeof (DeviceOrientationEvent as unknown as DOE).requestPermission ===
        "function",
    );
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("deviceorientation", gyro);
    };
  }, [ref]);
  const enable = async () => {
    const r = await (
      DeviceOrientationEvent as unknown as DOE
    ).requestPermission?.();
    if (r === "granted") setAsk(false);
  };
  return { ask, enable };
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const { ask, enable } = useTilt(bg);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".ld", { display: "none" });
        return;
      }
      gsap.set(".ch", { yPercent: 110 });
      gsap.set("[data-clip]", { clipPath: "inset(100% 0 0 0)" });
      gsap.set("[data-clip] img", { scale: 1.35 });

      // 1. Loader counter, then curtain lifts into the hero
      const n = { v: 0 };
      gsap
        .timeline()
        .to(n, {
          v: 100,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            const el = document.querySelector(".ld-n");
            if (el) el.textContent = String(Math.round(n.v));
          },
        })
        .to(".ld", { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
        .from(".hero-card", { y: 80, duration: 1.1, ease: "expo.out" }, "<0.2")
        .to(
          ".hero .ch",
          { yPercent: 0, duration: 1, stagger: 0.03, ease: "expo.out" },
          "<0.3",
        )
        .from(
          ".hero-in",
          { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 },
          "<0.3",
        );

      // 2. Hero card settles back as you scroll
      gsap.to(".hero-card", {
        scale: 0.94,
        borderRadius: 56,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Image curtains open + inner zoom settles
      gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 85%" } })
          .to(el, {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.2,
            ease: "expo.out",
          })
          .to(
            el.querySelector("img"),
            { scale: 1, duration: 1.6, ease: "expo.out" },
            0,
          );
      });

      // 4. Headline character reveals
      gsap.utils.toArray<HTMLElement>(".split").forEach((el) =>
        gsap.to(el.querySelectorAll(".ch"), {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.02,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }),
      );

      // 5. Ministry cards rise in a scrubbed stagger
      gsap.from(".mini", {
        yPercent: 40,
        opacity: 0,
        stagger: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: ".mini-wrap",
          start: "top 80%",
          end: "top 25%",
          scrub: true,
        },
      });

      // 6. Marquee speeds up with scroll velocity
      const mq = gsap.to(".mq", {
        xPercent: -50,
        repeat: -1,
        duration: 28,
        ease: "none",
      });
      ScrollTrigger.create({
        onUpdate: (s) => {
          mq.timeScale(1 + Math.abs(s.getVelocity()) / 250);
          gsap.to(mq, { timeScale: 1, duration: 0.8, overwrite: true });
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const pill = "rounded-full border border-ink/15 px-3 py-1 text-xs";

  return (
    <div ref={root} className="overflow-x-clip">
      {/* Loader */}
      <div className="ld fixed inset-0 z-50 grid place-items-center bg-ink text-white">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            className="size-14 rounded-full bg-white p-1"
          />
          <span className="font-display text-xl font-medium">
            Miracle Breed Assembly
          </span>
        </div>
        <span className="ld-n absolute bottom-8 right-8 text-7xl font-light tabular-nums">
          0
        </span>
      </div>

      {/* Hero */}
      <header className="hero p-3">
        <div className="hero-card relative h-[92svh] min-h-[600px] overflow-hidden rounded-[2rem] bg-black">
          <div
            ref={bg}
            className="absolute inset-0 scale-125 will-change-transform"
          >
            <img
              src="/hero.jpg"
              alt=""
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
          </div>

          <nav className="hero-in absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5 text-white md:px-8">
            <a href="#" className="flex items-center gap-2 font-medium">
              <img
                src="/logo.png"
                alt=""
                className="size-9 rounded-full bg-white p-0.5"
              />
              Miracle Breed Assembly
            </a>
            <ul className="hidden gap-8 text-sm md:flex">
              {links.map(([l, id]) => (
                <li key={id}>
                  <a href={`#${id}`}>{l}</a>
                </li>
              ))}
            </ul>
            <a
              href="#visit"
              className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink"
            >
              Join us
            </a>
          </nav>

          <div className="absolute inset-x-0 bottom-10 z-10 px-6 text-white md:bottom-32 md:px-12">
            <h1 className="font-display max-w-3xl text-5xl font-medium leading-[1.05] md:text-7xl">
              <Split t="Where faith meets miracles" />
            </h1>
            <div className="hero-in mt-6 flex items-center gap-2">
              <a
                href="#visit"
                className="rounded-full bg-gold px-6 py-3 font-medium text-ink"
              >
                Plan your visit
              </a>
              <span className="grid size-12 place-items-center rounded-full bg-gold text-ink">
                <ArrowUpRight size={20} />
              </span>
            </div>
          </div>

          <ul className="hero-in absolute inset-x-12 bottom-5 z-10 hidden gap-2 md:grid md:grid-cols-3">
            {times.map(([a, b], i) => (
              <li
                key={a}
                className={`flex items-center justify-between rounded-2xl px-5 py-4 text-sm backdrop-blur-md ${i === 0 ? "bg-white text-ink" : "bg-white/25 text-white"}`}
              >
                <span>{a}</span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Three feature cards */}
      <section
        id="about"
        className="grid gap-4 px-3 py-20 md:grid-cols-3 md:px-12 md:py-28"
      >
        {cards.map((c) => (
          <article
            key={c.title}
            className={`flex min-h-[440px] gap-6 rounded-[1.75rem] p-5 ${c.hot ? "flex-col-reverse justify-between bg-gold" : "flex-col justify-between bg-paper"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={pill}>{c.tag}</span>
                <h3 className="font-display mt-4 max-w-xs text-xl font-medium">
                  {c.title}
                </h3>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                <ArrowUpRight size={16} />
              </span>
            </div>
            <div
              data-clip
              className="h-56 overflow-hidden rounded-2xl bg-ink/10"
            >
              <img
                src={`/images/${c.img}.jpg`}
                alt=""
                className="size-full object-cover"
              />
            </div>
          </article>
        ))}
      </section>

      {/* Velocity marquee */}
      <div className="overflow-hidden border-y border-ink/10 py-6">
        <div className="mq font-display flex w-max text-5xl font-medium md:text-7xl">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center gap-8 pr-8">
              {["Worship", "Prayer", "Family", "Outreach", "Faith"].map(
                (w, i) => (
                  <span key={w} className="flex items-center gap-8">
                    {w}
                    <i
                      className={`size-4 rounded-full ${["bg-blue", "bg-gold", "bg-leaf"][i % 3]}`}
                    />
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ministries */}
      <section
        id="ministries"
        className="mx-3 mt-20 rounded-[2rem] bg-paper px-5 py-24 md:px-12"
      >
        <div className="text-center">
          <span className={pill}>Ministries</span>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-4xl font-medium md:text-5xl">
            <Split className="split" t="Faith that grows and serves together" />
          </h2>
        </div>
        <div className="mini-wrap mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ministries.map(({ Icon, name, text, img }) => (
            <article
              key={name}
              className="mini relative aspect-[3/4] overflow-hidden rounded-3xl bg-ink"
            >
              <img
                src={`/images/${img}.jpg`}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
              <span className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-gold text-ink">
                <Icon size={20} />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-display text-xl font-medium">{name}</h3>
                <p className="mt-1 text-sm text-white/75">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Visit + wordmark footer */}
      <footer
        id="visit"
        className="mt-3 overflow-hidden rounded-t-[2rem] bg-ink p-6 pb-0 text-white md:p-12 md:pb-0"
      >
        <div className="grid gap-10 md:grid-cols-2">
          <h2 className="font-display text-4xl font-medium md:text-6xl">
            <Split
              className="split"
              t="Come as you are. There is a seat for you."
            />
          </h2>
          <ul className="space-y-3 md:w-96 md:justify-self-end">
            {times.map(([a, b]) => (
              <li
                key={a}
                className="flex justify-between border-b border-white/15 pb-3"
              >
                <span>{a}</span>
                <span className="text-gold">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="font-display mt-16 select-none whitespace-nowrap text-[12vw] font-semibold leading-[0.9] tracking-tight">
          <Split className="split" t="Miracle Breed" />
        </p>
      </footer>

      {ask && (
        <button
          onClick={enable}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-blue px-4 py-3 text-sm text-white shadow-lg"
        >
          <Smartphone size={16} /> Enable motion
        </button>
      )}
    </div>
  );
}
