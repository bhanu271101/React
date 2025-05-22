import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Gallery from "./pages/Gallery";
import PDP from "./pages/PDP";
import ThankYou from "./pages/ThankYou";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";
import Navbar from "./components/NavBar";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import WelcomePage from "./pages/WelcomePage";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";
import OrderManagementDashboard from "./components/OrderManagementDashboard";
import 'bootstrap/dist/css/bootstrap.min.css';
import PaymentPage from "./pages/PaymentPage";
import ChangeAddressPage from "./pages/ChangeAddressPage";
// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue color
    },
    secondary: {
      main: '#dc004e', // Pink color
    },
    background: {
      default: '#f5f5f5', // Light gray background
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Buttons won't have uppercase text
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar isLoggedIn={isLoggedIn} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/product/:id" element={<PDP />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/orderspage" element={<OrdersPage />} />
          <Route path="/cartpage" element={<CartPage />} />
          <Route path="/orderdetailspage/:orderId" element={<OrderDetailsPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/addAddress" element={<AddressPage/>}/>
          <Route path="/hubpage" element={<OrderManagementDashboard/>}/>
          <Route path="/payment" element={<PaymentPage/>}/>
          <Route path="/changeaddress" element={<ChangeAddressPage/>}/>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;