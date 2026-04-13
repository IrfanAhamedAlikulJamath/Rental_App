import { useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const formatMonth = (ym) => {

  const parts = ym.split("-");

  const year = parts[0];
  const month = parts[1];

  const names = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  return names[Number(month)] + " " + year;

};


function ReportPage() {

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);


  const loadReport = () => {

    if (!from || !to) return;

    axios
      .get("http://localhost:5000/report", {
        params: { from, to }
      })
      .then(res => setReport(res.data));

  };


  const exportPDF = () => {

    const input = document.getElementById("reportDiv");

    html2canvas(input).then(canvas => {

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;

      const imgHeight =
        canvas.height * imgWidth / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {

        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        heightLeft -= pageHeight;

      }

      pdf.save("report.pdf");

    });

  };


  const printReport = () => {

    const content =
      document.getElementById("reportDiv").innerHTML;

    const win = window.open("", "", "width=900,height=650");

    win.document.write(`
      <html>
      <head>

      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      />

      <style>
      body { padding:20px }
      table { width:100%; text-align:center }
      th, td { padding:8px; text-align:center }
      </style>

      </head>
      <body>
      ${content}
      </body>
      </html>
    `);

    win.document.close();
    win.print();

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
        Monthly Report
      </h2>


      {/* FILTER */}

      <div className="row mb-3 mt-3 text-center">

        <div className="col">
          <input
            type="month"
            className="form-control"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
        </div>

        <div className="col">
          <input
            type="month"
            className="form-control"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>

        <div className="col">
          <button className="btn btn-primary w-100" onClick={loadReport}>
            Load
          </button>
        </div>

        <div className="col">
          <button className="btn btn-success w-100" onClick={exportPDF}>
            PDF
          </button>
        </div>

        <div className="col">
          <button className="btn btn-secondary w-100" onClick={printReport}>
            Print
          </button>
        </div>

      </div>


      <div id="reportDiv">

        {report && report.months.map((m, i) => {

          let income = 0;
          let expense = 0;

          m.units.forEach(u => income += Number(u.amount));
          m.expenses.forEach(e => expense += Number(e.amount));

          let profit = income - expense;


          let propertyTotals = {};

          m.units.forEach(u => {

            if (!propertyTotals[u.property]) {
              propertyTotals[u.property] = {
                income: 0,
                expense: 0
              };
            }

            propertyTotals[u.property].income += Number(u.amount);

          });

          m.expenses.forEach(e => {

            if (!propertyTotals[e.property]) {
              propertyTotals[e.property] = {
                income: 0,
                expense: 0
              };
            }

            propertyTotals[e.property].expense += Number(e.amount);

          });


          return (

            <div key={i} className="mt-5">

              <h3
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontStyle: "italic"
                }}
              >
                {formatMonth(m.month)}
              </h3>


              {/* KPI */}

              <div className="row text-center mb-3">

                <div className="col">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      Income
                      <h5>{income}</h5>
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="card bg-danger text-white">
                    <div className="card-body">
                      Expense
                      <h5>{expense}</h5>
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      Profit
                      <h5>{profit}</h5>
                    </div>
                  </div>
                </div>

              </div>


              {/* PROPERTY TOTAL */}

              <h5 style={{ textAlign: "center", fontWeight: "bold" }}>
                Property Totals
              </h5>

              <table className="table table-bordered text-center">

                <thead className="table-dark">

                  <tr>
                    <th>Property</th>
                    <th>Income</th>
                    <th>Expense</th>
                    <th>Net</th>
                  </tr>

                </thead>

                <tbody>

                  {Object.keys(propertyTotals).map((p, k) => {

                    const inc = propertyTotals[p].income;
                    const exp = propertyTotals[p].expense;
                    const net = inc - exp;

                    return (

                      <tr key={k}>

                        <td>{p}</td>
                        <td>{inc}</td>
                        <td>{exp}</td>

                        <td
                          style={{
                            color: net >= 0 ? "green" : "red",
                            fontWeight: "bold"
                          }}
                        >
                          {net}
                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>


              {/* RENT */}

              <h5 style={{ textAlign: "center", fontWeight: "bold" }}>
                Rent Details
              </h5>

              <table className="table table-bordered text-center">

                <thead className="table-dark">

                  <tr>
                    <th>Property</th>
                    <th>Unit No</th>
                    <th>Tenant Name</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Paid For</th>
                    <th>Method</th>
                    <th>Date</th>

                    <th>Pending</th>
                  </tr>

                </thead>

                <tbody>

                  {m.units.map((u, j) => {

                    const vacant = !u.tenant;

                    return (

                      <tr
                        key={j}
                        style={{
                          backgroundColor:
                            vacant
                              ? "#eeeeee"
                              : Number(u.amount) === 0
                              ? "#fff3cd"
                              : "white"
                        }}
                      >

                        <td>{u.property}</td>

                        <td>{u.unit_no}</td>

                        <td>
                          {u.tenant ? u.tenant : "Vacant"}
                        </td>

                        <td>{u.rent ? u.rent : 0}</td>

                        <td
                          style={{
                            fontWeight: "bold",
                            color:
                              u.status === "Paid"
                                ? "green"
                                : u.status === "Unpaid"
                                ? "red"
                                : "black"
                          }}
                        >
                          {u.status}
                        </td>
                        <td>{u.paid_for ? u.paid_for : "-"}</td>
                        <td>{u.method ? u.method : "-"}</td>
                        <td>{u.payment_date ? u.payment_date : "-"}</td>

                        <td>{u.pending}</td>


                      </tr>

                    );

                  })}

                </tbody>

              </table>


              {/* EXPENSE */}

              <h5 style={{ textAlign: "center", fontWeight: "bold" }}>
                Expense Details
              </h5>

              <table className="table table-bordered text-center">

                <thead className="table-dark">

                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {m.expenses.map((e, k) => (

                    <tr key={k}>

                      <td>{e.property}</td>
                      <td>{e.type}</td>
                      <td>{e.amount}</td>
                      <td>{e.method}</td>
                      <td>{e.date}</td>
                      

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          );

        })}

      </div>

    </div>

  );

}

export default ReportPage;