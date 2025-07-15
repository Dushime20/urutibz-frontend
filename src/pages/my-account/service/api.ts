import axios from 'axios';

export async function createProduct(productData: any) {
  const token = localStorage.getItem('token');
  const response = await axios.post('http://localhost:3000/api/v1/products', productData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function createProductImage(imageData: any) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  for (const key in imageData) {
    formData.append(key, imageData[key]);
  }
  const response = await axios.post('http://localhost:3000/api/v1/product-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.data;
}
