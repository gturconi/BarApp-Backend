import { Request, Response } from "express";
import sharp from "sharp";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import pool from "../../shared/db/conn";
import * as QueryConstants from "./queryConstants";

import { handleServerError } from "../../shared/errorHandler";

import { EntityListResponse } from "../../shared/models/entity.list.response.model";
import { Product } from "../models/product";
import { ProductPrice } from "../models/price";


export const getProducts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    const search = (req.query.search as string) || "";

    try{
        const [totalRows] = await pool.query<DbQueryResult<any[]>>(
            QueryConstants.COUNT_PRODUCTS,
            [search, search, search, search]
          );

        const totalProducts = totalRows[0].total;
        const totalPages = Math.ceil(totalProducts / perPage);
        const startIndex = (page - 1) * perPage;

        const [products] = await pool.query<DbQueryResult<Product[]>>(
            QueryConstants.SELECT_PRODUCTS,
            [search, search, search, search, startIndex, perPage]
        );

        return res.json(
            new EntityListResponse(products, totalProducts, page, totalPages)
        )
    }catch(error){
        console.log(error);
        return handleServerError({
            res,
            message: "Ocurrio un error al obtener la lista de Productos",
            errorNumber: 500,
        });
    }
}
