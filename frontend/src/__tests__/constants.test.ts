import {
  APP_NAME,
  APP_NAME_EN,
  APP_VERSION,
  FREE_PLAN,
  PRO_PLAN,
  FAMILY_PLAN,
  SWIPE_THRESHOLD,
} from '../utils/constants';

describe('App Constants', () => {
  test('APP_NAME should be defined', () => {
    expect(APP_NAME).toBe('みんなのカレンダー');
  });

  test('APP_NAME_EN should be defined', () => {
    expect(APP_NAME_EN).toBe('Our Calendar');
  });

  test('APP_VERSION should be defined', () => {
    expect(APP_VERSION).toBe('1.0.0');
  });
});

describe('Plan Constants', () => {
  test('FREE_PLAN should have correct limits', () => {
    expect(FREE_PLAN.maxGroups).toBe(1);
    expect(FREE_PLAN.maxMembersPerGroup).toBe(3);
    expect(FREE_PLAN.maxGoogleAccounts).toBe(1);
    expect(FREE_PLAN.hasAds).toBe(true);
  });

  test('PRO_PLAN should have higher limits', () => {
    expect(PRO_PLAN.maxGroups).toBe(Infinity);
    expect(PRO_PLAN.maxMembersPerGroup).toBe(10);
    expect(PRO_PLAN.hasAds).toBe(false);
    expect(PRO_PLAN.priceMonthly).toBe(480);
  });

  test('FAMILY_PLAN should have unlimited groups', () => {
    expect(FAMILY_PLAN.maxGroups).toBe(Infinity);
    expect(FAMILY_PLAN.maxMembersPerGroup).toBe(Infinity);
    expect(FAMILY_PLAN.maxSharedMembers).toBe(6);
    expect(FAMILY_PLAN.priceMonthly).toBe(980);
  });
});

describe('Swipe Settings', () => {
  test('SWIPE_THRESHOLD should be defined', () => {
    expect(SWIPE_THRESHOLD).toBe(120);
  });
});
