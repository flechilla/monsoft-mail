const { chromium } = require('playwright');

(async () => {
  const DIR = '/root/projects/monsoft-mail/screenshots';
  const browser = await chromium.launch({ args: ['--ignore-certificate-errors', '--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // ─── 1. LOGIN PAGE (empty) ───
  console.log('1. Navigating to login page...');
  await page.goto('https://mail.davincilabs.cloud/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/01-login-page.png` });
  console.log('   ✓ 01-login-page.png');

  // ─── 2. LOGIN PAGE (filled) ───
  console.log('2. Filling login form...');
  await page.fill('input[type="email"]', 'adriano@monsoftlabs.com');
  await page.fill('input[type="password"]', 'TestPass123!');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/02-login-filled.png` });
  console.log('   ✓ 02-login-filled.png');

  // ─── 3. SUBMIT LOGIN ───
  console.log('3. Submitting login...');
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL('**/mail**', { timeout: 15000 });
  } catch (e) {
    console.log('   ⚠ URL did not change to /mail, current:', page.url());
  }
  await page.waitForTimeout(4000);
  console.log('   Current URL:', page.url());

  // ─── 4. INBOX / EMAIL LIST ───
  console.log('4. Taking inbox screenshot...');
  await page.screenshot({ path: `${DIR}/03-inbox-email-list.png` });
  console.log('   ✓ 03-inbox-email-list.png');

  // ─── 5. SIDEBAR DETAIL ───
  console.log('5. Capturing sidebar detail...');
  const sidebar = await page.$('aside');
  if (sidebar) {
    await sidebar.screenshot({ path: `${DIR}/04-sidebar-detail.png` });
    console.log('   ✓ 04-sidebar-detail.png');
  } else {
    console.log('   ⚠ Sidebar element not found');
  }

  // ─── 6. CLICK FIRST EMAIL → EMAIL VIEW ───
  console.log('6. Clicking first email...');
  const emailRows = await page.$$('.email-row');
  console.log(`   Found ${emailRows.length} email rows`);
  if (emailRows.length > 0) {
    await emailRows[0].click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${DIR}/05-email-view.png` });
    console.log('   ✓ 05-email-view.png');

    // Capture just the email view panel (right side)
    const emailViewArea = await page.$('.flex-1.overflow-hidden');
    if (emailViewArea) {
      await emailViewArea.screenshot({ path: `${DIR}/06-email-view-detail.png` });
      console.log('   ✓ 06-email-view-detail.png');
    }
  } else {
    console.log('   ⚠ No email rows found');
    await page.screenshot({ path: `${DIR}/05-no-emails.png` });
  }

  // ─── 7. CLICK SECOND EMAIL (if exists) ───
  if (emailRows.length > 1) {
    console.log('7. Clicking second email...');
    await emailRows[1].click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${DIR}/07-second-email-view.png` });
    console.log('   ✓ 07-second-email-view.png');
  }

  // ─── 8. OPEN COMPOSE DIALOG ───
  console.log('8. Opening compose dialog...');
  const composeBtn = await page.$('button:has-text("Compose")');
  if (composeBtn) {
    await composeBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${DIR}/08-compose-dialog.png` });
    console.log('   ✓ 08-compose-dialog.png');

    // Close compose
    const closeBtn = await page.$('.fixed button:has(svg)');
    if (closeBtn) {
      // Find the X button in the compose dialog header
      const composeBtns = await page.$$('.fixed button');
      for (const btn of composeBtns) {
        const title = await btn.getAttribute('title');
        const text = await btn.textContent();
        if (text === '' || title) {
          // This might be the close button area
        }
      }
    }
    // Just click escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } else {
    console.log('   ⚠ Compose button not found');
  }

  // ─── 9. NAVIGATE TO SETTINGS ───
  console.log('9. Navigating to settings...');
  await page.goto('https://mail.davincilabs.cloud/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${DIR}/09-settings-page.png` });
  console.log('   ✓ 09-settings-page.png');

  // ─── 10. SCROLL SETTINGS TO SEE ALL SECTIONS ───
  console.log('10. Scrolling settings page...');
  await page.evaluate(() => {
    const scrollArea = document.querySelector('.h-full.overflow-y-auto');
    if (scrollArea) scrollArea.scrollTo(0, scrollArea.scrollHeight);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/10-settings-scrolled.png` });
  console.log('   ✓ 10-settings-scrolled.png');

  // ─── 11. GO BACK TO INBOX, TEST HOVER STATES ───
  console.log('11. Going back to inbox for hover test...');
  await page.goto('https://mail.davincilabs.cloud/mail', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const hoverRows = await page.$$('.email-row');
  if (hoverRows.length > 0) {
    // Hover over the second email row to show hover actions
    if (hoverRows.length > 1) {
      await hoverRows[1].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${DIR}/11-email-hover-state.png` });
      console.log('   ✓ 11-email-hover-state.png');
    }
  }

  // ─── 12. TOP BAR DETAIL ───
  console.log('12. Capturing top bar detail...');
  const topBar = await page.$('header');
  if (topBar) {
    await topBar.screenshot({ path: `${DIR}/12-topbar-detail.png` });
    console.log('   ✓ 12-topbar-detail.png');
  }

  console.log('\n✅ All screenshots captured!');
  await browser.close();
})();
