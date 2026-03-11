import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function PropertyPage() {

  const { id } = useParams();
  const navigate = useNavigate();


  // KPI
  const [data, setData] = useState({
    current_income: 0,
    current_expense: 0,
    current_profit: 0
  });


  // UNITS DETAILS
  const [units, setUnits] = useState([]);

  const [unitNo, setUnitNo] = useState("");
  const [typeUnit, setTypeUnit] = useState("flat");


  // EXPENSES
  const [expenses, setExpenses] = useState([]);
  const [typeExpense, setTypeExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [methodExpense, setMethodExpense] = useState("cash");


  // LOAD
  useEffect(() => {

    // KPI
    axios
      .get("http://localhost:5000/property-dashboard/" + id)
      .then(res => setData(res.data));


    // NEW API
    axios
      .get("http://localhost:5000/property-details/" + id)
      .then(res => setUnits(res.data));


    // EXPENSES
    axios
      .get("http://localhost:5000/expenses/" + id)
      .then(res => setExpenses(res.data));


  }, [id]);


  // ADD UNIT
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


  // ADD EXPENSE
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

      <h2>Property {id}</h2>


      {/* KPI */}

      <div className="row mt-4">

        <div className="col-md-4">
          <div className="card bg-success text-white p-3">
            <h5>Current Income</h5>
            <h2>{data.current_income}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-danger text-white p-3">
            <h5>Current Expense</h5>
            <h2>{data.current_expense}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-primary text-white p-3">
            <h5>Current Profit</h5>
            <h2>{data.current_profit}</h2>
          </div>
        </div>

      </div>



      {/* ADD UNIT */}

      <div className="mt-5">

        <h4>Add Unit</h4>

        <div className="row">

          <div className="col">

            <input
              className="form-control"
              placeholder="Unit No"
              value={unitNo}
              onChange={e => setUnitNo(e.target.value)}
            />

          </div>

          <div className="col">

            <select
              className="form-control"
              value={typeUnit}
              onChange={e => setTypeUnit(e.target.value)}
            >

              <option value="flat">Flat</option>
              <option value="shop">Shop</option>

            </select>

          </div>

          <div className="col">

            <button
              className="btn btn-primary"
              onClick={addUnit}
            >
              Add
            </button>

          </div>

        </div>

      </div>



      {/* UNIT TABLE */}

      <div className="mt-4">

        <h4>Units</h4>

        <table className="table table-bordered">

          <thead>

            <tr>
              <th>Unit</th>
              <th>Type</th>
              <th>Tenant</th>
              <th>Rent</th>
              <th>Paid</th>
              <th>Contract Left</th>
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

                <td>
                  {u.name ? u.name : "Vacant"}
                </td>

                <td>
                  {u.rent ? u.rent : "-"}
                </td>

                <td>
                  {u.paid > 0 ? "✔" : "❌"}
                </td>

                <td>

                  {u.remaining != null ? (

                    <span>

                      {u.remaining}

                      {u.remaining <= 3 && (

                        <span
                          style={{
                            display: "inline-block",
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



      {/* EXPENSE */}

      <div className="mt-5">

        <h4>Expenses</h4>

        <div className="row">

          <div className="col">

            <input
              className="form-control"
              placeholder="Type"
              value={typeExpense}
              onChange={e => setTypeExpense(e.target.value)}
            />

          </div>

          <div className="col">

            <input
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

          </div>

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
              value={methodExpense}
              onChange={e => setMethodExpense(e.target.value)}
            >

              <option value="cash">Cash</option>
              <option value="netbanking">NetBanking</option>

            </select>

          </div>

          <div className="col">

            <button
              className="btn btn-primary"
              onClick={addExpense}
            >
              Add
            </button>

          </div>

        </div>


        <ul className="list-group mt-3">

          {expenses.map(e => (

            <li key={e.id} className="list-group-item">

              {e.date?.split("T")[0]} | {e.type} | {e.amount}

            </li>

          ))}

        </ul>

      </div>


    </div>

  );

}

export default PropertyPage;