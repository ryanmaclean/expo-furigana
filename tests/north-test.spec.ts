import { test, expect } from '@playwright/test';

test.describe('Furigana for cardinal directions', () => {
  test('should display furigana for "north" (北)', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    
    // Wait for the app to load fully
    await page.waitForSelector('text=Translate');
    
    // Find and clear the input field
    const inputField = page.locator('input[placeholder="Enter English text..."]');
    await inputField.click();
    await inputField.clear();
    
    // Type "north" in the input field
    await inputField.type('north');
    
    // Click the translate button
    await page.locator('button[aria-label="Translate text"]').click();
    
    // Wait for translation to appear
    await page.waitForTimeout(1000);
    
    // Verify that the kanji "北" is present
    const japaneseText = await page.locator('text="北"').first();
    await expect(japaneseText).toBeVisible();
    
    // Verify the ruby element for furigana
    const rubyElement = page.locator('ruby');
    await expect(rubyElement).toBeVisible();
    
    // Check that the ruby element contains the proper kanji and reading
    const rubyHTML = await rubyElement.evaluate(node => node.outerHTML);
    console.log('Ruby HTML for North:', rubyHTML);
    
    // Verify kanji and reading
    expect(rubyHTML).toContain('北');
    expect(rubyHTML).toContain('きた');
    
    // Test other cardinal directions
    const directions = [
      { english: 'south', japanese: '南', reading: 'みなみ' },
      { english: 'east', japanese: '東', reading: 'ひがし' },
      { english: 'west', japanese: '西', reading: 'にし' }
    ];
    
    for (const direction of directions) {
      // Clear and type the new direction
      await inputField.click();
      await inputField.clear();
      await inputField.type(direction.english);
      
      // Click translate button
      await page.locator('button[aria-label="Translate text"]').click();
      
      // Wait for translation
      await page.waitForTimeout(1000);
      
      // Verify kanji is present
      const directionText = await page.locator(`text="${direction.japanese}"`).first();
      await expect(directionText).toBeVisible();
      
      // Get the ruby element and check content
      const dirRubyElement = page.locator('ruby');
      await expect(dirRubyElement).toBeVisible();
      
      const dirRubyHTML = await dirRubyElement.evaluate(node => node.outerHTML);
      console.log(`Ruby HTML for ${direction.english}:`, dirRubyHTML);
      
      expect(dirRubyHTML).toContain(direction.japanese);
      expect(dirRubyHTML).toContain(direction.reading);
    }
  });
});