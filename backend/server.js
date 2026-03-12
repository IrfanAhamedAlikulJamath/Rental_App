const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Backend running");
});

app.get("/test-db", (req, res) => {
    db.query("SHOW TABLES", (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});

// ---------------- PROPERTIES API ----------------
// get all properties
app.get("/properties", (req, res) => {
    db.query("SELECT * FROM properties", (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});

// add property
app.post("/properties", (req, res) => {
    const { name } = req.body;

    db.query(
        "INSERT INTO properties (name) VALUES (?)",
        [name],
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send("Property added");
            }
        }
    );
});

// delete property
app.delete("/properties/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM properties WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send("Property deleted");
            }
        }
    );
});

// ---------------- UNITS API ----------------

// get units by property
app.get("/units/:propertyId", (req, res) => {
    const propertyId = req.params.propertyId;

    db.query(
        "SELECT * FROM units WHERE property_id = ?",
        [propertyId],
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        }
    );
});


// add unit (flat / shop)
app.post("/units", (req, res) => {
    const { property_id, unit_no, type } = req.body;

    db.query(
        "INSERT INTO units (property_id, unit_no, type) VALUES (?, ?, ?)",
        [property_id, unit_no, type],
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send("Unit added");
            }
        }
    );
});


// delete unit
app.delete("/units/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM units WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send("Unit deleted");
            }
        }
    );
});

// ---------------- TENANT API ----------------

// get tenant of unit (active tenant only)
app.get("/tenant/:unitId", (req, res) => {
    const unitId = req.params.unitId;

    db.query(
        "SELECT t.*, u.unit_no FROM tenants t JOIN units u ON t.unit_id = u.id WHERE t.unit_id = ? AND t.end_date IS NULL",
        [unitId],
        (err, result) => {
            if (err) res.send(err);
            else res.send(result);
        }
    );
});


