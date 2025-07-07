

export type ApiResponseObject<T> = {

    data:T|null,
    error:string|null,
    success:boolean


}