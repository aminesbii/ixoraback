import Category from "../models/category.model.js";

// ─── GET ALL (with optional filters) ──────────────────────────────────────────
export const getAllCategories = async ({ activeOnly = false, parentId } = {}) => {
  const filter = {};
  if (activeOnly) filter.is_active = true;
  if (parentId !== undefined) filter.parent_id = parentId;
  return Category.find(filter).sort({ sort_order: 1, name: 1 }).lean();
};

// ─── GET TREE (nested) ───────────────────────────────────────────────────────
export const getCategoryTree = async () => {
  const all = await Category.find({ is_active: true }).sort({ sort_order: 1 }).lean();
  const map = {};
  const roots = [];
  for (const cat of all) {
    map[cat._id.toString()] = { ...cat, children: [] };
  }
  for (const cat of all) {
    const node = map[cat._id.toString()];
    if (cat.parent_id && map[cat.parent_id.toString()]) {
      map[cat.parent_id.toString()].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getCategoryById = (id) => Category.findById(id).lean();

// ─── GET BY SLUG ─────────────────────────────────────────────────────────────
export const getCategoryBySlug = (slug) => Category.findOne({ slug }).lean();

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createCategory = (data) => Category.create(data);

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateCategory = (id, data) =>
  Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteCategory = async (id) => {
  // Re-parent children to this category's parent before deletion
  const cat = await Category.findById(id);
  if (cat) {
    await Category.updateMany({ parent_id: id }, { parent_id: cat.parent_id });
  }
  return Category.findByIdAndDelete(id);
};
