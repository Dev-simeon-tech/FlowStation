import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { CreateSaleSchema, type CreateSaleInput } from "@flowstation/schemas";
import { PAYMENT_METHODS } from "../constants";
import type {
  FuelSale,
  FuelProduct,
  Attendant,
  Customer,
} from "@flowstation/types";
import NumberInput from "../components/NumberInput";
import { apiFetch } from "../lib/api";
import { Select } from "../components/ui/select";

export default function Sales() {
  useEffect(() => {
    document.title = "Sales / FlowStation";
  }, []);
  const [tab, setTab] = useState<"sale" | "payments">("sale");
  const [sales, setSales] = useState<FuelSale[]>([]);
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<z.input<typeof CreateSaleSchema>, unknown, CreateSaleInput>({
    resolver: zodResolver(CreateSaleSchema),
    defaultValues: {
      fuelProductId: "",
      attendantId: "",
      customerId: "",
      litresSold: "",
      paymentMethod: "CASH",
    },
  });

  function loadAll(signal?: AbortSignal) {
    setLoading(true);
    Promise.all([
      apiFetch<FuelProduct[]>("/api/products"),
      apiFetch<Attendant[]>("/api/attendants"),
      apiFetch<Customer[]>("/api/customers"),
      apiFetch<FuelSale[]>("/api/sales"),
    ])
      .then(([prods, atts, custs, salesData]) => {
        if (signal?.aborted) return;
        setProducts(prods);
        setAttendants(atts);
        setCustomers(custs);
        setSales(salesData);
      })
      .catch((e) => {
        if (!signal?.aborted) setError(e.message);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ctrl = new AbortController();
    loadAll(ctrl.signal);
    return () => ctrl.abort();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function onSubmit(values: CreateSaleInput) {
    setSubmitting(true);
    setError("");
    try {
      const sale = await apiFetch<FuelSale>("/api/sales/new", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSales((prev) => [sale, ...prev]);
      const product = products.find((p) => p.id === values.fuelProductId);
      setMessage(
        `Sale recorded: ${values.litresSold.toLocaleString()}L${product ? ` of ${product.name}` : ""} for &#8358;${sale.totalAmount.toLocaleString()}`,
      );
      reset({
        fuelProductId: "",
        attendantId: "",
        customerId: "",
        litresSold: "",
        paymentMethod: "CASH",
      });
      setTimeout(() => setMessage(""), 5000);
    } catch (e) {
      // console.log(e.message);
      setError(e instanceof Error ? e.message : "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className='topBar'>
        <div className='header'>
          <h1>Sales</h1>
          <p>Record sales and view payment history</p>
        </div>
        <div className='tabs'>
          <button
            className={`tab ${tab === "sale" ? "tabActive" : ""}`}
            onClick={() => setTab("sale")}
          >
            New Sale
          </button>
          <button
            className={`tab ${tab === "payments" ? "tabActive" : ""}`}
            onClick={() => setTab("payments")}
          >
            Payments
          </button>
        </div>
      </div>

      {message && (
        <div
          className='card'
          style={{
            background: "#0d2817",
            border: "1px solid var(--accent)",
            marginBottom: 12,
          }}
        >
          <p
            style={{ color: "#3ecf8e" }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
      )}
      {error && (
        <p className='loginError text-base' style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {tab === "sale" && (
        <>
          <div className='card'>
            <h2>New Sale</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='formGrid'>
                <div className='formGroup'>
                  <label>Fuel Product</label>
                  <Controller
                    control={control}
                    name='fuelProductId'
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        aria-label='Fuel Product'
                        placeholder={
                          products.length === 0
                            ? "No products - add one first"
                            : "Select product..."
                        }
                        options={products.map((product) => ({
                          value: product.id,
                          label: `${product.name} (₦${product.pricePerLitre}/L)`,
                        }))}
                      />
                    )}
                  />
                  {fieldErrors.fuelProductId && (
                    <p className='loginError'>
                      {fieldErrors.fuelProductId.message}
                    </p>
                  )}
                </div>
                <div className='formGroup'>
                  <label>Attendant</label>
                  <Controller
                    control={control}
                    name='attendantId'
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        aria-label='Attendant'
                        placeholder={
                          attendants.some((attendant) => attendant.isActive)
                            ? "Select attendant..."
                            : "No active attendants"
                        }
                        options={attendants
                          .filter((attendant) => attendant.isActive)
                          .map((attendant) => ({
                            value: attendant.id,
                            label: `${attendant.fullName} (${attendant.employeeId})`,
                          }))}
                      />
                    )}
                  />
                  {fieldErrors.attendantId && (
                    <p className='loginError'>
                      {fieldErrors.attendantId.message}
                    </p>
                  )}
                </div>
                <div className='formGroup'>
                  <label>Customer (optional)</label>
                  <Controller
                    control={control}
                    name='customerId'
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        aria-label='Customer'
                        placeholder='Walk-in / Anonymous'
                        options={[
                          { value: "", label: "Walk-in / Anonymous" },
                          ...customers.map((customer) => ({
                            value: customer.id,
                            label: `${customer.fullName}${customer.plateNumber ? ` (${customer.plateNumber})` : ""}`,
                          })),
                        ]}
                      />
                    )}
                  />
                  {fieldErrors.customerId && (
                    <p className='loginError'>
                      {fieldErrors.customerId.message}
                    </p>
                  )}
                </div>
                <NumberInput
                  label='Litres Sold'
                  step='0.01'
                  min='0'
                  placeholder='0'
                  {...register("litresSold")}
                />
                {fieldErrors.litresSold && (
                  <p className='loginError'>{fieldErrors.litresSold.message}</p>
                )}
                <div className='formGroup'>
                  <label>Payment Method</label>
                  <Controller
                    control={control}
                    name='paymentMethod'
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        aria-label='Payment Method'
                        options={PAYMENT_METHODS.map((method) => ({
                          value: method,
                          label: method,
                        }))}
                      />
                    )}
                  />
                  {fieldErrors.paymentMethod && (
                    <p className='loginError'>
                      {fieldErrors.paymentMethod.message}
                    </p>
                  )}
                </div>
              </div>
              <div className='formActions'>
                <button
                  className={`btn btnPrimary`}
                  disabled={submitting}
                  type='submit'
                >
                  {submitting ? "Recording..." : "Record Sale"}
                </button>
              </div>
            </form>
          </div>

          <div className='card'>
            <h2>Recent Sales</h2>
            {loading ? (
              <div className='empty'>
                <p>Loading...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className='empty'>
                <p>No sales recorded yet.</p>
              </div>
            ) : (
              <table className='table'>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Litres</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Attendant</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{new Date(sale.saleDate).toLocaleString("en-GB")}</td>
                      <td>
                        {sale.fuelProduct?.name ?? `ID ${sale.fuelProductId}`}
                      </td>
                      <td>{sale.litresSold.toLocaleString()}</td>
                      <td>&#8358;{sale.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`badge badgeInfo`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td>
                        {sale.attendant?.fullName ?? `ID ${sale.attendantId}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "payments" && <PaymentsTab sales={sales} loading={loading} />}
    </div>
  );
}

function PaymentsTab({
  sales,
  loading,
}: {
  sales: FuelSale[];
  loading: boolean;
}) {
  const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const cash = sales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const card = sales
    .filter((s) => s.paymentMethod === "CARD")
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const transfer = sales
    .filter((s) => s.paymentMethod === "TRANSFER")
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <>
      <div className='kpiGrid'>
        <div className='kpiCard'>
          <div className='kpiLabel'>Total Collected</div>
          <div className='kpiValue'>&#8358;{total.toLocaleString()}</div>
        </div>
        <div className='kpiCard'>
          <div className='kpiLabel'>Cash</div>
          <div className='kpiValue'>&#8358;{cash.toLocaleString()}</div>
        </div>
        <div className='kpiCard'>
          <div className='kpiLabel'>Card</div>
          <div className='kpiValue'>&#8358;{card.toLocaleString()}</div>
        </div>
        <div className='kpiCard'>
          <div className='kpiLabel'>Transfer</div>
          <div className='kpiValue'>&#8358;{transfer.toLocaleString()}</div>
        </div>
      </div>

      <div className='card'>
        <h2>All Payments</h2>
        {loading ? (
          <div className='empty'>
            <p>Loading...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className='empty'>
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          <table className='table'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Product</th>
                <th>Litres</th>
                <th>Amount</th>
                <th>Attendant</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.saleDate).toLocaleString("en-GB")}</td>
                  <td>
                    <span className={`badge badgeInfo`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td>
                    {sale.fuelProduct?.name ?? `ID ${sale.fuelProductId}`}
                  </td>
                  <td>{sale.litresSold.toLocaleString()}</td>
                  <td>&#8358;{sale.totalAmount.toLocaleString()}</td>
                  <td>
                    {sale.attendant?.fullName ?? `ID ${sale.attendantId}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
