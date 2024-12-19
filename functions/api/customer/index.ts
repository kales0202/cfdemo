export const onRequestGet = async (context) => {
  console.log('customer get!')
  const customers = await context.env.DB.prepare('SELECT * FROM Customers').all()
  return new Response(JSON.stringify(customers))
}

export const onRequestPost = async (context) => {
  const { CompanyName, ContactName } = await context.request.json()
  console.log('create customer!', CompanyName, ContactName)
  const customers = await context.env.DB.prepare(
    'INSERT INTO Customers (CompanyName, ContactName) VALUES (?, ?) RETURNING *',
  )
    .bind(CompanyName, ContactName)
    .run()
  return new Response(JSON.stringify(customers))
}

export const onRequestPut = async (context) => {
  const { CustomerId, CompanyName, ContactName } = await context.request.json()
  console.log('update customer!', CustomerId, CompanyName, ContactName)
  const customers = await context.env.DB.prepare(
    'UPDATE Customers SET CompanyName = ?, ContactName = ? WHERE CustomerId = ? RETURNING *',
  )
    .bind(CompanyName, ContactName, CustomerId)
    .run()
  return new Response(JSON.stringify(customers))
}

export const onRequestDelete = async (context) => {
  const body = await context.request.json()
  const { CustomerId } = body

  if (!CustomerId) {
    return new Response('CustomerId is required', { status: 400 })
  }

  console.log('delete customer!', CustomerId)
  await context.env.DB.prepare('DELETE FROM Customers WHERE CustomerId = ?').bind(CustomerId).run()
  return new Response(JSON.stringify({ CustomerId }))
}