// add tenant (new contract)
app.post("/tenant", (req, res) => {

    const {
        unit_id,
        name,
        phone,
        rent,
        advance,
        start_date,
        contract_months
    } = req.body;

    db.query(
        `
        INSERT INTO tenants
        (unit_id, name, phone, rent, advance, start_date, contract_months)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            unit_id,
            name,
            phone,
            rent,
            advance,
            start_date,
            contract_months
        ],
        (err, result) => {

            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send("Tenant added");
            }

        }
    );

});


// end contract
app.post("/tenant/end", (req, res) => {
    const { tenant_id, end_date } = req.body;

    db.query(
        "UPDATE tenants SET end_date = ? WHERE id = ?",
        [end_date, tenant_id],
        (err, result) => {
            if (err) res.send(err);
            else res.send("Contract ended");
        }
    );
});

// ---------------- PAYMENT API ----------------

// get payments of tenant (with unpaid months)
app.get("/payments/:tenantId", (req, res) => {

    const tenantId = req.params.tenantId;

    db.query(
        "SELECT * FROM tenants WHERE id=?",
        [tenantId],
        (err, tenantResult) => {

            if (err) {
                res.send(err);
                return;
            }

            if (tenantResult.length === 0) {
                res.send([]);
                return;
            }

            const tenant = tenantResult[0];

            // FIX timezone problem
            let start = new Date(tenant.start_date);
            start.setHours(0,0,0,0);

            let today = new Date();
            today.setHours(0,0,0,0);

            db.query(
                "SELECT * FROM payments WHERE tenant_id=?",
                [tenantId],
                (err, payResult) => {

                    if (err) {
                        res.send(err);
                        return;
                    }

                    let months = [];

                    let d = new Date(start);

                    while (
                        d.getFullYear() < today.getFullYear() ||
                        (
                            d.getFullYear() === today.getFullYear() &&
                            d.getMonth() <= today.getMonth()
                        )
                    ) {

                        const m = d.getMonth() + 1;
                        const y = d.getFullYear();

                        const found = payResult.find(
                            p =>
                                Number(p.month) === m &&
                                Number(p.year) === y
                        );

                        months.push({

                            month: m,
                            year: y,
                            status: found ? "Paid" : "Unpaid",
                            payment_date: found
                                ? found.payment_date
                                : null

                        });

                        d.setMonth(d.getMonth() + 1);

                    }

                    res.send(months);

                }
            );

        }
    );

});

// add payment
app.post("/payments", (req, res) => {
    const { tenant_id, month, year, amount, method, payment_date } = req.body;

    db.query(
        "INSERT INTO payments (tenant_id, month, year, amount, method, payment_date) VALUES (?, ?, ?, ?, ?, ?)",
        [tenant_id, month, year, amount, method, payment_date],
        (err, result) => {
            if (err) res.send(err);
            else res.send("Payment added");
        }
    );
});


// delete payment
app.delete("/payments/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM payments WHERE id = ?",
        [id],
        (err, result) => {
            if (err) res.send(err);
            else res.send("Payment deleted");
        }
    );
});

// ---------------- EXPENSE API ----------------

// get expenses by property
app.get("/expenses/:propertyId", (req, res) => {
    const propertyId = req.params.propertyId;

    db.query(
        "SELECT * FROM expenses WHERE property_id = ?",
        [propertyId],
        (err, result) => {
            if (err) res.send(err);
            else res.send(result);
        }
    );
});


// get all expenses (for dashboard)
app.get("/expenses", (req, res) => {

    db.query(
        "SELECT * FROM expenses",
        (err, result) => {
            if (err) res.send(err);
            else res.send(result);
        }
    );
});


// add expense
app.post("/expenses", (req, res) => {

    const {
        property_id,
        unit_id,
        type,
        amount,
        method,
        date,
        note
    } = req.body;

    db.query(
        "INSERT INTO expenses (property_id, unit_id, type, amount, method, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [property_id, unit_id, type, amount, method, date, note],
        (err, result) => {
            if (err) res.send(err);
            else res.send("Expense added");
        }
    );
});


// delete expense
app.delete("/expenses/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM expenses WHERE id = ?",
        [id],
        (err, result) => {
            if (err) res.send(err);
            else res.send("Expense deleted");
        }
    );
});

// ---------------- ADVANCE API ----------------

// get advance transactions of tenant
app.get("/advance/:tenantId", (req, res) => {

    const tenantId = req.params.tenantId;

    db.query(
        "SELECT * FROM advance_transactions WHERE tenant_id = ?",
        [tenantId],
        (err, result) => {
            if (err) res.send(err);
            else res.send(result);
        }
    );
});


// add advance settlement
app.post("/advance", (req, res) => {

    const {
        tenant_id,
        advance_amount,
        returned_amount,
        diff,
        date
    } = req.body;

    db.query(
        "INSERT INTO advance_transactions (tenant_id, advance_amount, returned_amount, diff, date) VALUES (?, ?, ?, ?, ?)",
        [tenant_id, advance_amount, returned_amount, diff, date],
        (err, result) => {
            if (err) res.send(err);
            else res.send("Advance settlement saved");
        }
    );
});


// get all advance transactions (for dashboard)
app.get("/advance", (req, res) => {

    db.query(
        "SELECT * FROM advance_transactions",
        (err, result) => {
            if (err) res.send(err);
            else res.send(result);
        }
    );
});

// ---------------- DASHBOARD API ----------------

app.get("/dashboard", (req, res) => {

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let data = {
        total_income: 0,
        total_expense: 0,
        total_profit: 0,
        current_income: 0,
        current_expense: 0,
        current_profit: 0
    };


    // total income
    db.query(
        "SELECT IFNULL(SUM(amount),0) AS total_income FROM payments",
        (err, r1) => {

            if (err) return res.send(err);

            data.total_income = Number(r1[0].total_income);


            // total expense
            db.query(
                "SELECT IFNULL(SUM(amount),0) AS total_expense FROM expenses",
                (err2, r2) => {

                    if (err2) return res.send(err2);

                    data.total_expense = Number(r2[0].total_expense);


                    // advance diff
                    db.query(
                        "SELECT IFNULL(SUM(diff),0) AS diff FROM advance_transactions",
                        (err3, r3) => {

                            if (err3) return res.send(err3);

                            const diff = Number(r3[0].diff);

                            if (diff > 0) {
                                data.total_income += diff;
                            } else {
                                data.total_expense += Math.abs(diff);
                            }


                            // current income
                            db.query(
                                "SELECT IFNULL(SUM(amount),0) AS income FROM payments WHERE month=? AND year=?",
                                [month, year],
                                (err4, r4) => {

                                    if (err4) return res.send(err4);

                                    data.current_income = Number(r4[0].income);


                                    // current expense
                                    db.query(
                                        "SELECT IFNULL(SUM(amount),0) AS expense FROM expenses WHERE MONTH(date)=? AND YEAR(date)=?",
                                        [month, year],
                                        (err5, r5) => {

                                            if (err5) return res.send(err5);

                                            data.current_expense = Number(r5[0].expense);


                                            // calculate profit
                                            data.total_profit =
                                                data.total_income -
                                                data.total_expense;

                                            data.current_profit =
                                                data.current_income -
                                                data.current_expense;


                                            // format 2 decimals
                                            data.total_income =
                                                data.total_income.toFixed(2);

                                            data.total_expense =
                                                data.total_expense.toFixed(2);

                                            data.total_profit =
                                                data.total_profit.toFixed(2);

                                            data.current_income =
                                                data.current_income.toFixed(2);

                                            data.current_expense =
                                                data.current_expense.toFixed(2);

                                            data.current_profit =
                                                data.current_profit.toFixed(2);


                                            res.send(data);

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

// ---------------- PROPERTY DASHBOARD ----------------

app.get("/property-dashboard/:id", (req, res) => {

    const propertyId = req.params.id;

    let data = {
        total_income: 0,
        total_expense: 0,
        total_profit: 0,
        current_income: 0,
        current_expense: 0,
        current_profit: 0
    };

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();


    // total income
    db.query(
        `
        SELECT IFNULL(SUM(p.amount),0) AS income
        FROM payments p
        JOIN tenants t ON p.tenant_id = t.id
        JOIN units u ON t.unit_id = u.id
        WHERE u.property_id = ?
        `,
        [propertyId],
        (err, r1) => {

            data.total_income = Number(r1[0].income);


            // total expense
            db.query(
                "SELECT IFNULL(SUM(amount),0) AS expense FROM expenses WHERE property_id=?",
                [propertyId],
                (err2, r2) => {

                    data.total_expense = Number(r2[0].expense);


                    // current income
                    db.query(
                        `
                        SELECT IFNULL(SUM(p.amount),0) AS income
                        FROM payments p
                        JOIN tenants t ON p.tenant_id = t.id
                        JOIN units u ON t.unit_id = u.id
                        WHERE u.property_id=? AND p.month=? AND p.year=?
                        `,
                        [propertyId, month, year],
                        (err3, r3) => {

                            data.current_income = Number(r3[0].income);


                            // current expense
                            db.query(
                                `
                                SELECT IFNULL(SUM(amount),0) AS expense
                                FROM expenses
                                WHERE property_id=? AND MONTH(date)=? AND YEAR(date)=?
                                `,
                                [propertyId, month, year],
                                (err4, r4) => {

                                    data.current_expense = Number(r4[0].expense);


                                    data.total_profit =
                                        data.total_income -
                                        data.total_expense;

                                    data.current_profit =
                                        data.current_income -
                                        data.current_expense;


                                    data.total_income = data.total_income.toFixed(2);
                                    data.total_expense = data.total_expense.toFixed(2);
                                    data.total_profit = data.total_profit.toFixed(2);

                                    data.current_income = data.current_income.toFixed(2);
                                    data.current_expense = data.current_expense.toFixed(2);
                                    data.current_profit = data.current_profit.toFixed(2);


                                    res.send(data);

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

// ---------------- REPORT FINAL CLEAN ----------------
// ================= FINAL REPORT API =================

app.get("/report", (req, res) => {

    const from = req.query.from;
    const to = req.query.to;

    let data = {
        months: []
    };

    db.query(
        `
        SELECT DISTINCT ym FROM (

            SELECT CONCAT(year,'-',LPAD(month,2,'0')) AS ym
            FROM payments

            UNION

            SELECT DATE_FORMAT(date,'%Y-%m') AS ym
            FROM expenses

        ) t

        WHERE ym >= ? AND ym <= ?
        ORDER BY ym
        `,
        [from, to],
        (err, months) => {

            if (err) return res.send(err);

            if (months.length === 0)
                return res.send(data);

            let done = 0;

            months.forEach((mrow) => {

                const ym = mrow.ym;

                const parts = ym.split("-");
                const y = parseInt(parts[0]);
                const m = parseInt(parts[1]);

                let monthData = {
                    month: ym,
                    units: [],
                    expenses: []
                };


                // ================= UNITS =================

                    db.query(
`
                    SELECT

                    pr.name AS property,
                    u.unit_no,
                    t.name AS tenant,

                    IFNULL(
                        SUM(
                            CASE
                                WHEN p.month = ?
                                AND p.year = ?
                                THEN p.amount
                                ELSE 0
                            END
                        ),0
                    ) AS amount,

                    MAX(
                        CASE
                            WHEN p.month = ?
                            AND p.year = ?
                            THEN p.method
                        END
                    ) AS method,

                    DATE_FORMAT(
                        MAX(
                            CASE
                                WHEN p.month = ?
                                AND p.year = ?
                                THEN p.payment_date
                            END
                        ),
                        '%Y-%m-%d'
                    ) AS payment_date

                    FROM units u

                    LEFT JOIN properties pr
                    ON pr.id = u.property_id

                    LEFT JOIN tenants t
                    ON t.unit_id = u.id
                    AND t.start_date <= LAST_DAY(CONCAT(?, '-', ?, '-01'))
                    AND (t.end_date IS NULL OR t.end_date >= CONCAT(?, '-', ?, '-01'))

                    LEFT JOIN payments p
                    ON p.tenant_id = t.id

                    GROUP BY u.id, pr.name, u.unit_no, t.name

                    ORDER BY pr.name, u.unit_no
                    `,
                    [m,y,m,y,m,y, y,m, y,m],

                    (err2, unitRows) => {

                        if (err2) return res.send(err2);

                        monthData.units = unitRows;


                        // ================= EXPENSES =================

                        db.query(
                            `
                            SELECT

                            pr.name AS property,
                            e.type,
                            e.amount,

                            DATE_FORMAT(e.date,'%Y-%m-%d') AS date,

                            e.method

                            FROM expenses e

                            LEFT JOIN properties pr
                            ON pr.id = e.property_id

                            WHERE MONTH(e.date) = ?
                            AND YEAR(e.date) = ?

                            ORDER BY pr.name
                            `,
                            [m, y],

                            (err3, expRows) => {

                                if (err3) return res.send(err3);

                                monthData.expenses = expRows;

                                data.months.push(monthData);

                                done++;

                                if (done === months.length) {
                                    res.send(data);
                                }

                            }
                        );

                    }
                );

            });

        }
    );

});

// property full details

app.get("/property-details/:id", (req, res) => {

    const propertyId = req.params.id;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    db.query(

        `
        SELECT

        u.id,
        u.unit_no,
        u.type,

        t.id AS tenant_id,
        t.name,
        t.rent,
        t.contract_months,
        t.start_date,

        (
            SELECT COUNT(*)
            FROM payments p
            WHERE p.tenant_id = t.id
            AND p.month = ?
            AND p.year = ?
        ) AS paid

        FROM units u

        LEFT JOIN tenants t
        ON t.unit_id = u.id
        AND t.end_date IS NULL

        WHERE u.property_id = ?
        `,
        [currentMonth, currentYear, propertyId],

        (err, result) => {

            if (err) {
                res.send(err);
                return;
            }

            const today = new Date();

            let done = 0;

            result.forEach((r, index) => {

                if (!r.tenant_id) {
                    r.remaining = null;
                    r.pending = "-";
                    done++;
                    if (done === result.length) res.send(result);
                    return;
                }

                // contract remaining

                let remaining = null;

                if (r.contract_months && r.start_date) {

                    const start = new Date(r.start_date);

                    const monthsPassed =
                        (today.getFullYear() - start.getFullYear()) * 12 +
                        (today.getMonth() - start.getMonth());

                    remaining = r.contract_months - monthsPassed;

                    if (remaining < 0) remaining = 0;
                }

                r.remaining = remaining;


                // get pending months

                db.query(
                    "SELECT month,year FROM payments WHERE tenant_id=?",
                    [r.tenant_id],
                    (err2, payRows) => {

                        if (err2) {
                            r.pending = "-";
                        } else {

                            let start = new Date(r.start_date);
                            let d = new Date(start);

                            let firstPending = null;
                            let lastPending = null;

                            while (
                                d.getFullYear() < currentYear ||
                                (
                                    d.getFullYear() === currentYear &&
                                    d.getMonth() + 1 <= currentMonth
                                )
                            ) {

                                const m = d.getMonth() + 1;
                                const y = d.getFullYear();

                                const found = payRows.find(
                                    p =>
                                        Number(p.month) === m &&
                                        Number(p.year) === y
                                );

                                if (!found) {

                                    if (!firstPending) {
                                        firstPending = m;
                                    }

                                    lastPending = m;
                                }

                                d.setMonth(d.getMonth() + 1);
                            }

                            if (!firstPending) {
                                r.pending = "-";
                            } else {

                                const months = [
                                    "Jan","Feb","Mar","Apr","May","Jun",
                                    "Jul","Aug","Sep","Oct","Nov","Dec"
                                ];

                                r.pending =
                                    months[firstPending - 1] +
                                    (lastPending !== firstPending
                                        ? "-" + months[lastPending - 1]
                                        : "");
                            }
                        }

                        done++;

                        if (done === result.length) {
                            res.send(result);
                        }

                    }
                );

            });

        }

    );

});


// LOGIN API

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {

            if (err) {
                res.send(err);
                return;
            }

            if (result.length > 0) {
                res.send({ success: true });
            } else {
                res.send({ success: false });
            }

        }
    );

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});