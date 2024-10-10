import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import MapScreen from './screens/MapScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import TicketListScreen from './screens/TicketListScreen';
import TicketCreateScreen from './screens/TicketCreateScreen';
import TicketDetailScreen from './screens/TicketDetailScreen';
import OptometristListScreen from './screens/OptometristListScreen';
import OptometristCreateScreen from './screens/OptometristCreateScreen';
import OptometristEditScreen from './screens/OptometristEditScreen';

import PrescriptionListScreen from './screens/PrescriptionListScreen';
import PrescriptionCreateScreen from './screens/PrescriptionCreateScreen';
import PrescriptionEditScreen from './screens/PrescriptionEditScreen';


import AppointmentListScreen from './screens/AppointmentListScreen';
import AppointmentCreateScreen from './screens/AppointmentCreateScreen';
import AppointmentEditScreen from './screens/AppointmentEditScreen';
// Import Digital Library Screens
import DigitalLibraryListScreen from './screens/DigitalLibraryListScreen';
import DigitalLibraryCreateScreen from './screens/DigitalLibraryCreateScreen';
import DigitalLibraryEditScreen from './screens/DigitalLibraryEditScreen';
import DigitalLibraryDetailScreen from './screens/DigitalLibraryDetailScreen';

import TicketEditScreen from './screens/TicketEditScreen';
import PaymentListScreen from './screens/PaymentListScreen';
import CardDetailsScreen from './screens/CardDetailsScreen';

import UserTicketListScreen from './screens/UserTicketListScreen ';
import UserAppointmentScreen from './screens/UserAppointmentScreen';


function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };
  
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox
            ? 'site-container d-flex flex-column full-box'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>

              <LinkContainer to="/">
                <Navbar.Brand>ICare</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />
                <Nav className="me-auto w-100 justify-content-end">
                  <Link to="/cart" className="nav-link">
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                      {/* Optometrists Management Links */}
                      <LinkContainer to="/admin/optometrists">
                        <NavDropdown.Item>Optometrists</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/optometrist/create">
                        <NavDropdown.Item>Create Optometrist</NavDropdown.Item>
                      </LinkContainer>
                      {/* Prescriptions Management Links */}
                      <LinkContainer to="/admin/prescriptions">
                        <NavDropdown.Item>Prescriptions</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/prescription/create">
                        <NavDropdown.Item>Create Prescription</NavDropdown.Item>
                      </LinkContainer>
                      {/* Appointments Management Links */}
                      <LinkContainer to="/admin/appointments">
                        <NavDropdown.Item>Manage Appointments</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/payment-list">
                        <NavDropdown.Item>Manage Payments</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                  {/* Tickets Navigation */}
                  <NavDropdown title="Tickets" id="ticket-nav-dropdown">
  {userInfo && userInfo.isAdmin ? (
    // Admin view
    <LinkContainer to="/admin/tickets">
      <NavDropdown.Item>Tickets</NavDropdown.Item>
    </LinkContainer>
  ) : (
    // Regular user view
    <>
      <LinkContainer to="/tickets">
        <NavDropdown.Item>My Tickets</NavDropdown.Item>
      </LinkContainer>
      <LinkContainer to="/ticket/create">
        <NavDropdown.Item>Create Ticket</NavDropdown.Item>
      </LinkContainer>
    </>
  )}
</NavDropdown>


                  {/* Appointments Navigation */}
                  {userInfo && !userInfo.isAdmin && (
  <NavDropdown title="Appointments" id="appointments-nav-dropdown">
    <LinkContainer to="/appointment/create">
      <NavDropdown.Item>Book Appointment</NavDropdown.Item>
    </LinkContainer>
  </NavDropdown>
)}


                  <NavDropdown title="Digital Library" id="digital-library-nav-dropdown">
  {/* Visible to all users */}
  <LinkContainer to="/digital-library">
    <NavDropdown.Item>View Resources</NavDropdown.Item>
  </LinkContainer>

  {/* Admin-specific links */}
  {userInfo && userInfo.isAdmin && (
    <>
      <LinkContainer to="/admin/digital-library/create">
        <NavDropdown.Item>Create Resource</NavDropdown.Item>
      </LinkContainer>
    </>
  )}
