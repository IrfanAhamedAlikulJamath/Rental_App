import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function PropertyPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    current_income: 0,
    current_expense: 0,
    current_profit: 0
  });

  const [units, setUnits] = useState([]);

  const [unitNo, setUnitNo] = useState("");
  const [typeUnit, setTypeUnit] = useState("flat");

  const [expenses, setExpenses] = useState([]);
  const [typeExpense, setTypeExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [methodExpense, setMethodExpense] = useState("cash");


  useEffect(() => {

    axios
      .get("http://localhost:5000/property-dashboard/" + id)
      .then(res => setData(res.data));

    axios
      .get("http://localhost:5000/property-details/" + id)
      .then(res => setUnits(res.data));

    axios
      .get("http://localhost:5000/expenses/" + id)
      .then(res => setExpenses(res.data));

  }, [id]);


  const addUnit = () => {

    if (!unitNo) return;

    axios.post("http://localhost:5000/units", {
      property_id: id,
      unit_no: unitNo,
      type: typeUnit
    })
    .then(() => {

      setUnitNo("");

      axios
        .get("http://localhost:5000/property-details/" + id)
        .then(res => setUnits(res.data));

    });

  };


  const addExpense = () => {

    if (!amount || !date) return;

    axios.post("http://localhost:5000/expenses", {

      property_id: id,
      unit_id: null,
      type: typeExpense,
      amount,
      method: methodExpense,
      date,
      note: ""

    })
    .then(() => {

      axios
        .get("http://localhost:5000/expenses/" + id)
        .then(res => setExpenses(res.data));

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
        Property {id}
      </h2>


      {/* KPI */}

      <div className="row mt-4 text-center">

        <div className="col-md-4">
          <div className="card bg-primary text-white p-3">
            <h5>Current Income</h5>
            <h3>{data.current_income}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-danger text-white p-3">
            <h5>Current Expense</h5>
            <h3>{data.current_expense}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white p-3">
            <h5>Current Profit</h5>
            <h3>{data.current_profit}</h3>
          </div>
        </div>

      </div>



      {/* ADD UNIT BOX */}

      <div className="card p-3 mt-4" >

        <h4 style={{ textAlign: "center" }}>Add Unit</h4>

        <div style={{ display: "flex", gap: "6px" }}>

          <input
            className="form-control"
            placeholder="Unit No"
            value={unitNo}
            onChange={e => setUnitNo(e.target.value)}
          />

          <select
            className="form-control"
            value={typeUnit}
            onChange={e => setTypeUnit(e.target.value)}
          >
            <option value="flat">Flat</option>
            <option value="shop">Shop</option>
          </select>

          <button
            className="btn btn-primary"
            style={{ width: "100px" }}
            onClick={addUnit}
          >
            Add
          </button>

        </div>

      </div>



      {/* UNIT DETAILS BOX */}

      <div className="card p-3 mt-4" >

        <h4 style={{ textAlign: "center" }}>Unit Details</h4>

        <table className="table table-bordered text-center">

          <thead className="table-dark">

            <tr>
              <th>Unit No</th>
              <th>Type</th>
              <th>Tenant</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Pending</th>
              <th>Contract</th>
            </tr>

          </thead>

          <tbody>

            {units.map(u => (

              <tr
                key={u.id}
                onClick={() => navigate("/unit/" + u.id)}
                style={{ cursor: "pointer" }}
              >

                <td>{u.unit_no}</td>
                <td>{u.type}</td>
                <td>{u.name ? u.name : "Vacant"}</td>
                <td>{u.rent ? u.rent : "-"}</td>
                <td>{u.paid > 0 ? "✔" : "❌"}</td>
                <td>{u.pending ? u.pending : "-"}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>

                {u.remaining != null ? (

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >

                    {u.remaining}

                    {u.remaining <= 3 && (

                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          backgroundColor: "red",
                          borderRadius: "50%",
                          marginLeft: "6px"
                        }}
                      />

                    )}

                  </span>

                ) : "-"}

              </td>
                
              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {/* ADD EXPENSE BOX */}

      <div className="card p-3 mt-4" >

        <h4 style={{ textAlign: "center" }}>Add Expense</h4>

        <div style={{ display: "flex", gap: "6px" }}>

          <input
            className="form-control"
            placeholder="Type"
            value={typeExpense}
            onChange={e => setTypeExpense(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <input
            type="date"
            className="form-control"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <select
            className="form-control"
            value={methodExpense}
            onChange={e => setMethodExpense(e.target.value)}
          >
            <option>Cash</option>
            <option>Netbanking-Jamal</option>
            <option>Netbanking-Mujahidh</option>
          </select>

          <button
            className="btn btn-primary"
            style={{ width: "100px" }}
            onClick={addExpense}
          >
            Add
          </button>

        </div>

      </div>



      {/* EXPENSE DETAILS BOX */}

      <div className="card p-3 mt-4" >

        <h4 style={{ textAlign: "center" }}>Expense Details</h4>

        <table className="table table-bordered text-center">

          <thead className="table-dark">

            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>

          </thead>

          <tbody>

            {expenses.map(e => (

              <tr key={e.id}>

                <td>{e.type}</td>
                <td>{e.amount}</td>
                <td>{e.date?.split("T")[0]}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


    </div>

  );

}

export default PropertyPage;