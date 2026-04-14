import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Paper,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { toast } from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { getAllExpenses, updateExpenseStatus } from "../api/expense";
import Papa from "papaparse";
import Grid from '@mui/material/Grid';

const AdminPanel = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    user: "",
    startDate: "",
    endDate: "",
  });
  const [sortOption, setSortOption] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState("");
  const [selectedExpenseId, setSelectedExpenseId] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchAll = async () => {
    try {
      const res = await getAllExpenses();
      setExpenses(res.data);
      setFilteredExpenses(res.data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status, rejectionReason = "") => {
    try {
      await updateExpenseStatus(id, status, rejectionReason);
      toast.success(`Marked as ${status}`);
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  const handleRejectClick = (id) => {
    setSelectedExpenseId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    await handleStatusChange(selectedExpenseId, "rejected", rejectReason);
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }

    const csv = Papa.unparse(
      filteredExpenses.map((e) => ({
        ID: e._id,
        Amount: e.amount,
        Category: e.category,
        Status: e.status,
        "Rejection Reason": e.rejectionReason || "",
        "User Name": e.user?.name || "",
        "User Email": e.user?.email || "",
        Date: new Date(e.date).toLocaleDateString(),
        Notes: e.notes || "",
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "expenses.csv");
    link.click();
  };

  useEffect(() => {
    const filtered = expenses.filter((expense) => {
      const matchStatus = filters.status
        ? expense.status === filters.status
        : true;

      const matchCategory = filters.category
        ? expense.category === filters.category
        : true;

      const matchUser = filters.user
        ? expense.user?.name
          .toLowerCase()
          .includes(filters.user.toLowerCase())
        : true;

      const expenseDate = new Date(expense.date);
      const matchStartDate = filters.startDate
        ? expenseDate >= new Date(filters.startDate)
        : true;

      const matchEndDate = filters.endDate
        ? expenseDate <= new Date(filters.endDate)
        : true;

      return (
        matchStatus &&
        matchCategory &&
        matchUser &&
        matchStartDate &&
        matchEndDate
      );
    });

    let sortedExpenses = [...filtered];

    if (sortOption === "category") {
      sortedExpenses = sortedExpenses.sort((a, b) =>
        a.category.localeCompare(b.category)
      );
    } else if (sortOption === "user") {
      sortedExpenses = sortedExpenses.sort((a, b) =>
        (a.user?.name || "").localeCompare(b.user?.name || "")
      );
    }

    if (sortOrder === "desc") {
      sortedExpenses.reverse();
    }

    setFilteredExpenses(sortedExpenses);
  }, [filters, expenses, sortOption, sortOrder]);

  useEffect(() => {
    fetchAll();
  }, []);

  const categories = [...new Set(expenses.map((e) => e.category))];
  const users = [...new Set(expenses.map((e) => e.user?.name).filter(Boolean))];

  const handleOpenReceipt = (id, url) => {
    setSelectedExpenseId(id);
    setSelectedReceiptUrl(url);
    setReceiptDialogOpen(true);
  };

  const handleCloseReceipt = () => {
    setReceiptDialogOpen(false);
    setSelectedReceiptUrl("");
    setSelectedExpenseId("");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        Admin Panel – All Expenses
      </Typography>

      {/* FILTERS */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} columns={12} justifyContent="center">
          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>

          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid sx={{ gridColumn: 'span 2' }}>
            <Autocomplete
              freeSolo
              options={users}
              value={filters.user}
              onInputChange={(event, value) => setFilters({ ...filters, user: value })}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="User Name"
                  fullWidth
                  sx={{ minWidth: 200 }}
                />
              )}
            />
          </Grid>

          <Grid sx={{ gridColumn: 'span 3' }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={{ minWidth: 200 }}
            />
          </Grid>

          <Grid sx={{ gridColumn: 'span 3' }}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={{ minWidth: 200 }}
            />
          </Grid>

          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              select
              label="Sort By"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="category">Category</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </TextField>
          </Grid>

          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              select
              label="Order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="asc">A → Z</MenuItem>
              <MenuItem value="desc">Z → A</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* CSV BUTTON SECTION */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportCSV}
          startIcon={<DownloadIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            px: 3,
            py: 1,
          }}
        >
          Export CSV
        </Button>
      </Box>

      {/* EXPENSE LIST */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress size={50} />
        </Box>
      ) : filteredExpenses.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No expenses match the filters.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredExpenses.map((expense) => (
            <Grid key={expense._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {expense.category}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Amount:</strong> ₹{expense.amount}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          expense.status === "approved"
                            ? "green"
                            : expense.status === "rejected"
                              ? "red"
                              : "#666",
                        fontWeight: 600,
                      }}
                    >
                      {expense.status}
                    </span>
                  </Typography>
                  {expense.status === "rejected" && expense.rejectionReason && (
                    <Typography color="error">
                      <strong>Rejection Reason:</strong> {expense.rejectionReason}
                    </Typography>
                  )}
                  <Typography color="text.secondary">
                    <strong>User:</strong> {expense.user?.name}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Email:</strong> {expense.user?.email}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Date:</strong>{" "}
                    {new Date(expense.date).toLocaleDateString()}
                  </Typography>
                  {expense.notes && (
                    <Typography color="text.secondary">
                      <strong>Note:</strong> {expense.notes}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={2} mt={3}>
                  {expense.receiptUrl && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenReceipt(expense._id, expense.receiptUrl)}
                    >
                      View Receipt
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      handleStatusChange(expense._id, "approved")
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => handleRejectClick(expense._id)}
                  >
                    Reject
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={receiptDialogOpen} onClose={handleCloseReceipt} maxWidth="md" fullWidth>
        <DialogTitle>Receipt Preview</DialogTitle>
        <DialogContent sx={{ p: 0, minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {selectedReceiptUrl ? (
            <img
              src={selectedReceiptUrl}
              alt="Receipt preview"
              style={{ width: "100%", maxHeight: 600, objectFit: "contain" }}
            />
          ) : (
            <Typography sx={{ p: 4 }}>No receipt available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceipt}>Close</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleStatusChange(selectedExpenseId, "approved");
              handleCloseReceipt();
            }}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleRejectClick(selectedExpenseId);
              handleCloseReceipt();
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Expense</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectSubmit}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
