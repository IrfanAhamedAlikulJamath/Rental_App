import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        justifyContent: "center",
        alignItems: "center"
      }}
    >

      <h1
        style={{
          fontWeight: "bold",
          fontStyle: "italic",
          fontSize: "40px",
          marginBottom: "20px"
        }}
      >
        HR Properties
      </h1>


      <div
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
          className="btn btn-primary mt-3 w-100"
          onClick={login}
        >
          Login
        </button>

      </div>

    </div>

  );

}

export default LoginPage;