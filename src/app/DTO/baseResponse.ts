export class baseResponse<T> {



    "isSucceeded": boolean
    "message": string
    "data": T[]
    "totalRecords": number
    "totalPages":number 
    "pageNumber": number
    "pageSize": number
}