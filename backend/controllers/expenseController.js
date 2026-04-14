import Expense from "../models/Expense.js";
import AuditLog from "../models/AuditLog.js";

// Add an expense
export const addExpense = async (req, res) => {
  try {
    const expenseData = { ...req.body, user: req.user._id };
    if (req.file) {
      expenseData.receiptUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const expense = await Expense.create(expenseData);

    // Log the creation to AuditLog
    await AuditLog.create({
      action: "Expense Added",
      user: req.user._id,
      targetUser: req.user._id,
      userRole: req.user.role,
      details: `${req.user.name} (${req.user.email}) added a new expense of ₹${expense.amount} for ${expense.category}`,
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Add Expense Error:", err.message);
    res.status(400).json({ message: "Failed to add expense" });
  }
};

// Get all expenses for the current user (sorted by expense date descending)
export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error("Get My Expenses Error:", err.message);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// Admin: Get all expenses (sorted by expense date descending)
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("user", "name email")
      .sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    console.error("Get All Expenses Error:", err.message);
    res.status(500).json({ message: "Failed to fetch all expenses" });
  }
};

// User: Update rejected expense and resubmit
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this expense" });
    }

    if (expense.status !== "rejected" && expense.status !== "pending") {
      return res.status(400).json({ message: "Only pending or rejected expenses can be updated" });
    }

    const { category, amount, date, notes } = req.body;

    if (category) expense.category = category;
    if (amount) {
      const parsedAmount = parseFloat(amount);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than zero" });
      }
      expense.amount = parsedAmount;
    }
    if (date) expense.date = date;
    if (notes !== undefined) expense.notes = notes;

    if (req.file) {
      expense.receiptUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    expense.status = "pending";
    expense.rejectionReason = "";

    await expense.save();

    await AuditLog.create({
      user: req.user._id,
      targetUser: req.user._id,
      action: "Expense Resubmitted",
      userRole: req.user.role,
      details: `${req.user.email} updated and resubmitted expense ₹${expense.amount} for ${expense.category}`,
    });

    res.status(200).json({ message: "Expense updated and resubmitted", expense });
  } catch (err) {
    console.error("Update Expense Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin: Update expense status
export const updateExpenseStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;

  const allowedStatuses = ["pending", "approved", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  try {
    const expense = await Expense.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const prevStatus = expense.status;

    if (prevStatus === status) {
      return res.status(200).json({ message: `Status already '${status}'` });
    }

    expense.status = status;
    expense.rejectionReason = status === "rejected" ? rejectionReason : "";
    await expense.save();

    await AuditLog.create({
      user: req.user._id,
      targetUser: expense.user._id,
      action: `Expense ${status}`,
      userRole: req.user.role,
      details: `Admin ${req.user.email} changed status of expense ₹${expense.amount} from ${prevStatus} to ${status} for user ${expense.user.email}`,
    });

    res.status(200).json({ message: "Expense status updated", expense });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
