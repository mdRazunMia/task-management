const express = require("express");
const router = express.Router();

const columnController = require("../controllers/columnController");

router.post("/create", columnController.createColumn);
router.get("/list", columnController.getColumns);
router.get("/list/:id", columnController.getSingleColumn);
router.delete("/delete/:id", columnController.deleteSingleColumn);
router.put("/edit/:id", columnController.editColumn);

module.exports = router;
