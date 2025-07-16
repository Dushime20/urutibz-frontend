import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
export async function createProduct(productData: any) {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/products`, productData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function createProductImage(imageData: any) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
console.log(imageData,'image data')
  // Append each image file as 'images'
  if (Array.isArray(imageData.images)) {
    for (const file of imageData.images) {
      formData.append('images', file);
    }
  }

  // Append other fields if present
  if (imageData.product_id) formData.append('product_id', imageData.product_id);
  if (imageData.alt_text) formData.append('alt_text', imageData.alt_text);
  if (imageData.sort_order) formData.append('sort_order', imageData.sort_order);
  if (imageData.isPrimary) formData.append('isPrimary', imageData.isPrimary);
  console.log(formData,'data to send in db')

  const response = await axios.post(
    `${API_BASE_URL}/product-images/multiple`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return response.data;
}

export async function getMyProducts() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/products/my/products`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
//   console.log(response.data.data)
  return response.data.data.data;
}

export async function getProductImagesByProductId(productId: string) {
  const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`);

  return response.data.data;
}

export async function getProductById(productId: string) {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  console.log(response.data.data,'data from single  product')
  return response.data.data;
}
