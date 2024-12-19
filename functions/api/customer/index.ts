import { createResponse, createErrorResponse } from '../../utils/response'

export const onRequestGet = async (context) => {
  console.log('customer get!')
  try {
    const customers = await context.env.DB.prepare('SELECT * FROM Customers').all()
    return createResponse(customers.results)
  } catch (error) {
    return createErrorResponse(error)
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
    return createResponse(customers.results[0])
  } catch (error) {
    return createErrorResponse(error)
  }
}

export const onRequestPut = async (context) => {
  try {
    const { CustomerId, CompanyName, ContactName } = await context.request.json()
    console.log('update customer!', CustomerId, CompanyName, ContactName)
    const customers = await context.env.DB.prepare(
      'UPDATE Customers SET CompanyName = ?, ContactName = ? WHERE CustomerId = ? RETURNING *',
    )
      .bind(CompanyName, ContactName, CustomerId)
      .run()
    return createResponse(customers.results[0])
  } catch (error) {
    return createErrorResponse(error)
  }
}

export const onRequestDelete = async (context) => {
  try {
    const { CustomerId } = await context.request.json()
    if (!CustomerId) {
      return createErrorResponse(null, 'CustomerId is required', 400, 400)
    }
    console.log('delete customer!', CustomerId)
    await context.env.DB.prepare('DELETE FROM Customers WHERE CustomerId = ?')
      .bind(CustomerId)
      .run()
    return createResponse()
  } catch (error) {
    return createErrorResponse(error)
  }
}
