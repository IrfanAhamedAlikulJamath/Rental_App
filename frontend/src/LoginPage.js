import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();


  const login = () => {

    setError("");

    axios.post("http://localhost:5000/login", {

      username,
      password

    })
    .then(res => {

      if (res.data.success) {

        navigate("/dashboard");

      } else {

        setError("Incorrect username or password");

      }

    })
    .catch(() => {

      setError("Server error");

    });

  };


  return (

    <div
      style={{
        height: "100vh",
        background: "#f2f2f2",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: "80px"
      }}
    >

      <div style={{ textAlign: "center", marginBottom: "10px" }}>

        <img
          src={logo}
          alt="logo"
          style={{
            width: "200px",
            height: "auto",
            marginBottom: "10px"
          }}
        />

      </div>


      {/* form added */}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
        style={{
          width: "420px",
          padding: "30px",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 0 10px gray"
        }}
      >

        <h3 style={{ textAlign: "center" }}>
          Login
        </h3>


        <input
          className="form-control mt-3"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />


        <input
          type="password"
          className="form-control mt-3"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />


        {error && (

          <div
            style={{
              color: "red",
              marginTop: "10px",
              fontSize: "14px"
            }}
          >
            {error}
          </div>

        )}


        <button
          type="submit"
          className="btn btn-primary mt-3 w-100"
        >
          Login
        </button>

      </form>

    </div>

  );

}

export default LoginPage;