import { useNavigate } from "react-router-dom";

function Dashboard({
  data,
  properties,
  newProperty,
  setNewProperty,
  addProperty
}) {

  const navigate = useNavigate();


  return (

    <div className="container mt-4">

      <h2>Dashboard</h2>


      {/* REPORT BUTTON */}

      <div className="mb-3">

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/report")}
        >
          Monthly Report
        </button>

      </div>



      {/* CURRENT KPI */}

      <div className="row mt-4">

        <div className="col-md-4">
          <div className="card bg-primary text-white p-3">
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
          <div className="card bg-success text-white p-3">
            <h5>Current Profit</h5>
            <h2>{data.current_profit}</h2>
          </div>
        </div>

      </div>



      {/* TOTAL KPI */}

      <div className="row mt-4">

        <div className="col-md-4">
          <div className="card p-3">
            <h6>Total Income</h6>
            <h4>{data.total_income}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h6>Total Expense</h6>
            <h4>{data.total_expense}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h6>Total Profit</h6>
            <h4>{data.total_profit}</h4>
          </div>
        </div>

      </div>



      {/* ADD PROPERTY */}

      <div className="mt-5">

        <h4>Properties</h4>

        <div className="input-group mb-3">

          <input
            className="form-control"
            placeholder="Property name"
            value={newProperty}
            onChange={(e) => setNewProperty(e.target.value)}
          />

          <button
            className="btn btn-primary"
            onClick={addProperty}
          >
            Add
          </button>

        </div>


        <ul className="list-group">

          {properties.map(p => (

            <li
              key={p.id}
              className="list-group-item"
              onClick={() => navigate("/property/" + p.id)}
              style={{ cursor: "pointer" }}
            >
              {p.name}
            </li>

          ))}

        </ul>

      </div>

    </div>

  );

}

export default Dashboard;