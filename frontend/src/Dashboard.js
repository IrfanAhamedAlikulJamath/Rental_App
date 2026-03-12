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


      {/* TITLE */}

      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontStyle: "italic",
          fontSize: "36px",
          marginBottom: "20px"
        }}
      >
        Dashboard
      </h2>



      {/* REPORT BUTTON */}

      <div style={{ textAlign: "center", marginBottom: "20px" }}>

        <button
          className="btn"
          style={{
            backgroundColor: "#6f42c1",
            color: "white",
            fontWeight: "bold",
            padding: "8px 20px"
          }}
          onClick={() => navigate("/report")}
        >
          Monthly Report
        </button>

      </div>



      {/* CURRENT KPI */}

      <div className="row mt-4 text-center">

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



      {/* TOTAL KPI (smaller) */}

      <div className="row mt-4 text-center">

        <div className="col-md-4">
          <div className="card p-2">
            <h6>Total Income</h6>
            <h5>{data.total_income}</h5>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-2">
            <h6>Total Expense</h6>
            <h5>{data.total_expense}</h5>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-2">
            <h6>Total Profit</h6>
            <h5>{data.total_profit}</h5>
          </div>
        </div>

      </div>



      {/* PROPERTIES */}

      <div className="mt-5">

        <h4
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontStyle: "italic",
            fontSize: "26px"
          }}
        >
          Properties
        </h4>



        {/* ADD PROPERTY */}

        <div
          className="input-group mb-3"
          style={{
            maxWidth: "500px",
            margin: "auto"
          }}
        >

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



        {/* PROPERTY LIST */}

        <ul
          className="list-group"
          style={{
            maxWidth: "500px",
            margin: "auto"
          }}
        >

          {properties.map(p => (

            <li
              key={p.id}
              className="list-group-item text-center"
              onClick={() => navigate("/property/" + p.id)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "18px"
              }}
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