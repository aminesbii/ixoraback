import * as categoryService from "../services/category.service.js";

// ─── GET ALL / FILTERED ─────────────────────────────────────────────────────
export const list = async (req, res) => {
  try {
    const { active_only, parent_id } = req.query;
    const categories = await categoryService.getAllCategories({
      activeOnly: active_only === "true",
      parentId: parent_id || undefined,
    });
    res.json(categories);
  } catch (err) {
    console.error("[Category] List error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET TREE ───────────────────────────────────────────────────────────────
export const tree = async (_req, res) => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.json(tree);
  } catch (err) {
    console.error("[Category] Tree error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET BY SLUG ─────────────────────────────────────────────────────────────
export const getBySlug = async (req, res) => {
  try {
    const cat = await categoryService.getCategoryBySlug(req.params.slug);
    if (!cat) return res.status(404).json({ message: "Category not found." });
    res.json(cat);
  } catch (err) {
    console.error("[Category] GetBySlug error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
  try {
    const cat = await categoryService.getCategoryById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found." });
    res.json(cat);
  } catch (err) {
    console.error("[Category] GetById error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── CREATE (admin) ─────────────────────────────────────────────────────────
export const create = async (req, res) => {
  try {
    const cat = await categoryService.createCategory(req.body);
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category slug already exists." });
    }
    console.error("[Category] Create error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── UPDATE (admin) ─────────────────────────────────────────────────────────
export const update = async (req, res) => {
  try {
    const cat = await categoryService.updateCategory(req.params.id, req.body);
    if (!cat) return res.status(404).json({ message: "Category not found." });
    res.json(cat);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category slug already exists." });
    }
    console.error("[Category] Update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── DELETE (admin) ─────────────────────────────────────────────────────────
export const remove = async (req, res) => {
  try {
    const cat = await categoryService.deleteCategory(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found." });
    res.json({ message: "Category deleted.", category: cat });
  } catch (err) {
    console.error("[Category] Delete error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
