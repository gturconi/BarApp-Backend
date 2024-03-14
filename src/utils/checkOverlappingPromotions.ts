import pool from '../shared/db/conn';
import * as QueryConstants from '../promotion/controllers/queryConstants';
import { DbQueryResult } from '../shared/queryTypes';

export const checkOverlappingPromotionsDates = async (
  productId: string,
  valid_from: string,
  valid_to: string
) => {
  try {
    const [existingPromotions] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DATES,
      [productId, valid_to, valid_from]
    );

    return existingPromotions.length > 0 ? existingPromotions[0] : null;
  } catch (error) {
    return error;
  }
};

export const checkOverlappingPromotionsDays = async (
  productId: string,
  days_of_week: string
) => {
  try {
    const [existingPromotions] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DAYS,
      [productId, days_of_week]
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
  days_of_week: string
) => {
  try {
    const [existingPromotions] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.CHECK_OVERLAPPING_PROMOTIONS_DATES_AND_DAYS,
      [productId, valid_to, valid_from, days_of_week]
    );

    return existingPromotions.length > 0 ? existingPromotions[0] : null;
  } catch (error) {
    return error;
  }
};
