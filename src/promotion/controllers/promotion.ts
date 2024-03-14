import { Request, Response } from 'express';
import sharp from 'sharp';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';
import * as QueryConstants from './queryConstants';
import * as ProductQueryConstants from '../../product/controllers/queryConstants';

import { handleServerError } from '../../shared/errorHandler';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';
import { Promotion } from '../models/promotion';
import { FieldPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import {
  checkOverlappingPromotionsDates,
  checkOverlappingPromotionsDatesAndDays,
  checkOverlappingPromotionsDays,
} from '../../utils/checkOverlappingPromotions';
import { Product } from '../../product/models/product';

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
      days_of_week,
    } = req.body;

    const strDays_of_week = days_of_week.join(',');

    for (const product of products) {
      const [productsFounded] = await pool.query<DbQueryResult<Product[]>>(
        ProductQueryConstants.SELECT_PRODUCT_BY_ID,
        [product]
      );
      if (productsFounded.length <= 0) {
        return handleServerError({
          res,
          message: `El producto con id ${product} no existe`,
          errorNumber: 400,
        });
      }
    }

    if (price === undefined) {
      for (const product of products) {
        if (days_of_week === undefined) {
          const overlappingPromotion = await checkOverlappingPromotionsDates(
            product,
            valid_from,
            valid_to
          );
          if (overlappingPromotion) {
            return handleServerError({
              res,
              message: `El producto ${product} ya tiene una promoción vigente en las fechas especificadas`,
              errorNumber: 400,
            });
          }
        } else if (valid_from === undefined) {
          const overlappingPromotion = await checkOverlappingPromotionsDays(
            product,
            strDays_of_week
          );
          if (overlappingPromotion) {
            return handleServerError({
              res,
              message: `El producto ${product} ya tiene una promoción vigente en los dias especificados`,
              errorNumber: 400,
            });
          }
        } else {
          const overlappingPromotion =
            await checkOverlappingPromotionsDatesAndDays(
              product,
              valid_from,
              valid_to,
              strDays_of_week
            );
          if (overlappingPromotion) {
            return handleServerError({
              res,
              message: `El producto ${product} ya tiene una promoción vigente en las fechas y/o dias especificados`,
              errorNumber: 400,
            });
          }
        }
      }
    }

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
      days_of_week
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

    if (newPromotion.days_of_week) {
      newPromotion.days_of_week.forEach(async (day) => {
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

    const oldPromotion = await getPromotionById(connection, id);

    if (!oldPromotion) {
      return handleServerError({
        res,
        message: 'Promocion no encontrada',
        errorNumber: 404,
      });
    }

    //Validacion de fechas

    if (
      req.body.valid_from &&
      !req.body.valid_to &&
      req.body.valid_from > oldPromotion.valid_to!
    ) {
      return handleServerError({
        res,
        message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
        errorNumber: 400,
      });
    } else if (
      !req.body.valid_from &&
      req.body.valid_to &&
      req.body.valid_to < oldPromotion.valid_from!
    ) {
      return handleServerError({
        res,
        message: 'La fecha de fin no puede ser menor a la fecha de inicio',
        errorNumber: 400,
      });
    }

    const updatePromotion = await updatePromotionData(
      connection,
      id,
      updateData,
      resizedImage
    );

    if (req.body.products) {
      await addProductsToPromotion(
        connection,
        id,
        req.body.products,
        oldPromotion.products
      );

      await removeProductsFromPromotion(
        connection,
        id,
        req.body.products,
        oldPromotion.products
      );
    }

    if (req.body.days_of_week) {
      await addDaysOfWeekToPromotion(
        connection,
        id,
        req.body.days_of_week,
        oldPromotion.days_of_week || null
      );

      await removeDaysOfWeekFromPromotion(
        connection,
        id,
        req.body.days_of_week,
        oldPromotion.days_of_week || null
      );
    }

    await connection.commit();

    if (updatePromotion[0].affectedRows <= 0) {
      return res.status(200).json(updatePromotion);
    }

    const newPromotion = await getPromotionById(connection, id);

    res.send(newPromotion);
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

export const getPromotionById = async (
  connection: PoolConnection,
  id: string
): Promise<Promotion | null> => {
  const [rows] = await connection.query<DbQueryResult<Promotion[]>>(
    QueryConstants.SELECT_PROMOTION_BY_ID,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const updatePromotionData = async (
  connection: PoolConnection,
  id: string,
  updateData: any,
  resizedImage: Buffer | null
): Promise<[ResultSetHeader, FieldPacket[]]> => {
  return await connection.query<DbQueryInsert>(
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
};

export const addProductsToPromotion = async (
  connection: PoolConnection,
  id: string,
  newProducts: string[],
  oldProducts: any[]
): Promise<void> => {
  const productsToAdd = newProducts.filter((newProduct: string) => {
    return !oldProducts.some(
      (oldProduct: any) => oldProduct.product_id === newProduct
    );
  });
  for (const product of productsToAdd) {
    await connection.query<DbQueryInsert>(
      QueryConstants.INSERT_PRODUCT_PROMOTION,
      [id, product]
    );
  }
};

export const removeProductsFromPromotion = async (
  connection: PoolConnection,
  id: string,
  newProducts: string[],
  oldProducts: any[]
): Promise<void> => {
  const productsToRemove = oldProducts.filter((oldProduct: any) => {
    return !newProducts.includes(oldProduct.product_id);
  });

  for (const product of productsToRemove) {
    await connection.query<DbQueryInsert>(
      QueryConstants.DELETE_PROMOTION_PRODUCTS,
      [id, product.product_id]
    );
  }
};

export const addDaysOfWeekToPromotion = async (
  connection: PoolConnection,
  id: string,
  newDaysOfWeek: number[],
  oldDaysOfWeek: number[] | null
): Promise<void> => {
  if (!oldDaysOfWeek) {
    for (const day of newDaysOfWeek) {
      await connection.query<DbQueryInsert>(
        QueryConstants.INSERT_PROMOTION_DAYS,
        [id, day]
      );
    }
    return;
  }

  const daysOfWeekToAdd = newDaysOfWeek.filter((newDay: number) => {
    return !oldDaysOfWeek.includes(newDay);
  });

  for (const day of daysOfWeekToAdd) {
    await connection.query<DbQueryInsert>(
      QueryConstants.INSERT_PROMOTION_DAYS,
      [id, day]
    );
  }
};

export const removeDaysOfWeekFromPromotion = async (
  connection: PoolConnection,
  id: string,
  newDaysOfWeek: number[],
  oldDaysOfWeek: number[] | null
): Promise<void> => {
  if (!oldDaysOfWeek) {
    return;
  }

  const daysOfWeekToRemove = oldDaysOfWeek.filter((oldDay: any) => {
    return !newDaysOfWeek.includes(oldDay);
  });

  for (const day of daysOfWeekToRemove) {
    await connection.query<DbQueryInsert>(
      QueryConstants.DELETE_PROMOTION_DAYS,
      [id, day]
    );
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  let connection = null;
  try {
    const { id } = req.params;
    const [promotion] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTION_BY_ID,
      [id]
    );

    if (!promotion[0]) {
      return handleServerError({
        res,
        message: 'Promocion no encontrada',
        errorNumber: 404,
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query<DbQueryResult<Promotion[]>>(
      QueryConstants.DELETE_DAYS,
      [id]
    );

    await connection.query<DbQueryResult<Promotion[]>>(
      QueryConstants.DELETE_PRODUCTS,
      [id]
    );

    await connection.query<DbQueryResult<Promotion[]>>(
      QueryConstants.DELETE_PROMOTION,
      [id]
    );
    await connection.commit();

    return res
      .status(200)
      .json({ message: 'Promocion eliminada exitosamente' });
  } catch (error) {
    if (connection) await connection.rollback();
    return handleServerError({
      res,
      message: 'Ocurrio un error al eliminar la promocion',
      errorNumber: 500,
    });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error('Error al liberar la conexión:', releaseError);
      }
    }
  }
};
