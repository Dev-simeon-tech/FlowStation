import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
// import { Button } from "./button";

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  );
}

function MenuIcon({ close = false }: { close?: boolean }) {
  return close ? (
    <svg
      aria-hidden='true'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  ) : (
    <svg
      aria-hidden='true'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M4 6h16M4 12h16M4 18h16' />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "dark" ? (
    <svg
      aria-hidden='true'
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='4' />
      <path d='M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42' />
    </svg>
  ) : (
    <svg
      aria-hidden='true'
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.463.402.807a6.5 6.5 0 0 0 8.268 8.268c.344-.215.829-.003.803.397Z' />
    </svg>
  );
}

const navigation = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

function DashboardPreview() {
  return (
    <div
      aria-label='FlowStation dashboard preview'
      className='relative mx-auto w-full max-w-5xl'
    >
      <div
        aria-hidden='true'
        className='absolute -inset-x-10 -top-14 -z-10 h-72 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.22),transparent_68%)] blur-2xl'
      />
      <div className='overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#111311] dark:shadow-[0_32px_100px_rgba(0,0,0,0.65)]'>
        <div className='flex items-center justify-between border-b border-black/10 px-4 py-3 sm:px-6 dark:border-white/10'>
          <div className='flex items-center gap-3'>
            <div className='grid size-8 place-items-center rounded-lg bg-emerald-400 text-sm font-bold text-black'>
              F
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                FlowStation
              </p>
              <p className='text-xs text-gray-500 dark:text-white/40'>
                Operations overview
              </p>
            </div>
          </div>
          <span className='rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300'>
            Live overview
          </span>
        </div>

        <div className='grid gap-5 p-4 sm:p-6 md:grid-cols-[1.4fr_0.8fr]'>
          <div className='space-y-5'>
            <div>
              <p className='text-xs text-gray-500 dark:text-white/40'>
                Thursday, October 29
              </p>
              <h2 className='mt-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white'>
                Good morning, Station Manager
              </h2>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {[
                {
                  label: "Today’s revenue",
                  value: "₦ 2,486,500",
                  change: "+12.8%",
                },
                { label: "Litres sold", value: "8,420 L", change: "+6.4%" },
                { label: "Transactions", value: "146", change: "Today" },
                {
                  label: "Active products",
                  value: "4",
                  change: "All available",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className='rounded-xl border border-black/[0.07] bg-gray-50 p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.03]'
                >
                  <p className='text-[11px] text-gray-500 sm:text-xs dark:text-white/45'>
                    {item.label}
                  </p>
                  <p className='mt-2 text-base font-semibold tracking-tight text-gray-900 sm:text-xl dark:text-white'>
                    {item.value}
                  </p>
                  <p className='mt-1 text-[10px] text-emerald-700 sm:text-xs dark:text-emerald-300'>
                    {item.change}
                  </p>
                </div>
              ))}
            </div>
            <div className='rounded-xl border border-black/[0.07] bg-gray-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]'>
              <div className='mb-5 flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    Revenue trend
                  </p>
                  <p className='mt-1 text-xs text-gray-500 dark:text-white/40'>
                    Last seven days
                  </p>
                </div>
                <span className='text-xs text-gray-500 dark:text-white/45'>
                  This week
                </span>
              </div>
              <div className='flex h-24 items-end gap-2 sm:h-32 sm:gap-3'>
                {[42, 64, 51, 82, 59, 96, 73].map((height, index) => (
                  <div
                    key={index}
                    className='flex flex-1 items-end'
                    style={{ height: "100%" }}
                  >
                    <div
                      className={`w-full rounded-t-md ${
                        index === 5 ? "bg-emerald-300" : "bg-emerald-400/30"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className='mt-2 flex justify-between text-[10px] text-gray-400 dark:text-white/35'>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-black/[0.07] bg-gray-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  Fuel stock
                </p>
                <p className='mt-1 text-xs text-gray-500 dark:text-white/40'>
                  Current balance
                </p>
              </div>
              <span className='text-xs text-emerald-700 dark:text-emerald-300'>
                View all
              </span>
            </div>
            <div className='space-y-5'>
              {[
                {
                  name: "Petrol",
                  amount: "12,450 L",
                  percent: 76,
                  color: "bg-emerald-300",
                },
                {
                  name: "Diesel",
                  amount: "8,200 L",
                  percent: 54,
                  color: "bg-sky-300",
                },
                {
                  name: "Kerosene",
                  amount: "3,680 L",
                  percent: 34,
                  color: "bg-amber-300",
                },
              ].map((fuel) => (
                <div key={fuel.name}>
                  <div className='mb-2 flex items-center justify-between text-xs'>
                    <span className='text-gray-700 dark:text-white/75'>
                      {fuel.name}
                    </span>
                    <span className='text-gray-500 dark:text-white/45'>
                      {fuel.amount}
                    </span>
                  </div>
                  <div className='h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10'>
                    <div
                      className={`h-full rounded-full ${fuel.color}`}
                      style={{ width: `${fuel.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-7 border-t border-black/[0.08] pt-5 dark:border-white/[0.08]'>
              <p className='text-xs font-medium text-gray-900 dark:text-white'>
                Recent activity
              </p>
              <div className='mt-4 space-y-4'>
                {[
                  {
                    name: "Sale recorded",
                    time: "2 minutes ago",
                    amount: "+₦ 45,000",
                  },
                  {
                    name: "Stock delivery",
                    time: "38 minutes ago",
                    amount: "+5,000 L",
                  },
                  {
                    name: "Sale recorded",
                    time: "1 hour ago",
                    amount: "+₦ 32,500",
                  },
                ].map((item, index) => (
                  <div
                    key={`${item.name}-${item.time}`}
                    className='flex items-center gap-3'
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${
                        index === 1
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"
                      }`}
                    >
                      {index === 1 ? "↓" : "↑"}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs text-gray-700 dark:text-white/75'>
                        {item.name}
                      </p>
                      <p className='mt-0.5 text-[10px] text-gray-400 dark:text-white/35'>
                        {item.time}
                      </p>
                    </div>
                    <span className='text-[10px] text-gray-600 dark:text-white/65'>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowStationLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className='min-h-screen overflow-hidden bg-[#fbfaf7] font-sans text-gray-900 selection:bg-emerald-300 selection:text-black dark:bg-[#080a08] dark:text-white'>
      <header className='fixed inset-x-0 top-0 z-50 border-b border-black/[0.08] bg-[#fbfaf7]/90 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#080a08]/85'>
        <nav
          aria-label='Main navigation'
          className='mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8'
        >
          <a
            href='#home'
            className='flex items-center gap-2.5'
            aria-label='FlowStation home'
          >
            <img
              src='/favicon.png'
              alt=''
              width={28}
              height={28}
              className='invert dark:invert-0'
            />
            <span className='text-base font-semibold tracking-tight'>
              FlowStation
            </span>
          </a>

          <div className='hidden items-center gap-8 md:flex'>
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className='text-sm text-gray-600 transition-colors hover:text-gray-950 dark:text-white/55 dark:hover:text-white'
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className='hidden items-center gap-3 md:flex'>
            <button
              type='button'
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className='grid size-9 place-items-center rounded-lg border border-black/10 text-gray-700 transition hover:border-emerald-500/30 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-emerald-200'
            >
              <ThemeIcon theme={theme} />
            </button>
            {user ? (
              <>
                <Link
                  to='/dashboard'
                  className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black shadow-[0_0_18px_rgba(16,185,129,0.14)] ring-1 ring-emerald-500/15 transition hover:bg-emerald-50 hover:shadow-[0_0_26px_rgba(16,185,129,0.25)] dark:hover:bg-emerald-100'
                >
                  Go to Dashboard <ArrowRight className='size-4' />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className='rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-950 dark:text-white/75 dark:hover:text-white'
                >
                  Sign in
                </Link>
                <Link
                  to='/register'
                  className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black shadow-[0_0_18px_rgba(16,185,129,0.14)] ring-1 ring-emerald-500/15 transition hover:bg-emerald-50 hover:shadow-[0_0_26px_rgba(16,185,129,0.25)] dark:hover:bg-emerald-100'
                >
                  Get started <ArrowRight className='size-4' />
                </Link>
              </>
            )}
          </div>

          <button
            type='button'
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className='grid size-9 place-items-center rounded-lg border border-black/10 text-gray-700 transition hover:border-emerald-500/30 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-emerald-200 md:hidden'
          >
            <ThemeIcon theme={theme} />
          </button>

          <button
            type='button'
            className='grid size-10 place-items-center rounded-lg text-gray-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/5 md:hidden'
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls='mobile-navigation'
          >
            <MenuIcon close={mobileMenuOpen} />
          </button>
        </nav>

        {mobileMenuOpen && (
          <div
            id='mobile-navigation'
            className='animate-[fadeInUp_0.2s_ease-out_both] border-t border-black/10 bg-[#fbfaf7] px-5 py-5 dark:border-white/10 dark:bg-[#080a08] md:hidden'
          >
            <div className='mx-auto flex max-w-7xl flex-col gap-1'>
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className='rounded-lg px-3 py-3 text-sm text-gray-600 hover:bg-black/5 hover:text-gray-950 dark:text-white/65 dark:hover:bg-white/5 dark:hover:text-white'
                >
                  {item.label}
                </a>
              ))}
              <div className='mt-3 flex gap-3 border-t border-black/10 pt-4 dark:border-white/10'>
                {user ? (
                  <Link
                    to='/dashboard'
                    className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black shadow-[0_0_18px_rgba(16,185,129,0.14)] ring-1 ring-emerald-500/15 transition hover:bg-emerald-50 hover:shadow-[0_0_26px_rgba(16,185,129,0.25)] dark:hover:bg-emerald-100'
                  >
                    Go to Dashboard <ArrowRight className='size-4' />
                  </Link>
                ) : (
                  <>
                    <Link
                      to='/login'
                      onClick={() => setMobileMenuOpen(false)}
                      className='flex-1 rounded-lg border border-black/15 px-4 py-2.5 text-center text-sm text-gray-700 dark:border-white/15 dark:text-white/80'
                    >
                      Sign in
                    </Link>
                    <Link
                      to='/register'
                      onClick={() => setMobileMenuOpen(false)}
                      className='flex-1 rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-black shadow-[0_0_18px_rgba(16,185,129,0.14)] ring-1 ring-emerald-500/15'
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <section id='home' className='relative px-5 pb-20 pt-32 sm:px-8 sm:pt-40'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 top-0 -z-0 h-[540px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.10),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]'
        />
        <div className='relative z-10 mx-auto max-w-5xl text-center'>
          <div className='mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-500/[0.08] px-4 py-2 text-xs text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/[0.07] dark:text-emerald-100/80'>
            <span className='size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-300' />
            Built for modern fuel stations
          </div>
          <h1 className='mx-auto max-w-4xl text-balance text-4xl font-medium leading-[1.08] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-7xl dark:text-white'>
            Run your station.
            <br />
            <span className='bg-gradient-to-b from-gray-950 via-gray-800 to-gray-500 bg-clip-text text-transparent dark:from-white dark:via-white dark:to-white/45'>
              Know every detail.
            </span>
          </h1>
          <p className='mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-gray-600 sm:text-lg sm:leading-8 dark:text-white/50'>
            Sales, stock, attendants, and daily performance in one clear view.
            Spend less time chasing numbers and more time growing your business.
          </p>
          <div className='mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Link
              to='/register'
              className='inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black shadow-[0_0_22px_rgba(16,185,129,0.16)] ring-1 ring-emerald-500/15 transition hover:scale-[1.02] hover:bg-emerald-50 hover:shadow-[0_0_30px_rgba(16,185,129,0.28)] active:scale-[0.98] dark:hover:bg-emerald-100'
            >
              Register your station <ArrowRight />
            </Link>
            <Link
              to='/login'
              className='inline-flex h-12 items-center justify-center rounded-lg border border-black/15 px-6 text-sm font-medium text-gray-700 transition hover:border-emerald-600/30 hover:bg-emerald-50 hover:text-gray-950 dark:border-white/15 dark:text-white/80 dark:hover:border-white/30 dark:hover:bg-white/[0.04] dark:hover:text-white'
            >
              Sign in to your account
            </Link>
          </div>
          <p className='mt-4 text-xs text-gray-500 dark:text-white/35'>
            Simple station management, from your first sale onward.
          </p>
        </div>

        <div className='relative z-10 mx-auto mt-16 max-w-6xl sm:mt-20'>
          <DashboardPreview />
        </div>
      </section>

      <section id='features' className='px-5 py-20 sm:px-8 sm:py-28'>
        <div className='mx-auto max-w-6xl'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300'>
              One view. Better decisions.
            </p>
            <h2 className='mt-4 text-3xl font-medium tracking-tight text-gray-950 sm:text-5xl dark:text-white'>
              Everything your station needs to keep flowing.
            </h2>
            <p className='mt-5 text-base leading-7 text-gray-600 dark:text-white/50'>
              Keep daily operations connected, organized, and easy to
              understand.
            </p>
          </div>

          <div className='mt-12 grid gap-4 md:grid-cols-3'>
            {[
              {
                number: "01",
                title: "Sales you can trust",
                description:
                  "Record transactions, track payment methods, and see how your station is performing today.",
              },
              {
                number: "02",
                title: "Stock under control",
                description:
                  "Follow fuel balances, log deliveries, and understand what is moving across your products.",
              },
              {
                number: "03",
                title: "A team on the same page",
                description:
                  "Manage attendants and customers while keeping station activity and reporting in one place.",
              },
            ].map((feature) => (
              <article
                key={feature.number}
                className='rounded-2xl border border-black/[0.09] bg-white p-6 transition-colors hover:border-emerald-500/30 hover:bg-emerald-50 sm:p-8 dark:border-white/[0.09] dark:bg-white/[0.025] dark:hover:border-emerald-300/25 dark:hover:bg-white/[0.04]'
              >
                <span className='text-xs font-medium tracking-widest text-emerald-700 dark:text-emerald-300/70'>
                  {feature.number}
                </span>
                <h3 className='mt-8 text-lg font-medium text-gray-900 dark:text-white'>
                  {feature.title}
                </h3>
                <p className='mt-3 text-sm leading-6 text-gray-600 dark:text-white/45'>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id='how-it-works' className='px-5 pb-24 pt-8 sm:px-8 sm:pb-32'>
        <div className='mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-3xl border border-black/10 bg-gradient-to-br from-white to-gray-100 p-7 sm:p-12 md:flex-row md:items-center dark:border-white/10 dark:from-white/[0.06] dark:to-white/[0.015]'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300'>
              Get started
            </p>
            <h2 className='mt-4 text-3xl font-medium tracking-tight text-gray-950 sm:text-4xl dark:text-white'>
              Bring your station operations together.
            </h2>
            <p className='mt-4 text-sm leading-6 text-gray-600 sm:text-base dark:text-white/50'>
              Create your station account and get a clearer picture of your
              day-to-day business.
            </p>
          </div>
          <Link
            to='/register'
            className='inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black shadow-[0_0_22px_rgba(16,185,129,0.16)] ring-1 ring-emerald-500/15 transition hover:bg-emerald-50 hover:shadow-[0_0_30px_rgba(16,185,129,0.28)] dark:hover:bg-emerald-100'
          >
            Create an account <ArrowRight />
          </Link>
        </div>
      </section>

      <footer className='border-t border-black/[0.08] px-5 py-7 sm:px-8 dark:border-white/[0.08]'>
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-500 sm:flex-row dark:text-white/35'>
          <span>© {new Date().getFullYear()} FlowStation</span>
          <div className='flex items-center gap-5'>
            <Link
              className='transition hover:text-gray-900 dark:hover:text-white/70'
              to='/login'
            >
              Sign in
            </Link>
            <Link
              className='transition hover:text-gray-900 dark:hover:text-white/70'
              to='/register'
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
