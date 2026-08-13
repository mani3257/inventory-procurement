import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Products from './Products';
import Warehouses from './Warehouses';
import Suppliers from './Suppliers';
import PurchaseRequests from './PurchaseRequests';
import PurchaseOrders from './PurchaseOrders';
import Profile from './Profile';
import Team from './Team';
import SupplierApprovals from './SupplierApprovals';

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-canvas">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchase-requests" element={<PurchaseRequests />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/team" element={<Team />} />
          <Route path="/supplier-approvals" element={<SupplierApprovals />} />
        </Routes>
      </main>
    </div>
  );
}