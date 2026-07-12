import express from 'express';
import cors from 'cors';
import * as store from './store';

// Import Route modules
import authRoutes from './routes/auth.routes';
import departmentRoutes from './routes/departments.routes';
import categoryRoutes from './routes/categories.routes';
import employeeRoutes from './routes/employees.routes';
import assetRoutes from './routes/assets.routes';
import allocationRoutes from './routes/allocations.routes';
import bookingRoutes from './routes/bookings.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import auditRoutes from './routes/audits.routes';
import notificationRoutes from './routes/notifications.routes';
import reportRoutes from './routes/reports.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = 5000;

// Enable CORS for frontend origin (Vite dev server on port 3000)
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  })
);

// Body parsing middleware
app.use(express.json());

// Initialize in-memory database store
store.loadStore();

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes); // handles return and transfers too
app.use('/api/transfers', allocationRoutes); // alias for transfer endpoints
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// General health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Bind to port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AssetFlow Backend listening on http://localhost:${PORT}`);
});
