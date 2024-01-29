import { Request, Response } from 'express';
import sharp from 'sharp';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';
import * as QueryConstants from './queryConstants';

import { handleServerError } from '../../shared/errorHandler';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';
import { Promotion } from '../models/promotion';
import { PoolConnection } from 'mysql2/promise';

export const getPromotions = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.limit as string) || 10;

  const search = (req.query.search as string) || '';
  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_PROMOTIONS,
      [search]
    );

    const totalPromotions = totalRows[0].total;
    const totalPages = Math.ceil(totalPromotions / perPage);
    const startIndex = (page - 1) * perPage;

    const [promotions] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTIONS,
      [search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse(promotions, totalPromotions, page, totalPages)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de promociones',
      errorNumber: 500,
    });
  }
};

export const getPromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTION_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: 'Promocion no encontrada',
        errorNumber: 404,
      });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la promocion',
      errorNumber: 500,
    });
  }
};

export const insertPromotion = async (req: Request, res: Response) => {
  let connection: PoolConnection | null = null;
  try {
    let resizedImage: Buffer = Buffer.from([]);
    const {
      description,
      image,
      valid_from,
      valid_to,
      discount,
      price,
      products,
      days,
    } = req.body;

    if (image) resizedImage = await sharp(image.buffer).resize(400).toBuffer();

    const [existingPromotion] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PRMOTION_BY_DESC,
      [description]
    );

    if (existingPromotion.length > 0) {
      return handleServerError({
        res,
        message: 'La promocion ya existe',
        errorNumber: 400,
      });
    }

    const newPromotion = new Promotion(
      description,
      resizedImage,
      products,
      price,
      valid_from,
      valid_to,
      discount,
      days
    );

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const savedProm = await connection.query<DbQueryInsert>(
      QueryConstants.INSERT_PROMOTION,
      [
        newPromotion.description,
        newPromotion.valid_from,
        newPromotion.valid_to,
        newPromotion.discount,
        newPromotion.image,
        newPromotion.price,
      ]
    );

    newPromotion.products.forEach(async (product) => {
      await connection!.query<DbQueryInsert>(
        QueryConstants.INSERT_PRODUCT_PROMOTION,
        [savedProm[0].insertId, product]
      );
    });

    if (newPromotion.days) {
      newPromotion.days.forEach(async (day) => {
        await connection!.query<DbQueryInsert>(
          QueryConstants.INSERT_PROMOTION_DAYS,
          [savedProm[0].insertId, day]
        );
      });
    }
    await connection.commit();

    if (savedProm[0].affectedRows <= 0) {
      return res.status(200).json(savedProm);
    }

    const insertedPromotionId = savedProm[0].insertId;

    const [PromotionInserted] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTION_BY_ID,
      [insertedPromotionId]
    );

    res.send({ promotion: PromotionInserted[0] });
  } catch (error) {
    if (connection) await connection.rollback();
    return handleServerError({
      res,
      message: 'Ocurrio un error al insertar la promocion',
      errorNumber: 500,
    });
  } finally {
    if (connection) await connection.release();
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  let connection: PoolConnection | null = null;
  try {
    let resizedImage = null;

    const { id } = req.params;
    const updateData = { ...req.body };
    const newImage = req.file;

    if (newImage) {
      resizedImage = Buffer.from([]);
      resizedImage = await sharp(newImage.buffer).resize(400).toBuffer();
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [oldPromotion] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTION_BY_ID,
      [id]
    );

    if (oldPromotion.length <= 0) {
      return handleServerError({
        res,
        message: 'Promocion no encontrada',
        errorNumber: 404,
      });
    }

    if (
      req.body.valid_from &&
      !req.body.valid_to &&
      req.body.valid_from > oldPromotion[0].valid_to!
    ) {
      return handleServerError({
        res,
        message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
        errorNumber: 400,
      });
    } else if (
      !req.body.valid_from &&
      req.body.valid_to &&
      req.body.valid_to < oldPromotion[0].valid_from!
    ) {
      return handleServerError({
        res,
        message: 'La fecha de fin no puede ser menor a la fecha de inicio',
        errorNumber: 400,
      });
    }

    const updatePromotion = await connection.query<DbQueryInsert>(
      QueryConstants.UPDATE_PROMOTION,
      [
        updateData.description,
        updateData.valid_from,
        updateData.valid_to,
        updateData.discount,
        updateData.baja,
        resizedImage,
        updateData.price,
        id,
      ]
    );

    if (req.body.products) {
      let newProductList = req.body.products.filter((newProduct: string) => {
        return !oldPromotion[0].products.includes(Number(newProduct));
      });
      console.log(oldPromotion[0].products);

      newProductList.forEach(async (product: string) => {
        await connection!.query<DbQueryInsert>(
          QueryConstants.INSERT_PRODUCT_PROMOTION,
          [id, product]
        );
      });
    }

    if (req.body.days) {
      req.body.days.forEach(async (day: string) => {
        await connection!.query<DbQueryInsert>(
          QueryConstants.INSERT_PROMOTION_DAYS,
          [day, id]
        );
      });
    }

    await connection.commit();

    if (updatePromotion[0].affectedRows <= 0) {
      return res.status(200).json(updatePromotion);
    }

    const [newPromotion] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTION_BY_ID,
      [id]
    );

    res.send(newPromotion[0]);
  } catch (error) {
    console.log(error);
    if (connection) await connection.rollback();
    return handleServerError({
      res,
      message: 'Ocurrio un error al insertar la promocion',
      errorNumber: 500,
    });
  } finally {
    if (connection) await connection.release();
  }
};
