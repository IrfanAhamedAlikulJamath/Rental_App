import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function TenantPage() {

  const { id } = useParams();

  const [tenant, setTenant] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rent, setRent] = useState("");
  const [advance, setAdvance] = useState("");
  const [contract, setContract] = useState("");
  const [startDate, setStartDate] = useState(""); // ✅ new

  const [returned, setReturned] = useState("");

  const [payments, setPayments] = useState([]);

  const [date, setDate] = useState("");
  const [method, setMethod] = useState("cash");

  const [payMonth, setPayMonth] = useState("");
  const [payYear, setPayYear] = useState(new Date().getFullYear());


  // LOAD TENANT + PAYMENTS
  useEffect(() => {

    axios
      .get("http://localhost:5000/tenant/" + id)
      .then(res => {

        if (res.data.length > 0) {

          const t = res.data[0];
          setTenant(t);

          axios
            .get("http://localhost:5000/payments/" + t.id)
            .then(r => setPayments(r.data));

        } else {

          setTenant(null);
          setPayments([]);

        }

      });

  }, [id]);


  // ADD TENANT
  const addTenant = () => {

    if (!startDate) {
      alert("Select start date");
      return;
    }

    axios.post("http://localhost:5000/tenant", {

      unit_id: id,
      name,
      phone,
      rent,
      advance,
      contract_months: contract,
      start_date: startDate

    })
    .then(() => {

      window.location.reload();

    });

  };


  // END CONTRACT
  const endContract = () => {

    const diff = returned - tenant.advance;

    axios.post("http://localhost:5000/tenant/end", {

      tenant_id: tenant.id,
      end_date: new Date().toISOString().split("T")[0]

    })
    .then(() => {

      axios.post("http://localhost:5000/advance", {

        tenant_id: tenant.id,
        advance_amount: tenant.advance,
        returned_amount: returned,
        diff,
        date: new Date().toISOString().split("T")[0]

      })
      .then(() => {

        window.location.reload();

      });

    });

  };


  // ADD PAYMENT
  const addPayment = () => {

    if (!date || !payMonth) return;

    axios.post("http://localhost:5000/payments", {

      tenant_id: tenant.id,
      month: payMonth,
      year: payYear,
      amount: tenant.rent,
      method,
      payment_date: date + "T00:00:00"

    })
    .then(() => {

      axios
        .get("http://localhost:5000/payments/" + tenant.id)
        .then(r => setPayments(r.data));

    });

  };


  return (

    <div className="container mt-4">

      <h2>Unit {id}</h2>


      {tenant ? (

        <div className="card p-3">

          <h4>Tenant Details</h4>

          <p>Name: {tenant.name}</p>
          <p>Phone: {tenant.phone}</p>
          <p>Rent: {tenant.rent}</p>
          <p>Advance: {tenant.advance}</p>
          <p>Contract: {tenant.contract_months} months</p>

          <p>
            Start Date:{" "}
            {tenant.start_date
              ? new Date(tenant.start_date).toLocaleDateString()
              : ""}
          </p>


          {/* PAYMENT */}

          <div className="mt-4">

            <h5>Payment</h5>

            <div className="row">

              <div className="col">
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>


              <div className="col">
                <select
                  className="form-control"
                  value={payMonth}
                  onChange={e => setPayMonth(e.target.value)}
                >

                  <option value="">Month</option>
                  <option value="1">Jan</option>
                  <option value="2">Feb</option>
                  <option value="3">Mar</option>
                  <option value="4">Apr</option>
                  <option value="5">May</option>
                  <option value="6">Jun</option>
                  <option value="7">Jul</option>
                  <option value="8">Aug</option>
                  <option value="9">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>

                </select>
              </div>


              <div className="col">
                <input
                  className="form-control"
                  value={payYear}
                  onChange={e => setPayYear(e.target.value)}
                />
              </div>


              <div className="col">
                <select
                  className="form-control"
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="netbanking-Mujahidh">NetBanking - Mujahidh</option>
                  <option value="netbanking-Jamal">NetBanking - Jamal</option>
                </select>
              </div>


              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={addPayment}
                >
                  Add
                </button>
              </div>

            </div>

          </div>


          {/* HISTORY */}

          <div className="mt-3">

            <h5>Payment History</h5>

            <ul className="list-group">

              {payments.map((p, i) => (

                <li
                  key={i}
                  className="list-group-item"
                  style={{
                    backgroundColor:
                      p.status === "Paid"
                        ? "#d4edda"
                        : "#fff3cd"
                  }}
                >

                  {p.month}/{p.year} — {p.status}

                  {p.payment_date &&
                    " | " + p.payment_date.split("T")[0]
                  }

                </li>

              ))}

            </ul>


            <div className="mt-3">

              <h5>End Contract</h5>

              <input
                className="form-control"
                placeholder="Returned advance"
                value={returned}
                onChange={e => setReturned(e.target.value)}
              />

              <button
                className="btn btn-danger mt-2"
                onClick={endContract}
              >
                End Contract
              </button>

            </div>

          </div>

        </div>

      ) : (

        <div>

          <h4>Add Tenant</h4>

          <input className="form-control mt-2" placeholder="Name"
            value={name} onChange={e => setName(e.target.value)} />

          <input className="form-control mt-2" placeholder="Phone"
            value={phone} onChange={e => setPhone(e.target.value)} />

          <input className="form-control mt-2" placeholder="Rent"
            value={rent} onChange={e => setRent(e.target.value)} />

          <input className="form-control mt-2" placeholder="Advance"
            value={advance} onChange={e => setAdvance(e.target.value)} />

          <input className="form-control mt-2" placeholder="Contract months"
            value={contract} onChange={e => setContract(e.target.value)} />


          {/* START DATE */}

          <div className="mt-2">

            <label>Start Date</label>

            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />

          </div>

          <button
            className="btn btn-primary mt-2"
            onClick={addTenant}
          >
            Save
          </button>

        </div>

      )}

    </div>

  );

}

export default TenantPage;