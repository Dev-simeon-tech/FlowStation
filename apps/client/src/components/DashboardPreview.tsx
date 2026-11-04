export default function DashboardPreview() {
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
