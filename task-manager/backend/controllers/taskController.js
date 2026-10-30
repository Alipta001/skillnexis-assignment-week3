const mongoose = require("mongoose");
const Task = require("../models/Task");
class TaskController {
  static async createTask(req, res) {
    try {
      const {
        title,
        description = "",
        status = "pending",
        dueDate = null,
        imageUrl = "",
      } = req.body;
      if (typeof title !== "string" || !title.trim())
        return res
          .status(400)
          .json({ success: false, message: "A non-empty title is required" });
      const task = await Task.create({
        title: title.trim(),
        description,
        status,
        dueDate: dueDate || null,
        imageUrl,
        user: req.user._id,
      });
      return res
        .status(201)
        .json({ success: true, message: "Task created", task });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  static async getTasks(req, res) {
    try {
      const { status = "all", search = "" } = req.query;
      if (!["all", "pending", "in-progress", "completed"].includes(status))
        return res
          .status(400)
          .json({ success: false, message: "Invalid status filter" });
      const filter = { user: req.user._id };
      if (status !== "all") filter.status = status;
      if (search.trim())
        filter.$or = [
          { title: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      const tasks = await Task.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to fetch tasks" });
    }
  }
  static async getTask(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid task ID" });
      const task = await Task.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      return res.json({ success: true, task });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to fetch task" });
    }
  }
  static async updateTask(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid task ID" });
      const updates = {};
      for (const key of [
        "title",
        "description",
        "status",
        "dueDate",
        "imageUrl",
      ])
        if (Object.hasOwn(req.body, key)) updates[key] = req.body[key];
      if (!Object.keys(updates).length)
        return res
          .status(400)
          .json({ success: false, message: "Provide a field to update" });
      if ("title" in updates) {
        if (typeof updates.title !== "string" || !updates.title.trim())
          return res
            .status(400)
            .json({ success: false, message: "Title must be non-empty" });
        updates.title = updates.title.trim();
      }
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        updates,
        { new: true, runValidators: true },
      );
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      return res.json({ success: true, message: "Task updated", task });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  static async deleteTask(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid task ID" });
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      return res.json({ success: true, message: "Task deleted" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to delete task" });
    }
  }
}
module.exports = TaskController;
