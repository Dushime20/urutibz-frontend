import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface Product {
  title: string;
  booking_count: number;
  category_name?: string; // Optional category name
}

interface ProductCategoriesChartProps {
  topProducts: Product[];
}

const ProductCategoriesChart: React.FC<ProductCategoriesChartProps> = ({ topProducts }) => {
  // Use category from product data or default to product title
  const categoryData = topProducts.map(p => ({
    name: p.category_name || p.title,
    value: p.booking_count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-4">Product Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductCategoriesChart; 