</NavDropdown>

                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{ pathname: '/search', search: `category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/forget-password" element={<ForgetPasswordScreen />} />
              <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payment-list"
                element={
                  <AdminRoute>
                    <PaymentListScreen/>
                  </AdminRoute>
                }
              />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/carddetails" element={<CardDetailsScreen />} />

              <Route path="/payment" element={<PaymentMethodScreen />} />
              {/* Optometrist Management Routes */}
<Route
  path="/admin/optometrists"
  element={
    <AdminRoute>
      <OptometristListScreen />
    </AdminRoute>
  }
/>

<Route
    path="/admin/ticket/:id/edit"
    element={
      <AdminRoute>
        <TicketEditScreen />
      </AdminRoute>
    }
  />
<Route
  path="/admin/optometrist/create"
  element={
    <AdminRoute>
      <OptometristCreateScreen />
    </AdminRoute>
  }
/>
<Route
  path="/admin/optometrist/:id"
  element={
    <AdminRoute>
      <OptometristEditScreen />
    </AdminRoute>
  }
/>
{/* Digital Library Routes */}
<Route path="/digital-library" element={<DigitalLibraryListScreen />} />
  <Route path="/digital-library/:id" element={<DigitalLibraryDetailScreen />} />

  {/* Admin Routes */}
  <Route
    path="/admin/digital-library/create"
    element={
      <AdminRoute>
        <DigitalLibraryCreateScreen />
      </AdminRoute>
    }
  />
  <Route
    path="/admin/digital-library/:id/edit"
    element={
      <AdminRoute>
        <DigitalLibraryEditScreen />
      </AdminRoute>
    }
  />

{/* Prescription Management Routes */}
<Route
  path="/admin/prescription/:id"
  element={
    <AdminRoute>
      <PrescriptionEditScreen />
    </AdminRoute>
  }
/>

{/* Appointment Management Routes */}
<Route
  path="/appointments"
  element={
    <ProtectedRoute>
      <UserAppointmentScreen/>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/appointments"
  element={
    <AdminRoute>
      <AppointmentListScreen />
    </AdminRoute>
  }
/>
<Route
  path="/appointment/create"
  element={
    <ProtectedRoute>
      <AppointmentCreateScreen />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/appointment/:id"
  element={
    <AdminRoute>
      <AppointmentEditScreen />
    </AdminRoute>
  }
/>


              {/* User routes */}
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute>
                    <TicketListScreen />
                  </ProtectedRoute>
                }
              />

<Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <UserTicketListScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket/create"
                element={
                  <ProtectedRoute>
                    <TicketCreateScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket/:id"
                element={
                  <ProtectedRoute>
                    <TicketDetailScreen />
                  </ProtectedRoute>
                }
              />

              {/* Appointments Routes */}
              
              <Route
                path="/appointment/create"
                element={
                  <ProtectedRoute>
                    <AppointmentCreateScreen />
                  </ProtectedRoute>
                }
              />

             
              <Route
                path="/admin/appointment/:id"
                element={
                  <AdminRoute>
                    <AppointmentEditScreen />
                  </AdminRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              />

              {/* Prescription Management Routes */}
<Route
  path="/admin/prescriptions"
  element={
    <AdminRoute>
      <PrescriptionListScreen />
    </AdminRoute>
  }
/>
<Route
  path="/admin/prescription/create"
  element={
    <AdminRoute>
      <PrescriptionCreateScreen />
    </AdminRoute>
  }
/>

              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              />

              <Route path="/" element={<HomeScreen />} />
            </Routes>
          </Container>
        </main>
        <footer>
          <Container>
            <div className="container">
              <div className="row">
                <div className="col-md-4">
                  <h4>Contact Us</h4>
                  <ul>
                    <li>Address: Colombo 07, Sri Lanka</li>
                    <li>Phone: (076) 292-9623</li>
                    <li>Email: infoICare@OptometristsShop.com</li>
                  </ul>
                </div>

                <div className="col-md-4">
                  <h4>Quick links</h4>
                  <ul>
                    <li><a href="http://localhost:3000/">Home</a></li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h4>Follow Us</h4>
                  <ul>
                    <li><a href="https://www.facebook.com">Facebook</a></li>
                    <li><a href="https://www.twitter.com">Twitter</a></li>
                    <li><a href="https://www.instagram.com">Instagram</a></li>
                  </ul>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p className="text-center">&copy; 2023 ICare Optometrists Shop. All rights reserved.</p>
                </div>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
