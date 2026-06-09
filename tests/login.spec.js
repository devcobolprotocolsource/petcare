const { test, expect } = require('@playwright/test');

test('login and redirect per role - customer', async ({ page, baseURL }) => {
  await page.goto('/login.html');
  await page.fill('#email', 'customer@vetcare.test');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard-customer.html');
  await expect(page.locator('#pageTitle')).toHaveText(/Beranda|Dashboard/i);
});

test('login and redirect per role - doctor', async ({ page }) => {
  await page.goto('/login.html');
  await page.fill('#email', 'doctor@vetcare.test');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard-doctor.html');
  await expect(page.locator('#pageTitle')).toHaveText(/Beranda|Dashboard/i);
});

test('login and redirect per role - admin', async ({ page }) => {
  await page.goto('/login.html');
  await page.fill('#email', 'admin@vetcare.test');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard-admin.html');
  await expect(page.locator('#pageTitle')).toHaveText(/Beranda|Dashboard/i);
});
