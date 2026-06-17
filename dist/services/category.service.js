import prisma from "../config/prisma.js";
// ─── GET ALL (with optional filters) ──────────────────────────────────────────
export const getAllCategories = async ({ activeOnly = false, parentId } = {}) => {
    const where = {};
    if (activeOnly)
        where.is_active = true;
    if (parentId !== undefined)
        where.parent_id = parentId;
    return prisma.category.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });
};
// ─── GET TREE (nested) ───────────────────────────────────────────────────────
export const getCategoryTree = async () => {
    const all = await prisma.category.findMany({
        where: { is_active: true },
        orderBy: { sort_order: 'asc' }
    });
    const map = {};
    const roots = [];
    for (const cat of all) {
        map[cat.id] = { ...cat, children: [] };
    }
    for (const cat of all) {
        const node = map[cat.id];
        if (cat.parent_id && map[cat.parent_id]) {
            map[cat.parent_id].children.push(node);
        }
        else {
            roots.push(node);
        }
    }
    return roots;
};
// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getCategoryById = async (id) => {
    try {
        return await prisma.category.findUnique({ where: { id } });
    }
    catch (e) {
        return null;
    }
};
// ─── GET BY SLUG ─────────────────────────────────────────────────────────────
export const getCategoryBySlug = async (slug) => {
    try {
        return await prisma.category.findUnique({ where: { slug } });
    }
    catch (e) {
        return null;
    }
};
// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createCategory = async (data) => prisma.category.create({ data });
// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateCategory = async (id, data) => {
    try {
        return await prisma.category.update({ where: { id }, data });
    }
    catch (e) {
        return null;
    }
};
// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteCategory = async (id) => {
    try {
        const cat = await prisma.category.findUnique({ where: { id } });
        if (cat) {
            await prisma.category.updateMany({
                where: { parent_id: id },
                data: { parent_id: cat.parent_id }
            });
        }
        return await prisma.category.delete({ where: { id } });
    }
    catch (e) {
        return null;
    }
};
