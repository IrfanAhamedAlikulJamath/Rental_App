import { useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";


// ✅ Month format
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

  return names[Number(month)] + "-" + year;

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
      .then(res => {
        setReport(res.data);
      });

  };


  // PDF
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

        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeight;

      }

      pdf.save("report.pdf");

    });

  };


  // PRINT
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
      table { width:100% }
      th, td { padding:8px }
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

      <h2>Monthly Report</h2>


      {/* FILTER */}

      <div className="row mb-3">

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

          <button
            className="btn btn-primary"
            onClick={loadReport}
          >
            Load
          </button>

        </div>

        <div className="col">

          <button
            className="btn btn-success"
            onClick={exportPDF}
          >
            Export PDF
          </button>

        </div>

        <div className="col">

          <button
            className="btn btn-secondary"
            onClick={printReport}
          >
            Print
          </button>

        </div>

      </div>


      {/* REPORT */}

      <div id="reportDiv">

        {report && report.months.map((m, i) => {

          let income = 0;
          let expense = 0;

          m.units.forEach(u => {
            income += Number(u.amount);
          });

          m.expenses.forEach(e => {
            expense += Number(e.amount);
          });

          let profit = income - expense;


          // property totals
          let propertyTotals = {};

          m.units.forEach(u => {

            if (!propertyTotals[u.property]) {
              propertyTotals[u.property] = 0;
            }

            propertyTotals[u.property] += Number(u.amount);

          });

          m.expenses.forEach(e => {

            if (!propertyTotals[e.property]) {
              propertyTotals[e.property] = 0;
            }

            propertyTotals[e.property] -= Number(e.amount);

          });



          return (

            <div key={i} className="mt-5">

              <h3>{formatMonth(m.month)}</h3>


              {/* MONTH TOTAL */}

              <div className="row mb-3">

                <div className="col">
                  <b>Income:</b> {income}
                </div>

                <div className="col">
                  <b>Expense:</b> {expense}
                </div>

                <div className="col">
                  <b>Profit:</b> {profit}
                </div>

              </div>


              {/* PROPERTY TOTAL */}

              <h5>Property Totals</h5>

              <table className="table table-bordered">

                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Net Profit</th>
                  </tr>
                </thead>

                <tbody>

                  {Object.keys(propertyTotals).map((p, k) => (

                    <tr key={k}>

                      <td>{p}</td>
                      <td>{propertyTotals[p]}</td>

                    </tr>

                  ))}

                </tbody>

              </table>


              {/* RENT */}

              <h5>Rent</h5>

              <table className="table table-bordered">

                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Unit</th>
                    <th>Tenant</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {m.units.map((u, j) => (

                    <tr
                      key={j}
                      style={{
                        backgroundColor:
                          Number(u.amount) === 0
                            ? "#fff3cd"
                            : "white"
                      }}
                    >

                      <td>{u.property}</td>
                      <td>{u.unit_no}</td>
                      <td>{u.tenant}</td>
                      <td>{u.amount}</td>
                      <td>{u.method}</td>
                      <td>{u.payment_date}</td>

                    </tr>

                  ))}

                </tbody>

              </table>


              {/* EXPENSE */}

              <h5>Expenses</h5>

              <table className="table table-bordered">

                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                  </tr>
                </thead>

                <tbody>

                  {m.expenses.map((e, k) => (

                    <tr key={k}>

                      <td>{e.property}</td>
                      <td>{e.type}</td>
                      <td>{e.amount}</td>
                      <td>{e.date}</td>
                      <td>{e.method}</td>

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