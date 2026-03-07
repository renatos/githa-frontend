import { chromium } from 'playwright';
import path from 'path';

const outDir = '/home/renato/.gemini/antigravity/brain/45d1fa64-ecb7-42ff-a76e-104493afe6b9/';

const capture = async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 2, // High resolution
    });

    const page = await context.newPage();

    // 1. Go to login page to set origin
    console.log('Navigating to login to set origin...');
    await page.goto('http://127.0.0.1:5173/login');

    // 2. Set localStorage with REAL session
    console.log('Injecting real session token from user...');
    await page.evaluate(() => {
        localStorage.setItem('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRoYS1iYWNrZW5kIiwic3ViIjoicmVuYXRvLm90YW5lckBnbWFpbC5jb20iLCJncm91cHMiOlsiQURNSU4iXSwiaWF0IjoxNzcyNTM2MzMzLCJleHAiOjE3NzI2MjI3MzMsImp0aSI6ImZiOWExNjZmLTA4ZjYtNDM3My1hZjc1LWQzNGIxNDI3YzFiMiJ9.Uigim-uDmrOIilIfgiQn0F78cPS8ItPWMehdszf-AKw');
        localStorage.setItem('user', JSON.stringify({ email: 'renato.otaner@gmail.com', roles: ['ADMIN'] }));
    });

    // 3. Go to Dashboard (Home)
    console.log('Capturing Dashboard...');
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(1500); // Wait for API calls to return
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.screenshot({ path: path.join(outDir, '01_Dashboard.png'), fullPage: true });

    // 4. Go to Clients List
    console.log('Capturing Clients...');
    await page.goto('http://127.0.0.1:5173/clients');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '02_Clients_List.png'), fullPage: true });

    // 5. Open Client Edit Modal
    console.log('Capturing Client Edit Modal...');
    try {
        // More robust locator for the primevue pencil edit button
        const editButton = page.locator('.p-button-icon.pi-pencil').first();
        await editButton.waitFor({ state: 'visible', timeout: 8000 });
        await editButton.click();

        await page.waitForSelector('.modal-backdrop', { timeout: 8000 });
        await page.waitForTimeout(2000); // Wait for API
        await page.screenshot({ path: path.join(outDir, '03_Client_Form_Gerais.png') });

        try {
            await page.click('text="Dados Pessoais"', { timeout: 2000 });
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(outDir, '03_Client_Form_Pessoais.png') });
        } catch (e) { }

        try {
            await page.click('text="Condições de Saúde"', { timeout: 2000 });
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(outDir, '03_Client_Form_Saude.png') });
        } catch (e) { }

        await page.locator('.btn-close').first().click();
    } catch (e) {
        console.error('Failed to open client modal: ', e.message);
    }

    // 6. Navigate to Appointments List
    console.log('Capturing Appointments...');
    await page.goto('http://127.0.0.1:5173/appointments');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '04_Appointments_List.png'), fullPage: true });

    // 7. Open Appointment Form Modal
    console.log('Capturing Appointment Modal...');
    try {
        const btn = page.locator('button', { hasText: /(Novo Agendamento|Nova Consulta|Add)/i }).first();
        await btn.waitFor({ state: 'visible', timeout: 5000 });
        await btn.click();

        await page.waitForSelector('.modal-backdrop', { timeout: 8000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, '05_Appointment_Form_Modal.png') });
    } catch (e) {
        console.error('Failed to open appointment modal:', e.message);
    }

    await browser.close();
    console.log('Done screenshots with real data!');
};

capture().catch(console.error);
