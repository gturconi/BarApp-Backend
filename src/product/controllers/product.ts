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

  try {
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
    );
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener la lista de Productos",
      errorNumber: 500,
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<Product[]>>(
      QueryConstants.SELECT_PRODUCT_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: "Producto no encontrado",
        errorNumber: 404,
      });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener la lista de Productos",
      errorNumber: 500,
    });
  }
};

export const insertProduct = async (req: Request, res: Response) => {
  let connection = null;
  try {
    let resizedImage: Buffer = Buffer.from([]);
    const { name, description, image, idCat, price } = req.body;

    if (image) resizedImage = await sharp(image.buffer).resize(400).toBuffer();

    const [existingProduct] = await pool.query<DbQueryResult<Product[]>>(
      QueryConstants.SELECT_PRODUCT_BY_NAME,
      [name]
    );

    if (existingProduct.length > 0) {
      return handleServerError({
        res,
        message: "El producto ya existe",
        errorNumber: 400,
      });
    }

    const newProduct = new Product(
      name,
      description,
      resizedImage,
      price,
      idCat
    );

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const savedProduct = await connection.query<DbQueryInsert>(
      QueryConstants.INSERT_PRODUCT,
      [
        newProduct.name,
        newProduct.description,
        newProduct.image,
        newProduct.idCat,
      ]
    );
    await connection.query<DbQueryInsert>(QueryConstants.INSERT_PRICE, [
      savedProduct[0].insertId,
      newProduct.price,
    ]);
    await connection.commit();

    if (savedProduct[0].affectedRows <= 0) {
      return res.status(200).json(savedProduct);
    }

    const insertedProductId = savedProduct[0].insertId;

    const [ProductInserted] = await pool.query<DbQueryResult<Product[]>>(
      QueryConstants.SELECT_PRODUCT_BY_ID,
      [insertedProductId]
    );

    res.send({ product: ProductInserted[0] });
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: "Ocurrio un error al insertar el producto",
      errorNumber: 500,
    });
  } finally {
    if (connection) connection.release();
  }
};
