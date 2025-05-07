const mongoose = require("mongoose");

const taskShema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, required: true },
});
module.exports = mongoose.model("Task", taskShema);
