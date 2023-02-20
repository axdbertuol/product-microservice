db.category.insertMany([
  {
    _id: '1',
    name: 'Furniture',
  },
])

db.product.insertMany([
  {
    _id: '1',
    name: 'Primeiro',
    description: 'Primeiro',
    price: 'Primeiro',
    categoryId: '1',
  },
  {
    _id: '2',
    name: 'Segundo',
    description: 'Primeiro',
    price: 'Primeiro',
    categoryId: '1',
  },
  {
    _id: '3',
    title: 'Terceiro',
  },
])
