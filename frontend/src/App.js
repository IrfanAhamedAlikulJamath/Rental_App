import { useEffect, useState } from "react";
import axios from "axios";

import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import PropertyPage from "./PropertyPage";
import TenantPage from "./TenantPage";
import ReportPage from "./ReportPage";
import LoginPage from "./LoginPage";


function App() {

  const [data, setData] = useState({
    total_income: 0,
    total_expense: 0,
    total_profit: 0,
    current_income: 0,
    current_expense: 0,
    current_profit: 0
  });

  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState("");


  // load dashboard
  useEffect(() => {

    axios.get("http://localhost:5000/dashboard")
      .then(res => setData(res.data));

    loadProperties();

  }, []);


  // load properties
  const loadProperties = () => {

    axios.get("http://localhost:5000/properties")
      .then(res => setProperties(res.data));

  };


  // add property
  const addProperty = () => {

    if (!newProperty) return;

    axios.post("http://localhost:5000/properties", {
      name: newProperty
    }).then(() => {

      setNewProperty("");
      loadProperties();

    });

  };


  return (

    <Routes>

      {/* DEFAULT → LOGIN */}
      <Route path="/" element={<Navigate to="/login" />} />


      {/* LOGIN */}
      <Route path="/login" element={<LoginPage />} />


      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <Dashboard
            data={data}
            properties={properties}
            newProperty={newProperty}
            setNewProperty={setNewProperty}
            addProperty={addProperty}
          />
        }
      />


      <Route path="/property/:id" element={<PropertyPage />} />
      <Route path="/unit/:id" element={<TenantPage />} />
      <Route path="/report" element={<ReportPage />} />


    </Routes>

  );

}

export default App;