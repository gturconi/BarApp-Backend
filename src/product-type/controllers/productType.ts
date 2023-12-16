import { Request, Response } from "express";
import sharp from "sharp";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import pool from "../../shared/db/conn";
import * as QueryConstants from "./queryConstants";

import { handleServerError } from "../../shared/errorHandler";

import { EntityListResponse } from "../../shared/models/entity.list.response.model";
import { ProductType } from "../models/productType";

export const getProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<ProductType[]>>(
      QueryConstants.SELECT_PRODUCT_TYPE_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: "Tipo de producto no encontrado",
        errorNumber: 404,
      });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener el tipo de producto",
      errorNumber: 500,
    });
  }
};

export const getProductsType = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.limit as string) || 10;

  const search = (req.query.search as string) || "";

  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_PRODUCTS_TYPE,
      [search]
    );

    const totalProductsType = totalRows[0].total;
    const totalPages = Math.ceil(totalProductsType / perPage);
    const startIndex = (page - 1) * perPage;

    const [productsType] = await pool.query<DbQueryResult<ProductType[]>>(
      QueryConstants.SELECT_PRODUCTS_TYPE,
      [search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse(productsType, totalProductsType, page, totalPages)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener la lista de tipos de producto",
      errorNumber: 500,
    });
  }
};

export const insertProductType = async (req: Request, res: Response) => {
  try {
    let resizedImage: Buffer = Buffer.from([]);
    const { description } = req.body;
    const image = req.file;

    if (image) resizedImage = await sharp(image.buffer).resize(400).toBuffer();

    const [existingProduct] = await pool.query<DbQueryResult<ProductType[]>>(
      QueryConstants.SELECT_PRODUCT_TYPE_BY_DESCRIPTION,
      [description]
    );

    if (existingProduct.length > 0) {
      return res.status(409).json({ message: "El tipo de producto ya existe" });
    }

    const newProductType = new ProductType(description, resizedImage);

    const savedProductType = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_PRODUCT_TYPE,
      [newProductType.description, newProductType.image]
    );

    if (savedProductType[0].affectedRows <= 0) {
      return res.status(200).json(savedProductType);
    }

    const insertedProductId = savedProductType[0].insertId;

    const [newProduct] = await pool.query<DbQueryResult<ProductType[]>>(
      QueryConstants.SELECT_PRODUCT_TYPE_BY_ID,
      [insertedProductId]
    );

    res.send({ productType: newProduct[0] });
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrió un error al insertar el tipo de producto",
      errorNumber: 500,
    });
  }
};

export const updateProductType = async (req: Request, res: Response) => {
  try {
    let resizedImage = null;

    const { id } = req.params;
    const updateData = { ...req.body };
    const newImage = req.file;

    if (newImage) {
      resizedImage = Buffer.from([]);
      resizedImage = await sharp(newImage.buffer).resize(400).toBuffer();
    }

    const updateProductType = await pool.query<DbQueryInsert>(
      QueryConstants.UPDATE_PRODUCT_TYPE,
      [updateData.description, resizedImage ? resizedImage : null, id]
    );

    if (updateProductType[0].affectedRows <= 0) {
      return res.status(200).json(updateProductType);
    }

    const [newProductType] = await pool.query<DbQueryResult<ProductType[]>>(
      QueryConstants.SELECT_PRODUCT_TYPE_BY_ID,
      [id]
    );

    res.send(newProductType[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al actualizar el tipo de producto",
      errorNumber: 500,
    });
  }
};

export const deleteProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [productType] = await pool.query<DbQueryResult<ProductType[]>>(
      QueryConstants.SELECT_PRODUCT_TYPE_BY_ID,
      [id]
    );
    if (!productType[0]) {
      return handleServerError({
        res,
        message: "Tipo de producto no encontrado",
        errorNumber: 404,
      });
    }
    await pool.query<DbQueryInsert>(QueryConstants.DELETE_PRODUCT_TYPE, [id]);
    return res
      .status(200)
      .json({ message: "Tipo de producto eliminado exitosamente" });
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al eliminar el tipo de producto",
      errorNumber: 500,
    });
  }
};
