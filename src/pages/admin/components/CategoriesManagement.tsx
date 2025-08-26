import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../service';
import type { Category, CreateCategoryInput } from '../interfaces';
import { Loader, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState<CreateCategoryInput>({
    name: '',
    description: '',
    isActive: true,
    slug: ''
  });
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();
  
  // Edit category modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryData, setEditCategoryData] = useState<CreateCategoryInput>({
    name: '',
    description: '',
    isActive: true,
    slug: ''
  });
  const [updating, setUpdating] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await createCategory(newCategory, token || undefined);
      setShowCreateForm(false);
      setNewCategory({
        name: '',
        description: '',
        isActive: true,
        slug: ''
      });
      await loadCategories(); // Refresh the list
      showToast('Category created successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      slug: category.slug
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await updateCategory(editingCategory.id, editCategoryData, token || undefined);
      setShowEditModal(false);
      setEditingCategory(null);
      await loadCategories();
      showToast('Category updated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await deleteCategory(categoryToDelete.id, token || undefined);
      await loadCategories();
      showToast('Category deleted successfully!', 'success');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      showToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Categories</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <form onSubmit={handleCreateCategory}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
              >
                {creating ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-my-primary animate-spin mr-2" />
          <span className="text-gray-500">Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No categories found. Create one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Created At</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{category.description}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="p-1 text-gray-600 hover:text-my-primary transition-colors"
                        title="Edit category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Pencil className="w-6 h-6 text-my-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Category: {editingCategory.name}
                </h2>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleUpdateCategory}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editCategoryData.name}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      required
                      value={editCategoryData.slug}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={editCategoryData.description}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editCategoryData.isActive}
                        onChange={(e) => setEditCategoryData({ ...editCategoryData, isActive: e.target.checked })}
                        className="mr-2 rounded border-gray-300 text-my-primary focus:ring-my-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-my-primary hover:bg-my-primary/80 text-white px-6 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Trash2 className="w-6 h-6 text-red-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Delete Category</h2>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete <strong>{categoryToDelete.name}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Trash2 className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-700 font-medium mb-1">Warning</p>
                      <p className="text-sm text-red-600">
                        This action cannot be undone. All data associated with this category will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement; 