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
  const [startDate, setStartDate] = useState("");

  const [returned, setReturned] = useState("");
  const [endDate, setEndDate] = useState("");

  const [payments, setPayments] = useState([]);

  const [date, setDate] = useState("");
  const [method, setMethod] = useState("cash");

  const [payMonth, setPayMonth] = useState("");
  const [payYear, setPayYear] = useState(new Date().getFullYear());


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


  const addTenant = () => {

    if (!startDate) return;

    axios.post("http://localhost:5000/tenant", {

      unit_id: id,
      name,
      phone,
      rent,
      advance,
      contract_months: contract,
      start_date: startDate

    })
      .then(() => window.location.reload());

  };


  const endContract = () => {

    if (!endDate) return;

    const diff = returned - tenant.advance;

    axios.post("http://localhost:5000/tenant/end", {

      tenant_id: tenant.id,
      end_date: endDate

    })
      .then(() => {

        axios.post("http://localhost:5000/advance", {

          tenant_id: tenant.id,
          advance_amount: tenant.advance,
          returned_amount: returned,
          diff,
          date: endDate

        })
          .then(() => window.location.reload());

      });

  };


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

      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontStyle: "italic"
        }}
      >
        Unit No : {tenant?.unit_no}
      </h2>


      {tenant ? (

        <>

          {/* TENANT DETAILS */}

          <div className="card p-3 mt-3">

            <h4 style={{ textAlign: "center" }}>
              Tenant Details:
            </h4>

            <div
              style={{
                maxWidth: "300px",
                margin: "auto",
                fontSize: "20px",
                textAlign: "left"
              }}
            >

              <div>Name: {tenant.name}</div>
              <div>Phone: {tenant.phone}</div>
              <div>Rent: {tenant.rent}</div>
              <div>Advance: {tenant.advance}</div>
              <div>Contract: {tenant.contract_months} months</div>
              <div>
                Start Date:
                {" "}
                {new Date(tenant.start_date)
                  .toLocaleDateString("en-GB")}
              </div>

            </div>

          </div>



          {/* PAYMENT */}

          <div className="card p-3 mt-3">

            <h4 style={{ textAlign: "center" }}>
              Payment
            </h4>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap"
              }}
            >

              <div style={{ width: "140px" }}>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div style={{ width: "140px" }}>
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

              <div style={{ width: "140px" }}>
                <input
                  className="form-control"
                  value={payYear}
                  onChange={e => setPayYear(e.target.value)}
                />
              </div>

              <div style={{ width: "140px" }}>
                <select
                  className="form-control"
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                >
                  <option>Cash</option>
                  <option>Netbanking-Mujahidh</option>
                  <option>Netbanking-Jamal</option>
                </select>
              </div>

              <div style={{ width: "140px" }}>
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

          <div className="card p-3 mt-3">

            <h4 style={{ textAlign: "center" }}>
              Payment History
            </h4>

            <table className="table table-bordered text-center">

              <thead>
                <tr>
                  <th>Month</th>
                  <th>Rent</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>

              <tbody>

                {payments.map((p, i) => (

                  <tr
  key={i}
  style={{
    backgroundColor:
      p.payment_date
        ? "#d4edda"   // paid → green
        : "#fff3cd"   // default → yellow
  }}
>

                    <td>
                      {
                        new Date(
                          p.year,
                          p.month - 1
                        ).toLocaleString("en-IN", {
                          month: "long",
                          year: "numeric"
                        })
                      }
                    </td>

                    <td>{tenant.rent}</td>

                    <td>{p.status}</td>

                    <td>
                      {p.payment_date
                        ? new Date(p.payment_date)
                          .toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>



          {/* END CONTRACT */}

          <div className="card p-3 mt-3">

            <h4 style={{ textAlign: "center" }}>
              End Contract
            </h4>

            <div
              style={{
                maxWidth: "320px",
                margin: "auto",
                textAlign: "center"
              }}
            >

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "8px"
                }}
              >

                <input
                  className="form-control"
                  placeholder="Returned advance"
                  value={returned}
                  onChange={e => setReturned(e.target.value)}
                />

                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />

              </div>

              <button
                className="btn btn-danger"
                style={{
                  width: "150px",
                  padding: "4px"
                }}
                onClick={endContract}
              >
                End Contract
              </button>

            </div>

          </div>

        </>

      ) : (

        <div className="card p-3">

  <h4 style={{ textAlign: "center" }}>
    Add Tenant
  </h4>

  <div
    style={{
      display: "flex",
      justifyContent: "center"
    }}
  >

    <div style={{ width: "320px" }}>

      <input
        className="form-control mt-2"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        className="form-control mt-2"
        placeholder="Phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <input
        className="form-control mt-2"
        placeholder="Rent"
        value={rent}
        onChange={e => setRent(e.target.value)}
      />

      <input
        className="form-control mt-2"
        placeholder="Advance"
        value={advance}
        onChange={e => setAdvance(e.target.value)}
      />

      <input
        className="form-control mt-2"
        placeholder="Contract months"
        value={contract}
        onChange={e => setContract(e.target.value)}
      />

      <label className="mt-2">
        Start Date
      </label>

      <input
        type="date"
        className="form-control"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />

      <div style={{ textAlign: "center" }}>
        <button
          className="btn btn-primary mt-3"
          style={{ width: "120px" }}
          onClick={addTenant}
        >
          Save
        </button>
      </div>

    </div>

  </div>

</div>

      )}

    </div>

  );

}

export default TenantPage;