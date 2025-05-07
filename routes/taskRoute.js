const express = require("express");
const {
  addNewTask,
  getAllTask,
  deleteTask,
  updateTask,
} = require("../controllers/taskController");

const router = express.Router();

router.post("/", addNewTask);
router.get("/:userId", getAllTask);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

module.exports = router;
