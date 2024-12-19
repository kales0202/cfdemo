export const onRequestGet = async (context) => {
  console.log('customer get!')
  try {
    const customers = await context.env.DB.prepare('SELECT * FROM Customers').all()
    return new Response(
      JSON.stringify({
        code: 0,
        data: customers.results,
        msg: 'success',
      }),
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        code: 500,
        data: null,
        msg: error.message,
      }),
      { status: 500 },
    )
  }
}

export const onRequestPost = async (context) => {
  try {
    const { CompanyName, ContactName } = await context.request.json()
    console.log('create customer!', CompanyName, ContactName)
    const customers = await context.env.DB.prepare(
      'INSERT INTO Customers (CompanyName, ContactName) VALUES (?, ?) RETURNING *',
    )
      .bind(CompanyName, ContactName)
      .run()
    return new Response(
      JSON.stringify({
        code: 0,
        data: customers.results[0],
        msg: 'success',
      }),
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        code: 500,
        data: null,
        msg: error.message,
      }),
      { status: 500 },
    )
  }
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
