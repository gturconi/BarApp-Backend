import pool from '../shared/db/conn';
import * as QueryConstants from '../promotion/controllers/queryConstants';
import { DbQueryResult } from '../shared/queryTypes';

export const checkOverlappingPromotionsDates = async (
  productId: string,
  valid_from: string,
  valid_to: string,
  update?: boolean,
  idProm?: string
) => {
  try {
    let query = update
      ? QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DATES_UPDATE
      : QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DATES;

    let params = update
      ? [
          productId,
          idProm,
          valid_from,
          valid_to,
          valid_to,
          valid_from,
          valid_to,
          valid_from,
          valid_to,
          valid_to,
          valid_from,
          valid_from,
        ]
      : [productId, valid_to, valid_from];

    const [existingPromotions] = await pool.query<DbQueryResult<any[]>>(
      query,
      params
    );

    return existingPromotions.length > 0 ? existingPromotions[0] : null;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const checkOverlappingPromotionsDays = async (
  productId: string,
  days_of_week: string,
  update?: boolean,
  idProm?: string
) => {
  let query = update
    ? QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DAYS_UPDATE
    : QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DAYS;

  let params = update
    ? [productId, days_of_week, idProm]
    : [productId, days_of_week];

  try {
    const [existingPromotions] = await pool.query<DbQueryResult<any[]>>(
      query,
      params
    );

    return existingPromotions.length > 0 ? existingPromotions[0] : null;
  } catch (error) {
    return error;
  }
};

export const checkOverlappingPromotionsDatesAndDays = async (
  productId: string,
  valid_from: string,
  valid_to: string,
  days_of_week: string,
  update?: boolean,
  idProm?: string
) => {
  let query = update
    ? QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DATES_AND_DAYS_UPDATE
    : QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DATES_AND_DAYS;

  let params = update
    ? [
        productId,
        idProm,
        days_of_week,
        valid_from,
        valid_to,
        valid_to,
        valid_from,
        valid_to,
        valid_from,
        valid_to,
        valid_to,
        valid_from,
        valid_from,
      ]
    : [productId, valid_to, valid_from, days_of_week];

  try {
    const [existingPromotions] = await pool.query<DbQueryResult<any[]>>(
      query,
      params
    );

    return existingPromotions.length > 0 ? existingPromotions[0] : null;
  } catch (error) {
    return error;
  }
};
