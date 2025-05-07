const Task = require("../models/Task");

const addNewTask = async (req, res) => {
  const { title, description, status, userId, priority } = req.body;
  if (userId !== req.userId) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized user" });
  }
  if (!title || !description || !status || !userId || !priority)
    return res.status(400).json({
      success: false,
      message: "Please make you fill up all the fields",
    });

  try {
    const newTask = await Task.create({
      title,
      description,
      status,
      userId,
      priority,
    });
    if (newTask)
      return res.status(201).json({
        success: true,
        message: "New task successfully created",
        // task: newTask,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const getAllTask = async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId === "undefined") {
    return res
      .status(400)
      .json({ success: false, message: "Valid user ID is required" });
  }
  try {
    const getTasksByUserId = await Task.find({ userId });
    if (getTasksByUserId)
      return res.status(200).json({ success: true, tasks: getTasksByUserId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, userId, priority } = req.body;

  try {
    // Validate taskId and inputs
    if (!taskId) {
      return res
        .status(400)
        .json({ success: false, message: "Task ID is required" });
    }
    if (!title || !status || !priority) {
      return res.status(400).json({
        success: false,
        message: "Title, status, and priority are required",
      });
    }
    if (userId !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized user" });
    }
    const updatedTask = await Task.findByIdAndUpdate(
      { _id: taskId, userId: req.userId },
      { title, description, status, priority },
      { new: true }
    );
    if (!updatedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found or unauthorized" });
    }
    if (updateTask)
      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task: updatedTask,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  // Validate taskId
  if (!taskId) {
    return res
      .status(400)
      .json({ success: false, message: "Task ID is required" });
  }
  try {
    const deletedTask = await Task.findByIdAndDelete({
      _id: taskId,
      userId: req.userId,
    });
    if (!deletedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    if (deleteTask)
      return res
        .status(200)
        .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addNewTask,
  getAllTask,
  deleteTask,
  updateTask,
};
