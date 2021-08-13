import * as express from "express";
import AdminController from "../controllers/admin.controller";
import InvoiceController from "../controllers/invoice.controller";
import ProductController from "../controllers/product.controller";
import UserController from "../controllers/user.controller";
import adminAuth from "../middleware/adminAuth";
import userAuth from "../middleware/userAuth";
const router = express.Router();

// user
router.post("/user/register", UserController.register);
router.post("/user/login", UserController.login);
router.get("/user/users", adminAuth, UserController.getAllUsers);
router.get("/user/:id", UserController.getUser);

// product
router.get("/product", adminAuth, ProductController.getAll);
router.post("/product", adminAuth, ProductController.addOne);
router.put("/product/:id", adminAuth, ProductController.update);
// for user
router.get("/productAll", ProductController.getAllForUser);
router.get("/product/:id", ProductController.getOne);

//invoices
router.post("/invoice", userAuth, InvoiceController.makeInvoices);
router.get("/invoice/:id", userAuth, InvoiceController.getInvoice);
router.get("/invoiceAll", userAuth, InvoiceController.getAll);
router.get("/invoice", userAuth, InvoiceController.getByUser);

// admin
router.post("/admin", AdminController.createAccount);
router.get("/admin", adminAuth, AdminController.getAll);
router.post("/admin/login", AdminController.login);

export default router;
